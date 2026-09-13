import React from 'react';

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'var(--text-muted)', icon: '○' },
  submitted: { label: 'Submitted', color: 'var(--warning)', icon: '◐' },
  verified: { label: 'Verified', color: 'var(--success)', icon: '●' },
  shared: { label: 'Shared', color: 'var(--primary)', icon: '◉' },
};

const TYPE_LABELS = {
  topology: 'Topology Design',
  config: 'Configuration File',
  pcap: 'PCAP Analysis',
  troubleshoot: 'Troubleshooting Report',
  incident: 'Incident Report',
  diagrams: 'Network Diagram',
  research: 'Research Experiment',
  capstone: 'Capstone Project',
  interview: 'Interview Explanation',
  edr: 'Engineering Decision Record',
};

export default function PortfolioItem({ item, onRemove, onVerify, onShare, onExport, readOnly = false }) {
  const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.draft;
  const typeLabel = TYPE_LABELS[item.type] || item.type || 'Artifact';

  return (
    <div className="tech-card" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
            <span style={{ color: status.color, fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {status.icon} {status.label}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>{typeLabel}</span>
          </div>
          <div style={{ color: 'var(--text)', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>
            {item.title}
          </div>
          {item.content?.description && (
            <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.6, marginBottom: 'var(--space-2)' }}>
              {item.content.description}
            </div>
          )}
          {item.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap', marginBottom: 'var(--space-2)' }}>
              {item.tags.map(tag => (
                <span key={tag} style={{ fontSize: 'var(--text-xs)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', background: 'rgba(0,229,255,0.08)', color: 'var(--cyan)', border: '1px solid rgba(0,229,255,0.2)' }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
          {item.labId && (
            <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
              Lab: {item.labId}
            </div>
          )}
          <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-1)' }}>
            {new Date(item.createdAt).toLocaleDateString()} {item.updatedAt && item.updatedAt !== item.createdAt && `· Updated ${new Date(item.updatedAt).toLocaleDateString()}`}
          </div>
        </div>
        {!readOnly && (
          <div style={{ display: 'flex', gap: 'var(--space-1)', flexDirection: 'column' }}>
            {item.status !== 'verified' && onVerify && (
              <button className="cmd-btn" onClick={() => onVerify(item)} style={{ fontSize: '0.65em' }}>Verify</button>
            )}
            {onShare && <button className="cmd-btn" onClick={() => onShare(item)} style={{ fontSize: '0.65em' }}>Share</button>}
            {onExport && <button className="cmd-btn" onClick={() => onExport(item)} style={{ fontSize: '0.65em' }}>Export</button>}
            <button className="cmd-btn danger" onClick={() => onRemove(item.id)} style={{ fontSize: '0.65em' }}>Remove</button>
          </div>
        )}
      </div>
    </div>
  );
}
