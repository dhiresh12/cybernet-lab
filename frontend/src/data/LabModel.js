/**
 * Canonical Lab Model - CyberNet Lab
 * 
 * Defines the standardized structure for all labs in CyberNet Lab.
 * This model ensures consistency, extensibility, and compatibility 
 * with existing labs through normalization.
 */

// Canonical Lab Schema Definition
export const LabModel = {
  /**
   * LAB IDENTITY
   */
  id: {
    type: 'string',
    required: true,
    description: 'Unique identifier for the lab'
  },
  title: {
    type: 'string',
    required: true,
    description: 'Human-readable lab title'
  },
  slug: {
    type: 'string',
    required: true,
    description: 'URL-friendly version of title'
  },
  category: {
    type: 'string',
    required: true,
    description: 'Lab category (ICMP, VLAN, OSPF, etc.)'
  },
  difficulty: {
    type: 'string',
    required: true,
    enum: ['basic', 'intermediate', 'advanced', 'expert'],
    description: 'Lab difficulty level'
  },
  progressiveLevel: {
    type: 'string',
    required: false,
    enum: ['skill-lab', 'combination-lab', 'engineering-lab', 'failure-lab', 'integrated-lab', 'innovation-lab'],
    description: 'Progressive experiment model level'
  },
  estimatedTime: {
    type: 'string',
    required: true,
    description: 'Estimated completion time (e.g., "15 minutes")'
  },
  version: {
    type: 'number',
    default: 1,
    description: 'Lab version for updates'
  },

  /**
   * REAL-WORLD CONTEXT
   */
  realWorldScenario: {
    type: 'string',
    required: true,
    description: 'Real-world networking scenario this lab addresses'
  },
  engineerRole: {
    type: 'string',
    required: true,
    description: 'Target engineering role (e.g., Junior Network Engineer)'
  },
  companyScenario: {
    type: 'string',
    required: true,
    description: 'Specific company/industry scenario (lab-specific, not generic)'
  },
  problemStatement: {
    type: 'string',
    required: true,
    description: 'Specific problem the lab solves'
  },
  businessProblem: {
    type: 'string',
    required: true,
    description: 'Business problem being addressed'
  },
  mission: {
    type: 'string',
    required: true,
    description: 'Lab mission statement'
  },
  businessImpact: {
    type: 'string',
    required: true,
    description: 'Business impact of the problem/solution'
  },
  objectives: {
    type: 'string',
    required: true,
    description: 'Learning objectives'
  },

  /**
   * LEARNING
   */
  learningObjectives: {
    type: 'array',
    items: { type: 'string' },
    description: 'Specific learning objectives'
  },
  prerequisites: {
    type: 'array',
    items: { type: 'string' },
    description: 'Prerequisite knowledge or labs'
  },
  concepts: {
    type: 'array',
    items: { type: 'string' },
    description: 'Networking concepts covered'
  },
  skills: {
    type: 'array',
    items: { type: 'string' },
    description: 'Practical skills gained'
  },
  commandsToLearn: {
    type: 'array',
    items: { type: 'string' },
    description: 'Commands introduced in this lab'
  },
  conceptLearned: {
    type: 'string',
    description: 'Primary concept learned in this lab'
  },
  realWorldUse: {
    type: 'string',
    description: 'Real-world application of this lab'
  },
  interviewQuestions: {
    type: 'array',
    items: { type: 'string' },
    description: 'Interview questions related to this lab'
  },
  challenge: {
    type: 'string',
    description: 'Challenge task for the learner'
  },
  debrief: {
    type: 'string',
    description: 'Debrief summary after lab completion'
  },
  nextRecommendedLab: {
    type: 'string',
    description: 'Next recommended lab ID'
  },
  retrievalSchedule: {
    type: 'object',
    description: 'Spaced repetition retrieval schedule',
    properties: {
      firstReview: { type: 'string', description: 'First review interval (e.g., "1 day")' },
      secondReview: { type: 'string', description: 'Second review interval' },
      thirdReview: { type: 'string', description: 'Third review interval' },
      finalReview: { type: 'string', description: 'Final review interval' }
    }
  },
  progressiveHints: {
    type: 'object',
    description: 'Progressive hints HINT0-HINT5',
    properties: {
      HINT0: { type: 'string' },
      HINT1: { type: 'string' },
      HINT2: { type: 'string' },
      HINT3: { type: 'string' },
      HINT4: { type: 'string' },
      HINT5: { type: 'string' }
    }
  },
  failureTutorial: {
    type: 'object',
    description: 'Tutorial for practicing failures safely',
    properties: {
      available: { type: 'boolean' },
      description: { type: 'string' },
      safety: { type: 'string' }
    }
  },
  beginnerTutorial: {
    type: 'object',
    description: 'Beginner-friendly tutorial',
    properties: {
      steps: { type: 'array', items: { type: 'string' } },
      notes: { type: 'array', items: { type: 'string' } }
    }
  },

  /**
   * TOPOLOGY
   */
  topology: {
    type: 'object',
    required: true,
    description: 'Network topology definition with lab-specific details',
    properties: {
      devices: {
        type: 'array',
        items: {
          type: 'object',
          required: ['id', 'type', 'name'],
          properties: {
            id: { type: 'string', required: true },
            type: { type: 'string', enum: ['router', 'switch', 'pc', 'laptop', 'server', 'firewall', 'accessPoint', 'cloud', 'dns', 'dhcp'], required: true },
            name: { type: 'string', required: true },
            role: { type: 'string', description: 'Role in topology (e.g., core, distribution, access)' },
            purpose: { type: 'string', description: 'Lab-specific purpose of this device' },
            configuration: { type: 'object', description: 'Initial device configuration' }
          }
        }
      },
      interfaces: {
        type: 'array',
        items: {
          type: 'object',
          required: ['deviceId', 'name'],
          properties: {
            deviceId: { type: 'string', required: true },
            name: { type: 'string', required: true },
            type: { type: 'string', enum: ['ethernet', 'serial', 'wifi', 'loopback', 'vlan'], default: 'ethernet' },
            role: { type: 'string', description: 'Role (uplink, access, trunk, etc.)' },
            vlan: { type: ['string', 'number'], description: 'VLAN ID if applicable' },
            subnet: { type: 'string', description: 'Subnet for this interface' },
            gateway: { type: 'string', description: 'Gateway for this interface' },
            enabled: { type: 'boolean', default: false }
          }
        }
      },
      connections: {
        type: 'array',
        items: {
          type: 'object',
          required: ['from', 'to'],
          properties: {
            from: { type: 'string', required: true, description: 'Device:Interface (e.g., R1:G0/0)' },
            to: { type: 'string', required: true, description: 'Device:Interface' },
            type: { type: 'string', enum: ['ethernet', 'console', 'fiber', 'serial'], default: 'ethernet' },
            status: { type: 'string', enum: ['connected', 'disconnected', 'shutdown'], default: 'disconnected' },
            purpose: { type: 'string', description: 'Purpose of this link' },
            vlan: { type: ['string', 'number'], description: 'VLAN carried on this link' },
            trafficDirection: { type: 'string', description: 'Direction of traffic flow' },
            securityBoundary: { type: 'string', description: 'Security boundary for this link' },
            routingRelationship: { type: 'string', description: 'Routing relationship between connected devices' }
          }
        }
      },
      whyThisTopology: {
        type: 'string',
        description: 'Explanation of why this specific topology was chosen'
      }
    }
  },

  /**
   * ADDRESSING
   */
  ipPlan: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        deviceId: { type: 'string' },
        interface: { type: 'string' },
        ipAddress: { type: 'string' },
        subnetMask: { type: 'string' },
        gateway: { type: 'string' },
        vlan: { type: ['string', 'number'] },
        subnet: { type: 'string', description: 'Subnet description' },
        description: { type: 'string' }
      }
    }
  },

  /**
   * INITIAL STATE
   */
  initialState: {
    type: 'object',
    description: 'Network state before lab begins',
    properties: {
      devices: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            deviceId: { type: 'string' },
            hostname: { type: 'string' },
            interfaces: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  interfaceName: { type: 'string' },
                  ip: { type: 'string' },
                  status: { type: 'string', enum: ['up', 'down', 'administratively down'] },
                  protocol: { type: 'string', enum: ['up', 'down'] },
                  description: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  },
  expectedStartingState: {
    type: 'object',
    description: 'Expected network state at the start of the lab'
  },

  /**
   * STEPS
   */
  steps: {
    type: 'array',
    required: true,
    description: 'Lab execution steps - each step must answer ACTION + WHY + EXPECTED RESULT + VERIFY',
    items: {
      type: 'object',
      required: ['stepId', 'title', 'instruction', 'commands', 'verification', 'action', 'why', 'expectedResult', 'verify'],
      properties: {
        stepId: { type: 'string', required: true, description: 'Unique step identifier' },
        title: { type: 'string', required: true },
        order: { type: 'number', description: 'Sequential order' },
        instruction: { type: 'string', required: true, description: 'What the student should do' },
        action: { type: 'string', required: true, description: 'Specific action to perform' },
        why: { type: 'string', required: true, description: 'Why this step is needed' },
        expectedResult: { type: 'string', required: true, description: 'What the student should see' },
        verify: { type: 'string', required: true, description: 'How to verify the result' },
        targetDevice: { type: 'string', description: 'Primary device for this step' },
        actionType: { type: 'string', description: 'Type of action (configuration, verification, troubleshooting)' },
        commands: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              raw: { type: 'string', required: true },
              whatItDoes: { type: 'string', required: true },
              whyWeNeedIt: { type: 'string', required: true },
              expectedState: { type: 'string', required: true },
              verifyCommand: { type: 'string', required: true },
              expectedOutput: { type: 'string', required: true },
              commonMistake: { type: 'string' }
            }
          },
          required: true,
          description: 'Exact commands to execute with detailed explanations'
        },
        verification: {
          type: 'object',
          required: true,
          description: 'How to verify step completion',
          properties: {
            type: {
              type: 'string',
              required: true,
              enum: ['cli', 'config', 'topology', 'typing', 'option', 'ping', 'traceroute', 'state_check'],
              description: 'Verification method'
            },
            expected: {
              type: ['string', 'number', 'boolean', 'object'],
              description: 'Expected value for verification'
            },
            condition: {
              type: 'string',
              description: 'Additional verification condition (JS expression)'
            }
          }
        },
        hints: {
          type: 'array',
          items: { type: 'string' },
          description: 'Progressive hints for the step'
        },
        progressiveHints: {
          type: 'object',
          description: 'Progressive hints HINT0-HINT5',
          properties: {
            HINT0: { type: 'string' },
            HINT1: { type: 'string' },
            HINT2: { type: 'string' },
            HINT3: { type: 'string' },
            HINT4: { type: 'string' },
            HINT5: { type: 'string' }
          }
        },
        commonMistakes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              mistake: { type: 'string' },
              solution: { type: 'string' }
            }
          }
        },
        completionCondition: {
          type: 'string',
          description: 'Custom completion condition'
        },
        optionalConcept: {
          type: 'string',
          description: 'Optional deeper concept'
        }
      }
    }
  },

  /**
   * TROUBLESHOOTING
   */
  troubleshooting: {
    type: 'object',
    description: 'Troubleshooting guidance with decision tree',
    properties: {
      commonErrors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            symptoms: { type: 'string' },
            diagnosticCommands: { type: 'array', items: { type: 'string' } },
            troubleshootingSteps: { type: 'array', items: { type: 'string' } },
            possibleCauses: { type: 'array', items: { type: 'string' } },
            fix: { type: 'string' },
            verificationAfterFix: { type: 'string' }
          }
        }
      },
      decisionTree: {
        type: 'object',
        description: 'Decision tree for systematic troubleshooting',
        properties: {
          root: {
            type: 'object',
            properties: {
              question: { type: 'string' },
              yes: { type: 'object' },
              no: { type: 'object' }
            }
          }
        }
      }
    }
  },

  /**
   * FAULT INJECTION (Future)
   */
  faultInjection: {
    type: 'object',
    description: 'Intentional faults for troubleshooting labs',
    properties: {
      faults: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { 
              type: 'string', 
              enum: ['wrong_ip', 'wrong_mask', 'shutdown_interface', 'wrong_vlan', 'wrong_trunk', 'missing_route', 'wrong_gateway', 'acl_block'] 
            },
            severity: { type: 'string', enum: ['low', 'medium', 'high'] },
            description: { type: 'string' }
          }
        }
      }
    }
  },

  /**
   * FINAL VERIFICATION
   */
  finalVerification: {
    type: 'object',
    description: 'Final lab completion verification',
    properties: {
      checks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['interface_up', 'ip_correct', 'vlan_exists', 'route_exists', 'ping_success'] },
            target: { type: 'string' },
            expected: { type: ['string', 'number', 'boolean'] }
          }
        }
      },
      successCriteria: { type: 'string' },
      completionCriteria: { type: 'string' }
    }
  },

  /**
   * KNOWLEDGE CHECK
   */
  knowledgeCheck: {
    type: 'array',
    items: {
      type: 'object',
      required: ['question', 'type', 'correctAnswer'],
      properties: {
        question: { type: 'string', required: true },
        type: { type: 'string', enum: ['multiple_choice', 'true_false', 'fill_in_blank'], required: true },
        options: { type: 'array', items: { type: 'string' } },
        correctAnswer: { type: ['string', 'number', 'boolean'], required: true },
        explanation: { type: 'string' }
      }
    }
  },
  /**
   * STANDARD BEGINNER LAB GUIDE
   * Every lab exposes the same 20-section learning structure.
   */
  labGuide: {
    type: 'object',
    required: true,
    description: 'Beginner-friendly, consistent lab teaching structure',
    properties: {
      objective: { type: 'object' },
      whatYouLearn: { type: 'array' },
      difficulty: { type: 'object' },
      requiredDevices: { type: 'array' },
      topology: { type: 'object' },
      addressingPlan: { type: 'object' },
      physicalConnection: { type: 'object' },
      configuration: { type: 'array' },
      conceptExplanation: { type: 'object' },
      verification: { type: 'object' },
      possibleErrors: { type: 'array' },
      troubleshootingMethod: { type: 'array' },
      errorCauseFixTable: { type: 'array' },
      failurePractice: { type: 'object' },
      finalVerificationChecklist: { type: 'array' },
      successCondition: { type: 'object' },
      realWorldConnection: { type: 'string' },
      beginnerNotes: { type: 'array' },
      miniPracticeTask: { type: 'string' },
      commandsValuesUsed: { type: 'array' }
    }
  },

  /**
   * METADATA
   */
  legacy: {
    type: 'boolean',
    description: 'Marks if this lab was converted from legacy format'
  },
  tags: {
    type: 'array',
    items: { type: 'string' },
    description: 'Additional tags for search/filtering'
  },
  source: {
    type: 'string',
    enum: ['procedural', 'reference', 'category', 'custom'],
    description: 'Authoritative source of the lab record'
  },
  qualityStatus: {
    type: 'string',
    enum: ['draft', 'review', 'published', 'quarantined'],
    description: 'Whether the lab is safe to show in the learner catalog'
  },
  backendProfile: {
    type: 'object',
    description: 'Truthful capability and fidelity contract for the lab backend'
  },
  capabilitySummary: {
    type: 'object',
    description: 'Quick catalog metadata for UI filters and learner expectations'
  },
  studyStrategy: {
    type: 'object',
    description: 'Per-lab Chinese/Japanese study strategy metadata'
  }
};

