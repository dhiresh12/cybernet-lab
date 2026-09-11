import React, { useState, useEffect, useRef } from 'react';

const BACKGROUNDS = [
  { id: 'noc-iceblue', name: 'NOC ICEBLUE', icon: '🖥️', description: 'NOC command center with ice-blue aesthetic' },
  { id: 'global-network', name: 'Global Network', icon: '🌐', description: 'Interactive 3D global network' },
  { id: '3d-globe', name: '3D Globe', icon: '🌍', description: 'Rotating 3D Earth visualization' },
  { id: 'digital-grid', name: 'Digital Grid', icon: '🔲', description: 'Clean digital grid pattern' },
  { id: 'network-galaxy', name: 'Network Galaxy', icon: '🌠', description: 'Cosmic network visualization' },
  { id: 'cyber-grid', name: 'Cyber Grid', icon: '🕸️', description: 'Classic cyber grid with moving lines' },
  { id: 'holographic', name: 'Holographic Network', icon: '📡', description: 'Holographic projection effect' },
  { id: 'data-tunnel', name: 'Data Tunnel', icon: '🌀', description: 'Cyber tunnel perspective' },
  { id: 'wireframe', name: 'Wireframe World', icon: '🔷', description: 'Wireframe 3D world' },
  { id: 'particles', name: 'Particle Network', icon: '✨', description: 'Floating particles with connections' },
  { id: 'soc', name: 'SOC Command', icon: '🛡️', description: 'Security operations center' },
  { id: 'server-room', name: 'Server Room', icon: '🗄️', description: 'Server room visualization' },
  { id: 'digital-sphere', name: 'Digital Sphere', icon: '⚛️', description: 'Floating digital sphere' },
  { id: 'matrix', name: 'Matrix Network', icon: '💚', description: 'Digital matrix rain' },
  { id: 'radar', name: 'Radar Network', icon: '📡', description: 'Radar sweep visualization' },
  { id: 'neural', name: 'Neural Network', icon: '🧠', description: 'Neural network connections' },
  { id: 'quantum', name: 'Quantum Network', icon: '⚛️', description: 'Quantum entanglement effect' },
  { id: 'cyber-city', name: 'Cyber City', icon: '🏙️', description: 'Futuristic cyber city' },
  { id: 'data-center', name: 'Data Center', icon: '💾', description: 'Data center visualization' },
  { id: 'deep-space', name: 'Deep Space Network', icon: '🪐', description: 'Deep space network' },
];

const DEFAULT_BG = 'noc-iceblue';

// Background renderer components
const CyberGridRenderer = ({ color = 'rgba(0,240,255,0.08)' }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let offset = 0;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    const draw = () => {
      ctx.fillStyle = 'rgba(3,5,10,0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      const gridSize = 50;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x + offset % gridSize, 0);
        ctx.lineTo(x + offset % gridSize, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y + offset % gridSize);
        ctx.lineTo(canvas.width, y + offset % gridSize);
        ctx.stroke();
      }
      offset += 0.2;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [color]);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -2, opacity: 0.6 }} />;
};

const MatrixRainRenderer = () => {
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
    const chars = 'ABCDE0123456789@#$%';
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = new Array(columns).fill(0);
    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00ff88';
      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        ctx.fillText(text, x, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -2, opacity: 0.7 }} />;
};






const ParticlesRenderer = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let w, h;
    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    const count = Math.min(80, Math.floor((w * h) / 25000));
    const parts = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 2 + 0.5
    }));
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(0,240,255,0.6)';
      parts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.strokeStyle = 'rgba(0,240,255,0.08)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < parts.length; i++) {
        for (let j = i + 1; j < parts.length; j++) {
          const a = parts[i], b = parts[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 15000) {
            ctx.globalAlpha = 1 - d2 / 15000;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -2, opacity: 0.5 }} />;
};


