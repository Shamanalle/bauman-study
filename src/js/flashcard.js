// Flashcard Mode — UI module
// Three screens: Setup → Session → Results
// Reuses buildQuestionBody() from question-card.js for answer rendering

import { buildQuestionBody } from './question-card.js';
import { renderMath } from './math-utils.js';
import * as sr from './sr-engine.js';

let _meta = null;
let _sections = [];
let _allCards = [];
let _session = [];
let _sessionIdx = 0;
let _sessionResults = [];  // { card, grade }
let _answerRevealed = false;
let _keyHandler = null;

// ══════════════════════════════════════════════
//  PUBLIC API
// ══════════════════════════════════════════════

/**
 * Initialize flashcard mode.
 * @param {{ meta, sections }} data — loaded assessment data
 */
export function initFlashcard({ meta, sections }) {
  _meta = meta;
  _sections = sections;

  // Flatten all questions, tagging each with section name
  _allCards = [];
  for (const sec of sections) {
    for (const q of sec.questions) {
      _allCards.push({ ...q, _section: sec.section, _sectionIcon: sec.icon });
    }
  }

  showSetup();
}

// ══════════════════════════════════════════════
//  SETUP SCREEN
// ══════════════════════════════════════════════

function showSetup() {
  cleanup();
  const container = getContainer();
  const stats = sr.getStats(_allCards);
  const pct = stats.total ? Math.round((stats.learned / stats.total) * 100) : 0;

  // SVG ring
  const R = 58, C = 2 * Math.PI * R;
  const offset = C - (C * pct / 100);

  // Section options
  const sectionNames = _sections.map(s => s.section);

  container.innerHTML = `
    <div class="fc-container">
      <div class="fc-setup">
        <div class="fc-stats-ring">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle class="fc-ring-bg" cx="70" cy="70" r="${R}" />
            <circle class="fc-ring-fill" cx="70" cy="70" r="${R}"
              stroke-dasharray="${C}" stroke-dashoffset="${offset}" />
          </svg>
          <div class="fc-ring-text">
            <span class="fc-ring-pct">${pct}%</span>
            <span class="fc-ring-label">выучено</span>
          </div>
        </div>

        <div class="fc-stat-row">
          ${stats.due ? `<div class="fc-stat-pill" data-type="due">🔄 ${stats.due} на повторении</div>` : ''}
          <div class="fc-stat-pill" data-type="learned">✅ ${stats.learned} выучено</div>
          ${stats.new ? `<div class="fc-stat-pill" data-type="new">🆕 ${stats.new} ${stats.new === stats.total ? '' : 'новых'}</div>` : ''}
        </div>

        <div class="fc-mode-group" id="fcModeGroup">
          <button class="fc-mode-btn active" data-mode="all">
            🔀 Все карточки
            <span class="fc-mode-count">${stats.total}</span>
          </button>
          ${stats.due ? `
          <button class="fc-mode-btn" data-mode="due">
            🔄 На повторении
            <span class="fc-mode-count">${stats.due}</span>
          </button>` : ''}
          ${stats.new ? `
          <button class="fc-mode-btn" data-mode="new">
            🆕 Новые
            <span class="fc-mode-count">${stats.new}</span>
          </button>` : ''}
        </div>

        <button class="fc-start-btn" id="fcStartBtn" ${stats.total === 0 ? 'disabled' : ''}>
          ▶ Начать · ${Math.min(15, stats.total)} карточек
        </button>

        ${stats.total === 0 ? `
          <div class="fc-all-done">
            <div class="fc-all-done-icon">🎓</div>
            <div class="fc-all-done-text">Все карточки выучены!</div>
            <div class="fc-all-done-sub">Возвращайтесь позже для повторения</div>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  // Mode toggle
  let selectedMode = 'all';
  container.querySelectorAll('.fc-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.fc-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedMode = btn.dataset.mode;
      const count = selectedMode === 'all' ? stats.total
        : selectedMode === 'due' ? stats.due : stats.new;
      const limit = Math.min(15, count);
      document.getElementById('fcStartBtn').textContent = `▶ Начать · ${limit} карточек`;
    });
  });

  // Start
  document.getElementById('fcStartBtn')?.addEventListener('click', () => {
    const cards = sr.buildSession(_allCards, { mode: selectedMode, limit: 15 });
    if (cards.length > 0) startSession(cards);
  });
}

// ══════════════════════════════════════════════
//  SESSION SCREEN
// ══════════════════════════════════════════════

