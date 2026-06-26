const STORAGE_KEY = 'naplan-adventure-progress';
const SESSION_KEY = 'naplan-session';

const BADGES = [
  { id: 'first-star', icon: '⭐', name: 'First Star', check: (p) => p.totalStars >= 1 },
  { id: 'reading-hero', icon: '📚', name: 'Reading Hero', check: (p) => p.reading.correct >= 5 },
  { id: 'word-wizard', icon: '✨', name: 'Word Wizard', check: (p) => p.language.correct >= 5 },
  { id: 'math-master', icon: '🔢', name: 'Math Master', check: (p) => p.numeracy.correct >= 5 },
  { id: 'story-star', icon: '✏️', name: 'Story Star', check: (p) => p.writing.promptsViewed >= 3 },
  { id: 'streak-3', icon: '🔥', name: '3 Day Streak', check: (p) => p.streak >= 3 },
  { id: 'super-learner', icon: '🏆', name: 'Super Learner', check: (p) => p.totalStars >= 20 },
  { id: 'melbourne-local', icon: '🦘', name: 'Melbourne Mate', check: (p) => p.reading.correct >= 3 },
];

const ENCOURAGEMENTS = [
  'Awesome!', 'You got it!', 'Super work!', 'Brilliant!', 'Well done!',
  'Fantastic!', 'You\'re a star!', 'Great thinking!', 'Nailed it!', 'Amazing!',
];

const CHEER_HEROES = ['🦸', '🦸‍♀️', '🦹', '⭐', '🌟', '✨', '💫', '🏆', '👏', '💪', '🚀', '🌈', '🎖️', '👑'];

const CHEER_PHRASES = [
  (n) => `Awesome, ${n}!`,
  (n) => `Super ${n}!`,
  (n) => `You're a STAR, ${n}!`,
  (n) => `WOW ${n} — you rock!`,
  (n) => `Brilliant work, ${n}!`,
  (n) => `Superhero ${n}!`,
  (n) => `So clever, ${n}!`,
  (n) => `High five, ${n}! 🙌`,
  (n) => `${n} is AMAZING!`,
  (n) => `Keep going, ${n}!`,
  (n) => `Nailed it, ${n}!`,
  (n) => `${n} = SUPERSTAR!`,
];

const GRAFFITI_WORDS = [
  { text: 'AWESOME!', color: '#ec4899' },
  { text: 'SUPER!', color: '#2563eb' },
  { text: 'YES!', color: '#059669' },
  { text: 'WOW!', color: '#ea580c' },
  { text: 'STAR!', color: '#eab308' },
  { text: 'COOL!', color: '#7c3aed' },
  { text: 'BAM!', color: '#dc2626' },
  { text: 'NICE!', color: '#0891b2' },
];

const HINTS = [
  'Read the story again carefully.',
  'Look for clues in the text.',
  'Try eliminating answers you know are wrong.',
  'Check the paragraph that talks about this.',
];

function getProgress() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (_) { /* ignore */ }
  return defaultProgress();
}

function defaultProgress() {
  return {
    totalStars: 0,
    streak: 0,
    lastVisit: null,
    reading: { correct: 0, attempted: 0, completed: [] },
    writing: { promptsViewed: 0, checklistsDone: 0 },
    language: { correct: 0, attempted: 0, spelling: 0, grammar: 0 },
    numeracy: { correct: 0, attempted: 0, completed: [] },
    badges: [],
  };
}

