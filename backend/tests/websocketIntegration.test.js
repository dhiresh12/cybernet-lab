const WebSocket = require('ws');

process.env.PORT = '0';
process.env.GRPC_PORT = '0';

jest.setTimeout(30000);

const serverModule = require('../server');
const { server, sessions, labCache } = serverModule;

const WEBSOCKET_READY_TIMEOUT = 5000;
const MESSAGE_TIMEOUT = 10000;

let port;

function getPort() {
  return new Promise((resolve) => {
    const address = server.address();
    if (address && address.port) {
      resolve(address.port);
    } else {
      server.once('listening', () => resolve(server.address().port));
    }
  });
}

function connectBufferedSocket(port, timeoutMs = WEBSOCKET_READY_TIMEOUT) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:${port}`);
    const timer = setTimeout(() => {
      ws.destroy();
      reject(new Error('WebSocket connection timeout'));
    }, timeoutMs);
    const buffer = [];
    ws.on('message', (data) => {
      try {
        buffer.push(JSON.parse(data.toString()));
      } catch (e) {
        buffer.push({ type: 'error', message: 'Invalid message format' });
      }
    });
    ws.on('open', () => {
      clearTimeout(timer);
      ws._messageBuffer = buffer;
      resolve(ws);
    });
    ws.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

function sendMessage(ws, msg) {
  return new Promise((resolve, reject) => {
    ws.send(JSON.stringify(msg), (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function receiveMessageOfType(ws, expectedType, timeoutMs = MESSAGE_TIMEOUT) {
  // First check the buffer
  if (ws._messageBuffer && ws._messageBuffer.length > 0) {
    for (let i = 0; i < ws._messageBuffer.length; i++) {
      if (ws._messageBuffer[i].type === expectedType) {
        return Promise.resolve(ws._messageBuffer.splice(i, 1)[0]);
      }
    }
  }

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timed out waiting for message type ${expectedType}`));
    }, timeoutMs);
    const handler = (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === expectedType) {
          clearTimeout(timer);
          ws.removeListener('message', handler);
          resolve(msg);
        }
      } catch (e) {
        // Ignore parse errors, wait for correct message
      }
    };
    ws.on('message', handler);
    ws.once('error', (err) => {
      clearTimeout(timer);
      ws.removeListener('message', handler);
      reject(err);
    });
  });
}

function cleanup(ws) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.close();
  }
}

