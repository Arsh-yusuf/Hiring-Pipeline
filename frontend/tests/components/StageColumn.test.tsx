import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StageColumn } from '../../src/components/pipeline/StageColumn';

describe('StageColumn', () => {
  const mockCandidates = [
    {
      id: 1,
      name: 'John Doe',
      current_stage: 'APPLIED' as const,
      created_at: '2024-01-01T00:00:00Z',
      stage_entered_at: '2024-01-01T00:00:00Z',
    },
  ];

  it('renders stage header with count', () => {
    render(
      <StageColumn
        stage="APPLIED"
        candidates={mockCandidates}
        selectedCandidateId={null}
        onTransition={() => {}}
        onReject={() => {}}
        onCandidateClick={() => {}}
      />
    );
    // Use getByRole to target the heading specifically
    expect(screen.getByRole('heading', { name: 'Applied' })).toBeDefined();
    expect(screen.getByText('1')).toBeDefined();
  });
});