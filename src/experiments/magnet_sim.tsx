import React, { useRef, useEffect, useState } from 'react';

const WIDTH = 600;
const HEIGHT = 400;
const PARTICLE_COUNT = 60;
const MAGNET_RADIUS = 24;

interface Magnet {
  x: number;
  y: number;
  dragging: boolean;
}

const MagnetSim: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [magnets, setMagnets] = useState<Magnet[]>([
    { x: WIDTH / 2, y: HEIGHT / 2, dragging: false },
  ]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // Add Magnet button handler
  function addMagnet() {
    setMagnets(mags => [
      ...mags,
      { x: WIDTH / 2 + Math.random() * 100 - 50, y: HEIGHT / 2 + Math.random() * 100 - 50, dragging: false },
    ]);
  }

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
      // Draw all magnets
      for (const mag of magnets) {
        ctx.beginPath();
        ctx.arc(mag.x, mag.y, MAGNET_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = '#ff5252';
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      // Particles
      for (const p of particles) {
        // Magnetic force from all magnets
        for (const mag of magnets) {
          const dx = mag.x - p.x, dy = mag.y - p.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 200) {
            const force = 2000 / (dist * dist + 100);
            p.vx += force * dx / dist;
            p.vy += force * dy / dist;
          }
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
  }, [magnets]);

  // Drag logic for multiple magnets
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    function onDown(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Find the topmost magnet under the cursor
      for (let i = magnets.length - 1; i >= 0; i--) {
        const mag = magnets[i];
        if (Math.sqrt((x - mag.x) ** 2 + (y - mag.y) ** 2) < MAGNET_RADIUS + 6) {
          setDragIndex(i);
          setMagnets(mags => mags.map((m, idx) => idx === i ? { ...m, dragging: true } : m));
          break;
        }
      }
    }
    function onMove(e: MouseEvent) {
      if (!canvas) return;
      if (dragIndex === null) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMagnets(mags => mags.map((m, idx) => idx === dragIndex && m.dragging ? { ...m, x, y } : m));
    }
    function onUp() {
      setMagnets(mags => mags.map(m => ({ ...m, dragging: false })));
      setDragIndex(null);
    }
    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      canvas.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [magnets, dragIndex]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>🧲 Magnet Simulation</h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>Drag any red magnet to move the particles! Add more magnets for more fun.</p>
      <button onClick={addMagnet} style={{ marginBottom: 12, padding: '8px 18px', fontSize: 16, borderRadius: 8, background: '#ff5252', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Add Magnet</button>
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} style={{ borderRadius: 16, background: 'var(--color-surface)', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', margin: 16 }} />
    </div>
  );
};

export default MagnetSim; 