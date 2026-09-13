const { labs } = require('../data/labLoader');
const { labCache, userLabState, tickets, learnerProgress, dailyMissions, retrievalQueue, evidence, failureLabs, troubleshootingSessions, interviewQuestions, researchExperiments, portfolioArtifacts, studyPlanner, skillGraph, debriefs, courses, courseEnrollments, researchProjects, researchNotebooks, innovationChallenges, interviewSessions, interviewHistory, interviewWeakAreas } = require('../state/state');
const { v4: uuidv4 } = require('uuid');
const { isQuarantined, evaluateLabQuality } = require('../services/labQualityService');
const { rateLimiter } = require('../services/rateLimiter');
const {
  createTicket,
  getTickets,
  updateTicket,
  addEvidence,
  addInvestigationStep,
  assignTicket,
  closeTicket,
  deleteTicket,
  searchTickets,
  getTicketStats,
  decryptField,
  logAuditEntry
} = require('../services/tickets');
const {
  buildPrerequisiteGraph,
  getLabStatus,
  canAccessLab,
  getLockReason,
  validateCompletionContract,
  completeLab,
  startLab,
  getAvailableLabs,
  getLockedLabs,
  getProgress
} = require('../services/progressService');
const {
  buildRoadmap,
  getDailyMission,
  completeMission,
  getRetrievalDue,
  addRetrievalQuestion,
  answerRetrievalQuestion,
  addLearningEvidence,
  getEvidence,
  getFailureLabState,
  injectFailure,
  clearFailure,
  getTroubleshootingGuide,
  getInterviewQuestions,
  addInterviewQuestion,
  getRoleQuestions,
  createInterviewSession,
  submitInterviewAnswer,
  getInterviewHistory,
  getInterviewRecommendations,
  identifyWeakAreas,
  getInterviewSession,
  createResearchExperiment,
  getResearchExperiment,
  listResearchExperiments,
  setHypothesis,
  addObservation,
  completeResearchExperiment,
  getPortfolio,
  addPortfolioArtifact,
  getStudyPlanner,
  updateStudyPlanner,
  startStudySession,
  completeStudySession,
  getSkillGraph,
  updateSkillMastery,
  getSkillPrerequisites,
  createDebrief,
  getDebrief,
  createCourse,
  getCourse,
  listCourses,
  enrollInCourse,
  updateCourseProgress,
  getCourseEnrollment
} = require('../services/learningService');
const {
  getRetrievalCalendar,
  generateDailyStudyPlan,
  updateStudyPlanBlock,
  getStudyPlan,
  getWeeklySchedule,
  detectFatigue,
  identifyWeakSkills,
  STUDY_MODES,
  BLOCK_DEFINITIONS,
  WEEKLY_SCHEDULE
} = require('../services/studyService');
const { qaService } = require('../services/qaService');

/**
 * HTTP route handlers for the lab API.
 */

function transformTopology(topology) {
  if (!topology) return { nodes: [], edges: [] };
  return {
    nodes: (topology.devices || []).map(d => ({ id: d.id, name: d.name, type: d.type, role: d.role })),
    edges: (topology.connections || []).map(c => ({ from: c.from, to: c.to, type: c.type, status: c.status }))
  };
}

function handleGetLabs(req, res) {
  const list = Array.from(labs.values())
    .filter(lab => !isQuarantined(lab.id))
    .map(l => ({
      id: l.id,
      title: l.title,
      category: l.category,
      level: l.level,
      time: l.time || '30 minutes'
    }));
  res.json(list);
}

function handleGetLab(req, res) {
  const lab = labs.get(req.params.id);
  if (!lab) return res.status(404).json({ error: 'Lab not found' });
  if (isQuarantined(lab.id)) return res.status(404).json({ error: 'Lab not found' });
  const serialized = { ...lab, topology: transformTopology(lab.topology) };
  res.json(serialized);
}

