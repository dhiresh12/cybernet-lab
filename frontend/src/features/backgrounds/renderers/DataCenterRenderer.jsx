// Data Center Renderer - Uses shared AnimationLoop coordinator.
import React, { useRef, useEffect } from 'react';
import { AnimationLoop } from '../animationLoop';

export const DataCenterRenderer = ({ opacity = 0.8, zIndex = -2, sharedLoop = null }) => {
  const canvasRef = useRef(null);
  const serversRef = useRef([]);
  const loopRef = useRef(sharedLoop || AnimationLoop.shared());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const serverRows = 3;
      const serversPerRow = 8;
      const serverWidth = 70;
      const serverHeight = 350;
      const rowSpacing = 150;
      const colSpacing = 100;
      const servers = [];
      for (let r = 0; r < serverRows; r++) {
        for (let c = 0; c < serversPerRow; c++) {
          const x = 80 + c * colSpacing;
          const y = 80 + r * rowSpacing;
          const leds = Array.from({ length: 25 }, (_, i) => ({
            y: i * (serverHeight / 25) + 10,
            state: Math.random() > 0.2,
            color: Math.random() > 0.7 ? '#00ff88' : '#00e5ff',
            blinkPhase: Math.random() * Math.PI * 2,
            blinkSpeed: 0.05 + Math.random() * 0.1,
          }));
          servers.push({ x, y, leds });
        }
      }
      serversRef.current = servers;
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = loopRef.current;

    const draw = (msg) => {
      if (msg.type === 'resize') return;
      const { timestamp } = msg;
      ctx.fillStyle = 'rgba(0,3,10,0.98)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(0, 229, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
      ctx.lineWidth = 2;
      const servers = serversRef.current;
      for (let r = 0; r < 2; r++) {
        const trayY = 80 + (r + 1) * 150 - 30;
        ctx.beginPath();
        ctx.moveTo(40, trayY);
        ctx.lineTo(canvas.width - 40, trayY);
        ctx.stroke();
        for (let x = 80; x < canvas.width - 40; x += 100) {
          ctx.beginPath();
          ctx.moveTo(x, trayY);
          ctx.lineTo(x, trayY + 20);
          ctx.stroke();
        }
      }

      servers.forEach(s => {
        ctx.fillStyle = 'rgba(10, 15, 25, 0.95)';
        ctx.fillRect(s.x, s.y, 70, 350);

        ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(s.x, s.y, 70, 350);

        s.leds.forEach((led) => {
          const ly = s.y + led.y;
          const pulse = Math.sin(timestamp * 0.001 * led.blinkSpeed + led.blinkPhase) * 0.5 + 0.5;

          if (led.state) {
            ctx.fillStyle = led.color.replace(')', `, ${0.4 + pulse * 0.5})`).replace('rgb', 'rgba');
          } else {
            ctx.fillStyle = 'rgba(50, 50, 60, 0.3)';
          }

          ctx.fillRect(s.x + 5, ly, 6, 4);
          ctx.fillRect(s.x + 70 - 11, ly, 6, 4);
        });

        ctx.fillStyle = 'rgba(0, 229, 255, 0.3)';
        ctx.font = '10px monospace';
        ctx.fillText(`SVR-${servers.indexOf(s) + 1}`, s.x + 5, s.y + 15);

        ctx.fillStyle = Math.random() > 0.98 ? 'rgba(255, 50, 85, 0.8)' : 'rgba(0, 255, 136, 0.6)';
        ctx.beginPath();
        ctx.arc(s.x + 35, s.y - 8, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = 'rgba(0, 30, 60, 0.8)';
      for (let i = 0; i < 4; i++) {
        const x = canvas.width - 60;
        const y = 80 + i * (canvas.height - 160) / 3;
        ctx.fillRect(x, y, 40, 100);

        ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
        ctx.lineWidth = 2;
        const angle = timestamp * 0.01;
        for (let a = 0; a < 4; a++) {
          const aRad = angle + a * Math.PI / 2;
          ctx.beginPath();
          ctx.moveTo(x + 20, y + 50);
          ctx.lineTo(x + 20 + Math.cos(aRad) * 15, y + 50 + Math.sin(aRad) * 15);
          ctx.stroke();
        }
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

export default DataCenterRenderer;
