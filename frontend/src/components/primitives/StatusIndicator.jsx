import React from 'react';

const statusConfig = {
  green:  { label: 'Online',    shape: 'circle',  icon: '●' },
  amber:  { label: 'Warning',   shape: 'triangle', icon: '▲' },
  red:    { label: 'Critical',  shape: 'circle',  icon: '●' },
  primary:{ label: 'Active',    shape: 'circle',  icon: '●' },
  success:{ label: 'Success',   shape: 'circle',  icon: '●' },
  warning:{ label: 'Warning',   shape: 'triangle', icon: '▲' },
  error:  { label: 'Error',     shape: 'circle',  icon: '●' },
};

const ledColors = {
  green:   { bg: 'var(--led-green)',   shadow: 'var(--glow-success)' },
  amber:   { bg: 'var(--led-amber)',   shadow: 'var(--glow-warning)' },
  red:     { bg: 'var(--led-red)',     shadow: 'var(--glow-error)' },
  primary: { bg: 'var(--led-primary)', shadow: 'var(--glow-primary)' },
};

export default function StatusIndicator({ status = 'primary', title, size = 8, style = {}, ...rest }) {
  const cfg = statusConfig[status] || statusConfig.primary;
  const c = ledColors[status] || ledColors.primary;
  const shapeStyle = cfg.shape === 'triangle'
    ? { clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', borderRadius: 0 }
    : {};
  const accessibleTitle = title || cfg.label;
  return (
    <span
      role="status"
      aria-label={accessibleTitle}
      title={accessibleTitle}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        ...shapeStyle,
        borderRadius: cfg.shape === 'circle' ? '50%' : 0,
        background: c.bg,
        boxShadow: c.shadow,
        ...style,
      }}
      {...rest}
    >
      <span
        aria-hidden="true"
        style={{
          fontSize: '0.7em',
          lineHeight: 1,
          color: '#000',
          fontWeight: 900,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {cfg.icon}
      </span>
    </span>
  );
}