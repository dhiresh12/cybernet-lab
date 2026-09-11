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
  problemStatement: {
    type: 'string',
    required: true,
    description: 'Specific problem the lab solves'
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

  /**
   * TOPOLOGY
   */
  topology: {
    type: 'object',
    required: true,
    description: 'Network topology definition',
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
            status: { type: 'string', enum: ['connected', 'disconnected', 'shutdown'], default: 'disconnected' }
          }
        }
      }
    }
  },

  /**
   * ADDRESSING
   */
  ipAddressing: {
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

  /**
   * STEPS
   */
  steps: {
    type: 'array',
    required: true,
    description: 'Lab execution steps',
    items: {
      type: 'object',
      required: ['stepId', 'title', 'instruction', 'commands', 'verification'],
      properties: {
        stepId: { type: 'string', required: true, description: 'Unique step identifier' },
        title: { type: 'string', required: true },
        order: { type: 'number', description: 'Sequential order' },
        instruction: { type: 'string', required: true, description: 'What the student should do' },
        why: { type: 'string', description: 'Explanation of why this step is needed' },
        targetDevice: { type: 'string', description: 'Primary device for this step' },
        actionType: { type: 'string', description: 'Type of action (configuration, verification, troubleshooting)' },
        commands: {
          type: 'array',
          items: { type: 'string' },
          required: true,
          description: 'Exact commands to execute'
        },
        expectedOutput: {
          type: 'string',
          description: 'Expected output from commands'
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
    description: 'Troubleshooting guidance',
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
  }
};

// Validation function for lab objects
export function validateLab(lab) {
  const errors = [];
  
  // Required top-level fields
  const requiredFields = ['id', 'title', 'slug', 'category', 'difficulty', 'estimatedTime', 'topology', 'steps'];
  for (const field of requiredFields) {
    if (!(field in lab)) {
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
  
  return errors;
}

// Validate a single step
function validateStep(step, index) {
  const errors = [];
  const requiredStepFields = ['stepId', 'title', 'instruction', 'commands', 'verification'];
  
  for (const field of requiredStepFields) {
    if (!(field in step)) {
      errors.push(`Step ${index}: Missing required field '${field}'`);
    }
  }
  
  // Validate verification if present
  if (step.verification) {
    if (!step.verification.type) {
      errors.push(`Step ${index}: Verification missing 'type'`);
    }
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
  estimatedTime: '15 minutes',
  version: 1,
  realWorldScenario: '',
  engineerRole: 'Junior Network Engineer',
  problemStatement: '',
  businessImpact: '',
  objectives: '',
  learningObjectives: [],
  prerequisites: [],
  concepts: [],
  skills: [],
  commandsToLearn: [],
  topology: {
    devices: [],
    interfaces: [],
    connections: []
  },
  ipAddressing: [],
  initialState: { devices: [] },
  steps: [],
  troubleshooting: { commonErrors: [] },
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
    resourceRequirements: { cpuMb: 0, memoryMb: 0, requiresImage: false }
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