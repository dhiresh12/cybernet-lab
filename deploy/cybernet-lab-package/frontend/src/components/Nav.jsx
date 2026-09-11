import React, { useState, useEffect } from 'react';
import Button from './primitives/Button';
import Badge from './primitives/Badge';
import SectionHeader from './primitives/SectionHeader';
import './Nav.css';

export default function Nav({ view, onChange, onStartLab }) {
  const [labs, setLabs] = useState([]);
  const [selectedLab, setSelectedLab] = useState('');

  useEffect(() => {
    fetch('/api/labs')
      .then(r => r.ok ? r.json() : [])
      .then(setLabs)
      .catch(() => setLabs([]));
  }, []);

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      marginBottom: '12px',
    }}>
      <Button variant={view === 'lab' ? 'primary' : 'ghost'} onClick={() => onChange('lab')}>🔬 Lab</Button>
      <Button variant={view === 'practice' ? 'primary' : 'ghost'} onClick={() => onChange('practice')}>⏱️ Practice</Button>
      <Button variant={view === 'games' ? 'primary' : 'ghost'} onClick={() => onChange('games')}>🎮 Games</Button>
      <Button variant={view === 'quiz' ? 'primary' : 'ghost'} onClick={() => onChange('quiz')}>🧠 Quiz</Button>
      <Button variant={view === 'progress' ? 'primary' : 'ghost'} onClick={() => onChange('progress')}>📊 Progress</Button>
      <Badge status="info">Load Lab</Badge>
      <select
        value={selectedLab}
        onChange={(e) => { const v = e.target.value; setSelectedLab(v); if (v) onStartLab(v); }}
        style={{
          background: 'var(--panel)',
          color: 'var(--text)',
          border: '1px solid var(--panel-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 10px',
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