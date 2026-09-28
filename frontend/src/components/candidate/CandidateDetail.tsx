import { useEffect, useState } from 'react';
import { useCandidate } from '../../hooks/useCandidate';
import { candidatesApi } from '../../services/api/candidates';
import { CandidateHistoryView } from './CandidateHistory';
import { StageDuration } from './StageDuration';
import { TransitionActions } from '../pipeline/TransitionActions';
import type { Stage } from '../../types/candidate';
import { STAGE_LABELS } from '../../types/candidate';

interface CandidateDetailProps {
  candidateId: number;
  onBack: () => void;
}

export function CandidateDetail({ candidateId, onBack }: CandidateDetailProps) {
  const { candidate, history, loading, error } = useCandidate(candidateId);
  const [actionLoading, setActionLoading] = useState(false);

  const handleTransition = async () => {
    if (!candidate) return;
    setActionLoading(true);
    try {
      const nextStage: Stage | null = 
        candidate.current_stage === 'APPLIED' ? 'SCREENING' :
        candidate.current_stage === 'SCREENING' ? 'INTERVIEW' :
        candidate.current_stage === 'INTERVIEW' ? 'OFFER' :
        candidate.current_stage === 'OFFER' ? 'HIRED' : null;
      if (nextStage) {
        await candidatesApi.transition(candidateId, nextStage);
        window.location.reload();
      }
    } catch (err) {
      console.error('Transition failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await candidatesApi.reject(candidateId);
      window.location.reload();
    } catch (err) {
      console.error('Reject failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!candidate) return <div>Candidate not found</div>;

  return (
    <div className="candidate-detail">
      <button className="btn-back" onClick={onBack}>Back to Pipeline</button>
      
      <div className="detail-header">
        <h2>{candidate.name}</h2>
        <span className={`stage-badge ${candidate.current_stage.toLowerCase()}`}>
          {STAGE_LABELS[candidate.current_stage as Stage]}
        </span>
      </div>

      <StageDuration stageEnteredAt={candidate.stage_entered_at} />
      
      <TransitionActions
        currentStage={candidate.current_stage}
        onTransition={handleTransition}
        onReject={handleReject}
        loading={actionLoading}
      />

      {history && <CandidateHistoryView events={history.events} />}
    </div>
  );
}