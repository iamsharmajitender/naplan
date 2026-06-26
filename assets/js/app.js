const SECTION_SIZE = 8;

class QuizEngine {
  constructor(containerId, questions, options = {}) {
    this.container = document.getElementById(containerId);
    this.allQuestions = questions;
    this.domain = options.domain || 'reading';
    this.mascot = options.mascot || '🐨';
    this.onComplete = options.onComplete || null;
    this.subjectName = options.subjectName || 'Quiz';
    this.sections = this.buildSections(questions);
    this.completedSections = new Set();
    this.questions = [];
    this.sectionIndex = 0;
    this.currentIndex = 0;
    this.answered = false;
    this.showSectionPicker();
  }

  buildSections(questions) {
    const sections = [];
    for (let i = 0; i < questions.length; i += SECTION_SIZE) {
      sections.push(questions.slice(i, i + SECTION_SIZE));
    }
    return sections;
  }

  showSectionPicker() {
    if (!this.container || this.sections.length === 0) return;

    this.container.innerHTML = `
      <div class="quiz-card">
        <div class="mascot-speech">
          <span class="mascot-mini">${this.mascot}</span>
          <span>Pick a section to start! Each section has ${SECTION_SIZE} questions.</span>
        </div>
        <div class="section-grid">
          ${this.sections.map((sec, i) => {
            const start = i * SECTION_SIZE + 1;
            const end = i * SECTION_SIZE + sec.length;
            const done = this.completedSections.has(i);
            return `
              <button class="section-card ${done ? 'done' : ''}" data-section="${i}">
                <span class="section-num">${done ? '✅' : i + 1}</span>
                <span class="section-title">Section ${i + 1}</span>
                <span class="section-range">Questions ${start}–${end}</span>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;

    this.container.querySelectorAll('.section-card').forEach((btn) => {
      btn.addEventListener('click', () => this.startSection(parseInt(btn.dataset.section, 10)));
    });
  }

  startSection(index) {
    this.sectionIndex = index;
    this.questions = shuffleArray(this.sections[index]);
    this.currentIndex = 0;
    this.render();
  }

  render() {
    if (!this.container || this.questions.length === 0) return;
    const q = this.questions[this.currentIndex];
    const choices = shuffleArray(q.choices);
    this.answered = false;

    this.container.innerHTML = `
      <div class="quiz-card">
        <div class="quiz-section-bar">
          <button class="btn-link" id="quiz-back-sections">← Sections</button>
          <span class="quiz-section-label">Section ${this.sectionIndex + 1} of ${this.sections.length}</span>
        </div>
        <div class="mascot-speech">
          <span class="mascot-mini">${this.mascot}</span>
          <span>${q.intro || 'Read carefully and choose the best answer!'}</span>
        </div>
        ${q.passage ? `
          <article class="passage">
            <h3>${q.title || ''}</h3>
            ${q.passage.split('\n').map((p) => `<p>${p}</p>`).join('')}
          </article>
        ` : ''}
        ${q.image ? `<div style="text-align:center;font-size:3rem;margin:1rem 0">${q.image}</div>` : ''}
        <p class="question-text">${q.question}</p>
        <div class="choices" id="quiz-choices">
          ${choices.map((c, i) => `
            <button class="choice" data-index="${i}" data-correct="${c.correct}">
              ${c.text}
            </button>
          `).join('')}
        </div>
        <div id="quiz-feedback" class="feedback hidden"></div>
        <div class="quiz-nav">
          <span class="quiz-counter">Question ${this.currentIndex + 1} of ${this.questions.length}</span>
          <button class="btn btn-primary" id="quiz-next" style="display:none">Next →</button>
        </div>
      </div>
    `;

    this.container.querySelectorAll('.choice').forEach((btn) => {
      btn.addEventListener('click', () => this.handleAnswer(btn));
    });

    document.getElementById('quiz-back-sections')?.addEventListener('click', () => this.showSectionPicker());

    const nextBtn = document.getElementById('quiz-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.next());
    }
  }

  handleAnswer(btn) {
    if (this.answered) return;
    this.answered = true;
    recordAttempt(this.domain);

    const isCorrect = btn.dataset.correct === 'true';
    const q = this.questions[this.currentIndex];
    const feedback = document.getElementById('quiz-feedback');
    const choices = this.container.querySelectorAll('.choice');

    choices.forEach((c) => {
      c.disabled = true;
      if (c.dataset.correct === 'true') c.classList.add('correct');
      else if (c === btn && !isCorrect) c.classList.add('wrong');
    });

    feedback.classList.remove('hidden', 'success', 'hint');
    if (isCorrect) {
      awardStar(this.domain, q.id);
      feedback.classList.add('success');
      feedback.textContent = cheerOnCorrect(q.explanation || '');
    } else {
      feedback.classList.add('hint');
      feedback.textContent = `💡 ${q.hint || randomItem(HINTS)}`;
      choices.forEach((c) => {
        if (c.dataset.correct === 'true') c.classList.add('reveal-correct');
      });
    }

    document.getElementById('quiz-next').style.display = 'inline-flex';
  }

