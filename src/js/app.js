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
    setSections(sections);

    // 4. Update hero
    document.getElementById('heroTitle').textContent = `${meta.icon} ${meta.title}`;
    document.getElementById('heroSubtitle').textContent = meta.subtitle;
    document.title = `${meta.title} · Справочник`;

    // 5. Initial render
    renderPills();
    render('');

    // 6. Initialize features
    initSearch();

    initKeyboard();

    // 7. UI extras
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
        { name: 'Экзамен', assessment: 'exam', type: 'exam', icon: '📋' },
        { name: 'РК-1', assessment: 'midterm-1', type: 'midterm', icon: '📝' },
        { name: 'РК-2', assessment: 'midterm-2', type: 'midterm', icon: '📝' },
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
        { name: 'РК-1 · Линалг', assessment: 'midterm-1', type: 'midterm', icon: '📝' },
        { name: 'РК-2 · ФНП', assessment: 'midterm-2', type: 'midterm', icon: '📝' },
        { name: 'КР · Дифф. ФНП', assessment: 'kr-1', type: 'kr', icon: '✏️' },
        { name: 'Учебное пособие', assessment: null, type: 'textbook', icon: '📖', href: '?subject=linear-algebra&type=textbook' },
      ],
    },
    {
      id: 'algorithmic-languages', title: 'Алгоритмические языки',
      subtitle: 'C++: ООП, шаблоны, исключения, многопоточность', icon: '💻',
      assessments: [
        { name: 'Экзамен', assessment: 'exam', type: 'exam', icon: '📋' },
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
