const http = require('http');

process.env.PORT = '0';
const { app, server } = require('../server');
const { learnerProgress, courses, courseEnrollments } = require('../state/state');
const { seedStaticData } = require('../services/learningService');

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

const LEARNER = 'learner-courses';

describe('Courses Advanced API', () => {
  afterAll(done => {
    server.close(done);
  });

  beforeEach(() => {
    courses.clear();
    courseEnrollments.clear();
    learnerProgress.delete(LEARNER);
    seedStaticData();
  });

  it('GET /api/courses returns seeded courses', async () => {
    const res = await request('GET', '/api/courses');
    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThanOrEqual(3);
    expect(res.body.courses[0]).toHaveProperty('id');
    expect(res.body.courses[0]).toHaveProperty('title');
    expect(res.body.courses[0]).toHaveProperty('stages');
  });

  it('GET /api/courses/:courseId returns course with stages', async () => {
    const listRes = await request('GET', '/api/courses');
    const courseId = listRes.body.courses[0].id;
    const res = await request('GET', `/api/courses/${courseId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(courseId);
    expect(res.body.description).toBeDefined();
    expect(Array.isArray(res.body.stages)).toBe(true);
  });

  it('GET /api/courses/:courseId returns 404 for unknown course', async () => {
    const res = await request('GET', '/api/courses/unknown-course');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Course not found');
  });

  it('POST /api/courses/:courseId/enroll/:learnerId creates enrollment', async () => {
    const listRes = await request('GET', '/api/courses');
    const courseId = listRes.body.courses[0].id;
    const res = await request('POST', `/api/courses/${courseId}/enroll/${LEARNER}`);
    expect(res.status).toBe(201);
    expect(res.body.learnerId).toBe(LEARNER);
    expect(res.body.courseId).toBe(courseId);
    expect(res.body.progress).toBe(0);
  });

  it('POST /api/courses/:courseId/enroll/:learnerId returns existing enrollment on duplicate', async () => {
    const listRes = await request('GET', '/api/courses');
    const courseId = listRes.body.courses[0].id;
    await request('POST', `/api/courses/${courseId}/enroll/${LEARNER}`);
    const res = await request('POST', `/api/courses/${courseId}/enroll/${LEARNER}`);
    expect(res.status).toBe(201);
    expect(res.body.learnerId).toBe(LEARNER);
  });

  it('POST /api/courses/:courseId/enroll/:learnerId returns 404 for unknown course', async () => {
    const res = await request('POST', '/api/courses/unknown-course/enroll/learner-1');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Course not found');
  });

  it('PUT /api/courses/:courseId/progress/:learnerId updates stage progress', async () => {
    const listRes = await request('GET', '/api/courses');
    const courseId = listRes.body.courses[0].id;
    await request('POST', `/api/courses/${courseId}/enroll/${LEARNER}`);
    const res = await request('PUT', `/api/courses/${courseId}/progress/${LEARNER}`, {
      stageIndex: 1,
      completed: true
    });
    expect(res.status).toBe(200);
    expect(res.body.completedStages).toContain('1');
    expect(res.body.currentStage).toBe(1);
  });

  it('PUT /api/courses/:courseId/progress/:learnerId marks course complete at 100%', async () => {
    const listRes = await request('GET', '/api/courses');
    const course = listRes.body.courses.find(c => c.stages.length > 0);
    const courseId = course.id;
    await request('POST', `/api/courses/${courseId}/enroll/${LEARNER}`);
    const stageCount = course.stages.length;
    for (let i = 0; i < stageCount; i++) {
      await request('PUT', `/api/courses/${courseId}/progress/${LEARNER}`, {
        stageIndex: i,
        completed: true
      });
    }
    const res = await request('GET', `/api/courses/${courseId}/enrollment/${LEARNER}`);
    expect(res.body.progress).toBe(100);
    expect(res.body.completedAt).toBeDefined();
  });

  it('PUT /api/courses/:courseId/progress/:learnerId returns 404 for unknown course', async () => {
    const res = await request('PUT', '/api/courses/unknown-course/progress/learner-1', {
      stageIndex: 0,
      completed: true
    });
    expect(res.status).toBe(404);
  });

  it('PUT /api/courses/:courseId/progress/:learnerId returns 404 for non-enrolled learner', async () => {
    const listRes = await request('GET', '/api/courses');
    const courseId = listRes.body.courses[0].id;
    const res = await request('PUT', `/api/courses/${courseId}/progress/not-enrolled`, {
      stageIndex: 0,
      completed: true
    });
    expect(res.status).toBe(404);
  });

  it('GET /api/courses/:courseId/enrollment/:learnerId returns enrollment', async () => {
    const listRes = await request('GET', '/api/courses');
    const courseId = listRes.body.courses[0].id;
    await request('POST', `/api/courses/${courseId}/enroll/${LEARNER}`);
    const res = await request('GET', `/api/courses/${courseId}/enrollment/${LEARNER}`);
    expect(res.status).toBe(200);
    expect(res.body.learnerId).toBe(LEARNER);
    expect(res.body.courseId).toBe(courseId);
  });

  it('GET /api/courses/:courseId/enrollment/:learnerId returns 404 for unknown enrollment', async () => {
    const listRes = await request('GET', '/api/courses');
    const courseId = listRes.body.courses[0].id;
    const res = await request('GET', `/api/courses/${courseId}/enrollment/not-enrolled`);
    expect(res.status).toBe(404);
  });

  it('GET /api/courses/:courseId/enrollment/:learnerId returns 404 for unknown course', async () => {
    const res = await request('GET', '/api/courses/unknown-course/enrollment/learner-1');
    expect(res.status).toBe(404);
  });

  it('enrollment has required fields', async () => {
    const listRes = await request('GET', '/api/courses');
    const courseId = listRes.body.courses[0].id;
    const res = await request('POST', `/api/courses/${courseId}/enroll/${LEARNER}`);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('learnerId');
    expect(res.body).toHaveProperty('courseId');
    expect(res.body).toHaveProperty('startedAt');
    expect(res.body).toHaveProperty('progress');
    expect(res.body).toHaveProperty('currentStage');
    expect(res.body).toHaveProperty('completedStages');
  });

  it('multiple courses can be enrolled independently', async () => {
    const listRes = await request('GET', '/api/courses');
    const course1 = listRes.body.courses[0].id;
    const course2 = listRes.body.courses[1].id;
    const res1 = await request('POST', `/api/courses/${course1}/enroll/${LEARNER}`);
    const res2 = await request('POST', `/api/courses/${course2}/enroll/${LEARNER}`);
    expect(res1.body.courseId).toBe(course1);
    expect(res2.body.courseId).toBe(course2);
    expect(res1.body.id).not.toBe(res2.body.id);
  });

  it('progress update does not exceed stage count', async () => {
    const listRes = await request('GET', '/api/courses');
    const course = listRes.body.courses.find(c => c.stages.length > 0);
    const courseId = course.id;
    await request('POST', `/api/courses/${courseId}/enroll/${LEARNER}`);
    const res = await request('PUT', `/api/courses/${courseId}/progress/${LEARNER}`, {
      stageIndex: 999,
      completed: true
    });
    expect(res.status).toBe(200);
    expect(res.body.currentStage).toBeLessThan(course.stages.length);
  });
});
