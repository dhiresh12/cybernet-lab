import React, { useState, useEffect, useRef } from 'react';

const BACKGROUNDS = [
  { id: 'cyber-grid', name: 'Cyber Grid', icon: '🕸️', description: 'Classic cyber grid with moving lines' },
  { id: 'particles', name: 'Particles', icon: '✨', description: 'Floating particles with connections' },
  { id: 'matrix', name: 'Matrix Rain', icon: '💚', description: 'Digital rain falling down' },
  { id: 'starfield', name: 'Starfield', icon: '⭐', description: 'Flying through stars in space' },
  { id: 'network', name: 'Network Nodes', icon: '🌐', description: 'Nodes connecting and disconnecting' },
  { id: 'circuit', name: 'Circuit Board', icon: '🔌', description: 'Circuit board patterns' },
  { id: 'aurora', name: 'Aurora', icon: '🌈', description: 'Northern lights effect' },
  { id: 'galaxy', name: 'Galaxy', icon: '🌌', description: 'Spiral galaxy rotation' },
  { id: 'minimal', name: 'Minimal Tech', icon: '◼️', description: 'Clean minimal tech background' },
  { id: 'deep-space', name: 'Deep Space', icon: '🪐', description: 'Deep space with nebulae' },
  { id: 'neural', name: 'Neural Network', icon: '🧠', description: 'Neural network connections' },
  { id: 'holographic', name: 'Holographic Grid', icon: '🔲', description: 'Holographic projection grid' },
  { id: 'digital-sphere', name: 'Digital Sphere', icon: '⚛️', description: 'Floating digital sphere' },
  { id: 'data-stream', name: 'Data Stream', icon: '📊', description: 'Flowing data streams' },
  { id: 'noc', name: 'NOC Control', icon: '🎮', description: 'NOC command center view' },
  { id: 'soc', name: 'SOC Threat Map', icon: '🛡️', description: 'Security operations center' },
  { id: '3d-globe', name: '3D Globe', icon: '🌍', description: 'Rotating 3D Earth' },
  { id: 'wireframe', name: 'Wireframe World', icon: '🔷', description: 'Wireframe 3D world' },
  { id: 'cyber-tunnel', name: 'Cyber Tunnel', icon: '🌀', description: 'Cyber tunnel perspective' },
  { id: 'network-galaxy', name: 'Network Galaxy', icon: '🌠', description: 'Cosmic network visualization' }
];

const DEFAULT_BG = 'particles';

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

const StarfieldRenderer = () => {
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
    const stars = [];
    const starCount = 300;
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 1000,
        size: Math.random() * 1.5 + 0.5
      });
    }
    const draw = () => {
      ctx.fillStyle = 'rgba(3,5,10,0.9)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (const star of stars) {
        star.z -= 2;
        if (star.z <= 0) {
          star.z = 1000;
          star.x = Math.random() * canvas.width;
          star.y = Math.random() * canvas.height;
        }
        const scale = 1 - star.z / 1000;
        const x = (star.x - canvas.width / 2) * scale + canvas.width / 2;
        const y = (star.y - canvas.height / 2) * scale + canvas.height / 2;
        const size = star.size * scale * 2;
        const opacity = scale * 0.8;
        ctx.fillStyle = `rgba(0, 240, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(0.1, size), 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    let lastTime = performance.now();
    const slower = (t) => {
      if (t - lastTime > 33) {
        draw();
        lastTime = t;
      }
      raf = requestAnimationFrame(slower);
    };
    slower(lastTime);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -2, opacity: 0.8 }} />;
};

const NetworkNodesRenderer = () => {
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

    const nodeCount = 12;
    const nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: 4
      });
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(3,5,10,0.9)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            ctx.strokeStyle = `rgba(0, 240, 255, ${0.3 * (1 - dist / 200)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        ctx.fillStyle = 'rgba(0, 240, 255, 0.8)';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -2, opacity: 0.7 }} />;
};

