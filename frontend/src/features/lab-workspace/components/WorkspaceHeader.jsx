// LabWorkspace Header Component
// Extracted from LabWorkspace.jsx for better component boundaries

import React from 'react';

export default function WorkspaceHeader({
  lab,
  progress,
  timer,
  onRestart,
  onHint,
  onExit,
  steps,
  currentStepIndex
}) {
  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  // Extract mission and objective from lab data if available
  const mission = lab?.mission || 'Network Training Exercise';
  const objective = lab?.objective || 'Complete the lab objectives to advance your skills';

return (
    <header className="lab-header">
      <div className="lab-header-left">
        <span className="lab-title" aria-hidden="true">◄ CYBERNET ►</span>
        <div className="lab-divider" aria-hidden="true" />
        <div className="lab-info">
          <div className="lab-name">{lab?.title?.substring(0, 40) || 'No Lab'}{lab?.title?.length > 40 ? '...' : ''}</div>
          <div className="lab-mission">
            {mission}
          </div>
          <div className="lab-objective">
            {objective}
          </div>
        </div>
      </div>

      <div className="lab-header-center">
        <div className="lab-progress">
          <span className="lab-progress-label">STEP</span>
          <div className="lab-progress-text">
            <div className="lab-progress-step">Step {currentStepIndex + 1} of {steps.length}</div>
            <div className="lab-progress-percentage">{progress}% COMPLETE</div>
          </div>
        </div>
        <div className="progress-container">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="lab-time">⏱ {formatTime(timer.time)}</div>
      </div>

      <div className="lab-header-right">
        <button className="lab-btn primary" onClick={onRestart} aria-label="Restart lab">↺ RESTART LAB</button>
        <button className="lab-btn" onClick={onHint} aria-label="Show hint">💡 HINT</button>
        <button className="lab-btn danger" onClick={onExit} aria-label="Exit lab">✖ EXIT</button>
      </div>
    </header>
  );
}