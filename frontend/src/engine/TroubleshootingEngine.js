export const TROUBLESHOOT_FAULTS = {
  WRONG_IP: 'wrong-ip',
  WRONG_MASK: 'wrong-mask',
  WRONG_GATEWAY: 'wrong-gateway',
  INTERFACE_DOWN: 'interface-down',
  WRONG_VLAN: 'wrong-vlan',
  TRUNK_MISMATCH: 'trunk-mismatch',
  MISSING_ROUTE: 'missing-route',
  WRONG_STATIC_ROUTE: 'wrong-static-route',
  ROUTING_FAILURE: 'routing-failure',
  ACL_BLOCKING: 'acl-blocking',
  WRONG_NAT: 'wrong-nat',
  DHCP_FAILURE: 'dhcp-failure',
  DNS_PROBLEM: 'dns-problem',
  DUPLICATE_IP: 'duplicate-ip',
  BROKEN_LINK: 'broken-link',
  WRONG_CABLE: 'wrong-cable',
  SSH_PROBLEM: 'ssh-problem',
  PORT_SECURITY_VIOLATION: 'port-security-violation',
};

export const PACKET_STATES = {
  FORWARDED: 'FORWARDED',
  DROPPED: 'DROPPED',
  BLOCKED: 'BLOCKED',
  NO_ROUTE: 'NO_ROUTE',
  INTERFACE_DOWN: 'INTERFACE_DOWN',
  VLAN_ERROR: 'VLAN_ERROR',
  ACL_BLOCKED: 'ACL_BLOCKED',
};

export const HINTS = {
  HINT_1: 'HINT_1',
  HINT_2: 'HINT_2',
  HINT_3: 'HINT_3',
};

export function createScenario(config) {
  return {
    id: config.id || `scenario-${Date.now()}`,
    name: config.name || 'Troubleshooting Scenario',
    description: config.description || 'Identify and fix the network fault.',
    faultType: config.faultType,
    source: config.source,
    destination: config.destination,
    path: config.path || [],
    faultDevice: config.faultDevice,
    faultInterface: config.faultInterface,
    faultDetails: config.faultDetails || {},
    hints: config.hints || [
      'Check the configuration of devices along the path.',
      'Use show commands to inspect device state.',
      'The fault is on the device that is not forwarding traffic correctly.',
    ],
    solution: config.solution || 'Fix the configuration issue.',
    expectedDiagnosis: config.expectedDiagnosis || null,
  };
}

