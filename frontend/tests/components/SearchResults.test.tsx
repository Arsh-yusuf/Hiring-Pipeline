import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchResults } from '../../src/components/search/SearchResults';
import type { SearchResult } from '../../src/types/search';

describe('SearchResults', () => {
  const mockResults: SearchResult[] = [
    {
      id: 1,
      name: 'John Doe',
      current_stage: 'APPLIED',
      stage_entered_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'Jane Smith',
      current_stage: 'INTERVIEW',
      stage_entered_at: '2024-01-02T00:00:00Z'
    }
  ];

  it('renders results count', () => {
    render(<SearchResults results={mockResults} onCandidateClick={() => {}} />);
    expect(screen.getByText(/2 results found/i)).toBeDefined();
  });

  it('renders candidate names', () => {
    render(<SearchResults results={mockResults} onCandidateClick={() => {}} />);
    expect(screen.getByText('John Doe')).toBeDefined();
    expect(screen.getByText('Jane Smith')).toBeDefined();
  });

  it('renders candidate stages', () => {
    render(<SearchResults results={mockResults} onCandidateClick={() => {}} />);
    expect(screen.getByText('Applied')).toBeDefined();
    expect(screen.getByText('Interview')).toBeDefined();
  });

  it('shows singular result text for one result', () => {
    const singleResult = [mockResults[0]];
    render(<SearchResults results={singleResult} onCandidateClick={() => {}} />);
    expect(screen.getByText(/1 result found/i)).toBeDefined();
  });

  it('shows no results message when empty', () => {
    render(<SearchResults results={[]} onCandidateClick={() => {}} />);
    expect(screen.getByText(/no candidates found/i)).toBeDefined();
  });

  it('calls onCandidateClick when result is clicked', () => {
    const mockClick = vi.fn();
    render(<SearchResults results={mockResults} onCandidateClick={mockClick} />);
    
    const firstResult = screen.getByText('John Doe');
    fireEvent.click(firstResult);
    
    expect(mockClick).toHaveBeenCalledWith(1);
  });

  it('distinguishes between invalid query and zero results', () => {
    // This test verifies zero results shows "No candidates found"
    // not an error explanation
    render(<SearchResults results={[]} onCandidateClick={() => {}} />);
    
    const message = screen.getByText(/no candidates found/i);
    expect(message).toBeDefined();
    
    // Should NOT show error-style text
    expect(screen.queryByText(/invalid/i)).toBeNull();
    expect(screen.queryByText(/could not understand/i)).toBeNull();
  });
});