// Verification Engine

export const VERIFICATION_TYPES = {
  TYPING: 'typing',
  COMMAND_OUTPUT: 'command_output',
  STATE_CHECK: 'state_check',
  COMMAND: 'command',
  PING: 'ping',
  CLI: 'cli',
  ROUTE: 'route',
  OSPF: 'ospf',
  EIGRP: 'eigrp',
  BGP: 'bgp',
};

export const VERIFIER_VERSION = '1.0';

function normalizeVerificationResult(result, verification, step) {
  const details = result?.details || {};
  const passed = Boolean(result?.passed);
  const type = verification?.type || VERIFICATION_TYPES.TYPING;
  const affectedDevices = [
    verification?.payload?.deviceId,
    step?.targetDevice,
    details.deviceId,
    details.sourceDeviceId,
  ].filter(Boolean);
  const limitations = Array.isArray(result?.limitations)
    ? result.limitations
    : result?.unsupported
      ? ['This verification type is not implemented by the active runtime.']
      : [];

  return {
    ...result,
    passed,
    verifierVersion: result?.verifierVersion || VERIFIER_VERSION,
    message: result?.message || (passed ? 'Verification passed' : 'Verification failed'),
    expected: result?.expected ?? verification?.expected ?? null,
    actual: result?.actual ?? details.actual ?? details.actualIp ?? details.actualReachable ?? null,
    evidence: result?.evidence ?? details.output ?? details.config ?? details,
    affectedDevices: [...new Set(affectedDevices)],
    hint: result?.hint || (passed ? '' : 'Compare the expected state with the reported actual state, then retry.'),
    limitations,
    score: typeof result?.score === 'number' ? result.score : (passed ? 1 : 0),
  };
}

export function simulateVerification(verification, deviceStates, steps, simulation, step) {
  if (!verification) {
    return normalizeVerificationResult(
      { passed: false, message: 'No verification defined', unsupported: true },
      { type: VERIFICATION_TYPES.TYPING },
      step
    );
  }
  
  const vType = verification.type || VERIFICATION_TYPES.TYPING;
  const expected = verification.expected;
  const payload = verification.payload || {};
  
  let result;
  switch (vType) {
    case VERIFICATION_TYPES.TYPING:
      result = verifyTyping(expected, payload);
      break;
    case VERIFICATION_TYPES.COMMAND_OUTPUT:
      result = verifyCommandOutput(expected, payload, deviceStates);
      break;
    case VERIFICATION_TYPES.STATE_CHECK:
      result = verifyState(expected, payload, deviceStates);
      break;
    case VERIFICATION_TYPES.COMMAND:
      result = verifyCommand(expected, payload, deviceStates);
      break;
    case VERIFICATION_TYPES.PING:
      result = verifyPing(expected, payload, deviceStates, simulation, step);
      break;
    case VERIFICATION_TYPES.CLI:
      result = verifyCli(expected, payload);
      break;
    case VERIFICATION_TYPES.ROUTE:
      result = verifyRoute(expected, payload, deviceStates, step);
      break;
    case VERIFICATION_TYPES.OSPF:
      result = verifyOspf(expected, payload, deviceStates, step);
      break;
    case VERIFICATION_TYPES.EIGRP:
      result = verifyEigrp(expected, payload, deviceStates, step);
      break;
    case VERIFICATION_TYPES.BGP:
      result = verifyBgp(expected, payload, deviceStates, step);
      break;
    default:
      result = { passed: false, message: `Unknown verification type: ${vType}`, unsupported: true };
  }
  return normalizeVerificationResult(result, verification, step);
}

function verifyTyping(expected, payload) {
  const userInput = payload.userInput || '';
  const expectedCmd = expected?.command || expected;
  
  if (!expectedCmd) return { passed: false, message: 'No expected command' };
  
  // Normalize both strings
  const normalizedInput = userInput.trim().toLowerCase();
  const normalizedExpected = expectedCmd.trim().toLowerCase();
  if (!normalizedInput) {
    return {
      passed: false,
      message: `Expected: ${expectedCmd}`,
      details: { input: userInput, expected: expectedCmd }
    };
  }
  
  // Check if input matches expected (allow abbreviations)
  const passed = normalizedInput === normalizedExpected || 
                 normalizedExpected.startsWith(normalizedInput);
  
  return {
    passed,
    message: passed ? 'Command verified' : `Expected: ${expectedCmd}`,
    details: { input: userInput, expected: expectedCmd },
  };
}

