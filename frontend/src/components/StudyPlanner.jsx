import React, { useState, useEffect, useCallback } from 'react';
import { STUDY_MODES, STUDY_BLOCKS } from '../data/learningFeatures';
import { studyPlannerStorage } from '../core/storage';

export default function StudyPlanner({ onStartLab }) {
  const [mode, setMode] = useState(STUDY_MODES[0]);
  const [activeBlock, setActiveBlock] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [savedPlan, setSavedPlan] = useState(null);

  useEffect(() => {
    const saved = studyPlannerStorage.get();
    if (saved?.modeId) {
      const found = STUDY_MODES.find(m => m.id === saved.modeId);
      if (found) setMode(found);
    }
    setSavedPlan(saved);
  }, []);

  const startBlock = useCallback((blockId) => {
    const block = STUDY_BLOCKS.find(b => b.id === blockId);
    if (!block) return;
    setActiveBlock(block);
    setSecondsLeft(block.duration * 60);
    setIsRunning(true);
    studyPlannerStorage.set({ modeId: mode.id, activeBlock: block.id, startedAt: new Date().toISOString() });
    setSavedPlan({ modeId: mode.id, activeBlock: block.id, startedAt: new Date().toISOString() });
  }, [mode.id]);

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning, secondsLeft]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleModeChange = (modeId) => {
    const found = STUDY_MODES.find(m => m.id === modeId);
    if (found) {
      setMode(found);
      setActiveBlock(null);
      setIsRunning(false);
      setSecondsLeft(0);
      studyPlannerStorage.set({ modeId: found.id, activeBlock: null, startedAt: null });
    }
  };

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ color: 'var(--cyan)', letterSpacing: '0.08em', fontSize: '0.8rem', marginBottom: 'var(--space-2)' }}>STUDY PLANNER</div>
      <h1 style={{ color: 'var(--text)', margin: '0 0 var(--space-4)', fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-extrabold)' }}>
        Structured Study Sessions
      </h1>
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        {STUDY_MODES.map(m => (
          <button key={m.id} className={`cmd-btn ${m.id === mode.id ? 'primary' : ''}`} onClick={() => handleModeChange(m.id)}>
            {m.name} ({m.minutes}m)
          </button>
        ))}
      </div>
      <div className="tech-card" style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ color: 'var(--text)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-2)' }}>
          Blocks for {mode.name}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
          {mode.blocks.map(blockId => {
            const block = STUDY_BLOCKS.find(b => b.id === blockId);
            if (!block) return null;
            const isActive = activeBlock?.id === block.id;
            return (
              <div key={block.id} className={`tech-card ${isActive ? 'selected' : ''}`} style={{ border: isActive ? '1px solid var(--primary)' : undefined }}>
                <div style={{ color: 'var(--cyan)', fontWeight: 'var(--font-weight-bold)', marginBottom: 4 }}>Block {block.id}: {block.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 4 }}>{block.duration} min</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>{block.activity}</div>
                {isActive ? (
                  <div style={{ color: 'var(--green)', fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-lg)' }}>{formatTime(secondsLeft)}</div>
                ) : (
                  <button className="cmd-btn" onClick={() => startBlock(block.id)}>Start Block</button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {savedPlan && <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>Last plan: {savedPlan.modeId} · Block {savedPlan.activeBlock || '—'}</p>}
      <button className="cmd-btn" style={{ marginTop: 'var(--space-4)' }} onClick={() => onStartLab?.(null)}>Start Focused Lab</button>
    </div>
  );
}
