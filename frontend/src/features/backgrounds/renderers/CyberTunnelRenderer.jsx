// Cyber Tunnel Renderer - Uses shared AnimationLoop coordinator.
import React, { useRef, useEffect } from 'react';
import { AnimationLoop } from '../animationLoop';

export const CyberTunnelRenderer = ({ opacity = 0.8, zIndex = -2, sharedLoop = null }) => {
  const canvasRef = useRef(null);
  const zOffsetRef = useRef(0);
  const loopRef = useRef(sharedLoop || AnimationLoop.shared());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = loopRef.current;
    const rings = 20;
    const ringSpacing = 60;

    const draw = (msg) => {
      if (msg.type === 'resize') return;
      const { delta } = msg;
      zOffsetRef.current += delta * 60;
      if (zOffsetRef.current > ringSpacing) zOffsetRef.current = 0;
      const zOffset = zOffsetRef.current;

      ctx.fillStyle = 'rgba(3,5,10,0.98)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      for (let i = 0; i < rings; i++) {
        const z = (i * ringSpacing - zOffset) % (rings * ringSpacing);
        if (z <= 0) continue;

        const scale = 500 / z;
        const size = Math.max(10, 300 * scale);
        const alpha = Math.max(0, 0.3 * (1 - z / (rings * ringSpacing)));

        ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
        ctx.lineWidth = Math.max(0.5, 2 * scale);

        ctx.beginPath();
        ctx.rect(cx - size / 2, cy - size / 2, size, size);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx - size / 2, cy);
        ctx.lineTo(cx + size / 2, cy);
        ctx.moveTo(cx, cy - size / 2);
        ctx.lineTo(cx, cy + size / 2);
        ctx.stroke();
      }
    };

    const unsubscribe = loop.subscribe(draw);

    return () => {
      unsubscribe();
      window.removeEventListener('resize', resize);
    };
  }, [loopRef.current]);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex, opacity }} />;
};

export default CyberTunnelRenderer;