function saveProgress(progress) {
  const today = new Date().toDateString();
  if (progress.lastVisit !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (progress.lastVisit === yesterday.toDateString()) {
      progress.streak = (progress.streak || 0) + 1;
    } else if (progress.lastVisit !== today) {
      progress.streak = 1;
    }
    progress.lastVisit = today;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  updateHeaderStars(progress);
  checkBadges(progress);
  return progress;
}

function awardStar(domain, questionId) {
  const progress = getProgress();
  const key = domain;
  if (!progress[key]) return progress;

  if (domain === 'reading' || domain === 'numeracy') {
    if (!progress[key].completed.includes(questionId)) {
      progress[key].completed.push(questionId);
      progress[key].correct++;
      progress.totalStars++;
    }
  } else if (domain === 'language') {
    progress[key].correct++;
    progress.totalStars++;
  }

  return saveProgress(progress);
}

function recordAttempt(domain) {
  const progress = getProgress();
  if (progress[domain]) {
    progress[domain].attempted = (progress[domain].attempted || 0) + 1;
    saveProgress(progress);
  }
}

function recordWritingView() {
  const progress = getProgress();
  progress.writing.promptsViewed++;
  saveProgress(progress);
}

function updateHeaderStars(progress) {
  const el = document.getElementById('total-stars');
  if (el) el.textContent = progress.totalStars || 0;

  document.querySelectorAll('[data-progress]').forEach((node) => {
    const domain = node.dataset.progress;
    const p = progress[domain];
    if (!p) return;
    if (domain === 'reading' || domain === 'numeracy') {
      node.textContent = `${p.correct} ⭐`;
    } else if (domain === 'language') {
      node.textContent = `${p.correct} ⭐`;
    } else if (domain === 'writing') {
      node.textContent = `${p.promptsViewed} prompts`;
    }
  });
}

function checkBadges(progress) {
  BADGES.forEach((badge) => {
    if (!progress.badges.includes(badge.id) && badge.check(progress)) {
      progress.badges.push(badge.id);
      saveProgress(progress);
    }
  });
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getSession() {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    if (data) return JSON.parse(data);
  } catch (_) { /* ignore */ }
  return { childName: null, startedAt: null };
}

function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  updatePersonalizedUI();
}

function getChildName() {
  return getSession().childName || 'Superstar';
}

function cheerOnCorrect(extraMessage = '') {
  const name = getChildName();
  const phrase = randomItem(CHEER_PHRASES)(name);
  const hero = randomItem(CHEER_HEROES);

  launchMiniConfetti();
  spawnFallingGraffiti();
  spawnCheerBubble(phrase, hero);
  spawnFloatingStars(8);

  if (extraMessage) return `${phrase} ${extraMessage}`;
  return phrase;
}

function spawnFallingGraffiti() {
  const name = getChildName();
  const fallItems = [
    ...GRAFFITI_WORDS.map((g) => ({ text: g.text, color: g.color })),
    { text: `${name.toUpperCase()}!`, color: '#ec4899' },
    { text: 'SUPER!', color: '#2563eb' },
    { text: '🦸 SUPER!', color: '#7c3aed' },
    { text: '⭐ STAR!', color: '#eab308' },
  ];

  const total = 14;
  for (let i = 0; i < total; i++) {
    const item = i < 4
      ? { text: randomItem(CHEER_HEROES), color: null, hero: true }
      : randomItem(fallItems);

    const el = document.createElement('div');
    el.className = 'cheer-graffiti-fall' + (item.hero ? ' hero-fall' : '');
    el.textContent = item.text;
    if (item.color) el.style.color = item.color;
    el.style.left = `${2 + Math.random() * 88}%`;
    el.style.setProperty('--rot', `${-30 + Math.random() * 60}deg`);
    const duration = 0.7 + Math.random() * 0.7;
    el.style.animationDuration = `${duration}s`;
    el.style.animationDelay = `${Math.random() * 0.35}s`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), (duration + 0.4) * 1000);
  }
}

function spawnCheerBubble(phrase, hero) {
  const styles = ['style-pink', 'style-green', 'style-purple', 'style-orange', 'style-blue'];
  const bubble = document.createElement('div');
  bubble.className = `cheer-bubble ${randomItem(styles)}`;
  bubble.style.left = `${35 + Math.random() * 30}%`;
  bubble.style.top = `${28 + Math.random() * 20}%`;
  bubble.innerHTML = `<span class="cheer-hero">${hero}</span><span class="cheer-text">${phrase}</span>`;
  document.body.appendChild(bubble);
  setTimeout(() => bubble.remove(), 1500);
}

function ensureCheerLayer() {
  let layer = document.getElementById('cheer-layer');
  if (!layer) {
    layer = document.createElement('div');
    layer.id = 'cheer-layer';
    layer.className = 'cheer-layer';
    document.body.appendChild(layer);
  }
  return layer;
}

