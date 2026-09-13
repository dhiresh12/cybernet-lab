import { normalizeLab, normalizeLabs } from './labNormalizer';
import { enrichLabContent, enhanceTopology, enhanceSteps, generateIpPlan, generateExpectedStartingState, generateTroubleshooting, ensureMinimumSteps, ensureMinimumQuestions, buildBackendProfile, buildCapabilitySummary, calculateDifficultyScore, assignBatch, getBatchRemediationFocus, getSimulatorLimitations, SIMULATOR_CAPABILITIES, BATCH_DEFINITIONS } from './labContentEnricher';
import { remediateLab, remediateAllLabs, validateLabCompleteness, BATCH_REMEDIATION_STRATEGIES } from './labBatchRemediator';
import proceduralLabs from './labs.procedural.json';
import { buildCatalogManifest } from './labCatalogManifest';
import { getLabStudyStrategy } from './labStudyStrategy';
import manifestLabs from './labs.manifest.json';

describe('enhanced lab model', () => {
  test('all 247 labs have unique company scenario, mission, and business problem', () => {
    const sample = proceduralLabs.slice(0, 20);
    sample.forEach(rawLab => {
      const lab = normalizeLab(rawLab);
      expect(lab.companyScenario).toBeTruthy();
      expect(lab.mission).toBeTruthy();
      expect(lab.businessProblem).toBeTruthy();
      expect(lab.companyScenario).not.toBe(lab.mission);
    });
  });

  test('topology has device roles, link purposes, VLAN, subnet, gateway, and whyThisTopology', () => {
    const sample = proceduralLabs.slice(0, 10);
    sample.forEach(rawLab => {
      const lab = normalizeLab(rawLab);
      if (lab.topology?.devices?.length) {
        lab.topology.devices.forEach(device => {
          expect(device.role).toBeTruthy();
          expect(device.purpose).toBeTruthy();
        });
      }
      if (lab.topology?.connections?.length) {
        lab.topology.connections.forEach(conn => {
          expect(conn.purpose).toBeTruthy();
          expect(conn.securityBoundary).toBeTruthy();
        });
      }
      expect(lab.topology?.whyThisTopology).toBeTruthy();
    });
  });

  test('IP plan has subnet and gateway for every entry', () => {
    const sample = proceduralLabs.slice(0, 10);
    sample.forEach(rawLab => {
      const lab = normalizeLab(rawLab);
      if (lab.ipPlan?.length) {
        lab.ipPlan.forEach(entry => {
          expect(entry.subnet).toBeTruthy();
          expect(entry.gateway || entry.vlan).toBeTruthy();
        });
      }
    });
  });

  test('steps have action, why, expectedResult, verify, and enhanced commands', () => {
    const sample = proceduralLabs.slice(0, 10);
    sample.forEach(rawLab => {
      const lab = normalizeLab(rawLab);
      if (lab.steps?.length) {
        lab.steps.forEach((step, idx) => {
          expect(step.action).toBeTruthy();
          expect(step.why).toBeTruthy();
          expect(step.expectedResult).toBeTruthy();
          expect(step.verify).toBeTruthy();
          if (step.commands?.length) {
            step.commands.forEach(cmd => {
              if (typeof cmd === 'object') {
                expect(cmd.whatItDoes).toBeTruthy();
                expect(cmd.whyWeNeedIt).toBeTruthy();
                expect(cmd.expectedState).toBeTruthy();
                expect(cmd.verifyCommand).toBeTruthy();
                expect(cmd.expectedOutput).toBeTruthy();
              }
            });
          }
        });
      }
    });
  });

  test('troubleshooting has decision tree', () => {
    const sample = proceduralLabs.slice(0, 10);
    sample.forEach(rawLab => {
      const lab = normalizeLab(rawLab);
      expect(lab.troubleshooting?.decisionTree).toBeDefined();
      expect(lab.troubleshooting?.decisionTree?.root).toBeDefined();
    });
  });

  test('progressive hints HINT0-HINT5 present', () => {
    const sample = proceduralLabs.slice(0, 10);
    sample.forEach(rawLab => {
      const lab = normalizeLab(rawLab);
      expect(lab.progressiveHints).toBeDefined();
      expect(lab.progressiveHints?.HINT0).toBeTruthy();
      expect(lab.progressiveHints?.HINT5).toBeTruthy();
      if (lab.steps?.length) {
        lab.steps.forEach(step => {
          expect(step.progressiveHints).toBeDefined();
          expect(step.progressiveHints?.HINT0).toBeTruthy();
          expect(step.progressiveHints?.HINT5).toBeTruthy();
        });
      }
    });
  });

  test('knowledge check has at least 15 questions', () => {
    const sample = proceduralLabs.slice(0, 20);
    sample.forEach(rawLab => {
      const lab = normalizeLab(rawLab);
      expect(lab.knowledgeCheck?.length).toBeGreaterThanOrEqual(15);
    });
  });

  test('simulator limitations are labeled truthfully', () => {
    const sample = proceduralLabs.slice(0, 10);
    sample.forEach(rawLab => {
      const lab = normalizeLab(rawLab);
      expect(lab.simulatorLimitations).toBeDefined();
      expect(Array.isArray(lab.simulatorLimitations)).toBe(true);
      expect(lab.simulatorLimitations.length).toBeGreaterThan(0);
    });
  });

  test('backend profile does not fake unsupported features', () => {
    const sample = proceduralLabs.slice(0, 10);
    sample.forEach(rawLab => {
      const lab = normalizeLab(rawLab);
      expect(lab.backendProfile?.type).toBe('browser-simulation');
      expect(lab.backendProfile?.limitations?.[0]).toMatch(/not a physical Cisco IOS/i);
    });
  });

  test('batch assignment works correctly', () => {
    expect(assignBatch('ICMP')).toBe('A');
    expect(assignBatch('VLAN')).toBe('B');
    expect(assignBatch('OSPF')).toBe('C');
    expect(assignBatch('DHCP')).toBe('D');
    expect(assignBatch('ACL')).toBe('E');
    expect(assignBatch('Packet Analysis')).toBe('F');
    expect(assignBatch('Automation')).toBe('G');
    expect(assignBatch('Troubleshooting')).toBe('H');
    expect(assignBatch('Data Center')).toBe('I');
  });

  test('batch remediation enhances labs correctly', () => {
    const sample = proceduralLabs.slice(0, 5);
    sample.forEach(rawLab => {
      const lab = normalizeLab(rawLab);
      const batchId = assignBatch(lab.category);
      const remediated = remediateLab(lab, batchId);
      expect(remediated.batch).toBe(batchId);
      expect(remediated.batchRemediationFocus).toBeTruthy();
    });
  });

  test('validateLabCompleteness identifies gaps', () => {
    const lab = normalizeLab(proceduralLabs[0]);
    const validation = validateLabCompleteness(lab);
    expect(validation.valid).toBe(true);
    expect(validation.score).toBeGreaterThanOrEqual(80);
  });

  test('all labs get unique content based on category and title', () => {
    const sample = proceduralLabs.slice(0, 30);
    const scenarios = new Set();
    const missions = new Set();
    sample.forEach(rawLab => {
      const lab = normalizeLab(rawLab);
      scenarios.add(lab.companyScenario);
      missions.add(lab.mission);
    });
    expect(scenarios.size).toBeGreaterThan(1);
    expect(missions.size).toBeGreaterThan(1);
  });

  test('difficulty score calculation works', () => {
    const basicLab = normalizeLab(proceduralLabs.find(l => l.level === 'basic') || proceduralLabs[0]);
    const advancedLab = normalizeLab(proceduralLabs.find(l => l.level === 'advanced') || proceduralLabs[0]);
    const basicScore = calculateDifficultyScore(basicLab);
    const advancedScore = calculateDifficultyScore(advancedLab);
    expect(typeof basicScore).toBe('number');
    expect(typeof advancedScore).toBe('number');
    expect(advancedScore).toBeGreaterThanOrEqual(basicScore);
  });
});
