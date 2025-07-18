import React, { useRef, useEffect, useState } from 'react';

const WIDTH = 700;
const HEIGHT = 700;
const SUN_RADIUS = 36;
const SUN_STRENGTH_DEFAULT = 5;
const PLANET_RADIUS = 12;
const G = 2000; // gravitational constant (tweak for fun)

interface Planet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
}

let planetIdCounter = 1;

const PlanetarySim: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [sunMass, setSunMass] = useState(SUN_STRENGTH_DEFAULT);

  // Sun is fixed at center
  const sun = { x: WIDTH / 2, y: HEIGHT / 2, strength: sunMass };

  function addPlanet() {
    // Place planet at random angle, random distance from sun
    const minR = SUN_RADIUS + 60;
    const maxR = WIDTH / 2 - 40;
    const theta = Math.random() * Math.PI * 2;
    const r = minR + Math.random() * (maxR - minR);
    const x = sun.x + Math.cos(theta) * r;
    const y = sun.y + Math.sin(theta) * r;
    // Calculate orbital speed: v = sqrt(G*M/r)
    const v = Math.sqrt((G * sun.strength) / r);
    // Perpendicular direction (right-hand rule)
    const vx = -Math.sin(theta) * v;
    const vy = Math.cos(theta) * v;
    setPlanets(ps => [
      ...ps,
      {
        id: planetIdCounter++,
        x,
        y,
        vx,
        vy,
        r: PLANET_RADIUS,
        color: `hsl(${Math.random()*360},80%,60%)`,
      },
    ]);
  }

  function resetPlanets() {
    setPlanets([]);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let running = true;
    let frame = 0;
    function animate() {
      if (!running || !ctx) return;
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      // Draw subtle background grid
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.strokeStyle = '#fff';
      for (let x = 0; x < WIDTH; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y < HEIGHT; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(WIDTH, y);
        ctx.stroke();
      }
      ctx.restore();
      // Animate sun glow
      frame++;
      const sunGlow = 32 + 8 * Math.sin(frame * 0.04);
      // Draw sun
      ctx.beginPath();
      ctx.arc(sun.x, sun.y, SUN_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = '#ffb300';
      ctx.globalAlpha = 0.95;
      ctx.shadowColor = '#ffb30088';
      ctx.shadowBlur = sunGlow;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.font = 'bold 18px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText('☉', sun.x, sun.y + 8);
      // Sun mass label
      ctx.font = 'bold 15px sans-serif';
      ctx.fillStyle = '#ffb300';
      ctx.globalAlpha = 0.85;
      ctx.fillText(`Sun Mass: ${sunMass.toFixed(2)}`, sun.x, sun.y + SUN_RADIUS + 24);
      ctx.globalAlpha = 1;
      // --- Ball-Ball Collisions ---
      for (let i = 0; i < planets.length; i++) {
        for (let j = i + 1; j < planets.length; j++) {
          const a = planets[i];
          const b = planets[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = a.r + b.r;
          const isColliding = dist < minDist && dist > 0;
          if (isColliding) {
            // Move balls apart with extra buffer
            const overlap = 0.5 * (minDist - dist + 1.5); // more robust separation
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
      // Planets
      for (const p of planets) {
        // Gravitational force from sun
        const dx = sun.x - p.x, dy = sun.y - p.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const force = G * sunMass / (dist * dist + 100);
        p.vx += force * dx / dist;
        p.vy += force * dy / dist;
        p.x += p.vx;
        p.y += p.vy;
        // bounce off walls (optional, for fun)
        if (p.x < p.r) { p.x = p.r; p.vx *= -0.8; }
        if (p.x > WIDTH - p.r) { p.x = WIDTH - p.r; p.vx *= -0.8; }
        if (p.y > HEIGHT - p.r) { p.y = HEIGHT - p.r; p.vy *= -0.8; }
        if (p.y < p.r) { p.y = p.r; p.vy *= -0.8; }
      }
      // Draw orbits (trails)
      ctx.save();
      ctx.globalAlpha = 0.28;
      for (const p of planets) {
        ctx.beginPath();
        ctx.arc(sun.x, sun.y, Math.sqrt((p.x - sun.x) ** 2 + (p.y - sun.y) ** 2), 0, Math.PI * 2);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();
      // Draw planets
      for (const p of planets) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.95;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      requestAnimationFrame(animate);
    }
    animate();
    return () => { running = false; };
  }, [planets, sunMass, sun.x, sun.y]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <h1 style={{ color: '#ffb300', fontWeight: 700, fontSize: 32, margin: '24px 0 8px 0', letterSpacing: 1 }}>Planetary Simulation</h1>
      <div style={{ color: '#fff', fontSize: 16, marginBottom: 8, opacity: 0.8 }}>Click &apos;Add Planet&apos; to spawn a planet in a stable orbit. Try adding several and watch the orbits!</div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={addPlanet} style={{ padding: '10px 28px', fontSize: 18, borderRadius: 8, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, boxShadow: '0 2px 8px #2563eb33' }}>Add Planet</button>
        <button onClick={resetPlanets} style={{ padding: '10px 28px', fontSize: 18, borderRadius: 8, background: '#222', color: '#ffb300', border: '2px solid #ffb300', cursor: 'pointer', fontWeight: 700 }}>Reset</button>
        <span style={{ color: '#fff', fontSize: 17, marginLeft: 8 }}>Planets: <b style={{ color: '#ffb300' }}>{planets.length}</b></span>
        <label style={{ color: '#ffb300', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, background: '#fff2', borderRadius: 8, padding: '4px 12px', marginLeft: 8 }}>
          Sun Mass
          <input
            type="range"
            min="1"
            max="15"
            step="0.01"
            value={sunMass}
            onChange={e => setSunMass(Number(e.target.value))}
            style={{ flex: 1, accentColor: '#ffb300' }}
          />
          <span style={{ minWidth: 40, textAlign: 'right', color: '#222', fontWeight: 700 }}>{sunMass.toFixed(2)}</span>
        </label>
      </div>
      <div style={{ width: '100%', maxWidth: WIDTH, aspectRatio: '1 / 1', background: 'transparent', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.12)' }}>
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} style={{ width: '100%', height: '100%', background: '#181825', borderRadius: 16, display: 'block' }} />
      </div>
    </div>
  );
};

export default PlanetarySim; 