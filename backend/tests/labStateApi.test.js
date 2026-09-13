const http = require('http');

process.env.PORT = '0';
const { app, server } = require('../server');
const { userLabState } = require('../state/state');

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

describe('Lab State API', () => {
  afterAll(done => {
    server.close(done);
  });

  beforeEach(() => {
    userLabState.clear();
  });

  it('GET /api/labs/:id/state returns 404 when no state saved', async () => {
    const res = await request('GET', '/api/labs/REF-001/state');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('No saved state');
  });

  it('PUT /api/labs/:id/state saves state for valid lab', async () => {
    const res = await request('PUT', '/api/labs/REF-001/state', {
      currentStep: 1,
      completedSteps: ['1-S-01'],
      score: 10
    });
    expect(res.status).toBe(200);
    expect(res.body.saved).toBe(true);
    expect(res.body.state.currentStep).toBe(1);
    expect(res.body.state.labId).toBe('REF-001');
    expect(res.body.state.verifiedAt).toBeDefined();
  });

  it('PUT /api/labs/:id/state returns 404 for unknown lab', async () => {
    const res = await request('PUT', '/api/labs/unknown-lab/state', {
      currentStep: 1
    });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Lab not found');
  });

  it('PUT /api/labs/:id/state clamps score to max', async () => {
    const res = await request('PUT', '/api/labs/REF-001/state', {
      currentStep: 1,
      completedSteps: ['1-S-01'],
      score: 9999
    });
    expect(res.status).toBe(200);
    const lab = require('../data/labLoader').labs.get('REF-001');
    const maxScore = lab.steps.length * 10;
    expect(res.body.state.score).toBeLessThanOrEqual(maxScore);
  });

  it('PUT /api/labs/:id/state clamps score to min 0', async () => {
    const res = await request('PUT', '/api/labs/REF-001/state', {
      currentStep: 1,
      completedSteps: ['1-S-01'],
      score: -50
    });
    expect(res.status).toBe(200);
    expect(res.body.state.score).toBeGreaterThanOrEqual(0);
  });

  it('PUT /api/labs/:id/state clamps currentStep to valid range', async () => {
    const res = await request('PUT', '/api/labs/REF-001/state', {
      currentStep: 999,
      completedSteps: ['1-S-01']
    });
    expect(res.status).toBe(200);
    const lab = require('../data/labLoader').labs.get('REF-001');
    expect(res.body.state.currentStep).toBeLessThanOrEqual(lab.steps.length);
  });

  it('PUT /api/labs/:id/state filters invalid completedSteps', async () => {
    const res = await request('PUT', '/api/labs/REF-001/state', {
      currentStep: 1,
      completedSteps: ['invalid-step', '1-S-01', 'also-invalid']
    });
    expect(res.status).toBe(200);
    expect(res.body.state.completedSteps).toContain('1-S-01');
    expect(res.body.state.completedSteps).not.toContain('invalid-step');
  });

  it('PUT /api/labs/:id/state sets savedAt timestamp', async () => {
    const before = Date.now();
    const res = await request('PUT', '/api/labs/REF-001/state', {
      currentStep: 1,
      completedSteps: ['1-S-01']
    });
    const after = Date.now();
    expect(res.body.state.savedAt).toBeGreaterThanOrEqual(before);
    expect(res.body.state.savedAt).toBeLessThanOrEqual(after);
  });

  it('GET /api/labs/:id/state returns previously saved state', async () => {
    await request('PUT', '/api/labs/REF-001/state', {
      currentStep: 2,
      completedSteps: ['1-S-01', '1-S-02'],
      score: 20
    });
    const res = await request('GET', '/api/labs/REF-001/state');
    expect(res.status).toBe(200);
    expect(res.body.currentStep).toBe(2);
    expect(res.body.completedSteps).toContain('1-S-02');
  });

  it('GET /api/progress returns all user lab states', async () => {
    await request('PUT', '/api/labs/REF-001/state', { currentStep: 1, completedSteps: ['1-S-01'] });
    await request('PUT', '/api/labs/REF-002/state', { currentStep: 1, completedSteps: ['1-S-01'] });
    const res = await request('GET', '/api/progress');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  it('PUT /api/labs/:id/state with undefined score works', async () => {
    const res = await request('PUT', '/api/labs/REF-001/state', {
      currentStep: 1,
      completedSteps: ['1-S-01']
    });
    expect(res.status).toBe(200);
  });

  it('PUT /api/labs/:id/state preserves extra fields', async () => {
    const res = await request('PUT', '/api/labs/REF-001/state', {
      currentStep: 1,
      completedSteps: ['1-S-01'],
      customField: 'custom-value'
    });
    expect(res.status).toBe(200);
    expect(res.body.state.customField).toBe('custom-value');
  });

  it('multiple labs maintain independent states', async () => {
    await request('PUT', '/api/labs/REF-001/state', { currentStep: 1, completedSteps: ['1-S-01'] });
    await request('PUT', '/api/labs/REF-002/state', { currentStep: 2, completedSteps: ['1-S-01', '1-S-02'] });
    const res1 = await request('GET', '/api/labs/REF-001/state');
    const res2 = await request('GET', '/api/labs/REF-002/state');
    expect(res1.body.currentStep).toBe(1);
    expect(res2.body.currentStep).toBe(2);
  });
});
