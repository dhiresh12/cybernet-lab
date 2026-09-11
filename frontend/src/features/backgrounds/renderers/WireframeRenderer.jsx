// Wireframe Renderer
import React, { useRef, useEffect } from 'react';

export const WireframeRenderer = ({ opacity = 0.7, zIndex = -2 }) => {
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

    const gridSize = 40;
    const depth = 20;

    const draw = () => {
      ctx.fillStyle = 'rgba(3,5,10,0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.lineWidth = 1;

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rotation);
      
      for (let z = -depth; z <= depth; z++) {
        const scale = 1 + z * 0.05;
        const offset = z * 30;
        
        ctx.beginPath();
        for (let x = -canvas.width; x <= canvas.width; x += gridSize * scale) {
          ctx.moveTo(x * scale, -canvas.height * scale + offset);
          ctx.lineTo(x * scale, canvas.height * scale + offset);
        }
        for (let y = -canvas.height; y <= canvas.height; y += gridSize * scale) {
          ctx.moveTo(-canvas.width * scale + offset, y * scale);
          ctx.lineTo(canvas.width * scale + offset, y * scale);
        }
        ctx.stroke();
      }
      
      ctx.restore();
      rotation += 0.0002;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex, opacity }} />;
};

export default WireframeRenderer;