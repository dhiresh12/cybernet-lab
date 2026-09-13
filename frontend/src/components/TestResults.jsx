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

export default function TestResults({ data }) {
  if (!data) {
    return <div style={{ color: 'var(--text-dim)', padding: '24px', textAlign: 'center' }}>No test results available. Run QA check to populate.</div>;
  }

  return (
    <div className="panel">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <MetricCard title="Total Tests" value={data.total || 0} status={data.total > 0 ? 'passed' : 'pending'} />
        <MetricCard title="Passed" value={data.passed || 0} status="passed" />
        <MetricCard title="Failed" value={data.failed || 0} status={data.failed > 0 ? 'failed' : 'passed'} />
        <MetricCard title="Suites" value={data.suites || 0} status="passed" />
        <MetricCard title="Duration" value={data.duration ? Math.round(data.duration / 1000) : 0} unit="s" status="passed" />
      </div>
      {data.raw && (
        <div style={{ marginTop: '8px', maxHeight: '200px', overflowY: 'auto', fontSize: '0.75em', color: 'var(--text-dim)', background: 'var(--surface)', padding: '8px', borderRadius: 'var(--radius-sm)' }}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{data.raw.slice(-2000)}</pre>
        </div>
      )}
    </div>
  );
}
