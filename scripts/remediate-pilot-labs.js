const fs = require('fs');
const path = require('path');

const labsFile = path.join(__dirname, '..', 'frontend', 'src', 'data', 'labs.procedural.json');

// Read existing labs
const labs = JSON.parse(fs.readFileSync(labsFile, 'utf8'));

function createCanonicalLab(id, data) {
  return {
    id: String(id),
    title: data.title,
    slug: data.slug,
    category: data.category,
    difficulty: data.difficulty,
    estimatedTime: data.estimatedTime,
    version: 1,
    realWorldScenario: data.realWorldScenario,
    engineerRole: data.engineerRole,
    problemStatement: data.problemStatement,
    businessImpact: data.businessImpact,
    objectives: data.objectives,
    learningObjectives: data.learningObjectives,
    prerequisites: data.prerequisites,
    concepts: data.concepts,
    skills: data.skills,
    commandsToLearn: data.commandsToLearn,
    topology: data.topology,
    ipAddressing: data.ipAddressing,
    initialState: data.initialState,
    steps: data.steps,
    troubleshooting: data.troubleshooting,
    faultInjection: { faults: [] },
    finalVerification: data.finalVerification,
    knowledgeCheck: data.knowledgeCheck,
    legacy: false,
    tags: data.tags
  };
}

