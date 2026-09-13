import React from 'react';

function MetricCard({ title, value, unit, status }) {
  const color = status === 'failed' || status === 'error' ? 'var(--error)' :
    status === 'running' || status === 'pending' ? 'var(--warning)' :
    'var(--success)';
  return (
    <div className="stat-card" style={{ borderColor: color }}>
      <div style={{ fontSize: '1.4em', fontWeight: 'bold', color }}>{value}{unit && <span style={{ fontSize: '0.6em', color: 'var(--text-dim)' }}> {unit}</span>}</div>
      <div style={{ color: 'var(--text-dim)', fontSize: '0.8em' }}>{title}</div>
    </div>
  );
}

function DetailList({ title, items, maxItems = 10 }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginTop: '12px' }}>
      <div style={{ color: 'var(--text-dim)', fontSize: '0.8em', marginBottom: '4px' }}>{title} ({items.length})</div>
      <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
        {items.slice(0, maxItems).map((item, idx) => (
          <div key={idx} style={{ fontSize: '0.75em', color: 'var(--text-muted)', padding: '2px 0', borderBottom: '1px solid var(--panel-border-subtle)' }}>
            {typeof item === 'string' ? item : `${item.file || ''}${item.line ? `:${item.line}` : ''}${item.type ? ` - ${item.type}` : ''}`}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AccessibilityAudit({ data }) {
  if (!data) {
    return <div style={{ color: 'var(--text-dim)', padding: '24px', textAlign: 'center' }}>No accessibility data available. Run QA check to populate.</div>;
  }

  return (
    <div className="panel">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <MetricCard title="Status" value={data.passed ? 'PASS' : 'FAIL'} status={data.passed ? 'passed' : 'failed'} />
        <MetricCard title="Score" value={data.score || 0} status={data.score >= 70 ? 'passed' : 'failed'} />
        <MetricCard title="Issues" value={data.totalIssues || 0} status={data.totalIssues > 0 ? 'failed' : 'passed'} />
      </div>
      <DetailList title="Contrast Issues" items={data.details?.contrast} />
      <DetailList title="ARIA Issues" items={data.details?.aria} />
      <DetailList title="Keyboard Issues" items={data.details?.keyboard} />
    </div>
  );
}
