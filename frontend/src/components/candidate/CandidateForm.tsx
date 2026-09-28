import { useState } from 'react';

interface CandidateFormProps {
  onSubmit: (name: string) => void;
  loading?: boolean;
}

export function CandidateForm({ onSubmit, loading }: CandidateFormProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
      setName('');
    }
  };

  return (
    <form className="candidate-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter candidate name..."
        disabled={loading}
      />
      <button type="submit" disabled={loading || !name.trim()}>
        {loading ? 'Adding...' : 'Add Candidate'}
      </button>
    </form>
  );
}