const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.primary-nav');

toggle.addEventListener('click', () => {
  const isOpen = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!isOpen));
  toggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
  nav.classList.toggle('open', !isOpen);
});

nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
    nav.classList.remove('open');
  });
});

document.querySelector('#year').textContent = new Date().getFullYear();

const chatPanel = document.querySelector('#chat-panel');
const chatLauncher = document.querySelector('.chat-launcher');
const chatClose = document.querySelector('.chat-close');
const chatForm = document.querySelector('#chat-form');
const chatInput = document.querySelector('#chat-input');
const chatMessages = document.querySelector('#chat-messages');
const chatSuggestions = document.querySelector('#chat-suggestions');
const chatHistory = [];

function setChatOpen(isOpen) {
  chatPanel.hidden = !isOpen;
  chatLauncher.setAttribute('aria-expanded', String(isOpen));
  chatLauncher.setAttribute('aria-label', isOpen ? 'Close portfolio chat' : 'Open portfolio chat');
  if (isOpen) chatInput.focus();
}

function addChatMessage(text, role) {
  const message = document.createElement('div');
  message.className = `chat-message ${role === 'user' ? 'user-message' : 'assistant-message'}`;
  message.textContent = text;
  chatMessages.append(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return message;
}

chatLauncher.addEventListener('click', () => setChatOpen(chatPanel.hidden));
chatClose.addEventListener('click', () => setChatOpen(false));

chatSuggestions.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  chatInput.value = button.textContent;
  chatForm.requestSubmit();
});

chatForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;
  addChatMessage(message, 'user');
  chatHistory.push({ role: 'user', content: message });
  chatInput.value = '';
  chatInput.disabled = true;
  chatForm.querySelector('button').disabled = true;
  chatSuggestions.hidden = true;
  const pending = addChatMessage('Thinking…', 'assistant');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history: chatHistory.slice(-8) }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'The assistant is not available yet. Check the Vercel function and API key, then try again.');
    pending.textContent = data.reply;
    chatHistory.push({ role: 'assistant', content: data.reply });
  } catch (error) {
    pending.textContent = error.message || 'Could not reach the assistant. Please try again in a moment.';
  } finally {
    chatInput.disabled = false;
    chatForm.querySelector('button').disabled = false;
    chatInput.focus();
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});
