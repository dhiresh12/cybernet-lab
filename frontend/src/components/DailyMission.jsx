import React, { useState, useEffect } from 'react';
import { DAILY_MISSIONS } from '../data/learningFeatures';
import { dailyMissionStorage } from '../core/storage';

export default function DailyMission({ onStartLab }) {
  const [mission, setMission] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    const dayIndex = new Date().getDate() % DAILY_MISSIONS.length;
    const today = DAILY_MISSIONS[dayIndex];
    setMission(today);
    const saved = dailyMissionStorage.get();
    if (saved?.date === new Date().toDateString() && saved?.missionId === today.id) {
      setCompleted(saved.completed);
      setSavedAt(saved.savedAt);
    }
  }, []);

  const handleComplete = () => {
    const record = { date: new Date().toDateString(), missionId: mission.id, completed: true, savedAt: new Date().toISOString() };
    dailyMissionStorage.set(record);
    setCompleted(true);
    setSavedAt(record.savedAt);
  };

  if (!mission) return null;

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ color: 'var(--cyan)', letterSpacing: '0.08em', fontSize: '0.8rem', marginBottom: 'var(--space-2)' }}>DAILY MISSION</div>
      <h1 style={{ color: 'var(--text)', margin: '0 0 var(--space-4)', fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-extrabold)' }}>
        {mission.topic}
      </h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <div className="tech-card">
          <div className="tech-label">Estimated Time</div>
          <div style={{ color: 'var(--text)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>{mission.estimatedTime} min</div>
        </div>
        <div className="tech-card">
          <div className="tech-label">Difficulty</div>
          <div style={{ color: 'var(--text)', textTransform: 'capitalize' }}>{mission.difficulty}</div>
        </div>
        <div className="tech-card">
          <div className="tech-label">Category</div>
          <div style={{ color: 'var(--text)' }}>{mission.category}</div>
        </div>
      </div>
      <div className="tech-card" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="tech-label">Required Tools</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
          {mission.tools.map(tool => (
            <span key={tool} style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid var(--panel-border-subtle)', padding: '4px 10px', borderRadius: 4, color: 'var(--primary)', fontSize: 'var(--text-sm)' }}>{tool}</span>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        {!completed ? (
          <button className="cmd-btn primary" onClick={handleComplete}>Mark Complete</button>
        ) : (
          <span style={{ color: 'var(--green)', alignSelf: 'center' }}>Completed {savedAt && `at ${new Date(savedAt).toLocaleTimeString()}`}</span>
        )}
        <button className="cmd-btn" onClick={() => onStartLab?.(null)}>Start Related Lab</button>
      </div>
    </div>
  );
}