  next() {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
      this.render();
    } else {
      this.completedSections.add(this.sectionIndex);
      if (this.onComplete) this.onComplete();
      this.showSectionComplete();
    }
  }

  showSectionComplete() {
    const hasNext = this.sectionIndex < this.sections.length - 1;
    setTimeout(() => showCelebration(`${getChildName()}, you finished Section ${this.sectionIndex + 1}!`, '🌟'), 300);

    this.container.innerHTML = `
      <div class="quiz-card" style="text-align:center">
        <div style="font-size:4rem;margin-bottom:0.5rem">🌟</div>
        <h2>Section ${this.sectionIndex + 1} complete!</h2>
        <p style="margin:1rem 0;color:var(--ink-light)">Great work! What would you like to do next?</p>
        <div style="display:flex;gap:0.75rem;flex-wrap:wrap;justify-content:center">
          ${hasNext ? '<button class="btn btn-primary" id="quiz-next-section">Next Section →</button>' : ''}
          <button class="btn btn-secondary" id="quiz-replay-section">Replay This Section</button>
          <button class="btn btn-secondary" id="quiz-choose-section">Choose a Section</button>
        </div>
      </div>
    `;

    document.getElementById('quiz-next-section')?.addEventListener('click', () => this.startSection(this.sectionIndex + 1));
    document.getElementById('quiz-replay-section')?.addEventListener('click', () => this.startSection(this.sectionIndex));
    document.getElementById('quiz-choose-section')?.addEventListener('click', () => this.showSectionPicker());
  }
}

async function loadQuizData(path) {
  const base = document.querySelector('meta[name="base-path"]')?.content || '';
  const res = await fetch(`${base}${path}`);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function initReadingQuiz() {
  const el = document.getElementById('reading-quiz');
  if (!el) return;
  loadQuizData('data/reading-year3.json')
    .then((data) => new QuizEngine('reading-quiz', data, { domain: 'reading', mascot: '🐨', subjectName: 'Reading' }))
    .catch(() => { el.innerHTML = '<p>Could not load questions. Please refresh.</p>'; });
}

function initNumeracyQuiz() {
  const el = document.getElementById('numeracy-quiz');
  if (!el) return;
  loadQuizData('data/numeracy-year3.json')
    .then((data) => new QuizEngine('numeracy-quiz', data, { domain: 'numeracy', mascot: '🦘', subjectName: 'Numeracy' }))
    .catch(() => { el.innerHTML = '<p>Could not load questions. Please refresh.</p>'; });
}

function initGrammarQuiz() {
  const el = document.getElementById('grammar-quiz');
  if (!el) return;
  loadQuizData('data/grammar-year3.json')
    .then((data) => new QuizEngine('grammar-quiz', data, { domain: 'language', mascot: '🌊', subjectName: 'Grammar' }))
    .catch(() => { el.innerHTML = '<p>Could not load questions. Please refresh.</p>'; });
}

let spellingAll = [];
let spellingSections = [];
let spellingSectionIndex = 0;
let spellingData = [];
let spellingIndex = 0;

async function initSpellingGame() {
  const container = document.getElementById('spelling-game');
  if (!container) return;
  try {
    spellingAll = await loadQuizData('data/spelling-year3.json');
    spellingSections = [];
    for (let i = 0; i < spellingAll.length; i += SECTION_SIZE) {
      spellingSections.push(spellingAll.slice(i, i + SECTION_SIZE));
    }
    renderSpellingSectionPicker();
  } catch {
    container.innerHTML = '<p>Could not load spelling words.</p>';
  }
}

function renderSpellingSectionPicker() {
  const container = document.getElementById('spelling-game');
  if (!container || spellingSections.length === 0) return;

  container.innerHTML = `
    <div class="quiz-card">
      <div class="mascot-speech">
        <span class="mascot-mini">🌊</span>
        <span>Pick a spelling section to start! Each section has ${SECTION_SIZE} words.</span>
      </div>
      <div class="section-grid">
        ${spellingSections.map((sec, i) => {
          const start = i * SECTION_SIZE + 1;
          const end = i * SECTION_SIZE + sec.length;
          return `
            <button class="section-card" data-section="${i}">
              <span class="section-num">${i + 1}</span>
              <span class="section-title">Section ${i + 1}</span>
              <span class="section-range">Words ${start}–${end}</span>
            </button>
          `;
        }).join('')}
      </div>
    </div>
  `;

  container.querySelectorAll('.section-card').forEach((btn) => {
    btn.addEventListener('click', () => {
      spellingSectionIndex = parseInt(btn.dataset.section, 10);
      spellingData = shuffleArray(spellingSections[spellingSectionIndex]);
      spellingIndex = 0;
      renderSpellingRound();
    });
  });
}

function renderSpellingRound() {
  const container = document.getElementById('spelling-game');
  if (!container || spellingData.length === 0) return;

  if (spellingIndex >= spellingData.length) {
    renderSpellingSectionComplete();
    return;
  }

  const word = spellingData[spellingIndex];
  container.innerHTML = `
    <div class="quiz-card spelling-game">
      <div class="quiz-section-bar">
        <button class="btn-link" id="spelling-back-sections">← Sections</button>
        <span class="quiz-section-label">Section ${spellingSectionIndex + 1} of ${spellingSections.length}</span>
      </div>
      <div class="mascot-speech">
        <span class="mascot-mini">🌊</span>
        <span>Listen to the word and spell it! Word ${spellingIndex + 1} of ${spellingData.length}</span>
      </div>
      <div class="parent-tip">💡 Parent tip: Read the hint aloud. For "${word.word}", say: "${word.sentence.replace('___', 'blank')}" and let your child fill in the blank.</div>
      <p style="font-size:1.1rem;margin:1rem 0">${word.hint}</p>
      <button class="spelling-audio-btn" id="speak-word" title="Hear the word">🔊</button>
      <p style="color:var(--ink-light);font-size:0.9rem">${word.sentence.replace('___', '_____')}</p>
      <div style="margin:1rem 0">
        <input type="text" class="spelling-input" id="spelling-answer" placeholder="Type the word..." autocomplete="off" autocapitalize="off">
      </div>
      <button class="btn btn-primary" id="check-spelling">Check Spelling</button>
      <div id="spelling-feedback" class="feedback hidden"></div>
      <div style="margin-top:1rem">
        <button class="btn btn-secondary" id="next-spelling" style="display:none">Next Word →</button>
      </div>
    </div>
  `;

  document.getElementById('spelling-back-sections')?.addEventListener('click', renderSpellingSectionPicker);

  document.getElementById('speak-word')?.addEventListener('click', () => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(word.word);
      u.lang = 'en-AU';
      u.rate = 0.85;
      speechSynthesis.speak(u);
    }
  });

  document.getElementById('check-spelling')?.addEventListener('click', checkSpelling);
  document.getElementById('spelling-answer')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkSpelling();
  });

  function checkSpelling() {
    const input = document.getElementById('spelling-answer');
    const feedback = document.getElementById('spelling-feedback');
    const answer = input.value.trim().toLowerCase();
    const correct = word.word.toLowerCase();

    recordAttempt('language');
    feedback.classList.remove('hidden', 'success', 'hint');

    if (answer === correct) {
      feedback.classList.add('success');
      feedback.textContent = cheerOnCorrect(`"${word.word}" is correct!`);
      const progress = getProgress();
      progress.language.spelling++;
      progress.language.correct++;
      progress.totalStars++;
      saveProgress(progress);
      input.disabled = true;
      document.getElementById('check-spelling').style.display = 'none';
      document.getElementById('next-spelling').style.display = 'inline-flex';
    } else {
      feedback.classList.add('hint');
      feedback.textContent = `Not quite! The word starts with "${correct[0].toUpperCase()}" and has ${correct.length} letters. Try again!`;
    }
  }

  document.getElementById('next-spelling')?.addEventListener('click', () => {
    spellingIndex++;
    renderSpellingRound();
  });
}

