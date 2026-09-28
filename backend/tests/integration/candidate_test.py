import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.db.database import Base
from backend.app.services.candidate_service import CandidateService
from backend.app.models.candidate_history import EventType
from backend.app.domain.candidate.stages import Stage


@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def test_create_candidate(db_session):
    service = CandidateService(db_session)
    candidate = service.create_candidate("John Doe")
    
    assert candidate.name == "John Doe"
    assert candidate.current_stage == Stage.APPLIED
    assert candidate.normalized_name == "john doe"
    
    history = service.get_history(candidate.id)
    assert len(history) == 1
    assert history[0].event_type == EventType.CREATED


def test_transition_candidate(db_session):
    service = CandidateService(db_session)
    candidate = service.create_candidate("Jane Doe")
    
    result = service.transition_candidate(candidate.id, Stage.SCREENING)
    assert result.current_stage == Stage.SCREENING
    
    history = service.get_history(candidate.id)
    stage_changes = [h for h in history if h.event_type == EventType.STAGE_CHANGED]
    assert len(stage_changes) == 1


def test_reject_candidate(db_session):
    service = CandidateService(db_session)
    candidate = service.create_candidate("Bob Smith")
    
    result = service.reject_candidate(candidate.id)
    assert result.current_stage == Stage.REJECTED
    
    history = service.get_history(candidate.id)
    rejections = [h for h in history if h.event_type == EventType.REJECTED]
    assert len(rejections) == 1


def test_delete_candidate(db_session):
    service = CandidateService(db_session)
    candidate = service.create_candidate("Alice Delete")
    c_id = candidate.id
    
    success = service.delete_candidate(c_id)
    assert success is True
    
    with pytest.raises(Exception):
        service.get_candidate(c_id)