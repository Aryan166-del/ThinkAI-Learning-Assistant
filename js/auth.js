// ============================================
// auth.js — Real Authentication Logic
// Uses localStorage as persistent user store
// ============================================

const Auth = (() => {

  const USERS_KEY  = 'socratic_users';
  const SESSION_KEY = 'socratic_session';

  // ── Seed a demo user on first load ──
  function init() {
    const users = getUsers();
    if (!users['demo@socratic.ai']) {
      users['demo@socratic.ai'] = {
        id: 'user_demo',
        name: 'Demo Student',
        email: 'demo@socratic.ai',
        password: hashPassword('Demo@1234'),
        avatar: 'DS',
        joined: new Date().toISOString(),
        stats: { sessions: 0, questions: 0, streak: 0, lastActive: null, xp: 0 },
        subjects: [],
        mode: 'socratic'
      };
      saveUsers(users);
    }
  }

  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; } catch { return {}; }
  }
  function saveUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }

  function hashPassword(pw) {
    // Simple deterministic hash (not cryptographic — for demo/student project)
    let h = 0;
    for (let i = 0; i < pw.length; i++) { h = ((h << 5) - h) + pw.charCodeAt(i); h |= 0; }
    return 'h_' + Math.abs(h).toString(36) + '_' + pw.length;
  }

  // ── Validation helpers ──
  function validateEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
  function validatePassword(p) {
    if (p.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(p)) return 'Password must include an uppercase letter.';
    if (!/[0-9]/.test(p)) return 'Password must include a number.';
    return null;
  }
  function validateName(n) {
    if (!n || n.trim().length < 2) return 'Name must be at least 2 characters.';
    if (n.trim().length > 50) return 'Name is too long.';
    return null;
  }

  // ── Register ──
  function register({ name, email, password, confirmPassword }) {
    const errors = {};
    const nameErr = validateName(name);
    if (nameErr) errors.name = nameErr;
    if (!validateEmail(email)) errors.email = 'Please enter a valid email address.';
    const pwErr = validatePassword(password);
    if (pwErr) errors.password = pwErr;
    if (password !== confirmPassword) errors.confirm = 'Passwords do not match.';

    if (Object.keys(errors).length) return { ok: false, errors };

    const users = getUsers();
    if (users[email.toLowerCase()]) {
      return { ok: false, errors: { email: 'An account with this email already exists.' } };
    }

    const uid = 'user_' + Date.now();
    const initials = name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    users[email.toLowerCase()] = {
      id: uid,
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashPassword(password),
      avatar: initials,
      joined: new Date().toISOString(),
      stats: { sessions: 0, questions: 0, streak: 0, lastActive: null, xp: 0 },
      subjects: [],
      mode: 'socratic'
    };
    saveUsers(users);
    createSession(users[email.toLowerCase()]);
    return { ok: true };
  }

  // ── Login ──
  function login({ email, password }) {
    const errors = {};
    if (!validateEmail(email)) errors.email = 'Please enter a valid email address.';
    if (!password) errors.password = 'Password is required.';
    if (Object.keys(errors).length) return { ok: false, errors };

    const users = getUsers();
    const user = users[email.toLowerCase()];
    if (!user) return { ok: false, errors: { email: 'No account found with this email.' } };
    if (user.password !== hashPassword(password)) {
      return { ok: false, errors: { password: 'Incorrect password.' } };
    }

    // Update last active & streak
    const today = new Date().toDateString();
    const last = user.stats.lastActive;
    if (last !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      user.stats.streak = (last === yesterday) ? (user.stats.streak || 0) + 1 : 1;
      user.stats.lastActive = today;
    }
    user.stats.sessions = (user.stats.sessions || 0) + 1;
    saveUsers(users);
    createSession(user);
    return { ok: true };
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'index.html';
  }

  function createSession(user) {
    const session = {
      userId: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function getSession() {
    try {
      const s = JSON.parse(localStorage.getItem(SESSION_KEY));
      if (!s || Date.now() > s.expiresAt) { localStorage.removeItem(SESSION_KEY); return null; }
      return s;
    } catch { return null; }
  }

  function requireAuth() {
    const s = getSession();
    if (!s) { window.location.href = 'index.html'; return null; }
    return s;
  }

  function getCurrentUser() {
    const s = getSession();
    if (!s) return null;
    const users = getUsers();
    return users[s.email] || null;
  }

  function updateUser(updates) {
    const s = getSession();
    if (!s) return;
    const users = getUsers();
    if (!users[s.email]) return;
    Object.assign(users[s.email], updates);
    saveUsers(users);
    // refresh session name/avatar if changed
    if (updates.name || updates.avatar) {
      s.name = updates.name || s.name;
      s.avatar = updates.avatar || s.avatar;
      localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    }
  }

  function updateStats(delta) {
    const user = getCurrentUser();
    if (!user) return;
    Object.keys(delta).forEach(k => {
      user.stats[k] = (user.stats[k] || 0) + delta[k];
    });
    updateUser({ stats: user.stats });
  }

  function setMode(mode) {
    updateUser({ mode });
  }

  // ── Redirect if already logged in ──
  function redirectIfAuthed(dest = 'chat.html') {
    if (getSession()) window.location.href = dest;
  }

  init();

  return { register, login, logout, getSession, requireAuth, getCurrentUser, updateUser, updateStats, setMode, redirectIfAuthed };
})();

// ── Shared nav injection for logged-in pages ──
function injectNav(activePage) {
  const s = Auth.requireAuth();
  if (!s) return;
  const user = Auth.getCurrentUser();
  const nav = document.getElementById('main-nav');
  if (!nav) return;
  nav.innerHTML = `
    <a class="nav-logo" href="chat.html">
      <div class="logo-icon">🦉</div>
      Socratic AI
    </a>
    <div class="nav-links">
      <a href="chat.html" class="${activePage==='chat'?'active':''}">💬 Chat</a>
      <a href="topics.html" class="${activePage==='topics'?'active':''}">📚 Topics</a>
      <a href="profile.html" class="${activePage==='profile'?'active':''}">📊 Progress</a>
      <a href="about.html" class="${activePage==='about'?'active':''}">📄 About</a>
    </div>
    <div class="nav-right">
      <span class="nav-user-name">${s.name.split(' ')[0]}</span>
      <div class="nav-avatar" title="${s.name}">${s.avatar}</div>
      <button class="btn btn-ghost btn-sm" onclick="Auth.logout()">Sign Out</button>
    </div>
  `;
}

// ── Toast utility ──
function showToast(msg, type = 'info', duration = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(100%)'; t.style.transition = 'all 0.3s'; setTimeout(() => t.remove(), 300); }, duration);
}