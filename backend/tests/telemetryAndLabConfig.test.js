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
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

describe('Telemetry and Lab Config API', () => {
  afterAll(done => {
    server.close(done);
  });

  it('GET /api/telemetry returns 500 when no telemetry stream', async () => {
    const res = await request('GET', '/api/telemetry');
    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });

  it('POST /api/inject-error returns result for valid lab', async () => {
    const res = await request('POST', '/api/inject-error', {
      labId: 'REF-001',
      errorType: 'interface_down'
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('result');
  });

  it('POST /api/inject-error handles missing body', async () => {
    const res = await request('POST', '/api/inject-error');
    expect(res.status).toBe(200);
  });

  it('PUT /api/lab-config/:id returns result', async () => {
    const res = await request('PUT', '/api/lab-config/REF-001', {
      setting: 'value'
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('result');
  });

  it('PUT /api/lab-config/:id handles invalid id', async () => {
    const res = await request('PUT', '/api/lab-config/nonexistent', {});
    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });

  it('POST /api/reset-lab/:id resets lab', async () => {
    const res = await request('POST', '/api/reset-lab/REF-001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('REF-001');
  });

  it('POST /api/reset-lab/:id returns message with lab id', async () => {
    const res = await request('POST', '/api/reset-lab/REF-002');
    expect(res.body.message).toContain('REF-002');
  });

  it('POST /api/reset-lab/:id handles invalid id gracefully', async () => {
    const res = await request('POST', '/api/reset-lab/nonexistent');
    expect(res.status).toBe(200);
  });

  it('all endpoints return JSON content-type', async () => {
    const endpoints = [
      'GET /api/telemetry',
      'POST /api/inject-error',
      'PUT /api/lab-config/REF-001',
      'POST /api/reset-lab/REF-001'
    ];
    for (const ep of endpoints) {
      const [method, path] = ep.split(' ');
      const res = await request(method, path);
      if (res.status !== 500) {
        expect(res.headers['content-type']).toMatch(/json/);
      }
    }
  });

  it('all error endpoints return error field', async () => {
    const res = await request('GET', '/api/telemetry');
    expect(res.body.error).toBeDefined();
  });

  it('POST /api/inject-error accepts various error types', async () => {
    const types = ['interface_down', 'routing_loop', 'acl_deny', 'dns_failure'];
    for (const errorType of types) {
      const res = await request('POST', '/api/inject-error', {
        labId: 'REF-001',
        errorType
      });
      expect(res.status).toBe(200);
    }
  });

  it('PUT /api/lab-config/:id accepts complex config objects', async () => {
    const config = {
      devices: [{ id: 'PC1', hostname: 'PC1' }],
      topology: { edges: [] },
      settings: { timeout: 30000 }
    };
    const res = await request('PUT', '/api/lab-config/REF-001', config);
    expect(res.status).toBe(200);
  });
});
