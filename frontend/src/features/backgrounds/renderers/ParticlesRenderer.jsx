// Particles Renderer
// Uses shared AnimationLoop coordinator (single rAF across renderers).
// Particle count scales with device capability for low-end devices.
import React, { useRef, useEffect, useCallback } from 'react';
import { AnimationLoop } from '../animationLoop';

export const ParticlesRenderer = ({ opacity = 0.6, zIndex = -2, sharedLoop = null }) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const particlesRef = useRef([]);
  const loopRef = useRef(sharedLoop || AnimationLoop.shared());

  const getParticleCount = useCallback(() => {
    const scale = AnimationLoop.getParticleScale();
    return Math.floor(80 * scale);
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

    // Rebuild particles when count changes (e.g., after visibility restore)
    const buildParticles = () => {
      const count = getParticleCount();
      const particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.2,
        });
      }
      particlesRef.current = particles;
    };
    buildParticles();

    const loop = loopRef.current;

    const draw = (msg) => {
      if (msg.type === 'resize') {
        // Rebuild on resize to avoid stale positions
        buildParticles();
        return;
      }
      const ctx = ctxRef.current;
      const particles = particlesRef.current;
      if (!ctx || !particles.length) return;

      ctx.fillStyle = 'rgba(3,5,10,0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.fillStyle = `rgba(0, 240, 255, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connections - skip on low-end devices to save CPU
      if (!loop.isLowEnd()) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
              ctx.strokeStyle = `rgba(0, 240, 255, ${0.1 * (1 - dist / 150)})`;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }
    };

    const unsubscribe = loop.subscribe(draw);

    return () => {
      unsubscribe();
      window.removeEventListener('resize', resize);
    };
  }, [getParticleCount, loopRef.current]);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex, opacity }} />;
};

export default ParticlesRenderer;