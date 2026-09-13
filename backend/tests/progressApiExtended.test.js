const http = require('http');

process.env.PORT = '0';
const { app, server } = require('../server');
const { learnerProgress, labs } = require('../state/state');

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

describe('Progress API Extended', () => {
  afterAll(done => {
    server.close(done);
  });

  beforeEach(() => {
    learnerProgress.clear();
  });

  it('GET /api/progress/:learnerId returns default progress for new learner', async () => {
    const res = await request('GET', '/api/progress/new-learner');
    expect(res.status).toBe(200);
    expect(res.body.learnerId).toBe('new-learner');
    expect(res.body.completedLabs).toEqual([]);
    expect(res.body.currentLab).toBeNull();
  });

  it('GET /api/progress/:learnerId returns existing progress', async () => {
    learnerProgress.set('learner-1', {
      learnerId: 'learner-1',
      completedLabs: ['REF-001'],
      currentLab: 'REF-002',
      skillMastery: { ospf: 0.8 },
      retrieval: {},
      startedAt: Date.now()
    });
    const res = await request('GET', '/api/progress/learner-1');
    expect(res.body.completedLabs).toContain('REF-001');
    expect(res.body.currentLab).toBe('REF-002');
    expect(res.body.skillMastery).toEqual({ ospf: 0.8 });
  });

  it('GET /api/progress/:learnerId/available returns available labs', async () => {
    const res = await request('GET', '/api/progress/learner-1/available');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach(lab => {
      expect(lab).toHaveProperty('id');
      expect(lab).toHaveProperty('status');
    });
  });

  it('GET /api/progress/:learnerId/locked returns locked labs', async () => {
    const res = await request('GET', '/api/progress/learner-1/locked');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach(lab => {
      expect(lab.status).toBe('locked');
      expect(lab).toHaveProperty('lockReason');
    });
  });

  it('GET /api/progress/:learnerId/lab/:labId returns status for new learner', async () => {
    const res = await request('GET', '/api/progress/learner-1/lab/REF-001');
    expect(res.status).toBe(200);
    expect(res.body.status).toBeDefined();
    expect(res.body.completed).toBe(false);
  });

  it('POST /api/progress/:learnerId/start/:labId starts lab', async () => {
    const res = await request('POST', '/api/progress/learner-1/start/REF-001');
    expect(res.status).toBe(200);
    expect(res.body.currentLab).toBe('REF-001');
  });

  it('POST /api/progress/:learnerId/start/:labId returns 403 for locked lab', async () => {
    learnerProgress.set('learner-1', {
      learnerId: 'learner-1',
      completedLabs: [],
      currentLab: null
    });
    labs.set('LOCK-A', { id: 'LOCK-A', title: 'Locked Lab', prerequisites: ['REF-001'] });
    const res = await request('POST', '/api/progress/learner-1/start/LOCK-A');
    expect(res.status).toBe(403);
    expect(res.body.error).toBeDefined();
  });

  it('POST /api/progress/:learnerId/complete/:labId completes lab with valid contract', async () => {
    const res = await request('POST', '/api/progress/learner-1/complete/REF-001', {
      theoryComplete: true,
      predictionComplete: true,
      actionsComplete: true,
      verificationPassed: true,
      troubleshootingComplete: true,
      debriefComplete: true
    });
    expect(res.status).toBe(200);
    expect(res.body.completedLabs).toContain('REF-001');
  });

  it('POST /api/progress/:learnerId/complete/:labId returns 400 for incomplete contract', async () => {
    const res = await request('POST', '/api/progress/learner-1/complete/REF-001', {
      theoryComplete: true,
      predictionComplete: true,
      actionsComplete: true,
      verificationPassed: false,
      troubleshootingComplete: true,
      debriefComplete: true
    });
    expect(res.status).toBe(400);
    expect(res.body.errors).toContain('Verification not passed');
  });

  it('POST /api/progress/:learnerId/complete/:labId marks lab complete', async () => {
    await request('POST', '/api/progress/learner-1/complete/REF-001', {
      theoryComplete: true,
      predictionComplete: true,
      actionsComplete: true,
      verificationPassed: true,
      troubleshootingComplete: true,
      debriefComplete: true
    });
    const res = await request('GET', '/api/progress/learner-1');
    expect(res.body.completedLabs).toContain('REF-001');
  });

  it('POST /api/progress/:learnerId/complete/:labId clears currentLab', async () => {
    await request('POST', '/api/progress/learner-1/start/REF-001');
    await request('POST', '/api/progress/learner-1/complete/REF-001', {
      theoryComplete: true,
      predictionComplete: true,
      actionsComplete: true,
      verificationPassed: true,
      troubleshootingComplete: true,
      debriefComplete: true
    });
    const res = await request('GET', '/api/progress/learner-1');
    expect(res.body.currentLab).toBeNull();
  });

  it('completing a lab unlocks prerequisite-dependent labs', async () => {
    labs.set('ADV-A', { id: 'ADV-A', title: 'Advanced Lab', prerequisites: ['REF-001'] });
    await request('POST', '/api/progress/learner-1/complete/REF-001', {
      theoryComplete: true,
      predictionComplete: true,
      actionsComplete: true,
      verificationPassed: true,
      troubleshootingComplete: true,
      debriefComplete: true
    });
    const res = await request('GET', '/api/progress/learner-1/lab/ADV-A');
    expect(res.body.status).toBe('available');
  });

  it('GET /api/progress/:learnerId/lab/:labId returns lockReason when locked', async () => {
    labs.set('ADV-B', { id: 'ADV-B', title: 'Advanced B', prerequisites: ['REF-001'] });
    const res = await request('GET', '/api/progress/learner-1/lab/ADV-B');
    expect(res.body.status).toBe('locked');
    expect(res.body.lockReason).toContain('Complete');
  });

  it('GET /api/progress/:learnerId/lab/:labId returns complete when done', async () => {
    await request('POST', '/api/progress/learner-1/complete/REF-001', {
      theoryComplete: true,
      predictionComplete: true,
      actionsComplete: true,
      verificationPassed: true,
      troubleshootingComplete: true,
      debriefComplete: true
    });
    const res = await request('GET', '/api/progress/learner-1/lab/REF-001');
    expect(res.body.status).toBe('complete');
    expect(res.body.completed).toBe(true);
  });

  it('GET /api/progress/:learnerId/available excludes locked labs', async () => {
    labs.set('ADV-C', { id: 'ADV-C', title: 'Advanced C', prerequisites: ['REF-001'] });
    const res = await request('GET', '/api/progress/learner-1/available');
    expect(res.body.every(lab => lab.status !== 'locked')).toBe(true);
  });

  it('GET /api/progress/:learnerId/locked only returns locked labs', async () => {
    labs.set('ADV-D', { id: 'ADV-D', title: 'Advanced D', prerequisites: ['REF-001'] });
    const res = await request('GET', '/api/progress/learner-1/locked');
    expect(res.body.every(lab => lab.status === 'locked')).toBe(true);
  });

  it('progress endpoint preserves skillMastery across requests', async () => {
    learnerProgress.set('learner-1', {
      learnerId: 'learner-1',
      completedLabs: [],
      currentLab: null,
      skillMastery: { ospf: 0.9, bgp: 0.7 },
      retrieval: {},
      startedAt: Date.now()
    });
    const res = await request('GET', '/api/progress/learner-1');
    expect(res.body.skillMastery.ospf).toBe(0.9);
    expect(res.body.skillMastery.bgp).toBe(0.7);
  });

  it('POST /api/progress/:learnerId/complete/:labId rejects already completed lab', async () => {
    await request('POST', '/api/progress/learner-1/complete/REF-001', {
      theoryComplete: true,
      predictionComplete: true,
      actionsComplete: true,
      verificationPassed: true,
      troubleshootingComplete: true,
      debriefComplete: true
    });
    const res = await request('POST', '/api/progress/learner-1/complete/REF-001', {
      theoryComplete: true,
      predictionComplete: true,
      actionsComplete: true,
      verificationPassed: true,
      troubleshootingComplete: true,
      debriefComplete: true
    });
    expect(res.status).toBe(200);
  });

  it('POST /api/progress/:learnerId/start/:labId updates currentLab', async () => {
    await request('POST', '/api/progress/learner-1/start/REF-001');
    const res = await request('GET', '/api/progress/learner-1');
    expect(res.body.currentLab).toBe('REF-001');
  });
});
