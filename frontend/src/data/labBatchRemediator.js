/**
 * Lab Batch Remediator - CyberNet Lab
 * 
 * Implements batch remediation for all 247 labs across 10 batches.
 * Each batch focuses on specific lab categories and remediation strategies.
 * 
 * Batches:
 * A: Network Fundamentals
 * B: Switching/VLAN
 * C: Routing
 * D: Services
 * E: Security
 * F: Wireshark/Analysis
 * G: Linux/Network Systems
 * H: SOC
 * I: Advanced Enterprise
 * J: Capstones/Research
 */

import { enrichLabContent, BATCH_DEFINITIONS, getBatchRemediationFocus, assignBatch } from './labContentEnricher.js';
import { normalizeLab } from './labNormalizer.js';

export const BATCH_PRIORITIES = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9, J: 10
};

export const BATCH_REMEDIATION_STRATEGIES = {
  A: {
    name: 'Network Fundamentals',
    focus: 'Ensure solid understanding of OSI layers, IP addressing, and basic device identification',
    commonIssues: [
      'Incomplete IP addressing plans',
      'Missing device roles in topology',
      'Insufficient verification steps',
      'Generic real-world scenarios'
    ],
    remediation: [
      'Add specific company scenarios',
      'Enhance topology with device purposes',
      'Add detailed IP plans with subnets',
      'Ensure 20 steps with clear ACTION/WHY/VERIFY'
    ],
    validationCriteria: [
      'Every lab has unique company scenario',
      'Topology has device roles and link purposes',
      'IP plan includes subnets and gateways',
      'At least 15 knowledge check questions'
    ]
  },
  B: {
    name: 'Switching/VLAN',
    focus: 'Practice VLAN creation, assignment, and trunking verification with show commands',
    commonIssues: [
      'Missing VLAN configuration steps',
      'Incomplete trunk configuration',
      'No security boundary definitions',
      'Missing troubleshooting for VLAN mismatches'
    ],
    remediation: [
      'Add VLAN creation and verification steps',
      'Enhance trunk configuration with allowed VLANs',
      'Add VLAN-specific troubleshooting',
      'Include show vlan and show interfaces switchport verification'
    ],
    validationCriteria: [
      'VLAN configuration steps present',
      'Trunk configuration with allowed VLANs',
      'Show commands for verification',
      'VLAN-specific troubleshooting steps'
    ]
  },
  C: {
    name: 'Routing',
    focus: 'Focus on routing table interpretation, route selection, and redundancy',
    commonIssues: [
      'Missing routing protocol configuration',
      'Incomplete routing table verification',
      'No route troubleshooting',
      'Missing redundancy configuration'
    ],
    remediation: [
      'Add routing protocol configuration steps',
      'Enhance routing table verification',
      'Add route troubleshooting decision tree',
      'Include redundancy and failover steps'
    ],
    validationCriteria: [
      'Routing protocol configured correctly',
      'Routing table verification present',
      'Route troubleshooting included',
      'Redundancy steps included'
    ]
  },
  D: {
    name: 'Services',
    focus: 'Emphasize service troubleshooting: DHCP DORA, DNS resolution, NAT translation',
    commonIssues: [
      'Incomplete service configuration',
      'Missing service verification',
      'No service troubleshooting',
      'Generic service scenarios'
    ],
    remediation: [
      'Add detailed service configuration',
      'Enhance service verification steps',
      'Add service-specific troubleshooting',
      'Include real-world service scenarios'
    ],
    validationCriteria: [
      'Service configuration complete',
      'Service verification present',
      'Service troubleshooting included',
      'Real-world service scenarios'
    ]
  },
  E: {
    name: 'Security',
    focus: 'Practice least-privilege ACL design and security boundary verification',
    commonIssues: [
      'Missing ACL configuration',
      'Incomplete security verification',
      'No security decision tree',
      'Missing compliance context'
    ],
    remediation: [
      'Add ACL configuration with explanations',
      'Enhance security verification',
      'Add security troubleshooting decision tree',
      'Include compliance and audit context'
    ],
    validationCriteria: [
      'ACL rules explained',
      'Security verification present',
      'Security decision tree included',
      'Compliance context provided'
    ]
  },
  F: {
    name: 'Wireshark/Analysis',
    focus: 'Use packet analysis to correlate protocol behavior with configuration',
    commonIssues: [
      'Missing packet analysis steps',
      'No protocol behavior explanation',
      'Missing capture verification',
      'Generic analysis tasks'
    ],
    remediation: [
      'Add packet analysis steps',
      'Explain protocol behavior in detail',
      'Add capture verification',
      'Include specific analysis scenarios'
    ],
    validationCriteria: [
      'Packet analysis steps present',
      'Protocol behavior explained',
      'Capture verification included',
      'Specific analysis scenarios'
    ]
  },
  G: {
    name: 'Linux/Network Systems',
    focus: 'Combine network configuration with system-level verification and automation',
    commonIssues: [
      'Missing system-level commands',
      'No automation integration',
      'Missing Linux networking',
      'Generic system tasks'
    ],
    remediation: [
      'Add system-level network commands',
      'Include automation concepts',
      'Add Linux networking tasks',
      'Include system verification steps'
    ],
    validationCriteria: [
      'System-level commands included',
      'Automation concepts present',
      'Linux networking tasks added',
      'System verification steps'
    ]
  },
  H: {
    name: 'SOC',
    focus: 'Practice structured troubleshooting: isolate, diagnose, contain, recover',
    commonIssues: [
      'Missing incident response steps',
      'No evidence collection',
      'Missing containment procedures',
      'Generic troubleshooting'
    ],
    remediation: [
      'Add incident response workflow',
      'Include evidence collection steps',
      'Add containment and recovery',
      'Include SOC-specific scenarios'
    ],
    validationCriteria: [
      'Incident response workflow present',
      'Evidence collection steps included',
      'Containment procedures added',
      'SOC-specific scenarios'
    ]
  },
  I: {
    name: 'Advanced Enterprise',
    focus: 'Integrate multiple technologies in enterprise-scale scenarios',
    commonIssues: [
      'Single-technology focus',
      'Missing enterprise context',
      'No scalability discussion',
      'Limited integration'
    ],
    remediation: [
      'Add multi-technology integration',
      'Include enterprise-scale scenarios',
      'Add scalability and performance discussion',
      'Include high availability concepts'
    ],
    validationCriteria: [
      'Multi-technology integration present',
      'Enterprise-scale scenarios included',
      'Scalability discussion added',
      'High availability concepts'
    ]
  },
  J: {
    name: 'Capstones/Research',
    focus: 'Synthesize all skills into evidence-backed troubleshooting and communication',
    commonIssues: [
      'Missing capstone structure',
      'No evidence requirements',
      'Missing stakeholder communication',
      'No debrief format'
    ],
    remediation: [
      'Add capstone project structure',
      'Include evidence collection requirements',
      'Add stakeholder communication tasks',
      'Include structured debrief format'
    ],
    validationCriteria: [
      'Capstone project structure present',
      'Evidence requirements defined',
      'Stakeholder communication tasks included',
      'Structured debrief format'
    ]
  }
};