function renderSpellingSectionComplete() {
  const container = document.getElementById('spelling-game');
  if (!container) return;
  const hasNext = spellingSectionIndex < spellingSections.length - 1;
  setTimeout(() => showCelebration(`${getChildName()}, you finished Spelling Section ${spellingSectionIndex + 1}!`, '🌟'), 300);

  container.innerHTML = `
    <div class="quiz-card" style="text-align:center">
      <div style="font-size:4rem;margin-bottom:0.5rem">🌟</div>
      <h2>Section ${spellingSectionIndex + 1} complete!</h2>
      <p style="margin:1rem 0;color:var(--ink-light)">Great spelling! What would you like to do next?</p>
      <div style="display:flex;gap:0.75rem;flex-wrap:wrap;justify-content:center">
        ${hasNext ? '<button class="btn btn-primary" id="spelling-next-section">Next Section →</button>' : ''}
        <button class="btn btn-secondary" id="spelling-replay-section">Replay This Section</button>
        <button class="btn btn-secondary" id="spelling-choose-section">Choose a Section</button>
      </div>
    </div>
  `;

  document.getElementById('spelling-next-section')?.addEventListener('click', () => {
    spellingSectionIndex++;
    spellingData = shuffleArray(spellingSections[spellingSectionIndex]);
    spellingIndex = 0;
    renderSpellingRound();
  });
  document.getElementById('spelling-replay-section')?.addEventListener('click', () => {
    spellingData = shuffleArray(spellingSections[spellingSectionIndex]);
    spellingIndex = 0;
    renderSpellingRound();
  });
  document.getElementById('spelling-choose-section')?.addEventListener('click', renderSpellingSectionPicker);
}

