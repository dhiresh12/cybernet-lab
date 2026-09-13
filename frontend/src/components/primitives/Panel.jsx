import React from 'react';

export default function Panel({ title, children, glow = false, className = '', style = {}, design, ...rest }) {
  const designClass = design ? `panel-design-${design}` : '';
  return (
    <div
      className={`panel panel-glow ${designClass} ${className}`.trim()}
      style={{
        border: '1px solid var(--panel-border-subtle)',
        background: 'var(--panel)',
        ...(glow && { boxShadow: 'inset 0 0 30px rgba(0,229,255,0.03), var(--glow-primary-soft)' }),
        ...style,
      }}
      {...rest}
    >
      {title && (
        <div className="panel-header" style={{ color: 'var(--primary)', textShadow: '0 0 8px rgba(0,229,255,0.3)' }}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}