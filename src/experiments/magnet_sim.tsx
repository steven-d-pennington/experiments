import React, { useRef, useEffect, useState } from 'react';

const WIDTH = 600;
const HEIGHT = 400;
const PARTICLE_COUNT = 60;

const MagnetSim: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [magnet, setMagnet] = useState({ x: WIDTH / 2, y: HEIGHT / 2, dragging: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let running = true;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * WIDTH,
      y: Math.random() * HEIGHT,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      r: 6 + Math.random() * 6,
      color: `hsl(${Math.random()*360}, 80%, 60%)`,
    }));
    function animate() {
      if (!running) return;
      if (!ctx) return;
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      // Magnet
      ctx.beginPath();
      ctx.arc(magnet.x, magnet.y, 24, 0, Math.PI * 2);
      ctx.fillStyle = '#ff5252';
      ctx.globalAlpha = 0.7;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 3;
      ctx.stroke();
      // Particles
      for (const p of particles) {
        if (!ctx) continue;
        // Magnetic force
        const dx = magnet.x - p.x, dy = magnet.y - p.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 200) {
          const force = 2000 / (dist * dist + 100);
          p.vx += force * dx / dist;
          p.vy += force * dy / dist;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.97;
        p.vy *= 0.97;
        // bounce
        if (p.x < p.r) { p.x = p.r; p.vx *= -0.8; }
        if (p.x > WIDTH - p.r) { p.x = WIDTH - p.r; p.vx *= -0.8; }
        if (p.y > HEIGHT - p.r) { p.y = HEIGHT - p.r; p.vy *= -0.7; p.vx *= 0.98; }
        if (p.y < p.r) { p.y = p.r; p.vy *= -0.7; }
      }
      for (const p of particles) {
        if (!ctx) continue;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.8;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      requestAnimationFrame(animate);
    }
    animate();
    return () => { running = false; };
  }, [magnet.x, magnet.y]);

  // Drag logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    function onDown(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (Math.sqrt((x - magnet.x) ** 2 + (y - magnet.y) ** 2) < 30) {
        setMagnet(m => ({ ...m, dragging: true }));
      }
    }
    function onMove(e: MouseEvent) {
      if (!canvas) return;
      if (!magnet.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMagnet(m => ({ ...m, x, y }));
    }
    function onUp() {
      setMagnet(m => ({ ...m, dragging: false }));
    }
    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      canvas.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [magnet.dragging, magnet.x, magnet.y]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>🧲 Magnet Simulation</h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>Drag the red magnet to move the particles!</p>
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} style={{ borderRadius: 16, background: 'var(--color-surface)', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', margin: 16 }} />
    </div>
  );
};

export default MagnetSim; 