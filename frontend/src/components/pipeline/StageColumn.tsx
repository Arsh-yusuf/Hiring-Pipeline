import type { Candidate } from '../../types/candidate';
import { STAGE_LABELS, type Stage } from '../../types/candidate';
import { CandidateCard } from './CandidateCard';

interface StageColumnProps {
  stage: Stage;
  candidates: Candidate[];
  selectedCandidateId: number | null;
  onTransition: (id: number) => void;
  onReject: (id: number) => void;
  onCandidateClick: (id: number) => void;
}

export function StageColumn({ stage, candidates, selectedCandidateId, onTransition, onReject, onCandidateClick }: StageColumnProps) {
  return (
    <div className="stage-column" id={`stage-${stage.toLowerCase()}`}>
      <div className="stage-header">
        <div className="stage-header-left">
          <h3>{STAGE_LABELS[stage]}</h3>
          <span className="stage-count">{candidates.length}</span>
        </div>
      </div>
      <div className="stage-candidates">
        {candidates.length === 0 ? (
          <div className="stage-empty">No candidates</div>
        ) : (
          candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              isSelected={candidate.id === selectedCandidateId}
              onTransition={onTransition}
              onReject={onReject}
              onClick={onCandidateClick}
            />
          ))
        )}
      </div>
    </div>
  );
}