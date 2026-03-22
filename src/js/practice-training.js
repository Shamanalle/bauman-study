// Practice Training Mode — UI module
// Three screens: Setup → Task → Results
// Reuses md() from practice-browser for rendering
// Modeled after flashcard.js but for problem-solving practice

import { renderMath } from './math-utils.js';
import { nl } from './text-utils.js';
import { drawPlot } from './plot-utils.js';
import * as engine from './practice-engine.js';
import { DIFFICULTY, classifySection } from './practice-engine.js';

let _meta = null;
let _sections = [];
let _allProblems = [];
let _session = [];
let _sessionIdx = 0;
let _sessionResults = [];  // { question, understood }
let _solutionRevealed = false;
let _keyHandler = null;
let _onExit = null;

// ── md() — lightweight markdown for JSON content ──
function md(str) {
  if (!str) return '';
  const blocks = [];
  str = str.replace(/\$\$[\s\S]*?\$\$/g, m => { blocks.push(m); return `⌘B${blocks.length - 1}⌘`; });
  str = str.replace(/\$[^$]+?\$/g, m => { blocks.push(m); return `⌘B${blocks.length - 1}⌘`; });
  str = str.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  str = str.replace(/(?:^|\n)- (.+)/g, (_, item) => `\n<li>${item.trim()}</li>`);
  str = str.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');
  str = str.replace(/<\/ul>\s*<ul>/g, '');
  str = str.replace(/\n/g, '<br>');
  str = str.replace(/<br>\s*<ul>/g, '<ul>');
  str = str.replace(/<\/ul>\s*<br>/g, '</ul>');
  blocks.forEach((b, i) => { str = str.replace(`⌘B${i}⌘`, b); });
  return str;
}

// ══════════════════════════════════════════════
//  PUBLIC API
// ══════════════════════════════════════════════

/**
 * Initialize training mode.
 * @param {{ meta, sections }} data
 * @param {Function} onExit — callback to return to practice browser
 */