const pilot23 = createCanonicalLab('23', {
  title: 'SSH Hardening and Secure Access',
  slug: 'ssh-hardening-secure-access',
  category: 'Security',
  difficulty: 'basic',
  estimatedTime: '20 minutes',
  realWorldScenario: 'A small business has deployed a new Cisco ISR router as the network gateway. The network administrator needs to configure secure remote management access because the office location is remote and the team cannot always be on-site for console access. Unencrypted Telnet is currently the only option, exposing credentials to interception.',
  engineerRole: 'Junior Network Engineer',
  problemStatement: 'The router has no secure remote management configured. Administrators must use console access or unencrypted Telnet, which exposes credentials on the network.',
  businessImpact: 'Without secure remote access, administrators cannot manage the router remotely. This increases downtime during outages and exposes device credentials to potential interception, creating a security vulnerability.',
  objectives: 'Configure SSH version 2, generate cryptographic keys, create a local admin user, restrict VTY line access to SSH only, and verify secure remote connectivity.',
  learningObjectives: [
    'Understand why SSH is preferred over Telnet for remote management',
    'Configure RSA cryptographic keys for SSH',
    'Create local user accounts with secret passwords',
    'Restrict VTY lines to SSH-only access',
    'Verify SSH connectivity from a management PC'
  ],
  prerequisites: [
    'Basic IOS navigation (user mode, privileged mode)',
    'Understanding of router physical interfaces'
  ],
  concepts: [
    'SSH vs Telnet security comparison',
    'RSA key generation and purpose',
    'VTY line configuration',
    'Local user authentication',
    'Transport input restrictions'
  ],
  skills: [
    'Configure SSH version 2 on a Cisco router',
    'Generate RSA keys for secure communication',
    'Create local user accounts with privilege levels',
    'Restrict VTY line access to SSH only',
    'Test SSH connectivity from a management PC'
  ],
  commandsToLearn: [
    'hostname',
    'ip domain-name',
    'crypto key generate rsa',
    'username',
    'ip ssh version 2',
    'line vty 0 4',
    'transport input ssh',
    'login local',
    'enable secret'
  ],
  topology: {
    devices: [
      { id: 'R1', type: 'router', name: 'R1', role: 'gateway', configuration: { hostname: 'R1' } },
      { id: 'PC1', type: 'pc', name: 'PC1', role: 'management-workstation', configuration: { hostname: 'PC1' } }
    ],
    interfaces: [
      { deviceId: 'R1', name: 'GigabitEthernet0/0', type: 'ethernet', role: 'management', enabled: true },
      { deviceId: 'PC1', name: 'Ethernet0', type: 'ethernet', role: 'access', enabled: true }
    ],
    connections: [
      { from: 'R1:GigabitEthernet0/0', to: 'PC1:Ethernet0', type: 'ethernet', status: 'connected' }
    ]
  },
  ipAddressing: [
    { deviceId: 'R1', interface: 'GigabitEthernet0/0', ipAddress: '192.168.1.1', subnetMask: '255.255.255.0', gateway: '', vlan: 1, description: 'Management interface' },
    { deviceId: 'PC1', interface: 'Ethernet0', ipAddress: '192.168.1.10', subnetMask: '255.255.255.0', gateway: '192.168.1.1', vlan: 1, description: 'Management workstation' }
  ],
  initialState: {
    devices: [
      { deviceId: 'R1', hostname: 'R1', interfaces: [{ interfaceName: 'GigabitEthernet0/0', ip: 'unassigned', status: 'down', protocol: 'down' }] },
      { deviceId: 'PC1', hostname: 'PC1', interfaces: [{ interfaceName: 'Ethernet0', ip: 'unassigned', status: 'up', protocol: 'up' }] }
    ]
  },
  steps: [
    {
      stepId: '23-S-01', order: 1, title: 'Inspect Current Router Configuration',
      instruction: 'Before making any changes, examine the current router configuration. Run the following commands and note what remote access methods are currently configured: show running-config | section line vty, show ip ssh',
      why: 'You need to understand the current state before making changes. This establishes a baseline and shows what remote access options exist.',
      targetDevice: 'R1', actionType: 'verification',
      commands: ['show running-config | section line vty', 'show ip ssh'],
      expectedOutput: 'No VTY lines configured for SSH. SSH not enabled.',
      verification: { type: 'cli', expected: '' },
      hints: ['Look for "transport input" lines under VTY configuration', 'Check if RSA keys are generated'],
      commonMistakes: [{ mistake: 'Skipping the inspection step', solution: 'Always inspect current state before configuring' }],
      completionCondition: 'Student has examined current VTY and SSH configuration'
    },
    {
      stepId: '23-S-02', order: 2, title: 'Configure Hostname and Domain Name',
      instruction: 'Enter global configuration mode and set the router hostname to R1 and domain name to secure-access.local. These values are required before generating SSH keys.',
      why: 'SSH requires a hostname and domain name to generate unique RSA keys. Without these, the crypto key command will fail.',
      targetDevice: 'R1', actionType: 'configuration',
      commands: ['enable', 'configure terminal', 'hostname R1', 'ip domain-name secure-access.local', 'end'],
      expectedOutput: 'Router hostname and domain configured.',
      verification: { type: 'cli', expected: 'R1' },
      hints: ['The hostname should be set before generating keys', 'The domain name can be any valid DNS-style name'],
      commonMistakes: [{ mistake: 'Forgetting to set domain name before generating keys', solution: 'Set ip domain-name first, then generate RSA keys' }],
      completionCondition: 'show running-config displays hostname R1 and ip domain-name secure-access.local'
    },
    {
      stepId: '23-S-03', order: 3, title: 'Generate RSA Cryptographic Keys',
      instruction: 'Generate RSA keys for SSH. Use the default key size (1024 bits is acceptable for lab purposes). The key generation process may take a moment.',
      why: 'RSA keys are used for the SSH handshake. They encrypt the session and authenticate the router to connecting clients.',
      targetDevice: 'R1', actionType: 'configuration',
      commands: ['enable', 'configure terminal', 'crypto key generate rsa general-keys modulus 1024', 'end'],
      expectedOutput: '% Key pair generation in progress...',
      verification: { type: 'cli', expected: 'crypto key generate rsa' },
      hints: ['The modulus determines key strength. 1024 is minimum for labs.', 'You may see a prompt to overwrite existing keys - choose no if you want to keep existing keys'],
      commonMistakes: [{ mistake: 'Generating keys without setting hostname and domain first', solution: 'Set hostname and domain-name before generating keys' }],
      completionCondition: 'RSA keys are generated and show crypto key mypubkey rsa displays the public key'
    },
    {
      stepId: '23-S-04', order: 4, title: 'Create Local Admin User',
      instruction: 'Create a local user account named admin with privilege level 15 and secret password Admin123!. This account will be used for SSH authentication.',
      why: 'Local user accounts provide authentication for VTY line access. The secret password is encrypted and stronger than a plaintext password.',
      targetDevice: 'R1', actionType: 'configuration',
      commands: ['enable', 'configure terminal', 'username admin privilege 15 secret Admin123!', 'end'],
      expectedOutput: 'User account created.',
      verification: { type: 'cli', expected: 'username admin' },
      hints: ['Use "secret" not "password" - secret is encrypted in the config', 'Privilege level 15 gives full administrative access'],
      commonMistakes: [{ mistake: 'Using "password" instead of "secret"', solution: 'Always use "secret" for stronger encryption' }],
      completionCondition: 'show running-config | include username displays the admin user'
    },
    {
      stepId: '23-S-05', order: 5, title: 'Configure VTY Lines for SSH Only',
      instruction: 'Configure VTY lines 0 through 4 to accept SSH connections only. Use login local for local database authentication. Disable Telnet access.',
      why: 'Restricting VTY lines to SSH only prevents unencrypted Telnet sessions. This is a critical security hardening step.',
      targetDevice: 'R1', actionType: 'configuration',
      commands: ['enable', 'configure terminal', 'line vty 0 4', 'transport input ssh', 'login local', 'exit', 'end'],
      expectedOutput: 'VTY lines configured for SSH only.',
      verification: { type: 'cli', expected: 'transport input ssh' },
      hints: ['transport input ssh blocks Telnet', 'login local tells the router to check the local user database'],
      commonMistakes: [{ mistake: 'Using "transport input all" which allows both Telnet and SSH', solution: 'Use "transport input ssh" to allow only SSH' }],
      completionCondition: 'show running-config | section line vty shows transport input ssh and login local'
    },
    {
      stepId: '23-S-06', order: 6, title: 'Enable SSH Version 2',
      instruction: 'Explicitly enable SSH version 2, which is more secure than version 1. Version 2 uses stronger encryption and is the recommended standard.',
      why: 'SSH version 1 has known vulnerabilities. Version 2 provides stronger encryption and is the current standard for secure remote access.',
      targetDevice: 'R1', actionType: 'configuration',
      commands: ['enable', 'configure terminal', 'ip ssh version 2', 'end'],
      expectedOutput: 'SSH version 2 enabled.',
      verification: { type: 'cli', expected: 'ip ssh version 2' },
      hints: ['You can verify SSH version with "show ip ssh"', 'Version 2 is the default on newer IOS versions, but it is good practice to explicitly configure it'],
      commonMistakes: [{ mistake: 'Leaving SSH at version 1', solution: 'Always configure ip ssh version 2' }],
      completionCondition: 'show ip ssh displays SSH version 2 enabled'
    },
    {
      stepId: '23-S-07', order: 7, title: 'Test SSH Connectivity',
      instruction: 'From PC1, test SSH connectivity to R1 at 192.168.1.1. Use the admin username and Admin123! password. Verify that you can establish an SSH session.',
      why: 'Testing confirms that SSH is working correctly and that the local user account can authenticate.',
      targetDevice: 'PC1', actionType: 'verification',
      commands: ['ssh -l admin 192.168.1.1'],
      expectedOutput: 'SSH session established successfully.',
      verification: { type: 'cli', expected: 'R1>' },
      hints: ['The -l flag specifies the username for SSH', 'You will be prompted for the password: Admin123!'],
      commonMistakes: [{ mistake: 'Trying to Telnet instead of SSH', solution: 'Use ssh command, not telnet' }],
      completionCondition: 'SSH session to R1 is established and user is at privileged prompt'
    }
  ],
  troubleshooting: {
    commonErrors: [
      {
        error: 'SSH connection timeout or refused',
        symptoms: 'PC1 cannot establish SSH session to R1',
        diagnosticCommands: ['show ip ssh', 'show running-config | section line vty', 'show crypto key mypubkey rsa'],
        troubleshootingSteps: [
          '1. Verify RSA keys are generated (show crypto key mypubkey rsa)',
          '2. Verify VTY lines have transport input ssh',
          '3. Verify login local is configured on VTY lines',
          '4. Verify the admin user account exists',
          '5. Verify PC1 can reach R1 IP address'
        ],
        possibleCauses: [
          'RSA keys not generated',
          'VTY lines configured for Telnet only',
          'Local user account missing',
          'IP connectivity issue between PC and router'
        ],
        fix: 'Generate RSA keys, configure VTY lines for SSH only, create local user account, verify IP connectivity',
        verificationAfterFix: 'SSH connection from PC1 to R1 succeeds'
      },
      {
        error: 'SSH authentication failure',
        symptoms: 'SSH session starts but username/password is rejected',
        diagnosticCommands: ['show running-config | include username', 'show users'],
        troubleshootingSteps: [
          '1. Verify username spelling matches local database',
          '2. Verify password is correct',
          '3. Verify user privilege level allows VTY access',
          '4. Check if local database is enabled (login local)'
        ],
        possibleCauses: [
          'Incorrect username or password',
          'User account not in local database',
          'AAA authentication overriding local'
        ],
        fix: 'Verify username and password, ensure user exists in local database with login local configured',
        verificationAfterFix: 'SSH authentication succeeds with correct credentials'
      }
    ]
  },
  faultInjection: {
    faults: [
      { type: 'wrong_vlan', severity: 'medium', description: 'Management PC is connected to the wrong VLAN and cannot reach the router management interface' }
    ]
  },
  finalVerification: {
    checks: [
      { type: 'interface_up', target: 'R1:GigabitEthernet0/0', expected: true },
      { type: 'ip_correct', target: 'R1:GigabitEthernet0/0', expected: '192.168.1.1' },
      { type: 'ping_success', target: 'PC1:R1', expected: true }
    ],
    successCriteria: 'SSH is enabled and accessible from the management workstation. RSA keys are generated, local user exists, VTY lines restrict to SSH only.',
    completionCriteria: 'Student can SSH from PC1 to R1 using the admin account and reach privileged EXEC mode.'
  },
  knowledgeCheck: [
    {
      question: 'Why is SSH preferred over Telnet for remote device management?',
      type: 'multiple_choice',
      options: [
        'SSH is faster than Telnet',
        'SSH encrypts all traffic including credentials, while Telnet sends everything in plaintext',
        'SSH uses less bandwidth',
        'SSH does not require authentication'
      ],
      correctAnswer: 'SSH encrypts all traffic including credentials, while Telnet sends everything in plaintext',
      explanation: 'SSH provides encrypted sessions, protecting credentials and data from interception. Telnet transmits all data, including passwords, in cleartext.'
    },
    {
      question: 'What is the purpose of RSA keys in SSH?',
      type: 'multiple_choice',
      options: [
        'To compress data for faster transmission',
        'To authenticate the server and encrypt the session',
        'To assign IP addresses',
        'To route packets'
      ],
      correctAnswer: 'To authenticate the server and encrypt the session',
      explanation: 'RSA keys are used during the SSH handshake to authenticate the server and establish an encrypted session.'
    },
    {
      question: 'Which command creates a local user account with a secret password?',
      type: 'multiple_choice',
      options: [
        'username admin password Admin123',
        'username admin secret Admin123',
        'user admin enable Admin123',
        'local-user admin secret Admin123'
      ],
      correctAnswer: 'username admin secret Admin123',
      explanation: 'The "username" command creates a local user. "secret" encrypts the password in the configuration, making it more secure than plaintext "password".'
    }
  ],
  tags: ['security', 'ssh', 'remote-management', 'beginner']
});

