// App entry point: bootstraps everything
import '../css/base.css';
import '../css/labs.css';
import '../css/textbook.css';
import '../css/practice.css';
import { loadAssessmentData, allQuestions } from './data-loader.js';
import { render, updateLearnedUI, renderPills, setSections, filterSection, toggleAll, goRandom } from './renderer.js';
import { initSearch } from './search.js';

import { initKeyboard } from './keyboard.js';
import { renderMath } from './math-utils.js';
import * as progress from './progress.js';
import { SUBJECTS } from './subjects-config.js';

import { showToast } from './toast.js';

// --- Global functions exposed for onclick handlers in HTML strings ---
window.showToast = showToast;
window.__renderMath = (el) => renderMath(el);
window.__toggleLearn = (id, e) => {
  e?.stopPropagation();
  progress.toggleLearnedItem(id);
  updateLearnedUI();
  renderPills();
  const isNowLearned = progress.isLearned(id);
  showToast(
    isNowLearned ? `Билет #${id} отмечен выученным` : `Билет #${id} снят с отметки`,
    isNowLearned ? 'success' : 'info',
    1800
  );
};
window.__copyLatex = (btn, e) => {
  e?.stopPropagation();
  const wrap = btn.closest('.math-box-wrap');
  const latex = wrap?.dataset?.latex || wrap?.querySelector('.math-box')?.textContent || '';
  if (!latex) return;
  navigator.clipboard.writeText(latex).then(() => {
    btn.innerHTML = `<span class="cl-icon">✓</span> Скопировано`;
    btn.classList.add('copied');
    showToast('LaTeX формула скопирована в буфер', 'copy', 2000);
    setTimeout(() => {
      btn.innerHTML = `<span class="cl-icon">📋</span> LaTeX`;
      btn.classList.remove('copied');
    }, 2000);
  }).catch(() => {
    showToast('Не удалось скопировать', 'error');
  });
};
window.__filterSection = (name) => filterSection(name);
window.__resetProgress = () => { progress.resetProgress(); updateLearnedUI(); renderPills(); render(''); };



// --- Mode Tabs (Cards / Flashcard) ---
function renderModeTabs(activeMode) {
  const params = new URLSearchParams(window.location.search);
  const subject = params.get('subject');
  const assessment = params.get('assessment');
  if (!subject || !assessment) return;

  const baseUrl = `?subject=${subject}&assessment=${assessment}`;

  const tabsDiv = document.createElement('div');
  tabsDiv.className = 'mode-tabs';
  tabsDiv.id = 'modeTabs';
  tabsDiv.innerHTML = `
    <button class="mode-tab ${activeMode === 'cards' ? 'active' : ''}"
      onclick="location.href='${baseUrl}'">📖 Карточки</button>
    <button class="mode-tab ${activeMode === 'flashcard' ? 'active' : ''}"
      onclick="location.href='${baseUrl}&mode=flashcard'">🃏 Повторение</button>
  `;

  // Insert after hero, before nav
  const hero = document.querySelector('.hero');
  if (hero) hero.after(tabsDiv);
}