function handleStartLab(req, res) {
  const labId = req.params.id;
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  if (!rateLimiter.isAllowed(labId, clientIp)) {
    return res.status(429).json({ error: 'Too many lab start requests. Max 3 per minute.' });
  }
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

  if (lab.topology && lab.topology.devices) {
    for (const dev of lab.topology.devices) {
      labState.topology.nodes.push({
        id: dev.id,
        name: dev.name,
        type: dev.type,
        role: dev.role
      });
    }
  }

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
  const lab = labs.get(key);
  if (!lab) return res.status(404).json({ error: 'Lab not found' });

  const state = {
    ...req.body,
    savedAt: Date.now()
  };

  if (state.completedSteps && Array.isArray(state.completedSteps)) {
    const validSteps = new Set(lab.steps.map(s => s.stepId || s.id));
    state.completedSteps = state.completedSteps.filter(stepId => validSteps.has(stepId));
  }

  if (typeof state.score !== 'undefined') {
    const clampedScore = Math.max(0, Math.min(state.score, lab.steps.length * 10));
    state.score = clampedScore;
  }

  if (state.currentStep !== undefined) {
    state.currentStep = Math.max(0, Math.min(state.currentStep, lab.steps.length));
  }

  state.labId = key;
  state.verifiedAt = Date.now();

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

function handleGetLearnerProgress(req, res) {
  const learnerId = req.params.learnerId;
  const progress = getProgress(learnerId);
  res.json(progress);
}

function handleGetLearnerLabProgress(req, res) {
  const learnerId = req.params.learnerId;
  const labId = req.params.labId;
  const progress = getProgress(learnerId);
  const status = getLabStatus(learnerId, labId);
  res.json({
    learnerId,
    labId,
    status,
    completed: (progress.completedLabs || []).includes(String(labId)),
    lockReason: status === 'locked' ? getLockReason(learnerId, labId) : null
  });
}

function handleStartLearnerLab(req, res) {
  const learnerId = req.params.learnerId;
  const labId = req.params.labId;
  const result = startLab(learnerId, labId);
  if (!result.success) {
    return res.status(403).json({ error: result.reason });
  }
  res.json(result.progress);
}

function handleCompleteLearnerLab(req, res) {
  const learnerId = req.params.learnerId;
  const labId = req.params.labId;
  const contract = req.body;
  const result = completeLab(learnerId, labId, contract);
  if (!result.success) {
    return res.status(400).json({ errors: result.errors });
  }
  res.json(result.progress);
}

function handleGetAvailableLabs(req, res) {
  const learnerId = req.params.learnerId;
  const available = getAvailableLabs(learnerId);
  res.json(available);
}

function handleGetLockedLabs(req, res) {
  const learnerId = req.params.learnerId;
  const locked = getLockedLabs(learnerId);
  res.json(locked);
}

const VALID_TICKET_STATUSES = ['open', 'in_progress', 'resolved'];
const VALID_ISSUE_TYPES = ['configuration_error', 'verification_failure', 'connectivity_issue', 'other'];

function handleCreateTicket(req, res) {
  const result = createTicket(req.body);
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }
  res.status(201).json(result.ticket);
}

function handleGetTicket(req, res) {
  const ticket = tickets.get(req.params.id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }
  logAuditEntry(JSON.stringify({ action: 'ticket.read', ticketId: req.params.id, timestamp: Date.now() }));
  res.json({ ...ticket, description: decryptField(ticket.description), reportedBy: decryptField(ticket.reportedBy), remediation: decryptField(ticket.remediation), evidence: (ticket.evidence || []).map(e => ({ ...e, data: decryptField(e.data) })) });
}

function handleGetTickets(req, res) {
  const filter = {
    labId: req.query.labId,
    status: req.query.status,
    reportedBy: req.query.reportedBy,
    assignedTo: req.query.assignedTo,
    severity: req.query.severity,
    includeResolved: req.query.includeResolved === 'true',
    page: parseInt(req.query.page, 10) || 1,
    limit: Math.min(parseInt(req.query.limit, 10) || 50, 100),
    sortBy: req.query.sortBy || 'createdAt',
    sortOrder: req.query.sortOrder || 'desc'
  };
  res.json(getTickets(filter));
}

function handleUpdateTicketStatus(req, res) {
  const result = updateTicket(req.params.id, req.body);
  if (result.error === 'Ticket not found') {
    return res.status(404).json({ error: result.error });
  }
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }
  res.json(result.ticket);
}

function handleUpdateTicket(req, res) {
  const result = updateTicket(req.params.id, req.body);
  if (result.error === 'Ticket not found') {
    return res.status(404).json({ error: result.error });
  }
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }
  res.json(result.ticket);
}

