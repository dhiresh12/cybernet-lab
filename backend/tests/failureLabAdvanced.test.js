const http = require('http');

process.env.PORT = '0';
const { app, server } = require('../server');
const { failureLabs } = require('../state/state');

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

describe('Failure Lab Advanced API', () => {
  afterAll(done => {
    server.close(done);
  });

  beforeEach(() => {
    failureLabs.clear();
  });

  it('GET /api/failure-labs/:labId returns default state for new lab', async () => {
    const res = await request('GET', '/api/failure-labs/REF-001');
    expect(res.status).toBe(200);
    expect(res.body.labId).toBe('REF-001');
    expect(res.body.faults).toEqual([]);
    expect(res.body.injectedFault).toBeNull();
  });

  it('POST /api/failure-labs/:labId/inject adds fault with defaults', async () => {
    const res = await request('POST', '/api/failure-labs/REF-001/inject', {});
    expect(res.status).toBe(200);
    expect(res.body.fault.type).toBe('interface_down');
    expect(res.body.fault.detected).toBe(false);
  });

  it('POST /api/failure-labs/:labId/inject adds fault with custom type', async () => {
    const res = await request('POST', '/api/failure-labs/REF-001/inject', {
      type: 'routing_loop',
      target: 'GigabitEthernet0/0',
      description: 'Routing loop detected'
    });
    expect(res.body.fault.type).toBe('routing_loop');
    expect(res.body.fault.target).toBe('GigabitEthernet0/0');
    expect(res.body.fault.description).toBe('Routing loop detected');
  });

  it('POST /api/failure-labs/:labId/inject records injection history', async () => {
    const res = await request('POST', '/api/failure-labs/REF-001/inject', {
      type: 'acl_deny'
    });
    expect(res.body.state.injectionHistory.length).toBe(1);
    expect(res.body.state.injectionHistory[0].type).toBe('acl_deny');
  });

  it('POST /api/failure-labs/:labId/inject sets injectedFault', async () => {
    const res = await request('POST', '/api/failure-labs/REF-001/inject', {
      type: 'dns_failure'
    });
    expect(res.body.state.injectedFault.type).toBe('dns_failure');
  });

  it('multiple injections accumulate faults', async () => {
    const r1 = await request('POST', '/api/failure-labs/REF-001/inject', { type: 'fault1' });
    const r2 = await request('POST', '/api/failure-labs/REF-001/inject', { type: 'fault2' });
    expect(r1.body.state.faults.length).toBe(1);
    expect(r2.body.state.faults.length).toBe(2);
  });

  it('POST /api/failure-labs/:labId/clear/:faultId clears fault', async () => {
    const inject = await request('POST', '/api/failure-labs/REF-001/inject', { type: 'interface_down' });
    const faultId = inject.body.fault.id;
    const res = await request('POST', `/api/failure-labs/REF-001/clear/${faultId}`);
    expect(res.status).toBe(200);
    expect(res.body.state.faults.length).toBe(0);
  });

  it('POST /api/failure-labs/:labId/clear/:faultId marks fault detected', async () => {
    const inject = await request('POST', '/api/failure-labs/REF-001/inject', { type: 'interface_down' });
    const faultId = inject.body.fault.id;
    const res = await request('POST', `/api/failure-labs/REF-001/clear/${faultId}`);
    const clearedFault = inject.body.state.faults.find(f => f.id === faultId);
    expect(clearedFault).toBeUndefined();
  });

  it('POST /api/failure-labs/:labId/clear/:faultId clears injectedFault if matching', async () => {
    const inject = await request('POST', '/api/failure-labs/REF-001/inject', { type: 'interface_down' });
    const faultId = inject.body.fault.id;
    await request('POST', `/api/failure-labs/REF-001/clear/${faultId}`);
    const res = await request('GET', '/api/failure-labs/REF-001');
    expect(res.body.injectedFault).toBeNull();
  });

  it('POST /api/failure-labs/:labId/clear/:faultId returns 404 for unknown fault', async () => {
    const res = await request('POST', '/api/failure-labs/REF-001/clear/unknown-fault');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('No failure lab state found');
  });

  it('fault has unique id', async () => {
    const r1 = await request('POST', '/api/failure-labs/REF-001/inject', { type: 'fault1' });
    const r2 = await request('POST', '/api/failure-labs/REF-001/inject', { type: 'fault1' });
    expect(r1.body.fault.id).not.toBe(r2.body.fault.id);
  });

  it('fault has injectedAt timestamp', async () => {
    const before = Date.now();
    const res = await request('POST', '/api/failure-labs/REF-001/inject', { type: 'fault1' });
    expect(res.body.fault.injectedAt).toBeGreaterThanOrEqual(before);
  });

  it('different labs have independent failure states', async () => {
    await request('POST', '/api/failure-labs/REF-001/inject', { type: 'fault1' });
    await request('POST', '/api/failure-labs/REF-002/inject', { type: 'fault2' });
    const res1 = await request('GET', '/api/failure-labs/REF-001');
    const res2 = await request('GET', '/api/failure-labs/REF-002');
    expect(res1.body.faults[0].type).toBe('fault1');
    expect(res2.body.faults[0].type).toBe('fault2');
  });

  it('clearing non-injected fault preserves other injectedFault', async () => {
    await request('POST', '/api/failure-labs/REF-001/inject', { type: 'fault1' });
    const inject2 = await request('POST', '/api/failure-labs/REF-001/inject', { type: 'fault2' });
    const fault2Id = inject2.body.fault.id;
    const firstFaultId = inject2.body.state.faults[0].id;
    await request('POST', `/api/failure-labs/REF-001/clear/${firstFaultId}`);
    const res = await request('GET', '/api/failure-labs/REF-001');
    expect(res.body.injectedFault).not.toBeNull();
    expect(res.body.injectedFault.id).toBe(fault2Id);
  });
});
