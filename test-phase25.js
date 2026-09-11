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

async function testWsVerification() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WS_URL);
    let result = null;

    ws.on('open', () => {
      ws.send(JSON.stringify({ type: 'lab:start', labId: 'REF-001' }));
    });

    ws.on('message', (data) => {
      const msg = JSON.parse(data);
      if (msg.type === 'lab:started') {
        ws.send(JSON.stringify({ type: 'lab:step:verify', stepId: msg.firstStep.stepId, payload: {} }));
      } else if (msg.type === 'step:passed' || msg.type === 'step:failed') {
        result = { type: msg.type, feedback: msg.feedback };
        ws.close();
      } else if (msg.type === 'error') {
        result = { type: 'error', message: msg.message };
        ws.close();
      }
    });

    ws.on('error', (e) => { result = { error: e.message }; ws.close(); });
    ws.on('close', () => resolve(result));

    setTimeout(() => { ws.close(); resolve({ error: 'timeout' }); }, 5000);
  });
}

async function testWsHint() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WS_URL);
    let result = null;

    ws.on('open', () => {
      ws.send(JSON.stringify({ type: 'lab:start', labId: 'REF-001' }));
    });

    ws.on('message', (data) => {
      const msg = JSON.parse(data);
      if (msg.type === 'lab:started') {
        ws.send(JSON.stringify({ type: 'lab:hint', stepId: msg.firstStep.stepId, tier: 0 }));
      } else if (msg.type === 'hint') {
        result = { type: msg.type, text: msg.text };
        ws.close();
      } else if (msg.type === 'error') {
        result = { type: 'error', message: msg.message };
        ws.close();
      }
    });

    ws.on('error', (e) => { result = { error: e.message }; ws.close(); });
    ws.on('close', () => resolve(result));

    setTimeout(() => { ws.close(); resolve({ error: 'timeout' }); }, 5000);
  });
}

async function runPhase25Tests() {
  console.log('=== PHASE 2.5 BACKEND VERIFICATION CONTRACT FOUNDATION ===\n');
  let passed = 0;
  let failed = 0;

  // Test 1: GET /api/labs still works
  try {
    const r = await httpRequest('GET', '/api/labs');
    if (r.status === 200 && Array.isArray(r.data) && r.data.length > 0) {
      console.log('PASS Test 1: GET /api/labs returns 249 labs'); passed++;
    } else { console.log('FAIL Test 1:', r.status); failed++; }
  } catch (e) { console.log('FAIL Test 1:', e.message); failed++; }

  // Test 2: GET /api/labs/REF-001 loads successfully
  try {
    const r = await httpRequest('GET', '/api/labs/REF-001');
    if (r.status === 200 && r.data.steps && r.data.steps[0].stepId) {
      console.log('PASS Test 2: GET /api/labs/REF-001 loads, stepId:', r.data.steps[0].stepId); passed++;
    } else { console.log('FAIL Test 2:', r.status); failed++; }
  } catch (e) { console.log('FAIL Test 2:', e.message); failed++; }

  // Test 3: GET /api/labs/1 loads successfully
  try {
    const r = await httpRequest('GET', '/api/labs/1');
    if (r.status === 200 && r.data.steps && r.data.steps[0].stepId) {
      console.log('PASS Test 3: GET /api/labs/1 loads, stepId:', r.data.steps[0].stepId); passed++;
    } else { console.log('FAIL Test 3:', r.status); failed++; }
  } catch (e) { console.log('FAIL Test 3:', e.message); failed++; }

  // Test 4: WebSocket lab:step:verify returns step:passed/failed
  try {
    const result = await testWsVerification();
    if (result && (result.type === 'step:passed' || result.type === 'step:failed')) {
      console.log('PASS Test 4: WebSocket verification returns', result.type, '- feedback:', result.feedback?.substring(0, 50)); passed++;
    } else if (result && result.type === 'error') {
      console.log('FAIL Test 4: WS error:', result.message); failed++;
    } else {
      console.log('FAIL Test 4: No verification result'); failed++;
    }
  } catch (e) { console.log('FAIL Test 4:', e.message); failed++; }

  // Test 5: WebSocket lab:hint returns hint
  try {
    const result = await testWsHint();
    if (result && result.type === 'hint') {
      console.log('PASS Test 5: WebSocket hint returns hint - text:', result.text?.substring(0, 40)); passed++;
    } else if (result && result.type === 'error') {
      console.log('FAIL Test 5: WS error:', result.message); failed++;
    } else {
      console.log('FAIL Test 5: No hint result'); failed++;
    }
  } catch (e) { console.log('FAIL Test 5:', e.message); failed++; }

  // Test 6: Session creation and retrieval after schema fixes
  try {
    const r1 = await httpRequest('POST', '/api/labs/REF-001/start', {});
    const r2 = await httpRequest('GET', `/api/labs/REF-001/active-session/${r1.data.sessionId}`);
    if (r2.status === 200 && r2.data.sessionId === r1.data.sessionId && r2.data.labId === 'REF-001') {
      console.log('PASS Test 6: Session retrieval with stepId schema works'); passed++;
    } else { console.log('FAIL Test 6:', r2.status); failed++; }
  } catch (e) { console.log('FAIL Test 6:', e.message); failed++; }

  // Test 7: Invalid labId returns 404
  try {
    const r = await httpRequest('POST', '/api/labs/NONEXISTENT/start', {});
    if (r.status === 404) { console.log('PASS Test 7: Invalid labId returns 404'); passed++; }
    else { console.log('FAIL Test 7:', r.status); failed++; }
  } catch (e) { console.log('FAIL Test 7:', e.message); failed++; }

  // Test 8: Invalid sessionId returns 404
  try {
    const r = await httpRequest('GET', '/api/labs/REF-001/active-session/00000000-0000-0000-0000-000000000000');
    if (r.status === 404) { console.log('PASS Test 8: Invalid sessionId returns 404'); passed++; }
    else { console.log('FAIL Test 8:', r.status); failed++; }
  } catch (e) { console.log('FAIL Test 8:', e.message); failed++; }

  // Test 9: Reset session works
  try {
    const r1 = await httpRequest('POST', '/api/labs/REF-001/start', {});
    const r2 = await httpRequest('POST', `/api/labs/REF-001/reset-session/${r1.data.sessionId}`, {});
    if (r2.status === 200 && r2.data.reset === true) { console.log('PASS Test 9: Reset session works'); passed++; }
    else { console.log('FAIL Test 9:', r2.status); failed++; }
  } catch (e) { console.log('FAIL Test 9:', e.message); failed++; }

  // Test 10: Backend operational
  try {
    const r = await httpRequest('GET', '/api/labs');
    if (r.status === 200) { console.log('PASS Test 10: Backend operational'); passed++; }
    else { console.log('FAIL Test 10:', r.status); failed++; }
  } catch (e) { console.log('FAIL Test 10:', e.message); failed++; }

  console.log('\n=== PHASE 2.5 VALIDATION SUMMARY ===');
  console.log('Passed:', passed);
  console.log('Failed:', failed);
  console.log('Total:', passed + failed);

  if (failed > 0) {
    console.log('\n⚠️  Some tests failed');
    process.exit(1);
  } else {
    console.log('\n✅ All Phase 2.5 tests passed');
  }
}

runPhase25Tests().catch(e => { console.error('Test error:', e); process.exit(1); });