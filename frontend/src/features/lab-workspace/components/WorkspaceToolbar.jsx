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
    <aside className="lab-tools" aria-label="Workspace tools">
      <div className="tool-section">
        <h4>TOOLS</h4>
        <div role="radiogroup" aria-label="Select tool">
          {TOOLS.map(t => (
            <button
              key={t}
              className={`tool-btn ${activeTool === t ? 'active' : ''}`}
              onClick={() => onToolSelect(t)}
              role="radio"
              aria-checked={activeTool === t}
              aria-label={`${t} tool`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="tool-section">
        <h4>DEVICES</h4>
        <div role="listbox" aria-label="Devices" tabIndex={0} style={{ outline: 'none' }}>
          {devices.map(d => (
            <button
              key={d.id}
              className={`device-btn ${selectedDevice === d.id ? 'active' : ''}`}
              onClick={() => onDeviceSelect(selectedDevice === d.id ? null : d.id)}
              aria-label={`${d.name} device, type: ${d.type}${selectedDevice === d.id ? ', selected' : ''}`}
              aria-pressed={selectedDevice === d.id}
            >
              <span className="device-icon" aria-hidden="true" style={{
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
      </div>

      <div className="tool-section">
        <h4>STEPS</h4>
        <div className="step-list" role="list" aria-label="Lab steps">
          {steps.map((step, idx) => {
            const state = stepStates?.[step.stepId] || STEP_STATE.LOCKED;
            const isCurrent = currentStepId === step.stepId;
            return (
              <div key={step.stepId} className={`step-item ${state} ${isCurrent ? 'current' : ''}`} role="listitem">
                <span className="step-icon" aria-hidden="true">
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