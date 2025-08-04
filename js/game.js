"use strict";
let _a, _b, _c, _d, _e, _f;
const canvasElement = document.getElementById('gameCanvas');
if (!(canvasElement instanceof HTMLCanvasElement)) {
    throw new Error("Canvas element not found or is not a canvas");
}
const canvas = canvasElement;
const ctx = canvas.getContext('2d');
const camera = { x: 0, y: 0, width: canvas.width, height: canvas.height };
let flicker = 1;
let frameCount = 0;
let gameOver = false;
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
const chunksHardBlocks = new Map();
const chunksSoftBlocks = new Map();
const chunksLavaBlocks = new Map();
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
            if (random() < 0.5) {
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
            if (random() < 0.3) {
                const tileX = (chunkX * chunkSize + i) * gridSize;
                const tileY = (chunkY * chunkSize + j) * gridSize;
                blockSet.add(`${tileX},${tileY}`);
            }
        }
    }
    return blockSet;
}
function generateLavaBlocksForChunk(chunkX, chunkY) {
    const blockSet = new Set();
    const seed = chunkX * 842391 + chunkY * 297121;
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
function getChunkCoords(x, y) {
    return [Math.floor(x / (gridSize * chunkSize)), Math.floor(y / (gridSize * chunkSize))];
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
        const blocks = generateSoftBlocksForChunk(chunkX, chunkY);
        const deleted = modifiedChunks.softBlockDeletes.get(key);
        if (deleted) {
            for (const coord of deleted) {
                blocks.delete(coord);
            }
        }
        chunksSoftBlocks.set(key, blocks);
    }
    return chunksSoftBlocks.get(key);
}
function getLavaBlocksForChunk(chunkX, chunkY) {
    const key = `${chunkX},${chunkY}`;
    if (!chunksLavaBlocks.has(key)) {
        chunksLavaBlocks.set(key, generateLavaBlocksForChunk(chunkX, chunkY));
    }
    return chunksLavaBlocks.get(key);
}
function isValidPosition(x, y) {
    const [chunkX, chunkY] = getChunkCoords(x, y);
    const hard = getHardBlocksForChunk(chunkX, chunkY);
    const soft = getSoftBlocksForChunk(chunkX, chunkY);
    const lava = getLavaBlocksForChunk(chunkX, chunkY);
    return !hard.has(`${x},${y}`) && !soft.has(`${x},${y}`) && !lava.has(`${x},${y}`);
}
function resetGame() {
    player.x = Math.floor(canvas.width / 2 / gridSize) * gridSize;
    player.y = Math.floor(canvas.height / 2 / gridSize) * gridSize;
    player.targetX = player.x;
    player.targetY = player.y;
    player.hp = 100;
    player.isMoving = false;
    gameOver = false;
    player.lastLavaDamageTime = 0;
    updateCamera();
    // Hide button
    const resetBtn = document.getElementById("resetBtn");
    resetBtn.style.display = "none";
}
const player = {
    x: 0, y: 0, size: 50, speed: 5,
    color: "#f5b042", targetX: 0, targetY: 0, isMoving: false, hp: 100,
    lastLavaDamageTime: 0
};
player.x = Math.floor(canvas.width / 2 / gridSize) * gridSize;
player.y = Math.floor(canvas.height / 2 / gridSize) * gridSize;
player.targetX = player.x;
player.targetY = player.y;
const keys = {};
window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if (e.key.toLowerCase() === "p")
        attemptPunch();
});
window.addEventListener("keyup", (e) => keys[e.key] = false);
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
function simulateKeyPress(key) {
    keys[key] = true;
    setTimeout(() => (keys[key] = false), 100);
}
(_a = document.getElementById("up")) === null || _a === void 0 ? void 0 : _a.addEventListener("touchstart", () => simulateKeyPress("w"));
(_b = document.getElementById("down")) === null || _b === void 0 ? void 0 : _b.addEventListener("touchstart", () => simulateKeyPress("s"));
(_c = document.getElementById("left")) === null || _c === void 0 ? void 0 : _c.addEventListener("touchstart", () => simulateKeyPress("a"));
(_d = document.getElementById("right")) === null || _d === void 0 ? void 0 : _d.addEventListener("touchstart", () => simulateKeyPress("d"));
(_e = document.getElementById("P")) === null || _e === void 0 ? void 0 : _e.addEventListener("touchstart", () => simulateKeyPress("p"));
function attemptPunch() {
    if (player.isMoving)
        return;
    const directions = [[0, -gridSize], [0, gridSize], [-gridSize, 0], [gridSize, 0]];
    for (const [dx, dy] of directions) {
        const tx = player.x + dx;
        const ty = player.y + dy;
        const [cx, cy] = getChunkCoords(tx, ty);
        const key = `${cx},${cy}`;
        const soft = getSoftBlocksForChunk(cx, cy);
        if (soft.has(`${tx},${ty}`)) {
            soft.delete(`${tx},${ty}`);
            // Track deletion
            if (!modifiedChunks.softBlockDeletes.has(key)) {
                modifiedChunks.softBlockDeletes.set(key, new Set());
            }
            modifiedChunks.softBlockDeletes.get(key).add(`${tx},${ty}`);
            saveModifiedChunks(); // Save immediately after a change
            break;
        }
    }
}
function saveModifiedChunks() {
    const data = {};
    for (const [chunkKey, coordsSet] of modifiedChunks.softBlockDeletes.entries()) {
        data[chunkKey] = Array.from(coordsSet);
    }
    localStorage.setItem("softBlockDeletes", JSON.stringify(data));
}
function loadModifiedChunks() {
    const raw = localStorage.getItem("softBlockDeletes");
    if (!raw)
        return;
    const data = JSON.parse(raw);
    for (const key in data) {
        modifiedChunks.softBlockDeletes.set(key, new Set(data[key]));
    }
}
(_f = document.getElementById("resetBtn")) === null || _f === void 0 ? void 0 : _f.addEventListener("click", resetGame);
function updatePlayerPosition() {
    if (!player.isMoving)
        return;
    if (player.x < player.targetX)
        player.x = Math.min(player.x + player.speed, player.targetX);
    else if (player.x > player.targetX)
        player.x = Math.max(player.x - player.speed, player.targetX);
    if (player.y < player.targetY)
        player.y = Math.min(player.y + player.speed, player.targetY);
    else if (player.y > player.targetY)
        player.y = Math.max(player.y - player.speed, player.targetY);
    if (player.x === player.targetX && player.y === player.targetY)
        player.isMoving = false;
}
function updateCamera() {
    camera.x = player.x + player.size / 2 - canvas.width / 2;
    camera.y = player.y + player.size / 2 - canvas.height / 2;
}
function drawGrid() {
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 1;
    const startX = Math.floor(camera.x / gridSize) * gridSize;
    const startY = Math.floor(camera.y / gridSize) * gridSize;
    const endX = camera.x + canvas.width;
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
                const sx = x - camera.x;
                const sy = y - camera.y;
                ctx.fillStyle = "#666";
                ctx.fillRect(sx, sy, gridSize, gridSize);
                ctx.strokeStyle = "#4a4a4a";
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let i = 0; i < 3; i++) {
                    const startX = sx + Math.random() * gridSize;
                    const startY = sy + Math.random() * gridSize;
                    const endX = startX + (Math.random() * 10 - 5);
                    const endY = startY + (Math.random() * 10 - 5);
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                }
                ctx.stroke();
                ctx.fillStyle = "rgba(255,255,255,0.1)";
                ctx.fillRect(sx, sy, gridSize, 4);
                ctx.fillRect(sx, sy, 4, gridSize);
                ctx.fillStyle = "rgba(0,0,0,0.15)";
                ctx.fillRect(sx + gridSize - 4, sy, 4, gridSize);
                ctx.fillRect(sx, sy + gridSize - 4, gridSize, 4);
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
                ctx.strokeStyle = "#5c2e00";
                ctx.lineWidth = 2;
                ctx.strokeRect(sx, sy, gridSize, gridSize);
                // Wood grain decoration
                ctx.strokeStyle = "rgba(60, 30, 0, 0.2)";
                ctx.lineWidth = 1;
                for (let i = 0; i < 4; i++) {
                    const gx = sx + (i + 1) * (gridSize / 5);
                    ctx.beginPath();
                    ctx.moveTo(gx, sy);
                    ctx.lineTo(gx, sy + gridSize);
                    ctx.stroke();
                }
                // Highlight
                ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
                ctx.fillRect(sx, sy, gridSize, gridSize / 5);
                // Shadow
                ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
                ctx.fillRect(sx + gridSize - 5, sy, 5, gridSize);
                ctx.fillRect(sx, sy + gridSize - 5, gridSize, 5);
            });
        }
    }
}
function drawLavaBlocks() {
    frameCount++;
    if (frameCount % 20 === 0) {
        flicker = 0.4 + Math.random() * 0.6;
    }
    const startChunkX = Math.floor(camera.x / (gridSize * chunkSize)) - 1;
    const endChunkX = Math.floor((camera.x + canvas.width) / (gridSize * chunkSize)) + 1;
    const startChunkY = Math.floor(camera.y / (gridSize * chunkSize)) - 1;
    const endChunkY = Math.floor((camera.y + canvas.height) / (gridSize * chunkSize)) + 1;
    for (let cx = startChunkX; cx <= endChunkX; cx++) {
        for (let cy = startChunkY; cy <= endChunkY; cy++) {
            const blocks = getLavaBlocksForChunk(cx, cy);
            blocks.forEach((key) => {
                const [x, y] = key.split(",").map(Number);
                const sx = x - camera.x;
                const sy = y - camera.y;
                const grad = ctx.createRadialGradient(sx + gridSize / 2, sy + gridSize / 2, gridSize / 8, sx + gridSize / 2, sy + gridSize / 2, gridSize);
                grad.addColorStop(0, `rgba(255, 255, 100, ${flicker})`);
                grad.addColorStop(1, `rgba(255, 50, 0, ${flicker})`);
                ctx.fillStyle = grad;
                ctx.fillRect(sx, sy, gridSize, gridSize);
                ctx.strokeStyle = "#4d0000";
                ctx.lineWidth = 0.01;
                for (let i = 0; i < 3; i++) {
                    const crackX = sx + Math.random() * gridSize;
                    const crackY = sy + Math.random() * gridSize;
                    ctx.beginPath();
                    ctx.moveTo(crackX, crackY);
                    ctx.lineTo(crackX + (Math.random() - 0.5) * 10, crackY + (Math.random() - 0.5) * 10);
                    ctx.stroke();
                }
                for (let i = 0; i < 2; i++) {
                    ctx.beginPath();
                    ctx.arc(sx + gridSize * 0.25 + i * 10, sy + gridSize * 0.25 + i * 8, 3, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(255, 200, 0, 0.4)";
                    ctx.fill();
                }
            });
        }
    }
}
function unloadDistantChunks(centerX, centerY, radius) {
    for (const map of [chunksHardBlocks, chunksSoftBlocks, chunksLavaBlocks]) {
        for (const key of map.keys()) {
            const [x, y] = key.split(",").map(Number);
            if (Math.abs(x - centerX) > radius || Math.abs(y - centerY) > radius) {
                map.delete(key);
            }
        }
    }
}
const modifiedChunks = {
    softBlockDeletes: new Map()
};
function checkLavaDamage() {
    const now = performance.now();
    const positionsToCheck = [
        [player.x, player.y],
        [player.x + gridSize, player.y],
        [player.x - gridSize, player.y],
        [player.x, player.y + gridSize],
        [player.x, player.y - gridSize]
    ];
    let isNearLava = false;
    for (const [x, y] of positionsToCheck) {
        const [chunkX, chunkY] = getChunkCoords(x, y);
        const lavaBlocks = getLavaBlocksForChunk(chunkX, chunkY);
        if (lavaBlocks.has(`${x},${y}`)) {
            isNearLava = true;
            break;
        }
    }
    if (isNearLava && !gameOver) {
        if (now - player.lastLavaDamageTime >= 350) {
            player.hp = Math.max(0, player.hp - 5);
            player.lastLavaDamageTime = now;
            if (player.hp <= 0) {
                gameOver = true;
                player.isMoving = false;
            }
        }
    }
}
function drawHPBar() {
    const barWidth = canvas.width * 0.6;
    const barHeight = 20;
    const barX = (canvas.width - barWidth) / 2;
    const barY = canvas.height - barHeight - 10;
    const hpPercent = Math.max(0, Math.min(1, player.hp / 100));
    // Background
    ctx.fillStyle = "#222";
    ctx.fillRect(barX, barY, barWidth, barHeight);
    // HP fill
    ctx.fillStyle = hpPercent > 0.3 ? "#4caf50" : "#f44336"; // green to red
    ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);
    // Border
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    // Text
    ctx.fillStyle = "#fff";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`HP: ${player.hp}`, barX + barWidth / 2, barY + barHeight - 5);
}
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawHardBlocks();
    drawSoftBlocks();
    drawLavaBlocks();
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
    drawHPBar();
    if (gameOver) {
        ctx.fillStyle = "#f00";
        ctx.font = "48px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
        // Show reset button
        const resetBtn = document.getElementById("resetBtn");
        resetBtn.style.display = "block";
    }
}
function update() {
    if (gameOver)
        return;
    handleMovementInput();
    updatePlayerPosition();
    updateCamera();
    checkLavaDamage();
    unloadDistantChunks(player.x, player.y, 1000);
}
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
loadModifiedChunks();
gameLoop();
