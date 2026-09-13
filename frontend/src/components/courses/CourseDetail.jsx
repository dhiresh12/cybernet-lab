import React, { useState, useEffect } from 'react';
import { getCourse, getCourseEnrollment, updateCourseProgress } from '../../services/courseService';

const COURSE_META = {
  'ccna-foundation': { title: 'CCNA Foundation', color: 'var(--cyan)', estimatedWeeks: 6 },
  'ccna-practical': { title: 'CCNA Practical', color: 'var(--primary)', estimatedWeeks: 8 },
  'ccnp-core': { title: 'CCNP Core', color: 'var(--accent-soft)', estimatedWeeks: 10 },
  'routing': { title: 'Advanced Routing', color: 'var(--green)', estimatedWeeks: 8 },
  'network-security': { title: 'Network Security', color: 'var(--warning)', estimatedWeeks: 6 },
  'soc': { title: 'SOC Operations', color: 'var(--yellow)', estimatedWeeks: 5 },
  'research': { title: 'Research Methods', color: 'var(--text-muted)', estimatedWeeks: 12 },
};

export default function CourseDetail({ courseId, learnerId = 'default', onStartStage, onBack }) {
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getCourse(courseId).catch(() => null),
      getCourseEnrollment(courseId, learnerId).catch(() => null)
    ]).then(([c, e]) => {
      if (cancelled) return;
      setCourse(c);
      setEnrollment(e);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [courseId, learnerId]);

  async function handleCompleteStage(stageIndex) {
    setCompleting(prev => ({ ...prev, [stageIndex]: true }));
    try {
      const result = await updateCourseProgress(courseId, learnerId, { stageIndex, completed: true });
      setEnrollment(result);
    } catch (err) {
      alert(`Progress update failed: ${err.message}`);
    } finally {
      setCompleting(prev => ({ ...prev, [stageIndex]: false }));
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-6)', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ color: 'var(--cyan)', fontFamily: 'monospace' }}>Loading course...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ padding: 'var(--space-6)', maxWidth: 900, margin: '0 auto' }}>
        <div className="tech-card">
          <div style={{ color: 'var(--warning)' }}>Course not found.</div>
          <button className="cmd-btn" onClick={onBack}>Back to Catalog</button>
        </div>
      </div>
    );
  }

  const meta = COURSE_META[course.id] || { title: course.title, color: 'var(--primary)', estimatedWeeks: course.estimatedWeeks || 4 };
  const progress = enrollment?.progress || 0;
  const completedStages = new Set(enrollment?.completedStages || []);

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <button className="cmd-btn" onClick={onBack} style={{ marginBottom: 'var(--space-3)' }}>← Back to Catalog</button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div>
            <div style={{ color: meta.color, letterSpacing: '0.08em', fontSize: '0.8rem', marginBottom: 'var(--space-1)' }}>{meta.title.toUpperCase()}</div>
            <h1 style={{ color: 'var(--text)', margin: 0, fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-extrabold)' }}>{course.title}</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-2)', lineHeight: 1.6, maxWidth: 700 }}>{course.description}</p>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', textAlign: 'right' }}>{meta.estimatedWeeks} weeks · {course.stages?.length || 0} stages</div>
        </div>
        <div className="health-bar" style={{ marginTop: 'var(--space-3)' }} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="health-bar-label"><span>Course Progress</span><span>{progress}%</span></div>
          <div className="health-bar-track"><div className="health-bar-fill primary" style={{ width: `${progress}%` }} /></div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {(course.stages || []).map((stage, index) => {
          const isCompleted = completedStages.has(String(index));
          const isCompleting = completing[index];

          return (
            <div key={stage.id || index} className={`tech-card ${isCompleted ? 'completed' : ''}`} style={{ borderColor: isCompleted ? 'rgba(40,242,162,0.4)' : undefined }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isCompleted ? 'rgba(40,242,162,0.15)' : 'rgba(0,229,255,0.08)',
                    color: isCompleted ? 'var(--green)' : 'var(--cyan)', fontWeight: 'var(--font-weight-bold)', fontSize: '0.85rem'
                  }}>
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  <div>
                    <div style={{ color: 'var(--text)', fontWeight: 'var(--font-weight-semibold)' }}>{stage.title}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stage.type} · {stage.estimatedMinutes || 30} min</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                  {!isCompleted && (
                    <>
                      <button className="cmd-btn" onClick={() => onStartStage?.(stage, index)}>Start</button>
                      <button className="cmd-btn primary" onClick={() => handleCompleteStage(index)} disabled={isCompleting}>
                        {isCompleting ? 'Saving...' : 'Mark Complete'}
                      </button>
                    </>
                  )}
                  {isCompleted && <span style={{ color: 'var(--green)', fontSize: 'var(--text-sm)' }}>Completed</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
