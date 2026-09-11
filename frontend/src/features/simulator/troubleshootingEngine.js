// Troubleshooting Engine

export const TROUBLESHOOT_FAULTS = {
  INTERFACE_DOWN: 'interface_down',
  WRONG_IP: 'wrong_ip',
  MISSING_ROUTE: 'missing_route',
  ACL_BLOCK: 'acl_block',
  VLAN_MISMATCH: 'vlan_mismatch',
  STP_BLOCK: 'stp_block',
  ARP_FAILURE: 'arp_failure',
  DHCP_EXHAUSTED: 'dhcp_exhausted',
  NAT_MISMATCH: 'nat_mismatch',
  PORT_SECURITY: 'port_security',
};

export function createTroubleshootingEngine() {
  return {
    scenarios: [],
    currentScenario: null,
    hints: [],
    hintLevel: 0,
  };
}

export function injectFault(engine, faultType, deviceId, params = {}) {
  const fault = {
    type: faultType,
    deviceId,
    params,
    timestamp: Date.now(),
  };
  engine.currentScenario = fault;
  return fault;
}

export function generateTroubleshootingScenario(devices) {
  const deviceIds = Object.keys(devices);
  if (deviceIds.length < 2) return null;
  
  const sourceId = deviceIds[Math.floor(Math.random() * deviceIds.length)];
  const targetId = deviceIds[Math.floor(Math.random() * deviceIds.length)];
  
  if (sourceId === targetId) return null;
  
  const faultTypes = Object.values(TROUBLESHOOT_FAULTS);
  const faultType = faultTypes[Math.floor(Math.random() * faultTypes.length)];
  
  return {
    id: `tshoot-${Date.now()}`,
    sourceId,
    targetId,
    faultType,
    description: getFaultDescription(faultType),
    hints: getFaultHints(faultType),
    solution: getFaultSolution(faultType),
  };
}

function getFaultDescription(faultType) {
  const descriptions = {
    [TROUBLESHOOT_FAULTS.INTERFACE_DOWN]: 'An interface is administratively down',
    [TROUBLESHOOT_FAULTS.WRONG_IP]: 'Incorrect IP address configuration',
    [TROUBLESHOOT_FAULTS.MISSING_ROUTE]: 'Missing route in routing table',
    [TROUBLESHOOT_FAULTS.ACL_BLOCK]: 'Access control list blocking traffic',
    [TROUBLESHOOT_FAULTS.VLAN_MISMATCH]: 'VLAN mismatch between devices',
    [TROUBLESHOOT_FAULTS.STP_BLOCK]: 'Spanning tree blocking port',
    [TROUBLESHOOT_FAULTS.ARP_FAILURE]: 'ARP resolution failure',
    [TROUBLESHOOT_FAULTS.DHCP_EXHAUSTED]: 'DHCP pool exhausted',
    [TROUBLESHOOT_FAULTS.NAT_MISMATCH]: 'NAT configuration mismatch',
    [TROUBLESHOOT_FAULTS.PORT_SECURITY]: 'Port security violation',
  };
  return descriptions[faultType] || 'Unknown fault';
}

