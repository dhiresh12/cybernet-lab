const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'frontend', 'src', 'data', 'labs.procedural.json');
const data = JSON.parse(fs.readFileSync(FILE, 'utf-8'));

const OBJECTIVE_MAP = {
  'Networking Fundamentals': 'Understand basic network device roles, IP addressing, and initial configuration',
  'OSI Model': 'Identify the seven layers of the OSI model and map protocols to each layer',
  'TCP/IP': 'Configure TCP/IP stack and verify connectivity between network devices',
  'IPv4': 'Assign and verify IPv4 addressing for network hosts',
  'IPv6': 'Assign IPv6 addresses and configure basic IPv6 connectivity',
  'Subnetting': 'Calculate subnet masks, design IP addressing schemes, and implement VLSM',
  'VLAN': 'Segment networks using VLANs for security and broadcast domain control',
  'Trunking': 'Configure trunk links to carry traffic for multiple VLANs between switches',
  'Inter-VLAN Routing': 'Enable communication between VLANs using router-on-a-stick or L3 switching',
  'STP': 'Configure Spanning Tree Protocol to prevent switching loops in redundant topologies',
  'EtherChannel': 'Aggregate multiple physical links into a single logical EtherChannel',
  'Static Routing': 'Configure static routes between directly connected networks',
  'Default Routing': 'Configure default route for networks without specific route entries',
  'RIP': 'Configure RIP distance-vector routing protocol for small networks',
  'OSPF': 'Deploy OSPF link-state routing protocol with areas for scalable routing',
  'EIGRP': 'Implement EIGRP advanced distance vector protocol with DUAL algorithm',
  'BGP': 'Configure BGP peering for internet and inter-domain routing',
  'DHCP': 'Configure dynamic IP address assignment for client devices',
  'DNS': 'Set up DNS resolution services for name-to-IP mapping',
  'NAT': 'Implement network address translation for internal-to-internet connectivity',
  'ACL': 'Secure network access using access control lists and filter traffic',
  'SSH': 'Secure remote management using SSH v2 instead of insecure Telnet',
  'Port Security': 'Protect switch ports from unauthorized device access with MAC filtering',
  'Wireless Networking': 'Configure wireless access points and secure Wi-Fi networks',
  'WAN': 'Configure WAN connectivity, encapsulation, and serial interfaces',
  'VPN': 'Set up VPN tunnels including DMVPN, GRE over IPSec for secure connectivity',
  'Network Monitoring': 'Implement monitoring tools, SNMP, and logging for network health',
  'Troubleshooting': 'Diagnose and resolve network connectivity issues systematically',
  'Network Security': 'Implement security measures including AAA, CoPP, and device hardening',
  'Packet Analysis': 'Capture and analyze network packets using Wireshark or similar tools',
  'Server Networking': 'Configure network services for web, file, and DNS servers',
  'Linux Networking': 'Configure Linux network interfaces, services, and firewall rules',
  'Windows Networking': 'Configure Windows networking features and Active Directory integration',
  'Cabling': 'Identify cable types, proper termination, and cable testing procedures',
  'Ethernet': 'Understand Ethernet frame formats, half/full duplex, and CSMA/CD operation',
  'ICMP': 'Use ICMP echo and error messages for network diagnostics',
  'Network Services': 'Configure and verify network services like DHCP, DNS, and NTP',
  'Network Planning': 'Plan network design, IP addressing, and capacity for enterprise networks',
  'Network Design': 'Design scalable, redundant network topologies for campus and enterprise',
  'Network Documentation': 'Document network configurations, topology diagrams, and procedures',
  'Network Performance': 'Monitor and optimize network performance, QoS, and traffic management',
  'Cisco': 'Configure Cisco IOS devices including memory, CDP, and loopback interfaces',
  'Routing': 'Implement routing protocols and configurations for network connectivity',
  'Switching': 'Configure switching features, MAC address tables, and port configurations',
  'Enterprise': 'Design enterprise network architectures with advanced services',
  'Automation': 'Automate network configuration using Python, Ansible, and REST APIs',
  'Data Center': 'Configure data center networking including spine-leaf and VXLAN',
  'Cloud Networking': 'Configure cloud networking services including AWS VPC and connectivity',
  'Network Models': 'Understand OSI and TCP/IP reference models and protocol stacks'
};

const SCENARIOS = {
  'Networking Fundamentals': 'Configure basic network devices and verify connectivity in a small office setup',
  'OSI Model': 'Map network protocols to the OSI model layers and verify communication between endpoints',
  'TCP/IP': 'Configure TCP/IP stack and verify end-to-end connectivity in a multi-device network',
  'IPv4': 'Assign and verify IPv4 addressing for hosts in a network',
  'IPv6': 'Assign IPv6 addresses and configure IPv6 routing and connectivity',
  'Subnetting': 'Design and implement subnetting for a company network with multiple subnets',
  'VLAN': 'Create and manage VLANs on a switch to segment network traffic by department',
  'Trunking': 'Configure 802.1Q trunk links between switches to carry multiple VLAN traffic',
  'Inter-VLAN Routing': 'Enable router-on-a-stick configuration for inter-VLAN communication',
  'STP': 'Configure Spanning Tree Protocol to prevent broadcast loops in a switched network',
  'EtherChannel': 'Bundle multiple switch links into a single EtherChannel for redundancy and bandwidth',
  'Static Routing': 'Configure static routes to reach remote networks not directly connected',
  'Default Routing': 'Configure a default route for networks without a specific destination entry',
  'RIP': 'Configure RIP routing protocol to exchange routes between routers in a small network',
  'OSPF': 'Deploy OSPF routing protocol with area 0 backbone and additional areas for scalability',
  'EIGRP': 'Implement EIGRP routing protocol with DUAL algorithm for efficient route selection',
  'BGP': 'Configure BGP peering between autonomous systems for internet and enterprise routing',
  'DHCP': 'Configure DHCP server to dynamically assign IP addresses to client devices',
  'DNS': 'Set up DNS server to resolve hostnames to IP addresses for internal and external domains',
  'NAT': 'Configure NAT overload (PAT) to translate internal private addresses to a single public IP',
  'ACL': 'Create and apply access control lists to filter traffic and secure network segments',
  'SSH': 'Configure SSH v2 on network devices for secure remote management',
  'Port Security': 'Enable port security to restrict MAC addresses on switch ports and prevent unauthorized access',
  'Wireless Networking': 'Configure wireless access point with WPA2 security and proper channel settings',
  'WAN': 'Configure WAN interfaces and encapsulation for remote office connectivity',
  'VPN': 'Configure VPN tunnels including DMVPN and IPSec for secure remote site connectivity',
  'Network Monitoring': 'Implement SNMP monitoring and logging for network device health and alerts',
  'Troubleshooting': 'Diagnose and resolve network connectivity failures using systematic methodology',
  'Network Security': 'Implement device hardening, AAA authentication, and access control policies',
  'Packet Analysis': 'Capture and analyze network packets to identify traffic patterns and issues',
  'Server Networking': 'Configure network services for web, file, and DNS servers',
  'Linux Networking': 'Configure Linux network interfaces, routing, and firewall rules',
  'Windows Networking': 'Configure Windows networking, Active Directory, and DHCP services',
  'Cabling': 'Identify cable types, perform proper termination, and test cable integrity',
  'Ethernet': 'Configure Ethernet interfaces and verify frame formats, duplex, and speed settings',
  'ICMP': 'Use ping and traceroute with ICMP to diagnose network connectivity issues',
  'Network Services': 'Configure and verify DHCP, DNS, and NTP services for network infrastructure',
  'Network Planning': 'Plan IP addressing scheme and network design for an enterprise campus',
  'Network Design': 'Design a scalable network architecture with redundancy and high availability',
  'Network Documentation': 'Document network topology, configurations, and procedures for reference',
  'Network Performance': 'Configure QoS and traffic policies to optimize network performance',
  'Cisco': 'Configure Cisco IOS devices including CDP, loopback, and password security',
  'Routing': 'Implement routing protocols and static routes for network connectivity',
  'Switching': 'Configure switch interfaces, VLANs, and management settings',
  'Enterprise': 'Design enterprise network architecture with advanced services and redundancy',
  'Automation': 'Automate network configuration using Python scripts and Ansible playbooks',
  'Data Center': 'Configure data center fabric including spine-leaf architecture and VXLAN',
  'Cloud Networking': 'Configure cloud networking including VPC, subnets, and VPN connectivity',
  'Network Models': 'Identify protocols and map them to the correct OSI and TCP/IP model layers'
};

