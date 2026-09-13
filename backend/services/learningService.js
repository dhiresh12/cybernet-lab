const { v4: uuidv4 } = require('uuid');
const { labs, learnerProgress, dailyMissions, retrievalQueue, evidence, failureLabs, troubleshootingSessions, interviewQuestions, researchExperiments, portfolioArtifacts, studyPlanner, skillGraph, debriefs, courses, courseEnrollments, interviewSessions, interviewHistory, interviewWeakAreas } = require('../state/state');

const ROADMAP_STAGES = [
  {
    id: 'zero',
    title: 'Zero / Foundations',
    description: 'Computer fundamentals, networking basics, OSI model, IP addressing',
    estimatedWeeks: 2,
    skills: ['computer-fundamentals', 'osi-model', 'ip-addressing', 'subnetting-basics'],
    labs: []
  },
  {
    id: 'ccna',
    title: 'CCNA Practical Mastery',
    description: 'Switching, routing, VLANs, OSPF, EIGRP, ACLs, NAT, DHCP, DNS',
    estimatedWeeks: 6,
    skills: ['vlan', 'trunking', 'ospf', 'eigrp', 'acl', 'nat', 'dhcp', 'dns', 'spanning-tree'],
    labs: []
  },
  {
    id: 'ccnp',
    title: 'CCNP Enterprise',
    description: 'Advanced routing, multi-area OSPF, BGP, network design, QoS',
    estimatedWeeks: 8,
    skills: ['bgp', 'multiprotocol', 'network-design', 'qos', 'high-availability', 'troubleshooting-advanced'],
    labs: []
  },
  {
    id: 'security',
    title: 'Network Security',
    description: 'Firewalls, VPN, IDS/IPS, secure access, threat detection',
    estimatedWeeks: 6,
    skills: ['firewall', 'vpn', 'ids-ips', 'access-control', 'threat-detection', 'incident-response'],
    labs: []
  },
  {
    id: 'advanced',
    title: 'Advanced Enterprise',
    description: 'Automation, monitoring, SD-WAN, cloud networking, network programmability',
    estimatedWeeks: 8,
    skills: ['automation', 'monitoring', 'sd-wan', 'cloud-networking', 'network-programmability', 'telemetry'],
    labs: []
  },
  {
    id: 'research',
    title: 'Research & Innovation',
    description: 'Network experiments, protocol analysis, research methodology, capstone projects',
    estimatedWeeks: 12,
    skills: ['research-methodology', 'protocol-analysis', 'experiment-design', 'capstone', 'innovation'],
    labs: []
  }
];

function buildRoadmap() {
  const allLabs = Array.from(labs.values());
  ROADMAP_STAGES.forEach(stage => {
    stage.labs = allLabs.filter(lab => {
      const cat = (lab.category || '').toLowerCase();
      const level = (lab.level || '').toLowerCase();
      if (stage.id === 'zero') return cat.includes('fundamental') || cat.includes('basic') || level === 'basic';
      if (stage.id === 'ccna') return cat.includes('ccna') || cat.includes('routing') || cat.includes('switching') || level === 'basic' || level === 'medium';
      if (stage.id === 'ccnp') return cat.includes('ccnp') || cat.includes('advanced') || level === 'medium' || level === 'advanced';
      if (stage.id === 'security') return cat.includes('security') || cat.includes('soc') || cat.includes('firewall');
      if (stage.id === 'advanced') return cat.includes('advanced') || cat.includes('automation') || cat.includes('enterprise');
      if (stage.id === 'research') return cat.includes('research') || cat.includes('capstone') || cat.includes('innovation');
      return false;
    }).map(l => ({ id: l.id, title: l.title, level: l.level, category: l.category }));
  });
  return ROADMAP_STAGES;
}

function getDailyMission(learnerId) {
  const existing = dailyMissions.get(String(learnerId));
  if (existing && existing.date === new Date().toISOString().slice(0, 10)) {
    return existing;
  }

  const progress = learnerProgress.get(String(learnerId)) || { completedLabs: [], currentLab: null };
  const allLabs = Array.from(labs.values()).filter(l => !l.prerequisites || l.prerequisites.length === 0 || progress.completedLabs.some(p => (l.prerequisites || []).includes(p)));
  const available = allLabs.filter(l => !progress.completedLabs.includes(String(l.id)));

  let mission;
  if (available.length > 0) {
    const lab = available[Math.floor(Math.random() * available.length)];
    const requiredTools = [];
    if (lab.category && lab.category.toLowerCase().includes('cisco')) requiredTools.push('Cisco CLI / Packet Tracer');
    if (lab.category && lab.category.toLowerCase().includes('security')) requiredTools.push('Wireshark');
    if (lab.category && lab.category.toLowerCase().includes('linux')) requiredTools.push('Linux terminal');
    if (requiredTools.length === 0) requiredTools.push('Packet Tracer');

    mission = {
      id: uuidv4(),
      learnerId: String(learnerId),
      date: new Date().toISOString().slice(0, 10),
      type: 'lab',
      title: `Complete lab: ${lab.title}`,
      description: `Work through the ${lab.title} lab. Focus on the key concepts and verify each step.`,
      labId: lab.id,
      estimatedTime: lab.time || '30 minutes',
      requiredTools,
      status: 'pending',
      createdAt: Date.now()
    };
  } else {
    mission = {
      id: uuidv4(),
      learnerId: String(learnerId),
      date: new Date().toISOString().slice(0, 10),
      type: 'review',
      title: 'Review completed concepts',
      description: 'Review concepts from previously completed labs using retrieval practice.',
      labId: null,
      estimatedTime: '15 minutes',
      requiredTools: ['Study notes'],
      status: 'pending',
      createdAt: Date.now()
    };
  }

  dailyMissions.set(String(learnerId), mission);
  return mission;
}

function completeMission(learnerId, missionId) {
  const mission = dailyMissions.get(String(learnerId));
  if (!mission || mission.id !== missionId) {
    return { error: 'Mission not found' };
  }
  mission.status = 'completed';
  mission.completedAt = Date.now();
  return { mission };
}

