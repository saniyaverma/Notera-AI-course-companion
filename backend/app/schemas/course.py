import uuid
from datetime import datetime
from pydantic import BaseModel
from app.models.course import ProcessingStatus


class CourseCreate(BaseModel):
    name: str
    course_code: str | None = None
    description: str | None = None


class CourseListItem(BaseModel):
    id: uuid.UUID
    name: str
    course_code: str | None
    status: ProcessingStatus
    created_at: datetime

    class Config:
        from_attributes = True


class CourseDetail(CourseListItem):
    description: str | None
    processing_error: str | None
    updated_at: datetime

    class Config:
        from_attributes = True
