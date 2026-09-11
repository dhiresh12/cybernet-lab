const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'frontend', 'src', 'data', 'labs.procedural.json');
const data = JSON.parse(fs.readFileSync(FILE, 'utf-8'));

function getCategoryFromLab(lab) {
  const title = (lab.title || '').toLowerCase();
  const category = (lab.category || '').toLowerCase();
  
  const mapping = {
    'networking fundamentals': 'Networking Fundamentals',
    'osi': 'OSI Model',
    'tcp/ip': 'TCP/IP',
    'tcp': 'TCP/IP',
    'ipv6': 'IPv6',
    'subnet': 'Subnetting',
    'subnetting': 'Subnetting',
    'vlan': 'VLAN',
    'trunking': 'Trunking',
    'trunk': 'Trunking',
    'inter-vlan': 'Inter-VLAN Routing',
    'router-on-a-stick': 'Inter-VLAN Routing',
    'stp': 'STP',
    'spanning-tree': 'STP',
    'etherchannel': 'EtherChannel',
    'port-channel': 'EtherChannel',
    'static routing': 'Static Routing',
    'default routing': 'Default Routing',
    'default route': 'Default Routing',
    'rip': 'RIP',
    'ospf': 'OSPF',
    'eigrp': 'EIGRP',
    'bgp': 'BGP',
    'dhcp': 'DHCP',
    'dns': 'DNS',
    'nat': 'NAT',
    'access-list': 'ACL',
    'acl': 'ACL',
    'ssh': 'SSH',
    'port security': 'Port Security',
    'wireless': 'Wireless Networking',
    'wifi': 'Wireless Networking',
    'vpn': 'VPN',
    'monitor': 'Network Monitoring',
    'monitoring': 'Network Monitoring',
    'troubleshoot': 'Troubleshooting',
    'security': 'Network Security',
    'packet': 'Packet Analysis',
    'server': 'Server Networking',
    'linux': 'Linux Networking',
    'windows': 'Windows Networking',
    'cisco': 'Cisco',
    'design': 'Network Design',
    'documentation': 'Network Documentation',
    'performance': 'Network Performance',
    'cabling': 'Cabling',
    'ethernet': 'Ethernet',
    'icmp': 'ICMP',
    'network services': 'Network Services',
    'network models': 'Network Models',
    'planning': 'Network Planning',
    'routing': 'Routing',
    'switching': 'Switching',
    'enterprise': 'Enterprise'
  };
  
  if (category && mapping[category]) return mapping[category];
  if (title && mapping[title]) return mapping[title];
  return lab.category || 'Networking Fundamentals';
}

function guessDifficulty(lab) {
  const title = (lab.title || '').toLowerCase();
  const desc = (lab.scenario || ' ' + (lab.task || '') + ' ' + (lab.concepts || '')).toLowerCase();
  
  const advanced = ['ospf', 'bgp', 'eigrp', 'mpls', 'vrf', 'layer 3', 'spanning tree', 'stp', 'multilayer', 'advanced', 'complex', 'enterprise', 'route redistribution', 'policy-based', 'pfr', 'netflow', 'qos', 'multicast'];
  for (const kw of advanced) {
    if (title.includes(kw) || desc.includes(kw)) return 'advanced';
  }
  const intermediate = ['vlan', 'inter-vlan', 'trunk', 'dhcp', 'nat', 'acl', 'ssh', 'port-security', 'security', 'ping', 'traceroute', 'static routing', 'access-list', 'switching', 'trunking'];
  for (const kw of intermediate) {
    if (title.includes(kw) || desc.includes(kw)) return 'intermediate';
  }
  return 'basic';
}

function getDeviceType(devName) {
  const n = devName.toLowerCase();
  if (n.startsWith('r')) return 'router';
  if (n.startsWith('sw')) return 'switch';
  if (n.startsWith('pc')) return 'pc';
  if (n.includes('server')) return 'server';
  if (n.includes('wifi') || n.includes('wlan') || n.includes('wireless')) return 'ap';
  if (n.includes('fw') || n.includes('firewall')) return 'firewall';
  return 'router';
}

