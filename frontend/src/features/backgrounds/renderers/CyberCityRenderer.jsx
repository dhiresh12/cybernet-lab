// Cyber City Renderer
import React, { useRef, useEffect } from 'react';

export const CyberCityRenderer = ({ opacity = 0.8, zIndex = -2 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const buildings = [];
    const buildingWidth = 60;
    const numBuildings = Math.ceil(canvas.width / buildingWidth) + 2;

    for (let i = 0; i < numBuildings; i++) {
      const height = 100 + Math.random() * 300;
      const width = buildingWidth * (0.8 + Math.random() * 0.4);
      const x = i * buildingWidth - width / 2;
      const windows = [];
      const rows = Math.floor(height / 20);
      const cols = Math.floor(width / 15);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (Math.random() < 0.7) {
            windows.push({
              x: c * 15 + 10,
              y: r * 20 + 10,
              lit: Math.random() > 0.3,
              color: Math.random() > 0.6 ? '#00e5ff' : '#7fe8ff',
            });
          }
        }
      }
      buildings.push({ x, width, height, windows, color: Math.random() > 0.5 ? '#00e5ff' : '#7fe8ff' });
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0,3,15,0.98)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Sky gradient
      const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.7);
      skyGradient.addColorStop(0, 'rgba(0, 5, 20, 1)');
      skyGradient.addColorStop(1, 'rgba(0, 10, 30, 1)');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height * 0.7);

      // Stars
      ctx.fillStyle = 'rgba(0, 229, 255, 0.4)';
      for (let i = 0; i < 50; i++) {
        const x = (i * 37 + Date.now() * 0.001) % canvas.width;
        const y = (i * 73) % (canvas.height * 0.7);
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Ground
      ctx.fillStyle = 'rgba(0, 3, 10, 0.95)';
      ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);

      // Buildings
      buildings.forEach(b => {
        const baseY = canvas.height * 0.7;
        const bx = b.x;
        const bw = b.width;
        const bh = b.height;

        // Building body
        ctx.fillStyle = 'rgba(0, 5, 15, 0.9)';
        ctx.fillRect(bx, baseY - bh, bw, bh);

        // Windows
        b.windows.forEach(w => {
          if (w.lit) {
            const pulse = Math.sin(Date.now() * 0.002 + w.x + w.y) * 0.3 + 0.7;
            ctx.fillStyle = w.color.replace(')', `, ${pulse * 0.8})`).replace('rgb', 'rgba');
            ctx.fillRect(bx + w.x, baseY - bh + w.y, 8, 6);
          }
        });

        // Antenna
        if (Math.random() < 0.3) {
          ctx.strokeStyle = b.color.replace(')', ', 0.5)').replace('rgb', 'rgba');
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(bx + bw / 2, baseY - bh);
          ctx.lineTo(bx + bw / 2, baseY - bh - 30);
          ctx.stroke();
          ctx.fillStyle = 'rgba(255, 50, 85, 0.8)';
          ctx.beginPath();
          ctx.arc(bx + bw / 2, baseY - bh - 30, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Flying vehicles
      ctx.fillStyle = 'rgba(0, 229, 255, 0.6)';
      for (let i = 0; i < 8; i++) {
        const x = (i * 150 + Date.now() * 0.05) % canvas.width;
        const y = 100 + Math.sin(Date.now() * 0.001 + i) * 50;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 20, y - 5);
        ctx.lineTo(x + 40, y);
        ctx.lineTo(x + 20, y + 5);
        ctx.closePath();
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex, opacity }} />;
};

export default CyberCityRenderer;