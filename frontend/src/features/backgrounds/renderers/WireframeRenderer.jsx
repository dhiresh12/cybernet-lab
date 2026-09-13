// Wireframe Renderer
// Uses shared AnimationLoop coordinator. Pauses when document is hidden.
import React, { useRef, useEffect } from 'react';
import { AnimationLoop } from '../animationLoop';

export const WireframeRenderer = ({ opacity = 0.7, zIndex = -2, sharedLoop = null }) => {
  const canvasRef = useRef(null);
  const rotationRef = useRef(0);
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

    const gridSize = 40;
    const depth = 20;
    const loop = loopRef.current;

    const draw = (msg) => {
      if (msg.type === 'resize') return;
      ctx.fillStyle = 'rgba(3,5,10,0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.lineWidth = 1;

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rotationRef.current);

      for (let z = -depth; z <= depth; z++) {
        const scale = 1 + z * 0.05;
        const offset = z * 30;

        ctx.beginPath();
        for (let x = -canvas.width; x <= canvas.width; x += gridSize * scale) {
          ctx.moveTo(x * scale, -canvas.height * scale + offset);
          ctx.lineTo(x * scale, canvas.height * scale + offset);
        }
        for (let y = -canvas.height; y <= canvas.height; y += gridSize * scale) {
          ctx.moveTo(-canvas.width * scale + offset, y * scale);
          ctx.lineTo(canvas.width * scale + offset, y * scale);
        }
        ctx.stroke();
      }

      ctx.restore();
      rotationRef.current += 0.0002;
    };

    const unsubscribe = loop.subscribe(draw);

    return () => {
      unsubscribe();
      window.removeEventListener('resize', resize);
    };
  }, [loopRef.current]);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex, opacity }} />;
};

export default WireframeRenderer;