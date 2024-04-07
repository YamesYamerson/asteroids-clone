// Constants for the canvas and scaling
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const originalWidth = 640; // 10% smaller than 800
const originalHeight = 480; // 10% smaller than 600
let scaleFactorX = canvas.width / originalWidth;
let scaleFactorY = canvas.height / originalHeight;
// Constants for asteroid sizes and points
const ASTEROID_SIZES = {
    LARGE: 40,
    MEDIUM: 20,
    SMALL: 10
};
const asteroidPoints = {
    LARGE: 20,
    MEDIUM: 50,
    SMALL: 100
};
let asteroids = [];
let score = 0;

// Function to resize the canvas and maintain aspect ratio
function resizeCanvas() {
    const maxWidth = 640;  // Define the maximum width
    const maxHeight = 480; // Define the maximum height

    // Calculate the viewport dimensions, subtracting a small amount to account for margins/borders
    let viewportWidth = window.innerWidth - 4;
    let viewportHeight = window.innerHeight - 4;

    // Calculate the aspect ratios
    const gameAspectRatio = originalWidth / originalHeight;
    const viewportAspectRatio = viewportWidth / viewportHeight;

    // Adjust the canvas dimensions while maintaining aspect ratio
    if (viewportAspectRatio > gameAspectRatio) {
        viewportWidth = Math.min(viewportHeight * gameAspectRatio, maxWidth);
    } else {
        viewportHeight = Math.min(viewportWidth / gameAspectRatio, maxHeight);
    }

    // Apply the maximum size constraints
    CANVAS_WIDTH = Math.min(viewportWidth, maxWidth);
    CANVAS_HEIGHT = Math.min(viewportHeight, maxHeight);

    // Set the canvas style dimensions to scale it up within the maximum bounds
    canvas.style.width = CANVAS_WIDTH + 'px';
    canvas.style.height = CANVAS_HEIGHT + 'px';

    // Keep the canvas internal drawing size consistent with the game's original dimensions
    canvas.width = originalWidth;
    canvas.height = originalHeight;

    // Log the new canvas dimensions and scale for debugging
    console.log('Canvas Style Width:', canvas.style.width, 'Canvas Style Height:', canvas.style.height);
    console.log('Canvas Width:', canvas.width, 'Canvas Height:', canvas.height);
}

// Initialize the canvas size and set up the event listener for window resize
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Define the Ship class
class Ship {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.velocity = { x: 0, y: 0 };
        this.thrust = false;
        this.thrustPower = 0.1;
        this.maxSpeed = 5;
        this.bullets = [];
        this.fireCooldown = 500;
        this.fireCooldownTimer = 0;
        this.size = 10; // Assuming the ship is a circle with a radius of 10
    }

    draw() {
        ctx.save();

        // Translate to the ship's logical position, now no need to apply scale factors
        // because the context is already scaled and translated
        ctx.translate(this.x, this.y);

        // Rotate the ship by its current angle
        ctx.rotate(this.angle);

        // Begin path for the ship's shape in its logical dimensions
        ctx.beginPath();
        ctx.moveTo(-10, 10);
        ctx.lineTo(10, 0);
        ctx.lineTo(-10, -10);
        ctx.closePath();

        // Stroke style for the ship
        ctx.strokeStyle = 'white';
        ctx.stroke();

        // Draw thrust flame if the ship is thrusting
        if (this.thrust) {
            ctx.beginPath();
            ctx.moveTo(-10, 0);
            ctx.lineTo(-20, 0);
            ctx.closePath();
            ctx.strokeStyle = 'red';
            ctx.stroke();
        }

        // Restore the context
        ctx.restore();
    }    
    
    update(deltaTime) {
        if (this.thrust) {
            this.velocity.x += Math.cos(this.angle) * this.thrustPower;
            this.velocity.y += Math.sin(this.angle) * this.thrustPower;

            let speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
            if (speed > this.maxSpeed) {
                this.velocity.x *= this.maxSpeed / speed;
                this.velocity.y *= this.maxSpeed / speed;
            }
        }
        // Update the ship's position based on its velocity
        this.x = (this.x + this.velocity.x) % (canvas.width / scaleFactorX);
        this.y = (this.y + this.velocity.y) % (canvas.height / scaleFactorY);
        // Wrap around the game area
        this.wrapAround();
        this.fireCooldownTimer -= deltaTime;
        
    }
    // Add the rotate method to the Ship class
    rotate(dir) {
        const rotateSpeed = 0.1;
        this.angle += dir * rotateSpeed;
    }
    // Add the controlThrust method to the Ship class
    controlThrust(isThrusting) {
        this.thrust = isThrusting;
    }
    // Add the shoot method to the Ship class
    shoot() {
        if (this.fireCooldownTimer <= 0) {
            const bullet = new Bullet(this.x, this.y, this.angle);
            this.bullets.push(bullet);
            this.fireCooldownTimer = this.fireCooldown;
        }
    }

    updateBullets() {
        this.bullets.forEach((bullet, index) => {
            bullet.update();
            if (bullet.x < 0 || bullet.x > canvas.width / scaleFactorX || bullet.y < 0 || bullet.y > canvas.height / scaleFactorY) {
                this.bullets.splice(index, 1);
            }
        });
    }

    wrapAround() {
        if (this.x > originalWidth) this.x = 0;
        else if (this.x < 0) this.x = originalWidth;
    
        if (this.y > originalHeight) this.y = 0;
        else if (this.y < 0) this.y = originalHeight;
    }
    
    
    
}

