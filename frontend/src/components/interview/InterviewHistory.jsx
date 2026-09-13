import React from 'react';

const ROLE_LABELS = {
  'noc': 'NOC',
  'network-engineer': 'Network Engineer',
  'network-security': 'Network Security',
  'soc': 'SOC',
  'ccna': 'CCNA',
  'ccnp': 'CCNP'
};

export default function InterviewHistory({ history, onBack, onStartSession, role }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <h2 style={{ color: 'var(--text)', margin: 0, fontSize: 'var(--text-lg)' }}>Interview History</h2>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="cmd-btn" onClick={onBack}>Back</button>
          {role && <button className="cmd-btn primary" onClick={() => onStartSession(role)}>New Session</button>}
        </div>
      </div>
      {history.length === 0 ? (
        <div className="tech-card">
          <div style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>No interview sessions yet. Start your first session to build your history.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {history.map(item => (
            <div key={item.id} className="tech-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                <div>
                  <div style={{ color: 'var(--accent-soft)', fontWeight: 'var(--font-weight-bold)' }}>
                    {ROLE_LABELS[item.role] || item.role}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                    {new Date(item.completedAt).toLocaleString()}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: item.score >= 70 ? 'var(--green)' : 'var(--yellow)', fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-lg)' }}>
                    {item.score}%
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                    {item.answerCount} answers
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
