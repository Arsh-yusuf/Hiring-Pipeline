import pytest
from backend.app.domain.search.parser import parse_search_query
from backend.app.domain.search.query import StageFilter


def test_parse_name_query():
    result = parse_search_query("Find Priya Sharma")
    assert result.name_condition is not None
    assert "priya" in result.name_condition.lower()


def test_parse_stage_query():
    result = parse_search_query("Who is in Interview")
    assert result.current_stage == StageFilter.INTERVIEW


def test_parse_who_is_hired_query():
    result = parse_search_query("who is hired ?")
    assert result.current_stage == StageFilter.HIRED


def test_parse_who_got_rejected_query():
    result = parse_search_query("Who got rejected")
    assert result.current_stage == StageFilter.REJECTED


def test_parse_wildcard_query():
    result = parse_search_query("show all candidates")
    assert result.is_wildcard is True


def test_parse_duration_query():
    result = parse_search_query("Who has been stuck in Screening for more than a week")
    assert result.duration_condition is not None
    assert result.duration_condition.value == 1
    assert result.duration_condition.unit == "WEEKS"


def test_parse_exclusion_query():
    result = parse_search_query("Everyone except rejected candidates")
    assert result.exclude_statuses is not None
    assert "REJECTED" in result.exclude_statuses