function initWordScramble() {
  const container = document.getElementById('scramble-game');
  if (!container) return;

  const words = ['because', 'friend', 'school', 'happy', 'water', 'garden', 'beautiful', 'together'];
  let currentWord = randomItem(words);
  let scrambled = scrambleWord(currentWord);
  let built = [];

  function scrambleWord(w) {
    const arr = w.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('') === w ? scrambleWord(w) : arr.join('');
  }

  function render() {
    container.innerHTML = `
      <div class="quiz-card">
        <div class="mascot-speech">
          <span class="mascot-mini">🌊</span>
          <span>Click the letters in order to spell the word!</span>
        </div>
        <div class="drop-zone" id="scramble-built">
          ${Array.from({ length: currentWord.length }, () => '<div class="drop-slot">?</div>').join('')}
        </div>
        <div class="letter-tiles" id="scramble-tiles">
          ${scrambled.split('').map((l, i) => `<div class="letter-tile" data-letter="${l}" data-idx="${i}">${l}</div>`).join('')}
        </div>
        <button class="btn btn-secondary" id="scramble-reset">Start Over</button>
        <div id="scramble-feedback" class="feedback hidden"></div>
      </div>
    `;

    const tiles = container.querySelectorAll('.letter-tile:not(.used)');
    tiles.forEach((tile) => {
      tile.addEventListener('click', () => {
        if (tile.classList.contains('used')) return;
        const letter = tile.dataset.letter;
        const pos = built.length;
        if (pos >= currentWord.length) return;

        built.push(letter);
        tile.classList.add('used');
        const slots = container.querySelectorAll('.drop-slot');
        slots[pos].textContent = letter;
        slots[pos].classList.add('filled');

        if (built.length === currentWord.length) {
          const attempt = built.join('');
          const feedback = document.getElementById('scramble-feedback');
          feedback.classList.remove('hidden', 'success', 'hint');
          if (attempt === currentWord) {
            feedback.classList.add('success');
            feedback.textContent = cheerOnCorrect(`The word is "${currentWord}"!`);
            awardStar('language', 'scramble-' + currentWord);
            setTimeout(() => {
              currentWord = randomItem(words.filter((w) => w !== currentWord));
              scrambled = scrambleWord(currentWord);
              built = [];
              render();
            }, 1500);
          } else {
            feedback.classList.add('hint');
            feedback.textContent = 'Not quite right. Press Start Over and try again!';
          }
        }
      });
    });

    document.getElementById('scramble-reset')?.addEventListener('click', () => {
      built = [];
      scrambled = scrambleWord(currentWord);
      render();
    });
  }

  render();
}

function initShopGame() {
  const container = document.getElementById('shop-game');
  if (!container) return;

  const items = [
    { emoji: '🥛', name: 'Milk', price: 2.50 },
    { emoji: '🍎', name: 'Apple', price: 1.20 },
    { emoji: '🍞', name: 'Bread', price: 3.80 },
    { emoji: '🧃', name: 'Juice', price: 4.50 },
    { emoji: '🍫', name: 'Chocolate', price: 2.00 },
    { emoji: '🧀', name: 'Cheese', price: 5.50 },
  ];

  let selected = [];
  let target = 0;

  function newRound() {
    selected = [];
    const count = 2 + Math.floor(Math.random() * 2);
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    const roundItems = shuffled.slice(0, count);
    target = roundItems.reduce((sum, i) => sum + i.price, 0);
    target = Math.round(target * 100) / 100;

    container.innerHTML = `
      <div class="quiz-card">
        <div class="mascot-speech">
          <span class="mascot-mini">🦘</span>
          <span>You're shopping at a Melbourne milk bar! Pick items that add up to <strong>$${target.toFixed(2)}</strong></span>
        </div>
        <div class="shop-items" id="shop-items">
          ${items.map((item, i) => `
            <div class="shop-item" data-idx="${i}">
              <div class="item-emoji">${item.emoji}</div>
              <div>${item.name}</div>
              <div class="item-price">$${item.price.toFixed(2)}</div>
            </div>
          `).join('')}
        </div>
        <p style="text-align:center;font-weight:700;font-size:1.2rem">Your total: $<span id="shop-total">0.00</span></p>
        <div style="text-align:center">
          <button class="btn btn-primary" id="shop-check">Check Total</button>
          <button class="btn btn-secondary" id="shop-new">New Challenge</button>
        </div>
        <div id="shop-feedback" class="feedback hidden"></div>
      </div>
    `;

    container.querySelectorAll('.shop-item').forEach((el) => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.idx, 10);
        if (selected.includes(idx)) {
          selected = selected.filter((s) => s !== idx);
          el.classList.remove('selected');
        } else {
          selected.push(idx);
          el.classList.add('selected');
        }
        const total = selected.reduce((s, i) => s + items[i].price, 0);
        document.getElementById('shop-total').textContent = total.toFixed(2);
      });
    });

    document.getElementById('shop-check')?.addEventListener('click', () => {
      const total = selected.reduce((s, i) => s + items[i].price, 0);
      const feedback = document.getElementById('shop-feedback');
      feedback.classList.remove('hidden', 'success', 'hint');
      recordAttempt('numeracy');
      if (Math.abs(total - target) < 0.01) {
        feedback.classList.add('success');
        feedback.textContent = cheerOnCorrect(`$${target.toFixed(2)} — perfect!`);
        awardStar('numeracy', 'shop-' + Date.now());
      } else {
        feedback.classList.add('hint');
        feedback.textContent = `Your total is $${total.toFixed(2)}. Keep trying to reach $${target.toFixed(2)}!`;
      }
    });

    document.getElementById('shop-new')?.addEventListener('click', newRound);
  }

  newRound();
}

