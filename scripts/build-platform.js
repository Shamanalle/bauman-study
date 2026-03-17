/**
 * Build a single "Платформа.html" containing ALL subjects and assessments.
 * Everything works in one file: platform landing → click subject → view questions.
 * 
 * Usage: node scripts/build-platform.js
 * Output: bundles/Платформа.html
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const DATA = path.join(ROOT, 'src', 'data');
const BUNDLES = path.join(ROOT, 'bundles');

// Read built assets (Vite outputs a single JS file thanks to inlineDynamicImports)
const distAssets = path.join(DIST, 'assets');
const cssFile = fs.readdirSync(distAssets).find(f => f.endsWith('.css'));
const jsFile = fs.readdirSync(distAssets).find(f => f.endsWith('.js'));
const cssContent = fs.readFileSync(path.join(distAssets, cssFile), 'utf-8');
const jsContent = fs.readFileSync(path.join(distAssets, jsFile), 'utf-8');

// Subjects config
const SUBJECTS = [
  {
    id: 'physics', title: 'Физика', subtitle: 'Механика, термодинамика, волны', icon: '⚛️',
    assessments: [
      { id: 'exam', name: 'Экзамен', icon: '📋' },
      { id: 'midterm-1', name: 'РК-1', icon: '📝' },
      { id: 'midterm-2', name: 'РК-2', icon: '📝' },
      { id: null, name: 'Учебное пособие', icon: '📖', href: '?subject=physics&type=textbook', skipBundle: true },
    ],
  },
  {
    id: 'differential-equations', title: 'Интегралы и ДУ',
    subtitle: 'Определённые интегралы, несобственные интегралы, ОДУ', icon: '∫',
    assessments: [
      { id: 'exam', name: 'Экзамен', icon: '📋' },
      { id: 'midterm-1', name: 'РК-1', icon: '📝' },
      { id: 'midterm-2', name: 'РК-2', icon: '📝' },
      { id: 'kr-1', name: 'КР-1', icon: '✏️' },
      { id: 'kr-2', name: 'КР-2', icon: '✏️' },
    ],
  },
  {
    id: 'linear-algebra', title: 'Линейная алгебра и ФНП',
    subtitle: 'Пространства, операторы, квадратичные формы, ФНП', icon: '📐',
    assessments: [
      { id: 'midterm-1', name: 'РК-1 · Линалг', icon: '📝' },
      { id: 'midterm-2', name: 'РК-2 · ФНП', icon: '📝' },
      { id: 'kr-1', name: 'КР · ФНП', icon: '✏️' },
      { id: null, name: 'Учебное пособие', icon: '📖', href: '?subject=linear-algebra&type=textbook', skipBundle: true },
    ],
  },
  {
    id: 'algorithmic-languages', title: 'Алгоритмические языки',
    subtitle: 'C++: ООП, шаблоны, исключения, многопоточность', icon: '💻',
    assessments: [
      { id: 'exam', name: 'Экзамен', icon: '📋' },
      { id: null, name: 'Учебное пособие', icon: '📖', href: '?subject=algorithmic-languages&type=textbook', skipBundle: true },
    ],
  },
  {
    id: 'math-cs-foundations', title: 'Мат. основы информатики',
    subtitle: 'Булевы функции, нормальные формы, теорема Поста', icon: '🔢',
    assessments: [{ id: 'zachet', name: 'Зачёт', icon: '✅' }],
  },
];

// Load ALL data
const allData = {};
let totalQuestions = 0;

for (const subject of SUBJECTS) {
  allData[subject.id] = {};
  
  for (const assessment of subject.assessments) {
    if (!assessment.id || assessment.skipBundle) continue;
    const assessmentDir = path.join(DATA, subject.id, assessment.id);
    if (!fs.existsSync(assessmentDir)) continue;

    const meta = JSON.parse(fs.readFileSync(path.join(assessmentDir, 'meta.json'), 'utf-8'));
    const index = JSON.parse(fs.readFileSync(path.join(assessmentDir, 'index.json'), 'utf-8'));
    const sections = index.sections.map(f =>
      JSON.parse(fs.readFileSync(path.join(assessmentDir, f), 'utf-8'))
    );

    // Load SVGs
    const svgDir = path.join(DATA, subject.id, 'svg');
    if (fs.existsSync(svgDir)) {
      for (const section of sections) {
        for (const q of section.questions) {
          if (q.visual && typeof q.visual === 'string' && q.visual.startsWith('svg:')) {
            const svgName = q.visual.replace('svg:', '');
            const svgPath = path.join(svgDir, svgName + '.svg');
            q.visual = fs.existsSync(svgPath) ? fs.readFileSync(svgPath, 'utf-8') : null;
          }
        }
      }
    }

    const qCount = sections.reduce((s, sec) => s + sec.questions.length, 0);
    totalQuestions += qCount;

    allData[subject.id][assessment.id] = { meta, sections };
    console.log(`  ✅ ${subject.id}/${assessment.id}: ${qCount} вопросов`);
  }
}

// Build the platform HTML
if (!fs.existsSync(BUNDLES)) fs.mkdirSync(BUNDLES, { recursive: true });

// Load textbook data
const textbookData = {};
for (const subject of SUBJECTS) {
  const tbDir = path.join(DATA, subject.id, 'textbook');
  if (!fs.existsSync(tbDir)) continue;
  const tbMeta = JSON.parse(fs.readFileSync(path.join(tbDir, 'meta.json'), 'utf-8'));
  const tbIndex = JSON.parse(fs.readFileSync(path.join(tbDir, 'index.json'), 'utf-8'));
  const chapters = {};
  for (const ch of tbIndex.chapters) {
    const chPath = path.join(tbDir, ch.file);
    if (fs.existsSync(chPath)) {
      chapters[ch.file] = JSON.parse(fs.readFileSync(chPath, 'utf-8'));
    }
  }
  textbookData[subject.id] = { meta: tbMeta, index: tbIndex, chapters };
  console.log(`  📖 ${subject.id}/textbook: ${Object.keys(chapters).length} глав`);
}

// Load lab data
const labData = {};
const labsDir = path.join(DATA, 'algorithmic-languages', 'labs');
if (fs.existsSync(labsDir)) {
  const labMeta = JSON.parse(fs.readFileSync(path.join(labsDir, 'meta.json'), 'utf-8'));
  const labIndex = JSON.parse(fs.readFileSync(path.join(labsDir, 'index.json'), 'utf-8'));
  labData.meta = labMeta;
  labData.index = labIndex;
  labData.solutions = {};
  const solDir = path.join(labsDir, 'solutions');
  if (fs.existsSync(solDir)) {
    let labCount = 0;
    for (const vDir of fs.readdirSync(solDir)) {
      const vPath = path.join(solDir, vDir);
      if (!fs.statSync(vPath).isDirectory()) continue;
      labData.solutions[vDir] = {};
      for (const file of fs.readdirSync(vPath).filter(f => f.endsWith('.json'))) {
        labData.solutions[vDir][file] = JSON.parse(fs.readFileSync(path.join(vPath, file), 'utf-8'));
        labCount++;
      }
    }
    console.log(`  💻 labs: ${labCount} решений`);
  }
}

const platformJS = buildPlatformJS(jsContent, allData, SUBJECTS, textbookData, labData);

const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Платформа подготовки к экзаменам · МГТУ</title>
  <meta name="description" content="Справочник для подготовки к экзаменам МГТУ им. Н.Э. Баумана — ${totalQuestions} вопросов по ${SUBJECTS.length} предметам">
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

      <button class="nav-btn" id="randomBtn" title="Случайный вопрос">🎲</button>
      <button class="nav-btn" id="toggleBtn" title="Открыть/свернуть всё">📖 Открыть всё</button>
    </div>
    <div class="section-pills" id="sectionPills"></div>
    <div id="content"></div>
  </div>
  <button class="scroll-top" id="scrollTop" title="Наверх">↑</button>
  <button class="theme-fab" id="themeFab" title="Переключить тему">🌙</button>

  <script>${platformJS}<\/script>
</body>
</html>`;

const outPath = path.join(BUNDLES, 'Платформа.html');
fs.writeFileSync(outPath, html, 'utf-8');
const size = (Buffer.byteLength(html) / 1024).toFixed(0);
console.log(`\n✅ Платформа.html — ${totalQuestions} вопросов, ${size} КБ`);


function buildPlatformJS(appJS, allData, subjects, textbookData, labData) {
  // With inlineDynamicImports: true in vite.config.js, Vite produces a single JS file
  // with no separate chunks. We only need to:
  // 1. Strip the ES module export{} at the end
  // 2. Prepend our fetch intercept and SPA navigation code

  // Strip export statement (Vite outputs e.g. export{Y as h,$ as r})
  appJS = appJS.replace(/export\{[^}]*\};?\s*$/, '');

  return `
// ===== ANDROID content:// FIX =====
// Android file managers open HTML via content:// URIs which are one-time-use.
// location.reload() fails with ERR_FILE_NOT_FOUND. Fix: redirect to blob: URL.
(function() {
  var p = location.protocol;
  if (p !== 'http:' && p !== 'https:' && p !== 'file:' && p !== 'blob:') {
    var h = location.hash || '';
    var html = '<!DOCTYPE html>\\n' + document.documentElement.outerHTML;
    var blob = new Blob([html], {type: 'text/html; charset=utf-8'});
    location.replace(URL.createObjectURL(blob) + h);
    throw ''; // halt script while redirect happens
  }
})();

// ===== INLINE DATA =====
window.__ALL_DATA__ = ${JSON.stringify(allData)};
window.__SUBJECTS__ = ${JSON.stringify(subjects)};
window.__TEXTBOOK_DATA__ = ${JSON.stringify(textbookData)};
window.__LAB_DATA__ = ${JSON.stringify(labData)};
window.__CURRENT__ = null;

// ===== FETCH INTERCEPT =====
const _origFetch = window.fetch;
window.fetch = function(url) {
  url = String(url);
  
  // Textbook data intercept
  if (url.includes('/textbook/') || url.includes('/textbook%2F')) {
    const subjectMatch = url.match(/data[\\/]([^\\/]+)[\\/]textbook[\\/](.+)/);
    if (subjectMatch) {
      const [, subj, file] = subjectMatch;
      const tbData = window.__TEXTBOOK_DATA__[subj];
      if (tbData) {
        if (file === 'meta.json') return Promise.resolve(new Response(JSON.stringify(tbData.meta), { status: 200 }));
        if (file === 'index.json') return Promise.resolve(new Response(JSON.stringify(tbData.index), { status: 200 }));
        var chKey = tbData.chapters[file] ? file : decodeURIComponent(file);
        if (tbData.chapters[chKey]) return Promise.resolve(new Response(JSON.stringify(tbData.chapters[chKey]), { status: 200 }));
      }
    }
    return Promise.resolve(new Response('', { status: 404 }));
  }

  // Lab data intercept
  if (url.includes('/labs/')) {
    const ld = window.__LAB_DATA__;
    if (url.includes('/meta.json')) return Promise.resolve(new Response(JSON.stringify(ld.meta || {}), { status: ld.meta ? 200 : 404 }));
    if (url.includes('/index.json')) return Promise.resolve(new Response(JSON.stringify(ld.index || {}), { status: ld.index ? 200 : 404 }));
    const solMatch = url.match(/solutions\\/(v\\d+)\\/(.+\\.json)/);
    if (solMatch && ld.solutions?.[solMatch[1]]?.[solMatch[2]]) {
      return Promise.resolve(new Response(JSON.stringify(ld.solutions[solMatch[1]][solMatch[2]]), { status: 200 }));
    }
    return Promise.resolve(new Response('', { status: 404 }));
  }

  // Assessment data intercept
  const cur = window.__CURRENT__;
  if (!cur) return Promise.resolve(new Response('{}', { status: 404 }));
  
  const data = window.__ALL_DATA__[cur.subject]?.[cur.assessment];
  if (!data) return Promise.resolve(new Response('', { status: 404 }));

  if (url.includes('/meta.json')) {
    return Promise.resolve(new Response(JSON.stringify(data.meta), { status: 200 }));
  }
  if (url.includes('/index.json')) {
    const files = data.sections.map((_, i) => 'section-' + String(i+1).padStart(2,'0') + '.json');
    return Promise.resolve(new Response(JSON.stringify({ sections: files }), { status: 200 }));
  }
  if (url.includes('/section-')) {
    const match = url.match(/section-(\\d+)\\./);
    if (match) {
      const idx = parseInt(match[1]) - 1;
      if (idx < data.sections.length) {
        return Promise.resolve(new Response(JSON.stringify(data.sections[idx]), { status: 200 }));
      }
    }
    return Promise.resolve(new Response('', { status: 404 }));
  }
  if (url.includes('.svg')) return Promise.resolve(new Response('', { status: 404 }));
  return _origFetch.call(this, url);
};

// Safeguard: wrap history.replaceState to prevent crashes on blob: URLs
// (textbook.js updateURL tries to set ?ch=N which throws SecurityError on blob:)
// NOTE: must use location.protocol directly, NOT __isBlobUrl (not assigned yet due to var hoisting)
if (location.protocol === 'blob:') {
  var _origReplaceState = history.replaceState.bind(history);
  history.replaceState = function() {
    try { _origReplaceState.apply(history, arguments); } catch(e) { /* ignore on blob: */ }
  };
}

