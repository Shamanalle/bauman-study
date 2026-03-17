// Textbook: chapter-based study material renderer
// Route: ?subject=physics&type=textbook (or any subject)

import { renderMath } from './math-utils.js';
import { highlightCode } from './text-utils.js';
import * as progress from './progress.js';

let textbookMeta = null;
let textbookIndex = null;
let currentChapter = null;
let currentChapterIdx = 0;

/**
 * Initialize the textbook viewer.
 */
export async function initTextbook() {
  const params = new URLSearchParams(window.location.search);
  const subject = params.get('subject');
  const basePath = `./data/${subject}/textbook`;

  // Load meta + index
  const [metaRes, indexRes] = await Promise.all([
    fetch(`${basePath}/meta.json`),
    fetch(`${basePath}/index.json`),
  ]);

  if (!metaRes.ok) throw new Error('Textbook not found');

  textbookMeta = await metaRes.json();
  textbookIndex = await indexRes.json();

  // Parse URL for chapter
  currentChapterIdx = parseInt(params.get('ch') || '0');
  currentChapterIdx = Math.max(0, Math.min(currentChapterIdx, textbookIndex.chapters.length - 1));

  renderTextbookShell();
  await loadChapter(currentChapterIdx);
}

/**
 * Render the textbook shell (sidebar + content area).
 */
