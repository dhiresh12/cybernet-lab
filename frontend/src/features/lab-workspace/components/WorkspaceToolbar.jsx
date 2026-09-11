// WorkspaceToolbar - Left sidebar with tools, devices, and steps
// Extracted from LabWorkspace.jsx for better component boundaries

import React from 'react';
import { STEP_STATE } from '../../../engine/WorkflowEngine';

const TOOLS = ['Select', 'Move', 'Connect', 'Delete', 'Inspect', 'Ping', 'Trace'];

export default function WorkspaceToolbar({
  activeTool,
  onToolSelect,
  devices,
  selectedDevice,
  onDeviceSelect,
  steps,
  stepStates,
  currentStepId
}) {
  return (
    <aside className="lab-tools">
      <div className="tool-section">
        <h4>TOOLS</h4>
        {TOOLS.map(t => (
          <button
            key={t}
            className={`tool-btn ${activeTool === t ? 'active' : ''}`}
            onClick={() => onToolSelect(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="tool-section">
        <h4>DEVICES</h4>
        {devices.map(d => (
          <button
            key={d.id}
            className={`device-btn ${selectedDevice === d.id ? 'active' : ''}`}
            onClick={() => onDeviceSelect(selectedDevice === d.id ? null : d.id)}
          >
            <span className="device-icon" style={{
              color: d.type === 'router' ? '#00f0ff' :
                     d.type === 'switch' ? '#00ff88' :
                     d.type === 'pc' ? '#ffaa00' : '#aa00ff'
            }}>
              {d.type === 'router' ? '\u25a6' : d.type === 'switch' ? '\u2b01' : '\u{1f4bb}'}
            </span>
            {d.name}
          </button>
        ))}
      </div>

      <div className="tool-section">
        <h4>STEPS</h4>
        <div className="step-list">
          {steps.map((step, idx) => {
            const state = stepStates?.[step.stepId] || STEP_STATE.LOCKED;
            const isCurrent = currentStepId === step.stepId;
            return (
              <div key={step.stepId} className={`step-item ${state} ${isCurrent ? 'current' : ''}`}>
                <span className="step-icon">
                  {state === STEP_STATE.COMPLETED ? '\u2713' : state === STEP_STATE.FAILED ? '\u2717' : state === STEP_STATE.LOCKED ? '\u{1f512}' : isCurrent ? '\u25a1' : '\u25cb'}
                </span>
                <span className={`step-label ${isCurrent ? 'current-step-label' : ''}`}>{idx + 1}. {step.title}</span>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}