/**
 * Remediate a single lab for its assigned batch
 */
export function remediateLab(lab, batchId) {
  if (!lab || typeof lab !== 'object') {
    return null;
  }
  
  const strategy = BATCH_REMEDIATION_STRATEGIES[batchId] || BATCH_REMEDIATION_STRATEGIES['J'];
  
  // Enrich lab with all required fields
  const enriched = enrichLabContent(lab);
  
  // Apply batch-specific remediation
  const remediated = applyBatchRemediation(enriched, batchId, strategy);
  
  return remediated;
}

/**
 * Apply batch-specific remediation to a lab
 */
function applyBatchRemediation(lab, batchId, strategy) {
  const category = lab.category || 'General';
  
  // Ensure batch assignment
  lab.batch = batchId;
  lab.batchRemediationFocus = strategy.focus;
  
  // Batch-specific enhancements
  switch (batchId) {
    case 'A': // Network Fundamentals
      lab = remediateFundamentals(lab, category);
      break;
    case 'B': // Switching/VLAN
      lab = remediateSwitching(lab, category);
      break;
    case 'C': // Routing
      lab = remediateRouting(lab, category);
      break;
    case 'D': // Services
      lab = remediateServices(lab, category);
      break;
    case 'E': // Security
      lab = remediateSecurity(lab, category);
      break;
    case 'F': // Wireshark/Analysis
      lab = remediateAnalysis(lab, category);
      break;
    case 'G': // Linux/Network Systems
      lab = remediateLinux(lab, category);
      break;
    case 'H': // SOC
      lab = remediateSOC(lab, category);
      break;
    case 'I': // Advanced Enterprise
      lab = remediateEnterprise(lab, category);
      break;
    case 'J': // Capstones/Research
      lab = remediateCapstone(lab, category);
      break;
  }
  
  return lab;
}

