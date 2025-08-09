import React, { useRef, useEffect, useState } from 'react';

const WIDTH = 1200;
const HEIGHT = 1200;
const SUN_RADIUS = 36;
const SUN_STRENGTH_DEFAULT = 5;
const PLANET_RADIUS = 12;
const G = 50; // gravitational constant (much smaller for stable orbits)
const TIME_STEP = 0.2; // smaller timestep for stability
const Z_RANGE = 300; // depth range (-150 to +150)

interface Planet3D {
  id: number;
  x: number;
  y: number;
  z: number; // depth coordinate
  vx: number;
  vy: number;
  vz: number; // z-velocity
  r: number;
  color: string;
  trail: { x: number; y: number; z: number }[];
}

let planetIdCounter = 1;

// Helper function to convert HSL color to RGBA with alpha
function hslToRgba(hslColor: string, alpha: number): string {
  const match = hslColor.match(/hsl\((\d+(?:\.\d+)?),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return `rgba(255,255,255,${alpha})`;

  const h = parseFloat(match[1]) / 360;
  const s = parseFloat(match[2]) / 100;
  const l = parseFloat(match[3]) / 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${alpha})`;
}

// Convert 3D coordinates to 2D screen coordinates with perspective
function project3D(x: number, y: number, z: number) {
  const perspective = 800; // perspective distance
  const scale = perspective / (perspective + z);
  return {
    x: x * scale,
    y: y * scale,
    scale: scale,
  };
}

const Galaxy3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [planets, setPlanets] = useState<Planet3D[]>([]);
  const [sunMass, setSunMass] = useState(SUN_STRENGTH_DEFAULT);
  const rotationYRef = useRef(0);

  // Sun is fixed at center
  const sun = { x: WIDTH / 2, y: HEIGHT / 2, z: 0, strength: sunMass };

  function addPlanet() {
    // Place planet at random 3D position around sun
    const minR = SUN_RADIUS + 80;
    const maxR = WIDTH / 2 - 60;
    const theta = Math.random() * Math.PI * 2; // horizontal angle
    const phi = (Math.random() - 0.5) * Math.PI * 0.6; // vertical angle (limited range)
    const r = minR + Math.random() * (maxR - minR);

    const x = sun.x + Math.cos(theta) * Math.cos(phi) * r;
    const y = sun.y + Math.sin(phi) * r;
    const z = sun.z + Math.sin(theta) * Math.cos(phi) * r;

    // Calculate proper orbital velocity for stable circular orbit
    const v = Math.sqrt((G * sun.strength) / r) * 0.8; // closer to theoretical orbital speed

    // Calculate position vector relative to sun
    const rx = x - sun.x;
    const ry = y - sun.y;
    const rz = z - sun.z;

    // Create velocity perpendicular to position vector (for circular orbit)
    // Use cross product with up vector (0,1,0) to get tangent velocity
    const vx = (-rz * v) / r;
    const vy = 0; // keep orbits mostly horizontal initially
    const vz = (rx * v) / r;

    setPlanets((ps) => [
      ...ps,
      {
        id: planetIdCounter++,
        x,
        y,
        z,
        vx,
        vy,
        vz,
        r: PLANET_RADIUS,
        color: `hsl(${Math.random() * 360},80%,60%)`,
        trail: [],
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

      // Auto-rotate the galaxy view
      rotationYRef.current += 0.003;

      // Draw background stars
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 100; i++) {
        const x = (i * 137) % WIDTH;
        const y = (i * 211) % HEIGHT;
        const z = ((i * 73) % 200) - 100;
        const projected = project3D(x - WIDTH / 2, y - HEIGHT / 2, z);
        const size = (0.5 + (i % 3) * 0.5) * projected.scale;
        ctx.globalAlpha = 0.2 + projected.scale * 0.3;
        ctx.beginPath();
        ctx.arc(projected.x + WIDTH / 2, projected.y + HEIGHT / 2, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Animate sun glow
      frame++;
      const sunGlow = 32 + 8 * Math.sin(frame * 0.04);

      // Draw sun (always at center, no rotation)
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

      // Apply simple Y-axis rotation to planets
      const cosY = Math.cos(rotationYRef.current);
      const sinY = Math.sin(rotationYRef.current);

      // Update planets physics
      const planetsToKeep = [];
      for (const p of planets) {
        // 3D gravitational force from sun
        const dx = sun.x - p.x;
        const dy = sun.y - p.y;
        const dz = sun.z - p.z;
        const dist3D = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const force = (G * sunMass) / (dist3D * dist3D + 100);

        p.vx += ((force * dx) / dist3D) * TIME_STEP;
        p.vy += ((force * dy) / dist3D) * TIME_STEP;
        p.vz += ((force * dz) / dist3D) * TIME_STEP;

        p.x += p.vx * TIME_STEP;
        p.y += p.vy * TIME_STEP;
        p.z += p.vz * TIME_STEP;

        // Add to trail
        if (frame % 4 === 0) {
          p.trail.push({ x: p.x, y: p.y, z: p.z });
          if (p.trail.length > 150) {
            p.trail.shift();
          }
        }

        // Remove planets that drift too far
        const distFromCenter = Math.sqrt(
          (p.x - sun.x) ** 2 + (p.y - sun.y) ** 2 + (p.z - sun.z) ** 2
        );
        if (distFromCenter <= WIDTH * 1.2) {
          planetsToKeep.push(p);
        }
      }

      if (planetsToKeep.length !== planets.length) {
        setPlanets(planetsToKeep);
      }

      // Create array of planets with rotated positions for depth sorting
      const rotatedPlanets = planets.map((p) => {
        // Rotate around Y-axis
        const relX = p.x - sun.x;
        const relZ = p.z - sun.z;
        const rotatedX = relX * cosY - relZ * sinY;
        const rotatedZ = relX * sinY + relZ * cosY;

        return {
          ...p,
          rotatedX: rotatedX + sun.x,
          rotatedY: p.y,
          rotatedZ: rotatedZ + sun.z,
          trail: p.trail.map((t) => {
            const tRelX = t.x - sun.x;
            const tRelZ = t.z - sun.z;
            return {
              x: tRelX * cosY - tRelZ * sinY + sun.x,
              y: t.y,
              z: tRelX * sinY + tRelZ * cosY + sun.z,
            };
          }),
        };
      });

      // Sort planets by z-depth (farthest first)
      rotatedPlanets.sort((a, b) => a.rotatedZ - b.rotatedZ);

      // Draw trails for all planets (back to front) with gradient effect
      ctx.save();
      for (const p of rotatedPlanets) {
        if (p.trail.length > 1) {
          // Project trail points to screen coordinates
          const projectedTrail = p.trail.map((t) => {
            const projected = project3D(t.x - WIDTH / 2, t.y - HEIGHT / 2, t.z);
            return {
              x: projected.x + WIDTH / 2,
              y: projected.y + HEIGHT / 2,
              scale: projected.scale,
            };
          });

          // Create gradient from start to end of trail
          const startPoint = projectedTrail[0];
          const endPoint = projectedTrail[projectedTrail.length - 1];

          if (startPoint && endPoint) {
            const gradient = ctx.createLinearGradient(
              startPoint.x,
              startPoint.y,
              endPoint.x,
              endPoint.y
            );

            // Calculate depth-based alpha for the trail
            const avgZ = p.trail.reduce((sum, t) => sum + t.z, 0) / p.trail.length;
            const depthAlpha = Math.max(0.2, 1 - Math.abs(avgZ) / (Z_RANGE * 1.5));

            gradient.addColorStop(0, hslToRgba(p.color, depthAlpha * 0.1)); // Very transparent start
            gradient.addColorStop(0.7, hslToRgba(p.color, depthAlpha * 0.4)); // Medium transparency
            gradient.addColorStop(1, hslToRgba(p.color, depthAlpha * 0.7)); // More opaque end

            // Draw the trail path
            ctx.beginPath();
            ctx.moveTo(projectedTrail[0].x, projectedTrail[0].y);
            for (let i = 1; i < projectedTrail.length; i++) {
              ctx.lineTo(projectedTrail[i].x, projectedTrail[i].y);
            }

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      // Draw planets (back to front)
      for (const p of rotatedPlanets) {
        const projected = project3D(p.rotatedX - WIDTH / 2, p.rotatedY - HEIGHT / 2, p.rotatedZ);
        const screenX = projected.x + WIDTH / 2;
        const screenY = projected.y + HEIGHT / 2;
        const scale = projected.scale;

        // Calculate depth-based effects with bounds checking
        const depthAlpha = Math.max(0.3, Math.min(1.0, scale));
        const planetSize = Math.max(0.5, p.r * Math.max(0.1, scale)); // Ensure positive radius

        // Only draw planet if it's visible and has valid size
        if (
          planetSize > 0 &&
          screenX > -100 &&
          screenX < WIDTH + 100 &&
          screenY > -100 &&
          screenY < HEIGHT + 100
        ) {
          // Draw planet
          ctx.beginPath();
          ctx.arc(screenX, screenY, planetSize, 0, Math.PI * 2);
          ctx.fillStyle = hslToRgba(p.color, depthAlpha);
          ctx.fill();

          // Add depth highlight/shadow
          if (p.rotatedZ > 0) {
            // Closer planets get a bright highlight
            ctx.strokeStyle = hslToRgba(p.color, depthAlpha * 0.8);
            ctx.lineWidth = 2;
            ctx.stroke();
          } else {
            // Farther planets get a subtle shadow
            ctx.strokeStyle = hslToRgba(p.color, depthAlpha * 0.4);
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    }
    animate();
    return () => {
      running = false;
    };
  }, [planets, sunMass]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <h1
        style={{
          color: '#ffb300',
          fontWeight: 700,
          fontSize: 32,
          margin: '24px 0 8px 0',
          letterSpacing: 1,
        }}
      >
        3D Galaxy Simulator
      </h1>
      <div style={{ color: '#fff', fontSize: 16, marginBottom: 8, opacity: 0.8 }}>
        Experience planets orbiting in true 3D space! Watch as they move in and out of the screen
        with realistic depth.
      </div>
      <div
        style={{
          display: 'flex',
          gap: 16,
          marginBottom: 16,
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <button
          onClick={addPlanet}
          style={{
            padding: '10px 28px',
            fontSize: 18,
            borderRadius: 8,
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 700,
            boxShadow: '0 2px 8px #2563eb33',
          }}
        >
          Add Planet
        </button>
        <button
          onClick={resetPlanets}
          style={{
            padding: '10px 28px',
            fontSize: 18,
            borderRadius: 8,
            background: '#222',
            color: '#ffb300',
            border: '2px solid #ffb300',
            cursor: 'pointer',
            fontWeight: 700,
          }}
        >
          Reset
        </button>
        <span style={{ color: '#fff', fontSize: 17, marginLeft: 8 }}>
          Planets: <b style={{ color: '#ffb300' }}>{planets.length}</b>
        </span>
        <label
          style={{
            color: '#ffb300',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#fff2',
            borderRadius: 8,
            padding: '4px 12px',
            marginLeft: 8,
          }}
        >
          Sun Mass
          <input
            type="range"
            min="1"
            max="15"
            step="0.01"
            value={sunMass}
            onChange={(e) => setSunMass(Number(e.target.value))}
            style={{ flex: 1, accentColor: '#ffb300' }}
          />
          <span style={{ minWidth: 40, textAlign: 'right', color: '#222', fontWeight: 700 }}>
            {sunMass.toFixed(2)}
          </span>
        </label>
      </div>
      <div
        style={{
          width: '100%',
          maxWidth: WIDTH,
          aspectRatio: '1 / 1',
          background: 'transparent',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 2px 16px rgba(0,0,0,0.12)',
        }}
      >
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          style={{
            width: '100%',
            height: '100%',
            background: '#0a0a15',
            borderRadius: 16,
            display: 'block',
          }}
        />
      </div>
    </div>
  );
};

export default Galaxy3D;