function makeStep(stepId, lab, stepIdx, category, difficulty) {
  const devices = lab.devices || {};
  const deviceNames = Object.values(devices);
  const ipTable = lab.ipTable || [];
  const connections = lab.connections || [];
  
  const routers = deviceNames.filter(d => getDeviceType(d) === 'router');
  const switches = deviceNames.filter(d => getDeviceType(d) === 'switch');
  const pcs = deviceNames.filter(d => getDeviceType(d) === 'pc');
  const servers = deviceNames.filter(d => getDeviceType(d) === 'server');
  
  const devicesInfo = {};
  ipTable.forEach(e => { if (!devicesInfo[e.device]) devicesInfo[e.device] = []; devicesInfo[e.device].push({ int: e.interface, ip: e.ip, mask: e.mask }); });
  
  const r = routers[0] || deviceNames[0];
  const s = switches[0] || deviceNames[0];
  const p = pcs[0] || deviceNames[0];
  
  const rInfo = devicesInfo[r] || [];
  const pInfo = devicesInfo[p] || [];
  const defGw = routers.length > 0 ? ipTable.find(e => e.device === routers[0] && e.interface.includes('Gi')) : null;
  const remoteNet = '10.0.' + stepIdx + '.0/24';
  const remoteNextHop = routers.length > 0 ? ipTable.find(e => e.device === routers[0]) : null;
  const nhIp = remoteNextHop ? remoteNextHop.ip : '192.168.1.2';
  
  const stepTemplates = {
    basic: [
      {
        title: 'Initialize Device',
        instruction: `Access ${r} via console or SSH and verify basic connectivity.`,
        commands: ['enable', 'show version', 'show ip interface brief', 'end'],
        expectedOutput: `Device ${r} is accessible, all interfaces visible`,
        verification: { type: 'command', expected: ['show ip interface brief'] },
        commonErrors: [{ error: 'Connection refused', solution: 'Check console cable or SSH configuration' }],
        hints: ['Use "show version" to verify device uptime', 'Check console cable if SSH fails'],
        challenge: 'Verify interface status without using "show" commands'
      },
      {
        title: 'Configure Hostname and Banner',
        instruction: `Set hostname and MOTD banner on ${r} for identification.`,
        commands: ['enable', 'configure terminal', `hostname ${r}`, 'banner motd #Authorized Access Only#', 'exit', 'end'],
        expectedOutput: `Hostname set to ${r}, MOTD banner displayed on login`,
        verification: { type: 'command', expected: ['show running-config | include hostname'] },
        commonErrors: [{ error: 'Banner not showing', solution: 'Check delimiter character in banner command' }],
        hints: ['Use "#" as delimiter for banner', 'MOTD banner is shown before login prompt'],
        challenge: 'Add login banner with warning message'
      },
      {
        title: 'Configure Device Interfaces',
        instruction: `Enable and assign IP to primary interface on ${r}.`,
        commands: ['enable', 'configure terminal', `interface ${rInfo[0]?.int || 'GigabitEthernet0/0'}`, `ip address ${rInfo[0]?.ip || '192.168.1.1'} ${rInfo[0]?.mask || '255.255.255.0'}`, 'no shutdown', 'exit', 'end'],
        expectedOutput: `Interface up, line protocol up, IP ${rInfo[0]?.ip || '192.168.1.1'} assigned`,
        verification: { type: 'command', expected: ['show ip interface brief'] },
        commonErrors: [{ error: 'Interface down', solution: 'Use "no shutdown" after IP assignment' }],
        hints: ['Use "show interfaces status" to verify physical layer', 'Check cable connectivity'],
        challenge: 'Configure secondary IP on same interface'
      },
      {
        title: 'Verify Connectivity',
        instruction: `Ping from ${r} to all directly connected devices and verify routing table.`,
        commands: ['enable', 'ping 192.168.1.10', 'show ip route', 'show arp', 'end'],
        expectedOutput: `Successful ping, ARP entries populated, routes visible in routing table`,
        verification: { type: 'ping', expected: 'reachable' },
        commonErrors: [{ error: 'Ping fails', solution: 'Verify IP addresses match on both ends' }],
        hints: ['Use "show arp" to check MAC address resolution', 'Traceroute shows path through network'],
        challenge: 'Trace route to remote network 10.0.0.0/24'
      },
      {
        title: 'Document Configuration',
        instruction: 'Save running configuration to startup-config and export for backup.',
        commands: ['enable', 'copy running-config startup-config', 'show running-config', 'end'],
        expectedOutput: `Configuration saved to NVRAM, [OK] message displayed`,
        verification: { type: 'command', expected: ['show startup-config'] },
        commonErrors: [{ error: 'Config not saved', solution: 'Always use "copy running-config startup-config" after changes' }],
        hints: ['Saved config persists across reload', 'Verify with "show startup-config"'],
        challenge: 'Export configuration to TFTP server at 192.168.1.100'
      },
      {
        title: 'Final Verification',
        instruction: 'Verify all network services are operational and document findings.',
        commands: ['enable', 'show ip interface brief', 'show ip route', 'show arp', 'ping 192.168.1.10', 'end'],
        expectedOutput: `All interfaces operational, routes correct, ARP resolved, ping successful`,
        verification: { type: 'command', expected: ['show ip interface brief', 'show ip route'] },
        commonErrors: [{ error: 'Missing routes', solution: 'Check static routes or routing protocol configuration' }],
        hints: ['All interfaces should show "up, line protocol up"', 'ARP table should have entries for all devices'],
        challenge: 'Verify end-to-end connectivity between all PCs'
      }
    ],
    intermediate: [
      {
        title: 'Initialize Device and Verify Interfaces',
        instruction: `Access ${r}, verify interfaces, and document initial state.`,
        commands: ['enable', 'show version', 'show ip interface brief', 'show running-config', 'end'],
        expectedOutput: `Device accessible, all interfaces visible, configuration documented`,
        verification: { type: 'command', expected: ['show ip interface brief'] },
        commonErrors: [{ error: 'Interface down', solution: 'Enable with "no shutdown" if administratively down' }],
        hints: ['Document interface IP addresses before changes', 'Use "show interface" for detailed stats'],
        challenge: 'Identify and document any interface issues'
      },
      {
        title: 'Configure Subinterfaces for VLAN Routing',
        instruction: `Set up subinterfaces on ${r} for VLAN routing.`,
        commands: ['enable', 'configure terminal', 'interface GigabitEthernet0/0.10', 'encapsulation dot1Q 10', `ip address ${rInfo[0]?.ip || '192.168.10.1'} ${rInfo[0]?.mask || '255.255.255.0'}`, 'exit', 'end'],
        expectedOutput: `Subinterface Gi0/0.10 created with VLAN 10 IP`,
        verification: { type: 'command', expected: ['show ip interface brief'] },
        commonErrors: [{ error: 'Subinterface not routing', solution: 'Verify encapsulation dot1Q matches switch VLAN' }],
        hints: ['Subinterface name format: interface.type.subinterface', 'Verify trunk port on switch side'],
        challenge: 'Add subinterface for VLAN 20'
      },
      {
        title: 'Configure Static Routes',
        instruction: `Add static route for remote network ${remoteNet} via ${nhIp}.`,
        commands: ['enable', 'configure terminal', `ip route ${remoteNet} ${nhIp}`, 'do show ip route static', 'end'],
        expectedOutput: `S ${remoteNet} [1/0] via ${nhIp}`,
        verification: { type: 'route', expected: remoteNet },
        commonErrors: [{ error: 'Route not appearing', solution: 'Check next-hop IP reachability' }],
        hints: ['Administrative distance 1 for static routes', 'Use "show ip route static" to verify'],
        challenge: 'Configure floating static route with AD 200'
      },
      {
        title: 'Configure Access Control List',
        instruction: 'Create ACL to filter HTTP traffic and apply to interface.',
        commands: ['enable', 'configure terminal', 'ip access-list extended BLOCK_HTTP', 'deny tcp any any eq 80', 'permit ip any any', 'exit', 'interface GigabitEthernet0/1', 'ip access-group BLOCK_HTTP in', 'exit', 'end'],
        expectedOutput: `ACL BLOCK_HTTP applied to Gi0/1, HTTP denied`,
        verification: { type: 'command', expected: ['show access-lists'] },
        commonErrors: [{ error: 'ACL not filtering', solution: 'Verify ACL applied in correct direction' }],
        hints: ['Extended ACLs filter source and destination', 'Implicit deny at end of ACL'],
        challenge: 'Add logging to deny entries'
      },
      {
        title: 'Configure NAT for Internet Access',
        instruction: 'Set up NAT overload for internal network to reach internet.',
        commands: ['enable', 'configure terminal', 'access-list 1 permit 192.168.1.0 0.0.0.255', 'interface GigabitEthernet0/1', 'ip nat outside', 'exit', 'interface GigabitEthernet0/0', 'ip nat inside', 'exit', 'ip nat inside source list 1 interface GigabitEthernet0/1 overload', 'end'],
        expectedOutput: `NAT overload configured, internal hosts access internet via single public IP`,
        verification: { type: 'command', expected: ['show ip nat translations'] },
        commonErrors: [{ error: 'NAT not working', solution: 'Mark inside/outside interfaces correctly' }],
        hints: ['Overload enables PAT with port mapping', 'Verify ACL matches internal network'],
        challenge: 'Configure static NAT for a server'
      },
      {
        title: 'Configure SSH for Secure Access',
        instruction: 'Set up SSH v2 for secure remote management.',
        commands: ['enable', 'configure terminal', 'hostname R1', 'domain-name example.com', 'crypto key generate rsa modulus 1024', 'ip ssh version 2', 'line vty 0 4', 'transport input ssh', 'login local', 'exit', 'username admin privilege 15 secret Admin123', 'end'],
        expectedOutput: `SSH v2 enabled, RSA keys generated, VTY lines configured for SSH only`,
        verification: { type: 'command', expected: ['show ip ssh'] },
        commonErrors: [{ error: 'SSH connection refused', solution: 'Verify domain-name set and keys generated' }],
        hints: ['RSA key modulus should be at least 1024', 'Use "show ip ssh" to verify SSH status'],
        challenge: 'Configure ACL to allow SSH only from specific IP'
      },
      {
        title: 'Configure DHCP Server',
        instruction: 'Set up DHCP pool for internal network 192.168.1.0/24.',
        commands: ['enable', 'configure terminal', 'ip dhcp pool LAN', 'network 192.168.1.0 255.255.255.0', 'default-router 192.168.1.1', 'dns-server 8.8.8.8', 'exit', 'ip dhcp excluded-address 192.168.1.1 192.168.1.10', 'end'],
        expectedOutput: `DHCP pool LAN created, exclusions set, clients can obtain leases`,
        verification: { type: 'command', expected: ['show ip dhcp binding'] },
        commonErrors: [{ error: 'Clients not getting IP', solution: 'Verify pool network matches LAN subnet' }],
        hints: ['Excluded addresses are not given to DHCP clients', 'Use "show ip dhcp binding" to verify leases'],
        challenge: 'Configure DHCP relay for a different subnet'
      },
      {
        title: 'Final Verification and Troubleshooting',
        instruction: 'Verify all configurations, test connectivity, and troubleshoot any issues.',
        commands: ['enable', 'show ip interface brief', 'show ip route', 'show access-lists', 'show ip nat translations', 'ping 192.168.1.10', 'end'],
        expectedOutput: `All services operational, ACLs working, NAT translations active, ping successful`,
        verification: { type: 'command', expected: ['show running-config'] },
        commonErrors: [{ error: 'Partial connectivity', solution: 'Check ACL, NAT, and routing table for issues' }],
        hints: ['Use "debug ip packet" for troubleshooting', 'Save configuration with "copy run start"'],
        challenge: 'Document all configurations and export for backup'
      }
    ],
    advanced: [
      {
        title: 'Initialize Multi-Router Topology',
        instruction: 'Verify all devices in the topology and document initial state.',
        commands: ['enable', 'show version', 'show ip interface brief', 'show cdp neighbors', 'end'],
        expectedOutput: `All devices accessible, CDP neighbors visible, interfaces up`,
        verification: { type: 'command', expected: ['show cdp neighbors'] },
        commonErrors: [{ error: 'CDP not showing neighbors', solution: 'Verify CDP enabled on all devices' }],
        hints: ['CDP shows directly connected Cisco devices', 'Check interface status with "show interfaces"'],
        challenge: 'Document full topology with IP addresses'
      },
      {
        title: 'Configure OSPF Multi-Area Routing',
        instruction: 'Enable OSPF with area 0 backbone and area 1 for remote networks.',
        commands: ['enable', 'configure terminal', 'router ospf 1', 'router-id 1.1.1.1', 'network 192.168.1.0 0.0.0.255 area 0', 'network 10.0.0.0 0.0.255.255 area 1', 'area 1 stub', 'exit', 'do show ip ospf neighbor', 'do show ip route ospf', 'end'],
        expectedOutput: `OSPF neighbors established, routes redistributed, area 1 stub configured`,
        verification: { type: 'ospf', expected: 'neighbor' },
        commonErrors: [{ error: 'No OSPF neighbors', solution: 'Verify network statements match interface subnets' }],
        hints: ['Router-ID must be unique in OSPF domain', 'Use "passive-interface" for host-only segments'],
        challenge: 'Configure OSPF authentication between neighbors'
      },
      {
        title: 'Configure BGP Peering and Route Filtering',
        instruction: 'Set up eBGP with AS 65001 and filter routes.',
        commands: ['enable', 'configure terminal', 'router bgp 65001', 'neighbor 10.0.0.2 remote-as 65002', 'network 192.168.1.0 mask 255.255.255.0', 'neighbor 10.0.0.2 prefix-list FILTER out', 'exit', 'ip prefix-list FILTER seq 5 deny 0.0.0.0/0 le 32', 'ip prefix-list FILTER seq 10 permit 0.0.0.0/0 le 32', 'exit', 'do show ip bgp summary', 'end'],
        expectedOutput: `BGP peering established, routes filtered by prefix-list`,
        verification: { type: 'bgp', expected: 'established' },
        commonErrors: [{ error: 'BGP not establishing', solution: 'Verify remote-as and neighbor IP' }],
        hints: ['eBGP uses TCP port 179', 'Use "show ip bgp" to verify route advertisements'],
        challenge: 'Configure route-map for path selection'
      },
      {
        title: 'Configure EIGRP Stub Routing',
        instruction: 'Enable EIGRP and configure stub routing with summary routes.',
        commands: ['enable', 'configure terminal', 'router eigrp 100', 'network 192.168.0.0 0.0.255.255', 'eigrp stub summarized', 'no auto-summary', 'exit', 'do show ip eigrp neighbors', 'do show ip route eigrp', 'end'],
        expectedOutput: `EIGRP neighbors established, stub routes injected, summarization active`,
        verification: { type: 'eigrp', expected: 'neighbor' },
        commonErrors: [{ error: 'No EIGRP neighbors', solution: 'Check network statement and AS number' }],
        hints: ['EIGRP uses Autonomous System number', 'Stub routers do not query for routes'],
        challenge: 'Configure variance for unequal cost load balancing'
      },
      {
        title: 'Configure EtherChannel and Port Aggregation',
        instruction: 'Bundle multiple physical links into logical EtherChannel.',
        commands: ['enable', 'configure terminal', 'interface range GigabitEthernet0/1 - 2', 'channel-group 1 mode active', 'exit', 'interface port-channel 1', 'no shutdown', 'exit', 'do show etherchannel summary', 'end'],
        expectedOutput: `EtherChannel bundle created, Po1 interface active, load balancing configured`,
        verification: { type: 'command', expected: ['show etherchannel summary'] },
        commonErrors: [{ error: 'EtherChannel not forming', solution: 'Verify mode matches on both ends (active/passive)' }],
        hints: ['Both sides must use same channel-group number', 'LACP uses PAgP protocol'],
        challenge: 'Configure EtherChannel with LACP instead of PAgP'
      },
      {
        title: 'Configure VLAN Trunking and Native VLAN',
        instruction: 'Set up trunk port with allowed VLANs and native VLAN.',
        commands: ['enable', 'configure terminal', 'interface GigabitEthernet0/1', 'switchport mode trunk', 'switchport trunk allowed vlan 10,20,30', 'switchport trunk native vlan 99', 'exit', 'do show interfaces trunk', 'end'],
        expectedOutput: `Trunk port configured, VLANs 10,20,30 allowed, native VLAN 99 set`,
        verification: { type: 'command', expected: ['show interfaces trunk'] },
        commonErrors: [{ error: 'VLAN not passing traffic', solution: 'Verify native VLAN matches on both ends' }],
        hints: ['Trunk carries traffic for multiple VLANs', 'Native VLAN should be unused for security'],
        challenge: 'Configure VLAN pruning on trunk'
      },
      {
        title: 'Configure Spanning Tree Protocol',
        instruction: 'Set up RSTP and designate root bridge for redundancy.',
        commands: ['enable', 'configure terminal', 'spanning-tree mode rapid-pvst', 'spanning-tree vlan 10 root primary', 'spanning-tree vlan 20 root secondary', 'exit', 'do show spanning-tree summary', 'do show spanning-tree vlan 10', 'end'],
        expectedOutput: `RSTP enabled, root bridge designated for VLAN 10, secondary for VLAN 20`,
        verification: { type: 'command', expected: ['show spanning-tree'] },
        commonErrors: [{ error: 'Spanning tree not converging', solution: 'Verify mode matches on all switches' }],
        hints: ['RSTP converges faster than PVST+', 'Root bridge should be core/distribution switch'],
        challenge: 'Configure portfast on access ports for faster convergence'
      },
      {
        title: 'Configure Network Security Features',
        instruction: 'Implement port security and DHCP snooping for network protection.',
        commands: ['enable', 'configure terminal', 'interface GigabitEthernet0/1', 'switchport mode access', 'switchport port-security', 'switchport port-security maximum 2', 'switchport port-security violation restrict', 'exit', 'ip dhcp snooping', 'ip dhcp snooping vlan 10', 'interface GigabitEthernet0/1', 'ip dhcp snooping trust', 'exit', 'end'],
        expectedOutput: `Port security enabled with max 2 MACs, DHCP snooping active on VLAN 10`,
        verification: { type: 'command', expected: ['show port-security address', 'show ip dhcp snooping binding'] },
        commonErrors: [{ error: 'Port security blocking legitimate traffic', solution: 'Verify MAC address count and violation mode' }],
        hints: ['Port security restricts MAC addresses per port', 'DHCP snooping prevents rogue DHCP servers'],
        challenge: 'Configure Dynamic ARP Inspection'
      },
      {
        title: 'Configure QoS for Traffic Prioritization',
        instruction: 'Set up QoS policy to prioritize voice and video traffic.',
        commands: ['enable', 'configure terminal', 'class-map match-any VOICE', 'match dscp ef', 'exit', 'class-map match-any VIDEO', 'match dscp af41', 'exit', 'policy-map QOS_POLICY', 'class VOICE', 'priority percent 30', 'class VIDEO', 'bandwidth percent 40', 'exit', 'interface GigabitEthernet0/0', 'service-policy output QOS_POLICY', 'exit', 'end'],
        expectedOutput: `QoS policy applied, voice prioritized at 30%, video at 40% bandwidth`,
        verification: { type: 'command', expected: ['show policy-map interface'] },
        commonErrors: [{ error: 'QoS not affecting traffic', solution: 'Verify policy applied on correct interface and direction' }],
        hints: ['DSCP EF is used for voice traffic', 'Policy-map applied outbound on interface'],
        challenge: 'Configure trust boundary on access ports'
      },
      {
        title: 'Final Verification and Production Readiness',
        instruction: 'Verify all advanced configurations, test failover, and document.',
        commands: ['enable', 'show ip ospf neighbor', 'show ip bgp summary', 'show ip eigrp topology', 'show etherchannel summary', 'show spanning-tree', 'show port-security', 'show policy-map interface', 'ping 10.0.0.1', 'end'],
        expectedOutput: `All protocols operational, EtherChannel active, STP converged, QoS applied, end-to-end connectivity verified`,
        verification: { type: 'command', expected: ['show running-config'] },
        commonErrors: [{ error: 'Partial service', solution: 'Check each protocol individually for issues' }],
        hints: ['Use "show" commands to verify each protocol', 'Document configuration changes for rollback'],
        challenge: 'Perform failover test and document results'
      }
    ]
  };
  
  const templates = stepTemplates[difficulty] || stepTemplates.basic;
  const step = templates[stepIdx % templates.length];
  
  return {
    stepId: `${lab.id}-S-${String(stepIdx + 1).padStart(2, '0')}`,
    title: step.title,
    instruction: step.instruction,
    commands: step.commands,
    expectedOutput: step.expectedOutput,
    verification: step.verification,
    commonErrors: step.commonErrors,
    hints: step.hints,
    challenge: step.challenge
  };
}

