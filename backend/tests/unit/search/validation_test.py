import pytest
from backend.app.domain.search.query import SearchQuery, StageFilter, DurationCondition, DurationUnit
from backend.app.domain.search.validation import validate_search_query


def test_validate_valid_query():
    query = SearchQuery(name_condition="john")
    result = validate_search_query(query)
    assert result.valid is True


def test_validate_empty_query():
    query = SearchQuery()
    result = validate_search_query(query)
    assert result.valid is False


def test_validate_current_stage():
    query = SearchQuery(current_stage=StageFilter.INTERVIEW)
    result = validate_search_query(query)
    assert result.valid is True