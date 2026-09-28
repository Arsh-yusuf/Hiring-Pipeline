import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SearchInterpretation } from '../../src/components/search/SearchInterpretation';
import type { SearchQuery } from '../../src/types/search';

describe('SearchInterpretation', () => {
  it('renders name condition', () => {
    const interpretation: SearchQuery = {
      name_condition: 'John Doe',
      combinator: 'AND'
    };
    
    render(<SearchInterpretation interpretation={interpretation} />);
    expect(screen.getByText(/name contains/i)).toBeDefined();
    expect(screen.getByText(/John Doe/)).toBeDefined();
  });

  it('renders current stage condition', () => {
    const interpretation: SearchQuery = {
      current_stage: 'INTERVIEW',
      combinator: 'AND'
    };
    
    render(<SearchInterpretation interpretation={interpretation} />);
    expect(screen.getByText(/current stage/i)).toBeDefined();
    expect(screen.getByText(/INTERVIEW/)).toBeDefined();
  });

  it('renders duration condition', () => {
    const interpretation: SearchQuery = {
      duration_condition: {
        stage: 'SCREENING',
        operator: '>',
        value: 7,
        unit: 'DAYS'
      },
      combinator: 'AND'
    };
    
    render(<SearchInterpretation interpretation={interpretation} />);
    expect(screen.getByText(/more than 7 days/i)).toBeDefined();
  });

  it('renders exclusion condition', () => {
    const interpretation: SearchQuery = {
      name_condition: 'test', // needed for hasConditions to be true
      exclude_statuses: ['REJECTED'],
      combinator: 'AND'
    };
    
    render(<SearchInterpretation interpretation={interpretation} />);
    expect(screen.getByText(/Excluding:/i)).toBeDefined();
    expect(screen.getByText(/REJECTED/)).toBeDefined();
  });

  it('does not render when no conditions', () => {
    const interpretation: SearchQuery = {
      combinator: 'AND'
    };
    
    const { container } = render(<SearchInterpretation interpretation={interpretation} />);
    expect(container.firstChild).toBeNull();
  });
});