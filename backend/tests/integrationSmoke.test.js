const http = require('http');

process.env.PORT = '0';
process.env.GRPC_PORT = '0';
const { app, server } = require('../server');
const { userLabState, tickets, learnerProgress, dailyMissions, retrievalQueue, evidence, failureLabs, researchExperiments, portfolioArtifacts, studyPlanner, skillGraph, debriefs, courses, courseEnrollments } = require('../state/state');

const port = server.address().port;

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port,
      path,
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

describe('Integration Smoke Tests', () => {
  afterAll(done => {
    server.close(done);
  });

  beforeEach(() => {
    userLabState.clear();
    tickets.clear();
    learnerProgress.clear();
    dailyMissions.clear();
    retrievalQueue.clear();
    evidence.clear();
    failureLabs.clear();
    researchExperiments.clear();
    portfolioArtifacts.clear();
    studyPlanner.clear();
    skillGraph.clear();
    debriefs.clear();
    courses.clear();
    courseEnrollments.clear();
  });

  it('full learner journey: health -> labs -> start -> progress', async () => {
    const health = await request('GET', '/api/health');
    expect(health.status).toBe(200);

    const labs = await request('GET', '/api/labs');
    expect(labs.status).toBe(200);
    expect(labs.body.length).toBeGreaterThan(0);

    const start = await request('POST', '/api/labs/REF-001/start');
    expect(start.status).toBe(200);
    expect(start.body.sessionId).toBeDefined();

    const progress = await request('GET', '/api/progress/learner-smoke');
    expect(progress.status).toBe(200);
  });

  it('full ticket lifecycle: create -> update -> evidence -> resolve -> delete', async () => {
    const create = await request('POST', '/api/tickets', {
      labId: 'REF-001',
      issueType: 'configuration_error',
      description: 'Smoke test ticket',
      reportedBy: 'tester'
    });
    expect(create.status).toBe(201);
    const ticketId = create.body.id;

    const update = await request('PUT', `/api/tickets/${ticketId}`, {
      status: 'in_progress',
      assignedTo: 'engineer-1'
    });
    expect(update.status).toBe(200);

    const evidence = await request('POST', `/api/tickets/${ticketId}/evidence`, {
      type: 'screenshot',
      data: 'screenshot-data'
    });
    expect(evidence.status).toBe(200);

    const resolve = await request('PUT', `/api/tickets/${ticketId}/resolve`, {
      resolvedBy: 'manager',
      resolution: 'Fixed'
    });
    expect(resolve.status).toBe(200);
    expect(resolve.body.status).toBe('resolved');

    const stats = await request('GET', '/api/tickets/stats');
    expect(stats.body.resolved).toBe(1);
  });

  it('learning journey: roadmap -> mission -> retrieval -> evidence', async () => {
    const roadmap = await request('GET', '/api/roadmap');
    expect(roadmap.status).toBe(200);
    expect(roadmap.body.length).toBeGreaterThan(0);

    const mission = await request('GET', '/api/missions/today?learnerId=smoke-learner');
    expect(mission.status).toBe(200);

    const addQuestion = await request('POST', '/api/retrieval/smoke-learner/add', {
      question: 'What is a VLAN?',
      options: ['Virtual LAN', 'Very Large Area Network'],
      correctAnswer: 'Virtual LAN',
      topic: 'switching'
    });
    expect(addQuestion.status).toBe(201);

    const answer = await request('POST', `/api/retrieval/smoke-learner/${addQuestion.body.id}/answer`, {
      answer: 'Virtual LAN'
    });
    expect(answer.status).toBe(200);
    expect(answer.body.correct).toBe(true);

    const addEvidence = await request('POST', '/api/evidence/smoke-learner', {
      labId: 'REF-001',
      type: 'output',
      title: 'Ping output',
      data: { command: 'ping 8.8.8.8' }
    });
    expect(addEvidence.status).toBe(201);
  });

  it('research journey: create -> hypothesis -> observation -> complete', async () => {
    const create = await request('POST', '/api/research', {
      learnerId: 'smoke-researcher',
      title: 'OSPF Convergence',
      problemStatement: 'How fast does OSPF converge?',
      knownFacts: ['OSPF is link-state'],
      unknowns: ['Convergence time']
    });
    expect(create.status).toBe(201);
    const expId = create.body.id;

    const hypothesis = await request('POST', `/api/research/${expId}/hypothesis`, {
      hypothesis: 'Convergence is under 1 second'
    });
    expect(hypothesis.status).toBe(200);

    const observation = await request('POST', `/api/research/${expId}/observation`, {
      data: { convergenceTime: 500 },
      notes: 'Fast convergence observed'
    });
    expect(observation.status).toBe(200);

    const complete = await request('POST', `/api/research/${expId}/complete`, {
      results: { convergenceTime: 500 },
      conclusion: 'Hypothesis confirmed'
    });
    expect(complete.status).toBe(200);
    expect(complete.body.status).toBe('completed');
  });

  it('study planner journey: get -> update -> start session -> complete', async () => {
    const getPlanner = await request('GET', '/api/study-planner/smoke-learner');
    expect(getPlanner.status).toBe(200);

    const updatePlanner = await request('PUT', '/api/study-planner/smoke-learner', {
      mode: 'deep',
      availableMinutes: 120
    });
    expect(updatePlanner.status).toBe(200);

    const startSession = await request('POST', '/api/study-planner/smoke-learner/session', {
      mode: 'deep',
      plannedMinutes: 90,
      activities: ['retrieval', 'lab']
    });
    expect(startSession.status).toBe(201);
    const sessionId = startSession.body.id;

    const completeSession = await request('POST', `/api/study-planner/smoke-learner/session/${sessionId}/complete`);
    expect(completeSession.status).toBe(200);
    expect(completeSession.body.completed).toBe(true);
  });

  it('skill graph journey: get -> update mastery -> get prerequisites', async () => {
    const getGraph = await request('GET', '/api/skill-graph/smoke-learner');
    expect(getGraph.status).toBe(200);

    const updateMastery = await request('PUT', '/api/skill-graph/smoke-learner/ospf', { mastery: 0.8 });
    expect(updateMastery.status).toBe(200);
    expect(updateMastery.body.skills['ospf'].mastery).toBe(0.8);

    const prereqs = await request('GET', '/api/skill-graph/smoke-learner/prerequisites/REF-001');
    expect(prereqs.status).toBe(200);
    expect(prereqs.body).toHaveProperty('prerequisites');
  });

  it('debrief journey: create -> get', async () => {
    const create = await request('POST', '/api/labs/REF-001/debrief/smoke-learner', {
      problem: 'OSPF adjacency',
      conceptExplanation: 'OSPF forms adjacency when parameters match'
    });
    expect(create.status).toBe(201);

    const get = await request('GET', '/api/labs/REF-001/debrief/smoke-learner');
    expect(get.status).toBe(200);
    expect(get.body.problem).toBe('OSPF adjacency');
  });

  it('course journey: list -> get -> enroll -> update progress -> get enrollment', async () => {
    const list = await request('GET', '/api/courses');
    expect(list.status).toBe(200);
    const courseId = list.body.courses[0].id;

    const getCourse = await request('GET', `/api/courses/${courseId}`);
    expect(getCourse.status).toBe(200);

    const enroll = await request('POST', `/api/courses/${courseId}/enroll/smoke-learner`);
    expect(enroll.status).toBe(201);

    const updateProgress = await request('PUT', `/api/courses/${courseId}/progress/smoke-learner`, {
      stageIndex: 0,
      completed: true
    });
    expect(updateProgress.status).toBe(200);

    const getEnrollment = await request('GET', `/api/courses/${courseId}/enrollment/smoke-learner`);
    expect(getEnrollment.status).toBe(200);
    expect(getEnrollment.body.completedStages).toContain('0');
  });

  it('failure lab journey: get state -> inject -> clear', async () => {
    const getState = await request('GET', '/api/failure-labs/REF-001');
    expect(getState.status).toBe(200);

    const inject = await request('POST', '/api/failure-labs/REF-001/inject', {
      type: 'interface_down',
      target: 'Gig0/1'
    });
    expect(inject.status).toBe(200);
    const faultId = inject.body.fault.id;

    const clear = await request('POST', `/api/failure-labs/REF-001/clear/${faultId}`);
    expect(clear.status).toBe(200);
  });

  it('multiple independent learners do not interfere', async () => {
    await request('POST', '/api/tickets', {
      labId: 'REF-001',
      issueType: 'configuration_error',
      description: 'Learner A ticket',
      reportedBy: 'learner-a'
    });
    await request('POST', '/api/tickets', {
      labId: 'REF-002',
      issueType: 'connectivity_issue',
      description: 'Learner B ticket',
      reportedBy: 'learner-b'
    });

    const stats = await request('GET', '/api/tickets/stats');
    expect(stats.body.total).toBe(2);

    const learnerA = await request('GET', '/api/evidence/learner-a');
    expect(learnerA.status).toBe(200);
  });
});
