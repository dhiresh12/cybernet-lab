// Device State Management - Canonical device state utilities
import { CLI_MODES, DEFAULT_INTERFACE } from '../../core/constants';
import { DEVICE_STATES, ADMIN_STATES, LINK_STATES, DEVICE_TYPE_CONFIGS } from '../../core/constants/deviceStates.js';
import { createDeviceState as createCanonicalDeviceState } from '../../engine/LabStateEngine.js';

export function createDeviceState({ name = '', type = 'router', hostname } = {}) {
  return createCanonicalDeviceState({
    deviceId: name || '',
    id: name || '',
    type,
    hostname,
  });
}

export function ensureInterface(device, ifaceName) {
  if (!device.interfaces[ifaceName]) {
    device.interfaces[ifaceName] = { ...DEFAULT_INTERFACE, name: ifaceName };
  }
  return device.interfaces[ifaceName];
}

export function getCurrentInterface(device) {
  return device.currentInterface || 'Gi0/0';
}

export function setInterfaceStatus(device, ifaceName, status) {
  const iface = ensureInterface(device, ifaceName);
  iface.status = status;
  iface.protocol = status === 'up' ? 'up' : 'down';
  iface.linkState = status === 'up' ? LINK_STATES.UP : LINK_STATES.DOWN;
}

export function setInterfaceIp(device, ifaceName, ip, mask) {
  const iface = ensureInterface(device, ifaceName);
  iface.ip = ip;
  iface.mask = mask;
}

export function setInterfaceAdminState(device, ifaceName, adminState) {
  const iface = ensureInterface(device, ifaceName);
  iface.adminState = adminState;
  if (adminState === ADMIN_STATES.SHUTDOWN) {
    iface.status = 'down';
    iface.protocol = 'down';
    iface.linkState = LINK_STATES.DOWN;
  }
}

export function setInterfaceLinkState(device, ifaceName, linkState) {
  const iface = ensureInterface(device, ifaceName);
  iface.linkState = linkState;
}

export function setInterfacePeer(device, ifaceName, peer) {
  const iface = ensureInterface(device, ifaceName);
  iface.connectedPeer = peer;
}

export function addToConfigHistory(device, command) {
  device.configHistory.push({
    command,
    timestamp: Date.now(),
    mode: device.mode,
  });
}

export function addToStateHistory(device, change) {
  device.stateHistory.push({
    ...change,
    timestamp: Date.now(),
  });
}

export function getDevicePrompt(device) {
  switch (device.mode) {
    case CLI_MODES.ENABLE: return `${device.hostname}# `;
    case CLI_MODES.CONFIG: return `${device.hostname}(config)# `;
    case CLI_MODES.INTERFACE: return `${device.hostname}(config-if)# `;
    case CLI_MODES.ACL: return `${device.hostname}(config-ext)# `;
    case CLI_MODES.DHCP: return `${device.hostname}(config-dhcp)# `;
    default: return `${device.hostname}> `;
  }
}

export function defaultDeviceState({ name = '', type = 'router', hostname } = {}) {
  return createCanonicalDeviceState({
    deviceId: name || '',
    id: name || '',
    type,
    hostname,
  });
}

export const DEVICE_STATES_EXPORT = DEVICE_STATES;
export const ADMIN_STATES_EXPORT = ADMIN_STATES;
export const LINK_STATES_EXPORT = LINK_STATES;

export default {
  createDeviceState,
  ensureInterface,
  getCurrentInterface,
  setInterfaceStatus,
  setInterfaceIp,
  setInterfaceAdminState,
  setInterfaceLinkState,
  setInterfacePeer,
  addToConfigHistory,
  addToStateHistory,
  getDevicePrompt,
  defaultDeviceState,
  DEVICE_STATES: DEVICE_STATES_EXPORT,
  ADMIN_STATES: ADMIN_STATES_EXPORT,
  LINK_STATES: LINK_STATES_EXPORT,
};