function initShapeGame() {
  const container = document.getElementById('shape-game');
  if (!container) return;

  let rounds = shuffleArray([
    { question: 'Which shape has 4 equal sides?', shapes: ['🔺', '⬜', '🔵', '⭐'], correct: 1, name: 'square' },
    { question: 'Which shape has 3 sides?', shapes: ['🔺', '⬜', '🔷', '⬛'], correct: 0, name: 'triangle' },
    { question: 'Which shape is round with no corners?', shapes: ['🔶', '🔴', '⬜', '🔺'], correct: 1, name: 'circle' },
    { question: 'Which shape has 6 sides?', shapes: ['⬡', '⬜', '🔺', '🔵'], correct: 0, name: 'hexagon' },
    { question: 'Which 3D shape looks like a ball?', shapes: ['🎲', '⚽', '📦', '🥫'], correct: 1, name: 'sphere' },
  ]);

  let idx = 0;

  function render() {
    const r = rounds[idx % rounds.length];
    container.innerHTML = `
      <div class="quiz-card">
        <div class="mascot-speech">
          <span class="mascot-mini">🦘</span>
          <span>${r.question}</span>
        </div>
        <div class="shape-grid" id="shape-options">
          ${r.shapes.map((s, i) => `<div class="shape-option" data-idx="${i}">${s}</div>`).join('')}
        </div>
        <div id="shape-feedback" class="feedback hidden"></div>
        <div style="text-align:center;margin-top:1rem">
          <button class="btn btn-secondary" id="shape-next" style="display:none">Next Shape →</button>
        </div>
      </div>
    `;

    container.querySelectorAll('.shape-option').forEach((opt) => {
      opt.addEventListener('click', () => {
        if (container.querySelector('.shape-option.correct')) return;
        const chosen = parseInt(opt.dataset.idx, 10);
        const feedback = document.getElementById('shape-feedback');
        feedback.classList.remove('hidden', 'success', 'hint');
        recordAttempt('numeracy');

        if (chosen === r.correct) {
          opt.classList.add('correct');
          feedback.classList.add('success');
          feedback.textContent = cheerOnCorrect(`That's a ${r.name}!`);
          awardStar('numeracy', 'shape-' + r.name);
          document.getElementById('shape-next').style.display = 'inline-flex';
        } else {
          opt.classList.add('wrong');
          feedback.classList.add('hint');
          feedback.textContent = 'Try again! Look at the number of sides.';
          setTimeout(() => opt.classList.remove('wrong'), 800);
        }
      });
    });

    document.getElementById('shape-next')?.addEventListener('click', () => {
      idx++;
      if (idx > 0 && idx % rounds.length === 0) {
        rounds = shuffleArray(rounds);
      }
      render();
    });
  }

  render();
}

function initGraphGame() {
  const container = document.getElementById('graph-game');
  if (!container) return;

  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    values: [4, 7, 5, 9, 6],
    title: 'Books read at Fitzroy Library this week',
  };

  const maxVal = Math.max(...data.values);
  let questions = shuffleArray([
    { q: 'On which day were the most books read?', a: 'Thursday', check: (ans) => ans === 'Thursday' },
    { q: 'How many books were read on Tuesday?', a: '7', check: (ans) => ans === '7' },
    { q: 'How many more books were read on Thursday than Monday?', a: '5', check: (ans) => ans === '5' },
  ]);

  let qIdx = 0;

  function render() {
    const q = questions[qIdx % questions.length];
    container.innerHTML = `
      <div class="quiz-card">
        <div class="mascot-speech">
          <span class="mascot-mini">🦘</span>
          <span>Study the graph and answer the question!</span>
        </div>
        <div class="graph-display">
          <h3 style="text-align:center;margin-bottom:1rem">${data.title}</h3>
          <div class="bar-chart">
            ${data.labels.map((label, i) => `
              <div class="bar-col">
                <div class="bar-value">${data.values[i]}</div>
                <div class="bar" style="height:${(data.values[i] / maxVal) * 140}px"></div>
                <div class="bar-label">${label}</div>
              </div>
            `).join('')}
          </div>
        </div>
        <p class="question-text">${q.q}</p>
        <input type="text" class="spelling-input" id="graph-answer" placeholder="Your answer...">
        <button class="btn btn-primary" id="graph-check" style="margin-top:1rem">Check Answer</button>
        <div id="graph-feedback" class="feedback hidden"></div>
      </div>
    `;

    document.getElementById('graph-check')?.addEventListener('click', () => {
      const ans = document.getElementById('graph-answer').value.trim();
      const feedback = document.getElementById('graph-feedback');
      feedback.classList.remove('hidden', 'success', 'hint');
      recordAttempt('numeracy');

      if (q.check(ans)) {
        feedback.classList.add('success');
        feedback.textContent = cheerOnCorrect(`The answer is ${q.a}!`);
        awardStar('numeracy', 'graph-' + qIdx);
        qIdx++;
        if (qIdx > 0 && qIdx % questions.length === 0) {
          questions = shuffleArray(questions);
        }
        setTimeout(render, 1500);
      } else {
        feedback.classList.add('hint');
        feedback.textContent = `Look at the graph again. The answer is a number or day name.`;
      }
    });
  }

  render();
}

