// Renderer: renders sections and question cards into the DOM
import { buildQuestionCard } from './question-card.js';
import { renderMath } from './math-utils.js';
import { getLearned } from './progress.js';

let allOpen = false;
let activeSection = null;
let currentSections = [];

export function setSections(sections) { currentSections = sections; }
export function getSections() { return currentSections; }
export function getActiveSection() { return activeSection; }

/**
 * Render all questions into #content, filtered by search text and active section.
 */
export function render(filter = '') {
  const fl = filter.toLowerCase();
  const container = document.getElementById('content');
  container.innerHTML = '';
  let totalRendered = 0;

  currentSections.forEach(sec => {
    if (activeSection && sec.section !== activeSection) return;

    const qs = sec.questions.filter(q =>
      !fl ||
      q.title.toLowerCase().includes(fl) ||
      (q.statement || '').toLowerCase().includes(fl) ||
      (q.intuition || '').toLowerCase().includes(fl) ||
      (q.formalText || '').toLowerCase().includes(fl) ||
      (q.proof || '').toLowerCase().includes(fl) ||
      (q.tldr || '').toLowerCase().includes(fl)
    );

    if (!qs.length) return;
    totalRendered += qs.length;

    const secId = 'sec-prog-' + sec.section.replace(/\s/g, '_');
    const divider = document.createElement('div');
    divider.innerHTML = `<div class="section-divider">
      <span class="sd-icon">${sec.icon}</span>
      <span class="sd-text">${sec.section}</span>
      <span class="sd-line"></span>
      <span class="sd-prog" id="${secId}"></span>
      <span class="sd-count">${qs.length}</span>
    </div>`;
    container.appendChild(divider.firstChild);

    qs.forEach(q => {
      const el = document.createElement('div');
      el.className = 'theorem-page' + (allOpen ? ' open' : '');
      el.id = 'q' + q.id;
      el.innerHTML = buildQuestionCard(q);
      container.appendChild(el);
    });
  });

  if (totalRendered === 0 && fl) {
    container.innerHTML = `
      <div class="search-empty-state">
        <div class="ses-icon">🔍</div>
        <div class="ses-title">Ничего не найдено</div>
        <div class="ses-desc">По запросу «${filter}» нет совпадений</div>
      </div>
    `;
  }

  updateLearnedUI();
  requestAnimationFrame(() => {
    document.querySelectorAll('.theorem-page').forEach(el => renderMath(el));
  });
}

/**
 * Update the UI to reflect learned state.
 */
export function updateLearnedUI() {
  const learned = getLearned();
  const totalQ = currentSections.reduce((s, sec) => s + sec.questions.length, 0);

  document.getElementById('learnedCount').textContent = learned.length;
  document.getElementById('totalCount').textContent = totalQ;

  const pct = totalQ ? Math.round(learned.length / totalQ * 100) : 0;
  document.getElementById('heroProgress').style.width = pct + '%';

  // Update number badges
  document.querySelectorAll('.tp-num').forEach(el => {
    const id = String(el.dataset.id);
    if (learned.includes(id)) {
      el.style.background = 'var(--accent)';
      el.title = '✅ Выучено!';
    } else {
      el.style.background = '';
      el.title = 'Двойной клик = выучено';
    }
  });

  // Update learn toggle buttons
  document.querySelectorAll('.tp-learn-btn').forEach(btn => {
    const id = String(btn.dataset.id);
    const isLearned = learned.includes(id);
    btn.classList.toggle('learned', isLearned);
    btn.title = isLearned ? 'Выучено! Нажмите, чтобы снять отметку' : 'Отметить как выученное';
    btn.setAttribute('aria-label', isLearned ? 'Выучено' : 'Отметить как выученное');
  });

  // Update section progress
  let secDone = 0;
  currentSections.forEach(sec => {
    const el = document.getElementById('sec-prog-' + sec.section.replace(/\s/g, '_'));
    const total = sec.questions.length;
    const done = sec.questions.filter(q => learned.includes(String(q.id))).length;
    if (done === total) secDone++;
    if (el) {
      el.textContent = done + '/' + total;
      el.style.color = done === total ? 'var(--accent)' : 'var(--text3)';
    }
  });
  document.getElementById('secDone').textContent = secDone;
  document.getElementById('secTotal').textContent = currentSections.length;
}

/**
 * Render section filter pills.
 */
export function renderPills() {
  const learned = getLearned();
  const el = document.getElementById('sectionPills');

  let html = `<button class="sp${!activeSection ? ' active' : ''}" onclick="window.__filterSection(null)">Все</button>`;

  html += currentSections.map(s => {
    const done = s.questions.filter(q => learned.includes(String(q.id))).length;
    const t = s.questions.length;
    const badge = done > 0 ? ` <span class="sp-badge">${done}/${t}</span>` : '';
    return `<button class="sp${activeSection === s.section ? ' active' : ''}${done === t ? ' sp-done' : ''}" onclick="window.__filterSection('${s.section.replace(/'/g, "\\'")}')">${s.icon} ${s.section}${badge}</button>`;
  }).join('');

  html += `<button class="sp sp-reset" onclick="window.__resetProgress()" title="Сбросить прогресс">🗑 Сброс</button>`;
  el.innerHTML = html;
}

/**
 * Filter by section name.
 */
export function filterSection(name) {
  activeSection = name;
  renderPills();
  render(document.getElementById('search').value);
}

/**
 * Toggle all questions open/closed.
 */
export function toggleAll() {
  const cards = document.querySelectorAll('.theorem-page');
  const btn = document.getElementById('toggleBtn');

  if (btn.textContent.includes('Открыть')) {
    cards.forEach(el => { el.classList.add('open'); renderMath(el); });
    btn.textContent = '📕 Свернуть всё';
    allOpen = true;
  } else {
    cards.forEach(el => {
      el.classList.remove('open');
      el.querySelectorAll('.proof-toggle.open,.adv-toggle.open').forEach(t => t.classList.remove('open'));
    });
    btn.textContent = '📖 Открыть всё';
    allOpen = false;
  }
}

/**
 * Navigate to a random question.
 */
export function goRandom() {
  const all = currentSections.flatMap(s => s.questions);
  const q = all[Math.floor(Math.random() * all.length)];
  activeSection = null;
  renderPills();
  render('');
  document.getElementById('search').value = '';
  document.getElementById('searchClear').style.display = 'none';

  setTimeout(() => {
    const el = document.getElementById('q' + q.id);
    if (el) {
      el.classList.add('open');
      renderMath(el);
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.style.boxShadow = '0 0 0 3px var(--accent)';
      setTimeout(() => el.style.boxShadow = '', 1500);
    }
  }, 100);
}