const NeuralNetworkRenderer = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let w, h;
    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const layers = [4, 6, 6, 4, 2];
    const nodes = [];
    const spacing = w / (layers.length + 1);
    layers.forEach((count, li) => {
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: spacing * (li + 1),
          y: h * (i + 1) / (count + 1),
          layer: li
        });
      }
    });
    const draw = () => {
      const t = Date.now() * 0.001;
      ctx.fillStyle = 'rgba(3,5,10,0.15)';
      ctx.fillRect(0, 0, w, h);
      // Connections
      ctx.strokeStyle = 'rgba(0,240,255,0.2)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (nodes[j].layer === nodes[i].layer + 1) {
            const a = Math.sin(t + i * 0.1);
            ctx.globalAlpha = 0.1 + 0.3 * (a + 1) / 2;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      nodes.forEach(n => {
        const pulse = 0.5 + 0.5 * Math.sin(t * 2 + n.x * 0.01);
        ctx.fillStyle = `rgba(0, 240, 255, ${0.3 + pulse * 0.5})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(0, 240, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, 4 + pulse * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -2 }} />;
};




const SOCRenderer = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let w, h;
    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const threats = Array.from({ length: 12 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 50 + Math.random() * 100,
      life: Math.random()
    }));
    const draw = () => {
      const t = Date.now() * 0.001;
      ctx.fillStyle = 'rgba(3,5,10,0.3)';
      ctx.fillRect(0, 0, w, h);
      threats.forEach(threat => {
        threat.life += 0.005;
        if (threat.life > 1) threat.life = 0;
        const alpha = 1 - threat.life;
        const r = threat.r * (0.3 + threat.life * 1.5);
        const grad = ctx.createRadialGradient(threat.x, threat.y, 0, threat.x, threat.y, r);
        grad.addColorStop(0, `rgba(255, 51, 85, ${alpha * 0.5})`);
        grad.addColorStop(0.5, `rgba(255, 100, 100, ${alpha * 0.2})`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(threat.x, threat.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(255, 51, 85, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
      // Radar sweep
      const cx = w / 2, cy = h / 2;
      const radius = Math.min(w, h) * 0.4;
      const angle = t * 0.5;
      const grad2 = ctx.createConicGradient(angle, cx, cy);
      grad2.addColorStop(0, 'rgba(0, 240, 255, 0.3)');
      grad2.addColorStop(0.1, 'rgba(0, 240, 255, 0.1)');
      grad2.addColorStop(0.2, 'transparent');
      grad2.addColorStop(1, 'transparent');
      ctx.fillStyle = grad2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -2 }} />;
};

const GlobeRenderer = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let w, h;
    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const cx = w / 2, cy = h / 2;
    const radius = Math.min(w, h) * 0.3;
    const draw = () => {
      const t = Date.now() * 0.0005;
      ctx.fillStyle = 'rgba(3,5,10,0.5)';
      ctx.fillRect(0, 0, w, h);
      // Globe wireframe
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.lineWidth = 1;
      // Equator
      ctx.beginPath();
      ctx.ellipse(cx, cy, radius, radius * 0.3, 0, 0, Math.PI * 2);
      ctx.stroke();
      // Latitudes
      for (let i = 1; i < 6; i++) {
        const lat = (i / 6) * Math.PI;
        const ry = radius * Math.sin(lat) * 0.3;
        ctx.beginPath();
        ctx.ellipse(cx, cy, radius * Math.cos(lat), ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Longitudes (rotating)
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + t * 0.5;
        const rx = radius * Math.abs(Math.cos(angle));
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, radius * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Outline
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
      // Connection points
      ctx.fillStyle = '#00ff88';
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + t;
        const x = cx + Math.cos(a) * radius * 0.8;
        const y = cy + Math.sin(a) * radius * 0.24;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -2, opacity: 0.8 }} />;
};

const WireframeRenderer = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let w, h;
    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const draw = () => {
      const t = Date.now() * 0.0003;
      ctx.fillStyle = 'rgba(3,5,10,0.4)';
      ctx.fillRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.lineWidth = 1;
      // Wireframe sphere
      const r = Math.min(w, h) * 0.3;
      // Latitudes
      for (let i = 0; i < 10; i++) {
        const lat = (i / 10 - 0.5) * Math.PI;
        const ry = r * Math.cos(lat);
        const offset = r * Math.sin(lat);
        ctx.beginPath();
        ctx.ellipse(cx, cy + offset, ry, ry * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Longitudes
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + t;
        const rx = r * Math.abs(Math.cos(angle));
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, r * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -2, opacity: 0.7 }} />;
};

const CyberTunnelRenderer = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let w, h;
    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    let z = 0;
    const draw = () => {
      ctx.fillStyle = 'rgba(3,5,10,0.3)';
      ctx.fillRect(0, 0, w, h);
      z += 0.05;
      const cx = w / 2, cy = h / 2;
      for (let i = 0; i < 30; i++) {
        const zi = (i * 0.1 + z) % 3;
        const scale = 1 / (zi + 0.1);
        const alpha = 1 - zi / 3;
        const size = 300 * scale;
        ctx.strokeStyle = `rgba(0, 240, 255, ${alpha * 0.4})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - size / 2, cy - size / 2, size, size);
        // Diagonal lines
        ctx.beginPath();
        ctx.moveTo(cx - size / 2, cy - size / 2);
        ctx.lineTo(cx - size / 2 + size * 0.3, cy - size / 2 + size * 0.3);
        ctx.stroke();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -2 }} />;
};

