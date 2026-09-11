const fs = require('fs');
const path = require('path');

const labsFile = path.join(__dirname, '..', 'frontend', 'src', 'data', 'labs.procedural.json');
const labs = JSON.parse(fs.readFileSync(labsFile, 'utf8'));

const advancedLabs = [
  {
    title: 'Advanced OSPF: Multi-Area with ABR and Route Summarization',
    category: 'Routing',
    level: 'advanced',
    time: '50 minutes',
    objectives: 'Configure multi-area OSPF with an ABR and summarize routes at area boundaries.',
    scenario: 'A company has Area 0, Area 1, and Area 2. Configure ABR between Area 0 and Area 1, and summarize Area 2 routes into Area 0.',
    concepts: ['ABR connects backbone to non-backbone areas', 'Area 0 must be contiguous', 'Route summarization reduces LSDB size', 'Stub/NSSA areas limit external routes'],
    errors: [
      { error: 'OSPF routes missing across areas', solution: 'Verify ABR has interfaces in both areas and Area 0 is reachable.' },
      { error: 'Summarization not working', solution: 'Check area range command and ensure specific routes exist.' }
    ],
    questions: [
      { question: 'Why must an ABR be connected to Area 0?', solution: 'Area 0 is the backbone; all areas must connect to it.' },
      { question: 'What does area range do?', solution: 'It summarizes multiple routes into one advertised route.' }
    ]
  },
  {
    title: 'Advanced BGP: Route Filtering with AS_PATH and Communities',
    category: 'ISP',
    level: 'advanced',
    time: '45 minutes',
    objectives: 'Filter BGP prefixes using AS_PATH ACLs and community values.',
    scenario: 'An ISP receives full BGP table from upstream. Filter to receive only customer prefixes and set communities for local preference.',
    concepts: ['AS_PATH ACL filters by AS path', 'Community values mark traffic class', 'route-map applies filtering and modification', 'BGP table can be inspected with show ip bgp'],
    errors: [
      { error: 'Unwanted prefixes still present', solution: 'Verify AS_PATH regex and route-map application direction.' },
      { error: 'Community not recognized', solution: 'Enable send-community and verify route-map match.' }
    ],
    questions: [
      { question: 'What does AS_PATH _100$ match?', solution: 'Routes originating from AS 100.' },
      { question: 'Why use communities?', solution: 'To apply policies without changing prefix lists everywhere.' }
    ]
  },
  {
    title: 'Advanced DMVPN: Dynamic Multipoint VPN with NHRP',
    category: 'Security',
    level: 'advanced',
    time: '50 minutes',
    objectives: 'Configure DMVPN Phase 2 with NHRP and dynamic spoke-to-spoke tunnels.',
    scenario: 'Branch offices need direct spoke-to-spoke tunnels without going through hub. Configure DMVPN with dynamic routing.',
    concepts: ['DMVPN uses multipoint GRE tunnels', 'NHRP resolves spoke IPs dynamically', 'Phase 2 allows spoke-to-spoke via hub', 'EIGRP/OSPF can run over DMVPN'],
    errors: [
      { error: 'Spoke cannot reach other spoke', solution: 'Check NHRP mapping, spoke-to-spoke settings, and routing protocol.' },
      { error: 'Tunnel flapping', solution: 'Check IPSec, NHRP timers, and routing adjacency.' }
    ],
    questions: [
      { question: 'What is NHRP?', solution: 'Next Hop Resolution Protocol for dynamic tunnel endpoint mapping.' },
      { question: 'DMVPN advantage over static VPN?', solution: 'Dynamic spoke registration and reduced configuration overhead.' }
    ]
  },
  {
    title: 'Advanced SD-WAN: Overlay Routing and Application-Aware Policies',
    category: 'Cloud',
    level: 'advanced',
    time: '50 minutes',
    objectives: 'Configure SD-WAN overlay with application-aware path selection.',
    scenario: 'Enterprise uses broadband and MPLS links. Configure SD-WAN to route voice over MPLS and video over broadband dynamically.',
    concepts: ['SD-WAN overlay abstracts transport links', 'Application recognition steers traffic', 'Policy maps define path preferences', 'Tunnel health monitoring triggers failover'],
    errors: [
      { error: 'Voice still going over broadband', solution: 'Verify application policy and path preference order.' },
      { error: 'Tunnel not forming', solution: 'Check underlay connectivity, authentication, and control plane.' }
    ],
    questions: [
      { question: 'SD-WAN vs traditional WAN?', solution: 'SD-WAN uses application-aware dynamic path selection over multiple transports.' },
      { question: 'What is a transport profile?', solution: 'Defines link characteristics for path calculation.' }
    ]
  },
  {
    title: 'Advanced IPv6: DHCPv6 Relay, Prefix Delegation, and NPTv6',
    category: 'Enterprise',
    level: 'advanced',
    time: '45 minutes',
    objectives: 'Implement IPv6 addressing with DHCPv6 relay, prefix delegation, and NAT64.',
    scenario: 'Enterprise network with IPv6-only core. Configure DHCPv6 relay for clients and prefix delegation for branch routers.',
    concepts: ['DHCPv6 relay forwards client messages to server', 'Prefix delegation assigns /56 to branch routers', 'NPTv6 provides stateful translation', 'SLAAC uses router advertisements'],
    errors: [
      { error: 'Client not getting IPv6 address', solution: 'Check RA flags, DHCPv6 relay, and server pool.' },
      { error: 'Prefix delegation failing', solution: 'Verify server supports delegation and relay is configured.' }
    ],
    questions: [
      { question: 'DHCPv6 relay vs proxy?', solution: 'Relay forwards messages; proxy assigns addresses locally.' },
      { question: 'What is prefix delegation?', solution: 'Server assigns a network prefix to a requesting router.' }
    ]
  }
];

