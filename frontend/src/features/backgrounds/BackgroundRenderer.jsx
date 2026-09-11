// Background Renderer - Base class and utilities
import React, { useRef, useEffect } from 'react';

export function createBackgroundRenderer(drawFn, options = {}) {
  const {
    color = 'rgba(0,240,255,0.08)',
    opacity = 0.7,
    zIndex = -2,
    pointerEvents = 'none',
  } = options;

  return function BackgroundRenderer({ style, ...props }) {
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

      const draw = () => {
        drawFn(ctx, canvas.width, canvas.height);
        raf = requestAnimationFrame(draw);
      };
      draw();

      return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
    }, []);

    return (
      <canvas 
        ref={canvasRef} 
        style={{ 
          position: 'fixed', 
          inset: 0, 
          pointerEvents, 
          zIndex, 
          opacity,
          ...style 
        }} 
        {...props}
      />
    );
  };
}

// Shared drawing utilities
export const drawUtils = {
  clear(ctx, width, height, color = 'rgba(3,5,10,0.15)') {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
  },

  drawGrid(ctx, width, height, gridSize, color, lineWidth = 1, offset = 0) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x + offset % gridSize, 0);
      ctx.lineTo(x + offset % gridSize, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y + offset % gridSize);
      ctx.lineTo(width, y + offset % gridSize);
      ctx.stroke();
    }
  },

  drawCircle(ctx, x, y, radius, color, fill = true) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    if (fill) {
      ctx.fillStyle = color;
      ctx.fill();
    } else {
      ctx.strokeStyle = color;
      ctx.stroke();
    }
  },

  drawRect(ctx, x, y, width, height, color, fill = true) {
    if (fill) {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width, height);
    } else {
      ctx.strokeStyle = color;
      ctx.strokeRect(x, y, width, height);
    }
  },

  randomColor() {
    return `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.random()})`;
  },
};

export default { createBackgroundRenderer, drawUtils };