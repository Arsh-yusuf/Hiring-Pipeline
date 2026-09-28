import pytest
from backend.app.domain.candidate.stages import Stage, is_terminal
from backend.app.domain.candidate.errors import (
    validate_transition,
    validate_rejection,
    InvalidTransitionError,
    RejectionNotAllowedError
)


def test_validate_transition_valid():
    validate_transition(Stage.APPLIED, Stage.SCREENING)
    validate_transition(Stage.SCREENING, Stage.INTERVIEW)
    validate_transition(Stage.INTERVIEW, Stage.OFFER)
    validate_transition(Stage.OFFER, Stage.HIRED)


def test_validate_transition_invalid_skip():
    with pytest.raises(InvalidTransitionError):
        validate_transition(Stage.APPLIED, Stage.INTERVIEW)


def test_validate_transition_invalid_reverse():
    with pytest.raises(InvalidTransitionError):
        validate_transition(Stage.INTERVIEW, Stage.SCREENING)


def test_validate_transition_terminal():
    with pytest.raises(InvalidTransitionError):
        validate_transition(Stage.HIRED, Stage.REJECTED)


def test_validate_rejection_valid():
    validate_rejection(Stage.APPLIED)
    validate_rejection(Stage.SCREENING)
    validate_rejection(Stage.INTERVIEW)
    validate_rejection(Stage.OFFER)


def test_validate_rejection_invalid():
    with pytest.raises(RejectionNotAllowedError):
        validate_rejection(Stage.HIRED)
    with pytest.raises(RejectionNotAllowedError):
        validate_rejection(Stage.REJECTED)