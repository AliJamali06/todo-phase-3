from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from auth import get_current_user
from db import get_session
from models import Conversation, Message
from schemas import EnvelopeResponse, ErrorDetail

router = APIRouter()


def _verify_user(path_user_id: str, authenticated_user_id: str):
    if path_user_id != authenticated_user_id:
        raise HTTPException(
            status_code=403,
            detail={"code": "FORBIDDEN", "message": "Cannot access another user's conversations"},
        )


@router.get("/{user_id}/conversations")
def get_conversations(
    user_id: str,
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user),
):
    _verify_user(user_id, current_user)

    conversation = session.exec(
        select(Conversation).where(Conversation.user_id == user_id)
    ).first()

    if not conversation:
        return EnvelopeResponse(success=True, data={"conversation": None})

    return EnvelopeResponse(
        success=True,
        data={
            "conversation": {
                "id": conversation.id,
                "user_id": conversation.user_id,
                "created_at": conversation.created_at.isoformat(),
                "updated_at": conversation.updated_at.isoformat(),
            }
        },
    )


@router.get("/{user_id}/conversations/{conversation_id}/messages")
def get_messages(
    user_id: str,
    conversation_id: int,
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user),
):
    _verify_user(user_id, current_user)

    conversation = session.exec(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id,
        )
    ).first()

    if not conversation:
        return EnvelopeResponse(
            success=False,
            error=ErrorDetail(
                code="CONVERSATION_NOT_FOUND",
                message="Conversation not found",
            ),
        )

    messages = session.exec(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
    ).all()

    return EnvelopeResponse(
        success=True,
        data={
            "messages": [
                {
                    "id": msg.id,
                    "conversation_id": msg.conversation_id,
                    "role": msg.role,
                    "content": msg.content,
                    "created_at": msg.created_at.isoformat(),
                }
                for msg in messages
            ]
        },
    )
