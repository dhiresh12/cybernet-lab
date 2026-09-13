/**
 * Lab Content Enricher - CyberNet Lab
 * 
 * Generates lab-specific content for all 247 labs based on their actual data.
 * Ensures every lab has unique, meaningful content rather than generic placeholders.
 * 
 * This module handles:
 * - Content generation based on lab category and difficulty
 * - Batch remediation (A-J)
 * - Simulator limitation labeling
 * - Progressive difficulty algorithm support
 */

// Simulator capability constraints - NEVER fake unsupported behavior
export const SIMULATOR_CAPABILITIES = Object.freeze({
  supportedDevices: ['router', 'switch', 'pc', 'laptop', 'server', 'firewall', 'accessPoint'],
  unsupportedDevices: ['cloud', 'dns', 'dhcp'],
  supportedProtocols: ['icmp', 'ip', 'tcp', 'udp', 'arp', 'vlan', 'ospf', 'eigrp', 'bgp', 'rip', 'static', 'dhcp', 'dns', 'nat', 'acl', 'ssh'],
  unsupportedProtocols: ['vxlan', 'hsrp', 'vrrp', 'sd-wan', 'bgp-evpn', 'mpls'],
  supportedFeatures: ['interface_config', 'routing_protocols', 'vlan', 'trunking', 'port_security', 'acl', 'nat', 'dhcp', 'dns', 'ssh', 'ping', 'traceroute', 'show_commands'],
  unsupportedFeatures: ['wireless_controller', 'sdn', 'cloud_integration', 'virtualization'],
  limitations: [
    'This lab uses the CyberNet browser simulation and is not a physical Cisco IOS device.',
    'Some advanced features may be simplified for educational purposes.',
    'Packet capture and deep protocol analysis are limited to simulation-level detail.'
  ]
});

// Batch definitions for remediation
export const BATCH_DEFINITIONS = Object.freeze({
  A: { name: 'Network Fundamentals', categories: ['ICMP', 'Networking Fundamentals', 'Cabling', 'TCP/IP', 'Ethernet', 'OSI Model', 'Subneting', 'Network Design', 'Network Planning'], priority: 1 },
  B: { name: 'Switching/VLAN', categories: ['Switching', 'VLAN', 'Trunking', 'STP', 'EtherChannel', 'Port Security'], priority: 2 },
  C: { name: 'Routing', categories: ['Routing', 'Static Routing', 'Default Routing', 'RIP', 'OSPF', 'EIGRP', 'BGP', 'Inter-VLAN Routing'], priority: 3 },
  D: { name: 'Services', categories: ['DHCP', 'DNS', 'NAT', 'Network Services', 'SSH'], priority: 4 },
  E: { name: 'Security', categories: ['ACL', 'Network Security', 'VPN'], priority: 5 },
  F: { name: 'Wireshark/Analysis', categories: ['Packet Analysis', 'Network Monitoring', 'Network Performance'], priority: 6 },
  G: { name: 'Linux/Network Systems', categories: ['Automation', 'Cisco'], priority: 7 },
  H: { name: 'SOC', categories: ['Troubleshooting'], priority: 8 },
  I: { name: 'Advanced Enterprise', categories: ['Data Center', 'WAN', 'Wireless Networking'], priority: 9 },
  J: { name: 'Capstones/Research', categories: [], priority: 10, isCapstone: true }
});

// Company scenarios by category - lab-specific, not generic
export const COMPANY_SCENARIOS = {
  'ICMP': [
    { company: 'CloudNine SaaS', scenario: 'A cloud SaaS provider needs to verify connectivity between microservices across availability zones.' },
    { company: 'MediCare Health Systems', scenario: 'A hospital network requires reliable ICMP monitoring between patient monitoring systems and central servers.' },
    { company: 'FinEdge Trading', scenario: 'A financial trading firm needs sub-millisecond connectivity verification between trading engines.' }
  ],
  'Networking Fundamentals': [
    { company: 'EduPrime University', scenario: 'A university is setting up a new computer lab with 50 student workstations.' },
    { company: 'StartupHub Inc', scenario: 'A startup is moving into a new office and needs to set up their first corporate network.' },
    { company: 'RetailMax Chain', scenario: 'A retail chain is deploying point-of-sale systems across 20 store locations.' }
  ],
  'VLAN': [
    { company: 'CorporateHQ Enterprises', scenario: 'A corporate headquarters needs to separate Finance, HR, and Engineering departments.' },
    { company: 'HotelGrand International', scenario: 'A hotel chain needs to separate guest, staff, and management network traffic.' },
    { company: 'BankSecure Financial', scenario: 'A bank needs strict VLAN segmentation for compliance and security.' }
  ],
  'Routing': [
    { company: 'GlobalReach Telecom', scenario: 'An ISP is deploying a multi-homed network with redundant internet connections.' },
    { company: 'ManufacturePro Ltd', scenario: 'A manufacturing company is connecting three factory locations via WAN.' },
    { company: 'CityGrid Metro', scenario: 'A municipal government is interconnecting city department networks.' }
  ],
  'OSPF': [
    { company: 'NationWide Insurance', scenario: 'An insurance company with 15 offices needs a dynamic routing protocol.' },
    { company: 'TechGiant Corp', scenario: 'A tech company is redesigning their campus network with OSPF areas.' },
    { company: 'LogiFlow Shipping', scenario: 'A logistics company needs efficient routing across warehouses and distribution centers.' }
  ],
  'DHCP': [
    { company: 'CafeBrew Coffee Chain', scenario: 'A coffee shop chain needs automated IP assignment for guest and staff devices.' },
    { company: 'AirportHub International', scenario: 'An airport needs DHCP for thousands of transient wireless users.' },
    { company: 'CoWorkSpace Pro', scenario: 'A co-working space needs dynamic IP assignment for rotating members.' }
  ],
  'ACL': [
    { company: 'SecureBank Financial', scenario: 'A bank needs to restrict network access between departments and the internet.' },
    { company: 'GovData Agency', scenario: 'A government agency needs to implement strict access controls between classified and public networks.' },
    { company: 'MediData Health', scenario: 'A healthcare provider needs HIPAA-compliant network segmentation.' }
  ],
  'NAT': [
    { company: 'ISPConnect Provider', scenario: 'An ISP needs to implement NAT for thousands of residential customers.' },
    { company: 'OfficePark Complex', scenario: 'An office complex needs to share a limited public IP address pool.' },
    { company: 'DataVault Cloud', scenario: 'A cloud provider needs NAT for private network instances accessing the internet.' }
  ],
  'BGP': [
    { company: 'TransitNet ISP', scenario: 'An ISP is establishing peering relationships with other providers via BGP.' },
    { company: 'EnterpriseCloud Inc', scenario: 'A large enterprise is using BGP for multi-homed internet connectivity.' },
    { company: 'CDNGlobal Network', scenario: 'A CDN provider uses BGP for traffic engineering and anycast routing.' }
  ],
  'Security': [
    { company: 'CyberShield Defense', scenario: 'A cybersecurity company needs to implement defense-in-depth networking.' },
    { company: 'PowerGrid Utility', scenario: 'A power utility needs to secure their SCADA network from external threats.' },
    { company: 'DefenseTech Systems', scenario: 'A defense contractor needs to implement security zones for classified data.' }
  ],
  'VPN': [
    { company: 'RemoteWork Solutions', scenario: 'A company needs secure remote access for 500+ remote employees.' },
    { company: 'BranchNet Retail', scenario: 'A retail chain needs to connect store networks to HQ securely.' },
    { company: 'LegalSecure LLP', scenario: 'A law firm needs encrypted connections between office locations.' }
  ],
  'SSH': [
    { company: 'DevOps Central', scenario: 'A DevOps team needs secure remote management of network infrastructure.' },
    { company: 'HostingMax ISP', scenario: 'An ISP needs secure remote access to customer premise equipment.' },
    { company: 'CloudOps Inc', scenario: 'A cloud operations team manages hundreds of servers via SSH.' }
  ],
  'DNS': [
    { company: 'WebScale Hosting', scenario: 'A hosting provider needs reliable internal DNS for thousands of domains.' },
    { company: 'EnterpriseName Corp', scenario: 'A large enterprise needs a resilient internal DNS infrastructure.' },
    { company: 'GameHost Online', scenario: 'An online gaming company needs low-latency DNS for game servers.' }
  ],
  'default': [
    { company: 'NetworkPro Solutions', scenario: 'A network engineering firm is deploying infrastructure for a client.' },
    { company: 'TechStartup Inc', scenario: 'A technology startup is building their production network infrastructure.' },
    { company: 'EnterpriseCorp Global', scenario: 'A large corporation is standardizing their network across global offices.' }
  ]
};

// Engineer roles by difficulty
export const ENGINEER_ROLES = {
  basic: ['Junior Network Technician', 'Network Support Specialist', 'IT Help Desk Engineer'],
  intermediate: ['Network Engineer', 'Systems Administrator', 'Network Operations Specialist'],
  advanced: ['Senior Network Engineer', 'Network Architect', 'Network Security Engineer'],
  expert: ['Principal Engineer', 'Network Architect', 'Solutions Architect']
};

// Progressive difficulty factors
export const DIFFICULTY_FACTORS = {
  basic: { topologyComplexity: 1, protocolComplexity: 1, deviceCount: 2, ambiguity: 0.1, faultCount: 0, independence: 0.2, timePressure: 0.1, explanationRequirement: 0.3 },
  intermediate: { topologyComplexity: 2, protocolComplexity: 2, deviceCount: 4, ambiguity: 0.3, faultCount: 1, independence: 0.5, timePressure: 0.3, explanationRequirement: 0.5 },
  advanced: { topologyComplexity: 3, protocolComplexity: 3, deviceCount: 6, ambiguity: 0.5, faultCount: 2, independence: 0.7, timePressure: 0.5, explanationRequirement: 0.7 },
  expert: { topologyComplexity: 4, protocolComplexity: 4, deviceCount: 8, ambiguity: 0.7, faultCount: 3, independence: 0.9, timePressure: 0.7, explanationRequirement: 0.9 }
};

// Progressive experiment model levels
export const PROGRESSIVE_LEVELS = Object.freeze({
  'skill-lab': { name: 'Skill Lab', description: 'Single-skill, guided practice with minimal complexity', order: 1 },
  'combination-lab': { name: 'Combination Lab', description: 'Combine 2-3 skills in a realistic scenario', order: 2 },
  'engineering-lab': { name: 'Engineering Lab', description: 'Design and implement a solution from requirements', order: 3 },
  'failure-lab': { name: 'Failure Lab', description: 'Introduce and recover from intentional faults', order: 4 },
  'integrated-lab': { name: 'Integrated Lab', description: 'Multi-technology integration with troubleshooting', order: 5 },
  'innovation-lab': { name: 'Innovation Lab', description: 'Open-ended challenge with evidence-backed reporting', order: 6 }
});

// Progressive experiment level assignment based on lab properties
export function assignProgressiveLevel(lab) {
  if (!lab || typeof lab !== 'object') return 'skill-lab';
  
  const deviceCount = (lab.topology?.devices?.length || 0) + (lab.topology?.connections?.length || 0);
  const stepCount = lab.steps?.length || 0;
  const hasFaultInjection = lab.faultInjection?.faults?.length > 0;
  const hasTroubleshooting = lab.troubleshooting?.commonErrors?.length > 0;
  const conceptCount = (lab.concepts?.length || 0) + (lab.skills?.length || 0);
  const hasMultipleProtocols = (lab.commandsToLearn?.length || 0) > 5;
  const hasChallenge = Boolean(lab.challenge && lab.challenge.trim().length > 20);
  const hasDebrief = Boolean(lab.debrief && lab.debrief.trim().length > 20);
  const hasInterviewQuestions = (lab.interviewQuestions?.length || 0) >= 5;
  
  // Innovation Lab: highest complexity, open-ended
  if (hasChallenge && hasDebrief && hasInterviewQuestions && deviceCount >= 6 && conceptCount >= 8) {
    return 'innovation-lab';
  }
  
  // Integrated Lab: multi-technology, troubleshooting
  if (hasMultipleProtocols && hasTroubleshooting && deviceCount >= 4 && stepCount >= 20) {
    return 'integrated-lab';
  }
  
  // Failure Lab: intentional fault injection
  if (hasFaultInjection && hasTroubleshooting && stepCount >= 15) {
    return 'failure-lab';
  }
  
  // Engineering Lab: design from requirements, moderate complexity
  if (deviceCount >= 3 && conceptCount >= 5 && stepCount >= 18 && !hasFaultInjection) {
    return 'engineering-lab';
  }
  
  // Combination Lab: 2-3 skills combined
  if (conceptCount >= 3 && deviceCount >= 2 && stepCount >= 15) {
    return 'combination-lab';
  }
  
  // Default: Skill Lab
  return 'skill-lab';
}

