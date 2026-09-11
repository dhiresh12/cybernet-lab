import ConnectionManager from './connectionManager.js';
import {
  createLabRuntimeState,
  resetLabState,
  validateLabRuntimeState,
  LAB_RUNTIME_EVENTS,
  STATE_OWNERSHIP,
  STATE_SOURCES,
  createEvent,
  applyStateEvent,
} from './LabRuntimeState.js';
import {
  getDevice,
  getInterface,
  getConnections,
  getRoutingState,
  getConfiguration,
  getLogs,
  getTelemetry,
  updateDevice,
  updateInterface,
  updateConfiguration,
  updateVlan,
  updateRoute,
  updateConnection,
  addLog,
  updateTelemetry,
  pushHistory,
  serializeState,
} from './LabStateEngine.js';
import { SimulationRuntimeBridge } from './SimulationRuntimeBridge.js';

export default class LabEngine {
  constructor(audio) {
    this.audio = audio;
    this.connection = new ConnectionManager();
    this.sessionId = null;
    this.labId = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this._pending = new Map();
    this._connected = false;
    this._localMode = false;
    this._simulationBridge = null;
    this.state = {
      runtime: createLabRuntimeState({ id: null }, { devices: [] }),
      labId: null,
      currentStep: 0,
      completedSteps: [],
      score: 0,
      hintsUsed: 0,
      startTime: null,
      topology: { nodes: [], edges: [] },
      errors: [],
      active: false
    };
    this.connection.on('connection:open', () => {
      this._connected = true;
      this.reconnectAttempts = 0;
      this.emit('connection:open', {});
    });
    this.connection.on('connection:close', () => {
      this._connected = false;
      this.emit('connection:close', {});
    });
    this.connection.on('mode:local', () => {
      this._localMode = true;
      this._connected = false;
      this.emit('mode:local', {});
    });
  }

  connect() {
    this.connection.connect(
      undefined,
      (msg) => this._handleMessage(msg),
      undefined,
      undefined
    );
  }

  disconnect() {
    this.connection.destroy();
    this._connected = false;
    this._localMode = false;
    this.emit('connection:close', {});
  }

  _handleMessage(msg) {
    const { type } = msg;
    if (this._pending.has(type)) {
      const { resolve, reject, timer } = this._pending.get(type);
      clearTimeout(timer);
      this._pending.delete(type);
      resolve(msg);
    }
    this.emit(type, msg);

    if (type === 'lab:started') {
      this._applyState(msg.state);
      this.emit('lab:active', { labId: this.state.labId, state: this.state });
    }
    if (type === 'step:passed') {
      this.state.completedSteps.push(msg.stepId);
      this.state.score += msg.xp || 10;
      this.state.currentStep++;
      this.emit('step:completed', { stepId: msg.stepId, xp: msg.xp, nextStep: msg.nextStep });
    }
    if (type === 'step:failed') {
      this.emit('step:failed', { stepId: msg.stepId, feedback: msg.feedback, hint: msg.hint });
    }
    if (type === 'topology:update') {
      this.state.topology = msg.topology;
      this.emit('topology:changed', msg.topology);
    }
    if (type === 'device:updated') {
      if (!this.state.runtime) {
        this.state.runtime = createLabRuntimeState({ id: this.state.labId }, { devices: [] });
      }
      this.state.runtime = updateConfiguration(this.state.runtime, msg.deviceId, msg.config);
      this.emit('device:changed', { deviceId: msg.deviceId, config: msg.config });
    }
    if (type === 'error:injected') {
      this.state.errors.push(msg.error);
      this.emit('error:injected', msg.error);
    }
    if (type === 'lab:state:sync') {
      this._applyState(msg.state);
      this.emit('state:sync', this.state);
    }
  }

  _applyState(backendState) {
    if (!backendState) return;
    this.state.labId = backendState.labId || this.state.labId;
    this.state.currentStep = backendState.currentStep ?? this.state.currentStep;
    this.state.completedSteps = backendState.completedSteps || this.state.completedSteps;
    this.state.score = backendState.score ?? this.state.score;
    this.state.hintsUsed = backendState.hintsUsed ?? this.state.hintsUsed;
    this.state.startTime = backendState.startTime || this.state.startTime;
    this.state.topology = backendState.topology || this.state.topology;
    this.state.active = true;
  }

  _send(msg) {
    if (this.connection.isConnected()) {
      this.connection.send(msg);
      return true;
    }
    return false;
  }