export function renderBreadcrumbs(title, categoryName = null) {
  let bc = document.getElementById('globalBreadcrumbs');
  if (!bc) {
    bc = document.createElement('nav');
    bc.id = 'globalBreadcrumbs';
    bc.className = 'global-breadcrumbs';
    bc.setAttribute('aria-label', 'Навигация');
    const hero = document.querySelector('.hero');
    if (hero) {
      hero.before(bc);
    } else {
      document.getElementById('app')?.prepend(bc);
    }
  }
  const rootUrl = window.location.pathname;
  const params = new URLSearchParams(window.location.search);
  const isInlineBundle = typeof window !== 'undefined' && Boolean(window.__INLINE_META__);
  const currentSubId = params.get('subject');
  const currentAssessment = params.get('assessment');
  const currentType = params.get('type');
  const subject = SUBJECTS.find(s => s.id === currentSubId);

  if (isInlineBundle) {
    bc.innerHTML = `
      <span class="gb-tag">📦 Автономный бандл</span>
      <span class="gb-sep">/</span>
      <span class="gb-current">${title}</span>
      ${categoryName ? `<span class="gb-tag">${categoryName}</span>` : ''}
    `;
    return;
  }

  if (subject && subject.assessments?.length > 1) {
    const optionsHtml = subject.assessments.map(a => {
      const href = a.href || `?subject=${subject.id}&assessment=${a.assessment}`;
      let isSelected = false;
      if (currentType && a.type === currentType) isSelected = true;
      else if (currentAssessment && a.assessment === currentAssessment && !currentType) isSelected = true;
      return `<option value="${href}" ${isSelected ? 'selected' : ''}>${a.icon} ${a.name}</option>`;
    }).join('');

    bc.innerHTML = `
      <a href="${rootUrl}" class="gb-back" id="gbBackLink" title="Вернуться ко всем предметам">
        <span class="gb-arrow">←</span> Все предметы
      </a>
      <span class="gb-sep">/</span>
      <span class="gb-subject">${subject.icon} ${subject.title}</span>
      <span class="gb-sep">/</span>
      <div class="gb-switcher-wrap">
        <select class="gb-switcher" aria-label="Выбрать работу" onchange="if(this.value) location.href=this.value">
          ${optionsHtml}
        </select>
        <span class="gb-switcher-arrow">▾</span>
      </div>
      ${categoryName ? `<span class="gb-tag">${categoryName}</span>` : ''}
    `;

    bc.querySelector('#gbBackLink')?.addEventListener('click', (e) => {
      if (typeof window !== 'undefined' && typeof window.__goHome === 'function') {
        e.preventDefault();
        window.__goHome();
      }
    });
  } else {
    bc.innerHTML = `
      <a href="${rootUrl}" class="gb-back" id="gbBackLink" title="Вернуться ко всем предметам">
        <span class="gb-arrow">←</span> Все предметы
      </a>
      <span class="gb-sep">/</span>
      <span class="gb-current">${title}</span>
      ${categoryName ? `<span class="gb-tag">${categoryName}</span>` : ''}
    `;

    bc.querySelector('#gbBackLink')?.addEventListener('click', (e) => {
      if (typeof window !== 'undefined' && typeof window.__goHome === 'function') {
        e.preventDefault();
        window.__goHome();
      }
    });
  }
}

function getAssessmentBadge(name) {
  if (name.includes('Экзамен')) return `<span class="plat-badge plat-badge--exam">Экзамен</span>`;
  if (name.includes('РК')) return `<span class="plat-badge plat-badge--rk">РК</span>`;
  if (name.includes('КР') || name.includes('Практика')) return `<span class="plat-badge plat-badge--prac">Практика</span>`;
  if (name.includes('Учебник') || name.includes('Конспект')) return `<span class="plat-badge plat-badge--theory">Теория</span>`;
  if (name.includes('Лабораторн')) return `<span class="plat-badge plat-badge--labs">Лабы</span>`;
  return '';
}

