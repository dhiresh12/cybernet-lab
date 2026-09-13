import React, { useState } from 'react';

const VISIBILITY_OPTIONS = [
  { id: 'private', label: 'Private', description: 'Only visible to you' },
  { id: 'reviewer', label: 'Reviewer only', description: 'Visible to assigned reviewers' },
  { id: 'public', label: 'Public link', description: 'Anyone with the link can view' },
];

export default function PortfolioShare({ artifact, onClose, onUpdate }) {
  const [visibility, setVisibility] = useState(artifact?.shareSettings?.visibility || 'private');
  const [reviewerNotes, setReviewerNotes] = useState(artifact?.shareSettings?.reviewerNotes || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onUpdate?.(artifact.id, {
      shareSettings: {
        visibility,
        reviewerNotes,
        sharedAt: visibility !== 'private' ? Date.now() : null
      },
      status: visibility === 'private' ? 'draft' : 'shared'
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!artifact) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 24 }} onClick={onClose} role="dialog" aria-modal="true" aria-label="Share settings">
      <div className="tech-card" style={{ maxWidth: 480, width: '100%' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <div style={{ color: 'var(--primary)', fontWeight: 'var(--font-weight-semibold)', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: 'var(--text-sm)' }}>Share Settings</div>
          <button className="cmd-btn" onClick={onClose} aria-label="Close share dialog">Close</button>
        </div>
        <div style={{ color: 'var(--text)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
          Sharing: <strong>{artifact.title}</strong>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          {VISIBILITY_OPTIONS.map(opt => (
            <button
              key={opt.id}
              className={`cmd-btn ${visibility === opt.id ? 'primary' : ''}`}
              onClick={() => setVisibility(opt.id)}
              style={{ justifyContent: 'flex-start', textAlign: 'left' }}
              aria-pressed={visibility === opt.id}
            >
              <div>
                <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>{opt.label}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>{opt.description}</div>
              </div>
            </button>
          ))}
        </div>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label style={{ color: 'var(--text)', fontSize: 'var(--text-sm)', display: 'block', marginBottom: 4 }}>Reviewer Notes</label>
          <textarea value={reviewerNotes} onChange={e => setReviewerNotes(e.target.value)} placeholder="Notes for reviewers..." rows={3} style={{ width: '100%', padding: 8, borderRadius: 4, background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', resize: 'vertical' }} />
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <button className="cmd-btn primary" onClick={handleSave}>Save Share Settings</button>
          {saved && <span style={{ color: 'var(--success)', fontSize: 'var(--text-sm)' }}>Saved</span>}
        </div>
      </div>
    </div>
  );
}
