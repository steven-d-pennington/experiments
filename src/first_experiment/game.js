const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let balls = [];
let gravity = 0.5;
let gravityEnabled = true;
let animationId;

class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = 0;
        this.radius = Math.random() * 15 + 10;
        this.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
        this.bounce = 0.8;
        this.friction = 0.99;
    }

    update() {
        if (gravityEnabled) {
            this.vy += gravity;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls
        if (this.x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius;
            this.vx *= -this.bounce;
        }
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx *= -this.bounce;
        }

        // Bounce off floor and ceiling
        if (this.y + this.radius > canvas.height) {
            this.y = canvas.height - this.radius;
            this.vy *= -this.bounce;
            this.vx *= this.friction;
        }
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.vy *= -this.bounce;
        }
    }

    checkCollision(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = this.radius + other.radius;

        return distance < minDistance;
    }

    resolveCollision(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = this.radius + other.radius;

        if (distance < minDistance) {
            // Separate the balls
            const overlap = minDistance - distance;
            const separationX = (dx / distance) * overlap * 0.5;
            const separationY = (dy / distance) * overlap * 0.5;

            this.x -= separationX;
            this.y -= separationY;
            other.x += separationX;
            other.y += separationY;

            // Calculate collision response
            const normalX = dx / distance;
            const normalY = dy / distance;

            // Relative velocity
            const relativeVelocityX = other.vx - this.vx;
            const relativeVelocityY = other.vy - this.vy;

            // Relative velocity along normal
            const velocityAlongNormal = relativeVelocityX * normalX + relativeVelocityY * normalY;

            // Don't resolve if velocities are separating
            if (velocityAlongNormal > 0) return;

            // Calculate restitution (bounciness)
            const restitution = Math.min(this.bounce, other.bounce);

            // Calculate impulse scalar
            const impulse = -(1 + restitution) * velocityAlongNormal;
            const totalMass = this.radius + other.radius; // Using radius as mass approximation
            const impulseScalar = impulse / totalMass;

            // Apply impulse
            const impulseX = impulseScalar * normalX;
            const impulseY = impulseScalar * normalY;

            this.vx -= impulseX * other.radius / totalMass;
            this.vy -= impulseY * other.radius / totalMass;
            other.vx += impulseX * this.radius / totalMass;
            other.vy += impulseY * this.radius / totalMass;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update all balls
    balls.forEach(ball => {
        ball.update();
    });

    // Check collisions between all pairs of balls
    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            if (balls[i].checkCollision(balls[j])) {
                balls[i].resolveCollision(balls[j]);
            }
        }
    }

    // Draw all balls
    balls.forEach(ball => {
        ball.draw();
    });

    animationId = requestAnimationFrame(animate);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    balls.push(new Ball(x, y));
    updateStats();
});

function clearBalls() {
    balls = [];
    updateStats();
}

function toggleGravity() {
    gravityEnabled = !gravityEnabled;
    document.getElementById('gravityStatus').textContent =
        `Gravity: ${gravityEnabled ? 'ON' : 'OFF'}`;
}

function updateStats() {
    document.getElementById('ballCount').textContent = `Balls: ${balls.length}`;
}

// Start the animation
animate();