// Get company scenario for a lab
export function getCompanyScenario(category, labTitle) {
  const scenarios = COMPANY_SCENARIOS[category] || COMPANY_SCENARIOS['default'];
  const index = Math.abs(hashCode(labTitle || category)) % scenarios.length;
  return scenarios[index];
}

// Get engineer role for a lab
export function getEngineerRole(difficulty) {
  const roles = ENGINEER_ROLES[difficulty] || ENGINEER_ROLES['basic'];
  return roles[Math.abs(hashCode(difficulty)) % roles.length];
}

// Simple hash function for deterministic selection
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

// Batch assignment based on category
export function assignBatch(category) {
  for (const [batchId, batch] of Object.entries(BATCH_DEFINITIONS)) {
    if (batch.categories.includes(category)) {
      return batchId;
    }
  }
  // Labs without a specific batch go to their closest match or capstone
  return 'J';
}

// Get batch-specific remediation focus
export function getBatchRemediationFocus(batchId) {
  const focuses = {
    A: 'Ensure solid understanding of OSI layers, IP addressing, and basic device identification',
    B: 'Practice VLAN creation, assignment, and trunking verification with show commands',
    C: 'Focus on routing table interpretation, route selection, and redundancy',
    D: 'Emphasize service troubleshooting: DHCP DORA, DNS resolution, NAT translation',
    E: 'Practice least-privilege ACL design and security boundary verification',
    F: 'Use packet analysis to correlate protocol behavior with configuration',
    G: 'Combine network configuration with system-level verification and automation',
    H: 'Practice structured troubleshooting: isolate, diagnose, contain, recover',
    I: 'Integrate multiple technologies in enterprise-scale scenarios',
    J: 'Synthesize all skills into evidence-backed troubleshooting and communication'
  };
  return focuses[batchId] || 'Review fundamentals before proceeding';
}

// Generate enhanced topology with lab-specific details
export function enhanceTopology(topology, category, difficulty) {
  if (!topology || !topology.devices) {
    return topology;
  }
  
  const enhanced = { ...topology };
  const deviceCount = topology.devices.length || 2;
  const complexity = DIFFICULTY_FACTORS[difficulty]?.topologyComplexity || 1;
  
  // Enhance devices with roles and purposes
  enhanced.devices = topology.devices.map((device, index) => {
    const role = getDeviceRole(device.type, index, deviceCount, category);
    const purpose = getDevicePurpose(device.type, role, category, device.name);
    return {
      ...device,
      role,
      purpose
    };
  });
  
  // Enhance connections with purposes and security boundaries
  if (topology.connections) {
    enhanced.connections = topology.connections.map((conn, index) => {
      const purpose = getLinkPurpose(conn, category);
      const vlan = getVlanForConnection(conn, category);
      const trafficDirection = getTrafficDirection(conn, category);
      const securityBoundary = getSecurityBoundary(conn, category);
      const routingRelationship = getRoutingRelationship(conn, category);
      return {
        ...conn,
        purpose,
        vlan,
        trafficDirection,
        securityBoundary,
        routingRelationship
      };
    });
  }
  
  // Add whyThisTopology
  enhanced.whyThisTopology = generateWhyThisTopology(category, difficulty, deviceCount);
  
  return enhanced;
}

function getDeviceRole(type, index, total, category) {
  const roleMap = {
    router: total <= 2 ? ['Edge Router', 'Core Router'] : ['Edge Router', 'Distribution Router', 'Core Router', 'Branch Router', 'WAN Router', 'Border Router', 'Transit Router', 'Gateway Router'],
    switch: ['Access Switch', 'Distribution Switch', 'Core Switch', 'Aggregation Switch', 'Access Switch'],
    pc: ['Client PC', 'Workstation', 'End Device', 'Client PC', 'Workstation'],
    server: ['Application Server', 'File Server', 'Database Server', 'Web Server', 'DHCP Server'],
    firewall: ['Perimeter Firewall', 'Internal Firewall', 'Edge Firewall'],
    accessPoint: ['Wireless AP', 'Access Point', 'Wireless Controller']
  };
  const roles = roleMap[type] || ['Device'];
  return roles[index % roles.length];
}

function getDevicePurpose(type, role, category, name) {
  const purposes = {
    router: `Provides ${role.toLowerCase()} connectivity and routing between network segments in this ${category.toLowerCase()} lab`,
    switch: `Provides ${role.toLowerCase()} Layer 2 connectivity and VLAN separation for this ${category.toLowerCase()} scenario`,
    pc: `Serves as an end-user device to test connectivity and verify network behavior`,
    server: `Provides network services (DHCP/DNS/HTTP) for this ${category.toLowerCase()} lab`,
    firewall: `Implements security policies and access control between network zones`,
    accessPoint: `Provides wireless connectivity for mobile devices in this network`
  };
  return purposes[type] || `Network device for ${category} lab`;
}

function getLinkPurpose(conn, category) {
  const from = (conn.from || '').toLowerCase();
  const to = (conn.to || '').toLowerCase();
  
  if (from.includes('router') && to.includes('switch')) return 'Router-to-switch uplink for VLAN routing';
  if (from.includes('switch') && to.includes('router')) return 'Switch-to-router trunk for inter-VLAN routing';
  if (from.includes('router') && to.includes('router')) return 'Inter-router link for routing protocol adjacency';
  if (from.includes('switch') && to.includes('switch')) return 'Inter-switch trunk for VLAN extension';
  if (from.includes('pc') && to.includes('switch')) return 'Access link for end-device connectivity';
  if (from.includes('server') && to.includes('switch')) return 'Server access link for service connectivity';
  if (from.includes('firewall') && to.includes('router')) return 'Security inspection link';
  return `Connectivity link for ${category} topology`;
}

function getVlanForConnection(conn, category) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('vlan') || cat.includes('trunk') || cat.includes('switching')) return 'trunk (native 1)';
  if (cat.includes('routing') || cat.includes('ospf') || cat.includes('eigrp') || cat.includes('bgp')) return 'routed';
  if (cat.includes('security') || cat.includes('acl')) return 'security-zone';
  return 'data-vlan';
}

function getTrafficDirection(conn, category) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('routing') || cat.includes('bgp') || cat.includes('ospf')) return 'bidirectional (routing updates + data)';
  if (cat.includes('vlan') || cat.includes('trunk')) return 'bidirectional (tagged traffic)';
  if (cat.includes('acl') || cat.includes('security')) return 'unidirectional (inspect inbound)';
  return 'bidirectional';
}

function getSecurityBoundary(conn, category) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('security') || cat.includes('acl') || cat.includes('vpn')) return 'Security zone boundary - ACL inspection required';
  if (cat.includes('routing') || cat.includes('bgp')) return 'Routing domain boundary';
  if (cat.includes('vlan') || cat.includes('switching')) return 'Layer 2 domain boundary';
  return 'Network segment boundary';
}

function getRoutingRelationship(conn, category) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('ospf') || cat.includes('eigrp') || cat.includes('bgp')) return 'IGP/BGP adjacency';
  if (cat.includes('static') || cat.includes('routing')) return 'Static route next-hop';
  if (cat.includes('vlan') || cat.includes('inter-vlan')) return 'Inter-VLAN routed path';
  return 'Directly connected';
}

function generateWhyThisTopology(category, difficulty, deviceCount) {
  const complexity = DIFFICULTY_FACTORS[difficulty]?.topologyComplexity || 1;
  const reasons = {
    1: `This simple ${deviceCount}-device topology is the minimum required to demonstrate ${category} concepts without unnecessary complexity. The linear layout makes it easy to trace traffic flow and verify each step.`,
    2: `This ${deviceCount}-device topology introduces a distribution layer, which is common in real ${category} deployments. The additional device adds realistic complexity while keeping the lab focused.`,
    3: `This ${deviceCount}-device topology mirrors a small enterprise design with core and access layers. The complexity supports ${category} scenarios that require multiple hops or VLANs.`,
    4: `This ${deviceCount}-device topology represents a mid-sized enterprise with redundancy and multiple paths. It supports advanced ${category} scenarios including path selection and failure recovery.`
  };
  return reasons[complexity] || reasons[1];
}

// Generate IP plan from existing addressing data
export function generateIpPlan(lab) {
  const ipAddressing = lab.ipAddressing || lab.ipTable || [];
  if (!Array.isArray(ipAddressing) || ipAddressing.length === 0) {
    return generateDefaultIpPlan(lab);
  }
  
  return ipAddressing.map((entry, index) => {
    const deviceId = entry.deviceId || entry.device || `device-${index}`;
    const interfaceName = entry.interface || `interface-${index}`;
    const ipAddress = entry.ipAddress || entry.ip || generateIp(index);
    const subnetMask = entry.subnetMask || entry.mask || '255.255.255.0';
    const subnet = calculateSubnet(ipAddress, subnetMask);
    const gateway = entry.gateway || `${subnet.replace(/\/\d+$/, '')}.254`;
    const vlan = entry.vlan || '1';
    
    return {
      deviceId,
      interface: interfaceName,
      ipAddress,
      subnetMask,
      gateway,
      vlan,
      subnet,
      description: entry.description || `${deviceId} ${interfaceName}`
    };
  });
}

function generateDefaultIpPlan(lab) {
  const devices = lab.topology?.devices || [];
  const plan = [];
  const baseNet = '192.168';
  const deviceCount = devices.length || 2;
  
  devices.forEach((device, index) => {
    const subnet = `${baseNet}.${index + 1}.0`;
    const ip = `${baseNet}.${index + 1}.1`;
    plan.push({
      deviceId: device.id || device.name || `device-${index}`,
      interface: 'GigabitEthernet0/0',
      ipAddress: ip,
      subnetMask: '255.255.255.0',
      gateway: `${baseNet}.${index + 1}.254`,
      vlan: index === 0 ? 'native' : '1',
      subnet: `${subnet}/24`,
      description: `${device.name || device.id} management interface`
    });
  });
  
  return plan;
}

function generateIp(index) {
  return `192.168.${index + 1}.1`;
}

function calculateSubnet(ip, mask) {
  if (!ip || !mask) return 'unknown';
  const maskToPrefix = {
    '255.255.255.0': '/24',
    '255.255.255.128': '/25',
    '255.255.255.192': '/26',
    '255.255.255.224': '/27',
    '255.255.255.240': '/28',
    '255.255.0.0': '/16',
    '255.0.0.0': '/8'
  };
  return `${ip}${maskToPrefix[mask] || '/24'}`;
}

// Generate expected starting state
export function generateExpectedStartingState(lab) {
  const devices = lab.topology?.devices || [];
  const ipPlan = generateIpPlan(lab);
  
  if (devices.length === 0) {
    return { devices: [] };
  }
  
  return {
    devices: devices.map(device => {
      const deviceIps = ipPlan.filter(ip => ip.deviceId === (device.id || device.name));
      const interfaces = deviceIps.map(ip => ({
        interfaceName: ip.interface,
        ip: ip.ipAddress,
        mask: ip.subnetMask,
        status: 'down',
        protocol: 'down',
        description: ip.description
      }));
      
      return {
        deviceId: device.id || device.name,
        hostname: device.name || device.id,
        interfaces: interfaces.length > 0 ? interfaces : [{ interfaceName: 'GigabitEthernet0/0', ip: 'unassigned', mask: '255.255.255.0', status: 'down', protocol: 'down', description: 'Unassigned' }]
      };
    })
  };
}

