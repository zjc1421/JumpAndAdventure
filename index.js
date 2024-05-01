const BAUD_RATE = 9600; // This should match the baud rate in your Arduino sketch

let port, connectBtn;
let block, obstacles = [], gameOver = false, score = 0;
let jumpThreshold = -5; // Set a threshold for jumping based on sensor difference

function setup() {
    setupSerial(); // Setup serial connection

    createCanvas(windowWidth, windowHeight);
    block = new Block();
    obstacles.push(new Obstacle());
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

    block.show();
    block.update();

    obstacles.forEach((obstacle, index) => {
        obstacle.show();
        obstacle.update();

        if (obstacle.hits(block)) {
            gameOver = true;
            noLoop();
        }

        if (obstacle.offscreen()) {
            obstacles.splice(index, 1);
            obstacles.push(new Obstacle());
            if (!gameOver) score++;
        }
    });

    if (gameOver) {
        fill(255, 0, 0);
        textSize(32);
        textAlign(CENTER, CENTER);
        text(`Game Over! Score: ${score}. Click to restart.`, width / 2, height / 2);
    }

    fill(0);
    textSize(24);
    text(`Score: ${score}`, 10, 30);
}

function mousePressed() {
    if (gameOver) {
        gameOver = false;
        obstacles = [];
        block = new Block();
        score = 0;
        loop();
    }
}

class Block {
    constructor() {
        this.y = height - 20;
        this.velocity = 0;
        this.gravity = 1;
    }

    show() {
        fill(255);
        rect(50, this.y, 50, 50);
    }

    jump(force) {
        if (this.y >= height - 50) { // Only jump if on the ground
            this.velocity -= force; // Apply the jump force
        }
    }

    update() {
        this.velocity += this.gravity;
        this.y += this.velocity;

        if (this.y > height - 50) {
            this.y = height - 50;
            this.velocity = 0;
        }
    }
}

class Obstacle {
    constructor() {
        this.x = width;
        this.y = height - 50;
        this.width = 20;
        this.speed = 5;
    }

    show() {
        fill(0);
        rect(this.x, this.y, this.width, 50);
    }

    update() {
        this.x -= this.speed;
    }

    offscreen() {
        return this.x < -this.width;
    }

    hits(block) {
        return block.y + 50 >= this.y && block.x + 50 > this.x && block.x < this.x + this.width;
    }
}

// Serial communication functions
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
