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

// --- Global functions exposed for onclick handlers in HTML strings ---
window.__renderMath = (el) => renderMath(el);
window.__toggleLearn = (id, e) => {
  e?.stopPropagation();
  progress.toggleLearnedItem(id);
  updateLearnedUI();
  renderPills();
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

// --- Bootstrap ---
async function init() {
  // 1. Global theme
  progress.initTheme();
  document.getElementById('darkToggle')?.addEventListener('click', progress.toggleTheme);
  document.getElementById('themeFab')?.addEventListener('click', progress.toggleTheme);

  const params = new URLSearchParams(window.location.search);
  const hasParams = params.has('subject') && params.has('assessment');
  const isLabs = params.get('type') === 'labs';

  // Set subject on body for per-subject CSS scoping
  if (params.has('subject')) document.body.dataset.subject = params.get('subject');

  // Labs browser (separate page type)
  if (isLabs && params.get('subject') === 'algorithmic-languages') {
    const { initLabBrowser } = await import('./lab-browser.js');
    await initLabBrowser();
    initScrollTop();
    return;
  }

  // ТиМП labs browser
  if (isLabs && params.get('subject') === 'programming-technologies') {
    const { initTimpLabBrowser } = await import('./timp-lab-browser.js');
    await initTimpLabBrowser();
    initScrollTop();
    return;
  }

  // Textbook viewer
  if (params.get('type') === 'textbook') {
    const { initTextbook } = await import('./textbook.js');
    await initTextbook();
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
    initKeyboard();

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

function showPlatformPage() {
  const { getSubjectsConfig } = await_import_subjects();
  const subjects = getSubjectsConfig();

  document.title = 'Платформа подготовки к экзаменам';
  document.getElementById('app').innerHTML = `
    <div class="hero" style="margin-bottom:32px">
      <h1>🎓 Платформа подготовки к экзаменам</h1>
      <p>МГТУ им. Н.Э. Баумана · 2 семестр</p>
      <div class="stats-row">
        <div class="stat-pill">📚 ${subjects.length} предметов</div>
        <div class="stat-pill">📝 ${subjects.reduce((s, sub) => s + sub.assessments.length, 0)} работ</div>
        <button class="stat-pill dark-toggle" id="darkToggle2" title="Переключить тему">🌙</button>
      </div>
    </div>
    <div class="platform-grid">
      ${subjects.map(sub => {
        const textbook = sub.assessments.filter(a => a.type === 'textbook');
        const rest = sub.assessments.filter(a => a.type !== 'textbook');
        return `
        <div class="platform-card">
          <div class="platform-card-header">
            <span class="platform-icon">${sub.icon}</span>
            <div>
              <div class="platform-card-title">${sub.title}</div>
              <div class="platform-card-subtitle">${sub.subtitle}</div>
            </div>
          </div>
          <div class="platform-assessments">
            ${textbook.map(a => `
              <a href="${a.href || `?subject=${sub.id}&assessment=${a.assessment}`}" class="platform-link platform-link--special">
                <span>${a.icon} ${a.name}</span>
                <span class="platform-arrow">→</span>
              </a>
            `).join('')}
            ${textbook.length ? `<div class="platform-divider"></div>` : ''}
            ${rest.map(a => `
              <a href="${a.href || `?subject=${sub.id}&assessment=${a.assessment}`}" class="platform-link">
                <span>${a.icon} ${a.name}</span>
                <span class="platform-arrow">→</span>
              </a>
            `).join('')}
          </div>
        </div>
      `}).join('')}
    </div>
  `;

  // Re-bind dark toggle
  document.getElementById('darkToggle2')?.addEventListener('click', progress.toggleTheme);
  const btn = document.getElementById('darkToggle2');
  if (btn) btn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';

  // Init global search
  import('./global-search.js').then(({ initGlobalSearch }) => {
    initGlobalSearch(document.getElementById('app'));
  });
}

// Lazy import to avoid circular deps
function await_import_subjects() {
  return { getSubjectsConfig: getSubjectsConfigLocal };
}

function getSubjectsConfigLocal() {
  return [
    {
      id: 'physics', title: 'Физика', subtitle: 'Механика, термодинамика, волны',
      icon: '⚛️', assessments: [
        { name: 'Экзамен · Теория', assessment: 'exam', type: 'exam', icon: '📋' },
        { name: 'Экзамен · Практика', assessment: 'exam-practice', type: 'kr', icon: '✏️' },
        { name: 'РК-1 · Теория', assessment: 'midterm-1', type: 'midterm', icon: '📝' },
        { name: 'РК-1 · Практика', assessment: 'midterm-1-practice', type: 'kr', icon: '✏️' },
        { name: 'РК-2 · Теория', assessment: 'midterm-2', type: 'midterm', icon: '📝' },
        { name: 'РК-2 · Практика', assessment: 'midterm-2-practice', type: 'kr', icon: '✏️' },
        { name: 'Учебное пособие', assessment: null, type: 'textbook', icon: '📖', href: '?subject=physics&type=textbook' },
      ],
    },
    {
      id: 'differential-equations', title: 'Интегралы и ДУ',
      subtitle: 'Определённые интегралы, несобственные интегралы, ОДУ', icon: '∫',
      assessments: [
        { name: 'Экзамен · Теория', assessment: 'exam', type: 'exam', icon: '📋' },
        { name: 'Экзамен · Практика', assessment: 'exam-practice', type: 'kr', icon: '✏️' },
        { name: 'РК-1 · Теория', assessment: 'midterm-1', type: 'midterm', icon: '📝' },
        { name: 'РК-1 · Практика', assessment: 'midterm-1-practice', type: 'kr', icon: '✏️' },
        { name: 'РК-2 · Теория', assessment: 'midterm-2', type: 'midterm', icon: '📝' },
        { name: 'РК-2 · Практика', assessment: 'midterm-2-practice', type: 'kr', icon: '✏️' },
        { name: 'КР-1 · Интегрирование', assessment: 'kr-1', type: 'kr', icon: '✏️' },
        { name: 'КР-2 · ДУ 1-го порядка', assessment: 'kr-2', type: 'kr', icon: '✏️' },
        { name: 'Учебное пособие', assessment: null, type: 'textbook', icon: '📖', href: '?subject=differential-equations&type=textbook' },
      ],
    },
    {
      id: 'linear-algebra', title: 'Линейная алгебра и ФНП',
      subtitle: 'Пространства, операторы, квадратичные формы, ФНП', icon: '📐',
      assessments: [
        { name: 'РК-1 · Теория', assessment: 'midterm-1', type: 'midterm', icon: '📝' },
        { name: 'РК-1 · Практика', assessment: 'midterm-1-practice', type: 'kr', icon: '✏️' },
        { name: 'РК-2 · Теория', assessment: 'midterm-2', type: 'midterm', icon: '📝' },
        { name: 'РК-2 · Практика', assessment: 'midterm-2-practice', type: 'kr', icon: '✏️' },
        { name: 'КР · Теория', assessment: 'kr-1', type: 'kr', icon: '✏️' },
        { name: 'КР · Практика', assessment: 'kr-1-practice', type: 'kr', icon: '✏️' },
        { name: 'Учебное пособие', assessment: null, type: 'textbook', icon: '📖', href: '?subject=linear-algebra&type=textbook' },
      ],
    },
    {
      id: 'algorithmic-languages', title: 'Алгоритмические языки',
      subtitle: 'C++: ООП, шаблоны, исключения, многопоточность', icon: '💻',
      assessments: [
        { name: 'Экзамен · Теория', assessment: 'exam', type: 'exam', icon: '📋' },
        { name: 'Экзамен · Практика', assessment: 'exam-practice', type: 'kr', icon: '✏️' },
        { name: 'Лабораторные', assessment: null, type: 'labs', icon: '💻', href: '?subject=algorithmic-languages&type=labs' },
        { name: 'Учебное пособие', assessment: null, type: 'textbook', icon: '📖', href: '?subject=algorithmic-languages&type=textbook' },
      ],
    },
    {
      id: 'programming-technologies', title: 'Технологии и методы программирования',
      subtitle: 'Git: контроль версий, ветвление, GitHub', icon: '🔀',
      assessments: [
        { name: 'Учебное пособие', assessment: null, type: 'textbook', icon: '📖', href: '?subject=programming-technologies&type=textbook' },
        { name: 'Лабораторные', assessment: null, type: 'labs', icon: '🔬', href: '?subject=programming-technologies&type=labs' },
      ],
    },
    {
      id: 'math-cs-foundations', title: 'Мат. основы информатики',
      subtitle: 'Булевы функции, нормальные формы, теорема Поста', icon: '🔢',
      assessments: [
        { name: 'Зачёт', assessment: 'zachet', type: 'exam', icon: '✅' },
        { name: 'Учебное пособие', assessment: null, type: 'textbook', icon: '📖', href: '?subject=math-cs-foundations&type=textbook' },
      ],
    },
  ];
}

function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 400);
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

init();
