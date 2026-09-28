from backend.app.domain.candidate.stages import Stage, FORWARD_TRANSITIONS, REJECTION_TRANSITIONS


class InvalidTransitionError(Exception):
    pass


class RejectionNotAllowedError(Exception):
    pass


class CandidateNotFoundError(Exception):
    pass


class TerminalStateError(Exception):
    pass


def validate_transition(from_stage: Stage, to_stage: Stage) -> None:
    expected = FORWARD_TRANSITIONS.get(from_stage)
    if expected != to_stage:
        raise InvalidTransitionError(
            f"Cannot transition from {from_stage.value} to {to_stage.value}. "
            f"Expected: {expected.value if expected else 'none'}"
        )


def validate_rejection(from_stage: Stage) -> None:
    if from_stage not in REJECTION_TRANSITIONS:
        raise RejectionNotAllowedError(
            f"Cannot reject candidate in {from_stage.value} stage"
        )