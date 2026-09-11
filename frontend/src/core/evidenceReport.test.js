import { buildEvidenceReport, evidenceReportToMarkdown, evidenceReportToText } from './evidenceReport';

const lab = {
  id: 'lab-1',
  title: 'Verify VLAN',
  level: 'basic',
  category: 'switching',
  description: 'Build a VLAN',
  steps: [{ stepId: 'step-1' }, { stepId: 'step-2' }],
  labGuide: { objective: { whatToBuild: 'Create and verify a VLAN.' } },
};

test('builds a sanitized report with completion and verification metadata', () => {
  const report = buildEvidenceReport({
    lab,
    progress: { completedSteps: ['step-1'] },
    evidenceRecords: [{
      labId: 'lab-1',
      stepId: 'step-1',
      eventType: 'verification',
      verificationType: 'state_check',
      passed: true,
      attempts: 2,
      failedAttempts: 1,
      resultMessage: 'VLAN exists',
      expected: { vlanId: 10 },
      actual: { vlanId: 10 },
      evidence: 'show vlan',
      affectedDeviceIds: ['switch-1'],
      limitations: [],
      verifierVersion: '1.0',
      score: 1,
    }],
    generatedAt: '2026-09-08T00:00:00.000Z',
  });

  expect(report.completion).toEqual({
    totalSteps: 2,
    completedSteps: ['step-1'],
    completedCount: 1,
  });
  expect(report.evidence[0]).toMatchObject({
    actual: { vlanId: 10 },
    verifierVersion: '1.0',
    score: 1,
  });
  expect(report.evidence[0]).not.toHaveProperty('labId');
});

test('renders markdown and text exports with empty-state handling', () => {
  const report = buildEvidenceReport({ lab, evidenceRecords: [] });
  expect(evidenceReportToMarkdown(report)).toContain('No evidence records were saved.');
  expect(evidenceReportToText(report)).not.toMatch(/^#/m);
});
