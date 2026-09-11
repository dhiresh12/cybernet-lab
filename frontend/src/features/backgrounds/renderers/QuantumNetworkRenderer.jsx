// Quantum Network Renderer
import React, { useRef, useEffect } from 'react';

export const QuantumNetworkRenderer = ({ opacity = 0.8, zIndex = -2 }) => {
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

    const qubits = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      state: Math.random(), // 0 to 1, superposition
      entangled: null,
      phase: Math.random() * Math.PI * 2,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    }));

    // Create entanglements
    for (let i = 0; i < qubits.length; i++) {
      if (Math.random() < 0.3) {
        const partner = qubits[Math.floor(Math.random() * qubits.length)];
        if (partner !== qubits[i]) {
          qubits[i].entangled = partner;
          partner.entangled = qubits[i];
        }
      }
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(3,5,10,0.98)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      qubits.forEach(q => {
        q.x += q.vx;
        q.y += q.vy;
        q.phase += 0.02;

        if (q.x < 0) q.x = canvas.width;
        if (q.x > canvas.width) q.x = 0;
        if (q.y < 0) q.y = canvas.height;
        if (q.y > canvas.height) q.y = 0;

        // Entanglement lines
        if (q.entangled) {
          const p = q.entangled;
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 300) {
            const alpha = 0.1 * Math.sin(Date.now() * 0.003 + q.phase);
            ctx.strokeStyle = `rgba(170, 0, 255, ${Math.abs(alpha)})`;
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(q.x, q.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }

        // Qubit representation - superposition visualization
        const pulse = Math.sin(Date.now() * 0.005 + q.phase) * 0.5 + 0.5;
        const size = 4 + pulse * 4;
        
        // |0⟩ state (blue)
        ctx.fillStyle = `rgba(0, 229, 255, ${0.6 * (1 - q.state)})`;
        ctx.beginPath();
        ctx.arc(q.x - size * 0.3, q.y, size * 0.7, 0, Math.PI * 2);
        ctx.fill();
        
        // |1⟩ state (purple)
        ctx.fillStyle = `rgba(170, 0, 255, ${0.6 * q.state})`;
        ctx.beginPath();
        ctx.arc(q.x + size * 0.3, q.y, size * 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Center superposition indicator
        ctx.fillStyle = `rgba(127, 232, 255, ${0.8 * pulse})`;
        ctx.beginPath();
        ctx.arc(q.x, q.y, size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex, opacity }} />;
};

export default QuantumNetworkRenderer;