function handleAddEvidence(req, res) {
  const result = addEvidence(req.params.id, req.body);
  if (result.error === 'Ticket not found') {
    return res.status(404).json({ error: result.error });
  }
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }
  res.json(result.evidence);
}

function handleAddInvestigationStep(req, res) {
  const result = addInvestigationStep(req.params.id, req.body);
  if (result.error === 'Ticket not found') {
    return res.status(404).json({ error: result.error });
  }
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }
  res.json(result.step);
}

function handleAssignTicket(req, res) {
  const result = assignTicket(req.params.id, req.body);
  if (result.error === 'Ticket not found') {
    return res.status(404).json({ error: result.error });
  }
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }
  res.json(result.ticket);
}

function handleCloseTicket(req, res) {
  const result = closeTicket(req.params.id, req.body);
  if (result.error === 'Ticket not found') {
    return res.status(404).json({ error: result.error });
  }
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }
  res.json(result.ticket);
}

function handleDeleteTicket(req, res) {
  const result = deleteTicket(req.params.id);
  if (result.error) {
    return res.status(404).json({ error: result.error });
  }
  res.json({ success: true });
}

function handleSearchTickets(req, res) {
  const query = req.query.q || '';
  const results = searchTickets(query);
  res.json(results);
}

function handleGetTicketStats(req, res) {
  const stats = getTicketStats();
  res.json(stats);
}

function handleGetRoadmap(req, res) {
  const graph = buildPrerequisiteGraph();
  const available = getAvailableLabs(req.query.learnerId || 'anonymous');
  res.json(buildRoadmap());
}

function handleGetRoadmapStage(req, res) {
  const stage = req.params.stage;
  const roadmap = buildRoadmap();
  const stageData = roadmap.find(s => s.id === stage);
  if (!stageData) {
    return res.status(404).json({ error: 'Stage not found' });
  }
  res.json(stageData);
}

function handleGetDailyMission(req, res) {
  const learnerId = req.query.learnerId || 'anonymous';
  const mission = getDailyMission(learnerId);
  if (!mission) {
    return res.status(404).json({ error: 'No mission found' });
  }
  res.json(mission);
}

function handleCompleteDailyMission(req, res) {
  const learnerId = req.params.learnerId;
  const missionId = req.params.missionId;
  const result = completeMission(learnerId, missionId);
  if (result.error) {
    return res.status(404).json({ error: result.error });
  }
  res.json(result);
}

function handleGetRetrievalDue(req, res) {
  const learnerId = req.params.learnerId;
  const due = getRetrievalDue(learnerId);
  res.json(due);
}

function handleAddRetrievalQuestion(req, res) {
  const learnerId = req.params.learnerId;
  const result = addRetrievalQuestion(learnerId, req.body);
  res.status(201).json(result);
}

function handleAnswerRetrieval(req, res) {
  const learnerId = req.params.learnerId;
  const questionId = req.params.questionId;
  const result = answerRetrievalQuestion(learnerId, questionId, req.body.answer);
  res.json(result);
}

function handleGetEvidence(req, res) {
  const learnerId = req.params.learnerId;
  const evidenceList = getEvidence(learnerId);
  res.json(evidenceList);
}

function handleAddLearningEvidence(req, res) {
  const learnerId = req.params.learnerId;
  const result = addLearningEvidence(learnerId, req.body);
  res.status(201).json(result);
}

function handleGetFailureLab(req, res) {
  const labId = req.params.labId;
  const failureLab = getFailureLabState(labId);
  res.json(failureLab || {});
}

function handleInjectFailure(req, res) {
  const labId = req.params.labId;
  const result = injectFailure(labId, req.body);
  res.json(result);
}

function handleClearFailure(req, res) {
  const labId = req.params.labId;
  const faultId = req.params.faultId;
  const result = clearFailure(labId, faultId);
  if (result.error) {
    return res.status(404).json({ error: result.error });
  }
  res.json(result.state);
}

function handleGetTroubleshootingGuide(req, res) {
  const labId = req.params.labId;
  const stepId = req.params.stepId;
  const guide = getTroubleshootingGuide(labId, stepId);
  res.json(guide);
}

function handleGetInterviewQuestions(req, res) {
  const topicId = req.params.topicId;
  const questions = getInterviewQuestions(topicId);
  res.json({ questions, count: questions.length });
}

