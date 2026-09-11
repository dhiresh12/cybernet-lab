// Digital Sphere Renderer
import React, { useRef, useEffect } from 'react';

export const DigitalSphereRenderer = ({ opacity = 0.8, zIndex = -2 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let rotationX = 0;
    let rotationY = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const count = 200;
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

    const project = (p, cx, cy, scale) => {
      const x = p.r * Math.sin(p.theta) * Math.cos(p.phi);
      const y = p.r * Math.sin(p.theta) * Math.sin(p.phi);
      const z = p.r * Math.cos(p.theta);
      
      // Rotate Y
      const x1 = x * Math.cos(rotationY) - z * Math.sin(rotationY);
      const z1 = x * Math.sin(rotationY) + z * Math.cos(rotationY);
      // Rotate X
      const y1 = y * Math.cos(rotationX) - z1 * Math.sin(rotationX);
      const z2 = y * Math.sin(rotationX) + z1 * Math.cos(rotationX);
      
      return {
        x: cx + x1 * scale,
        y: cy + y1 * scale,
        z: z2,
        size: p.size * (1 + z2 / 300),
        opacity: 0.3 + 0.7 * (1 + z2 / 300),
        color: p.color,
      };
    };

    const draw = () => {
      ctx.fillStyle = 'rgba(3,5,10,0.95)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const scale = Math.min(canvas.width, canvas.height) / 600;

      rotationX += 0.0002;
      rotationY += 0.0003;

      // Draw particles back to front
      const projected = particles.map(p => project(p, cx, cy, scale));
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

      // Wireframe sphere
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
      ctx.lineWidth = 1;
      const sphereR = 200 * scale;
      for (let lat = -80; lat <= 80; lat += 20) {
        ctx.beginPath();
        for (let lon = 0; lon <= 360; lon += 10) {
          const x = cx + sphereR * Math.cos(lat * Math.PI / 180) * Math.cos((lon + rotationY * 180 / Math.PI) * Math.PI / 180);
          const y = cy + sphereR * Math.sin(lat * Math.PI / 180);
          if (lon === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      for (let lon = 0; lon < 180; lon += 30) {
        ctx.beginPath();
        for (let lat = -90; lat <= 90; lat += 10) {
          const x = cx + sphereR * Math.cos(lat * Math.PI / 180) * Math.cos((lon + rotationY * 180 / Math.PI) * Math.PI / 180);
          const y = cy + sphereR * Math.sin(lat * Math.PI / 180);
          if (lat === -90) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex, opacity }} />;
};

export default DigitalSphereRenderer;