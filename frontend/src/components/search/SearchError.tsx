interface SearchErrorProps {
  message: string;
}

export function SearchError({ message }: SearchErrorProps) {
  return (
    <div className="search-error-card" id="search-error">
      <h4>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        Could not understand your search
      </h4>
      <p>{message}</p>
      <p className="search-hint">
        Try phrases like: "Find John", "Who is in Interview", "Candidates in Screening for more than a week"
      </p>
    </div>
  );
}