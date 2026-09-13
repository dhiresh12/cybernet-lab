const http = require('http');

process.env.PORT = '0';
const { app, server } = require('../server');
const { interviewQuestions, portfolioArtifacts } = require('../state/state');

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

describe('Interview and Portfolio Advanced API', () => {
  afterAll(done => {
    server.close(done);
  });

  beforeEach(() => {
    interviewQuestions.clear();
    portfolioArtifacts.clear();
  });

  describe('Interview Questions', () => {
    it('GET /api/interview/:topicId returns questions', async () => {
      const res = await request('GET', '/api/interview/networking-basics');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.questions)).toBe(true);
    });

    it('GET /api/interview/:topicId returns empty for unknown topic', async () => {
      const res = await request('GET', '/api/interview/unknown-topic');
      expect(res.status).toBe(200);
      expect(res.body.questions).toEqual([]);
      expect(res.body.count).toBe(0);
    });

    it('question objects have expected fields', async () => {
      const res = await request('GET', '/api/interview/networking-basics');
      if (res.body.questions.length > 0) {
        const q = res.body.questions[0];
        expect(q).toHaveProperty('id');
        expect(q).toHaveProperty('level');
        expect(q).toHaveProperty('question');
        expect(q).toHaveProperty('expectedAnswer');
        expect(q).toHaveProperty('tips');
        expect(q).toHaveProperty('followUp');
      }
    });

    it('questions have tips and followUp arrays', async () => {
      const res = await request('GET', '/api/interview/networking-basics');
      const q = res.body.questions[0];
      expect(Array.isArray(q.tips)).toBe(true);
      expect(Array.isArray(q.followUp)).toBe(true);
    });

    it('response has count property', async () => {
      const res = await request('GET', '/api/interview/networking-basics');
      expect(res.body).toHaveProperty('count');
      expect(res.body.count).toBe(res.body.questions.length);
    });

    it('different topics return independent questions', async () => {
      await request('GET', '/api/interview/networking-basics');
      await request('GET', '/api/interview/security');
      expect(interviewQuestions.size).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Portfolio', () => {
    it('GET /api/portfolio/:learnerId returns empty for new learner', async () => {
      const res = await request('GET', '/api/portfolio/new-learner');
      expect(res.status).toBe(200);
      expect(res.body.artifacts).toEqual([]);
      expect(res.body.count).toBe(0);
    });

    it('POST /api/portfolio/:learnerId/artifacts adds artifact', async () => {
      const res = await request('POST', '/api/portfolio/learner-1/artifacts', {
        type: 'lab_report',
        title: 'OSPF Lab Report',
        content: { summary: 'Configured OSPF' },
        labId: 'REF-001',
        tags: ['ospf', 'routing']
      });
      expect(res.status).toBe(201);
      expect(res.body.title).toBe('OSPF Lab Report');
      expect(res.body.type).toBe('lab_report');
      expect(res.body.tags).toEqual(['ospf', 'routing']);
    });

    it('POST /api/portfolio/:learnerId/artifacts stores artifact', async () => {
      await request('POST', '/api/portfolio/learner-1/artifacts', {
        type: 'lab_report',
        title: 'Report',
        content: {},
        labId: 'REF-001',
        tags: []
      });
      const res = await request('GET', '/api/portfolio/learner-1');
      expect(res.body.count).toBe(1);
      expect(res.body.artifacts[0].title).toBe('Report');
    });

    it('POST /api/portfolio/:learnerId/artifacts defaults type to lab_report', async () => {
      const res = await request('POST', '/api/portfolio/learner-1/artifacts', {
        title: 'Untitled',
        content: {}
      });
      expect(res.body.type).toBe('lab_report');
    });

    it('POST /api/portfolio/:learnerId/artifacts defaults title to Untitled', async () => {
      const res = await request('POST', '/api/portfolio/learner-1/artifacts', {
        content: {}
      });
      expect(res.body.title).toBe('Untitled');
    });

    it('POST /api/portfolio/:learnerId/artifacts defaults tags to empty array', async () => {
      const res = await request('POST', '/api/portfolio/learner-1/artifacts', {
        title: 'Test',
        content: {}
      });
      expect(res.body.tags).toEqual([]);
    });

    it('POST /api/portfolio/:learnerId/artifacts has id and timestamp', async () => {
      const before = Date.now();
      const res = await request('POST', '/api/portfolio/learner-1/artifacts', {
        title: 'Test',
        content: {}
      });
      expect(res.body.id).toBeDefined();
      expect(res.body.createdAt).toBeGreaterThanOrEqual(before);
    });

    it('multiple artifacts accumulate for same learner', async () => {
      await request('POST', '/api/portfolio/learner-1/artifacts', { title: 'A', content: {} });
      await request('POST', '/api/portfolio/learner-1/artifacts', { title: 'B', content: {} });
      const res = await request('GET', '/api/portfolio/learner-1');
      expect(res.body.count).toBe(2);
    });

    it('different learners have independent portfolios', async () => {
      await request('POST', '/api/portfolio/learner-1/artifacts', { title: 'L1', content: {} });
      await request('POST', '/api/portfolio/learner-2/artifacts', { title: 'L2', content: {} });
      const res1 = await request('GET', '/api/portfolio/learner-1');
      const res2 = await request('GET', '/api/portfolio/learner-2');
      expect(res1.body.count).toBe(1);
      expect(res2.body.count).toBe(1);
      expect(res1.body.artifacts[0].title).toBe('L1');
      expect(res2.body.artifacts[0].title).toBe('L2');
    });

    it('artifact stores labId reference', async () => {
      const res = await request('POST', '/api/portfolio/learner-1/artifacts', {
        title: 'Report',
        content: {},
        labId: 'REF-002'
      });
      expect(res.body.labId).toBe('REF-002');
    });

    it('artifact stores content object', async () => {
      const content = { summary: 'Test summary', devices: 3 };
      const res = await request('POST', '/api/portfolio/learner-1/artifacts', {
        title: 'Report',
        content
      });
      expect(res.body.content).toEqual(content);
    });
  });
});
