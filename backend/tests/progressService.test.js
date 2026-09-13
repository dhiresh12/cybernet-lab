const http = require('http');

process.env.PORT = '0';
const { app, server } = require('../server');
const { learnerProgress, labs } = require('../state/state');
const { getLabStatus, canAccessLab, getLockReason, validateCompletionContract, completeLab, startLab, getAvailableLabs, getLockedLabs, getProgress } = require('../services/progressService');

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

const MOCK_LAB_A = 'MOCK-A';
const MOCK_LAB_B = 'MOCK-B';

beforeAll(() => {
  labs.set(MOCK_LAB_A, {
    id: MOCK_LAB_A,
    title: 'Mock Lab A',
    prerequisites: []
  });
  labs.set(MOCK_LAB_B, {
    id: MOCK_LAB_B,
    title: 'Mock Lab B',
    prerequisites: [MOCK_LAB_A]
  });
});

afterAll(() => {
  labs.delete(MOCK_LAB_A);
  labs.delete(MOCK_LAB_B);
});

describe('Progress Service', () => {
  beforeEach(() => {
    learnerProgress.clear();
  });

  afterAll(done => {
    server.close(done);
  });

  it('returns available for lab with no prerequisites', () => {
    const status = getLabStatus('user-1', MOCK_LAB_A);
    expect(status).toBe('available');
  });

  it('returns locked when prerequisite is not completed', () => {
    const status = getLabStatus('user-1', MOCK_LAB_B);
    expect(status).toBe('locked');
  });

  it('returns available when prerequisite is completed', () => {
    completeLab('user-1', MOCK_LAB_A, {
      theoryComplete: true,
      predictionComplete: true,
      actionsComplete: true,
      verificationPassed: true,
      troubleshootingComplete: true,
      debriefComplete: true
    });
    const status = getLabStatus('user-1', MOCK_LAB_B);
    expect(status).toBe('available');
  });

  it('returns complete after successful completion', () => {
    completeLab('user-1', MOCK_LAB_A, {
      theoryComplete: true,
      predictionComplete: true,
      actionsComplete: true,
      verificationPassed: true,
      troubleshootingComplete: true,
      debriefComplete: true
    });
    const status = getLabStatus('user-1', MOCK_LAB_A);
    expect(status).toBe('complete');
  });

  it('validates completion contract rejects incomplete contract', () => {
    const errors = validateCompletionContract({
      theoryComplete: true,
      predictionComplete: true,
      actionsComplete: true,
      verificationPassed: false,
      troubleshootingComplete: true,
      debriefComplete: true
    });
    expect(errors).toContain('Verification not passed');
  });

  it('validates completion contract accepts complete contract', () => {
    const errors = validateCompletionContract({
      theoryComplete: true,
      predictionComplete: true,
      actionsComplete: true,
      verificationPassed: true,
      troubleshootingComplete: true,
      debriefComplete: true
    });
    expect(errors).toHaveLength(0);
  });

  it('returns lock reason for locked lab', () => {
    const reason = getLockReason('user-1', MOCK_LAB_B);
    expect(reason).toContain('Complete');
  });

  it('canAccessLab returns false for locked lab', () => {
    expect(canAccessLab('user-1', MOCK_LAB_B)).toBe(false);
  });

  it('canAccessLab returns true for available lab', () => {
    expect(canAccessLab('user-1', MOCK_LAB_A)).toBe(true);
  });

  it('startLab records currentLab in progress', () => {
    const result = startLab('user-1', MOCK_LAB_A);
    expect(result.success).toBe(true);
    const progress = getProgress('user-1');
    expect(progress.currentLab).toBe(MOCK_LAB_A);
  });

  it('startLab rejects locked lab', () => {
    const result = startLab('user-1', MOCK_LAB_B);
    expect(result.success).toBe(false);
    expect(result.reason).toBeDefined();
  });

  it('GET /api/progress/:learnerId returns progress', async () => {
    completeLab('user-1', MOCK_LAB_A, {
      theoryComplete: true,
      predictionComplete: true,
      actionsComplete: true,
      verificationPassed: true,
      troubleshootingComplete: true,
      debriefComplete: true
    });
    const res = await request('GET', '/api/progress/user-1');
    expect(res.status).toBe(200);
    expect(res.body.completedLabs).toContain(MOCK_LAB_A);
  });

  it('GET /api/progress/:learnerId/lab/:labId returns lab status', async () => {
    completeLab('user-1', MOCK_LAB_A, {
      theoryComplete: true,
      predictionComplete: true,
      actionsComplete: true,
      verificationPassed: true,
      troubleshootingComplete: true,
      debriefComplete: true
    });
    const res = await request('GET', `/api/progress/user-1/lab/${encodeURIComponent(MOCK_LAB_A)}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('complete');
  });

  it('POST /api/progress/:learnerId/start/:labId starts lab', async () => {
    const res = await request('POST', `/api/progress/user-1/start/${encodeURIComponent(MOCK_LAB_A)}`);
    expect(res.status).toBe(200);
    expect(res.body.currentLab).toBe(MOCK_LAB_A);
  });

  it('POST /api/progress/:learnerId/complete/:labId completes lab', async () => {
    const res = await request('POST', `/api/progress/user-1/complete/${encodeURIComponent(MOCK_LAB_A)}`, {
      theoryComplete: true,
      predictionComplete: true,
      actionsComplete: true,
      verificationPassed: true,
      troubleshootingComplete: true,
      debriefComplete: true
    });
    expect(res.status).toBe(200);
    expect(res.body.completedLabs).toContain(MOCK_LAB_A);
  });

  it('GET /api/progress/:learnerId/available returns available labs', async () => {
    const res = await request('GET', '/api/progress/user-1/available');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/progress/:learnerId/locked returns locked labs', async () => {
    const res = await request('GET', '/api/progress/user-1/locked');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
