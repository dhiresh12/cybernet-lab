/**
 * Lab Normalizer - CyberNet Lab
 * 
 * Converts legacy lab formats to the canonical lab model.
 * Ensures all labs, regardless of format, produce consistent output.
 * 
 * Architecture:
 *   Legacy Lab JSON → Lab Normalizer → Content Enricher → Canonical Lab Model → Lab Engine → UI
 */

import { DEFAULT_LAB } from './LabModel.js';
import { enrichLabContent, buildBackendProfile, buildCapabilitySummary } from './labContentEnricher.js';

/**
 * Normalize a single lab to canonical format
 * @param {Object} lab - Raw lab data (legacy or canonical)
 * @returns {Object} - Normalized lab in canonical format
 */
export function normalizeLab(lab) {
  if (!lab || typeof lab !== 'object') {
    console.warn('[LabNormalizer] Invalid lab data, skipping:', lab);
    return null;
  }

  // Detect legacy format
  const isLegacy = !lab.slug || !lab.version;
  
  if (isLegacy) {
    return normalizeLegacyLab(lab);
  }

  // Already in canonical format, just validate and fill defaults
  return normalizeCanonicalLab(lab);
}

/**
 * Normalize a legacy lab format to canonical model
 * @param {Object} lab - Legacy lab data
 * @returns {Object} - Normalized lab
 */
function normalizeLegacyLab(lab) {
  // Build normalized lab from defaults
  const normalized = { ...DEFAULT_LAB };

  // Lab Identity
  normalized.id = lab.id || generateId();
  normalized.title = lab.title || 'Untitled Lab';
  normalized.slug = lab.slug || slugify(lab.title || 'untitled-lab');
  normalized.category = lab.category || 'General';
  normalized.difficulty = lab.level === 'intermediate' ? 'intermediate' : 
                          lab.level === 'advanced' ? 'advanced' : 
                          lab.level === 'expert' ? 'expert' : 'basic';
  normalized.level = normalized.difficulty;
  normalized.estimatedTime = lab.time || '15 minutes';
  normalized.version = 1;
  normalized.legacy = true;
  normalized.source = lab.source || 'procedural';
  normalized.qualityStatus = lab.qualityStatus || 'published';

  // Real-World Context
  normalized.realWorldScenario = lab.scenario || lab.realWorldScenario || '';
  normalized.engineerRole = lab.engineerRole || 'Junior Network Engineer';
  normalized.problemStatement = lab.problemStatement || extractProblemFromScenario(lab.scenario);
  normalized.businessImpact = lab.businessImpact || '';
  normalized.objectives = lab.objectives || '';

  // Learning
  normalized.learningObjectives = lab.learningObjectives || [lab.objectives].filter(Boolean);
  normalized.prerequisites = lab.prerequisites || [];
  normalized.concepts = lab.concepts || [];
  normalized.skills = lab.skills || [];
  normalized.commandsToLearn = extractCommandsFromSteps(lab.steps);

  // Topology - infer from existing data or use empty
  normalized.topology = normalizeTopology({
    topology: lab.topology,
    devices: lab.devices,
    connections: lab.connections,
    ipTable: lab.ipTable
  });

  // Addressing
  normalized.ipAddressing = normalizeAddressing(lab.ipTable, lab.ipAddressing);

  // Initial State
  normalized.initialState = normalizeInitialState(lab.initialState, lab.devices, lab.ipTable);

  // Steps
  normalized.steps = normalizeSteps(lab.steps, lab.id);

  // Troubleshooting
  normalized.troubleshooting = normalizeTroubleshooting(lab.errors || lab.commonErrors, normalized.steps);

  // Fault Injection
  normalized.faultInjection = { faults: [] };

  // Final Verification
  normalized.finalVerification = normalizeFinalVerification(lab.steps);
  normalized.backendProfile = buildBackendProfile(normalized);

  // Knowledge Check
  normalized.knowledgeCheck = normalizeKnowledgeCheck(lab.questions);
  normalized.knowledgeCheck = ensureLabQuestions(normalized);
  
  // Enrich with content enricher
  const enriched = enrichLabContent(normalized);
  if (enriched) {
    Object.assign(normalized, enriched);
  }
  
  normalized.labGuide = buildLabGuide(normalized);
  normalized.backendProfile = buildBackendProfile(normalized);
  normalized.capabilitySummary = buildCapabilitySummary(normalized);

  // Tags
  normalized.tags = [lab.category, lab.level].filter(Boolean);

  // Study Strategy (from manifest enrichment)
  if (lab.studyStrategy) {
    normalized.studyStrategy = lab.studyStrategy;
  }

  return normalized;
}

