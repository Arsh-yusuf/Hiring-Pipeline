import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PipelinePage } from '../../src/pages/PipelinePage';

// Mock the API
vi.mock('../../src/services/api/candidates', () => ({
  candidatesApi: {
    getAll: vi.fn(() => Promise.resolve({ candidates: [] })),
    create: vi.fn(() => Promise.resolve({ id: 1, name: 'Test User', current_stage: 'APPLIED', created_at: new Date().toISOString(), stage_entered_at: new Date().toISOString() })),
  }
}));

describe('PipelinePage', () => {
  it('renders pipeline board', async () => {
    render(<PipelinePage selectedCandidateId={null} onSelectCandidate={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText('Hiring Pipeline')).toBeDefined();
    });
  });

  it('renders add candidate button', async () => {
    render(<PipelinePage selectedCandidateId={null} onSelectCandidate={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText('Add Candidate')).toBeDefined();
    });
  });

  it('opens add candidate modal on button click', async () => {
    render(<PipelinePage selectedCandidateId={null} onSelectCandidate={() => {}} />);
    
    await waitFor(() => {
      const button = screen.getByText('Add Candidate');
      fireEvent.click(button);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Add New Candidate')).toBeDefined();
      expect(screen.getByPlaceholderText(/enter full name/i)).toBeDefined();
    });
  });

  it('shows stage columns', async () => {
    render(<PipelinePage selectedCandidateId={null} onSelectCandidate={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getAllByText('Applied').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Screening').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Interview').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Offer').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Hired').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Rejected').length).toBeGreaterThan(0);
    });
  });
});