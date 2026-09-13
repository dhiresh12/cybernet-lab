import React, { useState, useEffect } from 'react';
import { listCourses, getCourse, enrollInCourse } from '../../services/courseService';

const COURSE_META = {
  'ccna-foundation': { title: 'CCNA Foundation', icon: '◈', color: 'var(--cyan)', estimatedWeeks: 6, level: 'beginner' },
  'ccna-practical': { title: 'CCNA Practical', icon: '◉', color: 'var(--primary)', estimatedWeeks: 8, level: 'intermediate' },
  'ccnp-core': { title: 'CCNP Core', icon: '◆', color: 'var(--accent-soft)', estimatedWeeks: 10, level: 'advanced' },
  'routing': { title: 'Advanced Routing', icon: '◇', color: 'var(--green)', estimatedWeeks: 8, level: 'advanced' },
  'network-security': { title: 'Network Security', icon: '🛡', color: 'var(--warning)', estimatedWeeks: 6, level: 'intermediate' },
  'soc': { title: 'SOC Operations', icon: '◎', color: 'var(--yellow)', estimatedWeeks: 5, level: 'intermediate' },
  'research': { title: 'Research Methods', icon: '🔬', color: 'var(--text-muted)', estimatedWeeks: 12, level: 'advanced' },
};

export default function CourseCatalog({ onSelectCourse, learnerId = 'default' }) {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listCourses()
      .then(data => {
        if (cancelled) return;
        const list = data.courses || [];
        setCourses(list);
        return Promise.all(list.map(c => getCourseEnrollmentSafe(c.id, learnerId)));
      })
      .then(enrollmentMap => {
        if (cancelled) return;
        const map = {};
        enrollmentMap.forEach((enrollment, courseId) => {
          if (enrollment) map[courseId] = enrollment;
        });
        setEnrollments(map);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err.message);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [learnerId]);

  async function getCourseEnrollmentSafe(courseId, lid) {
    try {
      const data = await getCourseEnrollment(courseId, lid);
      return [courseId, data];
    } catch {
      return [courseId, null];
    }
  }

  async function handleEnroll(courseId) {
    setEnrolling(prev => ({ ...prev, [courseId]: true }));
    try {
      const enrollment = await enrollInCourse(courseId, learnerId);
      setEnrollments(prev => ({ ...prev, [courseId]: enrollment }));
    } catch (err) {
      alert(`Enrollment failed: ${err.message}`);
    } finally {
      setEnrolling(prev => ({ ...prev, [courseId]: false }));
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-6)', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ color: 'var(--cyan)', fontFamily: 'monospace' }}>Loading courses...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div>
          <div style={{ color: 'var(--cyan)', letterSpacing: '0.08em', fontSize: '0.8rem', marginBottom: 'var(--space-1)' }}>LEARNING PATHWAYS</div>
          <h1 style={{ color: 'var(--text)', margin: 0, fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-extrabold)' }}>Course Catalog</h1>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>{courses.length} courses available</div>
      </div>

      {error && (
        <div className="tech-card" style={{ marginBottom: 'var(--space-4)', borderColor: 'rgba(255,107,129,0.5)' }}>
          <div style={{ color: 'var(--warning)' }}>Catalog error: {error}</div>
          <button className="cmd-btn" onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-3)' }}>
        {courses.map(course => {
          const meta = COURSE_META[course.id] || { title: course.title, icon: '◈', color: 'var(--primary)', estimatedWeeks: course.estimatedWeeks || 4, level: 'intermediate' };
          const enrollment = enrollments[course.id];
          const isEnrolled = Boolean(enrollment);
          const progress = enrollment?.progress || 0;

          return (
            <div key={course.id} className="tech-card" style={{ cursor: 'pointer', borderColor: progress > 0 ? 'rgba(0,229,255,0.4)' : undefined }} onClick={() => onSelectCourse?.(course.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelectCourse?.(course.id); } }} role="button" tabIndex={0} aria-label={`Open ${meta.title} course`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{ color: meta.color, fontSize: '1.4rem' }}>{meta.icon}</span>
                  <div>
                    <div style={{ color: 'var(--text)', fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-base)' }}>{meta.title}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{meta.level} · {meta.estimatedWeeks} weeks</div>
                  </div>
                </div>
                {isEnrolled && <span className="badge" style={{ background: 'rgba(0,229,255,0.15)', color: 'var(--cyan)', border: '1px solid rgba(0,229,255,0.3)' }}>{progress}%</span>}
              </div>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}>{course.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>{course.stageCount || course.stages?.length || 0} stages</div>
                {!isEnrolled ? (
                  <button className="cmd-btn primary" onClick={(e) => { e.stopPropagation(); handleEnroll(course.id); }} disabled={enrolling[course.id]}>
                    {enrolling[course.id] ? 'Enrolling...' : 'Enroll'}
                  </button>
                ) : (
                  <button className="cmd-btn primary" onClick={(e) => { e.stopPropagation(); onSelectCourse?.(course.id); }}>Continue</button>
                )}
              </div>
              {isEnrolled && (
                <div className="health-bar" style={{ marginTop: 'var(--space-3)' }} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                  <div className="health-bar-track"><div className="health-bar-fill primary" style={{ width: `${progress}%` }} /></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {courses.length === 0 && !error && (
        <div className="tech-card">
          <div style={{ color: 'var(--text-muted)' }}>No courses available yet.</div>
        </div>
      )}
    </div>
  );
}
