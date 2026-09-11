// Verification functions for the Network Simulation Engine

function cli(payload, expected, labState) {
  const input = String(payload.input || '').trim().toLowerCase();
  const expectedCmds = Array.isArray(expected) ? expected : [expected];
  const normalizedInput = input.split('\n').map(l => l.trim()).filter(Boolean);
  const passed = expectedCmds.every(cmd => {
    const normalizedExpected = String(cmd).trim().toLowerCase();
    return normalizedInput.some(line => line === normalizedExpected || line.includes(normalizedExpected));
  });
  return {
    passed,
    xp: passed ? 10 : 0,
    feedback: passed ? 'Command verified.' : 'Expected: ' + expectedCmds.join(' | '),
    hint: passed ? null : 'Check command syntax and interface context.'
  };
}

function config(payload, expected, labState) {
  const input = String(payload.input || '').trim().toLowerCase();
  const expectedConfig = String(expected).trim().toLowerCase();
  const similarity = calculateSimilarity(input, expectedConfig);
  const passed = similarity >= 0.85;
  const missing = findMissingLines(input, expectedConfig);
  return {
    passed,
    xp: passed ? 15 : Math.floor(similarity * 15),
    feedback: passed ? 'Configuration accepted.' : 'Missing or incorrect lines: ' + (missing.slice(0, 3).join(', ') || 'review config'),
    hint: passed ? null : 'Compare your config against the expected lines and fix missing or wrong entries.'
  };
}

function topology(payload, expected, labState) {
  const actualNodes = payload.nodes || [];
  const actualEdges = payload.edges || [];
  const expectedNodes = expected.nodes || [];
  const expectedEdges = expected.edges || [];
  const nodesMatch = actualNodes.length >= expectedNodes.length &&
    expectedNodes.every(en => actualNodes.some(an => an.type === en.type && an.id === en.id));
  const edgesMatch = (actualEdges || []).length >= expectedEdges.length &&
    expectedEdges.every(ee => (actualEdges || []).some(ae => ae.from === ee.from && ae.to === ee.to));
  const passed = nodesMatch && edgesMatch;
  return {
    passed,
    xp: passed ? 15 : 0,
    feedback: passed ? 'Topology matches requirements.' : 'Missing devices or connections.',
    hint: passed ? null : 'Ensure all required devices are placed and connected.'
  };
}

function typing(payload, expected, labState) {
  const input = String(payload.input || '').trim();
  const expectedStr = String(expected).trim();
  const similarity = calculateSimilarity(input, expectedStr);
  const passed = similarity >= 0.9;
  return {
    passed,
    xp: passed ? 10 : Math.floor(similarity * 10),
    feedback: passed ? 'Configuration accepted.' : 'Match: ' + Math.round(similarity * 100) + '%',
    hint: passed ? null : 'Review required commands and syntax.'
  };
}

function option(payload, expected, labState) {
  const selected = String(payload.selected || '').trim().toLowerCase();
  const expectedVal = String(expected).trim().toLowerCase();
  const passed = selected === expectedVal;
  return {
    passed,
    xp: passed ? 10 : 0,
    feedback: passed ? 'Correct selection.' : 'Incorrect choice.',
    hint: passed ? null : 'Consider the lab objectives and concepts.'
  };
}

// state_check: verifies actual device state matches expected
function state_check(payload, expected, labState) {
  let stateExpected = payload;
  
  let { deviceId, interface: interfaceName, ip, mask } = stateExpected || {};
  
  const device = labState.deviceStates ? labState.deviceStates.get(deviceId) : null;
  
  if (!device) return { passed: false, feedback: 'Device state not found', details: { deviceId } };
  
  const iface = device.interfaces ? device.interfaces[interfaceName] : null;
  
  if (!iface) return { passed: false, feedback: `Interface ${interfaceName} not found on ${deviceId}`, details: { deviceId, interfaceName } };
  
  const actualIp = iface.ip || 'unassigned';
  const actualMask = iface.mask || 'unassigned';
  
  const passed = actualIp === ip && actualMask === mask;
  
  return { 
    passed, 
    feedback: passed ? 'State check passed.' : `Expected IP ${ip}`,
    details: { expectedIp: ip, expectedMask: mask, actualIp, actualMask, deviceId, interfaceName }
  };
}

