/**
 * Blueprint curriculum contract.
 *
 * Stages are skill gates, not a list of decorative topics. A stage becomes
 * available from real catalog coverage and learner evidence; it is never
 * marked mastered from a fabricated percentage.
 */
export const PRACTICAL_LEARNING_CYCLE = [
  { id: 'observe', label: 'Observe', prompt: 'Read the topology, ticket, and baseline before changing anything.' },
  { id: 'predict', label: 'Predict', prompt: 'Write what you expect to happen and which evidence will prove it.' },
  { id: 'perform', label: 'Perform', prompt: 'Make the smallest supported configuration change in the lab.' },
  { id: 'verify', label: 'Verify', prompt: 'Use an independent show, state, or connectivity check.' },
  { id: 'explain', label: 'Explain', prompt: 'Explain the cause, result, and limitation in simple technical language.' },
  { id: 'transfer', label: 'Transfer', prompt: 'Apply the skill to a new topology or a seeded fault.' }
];

export const PRACTICAL_CURRICULUM = [
  {
    id: 'foundations',
    level: 0,
    title: 'Digital and CLI Foundations',
    shortTitle: 'Foundations',
    description: 'Build the vocabulary and safe working habits needed before configuration.',
    skills: ['device and interface identification', 'CLI modes', 'lab safety', 'evidence capture'],
    categories: ['Basics', 'Foundations', 'CLI'],
    color: '#00f0ff',
    gate: 'Explain one command and identify its target device before running it.',
    transfer: 'Identify an unfamiliar interface and predict which command can verify it.',
    remediation: 'Replay the guided command tutorial with hints enabled.'
  },
  {
    id: 'networking-foundations',
    level: 1,
    title: 'Networking Foundations',
    shortTitle: 'Connectivity',
    description: 'Build a two-host network and prove same-subnet communication with evidence.',
    skills: ['Ethernet and switching', 'IPv4 and masks', 'ARP and ICMP', 'topology reading'],
    categories: ['ICMP', 'IPv4', 'Ethernet', 'Basics', 'Connectivity'],
    color: '#00ff88',
    gate: 'Configure addressing, verify interface state, and explain why ping passes or fails.',
    transfer: 'Repair the same skill on a different host pair without copying the solution.',
    remediation: 'Return to addressing and interface-status labs before routing.'
  },
  {
    id: 'switching',
    level: 2,
    title: 'Switching and Segmentation',
    shortTitle: 'Switching',
    description: 'Separate departments safely using VLANs, access ports, trunks, and verification.',
    skills: ['VLANs', 'access and trunk ports', 'MAC learning', 'port security'],
    categories: ['VLAN', 'Switching', 'Trunking', 'Port Security'],
    color: '#ffbf00',
    gate: 'Prove intended reachability and isolation; do not rely on a green status alone.',
    transfer: 'Diagnose a VLAN mismatch from evidence rather than rebuilding the topology.',
    remediation: 'Practice show vlan and interface checks on the smallest available lab.'
  },
  {
    id: 'routing',
    level: 3,
    title: 'Routing and Failure Recovery',
    shortTitle: 'Routing',
    description: 'Interpret routes, configure supported paths, and recover from a controlled fault.',
    skills: ['connected and static routes', 'default gateway', 'routing tables', 'failure isolation'],
    categories: ['Routing', 'Static Routing', 'OSPF', 'EIGRP'],
    color: '#ff3355',
    gate: 'Provide before/after evidence and a safe rollback for a route change.',
    transfer: 'Find the smallest failing hop in a new multi-network topology.',
    remediation: 'Repeat an addressing lab, then inspect routes before changing them.'
  },
  {
    id: 'services',
    level: 4,
    title: 'Network Services',
    shortTitle: 'Services',
    description: 'Connect configuration to user-facing services and troubleshoot reachability.',
    skills: ['DHCP DORA', 'DNS resolution', 'NAT/PAT', 'SSH and logs'],
    categories: ['DHCP', 'DNS', 'NAT', 'Services', 'SSH'],
    color: '#00ffcc',
    gate: 'Show the service symptom, isolate the cause, and verify recovery independently.',
    transfer: 'Differentiate a client, gateway, and service failure from the same symptom.',
    remediation: 'Use a guided service lab with one fault enabled.'
  },
  {
    id: 'security',
    level: 5,
    title: 'Security Foundations',
    shortTitle: 'Security',
    description: 'Apply authorization, least privilege, segmentation, and defensive evidence.',
    skills: ['secure management', 'ACL first-match logic', 'port security', 'incident evidence'],
    categories: ['Security', 'ACL', 'Network Security'],
    color: '#ffcc00',
    gate: 'Confirm scope, make a least-privilege change, verify it, and record rollback.',
    transfer: 'Contain a synthetic fault without touching an out-of-scope device.',
    remediation: 'Review the rules of engagement and ACL evaluation order.'
  },
  {
    id: 'advanced-engineering',
    level: 6,
    title: 'Advanced Engineering',
    shortTitle: 'Advanced',
    description: 'Use automation, IPv6, packet evidence, backups, and controlled change practice.',
    skills: ['multi-site design', 'IPv6', 'automation concepts', 'config diff and rollback'],
    categories: ['Enterprise', 'IPv6', 'Automation', 'Data Center', 'Design'],
    color: '#aa00ff',
    gate: 'Compare intended and observed state and explain unsupported capabilities honestly.',
    transfer: 'Adapt a design to a changed requirement without hiding trade-offs.',
    remediation: 'Complete the routing and services gates first.'
  },
  {
    id: 'capstone',
    level: 7,
    title: 'Professional Capstone',
    shortTitle: 'Capstone',
    description: 'Resolve an ambiguous ticket with evidence, safe change, and a stakeholder report.',
    skills: ['hypothesis-driven troubleshooting', 'root cause', 'prevention', 'communication'],
    categories: ['Troubleshooting', 'Capstone', 'Incident Response'],
    color: '#ffaa00',
    gate: 'Pass a transfer challenge and submit a complete evidence-backed debrief.',
    transfer: 'Solve a hidden seeded fault with multiple plausible causes.',
    remediation: 'Use the weakest previous skill as the next recommended practice.'
  }
];

