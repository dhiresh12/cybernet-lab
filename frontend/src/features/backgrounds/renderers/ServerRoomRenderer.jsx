// Server Room Renderer - Uses shared AnimationLoop coordinator.
import React, { useRef, useEffect } from 'react';
import { AnimationLoop } from '../animationLoop';

export const ServerRoomRenderer = ({ opacity = 0.8, zIndex = -2, sharedLoop = null }) => {
  const canvasRef = useRef(null);
  const racksRef = useRef([]);
  const loopRef = useRef(sharedLoop || AnimationLoop.shared());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const rackWidth = 80;
      const rackHeight = 400;
      const rackSpacing = 100;
      const numRacks = Math.ceil(canvas.width / rackSpacing) + 1;
      const racks = [];
      for (let i = 0; i < numRacks; i++) {
        const x = i * rackSpacing + 50;
        const leds = Array.from({ length: 20 }, () => ({
          y: Math.random() * rackHeight,
          color: Math.random() > 0.7 ? '#00ff88' : '#00e5ff',
          blink: Math.random() * Math.PI * 2,
          speed: 0.05 + Math.random() * 0.1,
        }));
        racks.push({ x, leds });
      }
      racksRef.current = racks;
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = loopRef.current;

    const draw = (msg) => {
      if (msg.type === 'resize') return;
      const { timestamp } = msg;
      ctx.fillStyle = 'rgba(0,5,10,0.98)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const floorY = canvas.height - 80;
      ctx.fillStyle = 'rgba(0, 229, 255, 0.02)';
      ctx.fillRect(0, floorY, canvas.width, 80);

      const racks = racksRef.current;
      racks.forEach(rack => {
        const rackX = rack.x;
        const rackY = floorY - 400;

        ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.strokeRect(rackX - 40, rackY, 80, 400);

        rack.leds.forEach((led) => {
          const ly = rackY + led.y;
          const pulse = Math.sin(timestamp * 0.001 * led.speed + led.blink) * 0.5 + 0.5;
          ctx.fillStyle = led.color.replace(')', `, ${0.3 + pulse * 0.5})`).replace('rgb', 'rgba');
          ctx.fillRect(rackX - 40 + 10, ly, 10, 4);
          ctx.fillRect(rackX + 40 - 20, ly, 10, 4);
        });

        ctx.fillStyle = Math.random() > 0.95 ? 'rgba(255, 50, 85, 0.8)' : 'rgba(0, 255, 136, 0.6)';
        ctx.beginPath();
        ctx.arc(rackX, rackY - 10, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.strokeStyle = 'rgba(0, 229, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let y = 50; y < floorY; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
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

export default ServerRoomRenderer;
