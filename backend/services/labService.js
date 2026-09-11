const { v4: uuidv4 } = require('uuid');

const { labs, sessions, labCache, devices } = require('../state/state');
const { verifyStep: runVerification } = require('./verificationService');

/**
 * Lab service — business logic for lab operations.
 * Functions take a `session` object (from WebSocket) and return data
 * to be sent over the wire. Does NOT send directly.
 */

function startLab(session, labId) {
  const lab = labs.get(labId);
  if (!lab) return { error: 'Lab not found' };

  session.labId = labId;

  const labState = {
    id: uuidv4(),
    labId,
    currentStep: 0,
    completedSteps: [],
    score: 0,
    hintsUsed: 0,
    startTime: Date.now(),
    deviceStates: new Map(),
    topology: { nodes: [], edges: [] },
    stepOutputs: {}
  };

  // Initialize deviceStates from lab's initialState
  if (lab.initialState && lab.initialState.devices) {
    for (const devInit of lab.initialState.devices) {
      const deviceId = devInit.deviceId || devInit.id;
      if (deviceId) {
        const interfaces = {};
        if (devInit.interfaces && Array.isArray(devInit.interfaces)) {
          for (const iface of devInit.interfaces) {
            const ifaceName = iface.interfaceName || iface.name;
            if (ifaceName) {
              interfaces[ifaceName] = {
                ip: iface.ip || 'unassigned',
                mask: iface.mask || '255.255.255.0',
                status: iface.status || 'down',
                protocol: iface.protocol || 'down',
                description: iface.description || ''
              };
            }
          }
        }
        labState.deviceStates.set(deviceId, {
          id: deviceId,
          hostname: devInit.hostname || deviceId,
          interfaces
        });
      }
    }
  }

  // Initialize topology from lab's connections
  if (lab.topology && lab.topology.connections) {
    for (const conn of lab.topology.connections) {
      labState.topology.edges.push({
        id: uuidv4(),
        from: conn.from,
        to: conn.to,
        type: conn.type || 'ethernet',
        status: conn.status || 'connected',
        connectedAt: Date.now()
      });
    }
  }

  labCache.set(session.id, labState);

  return {
    labState,
    firstStep: lab.steps[0]
  };
}

async function verifyStep(session, stepId, payload) {
  const labState = labCache.get(session.id);
  if (!labState) return { error: 'No active lab session' };

  const lab = labs.get(labState.labId);
  if (!lab) return { error: 'Lab not found' };

  const step = lab.steps.find(s => s.stepId === stepId);
  if (!step) return { error: 'Step not found' };

  // Merge step.verification.payload with caller-supplied payload so the
  // verifier receives lab-authored context (deviceId, interface, etc.).
  const mergedPayload = { ...(step.verification?.payload || {}), ...payload };
  const result = await runVerification(step, mergedPayload, labState);

  if (result.passed) {
    labState.completedSteps.push(stepId);
    labState.score += result.xp || 10;
    labState.currentStep++;

    const nextStep = lab.steps[labState.currentStep];

    return {
      type: 'step:passed',
      stepId,
      xp: result.xp,
      nextStep
    };
  } else {
    return {
      type: 'step:failed',
      stepId,
      feedback: result.feedback,
      hint: result.hint
    };
  }
}

function sendHint(session, stepId, tier) {
  const labState = labCache.get(session.id);
  if (!labState) return { error: 'No active lab session' };

  const lab = labs.get(labState.labId);
  if (!lab) return { error: 'Lab not found' };

  if (typeof tier !== 'number' || tier < 0 || !Number.isInteger(tier)) {
    return { error: 'Invalid hint tier' };
  }

  const step = lab.steps.find(s => s.stepId === stepId);
  if (!step || !step.hints || tier >= step.hints.length) {
    return { error: 'Hint not available' };
  }

  const hint = step.hints[tier];
  labState.hintsUsed++;

  return { type: 'hint', stepId, tier, text: hint };
}

function pushConfig(session, deviceId, config) {
  const labState = labCache.get(session.id);
  if (!labState) return { error: 'No active lab session' };

  // Authoritative device state lives in the session's labState, not the
  // global `devices` Map (which is never populated by the lab loader).
  if (!labState.deviceStates) labState.deviceStates = new Map();

  const existing = labState.deviceStates.get(deviceId) || { id: deviceId, hostname: deviceId, interfaces: {} };
  existing.id = deviceId;
  existing.hostname = config?.hostname || existing.hostname;
  existing.config = config;
  existing.lastUpdated = Date.now();
  labState.deviceStates.set(deviceId, existing);

  return {
    type: 'device:updated',
    deviceId,
    config,
    applied: true
  };
}

function connectCable(session, from, to, cableType) {
  const labState = labCache.get(session.id);
  if (!labState) return { error: 'No active lab session' };

  const edge = {
    id: uuidv4(),
    from,
    to,
    cableType,
    connectedAt: Date.now(),
    status: 'connected'
  };

  labState.topology.edges.push(edge);

  return {
    type: 'topology:update',
    topology: labState.topology
  };
}

function disconnectCable(session, cableId) {
  const labState = labCache.get(session.id);
  if (!labState) return { error: 'No active lab session' };

  labState.topology.edges = labState.topology.edges.filter(e => e.id !== cableId);

  return {
    type: 'topology:update',
    topology: labState.topology
  };
}

function injectError(session, errorType, target) {
  const labState = labCache.get(session.id);
  if (!labState) return { error: 'No active lab session' };

  const error = {
    id: uuidv4(),
    type: errorType,
    target,
    injectedAt: Date.now(),
    detected: false
  };

  if (!labState.errors) labState.errors = [];
  labState.errors.push(error);

  return { type: 'error:injected', error };
}

function subscribeTelemetry(session, deviceIds) {
  session.telemetrySubscriptions = deviceIds || [];
  return { type: 'telemetry:subscribed', deviceIds: session.telemetrySubscriptions };
}

/**
 * Record the CLI output captured for a step so verifiers can grade what the
 * learner actually ran in the terminal (ping, show commands, etc.).
 */
function recordStepOutput(session, stepId, output) {
  const labState = labCache.get(session.id);
  if (!labState) return { error: 'No active lab session' };
  if (!labState.stepOutputs) labState.stepOutputs = {};
  labState.stepOutputs[stepId] = Array.isArray(output) ? output : [output];
  return { type: 'step:output:recorded', stepId };
}

module.exports = {
  startLab,
  verifyStep,
  sendHint,
  pushConfig,
  connectCable,
  disconnectCable,
  injectError,
  subscribeTelemetry,
  recordStepOutput
};