from backend.app.domain.search.query import SearchQuery, SearchValidationResult


def validate_search_query(query: SearchQuery) -> SearchValidationResult:
    if query.is_wildcard:
        return SearchValidationResult(valid=True, status="VALID")

    if not query.name_condition and not query.current_stage and not query.duration_condition and not query.history_condition and not query.exclude_statuses:
        return SearchValidationResult(
            valid=False,
            status="INVALID",
            explanation="Could not understand the search query. Try phrases like 'Find John', 'Who is hired', 'Who is in Interview', or 'Candidates in Screening for more than a week'."
        )
    
    if query.history_condition:
        if query.history_condition.comparison == "reached_not_hired":
            pass
        elif query.history_condition.comparison == "moved_since":
            if not query.history_condition.date_ref:
                return SearchValidationResult(
                    valid=False,
                    status="INVALID",
                    explanation="Missing date reference for historical movement. Try 'since Monday', 'since yesterday', etc."
                )
    
    return SearchValidationResult(
        valid=True,
        status="VALID"
    )