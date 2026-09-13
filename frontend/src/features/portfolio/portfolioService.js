const API_BASE = '';

export function getLearnerId() {
  let id = localStorage.getItem('cybernet_learner_id');
  if (!id) {
    id = `learner-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem('cybernet_learner_id', id);
  }
  return id;
}

export async function fetchPortfolio(learnerId) {
  const res = await fetch(`${API_BASE}/api/portfolio/${encodeURIComponent(learnerId)}`);
  if (!res.ok) throw new Error('Failed to fetch portfolio');
  const data = await res.json();
  return data.artifacts || [];
}

export async function addPortfolioArtifact(learnerId, artifact) {
  const res = await fetch(`${API_BASE}/api/portfolio/${encodeURIComponent(learnerId)}/artifacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(artifact)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to save artifact');
  }
  return res.json();
}

export async function updatePortfolioArtifact(learnerId, artifactId, updates) {
  const res = await fetch(`${API_BASE}/api/portfolio/${encodeURIComponent(learnerId)}/artifacts/${encodeURIComponent(artifactId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update artifact');
  }
  return res.json();
}

export async function deletePortfolioArtifact(learnerId, artifactId) {
  const res = await fetch(`${API_BASE}/api/portfolio/${encodeURIComponent(learnerId)}/artifacts/${encodeURIComponent(artifactId)}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete artifact');
  }
  return res.json();
}
