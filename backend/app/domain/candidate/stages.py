import enum


class Stage(str, enum.Enum):
    APPLIED = "APPLIED"
    SCREENING = "SCREENING"
    INTERVIEW = "INTERVIEW"
    OFFER = "OFFER"
    HIRED = "HIRED"
    REJECTED = "REJECTED"


class EventType(str, enum.Enum):
    CREATED = "CREATED"
    STAGE_CHANGED = "STAGE_CHANGED"
    REJECTED = "REJECTED"


TERMINAL_STAGES = {Stage.HIRED, Stage.REJECTED}

FORWARD_TRANSITIONS = {
    Stage.APPLIED: Stage.SCREENING,
    Stage.SCREENING: Stage.INTERVIEW,
    Stage.INTERVIEW: Stage.OFFER,
    Stage.OFFER: Stage.HIRED,
}

REJECTION_TRANSITIONS = {
    Stage.APPLIED: Stage.REJECTED,
    Stage.SCREENING: Stage.REJECTED,
    Stage.INTERVIEW: Stage.REJECTED,
    Stage.OFFER: Stage.REJECTED,
}


def is_terminal(stage: Stage) -> bool:
    return stage in TERMINAL_STAGES


def get_next_stage(current_stage: Stage) -> Stage | None:
    return FORWARD_TRANSITIONS.get(current_stage)


def can_transition(from_stage: Stage, to_stage: Stage) -> bool:
    return get_next_stage(from_stage) == to_stage


def can_reject(from_stage: Stage) -> bool:
    return from_stage in REJECTION_TRANSITIONS