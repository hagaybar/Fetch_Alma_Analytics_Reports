import os
from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/logs", tags=["logs"])


class LogFile(BaseModel):
    name: str
    path: str
    size: int
    modified: float


class LogContent(BaseModel):
    content: str
    name: str


def get_log_dirs() -> dict:
    from ...main import config_manager
    tasks = config_manager.list_tasks()
    log_dirs = {}
    for task in tasks:
        log_dirs[task.name] = {
            "log_dir": task.log_dir,
            "test_log_dir": task.test_log_dir
        }
    return log_dirs


@router.get("/{task_name}", response_model=List[LogFile])
def list_log_files(task_name: str, test_mode: bool = False):
    log_dirs = get_log_dirs()
    if task_name not in log_dirs:
        raise HTTPException(status_code=404, detail=f"Task '{task_name}' not found")

    dirs = log_dirs[task_name]
    log_dir = dirs.get("test_log_dir") if test_mode else dirs.get("log_dir")

    if not log_dir or not os.path.exists(log_dir):
        return []

    files = []
    for filename in os.listdir(log_dir):
        if filename.endswith('.log'):
            filepath = os.path.join(log_dir, filename)
            stat = os.stat(filepath)
            files.append(LogFile(
                name=filename,
                path=filepath,
                size=stat.st_size,
                modified=stat.st_mtime
            ))

    files.sort(key=lambda f: f.modified, reverse=True)
    return files


@router.get("/{task_name}/{filename}", response_model=LogContent)
def read_log_file(task_name: str, filename: str, test_mode: bool = False, tail: int = 500):
    log_dirs = get_log_dirs()
    if task_name not in log_dirs:
        raise HTTPException(status_code=404, detail=f"Task '{task_name}' not found")

    dirs = log_dirs[task_name]
    log_dir = dirs.get("test_log_dir") if test_mode else dirs.get("log_dir")

    if not log_dir:
        raise HTTPException(status_code=404, detail="Log directory not configured")

    filepath = os.path.join(log_dir, filename)

    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail=f"Log file '{filename}' not found")

    if not filepath.startswith(log_dir):
        raise HTTPException(status_code=400, detail="Invalid file path")

    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        lines = f.readlines()
        content = ''.join(lines[-tail:]) if tail else ''.join(lines)

    return LogContent(content=content, name=filename)