function startSession(cards) {
  _session = cards;
  _sessionIdx = 0;
  _sessionResults = [];
  showCard();
}

function showCard() {
  cleanup();
  _answerRevealed = false;
  const container = getContainer();
  const q = _session[_sessionIdx];
  const total = _session.length;
  const current = _sessionIdx + 1;
  const pct = Math.round((_sessionIdx / total) * 100);

  // Type badge text
  const typeEmoji = q.type?.includes('Теорема') ? '📐' :
    q.type?.includes('Закон') ? '⚖️' :
    q.type?.includes('Формула') ? '📊' :
    q.type?.includes('Формулировка') ? '📄' : '📖';

  container.innerHTML = `
    <div class="fc-container">
      <div class="fc-progress">
        <span class="fc-progress-counter">${current}/${total}</span>
        <div class="fc-progress-bar">
          <div class="fc-progress-fill" style="width:${pct}%"></div>
        </div>
      </div>

      <div class="fc-card" id="fcCard">
        <div class="fc-card-header">
          <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:12px">
            <div class="fc-type-badge">${typeEmoji} ${q.type || 'Карточка'}</div>
            <div class="fc-type-badge" style="background:var(--blue-bg);color:var(--blue)">${q._sectionIcon || '📂'} ${q._section}</div>
          </div>
          <div class="fc-question">${q.title}</div>
        </div>

        <button class="fc-hint-btn" id="fcHintBtn">💡 Подсказка</button>

        <button class="fc-reveal-btn" id="fcRevealBtn">
          👁 Показать ответ
        </button>
      </div>

      <button class="fc-exit-btn" id="fcExitBtn">Esc · Завершить</button>

      <div class="fc-keys-hint">
        <kbd>Space</kbd> показать ответ &nbsp;
        <kbd>H</kbd> подсказка &nbsp;
        <kbd>Esc</kbd> выход
      </div>
    </div>
  `;

  // Hint — support both new 'insight' and legacy 'intuition'/'keyIdea'/'tldr' fields
  const hintText = q.insight || q.intuition || q.keyIdea || q.tldr || '';
  const hintBtn = document.getElementById('fcHintBtn');
  if (hintText) {
    hintBtn.addEventListener('click', () => {
      if (!hintBtn.classList.contains('used')) {
        hintBtn.classList.add('used');
        hintBtn.textContent = `💡 ${hintText}`;
      }
    });
  } else {
    hintBtn.style.display = 'none';
  }

  // Reveal
  document.getElementById('fcRevealBtn').addEventListener('click', revealAnswer);

  // Exit
  document.getElementById('fcExitBtn').addEventListener('click', showResults);

  // Keyboard
  attachKeys();
}

