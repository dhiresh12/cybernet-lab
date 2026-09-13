import React, { useMemo } from 'react';

const DEVICE_STYLES = {
  router: { label: 'Router', color: '#38bdf8', icon: 'R' },
  switch: { label: 'Switch', color: '#34d399', icon: 'S' },
  firewall: { label: 'Firewall', color: '#fb7185', icon: 'F' },
  server: { label: 'Server', color: '#fbbf24', icon: 'SV' },
  pc: { label: 'PC', color: '#a78bfa', icon: 'PC' },
  host: { label: 'Host', color: '#a78bfa', icon: 'H' },
  access_point: { label: 'Access point', color: '#f472b6', icon: 'AP' },
  unknown: { label: 'Network device', color: '#94a3b8', icon: 'D' }
};

function styleFor(device) {
  const type = String(device?.type || '').toLowerCase().replace(/[\s-]/g, '_');
  if (type.includes('router')) return DEVICE_STYLES.router;
  if (type.includes('switch')) return DEVICE_STYLES.switch;
  if (type.includes('firewall')) return DEVICE_STYLES.firewall;
  if (type.includes('server')) return DEVICE_STYLES.server;
  if (type.includes('access') || type.includes('wireless')) return DEVICE_STYLES.access_point;
  if (type.includes('pc') || type.includes('host') || type.includes('computer')) return DEVICE_STYLES.pc;
  return DEVICE_STYLES[type] || DEVICE_STYLES.unknown;
}

export default React.memo(function TopologyDiagram({ topology }) {
  const devices = Array.isArray(topology?.devices) ? topology.devices : [];
  const connections = Array.isArray(topology?.connections) ? topology.connections : [];
  const nodes = useMemo(() => {
    const known = new Map(devices.map(device => [String(device.id || device.name), device]));
    connections.flatMap(connection => [connection.from, connection.to]).filter(Boolean).forEach(id => {
      if (!known.has(String(id))) known.set(String(id), { id, name: id, type: 'unknown' });
    });
    return Array.from(known.values());
  }, [devices, connections]);

  const layout = useMemo(() => {
    const positions = nodes.map((node, index) => ({
      node,
      x: 110 + (index % 4) * 190,
      y: 90 + Math.floor(index / 4) * 120
    }));
    const positionById = new Map(positions.map(item => [String(item.node.id || item.node.name), item]));
    const height = Math.max(220, 160 + Math.ceil(nodes.length / 4) * 120);
    return { positions, positionById, height };
  }, [nodes]);

  if (!nodes.length) {
    return (
      <div className="topology-empty">
        <strong>No topology diagram is defined for this lab.</strong>
        <span>The source lab does not specify physical devices or links, so no devices are invented here.</span>
      </div>
    );
  }

  const { positions, positionById, height } = layout;

  return (
    <div className="topology-visual">
      <svg viewBox={`0 0 900 ${height}`} role="img" aria-label="Lab network topology diagram">
        {connections.map((connection, index) => {
          const from = positionById.get(String(connection.from));
          const to = positionById.get(String(connection.to));
          if (!from || !to) return null;
          return (
            <g key={`${connection.from}-${connection.to}-${index}`}>
              <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} className="topology-link" />
              <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 8} className="topology-link-label">
                {connection.type || 'link'}
              </text>
            </g>
          );
        })}
        {positions.map(({ node, x, y }) => {
          const style = styleFor(node);
          return (
            <g key={String(node.id || node.name)} transform={`translate(${x} ${y})`}>
              <circle r="30" fill={`${style.color}22`} stroke={style.color} strokeWidth="2" />
              <circle r="22" fill="#081322" stroke={style.color} strokeWidth="1" />
              <text textAnchor="middle" dy="6" className="topology-node-icon" fill={style.color}>{style.icon}</text>
              <text textAnchor="middle" y="52" className="topology-node-label">{node.name || node.id}</text>
            </g>
          );
        })}
      </svg>
      <div className="topology-key" aria-label="Topology device key">
        <strong>KEY</strong>
        {[...new Set(nodes.map(styleFor))].map(style => (
          <span key={style.label}><i style={{ background: style.color }} />{style.icon} = {style.label}</span>
        ))}
            </div>
    </div>
  );
});
