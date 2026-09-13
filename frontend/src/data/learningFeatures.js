export const DAILY_MISSIONS = [
  { id: 'dm-1', topic: 'Subnetting Fundamentals', estimatedTime: 45, tools: ['CLI', 'Subnet Calculator'], difficulty: 'beginner', category: 'IPv4' },
  { id: 'dm-2', topic: 'VLAN Configuration', estimatedTime: 60, tools: ['Switch CLI', 'Trunking'], difficulty: 'intermediate', category: 'Switching' },
  { id: 'dm-3', topic: 'OSPF Neighbor Analysis', estimatedTime: 75, tools: ['Router CLI', 'Packet Tracer'], difficulty: 'advanced', category: 'Routing' },
  { id: 'dm-4', topic: 'ACL Design and Testing', estimatedTime: 50, tools: ['Router CLI', 'Access Lists'], difficulty: 'intermediate', category: 'Security' },
  { id: 'dm-5', topic: 'BGP Path Selection', estimatedTime: 90, tools: ['Router CLI', 'Route Maps'], difficulty: 'advanced', category: 'Routing' },
  { id: 'dm-6', topic: 'NAT Implementation', estimatedTime: 55, tools: ['Router CLI', 'NAT Rules'], difficulty: 'intermediate', category: 'Services' },
  { id: 'dm-7', topic: 'DHCP Snooping Hardening', estimatedTime: 40, tools: ['Switch CLI', 'Port Security'], difficulty: 'intermediate', category: 'Security' },
  { id: 'dm-8', topic: 'EIGRP Metric Tuning', estimatedTime: 65, tools: ['Router CLI', 'Bandwidth Settings'], difficulty: 'advanced', category: 'Routing' },
  { id: 'dm-9', topic: 'IPv6 SLAAC Debugging', estimatedTime: 50, tools: ['Router CLI', 'PC Settings'], difficulty: 'intermediate', category: 'IPv6' },
  { id: 'dm-10', topic: 'HSRP Configuration', estimatedTime: 70, tools: ['Router CLI', 'Virtual IP'], difficulty: 'advanced', category: 'Services' },
];

export const RETRIEVAL_QUESTION_BANK = [
  { id: 'rq-1', question: 'What is the difference between a switch and a hub?', answer: 'A switch operates at Layer 2 and forwards frames based on MAC addresses; a hub operates at Layer 1 and repeats signals to all ports.', difficulty: 'beginner', topic: 'Switching' },
  { id: 'rq-2', question: 'Explain the purpose of a VLAN.', answer: 'A VLAN segments a broadcast domain at Layer 2, improving security and reducing broadcast traffic without physical separation.', difficulty: 'beginner', topic: 'Switching' },
  { id: 'rq-3', question: 'What is the subnet mask for /24?', answer: '255.255.255.0, providing 256 addresses with 254 usable hosts.', difficulty: 'beginner', topic: 'IPv4' },
  { id: 'rq-4', question: 'What does OSPF use to calculate best path?', answer: 'OSPF uses cost, which is based on bandwidth (reference bandwidth divided by interface bandwidth).', difficulty: 'intermediate', topic: 'Routing' },
  { id: 'rq-5', question: 'What is a BGP AS number?', answer: 'An Autonomous System number uniquely identifies a network under a single administrative domain; private range is 64512-65535.', difficulty: 'intermediate', topic: 'Routing' },
  { id: 'rq-6', question: 'Explain NAT types: static, dynamic, PAT.', answer: 'Static maps one local to one global; dynamic maps from a pool; PAT (overload) maps many locals to one global using ports.', difficulty: 'intermediate', topic: 'Services' },
  { id: 'rq-7', question: 'What is an ACL and where is it applied?', answer: 'An Access Control List filters traffic; applied inbound or outbound on router interfaces or VLAN maps on switches.', difficulty: 'intermediate', topic: 'Security' },
  { id: 'rq-8', question: 'What is EIGRP Feasibility Condition?', answer: 'The reported distance of a successor must be less than the feasible distance of the current successor; this ensures loop-free paths.', difficulty: 'advanced', topic: 'Routing' },
  { id: 'rq-9', question: 'Explain BGP route reflection.', answer: 'Route reflectors allow iBGP to propagate routes within an AS without a full mesh by reflecting routes from clients to non-clients.', difficulty: 'advanced', topic: 'Routing' },
  { id: 'rq-10', question: 'What is a TCP SYN flood?', answer: 'A DoS attack sending many SYN requests without completing the handshake, exhausting server connection resources.', difficulty: 'intermediate', topic: 'Security' },
];

