// Background Renderer - Utility functions and shared renderer factory
// Provides drawUtils used by canvas-based background renderers.

export const drawUtils = {
  /** Clear canvas with a solid color */
  clear(ctx, width, height, fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fillRect(0, 0, width, height);
  },

  /** Draw a perspective grid with optional offset for animation */
  drawGrid(ctx, width, height, gridSize, color, lineWidth = 1, offset = 0) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();

    // Vertical lines
    for (let x = -gridSize; x <= width + gridSize; x += gridSize) {
      ctx.moveTo(x + offset, 0);
      ctx.lineTo(x + offset, height);
    }

    // Horizontal lines
    for (let y = -gridSize; y <= height + gridSize; y += gridSize) {
      ctx.moveTo(0, y + offset);
      ctx.lineTo(width, y + offset);
    }

    ctx.stroke();
  },

  /** Draw a radial glow effect */
  drawGlow(ctx, x, y, radius, color, alpha = 0.3) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color.replace(')', `, ${alpha})`).replace('rgb', 'rgba'));
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  },
};

/**
 * createBackgroundRenderer - Factory for creating background renderer components.
 * @param {Function} drawFn - Drawing function (msg, ctx, canvas) => void
 * @param {Object} options - Optional configuration
 * @returns {React.ComponentType} - Renderer component
 */
export function createBackgroundRenderer(drawFn, options = {}) {
  const { opacity = 0.8, zIndex = -2 } = options;

  return function BackgroundRenderer({ sharedLoop: loopOverride }) {
    const canvasRef = useRef(null);
    const loopRef = useRef(loopOverride || AnimationLoop.shared());

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
        drawFn(msg, ctx, canvas);
      };

      const unsubscribe = loop.subscribe(draw);

      return () => {
        unsubscribe();
        window.removeEventListener('resize', resize);
      };
    }, [loopRef.current]);

    return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex, opacity }} />;
  };
}

// Lazy import to avoid circular dependency
import { useRef, useEffect } from 'react';
import { AnimationLoop } from './animationLoop';