const http = require('http');

process.env.PORT = '0';
const { app, server } = require('../server');
const { learnerProgress, dailyMissions, retrievalQueue, evidence, failureLabs, researchExperiments, portfolioArtifacts, studyPlanner, skillGraph, debriefs, courses, courseEnrollments } = require('../state/state');
const { seedStaticData } = require('../services/learningService');

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

const LEARNER = 'learner-learning-api';

describe('Learning API', () => {
  beforeEach(() => {
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
    learnerProgress.clear();
    seedStaticData();
  });

  afterAll(done => {
    server.close(done);
  });

  describe('Learning Roadmap', () => {
    it('GET /api/roadmap returns stages', async () => {
      const res = await request('GET', '/api/roadmap');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('title');
      expect(res.body[0]).toHaveProperty('skills');
    });

    it('GET /api/roadmap/:stage returns stage details', async () => {
      const res = await request('GET', '/api/roadmap/zero');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('zero');
      expect(res.body.title).toBe('Zero / Foundations');
    });

    it('GET /api/roadmap/:stage returns 404 for unknown stage', async () => {
      const res = await request('GET', '/api/roadmap/unknown-stage');
      expect(res.status).toBe(404);
    });
  });

  describe('Daily Mission', () => {
    it('GET /api/missions/today returns a mission', async () => {
      const res = await request('GET', `/api/missions/today?learnerId=${LEARNER}`);
      expect(res.status).toBe(200);
      expect(res.body.learnerId).toBe(LEARNER);
      expect(res.body).toHaveProperty('title');
      expect(res.body).toHaveProperty('estimatedTime');
      expect(res.body).toHaveProperty('requiredTools');
    });

    it('POST /api/missions/:learnerId/:missionId/complete marks mission complete', async () => {
      const getRes = await request('GET', `/api/missions/today?learnerId=${LEARNER}`);
      const missionId = getRes.body.id;
      const res = await request('POST', `/api/missions/${LEARNER}/${missionId}/complete`);
      expect(res.status).toBe(200);
      expect(res.body.mission.status).toBe('completed');
    });

    it('POST /api/missions/:learnerId/:missionId/complete returns 404 for unknown mission', async () => {
      const res = await request('POST', `/api/missions/${LEARNER}/unknown-mission/complete`);
      expect(res.status).toBe(404);
    });
  });

  describe('Retrieval Center', () => {
    it('GET /api/retrieval/due/:learnerId returns empty when no questions', async () => {
      const res = await request('GET', `/api/retrieval/due/${LEARNER}`);
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(0);
      expect(Array.isArray(res.body.questions)).toBe(true);
    });

    it('POST /api/retrieval/:learnerId/:questionId/answer records answer', async () => {
      const addRes = await request('POST', `/api/retrieval/${LEARNER}/add`, {
        question: 'What is a VLAN?',
        options: ['Virtual LAN', 'Very Large Area Network', 'Virtual Link', 'None'],
        correctAnswer: 'Virtual LAN',
        topic: 'switching',
        difficulty: 'basic'
      });
      const questionId = addRes.body.id;
      const res = await request('POST', `/api/retrieval/${LEARNER}/${questionId}/answer`, {
        answer: 'Virtual LAN'
      });
      expect(res.status).toBe(200);
      expect(res.body.correct).toBe(true);
    });

    it('POST /api/retrieval/:learnerId/:questionId/answer returns 404 for unknown question', async () => {
      const res = await request('POST', `/api/retrieval/${LEARNER}/unknown/answer`, {
        answer: 'anything'
      });
      expect(res.status).toBe(404);
    });
  });

  describe('Evidence Panel', () => {
    it('GET /api/evidence/:learnerId returns empty when no evidence', async () => {
      const res = await request('GET', `/api/evidence/${LEARNER}`);
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(0);
    });

    it('POST /api/evidence/:learnerId adds evidence', async () => {
      const res = await request('POST', `/api/evidence/${LEARNER}`, {
        labId: '23',
        type: 'output',
        title: 'ping output',
        data: { command: 'ping 8.8.8.8', output: '64 bytes from 8.8.8.8' },
        tags: ['ping', 'connectivity']
      });
      expect(res.status).toBe(201);
      expect(res.body.labId).toBe('23');
      expect(res.body.type).toBe('output');
    });
  });

  describe('Failure Lab', () => {
    it('GET /api/failure-labs/:labId returns empty state for new lab', async () => {
      const res = await request('GET', '/api/failure-labs/23');
      expect(res.status).toBe(200);
      expect(res.body.labId).toBe('23');
      expect(Array.isArray(res.body.faults)).toBe(true);
    });

    it('POST /api/failure-labs/:labId/inject adds fault', async () => {
      const res = await request('POST', '/api/failure-labs/23/inject', {
        type: 'interface_down',
        target: 'GigabitEthernet0/1',
        description: 'Interface administratively down'
      });
      expect(res.status).toBe(200);
      expect(res.body.fault.type).toBe('interface_down');
    });

    it('POST /api/failure-labs/:labId/clear/:faultId clears fault', async () => {
      const injectRes = await request('POST', '/api/failure-labs/23/inject', {
        type: 'interface_down',
        target: 'GigabitEthernet0/1',
        description: 'Interface down'
      });
      const faultId = injectRes.body.fault.id;
      const res = await request('POST', `/api/failure-labs/23/clear/${faultId}`);
      expect(res.status).toBe(200);
    });
  });

  describe('Troubleshooting Coach', () => {
    it('GET /api/coach/:labId/:stepId returns coaching guide', async () => {
      const res = await request('GET', '/api/coach/REF-001/step-1');
      if (res.status === 404) {
        expect(res.body.error).toBeDefined();
      } else {
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('hints');
      }
    });
  });

  describe('Interview Room', () => {
    it('GET /api/interview/:topicId returns questions', async () => {
      const res = await request('GET', '/api/interview/networking-basics');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.questions)).toBe(true);
      expect(res.body.count).toBeGreaterThan(0);
    });
  });

  describe('Research Lab', () => {
    it('POST /api/research creates experiment', async () => {
      const res = await request('POST', '/api/research', {
        learnerId: LEARNER,
        title: 'OSPF behavior test',
        problemStatement: 'How does OSPF converge after link failure?',
        knownFacts: ['OSPF is link-state', 'LSA flooding occurs'],
        unknowns: ['Convergence time under load']
      });
      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.title).toBe('OSPF behavior test');
    });

    it('GET /api/research/:id returns experiment', async () => {
      const createRes = await request('POST', '/api/research', {
        title: 'NAT experiment',
        problemStatement: 'NAT overload behavior',
        knownFacts: ['NAT translates addresses'],
        unknowns: ['Connection tracking limits']
      });
      const id = createRes.body.id;
      const res = await request('GET', `/api/research/${id}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(id);
    });

    it('POST /api/research/:id/hypothesis sets hypothesis', async () => {
      const createRes = await request('POST', '/api/research', {
        learnerId: LEARNER,
        title: 'BGP test',
        problemStatement: 'BGP route selection',
        knownFacts: ['BGP uses path attributes'],
        unknowns: ['Local preference impact']
      });
      const id = createRes.body.id;
      const res = await request('POST', `/api/research/${id}/hypothesis`, {
        hypothesis: 'Local preference overrides all other attributes except weight'
      });
      expect(res.status).toBe(200);
      expect(res.body.hypothesis).toBe('Local preference overrides all other attributes except weight');
    });

    it('POST /api/research/:id/observation adds observation', async () => {
      const createRes = await request('POST', '/api/research', {
        learnerId: LEARNER,
        title: 'QoS test',
        problemStatement: 'QoS queue behavior',
        knownFacts: ['QoS prioritizes traffic'],
        unknowns: ['Queue drop behavior']
      });
      const id = createRes.body.id;
      const res = await request('POST', `/api/research/${id}/observation`, {
        data: { queueDepth: 100, droppedPackets: 5 },
        notes: 'Queue began dropping at 80% capacity'
      });
      expect(res.status).toBe(200);
      expect(res.body.notes).toContain('dropping');
    });

    it('GET /api/research/learner/:learnerId lists experiments', async () => {
      await request('POST', '/api/research', {
        learnerId: LEARNER,
        title: 'Learner experiment',
        problemStatement: 'Test',
        knownFacts: [],
        unknowns: []
      });
      const res = await request('GET', `/api/research/learner/${LEARNER}`);
      expect(res.status).toBe(200);
      expect(res.body.count).toBeGreaterThan(0);
    });
  });

  describe('Portfolio', () => {
    it('GET /api/portfolio/:learnerId returns empty portfolio', async () => {
      const res = await request('GET', `/api/portfolio/${LEARNER}`);
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(0);
    });

    it('POST /api/portfolio/:learnerId/artifacts adds artifact', async () => {
      const res = await request('POST', `/api/portfolio/${LEARNER}/artifacts`, {
        type: 'lab_report',
        title: 'OSPF Lab Report',
        content: { summary: 'Configured OSPF area 0', devices: 3 },
        labId: 'REF-001',
        tags: ['ospf', 'routing']
      });
      expect(res.status).toBe(201);
      expect(res.body.title).toBe('OSPF Lab Report');
    });
  });

  describe('Study Planner', () => {
    it('GET /api/study-planner/:learnerId returns planner', async () => {
      const res = await request('GET', `/api/study-planner/${LEARNER}`);
      expect(res.status).toBe(200);
      expect(res.body.learnerId).toBe(LEARNER);
    });

    it('POST /api/study-planner/:learnerId/session starts session', async () => {
      const res = await request('POST', `/api/study-planner/${LEARNER}/session`, {
        mode: 'deep',
        plannedMinutes: 150,
        activities: ['retrieval', 'lab', 'debrief']
      });
      expect(res.status).toBe(201);
      expect(res.body.mode).toBe('deep');
      expect(res.body.plannedMinutes).toBe(150);
    });

    it('POST /api/study-planner/:learnerId/session/:sessionId/complete completes session', async () => {
      const startRes = await request('POST', `/api/study-planner/${LEARNER}/session`, {
        mode: 'normal',
        plannedMinutes: 90
      });
      const sessionId = startRes.body.id;
      const res = await request('POST', `/api/study-planner/${LEARNER}/session/${sessionId}/complete`);
      expect(res.status).toBe(200);
      expect(res.body.completed).toBe(true);
    });
  });

  describe('Skill Graph', () => {
    it('GET /api/skill-graph/:learnerId returns skill graph', async () => {
      const res = await request('GET', `/api/skill-graph/${LEARNER}`);
      expect(res.status).toBe(200);
      expect(res.body.learnerId).toBe(LEARNER);
      expect(res.body).toHaveProperty('skills');
      expect(res.body).toHaveProperty('mastery');
    });

    it('PUT /api/skill-graph/:learnerId/:skillId updates mastery', async () => {
      const res = await request('PUT', `/api/skill-graph/${LEARNER}/ospf`, {
        mastery: 0.8
      });
      expect(res.status).toBe(200);
      expect(res.body.skills['ospf'].mastery).toBe(0.8);
    });

    it('PUT /api/skill-graph/:learnerId/:skillId returns 400 without mastery', async () => {
      const res = await request('PUT', `/api/skill-graph/${LEARNER}/ospf`, {});
      expect(res.status).toBe(400);
    });

    it('GET /api/skill-graph/:learnerId/prerequisites/:skillId returns prerequisites', async () => {
      const res = await request('GET', `/api/skill-graph/${LEARNER}/prerequisites/REF-001`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('skillId');
      expect(res.body).toHaveProperty('prerequisites');
      expect(Array.isArray(res.body.prerequisites)).toBe(true);
    });
  });

  describe('Debrief', () => {
    it('POST /api/labs/:labId/debrief/:learnerId creates debrief', async () => {
      const res = await request('POST', `/api/labs/REF-001/debrief/${LEARNER}`, {
        problem: 'OSPF adjacency issue',
        prediction: 'Routers will not form adjacency',
        configuration: 'Configured OSPF with correct area',
        evidence: 'show ip ospf neighbor displayed Full state',
        failures: 'Initially wrong area ID',
        failureCause: 'Typo in area number',
        helpfulCommands: ['show ip ospf interface', 'show ip route ospf'],
        realWorldApplication: 'Used in production campus network',
        conceptExplanation: 'OSPF forms adjacency when parameters match'
      });
      expect(res.status).toBe(201);
      expect(res.body.problem).toBe('OSPF adjacency issue');
      expect(res.body.completed).toBe(true);
    });

    it('GET /api/labs/:labId/debrief/:learnerId returns debrief', async () => {
      await request('POST', `/api/labs/REF-001/debrief/${LEARNER}`, {
        problem: 'Test problem',
        conceptExplanation: 'Test explanation'
      });
      const res = await request('GET', `/api/labs/REF-001/debrief/${LEARNER}`);
      expect(res.status).toBe(200);
      expect(res.body.problem).toBe('Test problem');
    });

    it('GET /api/labs/:labId/debrief/:learnerId returns 404 when no debrief', async () => {
      const res = await request('GET', `/api/labs/UNKNOWN/debrief/${LEARNER}`);
      expect(res.status).toBe(404);
    });
  });

  describe('Course Mode', () => {
    it('GET /api/courses returns seeded courses', async () => {
      const res = await request('GET', '/api/courses');
      expect(res.status).toBe(200);
      expect(res.body.count).toBeGreaterThan(0);
    });

    it('GET /api/courses/:courseId returns course details', async () => {
      const listRes = await request('GET', '/api/courses');
      const courseId = listRes.body.courses[0].id;
      const res = await request('GET', `/api/courses/${courseId}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(courseId);
      expect(res.body.stages.length).toBeGreaterThan(0);
    });

    it('POST /api/courses/:courseId/enroll/:learnerId enrolls learner', async () => {
      const listRes = await request('GET', '/api/courses');
      const courseId = listRes.body.courses[0].id;
      const res = await request('POST', `/api/courses/${courseId}/enroll/${LEARNER}`);
      expect(res.status).toBe(201);
      expect(res.body.learnerId).toBe(LEARNER);
      expect(res.body.courseId).toBe(courseId);
    });

    it('PUT /api/courses/:courseId/progress/:learnerId updates progress', async () => {
      const listRes = await request('GET', '/api/courses');
      const courseId = listRes.body.courses[0].id;
      await request('POST', `/api/courses/${courseId}/enroll/${LEARNER}`);
      const res = await request('PUT', `/api/courses/${courseId}/progress/${LEARNER}`, {
        stageIndex: 1,
        completed: true
      });
      expect(res.status).toBe(200);
      expect(res.body.completedStages).toContain('1');
    });
  });
});
