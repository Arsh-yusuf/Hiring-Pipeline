import type { Candidate } from '../../types/candidate';
import { STAGE_LABELS, type Stage } from '../../types/candidate';
import { formatDuration } from '../../utils/date';
import { getInitials, getAvatarClass } from '../../utils/avatar';

interface CandidateCardProps {
  candidate: Candidate;
  isSelected: boolean;
  onTransition: (id: number) => void;
  onReject: (id: number) => void;
  onClick: (id: number) => void;
}

export function CandidateCard({ candidate, isSelected, onTransition, onReject, onClick }: CandidateCardProps) {
  const stage = candidate.current_stage as Stage;
  const nextStage: Stage | null =
    stage === 'APPLIED' ? 'SCREENING' :
    stage === 'SCREENING' ? 'INTERVIEW' :
    stage === 'INTERVIEW' ? 'OFFER' :
    stage === 'OFFER' ? 'HIRED' : null;

  const isTerminal = stage === 'HIRED' || stage === 'REJECTED';

  return (
    <div
      className={`candidate-card${isSelected ? ' selected' : ''}`}
      onClick={() => onClick(candidate.id)}
      id={`candidate-card-${candidate.id}`}
    >
      <div className="card-top-row">
        <div className={`candidate-avatar ${getAvatarClass(stage)}`}>
          {getInitials(candidate.name)}
        </div>
        <div className="card-info">
          <div className="card-name">{candidate.name}</div>
          <div className="card-duration">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {formatDuration(candidate.stage_entered_at)}
          </div>
        </div>
        <button
          className="card-menu-btn"
          onClick={(e) => { e.stopPropagation(); onClick(candidate.id); }}
          aria-label="More options"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>
      </div>

      {/* Quick actions on hover */}
      {!isTerminal && (
        <div className="card-actions-row" onClick={(e) => e.stopPropagation()}>
          {nextStage && (
            <button
              className="btn-card-action btn-card-advance"
              onClick={() => onTransition(candidate.id)}
            >
              → {STAGE_LABELS[nextStage]}
            </button>
          )}
          <button
            className="btn-card-action btn-card-reject"
            onClick={() => onReject(candidate.id)}
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}