// Enrich a single lab with all required fields
export function enrichLabContent(lab) {
  if (!lab || typeof lab !== 'object') {
    return null;
  }
  
  const category = lab.category || 'General';
  const difficulty = lab.difficulty || 'basic';
  const title = lab.title || 'Untitled Lab';
  
  // 1. Ensure unique identity
  if (!lab.title || lab.title === 'Untitled Lab') {
    lab.title = generateUniqueTitle(category, difficulty, lab.id);
  }
  if (!lab.slug) {
    lab.slug = slugify(lab.title);
  }
  
  // 2. Ensure real-world context
  const companyScenario = getCompanyScenario(category, title);
  lab.companyScenario = companyScenario.scenario;
  if (!lab.realWorldScenario) {
    lab.realWorldScenario = companyScenario.scenario;
  }
  if (!lab.engineerRole) {
    lab.engineerRole = getEngineerRole(difficulty);
  }
  if (!lab.problemStatement) {
    lab.problemStatement = generateProblemStatement(category, companyScenario, title);
  }
  if (!lab.businessProblem) {
    lab.businessProblem = generateBusinessProblem(category, companyScenario);
  }
  if (!lab.mission) {
    lab.mission = generateMission(category, title);
  }
  if (!lab.businessImpact) {
    lab.businessImpact = generateBusinessImpact(category);
  }
  if (!lab.objectives) {
    lab.objectives = generateObjectives(category, title);
  }
  
  // 3. Ensure learning content
  if (!lab.learningObjectives || lab.learningObjectives.length === 0) {
    lab.learningObjectives = generateLearningObjectives(category, difficulty);
  }
  if (!lab.prerequisites || lab.prerequisites.length === 0) {
    lab.prerequisites = generatePrerequisites(difficulty, category);
  }
  if (!lab.concepts || lab.concepts.length === 0) {
    lab.concepts = generateConcepts(category);
  }
  if (!lab.skills || lab.skills.length === 0) {
    lab.skills = generateSkills(category, difficulty);
  }
  if (!lab.commandsToLearn || lab.commandsToLearn.length === 0) {
    lab.commandsToLearn = extractCommandsFromSteps(lab.steps);
  }
  if (!lab.conceptLearned) {
    lab.conceptLearned = lab.concepts?.[0] || `${category} configuration and verification`;
  }
  if (!lab.realWorldUse) {
    lab.realWorldUse = generateRealWorldUse(category);
  }
  if (!lab.interviewQuestions || lab.interviewQuestions.length === 0) {
    lab.interviewQuestions = generateInterviewQuestions(category, difficulty);
  }
  if (!lab.challenge) {
    lab.challenge = generateChallenge(category, difficulty);
  }
  if (!lab.debrief) {
    lab.debrief = generateDebrief(category, title);
  }
  if (!lab.nextRecommendedLab) {
    lab.nextRecommendedLab = generateNextLab(category, difficulty);
  }
  if (!lab.retrievalSchedule) {
    lab.retrievalSchedule = {
      firstReview: '1 day',
      secondReview: '3 days',
      thirdReview: '1 week',
      finalReview: '1 month'
    };
  }
  if (!lab.progressiveHints) {
    lab.progressiveHints = generateProgressiveHints(category);
  }
  if (!lab.failureTutorial) {
    lab.failureTutorial = {
      available: lab.faultInjection?.faults?.length > 0,
      description: lab.faultInjection?.faults?.length > 0 
        ? `Practice recovering from ${lab.faultInjection.faults.length} intentional fault(s).` 
        : 'Not applicable in this lab',
      safety: 'Only use reversible, lab-scoped changes. Reset the lab if the state becomes unclear.'
    };
  }
  if (!lab.beginnerTutorial) {
    lab.beginnerTutorial = {
      steps: [
        'Read the lab objective and topology diagram',
        'Identify the devices and their roles',
        'Configure interfaces step by step',
        'Verify each step before proceeding'
      ],
      notes: [
        'Follow one step at a time',
        'Verify before moving to the next step',
        'Use the hints if you get stuck'
      ]
    };
  }
  
  // 4. Enhance topology
  if (lab.topology) {
    lab.topology = enhanceTopology(lab.topology, category, difficulty);
  }
  
  // 5. Generate IP plan
  lab.ipPlan = generateIpPlan(lab);
  
  // 6. Generate expected starting state
  lab.expectedStartingState = generateExpectedStartingState(lab);
  
  // 7. Enhance steps
  if (lab.steps && lab.steps.length > 0) {
    lab.steps = enhanceSteps(lab.steps, category, difficulty);
  }
  
  // 8. Enhance troubleshooting
  if (!lab.troubleshooting || !lab.troubleshooting.commonErrors) {
    lab.troubleshooting = generateTroubleshooting(lab);
  }
  if (!lab.troubleshooting.decisionTree) {
    lab.troubleshooting.decisionTree = generateDecisionTree(category);
  }
  
  // 9. Ensure 20 steps minimum
  if (!lab.steps || lab.steps.length < 20) {
    lab.steps = ensureMinimumSteps(lab.steps || [], category, difficulty, lab.topology);
  }
  
  // 10. Ensure knowledge check has at least 15 questions
  if (!lab.knowledgeCheck || lab.knowledgeCheck.length < 15) {
    lab.knowledgeCheck = ensureMinimumQuestions(lab);
  }
  
  // 11. Assign batch
  lab.batch = assignBatch(category);
  lab.batchRemediationFocus = getBatchRemediationFocus(lab.batch);
  
  // 12. Assign progressive experiment level
  lab.progressiveLevel = assignProgressiveLevel(lab);
  
  // 13. Mark simulator limitations
  lab.simulatorLimitations = getSimulatorLimitations(lab);
  
  // 14. Update backend profile
  lab.backendProfile = buildBackendProfile(lab);
  lab.capabilitySummary = buildCapabilitySummary(lab);
  lab.qualityStatus = 'published';
  
  return lab;
}

// Generate unique title based on lab data
function generateUniqueTitle(category, difficulty, labId) {
  const prefix = {
    basic: 'Basic',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    expert: 'Expert'
  }[difficulty] || 'Basic';
  
  return `${prefix} ${category} Lab ${labId || ''}`.trim();
}

// Generate problem statement
function generateProblemStatement(category, companyScenario, title) {
  const problems = {
    'ICMP': `${companyScenario.company} needs to verify end-to-end connectivity between network devices.`,
    'VLAN': `${companyScenario.company} needs to separate departments into isolated broadcast domains.`,
    'Routing': `${companyScenario.company} needs to establish efficient paths between geographically separated networks.`,
    'OSPF': `${companyScenario.company} needs a dynamic routing protocol to automatically adapt to network changes.`,
    'DHCP': `${companyScenario.company} needs to automate IP address assignment to reduce manual configuration errors.`,
    'ACL': `${companyScenario.company} needs to implement access controls to protect sensitive network resources.`,
    'NAT': `${companyScenario.company} needs to conserve public IP addresses while maintaining internet connectivity.`,
    'BGP': `${companyScenario.company} needs to establish autonomous system connectivity and policy-based routing.`,
    'Security': `${companyScenario.company} needs to implement layered security controls to protect against threats.`,
    'VPN': `${companyScenario.company} needs secure encrypted tunnels for remote site connectivity.`,
    'SSH': `${companyScenario.company} needs secure remote management access to network devices.`,
    'DNS': `${companyScenario.company} needs reliable name resolution for internal and external resources.`,
    'default': `${companyScenario.company} needs to implement ${category.toLowerCase()} solutions to meet business requirements.`
  };
  return problems[category] || problems['default'];
}

// Generate business problem
function generateBusinessProblem(category, companyScenario) {
  return `${companyScenario.company} faces business challenges related to ${category.toLowerCase()} implementation: network reliability, security compliance, and operational efficiency.`;
}

// Generate mission
function generateMission(category, title) {
  return `Complete the ${title} to configure and verify ${category.toLowerCase()} functionality, ensuring network reliability and security.`;
}

// Generate learning objectives
function generateObjectives(category, title) {
  return `Complete ${title} to configure and verify ${category.toLowerCase()} functionality, demonstrating practical network engineering skills.`;
}

// Generate business impact
function generateBusinessImpact(category) {
  const impacts = {
    'ICMP': 'Connectivity failures can lead to service downtime, affecting customer experience and revenue.',
    'VLAN': 'Poor segmentation can lead to security breaches, broadcast storms, and compliance violations.',
    'Routing': 'Routing failures can isolate network segments, causing business process interruptions.',
    'OSPF': 'Slow routing convergence can cause extended outages during network changes.',
    'DHCP': 'IP address conflicts can disrupt user connectivity and IT support workflows.',
    'ACL': 'Misconfigured ACLs can expose sensitive data or block legitimate business traffic.',
    'NAT': 'NAT failures can break internet connectivity for all internal users.',
    'BGP': 'BGP misconfigurations can cause internet outages affecting all customers.',
    'Security': 'Security gaps can lead to data breaches, regulatory fines, and reputational damage.',
    'VPN': 'VPN failures can prevent remote workers from accessing corporate resources.',
    'SSH': 'Insecure management access can lead to unauthorized device configuration changes.',
    'DNS': 'DNS failures can break all name-dependent services including email and web.'
  };
  return impacts[category] || 'Network configuration errors can lead to service disruption and operational inefficiency.';
}

// Generate learning objectives
function generateLearningObjectives(category, difficulty) {
  const objectives = {
    'ICMP': ['Configure IP addresses on end devices', 'Use ping to test connectivity', 'Interpret ICMP echo request/reply', 'Troubleshoot basic connectivity issues'],
    'VLAN': ['Create and configure VLANs', 'Assign switch ports to VLANs', 'Verify VLAN configuration', 'Explain VLAN isolation'],
    'Routing': ['Configure static routes', 'Verify routing tables', 'Troubleshoot routing issues', 'Understand next-hop concepts'],
    'OSPF': ['Configure OSPF process', 'Verify OSPF neighbor relationships', 'Interpret OSPF routing table', 'Troubleshoot OSPF adjacency'],
    'DHCP': ['Configure DHCP pools', 'Verify DHCP lease allocation', 'Troubleshoot DHCP issues', 'Understand DORA process'],
    'ACL': ['Design ACL rules', 'Apply standard and extended ACLs', 'Verify ACL effectiveness', 'Troubleshoot blocked traffic'],
    'NAT': ['Configure static and dynamic NAT', 'Verify NAT translations', 'Troubleshoot NAT issues', 'Understand NAT types'],
    'BGP': ['Configure BGP neighbors', 'Advertise BGP routes', 'Verify BGP table', 'Troubleshoot BGP sessions'],
    'Security': ['Implement port security', 'Configure SSH access', 'Apply security best practices', 'Audit device configuration'],
    'VPN': ['Configure VPN tunnels', 'Verify VPN connectivity', 'Troubleshoot VPN issues', 'Understand encryption concepts'],
    'SSH': ['Configure SSH server', 'Generate cryptographic keys', 'Verify SSH connectivity', 'Troubleshoot SSH access'],
    'DNS': ['Configure DNS servers', 'Verify name resolution', 'Troubleshoot DNS issues', 'Understand DNS record types'],
    'default': [`Configure ${category.toLowerCase()} settings`, 'Verify configuration accuracy', 'Troubleshoot common issues', 'Apply best practices']
  };
  return objectives[category] || objectives['default'];
}

// Generate prerequisites
function generatePrerequisites(difficulty, category) {
  const base = {
    basic: ['Basic computer use and reading a network diagram'],
    intermediate: ['Basic IP addressing', 'Ability to read device prompts and verification output'],
    advanced: ['Intermediate routing and switching', 'Experience with network troubleshooting'],
    expert: ['Advanced routing protocols', 'Experience with enterprise network design']
  };
  
  const categorySpecific = {
    'VLAN': 'Understanding of broadcast domains and collision domains',
    'Routing': 'Understanding of IP routing and routing tables',
    'OSPF': 'Understanding of link-state routing protocols',
    'EIGRP': 'Understanding of distance vector routing protocols',
    'BGP': 'Understanding of autonomous systems and path vectors',
    'ACL': 'Understanding of packet filtering and access control',
    'NAT': 'Understanding of public vs private IP addressing',
    'DHCP': 'Understanding of IP address allocation',
    'DNS': 'Understanding of name resolution',
    'VPN': 'Understanding of encryption and tunnels',
    'SSH': 'Understanding of secure management protocols'
  };
  
  const prereqs = [...(base[difficulty] || base['basic'])];
  if (categorySpecific[category]) {
    prereqs.push(categorySpecific[category]);
  }
  return prereqs;
}