export function getStageLabs(stage, labs) {
  const categorySet = new Set(stage.categories.map(category => category.toLowerCase()));
  return (Array.isArray(labs) ? labs : []).filter(lab => {
    const category = String(lab.category || '').toLowerCase();
    return categorySet.has(category) || (lab.tags || []).some(tag => categorySet.has(String(tag).toLowerCase()));
  });
}

export function getTransferLab(stage, labs, completedSteps = []) {
  const stageLabs = getStageLabs(stage, labs).filter(lab => Array.isArray(lab.steps) && lab.steps.length > 0);
  if (stageLabs.length === 0) return null;

  const completionRatio = (lab) => {
    const completed = lab.steps.filter(step => completedSteps.includes(step.stepId)).length;
    return completed / lab.steps.length;
  };

  return [...stageLabs].sort((a, b) => {
    const ratioDifference = completionRatio(a) - completionRatio(b);
    if (ratioDifference !== 0) return ratioDifference;
    return String(a.id).localeCompare(String(b.id));
  })[0];
}

export function getStageStatus(stage, labs, completedSteps = [], evidenceRecords = [], transferAttempts = []) {
  const stageLabs = getStageLabs(stage, labs);
  // Preserve the original catalog-only behavior for callers that have not
  // loaded learner evidence yet.
  if (arguments.length < 4) {
    const completedLabs = stageLabs.filter(lab =>
      Array.isArray(lab.steps) &&
      lab.steps.length > 0 &&
      lab.steps.every(step => completedSteps.includes(step.stepId))
    );
    const inProgress = stageLabs.some(lab =>
      (lab.steps || []).some(step => completedSteps.includes(step.stepId)) &&
      !(lab.steps || []).every(step => completedSteps.includes(step.stepId))
    );
    if (completedLabs.length > 0 && completedLabs.length === stageLabs.length) return 'mastered';
    if (completedLabs.length > 0 || inProgress) return 'practiced';
    return stageLabs.length > 0 ? 'available' : 'unavailable';
  }

  const completedLabIds = new Set(stageLabs
    .filter(lab => lab.steps?.length && lab.steps.every(step => completedSteps.includes(step.stepId)))
    .map(lab => String(lab.id)));
  const hasActivity = stageLabs.some(lab => (lab.steps || []).some(step => completedSteps.includes(step.stepId)));
  const stageEvidence = evidenceRecords.filter(record => stageLabs.some(lab => String(lab.id) === String(record.labId)));
  const hasVerification = stageEvidence.some(record => record.passed && record.verificationType);
  const hasReflection = stageEvidence.some(record =>
    record.prediction?.trim() && record.evidence?.trim() && record.explanation?.trim()
  );
  const hasTransfer = transferAttempts.some(attempt =>
    attempt.stageId === stage.id && attempt.passed === true
  );

  if (!stageLabs.length) return 'unavailable';
  if (!hasActivity) return 'not_started';
  if (!completedLabIds.size) return 'introduced';
  if (!hasVerification) return 'practiced';
  if (!hasTransfer) return 'verified';
  if (!hasReflection) return 'transferred';
  return 'mastered';
}