export function initTraining({ meta, sections }, onExit) {
  _meta = meta;
  _sections = sections;
  _onExit = onExit;

  // Collect all problems from ✏️ sections, tagging difficulty
  _allProblems = [];
  for (const sec of sections) {
    if (sec.icon === '✏️') {
      const diff = classifySection(sec);
      for (const q of sec.questions) {
        _allProblems.push({ ...q, _section: sec.section, _difficulty: diff });
      }
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

  // Check if we have both difficulty levels
  const hasMain = _allProblems.some(q => q._difficulty === DIFFICULTY.MAIN);
  const hasExtra = _allProblems.some(q => q._difficulty === DIFFICULTY.EXTRA);
  const hasBoth = hasMain && hasExtra;

  // Default difficulty filter
  let selectedDifficulty = DIFFICULTY.ALL;
  let filteredProblems = _allProblems;

  function getFilteredProblems(diff) {
    if (diff === DIFFICULTY.ALL) return _allProblems;
    return _allProblems.filter(q => q._difficulty === diff);
  }

  const stats = engine.getOverallStats(filteredProblems);
  const topicStats = engine.getTopicStats(filteredProblems);
  const pct = stats.total ? Math.round((stats.understood / stats.total) * 100) : 0;

  const mainCount = _allProblems.filter(q => q._difficulty === DIFFICULTY.MAIN).length;
  const extraCount = _allProblems.filter(q => q._difficulty === DIFFICULTY.EXTRA).length;

  // SVG ring
  const R = 58, C = 2 * Math.PI * R;
  const offset = C - (C * pct / 100);

  container.innerHTML = `
    <div class="pt-container">
      <div class="pt-setup">
        ${hasBoth ? `
        <div class="pt-difficulty-tabs" id="ptDiffTabs">
          <button class="pt-diff-tab active" data-diff="all">📋 Все <span class="pt-diff-count">${_allProblems.length}</span></button>
          <button class="pt-diff-tab" data-diff="main">🎯 Задачи и билеты <span class="pt-diff-count">${mainCount}</span></button>
          <button class="pt-diff-tab" data-diff="extra">📝 Доп. задачи <span class="pt-diff-count">${extraCount}</span></button>
        </div>
        ` : ''}

        <div class="pt-stats-ring">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle class="pt-ring-bg" cx="70" cy="70" r="${R}" />
            <circle class="pt-ring-fill" cx="70" cy="70" r="${R}"
              stroke-dasharray="${C}" stroke-dashoffset="${offset}" />
          </svg>
          <div class="pt-ring-text">
            <span class="pt-ring-pct">${pct}%</span>
            <span class="pt-ring-label">освоено</span>
          </div>
        </div>

        <div class="pt-stat-row" id="ptStatRow">
          ${stats.weak ? `<div class="pt-stat-pill" data-type="weak">❌ ${stats.weak} слабых</div>` : ''}
          <div class="pt-stat-pill" data-type="ok">✅ ${stats.understood} понятых</div>
          ${stats.fresh ? `<div class="pt-stat-pill" data-type="fresh">🆕 ${stats.fresh} новых</div>` : ''}
        </div>

        <div class="pt-topic-map" id="ptTopicMap">
          <div class="pt-topic-map-title">📊 Покрытие по темам</div>
          ${topicStats.map(t => {
            const tPct = t.total ? Math.round((t.understood / t.total) * 100) : 0;
            const barColor = tPct >= 70 ? 'var(--accent)' : tPct >= 30 ? 'var(--orange)' : 'var(--red)';
            return `
              <div class="pt-topic-row" data-topic="${t.topic}">
                <span class="pt-topic-name">${t.topic}</span>
                <div class="pt-topic-bar">
                  <div class="pt-topic-fill" style="width:${tPct}%;background:${barColor}"></div>
                </div>
                <span class="pt-topic-count">${t.understood}/${t.total}</span>
              </div>`;
          }).join('')}
        </div>

        <div class="pt-config">
          <div class="pt-config-group">
            <label class="pt-config-label">Тема</label>
            <div class="pt-topic-btns" id="ptTopicBtns">
              <button class="pt-topic-btn active" data-topic="all">🔀 Все</button>
              ${stats.weak ? `<button class="pt-topic-btn" data-topic="__weak">❌ Слабые</button>` : ''}
              ${topicStats.map(t => 
                `<button class="pt-topic-btn" data-topic="${t.topic}">${t.topic} <span class="pt-topic-btn-count">${t.total}</span></button>`
              ).join('')}
            </div>
          </div>

          <div class="pt-config-group">
            <label class="pt-config-label">Задач в сессии</label>
            <div class="pt-size-btns" id="ptSizeBtns">
              <button class="pt-size-btn" data-size="5">5</button>
              <button class="pt-size-btn active" data-size="8">8</button>
              <button class="pt-size-btn" data-size="12">12</button>
              <button class="pt-size-btn" data-size="all">Все</button>
            </div>
          </div>
        </div>

        <button class="pt-start-btn" id="ptStartBtn" ${_allProblems.length === 0 ? 'disabled' : ''}>
          ▶ Начать тренировку
        </button>

        <button class="pt-back-btn" id="ptBackBtn">← Назад к справочнику</button>
      </div>
    </div>
  `;

  // Difficulty tabs — rebuild stats/topics when switching
  if (hasBoth) {
    function rebuildDynamicParts(diff) {
      filteredProblems = getFilteredProblems(diff);
      const newStats = engine.getOverallStats(filteredProblems);
      const newTopicStats = engine.getTopicStats(filteredProblems);
      const newPct = newStats.total ? Math.round((newStats.understood / newStats.total) * 100) : 0;

      // Update ring
      const newOffset = C - (C * newPct / 100);
      const ringFill = container.querySelector('.pt-ring-fill');
      const ringPct = container.querySelector('.pt-ring-pct');
      if (ringFill) ringFill.setAttribute('stroke-dashoffset', newOffset);
      if (ringPct) ringPct.textContent = newPct + '%';

      // Update stat row
      const statRow = document.getElementById('ptStatRow');
      if (statRow) {
        statRow.innerHTML = [
          newStats.weak ? `<div class="pt-stat-pill" data-type="weak">❌ ${newStats.weak} слабых</div>` : '',
          `<div class="pt-stat-pill" data-type="ok">✅ ${newStats.understood} понятых</div>`,
          newStats.fresh ? `<div class="pt-stat-pill" data-type="fresh">🆕 ${newStats.fresh} новых</div>` : '',
        ].join('');
      }

      // Update topic map
      const topicMap = document.getElementById('ptTopicMap');
      if (topicMap) {
        topicMap.innerHTML = `<div class="pt-topic-map-title">📊 Покрытие по темам</div>` +
          newTopicStats.map(t => {
            const tPct2 = t.total ? Math.round((t.understood / t.total) * 100) : 0;
            const barColor2 = tPct2 >= 70 ? 'var(--accent)' : tPct2 >= 30 ? 'var(--orange)' : 'var(--red)';
            return `<div class="pt-topic-row" data-topic="${t.topic}">
              <span class="pt-topic-name">${t.topic}</span>
              <div class="pt-topic-bar">
                <div class="pt-topic-fill" style="width:${tPct2}%;background:${barColor2}"></div>
              </div>
              <span class="pt-topic-count">${t.understood}/${t.total}</span>
            </div>`;
          }).join('');
        // Re-attach topic map click handlers
        topicMap.querySelectorAll('.pt-topic-row').forEach(row => {
          row.style.cursor = 'pointer';
          row.addEventListener('click', () => {
            const topic = row.dataset.topic;
            container.querySelectorAll('.pt-topic-btn').forEach(b => b.classList.remove('active'));
            const targetBtn = container.querySelector(`.pt-topic-btn[data-topic="${topic}"]`);
            if (targetBtn) targetBtn.classList.add('active');
            selectedTopic = topic;
          });
        });
      }

      // Update topic buttons
      const topicBtnsContainer = document.getElementById('ptTopicBtns');
      if (topicBtnsContainer) {
        topicBtnsContainer.innerHTML = `<button class="pt-topic-btn active" data-topic="all">🔀 Все</button>` +
          (newStats.weak ? `<button class="pt-topic-btn" data-topic="__weak">❌ Слабые</button>` : '') +
          newTopicStats.map(t => 
            `<button class="pt-topic-btn" data-topic="${t.topic}">${t.topic} <span class="pt-topic-btn-count">${t.total}</span></button>`
          ).join('');
        // Re-attach topic button click handlers
        selectedTopic = 'all';
        topicBtnsContainer.querySelectorAll('.pt-topic-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            topicBtnsContainer.querySelectorAll('.pt-topic-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedTopic = btn.dataset.topic;
          });
        });
      }
    }

    container.querySelectorAll('.pt-diff-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        container.querySelectorAll('.pt-diff-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        selectedDifficulty = tab.dataset.diff;
        rebuildDynamicParts(selectedDifficulty);
      });
    });
  }

  // Topic selection
  let selectedTopic = 'all';
  container.querySelectorAll('.pt-topic-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.pt-topic-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedTopic = btn.dataset.topic;
    });
  });

  // Topic map click → select topic
  container.querySelectorAll('.pt-topic-row').forEach(row => {
    row.style.cursor = 'pointer';
    row.addEventListener('click', () => {
      const topic = row.dataset.topic;
      container.querySelectorAll('.pt-topic-btn').forEach(b => b.classList.remove('active'));
      const targetBtn = container.querySelector(`.pt-topic-btn[data-topic="${topic}"]`);
      if (targetBtn) targetBtn.classList.add('active');
      selectedTopic = topic;
    });
  });

  // Size selection
  let selectedSize = 8;
  container.querySelectorAll('.pt-size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.pt-size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedSize = btn.dataset.size === 'all' ? 999 : parseInt(btn.dataset.size);
    });
  });

  // Start — use filtered problems
  document.getElementById('ptStartBtn')?.addEventListener('click', () => {
    let mode = 'all';
    let topic = selectedTopic;
    if (selectedTopic === '__weak') {
      mode = 'weak';
      topic = null;
    } else if (selectedTopic === 'all') {
      topic = null;
    }
    const session = engine.buildTrainingSession(filteredProblems, {
      topic,
      limit: selectedSize,
      mode,
    });
    if (session.length > 0) startSession(session);
  });

  // Back
  document.getElementById('ptBackBtn')?.addEventListener('click', () => {
    cleanup();
    if (_onExit) _onExit();
  });
}