function remediateFundamentals(lab, category) {
  // Ensure solid IP addressing and device identification
  if (!lab.ipPlan || lab.ipPlan.length === 0) {
    lab.ipPlan = enrichLabContent.generateIpPlan(lab);
  }
  
  // Add OSI model references
  if (!lab.concepts.includes('OSI model')) {
    lab.concepts.push('OSI model layers', 'Physical layer concepts', 'Data link layer concepts');
  }
  
  // Ensure device roles are clear
  if (lab.topology?.devices) {
    lab.topology.devices.forEach(device => {
      if (!device.role) {
        device.role = device.type === 'router' ? 'Edge Router' : 
                      device.type === 'switch' ? 'Access Switch' : 
                      device.type === 'pc' ? 'End Device' : 'Network Device';
      }
    });
  }
  
  return lab;
}

function remediateSwitching(lab, category) {
  // Ensure VLAN-specific content
  if (!lab.concepts.includes('VLANs')) {
    lab.concepts.push('VLAN configuration', 'Access ports', 'Trunk ports', '802.1Q tagging');
  }
  
  // Add VLAN verification steps
  if (lab.steps) {
    const hasVlanVerification = lab.steps.some(s => 
      s.commands?.some(c => typeof c === 'string' && c.toLowerCase().includes('show vlan'))
    );
    if (!hasVlanVerification) {
      lab.steps.push({
        stepId: `step-${lab.steps.length + 1}`,
        title: 'Verify VLAN Configuration',
        instruction: 'Verify VLAN configuration using show commands.',
        action: 'Verify VLAN configuration',
        why: 'VLAN verification confirms proper segmentation.',
        expectedResult: 'VLAN database shows correct VLANs and port assignments.',
        verify: 'show vlan displays expected VLANs.',
        targetDevice: lab.topology?.devices?.[0]?.id || 'SW1',
        actionType: 'verification',
        commands: [{ raw: 'show vlan brief', whatItDoes: 'Displays VLAN summary', whyWeNeedIt: 'Verify VLAN creation and port assignment', expectedState: 'VLANs listed with correct ports', verifyCommand: 'show vlan brief', expectedOutput: 'Expected VLANs shown in output', commonMistake: 'Not checking allowed VLANs on trunks' }],
        verification: { type: 'cli', expected: 'show vlan brief' },
        hints: ['Use show vlan brief for summary', 'Check port assignments'],
        progressiveHints: { HINT0: 'Use show vlan brief for summary', HINT1: 'Check port assignments', HINT2: 'Verify VLAN names', HINT3: 'Check for missing VLANs', HINT4: 'Verify trunk allowed VLANs', HINT5: 'Compare with addressing plan' },
        commonMistakes: [{ mistake: 'Not checking trunk allowed VLANs', solution: 'Use show interfaces trunk to verify allowed VLANs.' }],
        order: lab.steps.length + 1
      });
    }
  }
  
  return lab;
}

