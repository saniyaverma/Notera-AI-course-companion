"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-07-15

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String(255), nullable=True),
        sa.Column("is_google_account", sa.Boolean(), server_default="false"),
        sa.Column("is_active", sa.Boolean(), server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_index("ix_users_email", "users", ["email"])

    # ---------- ENUMS ----------
    processing_status = postgresql.ENUM(
        "pending",
        "processing",
        "completed",
        "failed",
        name="processingstatus",
    )
    processing_status.create(op.get_bind(), checkfirst=True)

    file_category = postgresql.ENUM(
        "syllabus",
        "notes",
        "pyqs",
        name="filecategory",
    )
    file_category.create(op.get_bind(), checkfirst=True)

    priority_level = postgresql.ENUM(
        "high",
        "medium",
        "low",
        name="prioritylevel",
    )
    priority_level.create(op.get_bind(), checkfirst=True)

    chat_role = postgresql.ENUM(
        "user",
        "assistant",
        name="chatrole",
    )
    chat_role.create(op.get_bind(), checkfirst=True)

    # ---------- TABLES ----------
    op.create_table(
        "courses",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("course_code", sa.String(100), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "status",
            postgresql.ENUM(
                "pending",
                "processing",
                "completed",
                "failed",
                name="processingstatus",
                create_type=False,
            ),
            server_default="pending",
        ),
        sa.Column("processing_error", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "course_files",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "course_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("courses.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "category",
            postgresql.ENUM(
                "syllabus",
                "notes",
                "pyqs",
                name="filecategory",
                create_type=False,
            ),
            nullable=False,
        ),
        sa.Column("original_filename", sa.String(500), nullable=False),
        sa.Column("stored_path", sa.String(1000), nullable=False),
        sa.Column("file_type", sa.String(50), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "topics",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "course_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("courses.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column(
            "priority",
            postgresql.ENUM(
                "high",
                "medium",
                "low",
                name="prioritylevel",
                create_type=False,
            ),
            server_default="medium",
        ),
        sa.Column("pyq_frequency", sa.Integer(), server_default="0"),
        sa.Column("is_covered_in_notes", sa.Boolean(), server_default="false"),
        sa.Column("reasoning", sa.Text(), nullable=True),
        sa.Column("order_index", sa.Integer(), server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "important_questions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "course_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("courses.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("question", sa.Text(), nullable=False),
        sa.Column("answer", sa.Text(), nullable=False),
        sa.Column("topic_title", sa.String(500), nullable=True),
        sa.Column("frequency", sa.Integer(), server_default="1"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "diagrams",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "course_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("courses.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("image_path", sa.String(1000), nullable=False),
        sa.Column("source_file", sa.String(500), nullable=True),
        sa.Column("page_number", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "short_notes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "course_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("courses.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("topic_title", sa.String(500), nullable=False),
        sa.Column("content_markdown", sa.Text(), nullable=False),
        sa.Column("order_index", sa.Integer(), server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "chat_messages",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "course_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("courses.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "role",
            postgresql.ENUM(
                "user",
                "assistant",
                name="chatrole",
                create_type=False,
            ),
            nullable=False,
        ),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("chat_messages")
    op.drop_table("short_notes")
    op.drop_table("diagrams")
    op.drop_table("important_questions")
    op.drop_table("topics")
    op.drop_table("course_files")
    op.drop_table("courses")
    op.drop_table("users")

    postgresql.ENUM(name="chatrole").drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM(name="prioritylevel").drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM(name="filecategory").drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM(name="processingstatus").drop(op.get_bind(), checkfirst=True)