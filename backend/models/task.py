from pydantic import BaseModel
from typing import Literal, Optional


class TaskBase(BaseModel):
    alma_report_path: str
    output_path: str
    output_file_name: str
    output_format: str = "xlsx"
    log_dir: str
    test_output_path: Optional[str] = None
    test_log_dir: Optional[str] = None
    test_row_limit: int = 25
    frequency: Optional[Literal["daily", "weekly"]] = "daily"


class TaskCreate(TaskBase):
    name: str


class TaskUpdate(TaskBase):
    pass


class Task(TaskBase):
    name: str

    class Config:
        from_attributes = True
