"use strict";
// Get the canvas and its 2D rendering context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
// Set the canvas to fill the entire window
function resizeCanvas() {
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
// Player object
const player = {
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
const keys = {};
// Event listeners for arrow key movement
window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});
window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});
// Update player position based on keys pressed
function update() {
    if (!player.isMoving) {
        // Only start a move if not already moving
        if (keys["ArrowUp"] || keys["w"]) {
        