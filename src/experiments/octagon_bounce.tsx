import React, { useRef, useEffect, useState } from 'react';

const CANVAS_SIZE = 600;
const WIDTH = CANVAS_SIZE;
const HEIGHT = CANVAS_SIZE;
const OCTAGON_SIDES = 8;
const OCTAGON_RADIUS = WIDTH * 0.45;
const BALL_COUNT = 20;
const WALL_DRAG_FACTOR = 0.7; // 0 = no drag, 1 = full wall tangential velocity transfer

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

function pointToEdgeDistance(px: number, py: number, verts: {x: number, y: number}[]) {
  let minDist = Infinity;
  for (let i = 0; i < verts.length; i++) {
    const a = verts[i];
    const b = verts[(i + 1) % verts.length];
    const ex = b.x - a.x;
    const ey = b.y - a.y;
    const nx = ey;
    const ny = -ex;
    const apx = px - a.x;
    const apy = py - a.y;
    const edgeLen = Math.sqrt(ex*ex + ey*ey);
    const dist = (apx * nx + apy * ny) / edgeLen;
    if (dist < minDist) minDist = dist;
  }
  return minDist;
}

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
function rotateVector(vx: number, vy: number, angle: number) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    vx: vx * cos - vy * sin,
    vy: vx * sin + vy * cos,
  };
}

// Returns the distance from the center to the edge of a regular polygon at angle theta
function polygonEdgeDistance(radius: number, sides: number, theta: number) {
  // theta: angle from center to point (in local frame)
  const sector = Math.PI * 2 / sides;
  const halfSector = sector / 2;
  // Find the angle to the nearest edge
  const angleToEdge = halfSector - Math.abs(((theta + halfSector) % sector) - halfSector);
  return radius * Math.cos(halfSector) / Math.cos(angleToEdge);
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
}

