const { logger } = require('./services/logger');
require('./services/loggerInit');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid');
const { loadLabs, labs } = require('./data/labLoader');
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
  handleGetUserProgress,
  handleGetLearnerProgress,
  handleGetLearnerLabProgress,
  handleStartLearnerLab,
  handleCompleteLearnerLab,
  handleGetAvailableLabs,
  handleGetLockedLabs,
  handleCreateTicket,
  handleGetTickets,
  handleGetTicket,
  handleUpdateTicketStatus,
  handleUpdateTicket,
  handleAddEvidence,
  handleAddInvestigationStep,
  handleAssignTicket,
  handleCloseTicket,
  handleDeleteTicket,
  handleSearchTickets,
  handleGetTicketStats,
  handleGetRoadmap,
  handleGetRoadmapStage,
  handleGetDailyMission,
  handleCompleteDailyMission,
  handleGetRetrievalDue,
  handleAddRetrievalQuestion,
  handleAnswerRetrieval,
  handleGetEvidence,
  handleAddLearningEvidence,
  handleGetFailureLab,
  handleInjectFailure,
  handleClearFailure,
  handleGetTroubleshootingGuide,
  handleGetInterviewQuestions,
  handleGetInterviewQuestionsByRole,
  handleCreateInterviewSession,
  handleSubmitInterviewAnswer,
  handleGetInterviewHistory,
  handleGetInterviewRecommendations,
  handleGetInterviewWeakAreas,
  handleCreateResearchExperiment,
  handleGetResearchExperiment,
  handleListResearchExperiments,
  handleSetHypothesis,
  handleAddObservation,
  handleCompleteResearchExperiment,
  handleGetExperimentTemplates,
  handleGetExperimentTemplate,
  handleCreateResearchProject,
  handleGetResearchProject,
  handleListResearchProjects,
  handleSetProjectHypothesis,
  handleAddProjectObservation,
  handleAddNotebookEntry,
  handleGetNotebook,
  handleUpdateVisualization,
  handleGetVisualization,
  handleCreateInnovationChallenge,
  handleGetInnovationChallenge,
  handleListInnovationChallenges,
  handleSubmitInnovationChallenge,
  handleCompleteResearchProject,
  handleGetResearchDashboard,
  handleGetPortfolio,
  handleAddPortfolioArtifact,
  handleUpdatePortfolioArtifact,
  handleDeletePortfolioArtifact,
  handleExportPortfolioPDF,
  handleExportPortfolioJSON,
  handleGetStudyPlanner,
  handleUpdateStudyPlanner,
  handleStartStudySession,
  handleCompleteStudySession,
  handleGetSkillGraph,
  handleUpdateSkillMastery,
  handleGetSkillPrerequisites,
  handleGetDebrief,
  handleCreateDebrief,
  handleListCourses,
  handleGetCourse,
  handleEnrollCourse,
  handleUpdateCourseProgress,
  handleGetCourseEnrollment,
  handleGetStudyDailyPlan,
  handleUpdateStudyBlock,
  handleGetStudyPlan,
  handleGetWeeklySchedule,
  handleGetRetrievalCalendar,
  handleDetectFatigue,
  handleIdentifyWeakSkills,
  handleGetStudyModes,
  handleGetContinueLearning,
  handleGetQaStatus,
  handleRunQaCheck
} = require('./routes/apiRoutes');
const { RedisClient } = require('./services/redis');
const { PostgresClient } = require('./services/postgres');
const { GRPCServer } = require('./services/grpc');
const { DeviceManager } = require('./services/deviceManager');
const { LabEngine } = require('./services/labEngine');
const { TelemetryStream } = require('./services/telemetry');
const { sessions, labCache, tickets } = require('./state/state');
const { rateLimiter, globalIpLimiter } = require('./services/rateLimiter');
const { isQuarantined } = require('./services/labQualityService');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || true,
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));
app.use(logger.http);

app.use((req, res, next) => {
  if (!globalIpLimiter(req.ip || req.connection.remoteAddress)) {
    return res.status(429).json({ error: 'Too many requests. Max 60 requests per minute.' });
  }
  next();
});

const PORT = process.env.PORT || 3000;
const GRPC_PORT = process.env.GRPC_PORT || 50051;

