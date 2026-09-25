// ТиМП Lab Browser: browse lab guides with tasks, theory, walkthroughs and homework
// Route: ?subject=programming-technologies&type=labs[&lab=0]
// Custom format: no variants, 4 tabs (Условие/Теория/Гайд/Homework)
// Features: copy code, checklists, error blocks, reference drawer

import { renderMath } from './math-utils.js';
import { highlightCode } from './text-utils.js';

let labsMeta = null;
let labsIndex = null;
let currentLabData = null;
let currentLab = 0;
let currentTab = 'tasks';
let referenceData = null;

const BASE_PATH = './data/programming-technologies/labs';

/**
 * Initialize the ТиМП lab browser.
 */
export async function initTimpLabBrowser() {
  if (typeof window !== 'undefined' && window.__ALL_LAB_DATA__?.['programming-technologies']) {
    const td = window.__ALL_LAB_DATA__['programming-technologies'];
    labsMeta = td.meta;
    labsIndex = td.index;
    referenceData = td.glossary || null;
  } else {
    const [metaRes, indexRes] = await Promise.all([
      fetch(`${BASE_PATH}/meta.json`),
      fetch(`${BASE_PATH}/index.json`),
    ]);

    labsMeta = await metaRes.json();
    labsIndex = await indexRes.json();

    // Try loading reference data
    try {
      const refRes = await fetch(`${BASE_PATH}/commands-glossary.json`);
      if (refRes.ok) referenceData = await refRes.json();
    } catch (_) {}
  }

  // Parse URL params
  const params = new URLSearchParams(window.location.search);
  currentLab = parseInt(params.get('lab')) || 0;
  currentLab = Math.max(0, Math.min(currentLab, labsIndex.labs.length - 1));

  renderTimpLabBrowser();
  await loadLab(currentLab);
}

/**
 * Render the full lab browser UI.
 */
function renderTimpLabBrowser() {
  const app = document.getElementById('app');

  // Update hero
  document.getElementById('heroTitle').textContent = `🔬 ${labsMeta.title}`;
  document.getElementById('heroSubtitle').textContent = labsMeta.subtitle;

  // Hide standard UI elements and unused hero banner in labs
  const hero = document.querySelector('.hero');
  const nav = document.querySelector('.nav');
  const pills = document.getElementById('sectionPills');
  const statsRow = document.querySelector('.stats-row');
  const progressBar = document.querySelector('.progress-bar-hero');
  if (hero) hero.style.display = 'none';
  if (nav) nav.style.display = 'none';
  if (pills) pills.innerHTML = '';
  if (statsRow) statsRow.style.display = 'none';
  if (progressBar) progressBar.style.display = 'none';

  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="lab-browser">
      <div class="lab-selector">
        <div class="lab-selector-row">
          <div class="lab-select-group" style="flex:1">
            <label class="lab-label">Лабораторная работа</label>
            <select id="timpLabSelect" class="lab-dropdown">
              ${labsIndex.labs.map((l, i) =>
                `<option value="${i}" ${i === currentLab ? 'selected' : ''}>
                  Lab ${l.num}: ${l.title}
                </option>`
              ).join('')}
            </select>
          </div>
        </div>
        <div class="lab-description" id="timpLabDescription">
          ${getLabDescription(currentLab)}
        </div>
      </div>

      <div class="lab-tabs-row">
        <div class="lab-tabs" id="timpLabTabs">
          <button class="lab-tab active" data-tab="tasks">📋 Условие</button>
          <button class="lab-tab" data-tab="theory">📚 Теория</button>
          <button class="lab-tab" data-tab="tutorial">🔧 Гайд</button>
          <button class="lab-tab" data-tab="homework">📝 Homework</button>
        </div>
        ${referenceData ? '<button class="lab-reference-btn" id="refDrawerBtn" title="Шпаргалка команд и терминов">📖</button>' : ''}
      </div>

      <div class="lab-content" id="timpLabContent">
        <div class="lab-loading">Загрузка...</div>
      </div>
    </div>

    <!-- Reference Drawer -->
    <div class="lab-drawer-overlay" id="drawerOverlay"></div>
    <div class="lab-reference-drawer" id="refDrawer">
      <div class="drawer-header">
        <h3>📖 Шпаргалка</h3>
        <button class="drawer-close" id="drawerClose">✕</button>
      </div>
      <div class="drawer-search">
        <input type="text" id="drawerSearch" placeholder="Поиск команды или термина...">
      </div>
      <div class="drawer-body" id="drawerBody"></div>
    </div>
  `;

  // Lab selector
  document.getElementById('timpLabSelect').addEventListener('change', (e) => {
    currentLab = parseInt(e.target.value);
    updateLabDescription();
    loadLab(currentLab);
    updateURL();
  });

  // Tab switching
  document.getElementById('timpLabTabs').addEventListener('click', (e) => {
    const tab = e.target.closest('.lab-tab');
    if (!tab) return;
    currentTab = tab.dataset.tab;
    document.querySelectorAll('#timpLabTabs .lab-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderTabContent();
  });

  // Reference drawer
  setupDrawer();
}

/**
 * Load a specific lab.
 */
async function loadLab(labIndex) {
  const contentEl = document.getElementById('timpLabContent');
  contentEl.innerHTML = '<div class="lab-loading">⏳ Загрузка лабораторной...</div>';

  try {
    const labInfo = labsIndex.labs[labIndex];
    if (typeof window !== 'undefined' && window.__ALL_LAB_DATA__?.['programming-technologies']?.labs) {
      currentLabData = window.__ALL_LAB_DATA__['programming-technologies'].labs[labInfo.file];
      if (!currentLabData) throw new Error('Not found in offline data');
    } else {
      const res = await fetch(`${BASE_PATH}/${labInfo.file}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      currentLabData = await res.json();
    }
    currentTab = 'tasks';
    // Reset active tab
    document.querySelectorAll('#timpLabTabs .lab-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('#timpLabTabs .lab-tab[data-tab="tasks"]')?.classList.add('active');
    renderTabContent();
  } catch (err) {
    contentEl.innerHTML = `
      <div class="lab-error">
        <div class="lab-error-icon">😕</div>
        <div class="lab-error-text">Лабораторная ${labIndex} не найдена</div>
        <div class="lab-error-hint">Попробуйте выбрать другую лабораторную</div>
      </div>
    `;
  }
}

