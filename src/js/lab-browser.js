// Lab Browser: browse lab assignments, code solutions, explanations, and theory
// Route: ?subject=algorithmic-languages&type=labs[&lab=1&variant=21]

import { renderMath } from './math-utils.js';
import { highlightCode } from './text-utils.js';
import * as progress from './progress.js';

let labsMeta = null;
let labsIndex = null;
let currentSolution = null;
let currentLab = 1;
let currentVariant = 1;
let currentTab = 'condition';

const BASE_PATH = './data/algorithmic-languages/labs';

/**
 * Initialize the lab browser.
 */
export async function initLabBrowser() {
  if (typeof window !== 'undefined' && window.__ALL_LAB_DATA__?.['algorithmic-languages']) {
    const ld = window.__ALL_LAB_DATA__['algorithmic-languages'];
    labsMeta = ld.meta;
    labsIndex = ld.index;
  } else {
    // Load meta and index
    const [metaRes, indexRes] = await Promise.all([
      fetch(`${BASE_PATH}/meta.json`),
      fetch(`${BASE_PATH}/index.json`),
    ]);

    labsMeta = await metaRes.json();
    labsIndex = await indexRes.json();
  }

  // Parse URL params
  const params = new URLSearchParams(window.location.search);
  currentLab = parseInt(params.get('lab')) || 1;
  currentVariant = parseInt(params.get('variant')) || 1;

  // Clamp values
  currentLab = Math.max(1, Math.min(currentLab, labsIndex.labs.length));
  currentVariant = Math.max(1, Math.min(currentVariant, labsIndex.variantCount));

  renderLabBrowser();
  await loadSolution(currentVariant, currentLab);
}

/**
 * Render the full lab browser UI.
 */
function renderLabBrowser() {
  const app = document.getElementById('app');

  // Update hero
  document.getElementById('heroTitle').textContent = `💻 ${labsMeta.title}`;
  document.getElementById('heroSubtitle').textContent = labsMeta.subtitle;

  // Hide standard UI elements
  const nav = document.querySelector('.nav');
  const pills = document.getElementById('sectionPills');
  const statsRow = document.querySelector('.stats-row');
  const progressBar = document.querySelector('.progress-bar-hero');
  if (nav) nav.style.display = 'none';
  if (pills) pills.innerHTML = '';
  if (statsRow) statsRow.style.display = 'none';
  if (progressBar) progressBar.style.display = 'none';

  // Build lab browser HTML
  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="lab-browser">
      <div class="lab-selector">
        <div class="lab-selector-row">
          <div class="lab-select-group">
            <label class="lab-label">Лабораторная работа</label>
            <select id="labSelect" class="lab-dropdown">
              ${labsIndex.labs.map(l =>
                `<option value="${l.id}" ${l.id === currentLab ? 'selected' : ''}>
                  ЛР-${l.id}: ${l.title}
                </option>`
              ).join('')}
            </select>
          </div>
          <div class="lab-select-group">
            <label class="lab-label">Вариант</label>
            <div class="variant-nav">
              <button class="var-btn" id="varPrev" title="Предыдущий вариант">◀</button>
              <input type="number" id="varInput" class="var-input" min="1" max="${labsIndex.variantCount}" value="${currentVariant}">
              <span class="var-total">/ ${labsIndex.variantCount}</span>
              <button class="var-btn" id="varNext" title="Следующий вариант">▶</button>
            </div>
          </div>
        </div>
        <div class="lab-description" id="labDescription">
          ${getLabDescription(currentLab)}
        </div>
      </div>

      <div class="lab-tabs" id="labTabs">
        <button class="lab-tab active" data-tab="condition">📋 Условие</button>
        <button class="lab-tab" data-tab="code">💻 Код</button>
        <button class="lab-tab" data-tab="explanation">📖 Объяснение</button>
        <button class="lab-tab" data-tab="theory">📚 Теория</button>
      </div>

      <div class="lab-content" id="labContent">
        <div class="lab-loading">Загрузка...</div>
      </div>
    </div>
  `;

  // Event listeners
  document.getElementById('labSelect').addEventListener('change', (e) => {
    currentLab = parseInt(e.target.value);
    updateLabDescription();
    loadSolution(currentVariant, currentLab);
    updateURL();
  });

  document.getElementById('varInput').addEventListener('change', (e) => {
    let v = parseInt(e.target.value);
    v = Math.max(1, Math.min(v, labsIndex.variantCount));
    e.target.value = v;
    currentVariant = v;
    loadSolution(currentVariant, currentLab);
    updateURL();
  });

  document.getElementById('varPrev').addEventListener('click', () => {
    if (currentVariant > 1) {
      currentVariant--;
      document.getElementById('varInput').value = currentVariant;
      loadSolution(currentVariant, currentLab);
      updateURL();
    }
  });

  document.getElementById('varNext').addEventListener('click', () => {
    if (currentVariant < labsIndex.variantCount) {
      currentVariant++;
      document.getElementById('varInput').value = currentVariant;
      loadSolution(currentVariant, currentLab);
      updateURL();
    }
  });

  // Tab switching
  document.getElementById('labTabs').addEventListener('click', (e) => {
    const tab = e.target.closest('.lab-tab');
    if (!tab) return;
    currentTab = tab.dataset.tab;
    document.querySelectorAll('.lab-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderTabContent();
  });
}

/**
 * Load a specific solution.
 */
async function loadSolution(variant, lab) {
  const contentEl = document.getElementById('labContent');
  contentEl.innerHTML = '<div class="lab-loading">⏳ Загрузка решения...</div>';

  try {
    if (typeof window !== 'undefined' && window.__ALL_LAB_DATA__?.['algorithmic-languages']?.solutions) {
      const sols = window.__ALL_LAB_DATA__['algorithmic-languages'].solutions;
      currentSolution = sols[`v${variant}`]?.[`lab-${lab}.json`];
      if (!currentSolution) throw new Error('Solution not found in offline data');
    } else {
      const res = await fetch(`${BASE_PATH}/solutions/v${variant}/lab-${lab}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      currentSolution = await res.json();
    }
    renderTabContent();
  } catch (err) {
    contentEl.innerHTML = `
      <div class="lab-error">
        <div class="lab-error-icon">😕</div>
        <div class="lab-error-text">Решение для варианта ${variant}, ЛР-${lab} не найдено</div>
        <div class="lab-error-hint">Попробуйте выбрать другой вариант или лабораторную</div>
      </div>
    `;
  }
}