class Bullet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 6;
        this.radius = 2; // Radius should be in logical units, not scaled units
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        // Ensure the bullet wraps around the game area based on logical dimensions
        this.x = (this.x + originalWidth) % originalWidth;
        this.y = (this.y + originalHeight) % originalHeight;
    }

    draw() {
        ctx.save();
        // Translate to the bullet's position based on logical coordinates
        ctx.translate(this.x, this.y);
        ctx.fillStyle = 'white';

        // Draw the bullet as a circle
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Restore the context's original state
        ctx.restore();
    }
}


class Asteroid {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.velocity = {
            x: Math.random() * 2 - 1,
            y: Math.random() * 2 - 1
        };
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.strokeStyle = 'white';  // Ensure this color is visible
        ctx.fillStyle = 'white';  // Ensure this color is visible
        ctx.stroke();
        ctx.restore();
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // Wrap around logic for the asteroid
        this.x = (this.x + originalWidth) % originalWidth;
        this.y = (this.y + originalHeight) % originalHeight;
    }

    breakApart() {
        const smallerAsteroids = [];
        if (this.size === ASTEROID_SIZES.LARGE) {
            smallerAsteroids.push(new Asteroid(this.x, this.y, ASTEROID_SIZES.MEDIUM));
            smallerAsteroids.push(new Asteroid(this.x, this.y, ASTEROID_SIZES.MEDIUM));
        } else if (this.size === ASTEROID_SIZES.MEDIUM) {
            smallerAsteroids.push(new Asteroid(this.x, this.y, ASTEROID_SIZES.SMALL));
            smallerAsteroids.push(new Asteroid(this.x, this.y, ASTEROID_SIZES.SMALL));
        }
        return smallerAsteroids;
    }
}





// Assuming the Ship and Bullet classes are already defined above

function handleRotateLeftStart(event) {
    event.preventDefault();
    ship.rotate(-1);
}

function handleRotateLeftEnd(event) {
    event.preventDefault();
    ship.rotate(0);
}

function handleRotateRightStart(event) {
    event.preventDefault();
    ship.rotate(1);
}

function handleRotateRightEnd(event) {
    event.preventDefault();
    ship.rotate(0);
}

function handleThrustStart(event) {
    event.preventDefault();
    ship.controlThrust(true);
}

function handleThrustEnd(event) {
    event.preventDefault();
    ship.controlThrust(false);
}

function handleShoot(event) {
    event.preventDefault();
    ship.shoot();
}

function checkCollision(asteroid, bullet) {
    const asteroidSize = getAsteroidSize(asteroid);
    console.log(`Asteroid size: ${asteroidSize}, points: ${asteroidPoints[asteroidSize]}`);
    console.log(`New score: ${score}`);
    const dx = asteroid.x - bullet.x;
    const dy = asteroid.y - bullet.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < asteroid.size + bullet.radius; // Simple circular collision detection
}

function getAsteroidSize(asteroid) {
    if (asteroid.size >= 30) return 'LARGE'; // Example size thresholds
    if (asteroid.size >= 15) return 'MEDIUM';
    return 'SMALL';
}

function updateAsteroids(deltaTime) {
    for (let i = 0; i < asteroids.length; i++) {
        const asteroid = asteroids[i];
        asteroid.update(deltaTime);
        asteroid.draw();

        for (let j = 0; j < ship.bullets.length; j++) {
            const bullet = ship.bullets[j];
            if (checkCollision(asteroid, bullet)) {
                // Update the score based on the asteroid's size category
                const asteroidSize = getAsteroidSize(asteroid);
                score += asteroidPoints[asteroidSize];

                const smallerAsteroids = asteroid.breakApart();
                asteroids.splice(i, 1);
                ship.bullets.splice(j, 1);
                asteroids = asteroids.concat(smallerAsteroids);
                break;
            }
        }
    }
}


function checkShipAsteroidCollision(ship, asteroid) {
    const dx = ship.x - asteroid.x;
    const dy = ship.y - asteroid.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < ship.size + asteroid.size; // Assuming `size` is a property defining the collision radius
}

