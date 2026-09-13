const API_BASE = '/api/qa';

async function getQaStatus() {
  const res = await fetch(`${API_BASE}/status`);
  if (!res.ok) throw new Error('Failed to fetch QA status');
  return res.json();
}

async function runQaCheck() {
  const res = await fetch(`${API_BASE}/run`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to run QA check');
  return res.json();
}

export const qaApi = {
  getQaStatus,
  runQaCheck
};
