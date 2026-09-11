// Cyber Grid Renderer
import React, { useRef, useEffect } from 'react';
import { drawUtils } from '../BackgroundRenderer';

export const CyberGridRenderer = ({ 
  color = 'rgba(0,240,255,0.08)',
  opacity = 0.6,
  zIndex = -2,
}) => {
  const canvasRef = useRef(null);
  const offsetRef = useRef(0);

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

    const draw = () => {
      drawUtils.clear(ctx, canvas.width, canvas.height, 'rgba(3,5,10,0.15)');
      drawUtils.drawGrid(ctx, canvas.width, canvas.height, 50, color, 1, offsetRef.current);
      offsetRef.current += 0.2;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [color]);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex, opacity }} />;
};

export default CyberGridRenderer;