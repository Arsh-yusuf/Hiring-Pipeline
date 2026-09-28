import re
from typing import Optional
from backend.app.domain.search.query import SearchQuery, StageFilter, DurationCondition, DurationUnit, HistoryCondition


STAGE_KEYWORDS = {
    "applied": StageFilter.APPLIED,
    "applicant": StageFilter.APPLIED,
    "applicants": StageFilter.APPLIED,
    "screening": StageFilter.SCREENING,
    "screen": StageFilter.SCREENING,
    "interview": StageFilter.INTERVIEW,
    "interviewing": StageFilter.INTERVIEW,
    "interviews": StageFilter.INTERVIEW,
    "offer": StageFilter.OFFER,
    "offered": StageFilter.OFFER,
    "offers": StageFilter.OFFER,
    "hired": StageFilter.HIRED,
    "hire": StageFilter.HIRED,
    "hiring": StageFilter.HIRED,
    "rejected": StageFilter.REJECTED,
    "reject": StageFilter.REJECTED,
    "rejections": StageFilter.REJECTED,
}

NUMBER_WORDS = {
    "a": 1, "an": 1, "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10
}

DURATION_PATTERNS = [
    r"(?:more than|over|greater than)\s+(\d+|a|an|one|two|three|four|five|six|seven|eight|nine|ten)\s+(day|days|week|weeks)",
    r"(\d+|a|an|one|two|three|four|five|six|seven|eight|nine|ten)\s+(day|days|week|weeks)\s+(?:or more|longer)",
    r"stuck.*(?:in|for)\s+(\w+)\s+(?:for\s+)?(?:more than\s+)?(\d+|a|an|one|two|three|four|five|six|seven|eight|nine|ten)\s+(day|days|week|weeks)",
]

HISTORY_PATTERNS = [
    r"moved to (\w+)\s+since (\w+)",
    r"reached (\w+)\s+but.*did.?n.?t get hired",
]


def normalize_query(query: str) -> str:
    return query.lower().strip()


def extract_name(query: str) -> Optional[str]:
    query_lower = query.lower().strip()
    
    # Explicit name lookup prefixes
    for prefix in ["find ", "search for ", "look for ", "where is ", "find candidate ", "show candidate "]:
        if query_lower.startswith(prefix):
            name_part = query[len(prefix):].strip()
            for stop in [" in ", " who ", " and "]:
                if stop in name_part.lower():
                    name_part = name_part[:name_part.lower().index(stop)].strip()
            return name_part if name_part else None

    # Intent checks: queries starting with intent words are rule/stage queries, not names
    rule_prefixes = ["who", "everyone", "stuck", "candidates", "all", "show", "list", "get", "display", "find"]
    words = query_lower.split()
    if words and words[0] in rule_prefixes:
        # Check if "find" is followed by a name (e.g. "find john")
        if words[0] == "find" and len(words) > 1 and words[1] not in STAGE_KEYWORDS and words[1] not in ["all", "candidates"]:
            return " ".join(words[1:])
        return None

    # If query contains stage keywords, it is a stage/history query, not a name
    if any(w in STAGE_KEYWORDS for w in words):
        return None

    return query.strip() if query.strip() else None


def extract_current_stage(query: str) -> Optional[StageFilter]:
    query_clean = re.sub(r'[^\w\s]', '', query.lower()).strip()
    words = query_clean.split()

    # Don't extract current_stage if history condition handles it (e.g. "reached offer but didn't get hired")
    if "reached" in query_clean and "offer" in query_clean and ("didn" in query_clean or "not" in query_clean or "but" in query_clean):
        return None

    # Check stage keywords in query
    for word in words:
        if word in STAGE_KEYWORDS:
            stage = STAGE_KEYWORDS[word]
            
            # Check natural language intent patterns
            # 1. Query consists of or starts with intent phrase + stage ("who is hired", "who got hired", "who was hired", "who is in interview", "who's hired")
            # 2. Stage + candidate ("hired candidates", "screening candidates")
            # 3. Direct query like "hired", "in interview", "show hired"
            return stage

    return None


