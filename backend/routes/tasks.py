from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from db import get_session
from models import Task
from schemas import TaskCreate, TaskUpdate, TaskResponse, EnvelopeResponse, ErrorDetail
from auth import get_current_user

router = APIRouter()


def _verify_user(path_user_id: str, authenticated_user_id: str):
    if path_user_id != authenticated_user_id:
        raise HTTPException(
            status_code=403,
            detail={"code": "FORBIDDEN", "message": "Cannot access another user's tasks"},
        )


def _task_to_response(task: Task) -> dict:
    return TaskResponse(
        id=task.id,
        user_id=task.user_id,
        title=task.title,
        description=task.description,
        completed=task.completed,
        created_at=task.created_at,
        updated_at=task.updated_at,
    ).model_dump()


@router.post("/{user_id}/tasks", status_code=201)
def create_task(
    user_id: str,
    data: TaskCreate,
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user),
):
    _verify_user(user_id, current_user)

    task = Task(
        user_id=user_id,
        title=data.title,
        description=data.description,
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    return EnvelopeResponse(success=True, data={"task": _task_to_response(task)})


@router.get("/{user_id}/tasks")
def list_tasks(
    user_id: str,
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user),
):
    _verify_user(user_id, current_user)

    tasks = session.exec(
        select(Task)
        .where(Task.user_id == user_id)
        .order_by(Task.created_at.desc())
    ).all()

    return EnvelopeResponse(
        success=True,
        data={"tasks": [_task_to_response(t) for t in tasks]},
    )


@router.get("/{user_id}/tasks/{task_id}")
def get_task(
    user_id: str,
    task_id: int,
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user),
):
    _verify_user(user_id, current_user)

    task = session.exec(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    ).first()

    if not task:
        return EnvelopeResponse(
            success=False,
            error=ErrorDetail(code="TASK_NOT_FOUND", message="Task not found"),
        )

    return EnvelopeResponse(success=True, data={"task": _task_to_response(task)})


@router.put("/{user_id}/tasks/{task_id}")
def update_task(
    user_id: str,
    task_id: int,
    data: TaskUpdate,
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user),
):
    _verify_user(user_id, current_user)

    task = session.exec(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    ).first()

    if not task:
        return EnvelopeResponse(
            success=False,
            error=ErrorDetail(code="TASK_NOT_FOUND", message="Task not found"),
        )

    if data.title is not None:
        if len(data.title.strip()) == 0:
            return EnvelopeResponse(
                success=False,
                error=ErrorDetail(code="TITLE_EMPTY", message="Task title cannot be empty"),
            )
        task.title = data.title

    if data.description is not None:
        task.description = data.description

    task.updated_at = datetime.now(timezone.utc)
    session.add(task)
    session.commit()
    session.refresh(task)

    return EnvelopeResponse(success=True, data={"task": _task_to_response(task)})


@router.delete("/{user_id}/tasks/{task_id}")
def delete_task(
    user_id: str,
    task_id: int,
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user),
):
    _verify_user(user_id, current_user)

    task = session.exec(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    ).first()

    if not task:
        return EnvelopeResponse(
            success=False,
            error=ErrorDetail(code="TASK_NOT_FOUND", message="Task not found"),
        )

    session.delete(task)
    session.commit()

    return EnvelopeResponse(success=True, data=None)


@router.patch("/{user_id}/tasks/{task_id}/complete")
def toggle_complete(
    user_id: str,
    task_id: int,
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user),
):
    _verify_user(user_id, current_user)

    task = session.exec(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    ).first()

    if not task:
        return EnvelopeResponse(
            success=False,
            error=ErrorDetail(code="TASK_NOT_FOUND", message="Task not found"),
        )

    task.completed = not task.completed
    task.updated_at = datetime.now(timezone.utc)
    session.add(task)
    session.commit()
    session.refresh(task)

    return EnvelopeResponse(success=True, data={"task": _task_to_response(task)})
