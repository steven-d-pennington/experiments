import React, { useRef, useEffect, useState } from 'react';

const WIDTH = 600;
const HEIGHT = 400;
const PARTICLE_COUNT = 8;
const MAGNET_RADIUS = 24;

interface Magnet {
  x: number;
  y: number;
  dragging: boolean;
  strength: number;
}

const MagnetSim: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [magnets, setMagnets] = useState<Magnet[]>([
    { x: WIDTH / 2, y: HEIGHT / 2, dragging: false, strength: 1 },
  ]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // Add Magnet button handler
  function addMagnet() {
    setMagnets(mags => [
      ...mags,
      { x: WIDTH / 2 + Math.random() * 100 - 50, y: HEIGHT / 2 + Math.random() * 100 - 50, dragging: false, strength: 1 },
    ]);
  }

  function setMagnetStrength(idx: number, value: number) {
    setMagnets(mags => mags.map((m, i) => i === idx ? { ...m, strength: value } : m));
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
        // Draw strength label
        ctx.font = 'bold 15px sans-serif';
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 0.9;
        ctx.textAlign = 'center';
        ctx.fillText(mag.strength.toFixed(2), mag.x, mag.y + 5);
        ctx.globalAlpha = 1;
      }
      // --- Ball-Ball Collisions ---
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = a.r + b.r;
          if (dist < minDist && dist > 0) {
            // Move balls apart
            const overlap = 0.5 * (minDist - dist + 0.1);
            const nx = dx / dist;
            const ny = dy / dist;
            a.x -= nx * overlap;
            a.y -= ny * overlap;
            b.x += nx * overlap;
            b.y += ny * overlap;
            // Elastic collision (equal mass)
            const dvx = b.vx - a.vx;
            const dvy = b.vy - a.vy;
            const dot = dvx * nx + dvy * ny;
            if (dot < 0) {
              const impulse = dot;
              a.vx += nx * impulse;
              a.vy += ny * impulse;
              b.vx -= nx * impulse;
              b.vy -= ny * impulse;
            }
          }
        }
      }
      // Particles
      for (const p of particles) {
        // Magnetic force from all magnets
        for (const mag of magnets) {
          const dx = mag.x - p.x, dy = mag.y - p.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 200) {
            const force = 2000 * mag.strength / (dist * dist + 100);
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8, width: 320 }}>
        {magnets.map((mag, idx) => (
          <label key={idx} style={{ color: '#ff5252', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, background: '#fff2', borderRadius: 8, padding: '4px 12px' }}>
            Magnet {idx + 1} Strength
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.01"
              value={mag.strength}
              onChange={e => setMagnetStrength(idx, Number(e.target.value))}
              style={{ flex: 1, accentColor: '#ff5252' }}
            />
            <span style={{ minWidth: 40, textAlign: 'right', color: '#222', fontWeight: 700 }}>{mag.strength.toFixed(2)}</span>
          </label>
        ))}
      </div>
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} style={{ borderRadius: 16, background: 'var(--color-surface)', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', margin: 16 }} />
    </div>
  );
};

export default MagnetSim; 