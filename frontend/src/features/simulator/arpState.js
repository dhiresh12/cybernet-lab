// ARP State Management

export function createArpState() {
  return {};
}

export function addArpEntry(arpTable, ip, mac, interfaceName) {
  arpTable[ip] = {
    ip,
    mac: mac.toLowerCase(),
    interface: interfaceName,
    timestamp: Date.now(),
    dynamic: true,
  };
  return arpTable[ip];
}

export function removeArpEntry(arpTable, ip) {
  delete arpTable[ip];
}

export function clearArpTable(arpTable) {
  Object.keys(arpTable).forEach(k => delete arpTable[k]);
}

export function getArpEntry(arpTable, ip) {
  return arpTable[ip] || null;
}

export function getArpTable(arpTable) {
  return Object.values(arpTable);
}

export function findByMac(arpTable, mac) {
  const lowerMac = mac.toLowerCase();
  return Object.values(arpTable).find(e => e.mac === lowerMac) || null;
}

export function findByInterface(arpTable, interfaceName) {
  return Object.values(arpTable).filter(e => e.interface === interfaceName);
}

export function updateArpEntry(arpTable, ip, updates) {
  if (arpTable[ip]) {
    arpTable[ip] = { ...arpTable[ip], ...updates };
    return arpTable[ip];
  }
  return null;
}

export function setStaticArp(arpTable, ip, mac, interfaceName) {
  arpTable[ip] = {
    ip,
    mac: mac.toLowerCase(),
    interface: interfaceName,
    timestamp: Date.now(),
    dynamic: false,
  };
  return arpTable[ip];
}

export default {
  createArpState,
  addArpEntry,
  removeArpEntry,
  clearArpTable,
  getArpEntry,
  getArpTable,
  findByMac,
  findByInterface,
  updateArpEntry,
  setStaticArp,
};