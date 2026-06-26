/* Story Library — read-for-fun stories for Year 2 & 3 */
(function () {
  let allStories = [];
  let currentFilter = 'all';
  let activeStoryId = null;

  async function loadStories() {
    const base = document.querySelector('meta[name="base-path"]')?.content || '';
    const res = await fetch(`${base}data/stories-year3.json`);
    if (!res.ok) throw new Error('Failed to load stories');
    return res.json();
  }

  function levelClass(level) {
    return level === 'Year 2' ? 'lvl-y2' : 'lvl-y3';
  }

  function imgPath(story) {
    const base = document.querySelector('meta[name="base-path"]')?.content || '';
    return `${base}assets/img/stories/${story.id}.jpg`;
  }

  function filteredStories() {
    return currentFilter === 'all'
      ? allStories
      : allStories.filter((s) => s.level === currentFilter);
  }

  function getReadSet() {
    try {
      return new Set(JSON.parse(localStorage.getItem('naplan-stories-read') || '[]'));
    } catch (_) {
      return new Set();
    }
  }

  function renderStoryPicker() {
    const picker = document.getElementById('story-picker');
    if (!picker) return;

    const read = getReadSet();
    const stories = filteredStories();

    picker.innerHTML = stories.map((s, i) => `
      <button type="button" class="story-pick ${s.id === activeStoryId ? 'active' : ''} ${read.has(s.id) ? 'read' : ''}"
        data-id="${s.id}" title="${s.title}">
        <span class="story-pick-num">${i + 1}</span>
        <span class="story-pick-emoji">${s.emoji}</span>
        <span class="story-pick-title">${s.title}</span>
      </button>
    `).join('');

    picker.querySelectorAll('.story-pick').forEach((btn) => {
      btn.addEventListener('click', () => openStory(btn.dataset.id));
    });

    // Scroll chip strip horizontally only — never move the page
    const active = picker.querySelector('.story-pick.active');
    if (active) {
      const left = active.offsetLeft - (picker.clientWidth - active.offsetWidth) / 2;
      picker.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
    }
  }

  function renderLibrary() {
    const grid = document.getElementById('story-library');
    if (!grid) return;

    const read = getReadSet();
    const stories = filteredStories();

    grid.innerHTML = stories.map((s) => `
      <button class="story-card ${read.has(s.id) ? 'read' : ''}" data-id="${s.id}">
        <div class="story-cover" style="background-color:${s.color}; background-image:url('${imgPath(s)}')">
          <span class="story-cover-badge">${s.emoji}</span>
          ${read.has(s.id) ? '<span class="story-read-badge">✓ Read</span>' : ''}
        </div>
        <div class="story-card-body">
          <span class="story-level ${levelClass(s.level)}">${s.level}</span>
          <h3>${s.title}</h3>
          <p>${s.blurb}</p>
          <span class="story-meta">⏱️ ${s.minutes} min read</span>
        </div>
      </button>
    `).join('');

    grid.querySelectorAll('.story-card').forEach((card) => {
      card.addEventListener('click', () => openStory(card.dataset.id));
    });

    renderStoryPicker();
  }

  function setReadingMode(on) {
    document.getElementById('stories-hero')?.classList.toggle('hidden', on);
    document.getElementById('stories-parent-tip')?.classList.toggle('hidden', on);
    document.getElementById('story-filters')?.classList.toggle('hidden', on);
    document.getElementById('story-library')?.classList.toggle('hidden', on);
    document.getElementById('story-picker')?.classList.toggle('reading', on);
    document.body.classList.toggle('story-reading', on);
  }

  function syncHeaderOffset() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    const h = Math.ceil(header.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--site-header-height', `${h}px`);
  }

  function scrollToReader() {
    const reader = document.getElementById('story-reader');
    if (!reader || reader.classList.contains('hidden')) return;

    syncHeaderOffset();
    const headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--site-header-height')) || 72;
    const top = reader.getBoundingClientRect().top + window.scrollY - headerH - 12;
    window.scrollTo(0, Math.max(0, top));
  }

  function afterLayout(fn) {
    requestAnimationFrame(() => {
      requestAnimationFrame(fn);
    });
    setTimeout(fn, 80);
  }

  function openStory(id) {
    const story = allStories.find((s) => s.id === id);
    if (!story) return;

    activeStoryId = id;
    const reader = document.getElementById('story-reader');
    if (!reader) return;

    setReadingMode(true);
    reader.classList.remove('hidden');

    // Jump up immediately — don't wait for layout (fixes clicks on lower grid cards)
    const container = document.getElementById('stories-container');
    if (container) {
      syncHeaderOffset();
      const headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--site-header-height')) || 72;
      const top = container.getBoundingClientRect().top + window.scrollY - headerH - 12;
      window.scrollTo(0, Math.max(0, top));
    }

    const idx = allStories.findIndex((s) => s.id === id);
    const prev = allStories[idx - 1];
    const next = allStories[idx + 1];

    reader.innerHTML = `
      <div class="story-reader-bar">
        <button class="btn btn-secondary story-back" id="story-back">← Library</button>
        <span class="story-reader-title">${story.emoji} ${story.title}</span>
        <div class="story-reader-jump">
          ${prev ? `<button class="btn btn-secondary story-step" data-go="${prev.id}" title="${prev.title}">←</button>` : '<span></span>'}
          <span class="story-reader-count">${idx + 1} / ${allStories.length}</span>
          ${next ? `<button class="btn btn-secondary story-step" data-go="${next.id}" title="${next.title}">→</button>` : '<span></span>'}
        </div>
      </div>
      <article class="story-article">
        <div class="story-hero" style="background-color:${story.color}; background-image:url('${imgPath(story)}')">
          <span class="story-hero-badge">${story.emoji} ${(story.scene || []).join(' ')}</span>
        </div>
        <span class="story-level ${levelClass(story.level)}">${story.level} · ${story.theme}</span>
        <h2>${story.title}</h2>
        ${story.paragraphs.map((p) => `<p>${p}</p>`).join('')}
        <div class="story-wonder">
          <h3>🤔 I wonder...</h3>
          <ul>
            ${(story.wonder || []).map((q) => `<li>${q}</li>`).join('')}
          </ul>
        </div>
        <div class="story-finish">
          <button class="btn btn-primary" id="story-finish-btn">⭐ I finished this story!</button>
        </div>
      </article>
    `;

    document.getElementById('story-back').addEventListener('click', closeStory);
    document.getElementById('story-finish-btn').addEventListener('click', () => {
      const msg = (typeof cheerOnCorrect === 'function')
        ? cheerOnCorrect('What a great reader!')
        : 'What a great reader!';
      const btn = document.getElementById('story-finish-btn');
      btn.textContent = '🎉 ' + msg;
      btn.disabled = true;
      markRead(story.id);
      renderStoryPicker();
    });

    reader.querySelectorAll('[data-go]').forEach((b) => {
      b.addEventListener('click', () => openStory(b.dataset.go));
    });

    renderStoryPicker();

    if (history.replaceState) {
      history.replaceState(null, '', `#${id}`);
    }

    afterLayout(scrollToReader);
  }

  function closeStory() {
    activeStoryId = null;
    document.getElementById('story-reader')?.classList.add('hidden');
    setReadingMode(false);
    renderStoryPicker();

    if (history.replaceState) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    const picker = document.getElementById('story-picker');
    if (picker) {
      syncHeaderOffset();
      const headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--site-header-height')) || 72;
      const top = picker.getBoundingClientRect().top + window.scrollY - headerH - 12;
      window.scrollTo(0, Math.max(0, top));
    }
  }

  function markRead(id) {
    try {
      const key = 'naplan-stories-read';
      const read = new Set(JSON.parse(localStorage.getItem(key) || '[]'));
      read.add(id);
      localStorage.setItem(key, JSON.stringify([...read]));
    } catch (_) { /* ignore */ }
  }

  function initFilters() {
    const filters = document.getElementById('story-filters');
    if (!filters) return;
    filters.querySelectorAll('.story-filter').forEach((btn) => {
      btn.addEventListener('click', () => {
        filters.querySelectorAll('.story-filter').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.level;
        if (activeStoryId) closeStory();
        renderLibrary();
      });
    });
  }

  function initFromHash() {
    const id = window.location.hash.replace('#', '');
    if (id && allStories.some((s) => s.id === id)) {
      openStory(id);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('story-library');
    if (!grid) return;
    syncHeaderOffset();
    window.addEventListener('resize', syncHeaderOffset);
    initFilters();
    loadStories()
      .then((data) => {
        allStories = data;
        renderLibrary();
        initFromHash();
      })
      .catch(() => {
        grid.innerHTML = '<p style="text-align:center">Could not load stories. Please refresh.</p>';
      });
  });
})();
