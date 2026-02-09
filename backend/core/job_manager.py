import uuid
from datetime import datetime
from typing import Dict, List, Optional
from models.job import Job, JobStatus


class JobManager:
    def __init__(self):
        self._jobs: Dict[str, Job] = {}

    def create_job(self, task_name: str, test_mode: bool = False) -> Job:
        job_id = str(uuid.uuid4())[:8]
        job = Job(
            id=job_id,
            task_name=task_name,
            test_mode=test_mode,
            status=JobStatus.PENDING,
            started_at=datetime.now()
        )
        self._jobs[job_id] = job
        return job

    def get_job(self, job_id: str) -> Optional[Job]:
        return self._jobs.get(job_id)

    def list_jobs(self, limit: int = 50) -> List[Job]:
        jobs = list(self._jobs.values())
        jobs.sort(key=lambda j: j.started_at, reverse=True)
        return jobs[:limit]

    def update_job_status(self, job_id: str, status: JobStatus):
        if job_id in self._jobs:
            self._jobs[job_id].status = status

    def update_job_progress(self, job_id: str, rows_fetched: int, message: str = ""):
        if job_id in self._jobs:
            self._jobs[job_id].rows_fetched = rows_fetched
            self._jobs[job_id].progress_message = message

    def complete_job(self, job_id: str, output_file: str, rows_fetched: int):
        if job_id in self._jobs:
            self._jobs[job_id].status = JobStatus.COMPLETED
            self._jobs[job_id].completed_at = datetime.now()
            self._jobs[job_id].output_file = output_file
            self._jobs[job_id].rows_fetched = rows_fetched

    def fail_job(self, job_id: str, error_message: str):
        if job_id in self._jobs:
            self._jobs[job_id].status = JobStatus.FAILED
            self._jobs[job_id].completed_at = datetime.now()
            self._jobs[job_id].error_message = error_message

    def cancel_job(self, job_id: str) -> bool:
        if job_id in self._jobs:
            job = self._jobs[job_id]
            if job.status in [JobStatus.PENDING, JobStatus.RUNNING]:
                job.status = JobStatus.CANCELLED
                job.completed_at = datetime.now()
                return True
        return False
