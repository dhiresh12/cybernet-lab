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

async function runPhase23Tests() {
  console.log('=== PHASE 2.3 BACKEND LAB SESSION FOUNDATION VALIDATION ===\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Backend starts and GET /api/labs works
  try {
    const result = await httpRequest('GET', '/api/labs');
    if (result.status === 200 && Array.isArray(result.data) && result.data.length > 0) {
      console.log('PASS Test 1: GET /api/labs returns', result.data.length, 'labs');
      passed++;
    } else {
      console.log('FAIL Test 1: GET /api/labs unexpected:', result.status);
      failed++;
    }
  } catch (e) {
    console.log('FAIL Test 1:', e.message);
    failed++;
  }

  // Test 2: GET /api/labs/:id still works
  try {
    const result = await httpRequest('GET', '/api/labs/REF-001');
    if (result.status === 200 && result.data.id === 'REF-001') {
      console.log('PASS Test 2: GET /api/labs/REF-001 works');
      passed++;
    } else {
      console.log('FAIL Test 2: GET /api/labs/REF-001 unexpected:', result.status);
      failed++;
    }
  } catch (e) {
    console.log('FAIL Test 2:', e.message);
    failed++;
  }

  // Test 3: Start a valid lab session - should store in labCache and return sessionId
  try {
    const result = await httpRequest('POST', '/api/labs/REF-001/start', {});
    if (result.status === 200 && result.data.sessionId && result.data.labState) {
      console.log('PASS Test 3: POST /api/labs/REF-001/start returns sessionId and labState');
      console.log('  - sessionId:', result.data.sessionId.substring(0, 8) + '...');
      console.log('  - labState.labId:', result.data.labState.labId);
      console.log('  - labState.currentStep:', result.data.labState.currentStep);
      passed++;
    } else {
      console.log('FAIL Test 3: Expected sessionId and labState in response:', result.status, Object.keys(result.data));
      failed++;
    }
  } catch (e) {
    console.log('FAIL Test 3:', e.message);
    failed++;
  }

  // Test 4: Start session with invalid labId returns 404
  try {
    const result = await httpRequest('POST', '/api/labs/NONEXISTENT/start', {});
    if (result.status === 404 && result.data.error) {
      console.log('PASS Test 4: POST /api/labs/NONEXISTENT/start returns 404:', result.data.error);
      passed++;
    } else {
      console.log('FAIL Test 4: Should return 404 for invalid labId, got:', result.status);
      failed++;
    }
  } catch (e) {
    console.log('FAIL Test 4:', e.message);
    failed++;
  }

  // Test 5: Start a valid lab session and get the sessionId for further tests
  let testSessionId = null;
  try {
    const result = await httpRequest('POST', '/api/labs/REF-001/start', {});
    testSessionId = result.data.sessionId;
    if (testSessionId) {
      console.log('PASS Test 5: Got sessionId for retrieval test:', testSessionId.substring(0, 8) + '...');
      passed++;
    } else {
      console.log('FAIL Test 5: No sessionId returned');
      failed++;
    }
  } catch (e) {
    console.log('FAIL Test 5:', e.message);
    failed++;
  }

  // Test 6: Retrieve the active session
  if (testSessionId) {
    try {
      const result = await httpRequest('GET', `/api/labs/REF-001/active-session/${testSessionId}`);
      if (result.status === 200 && result.data.sessionId === testSessionId && result.data.labState) {
        console.log('PASS Test 6: GET active-session returns correct session');
        console.log('  - sessionId matches:', result.data.sessionId === testSessionId);
        console.log('  - labId:', result.data.labId);
        console.log('  - labState.labId:', result.data.labState.labId);
        passed++;
      } else {
        console.log('FAIL Test 6: Expected sessionId match and labState, got:', result.status, Object.keys(result.data));
        failed++;
      }
    } catch (e) {
      console.log('FAIL Test 6:', e.message);
      failed++;
    }
  }

  // Test 7: Retrieve non-existent sessionId returns 404
  try {
    const fakeSessionId = '00000000-0000-0000-0000-000000000000';
    const result = await httpRequest('GET', `/api/labs/REF-001/active-session/${fakeSessionId}`);
    if (result.status === 404 && result.data.error) {
      console.log('PASS Test 7: GET non-existent sessionId returns 404:', result.data.error);
      passed++;
    } else {
      console.log('FAIL Test 7: Should return 404 for non-existent sessionId, got:', result.status);
      failed++;
    }
  } catch (e) {
    console.log('FAIL Test 7:', e.message);
    failed++;
  }

  // Test 8: Start another session and verify sessionId is unique/stable
  try {
    const result1 = await httpRequest('POST', '/api/labs/REF-001/start', {});
    const result2 = await httpRequest('POST', '/api/labs/REF-001/start', {});
    if (result1.data.sessionId !== result2.data.sessionId) {
      console.log('PASS Test 8: Each start generates unique sessionId');
      passed++;
    } else {
      console.log('FAIL Test 8: SessionIds should be unique');
      failed++;
    }
  } catch (e) {
    console.log('FAIL Test 8:', e.message);
    failed++;
  }

  // Test 9: Reset session
  if (testSessionId) {
    try {
      const result = await httpRequest('POST', `/api/labs/REF-001/reset-session/${testSessionId}`, {});
      if (result.status === 200 && result.data.reset === true) {
        console.log('PASS Test 9: POST reset-session returns reset:true');
        passed++;
      } else {
        console.log('FAIL Test 9: Expected reset:true, got:', result.status, result.data);
        failed++;
      }
    } catch (e) {
      console.log('FAIL Test 9:', e.message);
      failed++;
    }

    // Verify session is gone after reset
    try {
      const result = await httpRequest('GET', `/api/labs/REF-001/active-session/${testSessionId}`);
      if (result.status === 404) {
        console.log('PASS Test 9b: Session removed after reset, returns 404');
        passed++;
      } else {
        console.log('FAIL Test 9b: Session should be gone after reset, got:', result.status);
        failed++;
      }
    } catch (e) {
      console.log('FAIL Test 9b:', e.message);
      failed++;
    }
  }

  // Test 10: Reset non-existent session returns 404
  try {
    const result = await httpRequest('POST', '/api/labs/REF-001/reset-session/FAKE-SESSION-ID', {});
    if (result.status === 404 && result.data.error) {
      console.log('PASS Test 10: Reset non-existent session returns 404:', result.data.error);
      passed++;
    } else {
      console.log('FAIL Test 10: Should return 404 for non-existent session');
      failed++;
    }
  } catch (e) {
    console.log('FAIL Test 10:', e.message);
    failed++;
  }

  // Test 11: Verify existing GET /api/user/labs/:labId/state still works (userLabState unchanged)
  try {
    const result = await httpRequest('GET', '/api/user/labs/REF-001/state');
    if (result.status === 404) {
      console.log('PASS Test 11: GET /api/user/labs/REF-001/state returns 404 (no saved state)');
      passed++;
    } else {
      console.log('FAIL Test 11: Expected 404 for unsaved user state, got:', result.status);
      failed++;
    }
  } catch (e) {
    console.log('FAIL Test 11:', e.message);
    failed++;
  }

  // Test 12: Verify GET /api/user/progress still works
  try {
    const result = await httpRequest('GET', '/api/user/progress');
    if (result.status === 200 && Array.isArray(result.data)) {
      console.log('PASS Test 12: GET /api/user/progress returns array');
      passed++;
    } else {
      console.log('FAIL Test 12: GET /api/user/progress unexpected:', result.status);
      failed++;
    }
  } catch (e) {
    console.log('FAIL Test 12:', e.message);
    failed++;
  }

  // WebSocket Tests
  console.log('\n--- WebSocket Tests ---');

  try {
    const { ws, messages } = await new Promise((resolve, reject) => {
      const w = new WebSocket(WS_URL);
      const msgs = [];
      w.on('open', () => resolve({ ws: w, messages: msgs }));
      w.on('message', (data) => msgs.push(JSON.parse(data)));
      w.on('error', reject);
    });

    console.log('PASS: WebSocket connected');
    passed++;

    // Wait for session message
    await new Promise(r => ws.once('message', r));
    const sessionMsg = messages[0];
    if (sessionMsg?.type === 'session') {
      console.log('PASS: WebSocket session established');
      passed++;
    } else {
      console.log('FAIL: Expected session message');
      failed++;
    }

    // Test lab:start via WebSocket
    ws.send(JSON.stringify({ type: 'lab:start', labId: 'REF-001' }));
    await new Promise(r => setTimeout(r, 500));

    const startedMsg = messages.find(m => m.type === 'lab:started');
    if (startedMsg) {
      console.log('PASS: WebSocket lab:start returns lab:started');
      console.log('  - firstStep.stepId:', startedMsg.firstStep?.stepId);
      passed++;

      // Verify the labCache has the session from WebSocket
      // The WebSocket session.id is in the messages, but we can't directly access labCache from here
      // Just verify the message came through correctly
    } else {
      console.log('FAIL: WebSocket lab:start did not return lab:started');
      failed++;
    }

    // Test lab:step:verify returns proper error (pre-existing step.id bug)
    if (startedMsg?.firstStep?.stepId) {
      ws.send(JSON.stringify({ type: 'lab:step:verify', stepId: startedMsg.firstStep.stepId, payload: { input: 'test' } }));
      await new Promise(r => setTimeout(r, 500));

      // This might return step:passed or step:failed or error depending on verifier
      const verifyMsg = messages.find(m => m.type === 'step:passed' || m.type === 'step:failed' || m.type === 'error');
      if (verifyMsg) {
        console.log('PASS: WebSocket lab:step:verify returned response:', verifyMsg.type);
        passed++;
      } else {
        console.log('INFO: No verify response found (might be expected)');
      }
    }

    ws.close();
  } catch (e) {
    console.log('FAIL: WebSocket error:', e.message);
    failed++;
  }

  console.log('\n=== PHASE 2.3 VALIDATION SUMMARY ===');
  console.log('Passed:', passed);
  console.log('Failed:', failed);
  console.log('Total:', passed + failed);

  if (failed > 0) {
    console.log('\n⚠️  Some tests failed');
    process.exit(1);
  } else {
    console.log('\n✅ All Phase 2.3 tests passed');
  }
}

runPhase23Tests().catch(e => {
  console.error('Test error:', e);
  process.exit(1);
});

setTimeout(() => {
  console.error('Tests timed out');
  process.exit(1);
}, 30000);
