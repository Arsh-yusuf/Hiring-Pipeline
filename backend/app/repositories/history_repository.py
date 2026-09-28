from sqlalchemy.orm import Session
from backend.app.models.candidate_history import CandidateHistory, EventType
from backend.app.models.candidate import Candidate
from typing import List, Optional
from datetime import datetime


def append_history(
    db: Session,
    candidate_id: int,
    event_type: EventType,
    to_stage: str,
    from_stage: Optional[str] = None,
    metadata: Optional[dict] = None
) -> CandidateHistory:
    history = CandidateHistory(
        candidate_id=candidate_id,
        event_type=event_type,
        from_stage=from_stage,
        to_stage=to_stage,
        event_metadata=metadata
    )
    db.add(history)
    return history


def get_history(db: Session, candidate_id: int) -> List[CandidateHistory]:
    return (
        db.query(CandidateHistory)
        .filter(CandidateHistory.candidate_id == candidate_id)
        .order_by(CandidateHistory.occurred_at.asc())
        .all()
    )


def find_movements_to_stage_since(
    db: Session,
    stage: str,
    since: datetime
) -> List[int]:
    results = (
        db.query(CandidateHistory.candidate_id)
        .filter(
            CandidateHistory.to_stage == stage,
            CandidateHistory.occurred_at >= since
        )
        .distinct()
        .all()
    )
    return [r[0] for r in results]


def has_reached_stage(db: Session, candidate_id: int, stage: str) -> bool:
    return (
        db.query(CandidateHistory)
        .filter(
            CandidateHistory.candidate_id == candidate_id,
            CandidateHistory.to_stage == stage
        )
        .first() is not None
    )