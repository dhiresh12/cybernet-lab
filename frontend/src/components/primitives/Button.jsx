import React from 'react';

const base = {
  padding: '6px 12px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--panel-border-subtle)',
  background: 'rgba(0,0,0,0.4)',
  color: 'var(--primary)',
  cursor: 'pointer',
  fontSize: '0.75em',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  transition: 'background 0.15s, border-color 0.15s',
};

const variants = {
  primary: { borderColor: 'var(--primary-dim)', background: 'rgba(0,229,255,0.15)' },
  ghost: { borderColor: 'transparent', background: 'transparent' },
  danger: { borderColor: 'rgba(255,51,85,0.4)', background: 'rgba(255,51,85,0.1)', color: 'var(--error)' },
};

const sizes = {
  sm: { padding: '4px 8px', fontSize: '0.7em' },
  md: { padding: '6px 12px', fontSize: '0.75em' },
};

export default function Button({ variant = 'primary', active, size = 'md', children, style = {}, ...rest }) {
  return (
    <button
      style={{
        ...base,
        ...(variants[variant] || variants.primary),
        ...(active && variants.primary),
        ...(sizes[size] || sizes.md),
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}