// ===== SPA NAVIGATION (works on file://, blob://, http://) =====
// Strategy:
// - On blob: URLs, location.search and history.replaceState don't work.
// - We use window.name to persist nav params across blob: navigations
//   (window.name survives cross-origin navigations within the same tab).
// - We override URLSearchParams constructor so the app's existing code
//   (new URLSearchParams(location.search)) transparently reads our params.

var __isBlobUrl = location.protocol === 'blob:';

function __getHashParams() {
  return new URLSearchParams((window.location.hash || '#').substring(1));
}

// Determine effective navigation params from all possible sources
(function() {
  var effectiveSearch = '';

  // Priority 1: window.name (set by blob: navigation in __navigateTo)
  if (window.name && window.name.indexOf('PLATFORM_NAV:') === 0) {
    effectiveSearch = '?' + window.name.substring(13);
    window.name = '';
  }
  // Priority 2: hash params (#subject=...&assessment=...)
  if (!effectiveSearch) {
    var hp = __getHashParams();
    if (hp.has('subject')) {
      effectiveSearch = '?' + hp.toString();
    }
  }
  // Priority 3: actual query params (works on http://, file://)
  if (!effectiveSearch) {
    var realSearch = window.location.search;
    if (realSearch && realSearch.length > 1) {
      effectiveSearch = realSearch;
    }
  }

  if (effectiveSearch) {
    // Set __CURRENT__ for the fetch interceptor
    var ep = new URLSearchParams(effectiveSearch);
    if (ep.has('subject') && ep.has('assessment')) {
      window.__CURRENT__ = { subject: ep.get('subject'), assessment: ep.get('assessment') };
    }

    // Override URLSearchParams so the app reads our params transparently.
    // The app does: new URLSearchParams(window.location.search)
    // On blob: URLs, location.search is "" — we intercept that and return our params.
    var _USP = URLSearchParams;
    var _realSearch = window.location.search; // capture the actual (possibly empty) value
    window.URLSearchParams = function(init) {
      // If the app passes location.search (which is empty on blob:), substitute ours
      if (typeof init === 'string' && init === _realSearch && effectiveSearch !== _realSearch) {
        return new _USP(effectiveSearch);
      }
      return arguments.length === 0 ? new _USP() : new _USP(init);
    };
    window.URLSearchParams.prototype = _USP.prototype;

    // For non-blob URLs, also try to set real query params (for other code paths)
    if (!__isBlobUrl) {
      try {
        var url = new URL(window.location.href);
        for (var entry of ep.entries()) url.searchParams.set(entry[0], entry[1]);
        history.replaceState(null, '', url.toString());
      } catch(e) {}
    }
  }
})();