const NetworkGalaxyRenderer = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let w, h;
    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const nodes = Array.from({ length: 60 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 50 + Math.random() * 400,
      speed: 0.001 + Math.random() * 0.003,
      size: 1 + Math.random() * 3
    }));
    const draw = () => {
      ctx.fillStyle = 'rgba(3,5,10,0.3)';
      ctx.fillRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      const t = Date.now() * 0.001;
      // Core
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80);
      grad.addColorStop(0, 'rgba(255, 200, 100, 0.8)');
      grad.addColorStop(0.5, 'rgba(255, 100, 50, 0.3)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 80, 0, Math.PI * 2);
      ctx.fill();
      nodes.forEach(n => {
        n.angle += n.speed;
        const x = cx + Math.cos(n.angle) * n.radius;
        const y = cy + Math.sin(n.angle) * n.radius * 0.5;
        ctx.fillStyle = `rgba(0, 240, 255, ${0.4 + Math.sin(t + n.angle) * 0.3})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(0, 240, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(x, y, n.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -2 }} />;
};

const DigitalSphereRenderer = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let w, h;
    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const draw = () => {
      const t = Date.now() * 0.0005;
      ctx.fillStyle = 'rgba(3,5,10,0.5)';
      ctx.fillRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      const r = Math.min(w, h) * 0.25;
      // Particle sphere
      for (let i = 0; i < 100; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const x = cx + r * Math.sin(phi) * Math.cos(theta + t);
        const y = cy + r * Math.sin(phi) * Math.sin(theta + t);
        const z = r * Math.cos(phi);
        const scale = (z + r) / (2 * r);
        const alpha = 0.3 + scale * 0.7;
        ctx.fillStyle = `rgba(0, 240, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -2, opacity: 0.7 }} />;
};

const NOCIceBlueRenderer = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let w = canvas.width, h = canvas.height;
    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const draw = () => {
      ctx.fillStyle = 'rgba(2,10,20,0.95)';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(0,229,255,0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(0,229,255,0.12)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(w/2, h/2, Math.min(w,h)*0.35, 0, Math.PI*2); ctx.stroke();
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -2, opacity: 0.7 }} />;
};

