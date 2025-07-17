import React, { useRef, useEffect } from 'react';

const WIDTH = 700;
const HEIGHT = 300;

const MotorcycleGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let running = true;
    let x = 100, y = HEIGHT - 40, vx = 0, vy = 0, angle = 0, onGround = true;
    let keys: Record<string, boolean> = {};
    let ground = Array.from({ length: WIDTH }, (_, i) => HEIGHT - 40 - Math.sin(i/60) * 20);
    function drawBike() {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = '#222';
      ctx.fillRect(-30, -10, 60, 20);
      ctx.beginPath();
      ctx.arc(-20, 12, 12, 0, Math.PI * 2);
      ctx.arc(20, 12, 12, 0, Math.PI * 2);
      ctx.fillStyle = '#ffb300';
      ctx.fill();
      ctx.restore();
    }
    function animate() {
      if (!running) return;
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      // Draw ground
      ctx.beginPath();
      ctx.moveTo(0, ground[0]);
      for (let i = 1; i < WIDTH; i++) ctx.lineTo(i, ground[i]);
      ctx.lineTo(WIDTH, HEIGHT);
      ctx.lineTo(0, HEIGHT);
      ctx.closePath();
      ctx.fillStyle = '#8bc34a';
      ctx.fill();
      // Physics
      if (keys['ArrowRight']) vx += 0.2;
      if (keys['ArrowLeft']) vx -= 0.2;
      vx *= 0.98;
      x += vx;
      if (x < 0) x = 0;
      if (x > WIDTH) x = WIDTH;
      // Gravity
      vy += 0.5;
      y += vy;
      // Ground collision
      let groundY = ground[Math.round(x)] || HEIGHT - 40;
      if (y > groundY) {
        y = groundY;
        vy = 0;
        onGround = true;
      } else {
        onGround = false;
      }
      // Jump
      if (onGround && keys[' ']) {
        vy = -10;
      }
      // Angle
      angle = vx * 0.03;
      drawBike();
      requestAnimationFrame(animate);
    }
    animate();
    function onKey(e: KeyboardEvent) {
      keys[e.key] = e.type === 'keydown';
    }
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    return () => {
      running = false;
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>🏍️ Motorcycle Game</h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>Use Left/Right arrows to move, Space to jump!</p>
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} style={{ borderRadius: 16, background: 'var(--color-surface)', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', margin: 16 }} />
    </div>
  );
};

export default MotorcycleGame; 