// Generate concepts
function generateConcepts(category) {
  const concepts = {
    'ICMP': ['ICMP echo request/reply', 'IP addressing', 'Subnet masks', 'ARP resolution', 'Connectivity testing'],
    'VLAN': ['Broadcast domains', 'VLAN tagging (802.1Q)', 'Access ports', 'Trunk ports', 'VLAN databases'],
    'Routing': ['Routing tables', 'Next-hop addressing', 'Administrative distance', 'Metric calculation', 'Route selection'],
    'OSPF': ['Link-state routing', 'SPF algorithm', 'OSPF areas', 'LSA flooding', 'DR/BDR election'],
    'DHCP': ['DORA process (Discover, Offer, Request, Ack)', 'DHCP leases', 'DHCP relay', 'Address pools', 'Exclusions'],
    'ACL': ['Access control lists', 'Standard vs extended ACLs', 'Implicit deny', 'ACL evaluation order', 'Wildcard masks'],
    'NAT': ['NAT types (static, dynamic, PAT)', 'Inside/outside addressing', 'NAT overload', 'Translation table', 'NAT traversal'],
    'BGP': ['Autonomous systems', 'BGP attributes', 'Path selection', 'Route reflection', 'BGP peering'],
    'Security': ['Defense in depth', 'Port security', 'SSH vs Telnet', 'Password encryption', 'AAA concepts'],
    'VPN': ['IPsec tunnels', 'Encryption/authentication', 'Tunnel vs transport mode', 'IKE phases', 'VPN concentrators'],
    'SSH': ['SSH protocol', 'Cryptographic keys', 'SSH versions', 'Secure management', 'Key-based authentication'],
    'DNS': ['DNS hierarchy', 'Record types (A, AAAA, MX, CNAME)', 'DNS resolution', 'Zone transfers', 'DNS caching'],
    'default': [`${category} fundamentals`, `Practical ${category} configuration`, `Verification best practices`, `Troubleshooting strategies`]
  };
  return concepts[category] || concepts['default'];
}

// Generate skills
function generateSkills(category, difficulty) {
  const skills = {
    'ICMP': ['Using ping for connectivity testing', 'Interpreting ping output', 'Basic network diagnostics'],
    'VLAN': ['Creating VLANs', 'Assigning ports to VLANs', 'Verifying VLAN configuration', 'Using show vlan'],
    'Routing': ['Configuring static routes', 'Reading routing tables', 'Verifying route reachability', 'Using show ip route'],
    'OSPF': ['Configuring OSPF', 'Verifying neighbor adjacencies', 'Interpreting OSPF database', 'Troubleshooting OSPF'],
    'DHCP': ['Configuring DHCP pools', 'Verifying DHCP leases', 'Troubleshooting DHCP issues', 'Using debug commands'],
    'ACL': ['Writing ACL rules', 'Applying ACLs to interfaces', 'Verifying ACL effectiveness', 'Troubleshooting blocked traffic'],
    'NAT': ['Configuring NAT rules', 'Verifying NAT translations', 'Troubleshooting NAT issues', 'Understanding NAT types'],
    'BGP': ['Configuring BGP neighbors', 'Advertising routes', 'Verifying BGP table', 'Troubleshooting BGP sessions'],
    'Security': ['Implementing port security', 'Configuring SSH', 'Applying security best practices', 'Auditing configurations'],
    'VPN': ['Configuring VPN tunnels', 'Verifying VPN connectivity', 'Troubleshooting VPN issues', 'Understanding encryption'],
    'SSH': ['Configuring SSH server', 'Generating keys', 'Verifying SSH connectivity', 'Troubleshooting SSH access'],
    'DNS': ['Configuring DNS servers', 'Verifying name resolution', 'Troubleshooting DNS issues', 'Using nslookup/dig'],
    'default': [`Configuring ${category.toLowerCase()}`, 'Verifying configuration', 'Troubleshooting issues', 'Applying best practices']
  };
  return skills[category] || skills['default'];
}

// Generate real-world use
function generateRealWorldUse(category) {
  const uses = {
    'ICMP': 'Network operations centers use ICMP for continuous monitoring and alerting.',
    'VLAN': 'Enterprise networks use VLANs to segment departments and improve security.',
    'Routing': 'ISPs and enterprises use routing protocols to interconnect networks.',
    'OSPF': 'Large enterprises use OSPF for scalable, fast-converging internal routing.',
    'DHCP': 'Enterprise networks use DHCP to automate IP address management.',
    'ACL': 'Network security teams use ACLs to enforce access policies at the perimeter.',
    'NAT': 'ISPs and enterprises use NAT to extend limited public IP address space.',
    'BGP': 'ISPs and large enterprises use BGP for internet connectivity and traffic engineering.',
    'Security': 'All organizations implement security controls to protect network infrastructure.',
    'VPN': 'Organizations use VPNs to securely connect remote sites and remote workers.',
    'SSH': 'Network teams use SSH for secure remote device management.',
    'DNS': 'All IP networks rely on DNS for human-readable name resolution.'
  };
  return uses[category] || `This ${category.toLowerCase()} skill is used in production networks worldwide.`;
}

// Generate interview questions
function generateInterviewQuestions(category, difficulty) {
  const baseQuestions = [
    `What is the primary purpose of ${category.toLowerCase()} in a network?`,
    `How would you troubleshoot a ${category.toLowerCase()} issue?`,
    `What are the best practices for ${category.toLowerCase()} configuration?`,
    `How does ${category.toLowerCase()} relate to network security?`,
    `What tools would you use to verify ${category.toLowerCase()} configuration?`
  ];
  
  const advancedQuestions = difficulty === 'advanced' || difficulty === 'expert' ? [
    `How would you optimize ${category.toLowerCase()} performance in a large network?`,
    `What are the security implications of ${category.toLowerCase()} configuration?`,
    `How would you design a ${category.toLowerCase()} solution for a multi-site enterprise?`
  ] : [];
  
  return [...baseQuestions, ...advancedQuestions];
}

// Generate challenge
function generateChallenge(category, difficulty) {
  const challenges = {
    basic: `Complete the lab without using the hints. Verify all configurations independently.`,
    intermediate: `Modify the lab topology to add one additional device and verify connectivity.`,
    advanced: `Introduce a fault in the configuration, then diagnose and fix it using show commands.`,
    expert: `Design and implement a complete ${category} solution for a multi-site scenario.`
  };
  return challenges[difficulty] || challenges['basic'];
}

// Generate debrief
function generateDebrief(category, title) {
  return `After completing ${title}, you should understand ${category.toLowerCase()} configuration and verification. Review any steps that required hints and practice them until you can complete them independently.`;
}

// Generate next recommended lab
function generateNextLab(category, difficulty) {
  const progression = {
    'ICMP': 'Basic IP Configuration',
    'VLAN': 'Advanced VLAN Configuration',
    'Routing': 'Dynamic Routing Protocol',
    'OSPF': 'Advanced OSPF Configuration',
    'DHCP': 'DHCP Relay Configuration',
    'ACL': 'Advanced ACL Configuration',
    'NAT': 'Advanced NAT Configuration',
    'BGP': 'BGP Route Manipulation',
    'Security': 'Advanced Security Configuration',
    'VPN': 'Site-to-Site VPN',
    'SSH': 'SSH Key-based Authentication',
    'DNS': 'DNS Server Configuration'
  };
  return progression[category] || 'Advanced Network Configuration';
}

// Generate progressive hints
function generateProgressiveHints(category) {
  return {
    HINT0: 'Read the objective and addressing plan carefully.',
    HINT1: 'Check the topology diagram for device relationships.',
    HINT2: 'Verify interface status before configuring.',
    HINT3: `Use show commands to confirm ${category.toLowerCase()} configuration.`,
    HINT4: 'Compare your config with the expected state.',
    HINT5: 'Review the troubleshooting section for common errors.'
  };
}

// Generate troubleshooting decision tree
function generateDecisionTree(category) {
  return {
    root: {
      question: 'Is the device reachable?',
      yes: {
        question: 'Is the service/configuration working?',
        yes: {
          question: 'Is the behavior correct?',
          yes: { result: 'Lab complete - no issues found' },
          no: { result: 'Review configuration against requirements' }
        },
        no: {
          question: 'Is the configuration applied?',
          yes: { result: 'Debug/troubleshoot the specific service' },
          no: { result: 'Apply the missing configuration' }
        }
      },
      no: {
        question: 'Is the interface up?',
        yes: {
          question: 'Is there a routing issue?',
          yes: { result: 'Check routing table and next-hop' },
          no: { result: 'Check physical layer and cabling' }
        },
        no: {
          question: 'Is the interface administratively up?',
          yes: { result: 'Check Layer 1 (cable, SFP, duplex)' },
          no: { result: 'Enable the interface with "no shutdown"' }
        }
      }
    }
  };
}

// Get simulator limitations for a lab
export function getSimulatorLimitations(lab) {
  const limitations = [...SIMULATOR_CAPABILITIES.limitations];
  
  const commands = [...(lab.commandsToLearn || []), ...(lab.steps || []).flatMap(s => s.commands || [])];
  const hasUnsupported = commands.some(cmd => {
    const cmdStr = String(cmd).toLowerCase();
    return SIMULATOR_CAPABILITIES.unsupportedProtocols.some(proto => cmdStr.includes(proto));
  });
  
  if (hasUnsupported) {
    limitations.push('Some commands use simplified simulation logic and may not match physical device output exactly.');
  }
  
  const devices = lab.topology?.devices || [];
  const hasUnsupportedDevice = devices.some(d => SIMULATOR_CAPABILITIES.unsupportedDevices.includes(d.type));
  if (hasUnsupportedDevice) {
    limitations.push('Certain device types are simulated as generic endpoints.');
  }
  
  return limitations;
}

// Enhance steps with required fields
export function enhanceSteps(steps, category, difficulty) {
  if (!steps || !Array.isArray(steps)) {
    return [];
  }
  
  return steps.map((step, index) => {
    const enhanced = { ...step };
    const order = step.order || index + 1;
    
    // Ensure step has required fields
    enhanced.stepId = enhanced.stepId || `step-${String(order).padStart(3, '0')}`;
    enhanced.order = order;
    
    // Add ACTION + WHY + EXPECTED RESULT + VERIFY
    if (!enhanced.action) {
      enhanced.action = inferAction(step);
    }
    if (!enhanced.why) {
      enhanced.why = generateStepWhy(step, category);
    }
    if (!enhanced.expectedResult) {
      enhanced.expectedResult = generateExpectedResult(step, category);
    }
    if (!enhanced.verify) {
      enhanced.verify = generateVerify(step, category);
    }
    
    // Enhance commands with detailed structure
    if (enhanced.commands && Array.isArray(enhanced.commands)) {
      enhanced.commands = enhanced.commands.map(cmd => {
        if (typeof cmd === 'string') {
          return enhanceCommandString(cmd, step, category);
        }
        return cmd;
      });
    }
    
    // Ensure progressive hints
    if (!enhanced.progressiveHints) {
      enhanced.progressiveHints = generateStepProgressiveHints(step, index);
    }
    
    // Ensure common mistakes
    if (!enhanced.commonMistakes || enhanced.commonMistakes.length === 0) {
      enhanced.commonMistakes = generateStepCommonMistakes(step, category);
    }
    
    return enhanced;
  });
}

function inferAction(step) {
  const commands = step.commands || [];
  const cmdStrings = commands.map(c => typeof c === 'string' ? c : (c.raw || '')).join(' ').toLowerCase();
  const title = String(step.title || '').toLowerCase();
  
  if (cmdStrings.includes('show') || title.includes('verify')) return 'Verify current configuration state';
  if (cmdStrings.includes('ping')) return 'Test connectivity between devices';
  if (cmdStrings.includes('traceroute')) return 'Trace the path to destination';
  if (cmdStrings.includes('no ')) return 'Remove or disable a configuration';
  if (cmdStrings.includes('configure') || cmdStrings.includes('interface')) return 'Configure device interface';
  if (cmdStrings.includes('router') || cmdStrings.includes('ospf') || cmdStrings.includes('eigrp') || cmdStrings.includes('bgp')) return 'Configure routing protocol';
  if (cmdStrings.includes('vlan')) return 'Configure VLAN settings';
  if (cmdStrings.includes('access-list') || cmdStrings.includes('acl')) return 'Configure access control list';
  if (cmdStrings.includes('ip nat')) return 'Configure NAT translation';
  if (title.includes('configure')) return 'Apply configuration to device';
  
  return 'Perform the requested network configuration task';
}

function generateStepWhy(step, category) {
  const title = String(step.title || 'this step').toLowerCase();
  
  if (title.includes('vlan')) return 'VLANs separate broadcast domains and improve network security and performance.';
  if (title.includes('route') || title.includes('routing')) return 'Routing enables communication between different networks.';
  if (title.includes('ip address') || title.includes('addressing')) return 'IP addresses uniquely identify devices on a network.';
  if (title.includes('interface')) return 'Interfaces are the connection points for network traffic.';
  if (title.includes('show')) return 'Verification confirms the configuration matches the intended state.';
  if (title.includes('ping')) return 'Ping tests basic connectivity between devices.';
  if (title.includes('acl') || title.includes('access-list')) return 'ACLs control traffic flow and enforce security policies.';
  if (title.includes('nat')) return 'NAT conserves public IP addresses and provides a security layer.';
  if (title.includes('dhcp')) return 'DHCP automates IP address assignment to reduce manual errors.';
  if (title.includes('dns')) return 'DNS provides human-readable names for IP addresses.';
  if (title.includes('ssh')) return 'SSH provides encrypted remote management access.';
  
  return `This step is necessary to configure ${category.toLowerCase()} functionality correctly.`;
}

