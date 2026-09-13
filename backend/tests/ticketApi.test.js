const http = require('http');

process.env.PORT = '0';
const { app, server } = require('../server');
const { tickets } = require('../state/state');

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

describe('Ticket API', () => {
  beforeEach(() => {
    tickets.clear();
  });

  afterAll(done => {
    server.close(done);
  });

  it('POST /api/tickets creates a ticket with in-memory storage', async () => {
    const res = await request('POST', '/api/tickets', {
      labId: '23',
      issueType: 'configuration_error',
      description: 'VLAN 10 missing on trunk interface',
      reportedBy: 'engineer-1',
      severity: 'high',
      impactedDevices: ['sw-01'],
      tags: ['vlan', 'trunk']
    });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.labId).toBe('23');
    expect(res.body.status).toBe('open');
    expect(res.body.reportedBy).toBe('engineer-1');
    expect(tickets.has(res.body.id)).toBe(true);
  });

  it('POST /api/tickets validates required fields and lab references', async () => {
    const missing = await request('POST', '/api/tickets', {
      issueType: 'configuration_error',
      description: 'Missing labId',
      reportedBy: 'engineer-1'
    });
    expect(missing.status).toBe(400);
    expect(missing.body.error).toContain('labId is required');

    const invalidLab = await request('POST', '/api/tickets', {
      labId: 'does-not-exist',
      issueType: 'configuration_error',
      description: 'Invalid lab reference',
      reportedBy: 'engineer-1'
    });
    expect(invalidLab.status).toBe(400);
    expect(invalidLab.body.error).toContain('existing lab');
  });

  it('GET /api/tickets returns stored tickets with filtering and pagination', async () => {
    const created = await request('POST', '/api/tickets', {
      labId: '23',
      issueType: 'connectivity_issue',
      description: 'Inter-VLAN routing broken',
      reportedBy: 'engineer-1',
      severity: 'high'
    });

    const res = await request('GET', '/api/tickets?status=open&severity=high&labId=23');
    expect(res.status).toBe(200);
    expect(res.body.tickets).toHaveLength(1);
    expect(res.body.tickets[0].id).toBe(created.body.id);
    expect(res.body.pagination.total).toBe(1);
  });

  it('GET /api/tickets/:id returns a single ticket', async () => {
    const created = await request('POST', '/api/tickets', {
      labId: 'REF-001',
      issueType: 'verification_failure',
      description: 'Verification step failed',
      reportedBy: 'engineer-2'
    });

    const res = await request('GET', `/api/tickets/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(created.body.id);
    expect(res.body.description).toBe('Verification step failed');
  });

  it('GET /api/tickets/:id returns 404 for unknown tickets', async () => {
    const res = await request('GET', '/api/tickets/unknown-id');
    expect(res.status).toBe(404);
  });

  it('PUT /api/tickets/:id updates ticket fields and timestamp', async () => {
    const created = await request('POST', '/api/tickets', {
      labId: '23',
      issueType: 'configuration_error',
      description: 'Initial description',
      reportedBy: 'engineer-1'
    });

    const updated = await request('PUT', `/api/tickets/${created.body.id}`, {
      status: 'in_progress',
      severity: 'high',
      description: 'Updated description',
      assignedTo: 'engineer-2'
    });

    expect(updated.status).toBe(200);
    expect(updated.body.status).toBe('in_progress');
    expect(updated.body.severity).toBe('high');
    expect(updated.body.description).toBe('Updated description');
    expect(updated.body.assignedTo).toBe('engineer-2');
    expect(updated.body.updatedAt).toBeGreaterThanOrEqual(created.body.updatedAt);
  });

  it('PUT /api/tickets/:id/status updates only status', async () => {
    const created = await request('POST', '/api/tickets', {
      labId: '23',
      issueType: 'other',
      description: 'Status update test',
      reportedBy: 'engineer-1'
    });

    const res = await request('PUT', `/api/tickets/${created.body.id}/status`, {
      status: 'resolved'
    });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('resolved');
  });

  it('PUT /api/tickets/:id validates status values', async () => {
    const created = await request('POST', '/api/tickets', {
      labId: '23',
      issueType: 'other',
      description: 'Invalid status test',
      reportedBy: 'engineer-1'
    });

    const res = await request('PUT', `/api/tickets/${created.body.id}`, {
      status: 'invalid_status'
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('status must be one of');
  });

  it('PUT /api/tickets/:id returns 404 for unknown tickets', async () => {
    const res = await request('PUT', '/api/tickets/unknown-id', {
      status: 'in_progress'
    });
    expect(res.status).toBe(404);
  });

  it('GET /api/tickets/stats returns aggregate statistics', async () => {
    await request('POST', '/api/tickets', {
      labId: '23',
      issueType: 'configuration_error',
      description: 'Ticket one',
      reportedBy: 'engineer-1',
      severity: 'high'
    });
    await request('POST', '/api/tickets', {
      labId: 'REF-001',
      issueType: 'verification_failure',
      description: 'Ticket two',
      reportedBy: 'engineer-2',
      severity: 'medium'
    });

    const res = await request('GET', '/api/tickets/stats');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.open).toBe(2);
    expect(res.body.bySeverity.high).toBe(1);
    expect(res.body.byLab['23']).toBe(1);
  });
});
