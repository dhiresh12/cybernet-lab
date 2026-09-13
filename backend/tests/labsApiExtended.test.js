const http = require('http');

process.env.PORT = '0';
const { app, server } = require('../server');
const { labs } = require('../state/state');

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

describe('Labs API Extended', () => {
  afterAll(done => {
    server.close(done);
  });

  it('GET /api/labs returns array of lab summaries', async () => {
    const res = await request('GET', '/api/labs');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('lab summary has id, title, category, level, time', async () => {
    const res = await request('GET', '/api/labs');
    const lab = res.body[0];
    expect(lab).toHaveProperty('id');
    expect(lab).toHaveProperty('title');
    expect(lab).toHaveProperty('category');
    expect(lab).toHaveProperty('level');
    expect(lab).toHaveProperty('time');
  });

  it('GET /api/labs excludes quarantined labs', async () => {
    const res = await request('GET', '/api/labs');
    const ids = res.body.map(l => l.id);
    expect(ids).not.toContain('122');
    expect(ids).not.toContain('113');
  });

  it('GET /api/labs/:id returns full lab object', async () => {
    const res = await request('GET', '/api/labs/REF-001');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('REF-001');
    expect(res.body).toHaveProperty('title');
    expect(res.body).toHaveProperty('steps');
    expect(res.body).toHaveProperty('topology');
  });

  it('GET /api/labs/:id returns 404 for quarantined lab', async () => {
    const res = await request('GET', '/api/labs/122');
    expect(res.status).toBe(404);
  });

  it('GET /api/labs/:id returns 404 for unknown lab', async () => {
    const res = await request('GET', '/api/labs/unknown-lab');
    expect(res.status).toBe(404);
  });

  it('POST /api/labs/:id/start returns sessionId and labState', async () => {
    const res = await request('POST', '/api/labs/REF-001/start');
    expect(res.status).toBe(200);
    expect(res.body.sessionId).toBeDefined();
    expect(res.body.labState).toBeDefined();
    expect(res.body.labState.labId).toBe('REF-001');
  });

  it('POST /api/labs/:id/start returns deviceStates array', async () => {
    const res = await request('POST', '/api/labs/REF-001/start');
    expect(Array.isArray(res.body.labState.deviceStates)).toBe(true);
  });

  it('POST /api/labs/:id/start returns topology', async () => {
    const res = await request('POST', '/api/labs/REF-001/start');
    expect(res.body.labState.topology).toBeDefined();
    expect(Array.isArray(res.body.labState.topology.edges)).toBe(true);
  });

  it('POST /api/labs/:id/start returns 404 for unknown lab', async () => {
    const res = await request('POST', '/api/labs/unknown-lab/start');
    expect(res.status).toBe(404);
  });

  it('GET /api/labs/:id/sessions/:sessionId returns session', async () => {
    const start = await request('POST', '/api/labs/REF-001/start');
    const sessionId = start.body.sessionId;
    const res = await request('GET', `/api/labs/REF-001/sessions/${sessionId}`);
    expect(res.status).toBe(200);
    expect(res.body.sessionId).toBe(sessionId);
    expect(res.body.labId).toBe('REF-001');
  });

  it('GET /api/labs/:id/sessions/:sessionId returns 404 for mismatched lab', async () => {
    const start = await request('POST', '/api/labs/REF-001/start');
    const sessionId = start.body.sessionId;
    const res = await request('GET', `/api/labs/REF-002/sessions/${sessionId}`);
    expect(res.status).toBe(404);
  });

  it('DELETE /api/labs/:id/sessions/:sessionId resets session', async () => {
    const start = await request('POST', '/api/labs/REF-001/start');
    const sessionId = start.body.sessionId;
    const res = await request('DELETE', `/api/labs/REF-001/sessions/${sessionId}`);
    expect(res.status).toBe(200);
    expect(res.body.reset).toBe(true);
    expect(res.body.sessionId).toBe(sessionId);
  });

  it('DELETE /api/labs/:id/sessions/:sessionId returns 404 for mismatched lab', async () => {
    const start = await request('POST', '/api/labs/REF-001/start');
    const sessionId = start.body.sessionId;
    const res = await request('DELETE', `/api/labs/REF-002/sessions/${sessionId}`);
    expect(res.status).toBe(404);
  });

  it('multiple labs can be started independently', async () => {
    const res1 = await request('POST', '/api/labs/REF-001/start');
    const res2 = await request('POST', '/api/labs/REF-002/start');
    expect(res1.body.sessionId).not.toBe(res2.body.sessionId);
    expect(res1.body.labState.labId).toBe('REF-001');
    expect(res2.body.labState.labId).toBe('REF-002');
  });

  it('lab steps have required structure', async () => {
    const res = await request('GET', '/api/labs/REF-001');
    expect(Array.isArray(res.body.steps)).toBe(true);
    if (res.body.steps.length > 0) {
      const step = res.body.steps[0];
      expect(step).toHaveProperty('stepId');
      expect(step).toHaveProperty('title');
      expect(step).toHaveProperty('verification');
    }
  });

  it('lab topology has nodes and edges', async () => {
    const res = await request('GET', '/api/labs/REF-001');
    expect(res.body.topology).toHaveProperty('nodes');
    expect(res.body.topology).toHaveProperty('edges');
    expect(Array.isArray(res.body.topology.nodes)).toBe(true);
    expect(Array.isArray(res.body.topology.edges)).toBe(true);
  });

  it('started session is cached', async () => {
    const start = await request('POST', '/api/labs/REF-001/start');
    const sessionId = start.body.sessionId;
    const get1 = await request('GET', `/api/labs/REF-001/sessions/${sessionId}`);
    const get2 = await request('GET', `/api/labs/REF-001/sessions/${sessionId}`);
    expect(get1.body.sessionId).toBe(get2.body.sessionId);
  });
});
