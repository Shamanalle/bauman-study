// Practice Browser: custom rendering for practice bundles (formulas/methods/tasks/tickets)
// Similar architecture to lab-browser.js but for exam/KR practice

import { renderMath } from './math-utils.js';
import { nl } from './text-utils.js';
import * as progress from './progress.js';
import { drawPlot } from './plot-utils.js';

let practiceData = null;   // { meta, sections }
let currentTab = 0;        // index into sections

/**
 * Lightweight markdown → HTML for JSON content.
 * Handles: **bold**, \n→<br>, bullet lists (- item).
 * Preserves LaTeX ($ and $$) by passing through.
 */
function md(str) {
  if (!str) return '';
  // Preserve $$ blocks from being mangled
  const blocks = [];
  str = str.replace(/\$\$[\s\S]*?\$\$/g, m => { blocks.push(m); return `⌘B${blocks.length - 1}⌘`; });
  // Preserve inline $...$ math
  str = str.replace(/\$[^$]+?\$/g, m => { blocks.push(m); return `⌘B${blocks.length - 1}⌘`; });

  // Bold
  str = str.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Bullet lists: lines starting with "- "
  str = str.replace(/(?:^|\n)- (.+)/g, (_, item) => `\n<li>${item.trim()}</li>`);
  str = str.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');
  str = str.replace(/<\/ul>\s*<ul>/g, '');

  // Newlines → <br>
  str = str.replace(/\n/g, '<br>');
  str = str.replace(/<br>\s*<ul>/g, '<ul>');
  str = str.replace(/<\/ul>\s*<br>/g, '</ul>');

  // Restore all blocks
  blocks.forEach((b, i) => { str = str.replace(`⌘B${i}⌘`, b); });

  return str;
}

/**
 * Toggle reveal/collapse for a problem or ticket.
 */
function toggleReveal(el) {
  const card = el.closest('.prac-problem, .prac-ticket');
  if (!card) return;
  const isRevealed = card.classList.contains('revealed');
  if (isRevealed) {
    card.classList.remove('revealed');
  } else {
    card.classList.add('revealed');
    requestAnimationFrame(() => {
      renderMath(card);
      renderPlots(card);
    });
  }
}

/**
 * Toggle hint for a problem (show/hide keyIdea/hint without full solution).
 */
function toggleHint(el) {
  const card = el.closest('.prac-problem');
  if (!card) return;
  card.classList.toggle('hinted');
  if (card.classList.contains('hinted')) {
    requestAnimationFrame(() => renderMath(card));
  }
}

// Make it globally accessible for onclick
window.__pracToggle = toggleReveal;
window.__pracHint = toggleHint;

/**
 * Toggle individual task solution inside a ticket.
 */
function toggleTask(el) {
  const item = el.closest('.prac-ticket-task-item');
  if (!item) return;
  const isOpen = item.classList.contains('revealed');
  if (isOpen) {
    item.classList.remove('revealed');
  } else {
    item.classList.add('revealed');
    requestAnimationFrame(() => {
      renderMath(item);
      renderPlots(item);
    });
  }
}
window.__pracToggleTask = toggleTask;

/** Find all canvas[data-plot] in container and render plots */
function renderPlots(container) {
  const canvases = container.querySelectorAll('canvas[data-plot]');
  canvases.forEach(c => {
    try {
      const config = JSON.parse(c.getAttribute('data-plot'));
      drawPlot(c, config);
      c.removeAttribute('data-plot'); // don't re-render
      c.setAttribute('data-plotted', '1');
    } catch(e) { console.warn('Plot error:', e); }
  });
}

/**
 * Initialize the practice browser. Takes over the full page.
 */
