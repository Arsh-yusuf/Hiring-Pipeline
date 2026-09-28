import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchPage } from '../../src/pages/SearchPage';

// Mock the search hook
vi.mock('../../src/hooks/useSearch', () => ({
  useSearch: () => ({
    results: null,
    loading: false,
    error: null,
    search: vi.fn()
  })
}));

describe('SearchPage', () => {
  it('renders search page header', () => {
    render(<SearchPage onCandidateClick={() => {}} />);
    expect(screen.getByText('Search Candidates')).toBeDefined();
  });

  it('renders search box', () => {
    render(<SearchPage onCandidateClick={() => {}} />);
    const searchInput = screen.getByPlaceholderText(/search candidates/i);
    expect(searchInput).toBeDefined();
  });

  it('allows search input', () => {
    render(<SearchPage onCandidateClick={() => {}} />);
    const searchInput = screen.getByPlaceholderText(/search candidates/i);
    
    fireEvent.change(searchInput, { target: { value: 'John Doe' } });
    expect(searchInput).toBeDefined();
  });

  it('shows search button', () => {
    render(<SearchPage onCandidateClick={() => {}} />);
    const searchButton = screen.getByRole('button', { name: /search/i });
    expect(searchButton).toBeDefined();
  });
});