import { useState } from 'react';
import { useSearch } from '../hooks/useSearch';
import { SearchBox } from '../components/search/SearchBox';
import { SearchResults } from '../components/search/SearchResults';
import { SearchInterpretation } from '../components/search/SearchInterpretation';
import { SearchError } from '../components/search/SearchError';

interface SearchPageProps {
  onCandidateClick: (id: number) => void;
}

export function SearchPage({ onCandidateClick }: SearchPageProps) {
  const { results, loading, error, search } = useSearch();

  return (
    <>
      {/* Top Header */}
      <header className="top-header">
        <div className="header-left">
          <h1 className="header-title">Search Candidates</h1>
          <p className="header-subtitle">Use natural language to find candidates across the pipeline</p>
        </div>
      </header>

      <div className="page-content">
        <div className="search-page">
          <SearchBox onSearch={search} loading={loading} />

          {results && (
            <>
              {results.explanation && !results.results.length ? (
                <SearchError message={results.explanation} />
              ) : (
                <>
                  <SearchInterpretation interpretation={results.interpretation} />
                  <SearchResults results={results.results} onCandidateClick={onCandidateClick} />
                </>
              )}
            </>
          )}

          {!results && !loading && (
            <div className="search-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p>Search for candidates by name, stage, or time in stage</p>
              <span className="search-hint">
                Try: "Find Priya Sharma", "Who is in Interview", "Screening for more than a week"
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
