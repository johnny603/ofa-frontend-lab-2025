"use strict";

// Get the canvas and its 2D rendering context
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

// Set the canvas to fill the entire window
function resizeCanvas(): void {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();

// Automatically resize canvas on window resize
window.addEventListener("resize", () => {
    resizeCanvas();
});

// Grid size constant
const gridSize = 50;

// Player object interface
interface Player {
    x: number;
    y: number;
    size: number;
    speed: number;
    color: string;
    targetX: number;
    targetY: number;
    isMoving: boolean;
}

// Player object
const player: Player = {
    x: Math.floor(canvas.width / 2 / gridSize) * gridSize,
    y: Math.floor(canvas.height / 2 / gridSize) * gridSize,
    size: 50,
    speed: 5, // pixels per frame
    color: "#00ffcc",
    targetX: 0,
    targetY: 0,
    isMoving: false,
};
player.targetX = player.x;
player.targetY = player.y;

// Object to track key presses
const keys: { [key: string]: boolean } = {};

// Event listeners for arrow key movement
window.addEventListener("keydown", (e: KeyboardEvent) => {
    keys[e.key] = true;
});

window.addEventListener("keyup", (e: KeyboardEvent) => {
    keys[e.key] = false;
});

// Helper to check if the next position is inside canvas boundaries
function isValidPosition(x: number, y: number): boolean {
    return (
        x >= 0 &&
        y >= 0 &&
        x <= canvas.width - player.size &&
        y <= canvas.height - player.size
    );
}

// Helper to start movement if possible
function tryStartMovement(newX: number, newY: number): boolean {
    if (!isValidPosition(newX, newY)) return false;
    player.targetX = newX;
    player.targetY = newY;
    player.isMoving = true;
    return true;
}

// Handles input and decides movement
function handleMovementInput(): void {
    if (player.isMoving) return; // Early return if already moving

    if (keys["ArrowUp"] || keys["w"]) {
        tryStartMovement(player.x, player.y - gridSize);
        return;
    }
    if (keys["ArrowDown"] || keys["s"]) {
        tryStartMovement(player.x, player.y + gridSize);
        return;
    }
    if (keys["ArrowLeft"] || keys["a"]) {
        tryStartMovement(player.x - gridSize, player.y);
        return;
    }
    if (keys["ArrowRight"] || keys["d"]) {
        tryStartMovement(player.x + gridSize, player.y);
    }
}

// Update player position smoothly toward target
function updatePlayerPosition(): void {
    if (!player.isMoving) return;

    if (player.x < player.targetX) {
        player.x = Math.min(player.x + player.speed, player.targetX);
    } else if (player.x > player.targetX) {
        player.x = Math.max(player.x - player.speed, player.targetX);
    }

    if (player.y < player.targetY) {
        player.y = Math.min(player.y + player.speed, player.targetY);
    } else if (player.y > player.targetY) {
        player.y = Math.max(player.y - player.speed, player.targetY);
    }

    if (player.x === player.targetX && player.y === player.targetY) {
        player.isMoving = false;
    }
}

// Update function calls input handler and updates player position
function update(): void {
    handleMovementInput();
    updatePlayerPosition();
}

// Draw yellow grid on the canvas background
function drawGrid(gridSize: number = 50): void {
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 1;

    // Draw vertical lines
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Draw the player and background
function draw(): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(gridSize);
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.size, player.size);
}

// Main game loop
function gameLoop(): void {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
