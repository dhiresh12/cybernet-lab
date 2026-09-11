// localStorage abstraction with error handling
const STORAGE_PREFIX = 'cybernet_';

function getKey(key) {
  return STORAGE_PREFIX + key;
}

export function storageGet(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(getKey(key));
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.warn(`Failed to read storage key: ${key}`, e);
    return defaultValue;
  }
}

export function storageSet(key, value) {
  try {
    localStorage.setItem(getKey(key), JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn(`Failed to write storage key: ${key}`, e);
    return false;
  }
}

export function storageRemove(key) {
  try {
    localStorage.removeItem(getKey(key));
    return true;
  } catch (e) {
    console.warn(`Failed to remove storage key: ${key}`, e);
    return false;
  }
}

export function storageClear() {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX));
    keys.forEach(k => localStorage.removeItem(k));
    return true;
  } catch (e) {
    console.warn('Failed to clear storage', e);
    return false;
  }
}

// Specific storage helpers
export const progressStorage = {
  get: () => storageGet('progress', { completedSteps: [], scores: {}, badges: [], evidenceRecords: [] }),
  set: (progress) => storageSet('progress', progress),
  update: (updater) => {
    const current = progressStorage.get();
    const next = typeof updater === 'function' ? { ...current, ...updater(current) } : { ...current, ...updater };
    progressStorage.set(next);
    return next;
  },
};

export const evidenceStorage = {
  get: () => storageGet('evidenceRecords', []),
  save: (record) => {
    const existing = evidenceStorage.get().find(item =>
      item.labId === record.labId && item.stepId === record.stepId
    );
    const merged = { ...existing, ...record };
    const isVerificationAttempt = record.eventType === 'verification';
    const attempts = isVerificationAttempt
      ? (existing?.attempts || 0) + 1
      : (existing?.attempts || 0);
    const failedAttempts = isVerificationAttempt
      ? (existing?.failedAttempts || 0) + (record.passed ? 0 : 1)
      : (existing?.failedAttempts || 0);
    const records = evidenceStorage.get().filter(item =>
      !(item.labId === record.labId && item.stepId === record.stepId)
    );
    return storageSet('evidenceRecords', [...records, {
      labId: merged.labId,
      stepId: merged.stepId,
      attempts,
      failedAttempts,
      eventType: merged.eventType || (existing?.eventType || 'reflection'),
      verificationType: merged.verificationType || null,
      passed: Boolean(merged.passed),
      resultMessage: merged.resultMessage || '',
      expected: merged.expected || null,
      actual: merged.actual ?? null,
      verifierVersion: merged.verifierVersion || null,
      hint: merged.hint || '',
      score: merged.score ?? null,
      affectedDeviceIds: Array.isArray(merged.affectedDeviceIds) ? merged.affectedDeviceIds : [],
      limitations: Array.isArray(merged.limitations) ? merged.limitations : [],
      prediction: merged.prediction || '',
      evidence: merged.evidence || '',
      explanation: merged.explanation || '',
      savedAt: new Date().toISOString(),
    }]);
  },
  forLab: (labId) => evidenceStorage.get().filter(item => String(item.labId) === String(labId)),
  clearLab: (labId) => {
    const records = evidenceStorage.get().filter(item => String(item.labId) !== String(labId));
    return storageSet('evidenceRecords', records);
  }
};

export const learningStorage = {
  getTransfers: () => storageGet('learningTransfers', []),
  saveTransfer: (record) => {
    const existing = learningStorage.getTransfers().filter(item =>
      !(item.stageId === record.stageId && item.labId === record.labId)
    );
    return storageSet('learningTransfers', [...existing, {
      stageId: record.stageId,
      labId: record.labId,
      passed: Boolean(record.passed),
      startedAt: record.startedAt || new Date().toISOString(),
      completedAt: record.passed ? (record.completedAt || new Date().toISOString()) : null,
    }]);
  },
};

export const engineerStorage = {
  get: () => storageGet('engineerAttempts', []),
  save: (record) => {
    const records = engineerStorage.get().filter(item => item.scenarioId !== record.scenarioId);
    if (record.clear) {
      return storageSet('engineerAttempts', records);
    }
    return storageSet('engineerAttempts', [...records, {
      scenarioId: record.scenarioId,
      authorizationConfirmed: Boolean(record.authorizationConfirmed),
      completedTaskIndexes: Array.isArray(record.completedTaskIndexes) ? record.completedTaskIndexes : [],
      notes: {
        hypotheses: record.notes?.hypotheses || '',
        evidence: record.notes?.evidence || '',
        change: record.notes?.change || '',
        rollback: record.notes?.rollback || '',
        debrief: record.notes?.debrief || '',
        verification: record.notes?.verification || '',
      },
      severity: record.severity || '',
      timeWindow: record.timeWindow || '',
      allowedTools: Array.isArray(record.allowedTools) ? record.allowedTools : [],
      prohibitedActions: Array.isArray(record.prohibitedActions) ? record.prohibitedActions : [],
      score: record.score ?? null,
      passed: Boolean(record.passed),
      savedAt: new Date().toISOString(),
    }]);
  },
};

export const securityStorage = {
  get: () => storageGet('securityExercises', {}),
  save: (moduleId, record) => {
    const exercises = securityStorage.get();
    return storageSet('securityExercises', {
      ...exercises,
      [moduleId]: {
        authorized: Boolean(record.authorized),
        evidence: record.evidence || '',
        mitigation: record.mitigation || '',
        debrief: record.debrief || '',
        savedAt: new Date().toISOString(),
      },
    });
  },
  clear: (moduleId) => {
    const exercises = securityStorage.get();
    const next = { ...exercises };
    delete next[moduleId];
    return storageSet('securityExercises', next);
  },
};

export const themeStorage = {
  get: () => storageGet('theme', 'cyber-blue'),
  set: (theme) => storageSet('theme', theme),
};

export const backgroundStorage = {
  get: () => storageGet('background', 'noc-iceblue'),
  set: (bg) => storageSet('background', bg),
};

export const soundStorage = {
  get: () => storageGet('sound', true),
  set: (enabled) => storageSet('sound', enabled),
};

export const animationsStorage = {
  get: () => storageGet('animations', true),
  set: (enabled) => storageSet('animations', enabled),
};

export const invertColorsStorage = {
  get: () => storageGet('invertColors', false),
  set: (enabled) => storageSet('invertColors', enabled),
};

export const musicStorage = {
  get: () => storageGet('musicTrack', 'darkside'),
  set: (track) => storageSet('musicTrack', track),
  volume: () => storageGet('musicVolume', 0.3),
  setVolume: (volume) => storageSet('musicVolume', volume),
};