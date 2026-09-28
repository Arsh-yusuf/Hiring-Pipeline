from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class HistoryEvent(BaseModel):
    id: int
    event_type: str
    from_stage: Optional[str]
    to_stage: str
    occurred_at: datetime
    event_metadata: Optional[dict] = None

    class Config:
        from_attributes = True


class HistoryResponse(BaseModel):
    candidate_id: int
    events: List[HistoryEvent]