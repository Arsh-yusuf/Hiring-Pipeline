import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.db.database import Base
from backend.app.services.candidate_service import CandidateService
from backend.app.domain.candidate.stages import Stage
from backend.app.domain.candidate.errors import InvalidTransitionError


@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def test_valid_transitions(db_session):
    service = CandidateService(db_session)
    candidate = service.create_candidate("Test User")
    
    service.transition_candidate(candidate.id, Stage.SCREENING)
    service.transition_candidate(candidate.id, Stage.INTERVIEW)
    service.transition_candidate(candidate.id, Stage.OFFER)
    result = service.transition_candidate(candidate.id, Stage.HIRED)
    
    assert result.current_stage == Stage.HIRED


def test_skip_stage_rejected(db_session):
    service = CandidateService(db_session)
    candidate = service.create_candidate("Test User")
    
    with pytest.raises(InvalidTransitionError):
        service.transition_candidate(candidate.id, Stage.INTERVIEW)


def test_reverse_transition_rejected(db_session):
    service = CandidateService(db_session)
    candidate = service.create_candidate("Test User")
    service.transition_candidate(candidate.id, Stage.SCREENING)
    
    with pytest.raises(InvalidTransitionError):
        service.transition_candidate(candidate.id, Stage.APPLIED)