// Network Galaxy Renderer
// Uses shared AnimationLoop coordinator. Particle count scales with device capability.
import React, { useRef, useEffect, useCallback } from 'react';
import { AnimationLoop } from '../animationLoop';

export const NetworkGalaxyRenderer = ({ opacity = 0.8, zIndex = -2, sharedLoop = null }) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const starsRef = useRef([]);
  const rotationRef = useRef(0);
  const loopRef = useRef(sharedLoop || AnimationLoop.shared());

  const getStarCount = useCallback(() => {
    const scale = AnimationLoop.getParticleScale();
    const arms = 4;
    const starsPerArm = Math.floor(150 * scale);
    return { arms, starsPerArm };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctxRef.current = ctx;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const buildStars = () => {
      const { arms, starsPerArm } = getStarCount();
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
      starsRef.current = stars;
    };
    buildStars();

    const loop = loopRef.current;

    const draw = (msg) => {
      if (msg.type === 'resize') {
        buildStars();
        return;
      }
      const ctx = ctxRef.current;
      const stars = starsRef.current;
      if (!ctx || !stars.length) return;

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
        const x = cx + Math.cos(star.baseAngle + rotationRef.current) * star.radius;
        const y = cy + Math.sin(star.baseAngle + rotationRef.current) * star.radius;
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      rotationRef.current += 0.0001;
    };

    const unsubscribe = loop.subscribe(draw);

    return () => {
      unsubscribe();
      window.removeEventListener('resize', resize);
    };
  }, [getStarCount, loopRef.current]);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex, opacity }} />;
};

export default NetworkGalaxyRenderer;