const API_BASE = '/api/interview';

function getLearnerId() {
  let id = localStorage.getItem('cybernet_learner_id');
  if (!id) {
    id = `learner-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem('cybernet_learner_id', id);
  }
  return id;
}

export async function fetchRoleQuestions(role, level) {
  const url = level != null ? `${API_BASE}/role/${encodeURIComponent(role)}/${encodeURIComponent(level)}` : `${API_BASE}/role/${encodeURIComponent(role)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load interview questions');
  return res.json();
}

export async function createSession(role) {
  const learnerId = getLearnerId();
  const res = await fetch(`${API_BASE}/${encodeURIComponent(learnerId)}/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to create interview session');
  }
  return res.json();
}

export async function submitAnswer(sessionId, questionId, answer) {
  const res = await fetch(`${API_BASE}/${encodeURIComponent(sessionId)}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionId, answer })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to submit answer');
  }
  return res.json();
}

export async function fetchHistory(learnerId) {
  const id = learnerId || getLearnerId();
  const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}/history`);
  if (!res.ok) throw new Error('Failed to load interview history');
  return res.json();
}

export async function fetchRecommendations(learnerId) {
  const id = learnerId || getLearnerId();
  const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}/recommendations`);
  if (!res.ok) throw new Error('Failed to load recommendations');
  return res.json();
}

export async function fetchWeakAreas(learnerId) {
  const id = learnerId || getLearnerId();
  const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}/weak-areas`);
  if (!res.ok) throw new Error('Failed to load weak areas');
  return res.json();
}
