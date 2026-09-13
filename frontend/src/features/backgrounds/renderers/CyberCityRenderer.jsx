// Cyber City Renderer - Uses shared AnimationLoop coordinator.
import React, { useRef, useEffect } from 'react';
import { AnimationLoop } from '../animationLoop';

export const CyberCityRenderer = ({ opacity = 0.8, zIndex = -2, sharedLoop = null }) => {
  const canvasRef = useRef(null);
  const buildingsRef = useRef([]);
  const loopRef = useRef(sharedLoop || AnimationLoop.shared());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
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
      buildingsRef.current = buildings;
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = loopRef.current;

    const draw = (msg) => {
      if (msg.type === 'resize') return;
      const { timestamp } = msg;
      ctx.fillStyle = 'rgba(0,3,15,0.98)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.7);
      skyGradient.addColorStop(0, 'rgba(0, 5, 20, 1)');
      skyGradient.addColorStop(1, 'rgba(0, 10, 30, 1)');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height * 0.7);

      ctx.fillStyle = 'rgba(0, 229, 255, 0.4)';
      for (let i = 0; i < 50; i++) {
        const x = (i * 37 + timestamp * 10) % canvas.width;
        const y = (i * 73) % (canvas.height * 0.7);
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = 'rgba(0, 3, 10, 0.95)';
      ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);

      const baseY = canvas.height * 0.7;
      buildingsRef.current.forEach(b => {
        ctx.fillStyle = 'rgba(0, 5, 15, 0.9)';
        ctx.fillRect(b.x, baseY - b.height, b.width, b.height);

        ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(b.x, baseY - b.height, b.width, b.height);

        b.windows.forEach(w => {
          if (w.lit) {
            const pulse = Math.sin(timestamp * 2 + w.x + w.y) * 0.3 + 0.7;
            ctx.fillStyle = w.color.replace(')', `, ${pulse * 0.8})`).replace('rgb', 'rgba');
            ctx.fillRect(b.x + w.x, baseY - b.height + w.y, 8, 6);
          }
        });

        if (Math.random() < 0.3) {
          ctx.strokeStyle = b.color.replace(')', ', 0.5)').replace('rgb', 'rgba');
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(b.x + b.width / 2, baseY - b.height);
          ctx.lineTo(b.x + b.width / 2, baseY - b.height - 30);
          ctx.stroke();
          ctx.fillStyle = 'rgba(255, 50, 85, 0.8)';
          ctx.beginPath();
          ctx.arc(b.x + b.width / 2, baseY - b.height - 30, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      ctx.fillStyle = 'rgba(0, 229, 255, 0.6)';
      for (let i = 0; i < 8; i++) {
        const x = (i * 150 + timestamp * 10) % canvas.width;
        const y = 100 + Math.sin(timestamp + i) * 50;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 20, y - 5);
        ctx.lineTo(x + 40, y);
        ctx.lineTo(x + 20, y + 5);
        ctx.closePath();
        ctx.fill();
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

export default CyberCityRenderer;