export function initPracticeBrowser(data) {
  practiceData = data;
  const { meta, sections } = data;

  // Set up progress
  progress.setPrefix(meta.shortCode || 'prac');
  progress.loadLearned();
  progress.loadStrength();

  // Update hero
  document.getElementById('heroTitle').textContent = `${meta.icon} ${meta.title}`;
  document.getElementById('heroSubtitle').textContent = meta.subtitle;
  document.title = `${meta.title} · ${meta.subtitle}`;

  // Hide standard UI
  const pills = document.getElementById('sectionPills');
  const nav = document.querySelector('.nav');
  const statsRow = document.querySelector('.stats-row');
  if (pills) pills.innerHTML = '';
  if (nav) nav.style.display = 'none';
  if (statsRow) statsRow.style.display = 'none';

  // Build practice browser in #content
  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="practice-browser">
      <div class="lab-tabs" id="pracTabs">
        ${sections.map((s, i) => {
          const label = s.section.replace(/^[\p{Emoji}\u200d\ufe0f]+\s*/u, '');
          const icon = s.icon || '';
          return `<button class="lab-tab${i === 0 ? ' active' : ''}" data-idx="${i}">${icon} ${label}</button>`;
        }).join('')}
      </div>
      <div class="prac-content" id="pracContent"></div>
    </div>
  `;

  // Tab click handler
  document.getElementById('pracTabs').addEventListener('click', (e) => {
    const tab = e.target.closest('.lab-tab');
    if (!tab) return;
    currentTab = parseInt(tab.dataset.idx);
    document.querySelectorAll('#pracTabs .lab-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderCurrentTab();
  });

  renderCurrentTab();
}

function renderCurrentTab() {
  const section = practiceData.sections[currentTab];
  const el = document.getElementById('pracContent');
  if (!section) { el.innerHTML = '<p>Нет данных</p>'; return; }

  const icon = section.icon || '';
  switch (icon) {
    case '📋': renderFormulas(el, section); break;
    case '📚': renderMethods(el, section); break;
    case '✏️': renderProblems(el, section); break;
    case '🎫': renderTickets(el, section); break;
    default:   renderFormulas(el, section); break;
  }

  requestAnimationFrame(() => renderMath(el));
}

/* ─── Tab 1: Formula Reference ─── */
function renderFormulas(el, section) {
  el.innerHTML = `
    <div class="prac-formula-grid">
      ${section.questions.map((q, i) => `
        <div class="prac-formula-card">
          <div class="prac-formula-title">
            <span class="prac-formula-idx">${i + 1}</span>
            ${q.title}
          </div>
          <div class="prac-formula-body">${md(q.formalText)}</div>
        </div>
      `).join('')}
    </div>`;
}

/* ─── Tab 2: Algorithm Stepper ─── */
function renderMethods(el, section) {
  el.innerHTML = `<div class="prac-algo-list">
    ${section.questions.map((q, qi) => `
      <div class="prac-algo-card">
        <div class="prac-algo-header">
          <div class="prac-algo-icon">${qi + 1}</div>
          <div class="prac-algo-title">${md(q.title)}</div>
          ${q.tldr ? `<span class="prac-algo-badge">${md(q.tldr)}</span>` : ''}
        </div>
        <div class="prac-algo-steps">
          ${(q.steps || []).map((s, si) => `
            <div class="prac-step">
              <div class="prac-step-num">${si + 1}</div>
              <div class="prac-step-body">
                <div class="prac-step-title">${md(s.title)}</div>
                ${s.text ? `<div class="prac-step-text">${md(s.text)}</div>` : ''}
                ${s.math ? `<div class="prac-step-math">${s.math}</div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')}
  </div>`;
}

/* ─── Extract unique topics from questions ─── */
function extractTopics(questions) {
  const topicMap = new Map();
  for (const q of questions) {
    const type = q.type || '';
    const parts = type.split('·').map(s => s.trim());
    const topic = parts.length > 1 ? parts[parts.length - 1] : '';
    if (topic) {
      if (!topicMap.has(topic)) topicMap.set(topic, 0);
      topicMap.set(topic, topicMap.get(topic) + 1);
    }
  }
  return topicMap;
}

function getQuestionTopic(q) {
  const type = q.type || '';
  const parts = type.split('·').map(s => s.trim());
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

/* ─── Tab 3: Problem Cards with Toggle Reveal ─── */
function renderProblems(el, section) {
  const topics = extractTopics(section.questions);
  const hasTopics = topics.size > 1;

  el.innerHTML = `${hasTopics ? `
    <div class="prac-topic-filters" id="pracTopicFilters">
      <button class="prac-topic-pill active" data-topic="__all">
        Все <span class="prac-topic-count">${section.questions.length}</span>
      </button>
      ${[...topics.entries()].map(([topic, count]) => `
        <button class="prac-topic-pill" data-topic="${topic}">
          ${topic} <span class="prac-topic-count">${count}</span>
        </button>
      `).join('')}
    </div>
  ` : ''}
  <div class="prac-problem-list" id="pracProblemList">
    ${section.questions.map(q => {
      const hasSolution = (q.steps && q.steps.length) || q.formula;
      const hasHint = q.tldr || q.keyIdea;
      return `
      <div class="prac-problem" id="prob-${q.id}" data-topic="${getQuestionTopic(q)}">
        <div class="prac-problem-head">
          <div class="prac-problem-num">${q.id}</div>
          <div class="prac-problem-info">
            <div class="prac-problem-title">${md(q.title)}</div>
            <div class="prac-problem-type">${q.type || ''}</div>
          </div>
        </div>
        <div class="prac-problem-statement">${md(q.formalText)}</div>
        ${hasSolution ? `
          <div class="prac-problem-buttons">
            ${hasHint ? `
              <button class="prac-hint-btn" onclick="window.__pracHint(this)">
                <span>💡</span> <span>Подсказка</span>
              </button>
            ` : ''}
            <button class="prac-problem-reveal" onclick="window.__pracToggle(this)">
              <span class="reveal-icon">👁</span> <span class="reveal-text">Показать решение</span>
            </button>
          </div>
          ${hasHint ? `
            <div class="prac-hint-content">
              <div class="prac-hint-icon">💡</div>
              <div class="prac-hint-text">${md(q.hint || q.keyIdea || q.tldr)}</div>
            </div>
          ` : ''}
          <button class="prac-problem-collapse" onclick="window.__pracToggle(this)">
            <span>▲</span> Свернуть решение
          </button>
          <div class="prac-problem-solution">
            ${q.plot ? `<div class="prac-plot-wrap"><canvas class="prac-plot-canvas" data-plot='${JSON.stringify(q.plot)}'></canvas></div>` : ''}
            <div class="prac-solution-steps">
              ${(q.steps || []).map(s => `
                <div class="prac-solution-step">
                  ${s.title ? `<strong>${md(s.title)}:</strong> ` : ''}
                  ${md(s.text || '')}
                  ${s.math ? `<div class="prac-step-math">${s.math}</div>` : ''}
                </div>
              `).join('')}
            </div>
            ${q.formula ? `
              <div class="prac-problem-answer">
                <strong>Ответ:</strong> $${q.formula}$
              </div>
            ` : ''}
          </div>
        ` : ''}
      </div>`;
    }).join('')}
  </div>`;

  // Topic filter click handler
  if (hasTopics) {
    const filtersEl = el.querySelector('#pracTopicFilters');
    if (filtersEl) {
      filtersEl.addEventListener('click', (e) => {
        const pill = e.target.closest('.prac-topic-pill');
        if (!pill) return;
        const topic = pill.dataset.topic;
        
        // Update active state
        filtersEl.querySelectorAll('.prac-topic-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        
        // Filter problems
        const problems = el.querySelectorAll('.prac-problem');
        problems.forEach(p => {
          if (topic === '__all') {
            p.style.display = '';
          } else {
            const probTopic = p.getAttribute('data-topic');
            p.style.display = probTopic === topic ? '' : 'none';
          }
        });
      });
    }
  }
}

/* ─── Tab 4: Exam Tickets with Per-Task Solutions ─── */
function renderTickets(el, section) {
  el.innerHTML = `<div class="prac-ticket-list">
    ${section.questions.map(q => {
      // Parse formalText: split by "**Задача N**"
      const parts = (q.formalText || '').split(/\*\*Задача\s+\d+\*\*/);
      const hasTasks = parts.length > 1;
      const tasks = hasTasks ? parts.filter(Boolean) : [];
      const steps = q.steps || [];

      return `
        <div class="prac-ticket">
          <div class="prac-ticket-header">
            <div class="prac-ticket-title">${q.title}</div>
            <div class="prac-ticket-subtitle">${q.type || ''}</div>
          </div>
          <div class="prac-ticket-body">
            ${hasTasks ? tasks.map((t, i) => {
              const step = steps[i];
              return `
              <div class="prac-ticket-task-item">
                <div class="prac-ticket-task">
                  <div class="prac-ticket-task-num">${i + 1}.</div>
                  <div class="prac-ticket-task-text">${md(t.trim())}</div>
                </div>
                ${step ? `
                  <button class="prac-ticket-task-reveal" onclick="window.__pracToggleTask(this)">
                    👁 Показать решение задачи ${i + 1}
                  </button>
                  <div class="prac-ticket-task-solution">
                    <button class="prac-ticket-task-collapse" onclick="window.__pracToggleTask(this)">
                      ▲ Свернуть решение
                    </button>
                    ${step.title ? `<div class="prac-ticket-sol-title">${md(step.title)}</div>` : ''}
                    <div class="prac-ticket-sol-body">${md(step.text || '')}</div>
                    ${step.math ? `<div class="prac-step-math">${step.math}</div>` : ''}
                  </div>
                ` : ''}
              </div>`;
            }).join('') : `<div class="prac-ticket-task-text">${md(q.formalText)}</div>`}
          </div>
        </div>
      `;
    }).join('')}
  </div>`;
}
