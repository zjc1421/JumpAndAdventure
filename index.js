const BAUD_RATE = 9600; // This should match the baud rate in your Arduino sketch
const barWidth = 5;

let port, connectBtn, barX; // Declare global variables

// Sprite variables
let spriteY, spriteVY, spriteSize;

function setup() {
  setupSerial(); // Run our serial setup function (below)

  createCanvas(windowWidth, windowHeight); // Create a canvas that is the size of our browser window
  background("gray"); // Set the background to gray initially

  barX = 0; // Initialize the bar's x position to 0 (left side of screen)
  spriteY = windowHeight - 50; // Initial position of the sprite
  spriteVY = 0; // Initial vertical velocity of the sprite
  spriteSize = 20; // Size of the sprite
  noStroke(); // Turn off stroke
}

function draw() {
  const portIsOpen = checkPort(); // Check whether the port is open (see checkPort function below)
  if (!portIsOpen) return; // If the port is not open, exit the draw loop

  let str = port.readUntil("\n"); // Read from the port until the newline
  if (str.length == 0) return; // If we didn't read anything, return

  // trim the whitespace (the newline) and convert the string to a number
  const reading = Number(str.trim());

  // Map the reading to the jump height
  const jumpHeight = map(reading, 0, 1023, 10, 200); // Adjust these values to change the jump height range

  // Full-height purple bar to erase previous bar
  fill("purple");
  rect(barX * barWidth, 0, barWidth, windowHeight);

  // Draw the sprite
  fill("blue");
  rect(windowWidth / 2 - spriteSize / 2, spriteY, spriteSize, spriteSize);

  // Update sprite position based on jump height
  if (spriteY >= windowHeight - spriteSize - jumpHeight && spriteVY >= 0) {
    spriteVY = -spriteVY; // Make the sprite jump
  }

  // Apply gravity to the sprite
  spriteVY += 1; // Increase the velocity to simulate gravity
  spriteY += spriteVY; // Update the sprite's vertical position

  // Blue tracker line which will get erased on the next loop
  fill("aqua");
  rect((barX + 1) * barWidth, 0, barWidth, windowHeight);

  // Increment barX for the next loop
  barX++;
  // at the edge of the screen, go back to the beginning:
  if (barX * barWidth >= windowWidth) {
    barX = 0;
  }
}

// Three helper functions for managing the serial connection.

function setupSerial() {
  port = createSerial();

  // Check to see if there are any ports we have used previously
  let usedPorts = usedSerialPorts();
  if (usedPorts.length > 0) {
    // If there are ports we've used, open the first one
    port.open(usedPorts[0], BAUD_RATE);
  }

  // create a connect button
  connectBtn = createButton("Connect to Arduino");
  connectBtn.position(5, 5); // Position the button in the top left of the screen.
  connectBtn.mouseClicked(onConnectButtonClicked); // When the button is clicked, run the onConnectButtonClicked function
}

function checkPort() {
  if (!port.opened()) {
    // If the port is not open, change button text
    connectBtn.html("Connect to Arduino");
    // Set background to gray
    background("gray");
    return false;
  } else {
    // Otherwise we are connected
    connectBtn.html("Disconnect");
    return true;
  }
}

function onConnectButtonClicked() {
  // When the connect button is clicked
  if (!port.opened()) {
    // If the port is not opened, we open it
    port.open(BAUD_RATE);
  } else {
    // Otherwise, we close it!
    port.close();
  }
}
