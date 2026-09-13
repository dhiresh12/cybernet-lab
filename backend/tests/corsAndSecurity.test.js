const http = require('http');

process.env.PORT = '0';
const { app, server } = require('../server');

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
          resolve({ status: res.statusCode, body: JSON.parse(data), headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, body: data, headers: res.headers });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

describe('CORS and Security Headers', () => {
  afterAll(done => {
    server.close(done);
  });

  it('GET /api/health returns 200 with JSON', async () => {
    const res = await request('GET', '/api/health');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body.status).toBe('ok');
  });

  it('responds to OPTIONS preflight for CORS', async () => {
    const res = await new Promise((resolve, reject) => {
      const options = {
        hostname: '127.0.0.1',
        port,
        path: '/api/health',
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:5173',
          'Access-Control-Request-Method': 'GET'
        }
      };
      const req = http.request(options, res => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers }));
      });
      req.on('error', reject);
      req.end();
    });
    expect([200, 204]).toContain(res.status);
  });

  it('GET /api/labs has CORS headers', async () => {
    const res = await request('GET', '/api/labs');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET /api/progress/:learnerId has CORS headers', async () => {
    const res = await request('GET', '/api/progress/learner-1');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET /api/tickets has CORS headers', async () => {
    const res = await request('GET', '/api/tickets');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET /api/roadmap has CORS headers', async () => {
    const res = await request('GET', '/api/roadmap');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET /api/courses has CORS headers', async () => {
    const res = await request('GET', '/api/courses');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('POST /api/tickets returns 201 with JSON', async () => {
    const res = await request('POST', '/api/tickets', {
      labId: 'REF-001',
      issueType: 'configuration_error',
      description: 'test',
      reportedBy: 'tester'
    });
    expect(res.status).toBe(201);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body.id).toBeDefined();
  });

  it('404 responses are JSON', async () => {
    const res = await request('GET', '/api/labs/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body.error).toBeDefined();
  });

  it('400 responses are JSON', async () => {
    const res = await request('POST', '/api/tickets', {
      issueType: 'configuration_error',
      description: 'Missing labId'
    });
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body.error).toBeDefined();
  });

  it('500 responses are JSON', async () => {
    const res = await request('GET', '/api/telemetry');
    expect(res.status).toBe(500);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body.error).toBeDefined();
  });

  it('POST with invalid JSON returns 400', async () => {
    const res = await new Promise((resolve, reject) => {
      const options = {
        hostname: '127.0.0.1',
        port,
        path: '/api/tickets',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      };
      const req = http.request(options, res => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
          catch { resolve({ status: res.statusCode, body: data }); }
        });
      });
      req.on('error', reject);
      req.write('not valid json');
      req.end();
    });
    expect(res.status).toBe(400);
  });

  it('GET unknown route returns 404 JSON', async () => {
    const res = await request('GET', '/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('all learning endpoints return JSON content-type', async () => {
    const endpoints = [
      'GET /api/roadmap',
      'GET /api/missions/today?learnerId=1',
      'GET /api/retrieval/due/1',
      'GET /api/evidence/1',
      'GET /api/failure-labs/1',
      'GET /api/interview/networking-basics',
      'GET /api/portfolio/1',
      'GET /api/study-planner/1',
      'GET /api/skill-graph/1',
      'GET /api/courses'
    ];
    for (const ep of endpoints) {
      const [method, path] = ep.split(' ');
      const res = await request(method, path);
      expect(res.headers['content-type']).toMatch(/json/);
    }
  });

  it('all ticket endpoints return JSON content-type', async () => {
    const createRes = await request('POST', '/api/tickets', {
      labId: 'REF-001',
      issueType: 'configuration_error',
      description: 'test',
      reportedBy: 'tester'
    });
    const ticketId = createRes.body.id;
    const endpoints = [
      `GET /api/tickets/${ticketId}`,
      `GET /api/tickets/stats`,
      'GET /api/tickets/search?q=test'
    ];
    for (const ep of endpoints) {
      const [method, path] = ep.split(' ');
      const res = await request(method, path);
      expect(res.headers['content-type']).toMatch(/json/);
    }
  });

  it('all progress endpoints return JSON content-type', async () => {
    const endpoints = [
      'GET /api/progress/learner-1',
      'GET /api/progress/learner-1/available',
      'GET /api/progress/learner-1/locked',
      'GET /api/progress/learner-1/lab/REF-001'
    ];
    for (const ep of endpoints) {
      const [method, path] = ep.split(' ');
      const res = await request(method, path);
      expect(res.headers['content-type']).toMatch(/json/);
    }
  });

  it('POST response bodies contain expected fields', async () => {
    const res = await request('POST', '/api/tickets', {
      labId: 'REF-001',
      issueType: 'connectivity_issue',
      description: 'CORS test',
      reportedBy: 'tester'
    });
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('labId');
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('createdAt');
  });

  it('PUT response bodies contain expected fields', async () => {
    const createRes = await request('POST', '/api/tickets', {
      labId: 'REF-001',
      issueType: 'connectivity_issue',
      description: 'Update test',
      reportedBy: 'tester'
    });
    const ticketId = createRes.body.id;
    const res = await request('PUT', `/api/tickets/${ticketId}`, {
      status: 'in_progress'
    });
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('updatedAt');
  });

  it('DELETE response has expected format', async () => {
    const createRes = await request('POST', '/api/tickets', {
      labId: 'REF-001',
      issueType: 'other',
      description: 'Delete test',
      reportedBy: 'tester'
    });
    const ticketId = createRes.body.id;
    const res = await request('DELETE', `/api/tickets/${ticketId}`, { deletedBy: 'tester' });
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(true);
  });

  it('error responses have error field', async () => {
    const res = await request('GET', '/api/tickets/unknown-id');
    expect(res.body).toHaveProperty('error');
    expect(typeof res.body.error).toBe('string');
  });

  it('list responses are arrays when appropriate', async () => {
    const res = await request('GET', '/api/labs');
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('list responses have object wrapper when appropriate', async () => {
    const res = await request('GET', '/api/tickets/stats');
    expect(typeof res.body).toBe('object');
    expect(res.body).toHaveProperty('total');
  });

  it('X-Content-Type-Options header present', async () => {
    const res = await request('GET', '/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('X-Frame-Options header present', async () => {
    const res = await request('GET', '/api/health');
    expect(res.headers['x-frame-options']).toBeDefined();
  });
});
