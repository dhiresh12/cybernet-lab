import React, { useState, useEffect } from 'react';
import { TROUBLESHOOTING_STEPS } from '../data/learningFeatures';
import { troubleshootingStorage } from '../core/storage';

export default function TroubleshootingCoach({ lab, onStartLab }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [entries, setEntries] = useState({});
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    if (lab) {
      const existing = troubleshootingStorage.forLab(lab.id);
      if (existing) {
        setEntries(existing.entries || {});
        setCurrentStep(existing.currentStep || 0);
        setSavedAt(existing.savedAt);
      }
    }
  }, [lab]);

  const handleInput = (value) => {
    const stepId = TROUBLESHOOTING_STEPS[currentStep].id;
    setEntries(prev => {
      const next = { ...prev, [stepId]: value };
      troubleshootingStorage.save(lab?.id, { entries: next, currentStep, savedAt: new Date().toISOString() });
      setSavedAt(new Date().toISOString());
      return next;
    });
  };

  const handleNext = () => {
    if (currentStep < TROUBLESHOOTING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setEntries({});
    setCurrentStep(0);
    troubleshootingStorage.clear(lab?.id);
    setSavedAt(null);
  };

  const step = TROUBLESHOOTING_STEPS[currentStep];
  const progress = Math.round(((currentStep + 1) / TROUBLESHOOTING_STEPS.length) * 100);

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ color: 'var(--cyan)', letterSpacing: '0.08em', fontSize: '0.8rem', marginBottom: 'var(--space-2)' }}>TROUBLESHOOTING COACH</div>
      <h1 style={{ color: 'var(--text)', margin: '0 0 var(--space-4)', fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-extrabold)' }}>
        Structured Reasoning Guide
      </h1>
      <div style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)', lineHeight: 1.6 }}>
        Work through each phase in order. Do not skip ahead. The goal is to build repeatable reasoning, not to reach the answer quickly.
      </div>
      <div className="health-bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} style={{ marginBottom: 'var(--space-4)' }}>
        <div className="health-bar-label"><span>Progress</span><span>{progress}%</span></div>
        <div className="health-bar-track"><div className="health-bar-fill primary" style={{ width: `${progress}%` }} /></div>
      </div>
      <div className="tech-card" style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ color: 'var(--cyan)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-2)' }}>
          Phase {currentStep + 1}/{TROUBLESHOOTING_STEPS.length}: {step.label}
        </div>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 'var(--space-3)' }}>{step.prompt}</p>
        <textarea
          value={entries[step.id] || ''}
          onChange={(e) => handleInput(e.target.value)}
          rows={4}
          placeholder="Type your response here..."
          style={{ width: '100%', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 6, padding: 10, fontFamily: 'var(--font-mono)', fontSize: '0.85em', resize: 'vertical' }}
        />
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-3)', flexWrap: 'wrap' }}>
          <button className="cmd-btn" onClick={handleBack} disabled={currentStep === 0}>Back</button>
          {currentStep < TROUBLESHOOTING_STEPS.length - 1 && (
            <button className="cmd-btn primary" onClick={handleNext} disabled={!entries[step.id]?.trim()}>Next Phase</button>
          )}
          <button className="cmd-btn" onClick={handleReset}>Reset</button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
        {TROUBLESHOOTING_STEPS.map((s, i) => (
          <button
            key={s.id}
            className={`cmd-btn ${i === currentStep ? 'primary' : ''}`}
            onClick={() => setCurrentStep(i)}
            aria-label={`Phase ${i + 1}: ${s.label}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
      {savedAt && <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>Last saved: {new Date(savedAt).toLocaleString()}</p>}
      {lab && <button className="cmd-btn" style={{ marginTop: 'var(--space-4)' }} onClick={() => onStartLab?.(lab.id)}>Open Related Lab</button>}
    </div>
  );
}
