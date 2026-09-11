const fs = require('fs');
const path = require('path');

const registryPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'data', 'labQualityRegistry.json');

let registry = null;

function loadRegistry() {
  if (registry) return registry;
  try {
    const raw = fs.readFileSync(registryPath, 'utf8');
    registry = JSON.parse(raw);
    return registry;
  } catch (e) {
    console.warn('[LabQualityService] Failed to load registry:', e.message);
    return { version: 0, quarantined: [] };
  }
}

/**
 * Returns true if the lab is quarantined (BROKEN status).
 */
function isQuarantined(labId) {
  const reg = loadRegistry();
  return reg.quarantined.some(entry => String(entry.labId) === String(labId) && entry.status === 'BROKEN');
}

/**
 * Returns the quality status entry for a lab, or null if not found.
 */
function getLabStatus(labId) {
  const reg = loadRegistry();
  return reg.quarantined.find(entry => String(entry.labId) === String(labId)) || null;
}

/**
 * Returns all quarantined lab IDs.
 */
function getQuarantinedLabIds() {
  const reg = loadRegistry();
  return reg.quarantined
    .filter(entry => entry.status === 'BROKEN')
    .map(entry => String(entry.labId));
}

/**
 * Returns the full quality registry.
 */
function getRegistry() {
  return loadRegistry();
}

/**
 * Basic quality gate checks for a lab object.
 * Returns an object with boolean flags and an overall learnerSafe assessment.
 * Does NOT automatically quarantine legacy labs.
 */
function evaluateLabQuality(lab) {
  if (!lab || typeof lab !== 'object') {
    return { learnerSafe: false, reasons: ['Invalid lab object'] };
  }

  const reasons = [];
  const warnings = [];

  // Required fields
  if (!lab.id) reasons.push('Missing id');
  if (!lab.title) reasons.push('Missing title');
  if (!lab.category) reasons.push('Missing category');
  if (!lab.level && !lab.difficulty) reasons.push('Missing level/difficulty');

  // Steps
  const steps = Array.isArray(lab.steps) ? lab.steps : [];
  if (steps.length === 0) reasons.push('No steps');

  // Step verification metadata
  const stepsWithoutVerification = steps.filter(s => !s.verification || !s.verification.type);
  if (stepsWithoutVerification.length > 0) {
    warnings.push(`${stepsWithoutVerification.length} steps missing verification metadata`);
  }

  // Topology check
  const hasStructuredTopology = lab.topology && typeof lab.topology === 'object' && Array.isArray(lab.topology.devices);
  if (!hasStructuredTopology) {
    warnings.push('Topology is not structured');
  }

  // Initial state check
  const hasInitialState = lab.initialState && typeof lab.initialState === 'object' && Array.isArray(lab.initialState.devices) && lab.initialState.devices.length > 0;
  if (!hasInitialState) {
    warnings.push('Missing initialState');
  }

  // Quarantine check
  if (isQuarantined(lab.id)) {
    return { learnerSafe: false, reasons: ['Lab is quarantined (BROKEN)'], warnings, quarantined: true };
  }

  // Learner-safe if no critical reasons
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

module.exports = {
  isQuarantined,
  getLabStatus,
  getQuarantinedLabIds,
  getRegistry,
  evaluateLabQuality
};