const SCENARIOS = [
  createScenario({
    id: 'tshoot-wrong-ip',
    name: 'Wrong IP Address',
    description: 'PC1 cannot reach Server1. Check IP configuration.',
    faultType: TROUBLESHOOT_FAULTS.WRONG_IP,
    source: 'PC1',
    destination: 'Server1',
    faultDevice: 'PC1',
    faultInterface: 'Gi0/0',
    faultDetails: { wrongIp: '10.0.0.10', correctIp: '192.168.1.10', mask: '255.255.255.0' },
    hints: [
      'Check the IP address on PC1 with "show ip interface brief".',
      'PC1 IP should be in the 192.168.1.0/24 subnet, not 10.0.0.0/24.',
      'Change PC1 IP to 192.168.1.10 with mask 255.255.255.0.',
    ],
    solution: 'Configure PC1 with IP 192.168.1.10 mask 255.255.255.0.',
    expectedDiagnosis: 'PC1 has wrong IP address — not in same subnet as Server1.',
  }),
  createScenario({
    id: 'tshoot-interface-down',
    name: 'Interface Shutdown',
    description: 'PC1 cannot reach Server1. An interface is administratively down.',
    faultType: TROUBLESHOOT_FAULTS.INTERFACE_DOWN,
    source: 'PC1',
    destination: 'Server1',
    faultDevice: 'R1',
    faultInterface: 'Gi0/0',
    faultDetails: {},
    hints: [
      'Check interface status on R1 with "show ip interface brief".',
      'The Gi0/0 interface on R1 is down. Use "no shutdown" to enable it.',
      'Bring the interface up with "no shutdown".',
    ],
    solution: 'Run "no shutdown" on R1 Gi0/0.',
    expectedDiagnosis: 'R1 Gi0/0 is shutdown.',
  }),
  createScenario({
    id: 'tshoot-wrong-vlan',
    name: 'Wrong VLAN',
    description: 'PC1 cannot communicate with Server1. VLAN mismatch on switch.',
    faultType: TROUBLESHOOT_FAULTS.WRONG_VLAN,
    source: 'PC1',
    destination: 'Server1',
    faultDevice: 'SW1',
    faultInterface: 'Fa0/1',
    faultDetails: { wrongVlan: 10, correctVlan: 1 },
    hints: [
      'Check VLAN configuration with "show vlan brief".',
      'PC1 is on VLAN 10 but Server1 is on VLAN 1.',
      'Change PC1 access VLAN to 1.',
    ],
    solution: 'Configure SW1 Fa0/1 access vlan 1.',
    expectedDiagnosis: 'PC1 is on wrong VLAN (10 instead of 1).',
  }),
  createScenario({
    id: 'tshoot-missing-route',
    name: 'Missing Route',
    description: 'PC1 cannot reach remote network 10.0.0.0. Missing static route.',
    faultType: TROUBLESHOOT_FAULTS.MISSING_ROUTE,
    source: 'PC1',
    destination: '10.0.0.10',
    faultDevice: 'R1',
    faultInterface: null,
    faultDetails: { missingDest: '10.0.0.0', missingMask: '255.255.255.0', nextHop: '192.168.1.2' },
    hints: [
      'Check routing table on R1 with "show ip route".',
      'R1 has no route to 10.0.0.0/24.',
      'Add static route: ip route 10.0.0.0 255.255.255.0 192.168.1.2.',
    ],
    solution: 'Add static route to R1.',
    expectedDiagnosis: 'R1 missing route to 10.0.0.0/24.',
  }),
  createScenario({
    id: 'tshoot-wrong-static-route',
    name: 'Wrong Static Route',
    description: 'PC1 cannot reach 10.0.0.0. Static route points to wrong next-hop.',
    faultType: TROUBLESHOOT_FAULTS.WRONG_STATIC_ROUTE,
    source: 'PC1',
    destination: '10.0.0.10',
    faultDevice: 'R1',
    faultInterface: null,
    faultDetails: { wrongNextHop: '192.168.2.1', correctNextHop: '192.168.1.2' },
    hints: [
      'Check routing table with "show ip route".',
      'Static route points to wrong next-hop 192.168.2.1.',
      'Correct next-hop should be 192.168.1.2.',
    ],
    solution: 'Fix static route next-hop to 192.168.1.2.',
    expectedDiagnosis: 'Wrong next-hop in static route.',
  }),
  createScenario({
    id: 'tshoot-acl-blocking',
    name: 'ACL Blocking Traffic',
    description: 'PC1 cannot ping Server1. ACL is denying traffic.',
    faultType: TROUBLESHOOT_FAULTS.ACL_BLOCKING,
    source: 'PC1',
    destination: 'Server1',
    faultDevice: 'R1',
    faultInterface: 'Gi0/0',
    faultDetails: { aclName: 'BLOCK-PC1', action: 'deny', protocol: 'ip' },
    hints: [
      'Check ACL configuration with "show access-lists".',
      'ACL BLOCK-PC1 is denying all IP traffic from PC1.',
      'Remove or modify the ACL to allow traffic.',
    ],
    solution: 'Remove or fix ACL BLOCK-PC1.',
    expectedDiagnosis: 'ACL is blocking traffic from PC1.',
  }),
  createScenario({
    id: 'tshoot-trunk-mismatch',
    name: 'Trunk Mismatch',
    description: 'VLAN traffic not passing between SW1 and SW2. Trunk mismatch.',
    faultType: TROUBLESHOOT_FAULTS.TRUNK_MISMATCH,
    source: 'PC1',
    destination: 'Server1',
    faultDevice: 'SW1',
    faultInterface: 'Gi0/1',
    faultDetails: { allowedVlans: [10], missingVlan: 20 },
    hints: [
      'Check trunk with "show interfaces trunk".',
      'SW1 Gi0/1 only allows VLAN 10 on trunk.',
      'Add VLAN 20 to trunk allowed list.',
    ],
    solution: 'Configure switchport trunk allowed vlan 10,20.',
    expectedDiagnosis: 'Trunk not allowing required VLAN.',
  }),
  createScenario({
    id: 'tshoot-dhcp-failure',
    name: 'DHCP Failure',
    description: 'PC1 did not receive IP from DHCP. DHCP pool misconfigured.',
    faultType: TROUBLESHOOT_FAULTS.DHCP_FAILURE,
    source: 'PC1',
    destination: null,
    faultDevice: 'R1',
    faultInterface: null,
    faultDetails: { poolName: 'LAN', network: '10.0.0.0', correctNetwork: '192.168.1.0' },
    hints: [
      'Check DHCP pool with "show ip dhcp binding".',
      'DHCP pool network is 10.0.0.0 but LAN is 192.168.1.0.',
      'Fix DHCP pool network to 192.168.1.0.',
    ],
    solution: 'Fix DHCP pool network to 192.168.1.0.',
    expectedDiagnosis: 'DHCP pool network mismatch.',
  }),
  createScenario({
    id: 'tshoot-dns-problem',
    name: 'DNS Configuration Problem',
    description: 'PC1 cannot resolve server name. DNS server not configured.',
    faultType: TROUBLESHOOT_FAULTS.DNS_PROBLEM,
    source: 'PC1',
    destination: 'server1.local',
    faultDevice: 'PC1',
    faultInterface: null,
    faultDetails: { missingDns: '192.168.1.2' },
    hints: [
      'Check DNS configuration on PC1.',
      'PC1 has no DNS server configured.',
      'Set DNS server to 192.168.1.2.',
    ],
    solution: 'Configure DNS server on PC1.',
    expectedDiagnosis: 'PC1 missing DNS server configuration.',
  }),
  createScenario({
    id: 'tshoot-duplicate-ip',
    name: 'Duplicate IP Address',
    description: 'PC1 has IP conflicts. Another device uses same IP.',
    faultType: TROUBLESHOOT_FAULTS.DUPLICATE_IP,
    source: 'PC1',
    destination: 'Server1',
    faultDevice: 'PC2',
    faultInterface: 'Gi0/0',
    faultDetails: { duplicateIp: '192.168.1.100' },
    hints: [
      'Check ARP table with "show arp" for duplicate MACs.',
      'Two devices have IP 192.168.1.100.',
      'Change PC2 IP to a unique address.',
    ],
    solution: 'Change PC2 to a unique IP.',
    expectedDiagnosis: 'Duplicate IP 192.168.1.100 on network.',
  }),
  createScenario({
    id: 'tshoot-broken-link',
    name: 'Broken Link',
    description: 'PC1 cannot reach Server1. Physical link is down.',
    faultType: TROUBLESHOOT_FAULTS.BROKEN_LINK,
    source: 'PC1',
    destination: 'Server1',
    faultDevice: 'SW1',
    faultInterface: 'Fa0/1',
    faultDetails: {},
    hints: [
      'Check interface status with "show interfaces".',
      'Fa0/1 on SW1 is down — check cable.',
      'Replace or reconnect the cable on Fa0/1.',
    ],
    solution: 'Fix cable on SW1 Fa0/1.',
    expectedDiagnosis: 'Physical link down on SW1 Fa0/1.',
  }),
  createScenario({
    id: 'tshoot-ssh-problem',
    name: 'SSH Configuration Problem',
    description: 'Cannot SSH to R1. SSH not properly configured.',
    faultType: TROUBLESHOOT_FAULTS.SSH_PROBLEM,
    source: 'PC1',
    destination: 'R1',
    faultDevice: 'R1',
    faultInterface: null,
    faultDetails: { missingDomain: true },
    hints: [
      'Check SSH status with "show ip ssh".',
      'RSA keys not generated — domain-name missing.',
      'Configure domain-name and generate RSA keys.',
    ],
    solution: 'Set domain-name and generate RSA keys on R1.',
    expectedDiagnosis: 'SSH not enabled — missing domain/keys.',
  }),
  createScenario({
    id: 'tshoot-port-security',
    name: 'Port Security Violation',
    description: 'PC1 cannot communicate. Port security violation on switch.',
    faultType: TROUBLESHOOT_FAULTS.PORT_SECURITY_VIOLATION,
    source: 'PC1',
    destination: 'Server1',
    faultDevice: 'SW1',
    faultInterface: 'Fa0/1',
    faultDetails: { violation: 'shutdown', macAddress: 'aaaa.bbbb.cccc' },
    hints: [
      'Check port security with "show port-security address".',
      'Fa0/1 has port security violation — interface in err-disabled.',
      'Clear port security or fix MAC address.',
    ],
    solution: 'Clear port security violation on SW1 Fa0/1.',
    expectedDiagnosis: 'Port security violation on Fa0/1.',
  }),
  createScenario({
    id: 'tshoot-wrong-mask',
    name: 'Wrong Subnet Mask',
    description: 'PC1 cannot reach Server1. Wrong subnet mask.',
    faultType: TROUBLESHOOT_FAULTS.WRONG_MASK,
    source: 'PC1',
    destination: 'Server1',
    faultDevice: 'PC1',
    faultInterface: 'Gi0/0',
    faultDetails: { wrongMask: '255.255.0.0', correctMask: '255.255.255.0' },
    hints: [
      'Check interface configuration with "show ip interface brief".',
      'PC1 mask is 255.255.0.0 — should be 255.255.255.0.',
      'Fix mask to 255.255.255.0.',
    ],
    solution: 'Fix PC1 subnet mask to 255.255.255.0.',
    expectedDiagnosis: 'Wrong subnet mask on PC1.',
  }),
  createScenario({
    id: 'tshoot-wrong-gateway',
    name: 'Wrong Default Gateway',
    description: 'PC1 cannot reach remote networks. Wrong default gateway.',
    faultType: TROUBLESHOOT_FAULTS.WRONG_GATEWAY,
    source: 'PC1',
    destination: '10.0.0.10',
    faultDevice: 'PC1',
    faultInterface: null,
    faultDetails: { wrongGateway: '192.168.2.1', correctGateway: '192.168.1.1' },
    hints: [
      'Check PC1 configuration — default gateway.',
      'Default gateway should be 192.168.1.1 not 192.168.2.1.',
      'Fix default gateway to 192.168.1.1.',
    ],
    solution: 'Set default gateway to 192.168.1.1 on PC1.',
    expectedDiagnosis: 'Wrong default gateway on PC1.',
  }),
  createScenario({
    id: 'tshoot-routing-failure',
    name: 'Routing Protocol Failure',
    description: 'R1 and R2 not exchanging routes. Routing protocol broken.',
    faultType: TROUBLESHOOT_FAULTS.ROUTING_FAILURE,
    source: 'PC1',
    destination: '10.0.0.10',
    faultDevice: 'R2',
    faultInterface: null,
    faultDetails: { protocol: 'OSPF', network: '10.0.0.0' },
    hints: [
      'Check routing protocol status with "show ip ospf neighbor".',
      'R2 has no OSPF neighbors — protocol not enabled.',
      'Enable OSPF on R2.',
    ],
    solution: 'Enable OSPF on R2 with correct network statement.',
    expectedDiagnosis: 'OSPF not enabled on R2.',
  }),
  createScenario({
    id: 'tshoot-wrong-nat',
    name: 'Wrong NAT Configuration',
    description: 'PC1 cannot reach internet. NAT misconfigured.',
    faultType: TROUBLESHOOT_FAULTS.WRONG_NAT,
    source: 'PC1',
    destination: '8.8.8.8',
    faultDevice: 'R1',
    faultInterface: null,
    faultDetails: { wrongInside: 'Gi0/1', correctInside: 'Gi0/0' },
    hints: [
      'Check NAT translations with "show ip nat translations".',
      'NAT inside is on wrong interface.',
      'Fix NAT inside to Gi0/0.',
    ],
    solution: 'Correct NAT inside interface on R1.',
    expectedDiagnosis: 'NAT inside interface misconfigured.',
  }),
  createScenario({
    id: 'tshoot-wrong-cable',
    name: 'Incorrect Cable / Interface',
    description: 'PC1 connected to wrong switch port. Cable on wrong interface.',
    faultType: TROUBLESHOOT_FAULTS.WRONG_CABLE,
    source: 'PC1',
    destination: 'Server1',
    faultDevice: 'SW1',
    faultInterface: 'Fa0/24',
    faultDetails: { correctInterface: 'Fa0/1' },
    hints: [
      'Check which port PC1 is connected to.',
      'PC1 is on Fa0/24 but should be on Fa0/1.',
      'Move cable to Fa0/1.',
    ],
    solution: 'Move PC1 cable to Fa0/1 on SW1.',
    expectedDiagnosis: 'PC1 on wrong switch port.',
  }),
];