const redisClient = new RedisClient();
const postgresClient = new PostgresClient();
const deviceManager = new DeviceManager();
const labEngine = new LabEngine();
const telemetryStream = new TelemetryStream();

let grpcServer;
let telemetryInterval;
let sessionCleanupInterval;
let pgOk = false;

loadLabs();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '4.0.0', service: 'cybernet-lab-backend', websocket: 'available', timestamp: Date.now() });
});

app.get('/api/health/live', (req, res) => {
  res.json({ status: 'alive', timestamp: Date.now() });
});

app.get('/api/health/ready', async (req, res) => {
  const checks = {
    redis: redisClient.isUsingMemory() ? 'degraded' : 'ok',
    postgres: postgresClient.isAvailable() ? 'ok' : 'degraded',
    labs: labs.size > 0 ? 'ok' : 'error',
    websocket: wss ? 'ok' : 'error'
  };
  const allOk = Object.values(checks).every(s => s !== 'error');
  res.status(allOk ? 200 : 503).json({ status: allOk ? 'ready' : 'degraded', checks, timestamp: Date.now() });
});

app.get('/api/labs', handleGetLabs);
app.get('/api/labs/:id', handleGetLab);
app.post('/api/labs/:id/start', handleStartLab);
app.get('/api/labs/:id/sessions/:sessionId', handleGetActiveSession);
app.delete('/api/labs/:id/sessions/:sessionId', handleResetSession);
app.get('/api/labs/:id/state', handleGetUserLabState);
app.put('/api/labs/:id/state', handleSaveUserLabState);
app.get('/api/progress', handleGetUserProgress);
app.get('/api/progress/:learnerId/available', handleGetAvailableLabs);
app.get('/api/progress/:learnerId/locked', handleGetLockedLabs);
app.get('/api/progress/:learnerId', handleGetLearnerProgress);
app.get('/api/progress/:learnerId/lab/:labId', handleGetLearnerLabProgress);
app.post('/api/progress/:learnerId/start/:labId', handleStartLearnerLab);
app.post('/api/progress/:learnerId/complete/:labId', handleCompleteLearnerLab);

app.post('/api/tickets', handleCreateTicket);
app.get('/api/tickets', handleGetTickets);
app.get('/api/tickets/stats', handleGetTicketStats);
app.get('/api/tickets/search', handleSearchTickets);
app.get('/api/tickets/:id', handleGetTicket);
app.put('/api/tickets/:id/status', handleUpdateTicketStatus);
app.put('/api/tickets/:id', handleUpdateTicket);
app.post('/api/tickets/:id/evidence', handleAddEvidence);
app.post('/api/tickets/:id/investigation-steps', handleAddInvestigationStep);
app.put('/api/tickets/:id/assign', handleAssignTicket);
app.put('/api/tickets/:id/resolve', handleCloseTicket);
app.delete('/api/tickets/:id', handleDeleteTicket);

