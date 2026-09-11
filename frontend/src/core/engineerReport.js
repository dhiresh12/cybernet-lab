export function scoreEngineerTicket({ scenario, authorizationConfirmed, completedTaskIndexes = [], notes = {} }) {
  const requiredFields = ['hypotheses', 'evidence', 'change', 'rollback', 'debrief', 'verification'];
  const evidencePoints = requiredFields.reduce((total, field) =>
    total + (String(notes[field] || '').trim().length >= 10 ? 1 : 0), 0);
  const taskPoints = scenario?.tasks?.length
    ? Math.round((completedTaskIndexes.length / scenario.tasks.length) * 5)
    : 0;
  const authorizationPoints = authorizationConfirmed ? 1 : 0;
  const total = Math.min(10, evidencePoints + taskPoints + authorizationPoints);
  return {
    score: total,
    maxScore: 10,
    rubric: {
      authorization: authorizationPoints,
      taskCompletion: taskPoints,
      evidenceQuality: evidencePoints,
    },
    passed: Boolean(authorizationConfirmed && completedTaskIndexes.length === scenario?.tasks?.length && evidencePoints === requiredFields.length),
  };
}

export function buildEngineerReport({ scenario, attempt, generatedAt = new Date().toISOString() }) {
  const scoring = scoreEngineerTicket({
    scenario,
    authorizationConfirmed: attempt?.authorizationConfirmed,
    completedTaskIndexes: attempt?.completedTaskIndexes,
    notes: attempt?.notes,
  });
  return {
    reportVersion: '1.0',
    generatedAt,
    scenario: {
      id: scenario?.id || '',
      title: scenario?.title || '',
      severity: scenario?.severity || 'unspecified',
      timeWindow: scenario?.timeWindow || 'unspecified',
      allowedTools: scenario?.allowedTools || [],
      prohibitedActions: scenario?.prohibitedActions || [],
    },
    authorizationConfirmed: Boolean(attempt?.authorizationConfirmed),
    completedTasks: attempt?.completedTaskIndexes || [],
    notes: attempt?.notes || {},
    scoring,
    limitations: ['This is an authorized synthetic training ticket; it does not validate changes on external systems.'],
  };
}

export function engineerReportToMarkdown(report) {
  const { scenario, scoring, notes } = report;
  return [
    `# Engineer Ticket Report — ${scenario.title}`,
    '',
    `- Scenario: ${scenario.id}`,
    `- Severity: ${scenario.severity}`,
    `- Time window: ${scenario.timeWindow}`,
    `- Authorized synthetic scope: ${report.authorizationConfirmed ? 'Yes' : 'No'}`,
    `- Score: ${scoring.score}/${scoring.maxScore}`,
    `- Passed: ${scoring.passed ? 'Yes' : 'No'}`,
    '',
    '## Allowed tools',
    ...scenario.allowedTools.map(item => `- ${item}`),
    '',
    '## Prohibited actions',
    ...scenario.prohibitedActions.map(item => `- ${item}`),
    '',
    '## Ticket notes',
    ...Object.entries(notes).map(([key, value]) => `### ${key}\n${value || 'Not recorded'}`),
    '',
    '## Limitations',
    ...report.limitations.map(item => `- ${item}`),
  ].join('\n');
}