const GlobalNetworkRenderer = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let w = canvas.width, h = canvas.height;
    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const draw = () => {
      ctx.fillStyle = 'rgba(2,8,20,0.9)';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(0,229,255,0.12)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 100 * (Math.random() - 0.5), y + 80 * (Math.random() - 0.5));
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(0,229,255,0.3)';
      for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 2 + 1, 0, Math.PI*2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -2, opacity: 0.85 }} />;
};

const DigitalGridRenderer = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let w = canvas.width, h = canvas.height;
    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const draw = () => {
      ctx.fillStyle = 'rgba(2,12,25,0.96)';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(0,200,255,0.15)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -2, opacity: 0.9 }} />;
};

const HolographicNetworkRenderer = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let w = canvas.width, h = canvas.height;
    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const draw = () => {
      ctx.fillStyle = 'rgba(1,4,15,0.9)';
      ctx.fillRect(0, 0, w, h);
      const cx = w/2, cy = h/2;
      const r = Math.min(w,h) * 0.4;
      ctx.strokeStyle = 'rgba(0,229,255,0.2)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 * i) / 12;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(0,229,255,0.1)';
      ctx.beginPath();
      ctx.ellipse(cx, cy, r*0.7, r*0.35, 0, 0, Math.PI*2);
      ctx.stroke();
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -2, opacity: 0.8 }} />;
};

const ServerRoomRenderer = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let w = canvas.width, h = canvas.height;
    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const draw = () => {
      ctx.fillStyle = 'rgba(3,8,18,0.95)';
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 10; j++) {
          const x = 80 + i * 85;
          const y = 80 + j * 60;
          ctx.fillStyle = 'rgba(0,229,255,0.15)';
          ctx.fillRect(x, y, 70, 45);
          ctx.strokeStyle = 'rgba(0,229,255,0.3)';
          ctx.strokeRect(x, y, 70, 45);
        }
      }
      ctx.fillStyle = 'rgba(0,180,255,0.2)';
      ctx.fillRect(50, 50, 400, 600);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -2, opacity: 0.9 }} />;
};

const RadarNetworkRenderer = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let w = canvas.width, h = canvas.height;
    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const draw = () => {
      ctx.fillStyle = 'rgba(0,5,15,0.98)';
      ctx.fillRect(0, 0, w, h);
      const cx = w/2, cy = h/2;
      const r = Math.min(w,h) * 0.4;
      ctx.strokeStyle = 'rgba(0,229,255,0.2)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const rr = r * (i + 1) / 5;
        ctx.beginPath();
        ctx.arc(cx, cy, rr, 0, Math.PI*2);
        ctx.stroke();
        ctx.fillText(`${Math.round(rr/r*100)}%`, cx + rr + 15, cy);
      }
      ctx.fillStyle = 'rgba(100,200,255,0.4)';
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * r;
        const x = cx + Math.cos(angle) * dist;
        const y = cy + Math.sin(angle) * dist;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 1.5 + 0.5, 0, Math.PI*2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -2, opacity: 0.85 }} />;
};

const QuantumNetworkRenderer = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let w = canvas.width, h = canvas.height;
    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const draw = () => {
      ctx.fillStyle = 'rgba(1,0,5,0.95)';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(100,200,255,0.15)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < w; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      ctx.fillStyle = 'rgba(0,180,255,0.3)';
      for (let i = 0; i < 40; i++) {
        const angle = Date.now() * 0.001 + i * 0.5;
        const x = w/2 + Math.cos(angle) * 80;
        const y = h/2 + Math.sin(angle) * 80;
        ctx.beginPath();
        ctx.arc(x, y, 3 + Math.sin(Date.now()*0.01) * 2, 0, Math.PI*2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -2, opacity: 0.75 }} />;
};

