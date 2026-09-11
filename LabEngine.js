import verifiers from '../simulation/verifiers';

export default class LabEngine {
  constructor(audio) {
    this.audio = audio;
    this.ws = null;
    this.sessionId = null;
    this.labId = null;
    this.state = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
  }

  connect() {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.ws = new WebSocket(`${proto}//${window.location.host}`);
    this.ws.onopen = () => {
      console.log('WS connected');
      this.reconnectAttempts = 0;
    };
    this.ws.onmessage = (evt) => {
      const msg = JSON.parse(evt.data);
      this.emit(msg.type, msg);
    };
    this.ws.onclose = () => {
      setTimeout(() => this.connect(), 1000 * Math.min(++this.reconnectAttempts, 10));
    };
  }

  on(type, fn) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(fn);
  }

  emit(type, msg) {
    const fns = this.listeners.get(type) || [];
    fns.forEach(fn => fn(msg));
  }

  async startLab(labId) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) this.connect();
    await new Promise(resolve => {
      const handler = (msg) => {
        if (msg.type === 'session') {
          this.sessionId = msg.id;
          this.ws.send(JSON.stringify({ type: 'lab:start', labId }));
          this.off('session', handler);
          resolve();
        }
      };
      this.on('session', handler);
    });
  }

  async verifyStep(stepId, payload) {
    return new Promise((resolve) => {
      const handler = (msg) => {
        if (msg.type === 'step:passed' || msg.type === 'step:failed') {
          this.off(msg.type, handler);
          resolve(msg);
        }
      };
      this.on('step:passed', handler);
      this.on('step:failed', handler);
      this.ws.send(JSON.stringify({ type: 'lab:step:verify', stepId, payload }));
    });
  }

  sendHint(tier) {
    if (!this.ws || !this.state) return;
    this.ws.send(JSON.stringify({ type: 'lab:hint', stepId: this.state.currentStep.id, tier }));
  }

  async pushConfig(deviceId, config) {
    if (!this.ws) return;
    this.ws.send(JSON.stringify({ type: 'device:config', deviceId, config }));
  }

  async connectCable(from, to, cableType) {
    if (!this.ws) return;
    this.ws.send(JSON.stringify({ type: 'topology:connect', from, to, cableType }));
  }

  off(type, fn) {
    const fns = this.listeners.get(type) || [];
    this.listeners.set(type, fns.filter(f => f !== fn));
  }
}
