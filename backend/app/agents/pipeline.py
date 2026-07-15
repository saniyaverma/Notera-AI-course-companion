import logging
import uuid as uuid_lib
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.models.course import Course, CourseFile, ProcessingStatus, FileCategory
from app.models.content import Topic, ImportantQuestion, Diagram, PriorityLevel
from app.services.file_parser import extract_text, extract_images_from_pdf
from app.services.vector_store import index_document, delete_course_collection
from app.agents.topic_agent import extract_topics
from app.agents.pyq_agent import analyze_pyqs
from app.agents.priority_agent import rank_priorities
from app.db.session import AsyncSessionLocal

logger = logging.getLogger(__name__)


async def process_course(course_id: str) -> None:
    """Full ingestion + agentic analysis pipeline. Runs as a background task."""
    async with AsyncSessionLocal() as db:
        try:
            await _run_pipeline(db, course_id)
        except Exception as exc:
            logger.exception("Course processing failed for %s", course_id)
            result = await db.execute(select(Course).where(Course.id == uuid_lib.UUID(course_id)))
            course = result.scalar_one_or_none()
            if course:
                course.status = ProcessingStatus.FAILED
                course.processing_error = str(exc)[:1000]
                await db.commit()


async def _run_pipeline(db: AsyncSession, course_id: str) -> None:
    result = await db.execute(select(Course).where(Course.id == uuid_lib.UUID(course_id)))
    course = result.scalar_one_or_none()
    if not course:
        return

    course.status = ProcessingStatus.PROCESSING
    course.processing_error = None
    await db.commit()

    files_result = await db.execute(select(CourseFile).where(CourseFile.course_id == course.id))
    files = files_result.scalars().all()

    delete_course_collection(course_id)

    texts_by_category: dict[str, str] = {}
    for f in files:
        try:
            text = extract_text(f.stored_path, f.file_type)
        except Exception:
            logger.warning("Failed to extract text from %s", f.stored_path)
            text = ""

        texts_by_category[f.category.value] = texts_by_category.get(f.category.value, "") + "\n" + text
        index_document(course_id, text, source=f.original_filename, category=f.category.value)

        if f.file_type.lower() == "pdf":
            images = extract_images_from_pdf(f.stored_path, course_id)
            for img in images[:15]:
                diagram = Diagram(
                    course_id=course.id,
                    title=f"Diagram from {f.original_filename} (page {img['page_number']})",
                    image_path=img["image_path"],
                    source_file=f.original_filename,
                    page_number=img["page_number"],
                )
                db.add(diagram)

    await db.commit()

    syllabus_text = texts_by_category.get(FileCategory.SYLLABUS.value, "")
    notes_text = texts_by_category.get(FileCategory.NOTES.value, "")
    pyqs_text = texts_by_category.get(FileCategory.PYQS.value, "")

    extracted_topics = await extract_topics(syllabus_text) if syllabus_text.strip() else []

    await db.execute(delete(Topic).where(Topic.course_id == course.id))
    await db.execute(delete(ImportantQuestion).where(ImportantQuestion.course_id == course.id))
    await db.commit()

    topic_titles = [t["title"] for t in extracted_topics]

    pyq_result = await analyze_pyqs(course_id, pyqs_text, topic_titles) if pyqs_text.strip() else {
        "questions": [], "topic_frequency": {}
    }
    topic_frequency = pyq_result.get("topic_frequency", {})

    for q in pyq_result.get("questions", []):
        if not q.get("question") or not q.get("answer"):
            continue
        db.add(ImportantQuestion(
            course_id=course.id,
            question=q["question"],
            answer=q["answer"],
            topic_title=q.get("topic_title"),
            frequency=q.get("frequency", 1),
        ))
    await db.commit()

    notes_lower = notes_text.lower()
    topics_with_meta = []
    for t in extracted_topics:
        is_covered = t["title"].lower() in notes_lower or any(
            word in notes_lower for word in t["title"].lower().split() if len(word) > 4
        )
        topics_with_meta.append({
            "title": t["title"],
            "pyq_frequency": topic_frequency.get(t["title"], 0),
            "is_covered_in_notes": is_covered,
        })

    priorities = await rank_priorities(topics_with_meta) if topics_with_meta else []
    priority_map = {p["title"]: p for p in priorities}

    for t in extracted_topics:
        meta = next((m for m in topics_with_meta if m["title"] == t["title"]), {})
        pr = priority_map.get(t["title"], {})
        priority_value = str(pr.get("priority", "medium")).strip().lower()

        # Accept only valid enum values
        if priority_value not in ("high", "medium", "low"):
            priority_value = "medium"

        db.add(
            Topic(
                course_id=course.id,
                title=t["title"],
                priority=PriorityLevel(priority_value),
                pyq_frequency=meta.get("pyq_frequency", 0),
                is_covered_in_notes=meta.get("is_covered_in_notes", False),
                reasoning=pr.get("reasoning"),
                order_index=t.get("order_index", 0),
            )
        )
    course.status = ProcessingStatus.COMPLETED
    await db.commit()
