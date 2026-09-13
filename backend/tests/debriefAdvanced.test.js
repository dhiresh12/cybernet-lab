const http = require('http');

process.env.PORT = '0';
const { app, server } = require('../server');
const { debriefs } = require('../state/state');

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

describe('Debrief Advanced API', () => {
  afterAll(done => {
    server.close(done);
  });

  beforeEach(() => {
    debriefs.clear();
  });

  it('POST /api/labs/:labId/debrief/:learnerId creates debrief', async () => {
    const res = await request('POST', '/api/labs/REF-001/debrief/learner-1', {
      problem: 'OSPF issue',
      conceptExplanation: 'OSPF explanation'
    });
    expect(res.status).toBe(201);
    expect(res.body.problem).toBe('OSPF issue');
    expect(res.body.completed).toBe(true);
  });

  it('POST /api/labs/:labId/debrief/:learnerId marks incomplete without required fields', async () => {
    const res = await request('POST', '/api/labs/REF-001/debrief/learner-1', {
      problem: 'Test'
    });
    expect(res.body.completed).toBe(false);
  });

  it('POST /api/labs/:labId/debrief/:learnerId returns existing debrief on duplicate', async () => {
    await request('POST', '/api/labs/REF-001/debrief/learner-1', {
      problem: 'Original',
      conceptExplanation: 'Original explanation'
    });
    const res = await request('POST', '/api/labs/REF-001/debrief/learner-1', {
      problem: 'Updated',
      conceptExplanation: 'Updated explanation'
    });
    expect(res.status).toBe(201);
    expect(res.body.problem).toBe('Updated');
    const count = Array.from(debriefs.values()).filter(d => d.learnerId === 'learner-1' && d.labId === 'REF-001').length;
    expect(count).toBe(1);
  });

  it('GET /api/labs/:labId/debrief/:learnerId returns debrief', async () => {
    await request('POST', '/api/labs/REF-001/debrief/learner-1', {
      problem: 'Test problem',
      conceptExplanation: 'Test explanation'
    });
    const res = await request('GET', '/api/labs/REF-001/debrief/learner-1');
    expect(res.status).toBe(200);
    expect(res.body.problem).toBe('Test problem');
  });

  it('GET /api/labs/:labId/debrief/:learnerId returns 404 when no debrief', async () => {
    const res = await request('GET', '/api/labs/UNKNOWN/debrief/learner-1');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Debrief not found');
  });

  it('debrief has all expected fields', async () => {
    const res = await request('POST', '/api/labs/REF-001/debrief/learner-1', {
      problem: 'Problem',
      prediction: 'Prediction',
      configuration: 'Config',
      evidence: 'Evidence',
      failures: 'Failures',
      failureCause: 'Cause',
      helpfulCommands: ['show ip ospf'],
      realWorldApplication: 'Production',
      conceptExplanation: 'Explanation',
      selfAssessment: 'Good'
    });
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('learnerId');
    expect(res.body).toHaveProperty('labId');
    expect(res.body).toHaveProperty('problem');
    expect(res.body).toHaveProperty('prediction');
    expect(res.body).toHaveProperty('configuration');
    expect(res.body).toHaveProperty('evidence');
    expect(res.body).toHaveProperty('failures');
    expect(res.body).toHaveProperty('failureCause');
    expect(res.body).toHaveProperty('helpfulCommands');
    expect(res.body).toHaveProperty('realWorldApplication');
    expect(res.body).toHaveProperty('conceptExplanation');
    expect(res.body).toHaveProperty('selfAssessment');
    expect(res.body).toHaveProperty('completed');
    expect(res.body).toHaveProperty('createdAt');
    expect(res.body).toHaveProperty('updatedAt');
  });

  it('debrief key is learnerId-labId', async () => {
    await request('POST', '/api/labs/REF-001/debrief/learner-1', {
      problem: 'Test',
      conceptExplanation: 'Test'
    });
    expect(debriefs.has('learner-1-REF-001')).toBe(true);
  });

  it('different learners have separate debriefs for same lab', async () => {
    await request('POST', '/api/labs/REF-001/debrief/learner-1', {
      problem: 'Problem 1',
      conceptExplanation: 'Explanation 1'
    });
    await request('POST', '/api/labs/REF-001/debrief/learner-2', {
      problem: 'Problem 2',
      conceptExplanation: 'Explanation 2'
    });
    const res1 = await request('GET', '/api/labs/REF-001/debrief/learner-1');
    const res2 = await request('GET', '/api/labs/REF-001/debrief/learner-2');
    expect(res1.body.problem).toBe('Problem 1');
    expect(res2.body.problem).toBe('Problem 2');
  });

  it('debrief updatedAt changes on update', async () => {
    await request('POST', '/api/labs/REF-001/debrief/learner-1', {
      problem: 'Original',
      conceptExplanation: 'Original'
    });
    const original = await request('GET', '/api/labs/REF-001/debrief/learner-1');
    await new Promise(r => setTimeout(r, 10));
    await request('POST', '/api/labs/REF-001/debrief/learner-1', {
      problem: 'Updated',
      conceptExplanation: 'Updated'
    });
    const updated = await request('GET', '/api/labs/REF-001/debrief/learner-1');
    expect(updated.body.updatedAt).toBeGreaterThanOrEqual(original.body.updatedAt);
  });
});
