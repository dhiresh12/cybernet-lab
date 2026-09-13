import React from 'react';

export default function AnswerEvaluator({ result, question }) {
  if (!result) return null;

  return (
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
      {question?.expectedKeywords && result.matchedKeywords && (
        <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
          Consider mentioning: {question.expectedKeywords.filter(k => !result.matchedKeywords.includes(k)).join(', ')}
        </div>
      )}
    </div>
  );
}
