from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class SearchRequest(BaseModel):
    query: str


class SearchResult(BaseModel):
    id: int
    name: str
    current_stage: str
    stage_entered_at: datetime


class SearchResponse(BaseModel):
    query: str
    interpretation: dict
    results: List[SearchResult]
    explanation: Optional[str]