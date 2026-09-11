import React from 'react';
import StatusIndicator from './primitives/StatusIndicator';
import './Header.css';

export default function Header({ audio, soundEnabled, onToggleSound, view, onChange }) {
  const toggleSound = () => {
    if (onToggleSound) {
      onToggleSound();
      return;
    }
    audio?.setEnabled(!audio?.enabled);
  };

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'DASHBOARD' },
    { id: 'lab', label: 'LAB' },
    { id: 'roadmap', label: 'ROADMAP' },
    { id: 'engineer', label: 'ENGINEER' },
    { id: 'progress', label: 'PROGRESS' },
  ];

  return (
    <header className="noc-header" role="banner">
      <div className="noc-header-left">
        <div className="noc-logo">◄ CYBERNET NOC ►</div>
        <div className="noc-divider" />
        <div className="noc-station">Network Operations Center</div>
      </div>

      <nav className="noc-header-nav" aria-label="Primary">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`cmd-btn ${view === item.id ? 'primary' : ''}`}
            onClick={() => onChange(item.id)}
            aria-current={view === item.id ? 'page' : undefined}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="noc-header-right">
        <div className="noc-led">
          <StatusIndicator status="success" size={8} title="Core Systems" />
          <span>SYSTEMS ONLINE</span>
        </div>
        <div className="noc-led">
          <StatusIndicator status="primary" size={8} title="Backend" />
          <span>BACKEND</span>
        </div>
        <div className="noc-led">
          <StatusIndicator status="warning" size={8} title="Simulation" />
          <span>SIMULATION</span>
        </div>
        <button className="cmd-btn" onClick={toggleSound} aria-label="Toggle sound">
          {(soundEnabled ?? audio?.enabled) ? '🔊' : '🔇'}
        </button>
      </div>
    </header>
  );
}