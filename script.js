// Fun facts array
const facts = [
  "They hop on rocks.",
  "They have yellow eyebrow feathers.",
  "They're strong swimmers and can dive deep."
];

let currentIndex = 0;

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", function () {
  const heading = document.querySelector("h1");

  heading.addEventListener("click", function () {
    heading.style.color = "#0077b6";
    alert("You clicked the penguin's name!");
  });

  // Carousel setup
  const factDisplay = document.getElementById("fact-display");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");

  // Show the first fact
  factDisplay.textContent = facts[currentIndex];

  // Handle Previous
  prevBtn.addEventListener("click", function () {
    currentIndex = (currentIndex - 1 + facts.length) % facts.length;
    factDisplay.textContent = facts[currentIndex];
  });

  // Handle Next
  nextBtn.addEventListener("click", function () {
    currentIndex = (currentIndex + 1) % facts.length;
    factDisplay.textContent = facts[currentIndex];
  });
});
