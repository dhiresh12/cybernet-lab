/**
 * Generates lab-specific Packet Tracer hints by analyzing the lab content.
 * This examines the lab's title, category, objectives, scenario, and steps
 * to produce tailored device lists, connections, and IP schemes.
 */

const CATEGORY_DEVICES = {
  Basics: ['PC0', 'PC1', 'Switch0', 'Router0'],
  'Static Routing': ['Router0', 'Router1', 'Switch0', 'Switch1', 'PC0', 'PC1', 'PC2'],
  RIP: ['Router0', 'Router1', 'Router2', 'Switch0', 'Switch1', 'PC0', 'PC1', 'PC2', 'PC3'],
  OSPF: ['Router0', 'Router1', 'Router2', 'R3', 'Switch0', 'Switch1', 'Area Border Router', 'PC0', 'PC1', 'Server0'],
  EIGRP: ['Router0', 'Router1', 'R2', 'Switch0', 'Switch1', 'PC0', 'PC1', 'PC2', 'Server0'],
  BGP: ['Router0', 'BGP-Router1', 'ISP-Router', 'Route Reflector', 'ASBR', 'Switch0', 'PC0', 'Server0'],
  Switching: ['Switch0', 'Switch1', 'Multilayer-Switch', 'PC0', 'PC1', 'PC2', 'PC3', 'Server0', 'DHCP-Server'],
  Services: ['Router0', 'DHCP-Server', 'DNS-Server', 'NAT-Gateway', 'Switch0', 'PC0', 'PC1', 'PC2', 'Web-Server'],
  Security: ['Router0', 'Firewall', 'VPN-Gateway', 'AAA-Server', 'Switch0', 'PC0', 'PC1', 'DMZ-Server', 'IDS'],
  Enterprise: ['Core-Router', 'Distribution-Switch', 'Access-Switch', 'Branch-Router', 'Server-Farm', 'PC0', 'PC1', 'Voice-Server'],
  Routing: ['Router0', 'Router1', 'Switch0', 'Switch1', 'PC0', 'PC1', 'PC2', 'PC3'],
  ISP: ['ISP-Core', 'PE-Router', 'CE-Router', 'BGP-Router', 'Customer-Router', 'Internet-Router', 'Server-Farm'],
  'Data Center': ['Spine-Switch', 'Leaf-Switch', 'Top-of-Rack', 'Server0', 'Server1', 'Storage', 'Load-Balancer'],
  Cloud: ['Cloud-Gateway', 'vRouter', 'vSwitch', 'Virtual-Server', 'Public-Server', 'OnPrem-Router', 'VPN-Tunnel'],
  Automation: ['Controller', 'Router0', 'Router1', 'Switch0', 'Ansible-Host', 'API-Server', 'PC0'],
  Troubleshooting: ['Router0', 'Switch0', 'PC0', 'PC1', 'Faulty-Device', 'Monitoring-Station'],
  Design: ['Core-Router', 'Distribution-Router', 'Access-Switch', 'WAN-Link', 'Server-Farm', 'DMZ-Firewall']
};