// Save the ORIGINAL HTML before the app modifies the DOM.
// This is critical: showPlatformPage() replaces #app content,
// so outerHTML after that would give us a broken DOM structure.
window.__ORIGINAL_HTML__ = '<!DOCTYPE html>\\n' + document.documentElement.outerHTML;

// ===== NAVIGATION FUNCTIONS =====
window.__navigateTo = function(subject, assessment, type) {
  var params = new URLSearchParams();
  params.set('subject', subject);
  if (assessment) params.set('assessment', assessment);
  if (type) params.set('type', type);

  if (__isBlobUrl) {
    // Store params in window.name — persists across blob: navigations
    window.name = 'PLATFORM_NAV:' + params.toString();
    // Use saved pristine HTML (not current modified DOM)
    var blob = new Blob([window.__ORIGINAL_HTML__], {type: 'text/html; charset=utf-8'});
    window.location.replace(URL.createObjectURL(blob));
  } else {
    // On file:// and http:// — hash + reload works fine
    window.location.hash = params.toString();
    window.location.reload();
  }
};

window.__goHome = function() {
  if (__isBlobUrl) {
    window.name = ''; // clear nav params
    var blob = new Blob([window.__ORIGINAL_HTML__], {type: 'text/html; charset=utf-8'});
    window.location.replace(URL.createObjectURL(blob));
  } else {
    window.location.hash = '';
    try {
      var url = new URL(window.location.href);
      url.search = '';
      history.replaceState({}, '', url.toString());
    } catch(e) {}
    window.location.reload();
  }
};

