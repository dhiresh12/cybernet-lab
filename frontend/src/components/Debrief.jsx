import React, { useState, useEffect } from 'react';
import { DEBRIEF_QUESTIONS } from '../data/learningFeatures';
import { debriefStorage } from '../core/storage';

export default function Debrief({ lab, onStartLab }) {
  const [answers, setAnswers] = useState({});
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    if (lab) {
      const existing = debriefStorage.forLab(lab.id);
      if (existing) {
        setAnswers(existing.answers || {});
        setSavedAt(existing.savedAt);
      }
    }
  }, [lab]);

  const handleAnswer = (id, value) => {
    setAnswers(prev => {
      const next = { ...prev, [id]: value };
      debriefStorage.save(lab?.id, { answers: next, savedAt: new Date().toISOString() });
      setSavedAt(new Date().toISOString());
      return next;
    });
  };

  const completionCount = DEBRIEF_QUESTIONS.filter(q => answers[q.id]?.trim()).length;
  const completionPercent = Math.round((completionCount / DEBRIEF_QUESTIONS.length) * 100);

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ color: 'var(--cyan)', letterSpacing: '0.08em', fontSize: '0.8rem', marginBottom: 'var(--space-2)' }}>DEBRIEF</div>
      <h1 style={{ color: 'var(--text)', margin: '0 0 var(--space-4)', fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-extrabold)' }}>
        Post-Lab Reflection
      </h1>
      <div className="health-bar" role="progressbar" aria-valuenow={completionPercent} aria-valuemin={0} aria-valuemax={100} style={{ marginBottom: 'var(--space-4)' }}>
        <div className="health-bar-label"><span>Reflection</span><span>{completionPercent}%</span></div>
        <div className="health-bar-track"><div className="health-bar-fill primary" style={{ width: `${completionPercent}%` }} /></div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {DEBRIEF_QUESTIONS.map(q => (
          <div key={q.id} className="tech-card">
            <div style={{ color: 'var(--text)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-2)' }}>{q.question}</div>
            <textarea
              value={answers[q.id] || ''}
              onChange={(e) => handleAnswer(q.id, e.target.value)}
              rows={3}
              placeholder="Reflect honestly..."
              style={{ width: '100%', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 6, padding: 10, fontFamily: 'var(--font-mono)', fontSize: '0.85em', resize: 'vertical' }}
            />
          </div>
        ))}
      </div>
      {savedAt && <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-4)', fontSize: 'var(--text-xs)' }}>Last saved: {new Date(savedAt).toLocaleString()}</p>}
      {lab && <button className="cmd-btn" style={{ marginTop: 'var(--space-4)' }} onClick={() => onStartLab?.(lab.id)}>Review Lab</button>}
    </div>
  );
}
