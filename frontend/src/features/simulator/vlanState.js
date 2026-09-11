// VLAN State Management

export function createVlanState() {
  return {
    vlans: { 1: { id: 1, name: 'default', ports: [] } },
    trunks: {},
  };
}

export function createVlan(vlanState, vlanId, name = null) {
  const id = parseInt(vlanId, 10);
  if (isNaN(id) || id < 1 || id > 4094) return false;
  
  if (!vlanState.vlans[id]) {
    vlanState.vlans[id] = {
      id,
      name: name || `VLAN${id}`,
      ports: [],
    };
    return true;
  }
  return false;
}

export function deleteVlan(vlanState, vlanId) {
  const id = parseInt(vlanId, 10);
  if (id === 1) return false; // Cannot delete default VLAN
  delete vlanState.vlans[id];
  return true;
}

export function setVlanName(vlanState, vlanId, name) {
  const id = parseInt(vlanId, 10);
  if (vlanState.vlans[id]) {
    vlanState.vlans[id].name = name;
    return true;
  }
  return false;
}

export function assignPortToVlan(vlanState, vlanId, interfaceName) {
  const id = parseInt(vlanId, 10);
  if (vlanState.vlans[id]) {
    if (!vlanState.vlans[id].ports.includes(interfaceName)) {
      vlanState.vlans[id].ports.push(interfaceName);
    }
    return true;
  }
  return false;
}

export function removePortFromVlan(vlanState, vlanId, interfaceName) {
  const id = parseInt(vlanId, 10);
  if (vlanState.vlans[id]) {
    vlanState.vlans[id].ports = vlanState.vlans[id].ports.filter(p => p !== interfaceName);
    return true;
  }
  return false;
}

export function createTrunk(vlanState, interfaceName, allowedVlans = [], nativeVlan = 1) {
  vlanState.trunks[interfaceName] = {
    allowed: allowedVlans.length === 0 ? 'all' : allowedVlans.map(v => parseInt(v, 10)),
    native: parseInt(nativeVlan, 10),
  };
  return true;
}

export function setTrunkAllowed(vlanState, interfaceName, vlans) {
  if (vlanState.trunks[interfaceName]) {
    vlanState.trunks[interfaceName].allowed = vlans === 'all' ? 'all' : vlans.map(v => parseInt(v, 10));
    return true;
  }
  return false;
}

export function setTrunkNative(vlanState, interfaceName, nativeVlan) {
  if (vlanState.trunks[interfaceName]) {
    vlanState.trunks[interfaceName].native = parseInt(nativeVlan, 10);
    return true;
  }
  return false;
}

export function getVlanInfo(vlanState, vlanId) {
  const id = parseInt(vlanId, 10);
  return vlanState.vlans[id] || null;
}

export function getAllVlans(vlanState) {
  return Object.values(vlanState.vlans).sort((a, b) => a.id - b.id);
}

export function getTrunkInfo(vlanState, interfaceName) {
  return vlanState.trunks[interfaceName] || null;
}

export default {
  createVlanState,
  createVlan,
  deleteVlan,
  setVlanName,
  assignPortToVlan,
  removePortFromVlan,
  createTrunk,
  setTrunkAllowed,
  setTrunkNative,
  getVlanInfo,
  getAllVlans,
  getTrunkInfo,
};