function verifyCommandOutput(expected, payload, deviceStates) {
  const output = payload.output || [];
  const expectedOutput = expected?.output || expected;
  
  if (!expectedOutput) return { passed: false, message: 'No expected output' };
  
  const outputText = Array.isArray(output) ? output.join('\n') : String(output);
  const expectedText = Array.isArray(expectedOutput) ? expectedOutput.join('\n') : String(expectedOutput);
  
  const passed = outputText.includes(expectedText);
  
  return {
    passed,
    message: passed ? 'Output verified' : 'Output does not match expected',
    details: { output: outputText, expected: expectedText },
  };
}

function verifyState(expected, payload, deviceStates) {
  let stateExpected = expected;
  
  // Parse PowerShell hashtable strings if needed
  if (typeof expected === 'string' && expected.startsWith('@{') && expected.endsWith('}')) {
    stateExpected = parsePowerShellHashtable(expected);
  }
  
  let { deviceId, check } = stateExpected || {};
  
  // Infer check type from fields if not explicitly provided
  if (!check && stateExpected) {
    if (stateExpected.interface && stateExpected.ip) check = 'interface_ip';
    else if (stateExpected.vlans) check = 'vlan_count';
    else if (stateExpected.vlanId) check = 'vlan_exists';
    else if (stateExpected.interfaces) check = 'interfaces';
    else if (stateExpected.ip) check = 'has_ip';
  }
  
  const device = deviceStates[deviceId];
  
  if (!device) return { passed: false, message: `Device ${deviceId} not found`, details: { deviceId } };
  
  // Check various state properties
  switch (check) {
    case 'interface_up':
      return verifyInterfaceUp(device, payload.interface || stateExpected.interface);
    case 'interface_ip':
      return verifyInterfaceIp(device, stateExpected.interface, stateExpected.ip, stateExpected.mask);
    case 'route_exists':
      return verifyRouteExists(device, payload.network || stateExpected.network, payload.mask || stateExpected.mask);
    case 'vlan_exists':
      return verifyVlanExists(device, stateExpected.vlanId);
    case 'vlan_count':
      return verifyVlanCount(device, stateExpected.vlanCount);
    case 'ospf_neighbor':
      return verifyOspfNeighbor(device, payload.neighborId || stateExpected.neighborId);
    case 'bgp_peer':
      return verifyBgpPeer(device, payload.peerIp || stateExpected.peerIp);
    case 'acl_applied':
      return verifyAclApplied(device, payload.interface || stateExpected.interface, payload.direction || stateExpected.direction);
    case 'interfaces':
      return verifyInterfaces(device, stateExpected.interfaces);
    case 'has_ip':
      return verifyHasIp(device, stateExpected.ip);
    default:
      return { passed: false, message: `Unknown check type: ${check}`, details: { check } };
  }
}

function parsePowerShellHashtable(str) {
  const result = {};
  const content = str.slice(2, -1);
  const regex = /(\w+)=([^;]+)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const key = match[1].trim();
    let value = match[2].trim();
    if (value === 'System.Object[]') value = [];
    result[key] = value;
  }
  return result;
}

function verifyInterfaceUp(device, interfaceName) {
  const iface = device.interfaces[interfaceName];
  if (!iface) return { passed: false, message: `Interface ${interfaceName} not found` };
  const passed = iface.status === 'up' && iface.protocol === 'up';
  return { passed, message: passed ? 'Interface is up' : 'Interface is down' };
}

function verifyInterfaceIp(device, interfaceName, expectedIp, expectedMask) {
  const iface = device.interfaces[interfaceName];
  if (!iface) return { passed: false, message: `Interface ${interfaceName} not found on ${device.hostname || device.id}`, details: { interfaceName, deviceId: device.id } };
  const passed = iface.ip === expectedIp && iface.mask === expectedMask;
  const actualIp = iface.ip === 'unassigned' ? 'unassigned' : iface.ip;
  const actualMask = iface.mask || 'unassigned';
  return { 
    passed, 
    message: passed ? 'IP address matches' : `Expected ${expectedIp}/${expectedMask}, got ${actualIp}/${actualMask}`,
    details: { expectedIp, expectedMask, actualIp, actualMask, interfaceName, deviceId: device.id }
  };
}

