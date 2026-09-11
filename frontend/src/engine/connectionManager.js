export default class ConnectionManager {
  constructor() {
    this.ws = null;
    this._connected = false;
    this._localMode = false;
    this.listeners = new Map();
    this._pending = new Map();
    this.reconnectAttempts = 0;
  }

  connect(onOpen, onMessage, onClose, onError) {
    if (this._localMode) return;
    try {
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      this.ws = new WebSocket(`${proto}//${window.location.host}`);
      this.ws.onopen = () => {
        console.log('[ConnectionManager] WS connected');
        this._connected = true;
        this.reconnectAttempts = 0;
        this.emit('connection:open', {});
        onOpen?.();
      };
      this.ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          this._handleMessage(msg);
          onMessage?.(msg);
        } catch (e) {
          console.error('[ConnectionManager] Failed to parse message', e);
        }
      };
      this.ws.onclose = () => {
        console.log('[ConnectionManager] WS closed, reconnecting...');
        this._connected = false;
        this.emit('connection:close', {});
        onClose?.();
        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        setTimeout(() => {
          if (!this._connected && !this._localMode) this.connect(onOpen, onMessage, onClose, onError);
        }, delay);
      };
      this.ws.onerror = (err) => {
        console.warn('[ConnectionManager] WS error, falling back to local mode');
        this._localMode = true;
        this._connected = false;
        this.emit('mode:local', {});
        onError?.(err);
      };
    } catch (e) {
      console.warn('[ConnectionManager] WebSocket unavailable, using local mode');
      this._localMode = true;
      this.emit('mode:local', {});
    }
  }

  _handleMessage(msg) {
    const { type } = msg;
    if (this._pending.has(type)) {
      const { resolve, timer } = this._pending.get(type);
      clearTimeout(timer);
      this._pending.delete(type);
      resolve(msg);
    }
    this.emit(type, msg);
  }

  _send(msg) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
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
      try { fn(msg); } catch (e) { console.error('[ConnectionManager] Listener error', e); }
    });
  }

  isConnected() {
    return this._connected;
  }

  isLocalMode() {
    return this._localMode;
  }

  send(msg) {
    return this._send(msg);
  }

  waitFor(type, timeout = 10000) {
    return this._waitFor(type, timeout);
  }

  destroy() {
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
    this._pending.forEach(({ timer }) => clearTimeout(timer));
    this._pending.clear();
    this.listeners.clear();
  }
}