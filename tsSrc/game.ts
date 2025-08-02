"use strict";

// Get the canvas and its 2D rendering context
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

// Camera object
const camera = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
};

// Set the canvas to fill the entire window
function resizeCanvas(): void {
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

// Type for tile coordinates
interface Tile {
    x: number;
    y: number;
}

// Map to store hard blocks per chunk: key = "chunkX,chunkY", value = Set of tile keys "x,y"
const chunksHardBlocks: Map<string, Set<string>> = new Map();

// Simple seeded pseudo-random generator for consistency across runs
function seededRandom(seed: number): () => number {
    return function() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    }
}

// Generate hard blocks for a chunk at (chunkX, chunkY)
function generateHardBlocksForChunk(chunkX: number, chunkY: number): Set<string> {
    const blockSet = new Set<string>();
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
function getHardBlocksForChunk(chunkX: number, chunkY: number): Set<string> {
    const key = `${chunkX},${chunkY}`;
    if (!chunksHardBlocks.has(key)) {
        const generated = generateHardBlocksForChunk(chunkX, chunkY);
        chunksHardBlocks.set(key, generated);
    }
    return chunksHardBlocks.get(key)!;
}

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
    x: 0,
    y: 0,
    size: 50,
    speed: 5,
    color: "#00ffcc",
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
const keys: { [key: string]: boolean } = {};
window.addEventListener("keydown", (e: KeyboardEvent) => {
    keys[e.key] = true;
});
window.addEventListener("keyup", (e: KeyboardEvent) => {
    keys[e.key] = false;
});

// Helper: get chunk coords from tile coords
function getChunkCoords(x: number, y: number): [number, number] {
    return [Math.floor(x / (gridSize * chunkSize)), Math.floor(y / (gridSize * chunkSize))];
}

// Check if position is blocked by hard block
function isValidPosition(x: number, y: number): boolean {
    const [chunkX, chunkY] = getChunkCoords(x, y);
    const blocks = getHardBlocksForChunk(chunkX, chunkY);
    return !blocks.has(`${x},${y}`);
}

// Try to move player to new tile
function tryStartMovement(newX: number, newY: number): boolean {
    if (!isValidPosition(newX, newY)) return false;
    player.targetX = newX;
    player.targetY = newY;
    player.isMoving = true;
    return true;
}

// Handle movement input (WASD/arrows)
function handleMovementInput(): void {
    if (player.isMoving) return;

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

// Update camera to follow the player
function updateCamera(): void {
    camera.x = player.x + player.size / 2 - canvas.width / 2;
    camera.y = player.y + player.size / 2 - canvas.height / 2;
}

// Draw the grid lines
function drawGrid(): void {
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

// Draw hard blocks near camera
function drawHardBlocks(): void {
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
                ctx.fillStyle = "#444";
                ctx.fillRect(x - camera.x, y - camera.y, gridSize, gridSize);
            });
        }
    }
}

// Draw the full scene
function draw(): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawHardBlocks();
    ctx.fillStyle = player.color;
    ctx.fillRect(
        player.x - camera.x,
        player.y - camera.y,
        player.size,
        player.size
    );
}

// Main game update logic
function update(): void {
    handleMovementInput();
    updatePlayerPosition();
    updateCamera();
}

// Main game loop
function gameLoop(): void {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
