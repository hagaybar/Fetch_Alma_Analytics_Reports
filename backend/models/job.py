from pydantic import BaseModel
from typing import Optional
from enum import Enum
from datetime import datetime


class JobStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class JobCreate(BaseModel):
    task_name: str
    test_mode: bool = False


class Job(BaseModel):
    id: str
    task_name: str
    test_mode: bool
    status: JobStatus
    started_at: datetime
    completed_at: Optional[datetime] = None
    rows_fetched: int = 0
    output_file: Optional[str] = None
    error_message: Optional[str] = None
    progress_message: str = ""

    class Config:
        from_attributes = True
