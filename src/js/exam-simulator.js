// Exam Simulator — UI module
// Three screens: Setup → Exam (with timer) → Review
// Simulates real exam conditions: all tasks visible, timer, no hints

import { renderMath } from './math-utils.js';
import { md } from './text-utils.js';
import { drawPlot } from './plot-utils.js';
import * as engine from './practice-engine.js';
import { DIFFICULTY, classifySection } from './practice-engine.js';

let _meta = null;
let _sections = [];
let _examTasks = [];
let _examResults = {};  // taskId → understood (boolean|null)
let _currentTask = 0;
let _timerInterval = null;
let _startTime = null;
let _timerDuration = 0; // ms
let _elapsed = 0;       // ms
let _keyHandler = null;
let _onExit = null;

// ══════════════════════════════════════════════
//  PUBLIC API
// ══════════════════════════════════════════════

export function initExamSim({ meta, sections }, onExit) {
  _meta = meta;
  _sections = sections;
  _onExit = onExit;
  showSetup();
}

// ══════════════════════════════════════════════
//  SETUP SCREEN
// ══════════════════════════════════════════════

function showSetup() {
  cleanup();
  const container = getContainer();

  // Check for real tickets (🎫 sections)
  const realTickets = engine.getRealTickets(_sections);

  // Collect total problem count by difficulty
  let mainCount = 0, extraCount = 0;
  for (const sec of _sections) {
    const isProblem = sec.icon === '✏️' || sec.icon === '🎯' || (sec.section && sec.section.toLowerCase().includes('задач'));
    if (isProblem && sec.icon !== '🎫') {
      const diff = classifySection(sec);
      if (diff === DIFFICULTY.MAIN) mainCount += (sec.questions || []).length;
      else extraCount += (sec.questions || []).length;
    }
  }
  const totalProblems = mainCount + extraCount;
  const hasBothDiff = mainCount > 0 && extraCount > 0;


  // Session history
  const history = engine.getSessionHistory().filter(s => s.mode === 'exam').slice(-5).reverse();

  container.innerHTML = `
    <div class="es-container">
      <div class="es-setup">
        <div class="es-setup-header">
          <div class="es-setup-icon">⏱</div>
          <h2 class="es-setup-title">Симулятор контрольной</h2>
          <p class="es-setup-desc">Реши задачи как на реальной контрольной — с таймером и без подсказок</p>
        </div>

        <div class="es-config">
          ${hasBothDiff ? `
          <div class="es-config-group">
            <label class="es-config-label">📊 Сложность</label>
            <div class="es-diff-btns" id="esDiffBtns">
              <button class="es-diff-btn active" data-diff="main">🎯 Задачи и билеты <span class="es-diff-count">${mainCount}</span></button>
              <button class="es-diff-btn" data-diff="extra">📝 Доп. задачи <span class="es-diff-count">${extraCount}</span></button>
              <button class="es-diff-btn" data-diff="all">📋 Все <span class="es-diff-count">${totalProblems}</span></button>
            </div>
          </div>
          ` : ''}

          <div class="es-config-group">
            <label class="es-config-label">📋 Билет</label>
            <div class="es-ticket-btns" id="esTicketBtns">
              <button class="es-ticket-btn active" data-ticket="random">🎲 Случайный (5 задач)</button>
              <button class="es-ticket-btn" data-ticket="random-3">🎲 Короткий (3 задачи)</button>
              ${realTickets.map((t, i) =>
                `<button class="es-ticket-btn" data-ticket="real-${i}">🎫 ${t.title || `Билет ${i + 1}`}</button>`
              ).join('')}
            </div>
          </div>

          <div class="es-config-group">
            <label class="es-config-label">⏱ Время</label>
            <div class="es-timer-btns" id="esTimerBtns">
              <button class="es-timer-btn" data-time="45">45 мин</button>
              <button class="es-timer-btn active" data-time="60">60 мин</button>
              <button class="es-timer-btn" data-time="90">90 мин</button>
              <button class="es-timer-btn" data-time="0">∞ Без лимита</button>
            </div>
          </div>
        </div>

        ${history.length ? `
          <div class="es-history">
            <div class="es-history-title">📊 Предыдущие попытки</div>
            ${history.map(h => {
              const date = new Date(h.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
              const pct = h.total ? Math.round((h.score / h.total) * 100) : 0;
              const dur = h.duration ? Math.round(h.duration / 60000) : '?';
              return `<div class="es-history-item">
                <span>${date}</span>
                <span>${h.score}/${h.total} (${pct}%)</span>
                <span>${dur} мин</span>
              </div>`;
            }).join('')}
          </div>
        ` : ''}

        <button class="es-start-btn" id="esStartBtn" ${totalProblems === 0 ? 'disabled' : ''}>
          ▶ Начать контрольную
        </button>

        <button class="es-back-btn" id="esBackBtn">← Назад к справочнику</button>
      </div>
    </div>
  `;

  // Difficulty selection (for exam, default to main/exam-level)
  let selectedDifficulty = hasBothDiff ? DIFFICULTY.MAIN : DIFFICULTY.ALL;
  container.querySelectorAll('.es-diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.es-diff-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedDifficulty = btn.dataset.diff;
    });
  });

  // Ticket selection
  let selectedTicket = 'random';
  container.querySelectorAll('.es-ticket-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.es-ticket-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedTicket = btn.dataset.ticket;
    });
  });

  // Timer selection
  let selectedTime = 60;
  container.querySelectorAll('.es-timer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.es-timer-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedTime = parseInt(btn.dataset.time);
    });
  });

  // Start
  document.getElementById('esStartBtn')?.addEventListener('click', () => {
    let tasks;
    if (selectedTicket === 'random') {
      tasks = engine.buildExamTicket(_sections, 5, { difficulty: selectedDifficulty });
    } else if (selectedTicket === 'random-3') {
      tasks = engine.buildExamTicket(_sections, 3, { difficulty: selectedDifficulty });
    } else if (selectedTicket.startsWith('real-')) {
      const idx = parseInt(selectedTicket.split('-')[1]);
      const ticket = realTickets[idx];
      if (ticket && ticket.steps) {
        tasks = ticket.steps.map((step, i) => {
          let taskStatement = '';
          if (ticket.formalText) {
            const lines = ticket.formalText.split(/\n+/).map(l => l.trim()).filter(Boolean);
            const pattern = new RegExp(`(?:\\*\\*|#+\\s*)?Задача\\s*${i + 1}\\b`, 'i');
            const found = lines.find(l => pattern.test(l));
            taskStatement = found || lines[i] || '';
          }
          const formalText = taskStatement || (step.title ? `**${step.title}**` : `Задача ${i + 1}`);
          return {
            id: `${ticket.id}_t${i}`,
            title: step.title || `Задача ${i + 1}`,
            formalText,
            steps: step.steps && step.steps.length ? step.steps : (step.text ? [{
              title: step.title || 'Решение',
              text: step.text,
              math: step.math || '',
            }] : []),
            formula: step.math || '',
            hint: '',
            type: ticket.type || '',
          };
        });
      } else {
        tasks = engine.buildExamTicket(_sections, 5, { difficulty: selectedDifficulty });
      }
    } else {
      tasks = engine.buildExamTicket(_sections, 5, { difficulty: selectedDifficulty });
    }


    if (tasks.length > 0) {
      startExam(tasks, selectedTime * 60 * 1000);
    }
  });

  // Back
  document.getElementById('esBackBtn')?.addEventListener('click', () => {
    cleanup();
    if (_onExit) _onExit();
  });
}

