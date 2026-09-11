import React, { useState, useEffect } from 'react';
import './Nav.css';

export default function Nav({ view, onChange, onStartLab }) {
  const [labs, setLabs] = useState([]);
  const [selectedLab, setSelectedLab] = useState('');

  useEffect(() => {
    fetch('/api/labs')
      .then(r => r.json())
      .then(setLabs)
      .catch(() => setLabs([]));
  }, []);

  return (
    <div className="nav">
      <button className={`nav-btn ${view === 'lab' ? 'active' : ''}`} onClick={() => onChange('lab')}>🔬 Lab</button>
      <button className={`nav-btn ${view === 'practice' ? 'active' : ''}`} onClick={() => onChange('practice')}>⏱️ Practice</button>
      <button className={`nav-btn ${view === 'games' ? 'active' : ''}`} onClick={() => onChange('games')}>🎮 Games</button>
      <button className={`nav-btn ${view === 'quiz' ? 'active' : ''}`} onClick={() => onChange('quiz')}>🧠 Quiz</button>
      <button className={`nav-btn ${view === 'progress' ? 'active' : ''}`} onClick={() => onChange('progress')}>📊 Progress</button>
      <select
        value={selectedLab}
        onChange={(e) => { setSelectedLab(e.target.value); onStartLab(e.target.value); }}
        style={{
          background: 'var(--panel)',
          color: 'var(--text)',
          border: '1px solid var(--panel-border)',
          borderRadius: 8,
          padding: '8px 10px',
          marginLeft: 8
        }}
      >
        <option value="">Load Lab...</option>
        {labs.map(l => (
          <option key={l.id} value={l.id}>{l.id} - {l.title}</option>
        ))}
      </select>
    </div>
  );
}
