// Network Galaxy Renderer
import React, { useRef, useEffect } from 'react';

export const NetworkGalaxyRenderer = ({ opacity = 0.8, zIndex = -2 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let rotation = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const arms = 4;
    const starsPerArm = 150;
    const stars = [];

    for (let a = 0; a < arms; a++) {
      for (let i = 0; i < starsPerArm; i++) {
        const t = i / starsPerArm;
        const angle = (a / arms) * Math.PI * 2 + t * Math.PI * 4;
        const r = Math.pow(t, 0.7) * Math.min(canvas.width, canvas.height) * 0.4;
        stars.push({
          baseAngle: angle,
          radius: r,
          speed: 0.0001 * (1 + Math.random() * 2),
          size: Math.random() * 1.5 + 0.5,
          color: Math.random() > 0.6 ? '#00e5ff' : '#7fe8ff',
        });
      }
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(3,5,10,0.98)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Galactic core
      const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80);
      coreGradient.addColorStop(0, 'rgba(0, 229, 255, 0.3)');
      coreGradient.addColorStop(0.5, 'rgba(0, 229, 255, 0.1)');
      coreGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach(star => {
        star.baseAngle += star.speed;
        const x = cx + Math.cos(star.baseAngle + rotation) * star.radius;
        const y = cy + Math.sin(star.baseAngle + rotation) * star.radius;
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      rotation += 0.0001;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex, opacity }} />;
};

export default NetworkGalaxyRenderer;