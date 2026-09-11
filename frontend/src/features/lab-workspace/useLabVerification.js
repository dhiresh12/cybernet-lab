// Verification Hook
import { useState, useCallback } from 'react';
import { simulateVerification, VERIFICATION_TYPES } from '../../features/simulator';

export function useLabVerification({ steps, currentStepIdx, deviceStates, simulation, labEngine }) {
  const [verifying, setVerifying] = useState(false);
  const [lastVerifyResult, setLastVerifyResult] = useState(null);

  const getDeviceState = useCallback((deviceId) => {
    if (labEngine?.state?.runtime?.devices?.[deviceId]) {
      return labEngine.state.runtime.devices[deviceId];
    }
    return deviceStates?.[deviceId];
  }, [labEngine, deviceStates]);

  const buildDeviceStatesMap = useCallback(() => {
    const map = {};
    if (labEngine?.state?.runtime?.devices) {
      Object.entries(labEngine.state.runtime.devices).forEach(([id, state]) => {
        map[id] = state;
      });
    } else if (deviceStates) {
      Object.entries(deviceStates).forEach(([id, state]) => {
        map[id] = state;
      });
    }
    return map;
  }, [labEngine, deviceStates]);

  const verifyCurrentStep = useCallback(() => {
    return new Promise((resolve) => {
      const step = steps[currentStepIdx];
      if (!step) {
        resolve({
          passed: false,
          error: false,
          verifierVersion: '1.0',
          message: 'No active verification step',
          expected: null,
          actual: null,
          evidence: null,
          affectedDevices: [],
          hint: 'Select a valid lab step and retry.',
          limitations: ['The active step is unavailable.'],
          score: 0,
        });
        return;
      }

      const vType = step.verification?.type || VERIFICATION_TYPES.TYPING;
      const expected = step.verification?.expected;
      const payload = step.verification?.payload || {};

      setTimeout(() => {
        let result;
        try {
          result = simulateVerification(
            { type: vType, expected, payload },
            buildDeviceStatesMap(),
            steps,
            simulation,
            step
          );
        } catch (e) {
          resolve({
            passed: false,
            error: true,
            verifierVersion: '1.0',
            message: e?.message || 'Verification error',
            expected,
            actual: null,
            evidence: null,
            affectedDevices: payload.deviceId ? [payload.deviceId] : [],
            hint: 'Inspect the runtime state and retry the verification.',
            limitations: ['The verifier raised a runtime error.'],
            score: 0,
          });
          return;
        }
        resolve({ ...result, error: false });
      }, 500);
    });
  }, [currentStepIdx, steps, buildDeviceStatesMap, simulation]);

  const handleVerify = useCallback(async () => {
    if (verifying) return;
    setVerifying(true);
    setLastVerifyResult(null);

    try {
      const result = await verifyCurrentStep();
      setLastVerifyResult(result);
      setVerifying(false);
      return result;
    } catch (e) {
      setVerifying(false);
      return {
        passed: false,
        error: true,
        verifierVersion: '1.0',
        message: e?.message || 'Verification error',
        expected: null,
        actual: null,
        evidence: null,
        affectedDevices: [],
        hint: 'Inspect the runtime state and retry the verification.',
        limitations: ['The verifier raised a runtime error.'],
        score: 0,
      };
    }
  }, [verifyCurrentStep, verifying]);

  return {
    verifying,
    lastVerifyResult,
    verifyCurrentStep: handleVerify,
  };
}