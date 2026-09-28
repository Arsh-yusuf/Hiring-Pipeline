import pytest
from backend.app.services.search_service import fuzzy_match


def test_fuzzy_match_exact():
    assert fuzzy_match("john", "john") is True


def test_fuzzy_match_partial():
    assert fuzzy_match("john", "john doe") is True


def test_fuzzy_match_prefix():
    assert fuzzy_match("john", "johnathon") is True


def test_fuzzy_match_no_match():
    assert fuzzy_match("xyz", "john") is False