function remediateRouting(lab, category) {
  // Ensure routing-specific content
  if (!lab.concepts.includes('Routing tables')) {
    lab.concepts.push('Routing table interpretation', 'Route selection', 'Administrative distance');
  }
  
  // Add routing verification
  if (lab.steps) {
    const hasRouteVerification = lab.steps.some(s => 
      s.commands?.some(c => typeof c === 'string' && c.toLowerCase().includes('show ip route'))
    );
    if (!hasRouteVerification) {
      lab.steps.push({
        stepId: `step-${lab.steps.length + 1}`,
        title: 'Verify Routing Table',
        instruction: 'Verify the routing table contains expected routes.',
        action: 'Verify routing table',
        why: 'Routing table verification confirms correct path selection.',
        expectedResult: 'Routing table shows expected routes with correct next-hops.',
        verify: 'show ip route displays all expected routes.',
        targetDevice: lab.topology?.devices?.find(d => d.type === 'router')?.id || 'R1',
        actionType: 'verification',
        commands: [{ raw: 'show ip route', whatItDoes: 'Displays the routing table', whyWeNeedIt: 'Verify routes are learned/configured correctly', expectedState: 'Routing table contains expected routes', verifyCommand: 'show ip route', expectedOutput: 'Expected routes present in table', commonMistake: 'Not checking routing protocol codes' }],
        verification: { type: 'cli', expected: 'show ip route' },
        hints: ['Check for connected, static, and dynamic routes', 'Verify next-hop addresses'],
        progressiveHints: { HINT0: 'Check for connected, static, and dynamic routes', HINT1: 'Verify next-hop addresses', HINT2: 'Check administrative distances', HINT3: 'Verify route metrics', HINT4: 'Check for missing routes', HINT5: 'Use debug for routing issues' },
        commonMistakes: [{ mistake: 'Misinterpreting route codes', solution: 'Learn the meaning of route source codes (C, S, R, O, B, D).' }],
        order: lab.steps.length + 1
      });
    }
  }
  
  return lab;
}

function remediateServices(lab, category) {
  // Ensure service-specific content
  if (!lab.concepts.includes('Network services')) {
    lab.concepts.push('DHCP DORA process', 'DNS resolution', 'Service troubleshooting');
  }
  
  // Add service verification
  if (lab.steps) {
    const hasServiceVerification = lab.steps.some(s => 
      s.commands?.some(c => typeof c === 'string' && ['show dhcp', 'show dns', 'show nat'].some(svc => c.toLowerCase().includes(svc)))
    );
    if (!hasServiceVerification) {
      const serviceCmd = category === 'DHCP' ? 'show ip dhcp binding' :
                         category === 'DNS' ? 'show hosts' :
                         category === 'NAT' ? 'show ip nat translations' :
                         'show running-config';
      lab.steps.push({
        stepId: `step-${lab.steps.length + 1}`,
        title: 'Verify Service Operation',
        instruction: 'Verify the network service is operating correctly.',
        action: 'Verify service operation',
        why: 'Service verification confirms the service is functioning for users.',
        expectedResult: 'Service is operational and serving requests.',
        verify: `Service verification commands show expected state.`,
        targetDevice: lab.topology?.devices?.find(d => ['server', 'router', 'dhcp', 'dns'].includes(d.type))?.id || 'R1',
        actionType: 'verification',
        commands: [{ raw: serviceCmd, whatItDoes: 'Displays service status', whyWeNeedIt: 'Verify service is working correctly', expectedState: 'Service shows active leases/entries', verifyCommand: serviceCmd, expectedOutput: 'Service status displayed', commonMistake: 'Not checking service-specific show commands' }],
        verification: { type: 'cli', expected: serviceCmd },
        hints: ['Use service-specific show commands', 'Check service logs if available'],
        progressiveHints: { HINT0: 'Use service-specific show commands', HINT1: 'Check service logs if available', HINT2: 'Verify client requests', HINT3: 'Check for error messages', HINT4: 'Verify service bindings', HINT5: 'Test from client device' },
        commonMistakes: [{ mistake: 'Not testing from client perspective', solution: 'Always verify service works from the client device.' }],
        order: lab.steps.length + 1
      });
    }
  }
  
  return lab;
}

