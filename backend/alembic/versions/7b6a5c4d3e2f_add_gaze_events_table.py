"""Add gaze_events table and TimescaleDB hypertable

Revision ID: 7b6a5c4d3e2f
Revises: 9a8b7c6d5e4f
Create Date: 2026-07-30 02:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '7b6a5c4d3e2f'
down_revision: Union[str, Sequence[str], None] = '9a8b7c6d5e4f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'gaze_events',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('store_id', sa.Uuid(), nullable=False),
        sa.Column('shelf_id', sa.Uuid(), nullable=False),
        sa.Column('shopper_id', sa.Integer(), nullable=False),
        sa.Column('pitch', sa.Float(), nullable=True),
        sa.Column('yaw', sa.Float(), nullable=True),
        sa.Column('roll', sa.Float(), nullable=True),
        sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['shelf_id'], ['shelves.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['store_id'], ['stores.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_gaze_events_shopper_id'), 'gaze_events', ['shopper_id'], unique=False)
    op.create_index(op.f('ix_gaze_events_timestamp'), 'gaze_events', ['timestamp'], unique=False)

    # Convert table to TimescaleDB Hypertable if TimescaleDB extension is present
    op.execute("""
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'timescaledb') THEN
                PERFORM create_hypertable('gaze_events', 'timestamp', if_not_exists => TRUE, migrate_data => TRUE);
            END IF;
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END $$;
    """)


def downgrade() -> None:
    op.drop_index(op.f('ix_gaze_events_timestamp'), table_name='gaze_events')
    op.drop_index(op.f('ix_gaze_events_shopper_id'), table_name='gaze_events')
    op.drop_table('gaze_events')
