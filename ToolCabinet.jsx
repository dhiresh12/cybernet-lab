import React, { useState } from 'react';
import './ToolCabinet.css';

const TOOLS = [
  { id: 'router', label: 'Router ISR 4321', category: 'Devices' },
  { id: 'switch', label: 'Switch Catalyst 9300', category: 'Devices' },
  { id: 'pc', label: 'PC Workstation', category: 'Endpoints' },
  { id: 'server', label: 'Server', category: 'Endpoints' },
  { id: 'cable-straight', label: 'Copper Straight-Through', category: 'Cables' },
  { id: 'cable-crossover', label: 'Copper Cross-Over', category: 'Cables' },
  { id: 'cable-serial', label: 'Serial DCE', category: 'Cables' },
  { id: 'cable-fiber', label: 'Fiber Single-mode', category: 'Cables' }
];

export default function ToolCabinet() {
  const [filter, setFilter] = useState('All');
  const categories = ['All', ...new Set(TOOLS.map(t => t.category))];
  const items = filter === 'All' ? TOOLS : TOOLS.filter(t => t.category === filter);

  return (
    <div className="tools">
      <div className="tool-section">
        <h3>Components</h3>
        <div className="chips">
          {categories.map(c => (
            <button key={c} className={`chip ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="tool-section">
        <h3>Device Palette</h3>
        {items.map(t => (
          <div key={t.id} className="tool-item" draggable onDragStart={(e) => e.dataTransfer.setData('tool', t.id)}>
            {t.label}
          </div>
        ))}
      </div>
      <div className="tool-section">
        <h3>Lab Status</h3>
        <div style={{ color: 'var(--muted)', fontSize: '0.85em' }}>
          <div>Session: <span style={{ color: 'var(--green)' }}>Active</span></div>
          <div>Router: <span style={{ color: 'var(--green)' }}>Connected</span></div>
          <div>Devices: <span style={{ color: 'var(--cyan)' }}>0</span></div>
        </div>
      </div>
    </div>
  );
}
