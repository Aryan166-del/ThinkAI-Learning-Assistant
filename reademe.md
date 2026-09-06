# 🦉 Socratic AI Tutor

**AI Essential — Patent Project**
An adaptive AI tutoring system with Socratic & Direct Answer modes.

---

## ⚡ How to Run (VS Code)

### Step 1 — Get your Anthropic API Key
1. Go to https://console.anthropic.com
2. Sign up / Log in
3. Go to **API Keys** → click **Create Key**
4. Copy the key (starts with `sk-ant-...`)

### Step 2 — Add your API key
Open `server.js` and replace line 8:
```js
const ANTHROPIC_API_KEY = 'YOUR_API_KEY_HERE';
// Replace with your actual key:
const ANTHROPIC_API_KEY = 'sk-ant-xxxxxxxxxxxxxxxxxx';
```

### Step 3 — Open Terminal in VS Code
Press **Ctrl + `** (backtick) to open terminal

### Step 4 — Start the server
```bash
node server.js
```

You should see:
```
  🦉 Socratic AI Server running!
  Open: http://localhost:3000
```

### Step 5 — Open in browser
Go to: **http://localhost:3000**

---

## 📁 Project Structure
```
socratic-ai/
├── server.js        ← Backend proxy server (run this!)
├── package.json     ← Project info
├── index.html       ← Login page
├── chat.html        ← Main AI chat
├── profile.html     ← Progress & achievements
├── topics.html      ← Browse subjects
├── about.html       ← Patent information
├── css/
│   └── style.css    ← All styles
└── js/
    ├── auth.js      ← Login & user accounts
    ├── chat.js      ← AI chat logic
    └── app.js       ← Shared utilities
```

---

## 🔑 Demo Account
- **Email:** demo@socratic.ai
- **Password:** Demo@1234

---

## 🌐 Features
- Real email/password authentication
- 🎓 Socratic Mode — AI asks guiding questions
- 💡 Direct Mode — AI gives full answers
- Web search — answers pulled from real websites
- 12 subjects covered
- XP, levels, streaks, achievements
- Patent documentation page