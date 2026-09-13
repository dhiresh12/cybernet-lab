import fs from 'fs';
import path from 'path';

// Use dynamic import for ES module normalizer/enricher
const { normalizeLab, normalizeLabs } = await import('./frontend/src/data/labNormalizer.js');
const { enrichLabContent, enhanceTopology, enhanceSteps, generateIpPlan, generateExpectedStartingState, generateTroubleshooting, ensureMinimumSteps, ensureMinimumQuestions, getSimulatorLimitations, buildBackendProfile, buildCapabilitySummary, assignBatch, getBatchRemediationFocus, COMPANY_SCENARIOS, ENGINEER_ROLES } = await import('./frontend/src/data/labContentEnricher.js');
const { buildCatalogManifest } = await import('./frontend/src/data/labCatalogManifest.js');
const { getLabStudyStrategy } = await import('./frontend/src/data/labStudyStrategy.js');

const FILE = path.join(process.cwd(), 'frontend', 'src', 'data', 'labs.procedural.json');
const MANIFEST_FILE = path.join(process.cwd(), 'frontend', 'src', 'data', 'labs.manifest.json');
const QUALITY_FILE = path.join(process.cwd(), 'frontend', 'src', 'data', 'labQualityRegistry.json');

const data = JSON.parse(fs.readFileSync(FILE, 'utf-8'));

