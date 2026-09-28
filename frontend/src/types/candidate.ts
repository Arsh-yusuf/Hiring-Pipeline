export interface Candidate {
  id: number;
  name: string;
  current_stage: string;
  created_at: string;
  stage_entered_at: string;
}

export interface CandidateWithDuration extends Candidate {
  duration_days: number;
}

export type Stage = 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED';

export const STAGES: Stage[] = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'];

export const STAGE_LABELS: Record<Stage, string> = {
  APPLIED: 'Applied',
  SCREENING: 'Screening',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  HIRED: 'Hired',
  REJECTED: 'Rejected'
};

export const FORWARD_TRANSITIONS: Record<Stage, Stage | null> = {
  APPLIED: 'SCREENING',
  SCREENING: 'INTERVIEW',
  INTERVIEW: 'OFFER',
  OFFER: 'HIRED',
  HIRED: null,
  REJECTED: null
};

export function canTransition(currentStage: Stage): boolean {
  return FORWARD_TRANSITIONS[currentStage] !== null;
}

export function getNextStage(currentStage: Stage): Stage | null {
  return FORWARD_TRANSITIONS[currentStage];
}