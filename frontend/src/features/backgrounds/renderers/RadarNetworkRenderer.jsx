// Radar Renderer
import React, { useRef, useEffect } from 'react';

export const RadarNetworkRenderer = ({ opacity = 0.8, zIndex = -2 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let sweepAngle = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const contacts = Array.from({ length: 12 }, () => ({
      angle: Math.random() * Math.PI * 2,
      distance: 0.3 + Math.random() * 0.6,
      strength: Math.random(),
      speed: (Math.random() - 0.5) * 0.0002,
      size: Math.random() * 6 + 4,
    }));

    const draw = () => {
      ctx.fillStyle = 'rgba(0,5,15,0.98)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const maxR = Math.min(cx, cy) * 0.85;

      // Range rings
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let r = 1; r <= 4; r++) {
        ctx.beginPath();
        ctx.arc(cx, cy, maxR * r / 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Bearing lines
      for (let b = 0; b < 360; b += 30) {
        const rad = b * Math.PI / 180;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(rad) * maxR, cy + Math.sin(rad) * maxR);
        ctx.stroke();
      }

      // Sweep
      sweepAngle += 0.01;
      if (sweepAngle > Math.PI * 2) sweepAngle = 0;

      const sweepGradient = ctx.createLinearGradient(
        cx, cy,
        cx + Math.cos(sweepAngle) * maxR,
        cy + Math.sin(sweepAngle) * maxR
      );
      sweepGradient.addColorStop(0, 'rgba(0, 229, 255, 0.4)');
      sweepGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = sweepGradient;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxR, sweepAngle - 0.05, sweepAngle);
      ctx.closePath();
      ctx.fill();

      // Contacts
      contacts.forEach(c => {
        c.angle += c.speed;
        const x = cx + Math.cos(c.angle) * maxR * c.distance;
        const y = cy + Math.sin(c.angle) * maxR * c.distance;
        
        // Blip
        const blipAlpha = 0.5 + Math.sin(Date.now() * 0.005 + c.angle) * 0.3;
        ctx.fillStyle = `rgba(0, 229, 255, ${blipAlpha})`;
        ctx.beginPath();
        ctx.arc(x, y, c.size, 0, Math.PI * 2);
        ctx.fill();

        // Trail
        ctx.strokeStyle = `rgba(0, 229, 255, ${0.2 * c.strength})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.stroke();
      });

      // Center
      ctx.fillStyle = 'rgba(0, 229, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex, opacity }} />;
};

export default RadarNetworkRenderer;