import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.db.database import Base
from backend.app.services.candidate_service import CandidateService
from backend.app.services.search_service import search_candidates
from backend.app.domain.candidate.stages import Stage


@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def test_search_by_name(db_session):
    service = CandidateService(db_session)
    c1 = service.create_candidate("John Doe")
    service.create_candidate("Jane Smith")
    db_session.commit()
    
    # Refresh to ensure data is committed
    db_session.expire_all()
    
    result = search_candidates(db_session, "Find John")
    # Should find "John Doe" - the name "John" should match
    assert len(result["results"]) >= 1
    assert any(r["name"] == "John Doe" for r in result["results"])


def test_search_by_stage(db_session):
    service = CandidateService(db_session)
    c1 = service.create_candidate("Candidate 1")
    service.transition_candidate(c1.id, Stage.SCREENING)
    db_session.commit()
    
    # Refresh to ensure data is committed
    db_session.expire_all()
    
    result = search_candidates(db_session, "Who is in Screening")
    assert len(result["results"]) == 1


def test_search_fuzzy_name_typo(db_session):
    service = CandidateService(db_session)
    service.create_candidate("Priya Sharma")
    db_session.commit()
    db_session.expire_all()
    
    result = search_candidates(db_session, "sharam")
    assert len(result["results"]) >= 1
    assert result["results"][0]["name"] == "Priya Sharma"