const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'frontend', 'src', 'data', 'labs.procedural.json');
const data = JSON.parse(fs.readFileSync(FILE, 'utf-8'));

const OBJECTIVES = {
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
  'Server Networking': 'Configure network services for servers including web and file servers',
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

// Fix all labs
let fixed = 0;
data.forEach(lab => {
  const cat = lab.category;
  
  // Fix learningObjective
  if (OBJECTIVE_MAP[cat] && lab.learningObjective !== OBJECTIVE_MAP[cat]) {
    lab.learningObjective = OBJECTIVE_MAP[cat];
    fixed++;
  }
  
  // Fix scenario
  if (SCENARIOS[cat] && lab.scenario !== SCENARIOS[cat]) {
    lab.scenario = SCENARIOS[cat];
    fixed++;
  }
  
  // Fix prerequisites based on difficulty
  if (lab.difficulty === 'basic') {
    lab.prerequisites = 'Basic computer literacy, understanding of IP addressing';
  } else if (lab.difficulty === 'intermediate') {
    lab.prerequisites = 'Basic routing/switching knowledge, IP addressing fundamentals';
  } else {
    lab.prerequisites = 'Advanced routing and switching configuration experience';
  }
});

fs.writeFileSync(FILE, JSON.stringify(data, null, 2));

// Report
const cats = {};
data.forEach(l => cats[l.category] = (cats[l.category]||0)+1);
console.log(`Fixed ${fixed} lab entries`);
console.log(`Categories: ${Object.keys(cats).length}`);
console.log(`Total labs: ${data.length}`);
console.log(`Total steps: ${data.reduce((s,l)=>s+l.steps.length,0)}`);

// Verify no null/empty objectives
const bad = data.filter(l => !l.learningObjective || !l.scenario);
console.log(`Labs with missing objective/scenario: ${bad.length}`);
bad.forEach(l => console.log('  ', l.id, l.title));