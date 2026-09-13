import React, { useState, useEffect, useRef, useCallback } from 'react';

const NETWORK_THEMES = {
  cyber: { node: '#00f0ff', link: 'rgba(0,240,255,0.4)', bg: 'rgba(3,5,10,0.9)' },
  green: { node: '#00ff88', link: 'rgba(0,255,136,0.4)', bg: 'rgba(3,10,5,0.9)' },
  red: { node: '#ff3355', link: 'rgba(255,51,85,0.4)', bg: 'rgba(10,3,5,0.9)' },
  purple: { node: '#aa00ff', link: 'rgba(170,0,255,0.4)', bg: 'rgba(5,3,10,0.9)' },
  amber: { node: '#ffbf00', link: 'rgba(255,191,0,0.4)', bg: 'rgba(10,8,3,0.9)' }
};

export default function NetworkVisualization({ lab, onComplete, onVerify, completedSteps = [] }) {
  const canvasRef = useRef(null);
  const [viewMode, setViewMode] = useState('topology');
  const [selectedNode, setSelectedNode] = useState(null);
  const [packets, setPackets] = useState([]);
  const [theme, setTheme] = useState('cyber');
  const animationRef = useRef(null);
  const nodesRef = useRef([]);
  const linksRef = useRef([]);
  const themeRef = useRef(NETWORK_THEMES.cyber);

  useEffect(() => {
    const colors = NETWORK_THEMES[theme];
    themeRef.current = colors;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let mouseX = 0;
    let mouseY = 0;
    let offsetX = 0;
    let offsetY = 0;
    let scale = 1;
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    // Parse lab structure for nodes and links
    const colors = themeRef.current;
    const devices = [];
    const deviceConnections = [];

    // Extract devices from lab data
    if (lab && lab.steps) {
      let nodeId = 0;

      // Add router
      devices.push({
        id: `router-${nodeId}`,
        label: lab.title.includes('Router') ? 'Router' : 'Router0',
        type: 'router',
        x: 0,
        y: 0,
        radius: 16,
        status: 'active'
      });
      nodeId++;

      // Add switches
      const switchCount = lab.category === 'Switching' || lab.category === 'VLAN' || lab.category === 'STP' || lab.category === 'Trunking' ? 2 : 1;
      for (let i = 0; i < switchCount; i++) {
        devices.push({
          id: `switch-${i}`,
          label: `Switch${i}`,
          type: 'switch',
          x: -150 + i * 300,
          y: 150,
          radius: 14,
          status: 'active'
        });
        deviceConnections.push({ from: `router-0`, to: `switch-${i}` });
      }

      // Add PCs
      const pcCount = lab.level === 'basic' ? 4 : 6;
      for (let i = 0; i < pcCount; i++) {
        const switchIdx = i < pcCount / 2 ? 0 : 1;
        devices.push({
          id: `pc-${i}`,
          label: `PC${i}`,
          type: 'pc',
          x: -200 + i * 100 + (switchIdx * 300),
          y: 280,
          radius: 10,
          status: completedSteps.includes(lab.steps?.[0]?.stepId) ? 'active' : 'pending'
        });
        deviceConnections.push({ from: `switch-${switchIdx}`, to: `pc-${i}` });
      }

      // Add server if needed
      if (lab.category === 'Services' || lab.category === 'Security' || lab.category.includes('DNS') || lab.title.includes('Server')) {
        devices.push({
          id: 'server-0',
          label: 'Server',
          type: 'server',
          x: 0,
          y: 300,
          radius: 14,
          status: 'active'
        });
        deviceConnections.push({ from: `router-0`, to: 'server-0' });
      }
    }

    nodesRef.current = devices;
    linksRef.current = deviceConnections;

    // Initialize packets
    if (packets.length === 0 && viewMode === 'packets') {
      const newPackets = [];
      for (let i = 0; i < 5; i++) {
        const link = deviceConnections[Math.floor(Math.random() * deviceConnections.length)];
        if (link) {
          newPackets.push({
            link,
            progress: Math.random(),
            speed: 0.001 + Math.random() * 0.003,
            size: 4 + Math.random() * 4
          });
        }
      }
      setPackets(newPackets);
    }

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      if (isDragging && dragStart) {
        offsetX += (e.clientX - dragStart.x) * 0.5;
        offsetY += (e.clientY - dragStart.y) * 0.5;
      }
      dragStart = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener('mousedown', () => { isDragging = true; });
    canvas.addEventListener('mouseup', () => { isDragging = false; });
    canvas.addEventListener('mouseleave', () => { isDragging = false; });
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      scale *= e.deltaY < 0 ? 1.1 : 0.9;
      scale = Math.max(0.3, Math.min(3, scale));
    });

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);

      // Center nodes
      const centerX = width / 2 / scale;
      const centerY = height / 2 / scale;

      // Draw links
      deviceConnections.forEach(link => {
        const fromNode = devices.find(d => d.id === link.from);
        const toNode = devices.find(d => d.id === link.to);
        if (fromNode && toNode) {
          ctx.strokeStyle = colors.link;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(centerX + fromNode.x, centerY + fromNode.y);
          ctx.lineTo(centerX + toNode.x, centerY + toNode.y);
          ctx.stroke();
        }
      });

      // Draw packets if in packets mode
      if (viewMode === 'packets') {
        packets.forEach((pkt, i) => {
          const fromNode = devices.find(d => d.id === pkt.link.from);
          const toNode = devices.find(d => d.id === pkt.link.to);
          if (fromNode && toNode) {
            const x = centerX + fromNode.x + (toNode.x - fromNode.x) * pkt.progress;
            const y = centerY + fromNode.y + (toNode.y - fromNode.y) * pkt.progress;
            ctx.fillStyle = '#00ff88';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(x, y, pkt.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        });

        // Update packet positions
        setPackets(ps => ps.map(p => {
          const newProgress = p.progress + p.speed;
          if (newProgress >= 1) return { ...p, progress: 0 };
          return { ...p, progress: newProgress };
        }));
      }

      // Draw nodes
      devices.forEach(node => {
        const isMouseOver = Math.abs(mouseX / scale - offsetX - (centerX + node.x)) < 40 &&
                           Math.abs(mouseY / scale - offsetY - (centerY + node.y)) < 40;

        // Node glow
        if (isMouseOver || selectedNode === node.id) {
          ctx.shadowBlur = 20;
        }
        ctx.fillStyle = isMouseOver || selectedNode === node.id
          ? '#ffffff'
          : node.status === 'active' ? colors.node : '#666666';
        ctx.beginPath();
        ctx.arc(centerX + node.x, centerY + node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Node border
        ctx.strokeStyle = colors.node;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Node label
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, centerX + node.x, centerY + node.y + node.radius + 18);

        // Node type icon
        ctx.fillStyle = colors.node;
        ctx.font = `${node.radius * 1.2}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let icon = 'PC';
        if (node.type === 'router') icon = 'Plug';
        else if (node.type === 'switch') icon = 'Switch';
        else if (node.type === 'pc') icon = 'Laptop';
        else if (node.type === 'server') icon = 'Server';
        ctx.fillText(icon, centerX + node.x, centerY + node.y - 2);
      });

      ctx.restore();
      animationRef.current = requestAnimationFrame(draw);
    };

    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const adjustedX = (cx - offsetX) / scale - width / 2 / scale;
      const adjustedY = (cy - offsetY) / scale - height / 2 / scale;

      const clicked = devices.find(d =>
        Math.sqrt(Math.pow(adjustedX - d.x, 2) + Math.pow(adjustedY - d.y, 2)) < d.radius + 10
      );
      if (clicked) {
        setSelectedNode(clicked.id);
        if (onVerify && clicked.type === 'router' && lab) {
          onVerify({ verify: true });
        }
      }
    });

    const width = canvas.width / window.devicePixelRatio;
    const height = canvas.height / window.devicePixelRatio;

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [viewMode, selectedNode, theme, packets.length, lab]);

  const toggleView = () => {
    setViewMode(v => v === 'topology' ? 'packets' : 'topology');
    setPackets([]);
  };

  const themeColors = NETWORK_THEMES[theme];

  return (
    <div style={{
      background: themeColors.bg,
      border: '1px solid rgba(0,240,255,0.35)',
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
      position: 'relative'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
      }}>
        <div style={{ color: themeColors.node, fontSize: '0.95em', fontWeight: 700 }}>
          PC Network Topology Visualization
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <select
            value={theme}
            onChange={e => setTheme(e.target.value)}
            style={{ background: 'rgba(0,0,0,0.4)', color: themeColors.node, border: '1px solid rgba(0,240,255,0.3)', borderRadius: 4, padding: '4px 8px', fontSize: '0.75em' }}
          >
            {Object.keys(NETWORK_THEMES).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button
            onClick={toggleView}
            style={{
              padding: '4px 10px',
              borderRadius: 4,
              border: `1px solid ${themeColors.node}`,
              background: 'rgba(0,0,0,0.4)',
              color: themeColors.node,
              fontSize: '0.75em',
              cursor: 'pointer'
            }}
            title={viewMode === 'packets' ? 'Show topology view' : 'Show packet flow view'}
          >
            {viewMode === 'packets' ? 'Signal Packets' : 'Link Topology'}
          </button>
        </div>
      </div>

      <div style={{
        width: '100%',
        height: 320,
        borderRadius: 8,
        cursor: 'grab',
        overflow: 'hidden'
      }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>

      {selectedNode && (
        <div style={{ marginTop: 8, padding: 8, background: 'rgba(0,0,0,0.4)', borderRadius: 6 }}>
          <div style={{ color: themeColors.node, fontSize: '0.8em', fontWeight: 700 }}>
            Selected: {selectedNode}
          </div>
          <div style={{ color: 'var(--muted)', fontSize: '0.75em' }}>
            {nodesRef.current.find(n => n.id === selectedNode)?.type || 'unknown'} device
          </div>
        </div>
      )}
    </div>
  );
}

window.NETWORK_THEMES = NETWORK_THEMES;
export { NETWORK_THEMES };