function spawnFloatingStars(count) {
  const stars = ['⭐', '🌟', '✨', '💫', '⭐️'];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'cheer-star';
    el.textContent = randomItem(stars);
    el.style.left = `${10 + Math.random() * 80}%`;
    el.style.top = `${40 + Math.random() * 40}%`;
    el.style.animationDelay = `${Math.random() * 0.2}s`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1400);
  }
}

function launchMiniConfetti() {
  const colors = ['#ff6b6b', '#4ecdc4', '#ffd166', '#a78bfa', '#06d6a0', '#ff9ff3', '#54a0ff'];
  const durationMs = 2000;
  const pieceCount = 45;

  for (let i = 0; i < pieceCount; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const size = 12 + Math.floor(Math.random() * 16);
    piece.style.width = size + 'px';
    piece.style.height = (size * (0.6 + Math.random() * 0.8)).toFixed(0) + 'px';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = Math.random() * 0.4 + 's';
    piece.style.animationDuration = durationMs + 'ms';
    piece.style.borderRadius = Math.random() > 0.4 ? '50%' : `${Math.floor(Math.random() * 6)}px`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), durationMs + 300);
  }
}

function updatePersonalizedUI() {
  const name = getSession().childName;
  const greet = document.getElementById('child-greeting');
  if (greet) {
    greet.textContent = name ? `Hi, ${name}! 👋` : '';
    greet.style.display = name ? 'inline' : 'none';
  }

  const heroTitle = document.getElementById('hero-title');
  if (heroTitle && name) {
    heroTitle.textContent = `Welcome, ${name}!`;
  }

  const heroSub = document.getElementById('hero-sub-text');
  if (heroSub && name) {
    heroSub.textContent = `Let's go on a NAPLAN adventure together, ${name}!`;
  }

  const progressName = document.getElementById('progress-child-name');
  if (progressName && name) {
    progressName.textContent = `${name}'s Progress`;
  }
}

function showSessionModal() {
  let overlay = document.getElementById('session-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'session-overlay';
    overlay.className = 'session-overlay';
    overlay.innerHTML = `
      <div class="session-box">
        <div class="session-mascot">🐨</div>
        <h2>Start Your Adventure!</h2>
        <p>What's your name? We'll cheer you on every step of the way!</p>
        <input type="text" class="session-input" id="session-name-input" placeholder="Your name" maxlength="20" autocomplete="off">
        <button class="btn btn-primary" id="session-start-btn" style="width:100%">Let's Go! 🚀</button>
      </div>`;
    document.body.appendChild(overlay);

    const input = overlay.querySelector('#session-name-input');
    const start = () => {
      const name = input.value.trim();
      if (!name) {
        input.style.borderColor = 'var(--coral)';
        input.placeholder = 'Please enter your name!';
        return;
      }
      saveSession({ childName: name, startedAt: Date.now() });
      overlay.classList.add('hidden');
      launchConfetti();
      showCelebration(`Welcome, ${name}! Let's learn!`, '🦸');
    };

    overlay.querySelector('#session-start-btn').addEventListener('click', start);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') start(); });
  }

  overlay.classList.remove('hidden');
  const input = overlay.querySelector('#session-name-input');
  if (input) {
    input.value = getSession().childName || '';
    input.style.borderColor = '';
    setTimeout(() => input.focus(), 300);
  }
}

function injectSessionUI() {
  const headerActions = document.querySelector('.header-inner > div:last-child');
  if (headerActions && !document.getElementById('child-greeting')) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-direction:column;align-items:flex-end;gap:0.2rem';
    wrap.innerHTML = `
      <span class="child-greeting" id="child-greeting"></span>
      <button type="button" class="new-session-btn" id="new-session-btn">New Session</button>
    `;
    headerActions.insertBefore(wrap, headerActions.firstChild);

    document.getElementById('new-session-btn')?.addEventListener('click', () => {
      if (confirm('Start a new session? You can enter a new name. Your stars and badges are kept!')) {
        saveSession({ childName: null, startedAt: null });
        showSessionModal();
      }
    });
  }
}

function initSession() {
  injectSessionUI();
  updatePersonalizedUI();
  if (!getSession().childName) {
    showSessionModal();
  }
}

