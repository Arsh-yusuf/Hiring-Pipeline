from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from backend.app.models.candidate import Candidate, Stage
from backend.app.models.candidate_history import CandidateHistory, EventType
from typing import Optional


def normalize_name(name: str) -> str:
    return name.lower().strip()


def create_candidate(db: Session, name: str) -> Candidate:
    normalized = normalize_name(name)
    candidate = Candidate(name=name, normalized_name=normalized, current_stage=Stage.APPLIED)
    db.add(candidate)
    db.flush()
    
    history = CandidateHistory(
        candidate_id=candidate.id,
        event_type=EventType.CREATED,
        from_stage=None,
        to_stage=Stage.APPLIED.value
    )
    db.add(history)
    db.commit()
    db.refresh(candidate)
    return candidate


def get_candidate(db: Session, candidate_id: int) -> Optional[Candidate]:
    return db.query(Candidate).filter(Candidate.id == candidate_id).first()


def get_all_candidates(db: Session) -> list[Candidate]:
    return db.query(Candidate).order_by(Candidate.created_at.desc()).all()


def get_candidates_by_stage(db: Session, stage: Stage) -> list[Candidate]:
    return db.query(Candidate).filter(Candidate.current_stage == stage).all()


def update_candidate_stage(db: Session, candidate_id: int, new_stage: Stage) -> Candidate:
    candidate = get_candidate(db, candidate_id)
    if candidate:
        candidate.current_stage = new_stage
        candidate.stage_entered_at = func.now()
        db.commit()
        db.refresh(candidate)
    return candidate


def delete_candidate(db: Session, candidate_id: int) -> bool:
    candidate = get_candidate(db, candidate_id)
    if not candidate:
        return False
    db.query(CandidateHistory).filter(CandidateHistory.candidate_id == candidate_id).delete()
    db.delete(candidate)
    db.commit()
    return True