function remediateSecurity(lab, category) {
  // Ensure security-specific content
  if (!lab.concepts.includes('Security')) {
    lab.concepts.push('Access control', 'Security zones', 'Least privilege');
  }
  
  // Add security verification
  if (lab.steps) {
    const hasSecurityVerification = lab.steps.some(s => 
      s.commands?.some(c => typeof c === 'string' && ['show access-lists', 'show port-security', 'show ip ssh'].some(sec => c.toLowerCase().includes(sec)))
    );
    if (!hasSecurityVerification) {
      lab.steps.push({
        stepId: `step-${lab.steps.length + 1}`,
        title: 'Verify Security Configuration',
        instruction: 'Verify security controls are properly configured.',
        action: 'Verify security configuration',
        why: 'Security verification ensures controls are active and effective.',
        expectedResult: 'Security controls show expected configuration.',
        verify: 'Security show commands display expected state.',
        targetDevice: lab.topology?.devices?.find(d => d.type === 'firewall' || d.type === 'router')?.id || 'R1',
        actionType: 'verification',
        commands: [{ raw: 'show access-lists', whatItDoes: 'Displays configured access lists', whyWeNeedIt: 'Verify ACL rules are in place', expectedState: 'ACLs show expected rules', verifyCommand: 'show access-lists', expectedOutput: 'ACL rules displayed', commonMistake: 'Not verifying ACL direction' }],
        verification: { type: 'cli', expected: 'show access-lists' },
        hints: ['Check ACL direction', 'Verify ACL is applied to correct interface'],
        progressiveHints: { HINT0: 'Check ACL direction', HINT1: 'Verify ACL is applied to correct interface', HINT2: 'Check rule order', HINT3: 'Verify wildcard masks', HINT4: 'Test with actual traffic', HINT5: 'Use debug ip packet' },
        commonMistakes: [{ mistake: 'ACL applied in wrong direction', solution: 'Ensure ACL is applied inbound/outbound as intended.' }],
        order: lab.steps.length + 1
      });
    }
  }
  
  return lab;
}

function remediateAnalysis(lab, category) {
  // Add packet analysis content
  if (!lab.concepts.includes('Packet analysis')) {
    lab.concepts.push('Packet capture', 'Protocol analysis', 'Traffic flow examination');
  }
  
  if (lab.steps) {
    const hasAnalysisStep = lab.steps.some(s => 
      s.title?.toLowerCase().includes('analyze') || s.title?.toLowerCase().includes('capture')
    );
    if (!hasAnalysisStep) {
      lab.steps.push({
        stepId: `step-${lab.steps.length + 1}`,
        title: 'Analyze Network Traffic',
        instruction: 'Capture and analyze network traffic to verify behavior.',
        action: 'Capture and analyze traffic',
        why: 'Packet analysis provides visibility into actual network behavior.',
        expectedResult: 'Captured packets show expected protocol behavior.',
        verify: 'Packet analysis shows correct protocol fields.',
        targetDevice: lab.topology?.devices?.[0]?.id || 'R1',
        actionType: 'verification',
        commands: [{ raw: 'show interfaces', whatItDoes: 'Displays interface statistics including packets', whyWeNeedIt: 'Verify traffic is flowing', expectedState: 'Interface shows packet counters', verifyCommand: 'show interfaces', expectedOutput: 'Packet counters incrementing', commonMistake: 'Not checking for errors in packet counters' }],
        verification: { type: 'cli', expected: 'show interfaces' },
        hints: ['Check packet counters', 'Look for error counters'],
        progressiveHints: { HINT0: 'Check packet counters', HINT1: 'Look for error counters', HINT2: 'Compare input/output rates', HINT3: 'Check for drops', HINT4: 'Verify duplex settings', HINT5: 'Check cable connections' },
        commonMistakes: [{ mistake: 'Ignoring error counters', solution: 'Always check for input errors, CRC errors, and drops.' }],
        order: lab.steps.length + 1
      });
    }
  }
  
  return lab;
}

