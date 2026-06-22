/* Tic Tac Toe */
function initTicTacToe() {
  const container = document.getElementById('ttt-game');
  if (!container) return;

  let board = Array(9).fill(null);
  let currentPlayer = 'X';
  let gameOver = false;
  let vsComputer = true;

  const wins = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];

  function render() {
    container.innerHTML = `
      <div class="quiz-card ttt-wrap">
        <div class="mascot-speech">
          <span class="mascot-mini">🎮</span>
          <span>Get three in a row to win! You are 🐨, opponent is 🦘</span>
        </div>
        <div class="ttt-controls">
          <div class="ttt-mode">
            <label for="ttt-mode-select">Play against:</label>
            <select id="ttt-mode-select">
              <option value="computer" selected>Computer</option>
              <option value="friend">Friend (2 players)</option>
            </select>
          </div>
          <button class="btn btn-secondary" id="ttt-reset">New Game</button>
        </div>
        <div class="ttt-players">
          <div class="ttt-player p1 ${currentPlayer === 'X' && !gameOver ? 'active' : ''}">
            <span>🐨</span> You (X)
          </div>
          <div class="ttt-player p2 ${currentPlayer === 'O' && !gameOver ? 'active' : ''}">
            <span>🦘</span> ${vsComputer ? 'Computer' : 'Friend'} (O)
          </div>
        </div>
        <p class="ttt-status" id="ttt-status">${statusText()}</p>
        <div class="ttt-board" id="ttt-board">
          ${board.map((cell, i) => `
            <button class="ttt-cell ${cell === 'X' ? 'x' : ''} ${cell === 'O' ? 'o' : ''}"
              data-i="${i}" ${cell || gameOver ? 'disabled' : ''}>
              ${cell === 'X' ? '🐨' : cell === 'O' ? '🦘' : ''}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    document.getElementById('ttt-mode-select').value = vsComputer ? 'computer' : 'friend';
    document.getElementById('ttt-mode-select').addEventListener('change', (e) => {
      vsComputer = e.target.value === 'computer';
      resetGame();
    });
    document.getElementById('ttt-reset').addEventListener('click', resetGame);

    container.querySelectorAll('.ttt-cell').forEach((btn) => {
      btn.addEventListener('click', () => handleMove(parseInt(btn.dataset.i, 10)));
    });
  }

  function statusText() {
    if (gameOver === 'X') return '🎉 You win! Amazing!';
    if (gameOver === 'O') return vsComputer ? '🦘 Computer wins! Try again!' : '🦘 Friend wins!';
    if (gameOver === 'draw') return "🤝 It's a draw!";
    return currentPlayer === 'X' ? "Your turn — tap a square!" : (vsComputer ? 'Computer is thinking...' : "Friend's turn!");
  }

  function resetGame() {
    board = Array(9).fill(null);
    currentPlayer = 'X';
    gameOver = false;
    render();
  }

  function checkWinner() {
    for (const [a, b, c] of wins) {
      if (board[a] && board[a] === board[b] && board[b] === board[c]) {
        return { winner: board[a], line: [a, b, c] };
      }
    }
    if (board.every((c) => c)) return { winner: 'draw' };
    return null;
  }

  function handleMove(i) {
    if (gameOver || board[i]) return;
    if (vsComputer && currentPlayer === 'O') return;

    board[i] = currentPlayer;
    const result = checkWinner();

    if (result) {
      gameOver = result.winner;
      render();
      if (result.line) {
        result.line.forEach((idx) => {
          container.querySelector(`[data-i="${idx}"]`)?.classList.add('win');
        });
      }
      if (result.winner === 'X') {
        cheerOnCorrect('You won Tic Tac Toe!');
        showCelebration(`${getChildName()}, you won Tic Tac Toe!`, '🐨');
      }
      return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    render();

    if (vsComputer && currentPlayer === 'O' && !gameOver) {
      setTimeout(computerMove, 500);
    }
  }

  function computerMove() {
    const move = bestMove();
    if (move !== null) handleMove(move);
  }

  function bestMove() {
    const empty = board.map((c, i) => (c ? null : i)).filter((i) => i !== null);

    for (const i of empty) {
      board[i] = 'O';
      if (checkWinner()?.winner === 'O') { board[i] = null; return i; }
      board[i] = null;
    }
    for (const i of empty) {
      board[i] = 'X';
      if (checkWinner()?.winner === 'X') { board[i] = null; return i; }
      board[i] = null;
    }

    const preferred = [4, 0, 2, 6, 8, 1, 3, 5, 7];
    for (const i of preferred) {
      if (!board[i]) return i;
    }
    return empty[0] ?? null;
  }

  render();
}