function enrichLab(lab) {
  const category = getCategoryFromLab(lab);
  const difficulty = guessDifficulty(lab);
  
  const devices = lab.devices || {};
  const deviceNames = Object.values(devices);
  const ipTable = lab.ipTable || [];
  const connections = lab.connections || [];
  
  const deviceList = deviceNames.map(d => ({ name: d, type: getDeviceType(d) }));
  
  const topologyDesc = connections.length > 0 ? connections.join(' -> ') : `${deviceNames.join(', ')} interconnected`;
  
  const stepCount = difficulty === 'advanced' ? (10 + Math.floor(Math.random() * 6)) :
                    difficulty === 'intermediate' ? (8 + Math.floor(Math.random() * 3)) :
                    (6 + Math.floor(Math.random() * 3));
  
  const steps = [];
  for (let i = 0; i < stepCount; i++) {
    steps.push(makeStep(`${lab.id}-S-${String(i+1).padStart(2,'0')}`, lab, i, category, difficulty));
  }
  
  const objectives = {
    'Networking Fundamentals': 'Understand basic network device roles, IP addressing, and initial configuration',
    'OSI Model': 'Identify the seven layers of the OSI model and map protocols to layers',
    'TCP/IP': 'Configure TCP/IP stack and verify connectivity between devices',
    'IPv6': 'Assign IPv6 addresses and configure basic IPv6 connectivity',
    'Subnetting': 'Calculate subnet masks and design IP addressing schemes',
    'VLAN': 'Segment networks using VLANs for security and broadcast control',
    'Trunking': 'Configure trunk links for VLAN traffic between switches',
    'Inter-VLAN Routing': 'Enable communication between VLANs using router-on-a-stick',
    'STP': 'Configure Spanning Tree Protocol to prevent switching loops',
    'EtherChannel': 'Aggregate multiple physical links for higher bandwidth and redundancy',
    'Static Routing': 'Configure static routes between directly connected networks',
    'Default Routing': 'Configure default route for networks without specific routes',
    'RIP': 'Configure RIP distance-vector routing protocol',
    'OSPF': 'Deploy OSPF routing protocol with areas for scalable routing',
    'EIGRP': 'Implement EIGRP advanced distance vector protocol features',
    'BGP': 'Configure BGP peering for internet and inter-domain routing',
    'DHCP': 'Configure dynamic IP address assignment for clients',
    'DNS': 'Set up DNS resolution services',
    'NAT': 'Implement network address translation for internet access',
    'ACL': 'Secure network access using access control lists',
    'SSH': 'Secure remote management using SSH instead of Telnet',
    'Port Security': 'Protect switch ports from unauthorized device access',
    'Wireless Networking': 'Configure wireless access points and security',
    'WAN': 'Configure WAN connectivity and encapsulation',
    'VPN': 'Set up VPN tunnels for secure remote access',
    'Network Monitoring': 'Implement monitoring tools and SNMP',
    'Troubleshooting': 'Diagnose and resolve network connectivity issues',
    'Network Security': 'Implement authentication and access control',
    'Packet Analysis': 'Capture and analyze network packets',
    'Server Networking': 'Configure network services for servers',
    'Linux Networking': 'Configure Linux network interfaces and services',
    'Windows Networking': 'Configure Windows networking features',
    'Cabling': 'Identify cable types and proper termination',
    'Ethernet': 'Understand Ethernet frame formats and operation',
    'ICMP': 'Use ICMP for network diagnostics',
    'Network Services': 'Configure DHCP, DNS, and other network services',
    'Network Models': 'Understand OSI and TCP/IP models',
    'Network Planning': 'Plan network design and IP addressing schemes',
    'Network Design': 'Design scalable and redundant network topologies',
    'Network Documentation': 'Document network configurations and topology',
    'Network Performance': 'Monitor and optimize network performance',
    'Cisco': 'Configure Cisco IOS devices',
    'Routing': 'Implement routing protocols and configurations',
    'Switching': 'Configure switching features and VLANs',
    'Enterprise': 'Design enterprise network architectures',
    'automation': 'Automate network configuration using scripts',
    'data center': 'Configure data center networking',
    'security': 'Implement security measures on network devices',
    'routing': 'Configure routing protocols'
  };
  
  const learningObj = objectives[category] || `Learn ${category} concepts through hands-on configuration`;
  
  lab.category = category;
  lab.difficulty = difficulty;
  lab.level = difficulty;
  lab.learningObjective = learningObj;
  lab.scenario = `Configure ${category} to solve a real-world networking problem with ${stepCount} steps`;
  lab.prerequisites = difficulty === 'basic' 
    ? 'Basic computer literacy, understanding of IP addressing'
    : (difficulty === 'intermediate' 
      ? 'Basic routing/switching knowledge, IP addressing fundamentals'
      : 'Advanced routing and switching configuration experience, OSPF/BGP knowledge');
  lab.topology = topologyDesc;
  lab.deviceList = deviceList;
  lab.ipAddressing = ipTable;
  lab.explanation = `This lab teaches ${category} through practical configuration of real network equipment. The ${difficulty} level requires ${difficulty === 'basic' ? 'basic' : difficulty === 'intermediate' ? 'intermediate' : 'advanced'} networking knowledge and hands-on device interaction.`;
  lab.commonErrors = [
    { error: 'Configuration not saved', solution: 'Always save with "copy running-config startup-config"' },
    { error: 'Interface administratively down', solution: 'Enable with "no shutdown"' },
    { error: 'Cannot reach device', solution: 'Check physical connection and interface status' }
  ];
  lab.hints = [
    'Use "show running-config" to verify configuration',
    'Exit configuration mode with "end" or Ctrl+Z',
    'Save configuration to prevent loss on reload'
  ];
  lab.challenge = `Apply advanced ${category} concepts to optimize network performance`;
  lab.finalVerification = 'All network services operational, verify with show commands';
  lab.quizQuestions = [
    { question: `What is the key concept of ${category}?`, answer: 'Review the final configuration and verify functionality' }
  ];
  lab.steps = steps;
  
  return lab;
}