app.get('/api/roadmap', handleGetRoadmap);
app.get('/api/roadmap/:stage', handleGetRoadmapStage);
app.get('/api/missions/today', handleGetDailyMission);
app.post('/api/missions/:learnerId/:missionId/complete', handleCompleteDailyMission);
app.get('/api/retrieval/due/:learnerId', handleGetRetrievalDue);
app.post('/api/retrieval/:learnerId/add', handleAddRetrievalQuestion);
app.post('/api/retrieval/:learnerId/:questionId/answer', handleAnswerRetrieval);
app.get('/api/evidence/:learnerId', handleGetEvidence);
app.post('/api/evidence/:learnerId', handleAddLearningEvidence);
app.get('/api/failure-labs/:labId', handleGetFailureLab);
app.post('/api/failure-labs/:labId/inject', handleInjectFailure);
app.post('/api/failure-labs/:labId/clear/:faultId', handleClearFailure);
app.get('/api/coach/:labId/:stepId', handleGetTroubleshootingGuide);
app.get('/api/interview/:topicId', handleGetInterviewQuestions);
app.get('/api/interview/role/:role', handleGetInterviewQuestionsByRole);
app.get('/api/interview/role/:role/:level', handleGetInterviewQuestionsByRole);
app.post('/api/interview/:learnerId/session', handleCreateInterviewSession);
app.post('/api/interview/:sessionId/answer', handleSubmitInterviewAnswer);
app.get('/api/interview/:learnerId/history', handleGetInterviewHistory);
app.get('/api/interview/:learnerId/recommendations', handleGetInterviewRecommendations);
app.get('/api/interview/:learnerId/weak-areas', handleGetInterviewWeakAreas);
app.post('/api/research', handleCreateResearchExperiment);
app.get('/api/research/templates', handleGetExperimentTemplates);
app.get('/api/research/templates/:templateId', handleGetExperimentTemplate);
app.get('/api/research/:id', handleGetResearchExperiment);
app.get('/api/research/learner/:learnerId', handleListResearchExperiments);
app.post('/api/research/:id/hypothesis', handleSetHypothesis);
app.post('/api/research/:id/observation', handleAddObservation);
app.post('/api/research/:id/complete', handleCompleteResearchExperiment);
app.post('/api/research-projects', handleCreateResearchProject);
app.get('/api/research-projects/:id', handleGetResearchProject);
app.get('/api/research-projects/learner/:learnerId', handleListResearchProjects);
app.post('/api/research-projects/:id/hypothesis', handleSetProjectHypothesis);
app.post('/api/research-projects/:id/observation', handleAddProjectObservation);
app.post('/api/research-projects/:id/notebook', handleAddNotebookEntry);
app.get('/api/research-projects/:id/notebook', handleGetNotebook);
app.put('/api/research-projects/:id/visualization', handleUpdateVisualization);
app.get('/api/research-projects/:id/visualization', handleGetVisualization);
app.post('/api/research-projects/:id/complete', handleCompleteResearchProject);
app.get('/api/research/dashboard', (req, res) => res.status(400).json({ error: 'learnerId is required' }));
app.get('/api/research/:learnerId/dashboard', handleGetResearchDashboard);
app.post('/api/innovation-challenges', handleCreateInnovationChallenge);
app.get('/api/innovation-challenges/:id', handleGetInnovationChallenge);
app.get('/api/innovation-challenges/learner/:learnerId', handleListInnovationChallenges);
app.post('/api/innovation-challenges/:id/submit', handleSubmitInnovationChallenge);
app.get('/api/portfolio/:learnerId', handleGetPortfolio);
app.post('/api/portfolio/:learnerId/artifacts', handleAddPortfolioArtifact);
app.put('/api/portfolio/:learnerId/artifacts/:artifactId', handleUpdatePortfolioArtifact);
app.delete('/api/portfolio/:learnerId/artifacts/:artifactId', handleDeletePortfolioArtifact);
app.get('/api/portfolio/:learnerId/export/pdf', handleExportPortfolioPDF);
app.get('/api/portfolio/:learnerId/export/json', handleExportPortfolioJSON);
app.get('/api/study-planner/:learnerId', handleGetStudyPlanner);
app.put('/api/study-planner/:learnerId', handleUpdateStudyPlanner);
app.post('/api/study-planner/:learnerId/session', handleStartStudySession);
app.post('/api/study-planner/:learnerId/session/:sessionId/complete', handleCompleteStudySession);
app.get('/api/skill-graph/:learnerId', handleGetSkillGraph);
app.put('/api/skill-graph/:learnerId/:skillId', handleUpdateSkillMastery);
app.get('/api/skill-graph/:learnerId/prerequisites/:skillId', handleGetSkillPrerequisites);
app.get('/api/labs/:labId/debrief/:learnerId', handleGetDebrief);
app.post('/api/labs/:labId/debrief/:learnerId', handleCreateDebrief);
app.get('/api/courses', handleListCourses);
app.get('/api/courses/:courseId', handleGetCourse);
app.post('/api/courses/:courseId/enroll/:learnerId', handleEnrollCourse);
app.put('/api/courses/:courseId/progress/:learnerId', handleUpdateCourseProgress);
app.get('/api/courses/:courseId/enrollment/:learnerId', handleGetCourseEnrollment);