export class TroubleshootingEngine {
  constructor() {
    this.scenarios = SCENARIOS;
    this.currentScenario = null;
    this.hintLevel = 0;
    this.packetFlow = [];
    this.failurePoint = null;
    this.rootCause = null;
    this.solved = false;
    this.diagnostics = [];
  }

  getScenarioList() {
    return this.scenarios.map(s => ({ id: s.id, name: s.name, description: s.description, faultType: s.faultType }));
  }

  loadScenario(scenarioId) {
    const scenario = this.scenarios.find(s => s.id === scenarioId);
    if (!scenario) return null;
    this.currentScenario = scenario;
    this.hintLevel = 0;
    this.packetFlow = [];
    this.failurePoint = null;
    this.rootCause = null;
    this.solved = false;
    this.diagnostics = [];
    return scenario;
  }

  injectFault(engine) {
    const s = this.currentScenario;
    if (!s || !engine) return;

    const dev = engine.getDevice(s.faultDevice);
    if (!dev) return;

    switch (s.faultType) {
      case TROUBLESHOOT_FAULTS.WRONG_IP: {
        const iface = s.faultInterface || 'Gi0/0';
        engine.processCommand(s.faultDevice, `interface ${iface}`);
        engine.processCommand(s.faultDevice, `ip address ${s.faultDetails.wrongIp} ${s.faultDetails.mask || '255.255.255.0'}`);
        break;
      }
      case TROUBLESHOOT_FAULTS.WRONG_MASK: {
        const iface = s.faultInterface || 'Gi0/0';
        engine.processCommand(s.faultDevice, `interface ${iface}`);
        engine.processCommand(s.faultDevice, `ip address ${s.faultDetails.wrongIp || '192.168.1.10'} ${s.faultDetails.wrongMask || '255.255.0.0'}`);
        break;
      }
      case TROUBLESHOOT_FAULTS.INTERFACE_DOWN: {
        const iface = s.faultInterface || 'Gi0/0';
        engine.processCommand(s.faultDevice, `interface ${iface}`);
        engine.processCommand(s.faultDevice, 'shutdown');
        break;
      }
      case TROUBLESHOOT_FAULTS.WRONG_VLAN: {
        const iface = s.faultInterface || 'Fa0/1';
        engine.processCommand(s.faultDevice, `interface ${iface}`);
        engine.processCommand(s.faultDevice, `switchport access vlan ${s.faultDetails.wrongVlan || 10}`);
        break;
      }
      case TROUBLESHOOT_FAULTS.MISSING_ROUTE: {
        // Do NOT add the route — the fault is the absence
        break;
      }
      case TROUBLESHOOT_FAULTS.WRONG_STATIC_ROUTE: {
        engine.processCommand(s.faultDevice, `ip route ${s.faultDetails.missingDest || '10.0.0.0'} 255.255.255.0 ${s.faultDetails.wrongNextHop || '192.168.2.1'}`);
        break;
      }
      case TROUBLESHOOT_FAULTS.ACL_BLOCKING: {
        const iface = s.faultInterface || 'Gi0/0';
        engine.processCommand(s.faultDevice, `ip access-list ${s.faultDetails.aclName || 'BLOCK-PC1'}`);
        engine.processCommand(s.faultDevice, 'deny ip any any');
        engine.processCommand(s.faultDevice, `ip access-group ${s.faultDetails.aclName || 'BLOCK-PC1'} in`);
        break;
      }
      case TROUBLESHOOT_FAULTS.TRUNK_MISMATCH: {
        const iface = s.faultInterface || 'Gi0/1';
        engine.processCommand(s.faultDevice, `interface ${iface}`);
        engine.processCommand(s.faultDevice, `switchport trunk allowed vlan ${s.faultDetails.allowedVlans?.join(',') || '10'}`);
        break;
      }
      case TROUBLESHOOT_FAULTS.DHCP_FAILURE: {
        engine.processCommand(s.faultDevice, `ip dhcp pool ${s.faultDetails.poolName || 'LAN'}`);
        engine.processCommand(s.faultDevice, `network ${s.faultDetails.network || '10.0.0.0'} 255.255.0.0`);
        break;
      }
      case TROUBLESHOOT_FAULTS.DUPLICATE_IP: {
        const iface = s.faultInterface || 'Gi0/0';
        engine.processCommand(s.faultDevice, `interface ${iface}`);
        engine.processCommand(s.faultDevice, `ip address ${s.faultDetails.duplicateIp || '192.168.1.100'} 255.255.255.0`);
        break;
      }
      case TROUBLESHOOT_FAULTS.BROKEN_LINK: {
        const iface = s.faultInterface || 'Fa0/1';
        engine.processCommand(s.faultDevice, `interface ${iface}`);
        engine.processCommand(s.faultDevice, 'shutdown');
        break;
      }
      case TROUBLESHOOT_FAULTS.SSH_PROBLEM: {
        engine.processCommand(s.faultDevice, 'ip domain-name example.com');
        engine.processCommand(s.faultDevice, 'crypto key generate rsa modulus 1024');
        engine.processCommand(s.faultDevice, 'ip ssh version 2');
        engine.processCommand(s.faultDevice, 'line vty 0 4');
        engine.processCommand(s.faultDevice, 'transport input ssh');
        engine.processCommand(s.faultDevice, 'login local');
        engine.processCommand(s.faultDevice, 'username admin secret admin123');
        break;
      }
      case TROUBLESHOOT_FAULTS.PORT_SECURITY_VIOLATION: {
        const iface = s.faultInterface || 'Fa0/1';
        engine.processCommand(s.faultDevice, `interface ${iface}`);
        engine.processCommand(s.faultDevice, 'switchport port-security');
        engine.processCommand(s.faultDevice, `switchport port-security mac-address ${s.faultDetails.macAddress || 'aaaa.bbbb.cccc'}`);
        break;
      }
      case TROUBLESHOOT_FAULTS.WRONG_NAT: {
        const iface = s.faultDetails.wrongInside || 'Gi0/1';
        engine.processCommand(s.faultDevice, `interface ${iface}`);
        engine.processCommand(s.faultDevice, 'ip nat inside');
        break;
      }
      case TROUBLESHOOT_FAULTS.ROUTING_FAILURE: {
        engine.processCommand(s.faultDevice, `router ospf 1`);
        engine.processCommand(s.faultDevice, `network 0.0.0.0 255.255.255.255 area 0`);
        break;
      }
      default:
        break;
    }

    this.faultInjected = s.faultType;
  }

