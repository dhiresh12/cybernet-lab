require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid');
const { loadLabs } = require('./data/labLoader');
const { handleConnection } = require('./websocket/connection');
const { handleMessage } = require('./websocket/messages');
const {
  handleGetLabs,
  handleGetLab,
  handleStartLab,
  handleGetActiveSession,
  handleResetSession,
  handleGetUserLabState,
  handleSaveUserLabState,
  handleGetUserProgress
} = require('./routes/apiRoutes');
const { RedisClient } = require('./services/redis');
const { PostgresClient } = require('./services/postgres');
const { GRPCServer } = require('./services/grpc');
const { DeviceManager } = require('./services/deviceManager');
const { LabEngine } = require('./services/labEngine');
const { TelemetryStream } = require('./services/telemetry');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(helmet());
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const GRPC_PORT = process.env.GRPC_PORT || 50051;

const redisClient = new RedisClient();
const postgresClient = new PostgresClient();
const deviceManager = new DeviceManager();
const labEngine = new LabEngine();
const telemetryStream = new TelemetryStream();

loadLabs();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '4.0.0', timestamp: Date.now() });
});

app.get('/api/labs', handleGetLabs);
app.get('/api/labs/:id', handleGetLab);
app.post('/api/labs/:id/start', handleStartLab);
app.get('/api/labs/:id/sessions/:sessionId', handleGetActiveSession);
app.delete('/api/labs/:id/sessions/:sessionId', handleResetSession);
app.get('/api/labs/:id/state', handleGetUserLabState);
app.put('/api/labs/:id/state', handleSaveUserLabState);
app.get('/api/progress', handleGetUserProgress);

app.get('/api/telemetry', async (req, res) => {
  try {
    const telemetry = await telemetryStream.getLatest();
    res.json(telemetry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inject-error', async (req, res) => {
  try {
    const { labId, errorType } = req.body;
    const result = await labEngine.injectError(labId, errorType);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/lab-config/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const config = req.body;
    const result = await labEngine.pushConfig(id, config);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reset-lab/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await labEngine.resetLab(id);
    res.json({ success: true, message: `Lab ${id} reset` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

wss.on('connection', (ws, req) => {
  handleConnection(ws, req, (session, msg) => handleMessage(session, msg));
});

async function startTelemetryBroadcast() {
  setInterval(async () => {
    const telemetry = await telemetryStream.getLatest();
    if (telemetry) {
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'telemetry', data: telemetry }));
        }
      });
    }
  }, 1000);
}

async function init() {
  try {
    await redisClient.connect();
    const pgOk = await postgresClient.connect();
    if (pgOk) await postgresClient.initializeSchema();
    
    deviceManager.initializeDevices();
    labEngine.initialize(postgresClient, redisClient, deviceManager);
    telemetryStream.initialize(deviceManager);
    
    const grpcServer = new GRPCServer(deviceManager, labEngine, telemetryStream);
    grpcServer.start(GRPC_PORT);
    
    startTelemetryBroadcast();
    
    server.listen(PORT, () => {
      console.log(`CyberNet Lab Backend v4.0 running on port ${PORT}`);
      console.log(`WebSocket server ready`);
      console.log(`gRPC server running on port ${GRPC_PORT}`);
      if (pgOk) console.log(`PostgreSQL connected`);
      else console.log(`PostgreSQL not available (in-memory mode)`);
      console.log(`Redis ${redisClient.isUsingMemory() ? 'using in-memory store' : 'connected'}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

init();

process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await redisClient.disconnect();
  await postgresClient.disconnect();
  process.exit(0);
});