function initNumberLine() {
  const container = document.getElementById('numberline-game');
  if (!container) return;

  let start = 15;
  let hops = 0;
  let target = 23;
  let operation = '+';

  function newRound() {
    start = 5 + Math.floor(Math.random() * 20);
    const hop = 2 + Math.floor(Math.random() * 8);
    operation = Math.random() > 0.5 ? '+' : '-';
    target = operation === '+' ? start + hop : start - hop;
    if (target < 0) return newRound();
    hops = 0;

    container.innerHTML = `
      <div class="quiz-card">
        <div class="mascot-speech">
          <span class="mascot-mini">🦘</span>
          <span>Start at <strong>${start}</strong>. Hop ${operation === '+' ? 'forward' : 'back'} to reach <strong>${target}</strong>!</span>
        </div>
        <div class="number-line">
          <div class="number-line-track" style="position:relative;width:100%">
            <div class="number-line-hopper" id="hopper" style="left:${(start / 30) * 100}%">🐸</div>
          </div>
        </div>
        <p style="text-align:center;font-weight:700">Current position: <span id="nl-pos">${start}</span></p>
        <div style="text-align:center;display:flex;gap:0.5rem;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-primary nl-hop" data-hop="1">Hop ${operation}1</button>
          <button class="btn btn-primary nl-hop" data-hop="2">Hop ${operation}2</button>
          <button class="btn btn-primary nl-hop" data-hop="5">Hop ${operation}5</button>
          <button class="btn btn-secondary" id="nl-check">I'm there!</button>
        </div>
        <div id="nl-feedback" class="feedback hidden"></div>
      </div>
    `;

    let pos = start;
    const hopper = document.getElementById('hopper');

    container.querySelectorAll('.nl-hop').forEach((btn) => {
      btn.addEventListener('click', () => {
        const amount = parseInt(btn.dataset.hop, 10);
        pos = operation === '+' ? pos + amount : pos - amount;
        pos = Math.max(0, Math.min(30, pos));
        document.getElementById('nl-pos').textContent = pos;
        hopper.style.left = (pos / 30) * 100 + '%';
        hops++;
      });
    });

    document.getElementById('nl-check')?.addEventListener('click', () => {
      const feedback = document.getElementById('nl-feedback');
      feedback.classList.remove('hidden', 'success', 'hint');
      recordAttempt('numeracy');
      if (pos === target) {
        feedback.classList.add('success');
        feedback.textContent = cheerOnCorrect(`You reached ${target} in ${hops} hops!`);
        awardStar('numeracy', 'nl-' + target);
        setTimeout(newRound, 2000);
      } else {
        feedback.classList.add('hint');
        feedback.textContent = `You're at ${pos}, but you need to reach ${target}. Keep hopping!`;
      }
    });
  }

  newRound();
}

