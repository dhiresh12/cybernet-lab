// WorkspaceStepPanel - Current step / verification panel
// Extracted from LabWorkspace.jsx for better component boundaries

import React from 'react';
import { STEP_STATE } from '../../../engine/WorkflowEngine';

export default function WorkspaceStepPanel({
  step,
  stepState,
  result,
  verifying,
  onVerify,
  onHint,
  onShowSolution,
  showSolution
}) {
  const locked = stepState === STEP_STATE.LOCKED;
  const allowVerify = !locked && stepState !== STEP_STATE.COMPLETED;
  const isVerified = stepState === STEP_STATE.VERIFIED || stepState === STEP_STATE.COMPLETED;

  return (
    <div className="verification-panel">
      {step && (
        <div className="current-step">
          <h5>Step {step.stepId}: {step.title}</h5>
          <p>{step.instruction}</p>
          {step.commands && <pre>{step.commands.join('\n')}</pre>}
          {step.why && <p className="step-why">{step.why}</p>}
          {step.expectedOutput && <p className="step-expected"><strong>Expected:</strong> {step.expectedOutput}</p>}
          {step.commonMistakes?.length > 0 && (
            <details className="step-mistakes">
              <summary>Common mistakes and fixes</summary>
              <ul>
                {step.commonMistakes.map((mistake, index) => (
                  <li key={index}><strong>{mistake.mistake}</strong> — {mistake.solution}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
      
{result && (
        <div className={`verify-result ${result.error ? 'error' : (result.passed ? 'passed' : 'failed')}`}>
          <span>
            {result.error ? 'SYSTEM ERROR' : (result.passed ? 'PASSED' : 'STEP FAILED')}
          </span>
          <p>{result.message}</p>
          {result.error && <p className="error-detail">System error occurred. Please try again or contact support if this persists.</p>}
        </div>
      )}
      
      <div className="verify-actions">
        <button className="verify-btn" onClick={onVerify} disabled={!allowVerify || verifying}>
          {isVerified ? 'Next Step' : verifying ? 'Verifying...' : 'Verify'}
        </button>
        <button className="verify-btn secondary" onClick={onHint} disabled={locked}>Hint</button>
        <button className="verify-btn secondary" onClick={onShowSolution} disabled={locked}>Show Solution</button>
      </div>
      
      {showSolution && step?.solution && (
        <div className="solution">
          <h5>Solution:</h5>
          <pre>{step.solution}</pre>
        </div>
      )}
    </div>
  );
}