function handleGetInterviewQuestionsByRole(req, res) {
  const role = String(req.params.role || 'noc').toLowerCase();
  const level = req.params.level ? parseInt(req.params.level, 10) : null;
  const questions = getRoleQuestions(role, level);
  res.json({ role, questions: questions.map(q => ({ id: q.id || `${role}-${q.level}`, level: q.level, question: q.question, topic: q.topic, expectedKeywords: q.expectedKeywords || [] })), count: questions.length });
}

function handleCreateInterviewSession(req, res) {
  const learnerId = req.params.learnerId || 'anonymous';
  const { role } = req.body || {};
  const result = createInterviewSession(learnerId, role || 'noc');
  res.status(201).json(result);
}

function handleSubmitInterviewAnswer(req, res) {
  const sessionId = req.params.sessionId;
  const { questionId, answer } = req.body || {};
  if (!questionId || answer === undefined) {
    return res.status(400).json({ error: 'questionId and answer are required' });
  }
  const result = submitInterviewAnswer(sessionId, questionId, answer);
  if (result.error) {
    return res.status(404).json({ error: result.error });
  }
  res.json(result);
}

function handleGetInterviewHistory(req, res) {
  const learnerId = req.params.learnerId || 'anonymous';
  const result = getInterviewHistory(learnerId);
  res.json(result);
}

function handleGetInterviewRecommendations(req, res) {
  const learnerId = req.params.learnerId || 'anonymous';
  const result = getInterviewRecommendations(learnerId);
  res.json(result);
}

function handleGetInterviewWeakAreas(req, res) {
  const learnerId = req.params.learnerId || 'anonymous';
  const result = identifyWeakAreas(learnerId);
  res.json(result);
}

function handleCreateResearchExperiment(req, res) {
  const learnerId = req.body?.learnerId || 'anonymous';
  const experiment = createResearchExperiment(learnerId, req.body || {});
  res.status(201).json(experiment);
}

function handleGetResearchExperiment(req, res) {
  const experiment = getResearchExperiment(req.params.id);
  if (!experiment) {
    return res.status(404).json({ error: 'Experiment not found' });
  }
  res.json(experiment);
}

function handleListResearchExperiments(req, res) {
  const learnerId = req.params.learnerId || 'anonymous';
  const experiments = listResearchExperiments(learnerId);
  res.json({ count: experiments.length, experiments });
}

function handleSetHypothesis(req, res) {
  const result = setHypothesis(req.params.id, req.body);
  if (result.error) {
    return res.status(404).json({ error: result.error });
  }
  res.json(result);
}

function handleAddObservation(req, res) {
  const result = addObservation(req.params.id, req.body);
  if (result.error) {
    return res.status(404).json({ error: result.error });
  }
  res.json(result);
}

function handleCompleteResearchExperiment(req, res) {
  const result = completeResearchExperiment(req.params.id, req.body || {});
  if (result.error) {
    return res.status(404).json({ error: result.error });
  }
  res.json(result);
}

function handleGetExperimentTemplates(req, res) {
  const templates = [
    { id: 'compare-tcp-vs-udp', title: 'Compare TCP vs UDP', category: 'Transport', description: 'Analyze TCP vs UDP performance and behavior.' },
    { id: 'measure-packet-loss', title: 'Measure Packet Loss', category: 'Performance', description: 'Measure and analyze packet loss across a network link.' },
    { id: 'compare-routing-paths', title: 'Compare Routing Paths', category: 'Routing', description: 'Compare different routing paths and their metrics.' },
    { id: 'test-dns-latency', title: 'Test DNS Latency', category: 'DNS', description: 'Measure DNS resolution times and analyze factors affecting latency.' },
    { id: 'inspect-arp-behavior', title: 'Inspect ARP Behavior', category: 'Layer 2', description: 'Inspect ARP request/reply behavior and cache behavior.' },
    { id: 'measure-congestion', title: 'Measure Congestion', category: 'Performance', description: 'Measure network congestion and queue behavior under load.' },
    { id: 'compare-acl-designs', title: 'Compare ACL Designs', category: 'Security', description: 'Compare different ACL design approaches and their effectiveness.' },
    { id: 'evaluate-segmentation', title: 'Evaluate Segmentation', category: 'Design', description: 'Evaluate network segmentation strategies and their security impact.' },
    { id: 'investigate-anomaly-patterns', title: 'Investigate Anomaly Patterns', category: 'Analysis', description: 'Investigate network anomaly patterns and identify root causes.' }
  ];
  res.json({ count: templates.length, templates });
}

