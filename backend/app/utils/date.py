from datetime import datetime, timedelta
from typing import Optional


def calculate_duration(stage_entered_at: datetime) -> Optional[timedelta]:
    if not stage_entered_at:
        return None
    return datetime.now() - stage_entered_at