/**
 * Render the current tab content.
 */
function renderTabContent() {
  const contentEl = document.getElementById('timpLabContent');
  if (!currentLabData) return;

  let html = '';
  let addErrors = false;

  switch (currentTab) {
    case 'tasks':
      html = currentLabData.tasks || '<p class="lab-empty">Условие не найдено</p>';
      break;
    case 'theory':
      html = currentLabData.theory || '<p class="lab-empty">Теория не найдена</p>';
      break;
    case 'tutorial':
      html = currentLabData.tutorial || '<p class="lab-empty">Гайд не найден</p>';
      addErrors = true;
      break;
    case 'homework':
      html = currentLabData.homework || '<p class="lab-empty">Homework не найден</p>';
      break;
  }

  contentEl.innerHTML = `
    <div class="lab-text-content ${currentTab === 'theory' ? 'lab-theory' : ''}">
      ${html}
      ${addErrors && currentLabData.errors ? renderErrorsBlock(currentLabData.errors) : ''}
    </div>
  `;

  requestAnimationFrame(() => {
    renderMath(contentEl);
    postProcessCodeBlocks(contentEl);
    postProcessChecklists(contentEl);
    postProcessSVGDiagrams(contentEl);
    setupErrorToggle(contentEl);
  });
}

// ─── Post-processing: Inline SVG loading (for CSS variable support) ───

function postProcessSVGDiagrams(container) {
  const diagrams = container.querySelectorAll('.lab-diagram img');
  diagrams.forEach(async (img) => {
    const src = img.getAttribute('src');
    if (!src || !src.endsWith('.svg')) return;
    try {
      const res = await fetch(src);
      if (!res.ok) return;
      const svgText = await res.text();
      const wrapper = img.parentElement;
      // Replace <img> with inline SVG
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = svgText;
      const svgEl = tempDiv.querySelector('svg');
      if (svgEl) {
        svgEl.style.width = '100%';
        svgEl.style.maxWidth = '500px';
        svgEl.style.height = 'auto';
        img.replaceWith(svgEl);
      }
    } catch (_) {}
  });
}

// ─── Post-processing: Copy buttons on code blocks ───

function postProcessCodeBlocks(container) {
  const pres = container.querySelectorAll('pre');
  pres.forEach(pre => {
    // Skip if already wrapped
    if (pre.parentElement?.classList.contains('code-wrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'code-wrapper';
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    const btn = document.createElement('button');
    btn.className = 'code-copy-btn';
    btn.textContent = 'Копировать';
    btn.addEventListener('click', () => {
      const text = pre.textContent;
      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = '✓ Скопировано';
        btn.classList.add('copied');
        if (window.showToast) window.showToast('Код команды скопирован в буфер', 'copy');
        setTimeout(() => {
          btn.textContent = 'Копировать';
          btn.classList.remove('copied');
        }, 1500);
      });
    });
    wrapper.appendChild(btn);
  });
}

// ─── Post-processing: Interactive checklists ───

function postProcessChecklists(container) {
  const checklists = container.querySelectorAll('.task-checklist');
  checklists.forEach(list => {
    const items = list.querySelectorAll('li');
    items.forEach((li, idx) => {
      const key = `timp-lab-${currentLab}-task-${idx}`;
      const isChecked = localStorage.getItem(key) === 'true';
      const text = li.innerHTML;

      const div = document.createElement('div');
      div.className = `lab-checklist-item ${isChecked ? 'checked' : ''}`;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = isChecked;
      checkbox.id = key;

      const label = document.createElement('label');
      label.htmlFor = key;
      label.innerHTML = text;

      div.appendChild(checkbox);
      div.appendChild(label);

      checkbox.addEventListener('change', () => {
        localStorage.setItem(key, checkbox.checked);
        div.classList.toggle('checked', checkbox.checked);
      });

      li.replaceWith(div);
    });
  });
}

