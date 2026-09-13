import React, { useState } from 'react';
import { updateCourseProgress } from '../../services/courseService';

export default function AssessmentComponent({ courseId, stage, stageIndex, learnerId = 'default', onComplete, onBack }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const questions = stage?.questions || [
    { id: 'q1', text: 'Which command verifies OSPF neighbor state?', options: ['show ip ospf neighbor', 'show ip route', 'show interfaces', 'show cdp neighbors'], correct: 0 },
    { id: 'q2', text: 'What does a VLAN provide?', options: ['Collision domain segmentation', 'Broadcast domain segmentation', 'Physical separation', 'Power over Ethernet'], correct: 1 },
  ];

  function handleAnswer(questionId, optionIndex) {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  }

  function calculateScore() {
    let correct = 0;
    questions.forEach(q => { if (answers[q.id] === q.correct) correct++; });
    return Math.round((correct / questions.length) * 100);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const result = await updateCourseProgress(courseId, learnerId, { stageIndex, completed: true, score: calculateScore() });
      const finalScore = calculateScore();
      setScore(finalScore);
      setFeedback(finalScore >= 70 ? 'Assessment passed.' : 'Review the material and retry.');
      setSubmitted(true);
      onComplete?.(result);
    } catch (err) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 900, margin: '0 auto' }}>
      <button className="cmd-btn" onClick={onBack} style={{ marginBottom: 'var(--space-3)' }}>← Back to Course</button>
      <div style={{ color: 'var(--cyan)', letterSpacing: '0.08em', fontSize: '0.8rem', marginBottom: 'var(--space-1)' }}>ASSESSMENT</div>
      <h1 style={{ color: 'var(--text)', margin: '0 0 var(--space-4)', fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-extrabold)' }}>{stage?.title || 'Practical Assessment'}</h1>
      <div style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)', lineHeight: 1.6 }}>Answer all questions to complete the assessment. A passing score is 70%.</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {questions.map((q, qIndex) => (
          <div key={q.id} className="tech-card">
            <div style={{ color: 'var(--text)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-2)' }}>{qIndex + 1}. {q.text}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {q.options.map((option, oIndex) => {
                const selected = answers[q.id] === oIndex;
                const isCorrect = submitted && oIndex === q.correct;
                const isWrong = submitted && selected && !isCorrect;
                return (
                  <button
                    key={oIndex}
                    className={`cmd-btn ${selected ? 'primary' : ''} ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                    onClick={() => !submitted && handleAnswer(q.id, oIndex)}
                    disabled={submitted}
                    style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                  >
                    <span style={{ marginRight: 8, opacity: 0.7 }}>{String.fromCharCode(65 + oIndex)}.</span>
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {submitted && (
        <div className="tech-card" style={{ marginTop: 'var(--space-4)', borderColor: score >= 70 ? 'rgba(40,242,162,0.5)' : 'rgba(255,107,129,0.5)' }}>
          <div style={{ color: score >= 70 ? 'var(--green)' : 'var(--warning)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-1)' }}>
            Score: {score}% — {feedback}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>You answered {questions.filter(q => answers[q.id] === q.correct).length} of {questions.length} correctly.</div>
        </div>
      )}

      <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        {!submitted ? (
          <button className="cmd-btn primary" onClick={handleSubmit} disabled={submitting || Object.keys(answers).length !== questions.length}>
            {submitting ? 'Submitting...' : 'Submit Assessment'}
          </button>
        ) : (
          <button className="cmd-btn primary" onClick={onBack}>Return to Course</button>
        )}
        <button className="cmd-btn" onClick={onBack}>Cancel</button>
      </div>
    </div>
  );
}
