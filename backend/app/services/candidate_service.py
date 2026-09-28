from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from backend.app.domain.candidate.stages import Stage, is_terminal
from backend.app.domain.candidate.errors import (
    InvalidTransitionError,
    RejectionNotAllowedError,
    CandidateNotFoundError,
    validate_transition,
    validate_rejection
)
from backend.app.repositories.candidate_repository import (
    create_candidate as repo_create,
    get_candidate,
    get_all_candidates,
    get_candidates_by_stage,
    update_candidate_stage,
    delete_candidate as repo_delete
)
from backend.app.repositories.history_repository import (
    append_history,
    get_history as repo_get_history
)
from backend.app.models.candidate_history import EventType
from typing import Optional


class CandidateService:
    def __init__(self, db: Session):
        self.db = db

    def create_candidate(self, name: str):
        return repo_create(self.db, name)

    def get_candidate(self, candidate_id: int):
        candidate = get_candidate(self.db, candidate_id)
        if not candidate:
            raise CandidateNotFoundError(f"Candidate {candidate_id} not found")
        return candidate

    def list_candidates(self):
        return get_all_candidates(self.db)

    def list_by_stage(self, stage: Stage):
        return get_candidates_by_stage(self.db, stage)

    def transition_candidate(self, candidate_id: int, target_stage: Stage):
        candidate = self.get_candidate(candidate_id)
        
        if is_terminal(candidate.current_stage):
            raise InvalidTransitionError(
                f"Cannot transition candidate in terminal state: {candidate.current_stage.value}"
            )
        
        validate_transition(candidate.current_stage, target_stage)
        
        from_stage = candidate.current_stage
        candidate.current_stage = target_stage
        candidate.stage_entered_at = func.now()
        
        append_history(
            self.db,
            candidate_id,
            EventType.STAGE_CHANGED,
            target_stage.value,
            from_stage.value
        )
        
        self.db.commit()
        self.db.refresh(candidate)
        return candidate

    def reject_candidate(self, candidate_id: int):
        candidate = self.get_candidate(candidate_id)
        
        if is_terminal(candidate.current_stage):
            raise RejectionNotAllowedError(
                f"Cannot reject candidate in terminal state: {candidate.current_stage.value}"
            )
        
        validate_rejection(candidate.current_stage)
        
        from_stage = candidate.current_stage
        candidate.current_stage = Stage.REJECTED
        candidate.stage_entered_at = func.now()
        
        append_history(
            self.db,
            candidate_id,
            EventType.REJECTED,
            Stage.REJECTED.value,
            from_stage.value
        )
        
        self.db.commit()
        self.db.refresh(candidate)
        return candidate

    def get_history(self, candidate_id: int):
        self.get_candidate(candidate_id)
        return repo_get_history(self.db, candidate_id)

    def delete_candidate(self, candidate_id: int):
        self.get_candidate(candidate_id)
        return repo_delete(self.db, candidate_id)