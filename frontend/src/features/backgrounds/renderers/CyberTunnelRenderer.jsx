// Cyber Tunnel Renderer
import React, { useRef, useEffect } from 'react';

export const CyberTunnelRenderer = ({ opacity = 0.8, zIndex = -2 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let zOffset = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const rings = 20;
    const ringSpacing = 60;

    const draw = () => {
      ctx.fillStyle = 'rgba(3,5,10,0.98)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      zOffset += 1;
      if (zOffset > ringSpacing) zOffset = 0;

      for (let i = 0; i < rings; i++) {
        const z = (i * ringSpacing - zOffset) % (rings * ringSpacing);
        if (z <= 0) continue;

        const scale = 500 / z;
        const size = Math.max(10, 300 * scale);
        const alpha = Math.max(0, 0.3 * (1 - z / (rings * ringSpacing)));

        ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
        ctx.lineWidth = Math.max(0.5, 2 * scale);

        // Square ring
        ctx.beginPath();
        ctx.rect(cx - size / 2, cy - size / 2, size, size);
        ctx.stroke();

        // Crosshair
        ctx.beginPath();
        ctx.moveTo(cx - size / 2, cy);
        ctx.lineTo(cx + size / 2, cy);
        ctx.moveTo(cx, cy - size / 2);
        ctx.lineTo(cx, cy + size / 2);
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex, opacity }} />;
};

export default CyberTunnelRenderer;