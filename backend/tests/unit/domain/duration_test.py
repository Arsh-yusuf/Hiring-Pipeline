import pytest
from datetime import datetime, timedelta
from backend.app.utils.date import calculate_duration


def test_calculate_duration_days():
    entered = datetime.now() - timedelta(days=5)
    result = calculate_duration(entered)
    assert result.days == 5


def test_calculate_duration_hours():
    entered = datetime.now() - timedelta(hours=12)
    result = calculate_duration(entered)
    assert result.total_seconds() >= 12 * 3600


def test_calculate_duration_zero():
    entered = datetime.now()
    result = calculate_duration(entered)
    assert result.total_seconds() < 1