const http = require('http');

process.env.PORT = '0';
const { app, server } = require('../server');
const { skillGraph } = require('../state/state');

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

describe('Skill Graph Advanced API', () => {
  afterAll(done => {
    server.close(done);
  });

  beforeEach(() => {
    skillGraph.clear();
  });

  it('GET /api/skill-graph/:learnerId creates graph if missing', async () => {
    const res = await request('GET', '/api/skill-graph/new-learner');
    expect(res.status).toBe(200);
    expect(res.body.learnerId).toBe('new-learner');
    expect(res.body.skills).toEqual({});
    expect(res.body.mastery).toEqual({});
  });

  it('GET /api/skill-graph/:learnerId returns existing graph', async () => {
    await request('GET', '/api/skill-graph/learner-1');
    const res = await request('GET', '/api/skill-graph/learner-1');
    expect(res.body.lastUpdated).toBeDefined();
  });

  it('PUT /api/skill-graph/:learnerId/:skillId updates mastery', async () => {
    const res = await request('PUT', '/api/skill-graph/learner-1/ospf', { mastery: 0.8 });
    expect(res.status).toBe(200);
    expect(res.body.skills['ospf'].mastery).toBe(0.8);
    expect(res.body.mastery['ospf']).toBe(0.8);
  });

  it('PUT /api/skill-graph/:learnerId/:skillId clamps mastery to 1.0', async () => {
    const res = await request('PUT', '/api/skill-graph/learner-1/ospf', { mastery: 1.5 });
    expect(res.body.skills['ospf'].mastery).toBe(1);
  });

  it('PUT /api/skill-graph/:learnerId/:skillId clamps mastery to 0.0', async () => {
    const res = await request('PUT', '/api/skill-graph/learner-1/ospf', { mastery: -0.5 });
    expect(res.body.skills['ospf'].mastery).toBe(0);
  });

  it('PUT /api/skill-graph/:learnerId/:skillId returns 400 without mastery', async () => {
    const res = await request('PUT', '/api/skill-graph/learner-1/ospf', {});
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('mastery');
  });

  it('PUT /api/skill-graph/:learnerId/:skillId increments attempts', async () => {
    await request('PUT', '/api/skill-graph/learner-1/ospf', { mastery: 0.5 });
    const res = await request('PUT', '/api/skill-graph/learner-1/ospf', { mastery: 0.6 });
    expect(res.body.skills['ospf'].attempts).toBe(2);
  });

  it('PUT /api/skill-graph/:learnerId/:skillId updates lastPracticed', async () => {
    const res = await request('PUT', '/api/skill-graph/learner-1/ospf', { mastery: 0.5 });
    expect(res.body.skills['ospf'].lastPracticed).toBeDefined();
  });

  it('PUT /api/skill-graph/:learnerId/:skillId updates lastUpdated', async () => {
    await request('PUT', '/api/skill-graph/learner-1/ospf', { mastery: 0.5 });
    const before = Date.now();
    const res = await request('PUT', '/api/skill-graph/learner-1/bgp', { mastery: 0.7 });
    expect(res.body.lastUpdated).toBeGreaterThanOrEqual(before);
  });

  it('multiple skills are tracked independently', async () => {
    await request('PUT', '/api/skill-graph/learner-1/ospf', { mastery: 0.8 });
    await request('PUT', '/api/skill-graph/learner-1/bgp', { mastery: 0.6 });
    const res = await request('GET', '/api/skill-graph/learner-1');
    expect(res.body.skills['ospf'].mastery).toBe(0.8);
    expect(res.body.skills['bgp'].mastery).toBe(0.6);
  });

  it('GET /api/skill-graph/:learnerId/prerequisites/:skillId returns prerequisites', async () => {
    const res = await request('GET', '/api/skill-graph/learner-1/prerequisites/REF-001');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('skillId');
    expect(res.body).toHaveProperty('prerequisites');
    expect(Array.isArray(res.body.prerequisites)).toBe(true);
  });

  it('GET /api/skill-graph/:learnerId/prerequisites/:skillId returns empty for no prereqs', async () => {
    const res = await request('GET', '/api/skill-graph/learner-1/prerequisites/nonexistent');
    expect(res.status).toBe(200);
    expect(res.body.prerequisites).toEqual([]);
  });
});