function showCelebration(message, emoji = '🎉') {
  let overlay = document.getElementById('celebration-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'celebration-overlay';
    overlay.className = 'celebration';
    overlay.innerHTML = `
      <div class="celebration-box">
        <div class="celebration-emoji"></div>
        <h2></h2>
        <button class="btn btn-primary" onclick="this.closest('.celebration').classList.add('hidden')">Yay!</button>
      </div>`;
    document.body.appendChild(overlay);
  }
  overlay.querySelector('.celebration-emoji').textContent = emoji;
  overlay.querySelector('h2').textContent = message;
  overlay.classList.remove('hidden');
  launchConfetti();
  spawnFallingGraffiti();
}

function launchConfetti() {
  const colors = ['#ff6b6b', '#4ecdc4', '#ffd166', '#a78bfa', '#06d6a0', '#ff9ff3', '#54a0ff'];
  const durationMs = 6250;
  const pieceCount = 70;

  for (let i = 0; i < pieceCount; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const size = 16 + Math.floor(Math.random() * 20);
    piece.style.width = size + 'px';
    piece.style.height = (size * (0.6 + Math.random() * 0.8)).toFixed(0) + 'px';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = Math.random() * 1.2 + 's';
    piece.style.animationDuration = durationMs + 'ms';
    piece.style.borderRadius = Math.random() > 0.4 ? '50%' : `${Math.floor(Math.random() * 6)}px`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), durationMs + 1500);
  }
}

function initTabs() {
  document.querySelectorAll('.activity-tabs').forEach((tabBar) => {
    tabBar.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const panelId = btn.dataset.panel;
        const container = tabBar.closest('.container') || document;
        tabBar.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        container.querySelectorAll('.activity-panel').forEach((p) => p.classList.remove('active'));
        const panel = document.getElementById(panelId);
        if (panel) panel.classList.add('active');
      });
    });
  });
}

function initParentMode() {
  const toggle = document.getElementById('parent-mode');
  if (!toggle) return;
  const saved = localStorage.getItem('naplan-parent-mode') === 'true';
  toggle.checked = saved;
  document.body.classList.toggle('parent-mode', saved);
  toggle.addEventListener('change', () => {
    document.body.classList.toggle('parent-mode', toggle.checked);
    localStorage.setItem('naplan-parent-mode', toggle.checked);
  });
}

function normalizePage(pathname) {
  let page = pathname.split('/').pop() || 'index.html';
  if (!page || page === '') page = 'index.html';
  if (!page.includes('.')) page += '.html';
  return page;
}

const SUBJECT_PAGES = new Set(['reading.html', 'writing.html', 'language.html', 'numeracy.html']);

function initNav() {
  const path = normalizePage(window.location.pathname);

  document.querySelectorAll('.nav-links > li > a').forEach((a) => {
    a.classList.toggle('active', a.getAttribute('href') === path);
  });

  document.querySelectorAll('.nav-dropdown-menu a').forEach((a) => {
    a.classList.toggle('active', a.getAttribute('href') === path);
  });

  const subjectsBtn = document.getElementById('nav-subjects-btn');
  if (subjectsBtn && SUBJECT_PAGES.has(path)) {
    subjectsBtn.classList.add('active');
  }
}

function initNavDropdown() {
  const btn = document.getElementById('nav-subjects-btn');
  const dropdown = btn?.closest('.nav-dropdown');
  if (!btn || !dropdown) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = dropdown.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  document.addEventListener('click', () => {
    dropdown.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  });

  dropdown.querySelector('.nav-dropdown-menu')?.addEventListener('click', (e) => {
    e.stopPropagation();
  });
}

function detectBasePath() {
  const meta = document.querySelector('meta[name="base-path"]');
  if (!meta) return;
  const match = window.location.pathname.match(/^\/([^/]+)\//);
  if (match) meta.content = '/' + match[1] + '/';
}

document.addEventListener('DOMContentLoaded', () => {
  detectBasePath();
  initSession();
  saveProgress(getProgress());
  updateHeaderStars(getProgress());
  initTabs();
  initParentMode();
  initNav();
  initNavDropdown();
});
