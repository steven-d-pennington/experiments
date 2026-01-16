import React, { useRef, useEffect, useState } from 'react';

const WIDTH = 600;
const HEIGHT = 400;
const PARTICLE_COUNT = 8;
const MAGNET_RADIUS = 24;

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
}

interface GravityWell {
  x: number;
  y: number;
  dragging: boolean;
  strength: number;
}

const GravityWellSim: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [balls, setBalls] = useState<Ball[]>(() => {
    const arr: Ball[] = [];
    const cx = WIDTH / 2;
    const cy = HEIGHT / 2;
    let tries = 0;
    while (arr.length < PARTICLE_COUNT && tries < PARTICLE_COUNT * 10) {
      const theta = Math.random() * Math.PI * 2;
      const rad = Math.random() * (Math.min(WIDTH, HEIGHT) / 2 - 30);
      const x = cx + Math.cos(theta) * rad;
      const y = cy + Math.sin(theta) * rad;
      let overlap = false;
      for (const b of arr) {
        const dx = b.x - x;
        const dy = b.y - y;
        if (Math.sqrt(dx * dx + dy * dy) < b.r + 12) {
          overlap = true;
          break;
        }
      }
      if (!overlap) {
        arr.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          r: 12,
          color: `hsl(${Math.random() * 360},80%,60%)`,
        });
      }
      tries++;
    }
    return arr;
  });
  const [wells, setWells] = useState<GravityWell[]>([
    { x: WIDTH / 2, y: HEIGHT / 2, dragging: false, strength: 1 },
  ]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  function addWell() {
    setWells((ws) => [
      ...ws,
      {
        x: WIDTH / 2 + Math.random() * 100 - 50,
        y: HEIGHT / 2 + Math.random() * 100 - 50,
        dragging: false,
        strength: 1,
      },
    ]);
  }

  function addBall() {
    setBalls((balls) => {
      const cx = WIDTH / 2;
      const cy = HEIGHT / 2;
      let tries = 0;
      while (tries < 100) {
        const theta = Math.random() * Math.PI * 2;
        const rad = Math.random() * (Math.min(WIDTH, HEIGHT) / 2 - 30);
        const x = cx + Math.cos(theta) * rad;
        const y = cy + Math.sin(theta) * rad;
        let overlap = false;
        for (const b of balls) {
          const dx = b.x - x;
          const dy = b.y - y;
          if (Math.sqrt(dx * dx + dy * dy) < b.r + 12) {
            overlap = true;
            break;
          }
        }
        if (!overlap) {
          return [
            ...balls,
            {
              x,
              y,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              r: 12,
              color: `hsl(${Math.random() * 360},80%,60%)`,
            },
          ];
        }
        tries++;
      }
      return balls;
    });
  }

  function setWellStrength(idx: number, value: number) {
    setWells((ws) => ws.map((w, i) => (i === idx ? { ...w, strength: value } : w)));
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let running = true;
    function animate() {
      if (!running) return;
      if (!ctx) return;
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      // Draw all gravity wells
      for (const well of wells) {
        ctx.beginPath();
        ctx.arc(well.x, well.y, MAGNET_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = '#2563eb';
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Draw strength label
        ctx.font = 'bold 15px sans-serif';
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 0.9;
        ctx.textAlign = 'center';
        ctx.fillText(well.strength.toFixed(2), well.x, well.y + 5);
        ctx.globalAlpha = 1;
      }
      // --- Ball-Ball Collisions ---
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const a = balls[i];
          const b = balls[j];
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
      for (const p of balls) {
        // Gravitational force from all wells
        for (const well of wells) {
          const dx = well.x - p.x,
            dy = well.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            const force = (2000 * well.strength) / (dist * dist + 100);
            p.vx += (force * dx) / dist;
            p.vy += (force * dy) / dist;
          }
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.97;
        p.vy *= 0.97;
        // bounce
        if (p.x < p.r) {
          p.x = p.r;
          p.vx *= -0.8;
        }
        if (p.x > WIDTH - p.r) {
          p.x = WIDTH - p.r;
          p.vx *= -0.8;
        }
        if (p.y > HEIGHT - p.r) {
          p.y = HEIGHT - p.r;
          p.vy *= -0.7;
          p.vx *= 0.98;
        }
        if (p.y < p.r) {
          p.y = p.r;
          p.vy *= -0.7;
        }
      }
      for (const p of balls) {
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
    return () => {
      running = false;
    };
  }, [wells, balls]);

  // Drag logic for multiple wells
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    function onDown(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Find the topmost well under the cursor
      for (let i = wells.length - 1; i >= 0; i--) {
        const well = wells[i];
        if (Math.sqrt((x - well.x) ** 2 + (y - well.y) ** 2) < MAGNET_RADIUS + 6) {
          setDragIndex(i);
          setWells((ws) => ws.map((w, idx) => (idx === i ? { ...w, dragging: true } : w)));
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
      setWells((ws) => ws.map((w, idx) => (idx === dragIndex && w.dragging ? { ...w, x, y } : w)));
    }
    function onUp() {
      setWells((ws) => ws.map((w) => ({ ...w, dragging: false })));
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
  }, [wells, dragIndex]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>🪐 Gravity Well Simulation</h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>
        Drag any blue gravity well to move the balls! Add more wells for more fun.
      </p>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <button
          onClick={addWell}
          style={{
            padding: '8px 18px',
            fontSize: 16,
            borderRadius: 8,
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Add Gravity Well
        </button>
        <button
          onClick={addBall}
          style={{
            padding: '8px 18px',
            fontSize: 16,
            borderRadius: 8,
            background: '#ff5252',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Add Ball
        </button>
      </div>
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8, width: 320 }}
      >
        {wells.map((well, idx) => (
          <label
            key={idx}
            style={{
              color: '#2563eb',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#fff2',
              borderRadius: 8,
              padding: '4px 12px',
            }}
          >
            Gravity Well {idx + 1} Strength
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.01"
              value={well.strength}
              onChange={(e) => setWellStrength(idx, Number(e.target.value))}
              style={{ flex: 1, accentColor: '#2563eb' }}
            />
            <span style={{ minWidth: 40, textAlign: 'right', color: '#222', fontWeight: 700 }}>
              {well.strength.toFixed(2)}
            </span>
          </label>
        ))}
      </div>
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        style={{
          borderRadius: 16,
          background: 'var(--color-surface)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
          margin: 16,
        }}
      />
    </div>
  );
};

export default GravityWellSim;
