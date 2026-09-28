interface TransitionActionsProps {
  currentStage: string;
  onTransition: () => void;
  onReject: () => void;
  loading?: boolean;
}

export function TransitionActions({ currentStage, onTransition, onReject, loading }: TransitionActionsProps) {
  const isTerminal = currentStage === 'HIRED' || currentStage === 'REJECTED';
  
  const nextStage = 
    currentStage === 'APPLIED' ? 'Screening' :
    currentStage === 'SCREENING' ? 'Interview' :
    currentStage === 'INTERVIEW' ? 'Offer' :
    currentStage === 'OFFER' ? 'Hired' : null;

  if (isTerminal) return null;

  return (
    <div className="transition-actions">
      {nextStage && (
        <button className="btn-primary" onClick={onTransition} disabled={loading}>
          Move to {nextStage}
        </button>
      )}
      <button className="btn-danger" onClick={onReject} disabled={loading}>
        Reject Candidate
      </button>
    </div>
  );
}