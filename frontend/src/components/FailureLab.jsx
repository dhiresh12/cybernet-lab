import React, { useState, useEffect } from 'react';
import { FAILURE_FAULTS } from '../data/learningFeatures';
import { failureLabStorage } from '../core/storage';

export default function FailureLab({ lab, onStartLab }) {
  const [selectedFault, setSelectedFault] = useState(null);
  const [injected, setInjected] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [saved, setSaved] = useState(null);

  useEffect(() => {
    if (lab) {
      const existing = failureLabStorage.forLab(lab.id);
      if (existing?.faultId) {
        setSelectedFault(FAILURE_FAULTS.find(f => f.id === existing.faultId) || null);
        setInjected(existing.injected || false);
        setResolved(existing.resolved || false);
        setSaved(existing.savedAt);
      }
    }
  }, [lab]);

  const handleInject = () => {
    if (!selectedFault) return;
    setInjected(true);
    setResolved(false);
    const record = { faultId: selectedFault.id, injected: true, resolved: false, savedAt: new Date().toISOString() };
    failureLabStorage.save(lab?.id, record);
    setSaved(record.savedAt);
  };

  const handleResolve = () => {
    setResolved(true);
    const record = { faultId: selectedFault?.id, injected, resolved: true, savedAt: new Date().toISOString() };
    failureLabStorage.save(lab?.id, record);
    setSaved(record.savedAt);
  };

  const handleReset = () => {
    setInjected(false);
    setResolved(false);
    failureLabStorage.clear(lab?.id);
    setSaved(null);
  };

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ color: 'var(--cyan)', letterSpacing: '0.08em', fontSize: '0.8rem', marginBottom: 'var(--space-2)' }}>FAILURE LAB</div>
      <h1 style={{ color: 'var(--text)', margin: '0 0 var(--space-4)', fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-extrabold)' }}>
        Controlled Fault Injection
      </h1>
      <div className="tech-card" style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ color: 'var(--warning)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-2)' }}>RULES</div>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Inject one fault at a time. Diagnose using show commands, ping, and traceroute. Do not reset the lab until you have recorded evidence and written a fix.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        {FAILURE_FAULTS.map(fault => (
          <div
            key={fault.id}
            className={`tech-card ${selectedFault?.id === fault.id ? 'selected' : ''}`}
            style={{ cursor: 'pointer', border: selectedFault?.id === fault.id ? '1px solid var(--primary)' : undefined }}
            onClick={() => { setSelectedFault(fault); setInjected(false); setResolved(false); }}
          >
            <div style={{ color: 'var(--text)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 4 }}>{fault.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 4 }}>{fault.description}</div>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', textTransform: 'capitalize' }}>{fault.deviceType}</span>
              <span className={`status-strip-item ${fault.severity === 'high' ? 'error' : fault.severity === 'medium' ? 'warning' : 'success'}`}>
                {fault.severity}
              </span>
            </div>
          </div>
        ))}
      </div>
      {selectedFault && (
        <div className="tech-card">
          <div style={{ color: 'var(--text)', marginBottom: 'var(--space-3)' }}>
            Selected fault: <strong>{selectedFault.name}</strong> on {selectedFault.deviceType}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            {!injected ? (
              <button className="cmd-btn primary" onClick={handleInject}>Inject Fault</button>
            ) : (
              <>
                <button className="cmd-btn" onClick={handleResolve} disabled={resolved}>Mark Resolved</button>
                <button className="cmd-btn" onClick={handleReset}>Reset Lab</button>
              </>
            )}
          </div>
          {injected && !resolved && <p style={{ color: 'var(--yellow)', marginTop: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>Fault active. Diagnose before resetting.</p>}
          {resolved && <p style={{ color: 'var(--green)', marginTop: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>Fault resolved. Evidence should be saved.</p>}
          {saved && <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>Last updated: {new Date(saved).toLocaleString()}</p>}
        </div>
      )}
      {lab && <button className="cmd-btn" style={{ marginTop: 'var(--space-4)' }} onClick={() => onStartLab?.(lab.id)}>Open Scoped Lab</button>}
    </div>
  );
}
