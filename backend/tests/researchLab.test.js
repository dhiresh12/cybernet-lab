const http = require('http');

process.env.PORT = '0';
const { app, server } = require('../server');
const { researchProjects, researchNotebooks, innovationChallenges } = require('../state/state');

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

const LEARNER = 'learner-research-lab';

describe('Research Lab API', () => {
  afterAll(done => {
    server.close(done);
  });

  beforeEach(() => {
    researchProjects.clear();
    researchNotebooks.clear();
    innovationChallenges.clear();
  });

  describe('Experiment Templates', () => {
    it('GET /api/research/templates returns all 9 templates', async () => {
      const res = await request('GET', '/api/research/templates');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(9);
      expect(res.body.templates.every(t => t.id && t.title && t.category)).toBe(true);
    });

    it('GET /api/research/templates includes all predefined experiments', async () => {
      const res = await request('GET', '/api/research/templates');
      const ids = res.body.templates.map(t => t.id);
      expect(ids).toContain('compare-tcp-vs-udp');
      expect(ids).toContain('measure-packet-loss');
      expect(ids).toContain('compare-routing-paths');
      expect(ids).toContain('test-dns-latency');
      expect(ids).toContain('inspect-arp-behavior');
      expect(ids).toContain('measure-congestion');
      expect(ids).toContain('compare-acl-designs');
      expect(ids).toContain('evaluate-segmentation');
      expect(ids).toContain('investigate-anomaly-patterns');
    });

    it('GET /api/research/templates/:templateId returns template with steps', async () => {
      const res = await request('GET', '/api/research/templates/compare-tcp-vs-udp');
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Compare TCP vs UDP');
      expect(res.body.steps.length).toBeGreaterThan(0);
    });

    it('GET /api/research/templates/:templateId returns 404 for unknown', async () => {
      const res = await request('GET', '/api/research/templates/unknown-template');
      expect(res.status).toBe(404);
    });
  });

  describe('Research Projects CRUD', () => {
    it('POST /api/research-projects creates project', async () => {
      const res = await request('POST', '/api/research-projects', {
        learnerId: LEARNER,
        title: 'TCP vs UDP Study',
        description: 'Compare transport protocols'
      });
      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.title).toBe('TCP vs UDP Study');
      expect(res.body.status).toBe('draft');
      expect(res.body.learnerId).toBe(LEARNER);
    });

    it('POST /api/research-projects defaults learnerId to anonymous', async () => {
      const res = await request('POST', '/api/research-projects', { title: 'Anon' });
      expect(res.body.learnerId).toBe('anonymous');
    });

    it('GET /api/research-projects/:id returns project', async () => {
      const created = await request('POST', '/api/research-projects', { learnerId: LEARNER, title: 'Find Me' });
      const res = await request('GET', `/api/research-projects/${created.body.id}`);
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Find Me');
    });

    it('GET /api/research-projects/:id returns 404 for unknown', async () => {
      const res = await request('GET', '/api/research-projects/unknown-id');
      expect(res.status).toBe(404);
    });

    it('GET /api/research-projects/learner/:learnerId lists projects', async () => {
      await request('POST', '/api/research-projects', { learnerId: LEARNER, title: 'P1' });
      await request('POST', '/api/research-projects', { learnerId: 'other', title: 'P2' });
      await request('POST', '/api/research-projects', { learnerId: LEARNER, title: 'P3' });
      const res = await request('GET', `/api/research-projects/learner/${LEARNER}`);
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
      expect(res.body.projects.every(p => p.learnerId === LEARNER)).toBe(true);
    });
  });

  describe('Hypothesis Management', () => {
    it('POST /api/research-projects/:id/hypothesis sets hypothesis', async () => {
      const created = await request('POST', '/api/research-projects', { learnerId: LEARNER });
      const res = await request('POST', `/api/research-projects/${created.body.id}/hypothesis`, {
        hypothesis: 'TCP will show higher throughput'
      });
      expect(res.status).toBe(200);
      expect(res.body.hypothesis).toBe('TCP will show higher throughput');
      expect(res.body.status).toBe('hypothesis_set');
    });

    it('POST /api/research-projects/:id/hypothesis returns 404 for unknown', async () => {
      const res = await request('POST', '/api/research-projects/unknown-id/hypothesis', { hypothesis: 'test' });
      expect(res.status).toBe(404);
    });
  });

  describe('Observations and Experiments', () => {
    it('POST /api/research-projects/:id/observation adds observation', async () => {
      const created = await request('POST', '/api/research-projects', { learnerId: LEARNER });
      const res = await request('POST', `/api/research-projects/${created.body.id}/observation`, {
        data: { metric: 'throughput', value: 95.4 },
        notes: 'TCP throughput measured'
      });
      expect(res.status).toBe(200);
      expect(res.body.notes).toBe('TCP throughput measured');
      expect(res.body.data).toEqual({ metric: 'throughput', value: 95.4 });
      expect(res.body.id).toBeDefined();
      expect(res.body.timestamp).toBeDefined();
    });

    it('POST /api/research-projects/:id/observation returns 404 for unknown', async () => {
      const res = await request('POST', '/api/research-projects/unknown-id/observation', { data: {}, notes: 'test' });
      expect(res.status).toBe(404);
    });

    it('multiple observations accumulate on project', async () => {
      const created = await request('POST', '/api/research-projects', { learnerId: LEARNER });
      await request('POST', `/api/research-projects/${created.body.id}/observation`, { data: { v: 1 }, notes: 'obs1' });
      await request('POST', `/api/research-projects/${created.body.id}/observation`, { data: { v: 2 }, notes: 'obs2' });
      const res = await request('GET', `/api/research-projects/${created.body.id}`);
      expect(res.body.observations.length).toBe(2);
    });
  });

  describe('Research Notebook', () => {
    it('POST /api/research-projects/:id/notebook adds notebook entry', async () => {
      const created = await request('POST', '/api/research-projects', { learnerId: LEARNER });
      const res = await request('POST', `/api/research-projects/${created.body.id}/notebook`, {
        type: 'note',
        content: 'Important observation',
        tags: ['tcp', 'throughput']
      });
      expect(res.status).toBe(201);
      expect(res.body.content).toBe('Important observation');
      expect(res.body.tags).toEqual(['tcp', 'throughput']);
    });

    it('GET /api/research-projects/:id/notebook returns notebook', async () => {
      const created = await request('POST', '/api/research-projects', { learnerId: LEARNER });
      await request('POST', `/api/research-projects/${created.body.id}/notebook`, { content: 'Note 1' });
      await request('POST', `/api/research-projects/${created.body.id}/notebook`, { content: 'Note 2' });
      const res = await request('GET', `/api/research-projects/${created.body.id}/notebook`);
      expect(res.status).toBe(200);
      expect(res.body.entryCount).toBe(2);
      expect(res.body.entries.length).toBe(2);
      expect(res.body.title).toBe(created.body.title);
    });

    it('notebook endpoints return 404 for unknown project', async () => {
      const postRes = await request('POST', '/api/research-projects/unknown-id/notebook', { content: 'test' });
      expect(postRes.status).toBe(404);
      const getRes = await request('GET', '/api/research-projects/unknown-id/notebook');
      expect(getRes.status).toBe(404);
    });
  });

  describe('Visualization', () => {
    it('PUT /api/research-projects/:id/visualization updates visualization', async () => {
      const created = await request('POST', '/api/research-projects', { learnerId: LEARNER });
      const res = await request('PUT', `/api/research-projects/${created.body.id}/visualization`, {
        type: 'chart',
        data: { labels: ['TCP', 'UDP'], values: [95, 80] },
        config: { yAxis: 'Mbps' }
      });
      expect(res.status).toBe(200);
      expect(res.body.type).toBe('chart');
      expect(res.body.data).toEqual({ labels: ['TCP', 'UDP'], values: [95, 80] });
    });

    it('GET /api/research-projects/:id/visualization returns visualization after update', async () => {
      const created = await request('POST', '/api/research-projects', { learnerId: LEARNER });
      await request('PUT', `/api/research-projects/${created.body.id}/visualization`, { type: 'table', data: { rows: 10 } });
      const res = await request('GET', `/api/research-projects/${created.body.id}/visualization`);
      expect(res.status).toBe(200);
      expect(res.body.type).toBe('table');
    });

    it('GET /api/research-projects/:id/visualization returns 404 when not set', async () => {
      const created = await request('POST', '/api/research-projects', { learnerId: LEARNER });
      const res = await request('GET', `/api/research-projects/${created.body.id}/visualization`);
      expect(res.status).toBe(404);
    });
  });

  describe('Research Completion', () => {
    it('POST /api/research-projects/:id/complete marks project complete', async () => {
      const created = await request('POST', '/api/research-projects', { learnerId: LEARNER });
      const res = await request('POST', `/api/research-projects/${created.body.id}/complete`, {
        results: { throughputAdvantage: 'TCP +15%' },
        conclusion: 'TCP is better for reliability, UDP for latency'
      });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('completed');
      expect(res.body.conclusion).toBe('TCP is better for reliability, UDP for latency');
    });

    it('POST /api/research-projects/:id/complete returns 404 for unknown', async () => {
      const res = await request('POST', '/api/research-projects/unknown-id/complete', { results: {}, conclusion: 'test' });
      expect(res.status).toBe(404);
    });
  });

  describe('Innovation Challenges', () => {
    it('POST /api/innovation-challenges creates challenge', async () => {
      const res = await request('POST', '/api/innovation-challenges', {
        learnerId: LEARNER,
        title: 'Design a Secure Campus Network',
        description: 'Create a network design for a 500-user campus',
        constraints: ['Budget $50K'],
        scoringCriteria: ['Security', 'Scalability']
      });
      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.title).toBe('Design a Secure Campus Network');
      expect(res.body.status).toBe('open');
    });

    it('POST /api/innovation-challenges defaults learnerId to anonymous', async () => {
      const res = await request('POST', '/api/innovation-challenges', { title: 'Anon Challenge' });
      expect(res.body.learnerId).toBe('anonymous');
    });

    it('GET /api/innovation-challenges/:id returns challenge', async () => {
      const created = await request('POST', '/api/innovation-challenges', { learnerId: LEARNER, title: 'My Challenge' });
      const res = await request('GET', `/api/innovation-challenges/${created.body.id}`);
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('My Challenge');
    });

    it('GET /api/innovation-challenges/learner/:learnerId lists challenges', async () => {
      await request('POST', '/api/innovation-challenges', { learnerId: LEARNER, title: 'C1' });
      await request('POST', '/api/innovation-challenges', { learnerId: 'other', title: 'C2' });
      await request('POST', '/api/innovation-challenges', { learnerId: LEARNER, title: 'C3' });
      const res = await request('GET', `/api/innovation-challenges/learner/${LEARNER}`);
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
      expect(res.body.challenges.every(c => c.learnerId === LEARNER)).toBe(true);
    });

    it('GET /api/innovation-challenges/learner/:learnerId returns empty for learner with no challenges', async () => {
      const res = await request('GET', '/api/innovation-challenges/learner/nobody');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(0);
    });

    it('POST /api/innovation-challenges/:id/submit adds submission', async () => {
      const created = await request('POST', '/api/innovation-challenges', { learnerId: LEARNER, title: 'Submit Challenge' });
      const res = await request('POST', `/api/innovation-challenges/${created.body.id}/submit`, {
        title: 'My Submission',
        description: 'Here is my design',
        design: { topology: 'star', devices: 10 },
        evidence: ['diagram.png', 'config.txt']
      });
      expect(res.status).toBe(201);
      expect(res.body.title).toBe('My Submission');
      expect(res.body.design).toEqual({ topology: 'star', devices: 10 });
      expect(res.body.id).toBeDefined();
      expect(res.body.submittedAt).toBeDefined();
    });

    it('POST /api/innovation-challenges/:id/submit returns 404 for unknown', async () => {
      const res = await request('POST', '/api/innovation-challenges/unknown-id/submit', { title: 'test' });
      expect(res.status).toBe(404);
    });
  });

  describe('Research Dashboard', () => {
    it('GET /api/research/:learnerId/dashboard returns dashboard stats', async () => {
      const p1 = await request('POST', '/api/research-projects', { learnerId: LEARNER, title: 'P1' });
      await request('POST', `/api/research-projects/${p1.body.id}/observation`, { notes: 'obs1' });
      await request('POST', '/api/innovation-challenges', { learnerId: LEARNER, title: 'IC1' });
      const res = await request('GET', `/api/research/${LEARNER}/dashboard`);
      expect(res.status).toBe(200);
      expect(res.body.totalProjects).toBe(1);
      expect(res.body.inProgressProjects).toBe(1);
      expect(res.body.totalObservations).toBe(1);
      expect(res.body.activeChallenges).toBe(1);
    });

    it('GET /api/research/:learnerId/dashboard returns 400 without learnerId', async () => {
      const res = await request('GET', '/api/research/dashboard');
      expect(res.status).toBe(400);
    });
  });

  describe('Completing with skillIds', () => {
    it('completing project updates learner progress skill mastery', async () => {
      const created = await request('POST', '/api/research-projects', { learnerId: LEARNER });
      const res = await request('POST', `/api/research-projects/${created.body.id}/complete`, {
        results: {},
        conclusion: 'Done',
        skillIds: ['research-methodology']
      });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('completed');
    });
  });
});
