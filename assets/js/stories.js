/* Story Library — read-for-fun stories for Year 2 & 3 */
(function () {
  let allStories = [];
  let currentFilter = 'all';

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

  function renderLibrary() {
    const grid = document.getElementById('story-library');
    if (!grid) return;

    const stories = currentFilter === 'all'
      ? allStories
      : allStories.filter((s) => s.level === currentFilter);

    grid.innerHTML = stories.map((s) => `
      <button class="story-card" data-id="${s.id}">
        <div class="story-cover" style="background-color:${s.color}; background-image:url('${imgPath(s)}')">
          <span class="story-cover-badge">${s.emoji}</span>
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
  }

  function openStory(id) {
    const story = allStories.find((s) => s.id === id);
    if (!story) return;

    const grid = document.getElementById('story-library');
    const filters = document.getElementById('story-filters');
    const reader = document.getElementById('story-reader');

    grid.classList.add('hidden');
    filters.classList.add('hidden');
    reader.classList.remove('hidden');

    reader.innerHTML = `
      <button class="btn btn-secondary story-back" id="story-back">← Back to Library</button>
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
        <div class="story-nav">
          ${prevNextButtons(story)}
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
    });

    reader.querySelectorAll('[data-go]').forEach((b) => {
      b.addEventListener('click', () => openStory(b.dataset.go));
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function prevNextButtons(story) {
    const idx = allStories.findIndex((s) => s.id === story.id);
    const prev = allStories[idx - 1];
    const next = allStories[idx + 1];
    let html = '';
    if (prev) html += `<button class="btn btn-secondary" data-go="${prev.id}">← ${prev.title}</button>`;
    if (next) html += `<button class="btn btn-secondary" data-go="${next.id}">${next.title} →</button>`;
    return html;
  }

  function closeStory() {
    document.getElementById('story-reader').classList.add('hidden');
    document.getElementById('story-library').classList.remove('hidden');
    document.getElementById('story-filters').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        renderLibrary();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('story-library');
    if (!grid) return;
    initFilters();
    loadStories()
      .then((data) => {
        allStories = data;
        renderLibrary();
      })
      .catch(() => {
        grid.innerHTML = '<p style="text-align:center">Could not load stories. Please refresh.</p>';
      });
  });
})();
