// user config
const SPACESHIP_SPEED = 5         // spaceship movement speed
const ASTEROID_INITIAL = 5        // initial number of asteroids
const ASTEROID_SPEED = 10         // random from 0 to ASTEROID_SPEED
const ASTEROID_SCALE = [0.5, 2]   // random object scale from range
const ASTEROID_FREQUENCY = 500    // create new asteroid each ASTEROID_FREQUENCY milliseconds


// global constants
const SPACESHIP_SCALE = 2;
const SPACESHIP_WIDTH = 52;
const SPACESHIP_HEIGHT = 36;
const SPACESHIP_WIDTH_SCALED = SPACESHIP_SCALE * SPACESHIP_WIDTH;
const SPACESHIP_HEIGHT_SCALED = SPACESHIP_SCALE * SPACESHIP_HEIGHT;

// set up canvas
const canvas = document.getElementById("main-canvas");
canvas.width = window.screen.availWidth;
canvas.height = window.screen.availHeight;

// set up context
const ctx = canvas.getContext('2d');

// global font settings
ctx.font = "30px ModeSeven";
ctx.fillStyle = "#FFFFFF";

// asteroid class
function Asteroid(width, height, speed_x, speed_y, x, y, scale) {
    this.x = x;
    this.y = y;
    this.scale = scale;
    this.width = width;
    this.height = height;
    this.speed_x = speed_x;
    this.speed_y = speed_y;
    this.has_appeared = false;
    this.updateObject = function(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        let img = new Image();
        img.src = "assets/asteroid.png";
        ctx.drawImage(img, this.width, this.height, this.width * this.scale, this.height * this.scale);
        ctx.restore();
    }
    this.updatePosition = function() {
        this.x += this.speed_x;
        this.y += this.speed_y;
    }
}

// initialize spaceship
let SPACESHIP_X = canvas.width/2 - SPACESHIP_WIDTH_SCALED;
let SPACESHIP_Y = canvas.height/2 - SPACESHIP_HEIGHT_SCALED * SPACESHIP_HEIGHT/SPACESHIP_WIDTH;
let SPACESHIP = new Image();
SPACESHIP.src = 'assets/spaceship.png';
SPACESHIP.onload = () => window.requestAnimationFrame(mainLoop);

// current time counter
let TOTAL_CURRENT_TIME = "";

// add listeners for key on and off
let ALL_KEYS = {};  // dictionary for checking keys if active
window.addEventListener('keydown', (e) => ALL_KEYS[e.key] = true);
window.addEventListener('keyup', (e) => ALL_KEYS[e.key] = false);

function renderSpaceship() {
    ctx.save();
    ctx.translate(SPACESHIP_X, SPACESHIP_Y);
    ctx.drawImage(SPACESHIP, SPACESHIP_WIDTH, SPACESHIP_HEIGHT, SPACESHIP_WIDTH_SCALED, SPACESHIP_HEIGHT_SCALED);
    ctx.restore();
}

// function for updating spaceship position
function moveSpaceship(move_x, move_y) {
    if (SPACESHIP_X + SPACESHIP_WIDTH_SCALED + move_x < canvas.width &&
        SPACESHIP_X + move_x > 0) {
        SPACESHIP_X += move_x;
    }
    if (SPACESHIP_Y + SPACESHIP_HEIGHT_SCALED + move_y < canvas.height &&
        SPACESHIP_Y + move_y > 0) {
        SPACESHIP_Y += move_y;
    }
}

// function for detecting spaceship's collision with given asteroid object
function checkCollision(asteroid) {
    return (SPACESHIP_X + SPACESHIP_WIDTH >= asteroid.x &&
            asteroid.x + asteroid.width >= SPACESHIP_X &&
            SPACESHIP_Y + SPACESHIP_HEIGHT >= asteroid.y &&
            asteroid.y + asteroid.height >= SPACESHIP_Y);
}

function renderBestTime() {
    let time = localStorage.getItem("bestTime");
    if (!time) {
        time = "00:00.000";
        localStorage.setItem("bestTime", time);
    }
    const text = "Best time: " + time;
    ctx.fillText(text, canvas.width - ctx.measureText(text).width - 25, 50);
}

function renderCurrentTime(time) {
    const text = "Time: " + time;
    ctx.fillText(text, canvas.width - ctx.measureText(text).width - 25, 100);
}

function renderNewBestTime() {
    const text = "New best time!";
    ctx.fillText(text, canvas.width/2 - ctx.measureText(text).width/2, canvas.height/3);
}

function checkBestTime() {
    const bestTime = localStorage.getItem("bestTime");
    if (bestTime) {
        const splitBestTime = bestTime.split(":")
        const secondHalf = splitBestTime[1].split(".")
        const totalTime = +splitBestTime[0] * 60 * 1000 + +secondHalf[0] * 1000 + +secondHalf[1];

        const currentTime = TOTAL_CURRENT_TIME.split(":")
        const secondHalfCurr = currentTime[1].split(".")
        const totalCurrentTime = +currentTime[0] * 60 * 1000 + +secondHalfCurr[0] * 1000 + +secondHalfCurr[1];

        if (totalCurrentTime > totalTime) {
            localStorage.setItem("bestTime", TOTAL_CURRENT_TIME);
        }
    }
}

function renderFailed() {
    const text = "You failed! Press R to restart.";
    ctx.fillText(text, canvas.width/2 - ctx.measureText(text).width/2, canvas.height/2);
}

// helper function for creating time string
function padNumber(num, length = 2) {
    return num.toString().padStart(length, '0');
}


