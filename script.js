// Get references to the HTML elements
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const chatWindow = document.getElementById('chatWindow');

// Initialize conversation history with system prompt
let messages = [
  {
    role: 'system',
    content: `You are a helpful assistant who only answers questions about L’Oréal products, routines, or beauty-related advice. Politely decline unrelated topics.`
  }
];

// Use your actual Cloudflare Worker endpoint
const workerUrl = 'https://cloudflareworker.xxsynth.workers.dev/';

// Append a message to the chat window
function appendMessage(text, sender) {
  const msg = document.createElement('div');
  msg.className = `msg ${sender}`;
  msg.textContent = text;
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Show welcome message
appendMessage("👋 Hello! Ask me anything about L’Oréal products or routines.", "ai");

// Handle form submission
chatForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const input = userInput.value.trim();
  if (!input) return;

  appendMessage(input, "user");
  userInput.value = "";
  appendMessage("...thinking...", "ai");

  messages.push({ role: 'user', content: input });

  try {
    const response = await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const reply = result.choices?.[0]?.message?.content || "Sorry, I couldn't understand that.";

    // Remove "...thinking..." message
    const allAI = chatWindow.querySelectorAll('.msg.ai');
    if (allAI.length && allAI[allAI.length - 1].textContent === "...thinking...") {
      allAI[allAI.length - 1].remove();
    }

    appendMessage(reply, "ai");
    messages.push({ role: 'assistant', content: reply });

  } catch (error) {
    console.error("Error:", error);

    const allAI = chatWindow.querySelectorAll('.msg.ai');
    if (allAI.length && allAI[allAI.length - 1].textContent === "...thinking...") {
      allAI[allAI.length - 1].remove();
    }

    appendMessage("⚠️ Sorry, something went wrong. Please try again later.", "ai");
  }
});
