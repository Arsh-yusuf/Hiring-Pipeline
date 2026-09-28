import type { SearchQuery } from '../../types/search';

interface SearchInterpretationProps {
  interpretation: SearchQuery;
}

export function SearchInterpretation({ interpretation }: SearchInterpretationProps) {
  const hasConditions = interpretation.name_condition || 
    interpretation.current_stage || 
    interpretation.duration_condition || 
    interpretation.history_condition;

  if (!hasConditions) return null;

  return (
    <div className="search-interpretation">
      <h4>Search interpreted as:</h4>
      <ul>
        {interpretation.name_condition && (
          <li>Name contains: "{interpretation.name_condition}"</li>
        )}
        {interpretation.current_stage && (
          <li>Current stage: {interpretation.current_stage}</li>
        )}
        {interpretation.duration_condition && (
          <li>
            In {interpretation.duration_condition.stage} for more than{' '}
            {interpretation.duration_condition.value} {interpretation.duration_condition.unit.toLowerCase()}
          </li>
        )}
        {interpretation.history_condition && (
          <li>
            {interpretation.history_condition.comparison === 'reached_not_hired' 
              ? `Reached Offer but not hired`
              : `Moved to ${interpretation.history_condition.stage}`
            }
          </li>
        )}
        {interpretation.exclude_statuses && interpretation.exclude_statuses.length > 0 && (
          <li>Excluding: {interpretation.exclude_statuses.join(', ')}</li>
        )}
      </ul>
    </div>
  );
}