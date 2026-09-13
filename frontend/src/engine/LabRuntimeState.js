export const LAB_RUNTIME_EVENTS = {
  DEVICE_CONFIG_CHANGED: 'DEVICE_CONFIG_CHANGED',
  DEVICE_STATE_CHANGED: 'DEVICE_STATE_CHANGED',
  INTERFACE_CHANGED: 'INTERFACE_CHANGED',
  LINK_CHANGED: 'LINK_CHANGED',
  IP_CHANGED: 'IP_CHANGED',
  ROUTE_CHANGED: 'ROUTE_CHANGED',
  VLAN_CHANGED: 'VLAN_CHANGED',
  SERVICE_CHANGED: 'SERVICE_CHANGED',
  FAULT_INJECTED: 'FAULT_INJECTED',
  FAULT_REMOVED: 'FAULT_REMOVED',
  LOG_CREATED: 'LOG_CREATED',
  RESET: 'RESET',
};

export const STATE_OWNERSHIP = {
  CANONICAL: 'canonical',
  DERIVED: 'derived',
  UI_ONLY: 'ui_only',
  TRANSPORT: 'transport',
};

export const STATE_SOURCES = {
  LAB_DEFINITION: 'lab_definition',
  NETWORK_SIMULATION: 'network_simulation',
  USER_INPUT: 'user_input',
  VERIFICATION_RESULT: 'verification_result',
  TROUBLESHOOTING: 'troubleshooting',
};

export function createLabRuntimeState(lab, initialState) {
  const state = {
    labId: lab?.id || null,
    _lab: lab,
    sessionId: null,
    status: 'NOT_STARTED',
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
    startedAt: Date.now(),
    lastActivityAt: Date.now(),
    completedAt: null,
  };

  seedCanonicalStateFromSource(state, lab, initialState);
  
  return state;
}

export function seedCanonicalStateFromSource(state, lab, initialState) {
  const source = initialState?.devices ? initialState : (lab?.initialState || { devices: [] });
  
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
    const deviceId = deviceDef.deviceId || deviceDef.id;
    if (!deviceId) return;
    
    state.devices[deviceId] = {
      id: deviceId,
      type: deviceDef.type || inferDeviceType(deviceId),
      hostname: deviceDef.hostname || deviceId,
      interfaces: {},
      vlans: {},
      routes: {},
      services: {},
      configuration: {},
      mode: 'user',
      currentInterface: null,
    };
    
    (deviceDef.interfaces || []).forEach((iface) => {
      const name = iface.interfaceName || iface.name;
      if (!name) return;
      
      state.interfaces[name] = {
        ...iface,
        deviceId,
        name,
      };
      
      state.devices[deviceId].interfaces[name] = iface;
    });
  });
  
  console.log(`Canonical state seeded: ${Object.keys(state.devices).length} devices, ${Object.keys(state.interfaces).length} interfaces`);
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

export function validateLabRuntimeState(state) {
  const errors = [];
  if (!state) return ['State is null/undefined'];
  if (!state.labId) errors.push('Missing labId');
  if (!state.devices || typeof state.devices !== 'object') errors.push('Missing devices');
  if (!state.interfaces || typeof state.interfaces !== 'object') errors.push('Missing interfaces');
  if (state.history && !Array.isArray(state.history)) errors.push('History must be an array');
  if (state.logs && !Array.isArray(state.logs)) errors.push('Logs must be an array');
  return errors;
}

export function createSnapshot(state) {
  return JSON.parse(JSON.stringify(state));
}

export function createEvent(eventType, payload, source = STATE_SOURCES.USER_INPUT) {
  return {
    type: eventType,
    timestamp: Date.now(),
    source,
    payload,
  };
}