// ══════════════════════════════════════════════
//  EXAM SCREEN
// ══════════════════════════════════════════════

function startExam(tasks, durationMs) {
  _examTasks = tasks;
  _examResults = {};
  _currentTask = 0;
  _startTime = Date.now();
  _timerDuration = durationMs;
  _elapsed = 0;

  renderExam();
  startTimer();
}

function renderExam() {
  cleanup();
  const container = getContainer();
  const q = _examTasks[_currentTask];

  container.innerHTML = `
    <div class="es-container">
      <div class="es-exam-header">
        <div class="es-timer" id="esTimer">
          ${_timerDuration > 0 ? '⏱ --:--' : '⏱ ∞'}
        </div>
        <div class="es-nav-dots" id="esNavDots">
          ${_examTasks.map((_, i) => `
            <button class="es-nav-dot ${i === _currentTask ? 'active' : ''}" data-idx="${i}">
              ${i + 1}
            </button>
          `).join('')}
        </div>
        <button class="es-finish-btn" id="esFinishBtn">🏁 Завершить</button>
      </div>
      ${_timerDuration > 0 ? `
        <div class="es-timer-bar-wrap">
          <div class="es-timer-bar-fill" id="esTimerBarFill" style="width: 0%"></div>
        </div>
      ` : ''}

      <div class="es-task-card" id="esTaskCard">
        <div class="es-task-num">Задача ${_currentTask + 1} из ${_examTasks.length}</div>
        <div class="es-task-title">${q.title || ''}</div>
        <div class="es-task-statement">${md(q.formalText || '')}</div>
        ${q.plot ? `<div class="es-task-plot"><canvas class="prac-plot-canvas" data-plot='${JSON.stringify(q.plot)}'></canvas></div>` : ''}
      </div>

      <div class="es-task-nav">
        <button class="es-prev-btn" id="esPrevBtn" ${_currentTask === 0 ? 'disabled' : ''}>← Предыдущая</button>
        <button class="es-next-btn" id="esNextBtn" ${_currentTask === _examTasks.length - 1 ? 'disabled' : ''}>Следующая →</button>
      </div>
    </div>
  `;

  // Navigation dots
  container.querySelectorAll('.es-nav-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      _currentTask = parseInt(dot.dataset.idx);
      renderExam();
    });
  });

  // Prev/Next
  document.getElementById('esPrevBtn')?.addEventListener('click', () => {
    if (_currentTask > 0) { _currentTask--; renderExam(); }
  });
  document.getElementById('esNextBtn')?.addEventListener('click', () => {
    if (_currentTask < _examTasks.length - 1) { _currentTask++; renderExam(); }
  });

  // Finish
  document.getElementById('esFinishBtn')?.addEventListener('click', finishExam);

  // Render math + plots
  const card = document.getElementById('esTaskCard');
  renderMath(card);
  renderPlots(card);

  // Update timer immediately
  updateTimerDisplay();

  // Keyboard
  attachExamKeys();
}