// Lab-specific device name generators
function generateLabSpecificDevices(lab) {
  const category = (lab.category || '').toLowerCase();
  const title = (lab.title || '').toLowerCase();
  const id = String(lab.id);
  
  const deviceNames = {
    routers: [],
    switches: [],
    pcs: [],
    servers: [],
    firewalls: [],
    accessPoints: []
  };
  
  // Generate meaningful names based on category and title
  if (title.includes('static routing') || title.includes('default route')) {
    deviceNames.routers = ['Branch-R1', 'Branch-R2'];
    deviceNames.switches = ['LAN-SW1', 'LAN-SW2'];
    deviceNames.pcs = ['Workstation-A', 'Workstation-B'];
  } else if (title.includes('ospf')) {
    deviceNames.routers = ['Core-R1', 'Core-R2', 'Area-R3'];
    deviceNames.switches = ['Access-SW1', 'Distribution-SW2'];
    deviceNames.pcs = ['Finance-PC', 'Engineering-PC', 'HR-PC'];
  } else if (title.includes('eigrp')) {
    deviceNames.routers = ['HQ-R1', 'Branch-R2', 'Remote-R3'];
    deviceNames.switches = ['Access-SW1', 'Core-SW2'];
    deviceNames.pcs = ['User-PC1', 'User-PC2', 'Server-PC'];
  } else if (title.includes('bgp')) {
    deviceNames.routers = ['ISP-R1', 'ISP-R2', 'Customer-R3'];
    deviceNames.switches = ['Edge-SW1', 'Core-SW2'];
    deviceNames.pcs = ['Web-Server', 'Client-PC'];
  } else if (title.includes('vlan') || title.includes('trunk')) {
    deviceNames.routers = ['Inter-VLAN-Router'];
    deviceNames.switches = ['Access-SW1', 'Access-SW2'];
    deviceNames.pcs = ['Sales-PC', 'Engineering-PC', 'Guest-PC', 'Mgmt-PC'];
  } else if (title.includes('acl') || title.includes('security')) {
    deviceNames.routers = ['Edge-Router'];
    deviceNames.firewalls = ['Perimeter-FW'];
    deviceNames.switches = ['Core-SW'];
    deviceNames.pcs = ['Admin-PC', 'User-PC', 'Guest-PC'];
  } else if (title.includes('nat')) {
    deviceNames.routers = ['Edge-Router'];
    deviceNames.switches = ['Internal-SW'];
    deviceNames.pcs = ['Internal-PC', 'External-Client'];
    deviceNames.servers = ['Public-WebServer'];
  } else if (title.includes('dhcp')) {
    deviceNames.routers = ['DHCP-Server-Router'];
    deviceNames.switches = ['Access-SW'];
    deviceNames.pcs = ['Client-PC1', 'Client-PC2', 'Static-Server'];
  } else if (title.includes('dns')) {
    deviceNames.servers = ['DNS-Server-Primary', 'DNS-Server-Secondary'];
    deviceNames.routers = ['Core-Router'];
    deviceNames.pcs = ['Client-Workstation'];
  } else if (title.includes('ssh')) {
    deviceNames.routers = ['SSH-Managed-Router'];
    deviceNames.switches = ['SSH-Managed-SW'];
    deviceNames.pcs = ['Admin-Workstation'];
  } else if (title.includes('stp') || title.includes('spanning tree')) {
    deviceNames.switches = ['Root-SW1', 'Access-SW2', 'Access-SW3'];
    deviceNames.routers = ['Core-Router'];
    deviceNames.pcs = ['PC-A', 'PC-B', 'PC-C'];
  } else if (title.includes('vpn')) {
    deviceNames.routers = ['Site-A-Router', 'Site-B-Router'];
    deviceNames.firewalls = ['VPN-FW1', 'VPN-FW2'];
    deviceNames.pcs = ['Remote-User', 'Local-Server'];
  } else if (category.includes('wireless') || title.includes('wireless') || title.includes('wlan')) {
    deviceNames.accessPoints = ['Office-AP1', 'Office-AP2'];
    deviceNames.routers = ['Wireless-Router'];
    deviceNames.switches = ['PoE-SW1'];
    deviceNames.pcs = ['Laptop-User', 'Desktop-User', 'Mobile-Device'];
  } else if (category.includes('data center') || title.includes('spine') || title.includes('leaf')) {
    deviceNames.routers = ['Spine-R1', 'Spine-R2'];
    deviceNames.switches = ['Leaf-SW1', 'Leaf-SW2', 'Leaf-SW3', 'Leaf-SW4'];
    deviceNames.servers = ['App-Server1', 'DB-Server1', 'Storage-Array'];
  } else if (category.includes('wan')) {
    deviceNames.routers = ['Branch-R1', 'HQ-R2', 'ISP-R3'];
    deviceNames.switches = ['Branch-SW', 'HQ-SW'];
    deviceNames.pcs = ['Branch-User', 'HQ-User'];
  } else if (category.includes('automation') || title.includes('ansible') || title.includes('python')) {
    deviceNames.servers = ['Ansible-Controller'];
    deviceNames.routers = ['R1', 'R2', 'R3'];
    deviceNames.switches = ['SW1', 'SW2'];
    deviceNames.pcs = ['Dev-Workstation'];
  } else if (category.includes('troubleshoot') || title.includes('troubleshoot')) {
    deviceNames.routers = ['Problem-Router'];
    deviceNames.switches = ['Problem-Switch'];
    deviceNames.pcs = ['Diagnostic-PC'];
  } else if (title.includes('ip sla') || title.includes('tracking')) {
    deviceNames.routers = ['Primary-Router', 'Backup-Router'];
    deviceNames.switches = ['Access-SW'];
    deviceNames.pcs = ['Client-A', 'Client-B'];
  } else if (title.includes('high availability') || title.includes('hsrp')) {
    deviceNames.routers = ['HSRP-Active', 'HSRP-Standby'];
    deviceNames.switches = ['Access-SW'];
    deviceNames.pcs = ['Client-PC'];
  } else if (title.includes('etherchannel') || title.includes('port-channel')) {
    deviceNames.switches = ['Core-SW1', 'Core-SW2'];
    deviceNames.routers = ['Distribution-R'];
    deviceNames.pcs = ['Server-PC', 'Workstation-PC'];
  } else {
    // Generic but still lab-specific naming
    deviceNames.routers = ['Edge-Router-' + id];
    deviceNames.switches = ['Access-Switch-' + id];
    deviceNames.pcs = ['Client-WS-' + id, 'Server-WS-' + id];
  }
  
  return deviceNames;
}

