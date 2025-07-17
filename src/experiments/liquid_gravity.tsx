import React, { useRef, useEffect } from 'react';

const WIDTH = 600;
const HEIGHT = 400;
const PARTICLE_COUNT = 120;

function randomColor() {
  return `hsl(${Math.random()*360}, 80%, 60%)`;
}

const LiquidGravity: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let running = true;
    let particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * WIDTH,
      y: Math.random() * HEIGHT,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      r: 8 + Math.random() * 8,
      color: randomColor(),
    }));
    function animate() {
      if (!running) return;
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      for (let p of particles) {
        p.vy += 0.1; // gravity
        p.x += p.vx;
        p.y += p.vy;
        // bounce
        if (p.x < p.r) { p.x = p.r; p.vx *= -0.8; }
        if (p.x > WIDTH - p.r) { p.x = WIDTH - p.r; p.vx *= -0.8; }
        if (p.y > HEIGHT - p.r) { p.y = HEIGHT - p.r; p.vy *= -0.7; p.vx *= 0.98; }
        if (p.y < p.r) { p.y = p.r; p.vy *= -0.7; }
      }
      // draw
      for (let p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      // connect close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          let a = particles[i], b = particles[j];
          let dx = a.x - b.x, dy = a.y - b.y;
          let dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 60) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = a.color;
            ctx.globalAlpha = 0.2;
            ctx.lineWidth = 4 - dist/20;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }
      requestAnimationFrame(animate);
    }
    animate();
    return () => { running = false; };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>💧 Liquid Gravity</h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>A mesmerizing simulation of liquid particles under gravity. Try clicking to add a splash!</p>
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} style={{ borderRadius: 16, background: 'var(--color-surface)', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', margin: 16 }}
        onClick={e => {
          const rect = canvasRef.current!.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          // Add a splash of new particles
          for (let i = 0; i < 10; i++) {
            let angle = Math.random() * Math.PI * 2;
            let speed = 4 + Math.random() * 2;
            let vx = Math.cos(angle) * speed;
            let vy = Math.sin(angle) * speed;
            (canvasRef.current as any).particles = (canvasRef.current as any).particles || [];
            (canvasRef.current as any).particles.push({ x, y, vx, vy, r: 8 + Math.random() * 8, color: randomColor() });
          }
        }}
      />
    </div>
  );
};

export default LiquidGravity; 