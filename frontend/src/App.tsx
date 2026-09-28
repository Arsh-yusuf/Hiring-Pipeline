import { useState, useEffect, useCallback } from 'react';
import { PipelinePage } from './pages/PipelinePage';
import { SearchPage } from './pages/SearchPage';
import './index.css';

type View = 'pipeline' | 'search';

function App() {
  const [currentView, setCurrentView] = useState<View>('pipeline');
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);

  const handleCandidateClick = (id: number) => {
    setSelectedCandidateId(id);
    setCurrentView('pipeline');
  };

  // Global keyboard shortcut: Cmd+K / Ctrl+K to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCurrentView('search');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <span className="sidebar-brand-text">Hiring Pipeline</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`sidebar-nav-item ${currentView === 'pipeline' ? 'active' : ''}`}
            onClick={() => setCurrentView('pipeline')}
            id="nav-pipeline"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            <span>Pipeline</span>
          </button>
          <button
            className={`sidebar-nav-item ${currentView === 'search' ? 'active' : ''}`}
            onClick={() => setCurrentView('search')}
            id="nav-search"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>Search</span>
          </button>
        </nav>
      </aside>

      {/* Main Area */}
      <div className="main-area">
        {currentView === 'pipeline' ? (
          <PipelinePage
            selectedCandidateId={selectedCandidateId}
            onSelectCandidate={setSelectedCandidateId}
          />
        ) : (
          <SearchPage onCandidateClick={handleCandidateClick} />
        )}
      </div>
    </div>
  );
}

export default App;