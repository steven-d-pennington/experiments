import React, { useRef, useEffect } from 'react';

const WIDTH = 600;
const HEIGHT = 400;
const PARTICLE_COUNT = 120;
const OCTAGON_RADIUS = Math.min(WIDTH, HEIGHT) * 0.48; // nearly fills canvas
const OCTAGON_SIDES = 8;

function randomColor() {
  return `hsl(${Math.random() * 360}, 80%, 60%)`;
}

// Define a type for the canvas with particles
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
}
interface CanvasWithParticles extends HTMLCanvasElement {
  particles?: Particle[];
}

const particles: Particle[] = [];

function getOctagonVertices(cx: number, cy: number, radius: number, angle: number) {
  const verts = [];
  for (let i = 0; i < OCTAGON_SIDES; i++) {
    const theta = angle + (Math.PI * 2 * i) / OCTAGON_SIDES;
    verts.push({
      x: cx + Math.cos(theta) * radius,
      y: cy + Math.sin(theta) * radius,
    });
  }
  return verts;
}

function pointToEdgeDistance(px: number, py: number, verts: { x: number; y: number }[]) {
  // Returns the minimum distance from point (px, py) to the inside of the octagon
  let minDist = Infinity;
  for (let i = 0; i < verts.length; i++) {
    const a = verts[i];
    const b = verts[(i + 1) % verts.length];
    // Edge vector
    const ex = b.x - a.x;
    const ey = b.y - a.y;
    // Normalized edge normal (points outward)
    const nx = ey;
    const ny = -ex;
    // Vector from a to point
    const apx = px - a.x;
    const apy = py - a.y;
    // Signed distance from point to edge
    const edgeLen = Math.sqrt(ex * ex + ey * ey);
    const dist = (apx * nx + apy * ny) / edgeLen;
    if (dist < minDist) minDist = dist;
  }
  return minDist;
}

function isInsideOctagon(x: number, y: number, verts: { x: number; y: number }[]) {
  return pointToEdgeDistance(x, y, verts) < 0;
}

// Utility: rotate a point (x, y) around (cx, cy) by angle (radians)
function rotatePoint(x: number, y: number, cx: number, cy: number, angle: number) {
  const dx = x - cx;
  const dy = y - cy;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: cx + dx * cos - dy * sin,
    y: cy + dx * sin + dy * cos,
  };
}
// Utility: rotate a vector (vx, vy) by angle (radians)
function rotateVector(vx: number, vy: number, angle: number) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    vx: vx * cos - vy * sin,
    vy: vx * sin + vy * cos,
  };
}

