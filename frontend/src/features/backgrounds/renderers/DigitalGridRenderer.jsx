// Digital Grid Renderer - Uses shared AnimationLoop coordinator.
import React, { useRef, useEffect } from 'react';
import { drawUtils } from '../BackgroundRenderer';
import { AnimationLoop } from '../animationLoop';

export const DigitalGridRenderer = ({ 
  color = 'rgba(0,240,255,0.08)',
  opacity = 0.7,
  zIndex = -2,
  sharedLoop = null,
}) => {
  const canvasRef = useRef(null);
  const offsetRef = useRef(0);
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

    const loop = loopRef.current;

    const draw = (msg) => {
      if (msg.type === 'resize') return;
      drawUtils.clear(ctx, canvas.width, canvas.height, 'rgba(3,5,10,0.95)');
      drawUtils.drawGrid(ctx, canvas.width, canvas.height, 40, color, 1, offsetRef.current);
      offsetRef.current += 0.3;

      ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    const unsubscribe = loop.subscribe(draw);

    return () => {
      unsubscribe();
      window.removeEventListener('resize', resize);
    };
  }, [color, loopRef.current]);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex, opacity }} />;
};

export default DigitalGridRenderer;
