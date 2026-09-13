import React, { useState, useEffect } from 'react';
import { listCourses, getCourseEnrollment } from '../../services/courseService';

export default function ProgressTracker({ learnerId = 'default' }) {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listCourses()
      .then(data => {
        if (cancelled) return;
        const list = data.courses || [];
        setCourses(list);
        return Promise.all(list.map(c => getCourseEnrollment(c.id, learnerId).then(e => ({ courseId: c.id, enrollment: e })).catch(() => ({ courseId: c.id, enrollment: null }))));
      })
      .then(results => {
        if (cancelled) return;
        const map = {};
        results.forEach(({ courseId, enrollment }) => { if (enrollment) map[courseId] = enrollment; });
        setEnrollments(map);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [learnerId]);

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-6)', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ color: 'var(--cyan)', fontFamily: 'monospace' }}>Loading progress...</div>
      </div>
    );
  }

  const enrolled = courses.filter(c => enrollments[c.id]);
  const totalProgress = enrolled.length > 0 ? Math.round(enrolled.reduce((sum, c) => sum + (enrollments[c.id]?.progress || 0), 0) / enrolled.length) : 0;

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ color: 'var(--cyan)', letterSpacing: '0.08em', fontSize: '0.8rem', marginBottom: 'var(--space-1)' }}>LEARNING METRICS</div>
      <h1 style={{ color: 'var(--text)', margin: '0 0 var(--space-4)', fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-extrabold)' }}>Progress Tracker</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        <div className="metric-tile">
          <div className="metric-tile-label">Enrolled</div>
          <div className="metric-tile-value accent">{enrolled.length}</div>
        </div>
        <div className="metric-tile">
          <div className="metric-tile-label">Avg Progress</div>
          <div className="metric-tile-value">{totalProgress}%</div>
        </div>
        <div className="metric-tile">
          <div className="metric-tile-label">Completed</div>
          <div className="metric-tile-value success">{enrolled.filter(c => (enrollments[c.id]?.progress || 0) === 100).length}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {enrolled.map(course => {
          const enrollment = enrollments[course.id];
          const progress = enrollment?.progress || 0;
          return (
            <div key={course.id} className="tech-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ color: 'var(--text)', fontWeight: 'var(--font-weight-semibold)' }}>{course.title}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>Stage {enrollment?.currentStage || 0} · {enrollment?.completedStages?.length || 0} completed</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minWidth: 140 }}>
                  <div className="health-bar" style={{ flex: 1 }} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                    <div className="health-bar-track"><div className="health-bar-fill primary" style={{ width: `${progress}%` }} /></div>
                  </div>
                  <span style={{ color: 'var(--text)', fontSize: 'var(--text-xs)', minWidth: 36, textAlign: 'right' }}>{progress}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {enrolled.length === 0 && (
        <div className="tech-card">
          <div style={{ color: 'var(--text-muted)' }}>No active enrollments. Enroll in a course to track progress.</div>
        </div>
      )}
    </div>
  );
}