/**
 * Render the current tab content.
 */
function renderTabContent() {
  const contentEl = document.getElementById('labContent');
  if (!currentSolution) return;

  switch (currentTab) {
    case 'condition':
      contentEl.innerHTML = `
        <div class="lab-text-content">
          ${currentSolution.condition || '<p class="lab-empty">Условие не найдено</p>'}
        </div>
      `;
      break;

    case 'code':
      contentEl.innerHTML = `
        <div class="lab-code-container">
          <div class="lab-code-header">
            <span class="lab-code-filename">main.cpp</span>
            <span class="lab-code-variant">Вариант ${currentSolution.variant}</span>
            <div class="lab-code-actions">
              <button class="lab-copy-btn" id="copyCodeBtn" title="Копировать код">📋 Копировать</button>
              <button class="lab-copy-btn lab-dl-btn" id="downloadCodeBtn" title="Скачать .cpp файл">💾 Скачать .cpp</button>
            </div>
          </div>
          <div class="lab-code-body">
            ${highlightCode(`<pre><code>${escapeHtml(currentSolution.code)}</code></pre>`)}
          </div>
        </div>
      `;
      // Copy button
      document.getElementById('copyCodeBtn')?.addEventListener('click', () => {
        navigator.clipboard.writeText(currentSolution.code).then(() => {
          const btn = document.getElementById('copyCodeBtn');
          btn.textContent = '✅ Скопировано!';
          if (window.showToast) window.showToast('Код программы скопирован в буфер', 'copy');
          setTimeout(() => btn.textContent = '📋 Копировать', 2000);
        });
      });
      // Download button
      document.getElementById('downloadCodeBtn')?.addEventListener('click', () => {
        const blob = new Blob([currentSolution.code], { type: 'text/x-c++src;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `lab${currentLab}_v${currentSolution.variant}.cpp`;
        a.click();
        if (window.showToast) window.showToast(`Файл lab${currentLab}_v${currentSolution.variant}.cpp сохранён`, 'success');
      });
      break;

    case 'explanation':
      contentEl.innerHTML = `
        <div class="lab-text-content lab-explanation">
          ${currentSolution.explanation || '<p class="lab-empty">Объяснение не найдено</p>'}
        </div>
      `;
      break;

    case 'theory':
      contentEl.innerHTML = `
        <div class="lab-text-content lab-theory">
          ${currentSolution.theory || '<p class="lab-empty">Теория не найдена</p>'}
        </div>
      `;
      break;
  }

  // Apply code highlighting to any code blocks in the content
  requestAnimationFrame(() => renderMath(contentEl));
}

function getLabDescription(labId) {
  const lab = labsIndex.labs.find(l => l.id === labId);
  return lab ? `<span class="lab-desc-title">ЛР-${lab.id}:</span> ${lab.desc}` : '';
}

function updateLabDescription() {
  const el = document.getElementById('labDescription');
  if (el) el.innerHTML = getLabDescription(currentLab);
}

function updateURL() {
  const url = new URL(window.location.href);
  url.searchParams.set('lab', currentLab);
  url.searchParams.set('variant', currentVariant);
  history.replaceState(null, '', url.toString());
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
