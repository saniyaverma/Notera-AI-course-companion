import uuid
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.course import Course
from app.models.content import Topic, ImportantQuestion, Diagram, ShortNote
from app.schemas.content import DashboardOut, TopicOut, QuestionOut, DiagramOut, ShortNoteOut
from app.agents.notes_agent import generate_short_note
from app.db.session import AsyncSessionLocal

router = APIRouter(prefix="/api/courses", tags=["dashboard"])


async def _get_owned_course(db: AsyncSession, course_id: uuid.UUID, user_id: uuid.UUID) -> Course:
    result = await db.execute(select(Course).where(Course.id == course_id, Course.user_id == user_id))
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.get("/{course_id}/dashboard", response_model=DashboardOut)
async def get_dashboard(course_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = await _get_owned_course(db, course_id, current_user.id)

    topics_res = await db.execute(
        select(Topic).where(Topic.course_id == course.id).order_by(Topic.order_index)
    )
    topics = topics_res.scalars().all()

    questions_res = await db.execute(
        select(ImportantQuestion).where(ImportantQuestion.course_id == course.id).order_by(ImportantQuestion.frequency.desc())
    )
    questions = questions_res.scalars().all()

    diagrams_res = await db.execute(select(Diagram).where(Diagram.course_id == course.id))
    diagrams = diagrams_res.scalars().all()

    notes_res = await db.execute(
        select(ShortNote).where(ShortNote.course_id == course.id).order_by(ShortNote.order_index)
    )
    short_notes = notes_res.scalars().all()

    total = len(topics)
    covered = sum(1 for t in topics if t.is_covered_in_notes)
    coverage_percent = round((covered / total) * 100, 1) if total else 0.0
    missing_topics = [t.title for t in topics if not t.is_covered_in_notes]

    return DashboardOut(
        topics=[TopicOut.model_validate(t) for t in topics],
        questions=[QuestionOut.model_validate(q) for q in questions],
        diagrams=[DiagramOut.model_validate(d) for d in diagrams],
        short_notes=[ShortNoteOut.model_validate(n) for n in short_notes],
        coverage_percent=coverage_percent,
        missing_topics=missing_topics,
    )


async def _generate_all_notes(course_id: str):
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Topic).where(Topic.course_id == uuid.UUID(course_id)).order_by(Topic.order_index))
        topics = result.scalars().all()

        await db.execute(delete(ShortNote).where(ShortNote.course_id == uuid.UUID(course_id)))
        await db.commit()

        for idx, topic in enumerate(topics):
            try:
                content = await generate_short_note(course_id, topic.title)
                db.add(ShortNote(
                    course_id=uuid.UUID(course_id),
                    topic_title=topic.title,
                    content_markdown=content,
                    order_index=idx,
                ))
                await db.commit()
            except Exception:
                continue


@router.post("/{course_id}/generate-notes", status_code=202)
async def generate_notes(
    course_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _get_owned_course(db, course_id, current_user.id)
    background_tasks.add_task(_generate_all_notes, str(course_id))
    return {"message": "Short notes generation started. Refresh in a moment."}


@router.get("/{course_id}/short-notes", response_model=list[ShortNoteOut])
async def get_short_notes(course_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    await _get_owned_course(db, course_id, current_user.id)
    result = await db.execute(
        select(ShortNote).where(ShortNote.course_id == course_id).order_by(ShortNote.order_index)
    )
    return result.scalars().all()


@router.get("/{course_id}/diagrams", response_model=list[DiagramOut])
async def get_diagrams(course_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    await _get_owned_course(db, course_id, current_user.id)
    result = await db.execute(select(Diagram).where(Diagram.course_id == course_id))
    return result.scalars().all()


@router.get("/{course_id}/topics", response_model=list[TopicOut])
async def get_topics(course_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    await _get_owned_course(db, course_id, current_user.id)
    result = await db.execute(select(Topic).where(Topic.course_id == course_id).order_by(Topic.order_index))
    return result.scalars().all()


@router.get("/{course_id}/questions", response_model=list[QuestionOut])
async def get_questions(course_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    await _get_owned_course(db, course_id, current_user.id)
    result = await db.execute(
        select(ImportantQuestion).where(ImportantQuestion.course_id == course_id).order_by(ImportantQuestion.frequency.desc())
    )
    return result.scalars().all()
