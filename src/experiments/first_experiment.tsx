import React, { useRef, useEffect, useState } from 'react';

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  bounce: number;
  friction: number;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const randomColor = () => `hsl(${Math.random() * 360}, 70%, 60%)`;

const createBall = (x: number, y: number): Ball => ({
  x,
  y,
  vx: (Math.random() - 0.5) * 4,
  vy: 0,
  radius: Math.random() * 15 + 10,
  color: randomColor(),
  bounce: 0.8,
  friction: 0.99,
});

const GravityBallsGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [gravityEnabled, setGravityEnabled] = useState(true);
  const [ballCount, setBallCount] = useState(0);
  const [gravityStatus, setGravityStatus] = useState('Gravity: ON');
  const gravity = 0.5;
  const animationId = useRef<number>(undefined);

  // Ball physics and animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;
    const frameBalls = balls.slice();

    function updateBall(ball: Ball) {
      if (gravityEnabled) {
        ball.vy += gravity;
      }
      ball.x += ball.vx;
      ball.y += ball.vy;
      // Bounce off walls
      if (ball.x + ball.radius > CANVAS_WIDTH) {
        ball.x = CANVAS_WIDTH - ball.radius;
        ball.vx *= -ball.bounce;
      }
      if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
        ball.vx *= -ball.bounce;
      }
      // Bounce off floor and ceiling
      if (ball.y + ball.radius > CANVAS_HEIGHT) {
        ball.y = CANVAS_HEIGHT - ball.radius;
        ball.vy *= -ball.bounce;
        ball.vx *= ball.friction;
      }
      if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy *= -ball.bounce;
      }
    }

    function checkCollision(a: Ball, b: Ball) {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = a.radius + b.radius;
      return distance < minDistance;
    }

    function resolveCollision(a: Ball, b: Ball) {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = a.radius + b.radius;
      if (distance < minDistance) {
        // Separate the balls
        const overlap = minDistance - distance;
        const separationX = (dx / distance) * overlap * 0.5;
        const separationY = (dy / distance) * overlap * 0.5;
        a.x -= separationX;
        a.y -= separationY;
        b.x += separationX;
        b.y += separationY;
        // Calculate collision response
        const normalX = dx / distance;
        const normalY = dy / distance;
        // Relative velocity
        const relativeVelocityX = b.vx - a.vx;
        const relativeVelocityY = b.vy - a.vy;
        // Relative velocity along normal
        const velocityAlongNormal = relativeVelocityX * normalX + relativeVelocityY * normalY;
        if (velocityAlongNormal > 0) return;
        // Calculate restitution (bounciness)
        const restitution = Math.min(a.bounce, b.bounce);
        // Calculate impulse scalar
        const impulse = -(1 + restitution) * velocityAlongNormal;
        const totalMass = a.radius + b.radius;
        const impulseScalar = impulse / totalMass;
        // Apply impulse
        const impulseX = impulseScalar * normalX;
        const impulseY = impulseScalar * normalY;
        a.vx -= impulseX * b.radius / totalMass;
        a.vy -= impulseY * b.radius / totalMass;
        b.vx += impulseX * a.radius / totalMass;
        b.vy += impulseY * a.radius / totalMass;
      }
    }

    function drawBall(ball: Ball) {
      if (!ctx) return;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = ball.color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    function animate() {
      if (!running || !ctx) return;
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      // Update all balls
      frameBalls.forEach(updateBall);
      // Check collisions
      for (let i = 0; i < frameBalls.length; i++) {
        for (let j = i + 1; j < frameBalls.length; j++) {
          if (checkCollision(frameBalls[i], frameBalls[j])) {
            resolveCollision(frameBalls[i], frameBalls[j]);
          }
        }
      }
      // Draw all balls
      frameBalls.forEach(drawBall);
      animationId.current = requestAnimationFrame(animate);
    }
    animate();
    return () => {
      running = false;
      if (animationId.current) cancelAnimationFrame(animationId.current);
    };
  }, [balls, gravityEnabled]);

  // Update stats
  useEffect(() => {
    setBallCount(balls.length);
    setGravityStatus(`Gravity: ${gravityEnabled ? 'ON' : 'OFF'}`);
  }, [balls, gravityEnabled]);

  // Canvas click handler
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setBalls((prev) => [...prev, createBall(x, y)]);
  };

  // Controls
  const clearBalls = () => setBalls([]);
  const toggleGravity = () => setGravityEnabled((g) => !g);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <h1>🌍 Gravity Balls Game</h1>
      <div style={{ color: 'var(--color-text)', textAlign: 'center', marginBottom: 20, fontSize: 18 }}>
        Click anywhere on the canvas to drop balls!<br />
        Watch them bounce with realistic physics
      </div>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{ border: '3px solid white', borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.3)', cursor: 'crosshair', background: 'var(--color-surface)' }}
        onClick={handleCanvasClick}
      />
      <div style={{ marginTop: 15, display: 'flex', gap: 10 }}>
        <button onClick={clearBalls} style={{ padding: '10px 20px', fontSize: 16, border: 'none', borderRadius: 5, background: '#ff6b6b', color: 'white', cursor: 'pointer', transition: 'background 0.3s' }}>
          Clear All Balls
        </button>
        <button onClick={toggleGravity} style={{ padding: '10px 20px', fontSize: 16, border: 'none', borderRadius: 5, background: '#6bafff', color: 'white', cursor: 'pointer', transition: 'background 0.3s' }}>
          Toggle Gravity
        </button>
      </div>
      <div style={{ color: 'var(--color-text)', marginTop: 10, fontSize: 18 }}>
        <span>Balls: {ballCount}</span> | <span>{gravityStatus}</span>
      </div>
    </div>
  );
};

export default GravityBallsGame; 