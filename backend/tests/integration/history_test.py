import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.db.database import Base
from backend.app.services.candidate_service import CandidateService
from backend.app.domain.candidate.stages import Stage


@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def test_history_chronological(db_session):
    service = CandidateService(db_session)
    candidate = service.create_candidate("Test User")
    
    service.transition_candidate(candidate.id, Stage.SCREENING)
    service.transition_candidate(candidate.id, Stage.INTERVIEW)
    service.transition_candidate(candidate.id, Stage.OFFER)
    
    history = service.get_history(candidate.id)
    assert len(history) == 4
    
    timestamps = [h.occurred_at for h in history]
    assert timestamps == sorted(timestamps)


def test_history_immutable(db_session):
    service = CandidateService(db_session)
    candidate = service.create_candidate("Test User")
    
    history1 = service.get_history(candidate.id)
    original_count = len(history1)
    
    service.transition_candidate(candidate.id, Stage.SCREENING)
    
    history2 = service.get_history(candidate.id)
    assert len(history2) == original_count + 1