def extract_duration_condition(query: str) -> Optional[DurationCondition]:
    query = query.lower()
    
    for pattern in DURATION_PATTERNS:
        match = re.search(pattern, query)
        if match:
            if len(match.groups()) == 2:
                value_str, unit_str = match.groups()
            else:
                # Pattern with 3 groups (stage, value, unit)
                _, value_str, unit_str = match.groups()
            
            # Convert word numbers to integers
            if value_str in NUMBER_WORDS:
                value = NUMBER_WORDS[value_str]
            else:
                try:
                    value = int(value_str)
                except ValueError:
                    continue
            
            stage = None
            for keyword, stage_val in STAGE_KEYWORDS.items():
                if keyword in query:
                    stage = stage_val
                    break
            
            if stage:
                unit = DurationUnit.WEEKS if "week" in unit_str else DurationUnit.DAYS
                return DurationCondition(
                    stage=stage,
                    operator=">",
                    value=value,
                    unit=unit
                )
    return None


def parse_date_reference(date_ref: str) -> Optional[str]:
    """Parse date references like 'Monday', 'yesterday', '7 days ago'"""
    date_ref = date_ref.lower().strip()
    
    # Day names
    days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    if date_ref in days:
        return date_ref
    
    # Relative references
    if date_ref in ["yesterday", "today"]:
        return date_ref
    
    # "N days ago" pattern
    match = re.match(r"(\d+)\s+days?\s+ago", date_ref)
    if match:
        return date_ref
    
    return date_ref  # Return as-is for other patterns


def extract_history_condition(query: str) -> Optional[HistoryCondition]:
    query = query.lower()
    
    if "reached" in query and "offer" in query and ("didn't get hired" in query or "not hired" in query or "but not" in query or "didnt get hired" in query):
        return HistoryCondition(
            stage=StageFilter.OFFER,
            comparison="reached_not_hired",
            date_ref="ever"
        )
    
    match = re.search(r"moved to (\w+)\s+since\s+([a-zA-Z0-9\s]+?)(?:\s|$)", query)
    if match:
        stage_str, date_ref = match.groups()
        if stage_str in STAGE_KEYWORDS:
            parsed_date_ref = parse_date_reference(date_ref)
            return HistoryCondition(
                stage=STAGE_KEYWORDS[stage_str],
                comparison="moved_since",
                date_ref=parsed_date_ref
            )
    
    return None


def extract_exclusions(query: str) -> Optional[list[StageFilter]]:
    query = query.lower()
    exclusions = []
    
    if "except" in query or "not " in query or "except rejected" in query:
        if "rejected" in query:
            exclusions.append(StageFilter.REJECTED)
        if "hired" in query:
            exclusions.append(StageFilter.HIRED)
    
    if exclusions:
        return exclusions
    return None


def parse_search_query(query: str) -> SearchQuery:
    normalized = normalize_query(query)
    clean_text = re.sub(r'[^\w\s]', '', normalized).strip()
    
    # Wildcard / show all queries check
    wildcard_terms = {"everyone", "all candidates", "show all", "list all", "show candidates", "list candidates", "all", "get candidates"}
    if clean_text in wildcard_terms or re.match(r"^(show|list|get|all)?\s*(all\s*)?candidates$", clean_text):
        return SearchQuery(is_wildcard=True)

    name = extract_name(normalized)
    duration = extract_duration_condition(normalized)
    history = extract_history_condition(normalized)
    current_stage = extract_current_stage(normalized)
    exclusions = extract_exclusions(normalized)
    
    has_conditions = any([current_stage, duration, history, exclusions])
    
    return SearchQuery(
        name_condition=name,
        current_stage=current_stage,
        duration_condition=duration,
        history_condition=history,
        exclude_statuses=exclusions,
        combinator="AND" if has_conditions and name else "AND"
    )