const OctagonBounce: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const balls = useRef<Ball[]>([]);
  const angleRef = useRef(0);
  const [spinSpeed, setSpinSpeed] = useState(0.01);
  const [_, setRerender] = useState(0); // for UI update after adding balls

  function addBall() {
    const cx = WIDTH / 2;
    const cy = HEIGHT / 2;
    let tries = 0;
    while (tries < 100) {
      const theta = Math.random() * Math.PI * 2;
      const rad = Math.random() * (OCTAGON_RADIUS - 20);
      const x = cx + Math.cos(theta) * rad;
      const y = cy + Math.sin(theta) * rad;
      // Check not overlapping any other ball
      let overlap = false;
      for (const b of balls.current) {
        const dx = b.x - x;
        const dy = b.y - y;
        if (Math.sqrt(dx*dx + dy*dy) < b.r + 12) {
          overlap = true;
          break;
        }
      }
      if (!overlap) {
        balls.current.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          r: 12,
          color: `hsl(${Math.random()*360},80%,60%)`,
        });
        setRerender(x => x + 1); // force UI update
        break;
      }
      tries++;
    }
  }

  function resetBalls() {
    balls.current = [];
    setRerender(x => x + 1);
  }

  useEffect(() => {
    const cx = WIDTH / 2;
    const cy = HEIGHT / 2;
    if (balls.current.length === 0) {
      let tries = 0;
      while (balls.current.length < BALL_COUNT && tries < BALL_COUNT * 10) {
        const theta = Math.random() * Math.PI * 2;
        const rad = Math.random() * (OCTAGON_RADIUS - 20);
        const localX = cx + Math.cos(theta) * rad;
        const localY = cy + Math.sin(theta) * rad;
        balls.current.push({
          x: localX,
          y: localY,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          r: 12,
          color: `hsl(${Math.random()*360},80%,60%)`,
        });
        tries++;
      }
    }
    const ctx = canvasRef.current?.getContext('2d');
    let running = true;
    function drawOctagon(angle: number) {
      if (!ctx) return;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.beginPath();
      for (let i = 0; i < OCTAGON_SIDES; i++) {
        const theta = (Math.PI * 2 * i) / OCTAGON_SIDES;
        const x = Math.cos(theta) * OCTAGON_RADIUS;
        const y = Math.sin(theta) * OCTAGON_RADIUS;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = '#ffb300';
      ctx.lineWidth = 8;
      ctx.globalAlpha = 0.9;
      ctx.shadowColor = '#ffb30044';
      ctx.shadowBlur = 16;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.restore();
    }
    function animate() {
      if (!running || !ctx) return;
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      angleRef.current += spinSpeed;
      const angle = angleRef.current;
      drawOctagon(angle);
      // --- Ball-Ball Collisions ---
      for (let i = 0; i < balls.current.length; i++) {
        for (let j = i + 1; j < balls.current.length; j++) {
          const a = balls.current[i];
          const b = balls.current[j];
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
      // --- Ball-Wall Collisions ---
      for (const b of balls.current) {
        b.x += b.vx;
        b.y += b.vy;
        // Transform to local frame
        const dx = b.x - cx;
        const dy = b.y - cy;
        const local = rotatePoint(b.x, b.y, cx, cy, -angle);
        const theta = Math.atan2(local.y - cy, local.x - cx);
        const distToCenter = Math.sqrt((local.x - cx) ** 2 + (local.y - cy) ** 2);
        const edgeDist = polygonEdgeDistance(OCTAGON_RADIUS, OCTAGON_SIDES, theta);
        if (distToCenter + b.r > edgeDist) {
          // Ball is outside, reflect velocity
          // Normal is from center to ball in local frame
          let nx = (local.x - cx) / distToCenter;
          let ny = (local.y - cy) / distToCenter;
          // Wall tangential velocity (due to rotation)
          const wallOmega = spinSpeed; // use the actual spin speed
          const wallTangential = wallOmega * edgeDist;
          // Tangent vector (perpendicular to normal)
          const tx = -ny;
          const ty = nx;
          // Wall velocity at collision point (in local frame)
          const wallVx = tx * wallTangential;
          const wallVy = ty * wallTangential;
          // Transform ball velocity to local frame
          const vLocal = rotateVector(b.vx, b.vy, -angle);
          // Relative velocity to wall
          vLocal.vx -= wallVx * WALL_DRAG_FACTOR;
          vLocal.vy -= wallVy * WALL_DRAG_FACTOR;
          // Reflect normal component
          const dot = vLocal.vx * nx + vLocal.vy * ny;
          vLocal.vx -= 2 * dot * nx;
          vLocal.vy -= 2 * dot * ny;
          vLocal.vx *= 0.8;
          vLocal.vy *= 0.8;
          // Add wall tangential velocity back
          vLocal.vx += wallVx * WALL_DRAG_FACTOR;
          vLocal.vy += wallVy * WALL_DRAG_FACTOR;
          // Transform velocity back
          const vWorld = rotateVector(vLocal.vx, vLocal.vy, angle);
          b.vx = vWorld.vx;
          b.vy = vWorld.vy;
          // Move just inside
          const newDist = edgeDist - b.r - 0.5;
          local.x = cx + nx * newDist;
          local.y = cy + ny * newDist;
          const world = rotatePoint(local.x, local.y, cx, cy, angle);
          b.x = world.x;
          b.y = world.y;
        }
      }
      // Draw balls
      for (const b of balls.current) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.globalAlpha = 0.8;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      requestAnimationFrame(animate);
    }
    animate();
    return () => { running = false; };
  }, [spinSpeed]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <h2 style={{ color: '#ffb300', fontWeight: 700, fontSize: 32, margin: '24px 0 8px 0', letterSpacing: 1 }}>Octagon Bounce</h2>
      <div style={{ color: '#fff', fontSize: 16, marginBottom: 8, opacity: 0.8 }}>Balls bouncing inside a spinning octagon. Try adding more balls or increasing the spin speed!</div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={addBall} style={{ padding: '8px 18px', fontSize: 16, borderRadius: 8, background: '#ffb300', color: '#222', border: 'none', cursor: 'pointer', fontWeight: 600, boxShadow: '0 2px 8px #ffb30033' }}>Add Ball</button>
        <button onClick={resetBalls} style={{ padding: '8px 18px', fontSize: 16, borderRadius: 8, background: '#222', color: '#ffb300', border: '2px solid #ffb300', cursor: 'pointer', fontWeight: 600 }}>Reset</button>
        <label style={{ color: '#fff', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
          Spin Speed
          <input
            type="range"
            min="0"
            max="0.1"
            step="0.001"
            value={spinSpeed}
            onChange={e => setSpinSpeed(Number(e.target.value))}
            style={{ marginLeft: 0, verticalAlign: 'middle', accentColor: '#ffb300' }}
          />
          <span style={{ color: '#ffb300', minWidth: 48, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{spinSpeed.toFixed(3)}</span>
        </label>
        <span style={{ color: '#fff', fontSize: 15, marginLeft: 8 }}>Balls: <b style={{ color: '#ffb300' }}>{balls.current.length}</b></span>
      </div>
      <div style={{ width: '100%', maxWidth: CANVAS_SIZE, aspectRatio: '1 / 1', background: 'transparent', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.12)' }}>
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} style={{ width: '100%', height: '100%', background: '#181825', borderRadius: 16, display: 'block' }} />
      </div>
    </div>
  );
};

export default OctagonBounce; 