// Neural Network Renderer - Uses shared AnimationLoop coordinator.
import React, { useRef, useEffect } from 'react';
import { AnimationLoop } from '../animationLoop';

export const NeuralNetworkRenderer = ({ opacity = 0.8, zIndex = -2, sharedLoop = null }) => {
  const canvasRef = useRef(null);
  const nodesRef = useRef([]);
  const loopRef = useRef(sharedLoop || AnimationLoop.shared());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const layers = 5;
      const nodesPerLayer = 6;
      const nodes = [];
      const layerSpacing = canvas.width / (layers + 1);
      for (let l = 0; l < layers; l++) {
        const x = layerSpacing * (l + 1);
        const nodeSpacing = canvas.height / (nodesPerLayer + 1);
        for (let n = 0; n < nodesPerLayer; n++) {
          nodes.push({
            x,
            y: nodeSpacing * (n + 1),
            layer: l,
            activation: Math.random(),
            pulsePhase: Math.random() * Math.PI * 2,
          });
        }
      }
      nodesRef.current = nodes;
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = loopRef.current;

    const draw = (msg) => {
      if (msg.type === 'resize') return;
      const { timestamp } = msg;
      ctx.fillStyle = 'rgba(3,5,10,0.95)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const nodes = nodesRef.current;

      // Connections
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.06)';
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (nodes[j].layer === nodes[i].layer + 1) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      nodes.forEach(node => {
        const pulse = Math.sin(timestamp * 2 + node.pulsePhase) * 0.3 + 0.7;
        const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 20 * pulse);
        glow.addColorStop(0, 'rgba(0, 229, 255, 0.3)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(node.x - 20, node.y - 20, 40, 40);

        ctx.fillStyle = 'rgba(0, 229, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(node.x, node.y, 5 * pulse, 0, Math.PI * 2);
        ctx.fill();
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

export default NeuralNetworkRenderer;
