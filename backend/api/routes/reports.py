import os
import logging
import datetime
from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from typing import List
from models.job import Job, JobCreate, JobStatus
from core.config_manager import ConfigManager
from core.job_manager import JobManager
from core.alma_fetcher import AlmaFetcher

router = APIRouter(prefix="/reports", tags=["reports"])


def get_config_manager() -> ConfigManager:
    from main import config_manager
    return config_manager


def get_job_manager() -> JobManager:
    from main import job_manager
    return job_manager


def setup_logging(log_dir: str):
    os.makedirs(log_dir, exist_ok=True)
    log_filename = os.path.join(
        log_dir,
        f"download_analytics_log_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
    )

    for handler in logging.root.handlers[:]:
        logging.root.removeHandler(handler)

    logging.basicConfig(
        filename=log_filename,
        level=logging.DEBUG,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
    return log_filename


def run_report_task(
    job_id: str,
    task_config: dict,
    test_mode: bool,
    job_manager: JobManager
):
    job_manager.update_job_status(job_id, JobStatus.RUNNING)

    api_key = os.getenv('ALMA_PROD_API_KEY')
    if not api_key:
        job_manager.fail_job(job_id, "ALMA_PROD_API_KEY environment variable not set")
        return

    log_dir = task_config.get('TEST_LOG_DIR') if test_mode else task_config.get('LOG_DIR')
    if log_dir:
        setup_logging(log_dir)

    try:
        fetcher = AlmaFetcher(api_key)

        def progress_callback(rows: int, message: str):
            job_manager.update_job_progress(job_id, rows, message)

        output_file, row_count = fetcher.run_report(
            task_config,
            test_mode=test_mode,
            progress_callback=progress_callback
        )
        job_manager.complete_job(job_id, output_file, row_count)
    except Exception as e:
        logging.exception("Report execution failed")
        job_manager.fail_job(job_id, str(e))


@router.post("/run", response_model=Job)
def run_report(
    job_request: JobCreate,
    background_tasks: BackgroundTasks,
    config_manager: ConfigManager = Depends(get_config_manager),
    job_manager: JobManager = Depends(get_job_manager)
):
    task_config = config_manager.get_raw_task_config(job_request.task_name)
    if not task_config:
        raise HTTPException(status_code=404, detail=f"Task '{job_request.task_name}' not found")

    job = job_manager.create_job(job_request.task_name, job_request.test_mode)
    background_tasks.add_task(
        run_report_task,
        job.id,
        task_config,
        job_request.test_mode,
        job_manager
    )
    return job


@router.get("/jobs", response_model=List[Job])
def list_jobs(limit: int = 50, job_manager: JobManager = Depends(get_job_manager)):
    return job_manager.list_jobs(limit)


@router.get("/jobs/{job_id}", response_model=Job)
def get_job(job_id: str, job_manager: JobManager = Depends(get_job_manager)):
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found")
    return job


@router.post("/jobs/{job_id}/cancel")
def cancel_job(job_id: str, job_manager: JobManager = Depends(get_job_manager)):
    if not job_manager.cancel_job(job_id):
        raise HTTPException(status_code=400, detail="Job cannot be cancelled")
    return {"message": "Job cancelled"}
