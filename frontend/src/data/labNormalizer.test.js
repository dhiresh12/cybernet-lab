import { normalizeLab } from './labNormalizer';
import proceduralLabs from './labs.procedural.json';
import { buildCatalogManifest } from './labCatalogManifest';
import { getLabStudyStrategy } from './labStudyStrategy';
import manifestLabs from './labs.manifest.json';

describe('legacy lab normalization', () => {
  test('builds a usable topology and initial device state from legacy fields', () => {
    const lab = normalizeLab({
      id: 'legacy-1',
      title: 'Legacy connectivity lab',
      category: 'ICMP',
      level: 'basic',
      devices: ['Router0', 'Switch0', 'PC0'],
      connections: ['Router0 -> Switch0', 'Switch0 -> PC0'],
      ipTable: [
        { device: 'Router0', interface: 'Gi0/0', ip: '192.168.1.1', mask: '255.255.255.0' },
        { device: 'PC0', interface: 'Fa0', ip: '192.168.1.10', mask: '255.255.255.0' }
      ],
      steps: [{
        title: 'Verify connectivity',
        instruction: 'Use ping',
        commands: ['ping 192.168.1.10'],
        verification: { type: 'ping', expected: 'reachable' }
      }]
    });

    expect(lab.topology.devices).toHaveLength(3);
    expect(lab.topology.connections).toEqual([
      expect.objectContaining({ from: 'Router0', to: 'Switch0' }),
      expect.objectContaining({ from: 'Switch0', to: 'PC0' })
    ]);
    expect(lab.initialState.devices).toEqual(expect.arrayContaining([
      expect.objectContaining({
        deviceId: 'Router0',
        interfaces: [expect.objectContaining({ interfaceName: 'Gi0/0', ip: '192.168.1.1' })]
      })
    ]));
    expect(lab.steps[0].why).toBeTruthy();
    expect(lab.steps[0].hints.length).toBeGreaterThan(0);
    expect(lab.steps[0].commonMistakes.length).toBeGreaterThan(0);
    expect(lab.steps[0].expectedOutput).toBeTruthy();
    expect(Object.keys(lab.labGuide)).toEqual(expect.arrayContaining([
      'objective',
      'whatYouLearn',
      'difficulty',
      'requiredDevices',
      'topology',
      'addressingPlan',
      'physicalConnection',
      'configuration',
      'conceptExplanation',
      'verification',
      'possibleErrors',
      'troubleshootingMethod',
      'errorCauseFixTable',
      'failurePractice',
      'finalVerificationChecklist',
      'successCondition',
      'realWorldConnection',
      'beginnerNotes',
      'miniPracticeTask',
      'commandsValuesUsed'
    ]));
  });

  test('fills teaching data for every procedural lab', () => {
    const requiredSections = [
      'objective', 'whatYouLearn', 'difficulty', 'requiredDevices', 'topology',
      'addressingPlan', 'physicalConnection', 'configuration', 'conceptExplanation',
      'verification', 'possibleErrors', 'troubleshootingMethod', 'errorCauseFixTable',
      'failurePractice', 'finalVerificationChecklist', 'successCondition',
      'realWorldConnection', 'beginnerNotes', 'miniPracticeTask', 'commandsValuesUsed'
    ];

    proceduralLabs.forEach(rawLab => {
      const lab = normalizeLab(rawLab);
      requiredSections.forEach(section => expect(lab.labGuide[section]).toBeDefined());
      expect(lab.objectives).toBeTruthy();
      expect(lab.concepts.length).toBeGreaterThan(0);
      expect(lab.learningObjectives.length).toBeGreaterThan(0);
      expect(lab.prerequisites.length).toBeGreaterThan(0);
      expect(lab.labGuide.configuration.length).toBeGreaterThan(0);
      expect(lab.labGuide.possibleErrors.length).toBeGreaterThan(0);
      lab.labGuide.possibleErrors.forEach(error => {
        expect(error.solution || error.fix).toBeTruthy();
      });
    });
  });

  test('adds truthful catalog capability and backend metadata', () => {
    const lab = normalizeLab(proceduralLabs[0]);
    const manifest = buildCatalogManifest([lab]);

    expect(lab.backendProfile.type).toBe('browser-simulation');
    expect(lab.backendProfile.limitations[0]).toMatch(/not a physical Cisco IOS/i);
    expect(lab.capabilitySummary.topology).toBe(true);
    expect(lab.capabilitySummary.verification).toBe(true);
    expect(manifest.total).toBe(1);
    expect(manifest.uniqueTotal).toBe(1);
    expect(manifest.records[0].id).toBe(String(lab.id));
  });

  test('preserves studyStrategy field from manifest through normalization', () => {
    const sampleManifest = manifestLabs.slice(0, 5);
    sampleManifest.forEach(rawLab => {
      const normalized = normalizeLab(rawLab);
      expect(normalized.studyStrategy).toBeDefined();
      expect(normalized.studyStrategy).toEqual(rawLab.studyStrategy);
    });
  });

  test('getLabStudyStrategy computes same result as manifest injection', () => {
    const sampleManifest = manifestLabs.slice(0, 10);
    sampleManifest.forEach(rawLab => {
      const computed = getLabStudyStrategy(rawLab);
      const manifestStrategy = rawLab.studyStrategy;
      expect(computed.stage).toBe(manifestStrategy.stage);
      expect(computed.zhStrategy).toBe(manifestStrategy.zhStrategy);
      expect(computed.jaStrategy).toBe(manifestStrategy.jaStrategy);
      expect(computed.zhSyllabus).toEqual(manifestStrategy.zhSyllabus);
      expect(computed.jaSyllabus).toEqual(manifestStrategy.jaSyllabus);
    });
  });

  test('all manifest labs have valid studyStrategy with 6 syllabus items', () => {
    expect(manifestLabs).toHaveLength(247);
    manifestLabs.forEach(rawLab => {
      const ss = rawLab.studyStrategy;
      expect(ss).toBeDefined();
      expect(ss.zhSyllabus).toHaveLength(6);
      expect(ss.jaSyllabus).toHaveLength(6);
      expect(ss.zhStrategy.length).toBeGreaterThan(20);
      expect(ss.jaStrategy.length).toBeGreaterThan(20);
    });
  });
});
