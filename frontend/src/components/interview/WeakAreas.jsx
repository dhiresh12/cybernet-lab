import React from 'react';

export default function WeakAreas({ data, onBack, onStartSession, role }) {
  const weakAreas = data?.weakAreas || [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <h2 style={{ color: 'var(--text)', margin: 0, fontSize: 'var(--text-lg)' }}>Weak Areas</h2>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="cmd-btn" onClick={onBack}>Back</button>
          {role && <button className="cmd-btn primary" onClick={() => onStartSession(role)}>Practice</button>}
        </div>
      </div>
      {weakAreas.length === 0 ? (
        <div className="tech-card">
          <div style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>No weak areas detected yet. Complete more interview sessions to identify improvement areas.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {weakAreas.map((area, idx) => (
            <div key={idx} className="tech-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                <div>
                  <div style={{ color: 'var(--warning)', fontWeight: 'var(--font-weight-bold)' }}>{area.topic}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                    Detected in {area.count} session{area.count === 1 ? '' : 's'}
                  </div>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                  {area.lastSeen ? new Date(area.lastSeen).toLocaleDateString() : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
