"use strict";
var _a, _b, _c, _d;
const canvasElement = document.getElementById('gameCanvas');
if (!(canvasElement instanceof HTMLCanvasElement)) {
    throw new Error("Canvas element not found or is not a canvas");
}
const canvas = canvasElement;
const ctx = canvas.getContext('2d');
const camera = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
};
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    camera.width = canvas.width;
    camera.height = canvas.height;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);
const gridSize = 50;
const chunkSize = 10;
// Create maps to store blocks for each chunk
const chunksHardBlocks = new Map();
const chunksSoftBlocks = new Map();
function seededRandom(seed) {
    return function () {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };
}
function generateHardBlocksForChunk(chunkX, chunkY) {
    const blockSet = new Set();
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
function generateSoftBlocksForChunk(chunkX, chunkY) {
    const blockSet = new Set();
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
function getHardBlocksForChunk(chunkX, chunkY) {
    const key = `${chunkX},${chunkY}`;
    if (!chunksHardBlocks.has(key)) {
        chunksHardBlocks.set(key, generateHardBlocksForChunk(chunkX, chunkY));
    }
    return chunksHardBlocks.get(key);
}
function getSoftBlocksForChunk(chunkX, chunkY) {
    const key = `${chunkX},${chunkY}`;
    if (!chunksSoftBlocks.has(key)) {
        chunksSoftBlocks.set(key, generateSoftBlocksForChunk(chunkX, chunkY));
    }
    return chunksSoftBlocks.get(key);
}
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
player.x = Math.floor(canvas.width / 2 / gridSize) * gridSize;
player.y = Math.floor(canvas.height / 2 / gridSize) * gridSize;
player.targetX = player.x;
player.targetY = player.y;
const keys = {};
window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if (e.key.toLowerCase() === "p") {
        attemptPunch();
    }
});
window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});
function getChunkCoords(x, y) {
    return [Math.floor(x / (gridSize * chunkSize)), Math.floor(y / (gridSize * chunkSize))];
}
function isValidPosition(x, y) {
    const [chunkX, chunkY] = getChunkCoords(x, y);
    const hardBlocks = getHardBlocksForChunk(chunkX, chunkY);
    const softBlocks = getSoftBlocksForChunk(chunkX, chunkY);
    return !hardBlocks.has(`${x},${y}`) && !softBlocks.has(`${x},${y}`);
}
function tryStartMovement(newX, newY) {
    if (!isValidPosition(newX, newY))
        return false;
    player.targetX = newX;
    player.targetY = newY;
    player.isMoving = true;
    return true;
}
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
// Touch controls
function simulateKeyPress(key) {
    keys[key] = true;
    setTimeout(() => (keys[key] = false), 100); // Short press
}
(_a = document.getElementById("up")) === null || _a === void 0 ? void 0 : _a.addEventListener("touchstart", () => simulateKeyPress("w"));
(_b = document.getElementById("down")) === null || _b === void 0 ? void 0 : _b.addEventListener("touchstart", () => simulateKeyPress("s"));
(_c = document.getElementById("left")) === null || _c === void 0 ? void 0 : _c.addEventListener("touchstart", () => simulateKeyPress("a"));
(_d = document.getElementById("right")) === null || _d === void 0 ? void 0 : _d.addEventListener("touchstart", () => simulateKeyPress("d"));
function attemptPunch() {
    if (player.isMoving)
        return;
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
function updateCamera() {
    camera.x = player.x + player.size / 2 - canvas.width / 2;
    camera.y = player.y + player.size / 2 - canvas.height / 2;
}
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
function drawHardBlocks() {
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
function drawSoftBlocks() {
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
function unloadDistantChunks(centerX, centerY, radius) {
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
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawHardBlocks();
    drawSoftBlocks();
    const px = player.x - camera.x;
    const py = player.y - camera.y;
    const grad = ctx.createRadialGradient(px + player.size / 2, py + player.size / 2, player.size / 4, px + player.size / 2, py + player.size / 2, player.size / 1.5);
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
function update() {
    handleMovementInput();
    updatePlayerPosition();
    updateCamera();
}
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
gameLoop();
