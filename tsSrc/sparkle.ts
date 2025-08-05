const sparkleCanvas = document.getElementById('sparkle-canvas') as HTMLCanvasElement;
const sparkleCtx = sparkleCanvas.getContext('2d');

if (!sparkleCtx) {
  throw new Error("Failed to get 2D context");
}

interface Particle {
  x: number;
  y: number;
  star: string;
  size: number;
  twinkleOffset: number;
}

const numParticles = 70;
const stars: string[] = ["⭐", "✨"];
const starDust: string[] = ["🔵", "💜", "🟩"];
const particlePositions: Particle[] = [];

for (let i = 0; i < numParticles; i++) {
  particlePositions.push({
    x: Math.random() * sparkleCanvas.width,
    y: Math.random() * sparkleCanvas.height,
    star: stars[Math.floor(Math.random() * stars.length)],
    size: 10 + Math.random() * 15,
    twinkleOffset: Math.random() * 1000,
  });
}

function drawGradientBackground() {
    const gradient = sparkleCtx!.createLinearGradient(0, 0, 0, sparkleCanvas.height);
    gradient.addColorStop(0, '#0a0a1f');
    gradient.addColorStop(1, '#000022');
    sparkleCtx!.fillStyle = gradient;
    sparkleCtx!.fillRect(0, 0, sparkleCanvas.width, sparkleCanvas.height);
}

function drawStar(x: number, y: number, starChar: string, size: number, alpha = 1) {
  sparkleCtx!.font = `${size}px serif`;
  sparkleCtx!.fillStyle = `rgba(255, 255, 200, ${alpha})`;
  sparkleCtx!.fillText(starChar, x, y);
}

function drawStarDust() {
  sparkleCtx!.font = `8px serif`;
  starDust.forEach((char) => {
    for (let sx = 0; sx < sparkleCanvas.width; sx += 25) {
      for 