export const INTERVIEW_QUESTIONS = [
  { level: 1, question: 'What is a network protocol?', expectedKeywords: ['standard', 'rules', 'communication', 'format'], topic: 'Foundations' },
  { level: 2, question: 'Describe the OSI model layers.', expectedKeywords: ['physical', 'data link', 'network', 'transport', 'session', 'presentation', 'application'], topic: 'Foundations' },
  { level: 3, question: 'What is the difference between TCP and UDP?', expectedKeywords: ['connection-oriented', 'reliable', 'three-way handshake', 'connectionless', 'faster'], topic: 'Transport' },
  { level: 4, question: 'Explain how a switch learns MAC addresses.', expectedKeywords: ['source MAC', 'CAM table', 'port', 'floods', 'unicast'], topic: 'Switching' },
  { level: 5, question: 'What is a VLAN and why use it?', expectedKeywords: ['broadcast domain', 'security', 'segment', 'tagging', '802.1Q'], topic: 'Switching' },
  { level: 6, question: 'Describe the OSPF neighbor states.', expectedKeywords: ['down', 'init', 'two-way', 'exstart', 'exchange', 'loading', 'full'], topic: 'Routing' },
  { level: 7, question: 'What is BGP path manipulation?', expectedKeywords: ['AS_PATH', 'prepend', 'local preference', 'MED', 'weight'], topic: 'Routing' },
  { level: 8, question: 'Explain a zero-day network exploit mitigation strategy.', expectedKeywords: ['patching', 'IDS', 'segmentation', 'monitoring', 'least privilege'], topic: 'Security' },
  { level: 9, question: 'Design a network for a 5,000-user enterprise with redundancy.', expectedKeywords: ['redundancy', 'VSS', 'stacking', 'dual-homed', 'OSPF', 'BGP', 'monitoring'], topic: 'Design' },
];

export const DEBRIEF_QUESTIONS = [
  { id: 'd1', question: 'What was your initial hypothesis before starting the lab?' },
  { id: 'd2', question: 'Which command or tool provided the most decisive evidence?' },
  { id: 'd3', question: 'What assumption turned out to be incorrect?' },
  { id: 'd4', question: 'If you repeated this lab tomorrow, what would you do differently?' },
  { id: 'd5', question: 'Which concept was hardest to apply correctly and why?' },
  { id: 'd6', question: 'What did you learn about your own troubleshooting process?' },
  { id: 'd7', question: 'Which part of the verification was most time-consuming?' },
  { id: 'd8', question: 'What single piece of knowledge would have made this lab easier?' },
  { id: 'd9', question: 'How does this lab connect to a real-world scenario you might encounter?' },
  { id: 'd10', question: 'What would you document for a peer who needs to repeat this work?' },
];

export const STUDY_BLOCKS = [
  { id: 'A', name: 'Warm-up & Recall', duration: 10, activity: 'Review prior concepts and answer 3-5 retrieval cards.' },
  { id: 'B', name: 'Core Concept', duration: 15, activity: 'Read theory, watch demonstration, or attend micro-lesson.' },
  { id: 'C', name: 'Guided Practice', duration: 10, activity: 'Complete one guided lab step with hints enabled.' },
  { id: 'D', name: 'Independent Application', duration: 8, activity: 'Perform the skill without hints in a slightly different context.' },
  { id: 'E', name: 'Verification', duration: 5, activity: 'Run show/verify commands and compare actual vs expected output.' },
  { id: 'F', name: 'Reflection', duration: 2, activity: 'Write one sentence on what was confirmed and one open question.' },
];