  _waitFor(type, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this._pending.delete(type);
        resolve(null);
      }, timeout);
      this._pending.set(type, { resolve, reject, timer });
    });
  }

  on(type, fn) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(fn);
    return () => this.off(type, fn);
  }

  off(type, fn) {
    const fns = this.listeners.get(type) || [];
    this.listeners.set(type, fns.filter(f => f !== fn));
  }

  emit(type, msg) {
    const fns = this.listeners.get(type) || [];
    fns.forEach(fn => {
      try { fn(msg); } catch (e) { console.error('[LabEngine] Listener error', e); }
    });
  }

  getState() {
    return { ...this.state };
  }

  isConnected() {
    return this._connected;
  }

  isLocalMode() {
    return this._localMode;
  }

  async startLab(labId, labDefinition) {
    this.state.labId = labId;
    this.state.active = true;
    this.state.startTime = Date.now();
    this.state.runtime = createLabRuntimeState(labDefinition || { id: labId }, labDefinition?.initialState);
    this.emit('lab:starting', { labId });

    if (!this._localMode && !this._connected) {
      this.connect();
    }

    if (this._localMode || !this._connected) {
      this._localMode = true;
      this.emit('mode:local', {});
      this.emit('lab:active', { labId, state: this.state });
      return this.state;
    }

    await new Promise(resolve => {
      const handler = (msg) => {
        if (msg.type === 'session') {
          this.sessionId = msg.id;
          this._send({ type: 'lab:start', labId });
          this.off('session', handler);
          resolve();
        }
      };
      this.on('session', handler);
      this._waitFor('session', 5000).then(() => {
        this.off('session', handler);
        resolve();
      });
    });

    const result = await this._waitFor('lab:started', 15000);
    return result ? result.state : this.state;
  }

  async verifyStep(stepId, payload) {
    if (this._localMode || !this._connected) {
      return this._localVerify(stepId, payload);
    }

    return new Promise((resolve) => {
      const onPassed = (msg) => {
        if (msg.stepId === stepId) {
          this.off('step:passed', onPassed);
          this.off('step:failed', onFailed);
          resolve(msg);
        }
      };
      const onFailed = (msg) => {
        if (msg.stepId === stepId) {
          this.off('step:passed', onPassed);
          this.off('step:failed', onFailed);
          resolve(msg);
        }
      };
      this.on('step:passed', onPassed);
      this.on('step:failed', onFailed);
      this._send({ type: 'lab:step:verify', stepId, payload });

      setTimeout(() => {
        this.off('step:passed', onPassed);
        this.off('step:failed', onFailed);
        resolve({ type: 'step:failed', stepId, feedback: 'Verification timed out' });
      }, 15000);
    });
  }

  _localVerify(stepId, payload) {
    const step = this._currentLabStep(stepId);
    if (!step) {
      return { passed: false, feedback: 'Step not found', hint: 'Check lab configuration' };
    }

    const vType = step.verification?.type || 'typing';
    const expected = step.verification?.expected;
    let passed = false;
    let xp = 0;
    let feedback = '';
    let hint = null;

    switch (vType) {
      case 'cli': {
        const input = String(payload.input || '').toLowerCase().trim();
        const cmds = Array.isArray(expected) ? expected : [expected];
        const normalizedInput = input.split('\n').map(l => l.trim()).filter(Boolean);
        passed = cmds.every(cmd => {
          const norm = String(cmd).toLowerCase().trim();
          return normalizedInput.some(l => l === norm || l.includes(norm));
        });
        xp = passed ? 10 : 0;
        feedback = passed ? 'Command verified.' : `Expected: ${cmds.join(' | ')}`;
        hint = passed ? null : 'Check command syntax and context.';
        break;
      }
      case 'config': {
        const input = String(payload.input || '').toLowerCase().trim();
        const sim = this._similarity(input, String(expected || '').toLowerCase());
        passed = sim >= 0.85;
        xp = passed ? 15 : Math.floor(sim * 15);
        feedback = passed ? 'Configuration accepted.' : `Match: ${Math.round(sim * 100)}%`;
        hint = passed ? null : 'Review the expected configuration and match it closely.';
        break;
      }
      case 'typing': {
        const input = String(payload.input || '').trim();
        const sim = this._similarity(input, String(expected || '').trim());
        passed = sim >= 0.9;
        xp = passed ? 10 : Math.floor(sim * 10);
        feedback = passed ? 'Accepted.' : `Match: ${Math.round(sim * 100)}%`;
        hint = passed ? null : 'Type the exact text shown.';
        break;
      }
      case 'option': {
        const selected = String(payload.selected || '').toLowerCase().trim();
        passed = selected === String(expected || '').toLowerCase().trim();
        xp = passed ? 10 : 0;
        feedback = passed ? 'Correct.' : 'Incorrect choice.';
        hint = passed ? null : 'Review the lab concepts.';
        break;
      }
      case 'topology': {
        const actualNodes = payload.nodes || [];
        const actualEdges = payload.edges || [];
        const expNodes = expected?.nodes || [];
        const expEdges = expected?.edges || [];
        const nodesOk = actualNodes.length >= expNodes.length &&
          expNodes.every(en => actualNodes.some(an => an.type === en.type && an.id === en.id));
        const edgesOk = actualEdges.length >= expEdges.length &&
          expEdges.every(ee => actualEdges.some(ae => ae.from === ee.from && ae.to === ee.to));
        passed = nodesOk && edgesOk;
        xp = passed ? 15 : 0;
        feedback = passed ? 'Topology verified.' : 'Missing devices or connections.';
        hint = passed ? null : 'Ensure all required devices are placed and connected.';
        break;
      }
      default: {
        passed = !!payload.completed;
        xp = passed ? 10 : 0;
        feedback = passed ? 'Step completed.' : 'Complete all requirements.';
        hint = passed ? null : 'Follow the step instructions carefully.';
      }
    }

    if (passed) {
      this.state.completedSteps.push(stepId);
      this.state.score += xp;
      this.state.currentStep++;
      this.emit('step:completed', { stepId, xp, nextStep: null });
    } else {
      this.emit('step:failed', { stepId, feedback, hint });
    }

    return { passed, xp, feedback, hint };
  }

  _currentLabStep(stepId) {
    return null;
  }

  _similarity(a, b) {
    if (a === b) return 1;
    if (!a || !b) return 0;
    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;
    const dist = this._levenshtein(longer, shorter);
    return (longer.length - dist) / longer.length;
  }

  _levenshtein(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1];
        else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
      }
    }
    return matrix[b.length][a.length];
  }

  sendHint(stepId, tier) {
    if (this._localMode) {
      this.state.hintsUsed++;
      this.emit('hint', { stepId, tier, text: 'Use show commands to verify your configuration.' });
      return;
    }
    this._send({ type: 'lab:hint', stepId, tier });
  }

  async pushConfig(deviceId, config) {
    if (this._localMode) {
      if (!this.state.runtime) {
        this.state.runtime = createLabRuntimeState({ id: this.state.labId }, { devices: [] });
      }
      this.state.runtime = updateConfiguration(this.state.runtime, deviceId, config);
      this.state.runtime = addLog(this.state.runtime, { deviceId, action: 'CONFIG_CHANGED', details: config });
      this.emit('device:changed', { deviceId, config });
      return;
    }
    this._send({ type: 'device:config', deviceId, config });
  }

  async connectCable(from, to, cableType) {
    if (this._localMode) {
      if (!this.state.runtime) {
        this.state.runtime = createLabRuntimeState({ id: this.state.labId }, { devices: [] });
      }
      const edge = { id: `edge-${Date.now()}`, from, to, cableType, status: 'connected' };
      this.state.runtime = updateConnection(this.state.runtime, edge.id, edge);
      this.state.topology.edges.push(edge);
      this.emit('topology:changed', this.state.topology);
      return;
    }
    this._send({ type: 'topology:connect', from, to, cableType });
  }

  async disconnectCable(cableId) {
    if (this._localMode) {
      if (!this.state.runtime) {
        this.state.runtime = createLabRuntimeState({ id: this.state.labId }, { devices: [] });
      }
      this.state.runtime = updateConnection(this.state.runtime, cableId, () => undefined);
      this.state.topology.edges = this.state.topology.edges.filter(e => e.id !== cableId);
      this.emit('topology:changed', this.state.topology);
      return;
    }
    this._send({ type: 'topology:disconnect', cableId });
  }

  resetLab() {
    this.state.currentStep = 0;
    this.state.completedSteps = [];
    this.state.score = 0;
    this.state.hintsUsed = 0;
    this.state.topology = { nodes: [], edges: [] };
    this.state.errors = [];
    this.state.startTime = Date.now();
    this.state.runtime = resetLabState(this.state.runtime, this.state.labId);
    if (this._simulationBridge) {
      this._simulationBridge.resetRuntime();
    }
    this.emit('lab:reset', this.state);
  }

  attachSimulationEngine(simulationEngine) {
    this.detachSimulationEngine();
    this._simulationBridge = new SimulationRuntimeBridge({
      simulation: simulationEngine,
      runtime: this.state.runtime,
      setRuntime: (runtime) => {
        this.state.runtime = runtime;
        this.emit('runtime:changed', runtime);
      }
    });
    this._simulationBridge.bind();
    if (typeof this._simulationBridge.syncAll === 'function') {
      this._simulationBridge.syncAll();
    }
    return this._simulationBridge;
  }

  detachSimulationEngine() {
    if (this._simulationBridge) {
      this._simulationBridge.unbind();
      this._simulationBridge = null;
    }
    return this;
  }

  destroy() {
    if (this.connection) {
      this.connection.destroy();
    }
    this._pending.forEach(({ timer }) => clearTimeout(timer));
    this._pending.clear();
    this.detachSimulationEngine();
    this.listeners.clear();
    this.state.active = false;
  }
}