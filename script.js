// ----- Fun facts arrays -----
const penguinFacts = [
  "They hop on rocks.",
  "They have yellow eyebrow feathers.",
  "They're strong swimmers and can dive deep."
];
const dolphinFacts = [
  "Pink river dolphins get pinker with age due to scar tissue from rough play or fights.",
  "They are highly intelligent and have the largest brain-to-body size ratio of all freshwater dolphins.",
  "These dolphins can turn their heads 180 degrees thanks to unfused neck vertebrae."
];
const bearFacts = [
  "Kodiak bears are one of the largest bear species in the world, rivaling polar bears in size.",
  "They can weigh up to 1,500 pounds and stand over 10 feet tall when on their hind legs.",
  "Despite their size, Kodiak bears are excellent swimmers and can run up to 30 miles per hour."
];
const beetleFacts = [
  "Rainbow leaf beetles can change color from green to blue to copper depending on the angle of light.",
  "They use their iridescent colors as a defense mechanism to confuse predators.",
  "These tiny beetles are only 6-8mm long but can be seen from surprisingly far away due to their metallic shine."
];
let currentIndex = 0;
let currentFacts = [];
// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Get the page's animal from the <h1> heading
  const headingEl = document.querySelector("h1");
  const headingText = headingEl.textContent.toLowerCase();
  // Determine which fun facts to load — note lowercase checks to match headingText
  if (headingText.includes("penguin")) {
    currentFacts = penguinFacts;
  } else if (headingText.includes("dolphin")) {
    currentFacts = dolphinFacts;
  } else if (headingText.includes("bear")) {
    currentFacts = bearFacts;
  } else if (headingText.includes("beetle")) {
    currentFacts = beetleFacts;
  }
  // Get DOM elements
  const factDisplay = document.getElementById("fact-display");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  // Safety check in case HTML elements are missing
  if (!factDisplay || !prevBtn || !nextBtn || currentFacts.length === 0) {
    console.warn("Carousel elements not found or no facts available.");
    return;
  }
  // Show the first fun fact
  factDisplay.textContent = currentFacts[currentIndex];
  // Button event listeners
  prevBtn.addEventListener("click", function () {
    currentIndex = (currentIndex - 1 + currentFacts.length) % currentFacts.length;
    factDisplay.textContent = currentFacts[currentIndex];
  });
  nextBtn.addEventListener("click", function () {
    currentIndex = (currentIndex + 1) % currentFacts.length;
    factDisplay.textContent = currentFacts[currentIndex];
  });
});