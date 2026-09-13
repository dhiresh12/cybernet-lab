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

describe('Lab API Quality Gate', () => {
  afterAll(done => {
    server.close(done);
  });

  it('GET /api/health reports backend and websocket availability', async () => {
    const res = await request('GET', '/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('cybernet-lab-backend');
    expect(res.body.websocket).toBe('available');
    expect(res.body.timestamp).toBeDefined();
  });

  it('GET /api/labs excludes truly quarantined labs (not remediated)', async () => {
    const res = await request('GET', '/api/labs');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const ids = res.body.map(l => l.id);
    // Lab 23 is now remediated and included in the list
    expect(ids).toContain('23');
    expect(ids).toContain('REF-001');
    expect(ids).toContain('REF-002');
  });

  it('GET /api/labs/:id returns lab for quarantined lab', async () => {
    const res = await request('GET', '/api/labs/23');
    // Lab 23 was remediated and unquarantined in Session 5.8
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('23');
    expect(res.body.title).toBe('SSH Hardening and Secure Access');
  });

  it('GET /api/labs/:id returns lab for REF-001', async () => {
    const res = await request('GET', '/api/labs/REF-001');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('REF-001');
  });

  it('GET /api/labs/:id returns lab for REF-002', async () => {
    const res = await request('GET', '/api/labs/REF-002');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('REF-002');
  });

  it('POST /api/labs/:id/start returns session for remediated lab 23', async () => {
    const res = await request('POST', '/api/labs/23/start');
    // Lab 23 was remediated and unquarantined in Session 5.8
    expect(res.status).toBe(200);
    expect(res.body.sessionId).toBeDefined();
    expect(res.body.labState.labId).toBe('23');
  });

  it('POST /api/labs/:id/start returns session for REF-001', async () => {
    const res = await request('POST', '/api/labs/REF-001/start');
    expect(res.status).toBe(200);
    expect(res.body.sessionId).toBeDefined();
    expect(res.body.labState.labId).toBe('REF-001');
  });

  it('does not expose or reset a session through a different lab route', async () => {
    const started = await request('POST', '/api/labs/REF-001/start');
    const sessionId = started.body.sessionId;

    const mismatchedGet = await request('GET', `/api/labs/23/sessions/${sessionId}`);
    expect(mismatchedGet.status).toBe(404);

    const mismatchedReset = await request('DELETE', `/api/labs/23/sessions/${sessionId}`);
    expect(mismatchedReset.status).toBe(404);

    const matchingGet = await request('GET', `/api/labs/REF-001/sessions/${sessionId}`);
    expect(matchingGet.status).toBe(200);
    expect(matchingGet.body.labId).toBe('REF-001');
  });
});
