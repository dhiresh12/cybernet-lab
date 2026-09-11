const { sessions, labCache } = require('../state/state');
const {
  startLab,
  verifyStep,
  sendHint,
  pushConfig,
  connectCable,
  disconnectCable,
  injectError,
  subscribeTelemetry
} = require('../services/labService');

/**
 * Message handler — routes WebSocket message types to lab service functions.
 * Validates message format before processing.
 */

/** Ensure message has required fields; send error reply if not. */
function validateMessage(msg) {
  if (!msg || typeof msg.type !== 'string') {
    return { valid: false, reason: 'missing or invalid type' };
  }
  if (msg.type === 'lab:start' && !msg.labId) {
    return { valid: false, reason: 'missing labId' };
  }
  if ((msg.type === 'lab:step:verify' || msg.type === 'lab:hint') && !msg.stepId) {
    return { valid: false, reason: 'missing stepId' };
  }
  if (msg.type === 'lab:hint' && (typeof msg.tier !== 'number' || msg.tier < 0 || !Number.isInteger(msg.tier))) {
    return { valid: false, reason: 'invalid tier' };
  }
  return { valid: true };
}

async function handleMessage(session, msg) {
  const validation = validateMessage(msg);
  if (!validation.valid) {
    session.ws.send(JSON.stringify({ type: 'error', message: validation.reason }));
    return;
  }

  session.lastActivity = Date.now();

  switch (msg.type) {
    case 'lab:start':
      return await handleStartLab(session, msg.labId);

    case 'lab:step:verify':
      return await handleVerifyStep(session, msg.stepId, msg.payload);

    case 'lab:hint':
      return handleSendHint(session, msg.stepId, msg.tier);

    case 'device:config':
      return await handlePushConfig(session, msg.deviceId, msg.config);

    case 'device:state':
      return await handleSyncDeviceState(session, msg.deviceId, msg.state);

    case 'topology:connect':
      return await handleConnectCable(session, msg.from, msg.to, msg.cableType);

    case 'topology:disconnect':
      return await handleDisconnectCable(session, msg.cableId);

    case 'error:inject':
      return await handleInjectError(session, msg.errorType, msg.target);

    case 'telemetry:subscribe':
      return handleSubscribeTelemetry(session, msg.deviceIds);

    default:
      session.ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
  }
}

async function handleStartLab(session, labId) {
  const result = startLab(session, labId);
  if (result.error) {
    session.ws.send(JSON.stringify({ type: 'error', message: result.error }));
    return;
  }
  session.ws.send(JSON.stringify({
    type: 'lab:started',
    state: serializeState(result.labState),
    firstStep: result.firstStep
  }));
}

async function handleVerifyStep(session, stepId, payload) {
  const labState = labCache.get(session.id);
  if (!labState) return;

  const result = await verifyStep(session, stepId, payload);
  if (result.error) {
    session.ws.send(JSON.stringify({ type: 'error', message: result.error }));
    return;
  }
  session.ws.send(JSON.stringify(result));
}

function handleSendHint(session, stepId, tier) {
  if (typeof tier !== 'number' || tier < 0) {
    tier = 0;
  }
  const result = sendHint(session, stepId, tier);
  if (result.error) {
    session.ws.send(JSON.stringify({ type: 'error', message: result.error }));
    return;
  }
  session.ws.send(JSON.stringify(result));
}

async function handlePushConfig(session, deviceId, config) {
  const result = pushConfig(session, deviceId, config);
  if (result.error) {
    session.ws.send(JSON.stringify({ type: 'error', message: result.error }));
    return;
  }
  session.ws.send(JSON.stringify(result));
}

async function handleSyncDeviceState(session, deviceId, state) {
  // Syncs client-side device state to the session store
  const labState = labCache.get(session.id);
  if (!labState) return;

  if (!labState.deviceStates) labState.deviceStates = new Map();
  labState.deviceStates.set(deviceId, state);

  session.ws.send(JSON.stringify({ type: 'device:state:synced', deviceId }));
}

async function handleConnectCable(session, from, to, cableType) {
  const result = connectCable(session, from, to, cableType);
  if (result.error) {
    session.ws.send(JSON.stringify({ type: 'error', message: result.error }));
    return;
  }
  session.ws.send(JSON.stringify(result));
}

async function handleDisconnectCable(session, cableId) {
  const result = disconnectCable(session, cableId);
  if (result.error) {
    session.ws.send(JSON.stringify({ type: 'error', message: result.error }));
    return;
  }
  session.ws.send(JSON.stringify(result));
}

async function handleInjectError(session, errorType, target) {
  const result = injectError(session, errorType, target);
  if (result.error) {
    session.ws.send(JSON.stringify({ type: 'error', message: result.error }));
    return;
  }
  session.ws.send(JSON.stringify(result));
}

function handleSubscribeTelemetry(session, deviceIds) {
  const result = subscribeTelemetry(session, deviceIds);
  session.ws.send(JSON.stringify(result));
}

function serializeState(state) {
  return {
    ...state,
    deviceStates: Array.from(state.deviceStates.entries()),
    topology: state.topology
  };
}

module.exports = { handleMessage };