function verifyRouteExists(device, network, mask) {
  const routes = device.routing?.staticRoutes || [];
  const passed = routes.some(r => r.network === network && r.mask === mask);
  return { passed, message: passed ? 'Route exists' : `Route ${network}/${mask} not found` };
}

function verifyVlanExists(device, vlanId) {
  const passed = device.vlans && device.vlans[vlanId];
  return { passed, message: passed ? 'VLAN exists' : `VLAN ${vlanId} not found` };
}

function verifyOspfNeighbor(device, neighborId) {
  const ospf = device.routing?.ospf;
  const passed = ospf && ospf.neighbors && ospf.neighbors.includes(neighborId);
  return { passed, message: passed ? 'OSPF neighbor found' : `OSPF neighbor ${neighborId} not found` };
}

function verifyBgpPeer(device, peerIp) {
  const bgp = device.routing?.bgp;
  const passed = bgp && bgp.neighbors && bgp.neighbors.some(n => n.ip === peerIp && n.state === 'Established');
  return { passed, message: passed ? 'BGP peer established' : `BGP peer ${peerIp} not established` };
}

function verifyAclApplied(device, interfaceName, direction) {
  const iface = device.interfaces[interfaceName];
  const passed = iface && iface.acl && iface.acl[direction];
  return { passed, message: passed ? 'ACL applied' : `ACL not applied to ${interfaceName} ${direction}` };
}

function verifyVlanCount(device, expectedCount) {
  const vlanCount = device.vlans ? Object.keys(device.vlans).length : 0;
  const count = parseInt(expectedCount, 10);
  const passed = vlanCount >= count;
  return { passed, message: passed ? `VLAN count sufficient (${vlanCount})` : `Expected ${count} VLANs, found ${vlanCount}` };
}

function verifyInterfaces(device, expectedInterfaces) {
  if (!expectedInterfaces || !Array.isArray(expectedInterfaces)) return { passed: true, message: 'Interfaces check passed' };
  const deviceInterfaces = Object.keys(device.interfaces || {});
  const passed = expectedInterfaces.every(ei => deviceInterfaces.some(di => di.includes(ei.id || ei)));
  return { passed, message: passed ? 'Interfaces match' : 'Interfaces do not match expected' };
}

function verifyHasIp(device, expectedIp) {
  const hasIp = Object.values(device.interfaces || {}).some(i => i.ip === expectedIp);
  return { passed: hasIp, message: hasIp ? 'IP address found' : `IP ${expectedIp} not found` };
}

function verifyCommand(expected, payload, deviceStates) {
  const expectedCmds = Array.isArray(expected) ? expected : [expected];
  const device = Object.values(deviceStates)[0];
  if (!device) return { passed: false, message: 'No device state available' };
  
  const runningConfig = device.config?.runningConfig || device.config || '';
  const hasConfig = expectedCmds.some(cmd => {
    const normalizedCmd = String(cmd).trim().toLowerCase();
    if (runningConfig.toLowerCase().includes(normalizedCmd)) return true;
    // For show commands, check if the device has the relevant state
    if (normalizedCmd.startsWith('show ip interface brief')) {
      return Object.values(device.interfaces || {}).length > 0;
    }
    if (normalizedCmd.startsWith('show ip route')) {
      return (device.routing?.staticRoutes || []).length > 0 || (device.routing?.ospf?.enabled) || (device.routing?.eigrp?.enabled);
    }
    if (normalizedCmd.startsWith('show vlan')) {
      return device.vlans && Object.keys(device.vlans).length > 0;
    }
    return false;
  });
  
  const passed = hasConfig;
  return {
    passed,
    message: passed ? 'Command verified in configuration' : 'Command not found in configuration',
    details: { expected: expectedCmds, config: runningConfig?.slice(0, 200) },
  };
}