/* Snakes & Ladders */
const SNL_SNAKES = [
  { from: 16, to: 6, name: 'Slippery Snake' },
  { from: 47, to: 26, name: 'Yarra River Snake' },
  { from: 49, to: 11, name: 'Botanic Gardens Boa' },
  { from: 56, to: 53, name: 'Little Snake' },
  { from: 62, to: 19, name: 'MCG Python' },
  { from: 64, to: 60, name: 'Tram Track Serpent' },
  { from: 87, to: 24, name: 'St Kilda Slither' },
  { from: 93, to: 73, name: 'Fitzroy Fang' },
  { from: 95, to: 75, name: 'Collingwood Cobra' },
  { from: 98, to: 78, name: 'Near the Top Snake!' },
];

const SNL_LADDERS = [
  { from: 1, to: 38, name: 'Koala Climb' },
  { from: 4, to: 14, name: 'Starter Ladder' },
  { from: 9, to: 31, name: 'Playground Steps' },
  { from: 21, to: 42, name: 'Library Ladder' },
  { from: 28, to: 84, name: 'Mega Melbourne Ladder!' },
  { from: 36, to: 44, name: 'Short Cut' },
  { from: 51, to: 67, name: 'Market Steps' },
  { from: 71, to: 91, name: 'Sky High Ladder' },
  { from: 80, to: 100, name: 'Winner\'s Ladder! 🏆' },
];

function snlCellNumber(displayRow, displayCol) {
  const actualRow = 9 - displayRow;
  const base = actualRow * 10 + 1;
  return actualRow % 2 === 0 ? base + displayCol : base + (9 - displayCol);
}

