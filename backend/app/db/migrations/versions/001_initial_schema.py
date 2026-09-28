"""Initial schema with candidates and history

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-27 10:06:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable PostgreSQL trigram extension for fuzzy matching
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")
    
    # Create candidates table
    op.create_table(
        'candidates',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('normalized_name', sa.String(length=255), nullable=False),
        sa.Column('current_stage', sa.Enum('APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED', name='stage'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('stage_entered_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes on candidates
    op.create_index('ix_candidates_id', 'candidates', ['id'], unique=False)
    op.create_index('ix_candidates_current_stage', 'candidates', ['current_stage'], unique=False)
    op.create_index('ix_candidates_normalized_name', 'candidates', ['normalized_name'], unique=False)
    op.create_index('ix_candidates_stage_entered_at', 'candidates', ['stage_entered_at'], unique=False)
    
    # Create GIN trigram index for fuzzy name matching
    op.execute("CREATE INDEX ix_candidates_normalized_name_trgm ON candidates USING gin (normalized_name gin_trgm_ops);")
    
    # Create candidate_history table
    op.create_table(
        'candidate_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('candidate_id', sa.Integer(), nullable=False),
        sa.Column('event_type', sa.Enum('CREATED', 'STAGE_CHANGED', 'REJECTED', name='eventtype'), nullable=False),
        sa.Column('from_stage', sa.String(length=50), nullable=True),
        sa.Column('to_stage', sa.String(length=50), nullable=False),
        sa.Column('occurred_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('event_metadata', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['candidate_id'], ['candidates.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes on candidate_history
    op.create_index('ix_candidate_history_id', 'candidate_history', ['id'], unique=False)
    op.create_index('ix_candidate_history_candidate_id', 'candidate_history', ['candidate_id'], unique=False)
    op.create_index('ix_candidate_history_occurred_at', 'candidate_history', ['occurred_at'], unique=False)
    op.create_index('ix_candidate_history_candidate_occurred', 'candidate_history', ['candidate_id', 'occurred_at'], unique=False)
    op.create_index('ix_candidate_history_to_stage_occurred', 'candidate_history', ['to_stage', 'occurred_at'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_candidate_history_to_stage_occurred', table_name='candidate_history')
    op.drop_index('ix_candidate_history_candidate_occurred', table_name='candidate_history')
    op.drop_index('ix_candidate_history_occurred_at', table_name='candidate_history')
    op.drop_index('ix_candidate_history_candidate_id', table_name='candidate_history')
    op.drop_index('ix_candidate_history_id', table_name='candidate_history')
    op.drop_table('candidate_history')
    
    op.execute("DROP INDEX IF EXISTS ix_candidates_normalized_name_trgm;")
    op.drop_index('ix_candidates_stage_entered_at', table_name='candidates')
    op.drop_index('ix_candidates_normalized_name', table_name='candidates')
    op.drop_index('ix_candidates_current_stage', table_name='candidates')
    op.drop_index('ix_candidates_id', table_name='candidates')
    op.drop_table('candidates')
    
    op.execute("DROP TYPE IF EXISTS eventtype;")
    op.execute("DROP TYPE IF EXISTS stage;")
    op.execute("DROP EXTENSION IF EXISTS pg_trgm;")
