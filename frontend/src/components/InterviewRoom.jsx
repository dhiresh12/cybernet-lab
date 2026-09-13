import React, { useState, useEffect, useCallback } from 'react';
import { fetchRoleQuestions, createSession, submitAnswer, fetchHistory, fetchRecommendations, fetchWeakAreas } from '../services/interviewApi';
import InterviewSession from './interview/InterviewSession';
import InterviewHistory from './interview/InterviewHistory';
import WeakAreas from './interview/WeakAreas';
import Recommendations from './interview/Recommendations';

const ROLES = [
  { id: 'noc', label: 'NOC' },
  { id: 'network-engineer', label: 'Network Engineer' },
  { id: 'network-security', label: 'Network Security' },
  { id: 'soc', label: 'SOC' },
  { id: 'ccna', label: 'CCNA' },
  { id: 'ccnp', label: 'CCNP' }
];

const LEVEL_LABELS = ['What is', 'Why', 'How', 'Configure', 'Verify', 'Troubleshoot', 'Design', 'Defend', 'Lead'];

export default function InterviewRoom() {
  const [role, setRole] = useState(() => localStorage.getItem('cybernet_interview_role') || '');
  const [questions, setQuestions] = useState([]);
  const [session, setSession] = useState(null);
  const [view, setView] = useState('setup');
  const [history, setHistory] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [weakAreas, setWeakAreas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const learnerId = localStorage.getItem('cybernet_learner_id');

  useEffect(() => {
    if (role) {
      localStorage.setItem('cybernet_interview_role', role);
    }
  }, [role]);

  const loadHistory = useCallback(async () => {
    try {
      const data = await fetchHistory(learnerId);
      setHistory(data.history || []);
    } catch (e) {
      console.warn('Failed to load history:', e.message);
    }
  }, [learnerId]);

  const loadRecommendations = useCallback(async () => {
    try {
      const data = await fetchRecommendations(learnerId);
      setRecommendations(data);
    } catch (e) {
      console.warn('Failed to load recommendations:', e.message);
    }
  }, [learnerId]);

  const loadWeakAreas = useCallback(async () => {
    try {
      const data = await fetchWeakAreas(learnerId);
      setWeakAreas(data);
    } catch (e) {
      console.warn('Failed to load weak areas:', e.message);
    }
  }, [learnerId]);

  const handleSelectRole = async (selectedRole) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchRoleQuestions(selectedRole);
      setQuestions(data.questions || []);
      setRole(selectedRole);
      setView('ready');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await createSession(role);
      setSession(data);
      setView('session');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (sessionId, questionId, answer) => {
    try {
      const result = await submitAnswer(sessionId, questionId, answer);
      setSession(prev => {
        if (!prev) return prev;
        const updated = { ...prev };
        if (result.answers) {
          updated.answers = result.answers;
        }
        if (result.sessionStatus === 'completed') {
          updated.status = 'completed';
          updated.score = result.score;
        }
        return updated;
      });
      return result;
    } catch (e) {
      setError(e.message);
      throw e;
    }
  };

  const handleSessionComplete = () => {
    setView('results');
    loadHistory();
    loadRecommendations();
    loadWeakAreas();
  };

  const handleShowHistory = () => {
    loadHistory();
    setView('history');
  };

  const handleShowRecommendations = () => {
    loadRecommendations();
    setView('recommendations');
  };

  const handleShowWeakAreas = () => {
    loadWeakAreas();
    setView('weak-areas');
  };

  const handleBackToSetup = () => {
    setSession(null);
    setView('ready');
  };

  const handleBackToRoleSelect = () => {
    setRole('');
    setQuestions([]);
    setSession(null);
    setView('setup');
    localStorage.removeItem('cybernet_interview_role');
  };

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ color: 'var(--cyan)', letterSpacing: '0.08em', fontSize: '0.8rem', marginBottom: 'var(--space-2)' }}>INTERVIEW ROOM</div>
      <h1 style={{ color: 'var(--text)', margin: '0 0 var(--space-4)', fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-extrabold)' }}>
        Role-Based Interview Preparation
      </h1>

      {error && (
        <div className="tech-card" style={{ marginBottom: 'var(--space-4)', borderColor: 'var(--red)', color: 'var(--red)' }}>
          {error}
        </div>
      )}

      {view === 'setup' && (
        <div>
          <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)', lineHeight: 1.6 }}>
            Select your target role to begin a progressive interview session. Each role contains 9 levels of questions.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-3)' }}>
            {ROLES.map(r => (
              <button
                key={r.id}
                className={`cmd-btn ${role === r.id ? 'primary' : ''}`}
                onClick={() => handleSelectRole(r.id)}
                disabled={loading}
                style={{ padding: 'var(--space-4)', textAlign: 'left' }}
              >
                <div style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 4 }}>{r.label}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>9 progressive levels</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {view === 'ready' && (
        <div>
          <div className="tech-card" style={{ marginBottom: 'var(--space-4)' }}>
            <div style={{ color: 'var(--accent-soft)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-2)' }}>
              {ROLES.find(r => r.id === role)?.label} Interview
            </div>
            <div style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-3)', lineHeight: 1.6 }}>
              {questions.length} questions across 9 progressive levels.
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
              {LEVEL_LABELS.map((label, idx) => (
                <span key={idx} className="tech-label" style={{ fontSize: 'var(--text-xs)' }}>L{idx + 1}: {label}</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <button className="cmd-btn primary" onClick={handleStartSession} disabled={loading}>Start Interview Session</button>
              <button className="cmd-btn" onClick={handleBackToRoleSelect}>Change Role</button>
              <button className="cmd-btn" onClick={handleShowHistory}>View History</button>
              <button className="cmd-btn" onClick={handleShowWeakAreas}>Weak Areas</button>
              <button className="cmd-btn" onClick={handleShowRecommendations}>Recommendations</button>
            </div>
          </div>
        </div>
      )}

      {view === 'session' && session && (
        <InterviewSession
          session={session}
          questions={questions}
          onSubmit={handleAnswerSubmit}
          onComplete={handleSessionComplete}
          onBack={handleBackToSetup}
        />
      )}

      {view === 'results' && session && (
        <div className="tech-card" style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ color: 'var(--accent-soft)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-2)' }}>
            Session Complete
          </div>
          <div style={{ color: 'var(--text)', marginBottom: 'var(--space-3)' }}>
            Score: <strong>{session.score}%</strong>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <button className="cmd-btn primary" onClick={handleStartSession}>New Session</button>
            <button className="cmd-btn" onClick={handleShowHistory}>View History</button>
            <button className="cmd-btn" onClick={handleShowWeakAreas}>Weak Areas</button>
            <button className="cmd-btn" onClick={handleShowRecommendations}>Recommendations</button>
            <button className="cmd-btn" onClick={handleBackToSetup}>Back to Setup</button>
          </div>
        </div>
      )}

      {view === 'history' && (
        <InterviewHistory history={history} onBack={() => setView(role ? 'ready' : 'setup')} onStartSession={handleStartSession} role={role} />
      )}

      {view === 'weak-areas' && (
        <WeakAreas data={weakAreas} onBack={() => setView(role ? 'ready' : 'setup')} onStartSession={handleStartSession} role={role} />
      )}

      {view === 'recommendations' && (
        <Recommendations data={recommendations} onBack={() => setView(role ? 'ready' : 'setup')} onStartSession={handleStartSession} role={role} />
      )}
    </div>
  );
}
