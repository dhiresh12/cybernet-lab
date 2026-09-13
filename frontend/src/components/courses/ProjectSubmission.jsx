import React, { useState } from 'react';
import { updateCourseProgress } from '../../services/courseService';

export default function ProjectSubmission({ courseId, stage, stageIndex, learnerId = 'default', onComplete, onBack }) {
  const [form, setForm] = useState({ title: '', description: '', deliverables: '', evidence: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.title.trim() || !form.description.trim() || !form.deliverables.trim()) {
      alert('Title, description, and deliverables are required.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await updateCourseProgress(courseId, learnerId, { stageIndex, completed: true, project: form });
      setSubmitted(true);
      onComplete?.(result);
    } catch (err) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 900, margin: '0 auto' }}>
      <button className="cmd-btn" onClick={onBack} style={{ marginBottom: 'var(--space-3)' }}>← Back to Course</button>
      <div style={{ color: 'var(--cyan)', letterSpacing: '0.08em', fontSize: '0.8rem', marginBottom: 'var(--space-1)' }}>CAPSTONE PROJECT</div>
      <h1 style={{ color: 'var(--text)', margin: '0 0 var(--space-3)', fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-extrabold)' }}>{stage?.title || 'Project Submission'}</h1>
      <div style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)', lineHeight: 1.6 }}>Submit your capstone deliverables. Include topology, configuration, verification, and design rationale.</div>

      <div className="tech-card" style={{ marginBottom: 'var(--space-3)' }}>
        <label style={{ display: 'block', color: 'var(--text)', marginBottom: 'var(--space-2)' }}>
          <div className="type-label" style={{ marginBottom: 'var(--space-1)' }}>Project Title</div>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="e.g. Multi-VLAN Campus Design"
            disabled={submitted}
            style={{ width: '100%', padding: 'var(--space-2)', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: '0.85em' }}
          />
        </label>
      </div>

      <div className="tech-card" style={{ marginBottom: 'var(--space-3)' }}>
        <label style={{ display: 'block', color: 'var(--text)', marginBottom: 'var(--space-2)' }}>
          <div className="type-label" style={{ marginBottom: 'var(--space-1)' }}>Description</div>
          <textarea
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={4}
            placeholder="Describe the project scope, objectives, and approach..."
            disabled={submitted}
            style={{ width: '100%', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 6, padding: 10, fontFamily: 'var(--font-mono)', fontSize: '0.85em', resize: 'vertical' }}
          />
        </label>
      </div>

      <div className="tech-card" style={{ marginBottom: 'var(--space-3)' }}>
        <label style={{ display: 'block', color: 'var(--text)', marginBottom: 'var(--space-2)' }}>
          <div className="type-label" style={{ marginBottom: 'var(--space-1)' }}>Deliverables</div>
          <textarea
            value={form.deliverables}
            onChange={(e) => updateField('deliverables', e.target.value)}
            rows={4}
            placeholder="Topology diagram, configs, verification output, design rationale..."
            disabled={submitted}
            style={{ width: '100%', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 6, padding: 10, fontFamily: 'var(--font-mono)', fontSize: '0.85em', resize: 'vertical' }}
          />
        </label>
      </div>

      <div className="tech-card" style={{ marginBottom: 'var(--space-4)' }}>
        <label style={{ display: 'block', color: 'var(--text)', marginBottom: 'var(--space-2)' }}>
          <div className="type-label" style={{ marginBottom: 'var(--space-1)' }}>Evidence / Results</div>
          <textarea
            value={form.evidence}
            onChange={(e) => updateField('evidence', e.target.value)}
            rows={4}
            placeholder="Verification output, test results, or supporting evidence..."
            disabled={submitted}
            style={{ width: '100%', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 6, padding: 10, fontFamily: 'var(--font-mono)', fontSize: '0.85em', resize: 'vertical' }}
          />
        </label>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        {!submitted ? (
          <button className="cmd-btn primary" onClick={handleSubmit} disabled={submitting}>Submit Project</button>
        ) : (
          <span style={{ color: 'var(--green)', fontWeight: 'var(--font-weight-semibold)' }}>Project submitted.</span>
        )}
        <button className="cmd-btn" onClick={onBack}>Cancel</button>
      </div>
    </div>
  );
}
