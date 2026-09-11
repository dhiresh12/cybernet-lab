// Interface State Management - Canonical interface state utilities
// Uses LabStateEngine's canonical format as the foundation
import { DEFAULT_INTERFACE, ADMIN_STATES, LINK_STATES } from '../../core/constants';
import { ACTION_TYPES } from '../../engine/LabStateEngine.js';

export function createInterface(name, deviceId) {
  return {
    name,
    deviceId,
    ...DEFAULT_INTERFACE,
  };
}

export function setIpAddress(iface, ip, mask) {
  iface.ip = ip;
  iface.mask = mask;
}

export function setDescription(iface, description) {
  iface.description = description;
  return iface;
}

export function setVlan(iface, vlanId) {
  iface.vlan = parseInt(vlanId, 10);
  return iface;
}

export function setTrunkAllowed(iface, vlans) {
  iface.trunkAllowed = Array.isArray(vlans) ? vlans : vlans.split(',').map(v => parseInt(v.trim(), 10));
  return iface;
}

export function setTrunkNativeVlan(iface, vlanId) {
  iface.trunkNativeVlan = parseInt(vlanId, 10);
  return iface;
}

export function enablePortSecurity(iface, options = {}) {
  iface.portSecurity = {
    enabled: true,
    maximum: options.maximum || 1,
    violation: options.violation || 'shutdown',
    sticky: options.sticky || false,
    macAddress: options.macAddress || null,
  };
  return iface;
}

export function disablePortSecurity(iface) {
  iface.portSecurity = null;
  return iface;
}

export function setBandwidth(iface, bandwidth) {
  iface.bandwidth = bandwidth;
  return iface;
}

export function setDuplex(iface, duplex) {
  iface.duplex = duplex;
  return iface;
}

export function setSpeed(iface, speed) {
  iface.speed = speed;
  return iface;
}

export function getInterfaceStatus(iface) {
  return {
    name: iface.name,
    ip: iface.ip,
    mask: iface.mask,
    status: iface.status,
    protocol: iface.protocol,
    description: iface.description,
    vlan: iface.vlan,
    linkState: iface.linkState,
    adminState: iface.adminState,
    connectedPeer: iface.connectedPeer,
  };
}

export function getInterfaceConfig(iface) {
  return {
    name: iface.name,
    ip: iface.ip,
    mask: iface.mask,
    status: iface.status,
    protocol: iface.protocol,
    description: iface.description,
    vlan: iface.vlan,
    trunkAllowed: iface.trunkAllowed,
    trunkNativeVlan: iface.trunkNativeVlan,
    portSecurity: iface.portSecurity,
    dhcpClient: iface.dhcpClient,
    adminState: iface.adminState,
    linkState: iface.linkState,
    connectedPeer: iface.connectedPeer,
  };
}

export function interfaceExists(iface, interfaceName, deviceId) {
  return iface.name === interfaceName && iface.deviceId === deviceId;
}

export default {
  createInterface,
  setIpAddress,
  setDescription,
  setVlan,
  setTrunkAllowed,
  setTrunkNativeVlan,
  enablePortSecurity,
  disablePortSecurity,
  setBandwidth,
  setDuplex,
  setSpeed,
  getInterfaceStatus,
  getInterfaceConfig,
  interfaceExists,
};