const CyberCityRenderer = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let w = canvas.width, h = canvas.height;
    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const draw = () => {
      ctx.fillStyle = 'rgba(1,0,10,0.96)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(0,80,180,0.4)';
      for (let i = 0; i < 10; i++) {
        const x = i * w / 10;
        ctx.fillRect(x, h * 0.4, w / 10, h * 0.6);
      }
      ctx.fillStyle = 'rgba(0,120,220,0.6)';
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * w;
        const y = h * 0.5 + Math.random() * h * 0.4;
        const size = Math.random() * 15 + 5;
        ctx.fillRect(x, y, size, size);
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -2, opacity: 0.85 }} />;
};

const DataCenterRenderer = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let w = canvas.width, h = canvas.height;
    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const draw = () => {
      ctx.fillStyle = 'rgba(0,3,15,0.98)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(0,30,80,0.6)';
      ctx.fillRect(0, 0, w, h * 0.3);
      ctx.fillStyle = 'rgba(0,60,120,0.4)';
      ctx.fillRect(0, h * 0.7, w, h * 0.3);
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 10; col++) {
          const x = 120 + col * 80;
          const y = 100 + row * 80;
          ctx.fillStyle = 'rgba(0,229,255,0.15)';
          ctx.fillRect(x, y, 60, 50);
          ctx.strokeStyle = 'rgba(0,229,255,0.3)';
          ctx.strokeRect(x, y, 60, 50);
        }
      }
      ctx.fillStyle = 'rgba(0,100,200,0.5)';
      ctx.beginPath();
      ctx.arc(w-80, 80, 10, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = 'rgba(0,100,200,0.5)';
      ctx.fillRect(w-100, h-80, 80, 30);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -2, opacity: 0.9 }} />;
};

const RENDERERS = {
  'noc-iceblue': NOCIceBlueRenderer,
  'global-network': GlobalNetworkRenderer,
  '3d-globe': GlobeRenderer,
  'digital-grid': DigitalGridRenderer,
  'network-galaxy': NetworkGalaxyRenderer,
  'cyber-grid': CyberGridRenderer,
  'holographic': HolographicNetworkRenderer,
  'data-tunnel': CyberTunnelRenderer,
  'wireframe': WireframeRenderer,
  'particles': ParticlesRenderer,
  'soc': SOCRenderer,
  'server-room': ServerRoomRenderer,
  'digital-sphere': DigitalSphereRenderer,
  'matrix': MatrixRainRenderer,
  'radar': RadarNetworkRenderer,
  'neural': NeuralNetworkRenderer,
  'quantum': QuantumNetworkRenderer,
  'cyber-city': CyberCityRenderer,
  'data-center': DataCenterRenderer,
  'deep-space': DeepSpaceRenderer,
};

