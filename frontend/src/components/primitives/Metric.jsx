import React from 'react';

export default function Metric({ label, value, status, style = {} }) {
  return (
    <div
      style={{
        background: 'rgba(0,0,0,0.4)',
        border: '1px solid var(--panel-border-subtle)',
        borderRadius: 'var(--radius)',
        padding: '8px',
        textAlign: 'center',
        ...style,
      }}
    >
      <div style={{ color: 'var(--muted)', fontSize: '0.75em', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </div>
      <div
        style={{
          fontSize: '1.15em',
          fontWeight: 700,
          color: status === 'success' ? 'var(--success)' : status === 'warning' ? 'var(--warning)' : status === 'error' ? 'var(--error)' : 'var(--primary)',
        }}
      >
        {value}
      </div>
    </div>
  );
}