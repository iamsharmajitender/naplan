const STORAGE_KEY = 'naplan-adventure-progress';

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
}

function launchConfetti() {
  const colors = ['#ff6b6b', '#4ecdc4', '#ffd166', '#a78bfa', '#06d6a0'];
  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = Math.random() * 0.5 + 's';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 3000);
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

function initNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
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
  saveProgress(getProgress());
  updateHeaderStars(getProgress());
  initTabs();
  initParentMode();
  initNav();
});
