from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, max_length=200)
    description: Optional[str] = None


class TaskResponse(BaseModel):
    id: int
    user_id: str
    title: str
    description: Optional[str]
    completed: bool
    created_at: datetime
    updated_at: datetime


class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str]


class ErrorDetail(BaseModel):
    code: str
    message: str


class EnvelopeResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[ErrorDetail] = None


class SignupRequest(BaseModel):
    email: str
    password: str = Field(..., min_length=6)
    name: Optional[str] = None


class SigninRequest(BaseModel):
    email: str
    password: str
