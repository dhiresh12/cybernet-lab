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

export default function PerformanceMetrics({ data }) {
  if (!data) {
    return <div style={{ color: 'var(--text-dim)', padding: '24px', textAlign: 'center' }}>No performance data available. Run QA check to populate.</div>;
  }

  return (
    <div className="panel">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <MetricCard title="Status" value={data.passed ? 'PASS' : 'FAIL'} status={data.passed ? 'passed' : 'failed'} />
        <MetricCard title="Score" value={data.score || 0} status={data.score >= 70 ? 'passed' : 'failed'} />
        <MetricCard title="Dist Size" value={data.bundleSizes?.sizeKB || 0} unit="KB" status="passed" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '0.85em' }}>
        <div><span style={{ color: 'var(--text-dim)' }}>rAF Loop:</span> <span style={{ color: data.rafLoop?.hasRaf ? 'var(--success)' : 'var(--error)' }}>{data.rafLoop?.hasRaf ? 'Detected' : 'Missing'}</span></div>
        <div><span style={{ color: 'var(--text-dim)' }}>Pause-when-hidden:</span> <span style={{ color: data.rafLoop?.hasVisibilityPause ? 'var(--success)' : 'var(--error)' }}>{data.rafLoop?.hasVisibilityPause ? 'Detected' : 'Missing'}</span></div>
        <div><span style={{ color: 'var(--text-dim)' }}>Code Splitting:</span> <span style={{ color: data.bundleSizes?.hasCodeSplitting ? 'var(--success)' : 'var(--error)' }}>{data.bundleSizes?.hasCodeSplitting ? 'Enabled' : 'Disabled'}</span></div>
        <div><span style={{ color: 'var(--text-dim)' }}>Lazy Loading:</span> <span style={{ color: data.bundleSizes?.hasLazyLoading ? 'var(--success)' : 'var(--error)' }}>{data.bundleSizes?.hasLazyLoading ? 'Enabled' : 'Disabled'}</span></div>
        <div><span style={{ color: 'var(--text-dim)' }}>Reduced Motion:</span> <span style={{ color: data.reducedMotion?.supported ? 'var(--success)' : 'var(--error)' }}>{data.reducedMotion?.supported ? 'Supported' : 'Missing'}</span></div>
      </div>
    </div>
  );
}