function renderTextbookShell() {
  // Update hero
  document.getElementById('heroTitle').textContent = `${textbookMeta.icon} ${textbookMeta.title}`;
  document.getElementById('heroSubtitle').textContent = textbookMeta.subtitle;
  document.title = `${textbookMeta.title} · Учебное пособие`;

  // Hide standard UI
  const nav = document.querySelector('.nav');
  const pills = document.getElementById('sectionPills');
  const statsRow = document.querySelector('.stats-row');
  const progressBar = document.querySelector('.progress-bar-hero');
  if (nav) nav.style.display = 'none';
  if (pills) pills.innerHTML = '';
  if (statsRow) statsRow.style.display = 'none';
  if (progressBar) progressBar.style.display = 'none';

  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="textbook">
      <aside class="tb-sidebar" id="tbSidebar">
        <div class="tb-sidebar-header">
          <span class="tb-sidebar-title">📖 Содержание</span>
          <button class="tb-sidebar-close" id="tbSidebarClose">✕</button>
        </div>
        <nav class="tb-toc" id="tbToc">
          ${textbookIndex.chapters.map((ch, i) => `
            <button class="tb-toc-item ${i === currentChapterIdx ? 'active' : ''}" data-ch="${i}">
              <span class="tb-toc-num">${ch.num || (i + 1)}</span>
              <span class="tb-toc-label">${ch.title}</span>
            </button>
          `).join('')}
        </nav>
      </aside>
      <div class="tb-overlay" id="tbOverlay"></div>
      <main class="tb-main">
        <button class="tb-menu-btn" id="tbMenuBtn" title="Содержание">☰</button>
        <article class="tb-article" id="tbArticle">
          <div class="tb-loading">⏳ Загрузка главы...</div>
        </article>
        <nav class="tb-chapter-nav" id="tbChapterNav"></nav>
      </main>
    </div>
  `;

  document.getElementById('tbSidebarClose').addEventListener('click', () => {
    document.getElementById('tbSidebar').classList.remove('open');
    document.getElementById('tbOverlay').classList.remove('open');
  });
  document.getElementById('tbOverlay').addEventListener('click', () => {
    document.getElementById('tbSidebar').classList.remove('open');
    document.getElementById('tbOverlay').classList.remove('open');
  });

  // Sidebar toggle
  document.getElementById('tbMenuBtn').addEventListener('click', () => {
    document.getElementById('tbSidebar').classList.toggle('open');
    document.getElementById('tbOverlay').classList.toggle('open');
  });

  // TOC navigation
  document.getElementById('tbToc').addEventListener('click', (e) => {
    const item = e.target.closest('.tb-toc-item');
    if (!item) return;
    const idx = parseInt(item.dataset.ch);
    loadChapter(idx);
    document.getElementById('tbSidebar').classList.remove('open');
    document.getElementById('tbOverlay').classList.remove('open');
  });
}

/**
 * Load and render a chapter.
 */
async function loadChapter(idx) {
  currentChapterIdx = idx;
  const chapterInfo = textbookIndex.chapters[idx];
  const article = document.getElementById('tbArticle');
  article.innerHTML = '<div class="tb-loading">⏳ Загрузка главы...</div>';

  // Update TOC active state
  document.querySelectorAll('.tb-toc-item').forEach((el, i) => {
    el.classList.toggle('active', i === idx);
  });

  try {
    const params = new URLSearchParams(window.location.search);
    const subject = params.get('subject');
    const res = await fetch(`./data/${subject}/textbook/${chapterInfo.file}`);
    if (!res.ok) throw new Error('Chapter not found');
    currentChapter = await res.json();

    renderChapter();
    updateChapterNav();
    updateURL(idx);

    // Scroll to top
    article.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    console.error('loadChapter error:', err);
    article.innerHTML = `
      <div class="tb-error">
        <div class="tb-error-icon">📭</div>
        <div class="tb-error-text">Глава "${chapterInfo.title}" пока не готова</div>
      </div>
    `;
  }
}

/**
 * Render current chapter content.
 */
function renderChapter() {
  const article = document.getElementById('tbArticle');

  const sectionsHtml = currentChapter.sections.map((section, si) => `
    <section class="tb-section" id="sec-${si}">
      ${section.heading ? `<h2 class="tb-section-heading">${section.heading}</h2>` : ''}
      ${section.blocks.map(block => renderBlock(block)).join('\n')}
    </section>
  `).join('\n');

  article.innerHTML = `
    <header class="tb-chapter-header">
      <span class="tb-chapter-num">Глава ${currentChapter.num || (currentChapterIdx + 1)}</span>
      <h1 class="tb-chapter-title">${currentChapter.title}</h1>
      ${currentChapter.summary ? `<p class="tb-chapter-summary">${currentChapter.summary}</p>` : ''}
    </header>
    ${sectionsHtml}
  `;

  // Render math in the article
  requestAnimationFrame(() => renderMath(article));
}

/**
 * Render a single content block.
 */
function renderBlock(block) {
  switch (block.type) {
    case 'text':
      return `<div class="tb-text">${block.content}</div>`;

    case 'formula':
      return `<div class="tb-formula">${block.label ? `<span class="tb-formula-label">${block.label}</span>` : ''}$$${block.tex}$$</div>`;

    case 'definition':
      return `<div class="tb-definition">
        <div class="tb-def-header">📌 ${block.term}</div>
        <div class="tb-def-body">${block.content}</div>
      </div>`;

    case 'theorem':
      return `<div class="tb-theorem">
        <div class="tb-thm-header">📐 ${block.name || 'Теорема'}</div>
        <div class="tb-thm-body">${block.content}</div>
        ${block.proof ? `<div class="tb-proof"><div class="tb-proof-label">Доказательство</div><div class="tb-proof-body">${block.proof}</div></div>` : ''}
      </div>`;

    case 'example':
      return `<div class="tb-example">
        <div class="tb-example-header">💡 ${block.title || 'Пример'}</div>
        <div class="tb-example-body">${block.content}</div>
        ${block.solution ? `<div class="tb-solution"><div class="tb-solution-label">Решение</div><div class="tb-solution-body">${block.solution}</div></div>` : ''}
      </div>`;

    case 'note':
      return `<div class="tb-note">
        <span class="tb-note-icon">📝</span>
        <div class="tb-note-body">${block.content}</div>
      </div>`;

    case 'warning':
      return `<div class="tb-warning">
        <span class="tb-warning-icon">⚠️</span>
        <div class="tb-warning-body">${block.content}</div>
      </div>`;

    case 'code':
      return `<div class="tb-code">
        ${block.filename ? `<div class="tb-code-header">${block.filename}</div>` : ''}
        <pre><code>${block.content}</code></pre>
      </div>`;

    case 'image':
      return `<figure class="tb-figure">
        ${block.svg || `<img src="${block.src}" alt="${block.alt || ''}">`}
        ${block.caption ? `<figcaption>${block.caption}</figcaption>` : ''}
      </figure>`;

    case 'list':
      const tag = block.ordered ? 'ol' : 'ul';
      return `<${tag} class="tb-list">${block.items.map(item => `<li>${item}</li>`).join('')}</${tag}>`;

    case 'table':
      return `<div class="tb-table-wrap"><table class="tb-table">
        ${block.headers ? `<thead><tr>${block.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>` : ''}
        <tbody>${block.rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div>`;

    default:
      return `<div class="tb-text">${block.content || ''}</div>`;
  }
}

/**
 * Update prev/next chapter navigation.
 */
function updateChapterNav() {
  const nav = document.getElementById('tbChapterNav');
  const chapters = textbookIndex.chapters;
  const prev = currentChapterIdx > 0 ? chapters[currentChapterIdx - 1] : null;
  const next = currentChapterIdx < chapters.length - 1 ? chapters[currentChapterIdx + 1] : null;

  nav.innerHTML = `
    ${prev ? `<button class="tb-nav-btn tb-nav-prev" data-dir="prev">
      <span class="tb-nav-dir">← Предыдущая</span>
      <span class="tb-nav-title">${prev.title}</span>
    </button>` : '<div></div>'}
    ${next ? `<button class="tb-nav-btn tb-nav-next" data-dir="next">
      <span class="tb-nav-dir">Следующая →</span>
      <span class="tb-nav-title">${next.title}</span>
    </button>` : '<div></div>'}
  `;

  nav.querySelectorAll('.tb-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const dir = btn.dataset.dir;
      loadChapter(dir === 'prev' ? currentChapterIdx - 1 : currentChapterIdx + 1);
    });
  });
}

function updateURL(chIdx) {
  const url = new URL(window.location.href);
  url.searchParams.set('ch', chIdx);
  history.replaceState(null, '', url.toString());
}