// ══════════════════════════════════════════════
//  SESSION — one task at a time
// ══════════════════════════════════════════════

function startSession(questions) {
  _session = questions;
  _sessionIdx = 0;
  _sessionResults = [];
  showTask();
}

function showTask() {
  cleanup();
  _solutionRevealed = false;
  const container = getContainer();
  const q = _session[_sessionIdx];
  const total = _session.length;
  const current = _sessionIdx + 1;
  const pct = Math.round((_sessionIdx / total) * 100);
  const topic = engine.extractTopic(q.type);

  container.innerHTML = `
    <div class="pt-container">
      <div class="pt-progress">
        <span class="pt-progress-counter">${current}/${total}</span>
        <div class="pt-progress-bar">
          <div class="pt-progress-fill" style="width:${pct}%"></div>
        </div>
      </div>

      <div class="pt-task-card" id="ptTaskCard">
        <div class="pt-task-header">
          <div class="pt-task-badges">
            <span class="pt-badge pt-badge-topic">${topic}</span>
            ${q._section ? `<span class="pt-badge pt-badge-section">${q._section}</span>` : ''}
          </div>
          <h3 class="pt-task-title">${q.title || ''}</h3>
        </div>

        <div class="pt-task-statement">${md(q.formalText || '')}</div>

        ${q.plot ? `<div class="pt-task-plot"><canvas class="prac-plot-canvas" data-plot='${JSON.stringify(q.plot)}'></canvas></div>` : ''}

        <button class="pt-hint-btn" id="ptHintBtn">💡 Подсказка</button>

        <div class="pt-hint-content" id="ptHintContent">
          <span class="pt-hint-icon">💡</span>
          <div class="pt-hint-text">${md(q.hint || q.tldr || '')}</div>
        </div>

        <button class="pt-reveal-btn" id="ptRevealBtn">
          📝 Показать решение
        </button>
      </div>

      <button class="pt-exit-btn" id="ptExitBtn">Esc · Завершить</button>

      <div class="pt-keys-hint">
        <kbd>Space</kbd> решение &nbsp;
        <kbd>H</kbd> подсказка &nbsp;
        <kbd>Esc</kbd> выход
      </div>
    </div>
  `;

  // Hint
  const hintBtn = document.getElementById('ptHintBtn');
  const hintContent = document.getElementById('ptHintContent');
  const hintText = q.hint || q.tldr || '';
  if (hintText) {
    hintBtn.addEventListener('click', () => {
      hintContent.classList.toggle('visible');
      hintBtn.classList.toggle('used');
      requestAnimationFrame(() => renderMath(hintContent));
    });
  } else {
    hintBtn.style.display = 'none';
  }

  // Reveal
  document.getElementById('ptRevealBtn').addEventListener('click', revealSolution);

  // Exit
  document.getElementById('ptExitBtn').addEventListener('click', showResults);

  // Render math + plots
  const card = document.getElementById('ptTaskCard');
  renderMath(card);
  renderPlots(card);

  attachKeys();
}

