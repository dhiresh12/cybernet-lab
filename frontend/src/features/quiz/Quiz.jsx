// Quiz Component
import React, { useState, useEffect, useCallback } from 'react';
import { createQuizEngine, createPracticeEngine, getCurrentQuestion, submitAnswer, getProgress, getResults, resetQuiz, useHint, showSolution } from './QuizEngine';

export function Quiz({ questions, onComplete, mode = 'quiz' }) {
  const [engine, setEngine] = useState(() => mode === 'practice' 
    ? createPracticeEngine(questions) 
    : createQuizEngine(questions));
  const [answer, setAnswer] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [hintText, setHintText] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [solutionText, setSolutionText] = useState(null);

  const currentQuestion = getCurrentQuestion(engine);
  const progress = getProgress(engine);

  const handleAnswer = useCallback((index) => {
    if (submitted) return;
    setAnswer(index);
  }, [submitted]);

  const handleSubmit = useCallback(() => {
    if (answer === null || submitted) return;
    const res = submitAnswer(engine, answer);
    setResult(res);
    setSubmitted(true);
    
    if (res.completed) {
      setTimeout(() => {
        onComplete?.(getResults(engine));
      }, 1000);
    }
  }, [engine, answer, submitted, onComplete]);

  const handleNext = useCallback(() => {
    if (!result?.completed) {
      setAnswer(null);
      setSubmitted(false);
      setResult(null);
      setShowHint(false);
      setHintText(null);
      setShowSolution(false);
      setSolutionText(null);
    }
  }, [result]);

  const handleHint = useCallback(() => {
    if (engine.hintsUsed >= 3) return;
    const hint = useHint(engine);
    setHintText(hint);
    setShowHint(true);
    setEngine({ ...engine });
  }, [engine]);

  const handleShowSolution = useCallback(() => {
    const sol = showSolution(engine);
    setSolutionText(sol);
    setShowSolution(true);
    setEngine({ ...engine });
  }, [engine]);

  const handleRestart = useCallback(() => {
    const newEngine = mode === 'practice' 
      ? createPracticeEngine(questions) 
      : createQuizEngine(questions);
    setEngine(newEngine);
    setAnswer(null);
    setSubmitted(false);
    setResult(null);
    setShowHint(false);
    setHintText(null);
    setShowSolution(false);
    setSolutionText(null);
  }, [mode, questions]);

  if (!currentQuestion) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)' }}>No questions available</p>
      </div>
    );
  }

  const results = getResults(engine);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ color: 'var(--muted)', fontSize: '0.85em' }}>
            {mode === 'practice' ? 'Practice' : 'Quiz'} • Question {progress.current} / {progress.total}
          </div>
          <div style={{ color: 'var(--cyan)', fontWeight: 700 }}>{progress.percent}% complete</div>
        </div>
        <div style={{ color: 'var(--cyan)', fontWeight: 700 }}>
          Score: {results.score} / {results.total}
        </div>
      </div>

      <div style={{ 
        background: 'rgba(0,0,0,0.3)', 
        border: '1px solid rgba(0,240,255,0.2)', 
        borderRadius: 8, 
        padding: 16,
        marginBottom: 16 
      }}>
        <div style={{ color: 'var(--cyan)', fontWeight: 700, marginBottom: 8 }}>
          Question {progress.current}
        </div>
        <div style={{ color: 'var(--text)', lineHeight: 1.6, marginBottom: 16 }}>
          {currentQuestion.question}
        </div>

        {currentQuestion.options && currentQuestion.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            disabled={submitted}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '10px 12px',
              marginBottom: 8,
              borderRadius: 6,
              border: `1px solid ${submitted 
                ? (i === currentQuestion.correctIndex ? 'var(--green)' : answer === i ? 'var(--red)' : 'rgba(0,240,255,0.3)')
                : (answer === i ? 'var(--cyan)' : 'rgba(0,240,255,0.3)')}`,
              background: submitted 
                ? (i === currentQuestion.correctIndex ? 'rgba(0,255,136,0.15)' : answer === i ? 'rgba(255,51,85,0.15)' : 'transparent')
                : (answer === i ? 'rgba(0,240,255,0.1)' : 'rgba(0,0,0,0.3)'),
              color: submitted 
                ? (i === currentQuestion.correctIndex ? 'var(--green)' : answer === i ? 'var(--red)' : 'var(--text)')
                : (answer === i ? 'var(--cyan)' : 'var(--text)'),
              cursor: submitted ? 'default' : 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {opt}
          </button>
        ))}

        {showHint && hintText && (
          <div style={{ 
            marginTop: 12, 
            padding: 10, 
            background: 'rgba(255,170,0,0.1)', 
            border: '1px solid var(--yellow)', 
            borderRadius: 6 
          }}>
            <strong style={{ color: 'var(--yellow)' }}>Hint {engine.hintsUsed}:</strong> {hintText}
          </div>
        )}

        {showSolution && solutionText && (
          <div style={{ 
            marginTop: 12, 
            padding: 10, 
            background: 'rgba(0,255,136,0.1)', 
            border: '1px solid var(--green)', 
            borderRadius: 6 
          }}>
            <strong style={{ color: 'var(--green)' }}>Solution:</strong> {solutionText}
          </div>
        )}

        {result && (
          <div style={{ 
            marginTop: 16, 
            padding: 12, 
            borderRadius: 8,
            background: result.correct ? 'rgba(0,255,136,0.15)' : 'rgba(255,51,85,0.15)',
            border: `1px solid ${result.correct ? 'var(--green)' : 'var(--red)'}`,
          }}>
            <div style={{ 
              color: result.correct ? 'var(--green)' : 'var(--red)',
              fontWeight: 700,
              marginBottom: 8
            }}>
              {result.correct ? '[OK] Correct!' : '[FAIL] Incorrect'}
            </div>
            {result.correct || <div style={{ color: 'var(--muted)' }}>Correct answer: {currentQuestion.options?.[currentQuestion.correctIndex]}</div>}
            <div style={{ color: 'var(--cyan)', marginTop: 8 }}>
              Score: {result.score} / {result.total}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {!submitted && (
          <button onClick={handleSubmit} disabled={answer === null} style={{
            padding: '10px 20px', borderRadius: 6, border: 'none',
            background: answer === null ? 'rgba(0,240,255,0.3)' : 'var(--cyan)',
            color: answer === null ? 'var(--muted)' : '#000',
            fontWeight: 700, cursor: answer === null ? 'not-allowed' : 'pointer'
          }}>
            Submit Answer
          </button>
        )}
        
        {submitted && !result.completed && (
          <button onClick={handleNext} style={{
            padding: '10px 20px', borderRadius: 6, border: '1px solid var(--cyan)',
            background: 'transparent', color: 'var(--cyan)', fontWeight: 700, cursor: 'pointer'
          }}>
            Next Question
          </button>
        )}
        
        {result.completed && (
          <button onClick={handleRestart} style={{
            padding: '10px 20px', borderRadius: 6, border: '1px solid var(--cyan)',
            background: 'transparent', color: 'var(--cyan)', fontWeight: 700, cursor: 'pointer'
          }}>
            Restart
          </button>
        )}

        {mode === 'practice' && (
          <>
            <button onClick={handleHint} disabled={engine.hintsUsed >= 3} style={{
              padding: '10px 16px', borderRadius: 6, border: '1px solid var(--yellow)',
              background: engine.hintsUsed >= 3 ? 'rgba(255,170,0,0.1)' : 'transparent',
              color: engine.hintsUsed >= 3 ? 'var(--muted)' : 'var(--yellow)',
              fontWeight: 600, cursor: engine.hintsUsed >= 3 ? 'not-allowed' : 'pointer'
            }}>
              Tip Hint ({engine.hintsUsed}/3)
            </button>
            <button onClick={handleShowSolution} style={{
              padding: '10px 16px', borderRadius: 6, border: '1px solid var(--green)',
              background: 'transparent', color: 'var(--green)', fontWeight: 600, cursor: 'pointer'
            }}>
              Eye Show Solution
            </button>
          </>
        )}
      </div>

      <div style={{ marginTop: 16, height: 6, background: 'rgba(0,0,0,0.3)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ 
          height: '100%', 
          width: `${progress.percent}%`, 
          background: 'linear-gradient(90deg, var(--cyan), var(--green))',
          transition: 'width 0.3s' 
        }} />
      </div>
    </div>
  );
}

export default Quiz;