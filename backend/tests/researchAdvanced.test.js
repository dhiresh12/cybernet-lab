const http = require('http');

process.env.PORT = '0';
const { app, server } = require('../server');
const { researchExperiments } = require('../state/state');

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

describe('Research Experiments Advanced API', () => {
  afterAll(done => {
    server.close(done);
  });

  beforeEach(() => {
    researchExperiments.clear();
  });

  async function createExperiment(overrides = {}) {
    const defaults = {
      title: 'Test Experiment',
      problemStatement: 'Test problem',
      knownFacts: ['Fact 1'],
      unknowns: ['Unknown 1']
    };
    const res = await request('POST', '/api/research', { ...defaults, ...overrides });
    return res;
  }

  it('POST /api/research creates experiment with id', async () => {
    const res = await createExperiment();
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.title).toBe('Test Experiment');
  });

  it('POST /api/research defaults learnerId to anonymous', async () => {
    const res = await createExperiment({});
    expect(res.body.learnerId).toBe('anonymous');
  });

  it('POST /api/research sets initial status to draft', async () => {
    const res = await createExperiment({});
    expect(res.body.status).toBe('draft');
  });

  it('POST /api/research stores experiment', async () => {
    const res = await createExperiment();
    expect(researchExperiments.has(res.body.id)).toBe(true);
  });

  it('GET /api/research/:id returns experiment', async () => {
    const created = await createExperiment({ title: 'Unique Title' });
    const res = await request('GET', `/api/research/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Unique Title');
  });

  it('GET /api/research/:id returns 404 for unknown experiment', async () => {
    const res = await request('GET', '/api/research/unknown-id');
    expect(res.status).toBe(404);
  });

  it('GET /api/research/learner/:learnerId lists experiments', async () => {
    await createExperiment({ learnerId: 'learner-1' });
    await createExperiment({ learnerId: 'learner-2' });
    await createExperiment({ learnerId: 'learner-1' });
    const res = await request('GET', '/api/research/learner/learner-1');
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
    expect(res.body.experiments.every(e => e.learnerId === 'learner-1')).toBe(true);
  });

  it('GET /api/research/learner/:learnerId returns empty for learner with no experiments', async () => {
    const res = await request('GET', '/api/research/learner/nobody');
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(0);
  });

  it('POST /api/research/:id/hypothesis sets hypothesis', async () => {
    const created = await createExperiment({});
    const res = await request('POST', `/api/research/${created.body.id}/hypothesis`, {
      hypothesis: 'Hypothesis text'
    });
    expect(res.status).toBe(200);
    expect(res.body.hypothesis).toBe('Hypothesis text');
    expect(res.body.status).toBe('hypothesis_set');
  });

  it('POST /api/research/:id/hypothesis returns 404 for unknown experiment', async () => {
    const res = await request('POST', '/api/research/unknown-id/hypothesis', {
      hypothesis: 'test'
    });
    expect(res.status).toBe(404);
  });

  it('POST /api/research/:id/observation adds observation', async () => {
    const created = await createExperiment({});
    const res = await request('POST', `/api/research/${created.body.id}/observation`, {
      data: { metric: 42 },
      notes: 'Interesting finding'
    });
    expect(res.status).toBe(200);
    expect(res.body.notes).toBe('Interesting finding');
    expect(res.body.data).toEqual({ metric: 42 });
  });

  it('POST /api/research/:id/observation returns 404 for unknown experiment', async () => {
    const res = await request('POST', '/api/research/unknown-id/observation', {
      data: {},
      notes: 'test'
    });
    expect(res.status).toBe(404);
  });

  it('POST /api/research/:id/complete marks experiment complete', async () => {
    const created = await createExperiment({});
    const res = await request('POST', `/api/research/${created.body.id}/complete`, {
      results: { success: true },
      conclusion: 'Experiment confirmed hypothesis'
    });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('completed');
    expect(res.body.conclusion).toBe('Experiment confirmed hypothesis');
  });

  it('POST /api/research/:id/complete returns 404 for unknown experiment', async () => {
    const res = await request('POST', '/api/research/unknown-id/complete', {
      results: {},
      conclusion: 'test'
    });
    expect(res.status).toBe(404);
  });

  it('experiment has timestamps', async () => {
    const before = Date.now();
    const res = await createExperiment({});
    expect(res.body.createdAt).toBeGreaterThanOrEqual(before);
    expect(res.body.updatedAt).toBeGreaterThanOrEqual(before);
  });

  it('experiment stores knownFacts and unknowns', async () => {
    const res = await createExperiment({
      knownFacts: ['A', 'B'],
      unknowns: ['X', 'Y']
    });
    expect(res.body.knownFacts).toEqual(['A', 'B']);
    expect(res.body.unknowns).toEqual(['X', 'Y']);
  });

  it('observation has id and timestamp', async () => {
    const created = await createExperiment({});
    const before = Date.now();
    const res = await request('POST', `/api/research/${created.body.id}/observation`, {
      data: {},
      notes: 'obs'
    });
    expect(res.body.id).toBeDefined();
    expect(res.body.timestamp).toBeGreaterThanOrEqual(before);
  });

  it('multiple observations accumulate', async () => {
    const created = await createExperiment({});
    await request('POST', `/api/research/${created.body.id}/observation`, { data: { v: 1 }, notes: 'obs1' });
    await request('POST', `/api/research/${created.body.id}/observation`, { data: { v: 2 }, notes: 'obs2' });
    const res = await request('GET', `/api/research/${created.body.id}`);
    expect(res.body.observations.length).toBe(2);
  });

  it('GET /api/research/learner/:learnerId returns correct count', async () => {
    await createExperiment({ learnerId: 'a' });
    await createExperiment({ learnerId: 'a' });
    await createExperiment({ learnerId: 'b' });
    const resA = await request('GET', '/api/research/learner/a');
    const resB = await request('GET', '/api/research/learner/b');
    expect(resA.body.count).toBe(2);
    expect(resB.body.count).toBe(1);
  });
});
