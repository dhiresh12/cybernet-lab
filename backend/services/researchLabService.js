const { v4: uuidv4 } = require('uuid');
const { researchProjects, researchNotebooks, innovationChallenges, learnerProgress } = require('../state/state');

const EXPERIMENT_TEMPLATES = {
  'compare-tcp-vs-udp': {
    id: 'compare-tcp-vs-udp',
    title: 'Compare TCP vs UDP',
    category: 'transport',
    description: 'Analyze the behavioral differences between TCP and UDP under varying network conditions.',
    steps: [
      { id: 's1', title: 'Set up two endpoints', instructions: 'Configure endpoints with matching IP addressing.' },
      { id: 's2', title: 'Run TCP throughput test', instructions: 'Use iperf3 in TCP mode and record throughput and retransmissions.' },
      { id: 's3', title: 'Run UDP throughput test', instructions: 'Use iperf3 in UDP mode and record jitter and packet loss.' },
      { id: 's4', title: 'Compare results', instructions: 'Document latency, jitter, throughput, and reliability differences.' }
    ],
    expectedOutcomes: ['TCP shows higher reliability with retransmissions', 'UDP shows lower latency but higher jitter']
  },
  'measure-packet-loss': {
    id: 'measure-packet-loss',
    title: 'Measure Packet Loss',
    category: 'diagnostics',
    description: 'Quantify packet loss across different network topologies and link qualities.',
    steps: [
      { id: 's1', title: 'Configure test topology', instructions: 'Build a topology with controllable loss using tc/netem.' },
      { id: 's2', title: 'Run ping test', instructions: 'Ping 1000 packets and capture loss percentage.' },
      { id: 's3', title: 'Run traceroute', instructions: 'Identify the hop where loss is introduced.' },
      { id: 's4', title: 'Analyze patterns', instructions: 'Correlate loss with queue depth, bandwidth, and latency.' }
    ],
    expectedOutcomes: ['Loss concentrates at congested hop', 'TCP recovers from loss via retransmission']
  },
  'compare-routing-paths': {
    id: 'compare-routing-paths',
    title: 'Compare Routing Paths',
    category: 'routing',
    description: 'Compare shortest-path and load-balanced routing behavior.',
    steps: [
      { id: 's1', title: 'Configure OSPF areas', instructions: 'Set up a multi-area OSPF topology.' },
      { id: 's2', title: 'Capture routing table', instructions: 'Record multiple routing tables from different routers.' },
      { id: 's3', title: 'Simulate link failure', instructions: 'Shut down a primary link and observe reconvergence.' },
      { id: 's4', title: 'Compare backup paths', instructions: 'Measure convergence time and path cost changes.' }
    ],
    expectedOutcomes: ['Backup path activated after failure', 'Convergence time within protocol expectations']
  },
  'test-dns-latency': {
    id: 'test-dns-latency',
    title: 'Test DNS Latency',
    category: 'services',
    description: 'Measure DNS resolution latency under various cache states and server loads.',
    steps: [
      { id: 's1', title: 'Configure DNS servers', instructions: 'Set up local and remote DNS resolvers.' },
      { id: 's2', title: 'Measure cold cache', instructions: 'Flush cache and measure first-resolution latency.' },
      { id: 's3', title: 'Measure warm cache', instructions: 'Repeatedly resolve same name and measure average.' },
      { id: 's4', title: 'Compare forwarders', instructions: 'Compare latency across different upstream DNS servers.' }
    ],
    expectedOutcomes: ['Cold cache slower than warm cache', 'Local resolver faster than remote']
  },
  'inspect-arp-behavior': {
    id: 'inspect-arp-behavior',
    title: 'Inspect ARP Behavior',
    category: 'protocols',
    description: 'Observe ARP request/reply dynamics and cache behavior.',
    steps: [
      { id: 's1', title: 'Clear ARP caches', instructions: 'Clear ARP tables on all devices.' },
      { id: 's2', title: 'Trigger ARP resolution', instructions: 'Ping a host from a different subnet and capture ARP traffic.' },
      { id: 's3', title: 'Inspect ARP cache', instructions: 'Run show arp and note resolved MAC addresses.' },
      { id: 's4', title: 'Test ARP timeout', instructions: 'Wait for ARP cache timeout and observe re-resolution.' }
    ],
    expectedOutcomes: ['ARP request broadcast before first communication', 'Cache populated after first resolution']
  },
  'measure-congestion': {
    id: 'measure-congestion',
    title: 'Measure Congestion',
    category: 'performance',
    description: 'Analyze TCP congestion window behavior and queue formation under load.',
    steps: [
      { id: 's1', title: 'Configure bottleneck link', instructions: 'Set a low-bandwidth, high-delay link.' },
      { id: 's2', title: 'Run long-lived TCP flow', instructions: 'Monitor cwnd growth using ss -i or Wireshark.' },
      { id: 's3', title: 'Introduce competing flows', instructions: 'Start multiple TCP flows and observe cwnd sharing.' },
      { id: 's4', title: 'Measure queue depth', instructions: 'Use tc -s qdisc to observe bufferbloat.' }
    ],
    expectedOutcomes: ['cwnd grows until loss event', 'Multiple flows share bandwidth with oscillation']
  },
  'compare-acl-designs': {
    id: 'compare-acl-designs',
    title: 'Compare ACL Designs',
    category: 'security',
    description: 'Evaluate performance and security implications of different ACL ordering strategies.',
    steps: [
      { id: 's1', title: 'Deploy standard ACL', instructions: 'Apply standard ACL close to destination.' },
      { id: 's2', title: 'Deploy extended ACL', instructions: 'Apply extended ACL close to source with specific rules.' },
      { id: 's3', title: 'Measure permit/deny latency', instructions: 'Time rule matching for both designs.' },
      { id: 's4', title: 'Evaluate security posture', instructions: 'Assess exposure and implicit deny behavior.' }
    ],
    expectedOutcomes: ['Extended ACL provides granular control', 'ACL position affects matching efficiency']
  },
  'evaluate-segmentation': {
    id: 'evaluate-segmentation',
    title: 'Evaluate Segmentation',
    category: 'design',
    description: 'Assess the impact of VLAN segmentation on broadcast domains and inter-VLAN routing.',
    steps: [
      { id: 's1', title: 'Create VLANs', instructions: 'Divide network into 3 functional VLANs.' },
      { id: 's2', title: 'Measure broadcast scope', instructions: 'Use broadcast storm test and observe containment.' },
      { id: 's3', title: 'Test inter-VLAN routing', instructions: 'Ping across VLANs and measure latency.' },
      { id: 's4', title: 'Evaluate ACL between VLANs', instructions: 'Apply inter-VLAN ACL and verify filtering.' }
    ],
    expectedOutcomes: ['Broadcast contained within VLAN', 'Inter-VLAN routing via L3 device']
  },
  'investigate-anomaly-patterns': {
    id: 'investigate-anomaly-patterns',
    title: 'Investigate Anomaly Patterns',
    category: 'security',
    description: 'Identify and classify network traffic anomalies using statistical baselines.',
    steps: [
      { id: 's1', title: 'Capture baseline traffic', instructions: 'Record normal traffic for 15 minutes.' },
      { id: 's2', title: 'Inject anomalies', instructions: 'Generate port scan, SYN flood, and data exfil patterns.' },
      { id: 's3', title: 'Analyze flow data', instructions: 'Use NetFlow to identify statistical outliers.' },
      { id: 's4', title: 'Correlate events', instructions: 'Map anomalies to specific sources and targets.' }
    ],
    expectedOutcomes: ['Port scan detected via connection rate', 'SYN flood visible in half-open connection count']
  }
};