console.log('Starting Phase 3: Lab Content Engineering (v2)...');
let count = 0;
data.forEach(lab => { enrichLab(lab); count++; if (count % 50 === 0) console.log(`Processed ${count}/247 labs...`); });

fs.writeFileSync(FILE, JSON.stringify(data, null, 2));

const levels = {basic:0,intermediate:0,advanced:0};
const stepsByLevel = {basic:0,intermediate:0,advanced:0};
data.forEach(l=>{levels[l.difficulty]=(levels[l.difficulty]||0)+1; stepsByLevel[l.difficulty]=(stepsByLevel[l.difficulty]||0)+l.steps.length;});
const categorySet = new Set(data.map(l=>l.category));

console.log(`\n=== PHASE 3 COMPLETE (v2) ===`);
console.log(`Total labs: ${data.length}`);
console.log(`Difficulty: Basic=${levels.basic} (${stepsByLevel.basic} steps), Intermediate=${levels.intermediate} (${stepsByLevel.intermediate} steps), Advanced=${levels.advanced} (${stepsByLevel.advanced} steps)`);
console.log(`Categories: ${categorySet.size}`);
console.log(`Total steps: ${data.reduce((s,l)=>s+l.steps.length,0)}`);
console.log(`Avg steps/lab: ${(data.reduce((s,l)=>s+l.steps.length,0)/data.length).toFixed(1)}`);
