import uuid
from datetime import datetime
from pydantic import BaseModel
from app.models.content import PriorityLevel, ChatRole


# ===========================
# Topics
# ===========================

class TopicOut(BaseModel):
    id: uuid.UUID
    title: str
    priority: PriorityLevel
    pyq_frequency: int
    is_covered_in_notes: bool
    reasoning: str | None
    order_index: int

    # NEW
    completed: bool

    class Config:
        from_attributes = True


# ===========================
# Questions
# ===========================

class QuestionOut(BaseModel):
    id: uuid.UUID
    question: str
    answer: str
    topic_title: str | None
    frequency: int

    class Config:
        from_attributes = True


# ===========================
# Diagrams
# ===========================

class DiagramOut(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None
    image_path: str
    source_file: str | None
    page_number: int | None

    class Config:
        from_attributes = True


# ===========================
# Short Notes
# ===========================

class ShortNoteOut(BaseModel):
    id: uuid.UUID
    topic_title: str
    content_markdown: str
    order_index: int

    class Config:
        from_attributes = True


# ===========================
# Dashboard
# ===========================

class DashboardOut(BaseModel):
    topics: list[TopicOut]
    questions: list[QuestionOut]
    diagrams: list[DiagramOut]
    short_notes: list[ShortNoteOut]

    # Existing fields
    coverage_percent: float
    missing_topics: list[str]

    # NEW fields for syllabus checklist
    total_topics: int
    completed_topics: int
    syllabus_progress: float


# ===========================
# Chat
# ===========================

class ChatMessageIn(BaseModel):
    message: str


class ChatMessageOut(BaseModel):
    id: uuid.UUID
    role: ChatRole
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


# ===========================
# Toggle Topic Completion
# ===========================

class TopicCompletionUpdate(BaseModel):
    completed: bool