/**
 * Normalize a lab already in canonical format
 * @param {Object} lab - Canonical lab data
 * @returns {Object} - Validated and defaulted lab
 */
function normalizeCanonicalLab(lab) {
  const normalized = { ...DEFAULT_LAB, ...lab };

  // Ensure required fields exist
  normalized.id = lab.id || generateId();
  normalized.title = lab.title || 'Untitled Lab';
  normalized.slug = lab.slug || slugify(lab.title);
  normalized.category = lab.category || 'General';
  normalized.difficulty = lab.difficulty || 'basic';
  normalized.level = lab.level || normalized.difficulty;
  normalized.legacy = false;
  normalized.source = lab.source || 'reference';
  normalized.qualityStatus = lab.qualityStatus || 'published';

  // Normalize topology
  if (lab.topology) {
    normalized.topology = normalizeTopology(lab.topology);
  }

  // Normalize steps
  if (lab.steps) {
    normalized.steps = normalizeSteps(lab.steps, lab.id);
  }

  // Normalize troubleshooting
  if (!lab.troubleshooting) {
    normalized.troubleshooting = normalizeTroubleshooting(lab.errors || lab.commonErrors, normalized.steps);
  }

  // Normalize knowledge check
  if (lab.questions && !lab.knowledgeCheck) {
    normalized.knowledgeCheck = normalizeKnowledgeCheck(lab.questions);
  }
  normalized.knowledgeCheck = ensureLabQuestions(normalized);
  
  // Enrich with content enricher
  const enriched = enrichLabContent(normalized);
  if (enriched) {
    Object.assign(normalized, enriched);
  }
  
  normalized.labGuide = buildLabGuide(normalized);
  normalized.backendProfile = buildBackendProfile(normalized);
  normalized.capabilitySummary = buildCapabilitySummary(normalized);

  return normalized;
}

/**
 * Normalize topology data
 */
function normalizeTopology(topology) {
  if (!topology) {
    return {
      devices: [],
      interfaces: [],
      connections: []
    };
  }

  // Already in canonical format
  if (topology.devices !== undefined && Array.isArray(topology.devices) && topology.devices.every(device => typeof device === 'object')) {
    return topology;
  }

  // Legacy format - try to extract
  const devices = [];
  const interfaces = [];
  const connections = [];

  const rawDevices = topology.devices || [];
  if (Array.isArray(rawDevices)) {
    rawDevices.forEach(device => {
      const id = typeof device === 'string' ? device : (device.id || device.deviceId || device.name);
      if (id) {
        devices.push({
          ...(typeof device === 'object' ? device : {}),
          id,
          name: typeof device === 'string' ? device : (device.name || id),
          type: typeof device === 'object' && device.type ? device.type : inferDeviceType(id)
        });
      }
    });
  }

  // Add devices and interfaces from legacy addressing data.
  if (Array.isArray(topology.ipTable)) {
    const deviceIds = new Set();
    topology.ipTable.forEach(row => {
      if (row.device && !deviceIds.has(row.device)) {
        deviceIds.add(row.device);
        if (!devices.some(device => device.id === row.device)) {
          devices.push({ id: row.device, name: row.device, type: inferDeviceType(row.device) });
        }
      }
      if (row.device && row.interface) {
        interfaces.push({
          deviceId: row.device,
          name: row.interface,
          type: 'ethernet'
        });
      }
    });
  }

  const rawConnections = topology.connections || [];
  if (Array.isArray(rawConnections)) {
    rawConnections.forEach(connection => {
      const value = typeof connection === 'string' ? connection : `${connection.from || ''} -> ${connection.to || ''}`;
      const [from, to] = value.split(/\s*->\s*/);
      if (from && to) connections.push({ from: from.trim(), to: to.trim(), type: 'ethernet', status: 'connected' });
    });
  }

  return { devices, interfaces, connections };
}

