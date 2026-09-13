import React, { useState, useEffect, useRef } from 'react';

const LEVEL_LABELS = ['What is', 'Why', 'How', 'Configure', 'Verify', 'Troubleshoot', 'Design', 'Defend', 'Lead'];

export default function InterviewSession({ session, questions, onSubmit, onComplete, onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    setCurrentIndex(0);
    setAnswer('');
    setSubmitted(false);
    setResult(null);
    setError('');
  }, [session?.id]);

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex >= questions.length - 1;

  const handleSubmit = async () => {
    if (!answer.trim() || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await onSubmit(session.id, currentQuestion.id || `${session.id}-${currentQuestion.level}`, answer);
      setResult(res.answer);
      setSubmitted(true);
      if (res.sessionStatus === 'completed') {
        onComplete();
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setAnswer('');
      setSubmitted(false);
      setResult(null);
      setError('');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setAnswer('');
      setSubmitted(false);
      setResult(null);
      setError('');
    }
  };

  const handleFinish = () => {
    onComplete();
  };

  if (!currentQuestion) {
    return (
      <div className="tech-card">
        <div style={{ color: 'var(--text-muted)' }}>No questions available for this session.</div>
        <button className="cmd-btn" onClick={onBack} style={{ marginTop: 'var(--space-3)' }}>Back</button>
      </div>
    );
  }

  const progress = ((currentIndex + (submitted ? 1 : 0)) / questions.length) * 100;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <div>
          <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Question </span>
          <strong style={{ color: 'var(--text)' }}>{currentIndex + 1}</strong>
          <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}> of {questions.length}</span>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
          Level {currentQuestion.level}: {LEVEL_LABELS[currentQuestion.level - 1] || ''}
        </div>
      </div>

      <div style={{ width: '100%', height: 6, background: 'var(--surface)', borderRadius: 3, marginBottom: 'var(--space-4)', overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: 'var(--cyan)', borderRadius: 3, transition: 'width 0.3s ease' }} />
      </div>

      <div className="tech-card" style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ color: 'var(--cyan)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
          L{currentQuestion.level}: {LEVEL_LABELS[currentQuestion.level - 1]} — {currentQuestion.topic}
        </div>
        <p style={{ color: 'var(--text)', fontSize: 'var(--text-lg)', lineHeight: 1.6, marginBottom: 'var(--space-3)' }}>
          {currentQuestion.question}
        </p>
        <textarea
          ref={textareaRef}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={6}
          placeholder="Write your answer as if speaking to an interviewer..."
          disabled={submitted}
          style={{ width: '100%', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 6, padding: 10, fontFamily: 'var(--font-mono)', fontSize: '0.85em', resize: 'vertical' }}
        />
        {error && (
          <div style={{ marginTop: 'var(--space-2)', color: 'var(--red)', fontSize: 'var(--text-sm)' }}>{error}</div>
        )}
        {submitted && result && (
          <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: 'rgba(0,229,255,0.05)', border: '1px solid var(--panel-border-subtle)', borderRadius: 6 }}>
            <div style={{ color: 'var(--cyan)', fontWeight: 'var(--font-weight-bold)', marginBottom: 8 }}>Answer Evaluation</div>
            <div style={{ color: 'var(--text-muted)', marginBottom: 8 }}>
              Score: <strong style={{ color: result.score >= 70 ? 'var(--green)' : 'var(--yellow)' }}>{result.score}%</strong>
              ({result.matchedKeywords?.length || 0} of {result.totalKeywords} concepts covered)
            </div>
            {result.matchedKeywords?.length > 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 8 }}>
                Covered: {result.matchedKeywords.join(', ')}
              </div>
            )}
            {result.totalKeywords > (result.matchedKeywords?.length || 0) && (
              <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                Consider mentioning: {currentQuestion.expectedKeywords?.filter(k => !result.matchedKeywords?.includes(k)).join(', ')}
              </div>
            )}
          </div>
        )}
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)', flexWrap: 'wrap' }}>
          {!submitted ? (
            <button className="cmd-btn primary" onClick={handleSubmit} disabled={!answer.trim() || submitting}>
              {submitting ? 'Evaluating...' : 'Submit Answer'}
            </button>
          ) : (
            <>
              <button className="cmd-btn" onClick={handlePrev} disabled={currentIndex === 0}>Previous</button>
              {isLast ? (
                <button className="cmd-btn primary" onClick={handleFinish}>Finish Session</button>
              ) : (
                <button className="cmd-btn primary" onClick={handleNext}>Next Question</button>
              )}
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'var(--space-3)' }}>
        <button className="cmd-btn" onClick={onBack}>End Session</button>
      </div>
    </div>
  );
}
