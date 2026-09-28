import { useState } from 'react';
import { useSearch } from '../hooks/useSearch';
import { SearchBox } from '../components/search/SearchBox';
import { SearchResults } from '../components/search/SearchResults';
import { SearchInterpretation } from '../components/search/SearchInterpretation';
import { SearchError } from '../components/search/SearchError';

interface CandidatePageProps {
  onCandidateClick: (id: number) => void;
}

export function CandidatePage({ onCandidateClick }: CandidatePageProps) {
  const { results, loading, search } = useSearch();

  return (
    <div className="candidate-page">
      <header className="page-header">
        <h1>Search Candidates</h1>
      </header>
      
      <SearchBox onSearch={search} loading={loading} />
      
      {results && (
        <>
          {results.explanation && !results.results.length ? (
            <SearchError message={results.explanation} />
          ) : (
            <>
              <SearchInterpretation interpretation={results.interpretation} />
              {results.results.length > 0 && (
                <SearchResults results={results.results} onCandidateClick={onCandidateClick} />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}