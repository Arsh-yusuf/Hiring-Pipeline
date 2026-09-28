from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class StageFilter(str, Enum):
    APPLIED = "APPLIED"
    SCREENING = "SCREENING"
    INTERVIEW = "INTERVIEW"
    OFFER = "OFFER"
    HIRED = "HIRED"
    REJECTED = "REJECTED"


class DurationUnit(str, Enum):
    DAYS = "DAYS"
    WEEKS = "WEEKS"


class DurationCondition(BaseModel):
    stage: StageFilter
    operator: str
    value: int
    unit: DurationUnit


class HistoryCondition(BaseModel):
    stage: StageFilter
    comparison: str
    date_ref: str


class SearchQuery(BaseModel):
    name_condition: Optional[str] = None
    current_stage: Optional[StageFilter] = None
    duration_condition: Optional[DurationCondition] = None
    history_condition: Optional[HistoryCondition] = None
    include_statuses: Optional[List[StageFilter]] = None
    exclude_statuses: Optional[List[StageFilter]] = None
    combinator: str = "AND"
    is_wildcard: bool = False


class SearchValidationResult(BaseModel):
    valid: bool
    status: str
    explanation: Optional[str] = None