const CATEGORY_CONNECTIONS = {
  Basics: [
    'PC0 Fa0 -> Switch0 Fa0/1 (straight-through cable)',
    'PC1 Fa0 -> Switch0 Fa0/2 (straight-through cable)',
    'Switch0 console -> Management PC (rollover cable)'
  ],
  'Static Routing': [
    'Router0 Gi0/0 <-> Router1 Gi0/0 (serial crossover)',
    'Router0 Gi0/1 -> Switch0 Fa0/1',
    'Router1 Gi0/1 -> Switch1 Fa0/1',
    'PC0 Fa0 -> Switch0 Fa0/2',
    'PC1 Fa0 -> Switch1 Fa0/2'
  ],
  RIP: [
    'Router0 S0/0/0 <-> Router1 S0/0/0 (serial)',
    'Router1 S0/0/1 <-> Router2 S0/0/0 (serial)',
    'Router0 Gi0/0 -> Switch0 Fa0/1',
    'Router1 Gi0/1 -> Switch1 Fa0/1',
    'Router2 Gi0/0 -> Switch2 Fa0/1',
    'PCs -> respective switches (Fa0/2+)'
  ],
  OSPF: [
    'Routers interconnected via serial (point-to-point) and Ethernet links',
    'Each router connects to a local switch for LAN access',
    'PCs connect to switches',
    'Area Border Router (ABR) connects multiple OSPF areas'
  ],
  EIGRP: [
    'Routers form EIGRP neighbor relationships over serial links',
    'Each router connects to a local LAN switch',
    'PCs and servers attach to switches',
    'Use loopback interfaces for stable EIGRP router IDs'
  ],
  BGP: [
    'eBGP peering between ASBRs using physical/logical links',
    'iBGP peering inside an AS via loopback interfaces',
    'Route Reflectors for iBGP full-mesh avoidance',
    'Edge routers connect to customer networks'
  ],
  Switching: [
    'Inter-switch links use trunk mode (802.1Q)',
    'PCs attach to access ports',
    'Server on access or trunk port as required',
    'Management VLAN on a dedicated SVI'
  ],
  Services: [
    'DHCP/DNS server on a dedicated VLAN',
    'Router provides DHCP relay (ip helper-address)',
    'NAT configured on edge router facing Internet',
    'Servers and PCs connect to access switches'
  ],
  Security: [
    'Firewall placed between inside/outside/DMZ zones',
    'AAA server on management VLAN',
    'VPN concentrator on edge',
    'ACLs applied to router interfaces or SVIs'
  ],
  Enterprise: [
    'Core routers interconnect with high-speed links',
    'Distribution layer connects core to access',
    'Access switches connect end devices',
    'Servers in data center VLANs'
  ],
  Routing: [
    'Routers interconnected via serial and Ethernet',
    'LAN switches connect to local PCs',
    'Verify adjacency and route exchange'
  ],
  ISP: [
    'PE routers form MPLS LSPs between provider edge',
    'CE routers peer with PE using BGP or static',
    'Internet peering via BGP at provider edge',
    'Customer access via various access technologies'
  ],
  'Data Center': [
    'Spine switches interconnect leaf switches',
    'Leaf switches connect to servers (ToR)',
    'Storage network separate or converged',
    'Out-of-band management network'
  ],
  Cloud: [
    'On-prem router -> VPN tunnel -> cloud gateway',
    'Cloud vRouter peers with on-prem via BGP',
    'vSwitches provide east-west connectivity',
    'Public-facing servers in DMZ subnet'
  ],
  Automation: [
    'Ansible/controller host reaches all network devices',
    'SSH/API access configured on routers and switches',
    'Inventory file or API credentials configured',
    'Playbooks executed from controller'
  ],
  Troubleshooting: [
    'Devices interconnected per problem scenario',
    'Deliberate misconfigurations to find and fix',
    'Monitoring station taps key links',
    'Console access to all devices'
  ],
  Design: [
    'Core, distribution, access layers clearly separated',
    'Redundant links between layers',
    'Separate management and data planes',
    'WAN links for branch connectivity'
  ]
};

function inferDevices(lab) {
  if (lab.devices && Array.isArray(lab.devices) && lab.devices.length) return lab.devices;
  const text = `${lab.title || ''} ${lab.scenario || ''} ${lab.objectives || ''}`.toLowerCase();
  const found = new Set();
  if (text.match(/router|ospf|eigrp|rip|bgp|routing/)) {
    for (let i = 0; i < 3; i++) found.add(`Router${i}`);
  }
  if (text.match(/switch|vlan|trunk|stp/)) {
    for (let i = 0; i < 2; i++) found.add(`Switch${i}`);
  }
  if (text.match(/pc|host|client/)) {
    for (let i = 0; i < 3; i++) found.add(`PC${i}`);
  }
  if (text.match(/server|dhcp|dns|web/)) {
    found.add('Server0');
    if (text.match(/dhcp/)) found.add('DHCP-Server');
    if (text.match(/dns/)) found.add('DNS-Server');
  }
  if (text.match(/firewall|acl|security|vpn/)) {
    found.add('Firewall');
  }
  if (text.match(/cloud/)) {
    found.add('Cloud-Gateway');
    found.add('vRouter');
  }
  if (found.size === 0) {
    return CATEGORY_DEVICES[lab.category] || CATEGORY_DEVICES.Basics;
  }
  return Array.from(found);
}

function inferConnections(lab) {
  if (lab.connections && Array.isArray(lab.connections) && lab.connections.length) return lab.connections;
  return CATEGORY_CONNECTIONS[lab.category] || CATEGORY_CONNECTIONS.Basics;
}

function inferIpScheme(lab) {
  if (lab.ipScheme) return lab.ipScheme;
  const text = `${lab.title || ''} ${lab.scenario || ''}`.toLowerCase();
  if (text.includes('ipv6')) return '2001:db8::/32 (with /64 subnets)';
  if (text.includes('bgp') || text.includes('ospf') || text.includes('eigrp')) {
    return `10.${(lab.id || 0) % 250}.0.0/16 (subnetted into /24 LANs and /30 point-to-point links)`;
  }
  if (text.includes('vlan') || text.match(/\bclass [abcd]\b/i)) {
    const cls = text.match(/class ([abcd])/i);
    if (cls) {
      const map = { a: '10.0.0.0/8', b: '172.16.0.0/12', c: '192.168.0.0/16' };
      return `${map[cls[1].toLowerCase()]} (subnetted into /24 VLANs)`;
    }
  }
  return `192.168.${(lab.id || 0) % 250}.0/24 (subnetted as needed)`;
}

