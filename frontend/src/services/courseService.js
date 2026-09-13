const API_BASE = '/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  if (!response.ok) {
    const text = await response.text();
    let error = text;
    try { error = JSON.parse(text).error || text; } catch {}
    throw new Error(error || `Request failed (${response.status})`);
  }
  if (response.status === 204) return null;
  return response.json();
}

export function listCourses() {
  return request('/courses');
}

export function getCourse(courseId) {
  return request(`/courses/${courseId}`);
}

export function enrollInCourse(courseId, learnerId) {
  return request(`/courses/${courseId}/enroll/${learnerId}`, { method: 'POST' });
}

export function updateCourseProgress(courseId, learnerId, stageProgress) {
  return request(`/courses/${courseId}/progress/${learnerId}`, { method: 'PUT', body: JSON.stringify(stageProgress) });
}

export function getCourseEnrollment(courseId, learnerId) {
  return request(`/courses/${courseId}/enrollment/${learnerId}`);
}
