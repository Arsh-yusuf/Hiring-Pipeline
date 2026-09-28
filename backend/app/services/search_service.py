from sqlalchemy.orm import Session
from sqlalchemy import select, and_, or_, func, text
from backend.app.domain.search.query import SearchQuery, StageFilter
from backend.app.domain.search.parser import parse_search_query
from backend.app.domain.search.validation import validate_search_query
from backend.app.models.candidate import Candidate
from backend.app.models.candidate_history import CandidateHistory
from backend.app.domain.search.errors import InvalidQueryError
from typing import List
from datetime import datetime, timedelta, date


def parse_date_reference_to_datetime(date_ref: str) -> datetime:
    """Convert date reference strings to datetime objects"""
    date_ref = date_ref.lower().strip()
    now = datetime.now()
    
    if date_ref == "today":
        return now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    if date_ref == "yesterday":
        return (now - timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Day names (e.g., "Monday")
    days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    if date_ref in days:
        target_weekday = days.index(date_ref)
        current_weekday = now.weekday()
        days_back = (current_weekday - target_weekday) % 7
        if days_back == 0:
            days_back = 7  # Last Monday, not today
        return (now - timedelta(days=days_back)).replace(hour=0, minute=0, second=0, microsecond=0)
    
    # "N days ago"
    import re
    match = re.match(r"(\d+)\s+days?\s+ago", date_ref)
    if match:
        days_ago = int(match.group(1))
        return now - timedelta(days=days_ago)
    
    # Default: 7 days ago
    return now - timedelta(days=7)


def execute_search(db: Session, query: SearchQuery) -> List[Candidate]:
    """Execute search using SQL queries instead of in-memory filtering"""
    validation = validate_search_query(query)
    if not validation.valid:
        raise InvalidQueryError(validation.explanation or "Invalid query")
    
    # Build SQL query
    stmt = select(Candidate)
    conditions = []
    
    # Exclusions
    if query.exclude_statuses:
        for status in query.exclude_statuses:
            conditions.append(Candidate.current_stage != status)
    
    # Current stage filter
    if query.current_stage:
        conditions.append(Candidate.current_stage == query.current_stage)
    
    # Duration condition
    if query.duration_condition:
        duration = query.duration_condition
        conditions.append(Candidate.current_stage == duration.stage)
        
        days = duration.value if duration.unit.value == "DAYS" else duration.value * 7
        threshold = datetime.now() - timedelta(days=days)
        conditions.append(Candidate.stage_entered_at < threshold)
    
    # History conditions
    if query.history_condition:
        hist = query.history_condition
        
        if hist.comparison == "reached_not_hired":
            # Find candidates who reached OFFER
            subquery = select(CandidateHistory.candidate_id).where(
                CandidateHistory.to_stage == StageFilter.OFFER.value
            ).distinct()
            
            conditions.append(Candidate.id.in_(subquery))
            conditions.append(Candidate.current_stage != StageFilter.HIRED)
        
        elif hist.comparison == "moved_since":
            # Parse date reference and find candidates who moved to target stage since that date
            target_date = parse_date_reference_to_datetime(hist.date_ref)
            
            subquery = select(CandidateHistory.candidate_id).where(
                and_(
                    CandidateHistory.to_stage == hist.stage.value,
                    CandidateHistory.occurred_at >= target_date
                )
            ).distinct()
            
            conditions.append(Candidate.id.in_(subquery))
    
    # Name fuzzy matching
    if query.name_condition:
        name_search = query.name_condition.lower()
        
        # Check if we're using PostgreSQL or SQLite
        engine_name = db.bind.dialect.name
        
        if engine_name == 'postgresql':
            # Use PostgreSQL trigram similarity
            name_conditions = or_(
                Candidate.normalized_name.ilike(f'%{name_search}%'),
                func.similarity(Candidate.normalized_name, name_search) > 0.3
            )
            conditions.append(name_conditions)
        else:
            # Fallback for SQLite (testing)
            conditions.append(Candidate.normalized_name.like(f'%{name_search}%'))
    
    # Apply all conditions
    if conditions:
        stmt = stmt.where(and_(*conditions))
    
    # Execute query
    results = db.execute(stmt).scalars().all()
    
    # Rank results
    results = rank_results(list(results), query, db)
    
    return results


def rank_results(candidates: List[Candidate], query: SearchQuery, db: Session) -> List[Candidate]:
    """Rank search results deterministically"""
    if not query.name_condition:
        # Sort by created_at for deterministic ordering when no name search
        return sorted(candidates, key=lambda c: c.created_at, reverse=True)
    
    name_search = query.name_condition.lower()
    engine_name = db.bind.dialect.name
    
    def score(c: Candidate) -> tuple:
        name = c.normalized_name
        
        # Exact match
        if name == name_search:
            return (0, 0, c.id)
        
        # Starts with
        if name.startswith(name_search):
            return (1, 0, c.id)
        
        # Contains (substring)
        if name_search in name:
            return (2, name.index(name_search), c.id)
        
        # Word boundary match
        words = name.split()
        for idx, word in enumerate(words):
            if word.startswith(name_search):
                return (3, idx, c.id)
        
        # Fuzzy similarity (for PostgreSQL)
        if engine_name == 'postgresql':
            # Higher similarity = better match
            try:
                similarity_score = db.execute(
                    select(func.similarity(text(f"'{name}'"), text(f"'{name_search}'")))
                ).scalar()
                return (4, -similarity_score, c.id)
            except:
                return (4, 0, c.id)
        
        return (5, 0, c.id)
    
    return sorted(candidates, key=score)


def fuzzy_match(search: str, name: str) -> bool:
    """Simple fuzzy matching for testing/fallback"""
    search = search.lower().strip()
    name = name.lower().strip()
    
    if search in name:
        return True
    
    if name.startswith(search):
        return True
    
    if len(search) >= 3:
        words = name.split()
        for word in words:
            if word.startswith(search) or search.startswith(word):
                return True
            
            # Simple character distance check
            if len(word) >= 3 and len(search) >= 3:
                # Check if at least 70% of characters match
                matches = sum(1 for i, c in enumerate(search) if i < len(word) and word[i] == c)
                if matches / len(search) >= 0.7:
                    return True
    
    return False


def search_candidates(db: Session, query_text: str) -> dict:
    """Main search entry point"""
    query = parse_search_query(query_text)
    
    validation = validate_search_query(query)
    if not validation.valid:
        return {
            "query": query_text,
            "interpretation": query.model_dump(),
            "results": [],
            "explanation": validation.explanation
        }
    
    try:
        results = execute_search(db, query)
        return {
            "query": query_text,
            "interpretation": query.model_dump(),
            "results": [
                {
                    "id": c.id,
                    "name": c.name,
                    "current_stage": c.current_stage.value,
                    "stage_entered_at": c.stage_entered_at
                }
                for c in results
            ],
            "explanation": None if results else "No candidates found matching your search."
        }
    except InvalidQueryError as e:
        return {
            "query": query_text,
            "interpretation": query.model_dump(),
            "results": [],
            "explanation": str(e)
        }
