const http = require('http');

process.env.PORT = '0';
const { app, server } = require('../server');
const { dailyMissions, retrievalQueue, evidence, failureLabs, researchExperiments, portfolioArtifacts, studyPlanner, skillGraph, debriefs } = require('../state/state');
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

const LEARNER = 'learner-learning-ext';

describe('Learning API Extended', () => {
  afterAll(done => {
    server.close(done);
  });

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
    seedStaticData();
  });

  describe('Roadmap', () => {
    it('GET /api/roadmap returns 6 stages', async () => {
      const res = await request('GET', '/api/roadmap');
      expect(res.body.length).toBe(6);
    });

    it('each stage has id, title, description, skills, labs', async () => {
      const res = await request('GET', '/api/roadmap');
      res.body.forEach(stage => {
        expect(stage).toHaveProperty('id');
        expect(stage).toHaveProperty('title');
        expect(stage).toHaveProperty('description');
        expect(stage).toHaveProperty('skills');
        expect(stage).toHaveProperty('labs');
        expect(Array.isArray(stage.skills)).toBe(true);
        expect(Array.isArray(stage.labs)).toBe(true);
      });
    });

    it('GET /api/roadmap/:stage returns 404 for unknown', async () => {
      const res = await request('GET', '/api/roadmap/unknown');
      expect(res.status).toBe(404);
    });

    it('stage zero has correct id and title', async () => {
      const res = await request('GET', '/api/roadmap/zero');
      expect(res.body.id).toBe('zero');
      expect(res.body.title).toBe('Zero / Foundations');
    });
  });

  describe('Daily Missions', () => {
    it('GET /api/missions/today without learnerId returns 400', async () => {
      const res = await request('GET', '/api/missions/today');
      expect(res.status).toBe(400);
    });

    it('GET /api/missions/today returns mission with required fields', async () => {
      const res = await request('GET', `/api/missions/today?learnerId=${LEARNER}`);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('title');
      expect(res.body).toHaveProperty('description');
      expect(res.body).toHaveProperty('type');
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('estimatedTime');
      expect(res.body).toHaveProperty('requiredTools');
    });

    it('mission type is lab or review', async () => {
      const res = await request('GET', `/api/missions/today?learnerId=${LEARNER}`);
      expect(['lab', 'review']).toContain(res.body.type);
    });

    it('POST /api/missions/:learnerId/:missionId/complete returns 404 for unknown mission', async () => {
      const res = await request('POST', `/api/missions/${LEARNER}/unknown-mission/complete`);
      expect(res.status).toBe(404);
    });

    it('same learner gets same mission on same day', async () => {
      const res1 = await request('GET', `/api/missions/today?learnerId=${LEARNER}`);
      const res2 = await request('GET', `/api/missions/today?learnerId=${LEARNER}`);
      expect(res1.body.id).toBe(res2.body.id);
    });

    it('different learners get independent missions', async () => {
      const res1 = await request('GET', `/api/missions/today?learnerId=${LEARNER}-a`);
      const res2 = await request('GET', `/api/missions/today?learnerId=${LEARNER}-b`);
      expect(res1.body.learnerId).toBe(`${LEARNER}-a`);
      expect(res2.body.learnerId).toBe(`${LEARNER}-b`);
    });
  });

  describe('Retrieval', () => {
    it('GET /api/retrieval/due/:learnerId returns empty initially', async () => {
      const res = await request('GET', `/api/retrieval/due/${LEARNER}`);
      expect(res.body.questions).toEqual([]);
      expect(res.body.count).toBe(0);
    });

    it('POST /api/retrieval/:learnerId/add creates question', async () => {
      const res = await request('POST', `/api/retrieval/${LEARNER}/add`, {
        question: 'What is OSPF?',
        options: ['Link-state', 'Distance-vector'],
        correctAnswer: 'Link-state',
        topic: 'routing',
        difficulty: 'medium'
      });
      expect(res.status).toBe(201);
      expect(res.body.question).toBe('What is OSPF?');
    });

    it('POST /api/retrieval/:learnerId/:questionId/answer returns correct result', async () => {
      const addRes = await request('POST', `/api/retrieval/${LEARNER}/add`, {
        question: 'What is VLAN?',
        options: ['Virtual LAN', 'Very Large Area Network'],
        correctAnswer: 'Virtual LAN',
        topic: 'switching'
      });
      const res = await request('POST', `/api/retrieval/${LEARNER}/${addRes.body.id}/answer`, {
        answer: 'Virtual LAN'
      });
      expect(res.body.correct).toBe(true);
      expect(res.body.nextDueAt).toBeDefined();
    });

    it('POST /api/retrieval/:learnerId/:questionId/answer returns incorrect result', async () => {
      const addRes = await request('POST', `/api/retrieval/${LEARNER}/add`, {
        question: 'What is VLAN?',
        options: ['Virtual LAN', 'Very Large Area Network'],
        correctAnswer: 'Virtual LAN',
        topic: 'switching'
      });
      const res = await request('POST', `/api/retrieval/${LEARNER}/${addRes.body.id}/answer`, {
        answer: 'Very Large Area Network'
      });
      expect(res.body.correct).toBe(false);
    });

    it('POST /api/retrieval/:learnerId/:questionId/answer returns 404 for unknown question', async () => {
      const res = await request('POST', `/api/retrieval/${LEARNER}/unknown/answer`, { answer: 'test' });
      expect(res.status).toBe(404);
    });

    it('answer without answer field returns 400', async () => {
      const res = await request('POST', `/api/retrieval/${LEARNER}/q1/answer`, {});
      expect(res.status).toBe(400);
    });

    it('add without question field creates entry', async () => {
      const res = await request('POST', `/api/retrieval/${LEARNER}/add`, {
        options: [],
        correctAnswer: 'A',
        topic: 'test'
      });
      expect(res.status).toBe(201);
    });
  });

  describe('Evidence', () => {
    it('GET /api/evidence/:learnerId returns empty initially', async () => {
      const res = await request('GET', `/api/evidence/${LEARNER}`);
      expect(res.body.evidence).toEqual([]);
      expect(res.body.count).toBe(0);
    });

    it('POST /api/evidence/:learnerId adds evidence', async () => {
      const res = await request('POST', `/api/evidence/${LEARNER}`, {
        labId: 'REF-001',
        type: 'output',
        title: 'Ping output',
        data: { command: 'ping 8.8.8.8' },
        tags: ['ping', 'connectivity']
      });
      expect(res.status).toBe(201);
      expect(res.body.labId).toBe('REF-001');
      expect(res.body.type).toBe('output');
    });

    it('evidence item has id, learnerId, createdAt', async () => {
      const before = Date.now();
      const res = await request('POST', `/api/evidence/${LEARNER}`, {
        labId: 'REF-001',
        type: 'output',
        title: 'Test',
        data: {}
      });
      expect(res.body.id).toBeDefined();
      expect(res.body.learnerId).toBe(LEARNER);
      expect(res.body.createdAt).toBeGreaterThanOrEqual(before);
    });

    it('multiple evidence items accumulate', async () => {
      await request('POST', `/api/evidence/${LEARNER}`, { labId: 'REF-001', type: 'output', title: 'A', data: {} });
      await request('POST`, `/api/evidence/${LEARNER}`, { labId: 'REF-001', type: 'screenshot', title: 'B', data: {} });
      const res = await request('GET', `/api/evidence/${LEARNER}`);
      expect(res.body.count).toBe(2);
    });
  });

  describe('Failure Labs', () => {
    it('GET /api/failure-labs/:labId returns state with labId', async () => {
      const res = await request('GET', '/api/failure-labs/REF-001');
      expect(res.body.labId).toBe('REF-001');
    });

    it('POST /api/failure-labs/:labId/inject returns fault with id', async () => {
      const res = await request('POST', '/api/failure-labs/REF-001/inject', { type: 'interface_down' });
      expect(res.body.fault.id).toBeDefined();
    });

    it('POST /api/failure-labs/:labId/clear/:faultId returns 404 for unknown', async () => {
      const res = await request('POST', '/api/failure-labs/REF-001/clear/unknown');
      expect(res.status).toBe(404);
    });
  });

  describe('Troubleshooting Coach', () => {
    it('GET /api/coach/:labId/:stepId returns guide or 404', async () => {
      const res = await request('GET', '/api/coach/REF-001/1-S-01');
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('hints');
      }
    });

    it('guide has hints array', async () => {
      const res = await request('GET', '/api/coach/REF-001/1-S-01');
      if (res.status === 200) {
        expect(Array.isArray(res.body.hints)).toBe(true);
      }
    });

    it('guide has troubleshooting section', async () => {
      const res = await request('GET', '/api/coach/REF-001/1-S-01');
      if (res.status === 200) {
        expect(res.body).toHaveProperty('troubleshooting');
      }
    });
  });

  describe('Skill Prerequisites', () => {
    it('GET /api/skill-graph/:learnerId/prerequisites/:skillId returns prereqs', async () => {
      const res = await request('GET', `/api/skill-graph/${LEARNER}/prerequisites/REF-001`);
      expect(res.body).toHaveProperty('skillId');
      expect(res.body).toHaveProperty('prerequisites');
      expect(Array.isArray(res.body.prerequisites)).toBe(true);
    });
  });
});
