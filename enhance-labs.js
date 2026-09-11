const fs = require('fs');
const path = require('path');

const labsFile = path.join(__dirname, '..', 'frontend', 'src', 'data', 'labs.procedural.json');
const labs = JSON.parse(fs.readFileSync(labsFile, 'utf8'));

function enhanceLab(lab) {
  const enhanced = {
    id: lab.id,
    title: lab.title,
    category: lab.category,
    level: lab.level,
    time: lab.time,
    objectives: lab.objectives,
    scenario: lab.scenario,
    concepts: lab.concepts || [],
    errors: lab.errors || [],
    questions: lab.questions || [],
    steps: []
  };

  const baseId = String(lab.id).padStart(3, '0');

  enhanced.steps.push({
    stepId: `LAB-${baseId}-S-01`,
    title: 'Review Lab Scenario',
    instruction: `Read the lab scenario and objectives carefully. Identify the devices, networks, and goals before touching any configuration.`,
    commands: [],
    expectedOutput: 'Lab requirements understood.',
    routing: 'No configuration change yet.',
    keypoints: [
      'Clarify what the lab is asking you to build.',
      'Note the devices, interfaces, and IP scheme mentioned.'
    ],
    verification: { type: 'option', expected: 'understood' },
    hintTiers: [
      'Focus on the objective and expected outcome.',
      'List the devices and links described in the scenario.',
      `Objective: ${lab.objectives}`
    ],
    errors: [
      {
        error: 'Misreading the topology',
        symptom: 'Configuring the wrong interfaces or IP scheme.',
        fix: 'Re-read the scenario and redraw the topology before proceeding.'
      }
    ],
    onSuccess: { unlockNext: true, reward: { xp: 5, badge: 'reader' } }
  });

  enhanced.steps.push({
    stepId: `LAB-${baseId}-S-02`,
    title: 'Plan IP Addressing and Routing',
    instruction: 'Write down the required networks, subnet masks, gateway addresses, and routing behavior before configuring devices.',
    commands: [],
    expectedOutput: 'Addressing plan documented.',
    routing: 'Plan which networks are directly connected and which need a routing protocol or static route.',
    keypoints: [
      'Each interface needs an IP and mask.',
      'Routers need routes to reach remote networks.',
      'Switches forward within a VLAN; inter-VLAN traffic needs routing.'
    ],
    verification: { type: 'typing', expected: lab.objectives },
    hintTiers: [
      'Use the lab scenario to list every network that must be reachable.',
      'Check the Concepts section for addressing guidance.',
      lab.objectives
    ],
    errors: [
      {
        error: 'Overlapping IP schemes',
        symptom: 'Devices cannot reach each other across routers.',
        fix: 'Use unique subnets for each link/network segment.'
      },
      {
        error: 'Missing default gateway',
        symptom: 'PC cannot reach beyond its local subnet.',
        fix: 'Assign the correct default gateway on end devices.'
      }
    ],
    onSuccess: { unlockNext: true, reward: { xp: 10, badge: 'planner' } }
  });

  const conceptCmd = (lab.concepts && lab.concepts[0]) || lab.title;
  enhanced.steps.push({
    stepId: `LAB-${baseId}-S-03`,
    title: 'Apply Core Configuration',
    instruction: `Apply the core configuration for this lab. Focus on: ${conceptCmd}`,
    commands: [conceptCmd],
    expectedOutput: 'Configuration accepted without errors.',
    routing: 'Apply interface and protocol settings according to the planned design.',
    keypoints: [
      'Use the exact syntax from the lab concepts.',
      'Verify interface status after each change.'
    ],
    verification: { type: 'typing', expected: conceptCmd },
    hintTiers: [
      'Use one of the listed key concepts in your answer or config.',
      'Check the Concepts section in the lab card.',
      conceptCmd
    ],
    errors: [
      {
        error: 'Syntax error',
        symptom: 'Device rejects the command.',
        fix: 'Check command spelling, spacing, and interface context.'
      },
      {
        error: 'Interface stays down',
        symptom: 'show ip interface brief shows administratively down.',
        fix: 'Ensure no shutdown is applied and the cable/port is active.'
      }
    ],
    onSuccess: { unlockNext: true, reward: { xp: 15, badge: 'builder' } }
  });

  const firstQuestion = (lab.questions && lab.questions[0]) || { question: 'Review output', solution: 'Verify routing and connectivity.' };
  enhanced.steps.push({
    stepId: `LAB-${baseId}-S-04`,
    title: 'Verify Routing and Output',
    instruction: 'Check routing tables, interface status, and end-to-end output such as ping or reachability.',
    commands: ['show ip route', 'show ip interface brief', 'ping'],
    expectedOutput: 'All required networks appear in the routing table and ping succeeds.',
    routing: 'Confirm that routers know all destination networks and that return paths exist.',
    keypoints: [
      'A route exists for every remote network.',
      'Ping success means Layer 3 reachability is working.'
    ],
    verification: { type: 'option', expected: firstQuestion.solution },
    hintTiers: [
      'Use show ip route to verify learned/routes.',
      'Check interface up/down status and IP correctness.',
      firstQuestion.solution
    ],
    errors: [
      {
        error: 'Ping fails',
        symptom: 'Destination unreachable or request timed out.',
        fix: 'Check IP, mask, gateway, routing protocol/static route, and firewall/ACL.'
      },
      {
        error: 'Routing table incomplete',
        symptom: 'Remote network missing from routing table.',
        fix: 'Verify network statements, passive interfaces, adjacency, and route redistribution if used.'
      }
    ],
    onSuccess: { unlockNext: true, reward: { xp: 20, badge: 'verifier' } }
  });

  if (lab.errors && lab.errors.length > 0) {
    const err = lab.errors[0];
    enhanced.steps.push({
      stepId: `LAB-${baseId}-S-05`,
      title: 'Troubleshoot Common Issue',
      instruction: `A common issue in this lab is: ${err.error}. Diagnose and fix it using structured troubleshooting.`,
      commands: ['show interfaces', 'show ip route', 'debug'],
      expectedOutput: 'Issue identified and resolved.',
      routing: 'Use top-down troubleshooting: check physical, data link, network, and application layers.',
      keypoints: [
        'Document symptoms before changing anything.',
        'Isolate the failing device, interface, or path.'
      ],
      verification: { type: 'option', expected: err.solution },
      hintTiers: [
        'Start from the device or link mentioned in the error.',
        'Use relevant show/debug commands to isolate the fault.',
        err.solution
      ],
      errors: [
        {
          error: 'Wrong fix applied',
          symptom: 'Symptom changes but root cause remains.',
          fix: 'Apply the fix only after confirming the root cause from output.'
        }
      ],
      onSuccess: { unlockNext: true, reward: { xp: 25, badge: 'troubleshooter' } }
    });
  }

  lab.steps = enhanced.steps;
  return lab;
}

const enhancedLabs = labs.map(enhanceLab);
fs.writeFileSync(labsFile, JSON.stringify(enhancedLabs, null, 2));
console.log(`Enhanced ${enhancedLabs.length} labs.`);
console.log('Sample lab:', JSON.stringify(enhancedLabs[0], null, 2).substring(0, 1200));