function initSnakesAndLadders() {
  const container = document.getElementById('snl-game');
  if (!container) return;

  const players = [
    { name: 'You', icon: '🐨', pos: 1, color: '#059669' },
    { name: 'Friend', icon: '🦘', pos: 1, color: '#ec4899' },
  ];
  let currentPlayer = 0;
  let rolling = false;
  let gameWon = false;
  let cellCenters = {};

  function getSnake(from) {
    return SNL_SNAKES.find((s) => s.from === from);
  }

  function getLadder(from) {
    return SNL_LADDERS.find((l) => l.from === from);
  }

  function getCellIcon(num) {
    if (num === 1) return '🚩';
    if (num === 100) return '🏆';
    if (SNL_SNAKES.some((s) => s.from === num)) return '🐍';
    if (SNL_LADDERS.some((l) => l.from === num)) return '🪜';
    return '';
  }

  function render() {
    let cellsHtml = '';
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        const num = snlCellNumber(r, c);
        const shade = (r + c) % 2 === 0 ? 'light' : 'dark';
        const special = num === 1 ? 'start' : num === 100 ? 'finish' : shade;
        cellsHtml += `
          <div class="snl-cell ${special}" data-num="${num}" data-row="${r}" data-col="${c}">
            <span class="cell-num">${num}</span>
            <span class="cell-icon">${getCellIcon(num)}</span>
          </div>
        `;
      }
    }

    container.innerHTML = `
      <div class="quiz-card snl-wrap">
        <div class="mascot-speech">
          <span class="mascot-mini">🎲</span>
          <span>Roll the dice and race to square 100! Land on 🪜 to climb up, watch out for 🐍!</span>
        </div>
        <div class="snl-header">
          ${players.map((p, i) => `
            <div class="snl-player-card ${i === currentPlayer && !gameWon ? 'active' : ''}" id="snl-p${i}">
              <span class="token-icon">${p.icon}</span>
              <div>
                <div>${p.name}</div>
                <div style="font-size:0.8rem;color:var(--ink-light)">Square ${p.pos}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="snl-dice-area">
          <div class="snl-dice show-1 ${rolling ? 'rolling' : ''} ${gameWon || rolling ? 'disabled' : ''}" id="snl-dice" title="Roll dice">
            ${Array(9).fill('<div class="dot"></div>').join('')}
          </div>
          <span class="snl-roll-hint" id="snl-hint">${gameWon ? 'Game over!' : rolling ? 'Rolling...' : `Tap dice — ${players[currentPlayer].name}'s turn`}</span>
        </div>
        <p class="snl-message" id="snl-message"></p>
        <div class="snl-board-outer">
          <div class="snl-board" id="snl-board">${cellsHtml}</div>
          <svg class="snl-svg-overlay" id="snl-svg" viewBox="0 0 100 100" preserveAspectRatio="none"></svg>
          <div class="snl-tokens-layer" id="snl-tokens">
            ${players.map((p, i) => `<div class="snl-token" id="snl-token-${i}">${p.icon}</div>`).join('')}
          </div>
        </div>
        <div class="snl-legend">
          <span>🪜 Ladder = climb up</span>
          <span>🐍 Snake = slide down</span>
          <span>Must land exactly on 100!</span>
        </div>
        <button class="btn btn-secondary" id="snl-reset" style="margin-top:0.5rem">New Game</button>
      </div>
    `;

    cacheCellCenters();
    drawSnakesAndLadders();
    positionAllTokens(false);
    bindEvents();
  }

  function cacheCellCenters() {
    cellCenters = {};
    const board = document.getElementById('snl-board');
    if (!board) return;
    const boardRect = board.getBoundingClientRect();
    board.querySelectorAll('.snl-cell').forEach((cell) => {
      const num = parseInt(cell.dataset.num, 10);
      const rect = cell.getBoundingClientRect();
      cellCenters[num] = {
        x: ((rect.left + rect.width / 2 - boardRect.left) / boardRect.width) * 100,
        y: ((rect.top + rect.height / 2 - boardRect.top) / boardRect.height) * 100,
      };
    });
  }

  function drawSnakesAndLadders() {
    const svg = document.getElementById('snl-svg');
    if (!svg || !cellCenters[1]) return;

    const snakePaths = SNL_SNAKES.map((s) => {
      const a = cellCenters[s.from];
      const b = cellCenters[s.to];
      if (!a || !b) return '';
      const mx = (a.x + b.x) / 2 + (b.x - a.x) * 0.3;
      const my = (a.y + b.y) / 2;
      return `<path d="M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}" fill="none" stroke="#dc2626" stroke-width="1.2" stroke-linecap="round" opacity="0.55"/>`;
    }).join('');

    const ladderPaths = SNL_LADDERS.map((l) => {
      const a = cellCenters[l.from];
      const b = cellCenters[l.to];
      if (!a || !b) return '';
      const dx = (b.x - a.x) * 0.15;
      return `
        <line x1="${a.x - dx}" y1="${a.y}" x2="${b.x - dx}" y2="${b.y}" stroke="#92400e" stroke-width="1.5" opacity="0.7"/>
        <line x1="${a.x + dx}" y1="${a.y}" x2="${b.x + dx}" y2="${b.y}" stroke="#92400e" stroke-width="1.5" opacity="0.7"/>
        ${Array.from({ length: 8 }, (_, i) => {
          const t = (i + 1) / 9;
          const x1 = a.x - dx + (b.x - a.x - (b.x - a.x) * 0) * t;
          const y = a.y + (b.y - a.y) * t;
          return `<line x1="${x1 - dx}" y1="${y}" x2="${x1 + dx}" y2="${y}" stroke="#b45309" stroke-width="0.8" opacity="0.6"/>`;
        }).join('')}
      `;
    }).join('');

    svg.innerHTML = ladderPaths + snakePaths;
  }

  function positionToken(playerIdx, animate, sliding) {
    const token = document.getElementById(`snl-token-${playerIdx}`);
    const pos = players[playerIdx].pos;
    const center = cellCenters[pos];
    if (!token || !center) return;

    const offset = playerIdx === 0 ? -4 : 4;
    token.style.left = `calc(${center.x}% + ${offset}px)`;
    token.style.top = `calc(${center.y}% + ${offset}px)`;
    token.classList.toggle('sliding', !!sliding);
    if (animate) {
      token.classList.add('hopping');
      setTimeout(() => token.classList.remove('hopping'), 350);
    }
  }

  function positionAllTokens(animate) {
    players.forEach((_, i) => positionToken(i, animate, false));
  }

  function setMessage(text, type) {
    const el = document.getElementById('snl-message');
    if (!el) return;
    el.textContent = text;
    el.className = 'snl-message' + (type ? ` ${type}` : '');
  }

  function setDice(value) {
    const dice = document.getElementById('snl-dice');
    if (!dice) return;
    dice.className = `snl-dice show-${value}${rolling ? ' rolling' : ''}${gameWon || rolling ? ' disabled' : ''}`;
  }

  function bindEvents() {
    document.getElementById('snl-dice')?.addEventListener('click', rollDice);
    document.getElementById('snl-reset')?.addEventListener('click', () => {
      players[0].pos = 1;
      players[1].pos = 1;
      currentPlayer = 0;
      gameWon = false;
      rolling = false;
      setMessage('');
      render();
    });

    window.addEventListener('resize', () => {
      cacheCellCenters();
      drawSnakesAndLadders();
      positionAllTokens(false);
    });
  }

  async function rollDice() {
    if (rolling || gameWon) return;
    rolling = true;
    setMessage('');
    const dice = document.getElementById('snl-dice');
    const hint = document.getElementById('snl-hint');
    if (dice) dice.classList.add('rolling', 'disabled');
    if (hint) hint.textContent = 'Rolling...';

    let finalRoll = 0;
    for (let i = 0; i < 12; i++) {
      const r = 1 + Math.floor(Math.random() * 6);
      setDice(r);
      await delay(80);
      finalRoll = r;
    }

    rolling = false;
    if (dice) dice.classList.remove('rolling');
    setDice(finalRoll);
    await delay(300);
    await movePlayer(finalRoll);
  }

  async function movePlayer(roll) {
    const p = players[currentPlayer];
    const newPos = p.pos + roll;

    if (newPos > 100) {
      setMessage(`Rolled ${roll}! You need exactly ${100 - p.pos} to win — stay put.`);
      await delay(1200);
      nextTurn();
      return;
    }

    setMessage(`Rolled a ${roll}! Moving...`);
    for (let sq = p.pos + 1; sq <= newPos; sq++) {
      p.pos = sq;
      positionToken(currentPlayer, true, false);
      await delay(280);
    }

    const snake = getSnake(p.pos);
    const ladder = getLadder(p.pos);

    if (snake) {
      setMessage(`🐍 ${snake.name}! Slide down to ${snake.to}...`, 'snake');
      await delay(600);
      positionToken(currentPlayer, false, true);
      p.pos = snake.to;
      positionToken(currentPlayer, false, true);
      await delay(900);
      positionToken(currentPlayer, false, false);
    } else if (ladder) {
      setMessage(`🪜 ${ladder.name}! Climb up to ${ladder.to}!`, 'ladder');
      await delay(600);
      positionToken(currentPlayer, false, true);
      p.pos = ladder.to;
      positionToken(currentPlayer, false, true);
      await delay(900);
      positionToken(currentPlayer, false, false);
    }

    if (p.pos === 100) {
      gameWon = true;
      updatePlayerCards();
      cheerOnCorrect(`${p.name} won Snakes & Ladders!`);
      setMessage(`🎉 ${p.name} wins! Welcome to square 100!`, 'win');
      showCelebration(`${p.icon} ${p.name} won Snakes & Ladders!`, '🏆');
      render();
      return;
    }

    if (!snake && !ladder) {
      setMessage(`Landed on square ${p.pos}.`);
      await delay(800);
    }

    nextTurn();
  }

  function updatePlayerCards() {
    players.forEach((p, i) => {
      const card = document.getElementById(`snl-p${i}`);
      if (!card) return;
      const sqEl = card.querySelector('div > div:last-child');
      if (sqEl) sqEl.textContent = `Square ${p.pos}`;
      card.classList.toggle('active', i === currentPlayer && !gameWon);
    });
  }

  function nextTurn() {
    if (gameWon) return;
    currentPlayer = 1 - currentPlayer;
    const hint = document.getElementById('snl-hint');
    if (hint) hint.textContent = `Tap dice — ${players[currentPlayer].name}'s turn`;
    updatePlayerCards();
    const dice = document.getElementById('snl-dice');
    if (dice) dice.classList.remove('disabled');
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  render();
}

document.addEventListener('DOMContentLoaded', () => {
  initTicTacToe();
  initSnakesAndLadders();

  document.querySelectorAll('.games-tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.panel === 'panel-snl') {
        setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
      }
    });
  });
});