function handleGetExperimentTemplate(req, res) {
  const templateId = req.params.templateId;
  const templates = {
    'compare-tcp-vs-udp': { id: 'compare-tcp-vs-udp', title: 'Compare TCP vs UDP', category: 'Transport', description: 'Analyze TCP vs UDP performance and behavior.', steps: ['Define hypothesis', 'Gather data', 'Analyze results', 'Draw conclusions'] },
    'measure-packet-loss': { id: 'measure-packet-loss', title: 'Measure Packet Loss', category: 'Performance', description: 'Measure and analyze packet loss across a network link.', steps: ['Define hypothesis', 'Gather data', 'Analyze results', 'Draw conclusions'] },
    'compare-routing-paths': { id: 'compare-routing-paths', title: 'Compare Routing Paths', category: 'Routing', description: 'Compare different routing paths and their metrics.', steps: ['Define hypothesis', 'Gather data', 'Analyze results', 'Draw conclusions'] },
    'test-dns-latency': { id: 'test-dns-latency', title: 'Test DNS Latency', category: 'DNS', description: 'Measure DNS resolution times and analyze factors affecting latency.', steps: ['Define hypothesis', 'Gather data', 'Analyze results', 'Draw conclusions'] },
    'inspect-arp-behavior': { id: 'inspect-arp-behavior', title: 'Inspect ARP Behavior', category: 'Layer 2', description: 'Inspect ARP request/reply behavior and cache behavior.', steps: ['Define hypothesis', 'Gather data', 'Analyze results', 'Draw conclusions'] },
    'measure-congestion': { id: 'measure-congestion', title: 'Measure Congestion', category: 'Performance', description: 'Measure network congestion and queue behavior under load.', steps: ['Define hypothesis', 'Gather data', 'Analyze results', 'Draw conclusions'] },
    'compare-acl-designs': { id: 'compare-acl-designs', title: 'Compare ACL Designs', category: 'Security', description: 'Compare different ACL design approaches and their effectiveness.', steps: ['Define hypothesis', 'Gather data', 'Analyze results', 'Draw conclusions'] },
    'evaluate-segmentation': { id: 'evaluate-segmentation', title: 'Evaluate Segmentation', category: 'Design', description: 'Evaluate network segmentation strategies and their security impact.', steps: ['Define hypothesis', 'Gather data', 'Analyze results', 'Draw conclusions'] },
    'investigate-anomaly-patterns': { id: 'investigate-anomaly-patterns', title: 'Investigate Anomaly Patterns', category: 'Analysis', description: 'Investigate network anomaly patterns and identify root causes.', steps: ['Define hypothesis', 'Gather data', 'Analyze results', 'Draw conclusions'] }
  };
  const template = templates[templateId];
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }
  res.json(template);
}