/**
 * Normalize IP addressing data
 */
function normalizeAddressing(ipTable, ipAddressing) {
  if (ipAddressing) return ipAddressing;
  
  if (!ipTable || !Array.isArray(ipTable)) {
    return [];
  }

  return ipTable.map(row => ({
    deviceId: row.device || '',
    interface: row.interface || '',
    ipAddress: row.ip || '',
    subnetMask: row.mask || '255.255.255.0',
    gateway: row.gateway || '',
    vlan: row.vlan || '',
    description: row.description || ''
  }));
}

/**
 * Normalize initial state
 */
function normalizeInitialState(initialState, rawDevices = [], ipTable = []) {
  if (initialState) {
    return Array.isArray(initialState) ? { devices: initialState } : initialState;
  }

  const deviceIds = new Set(
    (Array.isArray(rawDevices) ? rawDevices : [])
      .map(device => typeof device === 'string' ? device : (device.id || device.deviceId || device.name))
      .filter(Boolean)
  );
  (Array.isArray(ipTable) ? ipTable : []).forEach(row => {
    if (row.device) deviceIds.add(row.device);
  });

  const devices = [...deviceIds].map(deviceId => {
    const interfaces = (Array.isArray(ipTable) ? ipTable : [])
      .filter(row => row.device === deviceId && row.interface)
      .map(row => ({
        interfaceName: row.interface,
        ip: row.ip || 'unassigned',
        mask: row.mask || '255.255.255.0',
        status: 'down',
        protocol: 'down',
        description: row.description || ''
      }));
    return { deviceId, hostname: deviceId, interfaces };
  });

  return { devices };
}

/**
 * Normalize steps array
 */
function normalizeSteps(steps, labId) {
  if (!steps || !Array.isArray(steps)) {
    return [];
  }

  const seenLegacySteps = new Set();
  return steps.map((step, index) => {
    const isLegacyStep = !step.stepId;
    if (isLegacyStep) {
      const fingerprint = JSON.stringify({
        title: step.title || '',
        instruction: step.instruction || step.description || '',
        commands: step.commands || [],
        verification: step.verification || null
      });
      if (seenLegacySteps.has(fingerprint)) return null;
      seenLegacySteps.add(fingerprint);
    }

    // Already normalized
    if (step.stepId) {
      return normalizeStep(step);
    }

    // Legacy format - convert
    return addStepGuidance({
      stepId: `${labId}-S-${String(index + 1).padStart(2, '0')}`,
      title: step.title || `Step ${index + 1}`,
      order: index + 1,
      instruction: step.instruction || step.description || '',
      why: step.why || '',
      targetDevice: step.device || '',
      actionType: inferActionType(step.commands),
      commands: step.commands || [],
      expectedOutput: step.expectedOutput || '',
      verification: normalizeVerification(step.verification),
      hints: step.hints || [],
      commonMistakes: normalizeCommonMistakes(step.commonErrors),
      completionCondition: step.completionCondition || '',
      optionalConcept: step.optionalConcept || ''
    }, step);
  }).filter(Boolean);
}

/**
 * Normalize a single step
 */
function normalizeStep(step) {
  return addStepGuidance({
    stepId: step.stepId || generateStepId(step.order || 1),
    title: step.title || 'Untitled Step',
    order: step.order || 1,
    instruction: step.instruction || '',
    why: step.why || '',
    targetDevice: step.targetDevice || step.device || '',
    actionType: step.actionType || inferActionType(step.commands),
    commands: step.commands || [],
    expectedOutput: step.expectedOutput || '',
    verification: normalizeVerification(step.verification),
    hints: step.hints || [],
    commonMistakes: normalizeCommonMistakes(step.commonErrors),
    completionCondition: step.completionCondition || '',
    optionalConcept: step.optionalConcept || ''
  }, step);
}