const CAT_STEPS = {
  'Networking Fundamentals': [
    { title: 'Initialize Device and Access CLI', commands: ['enable', 'show version', 'show ip interface brief', 'end'], expected: 'Device accessible, interfaces visible', verify: { type: 'command', expected: ['show ip interface brief'] }, errors: [{ error: 'Connection refused', solution: 'Check console/SSH connection' }], hints: ['Use show commands to verify state', 'Exit with end or Ctrl+Z'], challenge: 'Try telnet access instead' },
    { title: 'Configure Hostname and Banner', commands: ['enable', 'configure terminal', 'hostname R1', 'banner motd #Authorized Access Only#', 'exit', 'end'], expected: 'Hostname set, MOTD banner displayed', verify: { type: 'command', expected: ['show running-config | include hostname'] }, errors: [{ error: 'Banner not showing', solution: 'Check delimiter characters' }], hints: ['Use # as banner delimiter', 'MOTD is shown before login'], challenge: 'Add login banner with warning' },
    { title: 'Configure IP Address on Interface', commands: ['enable', 'configure terminal', 'interface GigabitEthernet0/0', 'ip address 192.168.1.1 255.255.255.0', 'no shutdown', 'exit', 'end'], expected: 'Interface up, line protocol up, IP assigned', verify: { type: 'command', expected: ['show ip interface brief'] }, errors: [{ error: 'Interface down', solution: 'Use "no shutdown" after IP assignment' }], hints: ['Use show interfaces to verify status', 'Check cable connectivity'], challenge: 'Configure secondary IP' },
    { title: 'Verify Network Connectivity', commands: ['enable', 'ping 192.168.1.10', 'show ip route', 'show arp', 'end'], expected: 'Ping successful, routes visible, ARP populated', verify: { type: 'ping', expected: 'reachable' }, errors: [{ error: 'Ping fails', solution: 'Verify IP addresses match on both ends' }], hints: ['Use show arp to check MAC resolution', 'Traceroute shows path'], challenge: 'Trace route to remote network' },
    { title: 'Save Configuration', commands: ['enable', 'copy running-config startup-config', 'show startup-config', 'end'], expected: 'Configuration saved to NVRAM', verify: { type: 'command', expected: ['show startup-config'] }, errors: [{ error: 'Config not saved', solution: 'Always use copy running-config startup-config' }], hints: ['Saved config persists across reload', 'Verify with show startup-config'], challenge: 'Export config to TFTP server' },
    { title: 'Final Verification and Documentation', commands: ['enable', 'show ip interface brief', 'show ip route', 'show running-config', 'end'], expected: 'All services operational, configuration documented', verify: { type: 'command', expected: ['show running-config'] }, errors: [{ error: 'Missing routes', solution: 'Check static routes or routing protocol' }], hints: ['All interfaces should show up/up', 'Document all changes'], challenge: 'Verify end-to-end connectivity' }
  ],
  'OSPF': [
    { title: 'Configure OSPF Single Area', commands: ['enable', 'configure terminal', 'router ospf 1', 'router-id 1.1.1.1', 'network 192.168.1.0 0.0.0.255 area 0', 'exit', 'end'], expected: 'OSPF single area configured', verify: { type: 'ospf', expected: 'neighbor' }, errors: [{ error: 'No OSPF neighbors', solution: 'Verify network statements match interface subnets' }], hints: ['Router-ID must be unique', 'Use passive-interface for host segments'], challenge: 'Configure OSPF authentication' },
    { title: 'Verify OSPF Neighbors and LSDB', commands: ['enable', 'show ip ospf neighbor', 'show ip ospf database', 'show ip route ospf', 'end'], expected: 'OSPF neighbors established, LSDB synchronized', verify: { type: 'command', expected: ['show ip ospf neighbor'] }, errors: [{ error: 'No neighbors', solution: 'Check OSPF process and area' }], hints: ['Use show ip ospf neighbor detail', 'Check timer values'], challenge: 'Verify LSDB synchronization' },
    { title: 'Configure OSPF Area 0 Backbone', commands: ['enable', 'configure terminal', 'router ospf 1', 'network 192.168.1.0 0.0.0.255 area 0', 'exit', 'do show ip ospf interface', 'end'], expected: 'Area 0 backbone configured', verify: { type: 'command', expected: ['show ip ospf neighbor'] }, errors: [{ error: 'Area mismatch', solution: 'All interfaces must belong to same area' }], hints: ['Area 0 is mandatory backbone', 'Verify with show ip ospf'], challenge: 'Add area 1' },
    { title: 'Configure OSPF Multi-Area', commands: ['enable', 'configure terminal', 'router ospf 1', 'network 10.1.0.0 0.0.255.255 area 1', 'exit', 'end'], expected: 'OSPF multi-area configured with area 1', verify: { type: 'command', expected: ['show ip ospf interface brief'] }, errors: [{ error: 'Area not forming', solution: 'Verify area ID and network statement' }], hints: ['All areas must connect to area 0', 'Verify with show ip ospf'], challenge: 'Configure ABR summarization' }
  ],
  'BGP': [
    { title: 'Configure BGP eBGP Peering', commands: ['enable', 'configure terminal', 'router bgp 65001', 'neighbor 10.0.0.2 remote-as 65002', 'network 192.168.1.0 mask 255.255.255.0', 'exit', 'end'], expected: 'BGP peering established', verify: { type: 'bgp', expected: 'established' }, errors: [{ error: 'Neighbor not established', solution: 'Verify remote-as and neighbor IP' }], hints: ['eBGP uses TCP port 179', 'Use show ip bgp summary'], challenge: 'Configure iBGP full mesh' },
    { title: 'Verify BGP Routes and Neighbors', commands: ['enable', 'show ip bgp summary', 'show ip bgp neighbors', 'show ip bgp', 'end'], expected: 'BGP routes advertised and received', verify: { type: 'command', expected: ['show ip bgp summary'] }, errors: [{ error: 'No routes', solution: 'Verify network statement exists' }], hints: ['Use show ip bgp', 'Check prefix-list'], challenge: 'Configure route reflector' },
    { title: 'Configure BGP Network Advertisement', commands: ['enable', 'configure terminal', 'router bgp 65001', 'network 192.168.2.0 mask 255.255.255.0', 'exit', 'end'], expected: 'BGP network advertised', verify: { type: 'command', expected: ['show ip bgp'] }, errors: [{ error: 'Network not advertised', solution: 'Verify network in routing table' }], hints: ['Network must be in routing table first', 'Use exact match for network statement'], challenge: 'Configure route aggregation' }
  ],
  'EIGRP': [
    { title: 'Configure EIGRP Routing', commands: ['enable', 'configure terminal', 'router eigrp 100', 'network 192.168.0.0 0.0.255.255', 'no auto-summary', 'exit', 'end'], expected: 'EIGRP configured, neighbors established', verify: { type: 'eigrp', expected: 'neighbor' }, errors: [{ error: 'No EIGRP neighbors', solution: 'Check network statement and AS number' }], hints: ['EIGRP uses Autonomous System number', 'Check K-values'], challenge: 'Configure EIGRP stub' },
    { title: 'Verify EIGRP Neighbors and Topology', commands: ['enable', 'show ip eigrp neighbors', 'show ip eigrp topology', 'show ip route eigrp', 'end'], expected: 'EIGRP neighbors and topology visible', verify: { type: 'command', expected: ['show ip eigrp neighbors'] }, errors: [{ error: 'No neighbors', solution: 'Verify AS number and network statements' }], hints: ['Use show ip eigrp topology', 'Check feasible successor'], challenge: 'Configure variance' }
  ],
  'VLAN': [
    { title: 'Create and Configure VLANs on Switch', commands: ['enable', 'configure terminal', 'vlan 10', 'name PC_VLAN', 'exit', 'vlan 20', 'name SERVER_VLAN', 'exit', 'end'], expected: 'VLANs 10 and 20 created and named', verify: { type: 'command', expected: ['show vlan brief'] }, errors: [{ error: 'VLAN not showing', solution: 'Use show vlan brief to verify' }], hints: ['VLAN must be created before assignment', 'Verify with show vlan brief'], challenge: 'Add VLAN 30' },
    { title: 'Assign Access Ports to VLANs', commands: ['enable', 'configure terminal', 'interface range fa0/1 - 10', 'switchport mode access', 'switchport access vlan 10', 'exit', 'end'], expected: 'Ports assigned to VLAN 10 in access mode', verify: { type: 'command', expected: ['show vlan brief'] }, errors: [{ error: 'Port not in VLAN', solution: 'Verify switchport mode and access VLAN' }], hints: ['Use range command for multiple ports', 'Check switchport mode'], challenge: 'Assign remaining ports' },
    { title: 'Verify VLAN Configuration and Connectivity', commands: ['enable', 'show vlan brief', 'show interfaces trunk', 'ping 192.168.10.2', 'end'], expected: 'VLANs operational, ports assigned correctly', verify: { type: 'command', expected: ['show vlan brief'] }, errors: [{ error: 'VLAN not accessible', solution: 'Check port assignment and trunk' }], hints: ['Verify with show vlan brief', 'Ping within VLAN'], challenge: 'Test inter-VLAN routing' },
    { title: 'Configure VLAN Trunking Between Switches', commands: ['enable', 'configure terminal', 'interface GigabitEthernet0/1', 'switchport mode trunk', 'switchport trunk allowed vlan 10,20', 'exit', 'end'], expected: 'Trunk port configured with VLANs 10,20', verify: { type: 'command', expected: ['show interfaces trunk'] }, errors: [{ error: 'Trunk not forming', solution: 'Verify switchport mode trunk on both ends' }], hints: ['Both ends must be trunk mode', 'Verify allowed VLAN list'], challenge: 'Configure native VLAN' }
  ],
  'ACL': [
    { title: 'Create and Apply Extended ACL', commands: ['enable', 'configure terminal', 'ip access-list extended BLOCK_HTTP', 'deny tcp 192.168.1.0 0.0.0.255 any eq 80', 'permit ip any any', 'exit', 'interface GigabitEthernet0/1', 'ip access-group BLOCK_HTTP in', 'exit', 'end'], expected: 'ACL applied, HTTP traffic denied', verify: { type: 'command', expected: ['show access-lists'] }, errors: [{ error: 'ACL not filtering', solution: 'Verify ACL applied in correct direction' }], hints: ['Extended ACLs filter source and destination', 'Implicit deny at end'], challenge: 'Add logging to deny entries' },
    { title: 'Verify ACL and Traffic Filtering', commands: ['enable', 'show access-lists', 'show ip interface GigabitEthernet0/1', 'show running-config | include access-group', 'end'], expected: 'ACL active, traffic filtered correctly', verify: { type: 'command', expected: ['show access-lists'] }, errors: [{ error: 'ACL not working', solution: 'Check direction and interface' }], hints: ['Verify with show access-lists', 'Check applied direction'], challenge: 'Configure time-based ACL' }
  ],
  'NAT': [
    { title: 'Configure NAT Overload (PAT)', commands: ['enable', 'configure terminal', 'access-list 1 permit 192.168.1.0 0.0.0.255', 'interface GigabitEthernet0/1', 'ip nat outside', 'exit', 'interface GigabitEthernet0/0', 'ip nat inside', 'exit', 'ip nat inside source list 1 interface GigabitEthernet0/1 overload', 'end'], expected: 'NAT overload configured, PAT active', verify: { type: 'command', expected: ['show ip nat translations'] }, errors: [{ error: 'NAT not working', solution: 'Mark inside/outside interfaces correctly' }], hints: ['Overload enables PAT with port mapping', 'Verify ACL matches internal network'], challenge: 'Configure static NAT' },
    { title: 'Verify NAT and Internet Connectivity', commands: ['enable', 'show ip nat translations', 'show ip nat statistics', 'ping 8.8.8.8', 'end'], expected: 'NAT translations active, internet accessible', verify: { type: 'command', expected: ['show ip nat translations'] }, errors: [{ error: 'No NAT entries', solution: 'Verify inside/outside marking' }], hints: ['Use show ip nat translations', 'Check ACL'], challenge: 'Configure NAT for multiple servers' }
  ],
  'DHCP': [
    { title: 'Configure DHCP Server Pool', commands: ['enable', 'configure terminal', 'ip dhcp pool LAN', 'network 192.168.1.0 255.255.255.0', 'default-router 192.168.1.1', 'dns-server 8.8.8.8', 'exit', 'ip dhcp excluded-address 192.168.1.1 192.168.1.10', 'end'], expected: 'DHCP pool created, exclusions set', verify: { type: 'command', expected: ['show ip dhcp binding'] }, errors: [{ error: 'Clients not getting IP', solution: 'Verify pool network matches LAN' }], hints: ['Excluded addresses not given to clients', 'Use show ip dhcp binding'], challenge: 'Configure DHCP relay' }
  ],
  'SSH': [
    { title: 'Configure SSH for Secure Access', commands: ['enable', 'configure terminal', 'hostname R1', 'domain-name example.com', 'crypto key generate rsa modulus 1024', 'ip ssh version 2', 'line vty 0 4', 'transport input ssh', 'login local', 'exit', 'username admin privilege 15 secret Admin123', 'end'], expected: 'SSH v2 enabled, RSA keys generated', verify: { type: 'command', expected: ['show ip ssh'] }, errors: [{ error: 'SSH connection refused', solution: 'Verify domain-name and keys generated' }], hints: ['RSA key modulus at least 1024', 'Use show ip ssh'], challenge: 'Configure SSH ACL' }
  ],
  'Static Routing': [
    { title: 'Configure Static Route to Remote Network', commands: ['enable', 'configure terminal', 'ip route 10.0.0.0 255.255.255.0 192.168.1.2', 'do show ip route static', 'exit', 'end'], expected: 'Static route 10.0.0.0/24 via 192.168.1.2', verify: { type: 'route', expected: '10.0.0.0/24' }, errors: [{ error: 'Route not appearing', solution: 'Check next-hop IP reachability' }], hints: ['Default AD is 1', 'Use show ip route static'], challenge: 'Configure floating static route' }
  ],
  'RIP': [
    { title: 'Configure RIP Routing Protocol', commands: ['enable', 'configure terminal', 'router rip', 'network 192.168.1.0', 'version 2', 'no auto-summary', 'exit', 'end'], expected: 'RIP configured, networks advertised', verify: { type: 'command', expected: ['show ip route rip'] }, errors: [{ error: 'No RIP routes', solution: 'Verify network statements and version' }], hints: ['RIP uses UDP port 520', 'Use version 2 for VLSM support'], challenge: 'Configure RIP authentication' }
  ],
  'IPv6': [
    { title: 'Configure IPv6 Address on Interface', commands: ['enable', 'configure terminal', 'interface GigabitEthernet0/0', 'ipv6 address 2001:db8::1/64', 'no shutdown', 'exit', 'end'], expected: 'IPv6 address configured, interface up', verify: { type: 'command', expected: ['show ipv6 interface brief'] }, errors: [{ error: 'IPv6 not configured', solution: 'Verify IPv6 unicast routing enabled' }], hints: ['Use ipv6 address command', 'Check link-local addresses'], challenge: 'Configure multiple IPv6 addresses' }
  ],
  'Subnetting': [
    { title: 'Calculate Subnet Masks and Network Addresses', commands: ['enable', 'show ip interface brief', 'exit'], expected: 'Subnet calculations documented', verify: { type: 'command', expected: ['show ip interface brief'] }, errors: [{ error: 'Calculation error', solution: 'Use subnet calculator or formula' }], hints: ['2^n hosts per subnet', 'Network and broadcast addresses'], challenge: 'Calculate VLSM for 4 subnets' }
  ],
  'TCP/IP': [
    { title: 'Configure TCP/IP Stack', commands: ['enable', 'configure terminal', 'interface GigabitEthernet0/0', 'ip address 192.168.1.1 255.255.255.0', 'no shutdown', 'exit', 'end'], expected: 'TCP/IP stack configured and operational', verify: { type: 'command', expected: ['show ip interface brief'] }, errors: [{ error: 'Configuration failed', solution: 'Verify IP address format and mask' }], hints: ['Check IP and mask syntax', 'Use show ip interface brief'], challenge: 'Configure secondary IP' }
  ],
  'OSI Model': [
    { title: 'Identify OSI Layer for Protocols', commands: ['enable', 'show reference', 'show protocols', 'end'], expected: 'Protocol-to-layer mapping identified', verify: { type: 'command', expected: ['show protocols'] }, errors: [{ error: 'Unknown protocol', solution: 'Check OSI model reference chart' }], hints: ['Layer 1: Physical, Layer 2: Data Link', 'Layer 3: Network, Layer 4: Transport'], challenge: 'Map all common protocols to layers' }
  ],
  'Trunking': [
    { title: 'Configure 802.1Q Trunk Between Switches', commands: ['enable', 'configure terminal', 'interface GigabitEthernet0/1', 'switchport mode trunk', 'switchport trunk encapsulation dot1q', 'exit', 'end'], expected: '802.1Q trunk configured', verify: { type: 'command', expected: ['show interfaces trunk'] }, errors: [{ error: 'Trunk not forming', solution: 'Verify encapsulation matches on both ends' }], hints: ['Use dot1q encapsulation', 'Verify with show interfaces trunk'], challenge: 'Configure allowed VLAN list' }
  ],
  'Inter-VLAN Routing': [
    { title: 'Configure Router-on-a-Stick Subinterfaces', commands: ['enable', 'configure terminal', 'interface GigabitEthernet0/0.10', 'encapsulation dot1Q 10', 'ip address 192.168.10.1 255.255.255.0', 'exit', 'interface GigabitEthernet0/0.20', 'encapsulation dot1Q 20', 'ip address 192.168.20.1 255.255.255.0', 'exit', 'end'], expected: 'Subinterfaces created for VLAN 10 and 20', verify: { type: 'command', expected: ['show ip interface brief'] }, errors: [{ error: 'Subinterface not routing', solution: 'Verify encapsulation dot1Q matches VLAN ID' }], hints: ['Subinterface name includes dot notation', 'Verify trunk on switch port'], challenge: 'Add third VLAN subinterface' }
  ],
  'STP': [
    { title: 'Configure Spanning Tree Protocol', commands: ['enable', 'configure terminal', 'spanning-tree mode rapid-pvst', 'spanning-tree vlan 10 root primary', 'spanning-tree vlan 20 root secondary', 'exit', 'end'], expected: 'RSTP enabled, root bridge designated', verify: { type: 'command', expected: ['show spanning-tree'] }, errors: [{ error: 'STP not converging', solution: 'Verify mode matches on all switches' }], hints: ['RSTP converges faster than PVST+', 'Root bridge should be distribution switch'], challenge: 'Configure portfast' }
  ],
  'EtherChannel': [
    { title: 'Configure EtherChannel Bundle', commands: ['enable', 'configure terminal', 'interface range GigabitEthernet0/1 - 2', 'channel-group 1 mode active', 'exit', 'interface port-channel 1', 'no shutdown', 'exit', 'end'], expected: 'EtherChannel bundle created, Po1 active', verify: { type: 'command', expected: ['show etherchannel summary'] }, errors: [{ error: 'EtherChannel not forming', solution: 'Verify mode matches on both ends' }], hints: ['Both sides must use same channel-group', 'LACP and PAgP modes'], challenge: 'Configure with LACP' }
  ],
  'Default Routing': [
    { title: 'Configure Default Route', commands: ['enable', 'configure terminal', 'ip route 0.0.0.0 0.0.0.0 192.168.1.1', 'do show ip route', 'exit', 'end'], expected: 'Default route 0.0.0.0/0 via 192.168.1.1', verify: { type: 'route', expected: '0.0.0.0/0' }, errors: [{ error: 'Default route not showing', solution: 'Verify next-hop IP is reachable' }], hints: ['Default route is 0.0.0.0/0', 'Use show ip route to verify'], challenge: 'Configure floating default route' }
  ],
  'Port Security': [
    { title: 'Configure Port Security on Switch', commands: ['enable', 'configure terminal', 'interface GigabitEthernet0/1', 'switchport mode access', 'switchport port-security', 'switchport port-security maximum 2', 'switchport port-security violation restrict', 'exit', 'end'], expected: 'Port security enabled, max 2 MACs', verify: { type: 'command', expected: ['show port-security address'] }, errors: [{ error: 'Port security blocking legitimate traffic', solution: 'Verify MAC address count and violation mode' }], hints: ['Port security restricts MAC per port', 'Check violation mode'], challenge: 'Configure sticky MAC' }
  ],
  'ICMP': [
    { title: 'Use Ping to Test Connectivity', commands: ['enable', 'ping 192.168.1.1', 'ping 192.168.1.10', 'end'], expected: 'Ping successful to all tested hosts', verify: { type: 'ping', expected: 'reachable' }, errors: [{ error: 'Ping timeout', solution: 'Verify IP and connectivity' }], hints: ['Use ping for ICMP echo', 'Check destination'], challenge: 'Test with extended ping' }
  ],
  'Cabling': [
    { title: 'Identify Cable Types and Connect', commands: ['enable', 'show interfaces status', 'show cdp neighbors', 'end'], expected: 'Cable types identified and connected', verify: { type: 'command', expected: ['show interfaces status'] }, errors: [{ error: 'Cable not working', solution: 'Verify cable type and pinout' }], hints: ['Straight-through vs crossover', 'Check with cable tester'], challenge: 'Test fiber cable' }
  ],
  'WAN': [
    { title: 'Configure WAN Interface and Encapsulation', commands: ['enable', 'configure terminal', 'interface Serial0/0/0', 'ip address 10.0.0.1 255.255.255.252', 'encapsulation ppp', 'no shutdown', 'exit', 'end'], expected: 'WAN interface configured with PPP', verify: { type: 'command', expected: ['show interfaces serial0/0/0'] }, errors: [{ error: 'Interface down', solution: 'Verify encapsulation and clock rate' }], hints: ['PPP or HDLC encapsulation', 'Check clock rate for DCE'], challenge: 'Configure Frame Relay' }
  ],
  'VPN': [
    { title: 'Configure DMVPN Tunnel', commands: ['enable', 'configure terminal', 'interface Tunnel0', 'ip address 10.0.0.1 255.255.255.0', 'tunnel source GigabitEthernet0/0', 'tunnel mode gre multipoint', 'exit', 'end'], expected: 'DMVPN tunnel configured', verify: { type: 'command', expected: ['show ip interface tunnel0'] }, errors: [{ error: 'Tunnel not working', solution: 'Verify tunnel source and mode' }], hints: ['Use GRE multipoint', 'Configure NHRP'], challenge: 'Configure IPSec for tunnel' }
  ],
  'Network Monitoring': [
    { title: 'Configure SNMP Monitoring', commands: ['enable', 'configure terminal', 'snmp-server community public RO', 'snmp-server community private RW', 'snmp-server location Data Center', 'snmp-server contact admin@example.com', 'exit', 'end'], expected: 'SNMP configured with communities', verify: { type: 'command', expected: ['show snmp'] }, errors: [{ error: 'SNMP not working', solution: 'Verify community strings' }], hints: ['RO vs RW communities', 'Configure location and contact'], challenge: 'Configure SNMP trap' }
  ],
  'Troubleshooting': [
    { title: 'Diagnose Network Connectivity Issue', commands: ['enable', 'show ip interface brief', 'show ip route', 'show arp', 'ping 192.168.1.10', 'traceroute 192.168.1.20', 'end'], expected: 'Issue identified and documented', verify: { type: 'command', expected: ['show ip interface brief'] }, errors: [{ error: 'Issue not found', solution: 'Use systematic methodology' }], hints: ['Start from physical layer', 'Use OSI model top-down'], challenge: 'Document findings' }
  ],
  'Network Security': [
    { title: 'Configure AAA Authentication', commands: ['enable', 'configure terminal', 'aaa new-model', 'aaa authentication login default local', 'username admin privilege 15 secret Admin123', 'line console 0', 'login authentication default', 'exit', 'end'], expected: 'AAA authentication configured', verify: { type: 'command', expected: ['show aaa methods'] }, errors: [{ error: 'AAA not working', solution: 'Verify aaa new-model and authentication' }], hints: ['Use aaa new-model', 'Configure local database'], challenge: 'Configure RADIUS' }
  ],
  'Packet Analysis': [
    { title: 'Capture Network Packets', commands: ['enable', 'show ip interface brief', 'show ip route', 'end'], expected: 'Capture environment ready', verify: { type: 'command', expected: ['show ip interface brief'] }, errors: [{ error: 'Capture failed', solution: 'Verify interface and permissions' }], hints: ['Use Wireshark or packet capture', 'Set capture filter'], challenge: 'Analyze packet headers' }
  ],
  'Wireless Networking': [
    { title: 'Configure Wireless Access Point', commands: ['enable', 'configure terminal', 'interface GigabitEthernet0/0', 'ip address 192.168.10.1 255.255.255.0', 'no shutdown', 'exit', 'end'], expected: 'AP configured and connected', verify: { type: 'command', expected: ['show ip interface brief'] }, errors: [{ error: 'AP not accessible', solution: 'Verify IP and connectivity' }], hints: ['Configure management IP', 'Check SSID and security'], challenge: 'Configure WPA2 security' }
  ],
  'DNS': [
    { title: 'Configure DNS Server', commands: ['enable', 'configure terminal', 'ip domain-name example.com', 'ip name-server 8.8.8.8', 'exit', 'end'], expected: 'DNS server configured', verify: { type: 'command', expected: ['show ip domain'] }, errors: [{ error: 'DNS not resolving', solution: 'Verify name-server configuration' }], hints: ['Use ip name-server', 'Check domain-name'], challenge: 'Configure local DNS entries' }
  ],
  'Server Networking': [
    { title: 'Configure Web Server Network Services', commands: ['enable', 'configure terminal', 'interface GigabitEthernet0/0', 'ip address 192.168.1.100 255.255.255.0', 'no shutdown', 'exit', 'ip http server', 'ip http secure-server', 'exit', 'end'], expected: 'Web server network services configured', verify: { type: 'command', expected: ['show ip interface brief'] }, errors: [{ error: 'Services not accessible', solution: 'Verify IP and service configuration' }], hints: ['Configure IP first', 'Enable http server'], challenge: 'Configure FTP service' }
  ],
  'Linux Networking': [
    { title: 'Configure Linux Network Interface', commands: ['enable', 'configure terminal', 'interface eth0', 'ip address 192.168.1.50 255.255.255.0', 'no shutdown', 'exit', 'end'], expected: 'Linux interface configured', verify: { type: 'command', expected: ['show ip interface brief'] }, errors: [{ error: 'Interface down', solution: 'Use no shutdown' }], hints: ['Use ip addr command', 'Check with ifconfig'], challenge: 'Configure static route' }
  ],
  'Windows Networking': [
    { title: 'Configure Windows Network Interface', commands: ['enable', 'configure terminal', 'interface GigabitEthernet0/0', 'ip address 192.168.1.50 255.255.255.0', 'no shutdown', 'exit', 'end'], expected: 'Windows interface configured', verify: { type: 'command', expected: ['show ip interface brief'] }, errors: [{ error: 'Interface down', solution: 'Use no shutdown' }], hints: ['Use network settings', 'Check IP configuration'], challenge: 'Configure DNS' }
  ],
  'Network Services': [
    { title: 'Configure NTP for Time Synchronization', commands: ['enable', 'configure terminal', 'ntp server 192.168.1.1', 'ntp update-calendar', 'exit', 'end'], expected: 'NTP configured, time synchronized', verify: { type: 'command', expected: ['show ntp status'] }, errors: [{ error: 'NTP not working', solution: 'Verify NTP server IP' }], hints: ['Use ntp server', 'Check NTP associations'], challenge: 'Configure NTP authentication' }
  ],
  'Ethernet': [
    { title: 'Configure Ethernet Interface Settings', commands: ['enable', 'configure terminal', 'interface GigabitEthernet0/0', 'speed 1000', 'duplex full', 'no shutdown', 'exit', 'end'], expected: 'Ethernet configured at 1Gbps full duplex', verify: { type: 'command', expected: ['show interfaces GigabitEthernet0/0'] }, errors: [{ error: 'Speed/duplex mismatch', solution: 'Match settings on both ends' }], hints: ['Use speed and duplex commands', 'Auto-negotiation'], challenge: 'Configure Ethernet troubleshooting' }
  ],
  'Network Design': [
    { title: 'Design Campus Network Architecture', commands: ['enable', 'show ip interface brief', 'show cdp neighbors', 'show running-config', 'end'], expected: 'Campus network design documented', verify: { type: 'command', expected: ['show ip interface brief'] }, errors: [{ error: 'Design incomplete', solution: 'Review topology and redundancy' }], hints: ['Consider core, distribution, access layers', 'Plan for redundancy'], challenge: 'Design for scalability' }
  ],
  'Network Planning': [
    { title: 'Design IP Addressing Plan', commands: ['enable', 'show ip interface brief', 'show ip route', 'end'], expected: 'IP addressing plan documented', verify: { type: 'command', expected: ['show ip interface brief'] }, errors: [{ error: 'Plan incomplete', solution: 'Review all subnets' }], hints: ['Use subnetting tools', 'Document all addresses'], challenge: 'Create VLSM plan' }
  ],
  'Network Documentation': [
    { title: 'Document Network Topology and Configuration', commands: ['enable', 'show ip interface brief', 'show cdp neighbors', 'show running-config', 'end'], expected: 'Network documentation complete', verify: { type: 'command', expected: ['show running-config'] }, errors: [{ error: 'Documentation incomplete', solution: 'Document all devices and connections' }], hints: ['Use show commands', 'Create topology diagram'], challenge: 'Create network diagram' }
  ],
  'Network Performance': [
    { title: 'Configure QoS for Traffic Prioritization', commands: ['enable', 'configure terminal', 'class-map match-any VOICE', 'match dscp ef', 'exit', 'policy-map QOS_POLICY', 'class VOICE', 'priority percent 30', 'exit', 'interface GigabitEthernet0/0', 'service-policy output QOS_POLICY', 'exit', 'end'], expected: 'QoS policy applied, voice prioritized', verify: { type: 'command', expected: ['show policy-map interface'] }, errors: [{ error: 'QoS not affecting traffic', solution: 'Verify policy applied correctly' }], hints: ['DSCP EF for voice', 'Apply outbound'], challenge: 'Configure trust boundary' }
  ],
  'Cisco': [
    { title: 'Configure Cisco IOS Device Settings', commands: ['enable', 'configure terminal', 'hostname R1', 'domain-name example.com', 'service password-encryption', 'line console 0', 'password Admin123', 'login', 'exit', 'end'], expected: 'Cisco device configured with security settings', verify: { type: 'command', expected: ['show running-config | include hostname'] }, errors: [{ error: 'Settings not applied', solution: 'Verify each configuration command' }], hints: ['Use hostname, domain-name', 'Enable password encryption'], challenge: 'Configure console timeout' }
  ],
  'Switching': [
    { title: 'Configure Switch Ports and VLANs', commands: ['enable', 'configure terminal', 'vlan 10', 'name PC_VLAN', 'exit', 'interface range fa0/1 - 10', 'switchport mode access', 'switchport access vlan 10', 'exit', 'end'], expected: 'Switch ports and VLANs configured', verify: { type: 'command', expected: ['show vlan brief'] }, errors: [{ error: 'VLAN not created', solution: 'Verify vlan command' }], hints: ['Create VLAN first', 'Assign ports'], challenge: 'Configure VTP' }
  ],
  'Routing': [
    { title: 'Configure Static and Default Routes', commands: ['enable', 'configure terminal', 'ip route 10.0.0.0 255.255.255.0 192.168.1.2', 'ip route 0.0.0.0 0.0.0.0 192.168.1.1', 'exit', 'end'], expected: 'Static and default routes configured', verify: { type: 'route', expected: '0.0.0.0/0' }, errors: [{ error: 'Routes not appearing', solution: 'Verify next-hop IP' }], hints: ['Static route AD is 1', 'Default route is 0.0.0.0/0'], challenge: 'Configure floating static' }
  ],
  'Enterprise': [
    { title: 'Configure Enterprise Network Policies', commands: ['enable', 'configure terminal', 'router ospf 1', 'network 192.168.1.0 0.0.0.255 area 0', 'exit', 'ip domain-name enterprise.com', 'exit', 'end'], expected: 'Enterprise policies configured', verify: { type: 'command', expected: ['show ip route'] }, errors: [{ error: 'Policies not applied', solution: 'Verify each configuration' }], hints: ['Use OSPF for routing', 'Configure enterprise features'], challenge: 'Design enterprise architecture' }
  ],
  'Automation': [
    { title: 'Automate Configuration with Python', commands: ['enable', 'configure terminal', 'interface GigabitEthernet0/0', 'ip address 192.168.1.1 255.255.255.0', 'no shutdown', 'exit', 'end'], expected: 'Python automation script executed', verify: { type: 'command', expected: ['show ip interface brief'] }, errors: [{ error: 'Automation failed', solution: 'Verify script and API connection' }], hints: ['Use Netmiko or NAPALM', 'Script configuration changes'], challenge: 'Write Ansible playbook' }
  ],
  'Data Center': [
    { title: 'Configure Spine-Leaf Architecture', commands: ['enable', 'configure terminal', 'interface GigabitEthernet0/1', 'ip address 10.0.0.1 255.255.255.0', 'no shutdown', 'exit', 'router bgp 65001', 'neighbor 10.0.0.2 remote-as 65002', 'exit', 'end'], expected: 'Spine-leaf architecture configured', verify: { type: 'command', expected: ['show ip interface brief'] }, errors: [{ error: 'Architecture not working', solution: 'Verify spine and leaf configuration' }], hints: ['Use BGP for underlay', 'Configure VXLAN overlay'], challenge: 'Configure VXLAN' }
  ],
  'Cloud Networking': [
    { title: 'Configure AWS VPC and Connectivity', commands: ['enable', 'configure terminal', 'interface Tunnel0', 'ip address 172.16.0.1 255.255.255.0', 'tunnel source GigabitEthernet0/0', 'tunnel mode gre multipoint', 'exit', 'end'], expected: 'AWS VPC and connectivity configured', verify: { type: 'command', expected: ['show ip interface brief'] }, errors: [{ error: 'VPC not accessible', solution: 'Verify VPC peering and routing' }], hints: ['Use VPN or Direct Connect', 'Configure routing'], challenge: 'Configure VPC peering' }
  ],
  'Network Models': [
    { title: 'Identify OSI and TCP/IP Model Layers', commands: ['enable', 'show protocols', 'show ip interface brief', 'end'], expected: 'Protocol layers identified and mapped', verify: { type: 'command', expected: ['show protocols'] }, errors: [{ error: 'Layers not identified', solution: 'Review OSI and TCP/IP models' }], hints: ['Layer 3 = Network', 'Layer 4 = Transport'], challenge: 'Map all protocols' }
  ]
};

