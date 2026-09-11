const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'frontend', 'src', 'data', 'labs.procedural.json');
const data = JSON.parse(fs.readFileSync(FILE, 'utf-8'));

function generateLabSteps(lab) {
  const title = (lab.title || '').toLowerCase();
  const category = (lab.category || '').toLowerCase();
  const scenario = (lab.scenario || '').toLowerCase();
  const ipTable = lab.ipTable || [];
  const devices = lab.devices || {};
  const conns = lab.connections || [];
  const deviceNames = Object.values(devices);

  const routers = deviceNames.filter(n => /router|r\d/i.test(n) && !/route/i.test(n.replace('router', '')));
  const switches = deviceNames.filter(n => /switch|sw\d/i.test(n));
  const pcs = deviceNames.filter(n => /^pc|^laptop/i.test(n));
  const servers = deviceNames.filter(n => /server|srv|dns|dhcp|web/i.test(n));

  if (title.includes('static routing') || title.includes('default route') || category.includes('static routing')) {
    return [
      {
        stepId: `${lab.id}-S-01`,
        title: 'Review Lab Scenario and Topology',
        instruction: `Examine the topology. You have ${routers.length || 2} router(s) connecting ${pcs.length || 2} end networks. Review the IP addressing plan below and identify which networks require static routes.\n\nDevices: ${deviceNames.join(', ')}\nConnections: ${conns.slice(0, 3).join('; ')}`,
        commands: ['show ip interface brief', 'show ip route'],
        expectedOutput: 'Topology mapped; missing routes identified',
        routing: 'Directly connected networks only — remote networks unreachable',
        keypoints: ['Static routes needed for networks not directly connected', 'Default route (0.0.0.0/0) covers internet-bound traffic', 'Next-hop or exit-interface specifies forwarding'],
        verification: { type: 'option', expected: 'understood', payload: { question: 'Topology understood?' } }
      },
      {
        stepId: `${lab.id}-S-02`,
        title: 'Configure IP Addresses on All Devices',
        instruction: `Assign IP addresses to all router interfaces according to the IP plan:\n${ipTable.slice(0, 6).map(i => `${i.device} ${i.interface}: ${i.ip}/${i.mask}`).join('\n')}\n\nUse 'enable', 'configure terminal', then 'interface <name>' and 'ip address <ip> <mask>'. Finally, 'no shutdown' to activate each interface.`,
        commands: ipTable.slice(0, 4).map(i => `interface ${i.interface}\\nip address ${i.ip} ${i.mask}\\nno shutdown`),
        expectedOutput: 'All interfaces show up/up in show ip interface brief',
        routing: 'Directly connected routes installed automatically',
        keypoints: ['Each interface must have IP from correct subnet', 'no shutdown activates the interface', 'Verify with show ip interface brief'],
        verification: { type: 'cli', expected: 'no shutdown', payload: { hint: 'Activate interfaces' } }
      },
      {
        stepId: `${lab.id}-S-03`,
        title: 'Add Static Routes',
        instruction: 'Add static routes for any networks not directly connected. Use either "ip route <network> <mask> <next-hop>" or "ip route 0.0.0.0 0.0.0.0 <next-hop>" for a default route.',
        commands: ['ip route 0.0.0.0 0.0.0.0 <next-hop>', 'ip route <network> <mask> <next-hop>'],
        expectedOutput: 'show ip route shows S*  0.0.0.0/0 [1/0] entry',
        routing: 'Static routes now installed in routing table',
        keypoints: ['Default route: 0.0.0.0 0.0.0.0', 'Specific route: full network and mask', 'Administrative distance defaults to 1'],
        verification: { type: 'cli', expected: 'ip route', payload: { hint: 'Add static routes' } }
      },
      {
        stepId: `${lab.id}-S-04`,
        title: 'Verify End-to-End Connectivity',
        instruction: 'Test connectivity between hosts in different networks using ping. If ping fails, use traceroute to identify the failure point. Check the routing table with show ip route to confirm static routes are installed.',
        commands: ['ping <remote-ip>', 'traceroute <remote-ip>', 'show ip route'],
        expectedOutput: 'Ping receives 5/5 replies. show ip route lists all expected networks.',
        routing: 'All routes verified — full reachability',
        keypoints: ['Use ping to test L3 connectivity', 'traceroute shows hop-by-hop path', 'Recursive lookup on routing table'],
        verification: { type: 'cli', expected: 'ping', payload: { hint: 'Test connectivity' } }
      },
      {
        stepId: `${lab.id}-S-05`,
        title: 'Save Configuration and Document',
        instruction: 'Save the running configuration to startup-config with "copy running-config startup-config" or "write memory". Document the static routes and IP plan for future reference.',
        commands: ['copy running-config startup-config', 'show running-config | include ip route'],
        expectedOutput: 'Configuration persisted. Documented IP plan and routes.',
        routing: 'Configuration saved',
        keypoints: ['copy run start saves to NVRAM', 'write memory is the legacy alias', 'Document your work'],
        verification: { type: 'option', expected: 'saved', payload: { question: 'Configuration saved?' } }
      }
    ];
  }

  if (title.includes('ospf')) {
    return [
      {
        stepId: `${lab.id}-S-01`,
        title: 'Review OSPF Topology and Area Design',
        instruction: `OSPF uses areas to scale. All areas must connect to Area 0 (backbone). Identify the ABRs and area assignment. For this lab: ${deviceNames.join(', ')}.\n\nKey OSPF concepts: Cost-based metric, LSAs, Hello/Dead timers, DR/BDR election on broadcast segments.`,
        commands: ['show ip ospf', 'show ip protocols'],
        expectedOutput: 'OSPF design mapped, areas identified',
        routing: 'OSPF process not yet enabled',
        keypoints: ['OSPF areas must connect to Area 0', 'Cost is inversely proportional to bandwidth', 'Hello timer 10s, Dead 40s on broadcast'],
        verification: { type: 'option', expected: 'understood', payload: { question: 'Topology and areas understood?' } }
      },
      {
        stepId: `${lab.id}-S-02`,
        title: 'Configure IP Addresses and Loopbacks',
        instruction: `Assign IP addresses per the plan:\n${ipTable.slice(0, 5).map(i => `${i.device} ${i.interface}: ${i.ip}/${i.mask}`).join('\n')}\n\nCreate a loopback (Lo0) on each router for stable router-id. Use 'interface Loopback0' and assign an IP from 1.1.1.X/32.`,
        commands: ['interface Loopback0', 'ip address 1.1.1.1 255.255.255.255', 'no shutdown'],
        expectedOutput: 'All interfaces up; loopback created',
        routing: 'Directly connected only',
        keypoints: ['Loopback provides stable router-id', 'Always bring up loopback before OSPF', 'Use 32-bit mask for loopbacks'],
        verification: { type: 'cli', expected: 'no shutdown', payload: { hint: 'Activate interfaces' } }
      },
      {
        stepId: `${lab.id}-S-03`,
        title: 'Enable OSPF Process and Advertise Networks',
        instruction: 'Start OSPF with "router ospf <process-id>". Use process-id 1 by default. Set router-id explicitly using "router-id <ip>". Then advertise networks with "network <ip> <wildcard> area <area-id>".',
        commands: ['router ospf 1', 'router-id 1.1.1.1', 'network 10.0.0.0 0.0.0.3 area 0', 'network 192.168.1.0 0.0.0.255 area 0'],
        expectedOutput: 'OSPF process starts; networks advertised',
        routing: 'OSPF neighbors forming',
        keypoints: ['Process-id is local to router', 'Wildcard mask = inverse of subnet mask', 'Always specify area'],
        verification: { type: 'cli', expected: 'router ospf', payload: { hint: 'Start OSPF' } }
      },
      {
        stepId: `${lab.id}-S-04`,
        title: 'Verify OSPF Neighbor Adjacency',
        instruction: 'Use "show ip ospf neighbor" to verify all expected adjacencies are FULL. Use "show ip ospf interface" to verify Hello/Dead timers match. Use "show ip ospf database" to inspect LSAs.',
        commands: ['show ip ospf neighbor', 'show ip ospf interface', 'show ip ospf database'],
        expectedOutput: 'All neighbors in FULL state, matching timers',
        routing: 'OSPF adjacencies established',
        keypoints: ['FULL state means LSDB synchronized', 'Mismatched timers = no adjacency', 'Use debug ip ospf adj to troubleshoot'],
        verification: { type: 'cli', expected: 'show ip ospf neighbor', payload: { hint: 'Verify neighbors' } }
      },
      {
        stepId: `${lab.id}-S-05`,
        title: 'Test End-to-End Routing',
        instruction: 'Verify OSPF routes in the routing table with "show ip route ospf" (codes: O = intra-area, O IA = inter-area, O E1/E2 = external). Test ping across the OSPF domain. Save configuration.',
        commands: ['show ip route ospf', 'ping <remote-ip>', 'copy running-config startup-config'],
        expectedOutput: 'O routes present; ping successful; config saved',
        routing: 'Full OSPF routing operational',
        keypoints: ['O = intra-area, O IA = inter-area', 'E1/E2 = redistributed external', 'Always save after successful test'],
        verification: { type: 'cli', expected: 'ping', payload: { hint: 'Test connectivity' } }
      }
    ];
  }

  if (title.includes('eigrp')) {
    return [
      {
        stepId: `${lab.id}-S-01`,
        title: 'Review EIGRP Topology and AS Design',
        instruction: `EIGRP uses Autonomous System number (AS). All routers in the same EIGRP domain must use the same AS number. DUAL algorithm guarantees loop-free paths.\n\nDevices: ${deviceNames.join(', ')}`,
        commands: ['show ip eigrp', 'show ip protocols'],
        expectedOutput: 'EIGRP AS design understood',
        routing: 'EIGRP not enabled',
        keypoints: ['All routers in same EIGRP AS', 'DUAL = Diffusing Update Algorithm', 'Uses bandwidth and delay for metric'],
        verification: { type: 'option', expected: 'understood', payload: { question: 'Topology understood?' } }
      },
      {
        stepId: `${lab.id}-S-02`,
        title: 'Configure IP Addresses',
        instruction: `Assign IP per plan:\n${ipTable.slice(0, 5).map(i => `${i.device} ${i.interface}: ${i.ip}/${i.mask}`).join('\n')}`,
        commands: ['ip address <ip> <mask>', 'no shutdown'],
        expectedOutput: 'All interfaces up',
        routing: 'Directly connected',
        keypoints: ['Loopback for stability', 'Verify with show ip int br'],
        verification: { type: 'cli', expected: 'no shutdown', payload: { hint: 'Activate interfaces' } }
      },
      {
        stepId: `${lab.id}-S-03`,
        title: 'Enable EIGRP on All Interfaces',
        instruction: 'Start EIGRP with "router eigrp <as-number>". Use "no auto-summary" to disable classful summarization. Advertise networks with "network <ip> <wildcard>".',
        commands: ['router eigrp 100', 'no auto-summary', 'network 10.0.0.0 0.0.0.3', 'network 192.168.1.0 0.0.0.255'],
        expectedOutput: 'EIGRP adjacencies form',
        routing: 'EIGRP neighbors establishing',
        keypoints: ['AS number must match across routers', 'no auto-summary is best practice', 'Wildcard mask used'],
        verification: { type: 'cli', expected: 'router eigrp', payload: { hint: 'Enable EIGRP' } }
      },
      {
        stepId: `${lab.id}-S-04`,
        title: 'Verify EIGRP Neighbors and Topology',
        instruction: 'Use "show ip eigrp neighbors" to verify peers are up. Use "show ip eigrp topology" to inspect successors and feasible successors. Use "show ip route eigrp" to see learned routes (D codes).',
        commands: ['show ip eigrp neighbors', 'show ip eigrp topology', 'show ip route eigrp'],
        expectedOutput: 'Neighbors up, D routes in table',
        routing: 'Full EIGRP routing',
        keypoints: ['Successor = primary next-hop', 'Feasible successor = backup', 'D = EIGRP, D EX = external'],
        verification: { type: 'cli', expected: 'show ip eigrp neighbors', payload: { hint: 'Verify' } }
      },
      {
        stepId: `${lab.id}-S-05`,
        title: 'Test and Save',
        instruction: 'Test ping, then save config.',
        commands: ['ping <remote-ip>', 'copy running-config startup-config'],
        expectedOutput: 'Connectivity verified, config saved',
        routing: 'EIGRP complete',
        keypoints: ['Save config', 'Document changes'],
        verification: { type: 'cli', expected: 'ping', payload: { hint: 'Test' } }
      }
    ];
  }

  if (title.includes('rip')) {
    return [
      {
        stepId: `${lab.id}-S-01`,
        title: 'Review RIP Topology',
        instruction: `RIP is a distance-vector protocol using hop count (max 15). RIPv2 supports VLSM and CIDR with multicast 224.0.0.9. RIPv1 is classful.\n\nDevices: ${deviceNames.join(', ')}`,
        commands: ['show ip protocols', 'show ip rip database'],
        expectedOutput: 'RIP topology understood',
        routing: 'No routing protocol yet',
        keypoints: ['Max 15 hops', 'RIPv2 supports VLSM', 'Updates every 30s'],
        verification: { type: 'option', expected: 'understood' }
      },
      {
        stepId: `${lab.id}-S-02`,
        title: 'Configure IP Addresses',
        instruction: `Assign IP:\n${ipTable.slice(0, 5).map(i => `${i.device} ${i.interface}: ${i.ip}/${i.mask}`).join('\n')}`,
        commands: ['ip address <ip> <mask>', 'no shutdown'],
        expectedOutput: 'Interfaces up',
        routing: 'Directly connected',
        keypoints: ['Verify with show ip int br'],
        verification: { type: 'cli', expected: 'no shutdown' }
      },
      {
        stepId: `${lab.id}-S-03`,
        title: 'Enable RIPv2',
        instruction: 'Use "router rip" then "version 2" and "no auto-summary". Advertise networks with "network <classful-network>".',
        commands: ['router rip', 'version 2', 'no auto-summary', 'network 10.0.0.0', 'network 192.168.1.0'],
        expectedOutput: 'RIPv2 enabled and sending updates',
        routing: 'RIPv2 neighbors forming',
        keypoints: ['Use classful network address', 'no auto-summary for VLSM', 'version 2 enables CIDR support'],
        verification: { type: 'cli', expected: 'router rip' }
      },
      {
        stepId: `${lab.id}-S-04`,
        title: 'Verify RIP Routes',
        instruction: 'Check "show ip route rip" for R codes. Use "show ip rip database" to see learned networks. Use "show ip protocols" to confirm RIP process is active.',
        commands: ['show ip route rip', 'show ip rip database', 'show ip protocols'],
        expectedOutput: 'R routes present in routing table',
        routing: 'RIP routes installed',
        keypoints: ['R = RIP learned', 'Database shows all known routes', 'Timers 30/180/180/240'],
        verification: { type: 'cli', expected: 'show ip route rip' }
      },
      {
        stepId: `${lab.id}-S-05`,
        title: 'Test and Save',
        instruction: 'Test connectivity and save config.',
        commands: ['ping <remote-ip>', 'copy running-config startup-config'],
        expectedOutput: 'Pings succeed, config saved',
        routing: 'RIP complete',
        keypoints: ['Save config'],
        verification: { type: 'cli', expected: 'ping' }
      }
    ];
  }

  if (title.includes('bgp')) {
    return [
      {
        stepId: `${lab.id}-S-01`,
        title: 'Review BGP AS and Peering Design',
        instruction: `BGP uses AS numbers (16-bit or 32-bit). eBGP between different AS, iBGP within same AS. Use loopbacks for iBGP stability. Devices: ${deviceNames.join(', ')}.`,
        commands: ['show ip bgp summary', 'show ip bgp'],
        expectedOutput: 'BGP design understood',
        routing: 'No BGP yet',
        keypoints: ['eBGP TTL=1 by default, iBGP TTL=255', 'Use update-source for loopback peering', 'BGP does not auto-discover peers'],
        verification: { type: 'option', expected: 'understood' }
      },
      {
        stepId: `${lab.id}-S-02`,
        title: 'Configure IP and Loopbacks',
        instruction: 'Assign IP per plan. Create Lo0 on each router for iBGP peering.',
        commands: ['ip address <ip> <mask>', 'no shutdown', 'interface Loopback0', 'ip address <loopback-ip> 255.255.255.255'],
        expectedOutput: 'All interfaces up',
        routing: 'Directly connected',
        keypoints: ['Loopback for stable iBGP', 'Ensure reachability before BGP'],
        verification: { type: 'cli', expected: 'no shutdown' }
      },
      {
        stepId: `${lab.id}-S-03`,
        title: 'Configure eBGP Peering',
        instruction: 'Start BGP with "router bgp <as-number>". Specify neighbor with "neighbor <ip> remote-as <as>". Use "neighbor <ip> update-source Loopback0" for iBGP.',
        commands: ['router bgp 65001', 'neighbor 10.0.0.2 remote-as 65002', 'neighbor 1.1.1.2 remote-as 65001', 'neighbor 1.1.1.2 update-source Loopback0'],
        expectedOutput: 'BGP sessions form',
        routing: 'BGP establishing',
        keypoints: ['BGP peer must be reachable first', 'eBGP TTL=1 default', 'iBGP needs full mesh or route reflectors'],
        verification: { type: 'cli', expected: 'router bgp' }
      },
      {
        stepId: `${lab.id}-S-04`,
        title: 'Advertise Networks and Verify',
        instruction: 'Use "network <ip> mask <mask>" to advertise. Verify with "show ip bgp summary" (Established state) and "show ip bgp" for the BGP table.',
        commands: ['network 192.168.1.0 mask 255.255.255.0', 'show ip bgp summary', 'show ip bgp'],
        expectedOutput: 'B* in table, peers in Established state',
        routing: 'BGP routes learned',
        keypoints: ['B* = best path', '*> = valid and best', 'Check neighbor state'],
        verification: { type: 'cli', expected: 'show ip bgp summary' }
      },
      {
        stepId: `${lab.id}-S-05`,
        title: 'Test and Save',
        instruction: 'Test reachability across AS boundaries. Save config.',
        commands: ['ping <remote-in-other-as>', 'copy running-config startup-config'],
        expectedOutput: 'BGP routing verified, config saved',
        routing: 'BGP complete',
        keypoints: ['Save config'],
        verification: { type: 'cli', expected: 'ping' }
      }
    ];
  }

  if (title.includes('vlan') || title.includes('trunk') || title.includes('inter-vlan')) {
    return [
      {
        stepId: `${lab.id}-S-01`,
        title: 'Review VLAN Plan and Trunk Requirements',
        instruction: `VLANs segment broadcast domains. Trunk links carry multiple VLANs tagged with 802.1Q. Design VLANs per scenario: ${deviceNames.join(', ')}.`,
        commands: ['show vlan brief', 'show interfaces trunk'],
        expectedOutput: 'VLAN and trunk plan understood',
        routing: 'No VLANs configured',
        keypoints: ['Access ports belong to one VLAN', 'Trunk carries multiple VLANs', 'Native VLAN untagged on trunk'],
        verification: { type: 'option', expected: 'understood' }
      },
      {
        stepId: `${lab.id}-S-02`,
        title: 'Create VLANs on Switch',
        instruction: 'In config mode, use "vlan <id>" then "name <name>". Verify with "show vlan brief".',
        commands: ['vlan 10', 'name DATA', 'vlan 20', 'name VOICE', 'exit', 'show vlan brief'],
        expectedOutput: 'VLANs created and listed',
        routing: 'N/A',
        keypoints: ['VLAN IDs 1-4094 usable', 'VLAN 1 is default', 'Best practice to use VTP server mode'],
        verification: { type: 'cli', expected: 'vlan 10' }
      },
      {
        stepId: `${lab.id}-S-03`,
        title: 'Assign Access Ports to VLANs',
        instruction: 'Use "interface <id>", "switchport mode access", "switchport access vlan <id>".',
        commands: ['interface fa0/1', 'switchport mode access', 'switchport access vlan 10', 'exit'],
        expectedOutput: 'Ports assigned to VLANs',
        routing: 'N/A',
        keypoints: ['Access port = single VLAN', 'Use range command for multiple ports', 'Verify with show vlan brief'],
        verification: { type: 'cli', expected: 'switchport access vlan' }
      },
      {
        stepId: `${lab.id}-S-04`,
        title: 'Configure Trunk Ports',
        instruction: 'Use "interface <id>", "switchport mode trunk", "switchport trunk allowed vlan <list>".',
        commands: ['interface gi0/1', 'switchport mode trunk', 'switchport trunk allowed vlan 10,20', 'exit', 'show interfaces trunk'],
        expectedOutput: 'Trunk established, allowed VLANs listed',
        routing: 'N/A',
        keypoints: ['Trunk = 802.1Q tagged', 'Specify allowed VLANs for security', 'Verify with show interfaces trunk'],
        verification: { type: 'cli', expected: 'switchport mode trunk' }
      },
      {
        stepId: `${lab.id}-S-05`,
        title: 'Verify and Test',
        instruction: 'Verify with show commands and test with ping. Save config.',
        commands: ['show vlan brief', 'show interfaces trunk', 'ping <host>', 'copy running-config startup-config'],
        expectedOutput: 'VLANs working, ping successful, config saved',
        routing: 'N/A',
        keypoints: ['Save config'],
        verification: { type: 'cli', expected: 'show vlan brief' }
      }
    ];
  }

  if (title.includes('acl') || category.includes('security')) {
    return [
      {
        stepId: `${lab.id}-S-01`,
        title: 'Review ACL Requirements and Direction',
        instruction: `ACLs filter traffic. Standard ACLs (1-99) match source only. Extended ACLs (100-199) match source, dest, protocol, port. Apply ACL closest to source for extended, closest to destination for standard.\n\nDevices: ${deviceNames.join(', ')}`,
        commands: ['show access-lists', 'show ip interface'],
        expectedOutput: 'ACL requirements understood',
        routing: 'N/A',
        keypoints: ['Standard = source only', 'Extended = full L3/L4 match', 'Apply in correct direction'],
        verification: { type: 'option', expected: 'understood' }
      },
      {
        stepId: `${lab.id}-S-02`,
        title: 'Configure Standard ACL',
        instruction: 'Use "access-list <num> <permit|deny> <source> <wildcard>". Apply with "ip access-group <num> <in|out>" on interface.',
        commands: ['access-list 10 permit 192.168.1.0 0.0.0.255', 'interface gi0/0', 'ip access-group 10 in'],
        expectedOutput: 'ACL created and applied',
        routing: 'N/A',
        keypoints: ['Use wildcard masks', 'Implicit deny at end', 'Apply to correct interface'],
        verification: { type: 'cli', expected: 'access-list' }
      },
      {
        stepId: `${lab.id}-S-03`,
        title: 'Configure Extended ACL',
        instruction: 'Use "access-list <num> <permit|deny> <protocol> <src> <wildcard> <dst> <wildcard> <operator> <port>".',
        commands: ['access-list 100 permit tcp 192.168.1.0 0.0.0.255 any eq 80', 'access-list 100 deny ip any any', 'interface gi0/1', 'ip access-group 100 in'],
        expectedOutput: 'Extended ACL applied',
        routing: 'N/A',
        keypoints: ['eq = equal, gt = greater than, lt = less than', 'Range with range keyword', 'Test before applying to production'],
        verification: { type: 'cli', expected: 'access-list 100' }
      },
      {
        stepId: `${lab.id}-S-04`,
        title: 'Verify ACL with Show',
        instruction: 'Use "show access-lists" to see hit counts. Use "show ip interface" to see which ACLs are applied.',
        commands: ['show access-lists', 'show ip interface gi0/0'],
        expectedOutput: 'Hit counts incrementing on expected traffic',
        routing: 'N/A',
        keypoints: ['Hit count = number of matches', 'Reset with clear access-list counters'],
        verification: { type: 'cli', expected: 'show access-lists' }
      },
      {
        stepId: `${lab.id}-S-05`,
        title: 'Test and Save',
        instruction: 'Test allowed and denied traffic. Save config.',
        commands: ['ping <allowed>', 'ping <denied>', 'copy running-config startup-config'],
        expectedOutput: 'ACL working as expected, config saved',
        routing: 'N/A',
        keypoints: ['Document ACL purpose', 'Save config'],
        verification: { type: 'cli', expected: 'ping' }
      }
    ];
  }

  if (title.includes('dhcp')) {
    return [
      {
        stepId: `${lab.id}-S-01`,
        title: 'Review DHCP Plan',
        instruction: `DHCP assigns IP dynamically. Define pools, exclude reserved IPs, set default gateway and DNS. Devices: ${deviceNames.join(', ')}.`,
        commands: ['show ip dhcp binding', 'show running-config | section dhcp'],
        expectedOutput: 'DHCP design understood',
        routing: 'No DHCP yet',
        keypoints: ['Exclude reserved addresses', 'Set default-router and dns-server', 'Lease time controls'],
        verification: { type: 'option', expected: 'understood' }
      },
      {
        stepId: `${lab.id}-S-02`,
        title: 'Configure DHCP Exclusions',
        instruction: 'Use "ip dhcp excluded-address <start> <end>" to reserve IPs for static devices.',
        commands: ['ip dhcp excluded-address 192.168.1.1 192.168.1.10'],
        expectedOutput: 'Exclusions configured',
        routing: 'N/A',
        keypoints: ['Always exclude gateway and reserved IPs'],
        verification: { type: 'cli', expected: 'ip dhcp excluded-address' }
      },
      {
        stepId: `${lab.id}-S-03`,
        title: 'Create DHCP Pool',
        instruction: 'Use "ip dhcp pool <name>" then specify network, default-router, dns-server, lease.',
        commands: ['ip dhcp pool LAN', 'network 192.168.1.0 255.255.255.0', 'default-router 192.168.1.1', 'dns-server 8.8.8.8', 'lease 7'],
        expectedOutput: 'DHCP pool created',
        routing: 'N/A',
        keypoints: ['Pool name is local', 'Lease in days'],
        verification: { type: 'cli', expected: 'ip dhcp pool' }
      },
      {
        stepId: `${lab.id}-S-04`,
        title: 'Verify DHCP Operation',
        instruction: 'Have a PC request an IP. Use "show ip dhcp binding" to see leases. Use "show ip dhcp server statistics" for stats.',
        commands: ['show ip dhcp binding', 'show ip dhcp server statistics'],
        expectedOutput: 'PCs receive IP, bindings listed',
        routing: 'N/A',
        keypoints: ['Bindings show active leases', 'Statistics show offered/ack'],
        verification: { type: 'cli', expected: 'show ip dhcp binding' }
      },
      {
        stepId: `${lab.id}-S-05`,
        title: 'Save and Document',
        instruction: 'Save configuration. Document the DHCP scope and exclusions.',
        commands: ['copy running-config startup-config'],
        expectedOutput: 'Config saved, plan documented',
        routing: 'N/A',
        keypoints: ['Document DHCP plan'],
        verification: { type: 'cli', expected: 'copy running-config' }
      }
    ];
  }

  if (title.includes('nat')) {
    return [
      {
        stepId: `${lab.id}-S-01`,
        title: 'Review NAT Plan',
        instruction: `NAT translates private to public IPs. Types: static (1:1), dynamic (pool), PAT (overload/many:1). Devices: ${deviceNames.join(', ')}.`,
        commands: ['show ip nat translations', 'show ip nat statistics'],
        expectedOutput: 'NAT plan understood',
        routing: 'N/A',
        keypoints: ['Static = 1:1 mapping', 'Dynamic = pool-based', 'PAT = many:1 with port translation'],
        verification: { type: 'option', expected: 'understood' }
      },
      {
        stepId: `${lab.id}-S-02`,
        title: 'Configure NAT ACL and Pool',
        instruction: 'Define ACL for traffic to translate, and NAT pool if using dynamic NAT.',
        commands: ['access-list 1 permit 192.168.1.0 0.0.0.255', 'ip nat pool PUBLIC 200.0.0.1 200.0.0.10 netmask 255.255.255.0'],
        expectedOutput: 'ACL and pool ready',
        routing: 'N/A',
        keypoints: ['ACL identifies inside traffic', 'Pool defines public IPs'],
        verification: { type: 'cli', expected: 'ip nat pool' }
      },
      {
        stepId: `${lab.id}-S-03`,
        title: 'Apply NAT to Interfaces',
        instruction: 'Mark inside/outside interfaces and apply translation rule.',
        commands: ['interface gi0/0', 'ip nat inside', 'exit', 'interface gi0/1', 'ip nat outside', 'exit', 'ip nat inside source list 1 pool PUBLIC overload'],
        expectedOutput: 'NAT active on interfaces',
        routing: 'N/A',
        keypoints: ['Mark inside and outside', 'Overload keyword enables PAT'],
        verification: { type: 'cli', expected: 'ip nat inside source' }
      },
      {
        stepId: `${lab.id}-S-04`,
        title: 'Verify NAT Translations',
        instruction: 'Use "show ip nat translations" to see active translations. Use "show ip nat statistics" for stats.',
        commands: ['show ip nat translations', 'show ip nat statistics'],
        expectedOutput: 'Translations listed, stats show hits',
        routing: 'N/A',
        keypoints: ['Translations table shows inside/outside mapping', 'Statistics track protocol usage'],
        verification: { type: 'cli', expected: 'show ip nat translations' }
      },
      {
        stepId: `${lab.id}-S-05`,
        title: 'Test and Save',
        instruction: 'Test outbound traffic. Save config.',
        commands: ['ping <outside-host>', 'copy running-config startup-config'],
        expectedOutput: 'Outbound traffic works, config saved',
        routing: 'N/A',
        keypoints: ['Save config'],
        verification: { type: 'cli', expected: 'ping' }
      }
    ];
  }

  if (title.includes('ssh') || title.includes('telnet')) {
    return [
      {
        stepId: `${lab.id}-S-01`,
        title: 'Review Security Plan',
        instruction: 'SSH is preferred over Telnet for remote management. Need RSA keys, local user, VTY lines configured for SSH only.',
        commands: ['show ip ssh', 'show users', 'show line vty 0 4'],
        expectedOutput: 'Security plan understood',
        routing: 'N/A',
        keypoints: ['SSH uses port 22, encrypted', 'Telnet port 23, plaintext', 'Disable Telnet for security'],
        verification: { type: 'option', expected: 'understood' }
      },
      {
        stepId: `${lab.id}-S-02`,
        title: 'Configure Hostname and Domain',
        instruction: 'SSH requires hostname and domain-name for key generation.',
        commands: ['hostname R1', 'ip domain-name cybernet.lab'],
        expectedOutput: 'Hostname and domain set',
        routing: 'N/A',
        keypoints: ['Hostname required for key generation', 'Domain name is used in RSA keys'],
        verification: { type: 'cli', expected: 'hostname' }
      },
      {
        stepId: `${lab.id}-S-03`,
        title: 'Generate RSA Keys and Create User',
        instruction: 'Generate RSA keys with "crypto key generate rsa" and create a local user.',
        commands: ['crypto key generate rsa', '1024', 'username admin privilege 15 secret <password>'],
        expectedOutput: 'Keys generated, user created',
        routing: 'N/A',
        keypoints: ['1024 or 2048 bit key', 'Privilege 15 = full access', 'Use secret for encrypted password'],
        verification: { type: 'cli', expected: 'crypto key generate rsa' }
      },
      {
        stepId: `${lab.id}-S-04`,
        title: 'Configure VTY Lines for SSH',
        instruction: 'Enable SSH and disable Telnet on VTY lines.',
        commands: ['line vty 0 4', 'transport input ssh', 'login local', 'exit', 'ip ssh version 2'],
        expectedOutput: 'VTY configured for SSH only',
        routing: 'N/A',
        keypoints: ['transport input ssh disables telnet', 'login local uses local user database', 'SSH v2 is more secure'],
        verification: { type: 'cli', expected: 'transport input ssh' }
      },
      {
        stepId: `${lab.id}-S-05`,
        title: 'Verify and Test',
        instruction: 'Use "show ip ssh" to verify. Test SSH from another device. Save config.',
        commands: ['show ip ssh', 'ssh -l admin <ip>', 'copy running-config startup-config'],
        expectedOutput: 'SSH active, login successful, config saved',
        routing: 'N/A',
        keypoints: ['Test from external device', 'Save config'],
        verification: { type: 'cli', expected: 'show ip ssh' }
      }
    ];
  }

  if (title.includes('stp') || title.includes('spanning tree')) {
    return [
      {
        stepId: `${lab.id}-S-01`,
        title: 'Review STP Topology and Root Bridge Election',
        instruction: `STP prevents loops in switched networks. Root bridge elected by lowest Bridge ID. Path cost determines blocked port.\n\nDevices: ${deviceNames.join(', ')}`,
        commands: ['show spanning-tree', 'show spanning-tree vlan 1'],
        expectedOutput: 'STP topology understood, root identified',
        routing: 'N/A',
        keypoints: ['Lowest Bridge ID wins root election', 'Bridge ID = priority (default 32768) + MAC', 'STP variants: PVST+, RSTP, MST'],
        verification: { type: 'option', expected: 'understood' }
      },
      {
        stepId: `${lab.id}-S-02`,
        title: 'Set Root Bridge Priority',
        instruction: 'Set priority to 4096 on root switch and 8192 on backup root.',
        commands: ['spanning-tree vlan 1 priority 4096', 'spanning-tree vlan 1 root primary'],
        expectedOutput: 'Root bridge election complete',
        routing: 'N/A',
        keypoints: ['Use 4096 increments for clarity', 'root primary macro sets priority', 'root secondary on backup'],
        verification: { type: 'cli', expected: 'spanning-tree vlan' }
      },
      {
        stepId: `${lab.id}-S-03`,
        title: 'Configure PortFast and BPDU Guard',
        instruction: 'PortFast moves access ports directly to forwarding. BPDU Guard disables port if BPDU received.',
        commands: ['interface fa0/1', 'spanning-tree portfast', 'spanning-tree bpduguard enable'],
        expectedOutput: 'PortFast and BPDU Guard on access ports',
        routing: 'N/A',
        keypoints: ['PortFast only on access ports', 'BPDU Guard protects against rogue switches', 'Never enable on trunk ports'],
        verification: { type: 'cli', expected: 'spanning-tree portfast' }
      },
      {
        stepId: `${lab.id}-S-04`,
        title: 'Verify STP State',
        instruction: 'Use "show spanning-tree" to verify roles: Root, Designated, Alternate, Backup. Confirm expected blocked ports.',
        commands: ['show spanning-tree', 'show spanning-tree summary'],
        expectedOutput: 'Correct port roles, expected ports blocked',
        routing: 'N/A',
        keypoints: ['FWD = Forwarding, BLK = Blocking', 'Root port faces root bridge', 'Designated port = forwarder on segment'],
        verification: { type: 'cli', expected: 'show spanning-tree' }
      },
      {
        stepId: `${lab.id}-S-05`,
        title: 'Test and Save',
        instruction: 'Test loop prevention by simulating failure. Save config.',
        commands: ['show spanning-tree interface <iface> detail', 'copy running-config startup-config'],
        expectedOutput: 'STP working, config saved',
        routing: 'N/A',
        keypoints: ['Save config'],
        verification: { type: 'cli', expected: 'show spanning-tree' }
      }
    ];
  }

  if (title.includes('ipv6')) {
    return [
      {
        stepId: `${lab.id}-S-01`,
        title: 'Review IPv6 Addressing Plan',
        instruction: `IPv6 uses 128-bit addresses in hex. Link-local (FE80::/10) auto-generated. Global unicast (2000::/3) routable.\n\nDevices: ${deviceNames.join(', ')}`,
        commands: ['show ipv6 interface brief', 'show ipv6 route'],
        expectedOutput: 'IPv6 plan understood',
        routing: 'No IPv6 yet',
        keypoints: ['Link-local auto-generated per interface', 'Global unicast manually assigned', 'No broadcast in IPv6 (use multicast)'],
        verification: { type: 'option', expected: 'understood' }
      },
      {
        stepId: `${lab.id}-S-02`,
        title: 'Enable IPv6 Routing and Assign Addresses',
        instruction: 'Use "ipv6 unicast-routing" to enable IPv6. Assign with "ipv6 address <addr>/<prefix>".',
        commands: ['ipv6 unicast-routing', 'interface gi0/0', 'ipv6 address 2001:db8:1::1/64', 'no shutdown'],
        expectedOutput: 'IPv6 addresses assigned',
        routing: 'IPv6 routing enabled',
        keypoints: ['unicast-routing enables forwarding', 'Use /64 for subnets', 'EUI-64 can auto-generate host portion'],
        verification: { type: 'cli', expected: 'ipv6 address' }
      },
      {
        stepId: `${lab.id}-S-03`,
        title: 'Configure OSPFv3 or Static IPv6',
        instruction: 'For OSPFv3: "ipv6 router ospf 1", "router-id <ip>", then "ipv6 ospf 1 area 0" on interfaces. For static: "ipv6 route <dest> <next-hop>".',
        commands: ['ipv6 router ospf 1', 'router-id 1.1.1.1', 'interface gi0/0', 'ipv6 ospf 1 area 0'],
        expectedOutput: 'IPv6 routing active',
        routing: 'OSPFv3 or static routes',
        keypoints: ['OSPFv3 uses IPv6 link-local for neighbor adjacency', 'Area 0 required', 'Use router-id in IPv4 format'],
        verification: { type: 'cli', expected: 'ipv6 router ospf' }
      },
      {
        stepId: `${lab.id}-S-04`,
        title: 'Verify IPv6',
        instruction: 'Use "show ipv6 interface brief", "show ipv6 neighbors", "show ipv6 route".',
        commands: ['show ipv6 interface brief', 'show ipv6 neighbors', 'show ipv6 route'],
        expectedOutput: 'IPv6 interfaces up, neighbors reachable, routes present',
        routing: 'IPv6 routing operational',
        keypoints: ['Neighbors replace ARP', 'Routes show O, C, S, etc.'],
        verification: { type: 'cli', expected: 'show ipv6' }
      },
      {
        stepId: `${lab.id}-S-05`,
        title: 'Test with ping6 and Save',
        instruction: 'Use "ping <ipv6-addr>". Save config.',
        commands: ['ping 2001:db8:1::2', 'copy running-config startup-config'],
        expectedOutput: 'IPv6 ping successful, config saved',
        routing: 'IPv6 complete',
        keypoints: ['Save config'],
        verification: { type: 'cli', expected: 'ping' }
      }
    ];
  }

  if (title.includes('troubleshoot') || category.includes('troubleshoot')) {
    return [
      {
        stepId: `${lab.id}-S-01`,
        title: 'Identify the Symptom and Scope',
        instruction: `Use structured troubleshooting: define the problem, gather facts, consider possibilities, create action plan, implement, observe, iterate.\n\nIssue: ${lab.scenario || 'Network connectivity problem'}. Devices: ${deviceNames.join(', ')}.`,
        commands: ['show ip interface brief', 'show ip route', 'show ip protocols'],
        expectedOutput: 'Problem scope identified',
        routing: 'N/A',
        keypoints: ['Structured methodology: OSI bottom-up or top-down', 'Document symptoms first', 'Isolate the scope (single host, segment, full network)'],
        verification: { type: 'option', expected: 'understood' }
      },
      {
        stepId: `${lab.id}-S-02`,
        title: 'Layer 1-2 Verification',
        instruction: 'Check physical layer: cable, port status, interface state. Use "show interfaces" to check for errors, CRC, runts, giants.',
        commands: ['show interfaces', 'show interfaces status', 'show mac address-table'],
        expectedOutput: 'Physical layer verified',
        routing: 'N/A',
        keypoints: ['CRC errors = bad cable', 'Runts/giants = duplex mismatch', 'Input errors = physical problem'],
        verification: { type: 'cli', expected: 'show interfaces' }
      },
      {
        stepId: `${lab.id}-S-03`,
        title: 'Layer 3 Verification',
        instruction: 'Check IP configuration: "show ip interface brief" to see IPs and status. Check routing: "show ip route". Check ARP: "show arp".',
        commands: ['show ip interface brief', 'show ip route', 'show arp', 'show vlan brief'],
        expectedOutput: 'Layer 3 issues identified',
        routing: 'Verify routing table',
        keypoints: ['Missing IP = misconfig', 'Missing route = routing problem', 'VLAN mismatch = same subnet, different VLAN'],
        verification: { type: 'cli', expected: 'show ip interface brief' }
      },
      {
        stepId: `${lab.id}-S-04`,
        title: 'Test Connectivity',
        instruction: 'Use ping to test: localhost, default gateway, remote network. Use traceroute to find failure point.',
        commands: ['ping 127.0.0.1', 'ping <gateway>', 'ping <remote>', 'traceroute <remote>'],
        expectedOutput: 'Failure point identified',
        routing: 'N/A',
        keypoints: ['Start local, work outward', 'traceroute shows hop-by-hop', 'Stop at first failed hop'],
        verification: { type: 'cli', expected: 'ping' }
      },
      {
        stepId: `${lab.id}-S-05`,
        title: 'Apply Fix and Verify',
        instruction: `Apply the identified fix. Verify with show commands and ping. Document root cause.\n\nLikely fix: ${lab.solution || 'Apply configuration to address identified issue'}`,
        commands: ['<fix-commands>', 'show running-config', 'ping <target>', 'copy running-config startup-config'],
        expectedOutput: 'Issue resolved, config saved',
        routing: 'N/A',
        keypoints: ['Document the fix', 'Save config', 'Verify the resolution'],
        verification: { type: 'cli', expected: 'ping' }
      }
    ];
  }

  // Generic fallback but more meaningful
  return [
    {
      stepId: `${lab.id}-S-01`,
      title: `Review ${lab.category || 'Network'} Lab Scenario`,
      instruction: `Read the lab scenario carefully. Identify devices (${deviceNames.join(', ')}), required IP addresses:\n${ipTable.slice(0, 6).map(i => `${i.device} ${i.interface}: ${i.ip}/${i.mask}`).join('\n')}\n\nNote the connections:\n${conns.slice(0, 4).join('\n')}`,
      commands: ['show ip interface brief', 'show ip route'],
      expectedOutput: 'Lab requirements understood',
      routing: 'No configuration yet',
      keypoints: ['Identify devices and IP plan', 'Map connections', 'Determine goals'],
      verification: { type: 'option', expected: 'understood' }
    },
    {
      stepId: `${lab.id}-S-02`,
      title: 'Configure IP Addressing',
      instruction: 'Enable on all devices with proper IP and subnet mask. Use "no shutdown" to activate interfaces.',
      commands: ['enable', 'configure terminal', 'interface <name>', 'ip address <ip> <mask>', 'no shutdown'],
      expectedOutput: 'All interfaces up',
      routing: 'Directly connected only',
      keypoints: ['Each interface needs correct IP', 'no shutdown activates', 'Verify with show ip int br'],
      verification: { type: 'cli', expected: 'no shutdown' }
    },
    {
      stepId: `${lab.id}-S-03`,
      title: 'Apply Core Configuration',
      instruction: `Configure ${lab.category || 'routing'} per the lab requirements. Reference: ${lab.objectives || 'Apply necessary configuration'}.`,
      commands: lab.scenario ? [lab.scenario.slice(0, 80)] : ['<configure per lab>'],
      expectedOutput: 'Configuration applied',
      routing: 'Routing in place',
      keypoints: ['Follow lab requirements', 'Verify after each change'],
      verification: { type: 'cli', expected: 'configure' }
    },
    {
      stepId: `${lab.id}-S-04`,
      title: 'Verify Routing and Output',
      instruction: 'Use "show ip route" and "show ip protocols" to verify. Test with ping.',
      commands: ['show ip route', 'show ip protocols', 'ping <target>'],
      expectedOutput: 'Routes correct, ping works',
      routing: 'Verified',
      keypoints: ['Check routing table', 'Test end-to-end'],
      verification: { type: 'cli', expected: 'show ip route' }
    },
    {
      stepId: `${lab.id}-S-05`,
      title: 'Troubleshoot and Save',
      instruction: 'If any issue, use structured troubleshooting. Save configuration when complete.',
      commands: ['copy running-config startup-config'],
      expectedOutput: 'Lab complete, config saved',
      routing: 'N/A',
      keypoints: ['Save config', 'Document changes'],
      verification: { type: 'option', expected: 'saved' }
    }
  ];
}

let improved = 0;
let alreadyGood = 0;

data.forEach(lab => {
  const isGenericStep = lab.steps && lab.steps.some(s => {
    const t = (s.title || '').toLowerCase();
    return t.includes('review lab scenario') || t.includes('plan ip addressing') || t.includes('apply core configuration') || t.includes('verify routing and output') || t.includes('troubleshoot common issue');
  });

  if (isGenericStep) {
    const newSteps = generateLabSteps(lab);
    if (newSteps && newSteps.length >= 3) {
      lab.steps = newSteps;
      improved++;
    }
  } else {
    alreadyGood++;
  }
});

fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
console.log(`Improved: ${improved} labs`);
console.log(`Already good: ${alreadyGood} labs`);
console.log(`Total: ${data.length}`);
