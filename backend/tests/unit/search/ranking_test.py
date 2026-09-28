import pytest
from backend.app.services.search_service import rank_results
from backend.app.models.candidate import Candidate
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.db.database import Base


def test_rank_exact_match_first():
    # Create in-memory database for testing
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    candidates = [
        Candidate(id=1, name="John Doe", normalized_name="john doe", current_stage="APPLIED"),
        Candidate(id=2, name="John", normalized_name="john", current_stage="APPLIED"),
        Candidate(id=3, name="Johnny", normalized_name="johnny", current_stage="APPLIED"),
    ]
    from backend.app.domain.search.query import SearchQuery
    query = SearchQuery(name_condition="john")
    
    results = rank_results(candidates, query, db)
    assert results[0].id == 2
    
    db.close()