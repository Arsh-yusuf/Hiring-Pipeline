import type { Candidate } from '../../types/candidate';
import { STAGES, type Stage } from '../../types/candidate';
import { StageColumn } from './StageColumn';

interface PipelineBoardProps {
  candidates: Candidate[];
  selectedCandidateId: number | null;
  onCandidateClick: (id: number) => void;
  onTransition: (id: number) => void;
  onReject: (id: number) => void;
}

export function PipelineBoard({ candidates, selectedCandidateId, onCandidateClick, onTransition, onReject }: PipelineBoardProps) {
  const getCandidatesByStage = (stage: Stage) =>
    candidates.filter(c => c.current_stage === stage);

  return (
    <div className="pipeline-container" id="pipeline-board">
      {STAGES.map(stage => (
        <StageColumn
          key={stage}
          stage={stage}
          candidates={getCandidatesByStage(stage)}
          selectedCandidateId={selectedCandidateId}
          onTransition={onTransition}
          onReject={onReject}
          onCandidateClick={onCandidateClick}
        />
      ))}
    </div>
  );
}