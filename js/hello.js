"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Get the content container once DOM is loaded (to avoid null if script runs early)
let contentDiv = null;
function showNotification(message, duration = 3000) {
    const notification = document.getElementById('notification');
    if (!notification)
        return;
    notification.textContent = message;
    notification.classList.remove('hidden');
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
function loadPage(page) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield fetch(`pages/${page}.html`);
            const html = yield res.text();
            if (contentDiv) {
                contentDiv.innerHTML = html;
                setupH3ClickEvents(); // Reattach events after content change
            }
        }
        catch (error) {
            console.error('Failed to load page:', error);
        }
        function handleHashChange() {
            const page = location.hash.replace('#', '') || 'home';
            loadPage(page);
        }
        function sayHello() {
            console.log("Hello, world from TypeScript!");
        }
        // Initialize after DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
            contentDiv = document.getElementById('content'); // Assign here to avoid null
            sayHello();
            handleHashChange();
            window.addEventListener('hashchange', handleHashChange);
        });
    });
}
