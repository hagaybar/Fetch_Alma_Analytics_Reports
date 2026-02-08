from fastapi import APIRouter, HTTPException, Depends
from typing import List
from ...models.task import Task, TaskCreate, TaskUpdate
from ...core.config_manager import ConfigManager

router = APIRouter(prefix="/tasks", tags=["tasks"])


def get_config_manager() -> ConfigManager:
    from ...main import config_manager
    return config_manager


@router.get("", response_model=List[Task])
def list_tasks(config_manager: ConfigManager = Depends(get_config_manager)):
    return config_manager.list_tasks()


@router.get("/{name}", response_model=Task)
def get_task(name: str, config_manager: ConfigManager = Depends(get_config_manager)):
    task = config_manager.get_task(name)
    if not task:
        raise HTTPException(status_code=404, detail=f"Task '{name}' not found")
    return task


@router.post("", response_model=Task, status_code=201)
def create_task(task: TaskCreate, config_manager: ConfigManager = Depends(get_config_manager)):
    try:
        return config_manager.create_task(task)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{name}", response_model=Task)
def update_task(name: str, task: TaskUpdate, config_manager: ConfigManager = Depends(get_config_manager)):
    updated = config_manager.update_task(name, task)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Task '{name}' not found")
    return updated


@router.delete("/{name}", status_code=204)
def delete_task(name: str, config_manager: ConfigManager = Depends(get_config_manager)):
    if not config_manager.delete_task(name):
        raise HTTPException(status_code=404, detail=f"Task '{name}' not found")
