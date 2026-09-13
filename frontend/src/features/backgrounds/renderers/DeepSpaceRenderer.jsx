// Deep Space Renderer - Uses shared AnimationLoop coordinator.
import React, { useRef, useEffect } from 'react';
import { AnimationLoop } from '../animationLoop';

export const DeepSpaceRenderer = ({ opacity = 0.9, zIndex = -2, sharedLoop = null }) => {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const nebulaeRef = useRef([]);
  const loopRef = useRef(sharedLoop || AnimationLoop.shared());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const starScale = AnimationLoop.getParticleScale();
      const starCount = Math.floor(400 * starScale);
      const stars = [];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: Math.random() * 1000,
          size: Math.random() * 2 + 0.5,
          color: Math.random() > 0.5 ? '#00e5ff' : '#7fe8ff',
        });
      }
      starsRef.current = stars;
      nebulaeRef.current = Array.from({ length: 3 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 300 + 200,
        color: Math.random() > 0.5 ? 'rgba(0, 229, 255, 0.03)' : 'rgba(127, 232, 255, 0.02)',
      }));
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = loopRef.current;

    const draw = (msg) => {
      if (msg.type === 'resize') return;
      ctx.fillStyle = 'rgba(0,3,15,0.98)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      nebulaeRef.current.forEach(n => {
        const gradient = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius);
        gradient.addColorStop(0, n.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(n.x - n.radius, n.y - n.radius, n.radius * 2, n.radius * 2);
      });

      starsRef.current.forEach(star => {
        star.z -= 0.5;
        if (star.z <= 0) {
          star.z = 1000;
          star.x = Math.random() * canvas.width;
          star.y = Math.random() * canvas.height;
        }
        const scale = 1 - star.z / 1000;
        const x = (star.x - canvas.width / 2) * scale + canvas.width / 2;
        const y = (star.y - canvas.height / 2) * scale + canvas.height / 2;
        const size = star.size * scale * 2;
        const opacity = scale * 0.8;
        ctx.fillStyle = star.color.replace(')', `, ${opacity})`).replace('rgb', 'rgba');
        ctx.beginPath();
        ctx.arc(x, y, Math.max(0.1, size), 0, Math.PI * 2);
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

export default DeepSpaceRenderer;
