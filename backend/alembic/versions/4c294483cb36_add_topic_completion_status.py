"""add topic completion status

Revision ID: 4c294483cb36
Revises: 0001
Create Date: 2026-07-17 15:42:09.459834
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "4c294483cb36"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add the column with a temporary server default so existing rows get False.
    op.add_column(
        "topics",
        sa.Column(
            "completed",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
    )

    # Remove the database default after populating existing rows.
    # SQLAlchemy's model default will be used for new rows.
    op.alter_column(
        "topics",
        "completed",
        server_default=None,
    )


def downgrade() -> None:
    op.drop_column("topics", "completed")