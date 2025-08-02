"use strict";
// Get the canvas and its 2D rendering context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
// Camera object
const camera = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
};
// Set the canvas to fill the entire window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    camera.width = canvas.width;
    camera.height = canvas.height;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);
// Grid size constant
const gridSize = 50;
const chunkSize = 10; // 10x10 tiles per chunk
// Map to store hard blocks per chunk: key = "chunkX,chunkY", value = Set of tile keys "x,y"
const chunksHardBlocks = new Map();
// Simple seeded pseudo-random generator for consistency across runs
function seededRandom(seed) {
    return function () {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };
}
// Generate hard blocks for a chunk at (chunkX, chunkY)
function generateHardBlocksForChunk(chunkX, chunkY) {
    const blockSet = new Set();
    // Create seed based on chunk coords for consistent generation
    const seed = chunkX * 374761393 + chunkY * 668265263;
    const random = seededRandom(seed);
    for (let i = 0; i < chunkSize; i++) {
        for (let j = 0; j < chunkSize; j++) {
            // Randomly decide if a tile is hard block, e.g. 20% chance
            if (random() < 0.2) {
                const tileX = (chunkX * chunkSize + i) * gridSize;
                const tileY = (chunkY * chunkSize + j) * gridSize;
                blockSet.add(`${tileX},${tileY}`);
            }
        }
    }
    return blockSet;
}
// Get blocks in a chunk, generate if missing
function getHardBlocksForChunk(chunkX, chunkY) {
    const key = `${chunkX},${chunkY}`;
    if (!chunksHardBlocks.has(key)) {
        const generated = generateHardBlocksForChunk(chunkX, chunkY);
        chunksHardBlocks.set(key, generated);
    }
    return chunksHardBlocks.get(key);
}
// Player object
const player = {
    x: 0,
    y: 0,
    size: 50,
    speed: 5,
    color: "#f5b042",
    targetX: 0,
    targetY: 0,
    isMoving: false,
};
// Center player at initial position
player.x = Math.floor(canvas.width / 2 / gridSize) * gridSize;
player.y = Math.floor(canvas.height / 2 / gridSize) * gridSize;
player.targetX = player.x;
player.targetY = player.y;
// Input tracking
const keys = {};
window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});
window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});
// Helper: get chunk coords from tile coords
function getChunkCoords(x, y) {
    return [Math.floor(x / (gridSize * chunkSize)), Math.floor(y / (gridSize * chunkSize))];
}
// Check if position is blocked by hard block
function isValidPosition(x, y) {
    const [chunkX, chunkY] = getChunkCoords(x, y);
    const blocks = getHardBlocksForChunk(chunkX, chunkY);
    return !blocks.has(`${x},${y}`);
}
// Try to move player to new tile
function tryStartMovement(newX, newY) {
    if (!isValidPosition(newX, newY))
        return false;
    player.targetX = newX;
    player.targetY = newY;
    player.isMoving = true;
    return true;
}
// Handle movement input (WASD/arrows)
function handleMovementInput() {
    if (player.isMoving)
        return;
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
// Smooth movement between tiles
function updatePlayerPosition() {
    if (!player.isMoving)
        return;
    if (player.x < player.targetX) {
        player.x = Math.min(player.x + player.speed, player.targetX);
    }
    else if (player.x > player.targetX) {
        player.x = Math.max(player.x - player.speed, player.targetX);
    }
    if (player.y < player.targetY) {
        player.y = Math.min(player.y + player.speed, player.targetY);
    }
    else if (player.y > player.targetY) {
        player.y = Math.max(player.y - player.speed, player.targetY);
    }
    if (player.x === player.targetX && player.y === player.targetY) {
        player.isMoving = false;
    }
}
// Update camera to follow the player
function updateCamera() {
    camera.x = player.x + player.size / 2 - canvas.width / 2;
    camera.y = player.y + player.size / 2 - canvas.height / 2;
}
// Draw the grid lines
function drawGrid() {
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 1;
    const startX = Math.floor(camera.x / gridSize) * gridSize;
    const endX = camera.x + canvas.width;
    const startY = Math.floor(camera.y / gridSize) * gridSize;
    const endY = camera.y + canvas.height;
    for (let x = startX; x <= endX; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x - camera.x, 0);
        ctx.lineTo(x - camera.x, canvas.height);
        ctx.stroke();
    }
    for (let y = startY; y <= endY; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y - camera.y);
        ctx.lineTo(canvas.width, y - camera.y);
        ctx.stroke();
    }
}
// Draw hard blocks near camera with rock style
function drawHardBlocks() {
    // Calculate visible chunks around camera
    const startChunkX = Math.floor(camera.x / (gridSize * chunkSize)) - 1;
    const endChunkX = Math.floor((camera.x + canvas.width) / (gridSize * chunkSize)) + 1;
    const startChunkY = Math.floor(camera.y / (gridSize * chunkSize)) - 1;
    const endChunkY = Math.floor((camera.y + canvas.height) / (gridSize * chunkSize)) + 1;
    for (let cx = startChunkX; cx <= endChunkX; cx++) {
        for (let cy = startChunkY; cy <= endChunkY; cy++) {
            const blocks = getHardBlocksForChunk(cx, cy);
            blocks.forEach((key) => {
                const [x, y] = key.split(",").map(Number);
                // Base rock color
                ctx.fillStyle = "#666666";
                ctx.fillRect(x - camera.x, y - camera.y, gridSize, gridSize);
                // Add some "rock cracks" — random small lines
                ctx.strokeStyle = "#4a4a4a";
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let i = 0; i < 3; i++) {
                    const startX = x - camera.x + Math.random() * gridSize;
                    const startY = y - camera.y + Math.random() * gridSize;
                    const endX = startX + (Math.random() * 10 - 5);
                    const endY = startY + (Math.random() * 10 - 5);
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                }
                ctx.stroke();
                // 3D shading: light top-left
                ctx.fillStyle = "rgba(255,255,255,0.15)";
                ctx.fillRect(x - camera.x, y - camera.y, gridSize, 5); // top edge
                ctx.fillRect(x - camera.x, y - camera.y, 5, gridSize); // left edge
                // Shadow bottom-right
                ctx.fillStyle = "rgba(0,0,0,0.25)";
                ctx.fillRect(x - camera.x, y - camera.y + gridSize - 5, gridSize, 5); // bottom edge
                ctx.fillRect(x - camera.x + gridSize - 5, y - camera.y, 5, gridSize); // right edge
            });
        }
    }
}
// Draw the full scene with golden cheese player
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawHardBlocks();
    // Draw golden cheese player with gradient
    const px = player.x - camera.x;
    const py = player.y - camera.y;
    const grad = ctx.createRadialGradient(px + player.size / 2, py + player.size / 2, player.size / 4, px + player.size / 2, py + player.size / 2, player.size / 1.5);
    grad.addColorStop(0, "#ffeb3b"); // bright yellow center
    grad.addColorStop(1, "#b38600"); // darker golden edges
    ctx.fillStyle = grad;
    ctx.fillRect(px, py, player.size, player.size);
    // Add outline
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#333300";
    ctx.strokeRect(px, py, player.size, player.size);
    // Draw some "holes" in the cheese — circles with shadow
    ctx.fillStyle = "#c1a700";
    const holePositions = [
        [px + 10, py + 15],
        [px + 25, py + 35],
        [px + 40, py + 10],
    ];
    holePositions.forEach(([hx, hy]) => {
        ctx.beginPath();
        ctx.shadowColor = "rgba(0,0,0,0.4)";
        ctx.shadowBlur = 4;
        ctx.arc(hx, hy, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    });
}
// Main game update logic
function update() {
    handleMovementInput();
    updatePlayerPosition();
    updateCamera();
}
// Main game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
// Start the game
gameLoop();
