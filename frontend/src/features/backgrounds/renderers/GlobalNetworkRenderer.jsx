// Global Network Renderer - Uses shared AnimationLoop coordinator.
import React, { useRef, useEffect } from 'react';
import { AnimationLoop } from '../animationLoop';

export const GlobalNetworkRenderer = ({ opacity = 0.8, zIndex = -2, sharedLoop = null }) => {
  const canvasRef = useRef(null);
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

    const hubs = [
      { name: 'NYC', lat: 40.7, lon: -74.0, connections: ['LON', 'SFO', 'SAO', 'DXB'] },
      { name: 'LON', lat: 51.5, lon: 0.1, connections: ['NYC', 'PAR', 'DXB', 'JNB'] },
      { name: 'TYO', lat: 35.7, lon: 139.7, connections: ['SFO', 'SYD', 'SIN', 'HKG'] },
      { name: 'SYD', lat: -33.9, lon: 151.2, connections: ['TYO', 'SIN', 'AKL'] },
      { name: 'SAO', lat: -23.5, lon: -46.6, connections: ['NYC', 'JNB', 'EZE'] },
      { name: 'DXB', lat: 25.2, lon: 55.3, connections: ['LON', 'NYC', 'SIN', 'JNB', 'BOM'] },
      { name: 'SFO', lat: 37.8, lon: -122.4, connections: ['NYC', 'TYO', 'LAX', 'SEA'] },
      { name: 'SIN', lat: 1.3, lon: 103.8, connections: ['TYO', 'SYD', 'DXB', 'HKG', 'BOM'] },
      { name: 'JNB', lat: -26.2, lon: 28.0, connections: ['LON', 'DXB', 'SAO'] },
      { name: 'HKG', lat: 22.3, lon: 114.2, connections: ['TYO', 'SIN', 'SFO'] },
    ];

    const hubMap = {};
    hubs.forEach(h => hubMap[h.name] = h);

    const project = (lat, lon, cx, cy, radius, time) => {
      const lonOffset = time * 0.02;
      const x = cx + radius * Math.cos(lat * Math.PI / 180) * Math.cos((lon + lonOffset) * Math.PI / 180);
      const y = cy + radius * Math.sin(lat * Math.PI / 180);
      return { x, y };
    };

    const loop = loopRef.current;
    let time = 0;

    const draw = (msg) => {
      if (msg.type === 'resize') return;
      time += msg.delta * 60;

      ctx.fillStyle = 'rgba(3,5,10,0.95)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = Math.min(cx, cy) * 0.75;

      ctx.strokeStyle = 'rgba(0, 229, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let lat = -80; lat <= 80; lat += 20) {
        ctx.beginPath();
        for (let lon = -180; lon <= 180; lon += 10) {
          const p = project(lat, lon, cx, cy, radius, time);
          if (lon === -180) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }
      for (let lon = -180; lon <= 180; lon += 30) {
        ctx.beginPath();
        for (let lat = -90; lat <= 90; lat += 10) {
          const p = project(lat, lon, cx, cy, radius, time);
          if (lat === -90) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(0, 229, 255, 0.15)';
      ctx.lineWidth = 1.5;
      hubs.forEach(h => {
        const p1 = project(h.lat, h.lon, cx, cy, radius, time);
        h.connections.forEach(connName => {
          const conn = hubMap[connName];
          if (conn) {
            const p2 = project(conn.lat, conn.lon, cx, cy, radius, time);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

      hubs.forEach(h => {
        const p = project(h.lat, h.lon, cx, cy, radius, time);
        const pulse = Math.sin(time * 3 + h.lon) * 0.5 + 0.5;

        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 20 * pulse);
        glow.addColorStop(0, 'rgba(0, 229, 255, 0.3)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(p.x - 20 * pulse, p.y - 20 * pulse, 40 * pulse, 40 * pulse);

        ctx.fillStyle = 'rgba(0, 229, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6 * pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(0, 229, 255, 0.7)';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(h.name, p.x, p.y - 12);
      });

      hubs.forEach(h => {
        h.connections.forEach(connName => {
          const conn = hubMap[connName];
          if (conn && Math.random() < 0.02) {
            const p1 = project(h.lat, h.lon, cx, cy, radius, time);
            const p2 = project(conn.lat, conn.lon, cx, cy, radius, time);
            const t = Math.random();
            const x = p1.x + (p2.x - p1.x) * t;
            const y = p1.y + (p2.y - p1.y) * t;
            ctx.fillStyle = 'rgba(0, 229, 255, 1)';
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        });
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

export default GlobalNetworkRenderer;
