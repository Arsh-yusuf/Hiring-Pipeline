import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.db.database import Base
from backend.app.models.candidate import Candidate, Stage
from backend.app.models.candidate_history import CandidateHistory, EventType
from backend.app.domain.candidate.stages import (
    Stage as DomainStage,
    FORWARD_TRANSITIONS,
    REJECTION_TRANSITIONS,
    is_terminal,
    get_next_stage,
    can_transition,
    can_reject
)


@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def test_forward_transitions():
    assert get_next_stage(DomainStage.APPLIED) == DomainStage.SCREENING
    assert get_next_stage(DomainStage.SCREENING) == DomainStage.INTERVIEW
    assert get_next_stage(DomainStage.INTERVIEW) == DomainStage.OFFER
    assert get_next_stage(DomainStage.OFFER) == DomainStage.HIRED
    assert get_next_stage(DomainStage.HIRED) is None
    assert get_next_stage(DomainStage.REJECTED) is None


def test_can_transition():
    assert can_transition(DomainStage.APPLIED, DomainStage.SCREENING)
    assert can_transition(DomainStage.SCREENING, DomainStage.INTERVIEW)
    assert can_transition(DomainStage.INTERVIEW, DomainStage.OFFER)
    assert can_transition(DomainStage.OFFER, DomainStage.HIRED)
    assert not can_transition(DomainStage.APPLIED, DomainStage.INTERVIEW)
    assert not can_transition(DomainStage.HIRED, DomainStage.REJECTED)


def test_can_reject():
    assert can_reject(DomainStage.APPLIED)
    assert can_reject(DomainStage.SCREENING)
    assert can_reject(DomainStage.INTERVIEW)
    assert can_reject(DomainStage.OFFER)
    assert not can_reject(DomainStage.HIRED)
    assert not can_reject(DomainStage.REJECTED)


def test_is_terminal():
    assert is_terminal(DomainStage.HIRED)
    assert is_terminal(DomainStage.REJECTED)
    assert not is_terminal(DomainStage.APPLIED)
    assert not is_terminal(DomainStage.SCREENING)