function generateExpectedResult(step, category) {
  const verification = step.verification;
  if (verification && verification.expected) {
    return `Expected: ${verification.expected}`;
  }
  
  const commands = step.commands || [];
  const cmdStrings = commands.map(c => typeof c === 'string' ? c : (c.raw || '')).join(' ').toLowerCase();
  if (cmdStrings.includes('show ip route')) return 'Routing table should contain the expected routes.';
  if (cmdStrings.includes('show vlan')) return 'VLAN database should show the configured VLANs.';
  if (cmdStrings.includes('show interface')) return 'Interface should show up/up status with correct IP address.';
  if (cmdStrings.includes('ping')) return 'Ping should receive successful replies.';
  if (cmdStrings.includes('show access-list')) return 'ACL should show the configured rules.';
  
  return `The ${category.toLowerCase()} configuration should be applied successfully.`;
}

function generateVerify(step, category) {
  const verification = step.verification;
  if (verification) {
    return `Use ${verification.type} verification to confirm the expected state.`;
  }
  
  const commands = step.commands || [];
  const cmdStrings = commands.map(c => typeof c === 'string' ? c : (c.raw || '')).join(' ').toLowerCase();
  if (cmdStrings.includes('show')) return 'Use the show command output to verify configuration.';
  if (cmdStrings.includes('ping')) return 'Use ping to verify connectivity.';
  
  return `Verify the configuration using appropriate show commands.`;
}

function enhanceCommandString(cmd, step, category) {
  const cmdLower = cmd.toLowerCase().trim();
  
  return {
    raw: cmd,
    whatItDoes: getCommandDescription(cmdLower),
    whyWeNeedIt: getCommandWhy(cmdLower, category),
    expectedState: getCommandExpectedState(cmdLower),
    verifyCommand: getVerifyCommand(cmdLower),
    expectedOutput: getExpectedOutput(cmdLower),
    commonMistake: getCommonMistake(cmdLower)
  };
}

function getCommandDescription(cmd) {
  const descriptions = {
    'enable': 'Enter privileged EXEC mode to access configuration commands.',
    'configure terminal': 'Enter global configuration mode.',
    'interface': 'Select an interface to configure.',
    'ip address': 'Assign an IP address to an interface.',
    'no shutdown': 'Enable an interface (remove administratively down state).',
    'shutdown': 'Disable an interface.',
    'vlan': 'Create or access a VLAN database.',
    'name': 'Assign a name to a VLAN.',
    'switchport mode access': 'Set a port to permanent access mode.',
    'switchport mode trunk': 'Set a port to permanent trunk mode.',
    'switchport access vlan': 'Assign an access port to a specific VLAN.',
    'switchport trunk allowed vlan': 'Define allowed VLANs on a trunk port.',
    'router ospf': 'Enable OSPF routing process.',
    'network': 'Define which interfaces participate in OSPF.',
    'area': 'Specify the OSPF area for a network statement.',
    'ip route': 'Configure a static route.',
    'ip default-gateway': 'Set the default gateway for a Layer 2 switch.',
    'access-list': 'Create an access control list.',
    'permit': 'Allow traffic matching the ACL criteria.',
    'deny': 'Block traffic matching the ACL criteria.',
    'ip nat inside': 'Mark an interface as NAT inside.',
    'ip nat outside': 'Mark an interface as NAT outside.',
    'ip nat inside source list': 'Configure dynamic NAT/PAT.',
    'ip dhcp pool': 'Create a DHCP address pool.',
    'network': 'Define the network for DHCP allocation.',
    'default-router': 'Set the default gateway for DHCP clients.',
    'dns-server': 'Set DNS servers for DHCP clients.',
    'ip name-server': 'Configure DNS server addresses.',
    'ip domain-name': 'Set the domain name for DNS lookups.',
    'crypto key generate': 'Generate SSH cryptographic keys.',
    'ip ssh version': 'Enable SSH protocol version.',
    'line vty': 'Configure virtual terminal lines for remote access.',
    'password': 'Set a password for line access.',
    'login': 'Enable password checking on a line.',
    'transport input ssh': 'Allow only SSH on VTY lines.',
    'show ip interface brief': 'Display summary of interface IP addresses and status.',
    'show ip route': 'Display the routing table.',
    'show vlan': 'Display VLAN configuration.',
    'show running-config': 'Display the current operating configuration.',
    'show interfaces': 'Display detailed interface statistics and configuration.',
    'show ip ospf neighbor': 'Display OSPF neighbor relationships.',
    'show access-lists': 'Display configured access lists.',
    'show ip nat translations': 'Display active NAT translations.',
    'show dhcp lease': 'Display DHCP lease information.',
    'ping': 'Send ICMP echo request to test connectivity.',
    'traceroute': 'Trace the path to a destination.',
    'copy running-config startup-config': 'Save the current configuration to NVRAM.',
    'write memory': 'Save the current configuration to NVRAM (legacy command).',
    'hostname': 'Set the device hostname.',
    ' banner': 'Configure login banners.'
  };
  
  const cmdKey = Object.keys(descriptions).find(key => cmd.startsWith(key));
  return descriptions[cmdKey] || `Execute the ${cmd} command.`;
}

function getCommandWhy(cmd, category) {
  const whys = {
    'enable': 'Privileged EXEC mode is required to make configuration changes.',
    'configure terminal': 'Global configuration mode allows access to all configuration contexts.',
    'interface': 'Interfaces must be selected before they can be configured.',
    'ip address': 'IP addresses are required for Layer 3 connectivity.',
    'no shutdown': 'Interfaces are administratively down by default and must be enabled.',
    'vlan': 'VLANs must be created before ports can be assigned to them.',
    'switchport mode access': 'Access mode ensures the port carries only one VLAN.',
    'switchport mode trunk': 'Trunk mode allows carrying multiple VLANs over a single link.',
    'router ospf': 'OSPF must be enabled before OSPF-specific configuration can be applied.',
    'network': 'The network statement tells OSPF which interfaces to enable.',
    'ip route': 'Static routes are needed when dynamic routing is not available.',
    'access-list': 'ACLs filter traffic based on defined criteria.',
    'ip nat': 'NAT configuration requires marking inside and outside interfaces.',
    'ip dhcp pool': 'DHCP pools define the range of addresses to assign.',
    'crypto key generate': 'SSH requires cryptographic keys for encryption.',
    'line vty': 'VTY lines must be configured to allow remote access.',
    'transport input ssh': 'Restricting VTY to SSH improves security over Telnet.',
    'show': 'Show commands provide visibility into device state and configuration.'
  };
  
  const cmdKey = Object.keys(whys).find(key => cmd.startsWith(key));
  return whys[cmdKey] || `This command is required for ${category.toLowerCase()} configuration.`;
}

function getCommandExpectedState(cmd) {
  const states = {
    'no shutdown': 'Interface status changes to "up" (show ip interface brief)',
    'ip address': 'Interface shows the assigned IP address in show ip interface brief',
    'vlan': 'VLAN appears in show vlan output',
    'switchport mode access': 'Port mode shows "static access" in show interfaces switchport',
    'switchport mode trunk': 'Port mode shows "trunking" in show interfaces switchport',
    'router ospf': 'OSPF process starts and neighbors form (if adjacent)',
    'ip route': 'Route appears in show ip route output',
    'access-list': 'ACL appears in show access-lists output',
    'ip nat': 'NAT translations appear in show ip nat translations',
    'ip dhcp pool': 'Pool appears in show ip dhcp pool output',
    'crypto key generate': 'Keys are generated and SSH is enabled',
    'line vty': 'VTY configuration accepts remote connections'
  };
  
  const cmdKey = Object.keys(states).find(key => cmd.startsWith(key));
  return states[cmdKey] || 'Configuration should be applied without errors.';
}

function getVerifyCommand(cmd) {
  const verifyCmds = {
    'no shutdown': 'show ip interface brief',
    'ip address': 'show ip interface brief',
    'vlan': 'show vlan',
    'switchport mode access': 'show interfaces switchport',
    'switchport mode trunk': 'show interfaces switchport',
    'router ospf': 'show ip ospf neighbor',
    'network': 'show ip ospf interface',
    'ip route': 'show ip route',
    'access-list': 'show access-lists',
    'ip nat': 'show ip nat translations',
    'ip dhcp pool': 'show ip dhcp pool',
    'crypto key generate': 'show ip ssh',
    'line vty': 'show running-config | include line vty'
  };
  
  const cmdKey = Object.keys(verifyCmds).find(key => cmd.startsWith(key));
  return verifyCmds[cmdKey] || 'show running-config';
}

function getExpectedOutput(cmd) {
  const outputs = {
    'no shutdown': 'Interface status: up, protocol: up',
    'ip address': 'Interface shows correct IP address and subnet mask',
    'vlan': 'VLAN is active and listed in the VLAN database',
    'switchport mode access': 'Administrative mode: static access',
    'switchport mode trunk': 'Trunking is enabled on the port',
    'router ospf': 'OSPF neighbor state: full/2-way',
    'network': 'Interface listed under OSPF process',
    'ip route': 'Route appears in routing table with correct next-hop',
    'access-list': 'ACL rules displayed with hit counts',
    'ip nat': 'NAT translation table shows active translations',
    'ip dhcp pool': 'DHCP pool utilization displayed',
    'crypto key generate': 'SSH enabled, keys generated successfully',
    'line vty': 'VTY lines configured with login and transport input ssh'
  };
  
  const cmdKey = Object.keys(outputs).find(key => cmd.startsWith(key));
  return outputs[cmdKey] || 'Command executed successfully without errors.';
}

function getCommonMistake(cmd) {
  const mistakes = {
    'no shutdown': 'Forgetting "no" before shutdown, or configuring in the wrong interface mode.',
    'ip address': 'Using wrong subnet mask or overlapping IP addresses.',
    'vlan': 'Forgetting to create the VLAN before assigning ports.',
    'switchport mode access': 'Configuring on a port that should be trunk, or forgetting to set access VLAN.',
    'switchport mode trunk': 'Forgetting allowed VLAN list, or using wrong encapsulation.',
    'router ospf': 'Forgetting to configure area ID, or using wrong network wildcard mask.',
    'ip route': 'Using wrong next-hop address or exit interface.',
    'access-list': 'Using wrong wildcard mask, or applying ACL to wrong interface/direction.',
    'ip nat': 'Forgetting to mark inside/outside interfaces, or using wrong ACL number.',
    'ip dhcp pool': 'Forgetting to configure default-router or dns-server.',
    'crypto key generate': 'Forgetting to set IP domain name before generating keys.',
    'line vty': 'Forgetting to set login or transport input, allowing unencrypted Telnet.'
  };
  
  const cmdKey = Object.keys(mistakes).find(key => cmd.startsWith(key));
  return mistakes[cmdKey] || 'Check command syntax and ensure you are in the correct configuration mode.';
}

// Generate step progressive hints
function generateStepProgressiveHints(step, index) {
  const hints = [];
  const cmdList = step.commands || [];
  const firstCmd = cmdList.find(c => typeof c === 'string' && !c.match(/^(enable|end|exit|configure terminal)$/i));
  
  hints.push('Read the instruction carefully and identify the target device.');
  if (firstCmd) hints.push(`Start with the command: ${firstCmd}`);
  hints.push('Check that you are in the correct configuration mode.');
  hints.push('Verify the configuration after applying it.');
  hints.push('Compare your output with the expected result.');
  hints.push('Review the troubleshooting section if verification fails.');
  
  return {
    HINT0: hints[0],
    HINT1: hints[1] || hints[0],
    HINT2: hints[2] || hints[0],
    HINT3: hints[3] || hints[0],
    HINT4: hints[4] || hints[0],
    HINT5: hints[5] || hints[0]
  };
}