// Validation function for lab objects
export function validateLab(lab) {
  const errors = [];
  
  // Required top-level fields
  const requiredFields = ['id', 'title', 'slug', 'category', 'difficulty', 'estimatedTime', 'topology', 'steps', 'mission', 'companyScenario', 'businessProblem'];
  for (const field of requiredFields) {
    if (!(field in lab) || !lab[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  // Validate steps if present
  if (lab.steps) {
    for (let i = 0; i < lab.steps.length; i++) {
      const step = lab.steps[i];
      const stepErrors = validateStep(step, i);
      errors.push(...stepErrors);
    }
  }
  
  // Validate topology
  if (lab.topology) {
    if (!lab.topology.devices || lab.topology.devices.length === 0) {
      errors.push('Topology must have at least one device');
    }
    if (!lab.topology.connections || lab.topology.connections.length === 0) {
      errors.push('Topology must have at least one connection');
    }
  }
  
  return errors;
}

// Validate a single step
function validateStep(step, index) {
  const errors = [];
  const requiredStepFields = ['stepId', 'title', 'instruction', 'commands', 'verification', 'action', 'why', 'expectedResult', 'verify'];
  
  for (const field of requiredStepFields) {
    if (!(field in step) || !step[field]) {
      errors.push(`Step ${index}: Missing required field '${field}'`);
    }
  }
  
  // Validate verification if present
  if (step.verification) {
    if (!step.verification.type) {
      errors.push(`Step ${index}: Verification missing 'type'`);
    }
  }
  
  // Validate commands structure
  if (step.commands && Array.isArray(step.commands)) {
    step.commands.forEach((cmd, cmdIndex) => {
      if (typeof cmd === 'string') {
        // Legacy format - string commands are acceptable
        return;
      }
      if (cmd && typeof cmd === 'object') {
        if (!cmd.raw) errors.push(`Step ${index}, Command ${cmdIndex}: Missing 'raw'`);
        if (!cmd.whatItDoes) errors.push(`Step ${index}, Command ${cmdIndex}: Missing 'whatItDoes'`);
        if (!cmd.whyWeNeedIt) errors.push(`Step ${index}, Command ${cmdIndex}: Missing 'whyWeNeedIt'`);
        if (!cmd.expectedState) errors.push(`Step ${index}, Command ${cmdIndex}: Missing 'expectedState'`);
        if (!cmd.verifyCommand) errors.push(`Step ${index}, Command ${cmdIndex}: Missing 'verifyCommand'`);
        if (!cmd.expectedOutput) errors.push(`Step ${index}, Command ${cmdIndex}: Missing 'expectedOutput'`);
      }
    });
  }
  
  return errors;
}

// Default lab object template
export const DEFAULT_LAB = {
  id: '',
  title: '',
  slug: '',
  category: '',
  difficulty: 'basic',
  progressiveLevel: 'skill-lab',
  estimatedTime: '15 minutes',
  version: 1,
  realWorldScenario: '',
  engineerRole: 'Junior Network Engineer',
  companyScenario: '',
  problemStatement: '',
  businessProblem: '',
  mission: '',
  businessImpact: '',
  objectives: '',
  learningObjectives: [],
  prerequisites: [],
  concepts: [],
  skills: [],
  commandsToLearn: [],
  conceptLearned: '',
  realWorldUse: '',
  interviewQuestions: [],
  challenge: '',
  debrief: '',
  nextRecommendedLab: '',
  retrievalSchedule: {
    firstReview: '1 day',
    secondReview: '3 days',
    thirdReview: '1 week',
    finalReview: '1 month'
  },
  progressiveHints: {
    HINT0: 'Read the objective and addressing plan carefully.',
    HINT1: 'Check the topology diagram for device relationships.',
    HINT2: 'Verify interface status before configuring.',
    HINT3: 'Use show commands to confirm configuration.',
    HINT4: 'Compare your config with the expected state.',
    HINT5: 'Review the troubleshooting section for common errors.'
  },
  failureTutorial: {
    available: false,
    description: 'Not applicable in this lab',
    safety: 'Only use reversible, lab-scoped changes. Reset the lab if the state becomes unclear.'
  },
  beginnerTutorial: {
    steps: ['Read the lab objective and topology diagram', 'Identify the devices and their roles', 'Configure interfaces step by step', 'Verify each step before proceeding'],
    notes: ['Follow one step at a time', 'Verify before moving to the next step', 'Use the hints if you get stuck']
  },
  topology: {
    devices: [],
    interfaces: [],
    connections: [],
    whyThisTopology: ''
  },
  ipPlan: [],
  initialState: { devices: [] },
  expectedStartingState: {},
  steps: [],
  troubleshooting: { commonErrors: [], decisionTree: {} },
  faultInjection: { faults: [] },
  finalVerification: { checks: [], successCriteria: '', completionCriteria: '' },
  knowledgeCheck: [],
  labGuide: null,
  legacy: false,
  tags: [],
  source: 'custom',
  qualityStatus: 'review',
  backendProfile: {
    type: 'browser-simulation',
    fidelity: 'concept',
    requiredCapabilities: [],
    supportedCommands: [],
    unsupportedCommands: [],
    resourceRequirements: { cpuMb: 0, memoryMb: 0, requiresImage: false },
    limitations: [
      'This lab uses the CyberNet browser simulation and is not a physical Cisco IOS device.'
    ]
  },
  capabilitySummary: {
    topology: false,
    requiredDevices: false,
    verification: false,
    troubleshooting: false,
    questions: false
  }
};

export default LabModel;