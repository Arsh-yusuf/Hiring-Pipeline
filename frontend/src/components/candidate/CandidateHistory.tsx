import type { HistoryEvent } from '../../types/history';

interface CandidateHistoryProps {
  events: HistoryEvent[];
}

export function CandidateHistoryView({ events }: CandidateHistoryProps) {
  const getEventLabel = (event: HistoryEvent): string => {
    if (event.event_type === 'CREATED') return `Added as ${event.to_stage}`;
    if (event.event_type === 'STAGE_CHANGED') return `Moved to ${event.to_stage}`;
    if (event.event_type === 'REJECTED') return 'Rejected';
    return event.event_type;
  };

  const getEventClass = (event: HistoryEvent): string => {
    if (event.event_type === 'CREATED') return 'created';
    if (event.event_type === 'REJECTED') return 'rejected';
    return '';
  };

  return (
    <div className="detail-section">
      <h4 className="detail-section-title">Candidate History</h4>
      <div className="history-timeline">
        {events.map((event, index) => (
          <div key={event.id || index} className={`history-event ${getEventClass(event)}`}>
            <div className="history-marker" />
            <div className="history-content">
              <div className="history-event-type">{getEventLabel(event)}</div>
              <div className="history-date">
                {new Date(event.occurred_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}