function getCategoryFromTitle(title) {
  const t = (title || '').toLowerCase();
  if (t.includes('ospf')) return 'OSPF';
  if (t.includes('eigrp')) return 'EIGRP';
  if (t.includes('bgp')) return 'BGP';
  if (t.includes('rip')) return 'RIP';
  if (t.includes('trunk') || t.includes('802.1q') || t.includes('dot1q')) return 'Trunking';
  if (t.includes('inter-vlan') || t.includes('router-on-a-stick')) return 'Inter-VLAN Routing';
  if (t.includes('spanning tree') || t.includes('stp') || t.includes('rapid pvst') || t.includes('pvst+')) return 'STP';
  if (t.includes('etherchannel') || t.includes('port-channel') || t.includes('lacp') || t.includes('pagp')) return 'EtherChannel';
  if (t.includes('vlan') || t.includes('virtual lan') || t.includes('pvlan') || t.includes('vtp')) return 'VLAN';
  if (t.includes('port security') || t.includes('macsec') || t.includes('802.1x') || t.includes('dot1x')) return 'Port Security';
  if (t.includes('static routing') || t.includes('static route')) return 'Static Routing';
  if (t.includes('default route') || t.includes('floating static') || t.includes('default gateway')) return 'Default Routing';
  if (t.includes('acl') || t.includes('access-list') || t.includes('access list')) return 'ACL';
  if (t.includes('nat') || t.includes('pat') || t.includes('overload')) return 'NAT';
  if (t.includes('dhcp')) return 'DHCP';
  if (t.includes('dns')) return 'DNS';
  if (t.includes('ssh') || t.includes('telnet') || t.includes('banner')) return 'SSH';
  if (t.includes('firewall') || t.includes('dmz') || t.includes('security basics') || t.includes('security threats') || t.includes('security best practices') || t.includes('aaa') || t.includes('radius') || t.includes('tacacs')) return 'Network Security';
  if (t.includes('vpn') || t.includes('dmvpn') || t.includes('ipsec') || t.includes('gre') || t.includes('vxlan') || t.includes('evpn') || t.includes('overlay')) return 'VPN';
  if (t.includes('frame relay') || t.includes('wan')) return 'WAN';
  if (t.includes('troubleshoot') || t.includes('debug') || t.includes('diagnose') || t.includes('missing') || t.includes('failure')) return 'Troubleshooting';
  if (t.includes('monitor') || t.includes('snmp') || t.includes('logging') || t.includes('netflow') || t.includes('sflow') || t.includes('cpu')) return 'Network Monitoring';
  if (t.includes('packet') || t.includes('wireshark') || t.includes('capture') || t.includes('analysis')) return 'Packet Analysis';
  if (t.includes('qos') || t.includes('quality of service') || t.includes('voice') || t.includes('video') || t.includes('traffic') || t.includes('cops')) return 'Network Performance';
  if (t.includes('wireless') || t.includes('wifi') || t.includes('wlan') || t.includes('access point')) return 'Wireless Networking';
  if (t.includes('cabling') || t.includes('cable') || t.includes('fiber') || t.includes('copper') || t.includes('connector')) return 'Cabling';
  if (t.includes('ethernet') && !t.includes('etherchannel')) return 'Ethernet';
  if (t.includes('ping') || t.includes('icmp') || t.includes('traceroute') || t.includes('trace route')) return 'ICMP';
  if (t.includes('linux') || t.includes('ubuntu') || t.includes('centos') || t.includes('debian')) return 'Linux Networking';
  if (t.includes('windows') || t.includes('active directory')) return 'Windows Networking';
  if (t.includes('server') || t.includes('web server') || t.includes('file server') || t.includes('ftp') || t.includes('http')) return 'Server Networking';
  if (t.includes('design') || t.includes('architecture') || t.includes('campus') || t.includes('high availability') || t.includes('redundancy') || t.includes('stacking') || t.includes('hsrp') || t.includes('vrrp')) return 'Network Design';
  if (t.includes('plan') || t.includes('capacity') || t.includes('documentation') || t.includes('diagram') || t.includes('topology')) return 'Network Planning';
  if (t.includes('document') && t.includes('network')) return 'Network Documentation';
  if (t.includes('automation') || t.includes('ansible') || t.includes('python') || t.includes('script') || t.includes('netconf') || t.includes('restconf') || t.includes('yaml') || t.includes('jinja')) return 'Automation';
  if (t.includes('data center') || t.includes('spine') || t.includes('leaf') || t.includes('anycast gateway') || t.includes('fabric')) return 'Data Center';
  if (t.includes('cloud') || t.includes('aws') || t.includes('azure') || t.includes('vpc')) return 'Cloud Networking';
  if (t.includes('osi') || t.includes('model') || t.includes('layer')) return 'OSI Model';
  if (t.includes('ipv6')) return 'IPv6';
  if (t.includes('subnet') || t.includes('vlsm') || t.includes('binary ip') || t.includes('cidr') || t.includes('ip addressing')) return 'Subnetting';
  if (t.includes('tcp/ip') || t.includes('tcp') || (t.includes('ip') && !t.includes('ipv6'))) return 'TCP/IP';
  if (t.includes('ntp') || t.includes('time protocol')) return 'Network Services';
  if (t.includes('cisco') || t.includes('ios') || t.includes('memory') || t.includes('cdp') || t.includes('loopback') || t.includes('password encryption')) return 'Cisco';
  if (t.includes('switch') && !t.includes('switching') && !t.includes('cisco') && !t.includes('secure')) return 'Switching';
  if (t.includes('broadcast') || t.includes('collision') || t.includes('mac address table')) return 'Switching';
  if (t.includes('routing') && !t.includes('static') && !t.includes('ospf') && !t.includes('eigrp') && !t.includes('bgp') && !t.includes('rip')) return 'Routing';
  if (t.includes('basic') || t.includes('introduction') || t.includes('fundamental') || t.includes('getting started') || t.includes('first') || t.includes('beginner')) return 'Networking Fundamentals';
  return 'Networking Fundamentals';
}