function remediateLinux(lab, category) {
  // Add Linux/automation content
  if (!lab.concepts.includes('Linux networking')) {
    lab.concepts.push('Linux networking', 'Automation concepts', 'System-level verification');
  }
  
  if (lab.steps) {
    const hasLinuxStep = lab.steps.some(s => 
      s.commands?.some(c => typeof c === 'string' && ['ip ', 'ifconfig', 'systemctl', 'journalctl'].some(linux => c.toLowerCase().startsWith(linux)))
    );
    if (!hasLinuxStep) {
      lab.steps.push({
        stepId: `step-${lab.steps.length + 1}`,
        title: 'Verify from Linux Host',
        instruction: 'Use Linux networking commands to verify configuration.',
        action: 'Verify using Linux commands',
        why: 'Linux hosts provide alternative verification methods.',
        expectedResult: 'Linux commands confirm expected network state.',
        verify: 'Linux networking commands show correct configuration.',
        targetDevice: lab.topology?.devices?.find(d => d.type === 'pc' || d.type === 'server')?.id || 'PC1',
        actionType: 'verification',
        commands: [{ raw: 'ip addr show', whatItDoes: 'Displays IP addresses on Linux', whyWeNeedIt: 'Verify IP configuration on Linux host', expectedState: 'Correct IP address shown', verifyCommand: 'ip addr show', expectedOutput: 'IP address configured correctly', commonMistake: 'Not checking interface state (UP/DOWN)' }],
        verification: { type: 'cli', expected: 'ip addr show' },
        hints: ['Use ip addr show or ifconfig', 'Check interface state'],
        progressiveHints: { HINT0: 'Use ip addr show or ifconfig', HINT1: 'Check interface state', HINT2: 'Verify IP address', HINT3: 'Check routing table', HINT4: 'Test connectivity with ping', HINT5: 'Check DNS resolution' },
        commonMistakes: [{ mistake: 'Forgetting sudo for some commands', solution: 'Some Linux networking commands require sudo privileges.' }],
        order: lab.steps.length + 1
      });
    }
  }
  
  return lab;
}

function remediateSOC(lab, category) {
  // Add SOC/incident response content
  if (!lab.concepts.includes('Incident response')) {
    lab.concepts.push('Incident response', 'Evidence collection', 'Containment and recovery');
  }
  
  if (lab.troubleshooting) {
    if (!lab.troubleshooting.commonErrors) {
      lab.troubleshooting.commonErrors = [];
    }
    lab.troubleshooting.commonErrors.push({
      error: 'Security incident detected',
      symptoms: 'Unusual network traffic or unauthorized access',
      diagnosticCommands: ['show logging', 'show ip traffic', 'show cpu'],
      troubleshootingSteps: ['Isolate affected systems', 'Collect evidence', 'Contain the threat', 'Recover systems'],
      possibleCauses: ['Malware infection', 'Unauthorized access', 'Misconfiguration'],
      fix: 'Follow incident response procedures',
      verificationAfterFix: 'Systems restored to normal operation'
    });
  }
  
  return lab;
}

function remediateEnterprise(lab, category) {
  // Add enterprise-scale content
  if (!lab.concepts.includes('Enterprise design')) {
    lab.concepts.push('Enterprise network design', 'Scalability', 'High availability');
  }
  
  if (lab.topology && lab.topology.whyThisTopology) {
    lab.topology.whyThisTopology += ' This topology is designed to scale to enterprise size with redundant paths and modular design principles.';
  }
  
  return lab;
}

function remediateCapstone(lab, category) {
  // Add capstone structure
  if (!lab.concepts.includes('Synthesis')) {
    lab.concepts.push('Synthesis of all skills', 'Evidence-backed reporting', 'Stakeholder communication');
  }
  
  if (!lab.debrief) {
    lab.debrief = `This capstone lab integrates all skills learned in previous labs. Document your findings, actions taken, and evidence collected. Present your results in a structured format suitable for stakeholder review.`;
  }
  
  if (!lab.challenge) {
    lab.challenge = 'Complete this lab with minimal hints, document all findings, and present a comprehensive report.';
  }
  
  return lab;
}

/**
 * Remediate all labs in a batch
 */
export function remediateBatch(labs, batchId) {
  const strategy = BATCH_REMEDIATION_STRATEGIES[batchId] || BATCH_REMEDIATION_STRATEGIES['J'];
  const categoryFilter = strategy.commonIssues;
  
  return labs.map(lab => {
    const labBatch = assignBatch(lab.category);
    if (labBatch === batchId) {
      return remediateLab(lab, batchId);
    }
    return lab;
  });
}

/**
 * Remediate all 247 labs across all batches
 */
