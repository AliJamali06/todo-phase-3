import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlmodel import Session, select

from auth import get_current_user
from db import get_session
from models import Conversation, Message
from schemas import EnvelopeResponse, ErrorDetail
from agent.todo_agent import run_agent

logger = logging.getLogger(__name__)

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None


def _verify_user(path_user_id: str, authenticated_user_id: str):
    if path_user_id != authenticated_user_id:
        raise HTTPException(
            status_code=403,
            detail={"code": "FORBIDDEN", "message": "Cannot access another user's chat"},
        )


@router.post("/{user_id}/chat")
async def chat(
    user_id: str,
    data: ChatRequest,
    request: Request,
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user),
):
    _verify_user(user_id, current_user)

    # Validate message not empty
    if not data.message or not data.message.strip():
        return EnvelopeResponse(
            success=False,
            error=ErrorDetail(code="MESSAGE_EMPTY", message="Please type a message"),
        )

    # Get or create conversation
    if data.conversation_id:
        conversation = session.exec(
            select(Conversation).where(
                Conversation.id == data.conversation_id,
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
    else:
        # Check for existing conversation (single conversation per user)
        conversation = session.exec(
            select(Conversation).where(Conversation.user_id == user_id)
        ).first()
        if not conversation:
            conversation = Conversation(user_id=user_id)
            session.add(conversation)
            session.commit()
            session.refresh(conversation)

    # Load conversation history from DB
    db_messages = session.exec(
        select(Message)
        .where(Message.conversation_id == conversation.id)
        .order_by(Message.created_at)
    ).all()

    # Build messages array for agent
    history = [{"role": msg.role, "content": msg.content} for msg in db_messages]
    history.append({"role": "user", "content": data.message.strip()})

    # Save user message to DB
    user_message = Message(
        conversation_id=conversation.id,
        role="user",
        content=data.message.strip(),
    )
    session.add(user_message)
    session.commit()

    # Run the agent
    try:
        auth_token = request.cookies.get("auth_token", "")
        agent_result = await run_agent(
            messages=history,
            user_id=user_id,
            auth_token=auth_token,
        )
    except Exception as e:
        logger.error("Agent error: %s", e, exc_info=True)
        return EnvelopeResponse(
            success=False,
            error=ErrorDetail(
                code="CHAT_ERROR",
                message="I'm having trouble processing your request. Please try again.",
            ),
        )

    # Save assistant response to DB
    assistant_message = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=agent_result["response"],
    )
    session.add(assistant_message)

    # Update conversation activity timestamp
    conversation.updated_at = datetime.now(timezone.utc)
    session.add(conversation)
    session.commit()

    return EnvelopeResponse(
        success=True,
        data={
            "conversation_id": conversation.id,
            "response": agent_result["response"],
            "tool_calls": agent_result.get("tool_calls", []),
        },
    )