function initWritingPrompts() {
  const container = document.getElementById('writing-prompts');
  if (!container) return;

  const prompts = shuffleArray([
    { type: 'narrative', title: 'A Day at St Kilda Beach', text: 'Write a story about a special day you spent at the beach. What did you see, hear, and feel?' },
    { type: 'narrative', title: 'The Lost Puppy', text: 'Write a story about finding a lost puppy in your neighbourhood. How did you help it get home?' },
    { type: 'narrative', title: 'My Best Friend', text: 'Write a story about an adventure you had with your best friend. What happened?' },
    { type: 'narrative', title: 'The Magic Tram', text: 'Imagine you boarded a tram in Melbourne and it took you somewhere magical. Write what happened.' },
    { type: 'narrative', title: 'Grandparents\' Visit', text: 'Write a story about a visit from your grandparents. What did you do together?' },
    { type: 'narrative', title: 'The Stormy Night', text: 'Write a story about a stormy night. How did you feel? What did you do?' },
    { type: 'persuasive', title: 'Longer Recess', text: 'Write to convince your principal that students should have a longer recess. Give three good reasons.' },
    { type: 'persuasive', title: 'School Gardens', text: 'Should every school have a vegetable garden? Write to persuade others of your opinion.' },
    { type: 'persuasive', title: 'No Homework on Fridays', text: 'Write a persuasive piece explaining why students should not have homework on Fridays.' },
    { type: 'persuasive', title: 'Pet in the Classroom', text: 'Should classes be allowed to have a class pet? Write to convince your teacher.' },
    { type: 'persuasive', title: 'Ride Your Bike', text: 'Write to persuade families to ride bikes instead of driving short distances.' },
    { type: 'persuasive', title: 'Library Day', text: 'Should every class visit the library once a week? Write your opinion with reasons.' },
  ]);

  let current = 0;

  function render() {
    const p = prompts[current];
    recordWritingView();

    container.innerHTML = `
      <div class="writing-tag-list">
        ${prompts.map((pr, i) => `
          <button class="writing-tag ${pr.type} ${i === current ? 'active' : ''}" data-prompt="${i}">
            <span class="writing-tag-num">${i + 1}</span>
            <span class="writing-tag-name">${pr.title}</span>
          </button>
        `).join('')}
      </div>
      <div class="prompt-card">
        <div class="writing-section-bar">
          <span class="writing-section-tag">✍️ Writing Prompt ${current + 1} of ${prompts.length}</span>
          <span class="writing-section-tag type-${p.type}">${p.type === 'narrative' ? '📖 Narrative' : '💬 Persuasive'}</span>
        </div>
        <span class="prompt-type ${p.type}">${p.type}</span>
        <h3>${p.title}</h3>
        <p style="margin:0.75rem 0;font-size:1.05rem">${p.text}</p>
        <div class="parent-tip">💡 Parent tip: Year 3 NAPLAN writing is on paper (40 min). Print this page or copy the prompt onto lined paper. Let your child plan for 5 minutes, then write freely.</div>
        <h4 style="font-family:var(--font-display);margin:1rem 0 0.5rem">Story Planner</h4>
        <div class="story-planner">
          <div class="planner-box"><h4>Character &amp; Setting</h4><textarea placeholder="Who is in the story? Where and when?"></textarea></div>
          <div class="planner-box"><h4>Problem</h4><textarea placeholder="What goes wrong?"></textarea></div>
          <div class="planner-box"><h4>Solution</h4><textarea placeholder="How is it fixed?"></textarea></div>
          <div class="planner-box"><h4>Ending</h4><textarea placeholder="How does it end?"></textarea></div>
        </div>
        <h4 style="font-family:var(--font-display);margin:1rem 0 0.5rem">Writing Checklist</h4>
        <ul class="writing-checklist" id="writing-checklist">
          <li><input type="checkbox"> Capital letters</li>
          <li><input type="checkbox"> Full stops</li>
          <li><input type="checkbox"> Neat paragraphs</li>
          <li><input type="checkbox"> Interesting words</li>
          <li><input type="checkbox"> Checked spelling</li>
          <li><input type="checkbox"> Read it aloud</li>
        </ul>
        <div class="timer-display" id="writing-timer">40:00</div>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:1rem">
          <button class="btn btn-primary" id="start-timer">Start 40-min Timer</button>
          <button class="btn btn-secondary" id="prev-prompt">← Previous</button>
          <button class="btn btn-secondary" id="next-prompt">Next Prompt →</button>
          <button class="btn btn-secondary" onclick="window.print()">🖨️ Print Prompt</button>
        </div>
      </div>
    `;

    container.querySelectorAll('.writing-tag').forEach((tag) => {
      tag.addEventListener('click', () => {
        current = parseInt(tag.dataset.prompt, 10);
        render();
      });
    });

    container.querySelectorAll('.writing-checklist li').forEach((li) => {
      li.addEventListener('click', () => {
        const cb = li.querySelector('input');
        cb.checked = !cb.checked;
        li.classList.toggle('checked', cb.checked);
        if (container.querySelectorAll('.writing-checklist input:checked').length === 6) {
          const progress = getProgress();
          progress.writing.checklistsDone++;
          saveProgress(progress);
          cheerOnCorrect('Writing checklist complete!');
          showCelebration(`${getChildName()}, writing checklist complete!`, '✏️');
        }
      });
    });

    let timerInterval;
    let seconds = 40 * 60;

    document.getElementById('start-timer')?.addEventListener('click', () => {
      clearInterval(timerInterval);
      seconds = 40 * 60;
      timerInterval = setInterval(() => {
        seconds--;
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        document.getElementById('writing-timer').textContent =
          `${m}:${s.toString().padStart(2, '0')}`;
        if (seconds <= 0) {
          clearInterval(timerInterval);
          showCelebration(`${getChildName()}, time's up! Great effort!`, '⏰');
        }
      }, 1000);
    });

    document.getElementById('prev-prompt')?.addEventListener('click', () => {
      current = (current - 1 + prompts.length) % prompts.length;
      render();
    });

    document.getElementById('next-prompt')?.addEventListener('click', () => {
      current = (current + 1) % prompts.length;
      render();
    });
  }

  render();
}

