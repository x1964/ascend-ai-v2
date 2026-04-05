/* ════════════════════════════════════════════
   ASCEND AI V2 — App JavaScript
════════════════════════════════════════════ */
'use strict';

/* ── Toast ── */
const Toast = {
  container: null,
  init() {
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      document.body.appendChild(this.container);
    }
  },
  show(message, type = 'info', duration = 3500) {
    if (!this.container) this.init();
    const icons = { success: '✅', error: '❌', info: 'ℹ️', xp: '⚡' };
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span>${icons[type] || '•'}</span><span>${message}</span>`;
    this.container.appendChild(el);
    setTimeout(() => {
      el.classList.add('toast-fade-out');
      el.addEventListener('animationend', () => el.remove());
    }, duration);
  }
};

/* ── Mobile Sidebar ── */
function initMobileSidebar() {
  const toggle  = document.querySelector('.mobile-nav-toggle');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  if (!toggle) return;
  const open  = () => { sidebar.classList.add('open'); overlay.classList.add('show'); };
  const close = () => { sidebar.classList.remove('open'); overlay.classList.remove('show'); };
  toggle.addEventListener('click', open);
  overlay?.addEventListener('click', close);
}

/* ── Active nav ── */
function setActiveNav() {
  const path = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-item').forEach(item => {
    const href = (item.getAttribute('href') || '').split('/').pop();
    item.classList.toggle('active', href === path);
  });
}

/* ── Auth tabs ── */
function initAuthTabs() {
  const tabs  = document.querySelectorAll('.auth-tab');
  const forms = document.querySelectorAll('.auth-form');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      forms.forEach(f => f.classList.add('hidden'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.target)?.classList.remove('hidden');
    });
  });

  // support ?tab=register deep link
  if (window.location.hash === '#register') {
    const regTab = document.querySelector('[data-target="register-form-wrap"]');
    regTab?.click();
  }
}

/* ── Login ── */
async function handleLogin(e) {
  e.preventDefault();
  const form  = e.target;
  const btn   = form.querySelector('[type=submit]');
  const email = form.querySelector('#login-email').value.trim();
  const pass  = form.querySelector('#login-password').value;
  clearErrors(form);
  if (!email || !pass) { showError(form, 'Please fill in all fields.'); return; }
  setLoading(btn, true, 'dark');
  try {
    const res  = await fetch('../backend/login.php', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email, password: pass }) });
    const data = await res.json();
    if (data.success) {
      Toast.show('Welcome back! ⚡', 'success');
      setTimeout(() => window.location.href = 'dashboard.html', 700);
    } else { showError(form, data.message || 'Invalid credentials.'); }
  } catch { showError(form, 'Connection error. Is the server running?'); }
  finally { setLoading(btn, false); }
}

/* ── Register ── */
async function handleRegister(e) {
  e.preventDefault();
  const form  = e.target;
  const btn   = form.querySelector('[type=submit]');
  const name  = form.querySelector('#reg-name').value.trim();
  const email = form.querySelector('#reg-email').value.trim();
  const pass  = form.querySelector('#reg-password').value;
  const conf  = form.querySelector('#reg-confirm').value;
  clearErrors(form);
  if (!name || !email || !pass) { showError(form, 'Please fill in all fields.'); return; }
  if (pass !== conf) { showError(form, 'Passwords do not match.'); return; }
  if (pass.length < 6) { showError(form, 'Password must be at least 6 characters.'); return; }
  setLoading(btn, true, 'dark');
  try {
    const res  = await fetch('../backend/register.php', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name, email, password: pass }) });
    const data = await res.json();
    if (data.success) {
      Toast.show('Account created! Ascending… ⚡', 'success');
      setTimeout(() => window.location.href = 'dashboard.html', 800);
    } else { showError(form, data.message || 'Registration failed.'); }
  } catch { showError(form, 'Connection error. Is the server running?'); }
  finally { setLoading(btn, false); }
}

/* ── Dashboard ── */
async function loadDashboard() {
  try {
    const res  = await fetch('../backend/getUser.php');
    const data = await res.json();
    if (!data.success) { window.location.href = 'index.html'; return; }
    const u = data.user;
    const level      = Math.floor(u.xp / 100) + 1;
    const xpInLevel  = u.xp % 100;
    const hours      = new Date().getHours();
    const greet      = hours < 12 ? 'Good morning' : hours < 17 ? 'Good afternoon' : 'Good evening';

    setEl('greeting-text', `${greet}, ${u.name.split(' ')[0]} 👋`);
    setEl('stat-xp',     u.xp);
    setEl('stat-level',  level);
    setEl('stat-streak', `${u.streak || 0}🔥`);
    setEl('xp-bar-fill', null, { style: `width:${xpInLevel}%` });
    setEl('xp-current',  `${xpInLevel} / 100 XP`);
    setEl('xp-level',    `LVL ${level}`);
    setSidebarUser(u);
  } catch { /* silent */ }

  try {
    const res  = await fetch('../backend/getTasks.php?limit=5');
    const data = await res.json();
    if (data.success) renderDashboardTasks(data.tasks);
  } catch { /* silent */ }
}

function renderDashboardTasks(tasks) {
  const list = document.getElementById('dashboard-task-list');
  if (!list) return;
  if (!tasks.length) {
    list.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><p>No tasks yet. Add your first task!</p></div>';
    return;
  }
  list.innerHTML = tasks.map(t => `
    <div class="task-item ${t.completed ? 'completed' : ''}" data-id="${t.id}">
      <div class="task-check ${t.completed ? 'checked' : ''}" onclick="toggleTask(${t.id},this)"></div>
      <div class="task-body">
        <div class="task-title">${esc(t.title)}</div>
        <div class="task-meta">${t.completed ? '✓ Done' : '● Pending'}</div>
      </div>
      <span class="task-xp">+${t.xp_reward} XP</span>
    </div>
  `).join('');
}

/* ── Tasks Page ── */
async function loadTasks() {
  await loadUserMeta();
  try {
    const res  = await fetch('../backend/getTasks.php');
    const data = await res.json();
    if (data.success) {
      window._allTasks = data.tasks;
      renderTasks(data.tasks);
      updateTaskStats(data.tasks);
    }
  } catch { /* silent */ }
}

function renderTasks(tasks) {
  const list = document.getElementById('task-list');
  if (!list) return;
  if (!tasks.length) {
    list.innerHTML = '<div class="empty-state"><div class="empty-icon">🎯</div><p>No tasks here. Create your first one above!</p></div>';
    return;
  }
  list.innerHTML = tasks.map(t => `
    <div class="task-item ${t.completed ? 'completed' : ''}" data-id="${t.id}">
      <div class="task-check ${t.completed ? 'checked' : ''}" onclick="toggleTask(${t.id},this)"></div>
      <div class="task-body">
        <div class="task-title">${esc(t.title)}</div>
        <div class="task-meta">${t.completed ? '✓ Completed' : '● Pending'} · ${timeAgo(t.created_at)}</div>
      </div>
      <span class="task-xp">+${t.xp_reward} XP</span>
      <button class="task-delete" onclick="deleteTask(${t.id})" title="Delete">🗑</button>
    </div>
  `).join('');
}

function updateTaskStats(tasks) {
  const done = tasks.filter(t => t.completed).length;
  setEl('stat-total',   tasks.length);
  setEl('stat-done',    done);
  setEl('stat-pending', tasks.length - done);
}

async function addTask(e) {
  e.preventDefault();
  const input = document.getElementById('new-task-input');
  const title = input?.value.trim();
  if (!title) return;
  try {
    const res  = await fetch('../backend/addTask.php', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ title }) });
    const data = await res.json();
    if (data.success) {
      input.value = '';
      Toast.show('Task added! Complete it to earn +10 XP ⚡', 'xp');
      loadTasks();
    } else { Toast.show(data.message || 'Failed to add task.', 'error'); }
  } catch { Toast.show('Connection error.', 'error'); }
}

async function toggleTask(id, el) {
  const item      = el.closest('.task-item');
  const completed = !item.classList.contains('completed');
  try {
    const res  = await fetch('../backend/updateTask.php', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id, completed }) });
    const data = await res.json();
    if (data.success) {
      item.classList.toggle('completed', completed);
      el.classList.toggle('checked', completed);
      if (completed) Toast.show('+10 XP earned! Keep it up! ⚡', 'xp');
      if (window._allTasks) {
        const t = window._allTasks.find(t => t.id == id);
        if (t) t.completed = completed ? 1 : 0;
        updateTaskStats(window._allTasks);
      }
    }
  } catch { /* silent */ }
}

async function deleteTask(id) {
  if (!confirm('Delete this task?')) return;
  try {
    const res  = await fetch('../backend/deleteTask.php', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id }) });
    const data = await res.json();
    if (data.success) { Toast.show('Task deleted.', 'info'); loadTasks(); }
  } catch { /* silent */ }
}

function filterTasks(type) {
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  document.querySelector(`[data-filter="${type}"]`)?.classList.add('active');
  if (!window._allTasks) return;
  let tasks = window._allTasks;
  if (type === 'active')    tasks = tasks.filter(t => !t.completed);
  if (type === 'completed') tasks = tasks.filter(t =>  t.completed);
  renderTasks(tasks);
}

/* ── AI Chat ── */
let chatHistory = [];

async function sendMessage() {
  const textarea = document.getElementById('chat-input');
  const msg      = textarea?.value.trim();
  if (!msg) return;
  textarea.value = '';
  autoResize(textarea);

  document.getElementById('chat-welcome')?.classList.add('hidden');
  appendMessage('user', msg);
  chatHistory.push({ role: 'user', content: msg });

  const typingEl = showTyping();
  const sendBtn  = document.querySelector('.chat-send-btn');
  if (sendBtn) sendBtn.disabled = true;

  try {
    const res  = await fetch('../backend/chat.php', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ message: msg, history: chatHistory }) });
    const data = await res.json();
    typingEl.remove();
    if (data.success) {
      appendMessage('ai', data.reply);
      chatHistory.push({ role: 'assistant', content: data.reply });
    } else {
      appendMessage('ai', `⚠️ ${data.message || 'Something went wrong. Add your OpenAI key in Profile.'}`);
    }
  } catch {
    typingEl.remove();
    appendMessage('ai', '⚠️ Server error. Make sure PHP is running.');
  } finally {
    if (sendBtn) sendBtn.disabled = false;
  }
}

function appendMessage(role, text) {
  const list = document.getElementById('chat-messages');
  if (!list) return;
  const now  = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
  const div  = document.createElement('div');
  div.className = `message ${role}`;
  div.innerHTML = `
    <div class="message-avatar">${role === 'ai' ? '⚡' : '👤'}</div>
    <div>
      <div class="message-bubble">${fmtMsg(text)}</div>
      <div class="message-time">${now}</div>
    </div>
  `;
  list.appendChild(div);
  list.scrollTop = list.scrollHeight;
}

function fmtMsg(text) {
  return text
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
    .replace(/`(.*?)`/g,'<code style="background:rgba(200,255,0,0.12);padding:2px 6px;border-radius:4px;font-size:0.85em;font-family:var(--font-mono)">$1</code>')
    .replace(/\n/g,'<br>');
}

function showTyping() {
  const list = document.getElementById('chat-messages');
  const div  = document.createElement('div');
  div.className = 'message ai';
  div.innerHTML = `
    <div class="message-avatar">⚡</div>
    <div class="typing-indicator">
      <span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>
    </div>
  `;
  list.appendChild(div);
  list.scrollTop = list.scrollHeight;
  return div;
}

function useSuggestion(text) {
  const t = document.getElementById('chat-input');
  if (t) { t.value = text; t.focus(); autoResize(t); }
}

function initChatInput() {
  const t = document.getElementById('chat-input');
  if (!t) return;
  t.addEventListener('input', () => autoResize(t));
  t.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 130) + 'px';
}

/* ── Profile ── */
async function loadProfile() {
  try {
    const res  = await fetch('../backend/getUser.php');
    const data = await res.json();
    if (!data.success) { window.location.href = 'index.html'; return; }
    const u = data.user;
    const level     = Math.floor(u.xp / 100) + 1;
    const xpInLevel = u.xp % 100;
    setEl('profile-name',           u.name);
    setEl('profile-email',          u.email);
    setEl('profile-avatar-letter',  u.name.charAt(0).toUpperCase());
    setEl('profile-level-badge',    `⚡ Level ${level}`);
    setEl('profile-xp-bar',         null, { style:`width:${xpInLevel}%` });
    setEl('profile-xp-text',        `${u.xp} total XP · ${xpInLevel}/100 to next level`);
    setEl('ach-xp',                 u.xp);
    setEl('ach-level',              level);
    setEl('ach-tasks',              u.tasks_done || 0);
    setEl('ach-streak',             `${u.streak || 0} 🔥`);
    const nameIn  = document.getElementById('settings-name');
    const emailIn = document.getElementById('settings-email');
    if (nameIn)  nameIn.value  = u.name;
    if (emailIn) emailIn.value = u.email;
    setSidebarUser(u);
    // load cached key
    const keyIn = document.getElementById('api-key-input');
    if (keyIn && localStorage.getItem('openai_key')) keyIn.value = localStorage.getItem('openai_key');
  } catch { /* silent */ }
}

async function saveProfile(e) {
  e.preventDefault();
  const name  = document.getElementById('settings-name')?.value.trim();
  const email = document.getElementById('settings-email')?.value.trim();
  try {
    const res  = await fetch('../backend/updateProfile.php', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, email }) });
    const data = await res.json();
    if (data.success) Toast.show('Profile updated! ✨', 'success');
    else Toast.show(data.message || 'Update failed.', 'error');
  } catch { Toast.show('Connection error.', 'error'); }
}

async function saveApiKey() {
  const key = document.getElementById('api-key-input')?.value.trim();
  if (!key) { Toast.show('Please enter an API key.', 'error'); return; }
  try {
    const res  = await fetch('../backend/saveApiKey.php', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ api_key: key }) });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('openai_key', key);
      Toast.show('API key saved securely! 🔑', 'success');
    } else { Toast.show(data.message || 'Failed.', 'error'); }
  } catch { Toast.show('Connection error.', 'error'); }
}

function toggleApiKeyVisibility() {
  const input = document.getElementById('api-key-input');
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
}

async function confirmDeleteAccount() {
  if (!confirm('This will permanently delete your account. Are you sure?')) return;
  try {
    const res  = await fetch('../backend/deleteAccount.php', { method:'POST' });
    const data = await res.json();
    if (data.success) {
      Toast.show('Account deleted.', 'info');
      setTimeout(() => window.location.href = 'landing.html', 1000);
    }
  } catch { /* silent */ }
}

/* ── Logout ── */
async function logout() {
  await fetch('../backend/logout.php');
  window.location.href = 'landing.html';
}

/* ── Load sidebar user ── */
async function loadUserMeta() {
  try {
    const res  = await fetch('../backend/getUser.php');
    const data = await res.json();
    if (!data.success) { window.location.href = 'index.html'; return; }
    setSidebarUser(data.user);
  } catch { /* silent */ }
}

function setSidebarUser(u) {
  const level = Math.floor(u.xp / 100) + 1;
  setEl('user-avatar-text',   u.name.charAt(0).toUpperCase());
  setEl('sidebar-user-name',  u.name);
  setEl('sidebar-user-level', `LVL ${level}  ·  ${u.xp} XP`);
}

/* ── Helpers ── */
function setEl(id, text, attrs) {
  const el = document.getElementById(id);
  if (!el) return;
  if (text !== null && text !== undefined) el.textContent = text;
  if (attrs) Object.entries(attrs).forEach(([k,v]) => {
    if (k === 'style') el.style.cssText = v;
    else el.setAttribute(k, v);
  });
}
function showError(form, msg) {
  const err = form.querySelector('.form-error');
  if (err) { err.textContent = msg; err.classList.add('show'); }
}
function clearErrors(form) {
  form.querySelectorAll('.form-error').forEach(e => e.classList.remove('show'));
}
function setLoading(btn, loading, spinnerTheme) {
  if (loading) {
    btn.dataset.origText = btn.innerHTML;
    btn.innerHTML = `<span class="spinner ${spinnerTheme === 'dark' ? 'spinner-dark' : ''}"></span>`;
    btn.disabled = true;
  } else {
    btn.innerHTML = btn.dataset.origText || btn.innerHTML;
    btn.disabled = false;
  }
}
function esc(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  Toast.init();
  initMobileSidebar();
  setActiveNav();

  const page = window.location.pathname.split('/').pop();

  if (!page || page === 'index.html') {
    initAuthTabs();
    document.getElementById('login-form')?.addEventListener('submit', handleLogin);
    document.getElementById('register-form')?.addEventListener('submit', handleRegister);
  }
  if (page === 'dashboard.html') loadDashboard();
  if (page === 'tasks.html')     loadTasks();
  if (page === 'chat.html')      { loadUserMeta(); initChatInput(); }
  if (page === 'profile.html')   loadProfile();
});
