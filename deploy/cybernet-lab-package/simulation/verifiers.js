const verifiers = {};

verifiers.cli = function cli(payload, expected, labState) {
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
};

verifiers.config = function config(payload, expected, labState) {
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
};

verifiers.topology = function topology(payload, expected, labState) {
  const actualNodes = payload.nodes || [];
  const actualEdges = payload.edges || [];
  const expectedNodes = expected.nodes || [];
  const expectedEdges = expected.edges || [];
  const nodesMatch = actualNodes.length >= expectedNodes.length &&
    expectedNodes.every(en => actualNodes.some(an => an.type === en.type && an.id === en.id));
  const edgesMatch = actualEdges.length >= expectedEdges.length &&
    expectedEdges.every(ee => actualEdges.some(ae => ae.from === ee.from && ae.to === ee.to));
  const passed = nodesMatch && edgesMatch;
  return {
    passed,
    xp: passed ? 15 : 0,
    feedback: passed ? 'Topology matches requirements.' : 'Missing devices or connections.',
    hint: passed ? null : 'Ensure all required devices are placed and connected.'
  };
};

verifiers.typing = function typing(payload, expected, labState) {
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
};

verifiers.option = function option(payload, expected, labState) {
  const selected = String(payload.selected || '').trim().toLowerCase();
  const expectedVal = String(expected).trim().toLowerCase();
  const passed = selected === expectedVal;
  return {
    passed,
    xp: passed ? 10 : 0,
    feedback: passed ? 'Correct selection.' : 'Incorrect choice.',
    hint: passed ? null : 'Consider the lab objectives and concepts.'
  };
};

verifiers.state_check = function state_check(payload, expected, labState) {
  const deviceStates = (labState && labState.deviceStates) ? Array.from(labState.deviceStates.values()) : [];
  const deviceMap = {};
  deviceStates.forEach(d => { deviceMap[d.id || d.hostname] = d; });

  const expectedDeviceId = (expected && expected.deviceId) || (payload && payload.deviceId);
  const device = expectedDeviceId ? deviceMap[expectedDeviceId] : deviceStates[0];
  if (!device) {
    return {
      passed: false,
      xp: 0,
      feedback: 'Device state not found. Ensure the simulator has synced device state.',
      hint: 'Device state may not be available on the backend yet.'
    };
  }

  const checks = expected && expected.checks ? expected.checks : [expected];
  const results = checks.map(check => {
    const ifaceName = check.interface || check.interfaceName || (payload && payload.interface);
    const iface = ifaceName ? (device.interfaces && device.interfaces[ifaceName]) : null;

    if (ifaceName && !iface) {
      return { passed: false, message: 'Interface ' + ifaceName + ' not found on ' + (device.hostname || device.id) };
    }
    if (check.ip && iface && iface.ip !== check.ip) {
      return { passed: false, message: 'Expected IP ' + check.ip + ', got ' + (iface.ip || 'unassigned') };
    }
    if (check.mask && iface && iface.mask !== check.mask) {
      return { passed: false, message: 'Expected mask ' + check.mask + ', got ' + (iface.mask || 'unassigned') };
    }
    if (check.status && iface && iface.status !== check.status) {
      return { passed: false, message: 'Expected status ' + check.status + ', got ' + (iface.status || 'down') };
    }
    if (check.protocol && iface && iface.protocol !== check.protocol) {
      return { passed: false, message: 'Expected protocol ' + check.protocol + ', got ' + (iface.protocol || 'down') };
    }
    return { passed: true, message: 'State check passed' };
  });

  const failed = results.find(r => !r.passed);
  const passed = !failed;
  return {
    passed,
    xp: passed ? 10 : 0,
    feedback: passed ? 'State check passed.' : (failed ? failed.message : 'State check failed.'),
    hint: passed ? null : 'Review device configuration and interface state.'
  };
};

verifiers.ping = function ping(payload, expected, labState) {
  const deviceStates = (labState && labState.deviceStates) ? Array.from(labState.deviceStates.values()) : [];
  const deviceMap = {};
  deviceStates.forEach(d => { deviceMap[d.id || d.hostname] = d; });

  const sourceDeviceId = (payload && payload.sourceDeviceId) || (expected && expected.sourceDeviceId);
  const targetIp = (payload && payload.targetIp) || (expected && expected.targetIp);
  const source = sourceDeviceId ? deviceMap[sourceDeviceId] : deviceStates[0];

  if (!source || !targetIp) {
    return {
      passed: false,
      xp: 0,
      feedback: 'Ping verification unavailable: missing source device or target IP.',
      hint: 'Ensure device state is synced and target IP is provided.'
    };
  }

  const srcIface = Object.values(source.interfaces || {}).find(i => i.ip && i.ip !== 'unassigned' && i.status === 'up');
  if (!srcIface) {
    return {
      passed: false,
      xp: 0,
      feedback: 'Source device has no active interface with an IP address.',
      hint: 'Configure and enable an interface on the source device.'
    };
  }

  const srcNetwork = srcIface.ip && srcIface.mask ? (srcIface.ip + '/' + srcIface.mask) : null;
  const targetDev = Object.values(deviceMap).find(d => Object.values(d.interfaces || {}).some(i => i.ip === targetIp));
  const targetHasUpInterface = targetDev ? Object.values(targetDev.interfaces || {}).some(i => i.ip === targetIp && i.status === 'up') : false;

  if (!targetDev || !targetHasUpInterface) {
    return {
      passed: false,
      xp: 0,
      feedback: 'Destination host is down or has no IP address.',
      hint: 'Ensure the target device is powered on and has an IP address.'
    };
  }

  const sameSubnet = srcNetwork && targetIp && srcNetwork.split('/')[0] && targetIp.split('.')[0] === srcIface.ip.split('.')[0] && targetIp.split('.')[1] === srcIface.ip.split('.')[1];
  const passed = sameSubnet || (source.routing && source.routing.staticRoutes && source.routing.staticRoutes.some(r => r.dest === targetIp));

  return {
    passed,
    xp: passed ? 10 : 0,
    feedback: passed ? 'Ping connectivity verified.' : 'Request timed out; destination unreachable.',
    hint: passed ? null : 'Check physical connectivity, IP addressing, subnet mask, and routing.'
  };
};

function findMissingLines(input, expected) {
  const inputLines = new Set(input.split('\n').map(l => l.trim()).filter(Boolean));
  const expectedLines = expected.split('\n').map(l => l.trim()).filter(Boolean);
  return expectedLines.filter(line => !inputLines.has(line));
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
      else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
}

module.exports = verifiers;
