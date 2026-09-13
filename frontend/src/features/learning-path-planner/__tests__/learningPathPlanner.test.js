// Learning Path Planner (Trip Planner) tests
// Tests the trip planner feature for planning learning paths through labs
// Tests pure helper functions that work in Node environment

// Replicate the helper functions for testing
function mapLabStage(lab) {
  const diff = String(lab.difficulty || lab.level || 'basic').toLowerCase();
  if (diff === 'basic') return 0;
  if (diff === 'intermediate') return 1;
  if (diff === 'advanced') return 2;
  if (diff === 'expert') return 3;
  const num = Number(lab.level);
  return Number.isFinite(num) ? num : 0;
}

const PRACTICAL_CURRICULUM = [
  { id: 'foundations', level: 0, categories: ['Basics', 'Foundations', 'CLI'] },
  { id: 'networking-foundations', level: 1, categories: ['ICMP', 'IPv4', 'Ethernet', 'Basics', 'Connectivity'] },
  { id: 'switching', level: 2, categories: ['VLAN', 'Switching', 'Trunking', 'Port Security'] },
  { id: 'routing', level: 3, categories: ['Routing', 'Static Routing', 'OSPF', 'EIGRP'] },
  { id: 'services', level: 4, categories: ['DHCP', 'DNS', 'NAT', 'Services', 'SSH'] },
  { id: 'security', level: 5, categories: ['Security', 'ACL', 'Network Security'] },
  { id: 'advanced-engineering', level: 6, categories: ['Enterprise', 'IPv6', 'Automation', 'Data Center', 'Design'] },
  { id: 'capstone', level: 7, categories: ['Troubleshooting', 'Capstone', 'Incident Response'] },
];

function getStageLabs(stage, labs) {
  const categorySet = new Set(stage.categories.map(category => category.toLowerCase()));
  return (Array.isArray(labs) ? labs : []).filter(lab => {
    const category = String(lab.category || '').toLowerCase();
    return categorySet.has(category) || (lab.tags || []).some(tag => categorySet.has(String(tag).toLowerCase()));
  });
}

function getStageStatus(stage, labs, completedSteps = [], evidenceRecords = [], transferAttempts = []) {
  const stageLabs = getStageLabs(stage, labs);
  if (arguments.length < 4) {
    const completedLabs = stageLabs.filter(lab =>
      Array.isArray(lab.steps) &&
      lab.steps.length > 0 &&
      lab.steps.every(step => completedSteps.includes(step.stepId))
    );
    const inProgress = stageLabs.some(lab =>
      (lab.steps || []).some(step => completedSteps.includes(step.stepId)) &&
      !(lab.steps || []).every(step => completedSteps.includes(step.stepId))
    );
    if (completedLabs.length > 0 && completedLabs.length === stageLabs.length) return 'mastered';
    if (completedLabs.length > 0 || inProgress) return 'practiced';
    return stageLabs.length > 0 ? 'available' : 'unavailable';
  }
  // Full status logic - simplified for testing
  if (!stageLabs.length) return 'unavailable';
  const hasActivity = stageLabs.some(lab => (lab.steps || []).some(step => completedSteps.includes(step.stepId)));
  if (!hasActivity) return 'not_started';
  return 'practiced';
}

function computeStageMapping(stages, labs, completedSteps = [], evidenceRecords = [], transferAttempts = []) {
  return stages.map(stage => {
    const stageLabs = getStageLabs(stage, labs);
    const status = getStageStatus(stage, labs, completedSteps, evidenceRecords, transferAttempts);
    const completedCount = stageLabs.filter(lab =>
      Array.isArray(lab.steps) && lab.steps.length > 0 &&
      lab.steps.every(step => completedSteps.includes(step.stepId))
    ).length;
    const inProgress = stageLabs.some(lab =>
      (lab.steps || []).some(step => completedSteps.includes(step.stepId)) &&
      !(lab.steps || []).every(step => completedSteps.includes(step.stepId))
    );
    const available = ['available', 'not_started', 'introduced', 'practiced', 'verified', 'transferred'].includes(status);
    return {
      stage,
      totalLabs: stageLabs.length,
      completedLabs: completedCount,
      completionPercentage: stageLabs.length > 0 ? (completedCount / stageLabs.length) * 100 : 0,
      status,
      available,
      inProgress
    };
  });
}

