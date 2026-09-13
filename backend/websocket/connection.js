const { v4: uuidv4 } = require('uuid');

const { sessions, labCache, userLabState } = require('../state/state');

const ALLOWED_ORIGINS = new Set([
  `http://localhost:${process.env.PORT || 3000}`,
  `http://127.0.0.1:${process.env.PORT || 3000}`,
  `https://localhost:${process.env.PORT || 3000}`,
]);

function isOriginAllowed(req) {
  const origin = req.headers.origin || req.headers['sec-websocket-origin'];
  if (!origin) return true; // Allow connections without origin (e.g., CLI tools)
  return ALLOWED_ORIGINS.has(origin);
}

function handleConnection(ws, req, handleMessage) {
  if (!isOriginAllowed(req)) {
    ws.close(1008, 'Origin not allowed');
    return;
  }
   const sessionId = uuidv4();
   const session = {
     id: sessionId,
     ws,
     labId: null,
     deviceStates: new Map(),
     createdAt: Date.now(),
     lastActivity: Date.now(),
     telemetrySubscriptions: []
   };

   sessions.set(sessionId, session);
   labCache.delete(sessionId);

   ws.sessionId = sessionId;
   ws.send(JSON.stringify({ type: 'session', id: sessionId }));

   ws.on('message', async (data) => {
     try {
       const msg = JSON.parse(data.toString());
       await handleMessage(session, msg);
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