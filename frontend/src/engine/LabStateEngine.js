import { DEVICE_STATES, ADMIN_STATES, LINK_STATES, DEVICE_TYPE_CONFIGS } from '../core/constants/deviceStates.js';

export const LAB_STATUS = {
  NOT_STARTED: 'not_started',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  FAILED: 'failed',
  RESET: 'reset',
};

export const DEFAULT_INTERFACE = {
  name: '',
  deviceId: '',
  ip: 'unassigned',
  mask: '255.255.255.0',
  status: 'down',
  protocol: 'down',
  description: '',
  vlan: 1,
  trunkAllowed: [],
  trunkNativeVlan: 1,
  portSecurity: null,
  dhcpClient: false,
  adminState: ADMIN_STATES.UP,
  linkState: LINK_STATES.DOWN,
  connectedPeer: null,
};

export const ACTION_TYPES = {
  DEVICE_CREATED: 'DEVICE_CREATED',
  DEVICE_REMOVED: 'DEVICE_REMOVED',
  DEVICE_POWER_CHANGED: 'DEVICE_POWER_CHANGED',
  DEVICE_STATE_CHANGED: 'DEVICE_STATE_CHANGED',
  DEVICE_CONFIG_CHANGED: 'CONFIG_CHANGED',
  INTERFACE_CHANGED: 'INTERFACE_CHANGED',
  INTERFACE_ADMIN_CHANGED: 'INTERFACE_ADMIN_CHANGED',
  INTERFACE_LINK_CHANGED: 'INTERFACE_LINK_CHANGED',
  INTERFACE_IP_CHANGED: 'INTERFACE_IP_CHANGED',
  INTERFACE_VLAN_CHANGED: 'INTERFACE_VLAN_CHANGED',
  INTERFACE_PEER_CHANGED: 'INTERFACE_PEER_CHANGED',
  ROUTE_CHANGED: 'ROUTE_CHANGED',
  VLAN_CHANGED: 'VLAN_CHANGED',
  CONNECTION_CHANGED: 'CONNECTION_CHANGED',
  SERVICE_CHANGED: 'SERVICE_CHANGED',
  FAULT_INJECTED: 'FAULT_INJECTED',
  FAULT_REMOVED: 'FAULT_REMOVED',
  LOG_CREATED: 'LOG_CREATED',
  STATE_RESET: 'STATE_RESET',
};

export function createDeviceState(deviceDef) {
  const deviceId = deviceDef.deviceId || deviceDef.id;
  if (!deviceId) return null;

  const type = deviceDef.type || inferDeviceType(deviceId);
  const typeConfig = DEVICE_TYPE_CONFIGS[type] || DEVICE_TYPE_CONFIGS.pc;
  const hostname = deviceDef.hostname || deviceId;

  const device = {
    id: deviceId,
    type,
    hostname,
    power: DEVICE_STATES.ON,
    state: 'active',
    mode: 'user',
    currentInterface: null,
    configuration: {},
    interfaces: {},
    vlans: {},
    routes: {},
    services: {},
    configHistory: [],
    stateHistory: [],
  };

  // Seed default interfaces from type config
  typeConfig.defaultInterfaces.forEach((ifaceName) => {
    device.interfaces[ifaceName] = {
      name: ifaceName,
      deviceId,
      ip: 'unassigned',
      mask: '255.255.255.0',
      status: 'down',
      protocol: 'down',
      description: '',
      vlan: 1,
      trunkAllowed: [],
      trunkNativeVlan: 1,
      portSecurity: null,
      dhcpClient: false,
      adminState: typeConfig.defaultAdminState,
      linkState: typeConfig.defaultLinkState,
      connectedPeer: null,
    };
  });

  // Override with deviceDef interfaces if provided
  (deviceDef.interfaces || []).forEach((ifaceDef) => {
    const name = ifaceDef.interfaceName || ifaceDef.name;
    if (!name) return;
    if (!device.interfaces[name]) {
      device.interfaces[name] = { ...DEFAULT_INTERFACE, name, deviceId };
    }
    Object.assign(device.interfaces[name], {
      ip: ifaceDef.ip || 'unassigned',
      mask: ifaceDef.mask || '255.255.255.0',
      status: ifaceDef.status || 'down',
      protocol: ifaceDef.protocol || 'down',
      description: ifaceDef.description || '',
      vlan: ifaceDef.vlan || 1,
      adminState: ifaceDef.adminState || typeConfig.defaultAdminState,
      linkState: ifaceDef.linkState || typeConfig.defaultLinkState,
      connectedPeer: ifaceDef.connectedPeer || null,
    });
    if (ifaceDef.ip && ifaceDef.ip !== 'unassigned') {
      device.interfaces[name].status = 'up';
      device.interfaces[name].protocol = 'up';
    }
  });

  // Seed VLANs if switch
  if (type === 'switch') {
    device.vlans = {
      1: { id: 1, name: 'default', ports: [] },
      10: { id: 10, name: 'sales', ports: [] },
      20: { id: 20, name: 'accounts', ports: [] },
    };
  }

  return device;
}