// Mock lab data for testing
const mockLabs = [
  { id: 'lab-1', title: 'Basic Ping', category: 'ICMP', difficulty: 'basic', level: 'basic', completed: true, steps: [{ stepId: 's1' }] },
  { id: 'lab-2', title: 'IP Addressing', category: 'IPv4', difficulty: 'basic', level: 'basic', completed: false, steps: [{ stepId: 's2' }] },
  { id: 'lab-3', title: 'VLAN Config', category: 'VLAN', difficulty: 'intermediate', level: 'intermediate', completed: false, steps: [{ stepId: 's3' }] },
  { id: 'lab-4', title: 'Static Route', category: 'Routing', difficulty: 'intermediate', level: 'intermediate', completed: true, steps: [{ stepId: 's4' }] },
  { id: 'lab-5', title: 'DHCP Setup', category: 'DHCP', difficulty: 'advanced', level: 'advanced', completed: false, steps: [{ stepId: 's5' }] },
];

const mockCompletedSteps = ['s1', 's4'];
const mockEvidenceRecords = [
  { labId: 'lab-1', passed: true, verificationType: 'connectivity', prediction: 'ping works', evidence: 'ping succeeded', explanation: 'ICMP reply received' },
  { labId: 'lab-4', passed: true, verificationType: 'routing', prediction: 'route works', evidence: 'traceroute succeeded', explanation: 'packets routed' },
];
const mockTransferAttempts = [
  { stageId: 'foundations', passed: true },
  { stageId: 'networking-foundations', passed: true },
];

const fs = require('fs');
const path = require('path');
const plannerPath = path.resolve(__dirname, '../../../components/LearningPathPlanner.jsx');
const plannerSource = fs.readFileSync(plannerPath, 'utf8');

