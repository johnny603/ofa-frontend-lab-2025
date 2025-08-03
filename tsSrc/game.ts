"use strict";

const canvasElement = document.getElementById('gameCanvas');
if (!(canvasElement instanceof HTMLCanvasElement)) {
    throw new Error("Canvas element not found or is not a canvas");
}
const canvas = canvasElement;

const ctx = canvas.getContext('2d')!;

const camera = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
};

function resizeCanvas(): void {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    camera.width = canvas.width;
    camera.height = canvas.height;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const gridSize = 50;
const chunkSize = 10;

interface Tile {
    x: number;
    y: number;
}

// Create maps to store blocks for each chunk
const chunksHardBlocks: Map<string, Set<string>> = new Map();
const chunksSoftBlocks: Map<string, Set<string>> = new Map();

function seededRandom(seed: number): () => number {
    return function () {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };
}

function generateHardBlocksForChunk(chunkX: number, chunkY: number): Set<string> {
    const blockSet = new Set<string>();
    const seed = chunkX * 374761393 + chunkY * 668265263;
    const random = seededRandom(seed);

    for (let i = 0; i < chunkSize; i++) {
        for (let j = 0; j < chunkSize; j++) {
            if (random() < 0.2) {
                const tileX = (chunkX * chunkSize + i) * gridSize;
                const tileY = (chunkY * chunkSize + j) * gridSize;
                blockSet.add(`${tileX},${tileY}`);
            }
        }
    }
    return blockSet;
}

function generateSoftBlocksForChunk(chunkX: number, chunkY: number): Set<string> {
    const blockSet = new Set<string>();
    const seed = chunkX * 498761393 + chunkY * 127265263;
    const random = seededRandom(seed);

    for (let i = 0; i < chunkSize; i++) {
        for (let j = 0; j < chunkSize; j++) {
            if (random() < 0.2) {
                const tileX = (chunkX * chunkSize + i) * gridSize;
                const tileY = (chunkY * chunkSize + j) * gridSize;
                blockSet.add(`${tileX},${tileY}`);
            }
        }
    }
    return blockSet;
}

function getHardBlocksForChunk(chunkX: number, chunkY: number): Set<string> {
    const key = `${chunkX},${chunkY}`;
    if (!chunksHardBlocks.has(key)) {
        chunksHardBlocks.set(key, generateHardBlocksForChunk(chunkX, chunkY));
    }
    return chunksHardBlocks.get(key)!;
}

function getSoftBlocksForChunk(chunkX: number, chunkY: number): Set<string> {
    const key = `${chunkX},${chunkY}`;
    if (!chunksSoftBlocks.has(key)) {
        chunksSoftBlocks.set(key, generateSoftBlocksForChunk(chunkX, chunkY));
    }
    return chunksSoftBlocks.get(key)!;
}

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

const player: Player = {
    x: 0,
    y: 0,
    size: 50,
    speed: 5,
    color: "#f5b042",
    targetX: 0,
    targetY: 0,
    isMoving: false,
};

player.x = Math.floor(canvas.width / 2 / gridSize) * gridSize;
player.y = Math.floor(canvas.height / 2 / gridSize) * gridSize;
player.targetX = player.x;
player.targetY = player.y;

const keys: { [key: string]: boolean } = {};

window.addEventListener("keydown", (e: KeyboardEvent) => {
    keys[e.key] = true;
    if (e.key.toLowerCase() === "p") {
        attemptPunch();
    }
});

window.addEventListener("keyup", (e: KeyboardEvent) => {
    keys[e.key] = false;
});

function getChunkCoords(x: number, y: number): [number, number] {
    return [Math.floor(x / (gridSize * chunkSize)), Math.floor(y / (gridSize * chunkSize))];
}

function isValidPosition(x: number, y: number): boolean {
    const [chunkX, chunkY] = getChunkCoords(x, y);
    const hardBlocks = getHardBlocksForChunk(chunkX, chunkY);
    const softBlocks = getSoftBlocksForChunk(chunkX, chunkY);
    return !hardBlocks.has(`${x},${y}`) && !softBlocks.has(`${x},${y}`);
}

function tryStartMovement(newX: number, newY: number): boolean {
    if (!isValidPosition(newX, newY)) return false;
    player.targetX = newX;
    player.targetY = newY;
    player.isMoving = true;
    return true;
}

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

// Touch controls
function simulateKeyPress(key: string): void {
    keys[key] = true;
    setTimeout(() => (keys[key] = false), 100); // Short press
}

document.getElementById("up")?.addEventListener("touchstart", () => simulateKeyPress("w"));
document.getElementById("down")?.addEventListener("touchstart", () => simulateKeyPress("s"));
document.getElementById("left")?.addEventListener("touchstart", () => simulateKeyPress("a"));
document.getElementById("right")?.addEventListener("touchstart", () => simulateKeyPress("d"));

function attemptPunch(): void {
    if (player.isMoving) return;

    const directions = [
        [0, -gridSize],
        [0, gridSize],
        [-gridSize, 0],
        [gridSize, 0],
    ];

    for (const [dx, dy] of directions) {
        const targetX = player.x + dx;
        const targetY = player.y + dy;

        const [chunkX, chunkY] = getChunkCoords(targetX, targetY);
        const softBlocks = getSoftBlocksForChunk(chunkX, chunkY);

        if (softBlocks.has(`${targetX},${targetY}`)) {
            softBlocks.delete(`${targetX},${targetY}`);
            break; // Only punch one block
        }
    }
}

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

function updateCamera(): void {
    camera.x = player.x + player.size / 2 - canvas.width / 2;
    camera.y = player.y + player.size / 2 - canvas.height / 2;
}

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

function drawHardBlocks(): void {
    const startChunkX = Math.floor(camera.x / (gridSize * chunkSize)) - 1;
    const endChunkX = Math.floor((camera.x + canvas.width) / (gridSize * chunkSize)) + 1;
    const startChunkY = Math.floor(camera.y / (gridSize * chunkSize)) - 1;
    const endChunkY = Math.floor((camera.y + canvas.height) / (gridSize * chunkSize)) + 1;

    for (let cx = startChunkX; cx <= endChunkX; cx++) {
        for (let cy = startChunkY; cy <= endChunkY; cy++) {
            const blocks = getHardBlocksForChunk(cx, cy);
            blocks.forEach((key) => {
                const [x, y] = key.split(",").map(Number);

                ctx.fillStyle = "#666666";
                ctx.fillRect(x - camera.x, y - camera.y, gridSize, gridSize);

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

                ctx.fillStyle = "rgba(255,255,255,0.15)";
                ctx.fillRect(x - camera.x, y - camera.y, gridSize, 5);
                ctx.fillRect(x - camera.x, y - camera.y, 5, gridSize);

                ctx.fillStyle = "rgba(0,0,0,0.25)";
                ctx.fillRect(x - camera.x, y - camera.y + gridSize - 5, gridSize, 5);
                ctx.fillRect(x - camera.x + gridSize - 5, y - camera.y, 5, gridSize);
            });
        }
    }
}

function drawSoftBlocks(): void {
    const startChunkX = Math.floor(camera.x / (gridSize * chunkSize)) - 1;
    const endChunkX = Math.floor((camera.x + canvas.width) / (gridSize * chunkSize)) + 1;
    const startChunkY = Math.floor(camera.y / (gridSize * chunkSize)) - 1;
    const endChunkY = Math.floor((camera.y + canvas.height) / (gridSize * chunkSize)) + 1;

    for (let cx = startChunkX; cx <= endChunkX; cx++) {
        for (let cy = startChunkY; cy <= endChunkY; cy++) {
            const blocks = getSoftBlocksForChunk(cx, cy);
            blocks.forEach((key) => {
                const [x, y] = key.split(",").map(Number);
                const sx = x - camera.x;
                const sy = y - camera.y;

                ctx.fillStyle = "#d98c00";
                ctx.fillRect(sx, sy, gridSize, gridSize);

                ctx.strokeStyle = "#590000";
                ctx.lineWidth = 2;
                ctx.strokeRect(sx, sy, gridSize, gridSize);

                for (let i = 0; i < 5; i++) {
                    const dotX = sx + Math.random() * gridSize;
                    const dotY = sy + Math.random() * gridSize;
                    const size = Math.random() * 1.5 + 0.5;
                    ctx.fillStyle = Math.random() > 0.5 ? "#b87333" : "#a0522d";
                    ctx.beginPath();
                    ctx.arc(dotX, dotY, size, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
                ctx.fillRect(sx, sy, gridSize, gridSize / 4);
            });
        }
    }
}

function unloadDistantChunks(centerX: number, centerY: number, radius: number): void {
    for (const key of chunksHardBlocks.keys()) {
        const [x, y] = key.split(",").map(Number);
        if (Math.abs(x - centerX) > radius || Math.abs(y - centerY) > radius) {
            chunksHardBlocks.delete(key);
        }
    }
    for (const key of chunksSoftBlocks.keys()) {
        const [x, y] = key.split(",").map(Number);
        if (Math.abs(x - centerX) > radius || Math.abs(y - centerY) > radius) {
            chunksSoftBlocks.delete(key);
        }
    }
}

function draw(): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawHardBlocks();
    drawSoftBlocks();

    const px = player.x - camera.x;
    const py = player.y - camera.y;

    const grad = ctx.createRadialGradient(
        px + player.size / 2,
        py + player.size / 2,
        player.size / 4,
        px + player.size / 2,
        py + player.size / 2,
        player.size / 1.5
    );
    grad.addColorStop(0, "#ffeb3b");
    grad.addColorStop(1, "#b38600");

    ctx.fillStyle = grad;
    ctx.fillRect(px, py, player.size, player.size);

    ctx.lineWidth = 3;
    ctx.strokeStyle = "#333300";
    ctx.strokeRect(px, py, player.size, player.size);

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

function update(): void {
    handleMovementInput();
    updatePlayerPosition();
    updateCamera();
}

function gameLoop(): void {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
