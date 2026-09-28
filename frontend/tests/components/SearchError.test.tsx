import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SearchError } from '../../src/components/search/SearchError';

describe('SearchError', () => {
  it('renders error message', () => {
    render(<SearchError message="Could not understand query" />);
    expect(screen.getByText(/could not understand query/i)).toBeDefined();
  });

  it('renders search issue header', () => {
    render(<SearchError message="Invalid query" />);
    expect(screen.getByText(/could not understand/i)).toBeDefined();
  });

  it('renders helpful hints', () => {
    render(<SearchError message="Invalid query" />);
    expect(screen.getByText(/try phrases like/i)).toBeDefined();
  });

  it('shows example queries', () => {
    render(<SearchError message="Invalid query" />);
    const hints = screen.getByText(/try phrases like/i);
    expect(hints).toBeDefined();
  });
});