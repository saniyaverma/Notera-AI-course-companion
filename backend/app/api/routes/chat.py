import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.course import Course
from app.models.content import ChatMessage, ChatRole
from app.schemas.content import ChatMessageIn, ChatMessageOut
from app.agents.chat_agent import answer_question

router = APIRouter(prefix="/api/courses", tags=["chat"])


async def _get_owned_course(db: AsyncSession, course_id: uuid.UUID, user_id: uuid.UUID) -> Course:
    result = await db.execute(select(Course).where(Course.id == course_id, Course.user_id == user_id))
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.get("/{course_id}/chat", response_model=list[ChatMessageOut])
async def get_chat_history(course_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    await _get_owned_course(db, course_id, current_user.id)
    result = await db.execute(
        select(ChatMessage).where(ChatMessage.course_id == course_id).order_by(ChatMessage.created_at)
    )
    return result.scalars().all()


@router.post("/{course_id}/chat", response_model=ChatMessageOut)
async def send_chat_message(
    course_id: uuid.UUID,
    payload: ChatMessageIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _get_owned_course(db, course_id, current_user.id)

    history_result = await db.execute(
        select(ChatMessage).where(ChatMessage.course_id == course_id).order_by(ChatMessage.created_at.desc()).limit(10)
    )
    history_msgs = list(reversed(history_result.scalars().all()))
    history = [{"role": m.role.value, "content": m.content} for m in history_msgs]

    user_msg = ChatMessage(course_id=course_id, role=ChatRole.USER, content=payload.message)
    db.add(user_msg)
    await db.commit()

    answer = await answer_question(str(course_id), payload.message, history)

    assistant_msg = ChatMessage(course_id=course_id, role=ChatRole.ASSISTANT, content=answer)
    db.add(assistant_msg)
    await db.commit()
    await db.refresh(assistant_msg)

    return assistant_msg
