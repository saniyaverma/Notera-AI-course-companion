import uuid
import enum
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, func, Text, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base


class ProcessingStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    course_code: Mapped[str | None] = mapped_column(String(100), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[ProcessingStatus] = mapped_column(
        Enum(ProcessingStatus, values_callable=lambda enum_cls: [e.value for e in enum_cls]), default=ProcessingStatus.PENDING
    )
    processing_error: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    owner: Mapped["User"] = relationship("User", back_populates="courses")
    files: Mapped[list["CourseFile"]] = relationship("CourseFile", back_populates="course", cascade="all, delete-orphan")
    topics: Mapped[list["Topic"]] = relationship("Topic", back_populates="course", cascade="all, delete-orphan")
    questions: Mapped[list["ImportantQuestion"]] = relationship("ImportantQuestion", back_populates="course", cascade="all, delete-orphan")
    diagrams: Mapped[list["Diagram"]] = relationship("Diagram", back_populates="course", cascade="all, delete-orphan")
    chat_messages: Mapped[list["ChatMessage"]] = relationship("ChatMessage", back_populates="course", cascade="all, delete-orphan")
    short_notes: Mapped[list["ShortNote"]] = relationship("ShortNote", back_populates="course", cascade="all, delete-orphan")


class FileCategory(str, enum.Enum):
    SYLLABUS = "syllabus"
    NOTES = "notes"
    PYQS = "pyqs"


class CourseFile(Base):
    __tablename__ = "course_files"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"))
    category: Mapped[FileCategory] = mapped_column(Enum(FileCategory,  values_callable=lambda enum_cls: [e.value for e in enum_cls],
    ), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(500))
    stored_path: Mapped[str] = mapped_column(String(1000))
    file_type: Mapped[str] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    course: Mapped["Course"] = relationship("Course", back_populates="files")
