const http = require('http');
const WebSocket = require('ws');

const BASE_URL = 'http://localhost:3000';
const WS_URL = 'ws://localhost:3000';

function httpRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {}
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runRegressionQA() {
  console.log('========================================');
  console.log('PHASE 2.9 BACKEND REGRESSION QA');
  console.log('========================================\n');

  let passed = 0;
  let failed = 0;

  // LAB API CONTRACT TESTS
  console.log('=== LAB API CONTRACT ===');

  // Test: GET /api/labs returns valid lab list
  try {
    const r = await httpRequest('GET', '/api/labs');
    if (r.status === 200 && Array.isArray(r.data) && r.data.length > 200) {
      console.log('PASS: GET /api/labs returns lab list (' + r.data.length + ' labs)');
      passed++;
    } else {
      console.log('FAIL: GET /api/labs unexpected result', r.status, Array.isArray(r.data), r.data.length);
      failed++;
    }
  } catch (e) { console.log('FAIL:', e.message); failed++; }

  // Test: GET /api/labs/REF-001 returns valid lab
  try {
    const r = await httpRequest('GET', '/api/labs/REF-001');
    if (r.status === 200 && r.data.id === 'REF-001' && r.data.steps && r.data.steps.length > 0) {
      console.log('PASS: GET /api/labs/REF-001 returns valid lab with steps');
      passed++;
    } else {
      console.log('FAIL: GET /api/labs/REF-001 unexpected result');
      failed++;
    }
  } catch (e) { console.log('FAIL:', e.message); failed++; }

  // Test: GET /api/labs/NONEXISTENT returns 404
  try {
    const r = await httpRequest('GET', '/api/labs/NONEXISTENT');
    if (r.status === 404) {
      console.log('PASS: GET /api/labs/NONEXISTENT returns 404');
      passed++;
    } else {
      console.log('FAIL: GET /api/labs/NONEXISTENT should return 404');
      failed++;
    }
  } catch (e) { console.log('FAIL:', e.message); failed++; }

  // LAB SESSION/RUNTIME TESTS
  console.log('\n=== LAB SESSION/RUNTIME ===');

  // Test: POST /api/labs/:id/start creates session
  try {
    const r = await httpRequest('POST', '/api/labs/REF-001/start', {});
    if (r.status === 200 && r.data.sessionId && r.data.labState) {
      console.log('PASS: POST /api/labs/REF-001/start creates session');
      passed++;
    } else {
      console.log('FAIL: POST /api/labs/REF-001/start unexpected result');
      failed++;
    }
  } catch (e) { console.log('FAIL:', e.message); failed++; }

  // Test: Session retrieval works
  try {
    const startRes = await httpRequest('POST', '/api/labs/REF-001/start', {});
    const sessionId = startRes.data.sessionId;
    const r = await httpRequest('GET', `/api/labs/REF-001/active-session/${sessionId}`);
    if (r.status === 200 && r.data.sessionId === sessionId) {
      console.log('PASS: Session retrieval works');
      passed++;
    } else {
      console.log('FAIL: Session retrieval failed');
      failed++;
    }
  } catch (e) { console.log('FAIL:', e.message); failed++; }

  // Test: Reset session works
  try {
    const startRes = await httpRequest('POST', '/api/labs/REF-001/start', {});
    const sessionId = startRes.data.sessionId;
    const r = await httpRequest('POST', `/api/labs/REF-001/reset-session/${sessionId}`, {});
    if (r.status === 200 && r.data.reset === true) {
      console.log('PASS: Reset session works');
      passed++;
    } else {
      console.log('FAIL: Reset session failed');
      failed++;
    }
  } catch (e) { console.log('FAIL:', e.message); failed++; }

  // VERIFICATION API TESTS
  console.log('\n=== VERIFICATION API/SERVICE ===');

  // Test: verificationService direct tests
  const verificationService = require('./backend/services/verificationService');

  // Test state_check
  const labState1 = {
    deviceStates: new Map([
      ['PC1', { id: 'PC1', interfaces: { Ethernet0: { ip: '192.168.1.10', mask: '255.255.255.0', status: 'up' } } }]
    ])
  };

  const step1 = { stepId: 'TEST-1', verification: { type: 'state_check', expected: { deviceId: 'PC1', interface: 'Ethernet0', ip: '192.168.1.10', mask: '255.255.255.0' } } };
  const r1 = verificationService.verifyStep(step1, {}, labState1);
  if (r1.passed === true && r1.message === 'IP address matches') {
    console.log('PASS: state_check matching IP returns PASS');
    passed++;
  } else {
    console.log('FAIL: state_check matching IP', r1);
    failed++;
  }

  const step2 = { stepId: 'TEST-2', verification: { type: 'state_check', expected: { deviceId: 'PC1', interface: 'Ethernet0', ip: '192.168.1.99', mask: '255.255.255.0' } } };
  const r2 = verificationService.verifyStep(step2, {}, labState1);
  if (r2.passed === false && r2.message.includes('192.168.1.99')) {
    console.log('PASS: state_check wrong IP returns FAIL with details');
    passed++;
  } else {
    console.log('FAIL: state_check wrong IP', r2);
    failed++;
  }

  // Test ping
  const labState2 = {
    deviceStates: new Map([
      ['PC1', { id: 'PC1', interfaces: { Ethernet0: { ip: '192.168.1.10', mask: '255.255.255.0', status: 'up' } } }],
      ['PC2', { id: 'PC2', interfaces: { Ethernet0: { ip: '192.168.1.20', mask: '255.255.255.0', status: 'up' } } }]
    ])
  };

  const step3 = { stepId: 'TEST-3', verification: { type: 'ping', expected: 'reachable' }, targetDevice: 'PC1', commands: ['ping 192.168.1.20'] };
  const r3 = verificationService.verifyStep(step3, {}, labState2);
  if (r3.passed === true) {
    console.log('PASS: ping reachable returns PASS');
    passed++;
  } else {
    console.log('FAIL: ping reachable', r3);
    failed++;
  }

  const step4 = { stepId: 'TEST-4', verification: { type: 'ping', expected: 'reachable' }, targetDevice: 'PC1', commands: ['ping 10.0.0.1'] };
  const r4 = verificationService.verifyStep(step4, {}, labState2);
  if (r4.passed === false) {
    console.log('PASS: ping unreachable returns FAIL');
    passed++;
  } else {
    console.log('FAIL: ping unreachable', r4);
    failed++;
  }

  // Test normalizeVerificationType
  const norm1 = verificationService.normalizeVerificationType('state_check');
  const norm2 = verificationService.normalizeVerificationType('ping');
  const norm3 = verificationService.normalizeVerificationType('cli');
  if (norm1.isSupported && norm2.isSupported && norm3.isSupported) {
    console.log('PASS: All verification types normalized correctly');
    passed++;
  } else {
    console.log('FAIL: normalizeVerificationType', norm1, norm2, norm3);
    failed++;
  }

  // WEBSOCKET CONTRACT TESTS
  console.log('\n=== WEBSOCKET CONTRACT ===');

  // WebSocket connection test
  const wsResult = await new Promise((resolve) => {
    const ws = new WebSocket(WS_URL);
    let success = false;

    ws.on('open', () => {
      ws.send(JSON.stringify({ type: 'lab:start', labId: 'REF-001' }));
    });

    ws.on('message', (data) => {
      const msg = JSON.parse(data);
      if (msg.type === 'lab:started') {
        success = true;
        ws.close();
      }
    });

    ws.on('error', () => {
      resolve(false);
    });

    ws.on('close', () => resolve(success));

    setTimeout(() => { ws.close(); resolve(false); }, 5000);
  });

  if (wsResult) {
    console.log('PASS: WebSocket connection and lab:start works');
    passed++;
  } else {
    console.log('FAIL: WebSocket connection failed');
    failed++;
  }

  // WebSocket verification flow test
  const wsVerifyResult = await new Promise((resolve) => {
    const ws = new WebSocket(WS_URL);
    let stepId = null;
    let verificationPassed = null;

    ws.on('open', () => {
      ws.send(JSON.stringify({ type: 'lab:start', labId: 'REF-001' }));
    });

    ws.on('message', (data) => {
      const msg = JSON.parse(data);
      if (msg.type === 'lab:started') {
        stepId = msg.firstStep.stepId;
        // Send verification
        ws.send(JSON.stringify({ type: 'lab:step:verify', stepId, payload: {} }));
      } else if (msg.type === 'step:passed') {
        verificationPassed = true;
        ws.close();
      } else if (msg.type === 'step:failed') {
        verificationPassed = false;
        ws.close();
      } else if (msg.type === 'error') {
        verificationPassed = null;
        ws.close();
      }
    });

    ws.on('close', () => resolve(verificationPassed));

    setTimeout(() => { ws.close(); resolve(null); }, 5000);
  });

  if (wsVerifyResult !== null) {
    console.log('PASS: WebSocket lab:step:verify returns step:passed or step:failed');
    passed++;
  } else {
    console.log('FAIL: WebSocket verification flow failed');
    failed++;
  }

  // ERROR HANDLING TESTS
  console.log('\n=== ERROR HANDLING ===');

  // Test: Invalid lab start returns error
  try {
    const r = await httpRequest('POST', '/api/labs/NONEXISTENT/start', {});
    if (r.status === 404) {
      console.log('PASS: Invalid lab start returns 404');
      passed++;
    } else {
      console.log('FAIL: Invalid lab start should return 404');
      failed++;
    }
  } catch (e) { console.log('FAIL:', e.message); failed++; }

  // SUMMARY
  console.log('\n========================================');
  console.log('REGRESSION QA SUMMARY');
  console.log('========================================');
  console.log('Passed:', passed);
  console.log('Failed:', failed);
  console.log('Total:', passed + failed);

  if (failed > 0) {
    console.log('\n⚠️  Some tests failed');
    process.exit(1);
  } else {
    console.log('\n✅ ALL REGRESSION QA TESTS PASSED');
    process.exit(0);
  }
}

runRegressionQA().catch(e => {
  console.error('Test error:', e);
  process.exit(1);
});
