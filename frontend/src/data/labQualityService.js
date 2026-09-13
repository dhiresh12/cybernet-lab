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

export const QUALITY_PASS_THRESHOLD = 70;

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

/**
 * Comprehensive quality gate checks for a lab object.
 * Returns an object with boolean flags, score, and overall learnerSafe assessment.
 */
export function evaluateLabQuality(lab) {
  if (!lab || typeof lab !== 'object') {
    return { learnerSafe: false, reasons: ['Invalid lab object'], score: 0, passed: false };
  }

  const reasons = [];
  const warnings = [];
  let score = 100;
  
  // 1. Mission is meaningful
  if (!lab.mission || lab.mission.trim().length < 20) {
    reasons.push('Mission is missing or not meaningful');
    score -= 30;
  }
  
  // 2. Objectives are clear
  if (!lab.objectives || lab.objectives.trim().length < 20) {
    reasons.push('Objectives are missing or not clear');
    score -= 8;
  }
  
  // 3. Resources are specific
  if (!lab.companyScenario || lab.companyScenario.trim().length < 20) {
    reasons.push('Resources (company scenario) are missing or not specific');
    score -= 8;
  }
  
  // 4. Topology is specific
  const topology = lab.topology || {};
  if (!topology.devices?.length) {
    reasons.push('Topology is missing devices');
    score -= 10;
  }
  if (!topology.connections?.length) {
    reasons.push('Topology is missing connections');
    score -= 8;
  }
  if (!topology.whyThisTopology || topology.whyThisTopology.trim().length < 20) {
    warnings.push('Topology lacks whyThisTopology explanation');
    score -= 3;
  }
  topology.devices?.forEach((device) => {
    if (!device.role) {
      warnings.push(`Device ${device.name || device.id} missing role`);
      score -= 2;
    }
    if (!device.purpose) {
      warnings.push(`Device ${device.name || device.id} missing purpose`);
      score -= 2;
    }
  });
  topology.connections?.forEach((conn) => {
    if (!conn.purpose) {
      warnings.push(`Connection ${conn.from}-${conn.to} missing purpose`);
      score -= 1;
    }
  });
  
  // 5. IP plan is specific
  const ipPlan = lab.ipPlan || [];
  if (ipPlan.length === 0) {
    reasons.push('IP plan is missing');
    score -= 8;
  } else {
    const incompleteIpEntries = ipPlan.filter(entry => !entry.ipAddress || !entry.subnetMask || !entry.gateway);
    if (incompleteIpEntries.length > 0) {
      warnings.push(`${incompleteIpEntries.length} IP plan entries missing subnet/gateway`);
      score -= 3;
    }
  }
  
  // 6. Steps are meaningful
  const steps = Array.isArray(lab.steps) ? lab.steps : [];
  if (steps.length === 0) {
    reasons.push('No steps');
    score -= 10;
  }
  if (steps.length < 20) {
    warnings.push(`Lab has only ${steps.length} steps (minimum 20 required)`);
    score -= 5;
  }
  const stepsMissingFields = steps.filter(s => !s.action || !s.why || !s.expectedResult || !s.verify);
  if (stepsMissingFields.length > 0) {
    warnings.push(`${stepsMissingFields.length} steps missing ACTION/WHY/EXPECTED RESULT/VERIFY`);
    score -= 3;
  }
  
  // 7. Configuration matches
  const commandsMissingFormat = [];
  steps.forEach((step, idx) => {
    if (step.commands && Array.isArray(step.commands)) {
      step.commands.forEach((cmd, cmdIdx) => {
        if (typeof cmd === 'object' && cmd.raw) {
          if (!cmd.whatItDoes || !cmd.whyWeNeedIt || !cmd.expectedState || !cmd.verifyCommand || !cmd.expectedOutput) {
            commandsMissingFormat.push(`Step ${idx}, Command ${cmdIdx}`);
          }
        }
      });
    }
  });
  if (commandsMissingFormat.length > 0) {
    warnings.push(`${commandsMissingFormat.length} commands missing full configuration format`);
    score -= 3;
  }
  
  // 8. Verification is real
  const stepsWithoutVerification = steps.filter(s => !s.verification || !s.verification.type);
  if (stepsWithoutVerification.length > 0) {
    warnings.push(`${stepsWithoutVerification.length} steps missing verification type`);
    score -= 3;
  }
  
  // 9. Troubleshooting exists
  const troubleshooting = lab.troubleshooting || {};
  if (!troubleshooting.commonErrors?.length && !troubleshooting.decisionTree) {
    warnings.push('Lab missing troubleshooting content');
    score -= 5;
  }
  
  // 10. Failure tutorial exists
  if (!lab.failureTutorial) {
    warnings.push('Lab missing failure tutorial');
    score -= 3;
  }
  
  // 11. Concept learned exists
  if (!lab.conceptLearned || lab.conceptLearned.trim().length < 5) {
    warnings.push('Lab missing conceptLearned');
    score -= 3;
  }
  
  // 12. Interview questions exist
  if (!lab.interviewQuestions?.length) {
    warnings.push('Lab missing interview questions');
    score -= 3;
  }
  
  // 13. Hints are progressive
  const stepsMissingProgressiveHints = steps.filter(s => !s.progressiveHints || !s.progressiveHints.HINT0 || !s.progressiveHints.HINT5);
  if (stepsMissingProgressiveHints.length > 0) {
    warnings.push(`${stepsMissingProgressiveHints.length} steps missing progressive hints`);
    score -= 2;
  }
  
  // 14. Debrief exists
  if (!lab.debrief || lab.debrief.trim().length < 20) {
    warnings.push('Lab missing debrief');
    score -= 3;
  }
  
  // 15. Retrieval is scheduled
  if (!lab.retrievalSchedule) {
    warnings.push('Lab missing retrieval schedule');
    score -= 2;
  }
  
  // 16. No fake simulator behavior
  if (lab.backendProfile?.unsupportedCommands?.length > 0) {
    warnings.push('Lab references unsupported simulator commands');
    score -= 5;
  }
  
  // 17. No duplicate content
  const uniqueSteps = new Set(steps.map(s => (s.action || '') + (s.verify || '')));
  if (uniqueSteps.size !== steps.length) {
    warnings.push('Lab contains duplicate steps');
    score -= 10;
  }
  
  // Quarantine check
  if (isQuarantined(lab.id)) {
    return { learnerSafe: false, reasons: ['Lab is quarantined (BROKEN)'], warnings, score: 0, passed: false, quarantined: true };
  }
  
  const finalScore = Math.max(0, Math.min(100, score));
  const passed = finalScore >= QUALITY_PASS_THRESHOLD && reasons.length === 0;
  const learnerSafe = passed;

  return {
    learnerSafe,
    reasons,
    warnings,
    score: finalScore,
    passed,
    threshold: QUALITY_PASS_THRESHOLD,
    quarantined: false,
    hasStructuredTopology: Boolean(topology.devices?.length && topology.connections?.length),
    hasInitialState: Boolean(lab.initialState?.devices?.length > 0),
    stepCount: steps.length,
    stepsWithoutVerification: stepsWithoutVerification.length
  };
}

export default {
  isQuarantined,
  getQuarantinedLabIds,
  getLabStatus,
  getRegistry,
  evaluateLabQuality,
  QUALITY_PASS_THRESHOLD
};
