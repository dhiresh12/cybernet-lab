const { labs, learnerProgress } = require('../state/state');

function getLabPrerequisites(labId) {
  const lab = labs.get(String(labId));
  if (!lab) return [];
  const prereqs = lab.prerequisites || [];
  const allLabs = Array.from(labs.keys()).map(String);
  const list = Array.isArray(prereqs) ? prereqs : [String(prereqs)];
  return list.filter(p => allLabs.includes(String(p)));
}

function buildPrerequisiteGraph() {
  const graph = new Map();
  labs.forEach((lab, labId) => {
    graph.set(String(labId), {
      prerequisites: getLabPrerequisites(labId),
      required: lab.required !== false
    });
  });
  return graph;
}

function getLabStatus(learnerId, labId) {
  const progress = learnerProgress.get(String(learnerId));
  const completed = progress?.completedLabs || [];
  const labIdStr = String(labId);

  if (completed.includes(labIdStr)) return 'complete';

  const lab = labs.get(labIdStr);
  if (!lab) return 'locked';

  const prerequisites = getLabPrerequisites(labIdStr);
  const allComplete = prerequisites.every(preReq => completed.includes(preReq));

  if (!allComplete) return 'locked';

  const currentLab = progress?.currentLab;
  if (currentLab === labIdStr) return 'in_progress';

  return 'available';
}

function canAccessLab(learnerId, labId) {
  return getLabStatus(learnerId, labId) !== 'locked';
}

function getLockReason(learnerId, labId) {
  const progress = learnerProgress.get(String(learnerId));
  const completed = progress?.completedLabs || [];
  const lab = labs.get(String(labId));

  if (!lab) return 'Lab not found';

  const prerequisites = getLabPrerequisites(String(labId));
  const incomplete = prerequisites.filter(preReq => !completed.includes(preReq));

  if (incomplete.length > 0) {
    return `Complete ${incomplete.join(', ')} first`;
  }

  return 'Lab is locked';
}

function validateCompletionContract(contract) {
  const errors = [];
  if (!contract) {
    return ['Missing completion contract'];
  }
  if (!contract.theoryComplete) errors.push('Theory not complete');
  if (!contract.predictionComplete) errors.push('Prediction not complete');
  if (!contract.actionsComplete) errors.push('Actions not complete');
  if (!contract.verificationPassed) errors.push('Verification not passed');
  if (!contract.troubleshootingComplete) errors.push('Troubleshooting not complete');
  if (!contract.debriefComplete) errors.push('Debrief not complete');
  return errors;
}

function completeLab(learnerId, labId, contract) {
  const learnerIdStr = String(learnerId);
  const labIdStr = String(labId);

  const errors = validateCompletionContract(contract);
  if (errors.length > 0) {
    return { success: false, errors };
  }

  if (!canAccessLab(learnerIdStr, labIdStr)) {
    return { success: false, errors: [getLockReason(learnerIdStr, labIdStr)] };
  }

  let progress = learnerProgress.get(learnerIdStr);
  if (!progress) {
    progress = {
      learnerId: learnerIdStr,
      completedLabs: [],
      currentLab: null,
      skillMastery: {},
      retrieval: {},
      startedAt: Date.now()
    };
    learnerProgress.set(learnerIdStr, progress);
  }

  if (!progress.completedLabs.includes(labIdStr)) {
    progress.completedLabs.push(labIdStr);
  }
  progress.currentLab = null;
  progress.lastCompletedAt = Date.now();

  return { success: true, progress };
}

function startLab(learnerId, labId) {
  const learnerIdStr = String(learnerId);
  const labIdStr = String(labId);

  if (!canAccessLab(learnerIdStr, labIdStr)) {
    return { success: false, reason: getLockReason(learnerIdStr, labIdStr) };
  }

  let progress = learnerProgress.get(learnerIdStr);
  if (!progress) {
    progress = {
      learnerId: learnerIdStr,
      completedLabs: [],
      currentLab: null,
      skillMastery: {},
      retrieval: {},
      startedAt: Date.now()
    };
    learnerProgress.set(learnerIdStr, progress);
  }

  progress.currentLab = labIdStr;
  progress.lastActivityAt = Date.now();

  return { success: true, progress };
}

function getAvailableLabs(learnerId) {
  const learnerIdStr = String(learnerId);
  const available = [];
  labs.forEach((lab, labId) => {
    const status = getLabStatus(learnerIdStr, labId);
    if (status !== 'locked') {
      available.push({
        id: lab.id,
        title: lab.title,
        category: lab.category,
        level: lab.level,
        status
      });
    }
  });
  return available;
}

function getLockedLabs(learnerId) {
  const learnerIdStr = String(learnerId);
  const locked = [];
  labs.forEach((lab, labId) => {
    const status = getLabStatus(learnerIdStr, labId);
    if (status === 'locked') {
      locked.push({
        id: lab.id,
        title: lab.title,
        category: lab.category,
        level: lab.level,
        status,
        lockReason: getLockReason(learnerIdStr, labId)
      });
    }
  });
  return locked;
}

function getProgress(learnerId) {
  const progress = learnerProgress.get(String(learnerId));
  if (!progress) {
    return {
      learnerId: String(learnerId),
      completedLabs: [],
      currentLab: null,
      skillMastery: {},
      retrieval: {},
      startedAt: Date.now()
    };
  }
  return progress;
}

module.exports = {
  buildPrerequisiteGraph,
  getLabStatus,
  canAccessLab,
  getLockReason,
  validateCompletionContract,
  completeLab,
  startLab,
  getAvailableLabs,
  getLockedLabs,
  getProgress,
  getLabPrerequisites
};