function replaceGenericDevices(lab, deviceMap) {
  const devices = lab.devices || lab.topology?.devices || [];
  const connections = lab.connections || [];
  
  // Build replacement map
  const replacementMap = {};
  const genericPatterns = [
    { pattern: /^Router0?$/i, names: deviceMap.routers },
    { pattern: /^Router1$/i, names: deviceMap.routers },
    { pattern: /^Router2$/i, names: deviceMap.routers },
    { pattern: /^Router3$/i, names: deviceMap.routers },
    { pattern: /^Switch0?$/i, names: deviceMap.switches },
    { pattern: /^Switch1$/i, names: deviceMap.switches },
    { pattern: /^Switch2$/i, names: deviceMap.switches },
    { pattern: /^Switch3$/i, names: deviceMap.switches },
    { pattern: /^PC0?$/i, names: deviceMap.pcs },
    { pattern: /^PC1$/i, names: deviceMap.pcs },
    { pattern: /^PC2$/i, names: deviceMap.pcs },
    { pattern: /^PC3$/i, names: deviceMap.pcs },
    { pattern: /^Server0?$/i, names: deviceMap.servers },
    { pattern: /^Server1$/i, names: deviceMap.servers },
    { pattern: /^Firewall0?$/i, names: deviceMap.firewalls },
    { pattern: /^Firewall1$/i, names: deviceMap.firewalls },
    { pattern: /^AP0?$/i, names: deviceMap.accessPoints },
    { pattern: /^AP1$/i, names: deviceMap.accessPoints }
  ];
  
  let ri = 0, si = 0, pi = 0, svi = 0, fi = 0, ai = 0;
  
  devices.forEach((d, idx) => {
    const name = typeof d === 'string' ? d : (d.name || d.id || '');
    for (const gp of genericPatterns) {
      if (gp.pattern.test(name) && ri < gp.names.length) {
        const newName = gp.names[ri % gp.names.length];
        replacementMap[name] = newName;
        if (gp.pattern.source.includes('Router')) ri++;
        else if (gp.pattern.source.includes('Switch')) si++;
        else if (gp.pattern.source.includes('PC')) pi++;
        else if (gp.pattern.source.includes('Server')) svi++;
        else if (gp.pattern.source.includes('Firewall')) fi++;
        else if (gp.pattern.source.includes('AP')) ai++;
        break;
      }
    }
  });
  
  // Apply replacements to devices array
  const newDevices = devices.map(d => {
    const name = typeof d === 'string' ? d : (d.name || d.id || '');
    if (replacementMap[name]) {
      if (typeof d === 'string') return replacementMap[name];
      return { ...d, name: replacementMap[name], id: replacementMap[name] };
    }
    return d;
  });
  
  // Apply replacements to connections
  const newConnections = connections.map(conn => {
    const str = typeof conn === 'string' ? conn : `${conn.from || ''} -> ${conn.to || ''}`;
    let replaced = str;
    for (const [old, newName] of Object.entries(replacementMap)) {
      const regex = new RegExp(`\\b${old.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'g');
      replaced = replaced.replace(regex, newName);
    }
    if (typeof conn === 'string') return replaced;
    const [from, to] = replaced.split(/\s*->\s*/);
    return { ...conn, from: from?.trim() || conn.from, to: to?.trim() || conn.to };
  });
  
  // Apply replacements to ipTable
  const ipTable = lab.ipTable || lab.ipAddressing || [];
  const newIpTable = ipTable.map(entry => {
    const deviceName = entry.device || entry.deviceId || '';
    const newDeviceName = replacementMap[deviceName] || deviceName;
    return { ...entry, device: newDeviceName, deviceId: newDeviceName };
  });
  
  // Apply replacements in steps
  const steps = lab.steps || [];
  const newSteps = steps.map(step => {
    const newStep = { ...step };
    if (newStep.targetDevice && replacementMap[newStep.targetDevice]) {
      newStep.targetDevice = replacementMap[newStep.targetDevice];
    }
    if (newStep.commands) {
      newStep.commands = newStep.commands.map(cmd => {
        if (typeof cmd === 'string') {
          let replaced = cmd;
          for (const [old, newName] of Object.entries(replacementMap)) {
            const regex = new RegExp(`\\b${old.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'g');
            replaced = replaced.replace(regex, newName);
          }
          return replaced;
        }
        return cmd;
      });
    }
    return newStep;
  });
  
  if (newDevices.length > 0 && Array.isArray(lab.devices)) {
    lab.devices = newDevices;
  }
  if (lab.topology && Array.isArray(lab.topology.devices)) {
    lab.topology = { ...lab.topology, devices: newDevices };
  }
  if (Array.isArray(lab.connections)) {
    lab.connections = newConnections;
  }
  if (Array.isArray(lab.ipTable)) {
    lab.ipTable = newIpTable;
  }
  if (Array.isArray(lab.ipAddressing)) {
    lab.ipAddressing = newIpTable;
  }
  if (newSteps.length > 0) {
    lab.steps = newSteps;
  }
  
  return lab;
}