function initializeAsteroids(num) {
    asteroids = [];  // Assuming asteroids is a global array
    for (let i = 0; i < num; i++) {
        asteroids.push(new Asteroid(
            Math.random() * originalWidth, 
            Math.random() * originalHeight, 
            ASTEROID_SIZES.LARGE
        ));
    }
}

function checkShipAsteroidCollisions() {
    for (let i = 0; i < asteroids.length; i++) {
        const asteroid = asteroids[i];
        if (checkShipAsteroidCollision(ship, asteroid)) {
            handleShipExplosion(ship);
            const smallerAsteroids = asteroid.breakApart();
            asteroids.splice(i, 1); // Remove the original asteroid
            asteroids = asteroids.concat(smallerAsteroids); // Add the smaller asteroids
            respawnShip(ship); // Respawn the ship after the collision
            break; // Assuming only one collision is handled per frame
        }
    }
}

function createExplosion(x, y) {
    const explosionSize = 30; // Maximum size of the explosion
    let currentSize = 1;

    function animateExplosion() {
        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        ctx.arc(0, 0, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = 'orange';
        ctx.fill();
        ctx.restore();

        if (currentSize < explosionSize) {
            currentSize++;
            requestAnimationFrame(animateExplosion);
        }
    }

    animateExplosion();
}


function handleShipExplosion(ship) {
    console.log("Ship exploded!");
    createExplosion(ship.x, ship.y);
    // Consider adding a delay before respawning the ship to allow the explosion effect to show
    setTimeout(() => {
    }, 1000); // Wait for the explosion animation to complete
    respawnShip(ship);

}


function respawnShip(ship) {
    // Place the ship back in the center of the screen
    ship.x = originalWidth / 2;
    ship.y = originalHeight / 2;
    ship.velocity = { x: 0, y: 0 }; // Reset velocity
}

function drawScore() {
    ctx.font = '30px VT323';
    ctx.fillStyle = 'white';
    ctx.fillText(`Score: ${score}`, 10, 30); // Position the score in the top-left corner
}



document.getElementById('leftButton').addEventListener('mousedown', handleRotateLeftStart);
document.getElementById('leftButton').addEventListener('mouseup', handleRotateLeftEnd);
document.getElementById('leftButton').addEventListener('touchstart', handleRotateLeftStart);
document.getElementById('leftButton').addEventListener('touchend', handleRotateLeftEnd);

document.getElementById('rightButton').addEventListener('mousedown', handleRotateRightStart);
document.getElementById('rightButton').addEventListener('mouseup', handleRotateRightEnd);
document.getElementById('rightButton').addEventListener('touchstart', handleRotateRightStart);
document.getElementById('rightButton').addEventListener('touchend', handleRotateRightEnd);

document.getElementById('thrustButton').addEventListener('mousedown', handleThrustStart);
document.getElementById('thrustButton').addEventListener('mouseup', handleThrustEnd);
document.getElementById('thrustButton').addEventListener('touchstart', handleThrustStart);
document.getElementById('thrustButton').addEventListener('touchend', handleThrustEnd);

document.getElementById('shootButton').addEventListener('mousedown', handleShoot);
document.getElementById('shootButton').addEventListener('mouseup', handleShoot);
document.getElementById('shootButton').addEventListener('touchstart', handleShoot);
document.getElementById('shootButton').addEventListener('touchend', handleShoot);

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowLeft':
            ship.rotate(-1);
            e.preventDefault();
            break;
        case 'ArrowRight':
            ship.rotate(1);
            e.preventDefault();
            break;
        case 'ArrowUp':
            ship.controlThrust(true);
            e.preventDefault();
            break;
        case 'ArrowDown':
            // If you have any functionality for ArrowDown, add it here
            e.preventDefault();
            break;
        case ' ':
            ship.shoot();
            e.preventDefault();
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowRight':
            ship.rotate(0);
            e.preventDefault();
            break;
        case 'ArrowUp':
            ship.controlThrust(false);
            e.preventDefault();
            break;
        // Add case for 'ArrowDown' if needed
    }
});


let gameRunning = false;
const ship = new Ship(originalWidth / 2, originalHeight / 2);

function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        initializeAsteroids(5);  // Start with 5 large asteroids, for example
        lastTime = 0;
        requestAnimationFrame(gameLoop);
    }
}

function toggleGame() {
    gameRunning = !gameRunning;
    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('pauseButton').addEventListener('click', toggleGame);




let lastTime = 0;
function gameLoop(timestamp) {
    if (!gameRunning) return;

    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw asteroids
    updateAsteroids(deltaTime);
    checkShipAsteroidCollisions();

    // Update and draw the ship and its bullets
    ship.update(deltaTime);
    ship.wrapAround();
    ship.updateBullets();
    ship.draw();
    ship.bullets.forEach(bullet => bullet.draw());
    drawScore(); // Draw the score on the canvas
    requestAnimationFrame(gameLoop);
}



window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Set the initial scale factors and canvas size
