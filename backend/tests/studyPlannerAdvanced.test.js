const http = require('http');

process.env.PORT = '0';
const { app, server } = require('../server');
const { studyPlanner } = require('../state/state');

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

describe('Study Planner Advanced API', () => {
  afterAll(done => {
    server.close(done);
  });

  beforeEach(() => {
    studyPlanner.clear();
  });

  it('GET /api/study-planner/:learnerId creates planner if missing', async () => {
    const res = await request('GET', '/api/study-planner/new-learner');
    expect(res.status).toBe(200);
    expect(res.body.learnerId).toBe('new-learner');
    expect(res.body.mode).toBe('normal');
    expect(res.body.availableMinutes).toBe(90);
  });

  it('GET /api/study-planner/:learnerId returns existing planner', async () => {
    await request('GET', '/api/study-planner/learner-1');
    const res = await request('GET', '/api/study-planner/learner-1');
    expect(res.body.availableMinutes).toBe(90);
    expect(res.body.mode).toBe('normal');
  });

  it('PUT /api/study-planner/:learnerId updates planner', async () => {
    await request('GET', '/api/study-planner/learner-1');
    const res = await request('PUT', '/api/study-planner/learner-1', {
      mode: 'deep',
      availableMinutes: 120
    });
    expect(res.body.mode).toBe('deep');
    expect(res.body.availableMinutes).toBe(120);
  });

  it('PUT /api/study-planner/:learnerId preserves sessions', async () => {
    await request('GET', '/api/study-planner/learner-1');
    await request('POST', '/api/study-planner/learner-1/session', {
      mode: 'normal',
      plannedMinutes: 60
    });
    const res = await request('PUT', '/api/study-planner/learner-1', {
      mode: 'deep',
      availableMinutes: 120
    });
    expect(res.body.sessions.length).toBe(1);
  });

  it('PUT /api/study-planner/:learnerId sets updatedAt', async () => {
    await request('GET', '/api/study-planner/learner-1');
    const before = Date.now();
    const res = await request('PUT', '/api/study-planner/learner-1', {
      mode: 'deep'
    });
    expect(res.body.updatedAt).toBeGreaterThanOrEqual(before);
  });

  it('POST /api/study-planner/:learnerId/session starts session', async () => {
    const res = await request('POST', '/api/study-planner/learner-1/session', {
      mode: 'deep',
      plannedMinutes: 150,
      activities: ['retrieval', 'lab']
    });
    expect(res.status).toBe(201);
    expect(res.body.mode).toBe('deep');
    expect(res.body.plannedMinutes).toBe(150);
    expect(res.body.activities).toEqual(['retrieval', 'lab']);
    expect(res.body.completed).toBe(false);
  });

  it('POST /api/study-planner/:learnerId/session returns session with id', async () => {
    const res = await request('POST', '/api/study-planner/learner-1/session', {
      mode: 'normal',
      plannedMinutes: 90
    });
    expect(res.body.id).toBeDefined();
    expect(typeof res.body.id).toBe('string');
  });

  it('POST /api/study-planner/:learnerId/session stores session in planner', async () => {
    const startRes = await request('POST', '/api/study-planner/learner-1/session', {
      mode: 'normal',
      plannedMinutes: 90
    });
    const sessionId = startRes.body.id;
    const plannerRes = await request('GET', '/api/study-planner/learner-1');
    expect(plannerRes.body.sessions.some(s => s.id === sessionId)).toBe(true);
    expect(plannerRes.body.currentSessionId).toBe(sessionId);
  });

  it('POST /api/study-planner/:learnerId/session/:sessionId/complete completes session', async () => {
    const startRes = await request('POST', '/api/study-planner/learner-1/session', {
      mode: 'normal',
      plannedMinutes: 90
    });
    const sessionId = startRes.body.id;
    const res = await request('POST', `/api/study-planner/learner-1/session/${sessionId}/complete`);
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
    expect(res.body.completedAt).toBeDefined();
  });

  it('POST /api/study-planner/:learnerId/session/:sessionId/complete returns 404 for unknown session', async () => {
    const res = await request('POST', '/api/study-planner/learner-1/session/unknown-session/complete');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Session not found');
  });

  it('session has startedAt timestamp', async () => {
    const before = Date.now();
    const res = await request('POST', '/api/study-planner/learner-1/session', {
      mode: 'normal',
      plannedMinutes: 90
    });
    expect(res.body.startedAt).toBeGreaterThanOrEqual(before);
  });

  it('session defaults activities to empty array', async () => {
    const res = await request('POST', '/api/study-planner/learner-1/session', {
      mode: 'normal'
    });
    expect(res.body.activities).toEqual([]);
  });

  it('multiple sessions can be started', async () => {
    const res1 = await request('POST', '/api/study-planner/learner-1/session', {
      mode: 'normal',
      plannedMinutes: 60
    });
    const res2 = await request('POST', '/api/study-planner/learner-1/session', {
      mode: 'deep',
      plannedMinutes: 120
    });
    expect(res1.body.id).not.toBe(res2.body.id);
    const plannerRes = await request('GET', '/api/study-planner/learner-1');
    expect(plannerRes.body.sessions.length).toBe(2);
  });

  it('session defaults mode from planner', async () => {
    await request('PUT', '/api/study-planner/learner-1', { mode: 'deep' });
    const res = await request('POST', '/api/study-planner/learner-1/session', {
      plannedMinutes: 90
    });
    expect(res.body.mode).toBe('deep');
  });

  it('session defaults plannedMinutes from planner', async () => {
    await request('PUT', '/api/study-planner/learner-1', { availableMinutes: 150 });
    const res = await request('POST', '/api/study-planner/learner-1/session', {
      mode: 'normal'
    });
    expect(res.body.plannedMinutes).toBe(150);
  });
});