function verifyPing(expected, payload, deviceStates, simulation, step) {
  const expectedReachable = String(expected).toLowerCase() === 'reachable';
  
  let sourceDeviceId = null;
  let targetIp = null;
  
  if (step) {
    sourceDeviceId = step.targetDevice || payload.sourceDeviceId;
    const commands = step.commands || [];
    if (commands.length > 0) {
      const pingCmd = commands.find(c => String(c).toLowerCase().startsWith('ping '));
      if (pingCmd) {
        targetIp = String(pingCmd).split(' ')[1];
      }
    }
  }
  
  if (!targetIp && payload.targetIp) {
    targetIp = payload.targetIp;
  }
  
  const simEngine = simulation && typeof simulation === 'object' ? simulation.engine || simulation : simulation;
  if (simEngine && typeof simEngine.simulatePing === 'function' && sourceDeviceId && targetIp) {
    try {
      const result = simEngine.simulatePing(sourceDeviceId, targetIp);
      const passed = expectedReachable ? result.success : !result.success;
      return {
        passed,
        message: passed ? 'Ping connectivity verified' : `Ping failed: ${result.output?.join('; ') || 'unreachable'}`,
        details: { sourceDeviceId, targetIp, expectedReachable, actualReachable: result.success, output: result.output }
      };
    } catch (e) {
      return { passed: false, message: `Ping verification error: ${e.message}`, details: { error: e.message } };
    }
  }
  
  if (!simEngine || typeof simEngine.simulatePing !== 'function' || !sourceDeviceId || !targetIp) {
    return { passed: false, message: 'Ping verification unavailable: simulation not ready', details: { sourceDeviceId, targetIp, expectedReachable } };
  }
}

function verifyCli(expected, payload) {
  const expectedCmds = Array.isArray(expected) ? expected : [expected];
  const userInput = String(payload.input || '').trim().toLowerCase();
  
  const passed = expectedCmds.every(cmd => {
    const normalizedCmd = String(cmd).trim().toLowerCase();
    return userInput.includes(normalizedCmd);
  });
  
  return {
    passed,
    message: passed ? 'CLI commands verified' : 'Missing CLI commands',
    details: { expected: expectedCmds, input: userInput },
  };
}

function verifyRoute(expected, payload, deviceStates, step) {
  const deviceId = step?.targetDevice || expected?.deviceId;
  const device = deviceId ? deviceStates[deviceId] : Object.values(deviceStates)[0];
  if (!device) return { passed: false, message: 'No device state available' };
  
  const routes = device.routing?.staticRoutes || [];
  const expectedNetwork = expected?.network || expected;
  const passed = routes.some(r => {
    const routeNetwork = r.dest ? `${r.dest}/${r.mask}` : (r.network || '');
    return routeNetwork === expectedNetwork || routeNetwork.startsWith(expectedNetwork?.split('/')[0]);
  });
  
  return {
    passed,
    message: passed ? 'Route exists' : `Route ${expectedNetwork} not found`,
    details: { expected: expectedNetwork, routes, deviceId },
  };
}

function verifyOspf(expected, payload, deviceStates, step) {
  const deviceId = step?.targetDevice || expected?.deviceId;
  const device = deviceId ? deviceStates[deviceId] : Object.values(deviceStates)[0];
  if (!device) return { passed: false, message: 'No device state available' };
  
  const ospf = device.routing?.ospf;
  const passed = !!(ospf && ospf.enabled);
  
  return {
    passed,
    message: passed ? 'OSPF enabled' : 'OSPF not enabled',
    details: { ospf, deviceId },
  };
}

function verifyEigrp(expected, payload, deviceStates, step) {
  const deviceId = step?.targetDevice || expected?.deviceId;
  const device = deviceId ? deviceStates[deviceId] : Object.values(deviceStates)[0];
  if (!device) return { passed: false, message: 'No device state available' };
  
  const eigrp = device.routing?.eigrp;
  const passed = !!(eigrp && eigrp.enabled);
  
  return {
    passed,
    message: passed ? 'EIGRP enabled' : 'EIGRP not enabled',
    details: { eigrp, deviceId },
  };
}

function verifyBgp(expected, payload, deviceStates, step) {
  const deviceId = step?.targetDevice || expected?.deviceId;
  const device = deviceId ? deviceStates[deviceId] : Object.values(deviceStates)[0];
  if (!device) return { passed: false, message: 'No device state available' };
  
  const bgp = device.routing?.bgp;
  const passed = !!(bgp && bgp.enabled);
  
  return {
    passed,
    message: passed ? 'BGP enabled' : 'BGP not enabled',
    details: { bgp, deviceId },
  };
}

export default {
  VERIFICATION_TYPES,
  simulateVerification,
};