const LiquidGravity: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const octagonAngleRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let running = true;
    let octagonAngle = 0;
    octagonAngleRef.current = octagonAngle;
    const cx = WIDTH / 2;
    const cy = HEIGHT / 2;
    // Initial spawn: use local frame
    if (particles.length === 0) {
      let tries = 0;
      while (particles.length < PARTICLE_COUNT && tries < PARTICLE_COUNT * 10) {
        // Generate in local (unrotated) frame
        const localAngle = Math.random() * Math.PI * 2;
        const localRadius = Math.random() * OCTAGON_RADIUS * 0.95;
        const localX = cx + Math.cos(localAngle) * localRadius;
        const localY = cy + Math.sin(localAngle) * localRadius;
        // Rotate to world frame
        const { x, y } = rotatePoint(localX, localY, cx, cy, octagonAngle);
        const verts = getOctagonVertices(cx, cy, OCTAGON_RADIUS, octagonAngle);
        if (isInsideOctagon(x, y, verts)) {
          particles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            r: 8 + Math.random() * 8,
            color: randomColor(),
          });
        }
        tries++;
      }
    }
    function drawOctagon(cx: number, cy: number, radius: number, angle: number) {
      if (!ctx) return;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.beginPath();
      for (let i = 0; i < OCTAGON_SIDES; i++) {
        const theta = (Math.PI * 2 * i) / OCTAGON_SIDES;
        const x = Math.cos(theta) * radius;
        const y = Math.sin(theta) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = '#ffb300';
      ctx.lineWidth = 8;
      ctx.globalAlpha = 0.8;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.restore();
    }
    function animate() {
      if (!running || !ctx) return;
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      octagonAngle += 0.01;
      octagonAngleRef.current = octagonAngle;
      // Draw spinning octagon
      drawOctagon(cx, cy, OCTAGON_RADIUS, octagonAngle);
      // For collision, use local (unrotated) frame
      const vertsLocal = getOctagonVertices(cx, cy, OCTAGON_RADIUS, 0);
      for (const p of particles) {
        p.vy += 0.1; // gravity
        p.x += p.vx;
        p.y += p.vy;
        // Transform ball to local frame
        const local = rotatePoint(p.x, p.y, cx, cy, -octagonAngle);
        const dist = pointToEdgeDistance(local.x, local.y, vertsLocal);
        if (dist > -p.r) {
          // Find nearest edge normal in local frame
          let minDist = Infinity;
          let nx = 0,
            ny = 0;
          for (let i = 0; i < vertsLocal.length; i++) {
            const a = vertsLocal[i];
            const b = vertsLocal[(i + 1) % vertsLocal.length];
            const ex = b.x - a.x;
            const ey = b.y - a.y;
            const edgeLen = Math.sqrt(ex * ex + ey * ey);
            const tx = (local.x - a.x) / edgeLen;
            const closestX = a.x + ex * Math.max(0, Math.min(1, tx));
            const closestY = a.y + ey * Math.max(0, Math.min(1, tx));
            const dx = local.x - closestX;
            const dy = local.y - closestY;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < minDist) {
              minDist = d;
              nx = ey / edgeLen;
              ny = -ex / edgeLen;
            }
          }
          // Reflect velocity in local frame
          // Transform velocity to local frame
          const vLocal = rotateVector(p.vx, p.vy, -octagonAngle);
          const dot = vLocal.vx * nx + vLocal.vy * ny;
          vLocal.vx -= 2 * dot * nx;
          vLocal.vy -= 2 * dot * ny;
          vLocal.vx *= 0.8;
          vLocal.vy *= 0.8;
          // Transform velocity back to world frame
          const vWorld = rotateVector(vLocal.vx, vLocal.vy, octagonAngle);
          p.vx = vWorld.vx;
          p.vy = vWorld.vy;
          // Move just inside in local frame, then rotate back
          local.x -= nx * (dist + p.r + 0.5);
          local.y -= ny * (dist + p.r + 0.5);
          const world = rotatePoint(local.x, local.y, cx, cy, octagonAngle);
          p.x = world.x;
          p.y = world.y;
        }
        // If a ball is far outside (e.g. due to bug), snap to center
        const maxDist = OCTAGON_RADIUS * 1.2;
        if (Math.abs(p.x - cx) > maxDist || Math.abs(p.y - cy) > maxDist) {
          p.x = cx;
          p.y = cy;
          p.vx = (Math.random() - 0.5) * 2;
          p.vy = (Math.random() - 0.5) * 2;
        }
      }
      // draw particles
      for (const p of particles) {
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
          const a = particles[i],
            b = particles[j];
          const dx = a.x - b.x,
            dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 60) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = a.color;
            ctx.globalAlpha = 0.2;
            ctx.lineWidth = 4 - dist / 20;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }
      requestAnimationFrame(animate);
    }
    animate();
    return () => {
      running = false;
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>💧 Liquid Gravity</h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>
        A mesmerizing simulation of liquid particles under gravity. Try clicking to add a splash!
      </p>
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
        onClick={(e) => {
          const rect = canvasRef.current!.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          // Add a splash of new particles, only if inside the octagon (use local frame)
          const cx = WIDTH / 2;
          const cy = HEIGHT / 2;
          const angle = octagonAngleRef.current;
          // Transform click to local frame
          const local = rotatePoint(x, y, cx, cy, -angle);
          const vertsLocal = getOctagonVertices(cx, cy, OCTAGON_RADIUS, 0);
          if (isInsideOctagon(local.x, local.y, vertsLocal)) {
            for (let i = 0; i < 10; i++) {
              const theta = Math.random() * Math.PI * 2;
              const speed = 4 + Math.random() * 2;
              // Velocity in local frame
              const vxLocal = Math.cos(theta) * speed;
              const vyLocal = Math.sin(theta) * speed;
              // Rotate velocity to world frame
              const vWorld = rotateVector(vxLocal, vyLocal, angle);
              // Place particle at click in world frame
              particles.push({
                x,
                y,
                vx: vWorld.vx,
                vy: vWorld.vy,
                r: 8 + Math.random() * 8,
                color: randomColor(),
              });
            }
          }
        }}
      />
    </div>
  );
};

export default LiquidGravity;
