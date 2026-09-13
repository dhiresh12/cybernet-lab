// Quantum Network Renderer - Uses shared AnimationLoop coordinator.
import React, { useRef, useEffect } from 'react';
import { AnimationLoop } from '../animationLoop';

export const QuantumNetworkRenderer = ({ opacity = 0.8, zIndex = -2, sharedLoop = null }) => {
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
      const scale = AnimationLoop.getParticleScale();
      const count = Math.floor(20 * scale);
      const nodes = [];
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          size: Math.random() * 4 + 2,
          phase: Math.random() * Math.PI * 2,
        });
      }
      nodesRef.current = nodes;
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = loopRef.current;

    const draw = (msg) => {
      if (msg.type === 'resize') return;
      const { timestamp } = msg;
      ctx.fillStyle = 'rgba(3,5,10,0.95)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const nodes = nodesRef.current;
      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0) n.x = canvas.width;
        if (n.x > canvas.width) n.x = 0;
        if (n.y < 0) n.y = canvas.height;
        if (n.y > canvas.height) n.y = 0;
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 250) {
            const alpha = 0.2 * (1 - dist / 250);
            ctx.strokeStyle = `rgba(127, 232, 255, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      nodes.forEach(n => {
        const pulse = Math.sin(timestamp * 3 + n.phase) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(127, 232, 255, ${0.3 + pulse * 0.5})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size * pulse, 0, Math.PI * 2);
        ctx.fill();

        const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.size * 4);
        glow.addColorStop(0, 'rgba(127, 232, 255, 0.2)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(n.x - n.size * 4, n.y - n.size * 4, n.size * 8, n.size * 8);
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

export default QuantumNetworkRenderer;
