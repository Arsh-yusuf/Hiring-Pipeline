import { useState, useEffect } from 'react';
import { candidatesApi } from '../services/api/candidates';
import type { Candidate } from '../types/candidate';
import type { CandidateHistory } from '../types/history';

export function useCandidate(id: number | null) {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [history, setHistory] = useState<CandidateHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id === null) {
      setCandidate(null);
      setHistory(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [candidateData, historyData] = await Promise.all([
          candidatesApi.getById(id),
          candidatesApi.getHistory(id),
        ]);
        setCandidate(candidateData);
        setHistory(historyData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch candidate');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return { candidate, history, loading, error };
}