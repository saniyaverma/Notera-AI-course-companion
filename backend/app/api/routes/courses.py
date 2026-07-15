import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import aiofiles

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.course import Course, CourseFile, FileCategory, ProcessingStatus
from app.schemas.course import CourseListItem, CourseDetail
from app.core.config import settings
from app.agents.pipeline import process_course
from app.services.vector_store import delete_course_collection

router = APIRouter(prefix="/api/courses", tags=["courses"])

ALLOWED_EXTENSIONS = {"pdf", "docx", "doc", "txt"}


def _ext(filename: str) -> str:
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""


async def _save_upload(file: UploadFile, course_id: str, category: str) -> tuple[str, str]:
    ext = _ext(file.filename)
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: .{ext}")

    dir_path = os.path.join(settings.UPLOAD_DIR, course_id, category)
    os.makedirs(dir_path, exist_ok=True)
    stored_name = f"{uuid.uuid4().hex}.{ext}"
    stored_path = os.path.join(dir_path, stored_name)

    size = 0
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    async with aiofiles.open(stored_path, "wb") as out_file:
        while chunk := await file.read(1024 * 1024):
            size += len(chunk)
            if size > max_bytes:
                await out_file.close()
                os.remove(stored_path)
                raise HTTPException(status_code=413, detail=f"File exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit")
            await out_file.write(chunk)

    return stored_path, ext


@router.post("", response_model=CourseDetail, status_code=201)
async def create_course(
    background_tasks: BackgroundTasks,
    name: str = Form(...),
    course_code: str | None = Form(None),
    description: str | None = Form(None),
    syllabus: UploadFile = File(...),
    notes: UploadFile = File(...),
    pyqs: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = Course(
        user_id=current_user.id,
        name=name,
        course_code=course_code,
        description=description,
        status=ProcessingStatus.PENDING,
    )
    db.add(course)
    await db.commit()
    await db.refresh(course)

    course_id_str = str(course.id)

    file_map = [
        (syllabus, FileCategory.SYLLABUS),
        (notes, FileCategory.NOTES),
        (pyqs, FileCategory.PYQS),
    ]

    for upload, category in file_map:
        stored_path, ext = await _save_upload(upload, course_id_str, category.value)
        db.add(CourseFile(
            course_id=course.id,
            category=category,
            original_filename=upload.filename,
            stored_path=stored_path,
            file_type=ext,
        ))

    await db.commit()

    background_tasks.add_task(process_course, course_id_str)

    return CourseDetail.model_validate(course)


@router.get("", response_model=list[CourseListItem])
async def list_courses(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Course).where(Course.user_id == current_user.id).order_by(Course.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{course_id}", response_model=CourseDetail)
async def get_course(course_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Course).where(Course.id == course_id, Course.user_id == current_user.id)
    )
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.delete("/{course_id}", status_code=204)
async def delete_course(course_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Course).where(Course.id == course_id, Course.user_id == current_user.id)
    )
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    delete_course_collection(str(course_id))
    await db.delete(course)
    await db.commit()
    return None


@router.post("/{course_id}/reprocess", response_model=CourseDetail)
async def reprocess_course(
    course_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Course).where(Course.id == course_id, Course.user_id == current_user.id)
    )
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    course.status = ProcessingStatus.PENDING
    await db.commit()
    background_tasks.add_task(process_course, str(course_id))
    return course