// --- Bootstrap ---
async function init() {
  // 1. Global theme & keyboard shortcuts
  progress.initTheme();
  initKeyboard();

  // Wire up theme toggles (header and hero)
  document.getElementById('darkToggle')?.addEventListener('click', progress.toggleTheme);
  document.getElementById('themeToggleBtn')?.addEventListener('click', progress.toggleTheme);

  // Wire up header search trigger
  document.getElementById('headerSearchBtn')?.addEventListener('click', () => {
    if (window.openCommandPalette) {
      window.openCommandPalette();
    } else {
      const input = document.getElementById('search');
      if (input) {
        input.focus();
        input.select?.();
      }
    }
  });

  // Wire up brand link for SPA navigation
  document.getElementById('headerBrandLink')?.addEventListener('click', (e) => {
    if (typeof window !== 'undefined' && typeof window.__goHome === 'function') {
      e.preventDefault();
      window.__goHome();
    }
  });


  const params = new URLSearchParams(window.location.search);
  const isInlineBundle = typeof window !== 'undefined' && Boolean(window.__INLINE_META__);
  const hasParams = (params.has('subject') && params.has('assessment')) || isInlineBundle;
  const isLabs = params.get('type') === 'labs';

  // Set subject on body for per-subject CSS scoping
  if (params.has('subject')) {
    document.body.dataset.subject = params.get('subject');
  } else if (isInlineBundle && window.__INLINE_META__?.shortCode) {
    document.body.dataset.subject = window.__INLINE_META__.shortCode;
  }

  // Labs browser (separate page type)
  if (isLabs && params.get('subject') === 'algorithmic-languages') {
    const { initLabBrowser } = await import('./lab-browser.js');
    await initLabBrowser();
    renderBreadcrumbs('Языки программирования', 'Лабораторные');
    initScrollTop();
    return;
  }

  // ТиМП labs browser
  if (isLabs && params.get('subject') === 'programming-technologies') {
    const { initTimpLabBrowser } = await import('./timp-lab-browser.js');
    await initTimpLabBrowser();
    renderBreadcrumbs('Технологии и методы программирования', 'Лабораторные');
    initScrollTop();
    return;
  }

  // Textbook viewer
  if (params.get('type') === 'textbook') {
    const { initTextbook } = await import('./textbook.js');
    await initTextbook();
    renderBreadcrumbs('Учебное пособие', 'Теория');
    initScrollTop();
    return;
  }

  if (!hasParams) {
    showPlatformPage();
    return;
  }

  // 2. Load data
  try {
    const { meta, sections } = await loadAssessmentData();

    // Practice mode → dedicated practice browser
    if (meta.practiceMode) {
      const { initPracticeBrowser } = await import('./practice-browser.js');
      renderBreadcrumbs(meta.title, 'Практика');
      initPracticeBrowser({ meta, sections });
      initScrollTop();
      return;
    }

    // 3. Set up app state
    progress.setPrefix(meta.shortCode || 'app');
    progress.loadLearned();
    progress.loadStrength();

    // 4. Check for flashcard mode
    const mode = params.get('mode');

    if (mode === 'flashcard') {
      // Flashcard mode — render tabs + flashcard UI
      renderBreadcrumbs(meta.title, 'Повторение');
      renderModeTabs('flashcard');
      document.getElementById('heroTitle').textContent = `${meta.icon} ${meta.title}`;
      document.getElementById('heroSubtitle').textContent = meta.subtitle;
      document.title = `${meta.title} · Повторение`;

      // Hide standard elements not needed in flashcard mode
      document.querySelector('.nav')?.style.setProperty('display', 'none');
      document.getElementById('sectionPills')?.style.setProperty('display', 'none');
      document.querySelector('.stats-row')?.style.setProperty('display', 'none');
      document.querySelector('.progress-bar-hero')?.style.setProperty('display', 'none');

      const { initFlashcard } = await import('./flashcard.js');
      initFlashcard({ meta, sections });
      initScrollTop();
      return;
    }

    // 5. Standard card-list mode
    renderBreadcrumbs(meta.title, 'Справочник');
    renderModeTabs('cards');
    setSections(sections);

    // Update hero
    document.getElementById('heroTitle').textContent = `${meta.icon} ${meta.title}`;
    document.getElementById('heroSubtitle').textContent = meta.subtitle;
    document.title = `${meta.title} · Справочник`;

    // Initial render
    renderPills();
    render('');

    // Initialize features
    initSearch();

    // UI extras
    document.getElementById('toggleBtn').addEventListener('click', toggleAll);
    document.getElementById('randomBtn').addEventListener('click', goRandom);
    initScrollTop();

  } catch (err) {
    document.getElementById('heroTitle').textContent = '❌ Ошибка загрузки';
    document.getElementById('heroSubtitle').textContent = err.message;
    console.error(err);
  }
}

const SUBJECT_CATEGORIES = {
  'differential-equations': 'math',
  'linear-algebra': 'math',
  'math-cs-foundations': 'math cs',
  'physics': 'physics',
  'algorithmic-languages': 'cs',
  'programming-technologies': 'cs',
};