export const COURSE_PHASES = [
  { id: 'micro', name: 'Micro-Learning', description: 'Focused 5-10 minute concept delivery with visual examples.', duration: '5-10 min' },
  { id: 'practical', name: 'Practical Lab', description: 'Hands-on application in a controlled topology with guided steps.', duration: '20-45 min' },
  { id: 'assessment', name: 'Assessment', description: 'Knowledge check, verification pass, and error detection.', duration: '10-15 min' },
  { id: 'project', name: 'Project', description: 'Integrate multiple skills into a capstone deliverable.', duration: '45-90 min' },
];

export const SKILL_GRAPH = {
  nodes: [
    { id: 'cli', label: 'CLI Basics', level: 1 },
    { id: 'ipv4', label: 'IPv4 Addressing', level: 1 },
    { id: 'switching', label: 'Switching', level: 2 },
    { id: 'vlan', label: 'VLANs', level: 2 },
    { id: 'routing', label: 'Static Routing', level: 3 },
    { id: 'ospf', label: 'OSPF', level: 4 },
    { id: 'eigrp', label: 'EIGRP', level: 4 },
    { id: 'bgp', label: 'BGP', level: 5 },
    { id: 'acl', label: 'ACLs', level: 3 },
    { id: 'nat', label: 'NAT/PAT', level: 4 },
    { id: 'dhcp', label: 'DHCP', level: 3 },
    { id: 'dns', label: 'DNS', level: 2 },
    { id: 'security', label: 'Security Hardening', level: 5 },
    { id: 'automation', label: 'Automation', level: 6 },
  ],
  edges: [
    { from: 'cli', to: 'ipv4' },
    { from: 'cli', to: 'switching' },
    { from: 'ipv4', to: 'vlan' },
    { from: 'ipv4', to: 'routing' },
    { from: 'switching', to: 'vlan' },
    { from: 'vlan', to: 'acl' },
    { from: 'routing', to: 'ospf' },
    { from: 'routing', to: 'eigrp' },
    { from: 'ospf', to: 'bgp' },
    { from: 'eigrp', to: 'bgp' },
    { from: 'routing', to: 'nat' },
    { from: 'ipv4', to: 'dhcp' },
    { from: 'ipv4', to: 'dns' },
    { from: 'acl', to: 'security' },
    { from: 'bgp', to: 'security' },
    { from: 'security', to: 'automation' },
    { from: 'ospf', to: 'automation' },
  ],
};

export const TROUBLESHOOTING_STEPS = [
  { id: 'symptom', label: 'SYMPTOM', prompt: 'State the observed symptom in one sentence. Include affected devices, users, and timeframe.' },
  { id: 'expected', label: 'EXPECTED', prompt: 'Describe what normal behavior looks like for this network function.' },
  { id: 'observe', label: 'OBSERVE', prompt: 'List the commands and outputs you will collect first (show, ping, traceroute, interface status).' },
  { id: 'hypothesis', label: 'HYPOTHESIS', prompt: 'Propose ONE testable hypothesis with a confidence level (Low/Medium/High).' },
  { id: 'test', label: 'TEST', prompt: 'Design the smallest safe test to confirm or reject this hypothesis.' },
  { id: 'result', label: 'RESULT', prompt: 'Record the actual output and whether it matched the hypothesis.' },
  { id: 'next', label: 'NEXT HYPOTHESIS', prompt: 'If rejected, state the next most likely cause. If confirmed, identify the root cause.' },
  { id: 'fix', label: 'FIX', prompt: 'Write the configuration change or procedural step to resolve the issue.' },
  { id: 'verify', label: 'VERIFY', prompt: 'Re-run the original symptom checks and add one broader scope check.' },
  { id: 'document', label: 'DOCUMENT', prompt: 'Summarize root cause, fix, verification evidence, and prevention measure.' },
];