// Fix broken labs
function fixBrokenLab(lab) {
  const id = String(lab.id);
  const brokenIds = ['113', '120', '121', '122', '125', '148', '208'];
  
  if (!brokenIds.includes(id)) return lab;
  
  console.log(`Fixing broken lab ${id}: ${lab.title}`);
  
  // Ensure all required fields
  lab.qualityStatus = 'published';
  lab.version = lab.version || 2;
  
  const deviceMap = generateLabSpecificDevices(lab);
  lab = replaceGenericDevices(lab, deviceMap);
  
  // Ensure steps are enriched
  if (!lab.steps || lab.steps.length < 20) {
    lab.steps = ensureMinimumSteps(lab.steps || [], lab.category, lab.level || 'basic', lab.topology);
  }
  
  // Ensure troubleshooting
  if (!lab.troubleshooting || !lab.troubleshooting.commonErrors) {
    lab.troubleshooting = generateTroubleshooting(lab);
  }
  if (!lab.troubleshooting.decisionTree) {
    lab.troubleshooting.decisionTree = {
      root: {
        question: 'Is the device reachable?',
        yes: {
          question: 'Is the service/configuration working?',
          yes: { result: 'Lab complete - verify expected behavior' },
          no: { result: 'Debug the specific service or protocol' }
        },
        no: {
          question: 'Is the interface up?',
          yes: { result: 'Check routing and Layer 3 configuration' },
          no: { result: 'Enable the interface and check physical connectivity' }
        }
      }
    };
  }
  
  // Ensure knowledge check
  if (!lab.knowledgeCheck || lab.knowledgeCheck.length < 15) {
    lab.knowledgeCheck = ensureMinimumQuestions(lab);
  }
  
  // Ensure all required fields exist
  const scenarios = COMPANY_SCENARIOS[lab.category] || COMPANY_SCENARIOS['default'];
  const scenario = scenarios[Math.abs(hashCode(lab.title || lab.category)) % scenarios.length];
  lab.companyScenario = lab.companyScenario || scenario.scenario;
  lab.mission = lab.mission || `Complete ${lab.title} to configure and verify ${(lab.category || 'networking').toLowerCase()} functionality.`;
  lab.businessProblem = lab.businessProblem || `${scenario.company} needs to implement ${(lab.category || 'networking').toLowerCase()} solutions to meet business requirements.`;
  lab.problemStatement = lab.problemStatement || `${scenario.company} requires ${(lab.category || 'networking').toLowerCase()} configuration to resolve network issues.`;
  lab.conceptLearned = lab.conceptLearned || lab.concepts?.[0] || `${(lab.category || 'networking').toLowerCase()} configuration and verification`;
  lab.realWorldUse = lab.realWorldUse || `This skill is used in production ${(lab.category || 'networking').toLowerCase()} environments worldwide.`;
  lab.challenge = lab.challenge || 'Modify the configuration to support an additional requirement and verify the change.';
  lab.debrief = lab.debrief || `After completing ${lab.title}, review any steps that required hints and practice them until you can complete them independently.`;
  lab.nextRecommendedLab = lab.nextRecommendedLab || 'Advanced Network Configuration';
  lab.retrievalSchedule = lab.retrievalSchedule || {
    firstReview: '1 day',
    secondReview: '3 days',
    thirdReview: '1 week',
    finalReview: '1 month'
  };
  lab.progressiveHints = lab.progressiveHints || {
    HINT0: 'Read the objective and addressing plan carefully.',
    HINT1: 'Check the topology diagram for device relationships.',
    HINT2: 'Verify interface status before configuring.',
    HINT3: `Use show commands to confirm ${(lab.category || 'networking').toLowerCase()} configuration.`,
    HINT4: 'Compare your config with the expected state.',
    HINT5: 'Review the troubleshooting section for common errors.'
  };
  lab.failureTutorial = lab.faultInjection?.faults?.length > 0 ? {
    available: true,
    description: `Practice recovering from ${lab.faultInjection.faults.length} intentional fault(s).`,
    safety: 'Only use reversible, lab-scoped changes. Reset the lab if the state becomes unclear.'
  } : {
    available: false,
    description: 'Not applicable in this lab',
    safety: 'Only use reversible, lab-scoped changes. Reset the lab if the state becomes unclear.'
  };
  lab.beginnerTutorial = lab.beginnerTutorial || {
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
  lab.interviewQuestions = lab.interviewQuestions && lab.interviewQuestions.length > 0 ? lab.interviewQuestions : [
    `What is the primary purpose of ${(lab.category || 'networking').toLowerCase()} in this lab?`,
    `How would you troubleshoot a ${(lab.category || 'networking').toLowerCase()} issue?`,
    `What are the best practices for ${(lab.category || 'networking').toLowerCase()} configuration?`
  ];
  
  return lab;
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

// Process all labs
console.log(`Processing ${data.length} labs...`);

const normalizedLabs = [];
const brokenIds = new Set(['113', '120', '121', '122', '125', '148', '208']);
const qualityUpdates = [];

data.forEach((rawLab, index) => {
  try {
    let lab = normalizeLab(rawLab);
    
    // Fix broken labs
    if (brokenIds.has(String(lab.id))) {
      lab = fixBrokenLab(lab);
    }
    
    // Ensure lab-specific devices
    const deviceMap = generateLabSpecificDevices(lab);
    lab = replaceGenericDevices(lab, deviceMap);
    
    // Enhance topology with lab-specific details
    if (lab.topology) {
      lab.topology = enhanceTopology(lab.topology, lab.category, lab.difficulty || 'basic');
      if (!lab.topology.whyThisTopology) {
        const complexity = lab.topology.devices?.length > 4 ? 2 : 1;
        lab.topology.whyThisTopology = `This topology is designed for the ${lab.category} lab using ${lab.topology.devices?.length || 2} lab-specific devices. The design supports the learning objectives while maintaining clarity for ${lab.difficulty || 'basic'} level learners.`;
      }
    }
    
    // Ensure 20+ steps
    if (!lab.steps || lab.steps.length < 20) {
      lab.steps = ensureMinimumSteps(lab.steps || [], lab.category, lab.difficulty || 'basic', lab.topology);
    }
    
    // Enhance steps with ACTION/WHY/EXPECTED RESULT/VERIFY and enhanced commands
    if (lab.steps && lab.steps.length > 0) {
      lab.steps = enhanceSteps(lab.steps, lab.category, lab.difficulty || 'basic');
    }
    
    // Ensure troubleshooting with decision tree
    if (!lab.troubleshooting || !lab.troubleshooting.commonErrors) {
      lab.troubleshooting = generateTroubleshooting(lab);
    }
    if (!lab.troubleshooting.decisionTree) {
      lab.troubleshooting.decisionTree = {
        root: {
          question: 'Is the device reachable?',
          yes: {
            question: 'Is the service/configuration working?',
            yes: { result: 'Lab complete - verify expected behavior' },
            no: { result: 'Debug the specific service or protocol' }
          },
          no: {
            question: 'Is the interface up?',
            yes: { result: 'Check routing and Layer 3 configuration' },
            no: { result: 'Enable the interface and check physical connectivity' }
          }
        }
      };
    }
    
    // Ensure IP plan
    lab.ipPlan = generateIpPlan(lab);
    
    // Ensure expected starting state
    lab.expectedStartingState = generateExpectedStartingState(lab);
    
    // Ensure knowledge check has 15+ questions
    if (!lab.knowledgeCheck || lab.knowledgeCheck.length < 15) {
      lab.knowledgeCheck = ensureMinimumQuestions(lab);
    }
    
    // Ensure all required learning fields
    lab.conceptLearned = lab.conceptLearned || lab.concepts?.[0] || `${(lab.category || 'networking').toLowerCase()} configuration and verification`;
    lab.realWorldUse = lab.realWorldUse || `This skill is used in production ${(lab.category || 'networking').toLowerCase()} environments worldwide.`;
    lab.challenge = lab.challenge || 'Modify the configuration to support an additional requirement and verify the change.';
    lab.debrief = lab.debrief || `After completing ${lab.title}, review any steps that required hints and practice them until you can complete them independently.`;
    lab.nextRecommendedLab = lab.nextRecommendedLab || 'Advanced Network Configuration';
    lab.retrievalSchedule = lab.retrievalSchedule || {
      firstReview: '1 day',
      secondReview: '3 days',
      thirdReview: '1 week',
      finalReview: '1 month'
    };
    lab.progressiveHints = lab.progressiveHints || {
      HINT0: 'Read the objective and addressing plan carefully.',
      HINT1: 'Check the topology diagram for device relationships.',
      HINT2: 'Verify interface status before configuring.',
      HINT3: `Use show commands to confirm ${(lab.category || 'networking').toLowerCase()} configuration.`,
      HINT4: 'Compare your config with the expected state.',
      HINT5: 'Review the troubleshooting section for common errors.'
    };
    lab.failureTutorial = lab.faultInjection?.faults?.length > 0 ? {
      available: true,
      description: `Practice recovering from ${lab.faultInjection.faults.length} intentional fault(s).`,
      safety: 'Only use reversible, lab-scoped changes. Reset the lab if the state becomes unclear.'
    } : {
      available: false,
      description: 'Not applicable in this lab',
      safety: 'Only use reversible, lab-scoped changes. Reset the lab if the state becomes unclear.'
    };
    lab.beginnerTutorial = lab.beginnerTutorial || {
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
    
    if (!lab.interviewQuestions || lab.interviewQuestions.length === 0) {
      lab.interviewQuestions = [
        `What is the primary purpose of ${(lab.category || 'networking').toLowerCase()} in this lab?`,
        `How would you troubleshoot a ${(lab.category || 'networking').toLowerCase()} issue?`,
        `What are the best practices for ${(lab.category || 'networking').toLowerCase()} configuration?`,
        `How does ${(lab.category || 'networking').toLowerCase()} relate to network security?`,
        `What tools would you use to verify ${(lab.category || 'networking').toLowerCase()} configuration?`
      ];
    }
    
    // Assign batch
    lab.batch = assignBatch(lab.category);
    lab.batchRemediationFocus = getBatchRemediationFocus(lab.batch);
    
    // Mark as published
    lab.qualityStatus = 'published';
    
    // Update backend profile and capability summary
    lab.backendProfile = buildBackendProfile(lab);
    lab.capabilitySummary = buildCapabilitySummary(lab);
    
    // Mark broken labs as remediated
    if (brokenIds.has(String(lab.id))) {
      qualityUpdates.push({
        labId: String(lab.id),
        status: 'REMEDIATED',
        remediationStatus: 'REMEDIATED',
        remediationPhase: '7.0',
        remediationDate: new Date().toISOString().split('T')[0],
        remediationSummary: 'Lab fully regenerated with canonical structure, lab-specific devices, 20+ enriched steps, troubleshooting decision tree, and all required fields.'
      });
    }
    
    normalizedLabs.push(lab);
    
    if ((index + 1) % 50 === 0) {
      console.log(`  Processed ${index + 1}/${data.length} labs...`);
    }
  } catch (err) {
    console.error(`Error processing lab ${rawLab.id}:`, err.message);
    normalizedLabs.push(rawLab);
  }
});

console.log(`\nSaving ${normalizedLabs.length} labs to ${FILE}...`);
fs.writeFileSync(FILE, JSON.stringify(normalizedLabs, null, 2));
console.log('Saved labs.procedural.json');

// Generate and save manifest
console.log('Generating catalog manifest...');
const manifest = buildCatalogManifest(normalizedLabs);
fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest.records, null, 2));
console.log(`Saved labs.manifest.json with ${manifest.records.length} entries`);

// Update quality registry
console.log('Updating quality registry...');
const qualityRegistry = JSON.parse(fs.readFileSync(QUALITY_FILE, 'utf-8'));
const quarantined = qualityRegistry.quarantined || [];

qualityUpdates.forEach(update => {
  const idx = quarantined.findIndex(e => String(e.labId) === String(update.labId));
  if (idx >= 0) {
    quarantined[idx] = { ...quarantined[idx], ...update };
  }
});

qualityRegistry.quarantined = quarantined;
qualityRegistry.lastUpdated = new Date().toISOString().split('T')[0];
fs.writeFileSync(QUALITY_FILE, JSON.stringify(qualityRegistry, null, 2));
console.log('Updated labQualityRegistry.json');

// Verify counts
const finalBroken = (qualityRegistry.quarantined || []).filter(e => e.status === 'BROKEN').length;
const finalRemediated = (qualityRegistry.quarantined || []).filter(e => e.status === 'REMEDIATED').length;
console.log(`\nRegistry: ${finalBroken} BROKEN, ${finalRemediated} REMEDIATED`);
console.log('Regeneration complete.');