export function createCanonicalInterface(name, deviceId, overrides = {}) {
  return {
    ...DEFAULT_INTERFACE,
    name,
    deviceId,
    ...overrides,
  };
}

export function createLabRuntimeState(lab, initialState) {
  const state = {
    labId: lab?.id || null,
    sessionId: null,
    status: LAB_STATUS.NOT_STARTED,
    currentStepId: null,
    completedStepIds: [],
    verifiedStepIds: [],
    devices: {},
    connections: {},
    interfaces: {},
    vlans: {},
    routes: {},
    services: {},
    configurations: {},
    logs: [],
    faults: [],
    telemetry: {},
    history: [],
    startedAt: null,
    lastActivityAt: null,
    completedAt: null,
  };

  seedCanonicalStateFromSource(state, lab, initialState);
  return state;
}

export function seedCanonicalStateFromSource(state, lab, initialState) {
  const source = initialState || lab?.initialState || { devices: [] };

  if (!source || !Array.isArray(source.devices)) {
    console.warn('No valid source for seeding canonical state');
    return;
  }

  state.devices = {};
  state.connections = {};
  state.interfaces = {};
  state.vlans = {};
  state.routes = {};
  state.services = {};
  state.configurations = {};

  source.devices.forEach((deviceDef) => {
    const device = createDeviceState(deviceDef);
    if (!device) return;
    state.devices[device.id] = device;

    Object.entries(device.interfaces).forEach(([ifaceName, iface]) => {
      state.interfaces[ifaceName] = iface;
    });

    Object.entries(device.vlans).forEach(([vlanId, vlan]) => {
      state.vlans[vlanId] = vlan;
    });
  });
}

export function getDevice(state, deviceId) {
  return state?.devices?.[deviceId] || null;
}

export function getInterface(state, deviceId, interfaceId) {
  if (!state || !deviceId || !interfaceId) return null;
  return state.devices?.[deviceId]?.interfaces?.[interfaceId] || null;
}

export function getConnections(state) {
  return state?.connections || {};
}

export function getRoutingState(state, deviceId) {
  return state?.devices?.[deviceId]?.routes || {};
}

export function getConfiguration(state, deviceId) {
  return state?.devices?.[deviceId]?.configuration || {};
}

export function getLogs(state) {
  return state?.logs || [];
}

export function getTelemetry(state) {
  return state?.telemetry || {};
}

export function updateDevice(state, deviceId, updater) {
  if (!state || !deviceId || !state.devices[deviceId]) return state;
  const device = state.devices[deviceId];
  const nextDevice = typeof updater === 'function' ? updater(device) : { ...device, ...updater };
  return {
    ...state,
    devices: { ...state.devices, [deviceId]: nextDevice },
    lastActivityAt: Date.now(),
  };
}

export function updateInterface(state, deviceId, interfaceId, updater) {
  if (!state || !deviceId || !interfaceId) return state;
  const device = state.devices?.[deviceId];
  if (!device) return state;
  const current = device.interfaces?.[interfaceId] || { name: interfaceId, deviceId };
  const nextInterface = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
  return {
    ...state,
    devices: {
      ...state.devices,
      [deviceId]: {
        ...device,
        interfaces: { ...(device.interfaces || {}), [interfaceId]: nextInterface },
      },
    },
    lastActivityAt: Date.now(),
  };
}

