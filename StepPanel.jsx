import React, { useState } from 'react';
import './StepPanel.css';

export default function StepPanel({ step, onVerify, onHint }) {
  const [payload, setPayload] = useState('');
  const [feedback, setFeedback] = useState(null);

  if (!step) {
    return (
      <div className="step-panel">
        <div className="step-title">No Active Step</div>
        <div className="step-body">Start a lab to begin guided instructions.</div>
      </div>
    );
  }

  const handleVerify = async () => {
    const result = await onVerify({ input: payload, type: step.verification?.type || 'cli' });
    setFeedback(result);
  };

  return (
    <div className="step-panel">
      <div className="step-title">Step {step.stepId || ''}</div>
      <div className="step-body">{step.instruction}</div>
      {step.verification?.type === 'cli' && (
        <textarea
          className="step-input"
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          placeholder="Enter CLI commands..."
          rows={4}
        />
      )}
      <div className="step-controls">
        <button className="btn primary" onClick={handleVerify}>Verify</button>
        <button className="btn" onClick={() => onHint(0)}>Hint T1</button>
        <button className="btn" onClick={() => onHint(1)}>Hint T2</button>
        <button className="btn" onClick={() => onHint(2)}>Hint T3</button>
      </div>
      {feedback && (
        <div style={{ marginTop: 10, color: feedback.passed ? 'var(--green)' : 'var(--red)' }}>
          {feedback.feedback}
        </div>
      )}
    </div>
  );
}
