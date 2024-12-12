const BAUD_RATE = 9600;

let port, connectBtn;
let block, obstacles = [], gameOver = false, score = 0;
let jumpThreshold = -5; // Set a threshold for jumping based on sensor difference

function setup() {
    setupSerial(); // Setup serial connection

    createCanvas(windowWidth, windowHeight);
    block = new Block();
    obstacles.push(new Obstacle(width));
}

function draw() {
    if (!checkPort()) return; // Check if the port is open and manage connection

    background(220);

    let str = port.readUntil("\n"); // Read serial data
    if (str.length > 0) {
        const sensorValue = Number(str.trim()); // Convert to number
        if (sensorValue < jumpThreshold) {
            block.jump(abs(sensorValue)); // Use the magnitude of sensor value as the jump force
        }
    }

    block.update();
    block.show();

    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].update();
        obstacles[i].show();
        
        if (obstacles[i].hits(block)) {
            gameOver = true;
            noLoop(); // Stop the game loop if collision occurs
        }

        if (obstacles[i].offscreen()) {
            obstacles.splice(i, 1);
            let newObstacle = new Obstacle(width);
            obstacles.push(newObstacle); // Add new obstacles at random intervals
            if (!gameOver) score++;
        }
    }

    displayScore();
}

function displayScore() {
    fill(0);
    textSize(24);
    text(`Score: ${score}`, 10, 30);
    if (gameOver) {
        fill(255, 0, 0);
        textSize(32);
        textAlign(CENTER, CENTER);
        text(`Game Over! Score: ${score}. Click to restart.`, width / 2, height / 2);
    }
}

function mousePressed() {
    if (gameOver) {
        gameOver = false;
        obstacles = [];
        obstacles.push(new Obstacle(width));
        block.reset();
        score = 0;
        loop(); // Restart the drawing loop
    }
}

class Block {
    constructor() {
        this.y = height - 50;
        this.x = 50;
        this.width = 50;
        this.height = 50;
        this.velocity = 0;
        this.gravity = 2;
    }

    show() {
        fill(255);
        rect(this.x, this.y, this.width, this.height);
    }

    jump(force) {
        if (this.y >= height - this.height) { // Only jump if on the ground
            this.velocity -= force; // Apply the jump force
        }
    }

    update() {
        this.velocity += this.gravity;
        this.y += this.velocity;

        if (this.y > height - this.height) {
            this.y = height - this.height;
            this.velocity = 0;
        }
    }

    reset() {
        this.y = height - 50;
        this.velocity = 0;
    }
}

class Obstacle {
    constructor(x) {
        this.x = x;
        this.y = height - 50;
        this.width = 20;
        this.height = 50;
        this.speed = 5;
    }

    show() {
        fill(0);
        rect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.x -= this.speed;
    }

    offscreen() {
        return this.x < -this.width;
    }

    hits(block) {
        return (
            block.x < this.x + this.width &&
            block.x + block.width > this.x &&
            block.y < this.y + this.height &&
            block.y + block.height > this.y
        );
    }
}

function setupSerial() {
    port = createSerial();

    let usedPorts = usedSerialPorts();
    if (usedPorts.length > 0) {
        port.open(usedPorts[0], BAUD_RATE);
    }

    connectBtn = createButton("Connect to Arduino");
    connectBtn.position(5, 5);
    connectBtn.mouseClicked(onConnectButtonClicked);
}

function checkPort() {
    if (!port.opened()) {
        connectBtn.html("Connect to Arduino");
        background("gray");
        return false;
    } else {
        connectBtn.html("Disconnect");
        return true;
    }
}

function onConnectButtonClicked() {
    if (!port.opened()) {
        port.open(BAUD_RATE);
    } else {
        port.close();
    }
}



