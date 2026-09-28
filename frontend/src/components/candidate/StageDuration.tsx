import { formatDuration } from '../../utils/date';

interface StageDurationProps {
  stageEnteredAt: string;
}

export function StageDuration({ stageEnteredAt }: StageDurationProps) {
  return (
    <div className="stage-duration">
      <span className="duration-label">In current stage:</span>
      <span className="duration-value">{formatDuration(stageEnteredAt)}</span>
    </div>
  );
}