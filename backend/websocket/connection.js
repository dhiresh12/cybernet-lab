const { v4: uuidv4 } = require('uuid');

const { sessions, labCache, userLabState } = require('../state/state');

/**
 * WebSocket connection lifecycle handler.
 * Sets up per-session state and wires message/close handlers.
 */
function handleConnection(ws, req, handleMessage) {
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
  labCache.delete(sessionId);

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
    labCache.delete(sessionId);
  });

  ws.on('error', () => {
    sessions.delete(sessionId);
    labCache.delete(sessionId);
  });
}

module.exports = { handleConnection };