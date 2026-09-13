import React, { useState, useRef } from 'react';
import { PORTFOLIO_CATEGORIES } from '../../data/learningFeatures';

export default function PortfolioUpload({ onUpload, disabled = false }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('topology');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [labId, setLabId] = useState('');
  const [content, setContent] = useState('{}');
  const [error, setError] = useState(null);
  const [contentError, setContentError] = useState(null);

  const validateContent = (raw) => {
    try {
      JSON.parse(raw);
      setContentError(null);
      return true;
    } catch {
      setContentError('Content must be valid JSON.');
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!validateContent(content)) return;

    const parsedContent = JSON.parse(content);
    const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);

    onUpload({
      type,
      title: title.trim(),
      content: { ...parsedContent, description: description.trim() || undefined },
      tags: tagArray,
      labId: labId.trim() || null,
      status: 'draft'
    });

    setTitle('');
    setDescription('');
    setTags('');
    setLabId('');
    setContent('{}');
  };

  return (
    <form className="tech-card" onSubmit={handleSubmit} style={{ marginBottom: 'var(--space-4)' }}>
      <div style={{ color: 'var(--primary)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-3)', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: 'var(--text-sm)' }}>
        Add Artifact
      </div>
      {error && <div style={{ color: 'var(--error)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>{error}</div>}
      <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
        <div>
          <label style={{ color: 'var(--text)', fontSize: 'var(--text-sm)', display: 'block', marginBottom: 4 }}>Type</label>
          <select value={type} onChange={e => setType(e.target.value)} disabled={disabled} className="cmd-btn" style={{ width: '100%', padding: 'var(--space-2) var(--space-3)' }}>
            {PORTFOLIO_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ color: 'var(--text)', fontSize: 'var(--text-sm)', display: 'block', marginBottom: 4 }}>Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Artifact title" disabled={disabled} style={{ width: '100%', padding: 8, borderRadius: 4, background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }} />
        </div>
        <div>
          <label style={{ color: 'var(--text)', fontSize: 'var(--text-sm)', display: 'block', marginBottom: 4 }}>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description..." rows={2} disabled={disabled} style={{ width: '100%', padding: 8, borderRadius: 4, background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', resize: 'vertical' }} />
        </div>
        <div>
          <label style={{ color: 'var(--text)', fontSize: 'var(--text-sm)', display: 'block', marginBottom: 4 }}>Content (JSON)</label>
          <textarea value={content} onChange={e => { setContent(e.target.value); validateContent(e.target.value); }} placeholder='{"key": "value"}' rows={4} disabled={disabled} style={{ width: '100%', padding: 8, borderRadius: 4, background: 'var(--surface)', color: 'var(--text)', border: `1px solid ${contentError ? 'var(--error)' : 'var(--border)'}`, fontFamily: 'monospace', fontSize: 'var(--text-xs)', resize: 'vertical' }} />
          {contentError && <div style={{ color: 'var(--error)', fontSize: 'var(--text-xs)', marginTop: 4 }}>{contentError}</div>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <div>
            <label style={{ color: 'var(--text)', fontSize: 'var(--text-sm)', display: 'block', marginBottom: 4 }}>Tags (comma-separated)</label>
            <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="ospf, routing, lab-12" disabled={disabled} style={{ width: '100%', padding: 8, borderRadius: 4, background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }} />
          </div>
          <div>
            <label style={{ color: 'var(--text)', fontSize: 'var(--text-sm)', display: 'block', marginBottom: 4 }}>Related Lab ID</label>
            <input type="text" value={labId} onChange={e => setLabId(e.target.value)} placeholder="Optional" disabled={disabled} style={{ width: '100%', padding: 8, borderRadius: 4, background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }} />
          </div>
        </div>
        <button type="submit" className="cmd-btn primary" disabled={disabled || !title.trim()}>
          Save Artifact
        </button>
      </div>
    </form>
  );
}