export default function BackgroundStudio({ onApply, bgSetting, onBgChange, animationsEnabled }) {
  const [selectedBg, setSelectedBg] = useState(bgSetting || DEFAULT_BG);
  const [previewBg, setPreviewBg] = useState(null);
  const [showStudio, setShowStudio] = useState(false);

  useEffect(() => {
    if (bgSetting && bgSetting !== selectedBg) {
      setSelectedBg(bgSetting);
    }
  }, [bgSetting, selectedBg]);

  useEffect(() => {
    const saved = localStorage.getItem('cybernet_bg');
    if (saved && BACKGROUNDS.some(b => b.id === saved)) {
      setSelectedBg(saved);
      if (onApply) onApply(saved);
      if (onBgChange) onBgChange(saved);
    } else {
      if (onApply) onApply(DEFAULT_BG);
      if (onBgChange) onBgChange(DEFAULT_BG);
    }
  }, [onApply, onBgChange]);

  const handleApply = (bgId) => {
    setSelectedBg(bgId);
    localStorage.setItem('cybernet_bg', bgId);
    setPreviewBg(null);
    if (onApply) onApply(bgId);
    if (onBgChange) onBgChange(bgId);
  };

  const handlePreview = (bgId) => {
    setPreviewBg(bgId);
  };

  const ActiveRenderer = RENDERERS[previewBg || selectedBg] || RENDERERS['cyber-grid'];

  return (
    <div>
      <div style={{ position: 'fixed', inset: 0, zIndex: -3, background: '#03050a' }} />
      <ActiveRenderer />

      {showStudio && (
        <div style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          background: 'rgba(3,5,10,0.95)',
          border: '1px solid rgba(0,240,255,0.5)',
          borderRadius: 12,
          padding: 16,
          maxWidth: 340,
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 0 30px rgba(0,240,255,0.3)',
          zIndex: 200
        }} onClick={(e) => e.stopPropagation()}>
          <div style={{ color: 'var(--cyan)', fontSize: '1em', fontWeight: 700, marginBottom: 12 }}>
            🎨 Background Studio
          </div>

          <div style={{ marginBottom: 12, color: 'var(--muted)', fontSize: '0.8em' }}>
            Selected: <b style={{ color: 'var(--cyan)' }}>{BACKGROUNDS.find(b => b.id === selectedBg)?.name || 'Particles'}</b>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 10 }}>
            {BACKGROUNDS.map(bg => {
              const isActive = selectedBg === bg.id;
              const isPreview = previewBg === bg.id;
              return (
                <div
                  key={bg.id}
                  style={{
                    background: isPreview ? 'rgba(0,240,255,0.2)' : isActive ? 'rgba(0,240,255,0.15)' : 'rgba(10,18,32,0.92)',
                    border: `2px solid ${isPreview ? 'var(--cyan)' : isActive ? 'var(--green)' : 'rgba(0,240,255,0.3)'}`,
                    borderRadius: 8,
                    padding: 10,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => handlePreview(bg.id)}
                  onMouseEnter={(e) => {
                    if (!isPreview) {
                      e.currentTarget.style.borderColor = 'var(--cyan)';
                      e.currentTarget.style.boxShadow = '0 0 12px rgba(0,240,255,0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isPreview) {
                      e.currentTarget.style.borderColor = isActive ? 'var(--green)' : 'rgba(0,240,255,0.3)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  <div style={{ fontSize: '1.5em', marginBottom: 6 }}>{bg.icon}</div>
                  <div style={{ color: 'var(--cyan)', fontSize: '0.75em', fontWeight: 700 }}>{bg.name}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.6em', marginTop: 2 }}>{bg.description.substring(0, 20)}...</div>
                  {!isPreview && (
                    <div style={{ marginTop: 6 }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleApply(bg.id); }}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          border: '1px solid var(--cyan)',
                          background: 'rgba(0,240,255,0.1)',
                          color: 'var(--cyan)',
                          fontSize: '0.7em',
                          cursor: 'pointer'
                        }}
                      >Apply</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {previewBg && previewBg !== selectedBg && (
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <button
                onClick={() => handleApply(previewBg)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: 'none',
                  background: 'var(--cyan)',
                  color: '#000',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >✓ Apply Previewed Background</button>
            </div>
          )}

          <button
            onClick={() => setShowStudio(false)}
            style={{
              marginTop: 12,
              width: '100%',
              padding: '6px',
              borderRadius: 6,
              border: '1px solid rgba(0,240,255,0.3)',
              background: 'transparent',
              color: 'var(--muted)',
              fontSize: '0.8em',
              cursor: 'pointer'
            }}
          >✕ Close</button>
        </div>
      )}

      <button
        onClick={() => setShowStudio(true)}
        style={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          padding: '10px 16px',
          borderRadius: 8,
          border: '1px solid rgba(0,240,255,0.5)',
          background: 'rgba(0,0,0,0.7)',
          color: 'var(--cyan)',
          cursor: 'pointer',
          fontSize: '0.85em',
          backdropFilter: 'blur(5px)',
          zIndex: 100
        }}
        title="Open Background Studio"
      >🎨 Background Studio</button>
    </div>
  );
}