/**
 * Learner-facing catalog metadata.
 *
 * This is deliberately derived from normalized labs so the explorer, progress
 * views, and backend-facing documentation do not invent a second lab count or
 * capability definition.
 */
export function toCatalogRecord(lab) {
  return {
    id: String(lab.id),
    title: lab.title,
    category: lab.category,
    level: lab.level || lab.difficulty,
    source: lab.source || 'unknown',
    qualityStatus: lab.qualityStatus || 'review',
    estimatedMinutes: parseEstimatedMinutes(lab.estimatedTime),
    backend: {
      type: lab.backendProfile?.type || 'browser-simulation',
      fidelity: lab.backendProfile?.fidelity || 'concept',
      unsupportedCommands: lab.backendProfile?.unsupportedCommands || []
    },
    capabilities: {
      ...(lab.capabilitySummary || {}),
      topology: Boolean(lab.topology?.devices?.length || lab.topology?.connections?.length),
      requiredDevices: Boolean(lab.labGuide?.requiredDevices?.length),
      verification: Boolean(lab.steps?.some(step => step.verification?.type)),
      questions: Array.isArray(lab.knowledgeCheck) && lab.knowledgeCheck.length >= 15
    }
  };
}

function parseEstimatedMinutes(value) {
  const match = String(value || '').match(/\d+/);
  return match ? Number(match[0]) : null;
}

export function buildCatalogManifest(labs) {
  const records = (Array.isArray(labs) ? labs : []).map(toCatalogRecord);
  const duplicateIds = records
    .map(record => record.id)
    .filter((id, index, ids) => ids.indexOf(id) !== index);

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    total: records.length,
    uniqueTotal: new Set(records.map(record => record.id)).size,
    duplicateIds: [...new Set(duplicateIds)],
    levels: records.reduce((counts, record) => {
      counts[record.level] = (counts[record.level] || 0) + 1;
      return counts;
    }, {}),
    quality: records.reduce((counts, record) => {
      counts[record.qualityStatus] = (counts[record.qualityStatus] || 0) + 1;
      return counts;
    }, {}),
    records
  };
}