function getRetrievalDue(learnerId) {
  const key = String(learnerId);
  const queue = retrievalQueue.get(key) || [];
  const now = Date.now();
  const due = queue.filter(q => q.dueAt <= now && !q.answered);
  return { count: due.length, questions: due.map(q => ({
    id: q.id,
    question: q.question,
    options: q.options,
    topic: q.topic,
    difficulty: q.difficulty,
    dueAt: q.dueAt,
    answered: q.answered,
    correct: q.correct
  })) };
}

function addRetrievalQuestion(learnerId, question) {
  const key = String(learnerId);
  const queue = retrievalQueue.get(key) || [];
  const entry = {
    id: uuidv4(),
    question: question.question,
    options: question.options || [],
    correctAnswer: question.correctAnswer,
    topic: question.topic,
    difficulty: question.difficulty || 'medium',
    dueAt: Date.now(),
    answered: false,
    correct: null,
    answeredAt: null,
    createdAt: Date.now()
  };
  queue.push(entry);
  retrievalQueue.set(key, queue);
  return entry;
}

function answerRetrievalQuestion(learnerId, questionId, selectedAnswer) {
  const key = String(learnerId);
  const queue = retrievalQueue.get(key) || [];
  const entry = queue.find(q => q.id === questionId);
  if (!entry) {
    return { error: 'Question not found' };
  }
  entry.answered = true;
  entry.selectedAnswer = selectedAnswer;
  entry.correct = selectedAnswer === entry.correctAnswer;
  entry.answeredAt = Date.now();
  entry.nextDueAt = Date.now() + (entry.correct ? 3 * 24 * 60 * 60 * 1000 : 1 * 24 * 60 * 60 * 1000);
  return {
    id: entry.id,
    correct: entry.correct,
    correctAnswer: entry.correctAnswer,
    explanation: entry.explanation,
    nextDueAt: entry.nextDueAt
  };
}

function addLearningEvidence(learnerId, evidenceItem) {
  const key = String(learnerId);
  const list = evidence.get(key) || [];
  const item = {
    id: uuidv4(),
    learnerId: key,
    labId: evidenceItem.labId,
    type: evidenceItem.type || 'output',
    title: evidenceItem.title || 'Evidence',
    data: evidenceItem.data || {},
    tags: evidenceItem.tags || [],
    createdAt: Date.now()
  };
  list.push(item);
  evidence.set(key, list);
  return item;
}

function getEvidence(learnerId) {
  const key = String(learnerId);
  const list = evidence.get(key) || [];
  return { count: list.length, evidence: list };
}

function getFailureLabState(labId) {
  const state = failureLabs.get(String(labId)) || {
    labId: String(labId),
    faults: [],
    injectedFault: null,
    injectionHistory: []
  };
  return state;
}

function injectFailure(labId, faultConfig) {
  const key = String(labId);
  const state = getFailureLabState(key);
  const fault = {
    id: uuidv4(),
    type: faultConfig.type || 'interface_down',
    target: faultConfig.target || null,
    description: faultConfig.description || '',
    injectedAt: Date.now(),
    detected: false,
    resolution: null
  };
  state.faults.push(fault);
  state.injectedFault = fault;
  state.injectionHistory.push({
    faultId: fault.id,
    type: fault.type,
    target: fault.target,
    injectedAt: fault.injectedAt
  });
  failureLabs.set(key, state);
  return { fault, state };
}

function clearFailure(labId, faultId) {
  const key = String(labId);
  const state = failureLabs.get(key);
  if (!state) {
    return { error: 'No failure lab state found' };
  }
  const fault = state.faults.find(f => f.id === faultId);
  if (fault) {
    fault.detected = true;
    fault.resolvedAt = Date.now();
    state.faults = state.faults.filter(f => f.id !== faultId);
    if (state.injectedFault && state.injectedFault.id === faultId) {
      state.injectedFault = null;
    }
  }
  return { state };
}

function getTroubleshootingGuide(labId, stepId) {
  const lab = labs.get(String(labId));
  if (!lab) {
    return { error: 'Lab not found' };
  }
  const step = lab.steps.find(s => String(s.stepId || s.id) === String(stepId));
  if (!step) {
    return { error: 'Step not found' };
  }
  const hints = (step.hints || []).map((text, idx) => ({
    tier: idx,
    text,
    type: idx === 0 ? 'clarification' : idx === 1 ? 'narrowing' : 'diagnostic'
  }));
  return {
    stepId: step.stepId || step.id,
    stepTitle: step.title,
    hints,
    troubleshooting: {
      decisionTree: step.troubleshooting || [],
      commonMistakes: step.commonMistakes || []
    }
  };
}

function getInterviewQuestions(topicId) {
  const key = String(topicId);
  let questions = interviewQuestions.get(key);
  if (!questions || questions.length === 0) {
    seedInterviewDefaults(key);
    questions = interviewQuestions.get(key) || [];
  }
  return questions.map(q => ({
    id: q.id,
    level: q.level,
    question: q.question,
    expectedAnswer: q.expectedAnswer,
    tips: q.tips || [],
    followUp: q.followUp || []
  }));
}

function addInterviewQuestion(topicId, question) {
  const key = String(topicId);
  const list = interviewQuestions.get(key) || [];
  const q = {
    id: uuidv4(),
    topicId: key,
    level: question.level || 'basic',
    question: question.question,
    expectedAnswer: question.expectedAnswer || '',
    tips: question.tips || [],
    followUp: question.followUp || [],
    createdAt: Date.now()
  };
  list.push(q);
  interviewQuestions.set(key, list);
  return q;
}