window.addEventListener('popstate', function() {
  if (!__isBlobUrl) location.reload();
});

// ===== PLATFORM LINK INTERCEPTION (event delegation - no race condition) =====
document.addEventListener('click', function(e) {
  var link = e.target.closest('a[href]');
  if (!link) return;
  var href = link.getAttribute('href');
  if (!href || href.indexOf('subject=') === -1) return;

  e.preventDefault();
  e.stopPropagation();

  try {
    var url = new URL(href, window.location.href);
    window.__navigateTo(
      url.searchParams.get('subject'),
      url.searchParams.get('assessment'),
      url.searchParams.get('type')
    );
  } catch(err) {
    // Fallback: parse href manually
    var m1 = href.match(/subject=([^&]+)/);
    var m2 = href.match(/assessment=([^&]+)/);
    var m3 = href.match(/type=([^&]+)/);
    if (m1) window.__navigateTo(m1[1], m2 ? m2[1] : null, m3 ? m3[1] : null);
  }
}, true);

// ===== BACK BUTTON =====
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    // Use the patched URLSearchParams to check if we're on a subject page
    var sp = new URLSearchParams(window.location.search);
    if (sp.has('subject') && (sp.has('assessment') || sp.has('type'))) {
      var hero = document.querySelector('.hero');
      if (hero) {
        var backBtn = document.createElement('button');
        backBtn.textContent = '\u2190 Все предметы';
        backBtn.className = 'nav-btn';
        backBtn.style.cssText = 'margin-bottom:12px;font-size:0.82rem;';
        backBtn.onclick = function() { window.__goHome(); };
        hero.insertBefore(backBtn, hero.firstChild);
      }
    }
  }, 100);
});

// ===== APP JS =====
${appJS}
`;
}
