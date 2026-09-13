const API_BASE = '/api/progress';

function getLearnerId() {
  let id = localStorage.getItem('cybernet_learner_id');
  if (!id) {
    id = `learner-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem('cybernet_learner_id', id);
  }
  return id;
}

function getLabStatus(progress, labId) {
  const completed = progress.completedLabs || [];
  const labIdStr = String(labId);

  if (completed.includes(labIdStr)) return 'complete';

  const lab = window.__CYBERNET_LABS__?.find(l => String(l.id) === labIdStr);
  if (!lab) return 'locked';

  const prerequisites = (lab.prerequisites || []).map(String);
  const allComplete = prerequisites.every(preReq => completed.includes(preReq));

  if (!allComplete) return 'locked';

  if (progress.currentLab === labIdStr) return 'in_progress';

  return 'available';
}

function getLockReason(progress, labId) {
  const completed = progress.completedLabs || [];
  const lab = window.__CYBERNET_LABS__?.find(l => String(l.id) === String(labId));
  if (!lab) return 'Lab not found';

  const prerequisites = (lab.prerequisites || []).map(String);
  const incomplete = prerequisites.filter(preReq => !completed.includes(preReq));

  if (incomplete.length > 0) {
    return `Complete ${incomplete.join(', ')} first`;
  }

  return 'Lab is locked';
}

function buildPrerequisiteGraph(labsList) {
  const graph = new Map();
  const labMap = new Map();
  (labsList || []).forEach(lab => {
    const labId = String(lab.id);
    labMap.set(labId, lab);
    graph.set(labId, (lab.prerequisites || []).map(String));
  });
  return { graph, labMap };
}

async function fetchProgress(learnerId) {
  const res = await fetch(`${API_BASE}/${encodeURIComponent(learnerId)}`);
  if (!res.ok) throw new Error('Failed to fetch progress');
  return res.json();
}

async function fetchLabProgress(learnerId, labId) {
  const res = await fetch(`${API_BASE}/${encodeURIComponent(learnerId)}/lab/${encodeURIComponent(labId)}`);
  if (!res.ok) throw new Error('Failed to fetch lab progress');
  return res.json();
}

async function startLab(learnerId, labId) {
  const res = await fetch(`${API_BASE}/${encodeURIComponent(learnerId)}/start/${encodeURIComponent(labId)}`, {
    method: 'POST'
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to start lab');
  }
  return res.json();
}

async function completeLab(learnerId, labId, contract) {
  const res = await fetch(`${API_BASE}/${encodeURIComponent(learnerId)}/complete/${encodeURIComponent(labId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contract || {})
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = Array.isArray(data.errors) ? data.errors.join(', ') : (data.error || 'Failed to complete lab');
    throw new Error(msg);
  }
  return res.json();
}

async function fetchAvailableLabs(learnerId) {
  const res = await fetch(`${API_BASE}/${encodeURIComponent(learnerId)}/available`);
  if (!res.ok) throw new Error('Failed to fetch available labs');
  return res.json();
}

async function fetchLockedLabs(learnerId) {
  const res = await fetch(`${API_BASE}/${encodeURIComponent(learnerId)}/locked`);
  if (!res.ok) throw new Error('Failed to fetch locked labs');
  return res.json();
}

export const progressEngine = {
  getLearnerId,
  getLabStatus,
  getLockReason,
  buildPrerequisiteGraph,
  fetchProgress,
  fetchLabProgress,
  startLab,
  completeLab,
  fetchAvailableLabs,
  fetchLockedLabs
};
