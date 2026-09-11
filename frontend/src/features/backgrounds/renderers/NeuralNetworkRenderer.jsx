// Neural Network Renderer
import React, { useRef, useEffect } from 'react';

export const NeuralNetworkRenderer = ({ opacity = 0.7, zIndex = -2 }) => {
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

    const layers = 4;
    const neuronsPerLayer = [8, 12, 10, 6];
    const neurons = [];

    let yOffset = 80;
    neuronsPerLayer.forEach((count, layerIdx) => {
      const x = (layerIdx + 1) * canvas.width / (layers + 1);
      for (let i = 0; i < count; i++) {
        const y = yOffset + (i + 1) * (canvas.height - 160) / (count + 1);
        neurons.push({
          x, y, layer: layerIdx,
          activation: Math.random(),
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
        });
      }
    });

    const draw = () => {
      ctx.fillStyle = 'rgba(3,5,10,0.95)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Connections
      for (let i = 0; i < neurons.length; i++) {
        const n1 = neurons[i];
        for (let j = i + 1; j < neurons.length; j++) {
          const n2 = neurons[j];
          if (n2.layer === n1.layer + 1) {
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200) {
              const alpha = 0.05 * n1.activation * n2.activation * (1 - dist / 200);
              ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(n1.x, n1.y);
              ctx.lineTo(n2.x, n2.y);
              ctx.stroke();
            }
          }
        }
      }

      // Update and draw neurons
      neurons.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        n.activation = 0.3 + Math.sin(Date.now() * 0.001 + n.x * 0.01) * 0.7;

        if (n.x < 50) n.vx = Math.abs(n.vx);
        if (n.x > canvas.width - 50) n.vx = -Math.abs(n.vx);
        if (n.y < 50) n.vy = Math.abs(n.vy);
        if (n.y > canvas.height - 50) n.vy = -Math.abs(n.vy);

        const size = 4 + n.activation * 6;
        ctx.fillStyle = `rgba(0, 229, 255, ${0.4 + n.activation * 0.4})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, size, 0, Math.PI * 2);
        ctx.fill();

        // Glow
        const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, size * 3);
        glow.addColorStop(0, `rgba(0, 229, 255, ${n.activation * 0.2})`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(n.x - size * 3, n.y - size * 3, size * 6, size * 6);
      });

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex, opacity }} />;
};

export default NeuralNetworkRenderer;