export function remediateAllLabs(labs) {
  const batches = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  let totalRemediated = 0;
  const results = {
    A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, I: 0, J: 0
  };
  
  const remediatedLabs = labs.map(lab => {
    if (!lab || typeof lab !== 'object') {
      return lab;
    }
    
    const batchId = assignBatch(lab.category);
    const remediated = remediateLab(lab, batchId);
    
    if (remediated) {
      totalRemediated++;
      results[batchId]++;
    }
    
    return remediated;
  });
  
  return {
    labs: remediatedLabs,
    totalRemediated,
    batchCounts: results,
    summary: {
      total: labs.length,
      remediated: totalRemediated,
      batches: Object.entries(results).map(([id, count]) => ({
        batch: id,
        name: BATCH_DEFINITIONS[id]?.name || 'Unknown',
        count
      }))
    }
  };
}

/**
 * Validate a lab meets all requirements with comprehensive quality gate
 * Scoring: 0-100 with pass/fail threshold (70)
 * Quality gates:
 * 1. Mission is meaningful
 * 2. Objectives are clear
 * 3. Resources are specific
 * 4. Topology is specific
 * 5. IP plan is specific
 * 6. Steps are meaningful
 * 7. Configuration matches (commands have full format)
 * 8. Verification is real
 * 9. Troubleshooting exists
 * 10. Failure tutorial exists
 * 11. Concept learned exists
 * 12. Interview questions exist
 * 13. Hints are progressive
 * 14. Debrief exists
 * 15. Retrieval is scheduled
 * 16. No fake simulator behavior
 * 17. No duplicate content
 */
