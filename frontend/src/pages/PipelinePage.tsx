import { useState, useCallback } from 'react';
import { PipelineBoard } from '../components/pipeline/PipelineBoard';
import { CandidateDetailPanel } from '../components/candidate/CandidateDetailPanel';
import { AddCandidateModal } from '../components/candidate/AddCandidateModal';
import { StatsBar } from '../components/pipeline/StatsBar';
import { useCandidates } from '../hooks/useCandidates';
import { candidatesApi } from '../services/api/candidates';

interface PipelinePageProps {
  selectedCandidateId: number | null;
  onSelectCandidate: (id: number | null) => void;
}

export function PipelinePage({ selectedCandidateId, onSelectCandidate }: PipelinePageProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingCandidate, setAddingCandidate] = useState(false);
  const { candidates, loading, error, refetch, removeCandidate } = useCandidates();

  const handleAddCandidate = async (name: string) => {
    setAddingCandidate(true);
    try {
      await candidatesApi.create({ name });
      setShowAddModal(false);
      refetch();
    } catch (err) {
      console.error('Failed to add candidate:', err);
    } finally {
      setAddingCandidate(false);
    }
  };

  const handleTransition = useCallback(async (id: number) => {
    const candidate = candidates.find(c => c.id === id);
    if (!candidate) return;

    const nextStage =
      candidate.current_stage === 'APPLIED' ? 'SCREENING' :
      candidate.current_stage === 'SCREENING' ? 'INTERVIEW' :
      candidate.current_stage === 'INTERVIEW' ? 'OFFER' :
      candidate.current_stage === 'OFFER' ? 'HIRED' : null;

    if (!nextStage) return;

    try {
      await candidatesApi.transition(id, nextStage);
      refetch(false);
    } catch (err) {
      console.error('Transition failed:', err);
    }
  }, [candidates, refetch]);

  const handleReject = useCallback(async (id: number) => {
    try {
      await candidatesApi.reject(id);
      refetch(false);
    } catch (err) {
      console.error('Reject failed:', err);
    }
  }, [refetch]);

  const handleDelete = useCallback(async (id: number) => {
    onSelectCandidate(null);
    removeCandidate(id);
    try {
      await candidatesApi.delete(id);
      refetch(false);
    } catch (err) {
      console.error('Delete failed:', err);
      refetch(false);
    }
  }, [onSelectCandidate, removeCandidate, refetch]);

  return (
    <>
      {/* Top Header */}
      <header className="top-header">
        <div className="header-left">
          <h1 className="header-title">Hiring Pipeline</h1>
          <p className="header-subtitle">Manage candidates and move them through the hiring process</p>
        </div>
        <div className="header-right">
          <button
            className="btn-add-candidate"
            onClick={() => setShowAddModal(true)}
            id="btn-add-candidate"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Candidate
          </button>
        </div>
      </header>

      {/* Page Content */}
      <div className="page-content">
        <StatsBar candidates={candidates} loading={loading} />

        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <span>Loading candidates...</span>
          </div>
        ) : error ? (
          <div className="error-state">
            <span>{error}</span>
          </div>
        ) : (
          <PipelineBoard
            candidates={candidates}
            selectedCandidateId={selectedCandidateId}
            onCandidateClick={onSelectCandidate}
            onTransition={handleTransition}
            onReject={handleReject}
          />
        )}
      </div>

      {/* Detail Panel */}
      {selectedCandidateId !== null && (
        <CandidateDetailPanel
          candidateId={selectedCandidateId}
          onClose={() => onSelectCandidate(null)}
          onTransition={() => { handleTransition(selectedCandidateId); }}
          onReject={() => { handleReject(selectedCandidateId); onSelectCandidate(null); }}
          onDelete={() => { handleDelete(selectedCandidateId); }}
        />
      )}

      {/* Add Candidate Modal */}
      {showAddModal && (
        <AddCandidateModal
          onSubmit={handleAddCandidate}
          onClose={() => setShowAddModal(false)}
          loading={addingCandidate}
        />
      )}
    </>
  );
}