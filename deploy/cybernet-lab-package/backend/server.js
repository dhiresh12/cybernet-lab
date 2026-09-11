const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static('../frontend/dist'));

const { loadLabs } = require('./data/labLoader');
const { handleMessage } = require('./websocket/messages');
const { handleConnection } = require('./websocket/connection');
const { handleGetLabs, handleGetLab, handleStartLab, handleGetActiveSession, handleResetSession, handleGetUserLabState, handleSaveUserLabState, handleGetUserProgress } = require('./routes/apiRoutes');

const { app: expressApp, server: httpServer, labs, devices, sessions, labCache, userLabState } = require('./state/state');

loadLabs();

app.get('/api/labs', handleGetLabs);
app.get('/api/labs/:id', handleGetLab);
app.post('/api/labs/:id/start', handleStartLab);
app.get('/api/labs/:id/active-session/:sessionId', handleGetActiveSession);
app.post('/api/labs/:id/reset-session/:sessionId', handleResetSession);
app.get('/api/user/labs/:labId/state', handleGetUserLabState);
app.post('/api/user/labs/:labId/state', handleSaveUserLabState);
app.get('/api/user/progress', handleGetUserProgress);

wss.on('connection', (ws, req) => {
  handleConnection(ws, req, (session, msg) => {
    (async () => {
      const result = await handleMessage(session, msg);
      if (result) session.ws.send(JSON.stringify(result));
    })();
  });
});

server.listen(PORT, () => {
  console.log(`CyberNet Lab backend running on port ${PORT}`);
});

module.exports = {
  app,
  server,
  wss,
  labs,
  devices,
  sessions,
  labCache,
  userLabState
};