import React, { useState, useMemo } from 'react';

const LEVEL_COLORS = {
  'skill-lab': '#00E5FF',
  'combination-lab': '#7c3aed',
  'engineering-lab': '#00ff88',
  'failure-lab': '#ff3355',
  'integrated-lab': '#ffe600',
  'innovation-lab': '#ff8800'
};

export default function LabQualityGate({ data }) {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!data) {
    return <div style={{ color: 'var(--text-dim)', padding: '24px', textAlign: 'center' }}>No lab quality data available. Run QA check to populate.</div>;
  }

  const results = data.results || [];
  const total = data.total || results.length;
  const passed = data.passed || 0;
  const failed = data.failed || 0;
  const quarantined = data.quarantined || 0;
  const avgScore = data.avgScore || 0;

  const filtered = useMemo(() => {
    let result = results;
    if (filter === 'passed') {
      result = result.filter(r => r.passed);
    } else if (filter === 'failed') {
      result = result.filter(r => !r.passed);
    } else if (filter === 'quarantined') {
      result = result.filter(r => r.quarantined);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l =>
        (l.title && l.title.toLowerCase().includes(q)) ||
        (l.id && String(l.id).toLowerCase().includes(q))
      );
    }
    return result;
  }, [results, filter, searchQuery]);

  return (
    <div className="panel">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <div className="stat-card" style={{ borderColor: 'var(--primary)' }}>
          <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: 'var(--primary)' }}>{total}</div>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.8em' }}>Total Labs</div>
        </div>
        <div className="stat-card" style={{ borderColor: 'var(--success)' }}>
          <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: 'var(--success)' }}>{passed}</div>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.8em' }}>Passed</div>
        </div>
        <div className="stat-card" style={{ borderColor: 'var(--error)' }}>
          <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: 'var(--error)' }}>{failed}</div>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.8em' }}>Failed</div>
        </div>
        <div className="stat-card" style={{ borderColor: 'var(--warning)' }}>
          <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: 'var(--warning)' }}>{quarantined}</div>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.8em' }}>Quarantined</div>
        </div>
        <div className="stat-card" style={{ borderColor: 'var(--primary)' }}>
          <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: 'var(--primary)' }}>{avgScore}</div>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.8em' }}>Avg Score</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
        <input
          type="text"
          placeholder="Search labs..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="noc-input"
          style={{ flex: '1 1 200px' }}
          aria-label="Search labs"
        />
        <select value={filter} onChange={e => setFilter(e.target.value)} className="noc-select" aria-label="Filter labs">
          <option value="all">All Labs</option>
          <option value="passed">Passed</option>
          <option value="failed">Failed</option>
          <option value="quarantined">Quarantined</option>
        </select>
      </div>

      <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {filtered.map(lab => (
            <div
              key={lab.id}
              style={{
                padding: '8px 12px',
                background: 'transparent',
                border: '1px solid var(--panel-border-subtle)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.85em'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                <span style={{
                  color: lab.passed ? 'var(--success)' : 'var(--error)',
                  fontWeight: 'bold',
                  minWidth: '16px'
                }}>
                  {lab.passed ? 'PASS' : 'FAIL'}
                </span>
                <span style={{ color: 'var(--text-dim)', minWidth: '40px' }}>#{lab.id}</span>
                <span style={{
                  color: 'var(--text)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {lab.title || 'Untitled'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  color: (lab.score || 0) >= 70 ? 'var(--success)' : (lab.score || 0) >= 50 ? 'var(--warning)' : 'var(--error)',
                  fontWeight: 'bold',
                  minWidth: '32px',
                  textAlign: 'right'
                }}>
                  {lab.score || 0}
                </span>
                {lab.quarantined && <span style={{ color: 'var(--warning)', fontSize: '0.75em' }}>QUAR</span>}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ color: 'var(--text-muted)', padding: '16px', textAlign: 'center' }}>
              No labs match the current filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
