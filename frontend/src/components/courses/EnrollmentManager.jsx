import React, { useState, useEffect } from 'react';
import { listCourses, enrollInCourse, getCourseEnrollment } from '../../services/courseService';

const COURSE_META = {
  'ccna-foundation': { title: 'CCNA Foundation', color: 'var(--cyan)', estimatedWeeks: 6 },
  'ccna-practical': { title: 'CCNA Practical', color: 'var(--primary)', estimatedWeeks: 8 },
  'ccnp-core': { title: 'CCNP Core', color: 'var(--accent-soft)', estimatedWeeks: 10 },
  'routing': { title: 'Advanced Routing', color: 'var(--green)', estimatedWeeks: 8 },
  'network-security': { title: 'Network Security', color: 'var(--warning)', estimatedWeeks: 6 },
  'soc': { title: 'SOC Operations', color: 'var(--yellow)', estimatedWeeks: 5 },
  'research': { title: 'Research Methods', color: 'var(--text-muted)', estimatedWeeks: 12 },
};

export default function EnrollmentManager({ learnerId = 'default', onSelectCourse }) {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listCourses()
      .then(data => {
        if (cancelled) return;
        const list = data.courses || [];
        setCourses(list);
        return Promise.all(list.map(c => fetchEnrollment(c.id, learnerId)));
      })
      .then(results => {
        if (cancelled) return;
        const map = {};
        results.forEach(({ courseId, enrollment }) => {
          if (enrollment) map[courseId] = enrollment;
        });
        setEnrollments(map);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [learnerId]);

  async function fetchEnrollment(courseId, lid) {
    try {
      const enrollment = await getCourseEnrollment(courseId, lid);
      return { courseId, enrollment };
    } catch {
      return { courseId, enrollment: null };
    }
  }

  async function handleEnroll(courseId) {
    setActionId(courseId);
    try {
      const enrollment = await enrollInCourse(courseId, learnerId);
      setEnrollments(prev => ({ ...prev, [courseId]: enrollment }));
    } catch (err) {
      alert(`Enrollment failed: ${err.message}`);
    } finally {
      setActionId(null);
    }
  }

  async function handleUnenroll(courseId) {
    setActionId(courseId);
    try {
      await new Promise((resolve, reject) => {
        fetch(`/api/courses/${courseId}/enrollment/${learnerId}`, { method: 'DELETE' })
          .then(r => r.ok ? resolve() : reject(new Error('Delete failed')))
          .catch(reject);
      });
      setEnrollments(prev => {
        const next = { ...prev };
        delete next[courseId];
        return next;
      });
    } catch (err) {
      alert(`Unenroll failed: ${err.message}`);
    } finally {
      setActionId(null);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-6)', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ color: 'var(--cyan)', fontFamily: 'monospace' }}>Loading enrollments...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ color: 'var(--cyan)', letterSpacing: '0.08em', fontSize: '0.8rem', marginBottom: 'var(--space-1)' }}>MANAGE LEARNING</div>
      <h1 style={{ color: 'var(--text)', margin: '0 0 var(--space-4)', fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-extrabold)' }}>Enrollment Manager</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {courses.map(course => {
          const meta = COURSE_META[course.id] || { title: course.title, color: 'var(--primary)', estimatedWeeks: course.estimatedWeeks || 4 };
          const enrollment = enrollments[course.id];
          const isEnrolled = Boolean(enrollment);
          const progress = enrollment?.progress || 0;

          return (
            <div key={course.id} className="tech-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: isEnrolled ? 'var(--green)' : 'var(--text-muted)' }} />
                  <div>
                    <div style={{ color: 'var(--text)', fontWeight: 'var(--font-weight-semibold)' }}>{meta.title}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>{meta.estimatedWeeks} weeks · {progress}% complete</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  {isEnrolled ? (
                    <>
                      <button className="cmd-btn primary" onClick={() => onSelectCourse?.(course.id)}>Continue</button>
                      <button className="cmd-btn" onClick={() => handleUnenroll(course.id)} disabled={actionId === course.id}>Unenroll</button>
                    </>
                  ) : (
                    <button className="cmd-btn primary" onClick={() => handleEnroll(course.id)} disabled={actionId === course.id}>
                      {actionId === course.id ? 'Processing...' : 'Enroll'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {courses.length === 0 && <div className="tech-card"><div style={{ color: 'var(--text-muted)' }}>No courses available.</div></div>}
    </div>
  );
}