function revealSolution() {
  if (_solutionRevealed) return;
  _solutionRevealed = true;

  const q = _session[_sessionIdx];
  const card = document.getElementById('ptTaskCard');

  // Remove reveal/hint buttons
  document.getElementById('ptRevealBtn')?.remove();
  document.getElementById('ptHintBtn')?.remove();

  // Build solution
  const solutionDiv = document.createElement('div');
  solutionDiv.className = 'pt-solution';

  let solutionHTML = '';

  // Steps
  if (q.steps && q.steps.length) {
    solutionHTML += '<div class="pt-solution-steps">';
    q.steps.forEach((step, i) => {
      solutionHTML += `
        <div class="pt-sol-step">
          <div class="pt-sol-step-header">
            <span class="pt-sol-step-num">${i + 1}</span>
            <strong>${step.title || `Шаг ${i + 1}`}</strong>
          </div>
          ${step.text ? `<div class="pt-sol-step-text">${md(step.text)}</div>` : ''}
          ${step.math ? `<div class="pt-sol-step-math">${step.math}</div>` : ''}
          ${step.tip ? `<div class="pt-sol-step-tip">⚠️ ${md(step.tip)}</div>` : ''}
        </div>`;
    });
    solutionHTML += '</div>';
  }

  // Final answer
  if (q.formula) {
    solutionHTML += `
      <div class="pt-answer">
        <strong>Ответ:</strong> $$${q.formula}$$
      </div>`;
  }

  solutionDiv.innerHTML = solutionHTML;
  card.appendChild(solutionDiv);

  // Plot in solution
  if (q.plot) {
    renderPlots(solutionDiv);
  }

  // Grade buttons
  const gradeRow = document.createElement('div');
  gradeRow.className = 'pt-grade-row';
  gradeRow.innerHTML = `
    <button class="pt-grade-btn pt-grade-yes" data-grade="yes">
      <span>✅</span> Понял, решил бы сам
    </button>
    <button class="pt-grade-btn pt-grade-no" data-grade="no">
      <span>❌</span> Не понял / ошибся бы
    </button>
  `;
  card.appendChild(gradeRow);

  // Keys hint
  const keysHint = document.createElement('div');
  keysHint.className = 'pt-keys-hint';
  keysHint.innerHTML = '<kbd>1</kbd> понял &nbsp; <kbd>2</kbd> не понял';
  card.appendChild(keysHint);

  // Remove bottom keys hint
  const bottomHint = document.querySelector('.pt-keys-hint:not(.pt-task-card .pt-keys-hint)');
  if (bottomHint) bottomHint.remove();

  // Grade handlers
  gradeRow.querySelectorAll('.pt-grade-btn').forEach(btn => {
    btn.addEventListener('click', () => gradeTask(btn.dataset.grade === 'yes'));
  });

  // Render math in solution
  renderMath(solutionDiv);
  renderMath(gradeRow);

  // Scroll to solution
  solutionDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function gradeTask(understood) {
  const q = _session[_sessionIdx];
  engine.recordResult(q.id, understood);
  _sessionResults.push({ question: q, understood });

  _sessionIdx++;
  if (_sessionIdx < _session.length) {
    showTask();
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

  const correct = _sessionResults.filter(r => r.understood).length;
  const wrong = _sessionResults.filter(r => !r.understood).length;
  const failed = _sessionResults.filter(r => !r.understood);
  const score = Math.round((correct / total) * 100);
  const barColor = score >= 70 ? 'var(--accent)' : score >= 40 ? 'var(--orange)' : 'var(--red)';

  // Per-topic breakdown
  const topicMap = {};
  for (const r of _sessionResults) {
    const topic = engine.extractTopic(r.question.type);
    if (!topicMap[topic]) topicMap[topic] = { ok: 0, fail: 0 };
    if (r.understood) topicMap[topic].ok++;
    else topicMap[topic].fail++;
  }

  // Save session
  engine.saveSession({
    mode: 'training',
    score: correct,
    total,
    topics: Object.keys(topicMap),
  });

  container.innerHTML = `
    <div class="pt-container">
      <div class="pt-results">
        <div class="pt-results-title">${score >= 70 ? '🎉' : score >= 40 ? '💪' : '📚'} Тренировка завершена</div>

        <div class="pt-score-bar">
          <div class="pt-score-fill" style="width:${score}%;background:${barColor}"></div>
        </div>
        <div class="pt-score-label">${correct} из ${total} · ${score}%</div>

        <div class="pt-breakdown">
          <div class="pt-breakdown-item">
            <span class="pt-breakdown-icon">✅</span>
            <span class="pt-breakdown-count">${correct}</span>
            <span class="pt-breakdown-label">Понял</span>
          </div>
          <div class="pt-breakdown-item">
            <span class="pt-breakdown-icon">❌</span>
            <span class="pt-breakdown-count">${wrong}</span>
            <span class="pt-breakdown-label">Не понял</span>
          </div>
        </div>

        ${Object.keys(topicMap).length > 1 ? `
          <div class="pt-topic-breakdown">
            <div class="pt-topic-breakdown-title">По темам:</div>
            ${Object.entries(topicMap).map(([topic, { ok, fail }]) => {
              const tPct = Math.round((ok / (ok + fail)) * 100);
              const color = tPct >= 70 ? 'var(--accent)' : tPct >= 40 ? 'var(--orange)' : 'var(--red)';
              return `
                <div class="pt-topic-result">
                  <span class="pt-topic-result-name">${topic}</span>
                  <div class="pt-topic-result-bar">
                    <div class="pt-topic-result-fill" style="width:${tPct}%;background:${color}"></div>
                  </div>
                  <span class="pt-topic-result-score">${ok}/${ok + fail}</span>
                </div>`;
            }).join('')}
          </div>
        ` : ''}

        ${failed.length ? `
          <div class="pt-failed-list">
            <div class="pt-failed-title">❌ Повторить:</div>
            ${failed.map(r => `<div class="pt-failed-item">${r.question.title}</div>`).join('')}
          </div>
        ` : ''}

        <div class="pt-actions">
          ${failed.length ? `
            <button class="pt-action-btn primary" id="ptRetryFailed">
              🔄 Повторить ошибки (${failed.length})
            </button>
          ` : ''}
          <button class="pt-action-btn ${!failed.length ? 'primary' : ''}" id="ptNewSession">
            ▶ Новая тренировка
          </button>
          <button class="pt-action-btn" id="ptBackToRef">
            ← Назад к справочнику
          </button>
        </div>
      </div>
    </div>
  `;

  // Retry failed
  document.getElementById('ptRetryFailed')?.addEventListener('click', () => {
    startSession(failed.map(r => r.question));
  });

  // New session
  document.getElementById('ptNewSession')?.addEventListener('click', showSetup);

  // Back to reference
  document.getElementById('ptBackToRef')?.addEventListener('click', () => {
    cleanup();
    if (_onExit) _onExit();
  });
}

// ══════════════════════════════════════════════
//  KEYBOARD
// ══════════════════════════════════════════════

function attachKeys() {
  detachKeys();
  _keyHandler = (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key) {
      case ' ':
      case 'Enter':
        e.preventDefault();
        if (!_solutionRevealed) revealSolution();
        break;
      case 'h':
      case 'H':
      case 'р': // Russian layout
      case 'Р':
        if (!_solutionRevealed) {
          document.getElementById('ptHintBtn')?.click();
        }
        break;
      case '1':
        if (_solutionRevealed) gradeTask(true);
        break;
      case '2':
        if (_solutionRevealed) gradeTask(false);
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
  let el = document.getElementById('pracContent');
  if (!el) {
    el = document.getElementById('content');
  }
  return el;
}

function cleanup() {
  detachKeys();
}

function renderPlots(container) {
  const canvases = container.querySelectorAll('canvas[data-plot]');
  canvases.forEach(c => {
    try {
      const config = JSON.parse(c.getAttribute('data-plot'));
      drawPlot(c, config);
      c.removeAttribute('data-plot');
    } catch(e) { console.warn('Plot error:', e); }
  });
}
