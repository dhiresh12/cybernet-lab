import React from 'react';
import StatusIndicator from './primitives/StatusIndicator';
import { useLocale } from '../context/LocaleContext';
import { THEMES, BACKGROUNDS } from '../core/constants';
import './Header.css';

export default function Header({ audio, soundEnabled, onToggleSound, view, onChange, theme, onThemeChange, designMode, onDesignModeChange, bgSetting, onBgChange }) {
  const { locale, setLocale } = useLocale();

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
    { id: 'portfolio', label: 'PORTFOLIO' },
  ];

  const panelModes = [
    { id: 'noc', label: 'NOC Neon' },
    { id: 'operations', label: 'Operations' },
    { id: 'server-room', label: 'Server Room' },
  ];

  return (
    <header className="noc-header" role="banner">
      <div className="noc-header-left">
        <div className="noc-logo" aria-hidden="true">◄ CYBERNET NOC ►</div>
        <div className="noc-divider" aria-hidden="true" />
        <div className="noc-station">Network Operations Center</div>
      </div>

      <nav className="noc-header-nav" aria-label="Primary">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`cmd-btn ${view === item.id ? 'primary' : ''}`}
            onClick={() => onChange(item.id)}
            aria-current={view === item.id ? 'page' : undefined}
            aria-label={item.label}
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
        <label htmlFor="theme-select" className="sr-only">Select theme</label>
        <select
          id="theme-select"
          value={theme}
          onChange={(e) => onThemeChange?.(e.target.value)}
          className="cmd-btn header-quick-select"
          aria-label="Select theme"
        >
          {THEMES.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <label htmlFor="panel-select" className="sr-only">Select panel design</label>
        <select
          id="panel-select"
          value={designMode}
          onChange={(e) => onDesignModeChange?.(e.target.value)}
          className="cmd-btn header-quick-select"
          aria-label="Select panel design"
        >
          {panelModes.map(m => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>
        <label htmlFor="bg-select" className="sr-only">Select background</label>
        <select
          id="bg-select"
          value={bgSetting}
          onChange={(e) => onBgChange?.(e.target.value)}
          className="cmd-btn header-quick-select"
          aria-label="Select background"
        >
          {BACKGROUNDS.map(bg => (
            <option key={bg.id} value={bg.id}>{bg.name}</option>
          ))}
        </select>
        <button className="cmd-btn" onClick={toggleSound} aria-label="Toggle sound" aria-pressed={Boolean(soundEnabled ?? audio?.enabled)}>
          {(soundEnabled ?? audio?.enabled) ? 'Sound' : 'Mute'}
        </button>
        <label htmlFor="locale-select" className="sr-only">Select language</label>
        <select
          id="locale-select"
          value={locale}
          onChange={e => setLocale(e.target.value)}
          className="cmd-btn header-quick-select"
          aria-label="Select language"
        >
          <option value="en">EN</option>
          <option value="hi">हिन्दी</option>
          <option value="zh">中文</option>
          <option value="ja">日本語</option>
        </select>
      </div>
    </header>
  );
}