function addStepGuidance(normalizedStep, sourceStep) {
  const commands = normalizedStep.commands || [];
  const verification = normalizedStep.verification || {};
  const firstCommand = commands.find(command => {
    const cmdStr = typeof command === 'string' ? command : (command?.raw || '');
    return cmdStr && !/^(enable|end|exit)$/i.test(cmdStr.trim());
  });
  const firstCommandText = typeof firstCommand === 'string' ? firstCommand : (firstCommand?.raw || '');
  const target = normalizedStep.targetDevice || sourceStep.device || 'the target device';
  const action = normalizedStep.actionType || 'configuration';

  return {
    ...normalizedStep,
    why: normalizedStep.why || `This ${action} step prepares ${target} for the lab objective and gives you a verifiable checkpoint.`,
    hints: normalizedStep.hints?.length
      ? normalizedStep.hints
      : [
          firstCommandText ? `Start with the command: ${firstCommandText}` : 'Read the instruction and work on the named target device.',
          'Run the listed verification after making the change.'
        ],
    commonMistakes: normalizedStep.commonMistakes?.length
      ? normalizedStep.commonMistakes
      : [{
          mistake: commands.length ? 'Skipping a command or running it in the wrong device/mode' : 'Verifying before completing the requested action',
          solution: commands.length
            ? 'Run the commands in order, confirm the prompt/mode, then verify.'
            : 'Complete the instruction first, then run verification.'
        }],
    expectedOutput: normalizedStep.expectedOutput || (
      verification.expected !== undefined && verification.expected !== ''
        ? `Verification should match: ${typeof verification.expected === 'string' ? verification.expected : JSON.stringify(verification.expected)}`
        : 'The verification check should pass.'
    ),
    completionCondition: normalizedStep.completionCondition || 'Complete the action and pass the verification check.'
  };
}

/**
 * Normalize verification data
 */
function normalizeVerification(verification) {
  if (!verification) {
    return { type: 'cli', expected: '' };
  }

  // Already normalized
  if (verification.type && verification.expected !== undefined) {
    return verification;
  }

  // Legacy string format
  if (typeof verification === 'string') {
    return { type: 'cli', expected: verification };
  }

  // Legacy ping format
  if (verification.type === 'ping') {
    return {
      type: 'cli',
      expected: verification.expected || 'reachable'
    };
  }

  // Unknown format
  return { type: 'cli', expected: '' };
}

/**
 * Normalize common mistakes / errors
 */
function normalizeCommonMistakes(commonErrors) {
  if (!commonErrors || !Array.isArray(commonErrors)) {
    return [];
  }

  return commonErrors.map(err => {
    if (typeof err === 'string') {
      return { mistake: err, solution: '' };
    }
    return {
      mistake: err.error || err.mistake || '',
      solution: err.solution || err.fix || ''
    };
  });
}

/**
 * Normalize troubleshooting data
 */
function normalizeTroubleshooting(errors, steps = []) {
  if (!errors || !Array.isArray(errors) || errors.length === 0) {
    const fallbackErrors = steps
      .flatMap(step => (step.commonMistakes || []).map(mistake => ({
        error: mistake.mistake,
        symptoms: `The ${step.title} verification does not pass.`,
        diagnosticCommands: step.commands || [],
        troubleshootingSteps: [mistake.solution].filter(Boolean),
        possibleCauses: [mistake.mistake],
        fix: mistake.solution,
        solution: mistake.solution,
        verificationAfterFix: step.expectedOutput || 'Run Verify again.'
      })))
      .slice(0, 8);
    return { commonErrors: fallbackErrors };
  }

  return {
    commonErrors: errors.map(err => {
      const relatedStep = steps.find(step =>
        `${step.title} ${step.instruction} ${step.expectedOutput}`.toLowerCase()
          .includes(`${err.error || ''}`.toLowerCase().split(' ')[0])
      );
      const diagnosticCommands = err.diagnosticCommands?.length
        ? err.diagnosticCommands
        : relatedStep?.commands || [];
      const solution = err.solution || err.fix || 'Correct the value identified by the diagnostic check, then verify again.';
      return {
        error: err.error || 'Verification failed',
        symptoms: err.symptoms || err.error || 'The expected state is not detected.',
        diagnosticCommands,
        troubleshootingSteps: err.troubleshootingSteps?.length
          ? err.troubleshootingSteps
          : [
              diagnosticCommands.length ? `Run: ${diagnosticCommands.join(', ')}` : 'Repeat the relevant verification step.',
              solution
            ],
        possibleCauses: err.possibleCauses?.length ? err.possibleCauses : [err.error || 'A value or connection does not match the lab plan'],
        fix: solution,
        solution,
        verificationAfterFix: err.verificationAfterFix || relatedStep?.expectedOutput || 'Run Verify again and confirm the expected state.'
      };
    })
  };
}

