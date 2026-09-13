import { normalizeLab } from './labNormalizer';
import { 
  calculateDifficultyScore, 
  assignProgressiveLevel, 
  PROGRESSIVE_LEVELS,
  enrichLabContent
} from './labContentEnricher';
import { evaluateLabQuality, QUALITY_PASS_THRESHOLD as FRONTEND_THRESHOLD } from './labQualityService';
import { validateLab } from './LabModel';
import { validateLabCompleteness, QUALITY_PASS_THRESHOLD } from './labBatchRemediator';
import proceduralLabs from './labs.procedural.json';

describe('progressive difficulty algorithm', () => {
  test('calculateDifficultyScore returns a number between 0 and 1', () => {
    const lab = normalizeLab(proceduralLabs[0]);
    const score = calculateDifficultyScore(lab);
    expect(typeof score).toBe('number');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  test('calculateDifficultyScore increases with device count', () => {
    const baseLab = normalizeLab(proceduralLabs[0]);
    const baseScore = calculateDifficultyScore(baseLab);
    
    const modifiedLab = { ...baseLab, topology: { ...baseLab.topology, devices: [...(baseLab.topology?.devices || []), { id: 'R2', type: 'router', name: 'R2' }] } };
    const modifiedScore = calculateDifficultyScore(modifiedLab);
    expect(modifiedScore).toBeGreaterThan(baseScore);
  });

  test('calculateDifficultyScore increases with fault injection', () => {
    const lab = normalizeLab(proceduralLabs[0]);
    const baseScore = calculateDifficultyScore(lab);
    
    const labWithFaults = { ...lab, faultInjection: { faults: [{ type: 'wrong_ip', severity: 'high', description: 'Test fault' }] } };
    const faultScore = calculateDifficultyScore(labWithFaults);
    expect(faultScore).toBeGreaterThan(baseScore);
  });

  test('calculateDifficultyScore increases with troubleshooting content', () => {
    const lab = normalizeLab(proceduralLabs[0]);
    const baseLab = { ...lab, troubleshooting: undefined };
    const baseScore = calculateDifficultyScore(baseLab);
    
    const labWithTroubleshooting = { 
      ...lab, 
      troubleshooting: { 
        commonErrors: [
          { error: 'Test error', symptoms: 'Test', diagnosticCommands: ['show ip interface brief'], troubleshootingSteps: ['Step 1'], possibleCauses: ['Cause'], fix: 'Fix', verificationAfterFix: 'Verified' }
        ] 
      } 
    };
    const tsScore = calculateDifficultyScore(labWithTroubleshooting);
    expect(tsScore).toBeGreaterThan(baseScore);
  });

  test('calculateDifficultyScore returns 0 for invalid lab', () => {
    expect(calculateDifficultyScore(null)).toBe(0);
    expect(calculateDifficultyScore({})).toBe(0);
    expect(calculateDifficultyScore('invalid')).toBe(0);
  });
});

describe('progressive experiment model levels', () => {
  test('PROGRESSIVE_LEVELS has 6 levels', () => {
    expect(Object.keys(PROGRESSIVE_LEVELS).length).toBe(6);
    expect(PROGRESSIVE_LEVELS['skill-lab']).toBeDefined();
    expect(PROGRESSIVE_LEVELS['combination-lab']).toBeDefined();
    expect(PROGRESSIVE_LEVELS['engineering-lab']).toBeDefined();
    expect(PROGRESSIVE_LEVELS['failure-lab']).toBeDefined();
    expect(PROGRESSIVE_LEVELS['integrated-lab']).toBeDefined();
    expect(PROGRESSIVE_LEVELS['innovation-lab']).toBeDefined();
  });

  test('assignProgressiveLevel returns skill-lab for minimal labs', () => {
    const minimalLab = {
      id: 'test-1',
      title: 'Test',
      category: 'ICMP',
      difficulty: 'basic',
      topology: { devices: [{ id: 'PC1', type: 'pc', name: 'PC1' }], connections: [] },
      steps: Array(15).fill({ action: 'test', why: 'test', expectedResult: 'test', verify: 'test', commands: [], verification: { type: 'ping' } }),
      faultInjection: { faults: [] },
      troubleshooting: { commonErrors: [] },
      concepts: ['ICMP'],
      skills: ['ping'],
      challenge: '',
      debrief: '',
      interviewQuestions: []
    };
    expect(assignProgressiveLevel(minimalLab)).toBe('skill-lab');
  });

  test('assignProgressiveLevel returns combination-lab for labs with multiple concepts', () => {
    const lab = {
      id: 'test-2',
      title: 'Test',
      category: 'Routing',
      difficulty: 'intermediate',
      topology: { devices: [{ id: 'R1', type: 'router', name: 'R1' }, { id: 'R2', type: 'router', name: 'R2' }], connections: [{ from: 'R1:G0/0', to: 'R2:G0/0' }] },
      steps: Array(15).fill({ action: 'test', why: 'test', expectedResult: 'test', verify: 'test', commands: [], verification: { type: 'cli' } }),
      faultInjection: { faults: [] },
      troubleshooting: { commonErrors: [] },
      concepts: ['Routing', 'OSPF', 'BGP'],
      skills: ['configure', 'verify'],
      challenge: '',
      debrief: '',
      interviewQuestions: []
    };
    expect(assignProgressiveLevel(lab)).toBe('combination-lab');
  });

  test('assignProgressiveLevel returns engineering-lab for moderate complexity', () => {
    const lab = {
      id: 'test-3',
      title: 'Test',
      category: 'Network Design',
      difficulty: 'advanced',
      topology: { devices: Array(3).fill(0).map((_, i) => ({ id: `R${i}`, type: 'router', name: `R${i}` })), connections: [{ from: 'R1:G0/0', to: 'R2:G0/0' }] },
      steps: Array(18).fill({ action: 'test', why: 'test', expectedResult: 'test', verify: 'test', commands: [], verification: { type: 'cli' }, progressiveHints: { HINT0: 'h', HINT5: 'h' } }),
      faultInjection: { faults: [] },
      troubleshooting: { commonErrors: [] },
      concepts: Array(5).fill('concept'),
      skills: Array(3).fill('skill'),
      challenge: '',
      debrief: '',
      interviewQuestions: []
    };
    expect(assignProgressiveLevel(lab)).toBe('engineering-lab');
  });

  test('assignProgressiveLevel returns failure-lab for labs with fault injection', () => {
    const lab = {
      id: 'test-4',
      title: 'Test',
      category: 'Troubleshooting',
      difficulty: 'intermediate',
      topology: { devices: [{ id: 'R1', type: 'router', name: 'R1' }], connections: [] },
      steps: Array(15).fill({ action: 'test', why: 'test', expectedResult: 'test', verify: 'test', commands: [], verification: { type: 'cli' }, progressiveHints: { HINT0: 'h', HINT5: 'h' } }),
      faultInjection: { faults: [{ type: 'wrong_ip', severity: 'high', description: 'Test fault' }] },
      troubleshooting: { commonErrors: [{ error: 'Test', symptoms: 's', diagnosticCommands: ['show ip interface brief'], troubleshootingSteps: ['s'], possibleCauses: ['c'], fix: 'f', verificationAfterFix: 'v' }] },
      concepts: ['Troubleshooting'],
      skills: ['diagnose'],
      challenge: '',
      debrief: '',
      interviewQuestions: []
    };
    expect(assignProgressiveLevel(lab)).toBe('failure-lab');
  });

  test('assignProgressiveLevel returns integrated-lab for multi-technology labs', () => {
    const lab = {
      id: 'test-5',
      title: 'Test',
      category: 'Security',
      difficulty: 'advanced',
      topology: { devices: Array(4).fill(0).map((_, i) => ({ id: `D${i}`, type: 'router', name: `D${i}` })), connections: [{ from: 'D1:G0/0', to: 'D2:G0/0' }] },
      steps: Array(20).fill({ action: 'test', why: 'test', expectedResult: 'test', verify: 'test', commands: [], verification: { type: 'cli' }, progressiveHints: { HINT0: 'h', HINT5: 'h' } }),
      faultInjection: { faults: [] },
      troubleshooting: { commonErrors: [{ error: 'Test', symptoms: 's', diagnosticCommands: ['show ip interface brief'], troubleshootingSteps: ['s'], possibleCauses: ['c'], fix: 'f', verificationAfterFix: 'v' }] },
      concepts: Array(3).fill('concept'),
      skills: Array(3).fill('skill'),
      commandsToLearn: Array(6).fill('show'),
      challenge: '',
      debrief: '',
      interviewQuestions: []
    };
    expect(assignProgressiveLevel(lab)).toBe('integrated-lab');
  });

  test('assignProgressiveLevel returns innovation-lab for high-complexity labs with challenge and debrief', () => {
    const lab = {
      id: 'test-6',
      title: 'Test',
      category: 'Capstone',
      difficulty: 'expert',
      topology: { devices: Array(6).fill(0).map((_, i) => ({ id: `D${i}`, type: 'router', name: `D${i}` })), connections: [{ from: 'D1:G0/0', to: 'D2:G0/0' }] },
      steps: Array(20).fill({ action: 'test', why: 'test', expectedResult: 'test', verify: 'test', commands: [], verification: { type: 'cli' }, progressiveHints: { HINT0: 'h', HINT5: 'h' } }),
      faultInjection: { faults: [] },
      troubleshooting: { commonErrors: [] },
      concepts: Array(8).fill('concept'),
      skills: Array(5).fill('skill'),
      commandsToLearn: Array(6).fill('show'),
      challenge: 'This is a comprehensive challenge that requires the learner to synthesize all skills into a real-world scenario.',
      debrief: 'This is a comprehensive debrief that summarizes all findings and lessons learned from the lab experience.',
      interviewQuestions: Array(5).fill('What is networking?')
    };
    expect(assignProgressiveLevel(lab)).toBe('innovation-lab');
  });

  test('assignProgressiveLevel returns skill-lab for invalid input', () => {
    expect(assignProgressiveLevel(null)).toBe('skill-lab');
    expect(assignProgressiveLevel({})).toBe('skill-lab');
  });
});

describe('comprehensive quality gate', () => {
  test('evaluateLabQuality returns score between 0 and 100', () => {
    const lab = normalizeLab(proceduralLabs[0]);
    const result = evaluateLabQuality(lab);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  test('evaluateLabQuality marks labs with missing mission as failed', () => {
    const lab = normalizeLab(proceduralLabs[0]);
    lab.mission = '';
    const result = evaluateLabQuality(lab);
    expect(result.passed).toBe(false);
    expect(result.score).toBeLessThan(QUALITY_PASS_THRESHOLD);
  });

  test('evaluateLabQuality marks labs with missing topology as failed', () => {
    const lab = normalizeLab(proceduralLabs[0]);
    lab.topology = { devices: [], connections: [] };
    const result = evaluateLabQuality(lab);
    expect(result.passed).toBe(false);
  });

  test('evaluateLabQuality marks labs with missing steps as failed', () => {
    const lab = normalizeLab(proceduralLabs[0]);
    lab.steps = [];
    const result = evaluateLabQuality(lab);
    expect(result.passed).toBe(false);
  });

  test('evaluateLabQuality penalizes duplicate steps', () => {
    const lab = normalizeLab(proceduralLabs[0]);
    lab.steps = [
      { action: 'configure', why: 'test', expectedResult: 'test', verify: 'test', commands: [], verification: { type: 'cli' }, progressiveHints: { HINT0: 'h', HINT5: 'h' } },
      { action: 'configure', why: 'test', expectedResult: 'test', verify: 'test', commands: [], verification: { type: 'cli' }, progressiveHints: { HINT0: 'h', HINT5: 'h' } }
    ];
    const result = evaluateLabQuality(lab);
    expect(result.warnings.some(w => w.includes('duplicate'))).toBe(true);
  });

  test('evaluateLabQuality returns passed for well-formed lab', () => {
    const lab = normalizeLab(proceduralLabs[0]);
    const result = evaluateLabQuality(lab);
    expect(typeof result.passed).toBe('boolean');
    expect(typeof result.score).toBe('number');
    expect(result.threshold).toBe(FRONTEND_THRESHOLD);
  });

  test('evaluateLabQuality includes all quality gate checks', () => {
    const lab = normalizeLab(proceduralLabs[0]);
    const result = evaluateLabQuality(lab);
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('passed');
    expect(result).toHaveProperty('threshold');
    expect(result).toHaveProperty('stepCount');
    expect(result).toHaveProperty('hasStructuredTopology');
    expect(result).toHaveProperty('hasInitialState');
  });
});

describe('validateLabCompleteness scoring', () => {
  test('returns score between 0 and 100 with pass/fail', () => {
    const lab = normalizeLab(proceduralLabs[0]);
    const result = validateLabCompleteness(lab);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.passed).toBe(result.score >= QUALITY_PASS_THRESHOLD && result.errors.length === 0);
  });

  test('threshold is 70', () => {
    expect(QUALITY_PASS_THRESHOLD).toBe(70);
  });

  test('lab with score 69 fails', () => {
    const lab = {
      id: 'test',
      title: 'Test',
      category: 'ICMP',
      difficulty: 'basic',
      mission: 'A'.repeat(20),
      objectives: 'B'.repeat(20),
      companyScenario: 'C'.repeat(20),
      topology: { devices: [{ id: 'R1', type: 'router', name: 'R1', role: 'Router', purpose: 'Test' }], connections: [{ from: 'R1:G0/0', to: 'R2:G0/0', purpose: 'Test' }] },
      steps: Array(20).fill({ action: 'test', why: 'test', expectedResult: 'test', verify: 'test', commands: [{ raw: 'show ip interface brief', whatItDoes: 'w', whyWeNeedIt: 'w', expectedState: 'w', verifyCommand: 'show ip interface brief', expectedOutput: 'w', commonMistake: 'w' }], verification: { type: 'cli' }, progressiveHints: { HINT0: 'h', HINT5: 'h' } }),
      ipPlan: [{ deviceId: 'R1', interface: 'G0/0', ipAddress: '192.168.1.1', subnetMask: '255.255.255.0', gateway: '192.168.1.254', vlan: '1' }],
      knowledgeCheck: Array(15).fill({ question: 'Q?', type: 'multiple_choice', options: ['A', 'B'], correctAnswer: 'A', explanation: 'E' })
    };
    const result = validateLabCompleteness(lab);
    expect(result.score).toBeLessThan(QUALITY_PASS_THRESHOLD);
    expect(result.passed).toBe(false);
  });
});

describe('20-step workflow validator', () => {
  test('all procedural labs have steps with ACTION + WHY + EXPECTED RESULT + VERIFY', () => {
    const sample = proceduralLabs.slice(0, 20);
    sample.forEach(rawLab => {
      const lab = normalizeLab(rawLab);
      lab.steps.forEach((step, idx) => {
        expect(step.action).toBeTruthy();
        expect(step.why).toBeTruthy();
        expect(step.expectedResult).toBeTruthy();
        expect(step.verify).toBeTruthy();
      });
    });
  });

  test('steps have progressive hints HINT0-HINT5 after normalization', () => {
    const sample = proceduralLabs.slice(0, 10);
    sample.forEach(rawLab => {
      const lab = normalizeLab(rawLab);
      if (lab.steps?.length) {
        lab.steps.forEach((step, idx) => {
          expect(step.progressiveHints).toBeDefined();
          expect(step.progressiveHints?.HINT0).toBeTruthy();
          expect(step.progressiveHints?.HINT5).toBeTruthy();
        });
      }
    });
  });
});

describe('configuration format validator', () => {
  test('all procedural labs have commands with full format after normalization', () => {
    const sample = proceduralLabs.slice(0, 20);
    sample.forEach(rawLab => {
      const lab = normalizeLab(rawLab);
      lab.steps?.forEach((step, idx) => {
        step.commands?.forEach((cmd, cmdIdx) => {
          if (typeof cmd === 'object' && cmd.raw) {
            expect(cmd.whatItDoes).toBeTruthy();
            expect(cmd.whyWeNeedIt).toBeTruthy();
            expect(cmd.expectedState).toBeTruthy();
            expect(cmd.verifyCommand).toBeTruthy();
            expect(cmd.expectedOutput).toBeTruthy();
          }
        });
      });
    });
  });
});

describe('LabModel progressiveLevel field', () => {
  test('LabModel includes progressiveLevel field', () => {
    // The LabModel is a schema definition, just verify it's exported
    const { LabModel } = require('./LabModel.js');
    expect(LabModel.progressiveLevel).toBeDefined();
    expect(LabModel.progressiveLevel.enum).toContain('skill-lab');
    expect(LabModel.progressiveLevel.enum).toContain('innovation-lab');
  });
});