function getExperimentTemplates() {
  return Object.values(EXPERIMENT_TEMPLATES).map(t => ({
    id: t.id,
    title: t.title,
    category: t.category,
    description: t.description,
    stepCount: t.steps.length,
    expectedOutcomes: t.expectedOutcomes
  }));
}

function getExperimentTemplate(templateId) {
  return EXPERIMENT_TEMPLATES[String(templateId)] || null;
}

function createResearchProject(learnerId, projectData) {
  const entry = {
    id: uuidv4(),
    learnerId: String(learnerId),
    title: projectData.title || 'Untitled Research Project',
    description: projectData.description || '',
    type: projectData.type || 'project',
    templateId: projectData.templateId || null,
    status: 'draft',
    hypothesis: null,
    observations: [],
    results: null,
    conclusion: null,
    notebook: [],
    visualization: null,
    innovationChallenge: null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  researchProjects.set(entry.id, entry);
  return entry;
}

function getResearchProject(projectId) {
  return researchProjects.get(String(projectId));
}

function listResearchProjects(learnerId) {
  return Array.from(researchProjects.values()).filter(p => p.learnerId === String(learnerId));
}

function setProjectHypothesis(projectId, hypothesisData) {
  const project = researchProjects.get(String(projectId));
  if (!project) {
    return { error: 'Project not found' };
  }
  project.hypothesis = hypothesisData.hypothesis || hypothesisData;
  project.status = 'hypothesis_set';
  project.updatedAt = Date.now();
  return project;
}

function addProjectObservation(projectId, observation) {
  const project = researchProjects.get(String(projectId));
  if (!project) {
    return { error: 'Project not found' };
  }
  const entry = {
    id: uuidv4(),
    data: observation.data || {},
    notes: observation.notes || '',
    templateStepId: observation.templateStepId || null,
    timestamp: Date.now()
  };
  project.observations.push(entry);
  project.updatedAt = Date.now();
  return entry;
}

function addNotebookEntry(projectId, entryData) {
  const project = researchProjects.get(String(projectId));
  if (!project) {
    return { error: 'Project not found' };
  }
  const entry = {
    id: uuidv4(),
    projectId: String(projectId),
    type: entryData.type || 'note',
    content: entryData.content || '',
    tags: entryData.tags || [],
    createdAt: Date.now()
  };
  project.notebook.push(entry);
  project.updatedAt = Date.now();
  return entry;
}

function getNotebook(projectId) {
  const project = researchProjects.get(String(projectId));
  if (!project) {
    return null;
  }
  return {
    projectId: String(projectId),
    title: project.title,
    entries: project.notebook,
    entryCount: project.notebook.length
  };
}

function updateVisualization(projectId, vizData) {
  const project = researchProjects.get(String(projectId));
  if (!project) {
    return { error: 'Project not found' };
  }
  project.visualization = {
    type: vizData.type || 'chart',
    data: vizData.data || {},
    config: vizData.config || {},
    updatedAt: Date.now()
  };
  project.updatedAt = Date.now();
  return project.visualization;
}

function getVisualization(projectId) {
  const project = researchProjects.get(String(projectId));
  if (!project) {
    return null;
  }
  return project.visualization;
}

function createInnovationChallenge(learnerId, challengeData) {
  const entry = {
    id: uuidv4(),
    learnerId: String(learnerId),
    title: challengeData.title || 'Innovation Challenge',
    description: challengeData.description || '',
    constraints: challengeData.constraints || [],
    scoringCriteria: challengeData.scoringCriteria || [],
    submissions: [],
    status: 'open',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  innovationChallenges.set(entry.id, entry);
  return entry;
}

function getInnovationChallenge(challengeId) {
  return innovationChallenges.get(String(challengeId));
}

function listInnovationChallenges(learnerId) {
  return Array.from(innovationChallenges.values()).filter(c => c.learnerId === String(learnerId));
}

function submitInnovationChallenge(challengeId, submission) {
  const challenge = innovationChallenges.get(String(challengeId));
  if (!challenge) {
    return { error: 'Challenge not found' };
  }
  const entry = {
    id: uuidv4(),
    challengeId: String(challengeId),
    learnerId: challenge.learnerId,
    title: submission.title || 'Untitled Submission',
    description: submission.description || '',
    design: submission.design || {},
    evidence: submission.evidence || [],
    submittedAt: Date.now()
  };
  challenge.submissions.push(entry);
  challenge.updatedAt = Date.now();
  return entry;
}

function completeResearchProject(projectId, result) {
  const project = researchProjects.get(String(projectId));
  if (!project) {
    return { error: 'Project not found' };
  }
  project.results = result.results || {};
  project.conclusion = result.conclusion || '';
  project.status = 'completed';
  project.updatedAt = Date.now();

  if (result.skillIds && Array.isArray(result.skillIds)) {
    const progress = learnerProgress.get(project.learnerId);
    if (progress) {
      result.skillIds.forEach(skillId => {
        if (!progress.skillMastery) {
          progress.skillMastery = {};
        }
        progress.skillMastery[skillId] = Math.min(1, (progress.skillMastery[skillId] || 0) + 0.1);
      });
    }
  }

  return project;
}

function getResearchDashboard(learnerId) {
  const projects = listResearchProjects(learnerId);
  const challenges = listInnovationChallenges(learnerId);
  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const inProgressProjects = projects.filter(p => p.status === 'in_progress' || p.status === 'hypothesis_set').length;
  const totalObservations = projects.reduce((sum, p) => sum + p.observations.length, 0);
  const totalNotebookEntries = projects.reduce((sum, p) => sum + p.notebook.length, 0);
  const activeChallenges = challenges.filter(c => c.status === 'open').length;
  const totalSubmissions = challenges.reduce((sum, c) => sum + c.submissions.length, 0);

  return {
    learnerId: String(learnerId),
    totalProjects,
    completedProjects,
    inProgressProjects,
    totalObservations,
    totalNotebookEntries,
    activeChallenges,
    totalSubmissions,
    recentProjects: projects.slice(-5).reverse(),
    recentChallenges: challenges.slice(-5).reverse()
  };
}

module.exports = {
  getExperimentTemplates,
  getExperimentTemplate,
  createResearchProject,
  getResearchProject,
  listResearchProjects,
  setProjectHypothesis,
  addProjectObservation,
  addNotebookEntry,
  getNotebook,
  updateVisualization,
  getVisualization,
  createInnovationChallenge,
  getInnovationChallenge,
  listInnovationChallenges,
  submitInnovationChallenge,
  completeResearchProject,
  getResearchDashboard
};
