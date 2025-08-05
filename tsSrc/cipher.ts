"use strict";

// Encrypts the input text using Caesar Cipher with the given shift
function encryptText(): void {
    const textInput = document.getElementById("text") as HTMLTextAreaElement | null;
    const shiftInput = document.getElementById("shift") as HTMLInputElement | null;
    const outputDiv = document.getElementById("output");

    if (!textInput || !shiftInput || !outputDiv) {
        console.error("Missing required DOM elements.");
        return;
    }

    const text = textInput.value;
    const shift = parseInt(shiftInput.value);

    if (!text || isNaN(shift) || shift < 0 || shift > 25) {
        showPopup("Please enter valid text and a shift between 0 and 25.");
        return;
    }

    const encrypted = caesarCipher(text, shift);
    outputDiv.innerHTML = `<strong>Encrypted:</strong> ${encrypted}`;
}

// Decrypts the input text by reversing the Caesar Cipher
function decryptText(): void {
    const textInput = document.getElementById("text") as HTMLTextAreaElement | null;
    const shiftInput = document.getElementById("shift") as HTMLInputElement | null;
    const outputDiv = document.getElementById("output");

    if (!textInput || !shiftInput || !outputDiv) {
        console.error("Missing required DOM elements.");
        return;
    }

    const text = textInput.value;
    const shift = parseInt(shiftInput.value);

    if (!text || isNaN(shift) || shift < 0 || shift > 25) {
        showPopup("Please enter valid text and a shift between 0 and 25.");
        return;
    }

    const decrypted = caesarCipher(text, -shift);
    outputDiv.innerHTML = `<strong>Decrypted:</strong> ${decrypted}`;
}

// Core Caesar Cipher logic
function caesarCipher(text: string, shift: number): string {
    return text.split('').map((char) => {
        if (/[a-zA-Z]/.test(char)) {
            const base = char === char.toLowerCase() ? 'a'.charCodeAt(0) : 'A'.charCodeAt(0);
            const shiftedCharCode = (char.charCodeAt(0) - base + (shift % 26) + 26) % 26 + base;
            return String.fromCharCode(shiftedCharCode);
        }
        return char;
    }).join('');
}

// Clears the input fields and output
function clearAll(): void {
    const textInput = document.getElementById("text") as HTMLTextAreaElement | null;
    const shiftInput = document.getElementById("shift") as HTMLInputElement | null;
    const outputDiv = document.getElementById("output");

    if (textInput) textInput.value = "";
    if (shiftInput) shiftInput.value = "";
    if (outputDiv) outputDiv.innerText = "";
}

// Copies the output text to clipboard
function copyToClipboard(): void {
    const outputDiv = document.getElementById("output");
    if (outputDiv && outputDiv.innerText.trim()) {
        navigator.clipboard.writeText(outputDiv.innerText)
            .then(() => showPopup("Output copied to clipboard!"))
            .catch(err => console.error("Clipboard copy failed:", err));
    }
}

function showPopup(message: string): void {
  const popup = document.getElementById("popup");
  const popupMessage = document.getElementById("popup-message");
  if (popup && popupMessage) {
      popupMessage.textContent = message;
      popup.classList.remove("hidden");
      setTimeout(() => closePopup(), 3000); // auto-close
  }
}

function closePopup(): void {
  const popup = document.getElementById("popup");
  if (popup) {
      popup.classList.add("hidden");
  }
}

