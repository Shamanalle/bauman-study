/**
 * Build single-file HTML bundles for each assessment.
 * Each bundle is a self-contained offline HTML file.
 * 
 * Usage: node scripts/build-bundles.js
 * Output: bundles/ directory with one .html per assessment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const DATA = path.join(ROOT, 'src', 'data');
const BUNDLES = path.join(ROOT, 'bundles');

// Read built assets
const cssFile = fs.readdirSync(path.join(DIST, 'assets')).find(f => f.endsWith('.css'));
const jsFile = fs.readdirSync(path.join(DIST, 'assets')).find(f => f.endsWith('.js'));
const cssContent = fs.readFileSync(path.join(DIST, 'assets', cssFile), 'utf-8');
const jsContent = fs.readFileSync(path.join(DIST, 'assets', jsFile), 'utf-8');

// Subjects config
const SUBJECTS = [
  {
    id: 'physics', title: 'Физика', icon: '⚛️',
    assessments: [
      { id: 'exam', name: 'Экзамен', bundleName: 'Физика_Экзамен' },
      { id: 'midterm-1', name: 'РК-1', bundleName: 'Физика_РК-1' },
      { id: 'midterm-2', name: 'РК-2', bundleName: 'Физика_РК-2' },
    ],
  },
  {
    id: 'differential-equations', title: 'Интегралы и ДУ', icon: '∫',
    assessments: [
      { id: 'exam', name: 'Экзамен', bundleName: 'ИнтДУ_Экзамен' },
      { id: 'midterm-1', name: 'РК-1', bundleName: 'ИнтДУ_РК-1' },
      { id: 'midterm-2', name: 'РК-2', bundleName: 'ИнтДУ_РК-2' },
      { id: 'kr-1', name: 'КР-1', bundleName: 'ИнтДУ_КР-1' },
      { id: 'kr-2', name: 'КР-2', bundleName: 'ИнтДУ_КР-2' },
    ],
  },
  {
    id: 'linear-algebra', title: 'Линейная алгебра и ФНП', icon: '📐',
    assessments: [
      { id: 'midterm-1', name: 'РК-1 · Линалг', bundleName: 'ЛинАлг_РК-1' },
      { id: 'midterm-2', name: 'РК-2 · ФНП', bundleName: 'ЛинАлг_РК-2' },
      { id: 'kr-1', name: 'КР · Дифф. ФНП', bundleName: 'ЛинАлг_КР-1' },
    ],
  },
  {
    id: 'algorithmic-languages', title: 'Алгоритмические языки', icon: '💻',
    assessments: [
      { id: 'exam', name: 'Экзамен', bundleName: 'АЯ_Экзамен' },
    ],
  },
  {
    id: 'math-cs-foundations', title: 'Мат. основы информатики', icon: '🔢',
    assessments: [
      { id: 'zachet', name: 'Зачёт', bundleName: 'МОИ_Зачёт' },
    ],
  },
];

// Create bundles directory
if (!fs.existsSync(BUNDLES)) fs.mkdirSync(BUNDLES, { recursive: true });

let totalBundles = 0;

for (const subject of SUBJECTS) {
  for (const assessment of subject.assessments) {
    const assessmentDir = path.join(DATA, subject.id, assessment.id);
    if (!fs.existsSync(assessmentDir)) {
      console.log(`  ⚠️  Пропуск ${subject.id}/${assessment.id} — нет данных`);
      continue;
    }

    // Load meta
    const meta = JSON.parse(fs.readFileSync(path.join(assessmentDir, 'meta.json'), 'utf-8'));

    // Load sections
    const indexFile = path.join(assessmentDir, 'index.json');
    const index = JSON.parse(fs.readFileSync(indexFile, 'utf-8'));
    const sections = index.sections.map(f =>
      JSON.parse(fs.readFileSync(path.join(assessmentDir, f), 'utf-8'))
    );

    // Load SVGs
    const svgDir = path.join(DATA, subject.id, 'svg');
    const svgs = {};
    if (fs.existsSync(svgDir)) {
      for (const f of fs.readdirSync(svgDir)) {
        if (f.endsWith('.svg')) {
          svgs[f.replace('.svg', '')] = fs.readFileSync(path.join(svgDir, f), 'utf-8');
        }
      }
    }

    // Resolve SVG references in questions
    for (const section of sections) {
      for (const q of section.questions) {
        if (q.visual && typeof q.visual === 'string' && q.visual.startsWith('svg:')) {
          const svgName = q.visual.replace('svg:', '');
          q.visual = svgs[svgName] || null;
        }
      }
    }

    // Build the modified JS that has data inlined
    const inlinedJS = buildInlinedJS(jsContent, meta, sections);

    // Generate HTML bundle
    const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${meta.title} · ${assessment.name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"><\/script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"><\/script>
  <style>${cssContent}</style>
</head>
<body>
  <div class="app" id="app">
    <div class="hero">
      <h1 id="heroTitle">📚 Загрузка...</h1>
      <p id="heroSubtitle">...</p>
      <div class="stats-row">
        <div class="stat-pill">✅ <span id="learnedCount">0</span> / <span id="totalCount">0</span> выучено · <span id="secDone">0</span>/<span id="secTotal">0</span> разделов</div>
        <button class="stat-pill dark-toggle" id="darkToggle" title="Переключить тему">🌙</button>
      </div>
      <div class="progress-bar-hero"><div class="progress-fill-hero" id="heroProgress"></div></div>
    </div>
    <div class="nav">
      <div style="position:relative;flex:1">
        <input type="text" placeholder="🔍 Поиск..." id="search">
        <button class="search-clear" id="searchClear">✕</button>
      </div>

      <button class="nav-btn" id="randomBtn" title="Перейти к случайному вопросу">🎲</button>
      <button class="nav-btn" id="toggleBtn" title="Развернуть / свернуть все вопросы">📖 Открыть всё</button>
    </div>
    <div class="section-pills" id="sectionPills"></div>
    <div id="content"></div>
  </div>
  <button class="scroll-top" id="scrollTop" title="Наверх">↑</button>

  <script>${inlinedJS}<\/script>
</body>
</html>`;

    const outPath = path.join(BUNDLES, `${assessment.bundleName}.html`);
    fs.writeFileSync(outPath, html, 'utf-8');

    const totalQ = sections.reduce((s, sec) => s + sec.questions.length, 0);
    const size = (Buffer.byteLength(html) / 1024).toFixed(0);
    console.log(`  ✅ ${assessment.bundleName}.html — ${totalQ} вопросов, ${size} КБ`);
    totalBundles++;
  }
}

console.log(`\n✅ Собрано ${totalBundles} бандлов в bundles/`);

/**
 * Modify the built JS to replace fetch-based data loading with inlined data.
 */
