import React, { useState, useEffect } from 'react';
import Button from './primitives/Button';
import Badge from './primitives/Badge';
import './Nav.css';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '◉' },
  { id: 'lab', label: 'Virtual Lab', icon: '◈' },
  { id: 'roadmap', label: 'Learning Path', icon: '◇' },
  { id: 'planner', label: 'Study Planner', icon: '◷' },
  { id: 'daily-mission', label: 'Daily Mission', icon: '★' },
  { id: 'retrieval', label: 'Retrieval', icon: '↻' },
  { id: 'interview', label: 'Interview', icon: '◎' },
  { id: 'course', label: 'Course', icon: '▶' },
  { id: 'engineer', label: 'Engineer Mode', icon: '◆' },
  { id: 'troubleshooting', label: 'Troubleshoot', icon: '⚑' },
  { id: 'failure-lab', label: 'Failure Lab', icon: '⚠' },
  { id: 'research', label: 'Research', icon: '🔬' },
  { id: 'evidence', label: 'Evidence', icon: '📋' },
  { id: 'debrief', label: 'Debrief', icon: '◍' },
  { id: 'portfolio', label: 'Portfolio', icon: '📁' },
  { id: 'skill-graph', label: 'Skill Graph', icon: '⬡' },
  { id: 'tickets', label: 'Tickets', icon: 'roles' },
  { id: 'security', label: 'Security', icon: '🛡' },
  { id: 'analytics', label: 'Analytics', icon: 'profil' },
  { id: 'progress', label: 'Progress', icon: '◎' },
  { id: 'qa', label: 'QA', icon: '☰' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
];

export default function Nav({ view, onChange, onStartLab }) {
  const [labs, setLabs] = useState([]);
  const [selectedLab, setSelectedLab] = useState('');
  const [quickOpen, setQuickOpen] = useState(false);

  useEffect(() => {
    fetch('/api/labs')
      .then(r => r.ok ? r.json() : [])
      .then(setLabs)
      .catch(() => setLabs([]));
  }, []);

  return (
    <nav className="nav-rail" aria-label="Primary">
      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          className={`nav-rail-item ${view === item.id ? 'active' : ''}`}
          onClick={() => onChange(item.id)}
          aria-current={view === item.id ? 'page' : undefined}
          aria-label={item.label}
        >
          <span className="nav-icon" aria-hidden="true">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}

      <div style={{ marginTop: 'var(--space-4)', borderTop: '1px solid var(--panel-border-subtle)', paddingTop: 'var(--space-3)' }}>
        <div className="tech-label">Quick Load</div>
        <label htmlFor="lab-select" className="sr-only">Load lab</label>
        <select
          id="lab-select"
          value={selectedLab}
          onChange={(e) => { const v = e.target.value; setSelectedLab(v); if (v) onStartLab(v); }}
          className="cmd-btn"
          style={{ width: '100%', appearance: 'auto', padding: 'var(--space-2) var(--space-3)' }}
          aria-label="Load lab"
        >
          <option value="">Load Lab…</option>
          {labs.map((l, index) => (
            <option key={`${l.id}-${index}`} value={l.id}>{String(l.id).padStart(3, '0')} — {l.title}</option>
          ))}
        </select>
      </div>
    </nav>
  );
}