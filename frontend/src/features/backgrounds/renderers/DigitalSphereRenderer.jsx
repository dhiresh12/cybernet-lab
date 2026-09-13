// Digital Sphere Renderer - Uses shared AnimationLoop coordinator.
import React, { useRef, useEffect } from 'react';
import { AnimationLoop } from '../animationLoop';

export const DigitalSphereRenderer = ({ opacity = 0.8, zIndex = -2, sharedLoop = null }) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const rotationRef = useRef({ x: 0, y: 0 });
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

    const buildParticles = () => {
      const starScale = AnimationLoop.getParticleScale();
      const count = Math.floor(200 * starScale);
      const particles = [];
      for (let i = 0; i < count; i++) {
        const theta = Math.acos(2 * Math.random() - 1);
        const phi = 2 * Math.PI * Math.random();
        const r = 150 + Math.random() * 50;
        particles.push({
          theta, phi, r,
          vTheta: (Math.random() - 0.5) * 0.001,
          vPhi: (Math.random() - 0.5) * 0.001,
          size: Math.random() * 2 + 1,
          color: Math.random() > 0.5 ? '#00e5ff' : '#7fe8ff',
        });
      }
      particlesRef.current = particles;
    };
    buildParticles();

    const loop = loopRef.current;
    const rot = rotationRef.current;

    const project = (p, cx, cy, scale) => {
      const x = p.r * Math.sin(p.theta) * Math.cos(p.phi);
      const y = p.r * Math.sin(p.theta) * Math.sin(p.phi);
      const z = p.r * Math.cos(p.theta);

      const x1 = x * Math.cos(rot.y) - z * Math.sin(rot.y);
      const z1 = x * Math.sin(rot.y) + z * Math.cos(rot.y);
      const y1 = y * Math.cos(rot.x) - z1 * Math.sin(rot.x);
      const z2 = y * Math.sin(rot.x) + z1 * Math.cos(rot.x);

      return {
        x: cx + x1 * scale,
        y: cy + y1 * scale,
        z: z2,
        size: p.size * (1 + z2 / 300),
        opacity: 0.3 + 0.7 * (1 + z2 / 300),
        color: p.color,
      };
    };

    const draw = (msg) => {
      if (msg.type === 'resize') return;
      ctx.fillStyle = 'rgba(3,5,10,0.95)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const scale = Math.min(canvas.width, canvas.height) / 600;

      rot.x += 0.0002;
      rot.y += 0.0003;

      const projected = particlesRef.current.map(p => project(p, cx, cy, scale));
      projected.sort((a, b) => b.z - a.z);

      projected.forEach(p => {
        const hex = p.color.replace('#', '');
        const red = parseInt(hex.slice(0, 2), 16);
        const green = parseInt(hex.slice(2, 4), 16);
        const blue = parseInt(hex.slice(4, 6), 16);
        ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
      ctx.lineWidth = 1;
      const sphereR = 200 * scale;
      for (let lat = -80; lat <= 80; lat += 20) {
        ctx.beginPath();
        for (let lon = 0; lon <= 360; lon += 10) {
          const x = cx + sphereR * Math.cos(lat * Math.PI / 180) * Math.cos((lon + rot.y * 180 / Math.PI) * Math.PI / 180);
          const y = cy + sphereR * Math.sin(lat * Math.PI / 180);
          if (lon === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      for (let lon = 0; lon < 180; lon += 30) {
        ctx.beginPath();
        for (let lat = -90; lat <= 90; lat += 10) {
          const x = cx + sphereR * Math.cos(lat * Math.PI / 180) * Math.cos((lon + rot.y * 180 / Math.PI) * Math.PI / 180);
          const y = cy + sphereR * Math.sin(lat * Math.PI / 180);
          if (lat === -90) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
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

export default DigitalSphereRenderer;
