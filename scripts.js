const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

class Ship {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.velocity = { x: 0, y: 0 };
        this.thrust = false;
        this.thrustPower = 0.1;
        this.bullets = [];
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.beginPath();
        ctx.moveTo(-10, 10); // Left corner
        ctx.lineTo(10, 0); // Nose of the ship
        ctx.lineTo(-10, -10); // Right corner
        ctx.closePath();
        ctx.strokeStyle = 'white';
        ctx.stroke();

        if (this.thrust) {
            ctx.beginPath();
            ctx.moveTo(-10, 0);
            ctx.lineTo(-15, -5);
            ctx.lineTo(-15, 5);
            ctx.closePath();
            ctx.strokeStyle = 'red';
            ctx.stroke();
        }

        ctx.restore();
    }

    update() {
        if (this.thrust) {
            this.velocity.x += Math.cos(this.angle) * this.thrustPower;
            this.velocity.y += Math.sin(this.angle) * this.thrustPower;
        }

        this.x += this.velocity.x;
        this.y += this.velocity.y;

        this.wrapAround();
    }

    rotate(dir) {
        const rotateSpeed = 0.1; // Rotation speed
        this.angle += dir * rotateSpeed;
    }

    controlThrust(isThrusting) {
        this.thrust = isThrusting;
    }

    shoot() {
        const bullet = new Bullet(this.x, this.y, this.angle);
        this.bullets.push(bullet);
    }

    updateBullets() {
        this.bullets.forEach((bullet, index) => {
            bullet.update();
            if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
                this.bullets.splice(index, 1);
            }
        });
    }

    wrapAround() {
        if (this.x > canvas.width) this.x = 0;
        else if (this.x < 0) this.x = canvas.width;

        if (this.y > canvas.height) this.y = 0;
        else if (this.y < 0) this.y = canvas.height;
    }
}

class Bullet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 5;
        this.radius = 2;
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }

    draw() {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        ctx.fill();
    }
}

const ship = new Ship(canvas.width / 2, canvas.height / 2);

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowLeft':
            ship.rotate(-1);
            break;
        case 'ArrowRight':
            ship.rotate(1);
            break;
        case 'ArrowUp':
            ship.controlThrust(true);
            break;
        case ' ':
            ship.shoot();
            break;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp') {
        ship.controlThrust(false);
    }
});

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ship.update();
    ship.updateBullets();
    ship.draw();
    ship.bullets.forEach(bullet => bullet.draw());
    requestAnimationFrame(gameLoop);
}

gameLoop();
