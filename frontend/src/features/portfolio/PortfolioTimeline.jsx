import React from 'react';
import { PORTFOLIO_CATEGORIES } from '../../data/learningFeatures';

const TYPE_COLORS = {
  topology: 'var(--cyan)',
  config: 'var(--primary)',
  pcap: 'var(--warning)',
  troubleshoot: 'var(--error)',
  incident: 'var(--error)',
  diagrams: 'var(--accent-soft)',
  research: 'var(--green)',
  capstone: 'var(--yellow)',
  interview: 'var(--cyan)',
  edr: 'var(--primary)',
};

export default function PortfolioTimeline({ artifacts }) {
  const sorted = [...artifacts].sort((a, b) => a.createdAt - b.createdAt);

  if (sorted.length === 0) {
    return (
      <div className="tech-card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No artifacts to display on the timeline.</div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', paddingLeft: 'var(--space-5)' }}>
      <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 2, background: 'var(--panel-border-subtle)' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {sorted.map(item => {
          const cat = PORTFOLIO_CATEGORIES.find(c => c.id === item.type);
          const color = TYPE_COLORS[item.type] || 'var(--primary)';
          return (
            <div key={item.id} style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: -21, top: 6, width: 12, height: 12, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
              <div className="tech-card" style={{ marginLeft: 'var(--space-2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-1)' }}>
                  <span style={{ color, fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {cat?.label || item.type}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                    {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div style={{ color: 'var(--text)', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--text-sm)' }}>{item.title}</div>
                {item.content?.description && (
                  <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: 4, lineHeight: 1.5 }}>{item.content.description}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
