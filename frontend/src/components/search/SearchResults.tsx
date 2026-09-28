import type { SearchResult } from '../../types/search';
import { STAGE_LABELS, type Stage } from '../../types/candidate';
import { getInitials, getAvatarClass } from '../../utils/avatar';

interface SearchResultsProps {
  results: SearchResult[];
  onCandidateClick: (id: number) => void;
}

export function SearchResults({ results, onCandidateClick }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="search-no-results">
        <p>No candidates found matching your search.</p>
      </div>
    );
  }

  const getBadgeClass = (stage: string) => `badge-${stage.toLowerCase()}`;

  return (
    <div className="search-results-list" id="search-results">
      <div className="results-count">
        {results.length} result{results.length !== 1 ? 's' : ''} found
      </div>
      {results.map((result) => (
        <div
          key={result.id}
          className="search-result-item"
          onClick={() => onCandidateClick(result.id)}
          id={`search-result-${result.id}`}
        >
          <div className={`result-avatar ${getAvatarClass(result.current_stage)}`}>
            {getInitials(result.name)}
          </div>
          <div className="result-info">
            <span className="result-name">{result.name}</span>
          </div>
          <span className={`result-stage ${getBadgeClass(result.current_stage)}`}>
            {STAGE_LABELS[result.current_stage as Stage]}
          </span>
        </div>
      ))}
    </div>
  );
}