import React, { useState, useEffect, useMemo } from 'react';
import { evaluateLabQuality, QUALITY_PASS_THRESHOLD } from '../data/labQualityService.js';
import { assignBatch, BATCH_DEFINITIONS } from '../data/labContentEnricher.js';
import { normalizeLab } from '../data/labNormalizer.js';
import proceduralLabs from '../data/labs.procedural.json';

const LEVEL_LABELS = {
  'skill-lab': 'SKILL',
  'combination-lab': 'COMBINATION',
  'engineering-lab': 'ENGINEERING',
  'failure-lab': 'FAILURE',
  'integrated-lab': 'INTEGRATED',
  'innovation-lab': 'INNOVATION'
};

const LEVEL_COLORS = {
  'skill-lab': '#00E5FF',
  'combination-lab': '#7c3aed',
  'engineering-lab': '#00ff88',
  'failure-lab': '#ff3355',
  'integrated-lab': '#ffe600',
  'innovation-lab': '#ff8800'
};

export default function LabQualityDashboard() {
  const [labs, setLabs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [selectedLab, setSelectedLab] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const normalized = proceduralLabs
      .map(raw => normalizeLab(raw))
      .filter(Boolean);
    setLabs(normalized);
    setLoading(false);
  }, []);

  const evaluated = useMemo(() => {
    return labs.map(lab => {
      const quality = evaluateLabQuality(lab);
      return {
        ...lab,
        quality,
        batch: assignBatch(lab.category),
        batchName: BATCH_DEFINITIONS[assignBatch(lab.category)]?.name || 'Unknown'
      };
    });
  }, [labs]);

  const filtered = useMemo(() => {
    let result = evaluated;
    
    if (filter === 'passed') {
      result = result.filter(l => l.quality.passed);
    } else if (filter === 'failed') {
      result = result.filter(l => !l.quality.passed);
    } else if (filter === 'quarantined') {
      result = result.filter(l => l.quality.quarantined);
    }
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l => 
        l.title?.toLowerCase().includes(q) ||
        l.id?.toLowerCase().includes(q) ||
        l.category?.toLowerCase().includes(q)
      );
    }
    
    result = [...result].sort((a, b) => {
      if (sortBy === 'score') return (b.quality.score || 0) - (a.quality.score || 0);
      if (sortBy === 'id') return String(a.id || '').localeCompare(String(b.id || ''));
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'batch') return (a.batch || '').localeCompare(b.batch || '');
      return 0;
    });
    
    return result;
  }, [evaluated, filter, searchQuery, sortBy]);

  const stats = useMemo(() => {
    const total = evaluated.length;
    const passed = evaluated.filter(l => l.quality.passed).length;
    const failed = evaluated.filter(l => !l.quality.passed).length;
    const quarantined = evaluated.filter(l => l.quality.quarantined).length;
    const avgScore = total > 0 ? Math.round(evaluated.reduce((sum, l) => sum + (l.quality.score || 0), 0) / total) : 0;
    
    const levelCounts = {};
    evaluated.forEach(l => {
      const level = l.progressiveLevel || 'skill-lab';
      levelCounts[level] = (levelCounts[level] || 0) + 1;
    });
    
    const batchCounts = {};
    evaluated.forEach(l => {
      const batch = l.batch || 'J';
      batchCounts[batch] = (batchCounts[batch] || 0) + 1;
    });
    
    return { total, passed, failed, quarantined, avgScore, levelCounts, batchCounts };
  }, [evaluated]);

  if (loading) {
    return <div className="panel" style={{ padding: '24px', color: 'var(--text-dim)' }}>Loading lab quality data...</div>;
  }

  return (
    <div className="lab-quality-dashboard">
      <div className="panel" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, color: 'var(--primary)' }}>Lab Quality Dashboard</h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.85em' }}>Threshold: {QUALITY_PASS_THRESHOLD}</span>
            <span style={{ color: 'var(--success)' }}>{stats.passed} passed</span>
            <span style={{ color: 'var(--error)' }}>{stats.failed} failed</span>
            {stats.quarantined > 0 && <span style={{ color: 'var(--warning)' }}>{stats.quarantined} quarantined</span>}
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' }}>
          <div className="stat-card" style={{ borderColor: 'var(--primary)' }}>
            <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.total}</div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.8em' }}>Total Labs</div>
          </div>
          <div className="stat-card" style={{ borderColor: 'var(--success)' }}>
            <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: 'var(--success)' }}>{stats.passed}</div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.8em' }}>Passed</div>
          </div>
          <div className="stat-card" style={{ borderColor: 'var(--error)' }}>
            <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: 'var(--error)' }}>{stats.failed}</div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.8em' }}>Failed</div>
          </div>
          <div className="stat-card" style={{ borderColor: 'var(--warning)' }}>
            <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: 'var(--warning)' }}>{stats.avgScore}</div>
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
          />
          <select value={filter} onChange={e => setFilter(e.target.value)} className="noc-select">
            <option value="all">All Labs</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
            <option value="quarantined">Quarantined</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="noc-select">
            <option value="id">Sort by ID</option>
            <option value="title">Sort by Title</option>
            <option value="score">Sort by Score</option>
            <option value="batch">Sort by Batch</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="panel" style={{ maxHeight: '600px', overflowY: 'auto' }}>
          <h3 style={{ color: 'var(--primary)', marginTop: 0, marginBottom: '12px' }}>Labs ({filtered.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {filtered.map(lab => {
              const q = lab.quality;
              const levelColor = LEVEL_COLORS[lab.progressiveLevel] || 'var(--text-dim)';
              return (
                <div
                  key={lab.id}
                  onClick={() => setSelectedLab(lab)}
                  style={{
                    padding: '8px 12px',
                    background: selectedLab?.id === lab.id ? 'rgba(0,229,255,0.1)' : 'transparent',
                    border: `1px solid ${selectedLab?.id === lab.id ? 'var(--primary)' : 'var(--panel-border-subtle)'}`,
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.85em'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                    <span style={{ 
                      color: q.passed ? 'var(--success)' : 'var(--error)',
                      fontWeight: 'bold',
                      minWidth: '16px'
                    }}>
                      {q.passed ? 'PASS' : 'FAIL'}
                    </span>
                    <span style={{ color: 'var(--text-dim)', minWidth: '40px' }}>#{lab.id}</span>
                    <span style={{ 
                      color: levelColor, 
                      fontSize: '0.75em',
                      border: `1px solid ${levelColor}`,
                      padding: '1px 4px',
                      borderRadius: '2px'
                    }}>
                      {LEVEL_LABELS[lab.progressiveLevel] || 'SKILL'}
                    </span>
                    <span style={{ 
                      color: 'var(--text)', 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis' 
                    }}>
                      {lab.title}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ 
                      color: q.score >= 90 ? 'var(--success)' : q.score >= 70 ? 'var(--warning)' : 'var(--error)',
                      fontWeight: 'bold',
                      minWidth: '32px',
                      textAlign: 'right'
                    }}>
                      {q.score}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75em' }}>{lab.batch}</span>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ color: 'var(--text-muted)', padding: '16px', textAlign: 'center' }}>
                No labs match the current filter.
              </div>
            )}
          </div>
        </div>

        <div className="panel" style={{ maxHeight: '600px', overflowY: 'auto' }}>
          <h3 style={{ color: 'var(--primary)', marginTop: 0, marginBottom: '12px' }}>Lab Details</h3>
          {selectedLab ? (
            <div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, color: 'var(--text)' }}>{selectedLab.title}</h4>
                  <span style={{ 
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: selectedLab.quality.passed ? 'rgba(0,255,136,0.15)' : 'rgba(255,51,85,0.15)',
                    color: selectedLab.quality.passed ? 'var(--success)' : 'var(--error)',
                    border: `1px solid ${selectedLab.quality.passed ? 'var(--success)' : 'var(--error)'}`,
                    fontSize: '0.8em'
                  }}>
                    {selectedLab.quality.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85em' }}>
                  <div><span style={{ color: 'var(--text-dim)' }}>ID:</span> <span style={{ color: 'var(--text)' }}>{selectedLab.id}</span></div>
                  <div><span style={{ color: 'var(--text-dim)' }}>Category:</span> <span style={{ color: 'var(--text)' }}>{selectedLab.category}</span></div>
                  <div><span style={{ color: 'var(--text-dim)' }}>Difficulty:</span> <span style={{ color: 'var(--text)' }}>{selectedLab.difficulty}</span></div>
                  <div><span style={{ color: 'var(--text-dim)' }}>Level:</span> <span style={{ color: LEVEL_COLORS[selectedLab.progressiveLevel] || 'var(--text)' }}>{LEVEL_LABELS[selectedLab.progressiveLevel] || 'SKILL'}</span></div>
                  <div><span style={{ color: 'var(--text-dim)' }}>Batch:</span> <span style={{ color: 'var(--text)' }}>{selectedLab.batch} - {selectedLab.batchName}</span></div>
                  <div><span style={{ color: 'var(--text-dim)' }}>Steps:</span> <span style={{ color: 'var(--text)' }}>{selectedLab.quality.stepCount}</span></div>
                  <div><span style={{ color: 'var(--text-dim)' }}>Score:</span> <span style={{ color: selectedLab.quality.score >= 70 ? 'var(--success)' : 'var(--error)' }}>{selectedLab.quality.score}/100</span></div>
                  <div><span style={{ color: 'var(--text-dim)' }}>Threshold:</span> <span style={{ color: 'var(--text)' }}>{selectedLab.quality.threshold}</span></div>
                </div>
              </div>

              {selectedLab.quality.reasons?.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <h5 style={{ color: 'var(--error)', margin: '0 0 4px 0', fontSize: '0.85em' }}>Errors ({selectedLab.quality.reasons.length})</h5>
                  <ul style={{ margin: 0, paddingLeft: '16px', color: 'var(--error)', fontSize: '0.8em' }}>
                    {selectedLab.quality.reasons.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}

              {selectedLab.quality.warnings?.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <h5 style={{ color: 'var(--warning)', margin: '0 0 4px 0', fontSize: '0.85em' }}>Warnings ({selectedLab.quality.warnings.length})</h5>
                  <ul style={{ margin: 0, paddingLeft: '16px', color: 'var(--warning)', fontSize: '0.8em' }}>
                    {selectedLab.quality.warnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              )}

              {!selectedLab.quality.passed && selectedLab.quality.reasons?.length === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85em' }}>
                  Lab did not meet quality threshold. Review warnings above.
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
              Select a lab to view quality details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
