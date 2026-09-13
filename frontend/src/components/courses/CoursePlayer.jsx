import React, { useState, useEffect } from 'react';
import { updateCourseProgress } from '../../services/courseService';

export default function CoursePlayer({ courseId, stage, stageIndex, learnerId = 'default', onComplete, onBack }) {
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNotes('');
    setSubmitted(false);
  }, [stage?.id]);

  async function handleSubmit(completed) {
    setSaving(true);
    try {
      const result = await updateCourseProgress(courseId, learnerId, { stageIndex, completed });
      setSubmitted(true);
      onComplete?.(result);
    } catch (err) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  if (!stage) {
    return (
      <div style={{ padding: 'var(--space-6)', maxWidth: 900, margin: '0 auto' }}>
        <div className="tech-card">
          <div style={{ color: 'var(--text-muted)' }}>No stage selected.</div>
          <button className="cmd-btn" onClick={onBack}>Back to Course</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 900, margin: '0 auto' }}>
      <button className="cmd-btn" onClick={onBack} style={{ marginBottom: 'var(--space-3)' }}>← Back to Course</button>
      <div style={{ color: 'var(--cyan)', letterSpacing: '0.08em', fontSize: '0.8rem', marginBottom: 'var(--space-1)' }}>STAGE {stageIndex + 1} · {stage.type?.toUpperCase()}</div>
      <h1 style={{ color: 'var(--text)', margin: '0 0 var(--space-3)', fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-extrabold)' }}>{stage.title}</h1>
      <div style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)', lineHeight: 1.6 }}>{stage.description || 'Complete the activity below and submit when ready.'}</div>

      <div className="tech-card" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="type-label" style={{ marginBottom: 'var(--space-2)' }}>Activity</div>
        <div style={{ color: 'var(--text)', lineHeight: 1.7 }}>
          {stage.type === 'theory' && (
            <div>
              <p>Review the micro-learning content for this stage. Focus on the key concepts and take notes.</p>
              <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--surface)', borderRadius: 6, border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--cyan)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-1)' }}>Key Concepts</div>
                <ul style={{ paddingLeft: 20, color: 'var(--text-muted)' }}>
                  <li>Understand the core terminology and protocol behavior.</li>
                  <li>Identify the layer or function in the OSI/TCP-IP model.</li>
                  <li>Map the concept to a real network scenario.</li>
                </ul>
              </div>
            </div>
          )}
          {stage.type === 'practical' && (
            <div>
              <p>Perform the practical exercise in the lab environment. Verify each step before moving on.</p>
              <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--surface)', borderRadius: 6, border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--cyan)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-1)' }}>Verification Checklist</div>
                <ul style={{ paddingLeft: 20, color: 'var(--text-muted)' }}>
                  <li>Run show/verify commands to confirm expected state.</li>
                  <li>Document any unexpected output.</li>
                  <li>Use the troubleshooting coach if a step fails.</li>
                </ul>
              </div>
            </div>
          )}
          {stage.type === 'assessment' && (
            <div>
              <p>Complete the assessment for this stage. Answer all questions and pass the verification.</p>
              <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--surface)', borderRadius: 6, border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--cyan)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-1)' }}>Assessment Criteria</div>
                <ul style={{ paddingLeft: 20, color: 'var(--text-muted)' }}>
                  <li>Accuracy: correct configuration or answer.</li>
                  <li>Completeness: all required steps included.</li>
                  <li>Efficiency: minimal changes to achieve the goal.</li>
                </ul>
              </div>
            </div>
          )}
          {stage.type === 'project' && (
            <div>
              <p>Integrate multiple skills into a capstone deliverable. Document your design decisions and results.</p>
              <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--surface)', borderRadius: 6, border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--cyan)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-1)' }}>Project Deliverables</div>
                <ul style={{ paddingLeft: 20, color: 'var(--text-muted)' }}>
                  <li>Topology diagram with labeled interfaces.</li>
                  <li>Configuration files with comments.</li>
                  <li>Verification output and pass/fail results.</li>
                  <li>Brief explanation of design choices.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="tech-card" style={{ marginBottom: 'var(--space-4)' }}>
        <label style={{ display: 'block', color: 'var(--text)', marginBottom: 'var(--space-2)' }}>
          <div className="type-label" style={{ marginBottom: 'var(--space-1)' }}>Notes</div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            placeholder="Document your work, findings, or reflections..."
            style={{ width: '100%', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 6, padding: 10, fontFamily: 'var(--font-mono)', fontSize: '0.85em', resize: 'vertical' }}
          />
        </label>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        {!submitted ? (
          <button className="cmd-btn primary" onClick={() => handleSubmit(true)} disabled={saving || !notes.trim()}>
            {saving ? 'Submitting...' : 'Submit Stage'}
          </button>
        ) : (
          <span style={{ color: 'var(--green)', fontWeight: 'var(--font-weight-semibold)' }}>Stage submitted.</span>
        )}
        <button className="cmd-btn" onClick={onBack}>Cancel</button>
      </div>
    </div>
  );
}
