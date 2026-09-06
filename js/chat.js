// ============================================
// chat.js — AI Chat Logic (Fixed for OpenRouter)
// ============================================

const Chat = (() => {
  const HISTORY_KEY = 'socratic_chat_history';
  const MAX_HISTORY = 40;

  let currentMode = 'socratic';
  let conversationHistory = [];
  let isTyping = false;
  let currentSubject = null;

  let messagesEl, inputEl, sendBtn;

  function init() {
    messagesEl = document.getElementById('chat-messages');
    inputEl = document.getElementById('chat-input');
    sendBtn = document.getElementById('send-btn');

    inputEl.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });

    sendBtn.addEventListener('click', sendMessage);
  }

  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || isTyping) return;

    addMessage('user', text);
    inputEl.value = '';

    conversationHistory.push({ role: 'user', content: text });

    isTyping = true;
    const typingId = showTyping();

    try {
      const reply = await callAI();

      removeTyping(typingId);
      addMessage('assistant', reply);

      conversationHistory.push({ role: 'assistant', content: reply });

    } catch (err) {
      removeTyping(typingId);
      addMessage('assistant', '⚠️ Error: ' + err.message);
    }

    isTyping = false;
  }

  async function callAI() {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: conversationHistory
      })
    });

    if (!response.ok) {
      throw new Error("Server error");
    }

    const data = await response.json();
    console.log("API RESPONSE:", data);

    // ✅ FIXED: correct response parsing
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    }
    if (data.error) {
  return "API Error: " + data.error.message;
}

    return "No response from AI";
  }

  function addMessage(role, content) {
    const div = document.createElement('div');
    div.className = `message message-${role}`;
    div.innerHTML = `<b>${role === 'user' ? 'You' : 'AI'}:</b> ${content}`;
    messagesEl.appendChild(div);
  }

  function showTyping() {
    const id = 'typing';
    const div = document.createElement('div');
    div.id = id;
    div.innerHTML = "AI is typing...";
    messagesEl.appendChild(div);
    return id;
  }

  function removeTyping(id) {
    document.getElementById(id)?.remove();
  }

  return { init };
})();