const pilot81 = createCanonicalLab('81', {
  title: 'VLAN Trunk Port Configuration',
  slug: 'vlan-trunk-port-configuration',
  category: 'Trunking',
  difficulty: 'intermediate',
  estimatedTime: '25 minutes',
  realWorldScenario: 'A small company is expanding its network to support two departments: Sales and Engineering. Each department needs its own broadcast domain (VLAN). The two switches are connected by a single uplink, and all inter-switch traffic must carry both VLANs without creating additional physical links.',
  engineerRole: 'Network Engineer',
  problemStatement: 'Two switches are connected by a single cable, but only the native VLAN traffic passes. Sales and Engineering VLANs cannot communicate across the uplink.',
  businessImpact: 'Without trunking, adding a new VLAN requires additional physical cabling between switches. This increases cost, reduces scalability, and complicates network changes.',
  objectives: 'Configure a trunk port on two switches to carry multiple VLANs across a single uplink, verify trunk status, and test VLAN isolation.',
  learningObjectives: [
    'Understand the difference between access and trunk ports',
    'Configure 802.1Q trunk encapsulation',
    'Assign native VLAN on a trunk link',
    'Restrict allowed VLANs on a trunk port',
    'Verify trunk operation using show commands'
  ],
  prerequisites: [
    'Basic VLAN configuration (create VLANs, assign ports)',
    'Understanding of broadcast domains'
  ],
  concepts: [
    'Access vs trunk port modes',
    '802.1Q frame tagging',
    'Native VLAN concept',
    'Allowed VLAN list',
    'Trunk negotiation'
  ],
  skills: [
    'Configure switchport mode trunk',
    'Set native VLAN on trunk ports',
    'Restrict allowed VLANs on trunk',
    'Verify trunk status with show interfaces trunk'
  ],
  commandsToLearn: [
    'switchport mode trunk',
    'switchport trunk encapsulation dot1q',
    'switchport trunk native vlan',
    'switchport trunk allowed vlan',
    'show interfaces trunk',
    'show interfaces switchport'
  ],
  topology: {
    devices: [
      { id: 'SW1', type: 'switch', name: 'SW1', role: 'access-distribution', configuration: { hostname: 'SW1' } },
      { id: 'SW2', type: 'switch', name: 'SW2', role: 'access-distribution', configuration: { hostname: 'SW2' } },
      { id: 'PC1', type: 'pc', name: 'PC1', role: 'sales-workstation', configuration: { hostname: 'PC1' } },
      { id: 'PC2', type: 'pc', name: 'PC2', role: 'engineering-workstation', configuration: { hostname: 'PC2' } }
    ],
    interfaces: [
      { deviceId: 'SW1', name: 'FastEthernet0/1', type: 'ethernet', role: 'trunk', enabled: true },
      { deviceId: 'SW1', name: 'FastEthernet0/2', type: 'ethernet', role: 'access', enabled: true },
      { deviceId: 'SW2', name: 'FastEthernet0/1', type: 'ethernet', role: 'trunk', enabled: true },
      { deviceId: 'SW2', name: 'FastEthernet0/2', type: 'ethernet', role: 'access', enabled: true },
      { deviceId: 'PC1', name: 'Ethernet0', type: 'ethernet', role: 'access', enabled: true },
      { deviceId: 'PC2', name: 'Ethernet0', type: 'ethernet', role: 'access', enabled: true }
    ],
    connections: [
      { from: 'SW1:FastEthernet0/1', to: 'SW2:FastEthernet0/1', type: 'ethernet', status: 'connected' },
      { from: 'SW1:FastEthernet0/2', to: 'PC1:Ethernet0', type: 'ethernet', status: 'connected' },
      { from: 'SW2:FastEthernet0/2', to: 'PC2:Ethernet0', type: 'ethernet', status: 'connected' }
    ]
  },
  ipAddressing: [
    { deviceId: 'PC1', interface: 'Ethernet0', ipAddress: '192.168.10.10', subnetMask: '255.255.255.0', gateway: '', vlan: 10, description: 'Sales workstation' },
    { deviceId: 'PC2', interface: 'Ethernet0', ipAddress: '192.168.20.10', subnetMask: '255.255.255.0', gateway: '', vlan: 20, description: 'Engineering workstation' }
  ],
  initialState: {
    devices: [
      { deviceId: 'SW1', hostname: 'SW1', interfaces: [{ interfaceName: 'FastEthernet0/1', ip: 'unassigned', status: 'down', protocol: 'down' }, { interfaceName: 'FastEthernet0/2', ip: 'unassigned', status: 'down', protocol: 'down' }] },
      { deviceId: 'SW2', hostname: 'SW2', interfaces: [{ interfaceName: 'FastEthernet0/1', ip: 'unassigned', status: 'down', protocol: 'down' }, { interfaceName: 'FastEthernet0/2', ip: 'unassigned', status: 'down', protocol: 'down' }] },
      { deviceId: 'PC1', hostname: 'PC1', interfaces: [{ interfaceName: 'Ethernet0', ip: 'unassigned', status: 'up', protocol: 'up' }] },
      { deviceId: 'PC2', hostname: 'PC2', interfaces: [{ interfaceName: 'Ethernet0', ip: 'unassigned', status: 'up', protocol: 'up' }] }
    ]
  },
  steps: [
    {
      stepId: '81-S-01', order: 1, title: 'Inspect Current Switch Configuration',
      instruction: 'On both SW1 and SW2, examine the current port configuration. Run show interfaces switchport on the uplink port (Fa0/1) to see the current mode.',
      why: 'You need to understand the current port mode before configuring trunking. By default, ports are in dynamic auto mode, which may not form a trunk.',
      targetDevice: 'SW1', actionType: 'verification',
      commands: ['show interfaces switchport'],
      expectedOutput: 'Administrative Mode: dynamic auto, Operational Mode: static access',
      verification: { type: 'cli', expected: 'dynamic auto' },
      hints: ['Look for "Administrative Mode" and "Operational Mode"', 'The uplink port should show as access mode currently'],
      commonMistakes: [{ mistake: 'Configuring trunk without checking current mode', solution: 'Always inspect current configuration first' }],
      completionCondition: 'Student has examined current port mode on both switches'
    },
    {
      stepId: '81-S-02', order: 2, title: 'Configure VLANs on Both Switches',
      instruction: 'On both SW1 and SW2, create VLAN 10 (Sales) and VLAN 20 (Engineering). Name them appropriately.',
      why: 'VLANs must exist on both switches before they can be carried over the trunk. Trunk ports forward traffic for all allowed VLANs, but the VLAN must be defined in the VLAN database.',
      targetDevice: 'SW1', actionType: 'configuration',
      commands: ['enable', 'configure terminal', 'vlan 10', 'name Sales', 'vlan 20', 'name Engineering', 'end'],
      expectedOutput: 'VLANs created successfully.',
      verification: { type: 'cli', expected: 'VLAN 10' },
      hints: ['Create VLANs in global configuration mode', 'Use descriptive names for easier troubleshooting'],
      commonMistakes: [{ mistake: 'Creating VLANs on only one switch', solution: 'VLANs must exist on both switches for trunking to work' }],
      completionCondition: 'show vlan brief displays VLAN 10 and VLAN 20 on both switches'
    },
    {
      stepId: '81-S-03', order: 3, title: 'Configure Trunk Port on SW1',
      instruction: 'On SW1, configure FastEthernet0/1 as a trunk port. Set encapsulation to dot1q, native VLAN to 99, and allowed VLANs to 10 and 20 only.',
      why: 'Configuring the trunk port enables it to carry multiple VLANs. The native VLAN is untagged, and the allowed VLAN list restricts which VLANs traverse the trunk.',
      targetDevice: 'SW1', actionType: 'configuration',
      commands: ['enable', 'configure terminal', 'interface FastEthernet0/1', 'switchport mode trunk', 'switchport trunk encapsulation dot1q', 'switchport trunk native vlan 99', 'switchport trunk allowed vlan 10,20', 'end'],
      expectedOutput: 'Trunk port configured.',
      verification: { type: 'cli', expected: 'switchport mode trunk' },
      hints: ['The encapsulation command is required on some platforms', 'Native VLAN should be a dedicated VLAN, not a user VLAN'],
      commonMistakes: [{ mistake: 'Forgetting trunk encapsulation on older IOS', solution: 'Use switchport trunk encapsulation dot1q' }],
      completionCondition: 'show interfaces Fa0/1 switchport shows trunk mode with correct native VLAN and allowed VLANs'
    },
    {
      stepId: '81-S-04', order: 4, title: 'Configure Trunk Port on SW2',
      instruction: 'On SW2, configure FastEthernet0/1 as a trunk port with the same settings: dot1q encapsulation, native VLAN 99, allowed VLANs 10 and 20.',
      why: 'Both ends of a trunk link must be configured as trunk ports. If only one side is a trunk, the link will not carry tagged frames correctly.',
      targetDevice: 'SW2', actionType: 'configuration',
      commands: ['enable', 'configure terminal', 'interface FastEthernet0/1', 'switchport mode trunk', 'switchport trunk encapsulation dot1q', 'switchport trunk native vlan 99', 'switchport trunk allowed vlan 10,20', 'end'],
      expectedOutput: 'Trunk port configured.',
      verification: { type: 'cli', expected: 'switchport mode trunk' },
      hints: ['Both sides must match for trunk to form', 'Use the same native VLAN on both sides'],
      commonMistakes: [{ mistake: 'Mismatched native VLAN on trunk ends', solution: 'Native VLAN must match on both sides of the trunk' }],
      completionCondition: 'show interfaces Fa0/1 switchport on SW2 shows trunk mode'
    },
    {
      stepId: '81-S-05', order: 5, title: 'Verify Trunk Status',
      instruction: 'On both switches, verify the trunk is operational. Run show interfaces trunk to see which VLANs are active on the trunk.',
      why: 'Verification confirms that the trunk is carrying the expected VLANs and that the native VLAN is correctly configured.',
      targetDevice: 'SW1', actionType: 'verification',
      commands: ['show interfaces trunk'],
      expectedOutput: 'Vlans allowed on trunk: 10,20,99',
      verification: { type: 'cli', expected: 'Vlans allowed on trunk' },
      hints: ['Look for the "Vlans allowed on trunk" line', 'Check that VLANs 10, 20, and 99 appear in the output'],
      commonMistakes: [{ mistake: 'Only checking one side of the trunk', solution: 'Verify trunk status on both switches' }],
      completionCondition: 'show interfaces trunk shows VLANs 10, 20, and 99 as allowed and active'
    },
    {
      stepId: '81-S-06', order: 6, title: 'Configure Access Ports and Test VLAN Traffic',
      instruction: 'On SW1, assign FastEthernet0/2 to VLAN 10. On SW2, assign FastEthernet0/2 to VLAN 20. Configure PC1 with IP 192.168.10.10/24 and PC2 with IP 192.168.20.10/24. Test connectivity within each VLAN.',
      why: 'Access ports assign devices to specific VLANs. PCs in the same VLAN should be able to communicate directly through the switch.',
      targetDevice: 'SW1', actionType: 'configuration',
      commands: ['enable', 'configure terminal', 'interface FastEthernet0/2', 'switchport mode access', 'switchport access vlan 10', 'end'],
      expectedOutput: 'Access port configured for VLAN 10.',
      verification: { type: 'cli', expected: 'switchport access vlan 10' },
      hints: ['Access ports should be in access mode, not trunk', 'Each PC should be in a different VLAN'],
      commonMistakes: [{ mistake: 'Assigning access port to wrong VLAN', solution: 'Double-check VLAN assignment matches the PC subnet' }],
      completionCondition: 'PC1 and PC1 can ping within their respective VLANs'
    },
    {
      stepId: '81-S-07', order: 7, title: 'Verify VLAN Isolation',
      instruction: 'From PC1, attempt to ping PC2. The ping should fail because the PCs are in different VLANs and there is no router configured for inter-VLAN routing.',
      why: 'VLANs provide broadcast isolation. Without a router or Layer 3 device, traffic cannot flow between VLANs.',
      targetDevice: 'PC1', actionType: 'verification',
      commands: ['ping 192.168.20.10'],
      expectedOutput: 'Request timed out (expected - different VLANs)',
      verification: { type: 'cli', expected: 'Request timed out' },
      hints: ['VLANs are separate broadcast domains', 'Inter-VLAN communication requires a router or Layer 3 switch'],
      commonMistakes: [{ mistake: 'Expecting ping to succeed between VLANs', solution: 'Different VLANs cannot communicate without a router' }],
      completionCondition: 'Ping from PC1 to PC2 times out, confirming VLAN isolation'
    }
  ],
  troubleshooting: {
    commonErrors: [
      {
        error: 'Trunk not forming - ports remain in access mode',
        symptoms: 'show interfaces trunk shows no trunk ports',
        diagnosticCommands: ['show interfaces switchport', 'show interfaces trunk', 'show vlan brief'],
        troubleshootingSteps: [
          '1. Verify both sides are configured as trunk (not dynamic auto)',
          '2. Verify encapsulation matches (dot1q)',
          '3. Verify native VLAN matches on both sides',
          '4. Verify allowed VLANs overlap on both sides'
        ],
        possibleCauses: [
          'One side is access mode',
          'Encapsulation mismatch',
          'Native VLAN mismatch',
          'No overlapping allowed VLANs'
        ],
        fix: 'Configure both sides as trunk mode with matching encapsulation, native VLAN, and allowed VLANs',
        verificationAfterFix: 'show interfaces trunk shows both ports in trunking mode'
      },
      {
        error: 'Traffic from one VLAN appears on another VLAN',
        symptoms: 'PC in VLAN 10 can reach PC in VLAN 20 without router',
        diagnosticCommands: ['show interfaces trunk', 'show vlan brief'],
        troubleshootingSteps: [
          '1. Check trunk allowed VLAN list',
          '2. Verify access ports are assigned to correct VLANs',
          '3. Check for VLAN leaks on trunk'
        ],
        possibleCauses: [
          'Trunk allowed VLANs include both VLANs when they should not',
          'Access ports assigned to wrong VLAN',
          'Native VLAN misconfiguration'
        ],
        fix: 'Restrict trunk allowed VLANs, verify access port assignments',
        verificationAfterFix: 'Only intended VLAN traffic traverses the trunk'
      }
    ]
  },
  faultInjection: {
    faults: [
      { type: 'wrong_trunk', severity: 'medium', description: 'Trunk allowed VLAN list is misconfigured, blocking expected VLAN traffic' }
    ]
  },
  finalVerification: {
    checks: [
      { type: 'vlan_exists', target: 'VLAN10', expected: true },
      { type: 'vlan_exists', target: 'VLAN20', expected: true },
      { type: 'interface_up', target: 'SW1:FastEthernet0/1', expected: true },
      { type: 'interface_up', target: 'SW2:FastEthernet0/1', expected: true }
    ],
    successCriteria: 'Trunk is operational on both switches, carrying VLANs 10 and 20. PCs in different VLANs are isolated.',
    completionCriteria: 'Student has configured trunk ports, verified VLAN traffic, and confirmed VLAN isolation.'
  },
  knowledgeCheck: [
    {
      question: 'What is the primary difference between an access port and a trunk port?',
      type: 'multiple_choice',
      options: [
        'Access ports are faster than trunk ports',
        'Access ports carry a single VLAN, while trunk ports carry multiple VLANs using 802.1Q tagging',
        'Access ports require authentication, trunk ports do not',
        'Access ports are only for routers, trunk ports are only for switches'
      ],
      correctAnswer: 'Access ports carry a single VLAN, while trunk ports carry multiple VLANs using 802.1Q tagging',
      explanation: 'Access ports connect end devices and carry traffic for one VLAN. Trunk ports connect switches and carry traffic for multiple VLANs using 802.1Q frame tagging.'
    },
    {
      question: 'What is the purpose of the native VLAN on a trunk port?',
      type: 'multiple_choice',
      options: [
        'It is the default VLAN for all untagged frames',
        'It is the highest-priority VLAN',
        'It is used for management traffic only',
        'It encrypts traffic on the trunk'
      ],
      correctAnswer: 'It is the default VLAN for all untagged frames',
      explanation: 'The native VLAN is the VLAN whose frames are not tagged with 802.1Q headers on a trunk link. It is used for backward compatibility with devices that do not understand 802.1Q.'
    },
    {
      question: 'Why should you restrict allowed VLANs on a trunk port?',
      type: 'multiple_choice',
      options: [
        'To increase trunk bandwidth',
        'To reduce broadcast traffic and improve security by only allowing necessary VLANs',
        'To enable VLAN pruning automatically',
        'To make the trunk faster'
      ],
      correctAnswer: 'To reduce broadcast traffic and improve security by only allowing necessary VLANs',
      explanation: 'Restricting allowed VLANs prevents unnecessary broadcast traffic from crossing the trunk and limits exposure if an unauthorized device is connected.'
    }
  ],
  tags: ['switching', 'vlan', 'trunking', '802.1q', 'intermediate']
});

