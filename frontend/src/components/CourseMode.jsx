import React, { useState } from 'react';
import { COURSE_PHASES } from '../data/learningFeatures';

export default function CourseMode({ lab, onStartLab }) {
  const [phase, setPhase] = useState(0);
  const [notes, setNotes] = useState('');
  const [completed, setCompleted] = useState({});

  const current = COURSE_PHASES[phase];
  const progress = Math.round(((phase + 1) / COURSE_PHASES.length) * 100);

  const handleComplete = () => {
    setCompleted(prev => ({ ...prev, [current.id]: true }));
    if (phase < COURSE_PHASES.length - 1) setPhase(prev => prev + 1);
  };

  const isPhaseDone = (ph) => completed[ph.id];

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ color: 'var(--cyan)', letterSpacing: '0.08em', fontSize: '0.8rem', marginBottom: 'var(--space-2)' }}>COURSE MODE</div>
      <h1 style={{ color: 'var(--text)', margin: '0 0 var(--space-4)', fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-extrabold)' }}>
        Guided Learning Path
      </h1>
      <div style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)', lineHeight: 1.6 }}>
        Progress through micro-learning, practical application, assessment, and project integration. Complete each phase before advancing.
      </div>
      <div className="health-bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} style={{ marginBottom: 'var(--space-4)' }}>
        <div className="health-bar-label"><span>Course Progress</span><span>{progress}%</span></div>
        <div className="health-bar-track"><div className="health-bar-fill primary" style={{ width: `${progress}%` }} /></div>
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        {COURSE_PHASES.map((ph, i) => (
          <button
            key={ph.id}
            className={`cmd-btn ${i === phase ? 'primary' : ''} ${isPhaseDone(ph) ? 'completed' : ''}`}
            onClick={() => setPhase(i)}
            disabled={i > phase && !isPhaseDone(COURSE_PHASES[i - 1])}
          >
            {ph.name} {isPhaseDone(ph) ? '✓' : ''}
          </button>
        ))}
      </div>
      <div className="tech-card" style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ color: 'var(--cyan)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-2)' }}>
          Phase {phase + 1}/{COURSE_PHASES.length}: {current.name}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>Duration: {current.duration}</div>
        <p style={{ color: 'var(--text)', lineHeight: 1.6, marginBottom: 'var(--space-3)' }}>{current.description}</p>
        {lab && <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>Lab: {lab.title}</p>}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Take notes for this phase..."
          style={{ width: '100%', marginBottom: 'var(--space-3)', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 6, padding: 10, fontFamily: 'var(--font-mono)', fontSize: '0.85em', resize: 'vertical' }}
        />
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          {!isPhaseDone(current) ? (
            <button className="cmd-btn primary" onClick={handleComplete} disabled={!notes.trim()}>Complete Phase</button>
          ) : (
            <span style={{ color: 'var(--green)' }}>Completed</span>
          )}
          {phase > 0 && <button className="cmd-btn" onClick={() => setPhase(prev => prev - 1)}>Back</button>}
          {phase < COURSE_PHASES.length - 1 && isPhaseDone(current) && (
            <button className="cmd-btn primary" onClick={() => setPhase(prev => prev + 1)}>Next Phase</button>
          )}
        </div>
      </div>
      {lab && <button className="cmd-btn" onClick={() => onStartLab?.(lab.id)}>Open Lab</button>}
    </div>
  );
}