/**
 * Build the fixed 20-section teaching guide without inventing device behavior.
 * Raw labs can remain legacy; learners still receive one predictable shape.
 */
function buildLabGuide(lab) {
  const devices = lab.topology?.devices || [];
  const connections = lab.topology?.connections || [];
  const addressing = lab.ipAddressing || [];
  const steps = lab.steps || [];
  const errors = lab.troubleshooting?.commonErrors || [];
  const commands = [...new Set([
    ...(lab.commandsToLearn || []),
    ...steps.flatMap(step => step.commands || [])
  ].filter(Boolean))];
  const deviceRows = devices.map(device => ({
    device: device.name || device.id,
    quantity: 1,
    purpose: device.role || device.type || 'Network device'
  }));
  const diagram = connections.length
    ? connections.map(connection => `${connection.from} ─── ${connection.to}`).join('\n')
    : devices.map(device => device.name || device.id).join('  ');
  const troubleshootingMethod = [];

  if (connections.length) {
    troubleshootingMethod.push({
      check: 'Physical connection',
      why: 'A disconnected link prevents higher-layer tests from working.',
      correctResult: 'The required topology connections exist and are connected.',
      ifWrong: 'Check the listed device ports and cable/link status.'
    });
  }
  if (addressing.length) {
    troubleshootingMethod.push({
      check: 'IP address and subnet mask',
      why: 'Devices need correct addressing to identify their local network.',
      correctResult: 'Configured values match the addressing plan.',
      ifWrong: 'Compare the device values with the addressing plan, then correct only the mismatched value.'
    });
  }
  if (steps.some(step => /route|ospf|eigrp|bgp|gateway|nat/i.test(`${step.title} ${step.instruction}`))) {
    troubleshootingMethod.push({
      check: 'Routing or gateway',
      why: 'Different networks require a valid next hop or route.',
      correctResult: 'The relevant route/gateway verification passes.',
      ifWrong: 'Review the route-related step and verify the target device before changing configuration.'
    });
  }
  troubleshootingMethod.push({
    check: 'Connectivity verification',
    why: 'A final test confirms the configured behavior from the learner perspective.',
    correctResult: 'The step verification or connectivity test passes.',
    ifWrong: 'Use the first failed check above; do not change multiple settings at once.'
  });

  const errorCauseFixTable = errors.map(error => ({
    problem: error.error || error.symptoms || 'Verification failed',
    likelyCause: (error.possibleCauses || []).join('; ') || 'Review the failed step values',
    howToCheck: (error.diagnosticCommands || []).join(' | ') || 'Repeat the relevant verification step',
    fix: error.fix || error.solution || 'Follow the troubleshooting steps for this error'
  }));

  return {
    objective: {
      whatToBuild: lab.objectives || lab.problemStatement || 'Complete the configured network task.',
      finalGoal: lab.finalVerification?.successCriteria || 'Complete all required steps and pass verification.',
      afterCompletion: lab.learningObjectives?.join(' ') || 'Understand and verify the network behavior.',
      realWorldPurpose: lab.realWorldScenario || 'This lab represents a practical network-engineering task.'
    },
    whatYouLearn: lab.concepts?.length ? lab.concepts : ['The concepts used by this lab'],
    difficulty: {
      level: lab.level || lab.difficulty || 'basic',
      prerequisites: lab.prerequisites?.length ? lab.prerequisites : ['Read the objective and addressing plan before starting.']
    },
    requiredDevices: deviceRows.length ? deviceRows : [{ device: 'Devices defined by this lab', quantity: 'As shown', purpose: 'Complete the lab topology' }],
    topology: {
      diagram: diagram || 'Not applicable in this lab',
      devices,
      connections
    },
    addressingPlan: {
      entries: addressing,
      explanation: addressing.length
        ? 'Use these values exactly; each interface needs the correct address and mask for the intended network.'
        : 'Not applicable in this lab'
    },
    physicalConnection: {
      instructions: connections.length
        ? connections.map(connection => `Connect ${connection.from} to ${connection.to}${connection.type ? ` using ${connection.type}` : ''}.`)
        : ['Not applicable in this lab'],
      expectedLinkState: connections.length ? 'Required links should be connected before configuration.' : 'Not applicable in this lab'
    },
    configuration: steps,
    conceptExplanation: {
      simple: lab.concepts?.length
        ? `${lab.concepts.join(', ')} are used here. Follow the steps in order and verify each change.`
        : 'Read each step explanation before applying its command or value.',
      analogy: 'A network behaves like a delivery system: addresses identify destinations, links provide paths, and verification confirms delivery.'
    },
    verification: {
      instructions: steps.map(step => ({
        step: step.title,
        commands: step.commands || [],
        expected: step.expectedOutput || 'The step verification should pass.',
        meaning: 'A passing result confirms this part of the lab is configured correctly.'
      })),
      final: lab.finalVerification
    },
    possibleErrors: errors.length ? errors : [{ error: 'Step verification fails', symptoms: 'The expected state is not detected.', solution: 'Use the troubleshooting method and correct the first failed check.' }],
    troubleshootingMethod,
    errorCauseFixTable,
    failurePractice: {
      available: Boolean(lab.faultInjection?.faults?.length),
      tasks: lab.faultInjection?.faults?.length
        ? lab.faultInjection.faults.map(fault => `Identify and recover from: ${fault.description || fault.type}.`)
        : ['Not applicable in this lab'],
      safety: 'Only use reversible, lab-scoped changes. Reset the lab if the state becomes unclear.'
    },
    finalVerificationChecklist: [
      connections.length ? 'Required topology connections are present' : null,
      addressing.length ? 'Addressing values match the plan' : null,
      steps.length ? 'All configuration steps are complete' : null,
      lab.finalVerification?.successCriteria || 'Final verification passes'
    ].filter(Boolean),
    successCondition: {
      statement: 'The lab is COMPLETE when...',
      conditions: lab.finalVerification?.completionCriteria
        ? [lab.finalVerification.completionCriteria]
        : ['All required steps are completed and their verification checks pass.']
    },
    realWorldConnection: lab.realWorldScenario || 'Not applicable in this lab',
    beginnerNotes: lab.learningObjectives?.length
      ? lab.learningObjectives.slice(0, 5)
      : ['Follow one step at a time.', 'Verify before moving to the next step.'],
    miniPracticeTask: 'Create a small variation using the same devices and verification method, then verify it without looking at the solution.',
    commandsValuesUsed: commands.length ? commands : addressing.map(entry => `${entry.deviceId} ${entry.interface}: ${entry.ipAddress}/${entry.subnetMask}`)
  };
}

