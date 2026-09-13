// Radar Network Renderer - Uses shared AnimationLoop coordinator.
import React, { useRef, useEffect } from 'react';
import { AnimationLoop } from '../animationLoop';

export const RadarNetworkRenderer = ({ opacity = 0.8, zIndex = -2, sharedLoop = null }) => {
  const canvasRef = useRef(null);
  const nodesRef = useRef([]);
  const loopRef = useRef(sharedLoop || AnimationLoop.shared());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = Math.min(cx, cy) * 0.7;
      const nodes = [];
      const count = 12;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const r = radius * (0.3 + Math.random() * 0.7);
        nodes.push({
          x: cx + Math.cos(angle) * r,
          y: cy + Math.sin(angle) * r,
          pulsePhase: Math.random() * Math.PI * 2,
          size: Math.random() * 3 + 2,
        });
      }
      nodesRef.current = nodes;
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = loopRef.current;
    let angle = 0;

    const draw = (msg) => {
      if (msg.type === 'resize') return;
      const { delta } = msg;
      angle += delta * 1.5;

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = Math.min(cx, cy) * 0.7;

      ctx.fillStyle = 'rgba(3,5,10,0.95)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Radar circles
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let r = radius / 4; r <= radius; r += radius / 4) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Cross lines
      ctx.beginPath();
      ctx.moveTo(cx - radius, cy);
      ctx.lineTo(cx + radius, cy);
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.stroke();

      // Sweep
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
      ctx.stroke();

      // Sweep trail
      ctx.fillStyle = 'rgba(0, 229, 255, 0.03)';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, angle - 0.5, angle);
      ctx.closePath();
      ctx.fill();

      const nodes = nodesRef.current;
      nodes.forEach(n => {
        const pulse = Math.sin(msg.timestamp * 3 + n.pulsePhase) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(0, 229, 255, ${0.3 + pulse * 0.5})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size * pulse, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const unsubscribe = loop.subscribe(draw);

    return () => {
      unsubscribe();
      window.removeEventListener('resize', resize);
    };
  }, [loopRef.current]);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex, opacity }} />;
};

export default RadarNetworkRenderer;
