import React from 'react';

const PRIORITY_COLORS = {
  high: 'var(--red)',
  medium: 'var(--yellow)',
  low: 'var(--green)'
};

export default function Recommendations({ data, onBack, onStartSession, role }) {
  const recommendations = data?.recommendations || [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <h2 style={{ color: 'var(--text)', margin: 0, fontSize: 'var(--text-lg)' }}>Recommendations</h2>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="cmd-btn" onClick={onBack}>Back</button>
          {role && <button className="cmd-btn primary" onClick={() => onStartSession(role)}>Start Practice</button>}
        </div>
      </div>
      {data && (
        <div className="tech-card" style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ color: 'var(--text)', marginBottom: 'var(--space-2)' }}>
            Average Score: <strong style={{ color: data.averageScore >= 70 ? 'var(--green)' : data.averageScore >= 50 ? 'var(--yellow)' : 'var(--red)' }}>{data.averageScore}%</strong>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
            Total Sessions: {data.totalSessions}
          </div>
        </div>
      )}
      {recommendations.length === 0 ? (
        <div className="tech-card">
          <div style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>No recommendations yet. Complete an interview session to get personalized suggestions.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {recommendations.map((rec, idx) => (
            <div key={idx} className="tech-card">
              <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                <div style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: PRIORITY_COLORS[rec.priority] || 'var(--text-muted)',
                  marginTop: 6,
                  flexShrink: 0
                }} />
                <div style={{ color: 'var(--text)', lineHeight: 1.6 }}>{rec.text}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