// ping: verifies connectivity between devices using simulation
function ping(arg1, arg2, labState, simulation, step) {
  // Determine which argument is the device info object and which is the expected string
  let payload, expected;
  if (typeof arg1 === 'object' && arg1 !== null && typeof arg2 === 'string') {
    // First arg is device object, second is expected string
    payload = arg1;
    expected = arg2;
  } else if (typeof arg1 === 'string' && typeof arg2 === 'object' && arg2 !== null) {
    // First arg is expected string, second is device object
    payload = arg2;
    expected = arg1;
  } else {
    // Fallback: assume first is payload, second is expected (original signature)
    payload = arg1;
    expected = arg2;
  }
  
  const expectedReachable = String(expected).toLowerCase() === 'reachable';
  
  let sourceDeviceId = null;
  let targetIp = null;
  
  if (typeof payload === 'object' && payload !== null) {
    sourceDeviceId = payload.sourceDeviceId;
    targetIp = payload.targetIp;
  }
  
  if (step) {
    sourceDeviceId = step.targetDevice || sourceDeviceId;
    const commands = step.commands || [];
    if (commands.length > 0) {
      const pingCmd = commands.find(c => String(c).toLowerCase().startsWith('ping '));
      if (pingCmd) {
        targetIp = String(pingCmd).split(' ')[1];
      }
    }
  }
  
  if (!targetIp && payload && payload.targetIp) {
    targetIp = payload.targetIp;
  }
  
  const simEngine = simulation && simulation.simulatePing ? simulation : (simulation && simulation.engine ? simulation.engine : null);
  if (simEngine && typeof simEngine.simulatePing === 'function' && sourceDeviceId && targetIp) {
    try {
      const result = simEngine.simulatePing(sourceDeviceId, targetIp);
      const passed = expectedReachable ? result.success : !result.success;
      return { 
        passed, 
        feedback: passed ? 'Ping connectivity verified.' : `Ping failed: ${result.output?.join('; ') || 'unreachable'}`,
        details: { sourceDeviceId, targetIp, expectedReachable, actualReachable: result.success, output: result.output }
      };
    } catch (e) {
      return { passed: false, feedback: `Ping verification error: ${e.message}`, details: { error: e.message } };
    }
  }
  
  if (labState && labState.deviceStates) {
    const sourceDevice = labState.deviceStates.get(sourceDeviceId);
    if (!sourceDevice) {
      return { passed: false, feedback: 'Device state not found', details: { sourceDeviceId, targetIp, expectedReachable } };
    }
    if (!sourceDevice.interfaces || Object.keys(sourceDevice.interfaces).length === 0) {
      return { passed: false, feedback: 'no active interface', details: { sourceDeviceId, targetIp, expectedReachable } };
    }
    const iface = sourceDevice.interfaces['Ethernet0'] || Object.values(sourceDevice.interfaces)[0];
    if (!iface || iface.status !== 'up' || iface.ip === 'unassigned') {
      return { passed: false, feedback: 'no active interface', details: { sourceDeviceId, targetIp, expectedReachable } };
    }
    
    let targetDeviceFound = false;
    let targetIface = null;
    
    for (const [devId, dev] of labState.deviceStates) {
      if (devId === sourceDeviceId) continue;
      const devIface = dev.interfaces && dev.interfaces['Ethernet0'];
      if (devIface && devIface.ip === targetIp && devIface.status === 'up') {
        targetDeviceFound = true;
        targetIface = devIface;
        break;
      }
    }
    
    if (targetDeviceFound && targetIface) {
      return { 
        passed: expectedReachable, 
        feedback: expectedReachable ? 'Ping connectivity verified.' : `Ping failed: target device not reachable`,
        details: { sourceDeviceId, targetIp, expectedReachable, actualReachable: expectedReachable }
      };
    }
    
    return { passed: false, feedback: 'unreachable', details: { sourceDeviceId, targetIp, expectedReachable, actualReachable: false } };
  }
  
  return { passed: false, feedback: 'Ping verification unavailable: simulation not ready', details: { sourceDeviceId, targetIp, expectedReachable } };
}

function calculateSimilarity(a, b) {
  if (a === b) return 1;
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  if (longer.length === 0) return 1;
  const editDistance = levenshtein(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshtein(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1];
      else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i - 1][j] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
}

module.exports = { cli, config, topology, typing, option, state_check, ping, calculateSimilarity, levenshtein };