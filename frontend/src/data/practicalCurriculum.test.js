import {
  PRACTICAL_CURRICULUM,
  PRACTICAL_LEARNING_CYCLE,
  getStageLabs,
  getTransferLab,
  getStageStatus
} from './practicalCurriculum';

describe('practical curriculum contract', () => {
  test('defines the blueprint learning cycle and eight stages', () => {
    expect(PRACTICAL_LEARNING_CYCLE.map(item => item.id)).toEqual([
      'observe', 'predict', 'perform', 'verify', 'explain', 'transfer'
    ]);
    expect(PRACTICAL_CURRICULUM).toHaveLength(8);
    expect(PRACTICAL_CURRICULUM[0].level).toBe(0);
    expect(PRACTICAL_CURRICULUM[7].level).toBe(7);
    PRACTICAL_CURRICULUM.forEach(stage => {
      expect(stage).toHaveProperty('zh');
      expect(stage).toHaveProperty('ja');
      expect(stage).toHaveProperty('zhStrategy');
      expect(stage).toHaveProperty('jaStrategy');
      expect(stage.zh).toHaveProperty('title');
      expect(stage.zh).toHaveProperty('description');
      expect(stage.zh).toHaveProperty('gate');
      expect(stage.zh).toHaveProperty('transfer');
      expect(stage.zh).toHaveProperty('remediation');
      expect(stage.ja).toHaveProperty('title');
      expect(stage.ja).toHaveProperty('description');
      expect(stage.ja).toHaveProperty('gate');
      expect(stage.ja).toHaveProperty('transfer');
      expect(stage.ja).toHaveProperty('remediation');
    });
  });

  test('matches real catalog categories without fabricating lab completion', () => {
    const labs = [
      { id: 'a', category: 'ICMP', steps: [{ stepId: 'a-1' }] },
      { id: 'b', category: 'VLAN', steps: [{ stepId: 'b-1' }] }
    ];
    const stage = PRACTICAL_CURRICULUM.find(item => item.id === 'networking-foundations');
    expect(getStageLabs(stage, labs).map(lab => lab.id)).toEqual(['a']);
    expect(getStageStatus(stage, labs, [])).toBe('available');
    expect(getStageStatus(stage, labs, ['a-1'])).toBe('mastered');
  });

  test('each learning cycle phase has localized prompts', () => {
    PRACTICAL_LEARNING_CYCLE.forEach(phase => {
      expect(phase).toHaveProperty('zhPrompt');
      expect(phase).toHaveProperty('jaPrompt');
      expect(typeof phase.zhPrompt).toBe('string');
      expect(typeof phase.jaPrompt).toBe('string');
    });
  });

  test('selects the least-completed published lab for transfer practice', () => {
    const labs = [
      { id: 'complete', category: 'ICMP', steps: [{ stepId: 'complete-1' }] },
      { id: 'alternate', category: 'IPv4', steps: [{ stepId: 'alternate-1' }, { stepId: 'alternate-2' }] }
    ];
    const stage = PRACTICAL_CURRICULUM.find(item => item.id === 'networking-foundations');
    expect(getTransferLab(stage, labs, ['complete-1']).id).toBe('alternate');
  });

  test('progresses through evidence-backed mastery states', () => {
    const labs = [{ id: 'a', category: 'ICMP', steps: [{ stepId: 'a-1' }] }];
    const stage = PRACTICAL_CURRICULUM.find(item => item.id === 'networking-foundations');
    expect(getStageStatus(stage, labs, [], [], [])).toBe('not_started');
    expect(getStageStatus(stage, labs, ['a-1'], [], [])).toBe('practiced');
    const evidence = [{
      labId: 'a',
      stepId: 'a-1',
      verificationType: 'state_check',
      passed: true,
      prediction: 'The host should be reachable.',
      evidence: 'Ping passed.',
      explanation: 'The addresses share a subnet.',
    }];
    expect(getStageStatus(stage, labs, ['a-1'], evidence, [])).toBe('verified');
    expect(getStageStatus(stage, labs, ['a-1'], evidence, [{ stageId: stage.id, passed: true }])).toBe('mastered');
  });
});