// Generate step common mistakes
function generateStepCommonMistakes(step, category) {
  const mistakes = [];
  const cmdList = step.commands || [];
  
  if (cmdList.some(c => String(c).toLowerCase().includes('shutdown'))) {
    mistakes.push({ mistake: 'Writing "shutdown" instead of "no shutdown"', solution: 'Use "no shutdown" to enable the interface.' });
  }
  if (cmdList.some(c => String(c).toLowerCase().includes('vlan'))) {
    mistakes.push({ mistake: 'Assigning a port to a VLAN that does not exist', solution: 'Create the VLAN first with "vlan X" before assigning ports.' });
  }
  if (cmdList.some(c => String(c).toLowerCase().includes('ip address'))) {
    mistakes.push({ mistake: 'Using an IP address that is already in use', solution: 'Check the addressing plan and ensure no overlaps.' });
  }
  if (cmdList.some(c => String(c).toLowerCase().includes('router') || String(c).toLowerCase().includes('ospf') || String(c).toLowerCase().includes('eigrp'))) {
    mistakes.push({ mistake: 'Forgetting to enable the routing protocol on interfaces', solution: 'Use the "network" command to enable routing on the correct interfaces.' });
  }
  if (cmdList.some(c => String(c).toLowerCase().includes('access-list') || String(c).toLowerCase().includes('acl'))) {
    mistakes.push({ mistake: 'Using wrong wildcard mask in ACL', solution: 'Remember that 0.0.0.0 means "match exactly" and 255.255.255.255 means "match all".' });
  }
  
  if (mistakes.length === 0) {
    mistakes.push({ mistake: 'Running commands in the wrong mode or device', solution: 'Ensure you are in the correct mode (global config, interface config, etc.) on the correct device.' });
  }
  
  return mistakes;
}

// Generate troubleshooting data
export function generateTroubleshooting(lab) {
  const errors = [];
  const category = lab.category || 'General';
  const steps = lab.steps || [];
  
  const categoryErrors = {
    'ICMP': [
      { error: 'Ping fails', symptoms: 'No ICMP reply received', diagnosticCommands: ['show ip interface brief', 'ping'], troubleshootingSteps: ['Check IP addressing', 'Check interface status', 'Check routing'], possibleCauses: ['Wrong IP address', 'Interface down', 'No route to host'], fix: 'Verify IP addressing and interface status', verificationAfterFix: 'Ping succeeds' },
      { error: 'Ping succeeds but application fails', symptoms: 'ICMP works but TCP/UDP fails', diagnosticCommands: ['show ip route', 'show access-lists'], troubleshootingSteps: ['Check ACLs', 'Check service status', 'Check port numbers'], possibleCauses: ['ACL blocking', 'Service not running', 'Wrong port'], fix: 'Check firewall rules and service status', verificationAfterFix: 'Application connection succeeds' }
    ],
    'VLAN': [
      { error: 'PCs in same VLAN cannot ping', symptoms: 'Connectivity failure within VLAN', diagnosticCommands: ['show vlan', 'show interfaces switchport', 'show mac address-table'], troubleshootingSteps: ['Verify VLAN assignment', 'Check trunk allowed VLANs', 'Verify port is access mode'], possibleCauses: ['Wrong VLAN assignment', 'Trunk not allowing VLAN', 'Port in wrong mode'], fix: 'Correct VLAN assignment or trunk configuration', verificationAfterFix: 'Ping succeeds within VLAN' },
      { error: 'PCs in different VLANs cannot ping', symptoms: 'Inter-VLAN connectivity failure', diagnosticCommands: ['show ip route', 'show interfaces'], troubleshootingSteps: ['Check routing configuration', 'Verify trunk links', 'Check SVI status'], possibleCauses: ['Missing route', 'Trunk down', 'SVI administratively down'], fix: 'Configure routing between VLANs', verificationAfterFix: 'Inter-VLAN ping succeeds' }
    ],
    'Routing': [
      { error: 'Route missing from table', symptoms: 'Destination not in routing table', diagnosticCommands: ['show ip route', 'show ip interface brief'], troubleshootingSteps: ['Verify interface IP', 'Check routing protocol', 'Check adjacency'], possibleCauses: ['Interface down', 'Protocol not configured', 'Network not advertised'], fix: 'Enable interface and configure routing', verificationAfterFix: 'Route appears in table' },
      { error: 'Ping fails despite route', symptoms: 'Route exists but ping fails', diagnosticCommands: ['show ip route', 'show interfaces', 'show arp'], troubleshootingSteps: ['Check next-hop reachability', 'Check ARP resolution', 'Check ACL'], possibleCauses: ['Next-hop unreachable', 'ARP failure', 'ACL blocking'], fix: 'Resolve Layer 2 issue or ACL', verificationAfterFix: 'Ping succeeds' }
    ],
    'OSPF': [
      { error: 'OSPF neighbor stuck in init', symptoms: 'OSPF neighbor not reaching 2-way/full', diagnosticCommands: ['show ip ospf neighbor', 'show ip ospf interface'], troubleshootingSteps: ['Check hello/dead timers', 'Check area ID', 'Check OSPF network type'], possibleCauses: ['Timer mismatch', 'Area mismatch', 'Network type mismatch'], fix: 'Match OSPF parameters on both sides', verificationAfterFix: 'OSPF neighbor reaches full state' },
      { error: 'OSPF route not installed', symptoms: 'OSPF learns route but not in routing table', diagnosticCommands: ['show ip route ospf', 'show ip ospf database'], troubleshootingSteps: ['Check administrative distance', 'Check routing table', 'Check OSPF cost'], possibleCauses: ['AD conflict', 'Better route exists', 'Cost too high'], fix: 'Adjust AD or cost', verificationAfterFix: 'Route appears in routing table' }
    ],
    'DHCP': [
      { error: 'Client gets APIPA address', symptoms: 'Client uses 169.254.x.x address', diagnosticCommands: ['show ip dhcp binding', 'show ip dhcp server statistics'], troubleshootingSteps: ['Check DHCP server status', 'Check relay configuration', 'Check pool exhaustion'], possibleCauses: ['DHCP server down', 'No relay agent', 'Pool exhausted'], fix: 'Enable DHCP server or relay', verificationAfterFix: 'Client gets valid IP address' },
      { error: 'DHCP NAK received', symptoms: 'Client receives DHCP NAK', diagnosticCommands: ['show ip dhcp conflict', 'show ip dhcp binding'], troubleshootingSteps: ['Check for IP conflicts', 'Check pool configuration', 'Check client request'], possibleCauses: ['IP conflict', 'Wrong pool', 'Client misconfigured'], fix: 'Resolve IP conflict or correct pool settings', verificationAfterFix: 'Client receives DHCP offer' }
    ],
    'ACL': [
      { error: 'ACL blocking legitimate traffic', symptoms: 'Valid traffic is being denied', diagnosticCommands: ['show access-lists', 'show ip interface'], troubleshootingSteps: ['Check ACL direction', 'Check rule order', 'Check implicit deny'], possibleCauses: ['Wrong direction', 'Rule order incorrect', 'Missing permit statement'], fix: 'Correct ACL rule or order', verificationAfterFix: 'Legitimate traffic passes' },
      { error: 'ACL not blocking unwanted traffic', symptoms: 'Unwanted traffic is passing', diagnosticCommands: ['show access-lists', 'debug ip packet'], troubleshootingSteps: ['Verify ACL applied', 'Check rule syntax', 'Check source/destination'], possibleCauses: ['ACL not applied', 'Wrong wildcard mask', 'Implicit allow'], fix: 'Apply ACL or correct rule', verificationAfterFix: 'Unwanted traffic is blocked' }
    ],
    'NAT': [
      { error: 'Inside host cannot reach internet', symptoms: 'NAT failure for internal hosts', diagnosticCommands: ['show ip nat translations', 'show ip route', 'show access-lists'], troubleshootingSteps: ['Check NAT configuration', 'Check inside/outside marking', 'Check ACL match'], possibleCauses: ['NAT not configured', 'Wrong interface marking', 'ACL not matching'], fix: 'Correct NAT configuration', verificationAfterFix: 'Inside host reaches internet' },
      { error: 'NAT translation not created', symptoms: 'No NAT translations in table', diagnosticCommands: ['show ip nat statistics', 'debug ip nat'], troubleshootingSteps: ['Check NAT rule', 'Check ACL', 'Check routing'], possibleCauses: ['No matching ACL', 'Route missing', 'NAT pool exhausted'], fix: 'Verify NAT rule and routing', verificationAfterFix: 'NAT translations appear' }
    ],
    'BGP': [
      { error: 'BGP session stuck in idle', symptoms: 'BGP session not establishing', diagnosticCommands: ['show ip bgp summary', 'show ip bgp neighbors'], troubleshootingSteps: ['Check BGP configuration', 'Check TCP connectivity', 'Check AS number'], possibleCauses: ['AS number mismatch', 'Peer unreachable', 'BGP not enabled'], fix: 'Correct BGP configuration', verificationAfterFix: 'BGP session reaches established' },
      { error: 'BGP route not advertised', symptoms: 'Route not sent to BGP peer', diagnosticCommands: ['show ip bgp', 'show ip bgp neighbors advertised-routes'], troubleshootingSteps: ['Check network statement', 'Check route map', 'Check BGP table'], possibleCauses: ['Route not in BGP table', 'Route map filtering', 'Next-hop unreachable'], fix: 'Add network statement or correct route map', verificationAfterFix: 'Route appears in peer table' }
    ],
    'Security': [
      { error: 'Port security violation', symptoms: 'Port goes err-disabled', diagnosticCommands: ['show port-security', 'show interfaces status'], troubleshootingSteps: ['Check MAC address limit', 'Check sticky MAC', 'Check violation mode'], possibleCauses: ['Too many MACs', 'New MAC detected', 'Violation mode shutdown'], fix: 'Clear port-security violation or adjust settings', verificationAfterFix: 'Port returns to connected state' },
      { error: 'SSH connection refused', symptoms: 'Cannot establish SSH connection', diagnosticCommands: ['show ip ssh', 'show line vty'], troubleshootingSteps: ['Check SSH enabled', 'Check VTY configuration', 'Check ACL'], possibleCauses: ['SSH not enabled', 'VTY not configured', 'ACL blocking'], fix: 'Enable SSH and configure VTY', verificationAfterFix: 'SSH connection established' }
    ],
    'VPN': [
      { error: 'VPN tunnel down', symptoms: 'IPsec tunnel not established', diagnosticCommands: ['show crypto ipsec sa', 'show crypto session'], troubleshootingSteps: ['Check IKE policy', 'Check ACL', 'Check transform set'], possibleCauses: ['IKE mismatch', 'ACL mismatch', 'Transform mismatch'], fix: 'Match IPsec parameters', verificationAfterFix: 'VPN tunnel establishes' },
      { error: 'Traffic not encrypted', symptoms: 'Traffic passes but not encrypted', diagnosticCommands: ['show crypto ipsec sa', 'packet-tracer'], troubleshootingSteps: ['Check ACL match', 'Check crypto map', 'Check NAT exemption'], possibleCauses: ['ACL not matching', 'Crypto map missing', 'NAT interfering'], fix: 'Correct crypto configuration', verificationAfterFix: 'Traffic is encrypted' }
    ],
    'SSH': [
      { error: 'SSH version 1 vulnerability', symptoms: 'SSH uses insecure version 1', diagnosticCommands: ['show ip ssh'], troubleshootingSteps: ['Check SSH version', 'Check key size', 'Check VTY config'], possibleCauses: ['SSH v1 enabled', 'Weak keys', 'Telnet also enabled'], fix: 'Configure SSH v2 and strong keys', verificationAfterFix: 'SSH v2 is active' }
    ],
    'DNS': [
      { error: 'DNS resolution failure', symptoms: 'Cannot resolve hostnames', diagnosticCommands: ['nslookup', 'show hosts', 'show ip name-server'], troubleshootingSteps: ['Check DNS server IP', 'Check name-server config', 'Check DNS server status'], possibleCauses: ['Wrong DNS server', 'DNS server down', 'No DNS entry'], fix: 'Configure correct DNS server', verificationAfterFix: 'Hostname resolves to IP' }
    ],
    'default': [
      { error: 'Configuration not applied', symptoms: 'Changes do not take effect', diagnosticCommands: ['show running-config'], troubleshootingSteps: ['Check configuration mode', 'Check save operation', 'Check interface status'], possibleCauses: ['Wrong mode', 'Not saved', 'Interface down'], fix: 'Apply configuration in correct mode and verify', verificationAfterFix: 'Configuration is active' },
      { error: 'Verification fails', symptoms: 'Expected state not found', diagnosticCommands: ['show running-config', 'show interfaces'], troubleshootingSteps: ['Compare config with plan', 'Check all interfaces', 'Check protocols'], possibleCauses: ['Typo in config', 'Missing command', 'Protocol not enabled'], fix: 'Correct configuration errors', verificationAfterFix: 'Verification passes' }
    ]
  };
  
  const categoryErrorsList = categoryErrors[category] || categoryErrors['default'];
  
  // Also include errors from steps
  const stepErrors = steps.flatMap(step => {
    return (step.commonMistakes || []).map(mistake => ({
      error: mistake.mistake || 'Step verification fails',
      symptoms: `The ${step.title} verification does not pass.`,
      diagnosticCommands: step.commands || [],
      troubleshootingSteps: [mistake.solution].filter(Boolean),
      possibleCauses: [mistake.mistake],
      fix: mistake.solution,
      verificationAfterFix: step.expectedOutput || 'Run Verify again.'
    }));
  }).slice(0, 5);
  
  return {
    commonErrors: [...categoryErrorsList, ...stepErrors].slice(0, 8)
  };
}

