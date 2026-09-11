// LabWorkspace Components
export const MetricBox = ({ label, value, color }) => (
  <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 4, padding: 6, textAlign: 'center' }}>
    <div style={{ color: 'var(--muted)', fontSize: '0.8em' }}>{label}</div>
    <div style={{ color, fontSize: '1.2em', fontWeight: 700 }}>{value}</div>
  </div>
);

export const HealthBar = ({ label, value, invertColor }) => (
  <div style={{ marginBottom: 6 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85em', marginBottom: 2 }}>
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <span style={{ color: 'var(--cyan)' }}>{value}%</span>
    </div>
    <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 999, height: 4, overflow: 'hidden' }}>
      <div style={{
        background: invertColor ? (value < 30 ? 'var(--green)' : value < 70 ? 'var(--yellow)' : 'var(--red)') : (value > 70 ? 'var(--green)' : value > 30 ? 'var(--yellow)' : 'var(--red)'),
        height: '100%', width: `${value}%`
      }} />
    </div>
  </div>
);

export const ConfigSection = ({ title, value }) => (
  <div style={{ marginBottom: 6, padding: 4, background: 'rgba(0,0,0,0.3)', borderRadius: 4 }}>
    <div style={{ color: 'var(--muted)', fontSize: '0.85em' }}>{title}</div>
    <div style={{ color: 'var(--text)', fontWeight: 500 }}>{value}</div>
  </div>
);

export const ToolButton = ({ label, active, onClick, icon }) => (
  <button className={`tool-btn ${active ? 'active' : ''}`} onClick={onClick}>
    {icon && <span className="tool-icon">{icon}</span>}
    {label}
  </button>
);

export const DeviceButton = ({ device, selected, onClick }) => {
  const colors = {
    router: '#00f0ff',
    switch: '#00ff88',
    pc: '#ffaa00',
    laptop: '#ffaa00',
    server: '#aa00ff',
    firewall: '#ff3355',
    accessPoint: '#ff00aa',
    cloud: '#8888ff',
    dns: '#00ffcc',
    dhcp: '#00ffcc',
  };
  const icons = {
    router: '◆',
    switch: '⬡',
    pc: '💻',
    laptop: '💻',
    server: '🖧',
    firewall: '🛡️',
    accessPoint: '📡',
    cloud: '☁️',
    dns: '🔮',
    dhcp: '📋',
  };
  const color = colors[device.type] || '#00f0ff';
  const icon = icons[device.type] || '◆';
  
  return (
    <button className={`device-btn ${selected ? 'active' : ''}`} onClick={onClick} style={{ borderColor: selected ? color : 'transparent' }}>
      <span className="device-icon" style={{ color }}>{icon}</span>
      {device.name}
    </button>
  );
};

export const Panel = ({ title, children, className = '' }) => (
  <div className={`panel ${className}`}>
    <h4>{title}</h4>
    {children}
  </div>
);

export const Button = ({ children, onClick, variant = 'primary', disabled, className = '' }) => {
  const baseStyle = {
    padding: '8px 12px',
    borderRadius: 4,
    fontWeight: 600,
    fontSize: '0.85em',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.15s',
  };
  
  const variants = {
    primary: { background: 'var(--cyan)', color: '#000', border: 'none' },
    secondary: { background: 'transparent', color: 'var(--cyan)', border: '1px solid var(--cyan)' },
    danger: { background: 'transparent', color: 'var(--red)', border: '1px solid var(--red)' },
    ghost: { background: 'transparent', color: 'var(--text)', border: '1px solid transparent' },
  };
  
  return (
    <button 
      style={{ ...baseStyle, ...variants[variant] }} 
      onClick={onClick} 
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  );
};

export const Select = ({ value, onChange, options, className = '' }) => (
  <select value={value} onChange={onChange} className={`lab-select ${className}`}>
    {options.map(opt => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
);

export const TabBar = ({ activeTab, tabs, onChange }) => (
  <div className="tab-bar">
    {tabs.map(tab => (
      <button 
        key={tab.id} 
        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
        onClick={() => onChange(tab.id)}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export const ProgressBar = ({ value, max = 100, color = 'var(--cyan)' }) => (
  <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
    <div style={{ 
      background: `linear-gradient(90deg, ${color}, var(--green))`, 
      height: '100%', 
      width: `${(value / max) * 100}%`,
      transition: 'width 0.3s'
    }} />
  </div>
);

export const Badge = ({ children, color = 'var(--cyan)' }) => (
  <span style={{ 
    padding: '4px 8px', 
    borderRadius: 999, 
    border: `1px solid ${color}88`, 
    color, 
    fontSize: '0.75em',
    fontWeight: 600,
  }}>
    {children}
  </span>
);