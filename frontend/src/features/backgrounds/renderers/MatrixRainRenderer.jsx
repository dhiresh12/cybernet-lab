// Matrix Rain Renderer
// Uses shared AnimationLoop coordinator. Pauses when document is hidden.
import React, { useRef, useEffect, useCallback } from 'react';
import { AnimationLoop } from '../animationLoop';

export const MatrixRainRenderer = ({ opacity = 0.7, zIndex = -2, sharedLoop = null }) => {
  const canvasRef = useRef(null);
  const dropsRef = useRef(null);
  const loopRef = useRef(sharedLoop || AnimationLoop.shared());

  const getCharCount = useCallback(() => {
    const scale = AnimationLoop.getParticleScale();
    return Math.floor((window.innerWidth / 16) * scale);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const cols = Math.floor(canvas.width / 16);
      dropsRef.current = new Array(cols).fill(0);
    };
    resize();
    window.addEventListener('resize', resize);

    const chars = 'ABCDE0123456789@#$%';
    const fontSize = 16;
    const loop = loopRef.current;

    const draw = (msg) => {
      if (msg.type === 'resize') return;
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00ff88';
      ctx.font = `${fontSize}px monospace`;
      const drops = dropsRef.current;
      if (!drops) return;
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        ctx.fillText(text, x, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
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

export default MatrixRainRenderer;