describe('Backend WebSocket Integration Tests', () => {
  let ws;

  beforeAll(async () => {
    port = await getPort();
  }, WEBSOCKET_READY_TIMEOUT * 2);

  beforeEach(async () => {
    ws = await connectBufferedSocket(port);
  });

  afterEach(() => {
    cleanup(ws);
  });

  afterAll((done) => {
    serverModule.stop().catch(() => {});
    done();
  });

  describe('Session Management', () => {
    it('receives session id on connection', async () => {
      const msg = await receiveMessageOfType(ws, 'session');
      expect(msg.type).toBe('session');
      expect(msg.id).toBeDefined();
      expect(typeof msg.id).toBe('string');
    });

    it('generates unique session ids for separate connections', async () => {
      const ws2 = await connectBufferedSocket(port);
      const msg1 = await receiveMessageOfType(ws, 'session');
      const msg2 = await receiveMessageOfType(ws2, 'session');
      expect(msg1.type).toBe('session');
      expect(msg2.type).toBe('session');
      expect(msg1.id).not.toBe(msg2.id);
      cleanup(ws2);
    });

    it('handles invalid message format with error response', async () => {
      ws.send('not valid json');
      const msg = await receiveMessageOfType(ws, 'error');
      expect(msg.type).toBe('error');
      expect(msg.message).toBe('Invalid message format');
    });
  });

  describe('lab:start handler', () => {
    beforeEach(async () => {
      ws = await connectBufferedSocket(port);
      await receiveMessageOfType(ws, 'session');
    });

    it('accepts valid lab:start message and returns lab:started', async () => {
      await sendMessage(ws, { type: 'lab:start', labId: '1' });
      const msg = await receiveMessageOfType(ws, 'lab:started');
      expect(msg.type).toBe('lab:started');
      expect(msg.state).toBeDefined();
      expect(msg.state.id).toBeDefined();
      expect(msg.state.labId).toBe('1');
      expect(msg.firstStep).toBeDefined();
    });

    it('returns error for non-existent lab', async () => {
      await sendMessage(ws, { type: 'lab:start', labId: 'nonexistent' });
      const msg = await receiveMessageOfType(ws, 'error');
      expect(msg.type).toBe('error');
      expect(msg.message).toBe('Lab not found');
    });

    it('includes device states in labState', async () => {
      await sendMessage(ws, { type: 'lab:start', labId: '1' });
      const msg = await receiveMessageOfType(ws, 'lab:started');
      expect(Array.isArray(msg.state.deviceStates)).toBe(true);
    });

    it('includes topology in labState', async () => {
      await sendMessage(ws, { type: 'lab:start', labId: '1' });
      const msg = await receiveMessageOfType(ws, 'lab:started');
      expect(msg.state.topology).toBeDefined();
      expect(Array.isArray(msg.state.topology.edges)).toBe(true);
    });
  });

  describe('lab:step:verify handler', () => {
    beforeEach(async () => {
      ws = await connectBufferedSocket(port);
      await receiveMessageOfType(ws, 'session');
      await sendMessage(ws, { type: 'lab:start', labId: '1' });
      await receiveMessageOfType(ws, 'lab:started');
    });

    it('verifies step correctly when devices have matching interfaces', async () => {
      await sendMessage(ws, {
        type: 'device:state',
        deviceId: 'PC1',
        state: {
          id: 'PC1',
          hostname: 'PC1',
          interfaces: {
            Ethernet0: { ip: '192.168.1.10', mask: '255.255.255.0', status: 'up', protocol: 'up' }
          }
        }
      });
      await receiveMessageOfType(ws, 'device:state:synced');

      await sendMessage(ws, {
        type: 'device:state',
        deviceId: 'PC2',
        state: {
          id: 'PC2',
          hostname: 'PC2',
          interfaces: {
            Ethernet0: { ip: '192.168.1.1', mask: '255.255.255.0', status: 'up', protocol: 'up' }
          }
        }
      });
      await receiveMessageOfType(ws, 'device:state:synced');

      await sendMessage(ws, {
        type: 'lab:step:verify',
        stepId: '1-S-01',
        payload: { sourceDeviceId: 'PC1', targetIp: '192.168.1.1' }
      });

      const msg = await receiveMessageOfType(ws, 'step:passed', 10000);
      expect(msg.type).toBe('step:passed');
      expect(msg.stepId).toBe('1-S-01');
    });

    it('returns error when no active lab session', async () => {
      const orphanWs = await connectBufferedSocket(port);
      await receiveMessageOfType(orphanWs, 'session');

      await sendMessage(orphanWs, {
        type: 'lab:step:verify',
        stepId: '1-S-01',
        payload: {}
      });

      const msg = await receiveMessageOfType(orphanWs, 'error');
      expect(msg.type).toBe('error');
      expect(msg.message).toBe('No active lab session');
      cleanup(orphanWs);
    });

    it('returns error for non-existent step', async () => {
      await sendMessage(ws, { type: 'lab:step:verify', stepId: 'nonexistent', payload: {} });
      const msg = await receiveMessageOfType(ws, 'error');
      expect(msg.type).toBe('error');
      expect(msg.message).toBe('Step not found');
    });
  });

  describe('lab:hint handler', () => {
    beforeEach(async () => {
      ws = await connectBufferedSocket(port);
      await receiveMessageOfType(ws, 'session');
      await sendMessage(ws, { type: 'lab:start', labId: '1' });
      await receiveMessageOfType(ws, 'lab:started');
    });

    it('returns hint for valid step and tier', async () => {
      await sendMessage(ws, { type: 'lab:hint', stepId: '1-S-01', tier: 0 });
      const msg = await receiveMessageOfType(ws, 'hint');
      expect(msg.type).toBe('hint');
      expect(msg.stepId).toBe('1-S-01');
      expect(msg.tier).toBe(0);
      expect(msg.text).toBeDefined();
    });

    it('returns error when tier is not a valid number', async () => {
      await sendMessage(ws, { type: 'lab:hint', stepId: '1-S-01', tier: 'invalid' });
      const msg = await receiveMessageOfType(ws, 'error');
      expect(msg.type).toBe('error');
      expect(msg.message).toBe('invalid tier');
    });

    it('returns error when tier is negative', async () => {
      await sendMessage(ws, { type: 'lab:hint', stepId: '1-S-01', tier: -1 });
      const msg = await receiveMessageOfType(ws, 'error');
      expect(msg.type).toBe('error');
      expect(msg.message).toBe('invalid tier');
    });

    it('returns error when no active lab session', async () => {
      const orphanWs = await connectBufferedSocket(port);
      await receiveMessageOfType(orphanWs, 'session');

      await sendMessage(orphanWs, { type: 'lab:hint', stepId: '1-S-01', tier: 0 });
      const msg = await receiveMessageOfType(orphanWs, 'error');
      expect(msg.type).toBe('error');
      expect(msg.message).toBe('No active lab session');
      cleanup(orphanWs);
    });
  });

  describe('device:config handler', () => {
    beforeEach(async () => {
      ws = await connectBufferedSocket(port);
      await receiveMessageOfType(ws, 'session');
      await sendMessage(ws, { type: 'lab:start', labId: '1' });
      await receiveMessageOfType(ws, 'lab:started');
    });

    it('configures device and returns device:updated', async () => {
      await sendMessage(ws, {
        type: 'device:config',
        deviceId: 'PC1',
        config: { hostname: 'Router1', ip: '192.168.1.1' }
      });
      const msg = await receiveMessageOfType(ws, 'device:updated');
      expect(msg.type).toBe('device:updated');
      expect(msg.deviceId).toBe('PC1');
      expect(msg.applied).toBe(true);
    });

    it('returns error when no active lab session', async () => {
      const orphanWs = await connectBufferedSocket(port);
      await receiveMessageOfType(orphanWs, 'session');

      await sendMessage(orphanWs, {
        type: 'device:config',
        deviceId: 'PC1',
        config: {}
      });
      const msg = await receiveMessageOfType(orphanWs, 'error');
      expect(msg.type).toBe('error');
      expect(msg.message).toBe('No active lab session');
      cleanup(orphanWs);
    });
  });

  describe('device:state handler', () => {
    beforeEach(async () => {
      ws = await connectBufferedSocket(port);
      await receiveMessageOfType(ws, 'session');
      await sendMessage(ws, { type: 'lab:start', labId: '1' });
      await receiveMessageOfType(ws, 'lab:started');
    });

    it('syncs device state and returns confirmation', async () => {
      await sendMessage(ws, {
        type: 'device:state',
        deviceId: 'PC1',
        state: {
          interfaces: {
            Ethernet0: { ip: '192.168.1.10', status: 'up', protocol: 'up' }
          }
        }
      });
      const msg = await receiveMessageOfType(ws, 'device:state:synced');
      expect(msg.type).toBe('device:state:synced');
      expect(msg.deviceId).toBe('PC1');
    });
  });

  describe('topology:connect handler', () => {
    beforeEach(async () => {
      ws = await connectBufferedSocket(port);
      await receiveMessageOfType(ws, 'session');
      await sendMessage(ws, { type: 'lab:start', labId: '1' });
      await receiveMessageOfType(ws, 'lab:started');
    });

    it('connects devices and returns topology:update', async () => {
      await sendMessage(ws, {
        type: 'topology:connect',
        from: 'PC1',
        to: 'PC2',
        cableType: 'ethernet'
      });
      const msg = await receiveMessageOfType(ws, 'topology:update');
      expect(msg.type).toBe('topology:update');
      expect(msg.topology).toBeDefined();
      expect(Array.isArray(msg.topology.edges)).toBe(true);
    });

    it('returns error when no active lab session', async () => {
      const orphanWs = await connectBufferedSocket(port);
      await receiveMessageOfType(orphanWs, 'session');

      await sendMessage(orphanWs, {
        type: 'topology:connect',
        from: 'A',
        to: 'B',
        cableType: 'ethernet'
      });
      const msg = await receiveMessageOfType(orphanWs, 'error');
      expect(msg.type).toBe('error');
      expect(msg.message).toBe('No active lab session');
      cleanup(orphanWs);
    });
  });

  describe('telemetry:subscribe handler', () => {
    beforeEach(async () => {
      ws = await connectBufferedSocket(port);
      await receiveMessageOfType(ws, 'session');
      await sendMessage(ws, { type: 'lab:start', labId: '1' });
      await receiveMessageOfType(ws, 'lab:started');
    });

    it('subscribes to telemetry for device ids', async () => {
      await sendMessage(ws, { type: 'telemetry:subscribe', deviceIds: ['PC1', 'PC2'] });
      const msg = await receiveMessageOfType(ws, 'telemetry:subscribed');
      expect(msg.type).toBe('telemetry:subscribed');
      expect(msg.deviceIds).toEqual(['PC1', 'PC2']);
    });

    it('handles empty deviceIds', async () => {
      await sendMessage(ws, { type: 'telemetry:subscribe', deviceIds: [] });
      const msg = await receiveMessageOfType(ws, 'telemetry:subscribed');
      expect(msg.type).toBe('telemetry:subscribed');
      expect(msg.deviceIds).toEqual([]);
    });
  });

  describe('Error handling', () => {
    it('returns error for unknown message type', async () => {
      await sendMessage(ws, { type: 'unknown:message' });
      const msg = await receiveMessageOfType(ws, 'error');
      expect(msg.type).toBe('error');
      expect(msg.message).toBe('Unknown message type');
    });

    it('returns error for missing labId in lab:start', async () => {
      await sendMessage(ws, { type: 'lab:start' });
      const msg = await receiveMessageOfType(ws, 'error');
      expect(msg.type).toBe('error');
      expect(msg.message).toBe('missing labId');
    });

    it('returns error for missing stepId in lab:step:verify', async () => {
      await sendMessage(ws, { type: 'lab:step:verify', payload: {} });
      const msg = await receiveMessageOfType(ws, 'error');
      expect(msg.type).toBe('error');
      expect(msg.message).toBe('missing stepId');
    });

    it('returns error for missing stepId in lab:hint', async () => {
      await sendMessage(ws, { type: 'lab:hint' });
      const msg = await receiveMessageOfType(ws, 'error');
      expect(msg.type).toBe('error');
      expect(msg.message).toBe('missing stepId');
    });
  });
});