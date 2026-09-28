import { useState, useEffect, useCallback } from 'react';
import { candidatesApi } from '../services/api/candidates';
import type { Candidate } from '../types/candidate';

export function useCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidates = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await candidatesApi.getAll();
      setCandidates(response.candidates);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch candidates');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const removeCandidate = useCallback((id: number) => {
    setCandidates(prev => prev.filter(c => c.id !== id));
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  return { candidates, setCandidates, loading, error, refetch: fetchCandidates, removeCandidate };
}