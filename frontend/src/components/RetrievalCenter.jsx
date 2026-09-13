import React, { useState, useMemo } from 'react';
import { RETRIEVAL_QUESTION_BANK } from '../data/learningFeatures';
import { retrievalStorage } from '../core/storage';

export default function RetrievalCenter({ onStartLab }) {
  const [questions, setQuestions] = useState(() => {
    const saved = retrievalStorage.get();
    if (saved?.date === new Date().toDateString() && saved?.questions?.length) return saved.questions;
    const shuffled = [...RETRIEVAL_QUESTION_BANK].sort(() => Math.random() - 0.5).slice(0, 6);
    return shuffled.map(q => ({ ...q, revealed: false, mastery: 'new' }));
  });
  const [revealedCount, setRevealedCount] = useState(0);

  const handleReveal = (index) => {
    setQuestions(prev => {
      const next = [...prev];
      next[index] = { ...next[index], revealed: true };
      retrievalStorage.set({ date: new Date().toDateString(), questions: next });
      return next;
    });
    setRevealedCount(c => c + 1);
  };

  const handleMastery = (index, mastery) => {
    setQuestions(prev => {
      const next = [...prev];
      next[index] = { ...next[index], mastery };
      retrievalStorage.set({ date: new Date().toDateString(), questions: next });
      return next;
    });
  };

  const stats = useMemo(() => {
    const mastered = questions.filter(q => q.mastery === 'mastered').length;
    const learning = questions.filter(q => q.mastery === 'learning').length;
    const newQ = questions.filter(q => q.mastery === 'new').length;
    return { mastered, learning, new: newQ, total: questions.length };
  }, [questions]);

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ color: 'var(--cyan)', letterSpacing: '0.08em', fontSize: '0.8rem', marginBottom: 'var(--space-2)' }}>RETRIEVAL CENTER</div>
      <h1 style={{ color: 'var(--text)', margin: '0 0 var(--space-4)', fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-extrabold)' }}>
        Spaced Repetition — Today&apos;s Set
      </h1>
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        <div className="tech-card" style={{ minWidth: 100 }}><div className="tech-label">Mastered</div><div style={{ color: 'var(--green)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>{stats.mastered}</div></div>
        <div className="tech-card" style={{ minWidth: 100 }}><div className="tech-label">Learning</div><div style={{ color: 'var(--yellow)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>{stats.learning}</div></div>
        <div className="tech-card" style={{ minWidth: 100 }}><div className="tech-label">New</div><div style={{ color: 'var(--text)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>{stats.new}</div></div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {questions.map((q, index) => (
          <div key={q.id} className="tech-card">
            <div style={{ color: 'var(--text)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-2)' }}>
              <span style={{ color: 'var(--text-muted)', marginRight: 8 }}>{index + 1}.</span>
              {q.question}
            </div>
            {q.revealed ? (
              <div>
                <div style={{ color: 'var(--green)', lineHeight: 1.6, marginBottom: 'var(--space-2)' }}>{q.answer}</div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  <button className={`cmd-btn ${q.mastery === 'learning' ? 'primary' : ''}`} onClick={() => handleMastery(index, 'learning')}>Learning</button>
                  <button className={`cmd-btn ${q.mastery === 'mastered' ? 'primary' : ''}`} onClick={() => handleMastery(index, 'mastered')}>Mastered</button>
                  <button className="cmd-btn" onClick={() => handleMastery(index, 'new')}>Reset</button>
                </div>
              </div>
            ) : (
              <button className="cmd-btn" onClick={() => handleReveal(index)}>Reveal Answer</button>
            )}
            <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-2)', textTransform: 'capitalize' }}>
              {q.difficulty} · {q.topic}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
