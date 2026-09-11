import React from 'react';

export default function SectionHeader({ title, style = {}, ...rest }) {
  return (
    <div
      style={{
        color: 'var(--primary)',
        fontSize: '0.75em',
        fontWeight: 700,
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        marginBottom: '10px',
        paddingBottom: '6px',
        borderBottom: '1px solid var(--panel-border-subtle)',
        ...style,
      }}
      {...rest}
    >
      {title}
    </div>
  );
}