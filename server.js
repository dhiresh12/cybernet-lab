const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const NodeCache = require('node-cache');

let Redis = null;
try { Redis = require('redis'); } catch (e) { console.log('Redis not installed, using memory cache'); }

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json({ limit: '10mb' }));
app.use(express.static('../frontend/dist'));

const labCache = new NodeCache({ stdTTL: 3600 });
const redis = Redis ? Redis.createClient({ url: 'redis://localhost:6379' }) : null;
if (redis) redis.connect().catch(() => console.log('Redis not available, using memory cache'));

const labs = new Map();
const devices = new Map();
const sessions = new Map();

try {
  const fs = require('fs');
  const path = require('path');
  const labsFile = path.join(__dirname, '..', 'frontend', 'src', 'data', 'labs.procedural.json');
  if (fs.existsSync(labsFile)) {
    const raw = JSON.parse(fs.readFileSync(labsFile, 'utf8'));
    raw.forEach(lab => labs.set(String(lab.id), lab));
    console.log(`Seeded ${labs.size} labs from procedural JSON`);
  } else {
    console.log('No procedural labs file found at', labsFile);
  }
} catch (e) {
  console.log('Lab seeding failed:', e.message);
}

wss.on('connection', (ws, req) => {
  const sessionId = uuidv4();
  const session = {
    id: sessionId,
    ws,
    labId: null,
    deviceStates: new Map(),
    createdAt: Date.now(),
    lastActivity: Date.now()
  };
  sessions.set(sessionId, session);
  ws.send(JSON.stringify({ type: 'session', id: sessionId }));

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      handleMessage(session, msg);
    } catch (e) {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    sessions.delete(sessionId);
  });
});

async function handleMessage(session, msg) {
  session.lastActivity = Date.now();
  switch (msg.type) {
    case 'lab:start':
      await startLab(session, msg.labId);
      break;
    case 'lab:step:verify':
      await verifyStep(session, msg.stepId, msg.payload);
      break;
    case 'lab:hint':
      sendHint(session, msg.stepId, msg.tier);
      break;
    case 'device:config':
      await pushConfig(session, msg.deviceId, msg.config);
      break;
    case 'device:state':
      await syncDeviceState(session, msg.deviceId, msg.state);
      break;
    case 'topology:connect':
      await connectCable(session, msg.from, msg.to, msg.cableType);
      break;
    case 'topology:disconnect':
      await disconnectCable(session, msg.cableId);
      break;
    case 'error:inject':
      await injectError(session, msg.errorType, msg.target);
      break;
    case 'telemetry:subscribe':
      subscribeTelemetry(session, msg.deviceIds);
      break;
    default:
      session.ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
  }
}

async function startLab(session, labId) {
  const lab = labs.get(labId);
  if (!lab) {
    session.ws.send(JSON.stringify({ type: 'error', message: 'Lab not found' }));
    return;
  }
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
    topology: { nodes: [], edges: [] }
  };
  labCache.set(session.id, labState);
  session.ws.send(JSON.stringify({
    type: 'lab:started',
    state: serializeState(labState),
    firstStep: lab.steps[0]
  }));
}

async function verifyStep(session, stepId, payload) {
  const labState = labCache.get(session.id);
  if (!labState) return;
  const lab = labs.get(labState.labId);
  const step = lab.steps.find(s => s.id === stepId);
  if (!step) return;

  const result = await verifyStepLogic(step, payload, labState);
  if (result.passed) {
    labState.completedSteps.push(stepId);
    labState.score += result.xp || 10;
    labState.currentStep++;
    session.ws.send(JSON.stringify({
      type: 'step:passed',
      stepId,
      xp: result.xp,
      nextStep: lab.steps[labState.currentStep]
    }));
  } else {
    session.ws.send(JSON.stringify({
      type: 'step:failed',
      stepId,
      feedback: result.feedback,
      hint: result.hint
    }));
  }
}

async function verifyStepLogic(step, payload, labState) {
  const verifier = require('../simulation/verifiers');
  return verifier[step.verification.type](payload, step.verification.expected, labState);
}

function sendHint(session, stepId, tier) {
  const labState = labCache.get(session.id);
  const lab = labs.get(labState.labId);
  const step = lab.steps.find(s => s.id === stepId);
  const hint = step.hintTiers[tier];
  labState.hintsUsed++;
  session.ws.send(JSON.stringify({ type: 'hint', stepId, tier, text: hint }));
}

async function pushConfig(session, deviceId, config) {
  const labState = labCache.get(session.id);
  const device = devices.get(deviceId);
  if (!device) return;
  device.config = config;
  device.lastUpdated = Date.now();
  session.ws.send(JSON.stringify({
    type: 'device:updated',
    deviceId,
    config,
    applied: true
  }));
}

async function connectCable(session, from, to, cableType) {
  const labState = labCache.get(session.id);
  const edge = {
    id: uuidv4(),
    from,
    to,
    cableType,
    connectedAt: Date.now(),
    status: 'connected'
  };
  labState.topology.edges.push(edge);
  broadcastTopology(session, labState);
}

async function disconnectCable(session, cableId) {
  const labState = labCache.get(session.id);
  labState.topology.edges = labState.topology.edges.filter(e => e.id !== cableId);
  broadcastTopology(session, labState);
}

async function injectError(session, errorType, target) {
  const labState = labCache.get(session.id);
  const error = {
    id: uuidv4(),
    type: errorType,
    target,
    injectedAt: Date.now(),
    detected: false
  };
  if (!labState.errors) labState.errors = [];
  labState.errors.push(error);
  session.ws.send(JSON.stringify({ type: 'error:injected', error }));
}

function broadcastTopology(session, labState) {
  session.ws.send(JSON.stringify({
    type: 'topology:update',
    topology: labState.topology
  }));
}

function serializeState(state) {
  return {
    ...state,
    deviceStates: Array.from(state.deviceStates.entries()),
    topology: state.topology
  };
}

app.get('/api/labs', (req, res) => {
  const list = Array.from(labs.values()).map(l => ({
    id: l.id,
    title: l.title,
    category: l.category,
    level: l.level,
    time: l.time
  }));
  res.json(list);
});

app.get('/api/labs/:id', (req, res) => {
  const lab = labs.get(req.params.id);
  if (!lab) return res.status(404).json({ error: 'Lab not found' });
  res.json(lab);
});

app.post('/api/labs/:id/start', async (req, res) => {
  const lab = labs.get(req.params.id);
  if (!lab) return res.status(404).json({ error: 'Lab not found' });
  const labState = {
    id: uuidv4(),
    labId: req.params.id,
    currentStep: 0,
    completedSteps: [],
    score: 0,
    hintsUsed: 0,
    startTime: Date.now(),
    deviceStates: new Map(),
    topology: { nodes: [], edges: [] }
  };
  res.json(labState);
});

const userLabState = new Map();

app.get('/api/user/labs/:labId/state', (req, res) => {
  const key = req.params.labId;
  const state = userLabState.get(key);
  if (!state) return res.status(404).json({ error: 'No saved state' });
  res.json(state);
});

app.post('/api/user/labs/:labId/state', (req, res) => {
  const key = req.params.labId;
  const state = {
    ...req.body,
    savedAt: Date.now()
  };
  userLabState.set(key, state);
  res.json({ saved: true, state });
});

app.get('/api/user/progress', (req, res) => {
  const progress = [];
  userLabState.forEach((value, key) => {
    progress.push({ labId: key, ...value });
  });
  res.json(progress);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`CyberNet Lab backend running on port ${PORT}`);
});

module.exports = { app, server, labs, devices, sessions, labCache };