const AuroraRenderer = () => {
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

    const time = 0;
    const draw = () => {
      ctx.fillStyle = 'rgba(3,5,10,0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const t = Date.now() * 0.001;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height * 0.3);
        for (let x = 0; x < canvas.width; x += 20) {
          const y = Math.sin(t * 0.3 + x * 0.01 + i) * 30 +
                   Math.sin(t * 0.1 + x * 0.02 + i) * 50 +
                   canvas.height * 0.3;
          ctx.quadraticCurveTo(x + 10, y, x + 20, canvas.height * 0.3 + 10);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, canvas.height * 0.2, 0, canvas.height * 0.6);
        const hue = 180 + i * 30;
        grad.addColorStop(0, `hsla(${hue}, 80%, 50%, 0.1)`);
        grad.addColorStop(0.5, `hsla(${hue + 30}, 70%, 45%, 0.08)`);
        grad.addColorStop(1, `hsla(${hue + 60}, 60%, 40%, 0)`);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -2, opacity: 0.6 }} />;
};

const CircuitBoardRenderer = () => {
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

    const traces = [];
    for (let i = 0; i < 50; i++) {
      traces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        len: Math.random() * 40 + 10
      });
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(3,5,10,0.9)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.lineWidth = 1;

      for (const trace of traces) {
        trace.x += trace.vx;
        trace.y += trace.vy;

        if (trace.x < 0 || trace.x > canvas.width) trace.vx *= -1;
        if (trace.y < 0 || trace.y > canvas.height) trace.vy *= -1;

        ctx.beginPath();
        ctx.moveTo(trace.x, trace.y);
        ctx.lineTo(trace.x + trace.len, trace.y);
        ctx.lineTo(trace.x + trace.len, trace.y + 10);
        ctx.lineTo(trace.x, trace.y + 10);
        ctx.closePath();
        ctx.stroke();

        // Draw dots on circuit paths
        const t = Date.now() * 0.01;
        const offset = (Math.sin(t + trace.x) * 10 + 10) % 50;
        ctx.fillStyle = 'rgba(0, 255, 136, 0.5)';
        ctx.beginPath();
        ctx.arc(trace.x + offset, trace.y + 5, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -2, opacity: 0.8 }} />;
};

const GalaxyRenderer = () => {
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

    const stars = [];
    for (let i = 0; i < 500; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 800,
        y: (Math.random() - 0.5) * 800,
        z: Math.random() * 500 + 1,
        size: Math.random() * 2 + 0.5
      });
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(3,5,10,0.9)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);

      const t = Date.now() * 0.0005;
      for (const star of stars) {
        const scale = 50 / star.z;
        const x = star.x * scale;
        const y = star.y * scale;

        star.z -= 0.5;
        if (star.z <= 0) {
          star.z = 500;
          star.x = (Math.random() - 0.5) * 800;
          star.y = (Math.random() - 0.5) * 800;
        }

        const size = star.size * scale;
        const opacity = Math.max(0, 1 - star.z / 500);

        ctx.fillStyle = `rgba(0, 240, 255, ${opacity * 0.7})`;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(0.1, size), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // Draw rotating galaxy arms
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(t * 0.1);
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.05)';
      ctx.lineWidth = 1;
      for (let arm = 0; arm < 4; arm++) {
        ctx.beginPath();
        const angle = (arm * Math.PI * 2) / 4;
        const radius = 200 + Math.sin(t * 2) * 30;
        for (let r = 0; r < radius; r += 5) {
          const spiralAngle = angle + (r / radius) * 2;
          const x = Math.cos(spiralAngle) * r;
          const y = Math.sin(spiralAngle) * r;
          ctx.fillRect(x, y, 1, 1);
        }
      }
      ctx.restore();

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -2, opacity: 0.9 }} />;
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

const MinimalRenderer = () => (
  <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -2, background: 'linear-gradient(135deg, #050810 0%, #0a1020 100%)' }} />
);