  tracePacket(engine, sourceId, destIp) {
    const s = this.currentScenario;
    if (!s || !engine) return [];

    const flow = [];
    const path = s.path.length > 0 ? s.path : this._buildPath(engine, sourceId, destIp);

    for (let i = 0; i < path.length; i++) {
      const deviceId = path[i];
      const dev = engine.getDevice(deviceId);
      if (!dev) {
        flow.push({ deviceId, state: PACKET_STATES.DROPPED, reason: 'Device not found' });
        continue;
      }

      const result = this._checkHop(dev, engine, destIp, i === path.length - 1);
      flow.push({ deviceId, state: result.state, reason: result.reason });

      if (result.state !== PACKET_STATES.FORWARDED) {
        this.failurePoint = deviceId;
        this.rootCause = result.reason;
        break;
      }
    }

    if (flow.length > 0 && flow[flow.length - 1].state === PACKET_STATES.FORWARDED) {
      this.solved = true;
    }

    this.packetFlow = flow;
    return flow;
  }

  _buildPath(engine, sourceId, destIp) {
    const devices = engine.getAllDevices();
    const path = [sourceId];
    const visited = new Set([sourceId]);
    let current = sourceId;

    for (let i = 0; i < 5; i++) {
      const dev = devices[current];
      if (!dev) break;

      const nextHop = dev.routing?.staticRoutes?.find(r => r.dest === destIp || r.dest === '0.0.0.0');
      if (nextHop) {
        const nextDeviceId = this._findDeviceByIp(devices, nextHop.nextHop, visited);
        if (nextDeviceId) {
          path.push(nextDeviceId);
          visited.add(nextDeviceId);
          current = nextDeviceId;
          continue;
        }
      }

      const connected = Object.values(dev.interfaces).find(i => i.ip === destIp && i.status === 'up');
      if (connected) {
        break;
      }

      const upIface = Object.values(dev.interfaces).find(i => i.status === 'up' && i.ip !== 'unassigned');
      if (upIface) {
        const nextDeviceId = this._findDeviceByIp(devices, upIface.ip, visited);
        if (nextDeviceId) {
          path.push(nextDeviceId);
          visited.add(nextDeviceId);
          current = nextDeviceId;
        }
        break;
      }
      break;
    }

    return path;
  }