/**
 * Ensure lab has at least 15 knowledge check questions
 */
function ensureLabQuestions(lab) {
  const existing = Array.isArray(lab.knowledgeCheck) ? lab.knowledgeCheck : [];
  if (existing.length >= 15) {
    return existing;
  }

  const firstAddress = lab.ipAddressing?.[0];
  const firstStep = lab.steps?.[0];
  const firstError = lab.troubleshooting?.commonErrors?.[0];
  const firstDevice = lab.topology?.devices?.[0];
  const command = firstStep?.commands?.find(Boolean) || 'the listed verification command';
  const answer = (correctAnswer, options, explanation) => ({
    type: 'multiple_choice',
    correctAnswer,
    correctIndex: options.indexOf(correctAnswer),
    options,
    explanation
  });
  const generated = [
    { question: 'What is the main objective of this lab?', ...answer(lab.objectives, [lab.objectives, 'Change unrelated settings', 'Skip verification', 'Remove the topology'], 'The objective describes the task you must complete and verify.') },
    { question: 'Which difficulty level is assigned to this lab?', ...answer(lab.level, [lab.level, 'basic', 'intermediate', 'advanced'], 'Use the lab level to decide how much prerequisite knowledge to review.') },
    { question: 'Which category best describes this lab?', ...answer(lab.category, [lab.category, 'Unrelated application setup', 'File management', 'Operating system repair'], 'The category identifies the networking topic being practiced.') },
    { question: 'What should you do before changing a value?', ...answer('Read the addressing plan and current step', ['Read the addressing plan and current step', 'Change every device', 'Skip the topology', 'Delete the lab'], 'A controlled change starts with the plan and the current step.') },
    { question: `Which command or value is used in the first step?`, ...answer(command, [command, 'reload', 'erase startup-config', 'format flash'], 'This answer is taken from the actual first step in this lab.') },
    { question: 'What is the purpose of verification?', ...answer('Confirm that the expected state is present', ['Confirm that the expected state is present', 'Add unrelated devices', 'Hide an error', 'Skip configuration'], 'Verification proves whether the change worked.') },
    { question: 'What should you check first when connectivity fails?', ...answer('The first failed check in the troubleshooting order', ['The first failed check in the troubleshooting order', 'Change all IP addresses', 'Restart every device', 'Ignore the result'], 'Network engineers isolate the first failure instead of changing many things at once.') },
    { question: 'Why should commands be run on the named target device?', ...answer('The target device owns the relevant configuration', ['The target device owns the relevant configuration', 'All devices share one configuration', 'It makes output longer', 'It disables verification'], 'Configuration is stored on the device or interface named by the step.') },
    { question: 'When is the lab complete?', ...answer(lab.finalVerification?.completionCriteria || 'When all required steps and verification checks pass', [lab.finalVerification?.completionCriteria || 'When all required steps and verification checks pass', 'When the first command is typed', 'When errors are ignored', 'When only the topology is drawn'], 'Completion requires the defined checks, not just entering commands.') },
    { question: firstAddress ? `Which address belongs to ${firstAddress.deviceId} ${firstAddress.interface || 'the listed interface'}?` : 'What should you use when an addressing plan is present?', ...answer(firstAddress ? firstAddress.ipAddress : 'The values listed in the addressing plan', firstAddress ? [firstAddress.ipAddress, '0.0.0.0', '255.255.255.255', '127.0.0.1'] : ['The values listed in the addressing plan', 'Random values', 'Only a hostname', 'No values'], 'Use the lab-specific addressing plan rather than inventing values.') },
    { question: firstDevice ? `What is the first device listed in this lab topology?` : 'What defines the lab topology?', ...answer(firstDevice ? (firstDevice.name || firstDevice.id) : 'The devices and connections used by the lab', firstDevice ? [firstDevice.name || firstDevice.id, 'Unknown device', 'The learner laptop only', 'No device'] : ['The devices and connections used by the lab', 'A random cable', 'Only a password', 'A music track'], 'The topology identifies the actual devices and links for this lab.') },
    { question: 'What is a safe way to practice a failure?', ...answer('Use a reversible lab-scoped fault and verify the fix', ['Use a reversible lab-scoped fault and verify the fix', 'Break a production network', 'Delete the configuration permanently', 'Change unrelated services'], 'Failure practice must remain reversible and isolated to the lab.') },
    { question: firstError ? `What symptom is documented for a possible error?` : 'What should an error entry contain?', ...answer(firstError?.symptoms || 'A symptom, cause, check, fix, and verification', firstError ? [firstError.symptoms, 'No symptom', 'Only a random warning', 'A music title'] : ['A symptom, cause, check, fix, and verification', 'Only a title', 'Only a color', 'Nothing'], 'Error guidance should connect the observed symptom to a check and a fix.') },
    { question: 'Why should you verify again after fixing an error?', ...answer('To confirm the fix restored the expected state', ['To confirm the fix restored the expected state', 'To create another error', 'To skip the final checklist', 'To change the objective'], 'A fix is not complete until the expected behavior is confirmed.') },
    { question: 'What is the best beginner workflow for this lab?', ...answer('Build, configure, verify, troubleshoot, fix, and verify again', ['Build, configure, verify, troubleshoot, fix, and verify again', 'Guess, change everything, and exit', 'Skip configuration and read answers', 'Only memorize commands'], 'This workflow mirrors practical network-engineering work.') }
  ];
  const merged = [...existing];
  generated.forEach(question => {
    if (merged.length < 15) merged.push(question);
  });
  return merged.slice(0, 15);
}

