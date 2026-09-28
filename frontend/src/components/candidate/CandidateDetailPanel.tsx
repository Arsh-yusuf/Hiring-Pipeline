import { useState } from 'react';
import { useCandidate } from '../../hooks/useCandidate';
import { STAGE_LABELS, type Stage } from '../../types/candidate';
import { CandidateHistoryView } from './CandidateHistory';
import { getInitials, getAvatarClass } from '../../utils/avatar';
import { formatDuration } from '../../utils/date';

interface CandidateDetailPanelProps {
  candidateId: number;
  onClose: () => void;
  onTransition: () => void;
  onReject: () => void;
  onDelete?: () => void;
}

type Tab = 'overview' | 'history';

export function CandidateDetailPanel({ candidateId, onClose, onTransition, onReject, onDelete }: CandidateDetailPanelProps) {
  const { candidate, history, loading, error } = useCandidate(candidateId);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (loading) {
    return (
      <div className="detail-panel-overlay">
        <div className="detail-panel-backdrop" onClick={onClose} />
        <div className="detail-panel">
          <div className="loading-state">
            <div className="spinner" />
            <span>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="detail-panel-overlay">
        <div className="detail-panel-backdrop" onClick={onClose} />
        <div className="detail-panel">
          <div className="error-state">
            <span>{error || 'Candidate not found'}</span>
          </div>
        </div>
      </div>
    );
  }

  const stage = candidate.current_stage as Stage;
  const isTerminal = stage === 'HIRED' || stage === 'REJECTED';

  const nextStage: Stage | null =
    stage === 'APPLIED' ? 'SCREENING' :
    stage === 'SCREENING' ? 'INTERVIEW' :
    stage === 'INTERVIEW' ? 'OFFER' :
    stage === 'OFFER' ? 'HIRED' : null;

  const badgeClass = `badge-${stage.toLowerCase()}`;
  const avatarClass = getAvatarClass(stage);

  return (
    <div className="detail-panel-overlay">
      <div className="detail-panel-backdrop" onClick={onClose} />
      <div className="detail-panel" id="detail-panel">
        {/* Header */}
        <div className="detail-panel-header">
          <div className="detail-close-row">
            <button className="btn-close-panel" onClick={onClose} aria-label="Close panel">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="detail-identity">
            <div className={`detail-avatar ${avatarClass}`}>
              {getInitials(candidate.name)}
            </div>
            <div className="detail-name-block">
              <div className="detail-name">{candidate.name}</div>
              <div className="detail-meta">
                <span className={`detail-stage-badge ${badgeClass}`}>
                  {STAGE_LABELS[stage]}
                </span>
                <span className="detail-duration-text">
                  {formatDuration(candidate.stage_entered_at)} in this stage
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="detail-tabs">
          <button
            className={`detail-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`detail-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>

        {/* Body */}
        <div className="detail-body">
          {activeTab === 'overview' && (
            <div className="detail-section">
              <h4 className="detail-section-title">Stage Information</h4>
              <div className="stage-info-grid">
                <span className="stage-info-label">Current Stage</span>
                <span className={`stage-info-value badge ${badgeClass}`}>
                  {STAGE_LABELS[stage]}
                </span>

                <span className="stage-info-label">Entered On</span>
                <span className="stage-info-value">
                  {new Date(candidate.stage_entered_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </span>

                <span className="stage-info-label">Time in Stage</span>
                <span className="stage-info-value">
                  {formatDuration(candidate.stage_entered_at)}
                </span>

                {nextStage && (
                  <>
                    <span className="stage-info-label">Next Stage</span>
                    <span className="stage-info-value">
                      {STAGE_LABELS[nextStage]}
                    </span>
                  </>
                )}

                <span className="stage-info-label">Created</span>
                <span className="stage-info-value">
                  {new Date(candidate.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          )}

          {activeTab === 'history' && history && (
            <CandidateHistoryView events={history.events} />
          )}

          {/* Delete Confirmation Box */}
          {showConfirmDelete && (
            <div className="delete-confirm-box" id="delete-confirm-box" style={{ marginTop: '20px', padding: '16px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.88rem', color: '#dc2626', fontWeight: 500 }}>
                Are you sure you want to permanently delete <strong>{candidate.name}</strong>? This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  className="btn-cancel-delete"
                  onClick={() => setShowConfirmDelete(false)}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  className="btn-confirm-delete"
                  onClick={async () => {
                    setShowConfirmDelete(false);
                    if (onDelete) {
                      await onDelete();
                    }
                  }}
                  id="btn-confirm-delete"
                  style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#ef4444', color: '#fff', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="detail-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {!isTerminal && (
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              {nextStage && (
                <button
                  className="btn-transition-primary"
                  onClick={onTransition}
                  id="btn-detail-transition"
                  style={{ flex: 1 }}
                >
                  Move to {STAGE_LABELS[nextStage]}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              )}
              <button
                className="btn-reject-outline"
                onClick={onReject}
                id="btn-detail-reject"
                style={{ flex: 1 }}
              >
                Reject Candidate
              </button>
            </div>
          )}

          {onDelete && !showConfirmDelete && (
            <button
              className="btn-delete-candidate"
              onClick={() => setShowConfirmDelete(true)}
              id="btn-detail-delete"
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                background: 'transparent',
                color: '#ef4444',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
              Delete Candidate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
