import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CandidateCard } from '../../src/components/pipeline/CandidateCard';

describe('CandidateCard', () => {
  const mockCandidate = {
    id: 1,
    name: 'John Doe',
    current_stage: 'APPLIED' as const,
    created_at: '2024-01-01T00:00:00Z',
    stage_entered_at: '2024-01-01T00:00:00Z',
  };

  it('renders candidate name', () => {
    render(
      <CandidateCard
        candidate={mockCandidate}
        isSelected={false}
        onTransition={() => {}}
        onReject={() => {}}
        onClick={() => {}}
      />
    );
    expect(screen.getByText('John Doe')).toBeDefined();
  });

  it('renders initials avatar', () => {
    render(
      <CandidateCard
        candidate={mockCandidate}
        isSelected={false}
        onTransition={() => {}}
        onReject={() => {}}
        onClick={() => {}}
      />
    );
    expect(screen.getByText('JD')).toBeDefined();
  });
});