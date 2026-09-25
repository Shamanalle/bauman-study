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

import { execSync } from 'child_process';

const distAssets = path.join(DIST, 'assets');
if (!fs.existsSync(distAssets)) {
  console.log('📦 dist/assets не найдены. Запускаю сборку Vite...');
  execSync('npm run build', { cwd: ROOT, stdio: 'inherit' });
}

// Read built assets
const cssFile = fs.readdirSync(distAssets).find(f => f.endsWith('.css'));
const jsFile = fs.readdirSync(distAssets).find(f => f.endsWith('.js'));
const cssContent = fs.readFileSync(path.join(distAssets, cssFile), 'utf-8');
const jsContent = fs.readFileSync(path.join(distAssets, jsFile), 'utf-8');

// Subjects config
// Subjects config from single source of truth
import { getBundleableAssessments } from '../src/js/subjects-config.js';

const SUBJECTS = getBundleableAssessments().map(s => ({
  id: s.id,
  title: s.title,
  icon: s.icon,
  assessments: s.assessments.map(a => ({
    id: a.assessment,
    name: a.name,
    bundleName: a.bundleName,
  })),
}));

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
      for (const q of (section.questions || section.cards || [])) {
        if (q.visual && typeof q.visual === 'string' && q.visual.startsWith('svg:')) {
          const svgName = q.visual.replace('svg:', '');
          q.visual = svgs[svgName] || null;
        }
      }
    }

    // Check if this bundle has a matching cheatsheet to inline
    const CHEATSHEET_MAP = {
      'physics|midterm-1-practice': 'physics-rk1',
      'physics|midterm-2-practice': 'physics-rk2',
      'physics|exam-practice': 'physics-exam',
      'differential-equations|midterm-1-practice': 'diffeq-rk1',
      'differential-equations|midterm-2-practice': 'diffeq-rk2',
      'differential-equations|exam-practice': 'diffeq-exam',
      'differential-equations|kr-1': 'diffeq-rk1',
      'differential-equations|kr-2': 'diffeq-rk2',
      'differential-equations|kr-2-practice': 'diffeq-rk2',
      'linear-algebra|midterm-1-practice': 'linalg-rk1',
      'linear-algebra|midterm-2-practice': 'linalg-rk2',
      'linear-algebra|exam-practice': 'linalg-exam',
      'linear-algebra|kr-1-practice': 'linalg-rk1',
      'algorithmic-languages|exam-practice': 'alglang-exam',
    };
    const csKey = `${subject.id}|${assessment.id}`;
    const csFile = CHEATSHEET_MAP[csKey];
    const csSrcDir = path.join(ROOT, 'src', 'public', 'cheatsheets');
    let csContent = null;
    if (csFile && fs.existsSync(path.join(csSrcDir, csFile + '.html'))) {
      csContent = fs.readFileSync(path.join(csSrcDir, csFile + '.html'), 'utf-8');
    }

    // Build the modified JS that has data inlined
    const inlinedJS = buildInlinedJS(jsContent, meta, sections, csContent);

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

    const totalQ = sections.reduce((s, sec) => s + (sec.questions || sec.cards || []).length, 0);
    const size = (Buffer.byteLength(html) / 1024).toFixed(0);
    console.log(`  ✅ ${assessment.bundleName}.html — ${totalQ} вопросов, ${size} КБ`);
    totalBundles++;
  }
}

// Copy cheatsheets to bundles/cheatsheets for offline zip distribution
const csBundlesDir = path.join(BUNDLES, 'cheatsheets');
if (!fs.existsSync(csBundlesDir)) fs.mkdirSync(csBundlesDir, { recursive: true });
const csSrcDir = path.join(ROOT, 'src', 'public', 'cheatsheets');
if (fs.existsSync(csSrcDir)) {
  for (const f of fs.readdirSync(csSrcDir).filter(f => f.endsWith('.html'))) {
    fs.copyFileSync(path.join(csSrcDir, f), path.join(csBundlesDir, f));
  }
  console.log(`  📄 Скопировано ${fs.readdirSync(csBundlesDir).length} шпаргалок в bundles/cheatsheets`);
}

console.log(`\n✅ Собрано ${totalBundles} бандлов в bundles/`);

function safeJson(data) {
  return JSON.stringify(data).replace(/<\/script/gi, '<\\/script');
}

/**
 * Modify the built JS to replace fetch-based data loading with inlined data.
 */
function buildInlinedJS(js, meta, sections, csContent) {
  // The compiled JS has an async function K() that fetches data.
  // We replace the entire data-loading function with one that returns inlined data.
  
  const inlinedData = `
window.__INLINE_META__ = ${safeJson(meta)};
window.__INLINE_SECTIONS__ = ${safeJson(sections)};
${csContent ? `window.__INLINE_CHEATSHEET__ = ${safeJson(csContent)};` : ''}
`;



  // Strip export statement
  js = js.replace(/export\{[^}]*\};?\s*$/, '');
  // Strip import.meta references so code runs natively without ES module requirements
  js = js.replaceAll('import.meta.url', '""').replaceAll(/import\.meta/g, '({})');

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
try {
  if (!new URLSearchParams(window.location.search).has('subject')) {
    const url = new URL(window.location.href);
    url.searchParams.set('subject', '${meta.shortCode || 'inline'}');
    url.searchParams.set('assessment', 'inline');
    history.replaceState(null, '', url.toString());
  }
} catch (e) {
  // Ignore SecurityError when opened directly via file:// protocol
}

${js}`;

  return patchedJS;
}