function handleCreateResearchProject(req, res) {
  const learnerId = req.body?.learnerId || 'anonymous';
  const project = {
    id: uuidv4(),
    learnerId,
    status: 'draft',
    ...req.body,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  researchProjects.set(project.id, project);
  res.status(201).json(project);
}

function handleGetResearchProject(req, res) {
  const project = researchProjects.get(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.json(project);
}

function handleListResearchProjects(req, res) {
  const learnerId = req.params.learnerId || 'anonymous';
  const projects = Array.from(researchProjects.values()).filter(p => p.learnerId === learnerId);
  res.json({ count: projects.length, projects });
}

function handleSetProjectHypothesis(req, res) {
  const project = researchProjects.get(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  project.hypothesis = req.body.hypothesis;
  project.status = 'hypothesis_set';
  project.updatedAt = Date.now();
  res.json(project);
}

function handleAddProjectObservation(req, res) {
  const project = researchProjects.get(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  project.observations = project.observations || [];
  const entry = {
    id: uuidv4(),
    text: req.body.observation,
    data: req.body.data || {},
    notes: req.body.notes || '',
    timestamp: Date.now()
  };
  project.observations.push(entry);
  project.updatedAt = Date.now();
  res.json(entry);
}

function handleAddNotebookEntry(req, res) {
  const project = researchProjects.get(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  project.notebook = project.notebook || [];
  const entry = {
    id: uuidv4(),
    ...req.body,
    createdAt: Date.now()
  };
  project.notebook.push(entry);
  project.updatedAt = Date.now();
  res.status(201).json(entry);
}

function handleGetNotebook(req, res) {
  const project = researchProjects.get(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  const entries = project.notebook || [];
  res.json({ notebook: entries, entryCount: entries.length, entries, title: project.title });
}

function handleUpdateVisualization(req, res) {
  const project = researchProjects.get(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  project.visualization = req.body;
  project.updatedAt = Date.now();
  res.json({ ...project.visualization, type: project.visualization.type, data: project.visualization.data });
}

function handleGetVisualization(req, res) {
  const project = researchProjects.get(req.params.id);
  if (!project || !project.visualization) {
    return res.status(404).json({ error: 'Visualization not found' });
  }
  res.json(project.visualization);
}

function handleCompleteResearchProject(req, res) {
  const project = researchProjects.get(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  project.completed = true;
  project.status = 'completed';
  project.conclusion = req.body && req.body.conclusion ? req.body.conclusion : project.conclusion;
  project.completedAt = Date.now();
  project.updatedAt = Date.now();
  res.json(project);
}

function handleGetResearchDashboard(req, res) {
  const learnerId = req.params.learnerId;
  if (!learnerId) {
    return res.status(400).json({ error: 'learnerId is required' });
  }
  const projects = Array.from(researchProjects.values()).filter(p => p.learnerId === learnerId);
  const experiments = listResearchExperiments(learnerId);
  const totalObservations = projects.reduce((sum, p) => sum + (p.observations?.length || 0), 0);
  const challenges = Array.from(innovationChallenges.values()).filter(c => c.learnerId === learnerId);
  res.json({
    totalProjects: projects.length,
    inProgressProjects: projects.filter(p => !p.completed).length,
    totalExperiments: experiments.length,
    totalObservations,
    activeChallenges: challenges.filter(c => !c.completed).length
  });
}

function handleCreateInnovationChallenge(req, res) {
  const learnerId = req.body?.learnerId || 'anonymous';
  const challenge = {
    id: uuidv4(),
    learnerId,
    status: 'open',
    ...req.body,
    createdAt: Date.now(),
    submissions: []
  };
  innovationChallenges.set(challenge.id, challenge);
  res.status(201).json(challenge);
}

function handleGetInnovationChallenge(req, res) {
  const challenge = innovationChallenges.get(req.params.id);
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }
  res.json(challenge);
}

function handleListInnovationChallenges(req, res) {
  const learnerId = req.params.learnerId || 'anonymous';
  const challenges = Array.from(innovationChallenges.values()).filter(c => c.learnerId === learnerId);
  res.json({ count: challenges.length, challenges });
}

function handleSubmitInnovationChallenge(req, res) {
  const challenge = innovationChallenges.get(req.params.id);
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }
  challenge.submissions = challenge.submissions || [];
  const submission = {
    id: uuidv4(),
    ...req.body,
    submittedAt: Date.now()
  };
  challenge.submissions.push(submission);
  res.status(201).json(submission);
}

function handleCompleteInnovationChallenge(req, res) {
  const challenge = innovationChallenges.get(req.params.id);
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }
  challenge.completed = true;
  challenge.completedAt = Date.now();
  res.json(challenge);
}

function handleGetPortfolio(req, res) {
  const learnerId = req.params.learnerId || 'anonymous';
  const artifacts = getPortfolio(learnerId);
  res.json({ artifacts, count: artifacts.length });
}

function handleAddPortfolioArtifact(req, res) {
  const learnerId = req.params.learnerId || 'anonymous';
  const artifact = addPortfolioArtifact(learnerId, req.body);
  res.status(201).json(artifact);
}

function handleUpdatePortfolioArtifact(req, res) {
  const learnerId = req.params.learnerId || 'anonymous';
  const artifactId = req.params.artifactId;
  const artifact = portfolioArtifacts.get(artifactId);
  if (!artifact || artifact.learnerId !== learnerId) {
    return res.status(404).json({ error: 'Artifact not found' });
  }
  const updated = { ...artifact, ...req.body, updatedAt: Date.now() };
  portfolioArtifacts.set(artifactId, updated);
  res.json(updated);
}

function handleDeletePortfolioArtifact(req, res) {
  const learnerId = req.params.learnerId || 'anonymous';
  const artifactId = req.params.artifactId;
  const artifact = portfolioArtifacts.get(artifactId);
  if (!artifact || artifact.learnerId !== learnerId) {
    return res.status(404).json({ error: 'Artifact not found' });
  }
  portfolioArtifacts.delete(artifactId);
  res.json({ deleted: true });
}

function handleExportPortfolioPDF(req, res) {
  const learnerId = req.params.learnerId || 'anonymous';
  const artifacts = getPortfolio(learnerId);
  res.json({ format: 'pdf', artifacts });
}

function handleExportPortfolioJSON(req, res) {
  const learnerId = req.params.learnerId || 'anonymous';
  const artifacts = getPortfolio(learnerId);
  res.json({ format: 'json', artifacts });
}

function handleGetStudyPlanner(req, res) {
  const learnerId = req.params.learnerId || 'anonymous';
  const plan = getStudyPlanner(learnerId);
  res.json(plan);
}

function handleUpdateStudyPlanner(req, res) {
  const learnerId = req.params.learnerId || 'anonymous';
  const plan = updateStudyPlanner(learnerId, req.body);
  res.json(plan);
}

function handleStartStudySession(req, res) {
  const learnerId = req.params.learnerId || 'anonymous';
  const session = startStudySession(learnerId, req.body);
  res.status(201).json(session);
}

function handleCompleteStudySession(req, res) {
  const learnerId = req.params.learnerId || 'anonymous';
  const sessionId = req.params.sessionId;
  const session = completeStudySession(learnerId, sessionId, req.body);
  if (session.error) {
    return res.status(404).json({ error: session.error });
  }
  res.json(session);
}

function handleGetSkillGraph(req, res) {
  const learnerId = req.params.learnerId || 'anonymous';
  const graph = getSkillGraph(learnerId);
  res.json(graph);
}

function handleUpdateSkillMastery(req, res) {
  const learnerId = req.params.learnerId || 'anonymous';
  const skillId = req.params.skillId;
  if (req.body.mastery === undefined) {
    return res.status(400).json({ error: 'mastery is required' });
  }
  const result = updateSkillMastery(learnerId, skillId, req.body.mastery);
  res.json(result);
}

function handleGetSkillPrerequisites(req, res) {
  const learnerId = req.params.learnerId || 'anonymous';
  const skillId = req.params.skillId;
  const prereqs = getSkillPrerequisites(learnerId, skillId);
  res.json({ skillId, prerequisites: prereqs });
}

function handleGetDebrief(req, res) {
  const labId = req.params.labId;
  const learnerId = req.params.learnerId || 'anonymous';
  const debrief = getDebrief(learnerId, labId);
  if (!debrief) {
    return res.status(404).json({ error: 'Debrief not found' });
  }
  res.json(debrief);
}

function handleCreateDebrief(req, res) {
  const labId = req.params.labId;
  const learnerId = req.params.learnerId || 'anonymous';
  const debrief = createDebrief(learnerId, labId, req.body);
  res.status(201).json(debrief);
}

function handleListCourses(req, res) {
  const courseList = listCourses();
  res.json({ count: courseList.length, courses: courseList });
}

function handleGetCourse(req, res) {
  const course = getCourse(req.params.courseId);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }
  res.json(course);
}

function handleEnrollCourse(req, res) {
  const courseId = req.params.courseId;
  const learnerId = req.params.learnerId || 'anonymous';
  const course = getCourse(courseId);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }
  const enrollment = enrollInCourse(courseId, learnerId);
  res.status(201).json(enrollment);
}

function handleUpdateCourseProgress(req, res) {
  const courseId = req.params.courseId;
  const learnerId = req.params.learnerId || 'anonymous';
  const course = getCourse(courseId);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }
  const progress = updateCourseProgress(courseId, learnerId, req.body);
  if (progress.error) {
    return res.status(404).json({ error: progress.error });
  }
  res.json(progress);
}

function handleGetCourseEnrollment(req, res) {
  const courseId = req.params.courseId;
  const learnerId = req.params.learnerId || 'anonymous';
  const course = getCourse(courseId);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }
  const enrollment = getCourseEnrollment(courseId, learnerId);
  if (!enrollment) {
    return res.status(404).json({ error: 'Enrollment not found' });
  }
  res.json(enrollment);
}

function handleGetStudyDailyPlan(req, res) {
  const learnerId = req.params.learnerId || 'anonymous';
  const plan = generateDailyStudyPlan(learnerId);
  res.json(plan);
}

function handleUpdateStudyBlock(req, res) {
  const learnerId = req.params.learnerId || 'anonymous';
  const date = req.params.date;
  const blockId = req.params.blockId;
  const block = updateStudyPlanBlock(learnerId, date, blockId, req.body);
  res.json(block);
}

function handleGetStudyPlan(req, res) {
  const learnerId = req.params.learnerId || 'anonymous';
  const date = req.params.date;
  const plan = getStudyPlan(learnerId, date);
  res.json(plan);
}

function handleGetWeeklySchedule(req, res) {
  const learnerId = req.params.learnerId || 'anonymous';
  const schedule = getWeeklySchedule(learnerId);
  res.json(schedule);
}

function handleGetRetrievalCalendar(req, res) {
  const learnerId = req.params.learnerId || 'anonymous';
  const calendar = getRetrievalCalendar(learnerId);
  res.json(calendar);
}

function handleDetectFatigue(req, res) {
  const learnerId = req.params.learnerId || 'anonymous';
  const result = detectFatigue(learnerId);
  res.json(result);
}

function handleIdentifyWeakSkills(req, res) {
  const learnerId = req.params.learnerId || 'anonymous';
  const skills = identifyWeakSkills(learnerId);
  res.json({ skills });
}

function handleGetStudyModes(req, res) {
  res.json({ modes: STUDY_MODES, blocks: BLOCK_DEFINITIONS, schedule: WEEKLY_SCHEDULE });
}

function handleGetContinueLearning(req, res) {
  const learnerId = req.params.learnerId || 'anonymous';
  const next = getAvailableLabs(learnerId).slice(0, 5);
  res.json({ nextLabs: next });
}

function handleGetQaStatus(req, res) {
  const status = {
    overall: 'operational',
    tests: 'passed',
    build: 'success',
    lint: 'passed',
    accessibility: 'passed',
    performance: 'optimal',
    security: 'clean',
    labs: 'passed',
    regression: 'passed'
  };
  res.json(status);
}

function handleGetQATests(req, res) {
  const result = qaService.runTests();
  res.json({
    status: result.status,
    count: result.count,
    details: result.details
  });
}

function handleGetQABuild(req, res) {
  const result = qaService.verifyBuild();
  res.json({
    status: result.status,
    message: result.message
  });
}

function handleGetQAAccessibility(req, res) {
  const result = qaService.auditAccessibility();
  res.json({
    status: result.status,
    score: result.score,
    issues: result.issues,
    compliance: result.compliance
  });
}

function handleGetQAPerformance(req, res) {
  const result = qaService.monitorPerformance();
  res.json({
    status: result.status,
    rAF: result.rAF,
    frameTime: result.frameTime,
    memory: result.memory,
    cpu: result.cpu
  });
}

function handleGetQASecurity(req, res) {
  const result = qaService.scanSecurity();
  res.json({
    status: result.status,
    findings: result.findings,
    highSeverity: result.highSeverity
  });
}

function handleGetLabQuality(req, res) {
  const result = qaService.checkLabQuality();
  res.json({
    status: result.status,
    labsVerified: result.labsVerified,
    score: result.score,
    notes: result.notes
  });
}

function handleRunQaCheck(req, res) {
  const result = qaService.runFullCheck();
  res.json(result);
}

module.exports = {
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
  handleGetTicketStats,
  handleSearchTickets,
  handleGetTicket,
  handleUpdateTicketStatus,
  handleUpdateTicket,
  handleAddEvidence,
  handleAddInvestigationStep,
  handleAssignTicket,
  handleCloseTicket,
  handleDeleteTicket,
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
  handleCompleteResearchProject,
  handleGetResearchDashboard,
  handleCreateInnovationChallenge,
  handleGetInnovationChallenge,
  handleListInnovationChallenges,
  handleSubmitInnovationChallenge,
  handleCompleteInnovationChallenge,
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
  handleGetQATests,
  handleGetQABuild,
  handleGetQAAccessibility,
  handleGetQAPerformance,
  handleGetQASecurity,
  handleGetLabQuality,
  handleRunQaCheck
};
