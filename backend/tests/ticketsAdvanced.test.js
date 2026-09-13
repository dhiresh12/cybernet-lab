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

describe('Tickets Advanced API', () => {
  afterAll(done => {
    server.close(done);
  });

  beforeEach(() => {
    tickets.clear();
  });

  async function createTicket(overrides = {}) {
    const defaults = {
      labId: 'REF-001',
      issueType: 'configuration_error',
      description: 'Advanced test ticket',
      reportedBy: 'tester',
      severity: 'medium'
    };
    const res = await request('POST', '/api/tickets', { ...defaults, ...overrides });
    return res;
  }

  describe('Ticket Creation', () => {
    it('creates ticket with all optional fields', async () => {
      const res = await createTicket({
        assignedTo: 'engineer-1',
        severity: 'high',
        impactedDevices: ['sw-01', 'rtr-01'],
        tags: ['vlan', 'ospf'],
        remediation: 'Fix VLAN config',
        verificationSteps: ['show vlan', 'ping test']
      });
      expect(res.status).toBe(201);
      expect(res.body.assignedTo).toBe('engineer-1');
      expect(res.body.impactedDevices).toEqual(['sw-01', 'rtr-01']);
      expect(res.body.tags).toEqual(['vlan', 'ospf']);
    });

    it('rejects invalid issueType', async () => {
      const res = await createTicket({ issueType: 'invalid_type' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('issueType must be one of');
    });

    it('defaults severity to medium', async () => {
      const res = await createTicket({});
      expect(res.body.severity).toBe('medium');
    });

    it('defaults status to open', async () => {
      const res = await createTicket({});
      expect(res.body.status).toBe('open');
    });

    it('stores ticket in memory', async () => {
      const res = await createTicket({});
      expect(tickets.has(res.body.id)).toBe(true);
    });

    it('returns createdAt timestamp', async () => {
      const before = Date.now();
      const res = await createTicket({});
      expect(res.body.createdAt).toBeGreaterThanOrEqual(before);
    });

    it('returns updatedAt timestamp', async () => {
      const before = Date.now();
      const res = await createTicket({});
      expect(res.body.updatedAt).toBeGreaterThanOrEqual(before);
    });

    it('creates ticket with empty tags array', async () => {
      const res = await createTicket({ tags: [] });
      expect(res.status).toBe(201);
      expect(Array.isArray(res.body.tags)).toBe(true);
    });

    it('creates ticket with empty impactedDevices', async () => {
      const res = await createTicket({ impactedDevices: [] });
      expect(res.status).toBe(201);
      expect(Array.isArray(res.body.impactedDevices)).toBe(true);
    });
  });

  describe('Ticket Retrieval', () => {
    it('GET /api/tickets returns empty array when no tickets', async () => {
      const res = await request('GET', '/api/tickets');
      expect(res.status).toBe(200);
      expect(res.body.tickets).toEqual([]);
      expect(res.body.pagination.total).toBe(0);
    });

    it('GET /api/tickets supports pagination', async () => {
      for (let i = 0; i < 5; i++) {
        await createTicket({ description: `Ticket ${i}` });
      }
      const res = await request('GET', '/api/tickets?limit=2&page=1');
      expect(res.body.tickets.length).toBe(2);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(2);
    });

    it('GET /api/tickets caps limit at 100', async () => {
      const res = await request('GET', '/api/tickets?limit=200');
      expect(res.body.pagination.limit).toBe(100);
    });

    it('GET /api/tickets filters by status', async () => {
      const c1 = await createTicket({ severity: 'high' });
      await createTicket({ severity: 'low' });
      await request('PUT', `//api/tickets/${c1.body.id}`, { status: 'resolved' });
      const res = await request('GET', '/api/tickets?status=open');
      expect(res.body.tickets.every(t => t.status === 'open')).toBe(true);
    });

    it('GET /api/tickets filters by labId', async () => {
      await createTicket({ labId: 'REF-001' });
      await createTicket({ labId: 'REF-002' });
      const res = await request('GET', '/api/tickets?labId=REF-001');
      expect(res.body.tickets.every(t => t.labId === 'REF-001')).toBe(true);
    });

    it('GET /api/tickets sorts by createdAt desc by default', async () => {
      const t1 = await createTicket({ description: 'first' });
      const t2 = await createTicket({ description: 'second' });
      const res = await request('GET', '/api/tickets');
      expect(res.body.tickets[0].id).toBe(t2.body.id);
      expect(res.body.tickets[1].id).toBe(t1.body.id);
    });

    it('GET /api/tickets supports sortBy', async () => {
      const res = await request('GET', '/api/tickets?sortBy=severity&sortOrder=asc');
      expect(res.body).toHaveProperty('tickets');
    });

    it('GET /api/tickets/:id returns ticket with decrypted fields', async () => {
      const created = await createTicket({ description: 'Secret description' });
      const res = await request('GET', `/api/tickets/${created.body.id}`);
      expect(res.body.description).toBe('Secret description');
      expect(res.body.reportedBy).toBe('tester');
    });

    it('GET /api/tickets/stats returns all categories', async () => {
      await createTicket({ severity: 'high', issueType: 'configuration_error' });
      await createTicket({ severity: 'low', issueType: 'connectivity_issue' });
      const res = await request('GET', '/api/tickets/stats');
      expect(res.body.total).toBe(2);
      expect(res.body).toHaveProperty('open');
      expect(res.body).toHaveProperty('inProgress');
      expect(res.body).toHaveProperty('resolved');
      expect(res.body).toHaveProperty('bySeverity');
      expect(res.body).toHaveProperty('byLab');
    });
  });

  describe('Ticket Update', () => {
    it('PUT /api/tickets/:id/status changes status', async () => {
      const created = await createTicket({});
      const res = await request('PUT', `/api/tickets/${created.body.id}/status`, { status: 'in_progress' });
      expect(res.body.status).toBe('in_progress');
    });

    it('PUT /api/tickets/:id/status rejects invalid status', async () => {
      const created = await createTicket({});
      const res = await request('PUT', `/api/tickets/${created.body.id}/status`, { status: 'invalid' });
      expect(res.status).toBe(400);
    });

    it('PUT /api/tickets/:id updates multiple fields', async () => {
      const created = await createTicket({});
      const res = await request('PUT', `/api/tickets/${created.body.id}`, {
        status: 'in_progress',
        severity: 'high',
        description: 'Updated description',
        assignedTo: 'engineer-2'
      });
      expect(res.body.status).toBe('in_progress');
      expect(res.body.severity).toBe('high');
      expect(res.body.assignedTo).toBe('engineer-2');
    });

    it('PUT /api/tickets/:id preserves updatedAt order', async () => {
      const created = await createTicket({});
      const before = created.body.updatedAt;
      await new Promise(r => setTimeout(r, 10));
      const updated = await request('PUT', `//api/tickets/${created.body.id}`, { status: 'in_progress' });
      expect(updated.body.updatedAt).toBeGreaterThan(before);
    });

    it('PUT /api/tickets/:id returns 404 for unknown ticket', async () => {
      const res = await request('PUT', '/api/tickets/unknown-id', { status: 'in_progress' });
      expect(res.status).toBe(404);
    });
  });

  describe('Evidence Management', () => {
    it('POST /api/tickets/:id/evidence adds evidence', async () => {
      const created = await createTicket({});
      const res = await request('POST', `//api/tickets/${created.body.id}/evidence`, {
        type: 'screenshot',
        data: 'base64data',
        description: 'CLI output',
        addedBy: 'tester'
      });
      expect(res.status).toBe(200);
      expect(res.body.type).toBe('screenshot');
      expect(res.body.description).toBe('CLI output');
    });

    it('POST /api/tickets/:id/evidence returns 404 for unknown ticket', async () => {
      const res = await request('POST', '/api/tickets/unknown-id/evidence', {
        type: 'screenshot',
        data: 'test'
      });
      expect(res.status).toBe(404);
    });

    it('evidence added by system by default', async () => {
      const created = await createTicket({});
      const res = await request('POST', `//api/tickets/${created.body.id}/evidence`, {
        type: 'screenshot',
        data: 'test'
      });
      expect(res.body.addedBy).toBe('system');
    });
  });

  describe('Investigation Steps', () => {
    it('POST /api/tickets/:id/investigation-steps adds step', async () => {
      const created = await createTicket({});
      const res = await request('POST', `//api/tickets/${created.body.id}/investigation-steps`, {
        title: 'Check interfaces',
        description: 'Verify interface status',
        actions: ['show ip interface brief'],
        results: ['Gig0/1 is down'],
        completedBy: 'tester'
      });
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Check interfaces');
      expect(res.body.actions).toEqual(['show ip interface brief']);
    });

    it('POST /api/tickets/:id/investigation-steps returns 404 for unknown ticket', async () => {
      const res = await request('POST', '/api/tickets/unknown-id/investigation-steps', {
        title: 'Test',
        description: 'Test'
      });
      expect(res.status).toBe(404);
    });
  });

  describe('Ticket Assignment', () => {
    it('PUT /api/tickets/:id/assign assigns ticket', async () => {
      const created = await createTicket({});
      const res = await request('PUT', `//api/tickets/${created.body.id}/assign`, {
        assignedTo: 'engineer-1',
        assignedBy: 'manager'
      });
      expect(res.body.assignedTo).toBe('engineer-1');
      expect(res.body.assignedBy).toBe('manager');
    });

    it('PUT /api/tickets/:id/assign returns 404 for unknown ticket', async () => {
      const res = await request('PUT', '/api/tickets/unknown-id/assign', {
        assignedTo: 'engineer-1'
      });
      expect(res.status).toBe(404);
    });
  });

  describe('Ticket Resolution', () => {
    it('PUT /api/tickets/:id/resolve closes ticket', async () => {
      const created = await createTicket({});
      const res = await request('PUT', `//api/tickets/${created.body.id}/resolve`, {
        resolvedBy: 'manager',
        resolution: 'Fixed VLAN config',
        verificationSteps: ['show vlan', 'ping test']
      });
      expect(res.body.status).toBe('resolved');
      expect(res.body.resolvedBy).toBe('manager');
    });

    it('PUT /api/tickets/:id/resolve returns 404 for unknown ticket', async () => {
      const res = await request('PUT', '/api/tickets/unknown-id/resolve', {
        resolvedBy: 'manager'
      });
      expect(res.status).toBe(404);
    });
  });

  describe('Ticket Deletion', () => {
    it('DELETE /api/tickets/:id deletes open ticket', async () => {
      const created = await createTicket({});
      const res = await request('DELETE', `//api/tickets/${created.body.id}`, { deletedBy: 'tester' });
      expect(res.body.success).toBe(true);
      expect(tickets.has(created.body.id)).toBe(false);
    });

    it('DELETE /api/tickets/:id returns 404 for unknown ticket', async () => {
      const res = await request('DELETE', '/api/tickets/unknown-id', { deletedBy: 'tester' });
      expect(res.status).toBe(404);
    });
  });

  describe('Ticket Search', () => {
    it('GET /api/tickets/search finds tickets by description', async () => {
      await createTicket({ description: 'OSPF adjacency issue' });
      await createTicket({ description: 'BGP route problem' });
      const res = await request('GET', '/api/tickets/search?q=OSPF');
      expect(res.body.tickets.length).toBeGreaterThanOrEqual(1);
      expect(res.body.tickets.some(t => t.description.includes('OSPF'))).toBe(true);
    });

    it('GET /api/tickets/search is case-insensitive', async () => {
      await createTicket({ description: 'OSPF issue' });
      const res = await request('GET', '/api/tickets/search?q=ospf');
      expect(res.body.count).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/tickets/search returns empty for no matches', async () => {
      const res = await request('GET', '/api/tickets/search?q=nonexistent');
      expect(res.body.tickets).toEqual([]);
      expect(res.body.count).toBe(0);
    });

    it('GET /api/tickets/search truncates long queries', async () => {
      const res = await request('GET', '/api/tickets/search?q=' + 'a'.repeat(300));
      expect(res.status).toBe(200);
    });
  });
});