function startTimer() {
  if (_timerInterval) clearInterval(_timerInterval);
  if (_timerDuration <= 0) return; // no timer

  _timerInterval = setInterval(() => {
    _elapsed = Date.now() - _startTime;
    updateTimerDisplay();

    // Time's up
    if (_elapsed >= _timerDuration) {
      clearInterval(_timerInterval);
      _timerInterval = null;
      // Flash timer red
      const timerEl = document.getElementById('esTimer');
      if (timerEl) {
        timerEl.classList.add('es-timer-expired');
        timerEl.textContent = '⏱ Время вышло!';
      }
      // Auto-finish after 3 seconds
      setTimeout(finishExam, 3000);
    }
  }, 1000);
}

function updateTimerDisplay() {
  const timerEl = document.getElementById('esTimer');
  const barFill = document.getElementById('esTimerBarFill');
  if (!timerEl || _timerDuration <= 0) return;

  const elapsed = Date.now() - _startTime;
  const remaining = Math.max(0, _timerDuration - elapsed);
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  timerEl.textContent = `⏱ ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const pct = Math.min(100, Math.max(0, (elapsed / _timerDuration) * 100));
  if (barFill) {
    barFill.style.width = `${pct}%`;
  }

  // Warning colors & pulse
  if (remaining < 300000) { // < 5 min
    timerEl.classList.add('es-timer-warn');
    timerEl.classList.add('es-timer-pulse');
  } else {
    timerEl.classList.remove('es-timer-warn', 'es-timer-pulse');
  }
  if (remaining < 60000) { // < 1 min
    timerEl.classList.add('es-timer-danger');
  }
}

function finishExam() {
  if (_timerInterval) { clearInterval(_timerInterval); _timerInterval = null; }
  _elapsed = Date.now() - _startTime;
  showReview();
}

// ══════════════════════════════════════════════
//  REVIEW SCREEN
// ══════════════════════════════════════════════

function showReview() {
  cleanup();
  const container = getContainer();
  const elapsed = _elapsed;
  const mins = Math.floor(elapsed / 60000);

  container.innerHTML = `
    <div class="es-container">
      <div class="es-review">
        <div class="es-review-header">
          <h2>📝 Сверка</h2>
          <p>Сравни свои ответы с решениями и оцени каждую задачу</p>
          <div class="es-review-time">⏱ Потрачено: ${mins} мин${_timerDuration > 0 ? ` из ${Math.round(_timerDuration / 60000)}` : ''}</div>
        </div>

        <div class="es-review-tasks" id="esReviewTasks">
          ${_examTasks.map((q, i) => {
            const topic = engine.extractTopic(q.type);
            return `
              <div class="es-review-task" data-idx="${i}">
                <div class="es-review-task-header" data-idx="${i}">
                  <span class="es-review-task-num">${i + 1}</span>
                  <div class="es-review-task-info">
                    <div class="es-review-task-title">${q.title || `Задача ${i + 1}`}</div>
                    <div class="es-review-task-topic">${topic}</div>
                  </div>
                  <div class="es-review-check" id="esCheck_${i}">
                    <button class="es-check-btn es-check-yes" data-idx="${i}" data-val="yes" title="Решил верно">✅</button>
                    <button class="es-check-btn es-check-no" data-idx="${i}" data-val="no" title="Ошибся">❌</button>
                  </div>
                </div>

                <div class="es-review-task-statement">${md(q.formalText || '')}</div>

                <button class="es-reveal-sol-btn" data-idx="${i}">📝 Показать решение</button>

                <div class="es-review-solution" id="esSol_${i}">
                  ${buildSolutionHTML(q)}
                </div>
              </div>`;
          }).join('')}
        </div>

        <div class="es-review-summary" id="esReviewSummary" style="display:none">
          <div class="es-review-summary-content" id="esReviewSummaryContent"></div>
        </div>

        <div class="es-review-actions">
          <button class="es-action-btn primary" id="esCalcScore">📊 Подсчитать результат</button>
          <button class="es-action-btn" id="esNewExam">▶ Новая контрольная</button>
          <button class="es-action-btn" id="esBackRef">← Назад к справочнику</button>
        </div>
      </div>
    </div>
  `;

  // Reveal solution toggles
  container.querySelectorAll('.es-reveal-sol-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = btn.dataset.idx;
      const sol = document.getElementById(`esSol_${idx}`);
      if (sol) {
        sol.classList.toggle('visible');
        btn.textContent = sol.classList.contains('visible') ? '🔼 Скрыть решение' : '📝 Показать решение';
        if (sol.classList.contains('visible')) {
          renderMath(sol);
          renderPlots(sol);
        }
      }
    });
  });

  // Self-check buttons
  container.querySelectorAll('.es-check-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx);
      const val = btn.dataset.val === 'yes';
      _examResults[idx] = val;

      // Visual feedback
      const checkDiv = document.getElementById(`esCheck_${idx}`);
      checkDiv.querySelectorAll('.es-check-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  // Calculate score
  document.getElementById('esCalcScore')?.addEventListener('click', () => {
    const total = _examTasks.length;
    const checked = Object.values(_examResults).length;
    const correct = Object.values(_examResults).filter(v => v).length;

    if (checked < total) {
      // Not all checked
      const summaryEl = document.getElementById('esReviewSummary');
      summaryEl.style.display = 'block';
      document.getElementById('esReviewSummaryContent').innerHTML = `
        <div class="es-summary-warn">⚠️ Отметь все задачи (отмечено ${checked}/${total})</div>
      `;
      return;
    }

    const pct = Math.round((correct / total) * 100);
    const barColor = pct >= 70 ? 'var(--accent)' : pct >= 40 ? 'var(--orange)' : 'var(--red)';

    // Save results
    for (let i = 0; i < _examTasks.length; i++) {
      if (_examResults[i] !== undefined) {
        engine.recordResult(_examTasks[i].id, _examResults[i]);
      }
    }

    engine.saveSession({
      mode: 'exam',
      score: correct,
      total,
      duration: _elapsed,
      topics: [...new Set(_examTasks.map(q => engine.extractTopic(q.type)))],
    });

    const summaryEl = document.getElementById('esReviewSummary');
    summaryEl.style.display = 'block';
    document.getElementById('esReviewSummaryContent').innerHTML = `
      <div class="es-summary-title">${pct >= 70 ? '🎉' : pct >= 40 ? '💪' : '📚'} Результат контрольной</div>
      <div class="es-summary-score-bar">
        <div class="es-summary-score-fill" style="width:${pct}%;background:${barColor}"></div>
      </div>
      <div class="es-summary-score-label">${correct} из ${total} · ${pct}%</div>
      <div class="es-summary-time">⏱ ${mins} мин${_timerDuration > 0 ? ` из ${Math.round(_timerDuration / 60000)}` : ''}</div>
    `;

    summaryEl.scrollIntoView({ behavior: 'smooth' });

    // Hide calculate button
    document.getElementById('esCalcScore').style.display = 'none';
  });

  // New exam
  document.getElementById('esNewExam')?.addEventListener('click', showSetup);

  // Back
  document.getElementById('esBackRef')?.addEventListener('click', () => {
    cleanup();
    if (_onExit) _onExit();
  });

  // Render math for all statements
  renderMath(container);
}

function buildSolutionHTML(q) {
  let html = '';
  if (q.hint) {
    html += `<div class="es-sol-hint"><span class="es-sol-hint-icon">💡</span> ${md(q.hint)}</div>`;
  }
  if (q.steps && q.steps.length) {
    html += '<div class="es-sol-steps">';
    q.steps.forEach((step, i) => {
      html += `
        <div class="es-sol-step">
          <div class="es-sol-step-header">
            <span class="es-sol-step-num">${i + 1}</span>
            <strong>${step.title || `Шаг ${i + 1}`}</strong>
          </div>
          ${step.text ? `<div class="es-sol-step-text">${md(step.text)}</div>` : ''}
          ${step.math ? `<div class="es-sol-step-math">${step.math}</div>` : ''}
          ${step.tip ? `<div class="es-sol-step-tip">⚠️ ${md(step.tip)}</div>` : ''}
        </div>`;
    });
    html += '</div>';
  }
  if (q.formula) {
    const formulaStr = q.formula.trim();
    const formatted = (formulaStr.startsWith('$$') && formulaStr.endsWith('$$')) ||
                      (formulaStr.startsWith('$') && formulaStr.endsWith('$'))
      ? formulaStr
      : `$$${formulaStr}$$`;
    html += `<div class="es-sol-answer"><strong>Ответ:</strong> ${formatted}</div>`;
  }
  return html;
}

// ══════════════════════════════════════════════
//  EXAM KEYBOARD
// ══════════════════════════════════════════════

function attachExamKeys() {
  detachKeys();
  _keyHandler = (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    switch (e.key) {
      case 'ArrowLeft':
        if (_currentTask > 0) { _currentTask--; renderExam(); }
        break;
      case 'ArrowRight':
        if (_currentTask < _examTasks.length - 1) { _currentTask++; renderExam(); }
        break;
      case 'Escape':
        if (confirm('Завершить контрольную?')) finishExam();
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
  return document.getElementById('pracContent') || document.getElementById('content');
}

function cleanup() {
  detachKeys();
  if (_timerInterval) { clearInterval(_timerInterval); _timerInterval = null; }
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