function inferVerification(lab) {
  if (lab.verification) return lab.verification;
  const category = lab.category || 'Basics';
  const verifications = {
    Basics: [
      'show ip interface brief shows all interfaces up/up',
      'ping from PC0 to PC1 succeeds (ICMP echo reply received)',
      'show arp shows learned MAC addresses',
      'show mac address-table populated on switch'
    ],
    'Static Routing': [
      'show ip route shows static route entries (S codes)',
      'ping between hosts in different LANs succeeds',
      'traceroute shows correct next-hop path',
      'show running-config | include ip route matches lab plan'
    ],
    RIP: [
      'show ip protocols confirms RIP process active',
      'show ip rip database shows learned networks',
      'show ip route rip lists R-codes for remote networks',
      'debug ip rip (briefly) confirms periodic updates'
    ],
    OSPF: [
      'show ip ospf neighbor shows FULL state for all adjacencies',
      'show ip ospf database shows LSA types for the area',
      'show ip route ospf lists O codes with correct metrics',
      'ping across all OSPF areas succeeds'
    ],
    EIGRP: [
      'show ip eigrp neighbors lists active peers',
      'show ip eigrp topology shows successors/feasible successors',
      'show ip route eigrp lists D/DEX codes',
      'ping across all EIGRP-enabled links succeeds'
    ],
    BGP: [
      'show ip bgp summary shows Established state for all peers',
      'show ip bgp lists learned paths with correct next-hops',
      'show ip bgp neighbors shows message/prefix statistics',
      'End-to-end reachability across AS boundaries verified'
    ],
    Switching: [
      'show vlan brief matches lab VLAN plan',
      'show interfaces trunk lists allowed VLANs correctly',
      'show spanning-tree shows expected root and blocked ports',
      'Inter-VLAN routing verified (if L3 switch used)'
    ],
    Services: [
      'PCs receive IP via DHCP (show ip dhcp binding)',
      'DNS name resolution works (nslookup)',
      'NAT translations present (show ip nat translations)',
      'Internet-bound traffic succeeds after NAT'
    ],
    Security: [
      'show access-lists shows hit counts for allowed/denied traffic',
      'Permitted traffic flows; denied traffic blocked',
      'VPN tunnel established (show crypto ipsec sa)',
      'AAA authentication succeeds for SSH/login'
    ],
    Enterprise: [
      'End-to-end business application connectivity verified',
      'Redundancy tested by failing primary link',
      'QoS policies applied (show policy-map interface)',
      'Monitoring/graphing shows expected traffic patterns'
    ],
    Routing: [
      'Routing table populated correctly',
      'Adjacencies/neighbors in expected state',
      'End-to-end ping/traceroute succeeds',
      'Save configurations on all devices'
    ],
    ISP: [
      'BGP sessions between ASBRs in Established state',
      'MPLS LSPs active (show mpls ldp neighbor)',
      'Customer routes advertised into provider BGP',
      'End-customer reachability across ISP core verified'
    ],
    'Data Center': [
      'Spine-leaf paths active and load-balanced',
      'Server-to-server east-west traffic flows',
      'Storage network reachable from compute',
      'Out-of-band management network isolated'
    ],
    Cloud: [
      'VPN tunnel to cloud provider established',
      'BGP session between on-prem and cloud active',
      'Virtual machines reachable across the tunnel',
      'Cloud-native services accessible as designed'
    ],
    Automation: [
      'Playbook runs against all devices without errors',
      'Generated configs match the manual template',
      'Idempotency check: second run produces no diff',
      'Rollback path tested'
    ],
    Troubleshooting: [
      'Root cause identified using structured methodology',
      'Fix applied and verified with show/ping commands',
      'Issue documented with symptoms, diagnosis, and resolution',
      'Preventive measure suggested'
    ],
    Design: [
      'Design document covers all business and technical requirements',
      'Logical and physical diagrams complete and approved',
      'IP scheme supports planned growth',
      'Redundancy and QoS strategies documented'
    ]
  };
  return (verifications[category] || verifications.Basics).join(' | ');
}

function extractNotes(lab) {
  const notes = [];
  if (lab.prerequisites && lab.prerequisites.length) {
    lab.prerequisites.forEach(p => notes.push(`Prerequisite: ${p}`));
  }
  if (lab.objectives) {
    notes.push(`Objective: ${lab.objectives}`);
  }
  if (lab.steps && lab.steps.length) {
    lab.steps.slice(0, 5).forEach((s, i) => {
      const title = s.title || s.instruction || `Step ${i + 1}`;
      notes.push(`${i + 1}. ${title}`);
    });
  }
  if (lab.concepts && lab.concepts.length) {
    notes.push(`Key concept: ${lab.concepts[0]}`);
  }
  if (lab.errors && lab.errors.length) {
    notes.push(`Watch out: ${lab.errors[0].error} -> ${lab.errors[0].solution}`);
  }
  if (notes.length === 0) {
    notes.push('Refer to the lab overview and step viewer in the app for full details.');
  }
  return notes;
}

export function generatePacketTracerHint(lab) {
  if (!lab) return null;
  return {
    title: `Packet Tracer Plan: ${lab.title || 'Lab'}`,
    devices: inferDevices(lab),
    connections: inferConnections(lab),
    ipScheme: inferIpScheme(lab),
    verification: inferVerification(lab),
    notes: extractNotes(lab)
  };
}