export function updateConfiguration(state, deviceId, config) {
  if (!state || !deviceId || !state.devices[deviceId]) return state;
  const device = state.devices[deviceId];
  return {
    ...state,
    devices: {
      ...state.devices,
      [deviceId]: { ...device, configuration: { ...(device.configuration || {}), ...config } },
    },
    lastActivityAt: Date.now(),
  };
}

export function updateVlan(state, vlanId, updater) {
  const current = state?.vlans?.[vlanId] || { id: vlanId };
  const nextVlan = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
  return {
    ...state,
    vlans: { ...(state?.vlans || {}), [vlanId]: nextVlan },
    lastActivityAt: Date.now(),
  };
}

export function updateRoute(state, deviceId, routeKey, route) {
  if (!state || !deviceId || !state.devices[deviceId]) return state;
  const device = state.devices[deviceId];
  return {
    ...state,
    devices: {
      ...state.devices,
      [deviceId]: { ...device, routes: { ...(device.routes || {}), [routeKey]: route } },
    },
    lastActivityAt: Date.now(),
  };
}

export function updateConnection(state, connectionId, updater) {
  const current = state?.connections?.[connectionId] || { id: connectionId };
  const nextConnection = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
  return {
    ...state,
    connections: { ...(state?.connections || {}), [connectionId]: nextConnection },
    lastActivityAt: Date.now(),
  };
}

export function addLog(state, entry) {
  const logEntry = { timestamp: Date.now(), ...entry };
  return {
    ...state,
    logs: [...(state?.logs || []), logEntry],
    lastActivityAt: Date.now(),
  };
}

export function updateTelemetry(state, patch) {
  return {
    ...state,
    telemetry: { ...(state?.telemetry || {}), ...patch },
    lastActivityAt: Date.now(),
  };
}

export function pushHistory(state, action, details = '') {
  const entry = { timestamp: Date.now(), action, details };
  return {
    ...state,
    history: [...(state?.history || []), entry],
    lastActivityAt: Date.now(),
  };
}

export function resetLabState(state, labId) {
  return {
    ...createLabRuntimeState({ id: labId || state?.labId }, null),
    status: LAB_STATUS.RESET,
    startedAt: null,
    lastActivityAt: Date.now(),
  };
}

export function serializeState(state) {
  if (!state) return null;
  return JSON.parse(JSON.stringify(state));
}

export function validateLabRuntimeState(state) {
  const errors = [];
  if (!state) return ['State is null/undefined'];
  if (!state.labId) errors.push('Missing labId');
  if (!state.devices || typeof state.devices !== 'object') errors.push('Missing devices');
  if (state.history && !Array.isArray(state.history)) errors.push('History must be an array');
  if (state.logs && !Array.isArray(state.logs)) errors.push('Logs must be an array');
  return errors;
}

export function createSnapshot(state) {
  return serializeState(state);
}

function inferDeviceType(name) {
  if (!name) return 'pc';
  const lower = String(name).toLowerCase();
  if (lower.startsWith('r')) return 'router';
  if (lower.startsWith('sw') || lower.startsWith('switch')) return 'switch';
  if (lower.startsWith('fw') || lower.includes('firewall')) return 'firewall';
  if (lower.includes('server')) return 'server';
  if (lower.includes('ap') || lower.includes('access')) return 'accessPoint';
  if (lower.includes('cloud')) return 'cloud';
  return 'pc';
}

export default {
  LAB_STATUS,
  DEVICE_STATES,
  ADMIN_STATES,
  LINK_STATES,
  DEVICE_TYPE_CONFIGS,
  DEFAULT_INTERFACE,
  ACTION_TYPES,
  createLabRuntimeState,
  createDeviceState,
  createCanonicalInterface,
  getLabState: (state) => state,
  getDevice,
  getInterface,
  getConnections,
  getRoutingState,
  getConfiguration,
  getLogs,
  getTelemetry,
  updateDevice,
  updateInterface,
  updateConfiguration,
  updateVlan,
  updateRoute,
  updateConnection,
  addLog,
  updateTelemetry,
  pushHistory,
  resetLabState,
  serializeState,
  validateLabRuntimeState,
  createSnapshot,
};