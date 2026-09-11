import React from 'react';
import StatusIndicator from './StatusIndicator';
import Button from './Button';
import './Header.css';

export default function Header({ audio }) {
  const toggleSound = () => {
    audio?.setEnabled(!audio?.enabled);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      borderBottom: '1px solid var(--panel-border)',
      background: 'linear-gradient(180deg, rgba(6,14,28,0.98), rgba(2,7,17,0.95))',
      backdropFilter: 'blur(10px)',
      height: '44px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{
          color: 'var(--primary)',
          fontSize: '0.85em',
          fontWeight: 800,
          letterSpacing: '3px',
          textTransform: 'uppercase',
          textShadow: 'var(--glow-primary)',
        }}>◄ CYBERNET ACADEMY ►</span>
        <div style={{ width: '1px', height: '20px', background: 'var(--panel-border)' }} />
        <span style={{ fontSize: '0.7em', color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>NOC Monitor</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <StatusIndicator status="success" title="Core Router" />
        <StatusIndicator status="success" title="Backend" />
        <StatusIndicator status="warning" title="Simulation" />
        <Button variant="ghost" onClick={toggleSound}>🔊 Sound</Button>
      </div>
    </div>
  );
}