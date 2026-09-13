import React, { useState, useEffect, useCallback } from 'react';
import { qaApi } from '../services/qaApi';
import TestResults from './TestResults';
import BuildStatus from './BuildStatus';
import AccessibilityAudit from './AccessibilityAudit';
import PerformanceMetrics from './PerformanceMetrics';
import SecurityScan from './SecurityScan';
import LabQualityGate from './LabQualityGate';

const TABS = [
  { id: 'tests', label: 'TESTS' },
  { id: 'build', label: 'BUILD' },
  { id: 'accessibility', label: 'A11Y' },
  { id: 'performance', label: 'PERF' },
  { id: 'security', label: 'SECURITY' },
  { id: 'labs', label: 'LABS' }
];

export default function QADashboard() {
  const [status, setStatus] = useState('idle');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [lastRun, setLastRun] = useState(null);
  const [activeTab, setActiveTab] = useState('tests');

  useEffect(() => {
    qaApi.getQaStatus()
      .then(data => setLastRun(data))
      .catch(() => {});
  }, []);

  const handleRun = useCallback(async () => {
    setStatus('running');
    setError(null);
    setResults(null);
    try {
      const data = await qaApi.runQaCheck();
      setResults(data);
      setStatus(data.overall ? 'passed' : 'failed');
      setLastRun({ status: 'completed', timestamp: data.timestamp });
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, []);

  return (
    <div className="qa-dashboard">
      <div className="panel" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, color: 'var(--primary)' }}>QA Dashboard</h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {lastRun && (
              <span style={{ color: 'var(--text-dim)', fontSize: '0.85em' }}>
                Last run: {new Date(lastRun.timestamp).toLocaleString()}
              </span>
            )}
            <button
              className="cmd-btn primary"
              onClick={handleRun}
              disabled={status === 'running'}
              aria-label="Run QA check"
            >
              {status === 'running' ? 'Running...' : 'Run QA Check'}
            </button>
          </div>
        </div>

        {status === 'idle' && !results && (
          <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '40px 0' }}>
            Click "Run QA Check" to execute the full QA suite.
          </div>
        )}

        {status === 'running' && (
          <div style={{ color: 'var(--warning)', textAlign: 'center', padding: '40px 0' }}>
            Running QA checks... This may take a few minutes.
          </div>
        )}

        {error && (
          <div style={{ color: 'var(--error)', textAlign: 'center', padding: '20px 0' }}>
            Error: {error}
          </div>
        )}

        {results && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              <div className="stat-card" style={{ borderColor: results.overall ? 'var(--success)' : 'var(--error)' }}>
                <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: results.overall ? 'var(--success)' : 'var(--error)' }}>
                  {results.overall ? 'PASS' : 'FAIL'}
                </div>
                <div style={{ color: 'var(--text-dim)', fontSize: '0.8em' }}>Overall Status</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', borderBottom: '1px solid var(--panel-border-subtle)', paddingBottom: '4px', flexWrap: 'wrap' }} role="tablist">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  className={`cmd-btn ${activeTab === tab.id ? 'primary' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-label={tab.label}
                  style={{ fontSize: '0.8em' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div role="tabpanel">
              {activeTab === 'tests' && <TestResults data={results.tests} />}
              {activeTab === 'build' && <BuildStatus data={results.build} />}
              {activeTab === 'accessibility' && <AccessibilityAudit data={results.accessibility} />}
              {activeTab === 'performance' && <PerformanceMetrics data={results.performance} />}
              {activeTab === 'security' && <SecurityScan data={results.security} />}
              {activeTab === 'labs' && <LabQualityGate data={results.labQuality} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
