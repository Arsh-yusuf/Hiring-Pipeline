export interface HistoryEvent {
  id: number;
  event_type: string;
  from_stage: string | null;
  to_stage: string;
  occurred_at: string;
  metadata: Record<string, unknown> | null;
}

export interface CandidateHistory {
  candidate_id: number;
  events: HistoryEvent[];
}