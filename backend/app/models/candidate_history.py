from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.sql import func
from backend.app.db.database import Base
import enum


class EventType(str, enum.Enum):
    CREATED = "CREATED"
    STAGE_CHANGED = "STAGE_CHANGED"
    REJECTED = "REJECTED"


class CandidateHistory(Base):
    __tablename__ = "candidate_history"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False, index=True)
    event_type = Column(SQLEnum(EventType), nullable=False)
    from_stage = Column(String(50), nullable=True)
    to_stage = Column(String(50), nullable=False)
    occurred_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    event_metadata = Column(JSON, nullable=True)