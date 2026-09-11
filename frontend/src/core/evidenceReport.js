const EMPTY = 'Not recorded';

function text(value) {
  if (value === null || value === undefined || value === '') return EMPTY;
  return String(value);
}

function list(value) {
  return Array.isArray(value) && value.length ? value : [EMPTY];
}

export function buildEvidenceReport({ lab, progress = {}, evidenceRecords = [], generatedAt = new Date().toISOString() }) {
  const steps = Array.isArray(lab?.steps) ? lab.steps : [];
  const completedSteps = new Set(progress.completedSteps || []);
  const records = evidenceRecords.map(record => ({
    stepId: text(record.stepId),
    eventType: text(record.eventType),
    verificationType: text(record.verificationType),
    passed: Boolean(record.passed),
    attempts: record.attempts || 0,
    failedAttempts: record.failedAttempts || 0,
    resultMessage: text(record.resultMessage),
    expected: record.expected ?? null,
    actual: record.actual ?? null,
    evidence: text(record.evidence),
    affectedDeviceIds: list(record.affectedDeviceIds),
    limitations: list(record.limitations),
    hint: text(record.hint),
    verifierVersion: text(record.verifierVersion),
    score: record.score ?? null,
    prediction: text(record.prediction),
    explanation: text(record.explanation),
    savedAt: text(record.savedAt),
  }));

  return {
    reportVersion: '1.0',
    generatedAt,
    lab: {
      id: text(lab?.id),
      title: text(lab?.title),
      level: text(lab?.level),
      category: text(lab?.category),
      objective: text(lab?.labGuide?.objective?.whatToBuild || lab?.description),
    },
    completion: {
      totalSteps: steps.length,
      completedSteps: steps.filter(step => completedSteps.has(step.stepId)).map(step => step.stepId),
      completedCount: steps.filter(step => completedSteps.has(step.stepId)).length,
    },
    evidence: records,
    limitations: [
      'Terminal secrets and full terminal logs are intentionally excluded from this report.',
      'Command history and before/after runtime snapshots are included only when the active runtime supplies them.',
    ],
  };
}

export function evidenceReportToMarkdown(report) {
  const { lab, completion, evidence, limitations } = report;
  const lines = [
    `# Evidence Report — ${lab.title}`,
    '',
    `- Lab ID: ${lab.id}`,
    `- Level: ${lab.level}`,
    `- Category: ${lab.category}`,
    `- Generated: ${report.generatedAt}`,
    `- Completion: ${completion.completedCount}/${completion.totalSteps} steps`,
    '',
    '## Objective',
    lab.objective,
    '',
    '## Step Evidence',
  ];

  if (!evidence.length) lines.push('', 'No evidence records were saved.');
  evidence.forEach(record => {
    lines.push(
      '',
      `### ${record.stepId}`,
      `- Event: ${record.eventType}`,
      `- Verification: ${record.verificationType}`,
      `- Result: ${record.passed ? 'Passed' : 'Failed'} (${record.resultMessage})`,
      `- Attempts: ${record.attempts} (${record.failedAttempts} failed)`,
      `- Expected: ${JSON.stringify(record.expected ?? EMPTY)}`,
      `- Actual: ${JSON.stringify(record.actual ?? EMPTY)}`,
      `- Affected devices: ${record.affectedDeviceIds.join(', ')}`,
      `- Evidence: ${record.evidence}`,
      `- Prediction: ${record.prediction}`,
      `- Explanation: ${record.explanation}`,
      `- Limitations: ${record.limitations.join('; ')}`,
    );
  });

  lines.push('', '## Report Limitations', ...limitations.map(item => `- ${item}`));
  return lines.join('\n');
}

export function evidenceReportToText(report) {
  return evidenceReportToMarkdown(report)
    .replace(/^#+\s?/gm, '')
    .replace(/^- /gm, '')
    .trim();
}