function revealAnswer() {
  if (_answerRevealed) return;
  _answerRevealed = true;

  const q = _session[_sessionIdx];
  const card = document.getElementById('fcCard');

  // Remove reveal/hint buttons
  document.getElementById('fcRevealBtn')?.remove();
  document.getElementById('fcHintBtn')?.remove();

  // Build answer using existing buildQuestionBody
  const answerHTML = buildQuestionBody(q);

  // Add answer + grade buttons
  const answerDiv = document.createElement('div');
  answerDiv.className = 'fc-answer';
  answerDiv.innerHTML = answerHTML;
  card.appendChild(answerDiv);

  // Grade buttons
  const gradeRow = document.createElement('div');
  gradeRow.className = 'fc-grade-row';
  gradeRow.innerHTML = `
    <button class="fc-grade-btn" data-grade="1">
      <span>😰</span>Не знаю
    </button>
    <button class="fc-grade-btn" data-grade="3">
      <span>🤔</span>Помню
    </button>
    <button class="fc-grade-btn" data-grade="5">
      <span>😎</span>Легко
    </button>
  `;
  card.appendChild(gradeRow);

  // Keys hint under grades
  const keysHint = document.createElement('div');
  keysHint.className = 'fc-keys-hint';
  keysHint.innerHTML = '<kbd>1</kbd> не знаю &nbsp; <kbd>2</kbd> помню &nbsp; <kbd>3</kbd> легко';
  card.appendChild(keysHint);

  // Update bottom keys hint
  const bottomHint = document.querySelector('.fc-keys-hint:not(.fc-card .fc-keys-hint)');
  if (bottomHint) bottomHint.remove();

  // Grade handlers
  gradeRow.querySelectorAll('.fc-grade-btn').forEach(btn => {
    btn.addEventListener('click', () => gradeCard(+btn.dataset.grade));
  });

  // Render math in the answer
  renderMath(answerDiv);

  // Scroll to reveal
  answerDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function gradeCard(grade) {
  const q = _session[_sessionIdx];
  sr.updateCardSR(q.id, grade);
  _sessionResults.push({ card: q, grade });

  _sessionIdx++;
  if (_sessionIdx < _session.length) {
    showCard();
  } else {
    showResults();
  }
}

// ══════════════════════════════════════════════
//  RESULTS SCREEN
// ══════════════════════════════════════════════

function showResults() {
  cleanup();
  const container = getContainer();

  const total = _sessionResults.length;
  if (total === 0) {
    showSetup();
    return;
  }

  const easy = _sessionResults.filter(r => r.grade === 5).length;
  const ok = _sessionResults.filter(r => r.grade === 3).length;
  const fail = _sessionResults.filter(r => r.grade === 1).length;
  const failed = _sessionResults.filter(r => r.grade === 1);

  const score = Math.round(((easy + ok * 0.5) / total) * 100);
  const barColor = score >= 70 ? 'var(--accent)' : score >= 40 ? 'var(--orange)' : 'var(--red)';

  container.innerHTML = `
    <div class="fc-container">
      <div class="fc-results">
        <div class="fc-results-title">${score >= 70 ? '🎉' : score >= 40 ? '💪' : '📚'} Сессия завершена</div>

        <div class="fc-score-bar">
          <div class="fc-score-fill" style="width:${score}%;background:${barColor}"></div>
        </div>
        <div class="fc-score-label">${easy + ok} из ${total} · ${score}%</div>

        <div class="fc-breakdown">
          <div class="fc-breakdown-item">
            <span class="fc-breakdown-icon">😎</span>
            <span class="fc-breakdown-count">${easy}</span>
            <span class="fc-breakdown-label">Легко</span>
          </div>
          <div class="fc-breakdown-item">
            <span class="fc-breakdown-icon">🤔</span>
            <span class="fc-breakdown-count">${ok}</span>
            <span class="fc-breakdown-label">Помню</span>
          </div>
          <div class="fc-breakdown-item">
            <span class="fc-breakdown-icon">😰</span>
            <span class="fc-breakdown-count">${fail}</span>
            <span class="fc-breakdown-label">Не знаю</span>
          </div>
        </div>

        ${failed.length ? `
          <div class="fc-failed-list">
            <div class="fc-failed-title">❌ Повторить:</div>
            ${failed.map(r => `<div class="fc-failed-item">${r.card.title}</div>`).join('')}
          </div>
        ` : ''}

        <div class="fc-actions">
          ${failed.length ? `
            <button class="fc-action-btn primary" id="fcRetryFailed">
              🔄 Повторить ошибки (${failed.length})
            </button>
          ` : ''}
          <button class="fc-action-btn ${!failed.length ? 'primary' : ''}" id="fcBackSetup">
            🏠 К настройке
          </button>
        </div>
      </div>
    </div>
  `;

  // Retry failed
  document.getElementById('fcRetryFailed')?.addEventListener('click', () => {
    const failedCards = failed.map(r => r.card);
    startSession(failedCards);
  });

  // Back to setup
  document.getElementById('fcBackSetup')?.addEventListener('click', showSetup);
}

// ══════════════════════════════════════════════
//  KEYBOARD
// ══════════════════════════════════════════════

function attachKeys() {
  detachKeys();
  _keyHandler = (e) => {
    // Don't interfere with inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key) {
      case ' ':
      case 'Enter':
        e.preventDefault();
        if (!_answerRevealed) revealAnswer();
        break;
      case 'h':
      case 'H':
      case 'р': // Russian layout
      case 'Р':
        if (!_answerRevealed) {
          document.getElementById('fcHintBtn')?.click();
        }
        break;
      case '1':
        if (_answerRevealed) gradeCard(1);
        break;
      case '2':
        if (_answerRevealed) gradeCard(3);
        break;
      case '3':
        if (_answerRevealed) gradeCard(5);
        break;
      case 'Escape':
        showResults();
        break;
    }
  };
  document.addEventListener('keydown', _keyHandler);
}

function detachKeys() {
  if (_keyHandler) {
    document.removeEventListener('keydown', _keyHandler);
    _keyHandler = null;
  }
}

// ══════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════

function getContainer() {
  let el = document.getElementById('content');
  if (!el) {
    el = document.createElement('div');
    el.id = 'content';
    document.getElementById('app').appendChild(el);
  }
  return el;
}

function cleanup() {
  detachKeys();
}