// creates asteroid object with random values for position, speed, scale and movement direction
function createAsteroid() {
    let width = 100;
    let height = 81;
    let x_pos = 0, y_pos = 0, speed_x = 0, speed_y = 0;
    const scale = Math.random() * (ASTEROID_SCALE[1] - ASTEROID_SCALE[0]) + ASTEROID_SCALE[0];
    // choose random direction from which the asteroid will start moving towards screen
    const rand = Math.floor(Math.random() * 4 + 1);
    switch(rand) {
        case 1: // left
            x_pos = -width * scale*2;
            y_pos = Math.random() * (canvas.height + 100) - 50;
            speed_y = Math.random() * ASTEROID_SPEED - ASTEROID_SPEED/2;
            speed_x = Math.abs(speed_y) * 2;
            return new Asteroid(width, height, speed_x, speed_y, x_pos, y_pos, scale);
        case 2: // up
            x_pos = Math.random() * (canvas.width + 100) - 50;
            y_pos = -height * scale*2;
            speed_x = Math.random() * ASTEROID_SPEED - ASTEROID_SPEED/2;
            speed_y = Math.abs(speed_x) * 2;
            return new Asteroid(width, height, speed_x, speed_y, x_pos, y_pos, scale);
        case 3: // down
            x_pos = Math.random() * (canvas.width + 100) - 50;
            y_pos = canvas.height + height * scale*2;
            speed_x = Math.random() * ASTEROID_SPEED - ASTEROID_SPEED/2;
            speed_y = -Math.abs(speed_x) * 2;
            return new Asteroid(width, height, speed_x, speed_y, x_pos, y_pos, scale);
        case 4: // right
            x_pos = canvas.width + width * scale*2;
            y_pos = Math.random() * (canvas.height + 100) - 50;
            speed_y = Math.random() * ASTEROID_SPEED - ASTEROID_SPEED/2;
            speed_x = -Math.abs(speed_y) * 2;
            return new Asteroid(width, height, speed_x, speed_y, x_pos, y_pos, scale);
    }
}

// renders when player collides with asteroid
function failedLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (ALL_KEYS.r) {
        window.location.reload();
    }
    renderFailed();
    renderBestTime();
    renderCurrentTime(TOTAL_CURRENT_TIME);
    if (localStorage.getItem("bestTime") === TOTAL_CURRENT_TIME) {
        renderNewBestTime();
    }
    window.requestAnimationFrame(failedLoop);
}

// game constants
let INITIAL_ASTEROIDS = false;
let START_TIME = Date.now();
let GAME_RUNNING = true;
let TIME_DIFF = 0;

// list of all active asteroids
const asteroids = [];

// main game loop
function mainLoop() {
    // clear the whole canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // if the game is over, end this loop and check if current time is greater than best time
    if (!GAME_RUNNING) {
        checkBestTime()
        return;
    }

    // generate first ASTEROID_INITIAL asteroids
    if (!INITIAL_ASTEROIDS) {
        for (let i = 0; i < ASTEROID_INITIAL; i++) {
            asteroids.push(createAsteroid())
        }
        INITIAL_ASTEROIDS = true;
    }

    // current time counter
    const currentTime = Date.now();
    const elapsedTime = currentTime - START_TIME;
    const milliseconds = elapsedTime % 1000;
    const seconds = Math.floor(elapsedTime / 1000) % 60;
    const minutes = Math.floor(elapsedTime / (1000 * 60));
    const formattedTime = `${padNumber(minutes)}:${padNumber(seconds)}.${padNumber(milliseconds, 3)}`;
    TOTAL_CURRENT_TIME = formattedTime;

    // check if dictionary contains true values for certain keys for moving spaceship and restart
    if (ALL_KEYS.ArrowUp) moveSpaceship(0, -SPACESHIP_SPEED);
    else if (ALL_KEYS.ArrowDown) moveSpaceship(0, SPACESHIP_SPEED);
    if (ALL_KEYS.ArrowLeft) moveSpaceship(-SPACESHIP_SPEED, 0);
    else if (ALL_KEYS.ArrowRight) moveSpaceship(SPACESHIP_SPEED, 0);
    if (ALL_KEYS.r) window.location.reload();

    // go through all current asteroids
    for (let index = asteroids.length - 1; index >= 0; index--) {
        const asteroid = asteroids[index];
        asteroid.updateObject(ctx);
        asteroid.updatePosition(ctx);

        // delete asteroid if it has appeared on screen before
        // and if it moved out of screen sometime afterward
        if (asteroid.has_appeared) {
            if (asteroid.x + asteroid.width * asteroid.scale * 2 < 0 ||
                asteroid.x - asteroid.width * asteroid.scale * 2 > canvas.width ||
                asteroid.y - asteroid.height * asteroid.scale * 2 > canvas.height ||
                asteroid.y + asteroid.height * asteroid.scale * 2 < 0) {
                asteroids.splice(index, 1)
            }
        }
        // else check if it entered the screen
        else {
            if (asteroid.x + asteroid.width > 0 &&
                asteroid.x - asteroid.width < canvas.width &&
                asteroid.y - asteroid.height < canvas.height &&
                asteroid.y + asteroid.height > 0) {
                asteroid.has_appeared = true;
            }
        }
        // check collision with spaceship, quit main loop if true
        if (checkCollision(asteroid)) {
            GAME_RUNNING = false;
            window.requestAnimationFrame(failedLoop);
        }
    }

    // when ASTEROID_FREQUENCY milliseconds have passed,
    // create new asteroid and update counter
    if ((elapsedTime - TIME_DIFF) >= ASTEROID_FREQUENCY) {
        asteroids.push(createAsteroid());
        TIME_DIFF = elapsedTime;
    }

    // render all other game objects
    renderSpaceship();
    renderBestTime();
    renderCurrentTime(formattedTime);

    // repeat main game loop
    window.requestAnimationFrame(mainLoop);
}