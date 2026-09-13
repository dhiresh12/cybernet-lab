// Re-export all constants from submodules for backward compatibility.
// Importing from 'core/constants' still works for all consumers.

export { DEVICE_TYPES } from './deviceTypes.js';
export { TOOL_TYPES, CONNECTION_TYPES } from './toolTypes.js';
export { CLI_MODES } from './cliModes.js';
export { LAB_DIFFICULTIES } from './labDifficulties.js';
export { STORAGE_KEYS } from './storageKeys.js';
export { THEMES } from './themes.js';
export { BACKGROUNDS } from './backgrounds.js';
export { DEFAULT_BG, DEFAULT_MUSIC, DEFAULT_INTERFACE } from './defaults.js';
export { MUSIC_TRACKS, STUDY_DECK_CATEGORIES, FOCUS_PRESETS } from './musicTracks.js';
export { SIM_DEFAULTS } from './simulationDefaults.js';
export { BADGE_THRESHOLDS } from './badgeThresholds.js';
export { VERIFICATION_TYPES } from './verificationTypes.js';
export { PACKET_STATES } from './packetStates.js';
export { TROUBLESHOOT_FAULTS } from './troubleshootFaults.js';
export { ADMIN_STATES, LINK_STATES, DEVICE_STATES, DEVICE_TYPE_CONFIGS } from './deviceStates.js';