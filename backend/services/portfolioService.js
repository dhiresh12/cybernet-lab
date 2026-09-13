const { v4: uuidv4 } = require('uuid');
const { portfolioArtifacts } = require('../state/state');

function getPortfolioItems(learnerId) {
  const key = String(learnerId);
  return portfolioArtifacts.get(key) || [];
}

function getPortfolioItem(artifactId, learnerId) {
  const key = String(learnerId);
  const items = portfolioArtifacts.get(key) || [];
  return items.find(item => item.id === artifactId && item.learnerId === key);
}

function createArtifact(learnerId, artifact) {
  const key = String(learnerId);
  const list = portfolioArtifacts.get(key) || [];
  const entry = {
    id: uuidv4(),
    learnerId: key,
    type: artifact.type || 'lab_report',
    title: artifact.title || 'Untitled',
    content: artifact.content || {},
    labId: artifact.labId || null,
    tags: artifact.tags || [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  list.push(entry);
  portfolioArtifacts.set(key, list);
  return entry;
}

function updateArtifact(artifactId, learnerId, updates) {
  const key = String(learnerId);
  const list = portfolioArtifacts.get(key) || [];
  const index = list.findIndex(item => item.id === artifactId && item.learnerId === key);
  if (index === -1) return null;
  const updated = {
    ...list[index],
    ...updates,
    id: list[index].id,
    learnerId: key,
    updatedAt: Date.now()
  };
  list[index] = updated;
  portfolioArtifacts.set(key, list);
  return updated;
}

function deleteArtifact(artifactId, learnerId) {
  const key = String(learnerId);
  const list = portfolioArtifacts.get(key) || [];
  const index = list.findIndex(item => item.id === artifactId && item.learnerId === key);
  if (index === -1) return false;
  list.splice(index, 1);
  portfolioArtifacts.set(key, list);
  return true;
}

function exportJSON(learnerId) {
  const items = getPortfolioItems(learnerId);
  return JSON.stringify({ learnerId, exportedAt: Date.now(), count: items.length, items }, null, 2);
}

function exportPDF(learnerId) {
  const items = getPortfolioItems(learnerId);
  const lines = [
    `CyberNet Lab Portfolio`,
    `Learner: ${learnerId}`,
    `Exported: ${new Date().toISOString()}`,
    `Artifacts: ${items.length}`,
    '',
    items.map((item, idx) => {
      const tags = Array.isArray(item.tags) ? item.tags.join(', ') : String(item.tags || '');
      return [
        `#${idx + 1} ${item.title}`,
        `Type: ${item.type}`,
        `Lab: ${item.labId || 'N/A'}`,
        `Tags: ${tags || 'N/A'}`,
        `Created: ${new Date(item.createdAt).toISOString()}`,
        `Content: ${JSON.stringify(item.content || {})}`,
        ''
      ].join('\n');
    }).join('\n')
  ];
  return Buffer.from(lines.join('\n'), 'utf-8');
}

module.exports = {
  getPortfolioItems,
  getPortfolioItem,
  createArtifact,
  updateArtifact,
  deleteArtifact,
  exportJSON,
  exportPDF
};