function buildInlinedJS(js, meta, sections) {
  // The compiled JS has an async function K() that fetches data.
  // We replace the entire data-loading function with one that returns inlined data.
  
  const inlinedData = `
window.__INLINE_META__ = ${JSON.stringify(meta)};
window.__INLINE_SECTIONS__ = ${JSON.stringify(sections)};
`;

  // Replace the fetch-based loadAssessmentData function.
  // In the minified code, it's the async function K() that does fetches.
  // We'll override by redefining window.location.search to have params,
  // and intercepting fetch to return inlined data.

  const patchedJS = `
${inlinedData}

// Override fetch to return inlined data
const _origFetch = window.fetch;
window.fetch = function(url, opts) {
  url = String(url);
  if (url.includes('/meta.json')) {
    return Promise.resolve(new Response(JSON.stringify(window.__INLINE_META__), { status: 200 }));
  }
  if (url.includes('/index.json')) {
    const sectionFiles = window.__INLINE_SECTIONS__.map((_, i) => 'section-' + String(i+1).padStart(2,'0') + '.json');
    return Promise.resolve(new Response(JSON.stringify({ sections: sectionFiles }), { status: 200 }));
  }
  if (url.includes('/section-')) {
    const match = url.match(/section-(\\d+)/);
    if (match) {
      const idx = parseInt(match[1]) - 1;
      if (idx < window.__INLINE_SECTIONS__.length) {
        return Promise.resolve(new Response(JSON.stringify(window.__INLINE_SECTIONS__[idx]), { status: 200 }));
      }
    }
    return Promise.resolve(new Response('', { status: 404 }));
  }
  if (url.includes('.svg')) {
    return Promise.resolve(new Response('', { status: 404 }));
  }
  return _origFetch.call(this, url, opts);
};

// Ensure URL has subject/assessment params for the app to work
if (!new URLSearchParams(window.location.search).has('subject')) {
  const url = new URL(window.location.href);
  url.searchParams.set('subject', '${meta.shortCode || 'inline'}');
  url.searchParams.set('assessment', 'inline');
  history.replaceState(null, '', url.toString());
}

${js}`;

  return patchedJS;
}
