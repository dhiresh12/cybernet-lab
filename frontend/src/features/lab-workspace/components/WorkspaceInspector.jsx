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
    <aside className="lab-inspector" aria-label="Device inspector">
      <div className="inspector-tabs" role="tablist" aria-label="Inspector panels">
        <button className={activePanel === 'overview' ? 'active' : ''} onClick={() => onPanelSelect('overview')} role="tab" aria-selected={activePanel === 'overview'} aria-controls="inspector-overview">Overview</button>
        <button className={activePanel === 'config' ? 'active' : ''} onClick={() => onPanelSelect('config')} role="tab" aria-selected={activePanel === 'config'} aria-controls="inspector-config">Config</button>
        <button className={activePanel === 'interfaces' ? 'active' : ''} onClick={() => onPanelSelect('interfaces')} role="tab" aria-selected={activePanel === 'interfaces'} aria-controls="inspector-interfaces">Interfaces</button>
        <button className={activePanel === 'routing' ? 'active' : ''} onClick={() => onPanelSelect('routing')} role="tab" aria-selected={activePanel === 'routing'} aria-controls="inspector-routing">Routing</button>
        <button className={activePanel === 'verification' ? 'active' : ''} onClick={() => onPanelSelect('verification')} role="tab" aria-selected={activePanel === 'verification'} aria-controls="inspector-verification">Verify</button>
      </div>
      
      <div className="inspector-content">
        {activePanel === 'overview' && (
          <div id="inspector-overview" role="tabpanel" aria-labelledby="inspector-overview-tab">
            <OverviewPanel device={device} />
          </div>
        )}
        {activePanel === 'config' && (
          <div id="inspector-config" role="tabpanel" aria-labelledby="inspector-config-tab">
            <ConfigPanel device={device} />
          </div>
        )}
        {activePanel === 'interfaces' && (
          <div id="inspector-interfaces" role="tabpanel" aria-labelledby="inspector-interfaces-tab">
            <InterfacesPanel device={device} />
          </div>
        )}
        {activePanel === 'routing' && (
          <div id="inspector-routing" role="tabpanel" aria-labelledby="inspector-routing-tab">
            <RoutingPanel device={device} />
          </div>
        )}
        {activePanel === 'verification' && (
          <div id="inspector-verification" role="tabpanel" aria-labelledby="inspector-verification-tab">
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
          </div>
        )}
      </div>
    </aside>
  );
}