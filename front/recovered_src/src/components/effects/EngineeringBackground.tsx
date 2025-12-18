
import { useEffect, useRef } from 'react';

interface EngineeringElement {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  type: 'gear' | 'circuit' | 'blueprint' | 'grid';
  glowIntensity: number;
}

export default function EngineeringBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const elementsRef = useRef<EngineeringElement[]>([]);
  const animationRef = useRef<number>(0);
  const lightPositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createElements = () => {
      const elementCount = window.innerWidth < 768 ? 15 : 25;
      elementsRef.current = [];

      for (let i = 0; i < elementCount; i++) {
        elementsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 40 + 20,
          opacity: Math.random() * 0.3 + 0.1,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.01,
          type: ['gear', 'circuit', 'blueprint', 'grid'][Math.floor(Math.random() * 4)] as any,
          glowIntensity: Math.random() * 0.5 + 0.3
        });
      }
    };

    const drawGear = (ctx: CanvasRenderingContext2D, size: number) => {
      const teeth = 12;
      const innerRadius = size * 0.3;
      const outerRadius = size * 0.5;
      
      ctx.beginPath();
      for (let i = 0; i < teeth * 2; i++) {
        const angle = (i * Math.PI) / teeth;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      
      // Inner circle
      ctx.moveTo(innerRadius * 0.5, 0);
      ctx.arc(0, 0, innerRadius * 0.5, 0, Math.PI * 2);
    };

    const drawCircuit = (ctx: CanvasRenderingContext2D, size: number) => {
      const gridSize = size / 6;
      
      // Circuit lines
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const x = (i - 2.5) * gridSize;
        ctx.moveTo(x, -size/2);
        ctx.lineTo(x, size/2);
        
        const y = (i - 2.5) * gridSize;
        ctx.moveTo(-size/2, y);
        ctx.lineTo(size/2, y);
      }
      
      // Circuit nodes
      for (let i = 0; i < 4; i++) {
        const x = (Math.random() - 0.5) * size * 0.8;
        const y = (Math.random() - 0.5) * size * 0.8;
        ctx.moveTo(x + 3, y);
        ctx.arc(x, y, 3, 0, Math.PI * 2);
      }
    };

    const drawBlueprint = (ctx: CanvasRenderingContext2D, size: number) => {
      // Blueprint grid
      const gridSize = size / 8;
      ctx.beginPath();
      for (let i = -4; i <= 4; i++) {
        ctx.moveTo(i * gridSize, -size/2);
        ctx.lineTo(i * gridSize, size/2);
        ctx.moveTo(-size/2, i * gridSize);
        ctx.lineTo(size/2, i * gridSize);
      }
      
      // Blueprint shapes
      ctx.rect(-size/4, -size/4, size/2, size/2);
      ctx.moveTo(size/4, 0);
      ctx.arc(0, 0, size/4, 0, Math.PI * 2);
    };

    const drawGrid = (ctx: CanvasRenderingContext2D, size: number) => {
      const spacing = size / 6;
      ctx.beginPath();
      
      for (let i = -3; i <= 3; i++) {
        // Vertical lines
        ctx.moveTo(i * spacing, -size/2);
        ctx.lineTo(i * spacing, size/2);
        
        // Horizontal lines
        ctx.moveTo(-size/2, i * spacing);
        ctx.lineTo(size/2, i * spacing);
      }
    };

    const drawElement = (element: EngineeringElement) => {
      ctx.save();
      ctx.translate(element.x, element.y);
      ctx.rotate(element.rotation);
      
      // Calculate distance from light for glow effect
      const lightDistance = Math.sqrt(
        Math.pow(element.x - lightPositionRef.current.x, 2) + 
        Math.pow(element.y - lightPositionRef.current.y, 2)
      );
      const maxDistance = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);
      const lightInfluence = Math.max(0, 1 - lightDistance / (maxDistance * 0.3));
      
      // Enhanced glow when near light
      const glowOpacity = element.opacity + lightInfluence * element.glowIntensity;
      
      // Outer glow
      if (lightInfluence > 0.1) {
        ctx.shadowColor = '#0277BD';
        ctx.shadowBlur = 20 * lightInfluence;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
      
      ctx.globalAlpha = Math.min(glowOpacity, 0.6);
      ctx.strokeStyle = `rgba(2, 119, 189, ${glowOpacity})`;
      ctx.fillStyle = `rgba(2, 119, 189, ${glowOpacity * 0.1})`;
      ctx.lineWidth = 1 + lightInfluence * 2;
      
      // Draw based on type
      switch (element.type) {
        case 'gear':
          drawGear(ctx, element.size);
          break;
        case 'circuit':
          drawCircuit(ctx, element.size);
          break;
        case 'blueprint':
          drawBlueprint(ctx, element.size);
          break;
        case 'grid':
          drawGrid(ctx, element.size);
          break;
      }
      
      ctx.stroke();
      if (element.type === 'gear') {
        ctx.fill();
      }
      
      ctx.restore();
    };

    const drawMovingLight = () => {
      const time = Date.now() * 0.001;
      
      // Moving light path (figure-8 pattern)
      lightPositionRef.current.x = canvas.width * 0.5 + Math.sin(time * 0.3) * canvas.width * 0.3;
      lightPositionRef.current.y = canvas.height * 0.5 + Math.sin(time * 0.6) * canvas.height * 0.2;
      
      // Draw light source
      const gradient = ctx.createRadialGradient(
        lightPositionRef.current.x, lightPositionRef.current.y, 0,
        lightPositionRef.current.x, lightPositionRef.current.y, 150
      );
      gradient.addColorStop(0, 'rgba(2, 119, 189, 0.3)');
      gradient.addColorStop(0.5, 'rgba(2, 119, 189, 0.1)');
      gradient.addColorStop(1, 'rgba(2, 119, 189, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(
        lightPositionRef.current.x - 150,
        lightPositionRef.current.y - 150,
        300,
        300
      );
      
      // Light beam effect
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = 'rgba(2, 119, 189, 0.05)';
      ctx.beginPath();
      ctx.arc(lightPositionRef.current.x, lightPositionRef.current.y, 80, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw moving light first
      drawMovingLight();
      
      // Update and draw elements
      elementsRef.current.forEach(element => {
        // Update position
        element.x += element.vx;
        element.y += element.vy;
        element.rotation += element.rotationSpeed;
        
        // Bounce off edges
        if (element.x < -element.size || element.x > canvas.width + element.size) {
          element.vx *= -1;
        }
        if (element.y < -element.size || element.y > canvas.height + element.size) {
          element.vy *= -1;
        }
        
        // Keep elements in bounds
        element.x = Math.max(-element.size, Math.min(canvas.width + element.size, element.x));
        element.y = Math.max(-element.size, Math.min(canvas.height + element.size, element.y));
        
        drawElement(element);
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    createElements();
    animate();

    const handleResize = () => {
      resizeCanvas();
      createElements();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.4 }}
    />
  );
}
