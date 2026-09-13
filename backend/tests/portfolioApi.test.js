const http = require('http');

process.env.PORT = '0';
const { app, server } = require('../server');
const { portfolioArtifacts } = require('../state/state');

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

describe('Portfolio API', () => {
  afterAll(done => {
    server.close(done);
  });

  beforeEach(() => {
    portfolioArtifacts.clear();
  });

  describe('GET /api/portfolio/:learnerId', () => {
    it('returns empty portfolio for new learner', async () => {
      const res = await request('GET', '/api/portfolio/learner-1');
      expect(res.status).toBe(200);
      expect(res.body.artifacts).toEqual([]);
      expect(res.body.count).toBe(0);
    });

    it('returns 400 when learnerId is missing', async () => {
      const res = await request('GET', '/api/portfolio/');
      expect(res.status).toBe(404);
    });

    it('returns all artifacts for learner', async () => {
      await request('POST', '/api/portfolio/learner-1/artifacts', { title: 'A', content: {} });
      await request('POST', '/api/portfolio/learner-1/artifacts', { title: 'B', content: {} });
      const res = await request('GET', '/api/portfolio/learner-1');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
      expect(res.body.artifacts.map(a => a.title)).toEqual(['A', 'B']);
    });
  });

  describe('POST /api/portfolio/:learnerId/artifacts', () => {
    it('creates a new artifact', async () => {
      const res = await request('POST', '/api/portfolio/learner-1/artifacts', {
        type: 'lab_report',
        title: 'OSPF Lab Report',
        content: { summary: 'Configured OSPF' },
        labId: 'REF-001',
        tags: ['ospf', 'routing']
      });
      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.title).toBe('OSPF Lab Report');
      expect(res.body.type).toBe('lab_report');
      expect(res.body.tags).toEqual(['ospf', 'routing']);
      expect(res.body.labId).toBe('REF-001');
    });

    it('defaults type to lab_report', async () => {
      const res = await request('POST', '/api/portfolio/learner-1/artifacts', { title: 'Untitled', content: {} });
      expect(res.body.type).toBe('lab_report');
    });

    it('defaults title to Untitled', async () => {
      const res = await request('POST', '/api/portfolio/learner-1/artifacts', { content: {} });
      expect(res.body.title).toBe('Untitled');
    });

    it('defaults tags to empty array', async () => {
      const res = await request('POST', '/api/portfolio/learner-1/artifacts', { title: 'Test', content: {} });
      expect(res.body.tags).toEqual([]);
    });

    it('assigns id and timestamps', async () => {
      const before = Date.now();
      const res = await request('POST', '/api/portfolio/learner-1/artifacts', { title: 'Test', content: {} });
      expect(res.body.id).toBeDefined();
      expect(res.body.createdAt).toBeGreaterThanOrEqual(before);
      expect(res.body.updatedAt).toBeGreaterThanOrEqual(before);
    });

    it('returns 404 when learnerId is missing', async () => {
      const res = await request('POST', '/api/portfolio//artifacts', { title: 'Test', content: {} });
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/portfolio/:learnerId/artifacts/:artifactId', () => {
    it('updates an existing artifact', async () => {
      const created = await request('POST', '/api/portfolio/learner-1/artifacts', { title: 'Original', content: { summary: 'old' } });
      const artifactId = created.body.id;
      const res = await request('PUT', `/api/portfolio/learner-1/artifacts/${artifactId}`, { title: 'Updated', content: { summary: 'new' }, tags: ['updated'] });
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Updated');
      expect(res.body.content.summary).toBe('new');
      expect(res.body.tags).toEqual(['updated']);
    });

    it('returns 404 for unknown artifact', async () => {
      const res = await request('PUT', '/api/portfolio/learner-1/artifacts/unknown-id', { title: 'X' });
      expect(res.status).toBe(404);
    });

    it('returns 404 when learnerId is missing', async () => {
      const res = await request('PUT', '/api/portfolio//artifacts/abc', { title: 'X' });
      expect(res.status).toBe(404);
    });

    it('updates updatedAt timestamp', async () => {
      const created = await request('POST', '/api/portfolio/learner-1/artifacts', { title: 'Original', content: {} });
      const artifactId = created.body.id;
      const before = Date.now();
      const res = await request('PUT', `/api/portfolio/learner-1/artifacts/${artifactId}`, { title: 'Updated' });
      expect(res.status).toBe(200);
      expect(res.body.updatedAt).toBeGreaterThanOrEqual(before);
    });
  });

  describe('DELETE /api/portfolio/:learnerId/artifacts/:artifactId', () => {
    it('deletes an existing artifact', async () => {
      const created = await request('POST', '/api/portfolio/learner-1/artifacts', { title: 'ToDelete', content: {} });
      const artifactId = created.body.id;
      const res = await request('DELETE', `/api/portfolio/learner-1/artifacts/${artifactId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('deleted');
      const getRes = await request('GET', '/api/portfolio/learner-1');
      expect(getRes.body.count).toBe(0);
    });

    it('returns 404 for unknown artifact', async () => {
      const res = await request('DELETE', '/api/portfolio/learner-1/artifacts/unknown-id');
      expect(res.status).toBe(404);
    });

    it('returns 404 when learnerId is missing', async () => {
      const res = await request('DELETE', '/api/portfolio//artifacts/abc');
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/portfolio/:learnerId/export/json', () => {
    it('returns JSON export for learner', async () => {
      await request('POST', '/api/portfolio/learner-1/artifacts', { title: 'A', content: { a: 1 } });
      await request('POST', '/api/portfolio/learner-1/artifacts', { title: 'B', content: { b: 2 } });
      const res = await request('GET', '/api/portfolio/learner-1/export/json');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/json');
      const parsed = JSON.parse(res.body);
      expect(parsed.learnerId).toBe('learner-1');
      expect(parsed.count).toBe(2);
      expect(parsed.items.map(i => i.title)).toEqual(['A', 'B']);
    });

    it('returns 404 when learnerId is missing', async () => {
      const res = await request('GET', '/api/portfolio//export/json');
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/portfolio/:learnerId/export/pdf', () => {
    it('returns text export for learner', async () => {
      await request('POST', '/api/portfolio/learner-1/artifacts', { title: 'A', content: { a: 1 } });
      const res = await request('GET', '/api/portfolio/learner-1/export/pdf');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/plain');
      expect(res.body).toContain('CyberNet Lab Portfolio');
      expect(res.body).toContain('A');
    });

    it('returns 404 when learnerId is missing', async () => {
      const res = await request('GET', '/api/portfolio//export/pdf');
      expect(res.status).toBe(404);
    });
  });

  describe('learner isolation', () => {
    it('artifacts are isolated per learner', async () => {
      await request('POST', '/api/portfolio/learner-1/artifacts', { title: 'L1', content: {} });
      await request('POST', '/api/portfolio/learner-2/artifacts', { title: 'L2', content: {} });
      const r1 = await request('GET', '/api/portfolio/learner-1');
      const r2 = await request('GET', '/api/portfolio/learner-2');
      expect(r1.body.count).toBe(1);
      expect(r2.body.count).toBe(1);
      expect(r1.body.artifacts[0].title).toBe('L1');
      expect(r2.body.artifacts[0].title).toBe('L2');
    });
  });
});
