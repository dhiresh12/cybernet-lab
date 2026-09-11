/**
 * Frontend Lab Quality Service
 * Mirrors backend labQualityService for client-side filtering.
 * Reads the shared labQualityRegistry.json.
 */

import quarantineRegistry from './labQualityRegistry.json';

const quarantinedIds = new Set(
  (quarantineRegistry.quarantined || [])
    .filter(entry => entry.status === 'BROKEN')
    .map(entry => String(entry.labId))
);

export function isQuarantined(labId) {
  return quarantinedIds.has(String(labId));
}

export function getQuarantinedLabIds() {
  return Array.from(quarantinedIds);
}

export function getLabStatus(labId) {
  const entry = (quarantineRegistry.quarantined || []).find(
    e => String(e.labId) === String(labId)
  );
  return entry || null;
}

export function getRegistry() {
  return quarantineRegistry;
}

export function evaluateLabQuality(lab) {
  if (!lab || typeof lab !== 'object') {
    return { learnerSafe: false, reasons: ['Invalid lab object'] };
  }

  const reasons = [];
  const warnings = [];

  if (!lab.id) reasons.push('Missing id');
  if (!lab.title) reasons.push('Missing title');
  if (!lab.category) reasons.push('Missing category');
  if (!lab.level && !lab.difficulty) reasons.push('Missing level/difficulty');

  const steps = Array.isArray(lab.steps) ? lab.steps : [];
  if (steps.length === 0) reasons.push('No steps');

  const stepsWithoutVerification = steps.filter(s => !s.verification || !s.verification.type);
  if (stepsWithoutVerification.length > 0) {
    warnings.push(`${stepsWithoutVerification.length} steps missing verification metadata`);
  }

  const hasStructuredTopology = lab.topology && typeof lab.topology === 'object' && Array.isArray(lab.topology.devices);
  if (!hasStructuredTopology) {
    warnings.push('Topology is not structured');
  }

  const hasInitialState = lab.initialState && typeof lab.initialState === 'object' && Array.isArray(lab.initialState.devices) && lab.initialState.devices.length > 0;
  if (!hasInitialState) {
    warnings.push('Missing initialState');
  }

  if (isQuarantined(lab.id)) {
    return { learnerSafe: false, reasons: ['Lab is quarantined (BROKEN)'], warnings, quarantined: true };
  }

  const learnerSafe = reasons.length === 0;

  return {
    learnerSafe,
    reasons,
    warnings,
    quarantined: false,
    hasStructuredTopology,
    hasInitialState,
    stepCount: steps.length,
    stepsWithoutVerification: stepsWithoutVerification.length
  };
}