export function validateLabCompleteness(lab) {
  const errors = [];
  const warnings = [];
  let score = 100;
  const PASS_THRESHOLD = 70;
  
  if (!lab || typeof lab !== 'object') {
    return { valid: false, errors: ['Invalid lab object'], warnings: [], score: 0, passed: false };
  }
  
  // 1. Mission is meaningful
  if (!lab.mission || lab.mission.trim().length < 20) {
    errors.push('Mission is missing or not meaningful');
    score -= 30;
  }
  
  // 2. Objectives are clear
  if (!lab.objectives || lab.objectives.trim().length < 20) {
    errors.push('Objectives are missing or not clear');
    score -= 8;
  }
  
  // 3. Resources are specific (company scenario)
  if (!lab.companyScenario || lab.companyScenario.trim().length < 20) {
    errors.push('Resources (company scenario) are missing or not specific');
    score -= 8;
  }
  
  // 4. Topology is specific
  const topology = lab.topology || {};
  if (!topology.devices?.length) {
    errors.push('Topology is missing devices');
    score -= 10;
  }
  if (!topology.connections?.length) {
    errors.push('Topology is missing connections');
    score -= 8;
  }
  if (!topology.whyThisTopology || topology.whyThisTopology.trim().length < 20) {
    warnings.push('Topology lacks whyThisTopology explanation');
    score -= 3;
  }
  topology.devices?.forEach((device, index) => {
    if (!device.role) {
      warnings.push(`Device ${device.name || device.id} missing role`);
      score -= 2;
    }
    if (!device.purpose) {
      warnings.push(`Device ${device.name || device.id} missing purpose`);
      score -= 2;
    }
  });
  topology.connections?.forEach((conn, index) => {
    if (!conn.purpose) {
      warnings.push(`Connection ${conn.from}-${conn.to} missing purpose`);
      score -= 1;
    }
  });
  
  // 5. IP plan is specific
  const ipPlan = lab.ipPlan || [];
  if (ipPlan.length === 0) {
    errors.push('IP plan is missing');
    score -= 8;
  } else {
    const incompleteIpEntries = ipPlan.filter(entry => !entry.ipAddress || !entry.subnetMask || !entry.gateway);
    if (incompleteIpEntries.length > 0) {
      warnings.push(`${incompleteIpEntries.length} IP plan entries missing subnet/gateway`);
      score -= 3;
    }
  }
  
  // 6. Steps are meaningful (minimum 20 with action/why/expectedResult/verify)
  const steps = Array.isArray(lab.steps) ? lab.steps : [];
  if (steps.length < 20) {
    errors.push(`Lab has only ${steps.length} steps (minimum 20 required)`);
    score -= 10;
  }
  const stepsMissingFields = steps.filter(s => !s.action || !s.why || !s.expectedResult || !s.verify);
  if (stepsMissingFields.length > 0) {
    errors.push(`${stepsMissingFields.length} steps missing ACTION/WHY/EXPECTED RESULT/VERIFY`);
    score -= 5;
  }
  
  // 7. Configuration matches (commands have full format)
  const commandsMissingFormat = [];
  steps.forEach((step, idx) => {
    if (step.commands && Array.isArray(step.commands)) {
      step.commands.forEach((cmd, cmdIdx) => {
        if (typeof cmd === 'object' && cmd.raw) {
          if (!cmd.whatItDoes || !cmd.whyWeNeedIt || !cmd.expectedState || !cmd.verifyCommand || !cmd.expectedOutput) {
            commandsMissingFormat.push(`Step ${idx}, Command ${cmdIdx}`);
          }
        }
      });
    }
  });
  if (commandsMissingFormat.length > 0) {
    warnings.push(`${commandsMissingFormat.length} commands missing full format (whatItDoes/whyWeNeedIt/expectedState/verifyCommand/expectedOutput)`);
    score -= 3;
  }
  
  // 8. Verification is real
  const stepsWithoutVerification = steps.filter(s => !s.verification || !s.verification.type);
  if (stepsWithoutVerification.length > 0) {
    warnings.push(`${stepsWithoutVerification.length} steps missing verification type`);
    score -= 3;
  }
  
  // 9. Troubleshooting exists
  const troubleshooting = lab.troubleshooting || {};
  if (!troubleshooting.commonErrors?.length && !troubleshooting.decisionTree) {
    warnings.push('Lab missing troubleshooting content');
    score -= 5;
  }
  
  // 10. Failure tutorial exists
  if (!lab.failureTutorial) {
    warnings.push('Lab missing failure tutorial');
    score -= 3;
  }
  
  // 11. Concept learned exists
  if (!lab.conceptLearned || lab.conceptLearned.trim().length < 5) {
    warnings.push('Lab missing conceptLearned');
    score -= 3;
  }
  
  // 12. Interview questions exist
  if (!lab.interviewQuestions?.length) {
    warnings.push('Lab missing interview questions');
    score -= 3;
  }
  
  // 13. Hints are progressive
  const stepsMissingProgressiveHints = steps.filter(s => !s.progressiveHints || !s.progressiveHints.HINT0 || !s.progressiveHints.HINT5);
  if (stepsMissingProgressiveHints.length > 0) {
    warnings.push(`${stepsMissingProgressiveHints.length} steps missing progressive hints HINT0-HINT5`);
    score -= 2;
  }
  
  // 14. Debrief exists
  if (!lab.debrief || lab.debrief.trim().length < 20) {
    warnings.push('Lab missing debrief');
    score -= 3;
  }
  
  // 15. Retrieval is scheduled
  if (!lab.retrievalSchedule) {
    warnings.push('Lab missing retrieval schedule');
    score -= 2;
  }
  
  // 16. No fake simulator behavior
  if (lab.backendProfile?.unsupportedCommands?.length > 0) {
    warnings.push('Lab references unsupported simulator commands');
    score -= 5;
  }
  
  // 17. No duplicate content
  const uniqueSteps = new Set(steps.map(s => s.action + s.verify));
  if (uniqueSteps.size !== steps.length) {
    warnings.push('Lab contains duplicate steps');
    score -= 10;
  }
  
  const finalScore = Math.max(0, Math.min(100, score));
  const passed = finalScore >= PASS_THRESHOLD && errors.length === 0;
  
  return {
    valid: passed,
    errors,
    warnings,
    score: finalScore,
    passed,
    threshold: PASS_THRESHOLD,
    stepCount: steps.length,
    hasStructuredTopology: Boolean(topology.devices?.length && topology.connections?.length),
    hasInitialState: Boolean(lab.initialState?.devices?.length > 0)
  };
}

export const QUALITY_PASS_THRESHOLD = 70;

export default {
  remediateLab,
  remediateBatch,
  remediateAllLabs,
  validateLabCompleteness,
  QUALITY_PASS_THRESHOLD,
  BATCH_REMEDIATION_STRATEGIES,
  BATCH_DEFINITIONS,
  BATCH_PRIORITIES
};