const ROLE_QUESTION_BANKS = {
  'noc': [
    { level: 1, question: 'What is a Network Operations Center (NOC)?', expectedAnswer: 'A NOC is a centralized location where network monitoring and management occurs, ensuring network availability and performance.', topic: 'Foundations', expectedKeywords: ['monitoring', 'centralized', 'availability', 'performance', 'management'] },
    { level: 2, question: 'Why is 24/7 monitoring critical in a NOC environment?', expectedAnswer: 'Networks operate continuously; failures outside business hours impact revenue, customer experience, and SLA compliance.', topic: 'Foundations', expectedKeywords: ['uptime', 'SLA', 'revenue', 'customer', 'continuous'] },
    { level: 3, question: 'How do you correlate alerts from multiple monitoring tools?', expectedAnswer: 'Use common event formats, timestamp alignment, root cause analysis, and deduplication to reduce alert fatigue.', topic: 'Monitoring', expectedKeywords: ['correlation', 'timestamps', 'deduplication', 'root cause', 'alert fatigue'] },
    { level: 4, question: 'Configure a basic network monitoring dashboard using SNMP and syslog.', expectedAnswer: 'Set up SNMP polling on routers/switches, configure syslog servers, and create threshold-based alerts.', topic: 'Monitoring', expectedKeywords: ['SNMP', 'syslog', 'thresholds', 'polling', 'alerts'] },
    { level: 5, question: 'Verify end-to-end connectivity when a user reports an outage.', expectedAnswer: 'Check physical interfaces, ping/traceroute, ARP tables, routing tables, and upstream ISP status.', topic: 'Troubleshooting', expectedKeywords: ['ping', 'traceroute', 'interfaces', 'routing', 'ISP'] },
    { level: 6, question: 'Troubleshoot intermittent packet loss across a WAN link.', expectedAnswer: 'Check interface errors, duplex settings, MTU mismatches, queue drops, and ISP circuit status.', topic: 'Troubleshooting', expectedKeywords: ['packet loss', 'duplex', 'MTU', 'queue drops', 'WAN'] },
    { level: 7, question: 'Design a NOC escalation matrix for a multi-tier support model.', expectedAnswer: 'Define L1/L2/L3 tiers, SLA windows, handoff criteria, communication channels, and runbook ownership.', topic: 'Design', expectedKeywords: ['escalation', 'L1', 'L2', 'L3', 'SLA', 'runbook'] },
    { level: 8, question: 'Defend the NOC against a DDoS attack while maintaining service availability.', expectedAnswer: 'Activate DDoS mitigation, rate-limit at edge, divert traffic via BGP, communicate with stakeholders, and document timeline.', topic: 'Defense', expectedKeywords: ['DDoS', 'rate-limit', 'BGP', 'mitigation', 'stakeholders', 'document'] },
    { level: 9, question: 'Lead a post-incident review after a major NOC outage and implement preventive measures.', expectedAnswer: 'Facilitate blameless review, identify root cause, update runbooks, implement automation, and track action items.', topic: 'Leadership', expectedKeywords: ['post-incident', 'review', 'runbooks', 'automation', 'action items', 'preventive'] }
  ],
  'network-engineer': [
    { level: 1, question: 'What is a network engineer responsible for?', expectedAnswer: 'Designing, implementing, and maintaining network infrastructure including routers, switches, firewalls, and links.', topic: 'Foundations', expectedKeywords: ['design', 'implement', 'maintain', 'infrastructure', 'routers'] },
    { level: 2, question: 'Why do we use subnetting instead of flat addressing?', expectedAnswer: 'Subnetting reduces broadcast domains, improves security, enables efficient IP allocation, and simplifies routing.', topic: 'Foundations', expectedKeywords: ['broadcast', 'security', 'IP allocation', 'routing', 'domains'] },
    { level: 3, question: 'How does OSPF elect the Designated Router (DR)?', expectedAnswer: 'DR election uses priority (higher wins) then highest Router ID. DR reduces LSA flooding on multi-access networks.', topic: 'Routing', expectedKeywords: ['priority', 'Router ID', 'LSA', 'multi-access', 'flooding'] },
    { level: 4, question: 'Configure VLAN trunking between two Cisco switches.', expectedAnswer: 'Set switchport mode trunk, allowed VLAN list, native VLAN, and encapsulation dot1q on both ends.', topic: 'Configuration', expectedKeywords: ['trunk', 'VLAN', 'dot1q', 'native', 'encapsulation'] },
    { level: 5, question: 'Verify OSPF neighbor adjacency on a router.', expectedAnswer: 'Use show ip ospf neighbor to check state (Full/2-Way), neighbor ID, priority, and dead timer.', topic: 'Verification', expectedKeywords: ['show ip ospf neighbor', 'Full', '2-Way', 'dead timer', 'adjacency'] },
    { level: 6, question: 'Troubleshoot why a new VLAN cannot communicate across trunks.', expectedAnswer: 'Check allowed VLAN list on trunk, VLAN existence on both switches, port status, and native VLAN consistency.', topic: 'Troubleshooting', expectedKeywords: ['allowed VLAN', 'trunk', 'native VLAN', 'port status', 'existence'] },
    { level: 7, question: 'Design a hierarchical campus network for 500 users across 3 buildings.', expectedAnswer: 'Use core-distribution-access layers, redundant links, VLAN segmentation, inter-VLAN routing, and PoE for endpoints.', topic: 'Design', expectedKeywords: ['core', 'distribution', 'access', 'redundant', 'VLAN', 'PoE'] },
    { level: 8, question: 'Defend a proposed network design against a security audit.', expectedAnswer: 'Implement defense-in-depth, segmentation, ACLs, logging, patch management, least privilege, and regular audits.', topic: 'Defense', expectedKeywords: ['segmentation', 'ACLs', 'logging', 'patch', 'least privilege', 'audit'] },
    { level: 9, question: 'Lead a network transformation project from legacy to SD-WAN with zero user impact.', expectedAnswer: 'Assess current state, design phased migration, implement traffic shaping, validate with baselines, and train operations team.', topic: 'Leadership', expectedKeywords: ['SD-WAN', 'phased migration', 'traffic shaping', 'baseline', 'training', 'zero impact'] }
  ],
  'network-security': [
    { level: 1, question: 'What is network security?', expectedAnswer: 'Protecting network infrastructure, data, and services from unauthorized access, misuse, or damage.', topic: 'Foundations', expectedKeywords: ['protection', 'infrastructure', 'unauthorized', 'data', 'services'] },
    { level: 2, question: 'Why is defense-in-depth important in network security?', expectedAnswer: 'Multiple layered controls ensure that if one fails, others still protect the asset; reduces single points of failure.', topic: 'Foundations', expectedKeywords: ['layered', 'controls', 'single point', 'failure', 'redundant'] },
    { level: 3, question: 'How does an IDS differ from an IPS?', expectedAnswer: 'IDS monitors and alerts on suspicious traffic; IPS sits inline and can actively block or reset malicious connections.', topic: 'Security', expectedKeywords: ['monitor', 'alert', 'inline', 'block', 'IDS', 'IPS'] },
    { level: 4, question: 'Configure an extended ACL to block HTTP access to a web server from the internet.', expectedAnswer: 'Create ACL denying TCP port 80 from external to server IP, apply inbound on external interface, permit established traffic.', topic: 'Configuration', expectedKeywords: ['ACL', 'HTTP', 'port 80', 'inbound', 'permit established'] },
    { level: 5, question: 'Verify that port security is blocking unauthorized MAC addresses.', expectedAnswer: 'Use show port-security interface to see violation count, status (secure/ shutdown), and last violation MAC.', topic: 'Verification', expectedKeywords: ['show port-security', 'violation', 'MAC', 'secure', 'shutdown'] },
    { level: 6, question: 'Troubleshoot why SSH management access is timing out.', expectedAnswer: 'Check ACL blocking port 22, interface ACL, NAT, SSH enabled locally, VTY access class, and routing to management subnet.', topic: 'Troubleshooting', expectedKeywords: ['SSH', 'port 22', 'ACL', 'VTY', 'routing', 'NAT'] },
    { level: 7, question: 'Design a secure DMZ architecture for public-facing services.', expectedAnswer: 'Use triple-homed firewall, separate management and data planes, strict ingress/egress filtering, and jump hosts.', topic: 'Design', expectedKeywords: ['DMZ', 'triple-homed', 'firewall', 'ingress', 'egress', 'jump host'] },
    { level: 8, question: 'Defend a network against a ransomware outbreak.', expectedAnswer: 'Segment critical assets, disable SMB if unnecessary, enforce EDR, block C2 domains, restore from clean backups.', topic: 'Defense', expectedKeywords: ['segment', 'SMB', 'EDR', 'C2', 'backup', 'containment'] },
    { level: 9, question: 'Lead a zero-trust network architecture initiative across a global enterprise.', expectedAnswer: 'Define identity perimeter, micro-segmentation, continuous verification, least-privilege access, and cross-team governance.', topic: 'Leadership', expectedKeywords: ['zero-trust', 'identity', 'micro-segmentation', 'continuous verification', 'governance'] }
  ],
  'soc': [
    { level: 1, question: 'What is a Security Operations Center (SOC)?', expectedAnswer: 'A SOC is a team and facility responsible for continuous monitoring, detection, analysis, and response to security events.', topic: 'Foundations', expectedKeywords: ['monitoring', 'detection', 'analysis', 'response', 'security events'] },
    { level: 2, question: 'Why is the SOC triad (People, Process, Technology) important?', expectedAnswer: 'Technology alone fails without trained people and documented processes; all three are required for effective defense.', topic: 'Foundations', expectedKeywords: ['people', 'process', 'technology', 'trained', 'documented'] },
    { level: 3, question: 'How does SIEM correlation improve threat detection?', expectedAnswer: 'SIEM aggregates logs, applies rules and behavioral analytics, correlates events across time and sources, and reduces false positives.', topic: 'Detection', expectedKeywords: ['aggregates', 'rules', 'behavioral', 'correlates', 'false positives'] },
    { level: 4, question: 'Configure a Windows endpoint to forward logs to a SIEM collector.', expectedAnswer: 'Enable Windows Event Forwarding, configure subscription, set collector computer, and validate event reception.', topic: 'Configuration', expectedKeywords: ['WEF', 'subscription', 'collector', 'events', 'forwarding'] },
    { level: 5, question: 'Verify that an IDS alert represents a true positive.', expectedAnswer: 'Check payload content, source/destination context, endpoint telemetry, and IOCs; confirm with threat intelligence.', topic: 'Verification', expectedKeywords: ['payload', 'context', 'telemetry', 'IOCs', 'threat intelligence'] },
    { level: 6, question: 'Troubleshoot why SOC analysts are missing critical alerts.', expectedAnswer: 'Review rule tuning, log gaps, parser failures, threshold settings, and analyst shift handoff procedures.', topic: 'Troubleshooting', expectedKeywords: ['rule tuning', 'log gaps', 'parser', 'threshold', 'handoff'] },
    { level: 7, question: 'Design an incident response playbook for a phishing campaign.', expectedAnswer: 'Define detection criteria, containment steps, eradication, recovery, post-incident review, and communication matrix.', topic: 'Design', expectedKeywords: ['playbook', 'containment', 'eradication', 'recovery', 'communication'] },
    { level: 8, question: 'Defend the SOC against an APT group conducting lateral movement.', expectedAnswer: 'Deploy EDR with behavioral analytics, network segmentation, honey tokens, MFA everywhere, and threat hunting cycles.', topic: 'Defense', expectedKeywords: ['EDR', 'segmentation', 'honey tokens', 'MFA', 'threat hunting'] },
    { level: 9, question: 'Lead a SOC maturity assessment and build a 12-month improvement roadmap.', expectedAnswer: 'Assess people/process/technology gaps, prioritize detections, implement SOAR playbooks, and measure MTTR reduction.', topic: 'Leadership', expectedKeywords: ['maturity', 'roadmap', 'SOAR', 'MTTR', 'people', 'process', 'technology'] }
  ],
  'ccna': [
    { level: 1, question: 'What is the purpose of the OSI model?', expectedAnswer: 'The OSI model standardizes network functions into 7 layers to enable interoperability and troubleshooting.', topic: 'Foundations', expectedKeywords: ['standardize', '7 layers', 'interoperability', 'troubleshooting', 'functions'] },
    { level: 2, question: 'Why do we use VLANs instead of flat networks?', expectedAnswer: 'VLANs reduce broadcast domains, improve security, enable logical grouping, and simplify management.', topic: 'Foundations', expectedKeywords: ['broadcast', 'security', 'logical grouping', 'management', 'domains'] },
    { level: 3, question: 'How does a switch build its MAC address table?', expectedAnswer: 'By learning source MAC addresses from incoming frames and mapping them to ingress ports.', topic: 'Switching', expectedKeywords: ['source MAC', 'learn', 'ingress port', 'table', 'frames'] },
    { level: 4, question: 'Configure a router with two VLANs using a trunk and subinterfaces.', expectedAnswer: 'Create subinterfaces with encapsulation dot1q, assign IP addresses as default gateways, enable trunk on switch port.', topic: 'Configuration', expectedKeywords: ['subinterfaces', 'encapsulation dot1q', 'default gateway', 'trunk', 'VLAN'] },
    { level: 5, question: 'Verify OSPF neighbor formation and routing table entries.', expectedAnswer: 'Check show ip ospf neighbor for Full state, show ip route ospf for learned routes, and verify interface costs.', topic: 'Verification', expectedKeywords: ['show ip ospf neighbor', 'Full', 'show ip route', 'cost', 'OSPF'] },
    { level: 6, question: 'Troubleshoot why a host cannot reach the internet.', expectedAnswer: 'Check IP addressing, default route, NAT configuration, interface status, ACLs, and DNS resolution.', topic: 'Troubleshooting', expectedKeywords: ['IP address', 'default route', 'NAT', 'interface', 'ACL', 'DNS'] },
    { level: 7, question: 'Design a small business network with redundancy and security.', expectedAnswer: 'Use dual ISP, HSRP, VLANs, ACLs, port security, and backup routes; document with diagrams.', topic: 'Design', expectedKeywords: ['dual ISP', 'HSRP', 'VLAN', 'ACL', 'port security', 'diagrams'] },
    { level: 8, question: 'Defend a campus network against ARP poisoning attacks.', expectedAnswer: 'Enable DHCP snooping, dynamic ARP inspection, port security, and static ARP entries for critical hosts.', topic: 'Defense', expectedKeywords: ['DHCP snooping', 'DAI', 'port security', 'static ARP', 'ARP poisoning'] },
    { level: 9, question: 'Lead a CCNA-level network refresh project for a branch office migration.', expectedAnswer: 'Plan IP scheme, configure routers/switches, validate connectivity, document as-built, and train local admins.', topic: 'Leadership', expectedKeywords: ['refresh', 'branch', 'IP scheme', 'as-built', 'training', 'validation'] }
  ],
  'ccnp': [
    { level: 1, question: 'What is the difference between distance-vector and link-state routing?', expectedAnswer: 'Distance-vector uses hop count and periodic full-table updates; link-state uses LSAs, SPF algorithm, and event-driven updates.', topic: 'Foundations', expectedKeywords: ['hop count', 'periodic', 'LSA', 'SPF', 'event-driven'] },
    { level: 2, question: 'Why is route summarization important in large networks?', expectedAnswer: 'Summarization reduces routing table size, LSA flooding, CPU load, and stabilizes convergence during failures.', topic: 'Foundations', expectedKeywords: ['table size', 'LSA', 'CPU', 'convergence', 'stability'] },
    { level: 3, question: 'How does BGP route selection work with multiple paths?', expectedAnswer: 'BGP selects based on weight, local preference, local route, AS_PATH length, origin, MED, and eBGP over iBGP.', topic: 'Routing', expectedKeywords: ['weight', 'local preference', 'AS_PATH', 'MED', 'eBGP', 'iBGP'] },
    { level: 4, question: 'Configure BGP with route maps for outbound traffic engineering.', expectedAnswer: 'Create route maps matching prefixes, set local preference or prepend AS_PATH, apply as neighbor route-map out.', topic: 'Configuration', expectedKeywords: ['route map', 'local preference', 'prepend', 'neighbor', 'outbound'] },
    { level: 5, question: 'Verify BGP path attributes and peering status.', expectedAnswer: 'Use show ip bgp summary for peer state, show ip bgp for attributes, and check AS_PATH and MED values.', topic: 'Verification', expectedKeywords: ['show ip bgp summary', 'peer state', 'AS_PATH', 'MED', 'attributes'] },
    { level: 6, question: 'Troubleshoot why a BGP route is not being advertised.', expectedAnswer: 'Check neighbor state, advertised prefix in BGP table, route-map filters, network statement accuracy, and next-hop reachability.', topic: 'Troubleshooting', expectedKeywords: ['neighbor', 'advertised', 'route-map', 'network statement', 'next-hop'] },
    { level: 7, question: 'Design a multi-homed BGP network with traffic engineering.', expectedAnswer: 'Use multiple ISPs, AS_PATH prepending, MED manipulation, local preference, and communities for policy-based routing.', topic: 'Design', expectedKeywords: ['multi-homed', 'AS_PATH', 'MED', 'local preference', 'communities'] },
    { level: 8, question: 'Defend a BGP peering session against hijack and route leaks.', expectedAnswer: 'Implement RPKI, prefix filters, IRR checks, max-prefix limits, MD5 authentication, and monitoring with BGPMon.', topic: 'Defense', expectedKeywords: ['RPKI', 'prefix filter', 'IRR', 'max-prefix', 'MD5', 'BGPMon'] },
    { level: 9, question: 'Lead a CCNP-level network redesign for a multi-site enterprise with hybrid connectivity.', expectedAnswer: 'Assess current topology, design SD-WAN overlay, implement routing policy, validate QoS, and produce migration runbooks.', topic: 'Leadership', expectedKeywords: ['redesign', 'SD-WAN', 'routing policy', 'QoS', 'migration', 'runbooks'] }
  ]
};

