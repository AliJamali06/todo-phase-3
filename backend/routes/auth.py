import re
import uuid
from datetime import datetime, timezone, timedelta

import bcrypt
import jwt
from fastapi import APIRouter, Depends, Response
from sqlmodel import Session, select

from db import get_session
from models import User
from schemas import SignupRequest, SigninRequest, EnvelopeResponse, ErrorDetail, UserResponse
from config import BETTER_AUTH_SECRET
from auth import get_current_user

router = APIRouter()


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def _verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
TOKEN_EXPIRY_DAYS = 7


def _create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=TOKEN_EXPIRY_DAYS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, BETTER_AUTH_SECRET, algorithm="HS256")


def _set_auth_cookie(response: Response, token: str):
    response.set_cookie(
        key="auth_token",
        value=token,
        httponly=True,
        secure=False,  # Set True in production with HTTPS
        samesite="lax",
        max_age=TOKEN_EXPIRY_DAYS * 24 * 60 * 60,
        path="/",
    )


@router.post("/signup", status_code=201)
def signup(data: SignupRequest, response: Response, session: Session = Depends(get_session)):
    if not EMAIL_REGEX.match(data.email):
        return EnvelopeResponse(
            success=False,
            error=ErrorDetail(code="INVALID_EMAIL", message="Email format is invalid"),
        )

    existing = session.exec(select(User).where(User.email == data.email)).first()
    if existing:
        return EnvelopeResponse(
            success=False,
            error=ErrorDetail(code="EMAIL_EXISTS", message="An account with this email already exists"),
        )

    hashed_password = _hash_password(data.password)
    user_id = f"usr_{uuid.uuid4().hex[:12]}"

    user = User(
        id=user_id,
        email=data.email,
        name=data.name,
    )
    session.add(user)

    # Store password hash — in a real app this would be in a separate credentials table
    # For hackathon simplicity, we'll store it as a session-level attribute
    from sqlmodel import text
    session.exec(
        text(
            "CREATE TABLE IF NOT EXISTS user_credentials (user_id VARCHAR PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, password_hash VARCHAR NOT NULL)"
        )
    )
    session.commit()
    session.exec(
        text("INSERT INTO user_credentials (user_id, password_hash) VALUES (:uid, :ph)"),
        params={"uid": user_id, "ph": hashed_password},
    )
    session.commit()

    token = _create_token(user_id)
    _set_auth_cookie(response, token)

    return EnvelopeResponse(
        success=True,
        data={"user": UserResponse(id=user.id, email=user.email, name=user.name).model_dump()},
    )


@router.post("/signin")
def signin(data: SigninRequest, response: Response, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == data.email)).first()
    if not user:
        return EnvelopeResponse(
            success=False,
            error=ErrorDetail(code="INVALID_CREDENTIALS", message="Email or password is incorrect"),
        )

    from sqlmodel import text
    result = session.exec(
        text("SELECT password_hash FROM user_credentials WHERE user_id = :uid"),
        params={"uid": user.id},
    ).first()

    if not result or not _verify_password(data.password, result[0]):
        return EnvelopeResponse(
            success=False,
            error=ErrorDetail(code="INVALID_CREDENTIALS", message="Email or password is incorrect"),
        )

    token = _create_token(user.id)
    _set_auth_cookie(response, token)

    return EnvelopeResponse(
        success=True,
        data={"user": UserResponse(id=user.id, email=user.email, name=user.name).model_dump()},
    )


@router.post("/signout")
def signout(response: Response, user_id: str = Depends(get_current_user)):
    response.delete_cookie(key="auth_token", path="/")
    return EnvelopeResponse(success=True, data=None)