function showPlatformPage() {
  const subjects = SUBJECTS;
  const { totalLearned, subjectLearned } = progress.getOverallProgress();
  const totalAssessments = subjects.reduce((s, sub) => s + sub.assessments.length, 0);

  document.title = 'Платформа подготовки к экзаменам · МГТУ им. Баумана';
  document.getElementById('app').innerHTML = `
    <div class="hero platform-hero">
      <div class="hero-badge">🎓 Семестр 2 · МГТУ им. Н.Э. Баумана</div>
      <h1 class="hero-title">База знаний и тренажёр к экзаменам</h1>
      <p class="hero-subtitle">Билеты, алгоритмы, интерактивная практика и симулятор контрольных мероприятий</p>
      <div class="stats-row">
        <div class="stat-pill" title="Количество предметов в базе">
          <span class="stat-pill-icon">📚</span> <strong>${subjects.length}</strong> предметов
        </div>
        <div class="stat-pill" title="Контрольные, РК, экзамены и пособия">
          <span class="stat-pill-icon">📝</span> <strong>${totalAssessments}</strong> работ
        </div>
        <div class="stat-pill stat-pill--highlight" title="Билеты, изученные вами на этом устройстве">
          <span class="stat-pill-icon">✨</span> <strong>${totalLearned}</strong> выучено
        </div>
      </div>
    </div>

    <div class="platform-filters-row" id="platformCategoryFilters">
      <button class="plat-cat-btn active" data-cat="all">🌟 Все направления <span class="plat-cat-count">${subjects.length}</span></button>
      <button class="plat-cat-btn" data-cat="math">📐 Высшая математика <span class="plat-cat-count">3</span></button>
      <button class="plat-cat-btn" data-cat="physics">⚛️ Физика <span class="plat-cat-count">1</span></button>
      <button class="plat-cat-btn" data-cat="cs">💻 Программирование <span class="plat-cat-count">3</span></button>
    </div>

    <div class="platform-grid">
      ${subjects.map(sub => {
        const cat = SUBJECT_CATEGORIES[sub.id] || 'other';
        const textbook = sub.assessments.filter(a => a.type === 'textbook');
        const rest = sub.assessments.filter(a => a.type !== 'textbook');
        const learnedCount = subjectLearned[sub.id] || 0;
        const hasPractice = rest.some(a => a.type === 'kr' || a.name.includes('Практика'));
        const hasTheory = rest.some(a => a.type === 'exam' || a.type === 'midterm' || a.type === 'zachet');

        return `
        <div class="platform-card" data-category="${cat}">
          <div class="platform-card-header">
            <span class="platform-icon">${sub.icon}</span>
            <div class="platform-card-title-wrap">
              <div class="platform-card-title">${sub.title}</div>
              <div class="platform-card-subtitle">${sub.subtitle}</div>
            </div>
            ${learnedCount > 0 ? `<div class="plat-sub-learned" title="Выучено билетов в этом предмете">✨ ${learnedCount}</div>` : ''}
          </div>

          ${hasPractice && hasTheory ? `
            <div class="plat-sub-tabs">
              <button class="plat-sub-tab active" data-subtab="all">Все</button>
              <button class="plat-sub-tab" data-subtab="theory">Теория</button>
              <button class="plat-sub-tab" data-subtab="practice">Практика</button>
            </div>
          ` : ''}

          <div class="platform-assessments">
            ${textbook.map(a => `
              <a href="${a.href || `?subject=${sub.id}&assessment=${a.assessment}`}" class="platform-link platform-link--special" data-type="theory">
                <span class="platform-link-title">${a.icon} ${a.name}</span>
                <span class="platform-link-end">
                  ${getAssessmentBadge(a.name)}
                  <span class="platform-arrow">→</span>
                </span>
              </a>
            `).join('')}
            ${textbook.length ? `<div class="platform-divider"></div>` : ''}
            ${rest.map(a => {
              const isPrac = a.type === 'kr' || a.name.includes('Практика');
              return `
              <a href="${a.href || `?subject=${sub.id}&assessment=${a.assessment}`}" class="platform-link" data-type="${isPrac ? 'practice' : 'theory'}">
                <span class="platform-link-title">${a.icon} ${a.name}</span>
                <span class="platform-link-end">
                  ${getAssessmentBadge(a.name)}
                  <span class="platform-arrow">→</span>
                </span>
              </a>
            `}).join('')}
          </div>
        </div>
      `}).join('')}
    </div>
  `;

  // Category filter handlers
  const filterBtns = document.querySelectorAll('.plat-cat-btn');
  filterBtns.forEach(b => {
    b.addEventListener('click', () => {
      filterBtns.forEach(other => other.classList.remove('active'));
      b.classList.add('active');
      const cat = b.dataset.cat;
      document.querySelectorAll('.platform-card').forEach(card => {
        const cardCats = (card.dataset.category || '').split(' ');
        card.style.display = (cat === 'all' || cardCats.includes(cat)) ? '' : 'none';
      });
    });
  });

  // Subtab filter handlers (inside each card)
  document.querySelectorAll('.plat-sub-tabs').forEach(tabGroup => {
    tabGroup.addEventListener('click', (e) => {
      const tab = e.target.closest('.plat-sub-tab');
      if (!tab) return;
      tabGroup.querySelectorAll('.plat-sub-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const mode = tab.dataset.subtab;
      const card = tabGroup.closest('.platform-card');
      card.querySelectorAll('.platform-link:not(.platform-link--special)').forEach(link => {
        const isPrac = link.dataset.type === 'practice';
        if (mode === 'all') {
          link.style.display = '';
        } else if (mode === 'practice') {
          link.style.display = isPrac ? '' : 'none';
        } else if (mode === 'theory') {
          link.style.display = !isPrac ? '' : 'none';
        }
      });
    });
  });

  // Init global search
  import('./global-search.js').then(({ initGlobalSearch }) => {
    initGlobalSearch(document.getElementById('app'));
  });
}


function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 400);
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

init();
