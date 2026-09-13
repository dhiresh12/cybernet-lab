// NOC Ice Blue Renderer - Uses shared AnimationLoop coordinator.
import React, { useRef, useEffect } from 'react';
import { AnimationLoop } from '../animationLoop';

export const NOCIceBlueRenderer = ({ opacity = 0.9, zIndex = -2, sharedLoop = null }) => {
  const canvasRef = useRef(null);
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

    const draw = (msg) => {
      if (msg.type === 'resize') return;
      ctx.fillStyle = 'rgba(3,5,10,0.98)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(0, 229, 255, 0.06)';
      ctx.lineWidth = 1;
      const gridSize = 60;
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

      ctx.strokeStyle = 'rgba(0, 229, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height * 0.3);
      ctx.lineTo(canvas.width, canvas.height * 0.3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, canvas.height * 0.7);
      ctx.lineTo(canvas.width, canvas.height * 0.7);
      ctx.stroke();

      ctx.fillStyle = 'rgba(0, 229, 255, 0.3)';
      const corners = [
        [60, 60], [canvas.width - 60, 60],
        [60, canvas.height - 60], [canvas.width - 60, canvas.height - 60]
      ];
      corners.forEach(([x, y]) => {
        ctx.fillRect(x, y, 40, 2);
        ctx.fillRect(x, y, 2, 40);
      });

      ctx.fillStyle = 'rgba(0, 229, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 8, 0, Math.PI * 2);
      ctx.fill();
    };

    const unsubscribe = loop.subscribe(draw);

    return () => {
      unsubscribe();
      window.removeEventListener('resize', resize);
    };
  }, [loopRef.current]);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex, opacity }} />;
};

export default NOCIceBlueRenderer;