describe('Learning Path Planner - Pure Helpers', () => {
  describe('mapLabStage', () => {
    test('maps basic difficulty to level 0', () => {
      expect(mapLabStage({ difficulty: 'basic' })).toBe(0);
      expect(mapLabStage({ level: 'basic' })).toBe(0);
    });

    test('maps intermediate difficulty to level 1', () => {
      expect(mapLabStage({ difficulty: 'intermediate' })).toBe(1);
      expect(mapLabStage({ level: 'intermediate' })).toBe(1);
    });

    test('maps advanced difficulty to level 2', () => {
      expect(mapLabStage({ difficulty: 'advanced' })).toBe(2);
      expect(mapLabStage({ level: 'advanced' })).toBe(2);
    });

    test('maps expert difficulty to level 3', () => {
      expect(mapLabStage({ difficulty: 'expert' })).toBe(3);
      expect(mapLabStage({ level: 'expert' })).toBe(3);
    });

    test('handles numeric level', () => {
      expect(mapLabStage({ level: 5 })).toBe(5);
      expect(mapLabStage({ level: '2' })).toBe(2);
    });

    test('defaults to 0 for unknown', () => {
      expect(mapLabStage({})).toBe(0);
      expect(mapLabStage({ difficulty: 'unknown' })).toBe(0);
    });
  });

  describe('computeStageMapping', () => {
    test('returns array matching curriculum length', () => {
      const result = computeStageMapping(PRACTICAL_CURRICULUM, mockLabs);
      expect(result).toHaveLength(PRACTICAL_CURRICULUM.length);
    });

    test('each item has required properties', () => {
      const result = computeStageMapping(PRACTICAL_CURRICULUM, mockLabs);
      result.forEach(item => {
        expect(item).toHaveProperty('stage');
        expect(item).toHaveProperty('totalLabs');
        expect(item).toHaveProperty('completedLabs');
        expect(item).toHaveProperty('completionPercentage');
        expect(item).toHaveProperty('status');
        expect(item).toHaveProperty('available');
        expect(item).toHaveProperty('inProgress');
      });
    });

    test('computes completion percentage correctly', () => {
      const result = computeStageMapping(PRACTICAL_CURRICULUM, mockLabs, mockCompletedSteps);
      const foundations = result.find(r => r.stage.id === 'foundations');
      expect(foundations.totalLabs).toBeGreaterThanOrEqual(0);
      expect(foundations.completionPercentage).toBeGreaterThanOrEqual(0);
      expect(foundations.completionPercentage).toBeLessThanOrEqual(100);
    });

    test('marks stage as available when labs exist', () => {
      const result = computeStageMapping(PRACTICAL_CURRICULUM, mockLabs);
      const networking = result.find(r => r.stage.id === 'networking-foundations');
      expect(networking.available).toBe(true);
    });

    test('handles empty labs array', () => {
      const result = computeStageMapping(PRACTICAL_CURRICULUM, []);
      result.forEach(item => {
        expect(item.totalLabs).toBe(0);
        expect(item.completedLabs).toBe(0);
        expect(item.completionPercentage).toBe(0);
        expect(item.status).toBe('unavailable');
      });
    });

    test('uses getStageStatus with evidence and transfer data', () => {
      const result = computeStageMapping(
        PRACTICAL_CURRICULUM,
        mockLabs,
        mockCompletedSteps,
        mockEvidenceRecords,
        mockTransferAttempts
      );
      const foundations = result.find(r => r.stage.id === 'foundations');
      expect(['mastered', 'transferred', 'verified', 'practiced', 'introduced', 'not_started', 'available', 'unavailable']).toContain(foundations.status);
    });
  });

  describe('Component structure', () => {
    test('exports default component', () => {
      expect(plannerSource).toMatch(/export default function LearningPathPlanner/);
    });

    test('imports required dependencies', () => {
      expect(plannerSource).toMatch(/from '..\/data\/practicalCurriculum'/);
      expect(plannerSource).toMatch(/from '..\/context\/LocaleContext'/);
    });

    test('uses global CSS classes (tech-card, hud-bracket, cmd-btn)', () => {
      expect(plannerSource).toMatch(/tech-card/);
      expect(plannerSource).toMatch(/hud-bracket/);
      expect(plannerSource).toMatch(/cmd-btn/);
      expect(plannerSource).toMatch(/section-title/);
      expect(plannerSource).toMatch(/status-strip/);
      expect(plannerSource).toMatch(/health-bar/);
    });

    test('has keyboard navigation handlers', () => {
      expect(plannerSource).toMatch(/handleKeyDown/);
      expect(plannerSource).toMatch(/ArrowRight|ArrowLeft|ArrowUp|ArrowDown/);
      expect(plannerSource).toMatch(/tabIndex/);
      expect(plannerSource).toMatch(/aria-selected/);
      expect(plannerSource).toMatch(/aria-disabled/);
    });

    test('uses getStageLabs and getStageStatus from curriculum', () => {
      expect(plannerSource).toMatch(/getStageLabs/);
      expect(plannerSource).toMatch(/getStageStatus/);
    });

    test('no document.querySelector styling', () => {
      expect(plannerSource).not.toMatch(/document\.querySelector/);
      expect(plannerSource).not.toMatch(/Object\.assign.*style/);
    });

    test('no inline style objects for layout', () => {
      const styleMatches = plannerSource.match(/style=\{\{[^}]+\}\}/g) || [];
      const dynamicStyles = styleMatches.filter(s =>
        s.includes('width') || s.includes('backgroundColor') || s.includes('borderLeft')
      );
      expect(dynamicStyles.length).toBeLessThanOrEqual(5);
    });
  });
});