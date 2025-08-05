// Get the content container once DOM is loaded (to avoid null if script runs early)
let contentDiv: HTMLElement | null = null;

function showNotification(message: string, duration = 3000): void {
  const notification = document.getElementById('notification');
  if (!notification) return;

  notification.textContent = message;
  notification.classList.remove('hidden');

  setTimeout(() => {
    notification.classList.add('hidden');
  }, duration);
}

function setupH3ClickEvents(): void {
  const headings = document.querySelectorAll('h3');
  headings.forEach((h3) => {
    h3.addEventListener('click', () => {
      showNotification(`You clicked: ${h3.textContent}`);
      h3.classList.toggle('clicked');
    });
  });
}

async function loadPage(page: string): Promise<void> {
  try {
    const res = await fetch(`pages/${page}.html`);
    const html = await res.text();
    if (contentDiv) {
      contentDiv.innerHTML = html;
      setupH3ClickEvents(); // Reattach events after content change
    }
  }
  catch (error) {
    console.error('Failed to load page:', error);
  }

function handleHashChange(): void {
  const page = location.hash.replace('#', '') || 'home';
  loadPage(page);
}

function sayHello(): void {
  console.log("Hello, world from TypeScript!");
}

// Initialize after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  contentDiv = document.getElementById('content');  // Assign here to avoid null
  sayHello();
  handleHashChange();
  window.addEventListener('hashchange', handleHashChange);
});}