const newLabs = advancedLabs.map((lab, index) => {
  const id = String(151 + index);
  const baseId = String(151 + index).padStart(3, '0');
  return {
    id,
    title: lab.title,
    category: lab.category,
    level: lab.level,
    time: lab.time,
    objectives: lab.objectives,
    scenario: lab.scenario,
    concepts: lab.concepts,
    errors: lab.errors,
    questions: lab.questions,
    steps: [
      {
        stepId: `LAB-${baseId}-S-01`,
        title: 'Review Advanced Scenario',
        instruction: `Review the advanced scenario: ${lab.scenario}`,
        commands: [],
        expectedOutput: 'Advanced requirements understood.',
        routing: 'Design the required topology and identify all routing domains.',
        keypoints: ['Identify area/AS boundaries', 'Plan address allocation', 'Determine routing protocol requirements'],
        verification: { type: 'option', expected: 'understood' },
        hintTiers: ['Focus on protocol-specific requirements', lab.objectives],
        errors: [{ error: 'Skipping design', symptom: 'Incomplete topology', fix: 'Draw the design before configuring.' }],
        onSuccess: { unlockNext: true, reward: { xp: 5, badge: 'reader' } }
      },
      {
        stepId: `LAB-${baseId}-S-02`,
        title: 'Plan Advanced Routing Design',
        instruction: 'Plan the routing protocol configuration, including areas, AS numbers, summarization, and filtering.',
        commands: [],
        expectedOutput: 'Routing design documented.',
        routing: 'Define how routes will be exchanged, summarized, and filtered.',
        keypoints: lab.concepts,
        verification: { type: 'typing', expected: lab.objectives },
        hintTiers: ['Use the concepts list', lab.objectives],
        errors: [{ error: 'Overlapping design', symptom: 'Routing loops or suboptimal paths', fix: 'Validate design against requirements.' }],
        onSuccess: { unlockNext: true, reward: { xp: 10, badge: 'planner' } }
      },
      {
        stepId: `LAB-${baseId}-S-03`,
        title: 'Apply Advanced Configuration',
        instruction: `Apply the configuration for this advanced scenario.`,
        commands: lab.concepts.slice(0, 3),
        expectedOutput: 'Configuration accepted.',
        routing: 'Apply protocol settings according to the design.',
        keypoints: lab.concepts,
        verification: { type: 'config', expected: lab.objectives },
        hintTiers: ['Review protocol syntax', lab.concepts[0]],
        errors: [{ error: 'Config rejected', symptom: 'Invalid syntax or context', fix: 'Check command reference and interface context.' }],
        onSuccess: { unlockNext: true, reward: { xp: 20, badge: 'builder' } }
      },
      {
        stepId: `LAB-${baseId}-S-04`,
        title: 'Verify Advanced Routing and Output',
        instruction: 'Verify routing tables, protocol adjacencies, and end-to-end reachability.',
        commands: ['show ip route', 'show ip protocols', 'show ip bgp', 'show dmvpn', 'show ipv6 dhcp interface'],
        expectedOutput: 'All expected routes and adjacencies are present.',
        routing: 'Confirm routing protocol operation and reachability.',
        keypoints: ['Check neighbor/adjacency state', 'Verify advertised/received prefixes', 'Test end-to-end connectivity'],
        verification: { type: 'option', expected: lab.questions[0].solution },
        hintTiers: ['Use relevant show commands', lab.questions[0].solution],
        errors: [{ error: 'Adjacency down', symptom: 'Protocol state not established', fix: 'Check AS/area, authentication, timers, and transport.' }],
        onSuccess: { unlockNext: true, reward: { xp: 25, badge: 'verifier' } }
      },
      {
        stepId: `LAB-${baseId}-S-05`,
        title: 'Troubleshoot Advanced Issue',
        instruction: `Troubleshoot: ${lab.errors[0].error}`,
        commands: ['debug', 'show interfaces', 'show ip route'],
        expectedOutput: 'Issue identified and resolved.',
        routing: 'Use protocol-specific troubleshooting steps.',
        keypoints: ['Isolate the failing component', 'Use targeted debugging', 'Validate fix with show commands'],
        verification: { type: 'option', expected: lab.errors[0].solution },
        hintTiers: ['Start from the error description', lab.errors[0].solution],
        errors: [{ error: 'Wrong fix', symptom: 'Symptom changes but root cause remains', fix: 'Identify root cause before applying fix.' }],
        onSuccess: { unlockNext: true, reward: { xp: 30, badge: 'troubleshooter' } }
      }
    ]
  };
});

labs.push(...newLabs);
fs.writeFileSync(labsFile, JSON.stringify(labs, null, 2));
console.log(`Added ${newLabs.length} advanced labs. Total: ${labs.length}`);