app.get('/api/study/:learnerId/daily-plan', handleGetStudyDailyPlan);
app.patch('/api/study/:learnerId/plan/:date/block/:blockId', handleUpdateStudyBlock);
app.get('/api/study/:learnerId/plan/:date', handleGetStudyPlan);
app.get('/api/study/:learnerId/weekly-schedule', handleGetWeeklySchedule);
app.get('/api/study/:learnerId/retrieval-calendar', handleGetRetrievalCalendar);
app.post('/api/study/:learnerId/fatigue', handleDetectFatigue);
app.get('/api/study/:learnerId/weak-skills', handleIdentifyWeakSkills);
app.get('/api/study/modes', handleGetStudyModes);
app.get('/api/study/:learnerId/continue-learning', handleGetContinueLearning);
app.get('/api/qa/status', handleGetQaStatus);
app.post('/api/qa/run', handleRunQaCheck);

app.get('/api/telemetry', async (req, res) => {
  try {
    const telemetry = await telemetryStream.getLatest();
    if (!telemetry) {
      return res.status(500).json({ error: 'No telemetry stream available' });
    }
    res.json(telemetry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inject-error', async (req, res) => {
  try {
    const { labId, errorType } = req.body || {};
    const result = await labEngine.injectError(labId, errorType);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/lab-config/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const config = req.body;
    const result = await labEngine.pushConfig(id, config);
    res.json({ result });
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
    res.status(200).json({ success: true, message: `Lab ${req.params.id} reset` });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

wss.on('connection', (ws, req) => {
    const handler = (session, msg) => handleMessage(session, msg);
    handleConnection(ws, req, handler);
    
    const sessionId = ws.sessionId;
    const session = sessions.get(sessionId);
    if (session) {
      telemetryStream.subscribe(ws, session.telemetrySubscriptions || []);
    }
  });



async function startTelemetryBroadcast() {
   telemetryInterval = setInterval(async () => {
     const telemetry = await telemetryStream.getLatest();
     if (telemetry) {
       telemetryStream.broadcast(telemetry);
     }
   }, 1000);
 }

server.listen(PORT, () => {
  console.log(`CyberNet Lab Backend v4.0 running on port ${PORT}`);
  console.log(`WebSocket server ready`);
  if (pgOk) console.log(`PostgreSQL connected`);
  else console.log(`PostgreSQL not available (in-memory mode)`);
  console.log(`Redis ${redisClient.isUsingMemory() ? 'using in-memory store' : 'connected'}`);
  logger.info('Server started', { port: PORT, grpcPort: GRPC_PORT, postgres: pgOk });
});

let shuttingDown = false;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Is another instance running?`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

async function gracefulShutdown(signal) {
  if (shuttingDown) {
    console.log('Shutdown already in progress...');
    return;
  }
  shuttingDown = true;
  console.log(`\n${signal} received: shutting down gracefully...`);
  try {
    await stop();
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

async function init() {
   try {
     await redisClient.connect();
      pgOk = await postgresClient.connect();
     if (pgOk) await postgresClient.initializeSchema();
     
     deviceManager.initializeDevices();
      labEngine.initialize(postgresClient, redisClient, deviceManager, labs);
     telemetryStream.initialize(deviceManager);
     
     try {
       grpcServer = new GRPCServer(deviceManager, labEngine, telemetryStream);
       grpcServer.start(GRPC_PORT);
       console.log(`gRPC server running on port ${GRPC_PORT}`);
     } catch (grpcErr) {
       console.warn('gRPC server failed to start (continuing without gRPC):', grpcErr.message);
     }
     
      startTelemetryBroadcast();
      
      sessionCleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [id, session] of sessions) {
          if (now - session.lastActivity > 300000) {
            try { session.ws.close(); } catch (e) { /* ignore */ }
            sessions.delete(id);
            labCache.delete(id);
          }
        }
      }, 60000);
    } catch (err) {
      console.error('Failed to start server:', err);
      process.exit(1);
    }
  }

init();

async function stop() {
   if (telemetryInterval) clearInterval(telemetryInterval);
   if (sessionCleanupInterval) clearInterval(sessionCleanupInterval);
   if (grpcServer) grpcServer.stop();
   await redisClient.disconnect();
   await postgresClient.disconnect();
 }

process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await stop();
  process.exit(0);
});

module.exports = { app, server, sessions, labCache, stop };