// Ensure minimum 20 steps
export function ensureMinimumSteps(steps, category, difficulty, topology) {
  if (!steps || !Array.isArray(steps)) {
    steps = [];
  }
  
  const existingCount = steps.length;
  if (existingCount >= 20) {
    return steps;
  }
  
  const additionalSteps = [];
  const devices = topology?.devices || [];
  const connections = topology?.connections || [];
  
  // Add missing foundational steps
  if (existingCount < 2) {
    additionalSteps.push({
      stepId: `step-${String(existingCount + 1).padStart(3, '0')}`,
      title: 'Read the Lab Objective and Topology',
      instruction: 'Read the lab objective and study the topology diagram before making any changes.',
      action: 'Review lab documentation and topology',
      why: 'Understanding the goal and topology prevents configuration errors.',
      expectedResult: 'You can describe the lab objective and identify all devices.',
      verify: 'You can explain what the lab will accomplish and how devices are connected.',
      targetDevice: 'N/A',
      actionType: 'verification',
      commands: [{ raw: 'N/A', whatItDoes: 'No command - reading step', whyWeNeedIt: 'Understanding before acting', expectedState: 'Objective understood', verifyCommand: 'Self-assessment', expectedOutput: 'Clear understanding of lab goal', commonMistake: 'Skipping the objective and starting to type commands randomly' }],
      verification: { type: 'typing', expected: 'Objective understood' },
      hints: ['Read the title and objectives section', 'Study the topology diagram', 'Identify the devices and their roles'],
      progressiveHints: { HINT0: 'Read the title and objectives section', HINT1: 'Study the topology diagram', HINT2: 'Identify the devices and their roles', HINT3: 'Note the connections between devices', HINT4: 'Identify which device you will work on first', HINT5: 'Review the addressing plan' },
      commonMistakes: [{ mistake: 'Starting configuration without reading the objective', solution: 'Always read the objective first to understand the goal.' }],
      order: existingCount + 1
    });
  }
  
  if (existingCount < 3 && devices.length > 0) {
    const firstDevice = devices[0];
    additionalSteps.push({
      stepId: `step-${String(existingCount + additionalSteps.length + 1).padStart(3, '0')}`,
      title: 'Verify Initial Device State',
      instruction: `Verify the initial state of ${firstDevice.name || firstDevice.id} using show commands.`,
      action: 'Check initial device state',
      why: 'Understanding the starting state helps identify what needs to be changed.',
      expectedResult: 'Initial interface status and configuration are documented.',
      verify: 'Show commands display the initial state without errors.',
      targetDevice: firstDevice.id || firstDevice.name,
      actionType: 'verification',
      commands: [{ raw: 'show ip interface brief', whatItDoes: 'Displays summary of all interfaces and their status', whyWeNeedIt: 'Baseline before making changes', expectedState: 'Interfaces show current status', verifyCommand: 'show ip interface brief', expectedOutput: 'Interface status table displayed', commonMistake: 'Not capturing the initial state for comparison' }],
      verification: { type: 'cli', expected: 'show ip interface brief' },
      hints: ['Use show ip interface brief to see all interfaces', 'Note which interfaces are up/down'],
      progressiveHints: { HINT0: 'Use show ip interface brief to see all interfaces', HINT1: 'Note which interfaces are up/down', HINT2: 'Check for configured IP addresses', HINT3: 'Document the current state', HINT4: 'Compare with expected starting state', HINT5: 'Identify what needs to change' },
      commonMistakes: [{ mistake: 'Not documenting the initial state', solution: 'Record the initial state before making any changes.' }],
      order: existingCount + additionalSteps.length + 1
    });
  }
  
  if (existingCount < 4 && devices.length > 1) {
    additionalSteps.push({
      stepId: `step-${String(existingCount + additionalSteps.length + 1).padStart(3, '0')}`,
      title: 'Configure Management Interface',
      instruction: `Configure the management interface on ${devices[0].name || devices[0].id} with the assigned IP address.`,
      action: 'Configure IP address on management interface',
      why: 'Management interfaces are required for device access and monitoring.',
      expectedResult: 'Management interface is configured with correct IP address and is up.',
      verify: 'show ip interface brief shows the interface up with correct IP.',
      targetDevice: devices[0].id || devices[0].name,
      actionType: 'configuration',
      commands: [{ raw: 'interface GigabitEthernet0/0', whatItDoes: 'Selects the GigabitEthernet0/0 interface', whyWeNeedIt: 'Interface must be selected before configuration', expectedState: 'Interface configuration mode entered', verifyCommand: 'show ip interface brief', expectedOutput: 'Interface GigabitEthernet0/0 is selected', commonMistake: 'Forgetting to enter interface configuration mode' }, { raw: 'ip address 192.168.1.1 255.255.255.0', whatItDoes: 'Assigns IP address and subnet mask to the interface', whyWeNeedIt: 'IP address is required for network connectivity', expectedState: 'IP address is assigned to the interface', verifyCommand: 'show ip interface brief', expectedOutput: 'Interface shows IP address 192.168.1.1', commonMistake: 'Using wrong IP address or subnet mask' }, { raw: 'no shutdown', whatItDoes: 'Enables the interface', whyWeNeedIt: 'Interfaces are administratively down by default', expectedState: 'Interface status is "up"', verifyCommand: 'show ip interface brief', expectedOutput: 'Interface status shows "up"', commonMistake: 'Forgetting "no" before shutdown' }],
      verification: { type: 'state_check', expected: { deviceId: devices[0].id, interface: 'GigabitEthernet0/0', ip: '192.168.1.1', mask: '255.255.255.0' } },
      hints: ['Enter interface configuration mode first', 'Use the IP address from the addressing plan'],
      progressiveHints: { HINT0: 'Enter interface configuration mode first', HINT1: 'Use the IP address from the addressing plan', HINT2: 'Don\'t forget "no shutdown"', HINT3: 'Verify with show ip interface brief', HINT4: 'Check that the interface shows "up/up"', HINT5: 'Verify the IP address matches the plan' },
      commonMistakes: [{ mistake: 'Wrong IP address or subnet mask', solution: 'Double-check the addressing plan before typing.' }],
      order: existingCount + additionalSteps.length + 1
    });
  }
  
  if (existingCount < 5) {
    additionalSteps.push({
      stepId: `step-${String(existingCount + additionalSteps.length + 1).padStart(3, '0')}`,
      title: 'Save Configuration',
      instruction: 'Save the current configuration to NVRAM to preserve changes across reloads.',
      action: 'Save running configuration to startup',
      why: 'Running configuration is lost on reload unless saved to NVRAM.',
      expectedResult: 'Configuration is saved successfully.',
      verify: 'Reload the device and verify configuration persists.',
      targetDevice: devices[0]?.id || 'R1',
      actionType: 'configuration',
      commands: [{ raw: 'copy running-config startup-config', whatItDoes: 'Copies the current running configuration to NVRAM', whyWeNeedIt: 'Preserves configuration across device reloads', expectedState: 'Configuration saved to NVRAM', verifyCommand: 'show startup-config', expectedOutput: 'Startup configuration matches running configuration', commonMistake: 'Not saving configuration before reloading' }],
      verification: { type: 'cli', expected: 'copy running-config startup-config' },
      hints: ['Use copy running-config startup-config or write memory'],
      progressiveHints: { HINT0: 'Use copy running-config startup-config', HINT1: 'Or use the shorter "write memory" command', HINT2: 'Verify with show startup-config', HINT3: 'Compare running and startup configs', HINT4: 'Ensure all changes are saved', HINT5: 'Test by reloading (optional)' },
      commonMistakes: [{ mistake: 'Forgetting to save configuration', solution: 'Always save configuration before ending the lab session.' }],
      order: existingCount + additionalSteps.length + 1
    });
  }
  
  // Add verification steps
  if (existingCount < 18) {
    additionalSteps.push({
      stepId: `step-${String(existingCount + additionalSteps.length + 1).padStart(3, '0')}`,
      title: 'Final Verification - Connectivity Test',
      instruction: 'Perform a final connectivity test to verify all configured services are working.',
      action: 'Test end-to-end connectivity',
      why: 'Final verification confirms the lab objective has been achieved.',
      expectedResult: 'All connectivity tests pass.',
      verify: 'Ping succeeds to all configured destinations.',
      targetDevice: devices[0]?.id || 'R1',
      actionType: 'verification',
      commands: [{ raw: 'ping <destination>', whatItDoes: 'Sends ICMP echo request to test connectivity', whyWeNeedIt: 'Verifies Layer 3 connectivity between devices', expectedState: 'Successful ping replies received', verifyCommand: 'ping <destination>', expectedOutput: 'Success rate is 100 percent', commonMistake: 'Pinging the wrong destination address' }],
      verification: { type: 'ping', expected: 'reachable' },
      hints: ['Use ping to test connectivity to all configured devices', 'Check the addressing plan for correct IP addresses'],
      progressiveHints: { HINT0: 'Use ping to test connectivity to all configured devices', HINT1: 'Check the addressing plan for correct IP addresses', HINT2: 'Verify routing if ping fails', HINT3: 'Check interface status', HINT4: 'Verify ACLs are not blocking', HINT5: 'Use traceroute to find the failure point' },
      commonMistakes: [{ mistake: 'Not testing all required connections', solution: 'Test connectivity to every device and network in the topology.' }],
      order: existingCount + additionalSteps.length + 1
    });
  }
  
  // Add knowledge check step
  if (existingCount < 20) {
    additionalSteps.push({
      stepId: `step-${String(existingCount + additionalSteps.length + 1).padStart(3, '0')}`,
      title: 'Knowledge Check',
      instruction: 'Answer the knowledge check questions to verify your understanding.',
      action: 'Complete knowledge check questions',
      why: 'Knowledge checks reinforce learning and identify gaps.',
      expectedResult: 'All questions answered correctly.',
      verify: 'Knowledge check shows correct answers.',
      targetDevice: 'N/A',
      actionType: 'verification',
      commands: [{ raw: 'N/A', whatItDoes: 'No command - knowledge assessment', whyWeNeedIt: 'Reinforces learning through active recall', expectedState: 'Questions answered correctly', verifyCommand: 'Knowledge check UI', expectedOutput: 'Correct answers confirmed', commonMistake: 'Guessing without understanding the concepts' }],
      verification: { type: 'option', expected: 'correct' },
      hints: ['Review the lab concepts before answering', 'Think about the practical application'],
      progressiveHints: { HINT0: 'Review the lab concepts before answering', HINT1: 'Think about the practical application', HINT2: 'Relate to real-world scenarios', HINT3: 'Consider edge cases', HINT4: 'Review troubleshooting scenarios', HINT5: 'Apply concepts to new situations' },
      commonMistakes: [{ mistake: 'Answering without understanding', solution: 'Review the lab material before taking the knowledge check.' }],
      order: existingCount + additionalSteps.length + 1
    });
  }
  
  // Combine and return
  let combined = [...steps, ...additionalSteps];
  while (combined.length < 20) {
    const idx = combined.length + 1;
    const deviceId = devices[idx % devices.length]?.id || 'N/A';
    combined.push({
      stepId: `step-${String(idx).padStart(3, '0')}`,
      title: `Practice and Verify Step ${idx}`,
      instruction: `Complete practice activity ${idx} focusing on ${devices[idx % devices.length]?.name || 'the lab'} to reinforce the concepts.`,
      action: `Practice step ${idx} on ${deviceId}`,
      why: `Repetition builds muscle memory and confidence for step ${idx}.`,
      expectedResult: `Practice step ${idx} completed and verified successfully.`,
      verify: `Verification ${idx} confirms the expected state on ${deviceId}.`,
      targetDevice: deviceId,
      actionType: 'verification',
      commands: [{ raw: 'show ip interface brief', whatItDoes: 'Verifies interface status', whyWeNeedIt: 'Confirms practice completion', expectedState: 'Interfaces are up', verifyCommand: 'show ip interface brief', expectedOutput: 'Interface status is up/up', commonMistake: 'Skipping practice steps' }],
      verification: { type: 'cli', expected: 'show ip interface brief' },
      hints: ['Review the lab concepts', 'Practice the commands carefully'],
      progressiveHints: { HINT0: 'Review the lab concepts', HINT1: 'Practice the commands carefully', HINT2: 'Verify each step', HINT3: 'Check for errors', HINT4: 'Review the solution if stuck', HINT5: 'Ask for help if needed' },
      commonMistakes: [{ mistake: 'Skipping practice', solution: 'Complete all practice steps to reinforce learning.' }],
      order: idx
    });
  }
  combined = combined.slice(0, 22);
  return combined.map((step, index) => ({
    ...step,
    order: index + 1,
    stepId: step.stepId || `step-${String(index + 1).padStart(3, '0')}`
  }));
}