function initPunctuationGame() {
  const container = document.getElementById('punctuation-game');
  if (!container) return;

  let sentences = shuffleArray([
    {
      parts: ['Where is my hat', ' she asked'],
      options: ['.', '?', '!'],
      correct: '?',
      fixed: 'Where is my hat? she asked.',
    },
    {
      parts: ['Wow', ' that was amazing'],
      options: ['.', '?', '!'],
      correct: '!',
      fixed: 'Wow! that was amazing.',
    },
    {
      parts: ['The dog ran to the park', ''],
      options: ['.', '?', '!'],
      correct: '.',
      fixed: 'The dog ran to the park.',
    },
    {
      parts: ['Can you help me', ' asked Tom'],
      options: ['.', '?', '!'],
      correct: '?',
      fixed: 'Can you help me? asked Tom.',
    },
  ]);

  let idx = 0;

  function render() {
    const s = sentences[idx % sentences.length];
    const options = shuffleArray(s.options);
    container.innerHTML = `
      <div class="quiz-card punctuation-game">
        <div class="mascot-speech">
          <span class="mascot-mini">🌊</span>
          <span>Choose the correct punctuation mark!</span>
        </div>
        <p style="font-size:1.2rem;margin:1rem 0;text-align:center">
          ${s.parts[0]}<span id="punct-slot" style="border-bottom:3px solid var(--purple);padding:0 0.5rem">?</span>${s.parts[1]}
        </p>
        <div style="display:flex;gap:0.75rem;justify-content:center">
          ${options.map((o) => `<button class="btn btn-secondary punct-btn" data-val="${o}" style="font-size:1.5rem;min-width:60px">${o}</button>`).join('')}
        </div>
        <div id="punct-feedback" class="feedback hidden"></div>
      </div>
    `;

    container.querySelectorAll('.punct-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const feedback = document.getElementById('punct-feedback');
        feedback.classList.remove('hidden', 'success', 'hint');
        recordAttempt('language');
        document.getElementById('punct-slot').textContent = btn.dataset.val;

        if (btn.dataset.val === s.correct) {
          feedback.classList.add('success');
          feedback.textContent = cheerOnCorrect(s.fixed);
          awardStar('language', 'punct-' + idx);
          idx++;
          if (idx > 0 && idx % sentences.length === 0) {
            sentences = shuffleArray(sentences);
          }
          setTimeout(render, 2000);
        } else {
          feedback.classList.add('hint');
          feedback.textContent = 'Think about whether it\'s a question, exclamation, or statement.';
        }
      });
    });
  }

  render();
}

function initProgressPage() {
  const container = document.getElementById('progress-content');
  if (!container) return;

  const p = getProgress();
  const domains = [
    { key: 'reading', icon: '📚', name: 'Reading Reef', color: 'reading', total: 67 },
    { key: 'writing', icon: '✏️', name: 'Writing Workshop', color: 'writing', total: 12 },
    { key: 'language', icon: '🌊', name: 'Language Lagoon', color: 'language', total: 30 },
    { key: 'numeracy', icon: '🔢', name: 'Number Neighbourhood', color: 'numeracy', total: 80 },
  ];

  const domainProgress = (key) => {
    if (key === 'reading') return p.reading.correct;
    if (key === 'writing') return p.writing.promptsViewed;
    if (key === 'language') return p.language.correct;
    if (key === 'numeracy') return p.numeracy.correct;
    return 0;
  };

  container.innerHTML = `
    <div class="stats-row">
      <div class="stat-box">
        <div class="stat-number">${p.totalStars}</div>
        <div class="stat-label">Total Stars</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">${p.streak || 0}</div>
        <div class="stat-label">Day Streak 🔥</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">${p.badges.length}</div>
        <div class="stat-label">Badges Earned</div>
      </div>
    </div>

    <div class="progress-grid">
      ${domains.map((d) => {
        const val = domainProgress(d.key);
        const pct = Math.min(100, Math.round((val / d.total) * 100));
        return `
          <div class="progress-card">
            <h3>${d.icon} ${d.name}</h3>
            <p>${val} of ~${d.total} activities completed</p>
            <div class="progress-bar-wrap">
              <div class="progress-bar ${d.color}" style="width:${pct}%"></div>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <h2 style="text-align:center;margin:2rem 0 1rem">🏅 Badges</h2>
    <div class="badge-grid" style="justify-content:center">
      ${BADGES.map((b) => `
        <div class="badge ${p.badges.includes(b.id) ? 'earned' : ''}">
          <span class="badge-icon">${b.icon}</span>
          <span class="badge-name">${b.name}</span>
        </div>
      `).join('')}
    </div>

    <div style="text-align:center;margin-top:2rem">
      <button class="btn btn-secondary" id="reset-progress">Reset All Progress</button>
    </div>
  `;

  document.getElementById('reset-progress')?.addEventListener('click', () => {
    if (confirm('Reset all stars, badges, streaks and your name? This starts a fresh adventure and cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SESSION_KEY);
      saveProgress(defaultProgress());
      updateHeaderStars(defaultProgress());
      initProgressPage();
      const nameHeading = document.getElementById('progress-child-name');
      if (nameHeading) nameHeading.textContent = 'My Progress';
      alert('All done! Progress has been reset.');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initReadingQuiz();
  initNumeracyQuiz();
  initGrammarQuiz();
  initSpellingGame();
  initWordScramble();
  initPunctuationGame();
  initShopGame();
  initShapeGame();
  initGraphGame();
  initNumberLine();
  initWritingPrompts();
  initProgressPage();
});
