const verifiers = require('../../simulation/verifiers');

const SUPPORTED_VERIFICATION_TYPES = new Set(['cli', 'config', 'topology', 'typing', 'option', 'state_check', 'ping']);

const STATE_DEPENDENT_TYPES = new Set(['state_check', 'ping']);

function normalizeVerificationType(type) {
  if (!type) return { canonical: null, isSupported: false, reason: 'Missing verification type' };

  const lowerType = String(type).toLowerCase().trim();

  if (SUPPORTED_VERIFICATION_TYPES.has(lowerType)) {
    return { canonical: lowerType, isSupported: true, reason: null };
  }

  if (STATE_DEPENDENT_TYPES.has(lowerType)) {
    return { canonical: lowerType, isSupported: true, reason: null };
  }

  return { canonical: lowerType, isSupported: false, reason: 'unsupported verification type' };
}

function createVerificationResult({ passed, stepId, type, message, details = {}, xp = 0, hint = null }) {
  return {
    passed,
    stepId,
    type,
    message,
    feedback: message,
    details,
    xp,
    hint,
    toLegacy() {
      return { passed, xp, feedback: message, hint };
    }
  };
}

function verifyState(expected, payload, labState) {
  let stateExpected = expected;
  
  let { deviceId, interface: interfaceName, ip, mask } = stateExpected || {};
  
  const device = labState.deviceStates ? labState.deviceStates.get(deviceId) : null;
  
  if (!device) return { passed: false, message: `Device ${deviceId} not found`, details: { deviceId } };
  
  const iface = device.interfaces ? device.interfaces[interfaceName] : null;
  
  if (!iface) return { passed: false, message: `Interface ${interfaceName} not found on ${deviceId}`, details: { deviceId, interfaceName } };
  
  const actualIp = iface.ip || 'unassigned';
  const actualMask = iface.mask || 'unassigned';
  
  const passed = actualIp === ip && actualMask === mask;
  
  return { 
    passed, 
    message: passed ? 'IP address matches' : `Expected ${ip}/${mask}, got ${actualIp}/${actualMask}`,
    details: { expectedIp: ip, expectedMask: mask, actualIp, actualMask, deviceId, interfaceName }
  };
}

function verifyPing(expected, payload, labState, simulation, step) {
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

  // Prefer the actual CLI output captured from the terminal session, so the
  // verifier grades what the learner really ran instead of re-deriving it.
  const stepOutputs = labState && labState.stepOutputs;
  if (stepOutputs && step && step.stepId) {
    const output = stepOutputs[step.stepId];
    if (Array.isArray(output) && output.length > 0) {
      const text = output.join('\n').toLowerCase();
      const pingLine = output.find(line => /ping/i.test(line));
      if (pingLine) {
        const m = pingLine.match(/(\d+\.\d+\.\d+\.\d+)/);
        if (m && !targetIp) targetIp = m[1];
        const success = /success rate 100 percent|0 percent|bytes from/i.test(text);
        if (success) {
          const allReachable = /success rate 100 percent|bytes from/.test(text);
          const passed = expectedReachable ? allReachable : !allReachable;
          return {
            passed,
            message: passed ? 'Ping connectivity verified' : `Ping failed: ${pingLine}`,
            details: { sourceDeviceId, targetIp, expectedReachable, actualReachable: allReachable, output }
          };
        }
      }
    }
  }

  const simEngine = simulation && simulation.simulatePing ? simulation : (simulation && simulation.engine ? simulation.engine : null);
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
  
  if (labState && labState.deviceStates) {
    const sourceDevice = labState.deviceStates.get(sourceDeviceId);
    if (sourceDevice && sourceDevice.interfaces) {
      const iface = sourceDevice.interfaces['Ethernet0'] || Object.values(sourceDevice.interfaces)[0];
      if (iface && iface.ip !== 'unassigned' && iface.status === 'up') {
        const allDevices = labState.deviceStates;
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
          const passed = expectedReachable;
          return {
            passed,
            message: passed ? 'Ping connectivity verified' : `Ping failed: target device not reachable`,
            details: { sourceDeviceId, targetIp, expectedReachable, sourceHasIp: iface.ip !== 'unassigned', sourceStatus: iface.status }
          };
        }
      }
    }
  }
  
  return { passed: false, message: 'Ping verification unavailable: simulation not ready', details: { sourceDeviceId, targetIp, expectedReachable } };
}

// Standalone verification functions for backward compatibility
function state_check(expected, payload, labState) {
  return verifyState(expected, payload, labState);
}

function ping(expected, payload, labState, simulation, step) {
  return verifyPing(expected, payload, labState, simulation, step);
}

function verifyStep(step, payload, labState, sessionId = null) {
  if (!step || !step.verification) {
    const result = createVerificationResult({
      passed: false,
      type: 'none',
      message: 'No verification defined for this step.',
      details: {},
      xp: 0,
      hint: null
    });
    if (sessionId) result.stepId = sessionId;
    return result;
  }

  const stepId = step.stepId || step.id;
  const rawType = step.verification.type;
  const { canonical: type, isSupported, reason } = normalizeVerificationType(rawType);
  const expected = step.verification.expected;

  if (!isSupported) {
    const result = createVerificationResult({
      passed: false,
      stepId,
      type,
      message: `Verification type '${rawType}' is not supported by backend. ${reason ? reason + '.' : ''}`,
      details: { expected, verificationType: type, unsupported: true },
      xp: 0,
      hint: `This verification requires authoritative simulation state from Session 3/7 engine integration.`
    });
    return result;
  }

  if (!labState) labState = { deviceStates: new Map() };
  
  let result;

  if (type === 'state_check') {
    const stateResult = verifyState(expected, payload, labState);
    result = createVerificationResult({
      passed: stateResult.passed,
      stepId,
      type,
      message: stateResult.message,
      details: stateResult.details,
      xp: stateResult.passed ? 10 : 0,
      hint: stateResult.passed ? null : 'Check IP configuration on the target device'
    });
  } else if (type === 'ping') {
    const pingResult = verifyPing(expected, payload, labState, step && step.simulation, step);
    result = createVerificationResult({
      passed: pingResult.passed,
      stepId,
      type,
      message: pingResult.message,
      details: pingResult.details,
      xp: pingResult.passed ? 10 : 0,
      hint: pingResult.passed ? null : 'Verify both devices have IP addresses and are connected'
    });
  } else {
    const verifier = verifiers[type];

    if (typeof verifier !== 'function') {
      result = createVerificationResult({
        passed: false,
        stepId,
        type,
        message: `Verifier function not found for type: ${type}`,
        details: { expected },
        xp: 0,
        hint: null
      });
      return result;
    }

    try {
      const rawResult = verifier(payload, expected, labState);
      result = createVerificationResult({
        passed: rawResult.passed,
        stepId,
        type,
        message: rawResult.feedback || (rawResult.passed ? 'Verification passed.' : 'Verification failed.'),
        details: { expected, verificationOutput: rawResult || {} },
        xp: rawResult.xp || 0,
        hint: rawResult.hint || null
      });
    } catch (e) {
      result = createVerificationResult({
        passed: false,
        stepId,
        type,
        message: 'Verification error: ' + e.message,
        details: { expected, error: e.message },
        xp: 0,
        hint: null
      });
    }
  }

  if (result.passed) {
    // @todo: add completed step logic here if needed
  }

  return result;
}

module.exports = { verifyStep, normalizeVerificationType, createVerificationResult, SUPPORTED_VERIFICATION_TYPES, STATE_DEPENDENT_TYPES, state_check, ping };