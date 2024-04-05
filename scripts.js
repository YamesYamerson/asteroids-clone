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
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.beginPath();
        ctx.moveTo(-10, 10);
        ctx.lineTo(10, 0);
        ctx.lineTo(-10, -10);
        ctx.closePath();
        ctx.strokeStyle = 'white';
        ctx.stroke();

        if (this.thrust) {
            ctx.beginPath();
            ctx.moveTo(-10, 0);
            ctx.lineTo(-15, -5);
            ctx.lineTo(-10, 0);
            ctx.lineTo(-15, 5);
            ctx.closePath();
            ctx.strokeStyle = 'red';
            ctx.stroke();
        }

        ctx.restore();
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        if (this.thrust) {
            this.velocity.x += Math.cos(this.angle) * this.thrustPower;
            this.velocity.y += Math.sin(this.angle) * this.thrustPower;
        }

        this.wrapAround();
    }

    rotate(dir) {
        const rotateSpeed = 0.1; // Adjust as needed
        this.angle += dir * rotateSpeed;
    }

    controlThrust(isThrusting) {
        this.thrust = isThrusting;
    }

    wrapAround() {
        if (this.x > canvas.width) {
            this.x = 0;
        } else if (this.x < 0) {
            this.x = canvas.width;
        }

        if (this.y > canvas.height) {
            this.y = 0;
        } else if (this.y < 0) {
            this.y = canvas.height;
        }
    }
}


const ship = new Ship(canvas.width / 2, canvas.height / 2);

// Event listeners for ship control
document.addEventListener('keydown', (e) => {
    switch (e.code) {
        case 'ArrowLeft':
            ship.rotate(-1);
            break;
        case 'ArrowRight':
            ship.rotate(1);
            break;
        case 'ArrowUp':
            ship.controlThrust(true);
            break;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowUp') {
        ship.controlThrust(false);
    }
});

// Main game loop remains unchanged
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ship.update();
    ship.draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
