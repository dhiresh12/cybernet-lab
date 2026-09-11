// Globe Renderer - 3D globe visualization using Three.js
import React, { useRef, useEffect } from 'react';

export const GlobeRenderer = ({ opacity = 0.9, zIndex = -2 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let rotation = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.fillStyle = 'rgba(3,5,10,0.95)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.35;

      // Draw globe sphere (wireframe)
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.15)';
      ctx.lineWidth = 1;

      // Latitude lines
      for (let lat = -80; lat <= 80; lat += 20) {
        const r = radius * Math.cos(lat * Math.PI / 180);
        const y = centerY + radius * Math.sin(lat * Math.PI / 180);
        ctx.beginPath();
        for (let lon = 0; lon <= 360; lon += 5) {
          const x = centerX + r * Math.cos((lon + rotation) * Math.PI / 180);
          const py = y;
          if (lon === 0) ctx.moveTo(x, py);
          else ctx.lineTo(x, py);
        }
        ctx.stroke();
      }

      // Longitude lines
      for (let lon = 0; lon < 180; lon += 15) {
        ctx.beginPath();
        for (let lat = -90; lat <= 90; lat += 5) {
          const r = radius * Math.cos(lat * Math.PI / 180);
          const x = centerX + r * Math.cos((lon + rotation) * Math.PI / 180);
          const y = centerY + radius * Math.sin(lat * Math.PI / 180);
          if (lat === -90) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Glow effect
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.2);
      gradient.addColorStop(0, 'rgba(0, 229, 255, 0.05)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Nodes
      ctx.fillStyle = 'rgba(0, 229, 255, 0.8)';
      const nodes = [
        { lat: 40, lon: -74, label: 'NYC' },
        { lat: 51, lon: 0, label: 'LON' },
        { lat: 35, lon: 139, label: 'TYO' },
        { lat: -33, lon: 151, label: 'SYD' },
        { lat: -23, lon: -46, label: 'SAO' },
        { lat: 25, lon: 55, label: 'DXB' },
        { lat: 37, lon: -122, label: 'SFO' },
        { lat: 48, lon: 2, label: 'PAR' },
      ];

      nodes.forEach(node => {
        const x = centerX + radius * Math.cos(node.lat * Math.PI / 180) * Math.cos((node.lon + rotation) * Math.PI / 180);
        const y = centerY + radius * Math.sin(node.lat * Math.PI / 180);
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      rotation += 0.002;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex, opacity }} />;
};

export default GlobeRenderer;