/**
 * Normalize final verification
 */
function normalizeFinalVerification(steps) {
  if (!steps || !Array.isArray(steps)) {
    return { checks: [], successCriteria: '', completionCriteria: '' };
  }

  return {
    checks: steps
      .filter(step => step.verification?.type === 'final')
      .map(step => ({
        type: 'interface_up',
        target: step.targetDevice || '',
        expected: true
      })),
    successCriteria: 'All configured interfaces are up and connectivity verified.',
    completionCriteria: 'Student has completed all steps and verified connectivity.'
  };
}

/**
 * Normalize knowledge check / questions
 */
function normalizeKnowledgeCheck(questions) {
  if (!questions || !Array.isArray(questions)) {
    return [];
  }

  return questions.map(q => {
    const options = Array.isArray(q.options) ? q.options : [];
    const correctAnswer = q.correctAnswer ?? q.answer ?? q.solution;
    const correctIndex = Number.isInteger(q.correctIndex)
      ? q.correctIndex
      : options.indexOf(correctAnswer);

    return {
      ...q,
      question: q.question || q.q || '',
      type: q.type || 'multiple_choice',
      options,
      correctAnswer,
      correctIndex: correctIndex >= 0 ? correctIndex : null,
      explanation: q.explanation || ''
    };
  });
}