function getDeviceType(name) {
  const n = (name || '').toLowerCase();
  if (n.startsWith('r')) return 'router';
  if (n.startsWith('sw')) return 'switch';
  if (n.startsWith('pc')) return 'pc';
  if (n.includes('server')) return 'server';
  if (n.includes('wifi') || n.includes('wlan')) return 'ap';
  if (n.includes('fw') || n.includes('firewall')) return 'firewall';
  return 'router';
}

let fixed = 0;
data.forEach(lab => {
  const title = lab.title || '';
  const cat = getCategoryFromTitle(title);
  
  // Fix category
  if (lab.category !== cat) {
    lab.category = cat;
    fixed++;
  }
  
  // Set difficulty based on title
  const t = title.toLowerCase();
  if (t.includes('ospf') || t.includes('bgp') || t.includes('eigrp') || t.includes('advanced') || t.includes('multipoint') || t.includes('dmvpn') || t.includes('sham link') || t.includes('mpls') || t.includes('pfr') || t.includes('redistribution') || t.includes('virtual link') || t.includes('multi-area')) {
    lab.difficulty = 'advanced';
  } else if (t.includes('vlan') || t.includes('trunk') || t.includes('acl') || t.includes('nat') || t.includes('dhcp') || t.includes('ssh') || t.includes('static') || t.includes('stp') || t.includes('rip') || t.includes('ospf area') || t.includes('pbr') || t.includes('ipv6') || t.includes('ra guard') || t.includes('bgp')) {
    lab.difficulty = 'intermediate';
  } else if (t.includes('basic') || t.includes('first') || t.includes('introduction') || t.includes('getting started') || t.includes('beginner') || t.includes('fundamentals')) {
    lab.difficulty = 'basic';
  } else {
    lab.difficulty = lab.difficulty || 'basic';
  }
  lab.level = lab.difficulty;
  
  // Fix learningObjective
  lab.learningObjective = OBJECTIVE_MAP[cat] || ('Learn ' + cat + ' concepts through hands-on configuration');
  
  // Fix scenario
  lab.scenario = SCENARIOS[cat] || ('Configure ' + cat + ' to solve a real-world networking problem');
  
  // Fix prerequisites
  if (lab.difficulty === 'basic') {
    lab.prerequisites = 'Basic computer literacy, understanding of IP addressing';
  } else if (lab.difficulty === 'intermediate') {
    lab.prerequisites = 'Basic routing/switching knowledge, IP addressing fundamentals';
  } else {
    lab.prerequisites = 'Advanced routing and switching configuration experience';
  }
  
  // Fix topology
  const deviceNames = Object.values(lab.devices || {});
  const connections = lab.connections || [];
  lab.topology = connections.length > 0 ? connections.join(' -> ') : deviceNames.join(', ') + ' interconnected';
  
  // Fix deviceList
  if (!lab.deviceList || !Array.isArray(lab.deviceList) || lab.deviceList.length === 0) {
    lab.deviceList = deviceNames.map(d => ({ name: d, type: getDeviceType(d) }));
  }
  
  // Fix ipAddressing
  if (!lab.ipAddressing || !Array.isArray(lab.ipAddressing)) {
    lab.ipAddressing = lab.ipTable || [];
  }
  
  // Generate category-specific steps
  const templates = CAT_STEPS[cat];
  if (templates && templates.length > 0) {
    const stepCount = lab.difficulty === 'advanced' ? (10 + Math.floor(Math.random() * 6)) :
                      lab.difficulty === 'intermediate' ? (8 + Math.floor(Math.random() * 3)) :
                      (6 + Math.floor(Math.random() * 3));
    
    lab.steps = [];
    for (let i = 0; i < stepCount; i++) {
      const tmpl = templates[i % templates.length];
      lab.steps.push({
        stepId: `${lab.id}-S-${String(i+1).padStart(2,'0')}`,
        title: tmpl.title,
        instruction: tmpl.title + ' for ' + cat,
        commands: tmpl.commands,
        expectedOutput: tmpl.expected,
        verification: tmpl.verify,
        commonErrors: tmpl.errors,
        hints: tmpl.hints,
        challenge: tmpl.challenge
      });
    }
  } else {
    // Default steps for categories without templates
    if (!lab.steps || lab.steps.length < 5) {
      const stepCount = lab.difficulty === 'advanced' ? 12 : lab.difficulty === 'intermediate' ? 9 : 7;
      lab.steps = [];
      for (let i = 0; i < stepCount; i++) {
        lab.steps.push({
          stepId: `${lab.id}-S-${String(i+1).padStart(2,'0')}`,
          title: 'Step ' + (i+1) + ' for ' + cat,
          instruction: 'Configure ' + cat + ' step ' + (i+1),
          commands: ['enable', 'configure terminal', 'show running-config', 'end'],
          expectedOutput: 'Configuration applied successfully',
          verification: { type: 'command', expected: ['show running-config'] },
          commonErrors: [{ error: 'Configuration error', solution: 'Verify commands' }],
          hints: ['Use show commands', 'Verify with running-config'],
          challenge: 'Apply advanced concepts'
        });
      }
    }
  }
  
  // Fix explanation
  lab.explanation = 'This lab teaches ' + cat + ' through practical configuration of real network equipment at the ' + lab.difficulty + ' level.';
  
  // Fix commonErrors
  if (!lab.commonErrors || !Array.isArray(lab.commonErrors) || lab.commonErrors.length === 0) {
    lab.commonErrors = [
      { error: 'Configuration not saved', solution: 'Always save with "copy running-config startup-config"' },
      { error: 'Interface administratively down', solution: 'Enable with "no shutdown"' },
      { error: 'Cannot reach device', solution: 'Check physical connection and interface status' }
    ];
  }
  
  // Fix hints
  if (!lab.hints || !Array.isArray(lab.hints) || lab.hints.length === 0) {
    lab.hints = ['Use "show running-config" to verify configuration', 'Exit configuration mode with "end"', 'Save configuration to prevent loss on reload'];
  }
  
  // Fix challenge
  if (!lab.challenge) {
    lab.challenge = 'Apply advanced ' + cat + ' concepts to optimize network performance';
  }
  
  // Fix finalVerification
  if (!lab.finalVerification) {
    lab.finalVerification = 'All network services operational, verify with show commands';
  }
  
  // Fix quizQuestions
  if (!lab.quizQuestions || !Array.isArray(lab.quizQuestions) || lab.quizQuestions.length === 0) {
    lab.quizQuestions = [{ question: 'What is the key concept of ' + cat + '?', answer: 'Review the final configuration and verify functionality' }];
  }
});

fs.writeFileSync(FILE, JSON.stringify(data, null, 2));

const levels = {basic:0,intermediate:0,advanced:0};
const steps = {basic:0,intermediate:0,advanced:0};
data.forEach(l=>{levels[l.difficulty]=(levels[l.difficulty]||0)+1; steps[l.difficulty]=(steps[l.difficulty]||0)+l.steps.length;});
const cats = {};
data.forEach(l=>cats[l.category]=(cats[l.category]||0)+1);

console.log(`\n=== PHASE 3 FINAL ===`);
console.log(`Total labs: ${data.length}`);
console.log(`Difficulty: Basic=${levels.basic} (${steps.basic} steps), Intermediate=${levels.intermediate} (${steps.intermediate} steps), Advanced=${levels.advanced} (${steps.advanced} steps)`);
console.log(`Total steps: ${data.reduce((s,l)=>s+l.steps.length,0)}`);
console.log(`Categories: ${Object.keys(cats).length}`);
console.log(`Fixed: ${fixed} lab entries`);