import React from 'react';

const colors = {
  success: { bg: 'rgba(0,255,136,0.06)', border: 'rgba(0,255,136,0.3)', color: 'var(--success)' },
  warning: { bg: 'rgba(255,230,0,0.06)', border: 'rgba(255,230,0,0.3)', color: 'var(--warning)' },
  danger: { bg: 'rgba(255,51,85,0.06)', border: 'rgba(255,51,85,0.3)', color: 'var(--error)' },
  info: { bg: 'rgba(0,229,255,0.06)', border: 'rgba(0,229,255,0.3)', color: 'var(--primary)' },
};

export default function Badge({ status = 'info', children, style = {}, ...rest }) {
  const c = colors[status] || colors.info;
  return (
    <span
      style={{
        padding: '4px 8px',
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 'var(--radius)',
        color: c.color,
        fontSize: '0.7em',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}