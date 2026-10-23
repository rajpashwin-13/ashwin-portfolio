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
const chatReset = document.querySelector('.chat-reset');
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

function addTypingIndicator() {
  const bubble = addChatMessage('', 'assistant');
  bubble.classList.add('typing-bubble');
  bubble.setAttribute('aria-label', 'Assistant is typing');
  const dots = document.createElement('span');
  dots.className = 'typing-dots';
  for (let i = 0; i < 3; i += 1) dots.append(document.createElement('i'));
  bubble.append(dots);
  return bubble;
}

async function sendPortfolioMessage(message, { retry = false } = {}) {
  if (!retry) addChatMessage(message, 'user');
  chatSuggestions.hidden = true;
  chatInput.value = '';
  chatInput.disabled = true;
  chatForm.querySelector('button').disabled = true;
  const pending = addTypingIndicator();
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12000);

  try {
    const requestHistory = [...chatHistory, { role: 'user', content: message }].slice(-8);
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history: requestHistory }),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'The assistant could not answer just now. Please try again.');
    if (typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('I didn’t get a reply that time. Please try again.');

    pending.remove();
    addChatMessage(data.reply.trim(), 'assistant');
    chatHistory.push({ role: 'user', content: message }, { role: 'assistant', content: data.reply.trim() });
  } catch (error) {
    pending.remove();
    const isTimeout = error.name === 'AbortError';
    const errorBubble = addChatMessage(isTimeout ? 'That took too long. Try once more in a moment.' : (error.message || 'I hit a connection issue. Please try again.'), 'assistant');
    errorBubble.classList.add('chat-error');
    const retryButton = document.createElement('button');
    retryButton.type = 'button';
    retryButton.className = 'chat-retry';
    retryButton.textContent = 'Try again ↻';
    retryButton.addEventListener('click', () => {
      errorBubble.remove();
      sendPortfolioMessage(message, { retry: true });
    }, { once: true });
    errorBubble.append(document.createElement('br'), retryButton);
  } finally {
    window.clearTimeout(timeout);
    chatInput.disabled = false;
    chatForm.querySelector('button').disabled = false;
    if (!chatPanel.hidden) chatInput.focus();
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

chatLauncher.addEventListener('click', () => setChatOpen(chatPanel.hidden));
chatClose.addEventListener('click', () => setChatOpen(false));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !chatPanel.hidden) setChatOpen(false);
});

chatReset.addEventListener('click', () => {
  chatHistory.length = 0;
  chatMessages.replaceChildren();
  addChatMessage('Hi! I can help you explore the portfolio. What would you like to know?', 'assistant').classList.add('welcome-message');
  chatSuggestions.hidden = false;
  chatInput.value = '';
  chatInput.focus();
});

chatSuggestions.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  const topic = button.querySelector('span') ? button.firstChild.textContent.trim() : button.textContent.trim();
  const questions = {
    Projects: 'What projects has Ashwin built?',
    Skills: 'What skills does Ashwin have?',
    Experience: 'Tell me about Ashwin’s experience.',
  };
  chatInput.value = questions[topic] || topic;
  chatForm.requestSubmit();
});

chatForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = chatInput.value.trim();
  if (message && !chatInput.disabled) sendPortfolioMessage(message);
});