/**
 * Batch normalize multiple labs
 * @param {Array} labs - Array of lab data
 * @returns {Array} - Array of normalized labs
 */
export function normalizeLabs(labs) {
  if (!labs || !Array.isArray(labs)) {
    return [];
  }

  return labs.map(lab => normalizeLab(lab)).filter(Boolean);
}

/**
 * Generate a unique ID
 */
function generateId() {
  return `lab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a step ID
 */
function generateStepId(order) {
  return `step-${String(order).padStart(3, '0')}`;
}

/**
 * Convert title to slug
 */
function slugify(text) {
  if (!text) return 'untitled';
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Extract problem statement from scenario
 */
function extractProblemFromScenario(scenario) {
  if (!scenario) return '';
  // Take first sentence as problem statement
  const sentences = scenario.split(/[.!?]+/);
  return sentences[0]?.trim() || scenario.substring(0, 100);
}

/**
 * Extract unique commands from steps
 */
function extractCommandsFromSteps(steps) {
  if (!steps || !Array.isArray(steps)) return [];
  
  const commands = new Set();
  steps.forEach(step => {
    if (step.commands && Array.isArray(step.commands)) {
      step.commands.forEach(cmd => {
        if (cmd && typeof cmd === 'string') {
          commands.add(cmd.split(' ')[0]); // Extract command keyword
        }
      });
    }
  });

  return Array.from(commands).slice(0, 20); // Limit to 20 commands
}

/**
 * Infer device type from name
 */
function inferDeviceType(deviceName) {
  if (!deviceName) return 'pc';
  
  const name = deviceName.toLowerCase();
  
  if (name.startsWith('r')) return 'router';
  if (name.startsWith('sw') || name.startsWith('switch')) return 'switch';
  if (name.startsWith('fw') || name.includes('firewall')) return 'firewall';
  if (name.includes('server')) return 'server';
  if (name.includes('ap') || name.includes('access')) return 'accessPoint';
  if (name.includes('cloud')) return 'cloud';
  
  return 'pc';
}

/**
 * Infer action type from commands
 */
function inferActionType(commands) {
  if (!commands || !Array.isArray(commands)) return 'configuration';
  
  const cmdString = commands.join(' ').toLowerCase();
  
  if (cmdString.includes('show')) return 'verification';
  if (cmdString.includes('ping') || cmdString.includes('traceroute')) return 'troubleshooting';
  if (cmdString.includes('no ') || cmdString.includes('undo')) return 'configuration';
  
  return 'configuration';
}

export default {
  normalizeLab,
  normalizeLabs
};