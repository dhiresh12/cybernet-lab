const { labs } = require('../data/labLoader');
const { labCache, userLabState } = require('../state/state');
const { v4: uuidv4 } = require('uuid');
const { isQuarantined, evaluateLabQuality } = require('../services/labQualityService');

/**
 * HTTP route handlers for the lab API.
 */

function handleGetLabs(req, res) {
  const list = Array.from(labs.values())
    .filter(lab => !isQuarantined(lab.id))
    .map(l => ({
      id: l.id,
      title: l.title,
      category: l.category,
      level: l.level,
      time: l.time
    }));
  res.json(list);
}

function handleGetLab(req, res) {
  const lab = labs.get(req.params.id);
  if (!lab) return res.status(404).json({ error: 'Lab not found' });
  if (isQuarantined(lab.id)) return res.status(404).json({ error: 'Lab not found' });
  res.json(lab);
}

function handleStartLab(req, res) {
  const lab = labs.get(req.params.id);
  if (!lab || isQuarantined(lab.id)) return res.status(404).json({ error: 'Lab not found' });

  const sessionId = uuidv4();

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

  labCache.set(sessionId, labState);

  const serialized = {
    ...labState,
    deviceStates: Array.from(labState.deviceStates.entries()),
    topology: labState.topology
  };

  res.json({ sessionId, labState: serialized });
}

function handleGetActiveSession(req, res) {
  const lab = labs.get(req.params.id);
  if (!lab) return res.status(404).json({ error: 'Lab not found' });

  const sessionId = req.params.sessionId;
  const labState = labCache.get(sessionId);

  if (!labState) {
    return res.status(404).json({ error: 'No active session found' });
  }
  if (String(labState.labId) !== String(req.params.id)) {
    return res.status(404).json({ error: 'No active session found' });
  }

  const serialized = {
    ...labState,
    deviceStates: Array.from(labState.deviceStates.entries()),
    topology: labState.topology
  };

  res.json({ sessionId, labId: labState.labId, labState: serialized });
}

function handleResetSession(req, res) {
  const sessionId = req.params.sessionId;
  const existing = labCache.get(sessionId);

  if (!existing) {
    return res.status(404).json({ error: 'No active session found' });
  }
  if (String(existing.labId) !== String(req.params.id)) {
    return res.status(404).json({ error: 'No active session found' });
  }

  labCache.delete(sessionId);

  res.json({ reset: true, sessionId });
}

function handleGetUserLabState(req, res) {
  const key = req.params.labId;
  const state = userLabState.get(key);
  if (!state) return res.status(404).json({ error: 'No saved state' });
  res.json(state);
}

function handleSaveUserLabState(req, res) {
  const key = req.params.labId;
  const state = {
    ...req.body,
    savedAt: Date.now()
  };

  userLabState.set(key, state);
  res.json({ saved: true, state });
}

function handleGetUserProgress(req, res) {
  const progress = [];
  userLabState.forEach((value, key) => {
    progress.push({ labId: key, ...value });
  });
  res.json(progress);
}

module.exports = {
  handleGetLabs,
  handleGetLab,
  handleStartLab,
  handleGetActiveSession,
  handleResetSession,
  handleGetUserLabState,
  handleSaveUserLabState,
  handleGetUserProgress
};
