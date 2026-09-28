from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CandidateCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)


class CandidateResponse(BaseModel):
    id: int
    name: str
    current_stage: str
    created_at: datetime
    stage_entered_at: datetime

    class Config:
        from_attributes = True


class CandidateListResponse(BaseModel):
    candidates: list[CandidateResponse]