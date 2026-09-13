import { createDefaultPlaylist, REPEAT_MODES } from '../constants/musicTracks';
import { DEFAULT_MUSIC } from '../constants/defaults';

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

export const conceptBoardStorage = {
  _KEY: 'conceptBoard',
  _defaults() {
    return { concepts: [], connections: [] };
  },
  _read() {
    const state = storageGet(this._KEY, null);
    if (state && typeof state === 'object' && !Array.isArray(state)) {
      return {
        concepts: Array.isArray(state.concepts) ? state.concepts : [],
        connections: Array.isArray(state.connections) ? state.connections : [],
      };
    }
    return this._defaults();
  },
  get: () => conceptBoardStorage._read(),
  set: (state) => storageSet('conceptBoard', {
    concepts: Array.isArray(state?.concepts) ? state.concepts : [],
    connections: Array.isArray(state?.connections) ? state.connections : [],
  }),
  clear: () => storageRemove('conceptBoard'),
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
  get: () => storageGet('sound', false),
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

export const highContrastStorage = {
  get: () => storageGet('highContrast', false),
  set: (enabled) => storageSet('highContrast', enabled),
};

export const largerTextStorage = {
  get: () => storageGet('largerText', false),
  set: (enabled) => storageSet('largerText', enabled),
};

export const reducedTransparencyStorage = {
  get: () => storageGet('reducedTransparency', false),
  set: (enabled) => storageSet('reducedTransparency', enabled),
};

export const reducedGlowStorage = {
  get: () => storageGet('reducedGlow', false),
  set: (enabled) => storageSet('reducedGlow', enabled),
};

export const musicStorage = {
  _KEY: 'musicState',
  _defaults() {
    return {
      currentTrack: DEFAULT_MUSIC,
      queue: createDefaultPlaylist(),
      shuffle: false,
      repeatMode: 'off',
      volume: 0.15,
    };
  },
  _read() {
    const state = storageGet(this._KEY, null);
    if (state && typeof state === 'object' && !Array.isArray(state)) {
      const merged = { ...this._defaults(), ...state };
      return {
        ...merged,
        queue: Array.isArray(merged.queue) && merged.queue.length ? merged.queue : createDefaultPlaylist(),
        shuffle: typeof merged.shuffle === 'boolean' ? merged.shuffle : false,
        repeatMode: REPEAT_MODES.includes(merged.repeatMode) ? merged.repeatMode : 'off',
        volume: typeof merged.volume === 'number' && merged.volume >= 0 && merged.volume <= 1 ? merged.volume : 0.3,
      };
    }
    // Legacy single-key migration (musicTrack / musicVolume / musicQueue / musicShuffle / musicRepeat)
    const legacyTrack = storageGet('musicTrack', DEFAULT_MUSIC);
    const legacyVolume = storageGet('musicVolume', 0.3);
    const legacyShuffle = storageGet('musicShuffle', false);
    const legacyRepeat = storageGet('musicRepeat', 'off');
    const legacyQueue = storageGet('musicQueue', createDefaultPlaylist());
    return {
      currentTrack: typeof legacyTrack === 'string' ? legacyTrack : DEFAULT_MUSIC,
      queue: Array.isArray(legacyQueue) && legacyQueue.length ? legacyQueue : createDefaultPlaylist(),
      shuffle: typeof legacyShuffle === 'boolean' ? legacyShuffle : false,
      repeatMode: REPEAT_MODES.includes(legacyRepeat) ? legacyRepeat : 'off',
      volume: typeof legacyVolume === 'number' && legacyVolume >= 0 && legacyVolume <= 1 ? legacyVolume : 0.3,
    };
  },
  _write(state) {
    return storageSet(this._KEY, state);
  },
  get: () => musicStorage._read().currentTrack,
  set: (track) => musicStorage._write({ ...musicStorage._read(), currentTrack: track }),
  volume: () => musicStorage._read().volume,
  setVolume: (volume) => musicStorage._write({ ...musicStorage._read(), volume }),
  getPlaylist: () => musicStorage._read().queue,
  setPlaylist: (queue) => musicStorage._write({ ...musicStorage._read(), queue: Array.isArray(queue) ? queue : createDefaultPlaylist() }),
  getShuffle: () => musicStorage._read().shuffle,
  setShuffle: (shuffle) => musicStorage._write({ ...musicStorage._read(), shuffle: Boolean(shuffle) }),
  getRepeatMode: () => musicStorage._read().repeatMode,
  setRepeatMode: (mode) => musicStorage._write({ ...musicStorage._read(), repeatMode: REPEAT_MODES.includes(mode) ? mode : 'off' }),
  getState: () => musicStorage._read(),
  setState: (state) => musicStorage._write({ ...musicStorage._read(), ...(state || {}) }),
  clear: () => storageRemove('musicState'),
};

export const ambientStorage = {
  _KEY: 'ambientState',
  _defaults() {
    return {
      volume: 0.3,
      enabled: false,
      activeSounds: [],
    };
  },
  _read() {
    const state = storageGet(this._KEY, null);
    if (state && typeof state === 'object' && !Array.isArray(state)) {
      const merged = { ...this._defaults(), ...state };
      return {
        ...merged,
        volume: typeof merged.volume === 'number' && merged.volume >= 0 && merged.volume <= 1 ? merged.volume : 0.3,
        enabled: typeof merged.enabled === 'boolean' ? merged.enabled : false,
        activeSounds: Array.isArray(merged.activeSounds) ? merged.activeSounds : [],
      };
    }
    return this._defaults();
  },
  _write(state) {
    return storageSet(this._KEY, state);
  },
  get: () => ambientStorage._read(),
  set: (state) => ambientStorage._write({ ...ambientStorage._read(), ...(state || {}) }),
  clear: () => storageRemove('ambientState'),
};

export const focusTimerStorage = {
  _KEY: 'focusTimerState',
  _defaults() {
    return {
      preset: 'standard',
      focusMinutes: 45,
      breakMinutes: 10,
      remainingSeconds: 0,
      isRunning: false,
      isBreak: false,
    };
  },
  _read() {
    const state = storageGet(this._KEY, null);
    if (state && typeof state === 'object' && !Array.isArray(state)) {
      const merged = { ...this._defaults(), ...state };
      return {
        ...merged,
        remainingSeconds: typeof merged.remainingSeconds === 'number' ? merged.remainingSeconds : 0,
        isRunning: typeof merged.isRunning === 'boolean' ? merged.isRunning : false,
        isBreak: typeof merged.isBreak === 'boolean' ? merged.isBreak : false,
      };
    }
    return this._defaults();
  },
  _write(state) {
    return storageSet(this._KEY, state);
  },
  get: () => focusTimerStorage._read(),
  set: (state) => focusTimerStorage._write({ ...focusTimerStorage._read(), ...(state || {}) }),
  clear: () => storageRemove('focusTimerState'),
};

export const dailyMissionStorage = {
  _KEY: 'dailyMission',
  _defaults() { return { date: null, missionId: null, completed: false, savedAt: null }; },
  _read() {
    const state = storageGet(this._KEY, null);
    if (state && typeof state === 'object' && !Array.isArray(state)) return { ...this._defaults(), ...state };
    return this._defaults();
  },
  _write(state) { return storageSet(this._KEY, state); },
  get: () => dailyMissionStorage._read(),
  set: (state) => dailyMissionStorage._write({ ...dailyMissionStorage._read(), ...(state || {}) }),
};

export const retrievalStorage = {
  _KEY: 'retrievalCenter',
  _defaults() { return { date: null, questions: [] }; },
  _read() {
    const state = storageGet(this._KEY, null);
    if (state && typeof state === 'object' && !Array.isArray(state)) return { ...this._defaults(), ...state };
    return this._defaults();
  },
  _write(state) { return storageSet(this._KEY, state); },
  get: () => retrievalStorage._read(),
  set: (state) => retrievalStorage._write({ ...retrievalStorage._read(), ...(state || {}) }),
};

export const failureLabStorage = {
  _KEY: 'failureLab',
  _read() { return storageGet(this._KEY, {}); },
  _write(state) { return storageSet(this._KEY, state); },
  forLab: (labId) => {
    const all = storageGet(this._KEY, {});
    return all[String(labId)] || null;
  },
  save: (labId, record) => {
    const all = storageGet(this._KEY, {});
    return storageSet(this._KEY, { ...all, [String(labId)]: record });
  },
  clear: (labId) => {
    const all = storageGet(this._KEY, {});
    const next = { ...all };
    delete next[String(labId)];
    return storageSet(this._KEY, next);
  },
};

export const troubleshootingStorage = {
  _KEY: 'troubleshootingCoach',
  _read() { return storageGet(this._KEY, {}); },
  _write(state) { return storageSet(this._KEY, state); },
  forLab: (labId) => storageGet(this._KEY, {})[String(labId)] || null,
  save: (labId, record) => {
    const all = storageGet(this._KEY, {});
    return storageSet(this._KEY, { ...all, [String(labId)]: record });
  },
  clear: (labId) => {
    const all = storageGet(this._KEY, {});
    const next = { ...all };
    delete next[String(labId)];
    return storageSet(this._KEY, next);
  },
};

export const interviewRoomStorage = {
  _KEY: 'interviewRoom',
  _defaults() { return { currentLevel: 1, history: [] }; },
  _read() {
    const state = storageGet(this._KEY, null);
    if (state && typeof state === 'object' && !Array.isArray(state)) return { ...this._defaults(), ...state };
    return this._defaults();
  },
  _write(state) { return storageSet(this._KEY, state); },
  get: () => interviewRoomStorage._read(),
  set: (state) => interviewRoomStorage._write({ ...interviewRoomStorage._read(), ...(state || {}) }),
};

export const researchLabStorage = {
  _KEY: 'researchLab',
  _defaults() { return { entries: {}, currentPhase: 0, savedAt: null }; },
  _read() {
    const state = storageGet(this._KEY, null);
    if (state && typeof state === 'object' && !Array.isArray(state)) return { ...this._defaults(), ...state };
    return this._defaults();
  },
  _write(state) { return storageSet(this._KEY, state); },
  get: () => researchLabStorage._read(),
  set: (state) => researchLabStorage._write({ ...researchLabStorage._read(), ...(state || {}) }),
  clear: () => storageRemove('researchLab'),
};

export const portfolioStorage = {
  _KEY: 'portfolio',
  _defaults() { return { items: [], savedAt: null }; },
  _read() {
    const state = storageGet(this._KEY, null);
    if (state && typeof state === 'object' && !Array.isArray(state)) return { ...this._defaults(), ...state };
    return this._defaults();
  },
  _write(state) { return storageSet(this._KEY, state); },
  get: () => portfolioStorage._read(),
  set: (state) => portfolioStorage._write({ ...portfolioStorage._read(), ...(state || {}) }),
};

export const studyPlannerStorage = {
  _KEY: 'studyPlanner',
  _defaults() { return { modeId: '45', activeBlock: null, startedAt: null }; },
  _read() {
    const state = storageGet(this._KEY, null);
    if (state && typeof state === 'object' && !Array.isArray(state)) return { ...this._defaults(), ...state };
    return this._defaults();
  },
  _write(state) { return storageSet(this._KEY, state); },
  get: () => studyPlannerStorage._read(),
  set: (state) => studyPlannerStorage._write({ ...studyPlannerStorage._read(), ...(state || {}) }),
};

export const skillGraphStorage = {
  _KEY: 'skillGraph',
  _defaults() { return {}; },
  _read() {
    const state = storageGet(this._KEY, null);
    if (state && typeof state === 'object' && !Array.isArray(state)) return state;
    return this._defaults();
  },
  _write(state) { return storageSet(this._KEY, state); },
  get: () => skillGraphStorage._read(),
  set: (state) => skillGraphStorage._write({ ...skillGraphStorage._read(), ...(state || {}) }),
};

export const debriefStorage = {
  _KEY: 'debrief',
  _read() { return storageGet(this._KEY, {}); },
  _write(state) { return storageSet(this._KEY, state); },
  forLab: (labId) => storageGet(this._KEY, {})[String(labId)] || null,
  save: (labId, record) => {
    const all = storageGet(this._KEY, {});
    return storageSet(this._KEY, { ...all, [String(labId)]: record });
  },
  clear: (labId) => {
    const all = storageGet(this._KEY, {});
    const next = { ...all };
    delete next[String(labId)];
    return storageSet(this._KEY, next);
  },
};

export const designModeStorage = {
  _KEY: 'designMode',
  _defaults() { return 'noc'; },
  _read() { return storageGet(this._KEY, this._defaults()); },
  _write(state) { return storageSet(this._KEY, state); },
  get: () => designModeStorage._read(),
  set: (mode) => designModeStorage._write(mode),
};

export const courseModeStorage = {
  _KEY: 'courseMode',
  _defaults() { return {}; },
  _read() {
    const state = storageGet(this._KEY, null);
    if (state && typeof state === 'object' && !Array.isArray(state)) return state;
    return this._defaults();
  },
  _write(state) { return storageSet(this._KEY, state); },
  get: () => courseModeStorage._read(),
  set: (state) => courseModeStorage._write({ ...courseModeStorage._read(), ...(state || {}) }),
  clear: () => storageRemove('courseMode'),
};