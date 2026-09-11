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
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function wsConnect() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WS_URL);
    const messages = [];

    ws.on('open', () => resolve({ ws, messages }));
    ws.on('message', (data) => messages.push(JSON.parse(data)));
    ws.on('error', reject);
  });
}

async function runTests() {
  console.log('=== BACKEND API CONTRACT VALIDATION ===\n');

  let passed = 0;
  let failed = 0;

  // Test 1: GET /api/labs - Lab listing
  try {
    const result = await httpRequest('GET', '/api/labs');
    if (result.status === 200 && Array.isArray(result.data) && result.data.length > 0) {
      console.log('PASS: GET /api/labs returns array of', result.data.length, 'labs');
      console.log('  - Sample:', JSON.stringify(result.data[0]).substring(0, 100));
      passed++;
    } else {
      console.log('FAIL: GET /api/labs unexpected response:', result.status, typeof result.data);
      failed++;
    }
  } catch (e) {
    console.log('FAIL: GET /api/labs error:', e.message);
    failed++;
  }

  // Test 2: GET /api/labs/:id - Lab retrieval (procedural)
  try {
    const result = await httpRequest('GET', '/api/labs/1');
    if (result.status === 200 && result.data.id === '1') {
      console.log('PASS: GET /api/labs/1 returns lab with id=1');
      console.log('  - Title:', result.data.title);
      console.log('  - Has steps:', Array.isArray(result.data.steps), '- count:', result.data.steps?.length);
      console.log('  - First step format:', JSON.stringify(result.data.steps?.[0]).substring(0, 200));
      passed++;
    } else {
      console.log('FAIL: GET /api/labs/1 unexpected:', result.status, result.data);
      failed++;
    }
  } catch (e) {
    console.log('FAIL: GET /api/labs/1 error:', e.message);
    failed++;
  }

  // Test 3: GET /api/labs/:id - Lab retrieval (reference)
  try {
    const result = await httpRequest('GET', '/api/labs/REF-001');
    if (result.status === 200 && result.data.id === 'REF-001') {
      console.log('PASS: GET /api/labs/REF-001 returns lab');
      console.log('  - Title:', result.data.title);
      console.log('  - Category:', result.data.category);
      console.log('  - Steps:', result.data.steps?.length);
      console.log('  - Has initialState:', !!result.data.initialState);
      if (result.data.steps?.[0]) {
        console.log('  - Step fields:', Object.keys(result.data.steps[0]).join(', '));
        console.log('  - Step ID field:', result.data.steps[0].stepId ? 'stepId' : (result.data.steps[0].id ? 'id' : 'missing'));
        console.log('  - Hint field:', result.data.steps[0].hintTiers ? 'hintTiers' : (result.data.steps[0].hints ? 'hints' : 'none'));
      }
      passed++;
    } else {
      console.log('FAIL: GET /api/labs/REF-001 unexpected:', result.status);
      failed++;
    }
  } catch (e) {
    console.log('FAIL: GET /api/labs/REF-001 error:', e.message);
    failed++;
  }

  // Test 4: GET /api/labs/:id - Invalid lab
  try {
    const result = await httpRequest('GET', '/api/labs/NONEXISTENT');
    if (result.status === 404 && result.data.error) {
      console.log('PASS: GET /api/labs/NONEXISTENT returns 404 with error:', result.data.error);
      passed++;
    } else {
      console.log('FAIL: GET /api/labs/NONEXISTENT should return 404, got:', result.status, result.data);
      failed++;
    }
  } catch (e) {
    console.log('FAIL: GET /api/labs/NONEXISTENT error:', e.message);
    failed++;
  }

  // Test 5: POST /api/labs/:id/start - Lab initialization (returns sessionId + labState)
  try {
    const result = await httpRequest('POST', '/api/labs/REF-001/start', {});
    if (result.status === 200 && result.data.sessionId && result.data.labState) {
      console.log('PASS: POST /api/labs/REF-001/start returns sessionId and labState');
      console.log('  - labId:', result.data.labState.labId);
      console.log('  - currentStep:', result.data.labState.currentStep);
      console.log('  - deviceStates:', typeof result.data.labState.deviceStates);
      console.log('  - topology:', JSON.stringify(result.data.labState.topology));
      passed++;
    } else {
      console.log('FAIL: POST /api/labs/REF-001/start unexpected:', result.status, result.data);
      failed++;
    }
  } catch (e) {
    console.log('FAIL: POST /api/labs/REF-001/start error:', e.message);
    failed++;
  }

  // Test 6: POST /api/labs/:id/start - Invalid lab
  try {
    const result = await httpRequest('POST', '/api/labs/BAD/start', {});
    if (result.status === 404) {
      console.log('PASS: POST /api/labs/BAD/start returns 404');
      passed++;
    } else {
      console.log('FAIL: POST /api/labs/BAD/start should return 404, got:', result.status);
      failed++;
    }
  } catch (e) {
    console.log('FAIL: POST /api/labs/BAD/start error:', e.message);
    failed++;
  }

  // Test 7: GET /api/user/progress
  try {
    const result = await httpRequest('GET', '/api/user/progress');
    if (result.status === 200 && Array.isArray(result.data)) {
      console.log('PASS: GET /api/user/progress returns array');
      passed++;
    } else {
      console.log('FAIL: GET /api/user/progress unexpected:', result.status);
      failed++;
    }
  } catch (e) {
    console.log('FAIL: GET /api/user/progress error:', e.message);
    failed++;
  }

  // Test 8: GET /api/user/labs/:labId/state - No saved state
  try {
    const result = await httpRequest('GET', '/api/user/labs/REF-001/state');
    if (result.status === 404) {
      console.log('PASS: GET /api/user/labs/REF-001/state returns 404 for unsaved state');
      passed++;
    } else {
      console.log('FAIL: GET /api/user/labs/REF-001/state should return 404, got:', result.status);
      failed++;
    }
  } catch (e) {
    console.log('FAIL: GET /api/user/labs/REF-001/state error:', e.message);
    failed++;
  }

  // Test 9: POST /api/user/labs/:labId/state - Save state
  try {
    const result = await httpRequest('POST', '/api/user/labs/TEST-LAB/state', { progress: 50 });
    if (result.status === 200 && result.data.saved) {
      console.log('PASS: POST /api/user/labs/TEST-LAB/state saves state');
      passed++;
    } else {
      console.log('FAIL: POST /api/user/labs/TEST-LAB/state unexpected:', result.status, result.data);
      failed++;
    }
  } catch (e) {
    console.log('FAIL: POST /api/user/labs/TEST-LAB/state error:', e.message);
    failed++;
  }

  // Test 10: GET /api/user/labs/:labId/state - Retrieve saved state
  try {
    const result = await httpRequest('GET', '/api/user/labs/TEST-LAB/state');
    if (result.status === 200 && result.data.progress === 50) {
      console.log('PASS: GET /api/user/labs/TEST-LAB/state retrieves saved state');
      passed++;
    } else {
      console.log('FAIL: GET /api/user/labs/TEST-LAB/state unexpected:', result.status, result.data);
      failed++;
    }
  } catch (e) {
    console.log('FAIL: GET /api/user/labs/TEST-LAB/state error:', e.message);
    failed++;
  }

  // WebSocket Tests
  console.log('\n--- WebSocket Tests ---');

  try {
    const { ws, messages } = await wsConnect();
    console.log('WebSocket connected');

    // Wait for session message
    await new Promise(r => ws.once('message', r));
    if (messages[0]?.type === 'session') {
      console.log('PASS: WebSocket session established with ID:', messages[0].id.substring(0, 8) + '...');
    }

    // Test lab:start
    ws.send(JSON.stringify({ type: 'lab:start', labId: 'REF-001' }));
    await new Promise(r => ws.once('message', r));

    const startedMsg = messages.find(m => m.type === 'lab:started');
    if (startedMsg) {
      console.log('PASS: lab:start returns lab:started');
      console.log('  - Has state:', !!startedMsg.state);
      console.log('  - Has firstStep:', !!startedMsg.firstStep);
      if (startedMsg.firstStep) {
        console.log('  - firstStep.title:', startedMsg.firstStep.title);
        console.log('  - firstStep.stepId:', startedMsg.firstStep.stepId || 'MISSING');
        console.log('  - firstStep.verification:', JSON.stringify(startedMsg.firstStep.verification));
        console.log('  - firstStep.hints:', Array.isArray(startedMsg.firstStep.hints));
        console.log('  - firstStep.hintTiers:', Array.isArray(startedMsg.firstStep.hintTiers));
      }
      passed++;

      // Test verification with stepId
      const stepId = startedMsg.firstStep?.stepId || startedMsg.firstStep?.id;
      if (stepId) {
        ws.send(JSON.stringify({ type: 'lab:step:verify', stepId, payload: { input: 'ping 192.168.1.20' } }));
        await new Promise(r => setTimeout(r, 500));

        const verifyMsg = messages.find(m => m.type === 'step:passed' || m.type === 'step:failed');
        if (verifyMsg) {
          console.log('PASS: lab:step:verify returns', verifyMsg.type);
          console.log('  - feedback:', verifyMsg.feedback || 'none');
          passed++;
        } else {
          console.log('INFO: lab:step:verify returned:', messages[messages.length - 1]);
        }

        // Test hint request
        ws.send(JSON.stringify({ type: 'lab:hint', stepId, tier: 0 }));
        await new Promise(r => setTimeout(r, 500));

        const hintMsg = messages.find(m => m.type === 'hint');
        if (hintMsg) {
          console.log('PASS: lab:hint returns hint');
          console.log('  - text:', hintMsg.text?.substring(0, 50) || 'empty');
          passed++;
        } else {
          const errMsg = messages.find(m => m.type === 'error');
          console.log('INFO: lab:hint returns error:', errMsg?.message || 'unknown');
        }
      }
    }

    ws.close();
  } catch (e) {
    console.log('FAIL: WebSocket error:', e.message);
    failed++;
  }

  console.log('\n=== VALIDATION SUMMARY ===');
  console.log('Passed:', passed);
  console.log('Failed:', failed);
  console.log('Total:', passed + failed);

  if (failed > 0) {
    console.log('\n⚠️  Some tests failed - see details above');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed');
  }
}

runTests().catch(e => {
  console.error('Test error:', e);
  process.exit(1);
});

setTimeout(() => {
  console.error('Tests timed out');
  process.exit(1);
}, 30000);