export const RESEARCH_CYCLE = [
  { id: 'hypothesis', label: 'HYPOTHESIS', prompt: 'State the research question and falsifiable hypothesis.' },
  { id: 'experiment', label: 'EXPERIMENT', prompt: 'Design the controlled lab experiment with variables and controls.' },
  { id: 'measurement', label: 'MEASUREMENT', prompt: 'Define metrics, data collection method, and sample size.' },
  { id: 'result', label: 'RESULT', prompt: 'Record raw measurements and processed results without interpretation.' },
  { id: 'interpretation', label: 'INTERPRETATION', prompt: 'Explain what the result means for the hypothesis.' },
  { id: 'limitation', label: 'LIMITATION', prompt: 'List threats to validity, scope constraints, and alternative explanations.' },
  { id: 'next', label: 'NEXT EXPERIMENT', prompt: 'Propose the follow-up experiment to extend or challenge these findings.' },
];

export const FAILURE_FAULTS = [
  { id: 'f-1', name: 'Interface Shutdown', description: 'Target interface is administratively down.', deviceType: 'switch', severity: 'medium' },
  { id: 'f-2', name: 'Mismatched Duplex', description: 'Half-duplex on one side, full on the other causing collisions.', deviceType: 'switch', severity: 'low' },
  { id: 'f-3', name: 'Wrong Subnet Mask', description: 'Incorrect mask causes host to believe destination is on-link.', deviceType: 'host', severity: 'high' },
  { id: 'f-4', name: 'Missing Route', description: 'Destination network not in routing table.', deviceType: 'router', severity: 'high' },
  { id: 'f-5', name: 'ACL Blocking', description: 'Standard or extended ACL denying legitimate traffic.', deviceType: 'router', severity: 'medium' },
  { id: 'f-6', name: 'VLAN Mismatch', description: 'Access port assigned to wrong VLAN or trunk native mismatch.', deviceType: 'switch', severity: 'medium' },
  { id: 'f-7', name: 'Port Security Violation', description: 'Port-security shutdown triggered by unauthorized MAC.', deviceType: 'switch', severity: 'medium' },
  { id: 'f-8', name: 'OSPF Area Mismatch', description: 'Neighbors in different areas cannot form adjacency.', deviceType: 'router', severity: 'high' },
  { id: 'f-9', name: 'BGP Authentication Failure', description: 'MD5 password mismatch prevents session establishment.', deviceType: 'router', severity: 'medium' },
  { id: 'f-10', name: 'NAT Translation Exhaustion', description: 'Inside local address pool exhausted or PAT limit reached.', deviceType: 'router', severity: 'high' },
];

export const PORTFOLIO_CATEGORIES = [
  { id: 'topology', label: 'Topology Designs' },
  { id: 'config', label: 'Configuration Files' },
  { id: 'pcap', label: 'PCAP Analyses' },
  { id: 'troubleshoot', label: 'Troubleshooting Reports' },
  { id: 'incident', label: 'Incident Reports' },
  { id: 'diagrams', label: 'Network Diagrams' },
  { id: 'research', label: 'Research Experiments' },
  { id: 'capstone', label: 'Capstone Projects' },
  { id: 'interview', label: 'Interview Explanations' },
  { id: 'edr', label: 'Engineering Decision Records' },
];

export const STUDY_MODES = [
  { id: '45', name: 'Focused Sprint', minutes: 45, blocks: ['A', 'B', 'C', 'D', 'E'] },
  { id: '90', name: 'Deep Work', minutes: 90, blocks: ['A', 'B', 'C', 'D', 'E', 'F', 'B', 'C', 'D', 'E'] },
  { id: '150', name: 'Mastery Session', minutes: 150, blocks: ['A', 'B', 'C', 'D', 'E', 'F', 'A', 'B', 'C', 'D', 'E', 'F'] },
];