const DeepSpaceRenderer = () => {
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
    const stars = Array.from({ length: 500 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 1.2,
      twinkle: Math.random() * Math.PI * 2
    }));
    const draw = () => {
      const t = Date.now() * 0.001;
      ctx.fillStyle = 'rgba(3,5,15,1)';
      ctx.fillRect(0, 0, w, h);
      // Nebulae
      const grad = ctx.createRadialGradient(w * 0.3, h * 0.3, 0, w * 0.3, h * 0.3, 400);
      grad.addColorStop(0, 'rgba(80, 20, 120, 0.3)');
      grad.addColorStop(0.5, 'rgba(20, 10, 60, 0.15)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      const grad2 = ctx.createRadialGradient(w * 0.7, h * 0.7, 0, w * 0.7, h * 0.7, 300);
      grad2.addColorStop(0, 'rgba(0, 80, 120, 0.25)');
      grad2.addColorStop(0.5, 'rgba(0, 40, 80, 0.1)');
      grad2.addColorStop(1, 'transparent');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, w, h);
      stars.forEach(s => {
        const alpha = 0.3 + 0.5 * Math.sin(t * 2 + s.twinkle);
        ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -2 }} />;
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

const HolographicGridRenderer = () => {
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
      ctx.fillStyle = 'rgba(3,5,10,1)';
      ctx.fillRect(0, 0, w, h);
      const horizon = h * 0.5;
      // Sky grid
      ctx.strokeStyle = 'rgba(0,240,255,0.15)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 20; i++) {
        const y = horizon - i * 25;
        if (y < 0) break;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      // Floor grid (perspective)
      for (let i = 0; i < 20; i++) {
        const y = horizon + i * 25;
        if (y > h) break;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      // Vertical lines with perspective
      for (let i = -10; i <= 10; i++) {
        const x1 = w / 2 + i * 50;
        const x2 = w / 2 + i * 200;
        ctx.beginPath();
        ctx.moveTo(x1, horizon - 500);
        ctx.lineTo(x2, h);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x1, horizon + 500);
        ctx.lineTo(x2, h);
        ctx.stroke();
      }
      // Horizon glow
      const grad = ctx.createLinearGradient(0, horizon - 5, 0, horizon + 5);
      grad.addColorStop(0, 'rgba(0, 240, 255, 0.6)');
      grad.addColorStop(1, 'rgba(255, 0, 170, 0.4)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, horizon - 3, w, 6);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -2 }} />;
};

const DataStreamRenderer = () => {
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
    const streams = Array.from({ length: 40 }, () => ({
      x: Math.random() * w,
      speed: 2 + Math.random() * 5,
      chars: []
    }));
    streams.forEach(s => {
      for (let i = 0; i < 20; i++) s.chars.push({ y: Math.random() * h, char: String.fromCharCode(33 + Math.floor(Math.random() * 90)) });
    });
    const draw = () => {
      ctx.fillStyle = 'rgba(3,5,10,0.2)';
      ctx.fillRect(0, 0, w, h);
      ctx.font = '14px monospace';
      streams.forEach(s => {
        s.chars.forEach(c => {
          c.y += s.speed;
          if (c.y > h) {
            c.y = -20;
            c.char = String.fromCharCode(33 + Math.floor(Math.random() * 90));
          }
          const alpha = 1 - c.y / h;
          ctx.fillStyle = `rgba(0, 255, ${136 + Math.random() * 50}, ${alpha})`;
          ctx.fillText(c.char, s.x, c.y);
        });
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -2, opacity: 0.6 }} />;
};

const NOCRenderer = () => {
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
      const t = Date.now() * 0.001;
      ctx.fillStyle = 'rgba(3,5,10,0.4)';
      ctx.fillRect(0, 0, w, h);
      // Hexagonal grid
      const size = 40;
      const hexW = size * 2;
      const hexH = Math.sqrt(3) * size;
      for (let row = 0; row * hexH * 0.75 < h + hexH; row++) {
        for (let col = 0; col * hexW * 0.75 < w + hexW; col++) {
          const x = col * hexW * 0.75;
          const y = row * hexH + (col % 2 === 1 ? hexH / 2 : 0);
          const phase = (x + y) * 0.01 + t;
          const alpha = 0.1 + 0.3 * (Math.sin(phase) + 1) / 2;
          ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = Math.PI / 3 * i;
            const px = x + size * Math.cos(angle);
            const py = y + size * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -2, opacity: 0.5 }} />;
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

const RENDERERS = {
  'cyber-grid': CyberGridRenderer,
  'particles': ParticlesRenderer,
  'matrix': MatrixRainRenderer,
  'starfield': StarfieldRenderer,
  'network': NetworkNodesRenderer,
  'circuit': CircuitBoardRenderer,
  'aurora': AuroraRenderer,
  'galaxy': GalaxyRenderer,
  'minimal': MinimalRenderer,
  'deep-space': DeepSpaceRenderer,
  'neural': NeuralNetworkRenderer,
  'holographic': HolographicGridRenderer,
  'data-stream': DataStreamRenderer,
  'noc': NOCRenderer,
  'soc': SOCRenderer,
  '3d-globe': GlobeRenderer,
  'wireframe': WireframeRenderer,
  'cyber-tunnel': CyberTunnelRenderer,
  'network-galaxy': NetworkGalaxyRenderer,
  'digital-sphere': DigitalSphereRenderer
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