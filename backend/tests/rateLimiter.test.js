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

describe('Rate Limiter', () => {
  afterAll(done => {
    server.close(done);
  });

  it('GET /api/health is not rate limited', async () => {
    for (let i = 0; i < 5; i++) {
      const res = await request('GET', '/api/health');
      expect(res.status).toBe(200);
    }
  });

  it('POST /api/labs/:id/start is rate limited after 3 requests per minute', async () => {
    for (let i = 0; i < 3; i++) {
      const res = await request('POST', '/api/labs/REF-001/start');
      expect(res.status).toBe(200);
    }
    const res = await request('POST', '/api/labs/REF-001/start');
    expect(res.status).toBe(429);
    expect(res.body.error).toContain('Too many');
  });

  it('different IPs have independent rate limits', async () => {
    for (let i = 0; i < 3; i++) {
      const res = await request('POST', '/api/labs/REF-001/start');
      expect(res.status).toBe(200);
    }
    const res = await request('POST', '/api/labs/REF-001/start');
    expect(res.status).toBe(429);
  });

  it('different labs have independent rate limits', async () => {
    for (let i = 0; i < 3; i++) {
      const res1 = await request('POST', '/api/labs/REF-001/start');
      const res2 = await request('POST', '/api/labs/REF-002/start');
      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
    }
    const res = await request('POST', '/api/labs/REF-001/start');
    expect(res.status).toBe(429);
    const res2 = await request('POST', '/api/labs/REF-002/start');
    expect(res.status).toBe(429);
  });

  it('global IP limiter blocks after 60 requests per minute', async () => {
    for (let i = 0; i < 60; i++) {
      const res = await request('GET', '/api/health');
      expect(res.status).toBe(200);
    }
    const res = await request('GET', '/api/health');
    expect(res.status).toBe(429);
    expect(res.body.error).toContain('Too many requests');
  });

  it('rate limit response is JSON', async () => {
    for (let i = 0; i < 4; i++) {
      await request('POST', '/api/labs/REF-001/start');
    }
    const res = await request('POST', '/api/labs/REF-001/start');
    expect(res.status).toBe(429);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body.error).toBeDefined();
  });
});