export function applyStateEvent(state, event) {
  const newState = JSON.parse(JSON.stringify(state));
  const { type, payload } = event;
  
  switch (type) {
    case LAB_RUNTIME_EVENTS.DEVICE_CONFIG_CHANGED:
      if (payload.deviceId && payload.config) {
        if (!newState.devices[payload.deviceId]) {
          newState.devices[payload.deviceId] = {
            id: payload.deviceId,
            type: inferDeviceType(payload.deviceId),
            hostname: payload.deviceId,
            interfaces: {},
            vlans: {},
            routes: {},
            services: {},
            configuration: {},
            mode: 'user',
            currentInterface: null,
          };
        }
        newState.devices[payload.deviceId].configuration = payload.config;
        newState.configurations[payload.deviceId] = payload.config;
      }
      break;
      
    case LAB_RUNTIME_EVENTS.DEVICE_STATE_CHANGED:
      if (payload.deviceId && payload.device) {
        const src = payload.device;
        if (!newState.devices[payload.deviceId]) {
          newState.devices[payload.deviceId] = {
            id: payload.deviceId,
            type: src.type || inferDeviceType(payload.deviceId),
            hostname: src.hostname || payload.deviceId,
            interfaces: {},
            vlans: {},
            routes: {},
            services: {},
            configuration: {},
            mode: src.mode || 'user',
            currentInterface: src.currentInterface || null,
          };
        }
        const nextDevice = { ...newState.devices[payload.deviceId] };
        nextDevice.hostname = src.hostname || nextDevice.hostname;
        nextDevice.mode = src.mode || nextDevice.mode;
        nextDevice.currentInterface = src.currentInterface ?? nextDevice.currentInterface;
        nextDevice.interfaces = { ...(nextDevice.interfaces || {}) };
        nextDevice.vlans = { ...(src.vlans || nextDevice.vlans || {}) };
        nextDevice.routes = { ...(nextDevice.routes || {}) };
        if (src.routing?.staticRoutes) {
          src.routing.staticRoutes.forEach((route, idx) => {
            nextDevice.routes[`static_${idx}`] = { ...route };
          });
        }
        newState.devices[payload.deviceId] = nextDevice;
        newState.configurations[payload.deviceId] = src.configHistory?.length ? { lastCommand: src.configHistory[src.configHistory.length - 1]?.cmd } : (newState.configurations[payload.deviceId] || {});
        
        const nextInterfaces = { ...(newState.interfaces || {}) };
        Object.entries(src.interfaces || {}).forEach(([name, iface]) => {
          nextDevice.interfaces[name] = { ...iface };
          nextInterfaces[name] = { ...iface, deviceId: payload.deviceId, name };
        });
        newState.interfaces = nextInterfaces;
      }
      break;
      
    case LAB_RUNTIME_EVENTS.INTERFACE_CHANGED:
      if (payload.interfaceName && payload.deviceId && payload.updates) {
        newState.interfaces[payload.interfaceName] = {
          ...(newState.interfaces[payload.interfaceName] || {}),
          ...payload.updates,
          deviceId: payload.deviceId,
          name: payload.interfaceName,
        };
        if (newState.devices[payload.deviceId]?.interfaces) {
          newState.devices[payload.deviceId].interfaces[payload.interfaceName] = {
            ...(newState.devices[payload.deviceId].interfaces[payload.interfaceName] || {}),
            ...payload.updates,
          };
        }
      }
      break;
      
    case LAB_RUNTIME_EVENTS.LINK_CHANGED:
      if (payload.connectionId && payload.connection) {
        newState.connections[payload.connectionId] = payload.connection;
      }
      break;
      
    case LAB_RUNTIME_EVENTS.IP_CHANGED:
      if (payload.interfaceName && payload.ip && payload.mask && payload.deviceId) {
        const iface = newState.interfaces[payload.interfaceName];
        if (iface) {
          iface.ip = payload.ip;
          iface.mask = payload.mask;
          if (newState.devices[payload.deviceId]?.interfaces[payload.interfaceName]) {
            newState.devices[payload.deviceId].interfaces[payload.interfaceName].ip = payload.ip;
            newState.devices[payload.deviceId].interfaces[payload.interfaceName].mask = payload.mask;
          }
        }
      }
      break;
      
    case LAB_RUNTIME_EVENTS.VLAN_CHANGED:
      if (payload.vlanId && payload.vlan) {
        newState.vlans[payload.vlanId] = payload.vlan;
      }
      break;
      
    case LAB_RUNTIME_EVENTS.ROUTE_CHANGED:
      if (payload.deviceId && payload.routeKey && payload.route) {
        if (!newState.devices[payload.deviceId]) {
          newState.devices[payload.deviceId] = {
            id: payload.deviceId,
            type: inferDeviceType(payload.deviceId),
            hostname: payload.deviceId,
            interfaces: {},
            vlans: {},
            routes: {},
            services: {},
            configuration: {},
            mode: 'user',
            currentInterface: null,
          };
        }
        newState.devices[payload.deviceId].routes = { ...newState.devices[payload.deviceId].routes, [payload.routeKey]: payload.route };
      }
      break;
      
    case LAB_RUNTIME_EVENTS.SERVICE_CHANGED:
      if (payload.serviceId && payload.service) {
        newState.services[payload.serviceId] = payload.service;
      }
      break;
      
    case LAB_RUNTIME_EVENTS.FAULT_INJECTED:
      newState.faults.push(payload);
      break;
      
    case LAB_RUNTIME_EVENTS.FAULT_REMOVED: {
      const faultIndex = newState.faults.findIndex(f => f.id === payload.id);
      if (faultIndex >= 0) {
        newState.faults.splice(faultIndex, 1);
      }
      break;
    }
      
    case LAB_RUNTIME_EVENTS.LOG_CREATED:
      newState.logs.push({ timestamp: Date.now(), ...payload });
      break;
      
    case LAB_RUNTIME_EVENTS.RESET:
      break;
      
    default:
      console.warn(`Unknown event type: ${type}`);
  }
  
  // Keep activity ordering monotonic even when multiple events share a clock tick.
  newState.lastActivityAt = Math.max(Date.now(), state.lastActivityAt + 1);
  return newState;
}

export function resetLabState(state, labId) {
  const lab = state._lab || { id: labId };
  const newState = {
    labId: lab.id,
    _lab: lab,
    sessionId: null,
    status: 'RESET',
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
  seedCanonicalStateFromSource(newState, lab, lab.initialState);
  return newState;
}

export default {
  LAB_RUNTIME_EVENTS,
  STATE_OWNERSHIP,
  STATE_SOURCES,
  createLabRuntimeState,
  seedCanonicalStateFromSource,
  validateLabRuntimeState,
  createSnapshot,
  createEvent,
  applyStateEvent,
  resetLabState,
}