function getRoleQuestions(role, level) {
  const bank = ROLE_QUESTION_BANKS[role] || ROLE_QUESTION_BANKS['noc'];
  if (level) {
    return bank.filter(q => q.level === level).map(q => ({ ...q, role }));
  }
  return bank.map(q => ({ ...q, role }));
}

function createInterviewSession(learnerId, role) {
  const sessionId = uuidv4();
  const questions = getRoleQuestions(role);
  const session = {
    id: sessionId,
    learnerId: String(learnerId),
    role,
    questions,
    currentIndex: 0,
    answers: [],
    status: 'in_progress',
    score: null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  interviewSessions.set(sessionId, session);
  return { sessionId, questions: session.questions.map(q => ({ id: q.id || `${sessionId}-${q.level}`, level: q.level, question: q.question, topic: q.topic })) };
}

function submitInterviewAnswer(sessionId, questionId, answer) {
  const session = interviewSessions.get(String(sessionId));
  if (!session) return { error: 'Session not found' };
  if (session.status !== 'in_progress') return { error: 'Session already completed' };

  const question = session.questions.find(q => (q.id || `${sessionId}-${q.level}`) === String(questionId));
  if (!question) return { error: 'Question not found in session' };

  const answerText = String(answer || '').trim();
  const matchedKeywords = (question.expectedKeywords || []).filter(kw => answerText.toLowerCase().includes(kw.toLowerCase()));
  const keywordCoverage = question.expectedKeywords.length > 0 ? matchedKeywords.length / question.expectedKeywords.length : 0;
  const score = Math.round(keywordCoverage * 100);

  const answerRecord = {
    questionId: question.id || `${sessionId}-${question.level}`,
    question: question.question,
    level: question.level,
    topic: question.topic,
    answer: answerText,
    score,
    matchedKeywords,
    totalKeywords: question.expectedKeywords.length,
    submittedAt: Date.now()
  };

  session.answers.push(answerRecord);
  session.currentIndex += 1;
  session.updatedAt = Date.now();

  if (session.currentIndex >= session.questions.length) {
    session.status = 'completed';
    session.score = Math.round(session.answers.reduce((sum, a) => sum + a.score, 0) / session.answers.length);
    const historyEntry = {
      id: session.id,
      learnerId: session.learnerId,
      role: session.role,
      score: session.score,
      answers: session.answers,
      completedAt: Date.now(),
      createdAt: session.createdAt
    };
    const learnerHistory = interviewHistory.get(session.learnerId) || [];
    learnerHistory.push(historyEntry);
    interviewHistory.set(session.learnerId, learnerHistory);

    const weakTopics = session.answers.filter(a => a.score < 60).map(a => a.topic);
    const existingWeak = interviewWeakAreas.get(session.learnerId) || [];
    weakTopics.forEach(topic => {
      const existing = existingWeak.find(w => w.topic === topic);
      if (existing) {
        existing.count += 1;
        existing.lastSeen = Date.now();
      } else {
        existingWeak.push({ topic, count: 1, lastSeen: Date.now() });
      }
    });
    interviewWeakAreas.set(session.learnerId, existingWeak);
  }

  return { answer: answerRecord, sessionStatus: session.status, currentIndex: session.currentIndex, totalQuestions: session.questions.length };
}

function getInterviewHistory(learnerId) {
  const history = interviewHistory.get(String(learnerId)) || [];
  return { history: history.map(h => ({ id: h.id, role: h.role, score: h.score, completedAt: h.completedAt, answerCount: h.answers.length })) };
}

function getInterviewRecommendations(learnerId) {
  const history = interviewHistory.get(String(learnerId)) || [];
  const weak = (interviewWeakAreas.get(String(learnerId)) || []).sort((a, b) => b.count - a.count);
  const recentScores = history.slice(-5).map(h => h.score);
  const averageScore = recentScores.length > 0 ? Math.round(recentScores.reduce((a, b) => a + b, 0) / recentScores.length) : 0;

  const recommendations = [];
  if (averageScore < 50) {
    recommendations.push({ priority: 'high', text: 'Focus on foundational questions (levels 1-3) before advancing.' });
  } else if (averageScore < 70) {
    recommendations.push({ priority: 'medium', text: 'Practice scenario-based answers at levels 4-6 to strengthen applied knowledge.' });
  } else {
    recommendations.push({ priority: 'low', text: 'Review advanced defense and design questions to polish interview readiness.' });
  }

  weak.slice(0, 3).forEach(w => {
    recommendations.push({ priority: 'high', text: `Review ${w.topic}: ${w.count} weak session(s) detected.` });
  });

  if (history.length === 0) {
    recommendations.push({ priority: 'high', text: 'Start your first interview session to generate personalized recommendations.' });
  }

  return { learnerId, averageScore, totalSessions: history.length, weakAreas: weak.slice(0, 5), recommendations };
}

function identifyWeakAreas(learnerId) {
  const weak = interviewWeakAreas.get(String(learnerId)) || [];
  return { learnerId, weakAreas: weak.sort((a, b) => b.count - a.count) };
}

function getInterviewSession(sessionId) {
  const session = interviewSessions.get(String(sessionId));
  if (!session) return null;
  return {
    id: session.id,
    role: session.role,
    status: session.status,
    currentIndex: session.currentIndex,
    totalQuestions: session.questions.length,
    score: session.score,
    answers: session.answers
  };
}

function createResearchExperiment(learnerId, experiment) {
  const entry = {
    id: uuidv4(),
    learnerId: String(learnerId),
    title: experiment.title,
    problemStatement: experiment.problemStatement,
    knownFacts: experiment.knownFacts || [],
    unknowns: experiment.unknowns || [],
    hypothesis: null,
    observations: [],
    results: null,
    conclusion: null,
    status: 'draft',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  researchExperiments.set(entry.id, entry);
  return entry;
}

function getResearchExperiment(experimentId) {
  return researchExperiments.get(String(experimentId));
}

function listResearchExperiments(learnerId) {
  return Array.from(researchExperiments.values()).filter(e => e.learnerId === String(learnerId));
}

function setHypothesis(experimentId, hypothesisData) {
  const experiment = researchExperiments.get(String(experimentId));
  if (!experiment) {
    return { error: 'Experiment not found' };
  }
  experiment.hypothesis = hypothesisData.hypothesis || hypothesisData;
  experiment.status = 'hypothesis_set';
  experiment.updatedAt = Date.now();
  return experiment;
}

function addObservation(experimentId, observation) {
  const experiment = researchExperiments.get(String(experimentId));
  if (!experiment) {
    return { error: 'Experiment not found' };
  }
  const entry = {
    id: uuidv4(),
    data: observation.data || {},
    notes: observation.notes || '',
    timestamp: Date.now()
  };
  experiment.observations.push(entry);
  experiment.updatedAt = Date.now();
  return entry;
}

function completeResearchExperiment(experimentId, result) {
  const experiment = researchExperiments.get(String(experimentId));
  if (!experiment) {
    return { error: 'Experiment not found' };
  }
  experiment.results = result.results || {};
  experiment.conclusion = result.conclusion || '';
  experiment.status = 'completed';
  experiment.updatedAt = Date.now();
  return experiment;
}

function getPortfolio(learnerId) {
  const key = String(learnerId);
  return portfolioArtifacts.get(key) || [];
}

function addPortfolioArtifact(learnerId, artifact) {
  const key = String(learnerId);
  const list = portfolioArtifacts.get(key) || [];
  const entry = {
    id: uuidv4(),
    learnerId: key,
    type: artifact.type || 'lab_report',
    title: artifact.title || 'Untitled',
    content: artifact.content || {},
    labId: artifact.labId || null,
    tags: artifact.tags || [],
    createdAt: Date.now()
  };
  list.push(entry);
  portfolioArtifacts.set(key, list);
  return entry;
}

function getStudyPlanner(learnerId) {
  const key = String(learnerId);
  const existing = studyPlanner.get(key);
  if (!existing) {
    const planner = {
      learnerId: key,
      mode: existing?.mode || 'normal',
      availableMinutes: existing?.availableMinutes || 90,
      sessions: [],
      createdAt: Date.now()
    };
    studyPlanner.set(key, planner);
    return planner;
  }
  return existing;
}

function updateStudyPlanner(learnerId, updates) {
  const key = String(learnerId);
  const planner = getStudyPlanner(key);
  Object.assign(planner, updates, { updatedAt: Date.now() });
  studyPlanner.set(key, planner);
  return planner;
}

function startStudySession(learnerId, sessionData) {
  const planner = getStudyPlanner(learnerId);
  const session = {
    id: uuidv4(),
    mode: sessionData.mode || planner.mode || 'normal',
    plannedMinutes: sessionData.plannedMinutes || planner.availableMinutes || 90,
    startedAt: Date.now(),
    completedAt: null,
    activities: sessionData.activities || [],
    completed: false
  };
  planner.sessions.push(session);
  planner.currentSessionId = session.id;
  studyPlanner.set(String(learnerId), planner);
  return session;
}

function completeStudySession(learnerId, sessionId) {
  const planner = studyPlanner.get(String(learnerId));
  if (!planner || !planner.sessions) {
    return { error: 'Session not found' };
  }
  const session = planner.sessions.find(s => s.id === sessionId);
  if (!session) {
    return { error: 'Session not found' };
  }
  session.completed = true;
  session.completedAt = Date.now();
  return session;
}

function getSkillGraph(learnerId) {
  const key = String(learnerId);
  const existing = skillGraph.get(key);
  if (!existing) {
    const graph = {
      learnerId: key,
      skills: {},
      mastery: {},
      lastUpdated: Date.now()
    };
    skillGraph.set(key, graph);
    return graph;
  }
  return existing;
}

function updateSkillMastery(learnerId, skillId, mastery) {
  const graph = getSkillGraph(learnerId);
  graph.skills[skillId] = {
    mastery: Math.max(0, Math.min(1, mastery)),
    lastPracticed: Date.now(),
    attempts: (graph.skills[skillId]?.attempts || 0) + 1
  };
  graph.mastery[skillId] = graph.skills[skillId].mastery;
  graph.lastUpdated = Date.now();
  skillGraph.set(String(learnerId), graph);
  return graph;
}

function getSkillPrerequisites(skillId) {
  const lab = Array.from(labs.values()).find(l => String(l.id) === String(skillId));
  if (!lab) {
    return [];
  }
  const prereqs = lab.prerequisites || [];
  return Array.isArray(prereqs) ? prereqs.map(String) : [String(prereqs)];
}

function createDebrief(learnerId, labId, debriefData) {
  const key = `${String(learnerId)}-${String(labId)}`;
  const existing = debriefs.get(key);
  if (existing) {
    Object.assign(existing, debriefData, { updatedAt: Date.now() });
    return existing;
  }
  const debrief = {
    id: uuidv4(),
    learnerId: String(learnerId),
    labId: String(labId),
    problem: debriefData.problem || '',
    prediction: debriefData.prediction || '',
    configuration: debriefData.configuration || '',
    evidence: debriefData.evidence || '',
    failures: debriefData.failures || '',
    failureCause: debriefData.failureCause || '',
    helpfulCommands: debriefData.helpfulCommands || [],
    realWorldApplication: debriefData.realWorldApplication || '',
    conceptExplanation: debriefData.conceptExplanation || '',
    selfAssessment: debriefData.selfAssessment || '',
    completed: !!(debriefData.problem && debriefData.conceptExplanation),
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  debriefs.set(key, debrief);
  return debrief;
}

function getDebrief(learnerId, labId) {
  const key = `${String(learnerId)}-${String(labId)}`;
  return debriefs.get(key);
}

function createCourse(courseData) {
  const entry = {
    id: uuidv4(),
    title: courseData.title,
    description: courseData.description || '',
    stages: courseData.stages || [],
    prerequisites: courseData.prerequisites || [],
    estimatedWeeks: courseData.estimatedWeeks || 4,
    createdAt: Date.now()
  };
  courses.set(entry.id, entry);
  return entry;
}

function getCourse(courseId) {
  return courses.get(String(courseId));
}

function listCourses() {
  return Array.from(courses.values()).map(c => ({
    id: c.id,
    title: c.title,
    description: c.description,
    stages: c.stages,
    estimatedWeeks: c.estimatedWeeks,
    stageCount: c.stages.length
  }));
}

function enrollInCourse(learnerId, courseId) {
  const key = `${String(learnerId)}-${String(courseId)}`;
  const existing = courseEnrollments.get(key);
  if (existing) {
    return existing;
  }
  const course = courses.get(String(courseId));
  if (!course) {
    return { error: 'Course not found' };
  }
  const enrollment = {
    id: uuidv4(),
    learnerId: String(learnerId),
    courseId: String(courseId),
    currentStage: 0,
    completedStages: [],
    progress: 0,
    startedAt: Date.now(),
    completedAt: null
  };
  courseEnrollments.set(key, enrollment);
  return enrollment;
}

function updateCourseProgress(learnerId, courseId, stageProgress) {
  const key = `${String(learnerId)}-${String(courseId)}`;
  const enrollment = courseEnrollments.get(key);
  if (!enrollment) {
    return { error: 'Not enrolled in this course' };
  }
  const course = courses.get(String(courseId));
  if (!course) {
    return { error: 'Course not found' };
  }
  if (stageProgress.stageIndex !== undefined && stageProgress.stageIndex < course.stages.length) {
    enrollment.currentStage = stageProgress.stageIndex;
  }
  if (stageProgress.completed && !enrollment.completedStages.includes(String(stageProgress.stageIndex))) {
    enrollment.completedStages.push(String(stageProgress.stageIndex));
  }
  enrollment.progress = Math.round((enrollment.completedStages.length / course.stages.length) * 100);
  if (enrollment.progress === 100) {
    enrollment.completedAt = Date.now();
  }
  enrollment.updatedAt = Date.now();
  return enrollment;
}

function getCourseEnrollment(learnerId, courseId) {
  const key = `${String(learnerId)}-${String(courseId)}`;
  return courseEnrollments.get(key);
}

function seedInterviewDefaults(topicId) {
  const key = String(topicId);
  if (interviewQuestions.has(key)) return;
  const defaults = {
    'networking-basics': [
      {
        level: 'basic',
        question: 'What is the difference between a hub, a switch, and a router?',
        expectedAnswer: 'Hub operates at Layer 1 (physical), switch at Layer 2 (data link) using MAC addresses, router at Layer 3 (network) using IP addresses.',
        tips: ['Think about OSI layers', 'Consider MAC vs IP addressing'],
        followUp: ['When would you use a Layer 3 switch?', 'What is a collision domain vs broadcast domain?']
      },
      {
        level: 'medium',
        question: 'Explain how OSPF builds its routing table.',
        expectedAnswer: 'OSPF is a link-state protocol. Routers exchange LSAs, build a complete topology map, then run Dijkstra SPF algorithm to compute shortest paths.',
        tips: ['Distinguish link-state from distance-vector', 'Mention LSAs and SPF'],
        followUp: ['What is an LSA?', 'What prevents routing loops in OSPF?']
      },
      {
        level: 'advanced',
        question: 'Design a network for a 3-floor office with 200 users. How do you segment it and why?',
        expectedAnswer: 'Use VLANs per department/function, implement trunking between switches, configure inter-VLAN routing on a Layer 3 device or SVI. Consider security, broadcast containment, and management overhead.',
        tips: ['Consider user groups', 'Think about broadcast domains'],
        followUp: ['What routing protocol would you use?', 'How would you secure the management plane?']
      }
    ],
    'security': [
      {
        level: 'basic',
        question: 'What is an ACL and where would you apply it?',
        expectedAnswer: 'An Access Control List filters traffic based on rules. Can be applied inbound/outbound on router interfaces or on VLAN SVI.',
        tips: ['Think about perimeter vs internal filtering', 'Mention standard vs extended'],
        followUp: ['What is an implicit deny?', 'How do ACLs affect performance?']
      },
      {
        level: 'medium',
        question: 'A user cannot access the internet but can reach internal resources. What do you check first?',
        expectedAnswer: 'Check default route, NAT configuration, ACLs on outbound interface, ISP connectivity, and interface status.',
        tips: ['Start with simplest checks', 'Check local configuration before ISP'],
        followUp: ['What command verifies NAT is working?', 'How would you test ISP connectivity?']
      }
    ]
  };
  const list = defaults[key] || [];
  list.forEach(q => addInterviewQuestion(key, q));
}

function seedStaticData() {
  if (courses.size === 0) {
    createCourse({
      title: 'Networking Foundations',
      description: 'Zero to networking basics: OSI, IP, subnetting, and basic device configuration.',
      stages: [
        { id: 's1', title: 'Micro-learning: OSI Model', type: 'theory', estimatedMinutes: 20 },
        { id: 's2', title: 'Practical: IP Addressing Lab', type: 'practical', estimatedMinutes: 30 },
        { id: 's3', title: 'Assessment: Quiz + Verification', type: 'assessment', estimatedMinutes: 20 },
        { id: 's4', title: 'Project: Design a Small Network', type: 'project', estimatedMinutes: 40 }
      ],
      estimatedWeeks: 2
    });

    createCourse({
      title: 'CCNA Switching & Routing',
      description: 'VLANs, trunking, OSPF, EIGRP, ACLs, and troubleshooting.',
      stages: [
        { id: 's1', title: 'Micro-learning: VLAN Concepts', type: 'theory', estimatedMinutes: 25 },
        { id: 's2', title: 'Practical: VLAN Configuration Lab', type: 'practical', estimatedMinutes: 45 },
        { id: 's3', title: 'Assessment: Verification + Troubleshooting', type: 'assessment', estimatedMinutes: 30 },
        { id: 's4', title: 'Project: Multi-VLAN Campus Design', type: 'project', estimatedMinutes: 60 }
      ],
      estimatedWeeks: 4
    });

    createCourse({
      title: 'Network Security Essentials',
      description: 'Firewalls, VPN, IDS/IPS, secure access, and incident response.',
      stages: [
        { id: 's1', title: 'Micro-learning: Defense in Depth', type: 'theory', estimatedMinutes: 20 },
        { id: 's2', title: 'Practical: Firewall Rules Lab', type: 'practical', estimatedMinutes: 40 },
        { id: 's3', title: 'Assessment: Incident Scenario', type: 'assessment', estimatedMinutes: 30 },
        { id: 's4', title: 'Project: Secure Network Design', type: 'project', estimatedMinutes: 60 }
      ],
      estimatedWeeks: 4
    });
  }

  if (interviewQuestions.size === 0) {
    seedInterviewDefaults('networking-basics');
    seedInterviewDefaults('security');
  }
}

seedStaticData();

module.exports = {
  buildRoadmap,
  getDailyMission,
  completeMission,
  getRetrievalDue,
  addRetrievalQuestion,
  answerRetrievalQuestion,
  addLearningEvidence,
  getEvidence,
  getFailureLabState,
  injectFailure,
  clearFailure,
  getTroubleshootingGuide,
  getInterviewQuestions,
  addInterviewQuestion,
  createResearchExperiment,
  getResearchExperiment,
  listResearchExperiments,
  setHypothesis,
  addObservation,
  completeResearchExperiment,
  getPortfolio,
  addPortfolioArtifact,
  getStudyPlanner,
  updateStudyPlanner,
  startStudySession,
  completeStudySession,
  getSkillGraph,
  updateSkillMastery,
  getSkillPrerequisites,
  createDebrief,
  getDebrief,
  createCourse,
  getCourse,
  listCourses,
  enrollInCourse,
  updateCourseProgress,
  getCourseEnrollment,
  getRoleQuestions,
  createInterviewSession,
  submitInterviewAnswer,
  getInterviewHistory,
  getInterviewRecommendations,
  identifyWeakAreas,
  getInterviewSession,
  seedStaticData
};
