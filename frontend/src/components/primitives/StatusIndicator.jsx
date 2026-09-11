import React from 'react';

const ledColors = {
  green: { bg: 'var(--led-green)', shadow: 'var(--glow-success)' },
  amber: { bg: 'var(--led-amber)', shadow: 'var(--glow-warning)' },
  red: { bg: 'var(--led-red)', shadow: 'var(--glow-error)' },
  primary: { bg: 'var(--led-primary)', shadow: 'var(--glow-primary)' },
};

export default function StatusIndicator({ status = 'primary', title, size = 8, style = {}, ...rest }) {
  const c = ledColors[status] || ledColors.primary;
  return (
    <div
      title={title}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: c.bg,
        boxShadow: c.shadow,
        display: 'inline-block',
        ...style,
      }}
      {...rest}
    />
  );
}