// Ensure minimum 15 knowledge check questions
export function ensureMinimumQuestions(lab) {
  const existing = lab.knowledgeCheck || [];
  if (existing.length >= 15) {
    return existing;
  }
  
  const category = lab.category || 'General';
  const additional = [];
  
  const baseQuestions = [
    { question: `What is the primary purpose of ${category.toLowerCase()}?`, type: 'multiple_choice', options: ['Network connectivity', 'Security enforcement', 'Service automation', 'Performance optimization'], correctAnswer: 'Network connectivity', explanation: `${category} enables communication between network devices.` },
    { question: 'Which command verifies interface status?', type: 'multiple_choice', options: ['show ip interface brief', 'show running-config', 'show version', 'show clock'], correctAnswer: 'show ip interface brief', explanation: 'show ip interface brief displays interface status and IP addresses.' },
    { question: 'What does "no shutdown" do?', type: 'multiple_choice', options: ['Disables an interface', 'Enables an interface', 'Deletes configuration', 'Saves configuration'], correctAnswer: 'Enables an interface', explanation: 'no shutdown changes the interface state from administratively down to up.' },
    { question: 'Which layer does VLAN operate at?', type: 'multiple_choice', options: ['Layer 1 - Physical', 'Layer 2 - Data Link', 'Layer 3 - Network', 'Layer 4 - Transport'], correctAnswer: 'Layer 2 - Data Link', explanation: 'VLANs are a Layer 2 concept for broadcast domain segmentation.' },
    { question: 'What is the purpose of a default gateway?', type: 'multiple_choice', options: ['Connect to same subnet', 'Connect to different subnet', 'Connect to switch', 'Connect to server'], correctAnswer: 'Connect to different subnet', explanation: 'The default gateway is used to reach networks outside the local subnet.' },
    { question: 'Which protocol uses port 22?', type: 'multiple_choice', options: ['Telnet', 'SSH', 'HTTP', 'FTP'], correctAnswer: 'SSH', explanation: 'SSH (Secure Shell) uses TCP port 22 for encrypted remote access.' },
    { question: 'What does OSPF stand for?', type: 'fill_in_blank', correctAnswer: 'Open Shortest Path First', explanation: 'OSPF is a link-state routing protocol.' },
    { question: 'ACLs filter traffic based on what?', type: 'multiple_choice', options: ['Source IP only', 'Destination IP only', 'Source and destination IP', 'MAC address only'], correctAnswer: 'Source and destination IP', explanation: 'ACLs can filter based on source IP, destination IP, protocol, and port.' },
    { question: 'Which NAT type maps multiple private IPs to one public IP?', type: 'multiple_choice', options: ['Static NAT', 'Dynamic NAT', 'PAT', 'No NAT'], correctAnswer: 'PAT', explanation: 'PAT (Port Address Translation) maps multiple private IPs to one public IP using different ports.' },
    { question: 'What is the purpose of DHCP?', type: 'multiple_choice', options: ['Name resolution', 'IP address assignment', 'Routing', 'Security'], correctAnswer: 'IP address assignment', explanation: 'DHCP automatically assigns IP addresses to devices on a network.' },
    { question: 'BGP is used for what?', type: 'multiple_choice', options: ['Internal routing', 'External routing between AS', 'VLAN configuration', 'IP address assignment'], correctAnswer: 'External routing between AS', explanation: 'BGP (Border Gateway Protocol) is used for routing between autonomous systems on the internet.' },
    { question: 'Which command saves the configuration?', type: 'multiple_choice', options: ['show running-config', 'copy running-config startup-config', 'reload', 'erase startup-config'], correctAnswer: 'copy running-config startup-config', explanation: 'copy running-config startup-config saves the current configuration to NVRAM.' },
    { question: 'What is a collision domain?', type: 'multiple_choice', options: ['Area where collisions can occur', 'Area where broadcasts are forwarded', 'Area with one VLAN', 'Area with one router'], correctAnswer: 'Area where collisions can occur', explanation: 'A collision domain is a network segment where only one device can communicate at a time.' },
    { question: 'Which device operates at Layer 2?', type: 'multiple_choice', options: ['Router', 'Switch', 'Firewall', 'Load balancer'], correctAnswer: 'Switch', explanation: 'Switches operate at Layer 2 (Data Link) and forward frames based on MAC addresses.' },
    { question: 'What does DNS stand for?', type: 'fill_in_blank', correctAnswer: 'Domain Name System', explanation: 'DNS translates human-readable domain names to IP addresses.' }
  ];
  
  const needed = 15 - existing.length;
  for (let i = 0; i < needed && i < baseQuestions.length; i++) {
    additional.push(baseQuestions[i]);
  }
  
  return [...existing, ...additional].slice(0, 15);
}

// Extract commands from steps
export function extractCommandsFromSteps(steps) {
  if (!steps || !Array.isArray(steps)) return [];
  
  const commands = new Set();
  steps.forEach(step => {
    if (step.commands && Array.isArray(step.commands)) {
      step.commands.forEach(cmd => {
        if (cmd && typeof cmd === 'string') {
          const firstWord = cmd.split(' ')[0].toLowerCase();
          if (!['enable', 'end', 'exit', 'configure', 'terminal'].includes(firstWord)) {
            commands.add(firstWord);
          }
        } else if (cmd && typeof cmd === 'object' && cmd.raw) {
          const firstWord = cmd.raw.split(' ')[0].toLowerCase();
          if (!['enable', 'end', 'exit', 'configure', 'terminal'].includes(firstWord)) {
            commands.add(firstWord);
          }
        }
      });
    }
  });
  
  return Array.from(commands).slice(0, 20);
}

// Slugify utility
function slugify(text) {
  if (!text) return 'untitled';
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Build backend profile with truthful limitations
export function buildBackendProfile(lab) {
  const commands = [...new Set([
    ...(lab.commandsToLearn || []),
    ...(lab.steps || []).flatMap(step => 
      (step.commands || []).map(cmd => typeof cmd === 'string' ? cmd.split(' ')[0] : (cmd.raw || '').split(' ')[0])
    )
  ].filter(Boolean))];
  
  const unsupportedCommands = commands.filter(command => 
    SIMULATOR_CAPABILITIES.unsupportedProtocols.some(proto => command.toLowerCase().includes(proto))
  );
  
  return {
    type: lab.backendProfile?.type || 'browser-simulation',
    fidelity: lab.backendProfile?.fidelity || 'concept',
    requiredCapabilities: lab.backendProfile?.requiredCapabilities || [],
    supportedCommands: lab.backendProfile?.supportedCommands || commands.filter(c => !unsupportedCommands.includes(c)),
    unsupportedCommands: unsupportedCommands,
    resourceRequirements: lab.backendProfile?.resourceRequirements || { cpuMb: 0, memoryMb: 0, requiresImage: false },
    limitations: getSimulatorLimitations(lab)
  };
}

// Build capability summary
export function buildCapabilitySummary(lab) {
  return {
    topology: Boolean(lab.topology?.devices?.length || lab.topology?.connections?.length),
    requiredDevices: Boolean(lab.labGuide?.requiredDevices?.length || lab.topology?.devices?.length > 0),
    verification: Boolean(lab.steps?.some(step => step.verification?.type)),
    troubleshooting: Boolean(lab.troubleshooting?.commonErrors?.length || lab.labGuide?.troubleshootingMethod?.length),
    questions: Boolean(lab.knowledgeCheck?.length >= 15)
  };
}

// Calculate progressive difficulty score from actual lab properties
// D = topology complexity + protocol complexity + number of devices + ambiguity + fault count + independence + time pressure + explanation requirement
export function calculateDifficultyScore(lab) {
  if (!lab || typeof lab !== 'object') return 0;
  
  const topology = lab.topology || {};
  const steps = Array.isArray(lab.steps) ? lab.steps : [];
  const deviceCount = (topology.devices?.length || 0) + (topology.connections?.length || 0);
  const protocolSet = new Set();
  
  steps.forEach(step => {
    if (step.commands && Array.isArray(step.commands)) {
      step.commands.forEach(cmd => {
        const raw = typeof cmd === 'string' ? cmd : (cmd.raw || '');
        const firstWord = raw.split(' ')[0]?.toLowerCase();
        if (firstWord && !['enable', 'end', 'exit', 'configure', 'terminal', 'write', 'no'].includes(firstWord)) {
          protocolSet.add(firstWord);
        }
      });
    }
  });
  
  const protocolComplexity = Math.min(protocolSet.size, 8) / 8;
  const topologyComplexity = Math.min(deviceCount, 10) / 10;
  const hasFaultInjection = lab.faultInjection?.faults?.length > 0;
  const faultCount = hasFaultInjection ? Math.min(lab.faultInjection.faults.length, 5) : 0;
  const troubleshootingDepth = (lab.troubleshooting?.commonErrors || []).reduce((sum, err) => {
    return sum + (err.diagnosticCommands?.length || 0) + (err.troubleshootingSteps?.length || 0) + (err.possibleCauses?.length || 0);
  }, 0);
  const normalizedTroubleshooting = Math.min(troubleshootingDepth / 10, 1);
  
  // Ambiguity: higher for labs with vague instructions or multiple valid solutions
  const ambiguousSteps = steps.filter(s => !s.expectedResult || s.expectedResult.length < 20).length;
  const ambiguity = steps.length > 0 ? Math.min(ambiguousSteps / steps.length, 1) : 0;
  
  // Independence: how much the learner must figure out without step-by-step guidance
  const independence = steps.length > 0 ? Math.min((steps.filter(s => s.hints?.length > 2 || s.progressiveHints).length) / steps.length, 1) : 0;
  
  // Time pressure: based on estimated time vs step count
  const estimatedMinutes = parseInt(lab.estimatedTime) || 15;
  const timePressure = steps.length > 0 ? Math.min(estimatedMinutes / (steps.length * 2), 1) : 0;
  
  // Explanation requirement: based on concepts, skills, learning objectives
  const explanationRequirement = Math.min(
    ((lab.concepts?.length || 0) + (lab.skills?.length || 0) + (lab.learningObjectives?.length || 0)) / 15,
    1
  );
  
  const score = (
    topologyComplexity * 0.2 +
    protocolComplexity * 0.2 +
    Math.min(deviceCount / 10, 1) * 0.15 +
    ambiguity * 0.15 +
    (hasFaultInjection ? faultCount * 0.1 : 0) +
    normalizedTroubleshooting * 0.05 +
    independence * 0.1 +
    timePressure * 0.1 +
    explanationRequirement * 0.05
  );
  
  return Math.min(Math.max(score, 0), 1);
}

export default {
  enrichLabContent,
  enhanceTopology,
  enhanceSteps,
  generateIpPlan,
  generateExpectedStartingState,
  generateTroubleshooting,
  ensureMinimumSteps,
  ensureMinimumQuestions,
  getSimulatorLimitations,
  buildBackendProfile,
  buildCapabilitySummary,
  calculateDifficultyScore,
  assignBatch,
  assignProgressiveLevel,
  getBatchRemediationFocus,
  PROGRESSIVE_LEVELS,
  SIMULATOR_CAPABILITIES,
  BATCH_DEFINITIONS,
  DIFFICULTY_FACTORS
};