  _findDeviceByIp(devices, ip, visited) {
    for (const [id, dev] of Object.entries(devices)) {
      if (visited.has(id)) continue;
      for (const [, iface] of Object.entries(dev.interfaces)) {
        if (iface.ip === ip && iface.status === 'up') return id;
      }
    }
    return null;
  }

  _checkHop(dev, engine, destIp, isLast) {
    const upIface = Object.values(dev.interfaces).find(i => i.ip !== 'unassigned' && i.status === 'up');
    if (!upIface) {
      return { state: PACKET_STATES.INTERFACE_DOWN, reason: 'No active interface with IP' };
    }

    if (dev.acl?.applied && Object.keys(dev.acl.applied).length > 0) {
      const applied = dev.acl.applied;
      for (const [iface, config] of Object.entries(applied)) {
        const entry = dev.acl.entries.find(e => e.num === config.name || e.name === config.name);
        if (entry && entry.action === 'deny') {
          return { state: PACKET_STATES.ACL_BLOCKED, reason: `ACL ${config.name} is denying traffic` };
        }
      }
    }

    if (dev.portSecurity && Object.keys(dev.portSecurity).length > 0) {
      for (const [iface, ps] of Object.entries(dev.portSecurity)) {
        if (ps.violation === 'shutdown' && ps.macs && ps.macs.length === 0) {
          return { state: PACKET_STATES.BLOCKED, reason: 'Port security violation — interface err-disabled' };
        }
      }
    }

    if (isLast) {
      if (upIface.ip === destIp) {
        return { state: PACKET_STATES.FORWARDED, reason: 'Packet reached destination' };
      }
    }

    const route = dev.routing?.staticRoutes?.find(r => r.dest === destIp);
    if (!route && isLast === false) {
      const connected = Object.values(dev.interfaces).find(i => i.ip === destIp);
      if (!connected) {
        const hasAnyRoute = dev.routing?.staticRoutes?.length > 0 || dev.routing?.rip || dev.routing?.ospf || dev.routing?.eigrp || dev.routing?.bgp;
        if (!hasAnyRoute) {
          return { state: PACKET_STATES.NO_ROUTE, reason: 'No route to destination' };
        }
      }
    }

    return { state: PACKET_STATES.FORWARDED, reason: 'Packet forwarded successfully' };
  }

  getHint() {
    if (!this.currentScenario) return null;
    if (this.hintLevel >= this.currentScenario.hints.length) return null;
    return { level: this.hintLevel + 1, text: this.currentScenario.hints[this.hintLevel++] };
  }

  getFailurePoint() {
    return { failurePoint: this.failurePoint, rootCause: this.rootCause };
  }

  checkFix(engine) {
    if (!this.currentScenario || !engine) return { solved: false };

    const s = this.currentScenario;
    const sourceDev = engine.getDevice(s.source);
    if (!sourceDev) return { solved: false };

    const flow = this.tracePacket(engine, s.source, s.destination);
    const lastHop = flow[flow.length - 1];

    return {
      solved: lastHop?.state === PACKET_STATES.FORWARDED,
      flow,
      failurePoint: this.failurePoint,
      rootCause: this.rootCause,
    };
  }

  reset() {
    this.currentScenario = null;
    this.hintLevel = 0;
    this.packetFlow = [];
    this.failurePoint = null;
    this.rootCause = null;
    this.solved = false;
    this.diagnostics = [];
  }
}
