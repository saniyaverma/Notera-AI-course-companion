import uuid

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import AsyncSessionLocal, get_db
from app.models.content import (
    Diagram,
    ImportantQuestion,
    ShortNote,
    Topic,
)
from app.models.course import Course
from app.models.user import User

from app.schemas.content import (
    DashboardOut,
    DiagramOut,
    QuestionOut,
    ShortNoteOut,
    TopicCompletionUpdate,
    TopicOut,
)

from app.agents.notes_agent import generate_short_note

router = APIRouter(
    prefix="/api/courses",
    tags=["dashboard"],
)


async def _get_owned_course(
    db: AsyncSession,
    course_id: uuid.UUID,
    user_id: uuid.UUID,
) -> Course:
    result = await db.execute(
        select(Course).where(
            Course.id == course_id,
            Course.user_id == user_id,
        )
    )

    course = result.scalar_one_or_none()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found",
        )

    return course


@router.get(
    "/{course_id}/dashboard",
    response_model=DashboardOut,
)
async def get_dashboard(
    course_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = await _get_owned_course(
        db,
        course_id,
        current_user.id,
    )

    topics_result = await db.execute(
        select(Topic)
        .where(Topic.course_id == course.id)
        .order_by(Topic.order_index)
    )

    topics = topics_result.scalars().all()

    questions_result = await db.execute(
        select(ImportantQuestion)
        .where(ImportantQuestion.course_id == course.id)
        .order_by(ImportantQuestion.frequency.desc())
    )

    questions = questions_result.scalars().all()

    diagrams_result = await db.execute(
        select(Diagram).where(
            Diagram.course_id == course.id
        )
    )

    diagrams = diagrams_result.scalars().all()

    notes_result = await db.execute(
        select(ShortNote)
        .where(ShortNote.course_id == course.id)
        .order_by(ShortNote.order_index)
    )

    short_notes = notes_result.scalars().all()

    # ----------------------------
    # Existing Dashboard Metrics
    # ----------------------------

    total_topics = len(topics)

    covered_topics = sum(
        1
        for topic in topics
        if topic.is_covered_in_notes
    )

    coverage_percent = (
        round((covered_topics / total_topics) * 100, 1)
        if total_topics
        else 0.0
    )

    missing_topics = [
        topic.title
        for topic in topics
        if not topic.is_covered_in_notes
    ]

    # ----------------------------
    # NEW Checklist Metrics
    # ----------------------------

    completed_topics = sum(
        1
        for topic in topics
        if topic.completed
    )

    syllabus_progress = (
        round((completed_topics / total_topics) * 100, 1)
        if total_topics
        else 0.0
    )

    return DashboardOut(
        topics=[
            TopicOut.model_validate(topic)
            for topic in topics
        ],
        questions=[
            QuestionOut.model_validate(question)
            for question in questions
        ],
        diagrams=[
            DiagramOut.model_validate(diagram)
            for diagram in diagrams
        ],
        short_notes=[
            ShortNoteOut.model_validate(note)
            for note in short_notes
        ],

        # Existing
        coverage_percent=coverage_percent,
        missing_topics=missing_topics,

        # NEW
        total_topics=total_topics,
        completed_topics=completed_topics,
        syllabus_progress=syllabus_progress,
    )


# ====================================================
# NEW ENDPOINT
# Toggle Topic Completion
# ====================================================

@router.patch("/topics/{topic_id}")
async def update_topic_completion(
    topic_id: uuid.UUID,
    payload: TopicCompletionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Topic, Course)
        .join(Course, Topic.course_id == Course.id)
        .where(
            Topic.id == topic_id,
            Course.user_id == current_user.id,
        )
    )

    row = result.first()

    if row is None:
        raise HTTPException(
            status_code=404,
            detail="Topic not found",
        )

    topic, _ = row

    topic.completed = payload.completed

    await db.commit()
    await db.refresh(topic)

    return TopicOut.model_validate(topic)

async def _generate_all_notes(course_id: str):
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Topic)
            .where(Topic.course_id == uuid.UUID(course_id))
            .order_by(Topic.order_index)
        )

        topics = result.scalars().all()

        await db.execute(
            delete(ShortNote).where(
                ShortNote.course_id == uuid.UUID(course_id)
            )
        )

        await db.commit()

        for idx, topic in enumerate(topics):
            try:
                content = await generate_short_note(
                    course_id,
                    topic.title,
                )

                db.add(
                    ShortNote(
                        course_id=uuid.UUID(course_id),
                        topic_title=topic.title,
                        content_markdown=content,
                        order_index=idx,
                    )
                )

                await db.commit()

            except Exception:
                continue


@router.post(
    "/{course_id}/generate-notes",
    status_code=202,
)
async def generate_notes(
    course_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _get_owned_course(
        db,
        course_id,
        current_user.id,
    )

    background_tasks.add_task(
        _generate_all_notes,
        str(course_id),
    )

    return {
        "message": "Short notes generation started. Refresh in a moment."
    }


@router.get(
    "/{course_id}/short-notes",
    response_model=list[ShortNoteOut],
)
async def get_short_notes(
    course_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _get_owned_course(
        db,
        course_id,
        current_user.id,
    )

    result = await db.execute(
        select(ShortNote)
        .where(ShortNote.course_id == course_id)
        .order_by(ShortNote.order_index)
    )

    return result.scalars().all()


@router.get(
    "/{course_id}/diagrams",
    response_model=list[DiagramOut],
)
async def get_diagrams(
    course_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _get_owned_course(
        db,
        course_id,
        current_user.id,
    )

    result = await db.execute(
        select(Diagram).where(
            Diagram.course_id == course_id
        )
    )

    return result.scalars().all()


@router.get(
    "/{course_id}/topics",
    response_model=list[TopicOut],
)
async def get_topics(
    course_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _get_owned_course(
        db,
        course_id,
        current_user.id,
    )

    result = await db.execute(
        select(Topic)
        .where(Topic.course_id == course_id)
        .order_by(Topic.order_index)
    )

    return result.scalars().all()


@router.get(
    "/{course_id}/questions",
    response_model=list[QuestionOut],
)
async def get_questions(
    course_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _get_owned_course(
        db,
        course_id,
        current_user.id,
    )

    result = await db.execute(
        select(ImportantQuestion)
        .where(ImportantQuestion.course_id == course_id)
        .order_by(
            ImportantQuestion.frequency.desc()
        )
    )

    return result.scalars().all()