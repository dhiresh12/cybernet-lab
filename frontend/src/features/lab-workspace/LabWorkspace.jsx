// LabWorkspace - Main composition component
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CliTerminal } from '../../features/cli';
import { parseLabDevices, parseLabConnections, parseIpTable, buildLayout } from './labParsers';
import { defaultDeviceState } from '../../features/simulator';
import { useLabSimulation } from './useLabSimulation';
import { useLabTopology } from './useLabTopology';
import { useLabVerification } from './useLabVerification';
import { useLabTroubleshooting } from './useLabTroubleshooting';
import { useLabTimer } from './useLabTimer';
import { useLabTerminal } from './useLabTerminal';
import { createWorkflowSession, startWorkflow, resetWorkflow, advanceWorkflow, useHint, getCurrentStep, canVerify, STEP_STATE } from '../../engine/WorkflowEngine';
import LabEngine from '../../engine/LabEngine';
import WorkspaceHeader from './components/WorkspaceHeader';
import WorkspaceStepPanel from './components/WorkspaceStepPanel';
import WorkspaceToolbar from './components/WorkspaceToolbar';
import WorkspaceInspector from './components/WorkspaceInspector';
import '../../styles/LabWorkspace.css';

class LabWorkspaceErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="lab-error-state">
          <div className="error-content">
            <span className="error-icon">!</span>
            <h3>Workspace Error</h3>
            <p>Something went wrong with the lab workspace.</p>
            {this.props.onExit && (
              <button className="error-btn" onClick={this.props.onExit}>
                Exit Lab
              </button>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function buildInitialDeviceStates(devices, lab) {
  const map = {};
  devices.forEach(d => {
    const initialStateEntry = (lab?.initialState?.devices || []).find(
      device => (device.deviceId || device.id) === d.id
    );
    const baseState = defaultDeviceState(d.name);
    const mergedInterfaces = { ...baseState.interfaces };
    if (initialStateEntry?.interfaces && Array.isArray(initialStateEntry.interfaces)) {
      initialStateEntry.interfaces.forEach(iface => {
        const name = iface.interfaceName || iface.name;
        if (name) {
          mergedInterfaces[name] = {
            ip: iface.ip || 'unassigned',
            mask: iface.mask || '255.255.255.0',
            status: iface.status || 'down',
            protocol: iface.protocol || 'down',
            description: iface.description || '',
            name,
            deviceId: d.id,
          };
        }
      });
    }
    map[d.id] = {
      ...baseState,
      ...initialStateEntry,
      interfaces: mergedInterfaces,
    };
  });
  return map;
}

export default function LabWorkspace({ lab, onExit, onComplete, onEvidenceRecord }) {
  const steps = useMemo(() => lab?.steps || [], [lab]);
  const [session, setSession] = useState(() => createWorkflowSession(lab?.id, steps));
  const [verifyResult, setVerifyResult] = useState(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) {
      setSession(prev => startWorkflow(prev, steps));
      setStarted(true);
      if (labEngineRef.current && lab?.id) {
        labEngineRef.current.startLab(lab.id, lab).catch(err => {
          console.error('Failed to start lab in LabEngine:', err);
        });
      }
    }
  }, [started, steps]);

  useEffect(() => {
    return () => {
      labEngineRef.current?.destroy();
    };
  }, []);

  const devices = useMemo(() => parseLabDevices(lab), [lab]);
  const connections = useMemo(() => parseLabConnections(lab), [lab]);
  const ipTable = useMemo(() => parseIpTable(lab), [lab]);
  const layout = useMemo(() => buildLayout(devices, connections), [devices, connections]);

  const nodes = useMemo(() => {
    return devices.map(d => ({
      ...d,
      x: layout[d.id]?.x ?? 0.5,
      y: layout[d.id]?.y ?? 0.5,
    }));
  }, [devices, layout]);

  const edges = useMemo(() => {
    return connections.map((c, idx) => {
      if (typeof c === 'string' && c.includes('->')) {
        const [from, to] = c.split('->');
        return { id: `edge-${idx}`, from, to, status: 'active' };
      }
      return { id: `edge-${idx}`, from: c, to: c, status: 'active' };
    });
  }, [connections]);

  const nodeMap = useMemo(() => {
    const map = {};
    nodes.forEach(n => { map[n.id] = n; });
    return map;
  }, [nodes]);

  const currentStep = getCurrentStep(session, steps);
  const progress = session.progress ?? (steps.length > 0 ? Math.round((session.completedStepIds.length / steps.length) * 100) : 0);

  const [activePanel, setActivePanel] = useState('overview');
  const [selectedDevice, setSelectedDevice] = useState(null);
const [xpEarned, setXpEarned] = useState(0);
const [hintsUsed, setHintsUsed] = useState(0);
const [showSolution, setShowSolution] = useState(false);
  const [activeTool, setActiveTool] = useState('Select');
  const [activeTerminalDevice, setActiveTerminalDevice] = useState(() => devices[0]?.id || null);

  const labEngineRef = useRef(null);
  if (!labEngineRef.current) {
    labEngineRef.current = new LabEngine(null);
  }

  const handleEngineReady = useCallback((engine, error) => {
    if (error) {
      console.error('Lab simulation engine initialization failed:', error);
      return;
    }
    if (labEngineRef.current) {
      labEngineRef.current.attachSimulationEngine(engine);
    }
  }, []);

  // Listen for backend verification events to update workflow state
  useEffect(() => {
    const engine = labEngineRef.current;
    if (!engine) return;

    const onStepPassed = (msg) => {
      const stepId = msg.stepId;
      setSession(prev => {
        const next = advanceWorkflow(prev, stepId, { passed: true, xp: msg.xp, message: 'Verification passed' });
        return next;
      });
      setXpEarned(x => x + (msg.xp || 10));
    };

    const onStepFailed = (msg) => {
      const stepId = msg.stepId;
      setSession(prev => ({
        ...prev,
        stepStates: { ...prev.stepStates, [stepId]: STEP_STATE.FAILED }
      }));
      setVerifyResult({
        passed: false,
        feedback: msg.feedback,
        hint: msg.hint,
        error: false
      });
    };

    engine.on('step:passed', onStepPassed);
    engine.on('step:failed', onStepFailed);

    return () => {
      engine.off('step:passed', onStepPassed);
      engine.off('step:failed', onStepFailed);
    };
  }, [labEngineRef]);

  const [canonicalDeviceStates, setCanonicalDeviceStates] = useState(() => buildInitialDeviceStates(devices, lab));

  const simulation = useLabSimulation({
    devices,
    connections,
    deviceStates: canonicalDeviceStates,
    setDeviceStates: setCanonicalDeviceStates,
    onEngineReady: handleEngineReady
  });
  const topology = useLabTopology({ devices, connections, ipTable, layout, deviceStates: canonicalDeviceStates, labEngine: labEngineRef.current });
  const verification = useLabVerification({ currentStepIdx: steps.findIndex(s => s.stepId === session.currentStepId), steps, deviceStates: canonicalDeviceStates, simulation, labEngine: labEngineRef.current });
  const troubleshooting = useLabTroubleshooting({ devices, deviceStates: canonicalDeviceStates, simulation, labEngine: labEngineRef.current });
  const timer = useLabTimer();
  const terminal = useLabTerminal({ simulation, activeTerminalDevice });
  const handleSendCommand = terminal.handleSendCommand;

  const xpEarnedRef = useRef(xpEarned);
  xpEarnedRef.current = xpEarned;

  const handleNextStep = useCallback(async () => {
    const current = getCurrentStep(session, steps);
    if (!current) return;
    if (!canVerify(session, current.stepId)) return;

    setSession(prev => ({ ...prev, stepStates: { ...prev.stepStates, [current.stepId]: STEP_STATE.VERIFICATION_PENDING } }));
    
    // Use backend verification via LabEngine instead of local simulation
    let result = null;
    if (labEngineRef.current && !labEngineRef.current.isLocalMode()) {
      try {
        result = await labEngineRef.current.verifyStep(current.stepId, {});
      } catch (error) {
        console.error('LabEngine verification failed:', error);
        result = {
          passed: false,
          feedback: 'Verification failed due to connection error',
          hint: 'Please check your connection and try again',
          error: true
        };
      }
    } else {
      // Fallback to local verification when in local mode or no labEngine
      const verificationResult = await verification.verifyCurrentStep();
      result = {
        passed: verificationResult.passed,
        feedback: verificationResult.message,
        hint: verificationResult.hint,
        score: verificationResult.score,
        error: verificationResult.error
      };
    }
    
    setVerifyResult(result);
    onEvidenceRecord?.({
      labId: lab.id,
      stepId: current.stepId,
      eventType: 'verification',
      verificationType: current.verification?.type || 'typing',
      passed: Boolean(result.passed),
      resultMessage: result.message || (result.passed ? 'Verification passed' : 'Verification failed'),
      expected: current.verification?.expected || null,
      actual: result.actual ?? null,
      verifierVersion: result.verifierVersion || null,
      hint: result.hint || '',
      score: result.score ?? null,
      affectedDeviceIds: result.affectedDevices?.length
        ? result.affectedDevices
        : current.verification?.payload?.deviceId
          ? [current.verification.payload.deviceId]
          : [],
      limitations: result.limitations?.length
        ? result.limitations
        : result.error
          ? ['The verifier reported an error; inspect the step and retry after correcting the lab state.']
          : [],
    });

    if (result.passed) {
      const nextSession = advanceWorkflow(session, current.stepId, result);
      setSession(nextSession);
      setXpEarned(x => x + 10);
      setHintsUsed(0);
      setShowSolution(false);
      troubleshooting.reset();
      setVerifyResult(null);

      const isLast = nextSession.completedStepIds.length >= steps.length;
      if (isLast && onComplete) {
        onComplete({ xp: xpEarnedRef.current + 10 });
      }
    } else {
      setSession(prev => ({ ...prev, stepStates: { ...prev.stepStates, [current.stepId]: STEP_STATE.FAILED } }));
    }
  }, [session, steps, verification, troubleshooting, onComplete, labEngineRef]);

  const handleHint = useCallback(() => {
    if (labEngineRef.current && !labEngineRef.current.isLocalMode()) {
      try {
        labEngineRef.current.sendHint(currentStep?.stepId, 0);
      } catch (error) {
        console.error('LabEngine hint failed:', error);
      }
    } else {
      setSession(prev => useHint(prev));
      troubleshooting.requestHint();
    }
  }, [troubleshooting, currentStep]);

  const handleShowSolution = useCallback(() => {
    setShowSolution(true);
  }, []);

  const handleRestart = useCallback(() => {
    try {
      const fresh = resetWorkflow(session);
      setSession(fresh);
      setVerifyResult(null);
      timer.reset();
      setShowSolution(false);
      terminal.clear();
      setXpEarned(0);
      setSelectedDevice(null);
      setActivePanel('overview');
      labEngineRef.current?.resetLab();

      const initialStates = buildInitialDeviceStates(devices, lab);
      setCanonicalDeviceStates(initialStates);
      simulation.reset(initialStates);

      // Also reset the LabEngine backend state
      labEngineRef.current?.disconnect();
      labEngineRef.current?.connect();
    } catch (error) {
      console.error('Lab restart failed:', error);
      // Keep existing state on restart failure
    }
  }, [session, timer, terminal, simulation, devices, lab, labEngineRef]);

  const verifyBusy = verification.verifying;
  const currentStepState = currentStep ? (session.stepStates?.[currentStep.stepId] || STEP_STATE.LOCKED) : null;

  // Listen for backend hint events to update UI hintsUsed state
  useEffect(() => {
    const engine = labEngineRef.current;
    if (!engine) return;

    const onHint = (msg) => {
      setHintsUsed(prev => Math.min(prev + 1, currentStep?.hintTiers?.length - 1 || 0));
    };

    engine.on('hint', onHint);

    return () => {
      engine.off('hint', onHint);
    };
  }, [labEngineRef, currentStep, setHintsUsed]);

  if (!lab) {
    return (
      <div className="lab-empty-state">
        <div className="empty-content">
          <span className="empty-icon">WARNING:</span>
          <h3>No Lab Loaded</h3>
          <p>Select a lab to begin.</p>
        </div>
      </div>
    );
  }

  if (lab && steps.length === 0 && devices.length === 0) {
    return (
      <div className="lab-empty-state">
        <div className="empty-content">
          <span className="empty-icon">∅</span>
          <h3>Lab Has No Content</h3>
          <p>This lab has no steps or devices configured.</p>
          {onExit && (
            <button className="empty-btn" onClick={onExit}>
              Back to Labs
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <LabWorkspaceErrorBoundary onExit={onExit}>
      <div className="lab-workspace" role="main" aria-label="Lab Workspace">
        <WorkspaceHeader
          lab={lab}
          progress={progress}
          timer={timer}
          onRestart={handleRestart}
          onHint={handleHint}
          onExit={onExit}
          steps={steps}
          currentStepIndex={steps.findIndex(s => s.stepId === session.currentStepId)}
        />

      <main className="lab-main" aria-label="Lab main content">
        <WorkspaceToolbar
          activeTool={activeTool}
          onToolSelect={setActiveTool}
          devices={devices}
          selectedDevice={selectedDevice}
          onDeviceSelect={setSelectedDevice}
          steps={steps}
          stepStates={session.stepStates}
          currentStepId={currentStep?.stepId}
        />

        <section className="lab-center" aria-label="Lab topology and terminal">
          <div className="topology-container">
            <div className="topology-canvas" role="img" aria-label={`Network topology for ${lab?.title || 'lab'}`}>
              <svg className="topology-svg" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} aria-hidden="true">
                {edges.map(edge => {
                  const fromNode = nodeMap[edge.from];
                  const toNode = nodeMap[edge.to];
                  if (!fromNode || !toNode) return null;
                  return (
                    <line
                      key={edge.id}
                      x1={`${fromNode.x * 100}%`}
                      y1={`${fromNode.y * 100}%`}
                      x2={`${toNode.x * 100}%`}
                      y2={`${toNode.y * 100}%`}
                      className={`topology-edge ${edge.status}`}
                    />
                  );
                })}
              </svg>
              {nodes.map(node => (
                <div key={node.id} 
                     className={`topology-node ${node.type} ${selectedDevice === node.id ? 'selected' : ''}`}
                     style={{ left: `${node.x * 100}%`, top: `${node.y * 100}%` }}
                     onClick={() => onNodeClick(node.id)}
                     role="button"
                     tabIndex={0}
                     aria-label={`${node.label} - ${node.type}`}
                     onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNodeClick(node.id); } }}>
                  <span className="node-icon" aria-hidden="true">{node.type === 'router' ? '◆' : node.type === 'switch' ? '⬡' : 'Laptop'}</span>
                  <span className="node-label">{node.label}</span>
                  {node.ip && node.ip !== 'unassigned' && (
                    <span className="node-ip">{node.ip}</span>
                  )}
                </div>
              ))}
                </div>
          </div>
          
          <div className="terminal-container">
                <div className="terminal-header">
                  <span id="workspace-terminal-title">TERMINAL</span>
                  <div className="terminal-status">
                    <span className={`terminal-status-indicator ${simulation.engine && activeTerminalDevice ? 'active' : ''}`} aria-hidden="true"></span>
                    <span className="terminal-status-text" aria-live="polite">
                      {simulation.engine && activeTerminalDevice ? 'CONNECTED' : 'DISCONNECTED'}
                    </span>
                  </div>
                <label htmlFor="device-selector" className="sr-only">Select device</label>
                <select value={activeTerminalDevice || ''} 
                        onChange={e => setActiveTerminalDevice(e.target.value)}
                        id="device-selector"
                        className="device-selector"
                        aria-label="Active terminal device">
                    {devices.map(d => (
                      <option key={d.id} value={d.id}>
                        {labEngineRef.current?.state?.runtime?.devices?.[d.id]?.hostname || d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <CliTerminal 
                  engine={simulation.engine} 
                  activeDeviceId={activeTerminalDevice} 
                  onOutput={terminal.output} 
                  onSend={handleSendCommand} 
                />
              </div>
            </section>
            
            <WorkspaceInspector
              selectedDevice={selectedDevice}
              activePanel={activePanel}
              onPanelSelect={setActivePanel}
              labEngine={labEngineRef.current}
              currentStep={currentStep}
              currentStepState={currentStepState}
              verifyResult={verifyResult}
              verifyBusy={verifyBusy}
              onVerify={handleNextStep}
              onHint={handleHint}
              onShowSolution={handleShowSolution}
              showSolution={showSolution}
            />
          </main>
        </div>
      </LabWorkspaceErrorBoundary>
    );
  }

function TopologyCanvas({ nodes, edges, selectedDevice, onNodeClick, activeTool }) {
  const nodeMap = useMemo(() => {
    const map = {};
    nodes.forEach(n => { map[n.id] = n; });
    return map;
  }, [nodes]);

  return (
    <div className="topology-canvas">
      <svg className="topology-svg" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {edges.map(edge => {
          const fromNode = nodeMap[edge.from];
          const toNode = nodeMap[edge.to];
          if (!fromNode || !toNode) return null;
          return (
            <line
              key={edge.id}
              x1={`${fromNode.x * 100}%`}
              y1={`${fromNode.y * 100}%`}
              x2={`${toNode.x * 100}%`}
              y2={`${toNode.y * 100}%`}
              className={`topology-edge ${edge.status}`}
            />
          );
        })}
      </svg>
      {nodes.map(node => (
        <div key={node.id} 
             className={`topology-node ${node.type} ${selectedDevice === node.id ? 'selected' : ''}`}
             style={{ left: `${node.x * 100}%`, top: `${node.y * 100}%` }}
             onClick={() => onNodeClick(node.id)}
             onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onNodeClick(node.id); } }}
             role="button"
             tabIndex={0}
             aria-label={`Network device ${node.label}, type ${node.type}`}>
          <span className="node-icon">{node.type === 'router' ? '◆' : node.type === 'switch' ? '⬡' : 'Laptop'}</span>
          <span className="node-label">{node.label}</span>
          {node.ip && node.ip !== 'unassigned' && (
            <span className="node-ip">{node.ip}</span>
          )}
        </div>
      ))}
        </div>
  );
}