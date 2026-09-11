import { buildEngineerReport, scoreEngineerTicket } from './engineerReport';

const scenario = {
  id: 'ticket-1',
  title: 'Synthetic outage',
  severity: 'P2',
  timeWindow: '30 minutes',
  tasks: ['Inspect', 'Fix'],
  allowedTools: ['Terminal'],
  prohibitedActions: ['External access'],
};

test('scores complete authorized ticket evidence', () => {
  const notes = {
    hypotheses: 'Route or interface issue',
    evidence: 'show route on R1',
    change: 'Restore the missing route',
    rollback: 'Remove the route and restore baseline',
    verification: 'Independent ping succeeds',
    debrief: 'Root cause was a missing route; add a review gate',
  };
  expect(scoreEngineerTicket({
    scenario,
    authorizationConfirmed: true,
    completedTaskIndexes: [0, 1],
    notes,
  })).toMatchObject({ score: 10, passed: true });
});

test('report preserves scope and makes incomplete work explicit', () => {
  const report = buildEngineerReport({
    scenario,
    attempt: { authorizationConfirmed: false, completedTaskIndexes: [], notes: {} },
    generatedAt: '2026-09-08T00:00:00.000Z',
  });
  expect(report.scenario.prohibitedActions).toEqual(['External access']);
  expect(report.scoring.passed).toBe(false);
  expect(report.limitations[0]).toContain('synthetic training ticket');
});
