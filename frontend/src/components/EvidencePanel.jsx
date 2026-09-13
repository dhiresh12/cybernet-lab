import React from 'react';
import { evidenceStorage } from '../core/storage';

export default function EvidencePanel({ labId }) {
  const records = labId ? evidenceStorage.forLab(labId) : evidenceStorage.get();

  if (!records.length) {
    return (
      <div style={{ padding: 'var(--space-6)', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ color: 'var(--cyan)', letterSpacing: '0.08em', fontSize: '0.8rem', marginBottom: 'var(--space-2)' }}>EVIDENCE PANEL</div>
        <h1 style={{ color: 'var(--text)', margin: '0 0 var(--space-4)', fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-extrabold)' }}>Evidence Records</h1>
        <div className="tech-card">
          <p style={{ color: 'var(--text-muted)' }}>No evidence recorded yet. Complete lab steps with verification to generate records.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ color: 'var(--cyan)', letterSpacing: '0.08em', fontSize: '0.8rem', marginBottom: 'var(--space-2)' }}>EVIDENCE PANEL</div>
      <h1 style={{ color: 'var(--text)', margin: '0 0 var(--space-4)', fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-extrabold)' }}>
        {labId ? `Lab ${labId} Evidence` : 'All Evidence Records'}
      </h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {records.map((record, index) => (
          <div key={`${record.labId}-${record.stepId}-${index}`} className="tech-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
              <div style={{ color: 'var(--text)', fontWeight: 'var(--font-weight-semibold)' }}>
                Step: {record.stepId}
              </div>
              <div className={`status-strip-item ${record.passed ? 'success' : 'error'}`}>
                {record.passed ? 'PASSED' : 'FAILED'}
              </div>
            </div>
            {record.eventType && <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 4 }}>Type: {record.eventType}</div>}
            {record.verificationType && <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 4 }}>Verification: {record.verificationType}</div>}
            {record.expected && <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 4 }}>Expected: {record.expected}</div>}
            {record.actual !== null && record.actual !== undefined && (
              <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 4 }}>Actual: {String(record.actual)}</div>
            )}
            {record.resultMessage && <div style={{ color: 'var(--text)', fontSize: 'var(--text-sm)', marginBottom: 4 }}>Result: {record.resultMessage}</div>}
            {record.prediction && <div style={{ color: 'var(--text)', fontSize: 'var(--text-sm)', marginBottom: 4 }}>Prediction: {record.prediction}</div>}
            {record.evidence && <div style={{ color: 'var(--text)', fontSize: 'var(--text-sm)', marginBottom: 4 }}>Evidence: {record.evidence}</div>}
            {record.explanation && <div style={{ color: 'var(--text)', fontSize: 'var(--text-sm)', marginBottom: 4 }}>Explanation: {record.explanation}</div>}
            {record.hint && <div style={{ color: 'var(--yellow)', fontSize: 'var(--text-sm)', marginBottom: 4 }}>Hint: {record.hint}</div>}
            {record.limitations?.length > 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 4 }}>
                Limitations: {record.limitations.join(', ')}
              </div>
            )}
            {record.affectedDeviceIds?.length > 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 4 }}>
                Devices: {record.affectedDeviceIds.join(', ')}
              </div>
            )}
            <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-2)' }}>
              Attempts: {record.attempts || 0} · Failed: {record.failedAttempts || 0} · Saved: {record.savedAt ? new Date(record.savedAt).toLocaleString() : '—'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
