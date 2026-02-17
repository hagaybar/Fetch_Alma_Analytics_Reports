import json
import os
from typing import Dict, List, Optional
from models.task import Task, TaskCreate, TaskUpdate


class ConfigManager:
    def __init__(self, config_path: str):
        self.config_path = config_path
        self._ensure_config_exists()

    def _ensure_config_exists(self):
        if not os.path.exists(self.config_path):
            with open(self.config_path, 'w') as f:
                json.dump({}, f)

    def _read_config(self) -> Dict:
        with open(self.config_path, 'r') as f:
            return json.load(f)

    def _write_config(self, config: Dict):
        with open(self.config_path, 'w') as f:
            json.dump(config, f, indent=2)

    def _task_from_dict(self, name: str, data: Dict) -> Task:
        return Task(
            name=name,
            alma_report_path=data.get("ALMA_REPORT_PATH", ""),
            output_path=data.get("OUTPUT_PATH", ""),
            output_file_name=data.get("OUTPUT_FILE_NAME", ""),
            output_format=data.get("OUTPUT_FORMAT", "xlsx"),
            log_dir=data.get("LOG_DIR", ""),
            test_output_path=data.get("TEST_OUTPUT_PATH"),
            test_log_dir=data.get("TEST_LOG_DIR"),
            test_row_limit=data.get("TEST_ROW_LIMIT", 25),
            frequency=data.get("FREQUENCY", "daily"),
            active=data.get("ACTIVE", True)
        )

    def _task_to_dict(self, task: Task | TaskCreate | TaskUpdate) -> Dict:
        result = {
            "ALMA_REPORT_PATH": task.alma_report_path,
            "OUTPUT_PATH": task.output_path,
            "OUTPUT_FILE_NAME": task.output_file_name,
            "OUTPUT_FORMAT": task.output_format,
            "LOG_DIR": task.log_dir,
            "TEST_ROW_LIMIT": task.test_row_limit,
            "FREQUENCY": task.frequency if task.frequency else "daily",
            "ACTIVE": task.active
        }
        if task.test_output_path:
            result["TEST_OUTPUT_PATH"] = task.test_output_path
        if task.test_log_dir:
            result["TEST_LOG_DIR"] = task.test_log_dir
        return result

    def list_tasks(self) -> List[Task]:
        config = self._read_config()
        return [self._task_from_dict(name, data) for name, data in config.items()]

    def get_task(self, name: str) -> Optional[Task]:
        config = self._read_config()
        if name not in config:
            return None
        return self._task_from_dict(name, config[name])

    def create_task(self, task: TaskCreate) -> Task:
        config = self._read_config()
        if task.name in config:
            raise ValueError(f"Task '{task.name}' already exists")
        config[task.name] = self._task_to_dict(task)
        self._write_config(config)
        return self.get_task(task.name)

    def update_task(self, name: str, task: TaskUpdate) -> Optional[Task]:
        config = self._read_config()
        if name not in config:
            return None
        config[name] = self._task_to_dict(task)
        self._write_config(config)
        return self.get_task(name)

    def delete_task(self, name: str) -> bool:
        config = self._read_config()
        if name not in config:
            return False
        del config[name]
        self._write_config(config)
        return True

    def get_raw_task_config(self, name: str) -> Optional[Dict]:
        config = self._read_config()
        return config.get(name)
