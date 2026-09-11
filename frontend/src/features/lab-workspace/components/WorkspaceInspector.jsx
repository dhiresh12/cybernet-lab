// WorkspaceInspector - Right sidebar inspector panel
// Extracted from LabWorkspace.jsx for better component boundaries

import React, { useMemo } from 'react';

import { OverviewPanel } from './OverviewPanel';
import { ConfigPanel } from './ConfigPanel';
import { InterfacesPanel } from './InterfacesPanel';
import { RoutingPanel } from './RoutingPanel';
import WorkspaceStepPanel from './WorkspaceStepPanel';

export default function WorkspaceInspector({
  selectedDevice,
  activePanel,
  onPanelSelect,
  labEngine,
  currentStep,
  currentStepState,
  verifyResult,
  verifyBusy,
  onVerify,
  onHint,
  onShowSolution,
  showSolution
}) {
  const device = useMemo(() => {
    if (!labEngine || !selectedDevice) return null;
    return labEngine.state.runtime?.devices?.[selectedDevice] || null;
  }, [labEngine, selectedDevice]);

  return (
    <aside className="lab-inspector">
      <div className="inspector-tabs">
        <button className={activePanel === 'overview' ? 'active' : ''} onClick={() => onPanelSelect('overview')}>Overview</button>
        <button className={activePanel === 'config' ? 'active' : ''} onClick={() => onPanelSelect('config')}>Config</button>
        <button className={activePanel === 'interfaces' ? 'active' : ''} onClick={() => onPanelSelect('interfaces')}>Interfaces</button>
        <button className={activePanel === 'routing' ? 'active' : ''} onClick={() => onPanelSelect('routing')}>Routing</button>
        <button className={activePanel === 'verification' ? 'active' : ''} onClick={() => onPanelSelect('verification')}>Verify</button>
      </div>
      
      <div className="inspector-content">
        {activePanel === 'overview' && (
          <OverviewPanel device={device} />
        )}
        {activePanel === 'config' && (
          <ConfigPanel device={device} />
        )}
        {activePanel === 'interfaces' && (
          <InterfacesPanel device={device} />
        )}
        {activePanel === 'routing' && (
          <RoutingPanel device={device} />
        )}
        {activePanel === 'verification' && (
          <WorkspaceStepPanel
            step={currentStep}
            stepState={currentStepState}
            result={verifyResult}
            verifying={verifyBusy}
            onVerify={onVerify}
            onHint={onHint}
            onShowSolution={onShowSolution}
            showSolution={showSolution}
          />
        )}
      </div>
    </aside>
  );
}