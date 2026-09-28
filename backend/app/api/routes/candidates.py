from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.db.database import get_db
from backend.app.schemas.candidate import CandidateCreate, CandidateResponse, CandidateListResponse
from backend.app.schemas.history import HistoryResponse, HistoryEvent
from backend.app.services.candidate_service import CandidateService
from backend.app.domain.candidate.stages import Stage
from backend.app.domain.candidate.errors import (
    InvalidTransitionError,
    RejectionNotAllowedError,
    CandidateNotFoundError
)
from pydantic import BaseModel


router = APIRouter()


class TransitionRequest(BaseModel):
    target_stage: Stage


@router.post("", response_model=CandidateResponse, status_code=status.HTTP_201_CREATED)
def create_candidate(candidate: CandidateCreate, db: Session = Depends(get_db)):
    service = CandidateService(db)
    result = service.create_candidate(candidate.name)
    return result


@router.get("", response_model=CandidateListResponse)
def list_candidates(db: Session = Depends(get_db)):
    service = CandidateService(db)
    candidates = service.list_candidates()
    return {"candidates": candidates}


@router.get("/{candidate_id}", response_model=CandidateResponse)
def get_candidate(candidate_id: int, db: Session = Depends(get_db)):
    service = CandidateService(db)
    try:
        return service.get_candidate(candidate_id)
    except CandidateNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/{candidate_id}/history", response_model=HistoryResponse)
def get_candidate_history(candidate_id: int, db: Session = Depends(get_db)):
    service = CandidateService(db)
    try:
        history = service.get_history(candidate_id)
        return {
            "candidate_id": candidate_id,
            "events": [HistoryEvent.model_validate(h) for h in history]
        }
    except CandidateNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/{candidate_id}/transition", response_model=CandidateResponse)
def transition_candidate(
    candidate_id: int,
    request: TransitionRequest,
    db: Session = Depends(get_db)
):
    service = CandidateService(db)
    try:
        return service.transition_candidate(candidate_id, request.target_stage)
    except CandidateNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except InvalidTransitionError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/{candidate_id}/reject", response_model=CandidateResponse)
def reject_candidate(candidate_id: int, db: Session = Depends(get_db)):
    service = CandidateService(db)
    try:
        return service.reject_candidate(candidate_id)
    except CandidateNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except RejectionNotAllowedError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{candidate_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_candidate(candidate_id: int, db: Session = Depends(get_db)):
    service = CandidateService(db)
    try:
        service.delete_candidate(candidate_id)
    except CandidateNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))