const pilot229 = createCanonicalLab('229', {
  title: 'Inter-VLAN Routing with Router',
  slug: 'inter-vlan-routing-with-router',
  category: 'Inter-VLAN Routing',
  difficulty: 'intermediate',
  estimatedTime: '30 minutes',
  realWorldScenario: 'A small business has two departments: Sales (VLAN 10) and Engineering (VLAN 20). The company uses a single router with multiple physical interfaces to provide inter-VLAN routing. Recently, a new employee in Sales cannot reach the Engineering shared server. The network engineer must verify and restore inter-VLAN connectivity.',
  engineerRole: 'Network Engineer',
  problemStatement: 'Two departments are on separate VLANs but cannot communicate. The router interfaces and switch VLAN configuration need to be verified and corrected.',
  businessImpact: 'Departmental isolation prevents collaboration. Sales cannot access Engineering resources, impacting cross-functional projects and reducing productivity.',
  objectives: 'Configure VLANs on a switch, assign access ports, configure router interfaces for each VLAN, and verify inter-VLAN connectivity.',
  learningObjectives: [
    'Understand why VLANs create separate broadcast domains',
    'Configure VLANs on a Cisco switch',
    'Assign switch ports to access VLANs',
    'Configure router interfaces for inter-VLAN routing',
    'Verify connectivity between VLANs using ping'
  ],
  prerequisites: [
    'Basic IP addressing and subnetting',
    'Understanding of VLANs and broadcast domains',
    'Basic switchport configuration'
  ],
  concepts: [
    'Inter-VLAN routing',
    'Router-on-a-stick concept (using multiple physical interfaces)',
    'VLAN assignment on access ports',
    'IP routing between subnets',
    'Ping as a connectivity verification tool'
  ],
  skills: [
    'Create and name VLANs on a switch',
    'Assign access ports to VLANs',
    'Configure router interfaces with IP addresses',
    'Verify inter-VLAN connectivity',
    'Troubleshoot basic connectivity issues'
  ],
  commandsToLearn: [
    'vlan',
    'interface vlan',
    'switchport mode access',
    'switchport access vlan',
    'ip address',
    'no shutdown',
    'ping',
    'show ip route',
    'show vlan brief'
  ],
  topology: {
    devices: [
      { id: 'R1', type: 'router', name: 'R1', role: 'gateway', configuration: { hostname: 'R1' } },
      { id: 'SW1', type: 'switch', name: 'SW1', role: 'access-switch', configuration: { hostname: 'SW1' } },
      { id: 'PC1', type: 'pc', name: 'PC1', role: 'sales', configuration: { hostname: 'PC1' } },
      { id: 'PC2', type: 'pc', name: 'PC2', role: 'engineering', configuration: { hostname: 'PC2' } }
    ],
    interfaces: [
      { deviceId: 'R1', name: 'GigabitEthernet0/0', type: 'ethernet', role: 'vlan10', enabled: true },
      { deviceId: 'R1', name: 'GigabitEthernet0/1', type: 'ethernet', role: 'vlan20', enabled: true },
      { deviceId: 'SW1', name: 'FastEthernet0/1', type: 'ethernet', role: 'trunk', enabled: true },
      { deviceId: 'SW1', name: 'FastEthernet0/2', type: 'ethernet', role: 'access', enabled: true },
      { deviceId: 'SW1', name: 'FastEthernet0/3', type: 'ethernet', role: 'access', enabled: true },
      { deviceId: 'PC1', name: 'Ethernet0', type: 'ethernet', role: 'access', enabled: true },
      { deviceId: 'PC2', name: 'Ethernet0', type: 'ethernet', role: 'access', enabled: true }
    ],
    connections: [
      { from: 'R1:GigabitEthernet0/0', to: 'SW1:FastEthernet0/2', type: 'ethernet', status: 'connected' },
      { from: 'R1:GigabitEthernet0/1', to: 'SW1:FastEthernet0/3', type: 'ethernet', status: 'connected' },
      { from: 'SW1:FastEthernet0/1', to: 'SW1:FastEthernet0/2', type: 'ethernet', status: 'connected' }
    ]
  },
  ipAddressing: [
    { deviceId: 'R1', interface: 'GigabitEthernet0/0', ipAddress: '192.168.10.1', subnetMask: '255.255.255.0', gateway: '', vlan: 10, description: 'VLAN 10 interface' },
    { deviceId: 'R1', interface: 'GigabitEthernet0/1', ipAddress: '192.168.20.1', subnetMask: '255.255.255.0', gateway: '', vlan: 20, description: 'VLAN 20 interface' },
    { deviceId: 'PC1', interface: 'Ethernet0', ipAddress: '192.168.10.10', subnetMask: '255.255.255.0', gateway: '192.168.10.1', vlan: 10, description: 'Sales PC' },
    { deviceId: 'PC2', interface: 'Ethernet0', ipAddress: '192.168.20.10', subnetMask: '255.255.255.0', gateway: '192.168.20.1', vlan: 20, description: 'Engineering PC' }
  ],
  initialState: {
    devices: [
      { deviceId: 'R1', hostname: 'R1', interfaces: [{ interfaceName: 'GigabitEthernet0/0', ip: 'unassigned', status: 'down', protocol: 'down' }, { interfaceName: 'GigabitEthernet0/1', ip: 'unassigned', status: 'down', protocol: 'down' }] },
      { deviceId: 'SW1', hostname: 'SW1', interfaces: [{ interfaceName: 'FastEthernet0/1', ip: 'unassigned', status: 'down', protocol: 'down' }, { interfaceName: 'FastEthernet0/2', ip: 'unassigned', status: 'down', protocol: 'down' }, { interfaceName: 'FastEthernet0/3', ip: 'unassigned', status: 'down', protocol: 'down' }] },
      { deviceId: 'PC1', hostname: 'PC1', interfaces: [{ interfaceName: 'Ethernet0', ip: 'unassigned', status: 'up', protocol: 'up' }] },
      { deviceId: 'PC2', hostname: 'PC2', interfaces: [{ interfaceName: 'Ethernet0', ip: 'unassigned', status: 'up', protocol: 'up' }] }
    ]
  },
  steps: [
    {
      stepId: '229-S-01', order: 1, title: 'Inspect Current Network State',
      instruction: 'On R1, SW1, PC1, and PC2, examine the current configuration. Check interface status, VLAN configuration, and IP addresses. Document what is missing.',
      why: 'Understanding the current state helps identify what needs to be configured. You should see that interfaces are down, VLANs are not created, and IP addresses are not assigned.',
      targetDevice: 'R1', actionType: 'verification',
      commands: ['show ip interface brief', 'show vlan brief', 'show running-config'],
      expectedOutput: 'Interfaces down, no VLANs configured, no IP addresses assigned.',
      verification: { type: 'cli', expected: 'unassigned' },
      hints: ['Look for interfaces showing "down" or "administratively down"', 'Check if VLAN 10 and VLAN 20 exist'],
      commonMistakes: [{ mistake: 'Not documenting current state before configuring', solution: 'Always document baseline before making changes' }],
      completionCondition: 'Student has examined and documented current network state'
    },
    {
      stepId: '229-S-02', order: 2, title: 'Configure VLANs on the Switch',
      instruction: 'On SW1, create VLAN 10 named Sales and VLAN 20 named Engineering. Verify with show vlan brief.',
      why: 'VLANs must be created in the switch database before ports can be assigned to them. Each VLAN represents a separate broadcast domain.',
      targetDevice: 'SW1', actionType: 'configuration',
      commands: ['enable', 'configure terminal', 'vlan 10', 'name Sales', 'vlan 20', 'name Engineering', 'end', 'show vlan brief'],
      expectedOutput: 'VLAN 10 and VLAN 20 created.',
      verification: { type: 'cli', expected: 'VLAN 10' },
      hints: ['Create VLANs in global configuration mode', 'Verify with show vlan brief after creation'],
      commonMistakes: [{ mistake: 'Forgetting to create VLANs before assigning ports', solution: 'Create VLANs first, then assign ports' }],
      completionCondition: 'show vlan brief shows VLAN 10 and VLAN 20'
    },
    {
      stepId: '229-S-03', order: 3, title: 'Configure Access Ports for Each VLAN',
      instruction: 'On SW1, assign FastEthernet0/2 to VLAN 10 and FastEthernet0/3 to VLAN 20. Set both ports to access mode.',
      why: 'Access ports connect end devices to a specific VLAN. Each PC must be in the correct VLAN for its department.',
      targetDevice: 'SW1', actionType: 'configuration',
      commands: ['enable', 'configure terminal', 'interface FastEthernet0/2', 'switchport mode access', 'switchport access vlan 10', 'interface FastEthernet0/3', 'switchport mode access', 'switchport access vlan 20', 'end'],
      expectedOutput: 'Access ports assigned to VLANs.',
      verification: { type: 'cli', expected: 'switchport access vlan 10' },
      hints: ['Use switchport mode access for end-device ports', 'Verify VLAN assignment with show interfaces switchport'],
      commonMistakes: [{ mistake: 'Leaving ports in default VLAN 1', solution: 'Explicitly assign access ports to the correct VLAN' }],
      completionCondition: 'show interfaces switchport shows Fa0/2 in VLAN 10 and Fa0/3 in VLAN 20'
    },
    {
      stepId: '229-S-04', order: 4, title: 'Configure Router Interfaces for VLANs',
      instruction: 'On R1, configure GigabitEthernet0/0 with IP 192.168.10.1/24 and GigabitEthernet0/1 with IP 192.168.20.1/24. Bring both interfaces up with no shutdown.',
      why: 'The router needs an IP address in each VLAN subnet to act as the default gateway. Each interface represents a different VLAN network.',
      targetDevice: 'R1', actionType: 'configuration',
      commands: ['enable', 'configure terminal', 'interface GigabitEthernet0/0', 'ip address 192.168.10.1 255.255.255.0', 'no shutdown', 'interface GigabitEthernet0/1', 'ip address 192.168.20.1 255.255.255.0', 'no shutdown', 'end'],
      expectedOutput: 'Router interfaces configured with IP addresses.',
      verification: { type: 'state_check', expected: { deviceId: 'R1', interface: 'GigabitEthernet0/0', ip: '192.168.10.1', mask: '255.255.255.0' } },
      hints: ['Each router interface connects to a different VLAN', 'The router IP becomes the default gateway for that VLAN'],
      commonMistakes: [{ mistake: 'Using the same IP subnet on both router interfaces', solution: 'Each interface must be in a different subnet' }],
      completionCondition: 'show ip interface brief shows both interfaces up with correct IP addresses'
    },
    {
      stepId: '229-S-05', order: 5, title: 'Configure PC IP Addresses',
      instruction: 'On PC1, set IP address to 192.168.10.10 with mask 255.255.255.0 and gateway 192.168.10.1. On PC2, set IP address to 192.168.20.10 with mask 255.255.255.0 and gateway 192.168.20.1.',
      why: 'PCs need IP addresses in their respective VLAN subnets to communicate. The gateway is the router interface IP for that VLAN.',
      targetDevice: 'PC1', actionType: 'configuration',
      commands: ['ipconfig 192.168.10.10 255.255.255.0 192.168.10.1'],
      expectedOutput: 'PC1 IP address configured.',
      verification: { type: 'state_check', expected: { deviceId: 'PC1', interface: 'Ethernet0', ip: '192.168.10.10', mask: '255.255.255.0' } },
      hints: ['The gateway should be the router interface IP for that VLAN', 'Both PCs should use the same subnet mask'],
      commonMistakes: [{ mistake: 'Using wrong default gateway', solution: 'Gateway must be the router interface in the same subnet' }],
      completionCondition: 'Both PCs have correct IP addresses and gateways'
    },
    {
      stepId: '229-S-06', order: 6, title: 'Test Intra-VLAN Connectivity',
      instruction: 'From PC1, ping the router VLAN 10 interface at 192.168.10.1. From PC2, ping the router VLAN 20 interface at 192.168.20.1. Verify local connectivity.',
      why: 'Testing connectivity to the default gateway confirms that each PC can reach its local router interface. This is a prerequisite for inter-VLAN routing.',
      targetDevice: 'PC1', actionType: 'verification',
      commands: ['ping 192.168.10.1'],
      expectedOutput: 'Reply from 192.168.10.1',
      verification: { type: 'ping', expected: 'reachable' },
      hints: ['Ping the default gateway first', 'If ping fails, check IP address, subnet mask, and cable'],
      commonMistakes: [{ mistake: 'Pinging the wrong router interface', solution: 'Each PC should ping its own VLANs gateway' }],
      completionCondition: 'PC1 can ping 192.168.10.1 and PC2 can ping 192.168.20.1'
    },
    {
      stepId: '229-S-07', order: 7, title: 'Test Inter-VLAN Connectivity',
      instruction: 'From PC1, ping PC2 at 192.168.20.10. From PC2, ping PC1 at 192.168.10.10. Verify that traffic routes through the router.',
      why: 'Inter-VLAN ping confirms that the router is routing between VLANs. The router acts as the gateway for both networks.',
      targetDevice: 'PC1', actionType: 'verification',
      commands: ['ping 192.168.20.10'],
      expectedOutput: 'Reply from 192.168.20.10',
      verification: { type: 'ping', expected: 'reachable' },
      hints: ['The router must have interfaces in both VLANs', 'Each PC must use the correct gateway', 'The router must have routing enabled (it is by default)'],
      commonMistakes: [{ mistake: 'Using wrong gateway on PC', solution: 'Verify default gateway matches router interface in same subnet' }],
      completionCondition: 'PC1 can ping PC2 and PC2 can ping PC1 across VLANs'
    },
    {
      stepId: '229-S-08', order: 8, title: 'Verify Routing Table',
      instruction: 'On R1, run show ip route to verify that directly connected routes exist for both VLAN subnets.',
      why: 'The routing table should show directly connected routes for the subnets configured on the router interfaces. This confirms the router knows how to reach both networks.',
      targetDevice: 'R1', actionType: 'verification',
      commands: ['show ip route'],
      expectedOutput: 'C 192.168.10.0/24 is directly connected, C 192.168.20.0/24 is directly connected',
      verification: { type: 'cli', expected: '192.168.10.0' },
      hints: ['Look for "C" entries which indicate directly connected routes', 'Each interface subnet should appear as a connected route'],
      commonMistakes: [{ mistake: 'Misconfiguring router interface IP addresses', solution: 'Verify IP addresses are in the correct subnets' }],
      completionCondition: 'show ip route displays connected routes for both VLAN subnets'
    }
  ],
  troubleshooting: {
    commonErrors: [
      {
        error: 'Inter-VLAN ping fails',
        symptoms: 'PC1 cannot ping PC2 across VLANs',
        diagnosticCommands: ['show ip interface brief', 'show ip route', 'show vlan brief', 'ping 192.168.10.1', 'ping 192.168.20.1'],
        troubleshootingSteps: [
          '1. Verify router interfaces are up and have correct IPs',
          '2. Verify PC IP addresses and gateways are correct',
          '3. Verify switch ports are assigned to correct VLANs',
          '4. Verify VLANs exist on the switch',
          '5. Verify physical connections between router and switch'
        ],
        possibleCauses: [
          'Router interface down or no IP address',
          'Wrong default gateway on PC',
          'Switch port in wrong VLAN',
          'VLAN not created on switch',
          'Cable disconnected'
        ],
        fix: 'Correct router interface configuration, verify PC gateways, verify VLAN assignments, ensure physical connectivity',
        verificationAfterFix: 'Inter-VLAN ping succeeds from PC1 to PC2'
      },
      {
        error: 'PC cannot ping its own gateway',
        symptoms: 'PC1 cannot ping 192.168.10.1',
        diagnosticCommands: ['show ip interface brief', 'show interfaces FastEthernet0/2 switchport', 'ipconfig'],
        troubleshootingSteps: [
          '1. Verify router interface is up and has correct IP',
          '2. Verify switch port is in correct VLAN',
          '3. Verify PC has correct IP address and subnet mask',
          '4. Verify cable is connected'
        ],
        possibleCauses: [
          'Router interface down',
          'Wrong VLAN assignment on switch port',
          'PC has wrong IP address',
          'Physical layer issue'
        ],
        fix: 'Bring up router interface, correct VLAN assignment, configure correct PC IP, check cable',
        verificationAfterFix: 'PC can ping its default gateway'
      }
    ]
  },
  faultInjection: {
    faults: [
      { type: 'wrong_vlan', severity: 'medium', description: 'PC1 is assigned to VLAN 20 instead of VLAN 10' },
      { type: 'wrong_gateway', severity: 'medium', description: 'PC1 has the wrong default gateway IP address' }
    ]
  },
  finalVerification: {
    checks: [
      { type: 'vlan_exists', target: 'VLAN10', expected: true },
      { type: 'vlan_exists', target: 'VLAN20', expected: true },
      { type: 'ip_correct', target: 'R1:GigabitEthernet0/0', expected: '192.168.10.1' },
      { type: 'ip_correct', target: 'R1:GigabitEthernet0/1', expected: '192.168.20.1' },
      { type: 'ping_success', target: 'PC1:PC2', expected: true }
    ],
    successCriteria: 'Router has interfaces in both VLAN subnets. PCs are in correct VLANs with correct gateways. Inter-VLAN ping succeeds.',
    completionCriteria: 'Student has configured VLANs, assigned ports, configured router interfaces, and verified bidirectional inter-VLAN connectivity.'
  },
  knowledgeCheck: [
    {
      question: 'Why are VLANs necessary in a switched network?',
      type: 'multiple_choice',
      options: [
        'To make the network faster',
        'To create separate broadcast domains and improve security',
        'To assign IP addresses automatically',
        'To connect routers to switches'
      ],
      correctAnswer: 'To create separate broadcast domains and improve security',
      explanation: 'VLANs segment a physical network into multiple logical broadcast domains. This reduces broadcast traffic and improves security by isolating traffic between departments.'
    },
    {
      question: 'In an inter-VLAN routing design using multiple router interfaces, what role does the router play?',
      type: 'multiple_choice',
      options: [
        'It acts as a switch for VLAN traffic',
        'It acts as the default gateway for each VLAN and routes between subnets',
        'It assigns IP addresses to PCs',
        'It blocks traffic between VLANs'
      ],
      correctAnswer: 'It acts as the default gateway for each VLAN and routes between subnets',
      explanation: 'The router has an interface in each VLAN subnet. It routes traffic between these subnets, acting as the gateway for devices in each VLAN.'
    },
    {
      question: 'What must be true for a PC in VLAN 10 to ping a PC in VLAN 20?',
      type: 'multiple_choice',
      options: [
        'Both PCs must have the same IP address',
        'The router must have interfaces in both VLANs, and PCs must use the router as their default gateway',
        'The switch must have a trunk port to the router',
        'Both PCs must be connected to the same switch port'
      ],
      correctAnswer: 'The router must have interfaces in both VLANs, and PCs must use the router as their default gateway',
      explanation: 'Inter-VLAN communication requires a Layer 3 device (router) with interfaces in each VLAN. PCs send traffic to their default gateway (the router), which routes it to the destination VLAN.'
    }
  ],
  tags: ['routing', 'vlan', 'inter-vlan', 'router', 'intermediate']
});

// Replace labs in the array
function replaceLab(id, newLab) {
  const index = labs.findIndex(l => String(l.id) === String(id));
  if (index === -1) {
    console.log(`Lab ${id} not found, appending`);
    labs.push(newLab);
  } else {
    labs[index] = newLab;
  }
}

replaceLab('23', pilot23);
replaceLab('81', pilot81);
replaceLab('229', pilot229);

// Write back with nice formatting
fs.writeFileSync(labsFile, JSON.stringify(labs, null, 2) + '\n');
console.log('Successfully remediated labs 23, 81, 229');
console.log('Total labs:', labs.length);
