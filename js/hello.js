"use strict";
function showNotification(message, duration = 3000) {
    const notification = document.getElementById('notification');
    if (!notification)
        return;
    notification.textContent = message;
    notification.classList.remove('hidden');
    // Hide after duration (default 3 seconds)
    setTimeout(() => {
        notification.classList.add('hidden');
    }, duration);
}
function setupH3ClickEvents() {
    const headings = document.querySelectorAll('h3');
    headings.forEach((h3) => {
        h3.addEventListener('click', () => {
            showNotification(`You clicked: ${h3.textContent}`);
            h3.classList.toggle('clicked');
        });
    });
}
function sayHello() {
    console.log("Hello, world from TypeScript!");
}
// Wait for the DOM to load before running functions
document.addEventListener('DOMContentLoaded', () => {
    sayHello();
    setupH3ClickEvents();
});
