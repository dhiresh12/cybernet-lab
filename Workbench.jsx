import React, { useRef, useEffect } from 'react';
import './Workbench.css';

export default function Workbench({ selectedDevice, onSelect, engine }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let devices = [];
    let cables = [];
    let drag = null;

    const resize = () => {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = 'rgba(0,240,255,0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Devices
      devices.forEach(d => {
        ctx.fillStyle = d.selected ? 'rgba(0,240,255,0.15)' : 'rgba(10,18,32,0.9)';
        ctx.strokeStyle = d.selected ? 'var(--cyan)' : 'rgba(0,240,255,0.35)';
        ctx.lineWidth = d.selected ? 2 : 1;
        ctx.beginPath();
        ctx.roundRect(d.x, d.y, d.w, d.h, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#e6f7ff';
        ctx.font = '12px Segoe UI';
        ctx.textAlign = 'center';
        ctx.fillText(d.label, d.x + d.w / 2, d.y + d.h / 2 + 4);
      });

      // Cables
      cables.forEach(c => {
        const a = devices.find(d => d.id === c.from);
        const b = devices.find(d => d.id === c.to);
        if (!a || !b) return;
        const x1 = a.x + a.w / 2;
        const y1 = a.y + a.h / 2;
        const x2 = b.x + b.w / 2;
        const y2 = b.y + b.h / 2;
        ctx.strokeStyle = c.status === 'connected' ? 'rgba(0,255,136,0.8)' : 'rgba(255,51,85,0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    const tool = e.dataTransfer.getData('tool');
    if (!tool) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const id = `dev-${Date.now()}`;
    const device = {
      id,
      type: tool,
      label: tool.toUpperCase(),
      x: e.clientX - rect.left - 40,
      y: e.clientY - rect.top - 20,
      w: 120,
      h: 50,
      selected: false
    };
    // In real app, notify engine
    onSelect(device);
  };

  return (
    <div className="viewport">
      <canvas
        ref={canvasRef}
        className="bench-canvas"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      />
    </div>
  );
}