function getFaultHints(faultType) {
  const hints = {
    [TROUBLESHOOT_FAULTS.INTERFACE_DOWN]: [
      'Check interface status with "show interfaces"',
      'Verify cable connection',
      'Check for "shutdown" command on interface',
    ],
    [TROUBLESHOOT_FAULTS.WRONG_IP]: [
      'Check IP configuration with "show ip interface brief"',
      'Verify subnet mask matches on both ends',
      'Check for IP address conflicts',
    ],
    [TROUBLESHOOT_FAULTS.MISSING_ROUTE]: [
      'Check routing table with "show ip route"',
      'Verify static routes are configured',
      'Check dynamic routing protocol adjacencies',
    ],
    [TROUBLESHOOT_FAULTS.ACL_BLOCK]: [
      'Check ACLs with "show access-lists"',
      'Verify ACL is applied to correct interface',
      'Check ACL permit/deny rules',
    ],
    [TROUBLESHOOT_FAULTS.VLAN_MISMATCH]: [
      'Check VLAN configuration with "show vlan brief"',
      'Verify trunk allowed VLANs',
      'Check native VLAN mismatch',
    ],
    [TROUBLESHOOT_FAULTS.STP_BLOCK]: [
      'Check spanning tree with "show spanning-tree"',
      'Verify root bridge election',
      'Check for blocked ports',
    ],
    [TROUBLESHOOT_FAULTS.ARP_FAILURE]: [
      'Check ARP table with "show ip arp"',
      'Clear ARP cache and retry',
      'Verify Layer 2 connectivity',
    ],
    [TROUBLESHOOT_FAULTS.DHCP_EXHAUSTED]: [
      'Check DHCP bindings with "show ip dhcp binding"',
      'Verify DHCP pool size',
      'Check for excluded addresses',
    ],
    [TROUBLESHOOT_FAULTS.NAT_MISMATCH]: [
      'Check NAT translations with "show ip nat translations"',
      'Verify inside/outside interfaces',
      'Check NAT pool configuration',
    ],
    [TROUBLESHOOT_FAULTS.PORT_SECURITY]: [
      'Check port security with "show port-security address"',
      'Verify maximum MAC addresses',
      'Check violation mode',
    ],
  };
  return hints[faultType] || ['Check device configuration', 'Verify connectivity', 'Review logs'];
}

function getFaultSolution(faultType) {
  const solutions = {
    [TROUBLESHOOT_FAULTS.INTERFACE_DOWN]: 'Enter interface configuration mode and run "no shutdown"',
    [TROUBLESHOOT_FAULTS.WRONG_IP]: 'Configure correct IP address and subnet mask on the interface',
    [TROUBLESHOOT_FAULTS.MISSING_ROUTE]: 'Add missing static route or fix routing protocol configuration',
    [TROUBLESHOOT_FAULTS.ACL_BLOCK]: 'Modify ACL to permit required traffic or apply to correct interface',
    [TROUBLESHOOT_FAULTS.VLAN_MISMATCH]: 'Ensure matching VLANs on both ends of trunk, check native VLAN',
    [TROUBLESHOOT_FAULTS.STP_BLOCK]: 'Adjust spanning tree priorities or configure portfast on access ports',
    [TROUBLESHOOT_FAULTS.ARP_FAILURE]: 'Clear ARP cache with "clear ip arp" or check Layer 2 connectivity',
    [TROUBLESHOOT_FAULTS.DHCP_EXHAUSTED]: 'Increase DHCP pool size or reduce lease time',
    [TROUBLESHOOT_FAULTS.NAT_MISMATCH]: 'Fix NAT configuration - verify inside/outside and pool addresses',
    [TROUBLESHOOT_FAULTS.PORT_SECURITY]: 'Increase port-security maximum or clear sticky MAC addresses',
  };
  return solutions[faultType] || 'Investigate and resolve the configuration issue';
}

export function getHint(engine) {
  if (!engine.currentScenario) return null;
  const hints = engine.currentScenario.hints;
  if (engine.hintLevel >= hints.length) return null;
  return {
    level: engine.hintLevel + 1,
    text: hints[engine.hintLevel],
    total: hints.length,
  };
}

export function requestHint(engine) {
  const hint = getHint(engine);
  if (hint) {
    engine.hintLevel++;
  }
  return hint;
}

export function resetTroubleshooting(engine) {
  engine.currentScenario = null;
  engine.hintLevel = 0;
}

export function solveTroubleshooting(engine) {
  if (!engine.currentScenario) return null;
  const solution = engine.currentScenario.solution;
  resetTroubleshooting(engine);
  return solution;
}

export function simulatePacketFlow(engine, sourceId, targetId, devices, getRoutingTable) {
  // Delegate to packetEngine
  return { success: false, reason: 'Not implemented' };
}

export default {
  TROUBLESHOOT_FAULTS,
  createTroubleshootingEngine,
  injectFault,
  generateTroubleshootingScenario,
  getHint,
  requestHint,
  resetTroubleshooting,
  solveTroubleshooting,
};