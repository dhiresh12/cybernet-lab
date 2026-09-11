// SOC Renderer
import React, { useRef, useEffect } from 'react';

export const SOCRenderer = ({ opacity = 0.8, zIndex = -2 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const threats = Array.from({ length: 15 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      targetX: Math.random() * canvas.width,
      targetY: Math.random() * canvas.height,
      progress: Math.random(),
      severity: Math.random(),
      size: Math.random() * 8 + 4,
    }));

    const draw = () => {
      ctx.fillStyle = 'rgba(0,5,15,0.95)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid
      ctx.strokeStyle = 'rgba(255, 50, 85, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 50;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Threats
      threats.forEach(t => {
        t.progress += 0.002;
        if (t.progress >= 1) {
          t.x = t.targetX;
          t.y = t.targetY;
          t.targetX = Math.random() * canvas.width;
          t.targetY = Math.random() * canvas.height;
          t.progress = 0;
        }
        const x = t.x + (t.targetX - t.x) * t.progress;
        const y = t.y + (t.targetY - t.y) * t.progress;

        // Pulse
        const pulse = Math.sin(time * 3 + t.x) * 0.3 + 0.7;
        const color = t.severity > 0.7 ? 'rgba(255, 50, 85' : t.severity > 0.4 ? 'rgba(255, 170, 0' : 'rgba(0, 229, 255';
        
        ctx.fillStyle = `${color}, ${pulse * 0.5})`;
        ctx.beginPath();
        ctx.arc(x, y, t.size * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Ring
        ctx.strokeStyle = `${color}, ${pulse * 0.3})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, t.size * 2 * pulse, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Scan line
      const scanY = (time * 50) % canvas.height;
      ctx.fillStyle = 'rgba(255, 50, 85, 0.05)';
      ctx.fillRect(0, scanY, canvas.width, 2);

      time += 0.016;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex, opacity }} />;
};

export default SOCRenderer;