// ─── Error blocks (Common Mistakes) ───

function renderErrorsBlock(errors) {
  if (!errors || errors.length === 0) return '';
  return `
    <button class="lab-errors-toggle" id="errorsToggle">
      <span class="toggle-arrow">▶</span>
      ⚠️ Частые ошибки (${errors.length})
    </button>
    <div class="lab-errors-content" id="errorsContent">
      ${errors.map(e => `
        <div class="lab-error-item">
          <h4>❌ ${e.title}</h4>
          <p>${e.problem}</p>
          <p class="error-fix">✅ ${e.fix}</p>
        </div>
      `).join('')}
    </div>
  `;
}

function setupErrorToggle(container) {
  const toggle = container.querySelector('#errorsToggle');
  const content = container.querySelector('#errorsContent');
  if (!toggle || !content) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    content.classList.toggle('visible');
  });
}

// ─── Reference Drawer (Commands + Glossary) ───

function setupDrawer() {
  const btn = document.getElementById('refDrawerBtn');
  const drawer = document.getElementById('refDrawer');
  const overlay = document.getElementById('drawerOverlay');
  const close = document.getElementById('drawerClose');
  const search = document.getElementById('drawerSearch');
  const body = document.getElementById('drawerBody');

  if (!btn || !referenceData) return;

  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('open');
    renderDrawerContent('');
    search.value = '';
    search.focus();
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
  }

  btn.addEventListener('click', openDrawer);
  overlay.addEventListener('click', closeDrawer);
  close.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
  });

  search.addEventListener('input', () => {
    renderDrawerContent(search.value.toLowerCase());
  });
}

function renderDrawerContent(filter) {
  const body = document.getElementById('drawerBody');
  if (!referenceData) return;

  // Group commands by category
  const categories = {};
  referenceData.commands.forEach(c => {
    if (filter && !c.cmd.toLowerCase().includes(filter) && !c.desc.toLowerCase().includes(filter)) return;
    const cat = c.category || 'Другое';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(c);
  });

  // Filter terms
  const terms = referenceData.terms.filter(t =>
    !filter || t.term.toLowerCase().includes(filter) || t.desc.toLowerCase().includes(filter)
  );

  let html = '';

  // Commands by category
  for (const [cat, cmds] of Object.entries(categories)) {
    html += `<div class="drawer-section">
      <div class="drawer-section-title">${cat}</div>
      ${cmds.map(c => `
        <div class="drawer-item">
          <span class="drawer-cmd" title="Нажмите, чтобы скопировать">${c.cmd}</span>
          <button class="drawer-copy-btn" data-cmd="${c.cmd.replace(/"/g, '&quot;')}" title="Копировать команду">📋</button>
          <span class="drawer-desc">${c.desc}</span>
          <span class="drawer-lab-badge">Lab ${c.lab}</span>
        </div>
      `).join('')}
    </div>`;
  }

  // Terms
  if (terms.length > 0) {
    html += `<div class="drawer-section">
      <div class="drawer-section-title">📘 Термины</div>
      ${terms.map(t => `
        <div class="drawer-item">
          <span class="drawer-term">${t.term}</span>
          <span class="drawer-desc">${t.desc}</span>
          <span class="drawer-lab-badge">Lab ${t.lab}</span>
        </div>
      `).join('')}
    </div>`;
  }

  if (!html) {
    html = '<p style="text-align:center;color:var(--text3);padding:40px 0;">Ничего не найдено</p>';
  }

  body.innerHTML = html;

  // Wire up copy buttons for commands
  body.querySelectorAll('.drawer-copy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const cmd = btn.dataset.cmd;
      navigator.clipboard.writeText(cmd).then(() => {
        btn.textContent = '✓';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = '📋';
          btn.classList.remove('copied');
        }, 1200);
      });
    });
  });

  // Also make .drawer-cmd clickable to copy
  body.querySelectorAll('.drawer-cmd').forEach(cmdEl => {
    cmdEl.style.cursor = 'pointer';
    cmdEl.addEventListener('click', () => {
      const text = cmdEl.textContent;
      navigator.clipboard.writeText(text).then(() => {
        const original = cmdEl.textContent;
        cmdEl.textContent = '✓ Скопировано';
        cmdEl.classList.add('copied');
        setTimeout(() => {
          cmdEl.textContent = original;
          cmdEl.classList.remove('copied');
        }, 1200);
      });
    });
  });
}

// ─── Helpers ───

function getLabDescription(labIndex) {
  const lab = labsIndex.labs[labIndex];
  return lab ? `<span class="lab-desc-title">Lab ${lab.num}:</span> ${lab.desc}` : '';
}

function updateLabDescription() {
  const el = document.getElementById('timpLabDescription');
  if (el) el.innerHTML = getLabDescription(currentLab);
}

function updateURL() {
  const url = new URL(window.location.href);
  url.searchParams.set('lab', currentLab);
  history.replaceState(null, '', url.toString());
}
