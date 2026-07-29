"""Add dwell_times table and TimescaleDB hypertable

Revision ID: 9a8b7c6d5e4f
Revises: 4df0071a8465
Create Date: 2026-07-30 02:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '9a8b7c6d5e4f'
down_revision: Union[str, Sequence[str], None] = '4df0071a8465'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'dwell_times',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('store_id', sa.Uuid(), nullable=False),
        sa.Column('zone_id', sa.Uuid(), nullable=False),
        sa.Column('camera_id', sa.Uuid(), nullable=True),
        sa.Column('shopper_id', sa.Integer(), nullable=False),
        sa.Column('entry_timestamp', sa.DateTime(timezone=True), nullable=False),
        sa.Column('exit_timestamp', sa.DateTime(timezone=True), nullable=False),
        sa.Column('dwell_duration_seconds', sa.Float(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['camera_id'], ['cameras.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['store_id'], ['stores.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['zone_id'], ['zones.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_dwell_times_entry_timestamp'), 'dwell_times', ['entry_timestamp'], unique=False)
    op.create_index(op.f('ix_dwell_times_shopper_id'), 'dwell_times', ['shopper_id'], unique=False)

    # Convert table to TimescaleDB Hypertable if TimescaleDB extension is present
    op.execute("""
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'timescaledb') THEN
                PERFORM create_hypertable('dwell_times', 'entry_timestamp', if_not_exists => TRUE, migrate_data => TRUE);
            END IF;
        EXCEPTION WHEN OTHERS THEN
            -- Fallback gracefully if not a hypertable-enabled DB instance
            NULL;
        END $$;
    """)


def downgrade() -> None:
    op.drop_index(op.f('ix_dwell_times_shopper_id'), table_name='dwell_times')
    op.drop_index(op.f('ix_dwell_times_entry_timestamp'), table_name='dwell_times')
    op.drop_table('dwell_times')
