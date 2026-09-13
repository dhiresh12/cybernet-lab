import React, { useState, useEffect } from 'react';

export default function FocusMode({ children, onExit }) {
  const [timeSpent, setTimeSpent] = useState(0);
  const [breaks, setBreaks] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTimeSpent(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timeSpent > 0 && timeSpent % 1500 === 0) {
      setBreaks(b => b + 1);
    }
  }, [timeSpent]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.95)',
      zIndex: 250,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        background: 'rgba(10,18,32,0.9)',
        borderBottom: '1px solid rgba(0,240,255,0.3)',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ color: 'var(--cyan)', fontWeight: 700, fontSize: '0.9em' }}>Target FOCUS MODE</span>
          <span style={{ color: 'var(--muted)', fontSize: '0.8em' }}>⏱ {formatTime(timeSpent)}</span>
          {breaks > 0 && <span style={{ color: 'var(--green)', fontSize: '0.8em' }}>Coffee {breaks} breaks</span>}
        </div>
        <button
          onClick={onExit}
          style={{
            padding: '6px 14px',
            borderRadius: 6,
            border: '1px solid rgba(255,51,85,0.4)',
            background: 'rgba(255,51,85,0.1)',
            color: 'var(--red)',
            cursor: 'pointer',
            fontSize: '0.85em'
          }}
        >Exit Focus Mode</button>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: 0 }}>
        {children}
      </div>
    </div>
  );
}