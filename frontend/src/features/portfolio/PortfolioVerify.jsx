import React, { useState } from 'react';

const VERIFICATION_CRITERIA = [
  { id: 'completeness', label: 'Completeness', description: 'All required fields are filled' },
  { id: 'accuracy', label: 'Accuracy', description: 'Content is technically correct' },
  { id: 'clarity', label: 'Clarity', description: 'Well-structured and readable' },
  { id: 'relevance', label: 'Relevance', description: 'Relevant to stated learning objectives' },
];

export default function PortfolioVerify({ artifact, onClose, onVerify }) {
  const [results, setResults] = useState(() => {
    const initial = {};
    VERIFICATION_CRITERIA.forEach(c => { initial[c.id] = false; });
    return initial;
  });
  const [notes, setNotes] = useState('');
  const [verdict, setVerdict] = useState(null);

  const allPassed = VERIFICATION_CRITERIA.every(c => results[c.id]);
  const passedCount = VERIFICATION_CRITERIA.filter(c => results[c.id]).length;

  const handleSubmit = () => {
    const passed = allPassed;
    const verificationRecord = {
      criteria: results,
      notes,
      verdict: passed ? 'approved' : 'rejected',
      verifiedAt: Date.now()
    };
    setVerdict(verificationRecord.verdict);
    onVerify?.(artifact.id, verificationRecord);
  };

  if (!artifact) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 24 }} onClick={onClose} role="dialog" aria-modal="true" aria-label="Verify artifact">
      <div className="tech-card" style={{ maxWidth: 560, width: '100%' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <div style={{ color: 'var(--primary)', fontWeight: 'var(--font-weight-semibold)', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: 'var(--text-sm)' }}>Verification</div>
          <button className="cmd-btn" onClick={onClose} aria-label="Close verification dialog">Close</button>
        </div>
        <div style={{ color: 'var(--text)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
          Verifying: <strong>{artifact.title}</strong>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
          {VERIFICATION_CRITERIA.map(criterion => (
            <label key={criterion.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', color: 'var(--text)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={Boolean(results[criterion.id])}
                onChange={e => setResults(prev => ({ ...prev, [criterion.id]: e.target.checked }))}
                style={{ marginTop: 2 }}
              />
              <div>
                <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--text-sm)' }}>{criterion.label}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>{criterion.description}</div>
              </div>
            </label>
          ))}
        </div>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label style={{ color: 'var(--text)', fontSize: 'var(--text-sm)', display: 'block', marginBottom: 4 }}>Verification Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add verification notes..." rows={3} style={{ width: '100%', padding: 8, borderRadius: 4, background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', resize: 'vertical' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Progress: {passedCount}/{VERIFICATION_CRITERIA.length} criteria met</span>
          {verdict === 'approved' && <span style={{ color: 'var(--success)', fontSize: 'var(--text-sm)' }}>Approved</span>}
          {verdict === 'rejected' && <span style={{ color: 'var(--error)', fontSize: 'var(--text-sm)' }}>Rejected</span>}
        </div>
        <button className="cmd-btn primary" onClick={handleSubmit} disabled={!notes.trim()}>
          Submit Verification
        </button>
      </div>
    </div>
  );
}
