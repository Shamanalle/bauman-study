// Global Command Palette & Search (Spotlight style)
// Supports full-text search, keyboard navigation (Ctrl+K, /, Arrows, Enter, Esc),
// section filtering, recent searches, and instant offline indexing.

import { SUBJECTS, getSubjectMap } from './subjects-config.js';
const SUBJECT_MAP = getSubjectMap();

let searchIndex = null;
let indexPromise = null;
let activeItemIndex = -1;
let currentFilter = 'all'; // 'all' | 'theory' | 'practice' | 'textbook' | 'labs'
let recentSearches = [];

try {
  recentSearches = JSON.parse(localStorage.getItem('bs_recent_searches') || '[]');
} catch (e) {
  recentSearches = [];
}

function saveRecentSearch(q) {
  if (!q || q.trim().length < 2) return;
  q = q.trim();
  recentSearches = [q, ...recentSearches.filter(s => s !== q)].slice(0, 5);
  try {
    localStorage.setItem('bs_recent_searches', JSON.stringify(recentSearches));
  } catch (e) {}
}

const GREEK = {
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', zeta: 'ζ',
  eta: 'η', theta: 'θ', iota: 'ι', kappa: 'κ', lambda: 'λ', mu: 'μ',
  nu: 'ν', xi: 'ξ', pi: 'π', rho: 'ρ', sigma: 'σ', tau: 'τ',
  phi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω',
  Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Xi: 'Ξ',
  Pi: 'Π', Sigma: 'Σ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω'
};
const SYMBOLS = {
  pm: '±', mp: '∓', times: '×', cdot: '·', div: '÷',
  approx: '≈', neq: '≠', ne: '≠', leq: '≤', le: '≤', geq: '≥', ge: '≥',
  infty: '∞', to: '→', leftrightarrow: '↔', implies: '⇒',
  subset: '⊂', supset: '⊃', in: '∈', notin: '∉', emptyset: '∅',
  cup: '∪', cap: '∩', forall: '∀', exists: '∃', nabla: '∇',
  partial: '∂', dots: '…', ldots: '…', cdots: '…'
};

/**
 * Strip LaTeX, markdown, and special chars to build a clean search string and preview snippet.
 */
function stripForSearch(text) {
  return (text || '')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/\$([^$]+?)\$/g, (_, inner) => {
      const m = inner
        .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2')
        .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
        .replace(/\\text\{([^}]+)\}/g, '$1')
        .replace(/\\mathbf\{([^}]+)\}/g, '$1')
        .replace(/\\vec\{([^}]+)\}/g, '$1')
        .replace(/\\left|\\right/g, '')
        .replace(/\^\{([^}]+)\}/g, '^$1')
        .replace(/\_\{([^}]+)\}/g, '_$1')
        .replace(/\\([a-zA-Z]+)/g, (match, word) => GREEK[word] || SYMBOLS[word] || word)
        .replace(/[{}\\]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      return m ? ' ' + m + ' ' : ' ';
    })
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\\([a-zA-Z]+)/g, ' ')
    .replace(/[{}\\]/g, ' ')
    .replace(/\s+([,.:;?!])/g, '$1')
    .replace(/,\s*,+/g, ', ')
    .replace(/:\s*:+/g, ': ')
    .replace(/\(\s*,\s*\)/g, ' ')
    .replace(/\[\s*,\s*\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract a readable snippet centered around search term if present.
 */
function extractSnippet(text, query, maxLen = 130) {
  if (!text) return '';
  const clean = stripForSearch(text);
  if (!clean) return '';
  if (!query || query.trim().length === 0) {
    return clean.length > maxLen ? clean.substring(0, maxLen).trim() + '…' : clean;
  }
  const lowerText = clean.toLowerCase();
  const lowerQ = query.trim().toLowerCase();
  const idx = lowerText.indexOf(lowerQ);
  if (idx === -1 || idx < 35) {
    return clean.length > maxLen ? clean.substring(0, maxLen).trim() + '…' : clean;
  }
  const start = Math.max(0, idx - 25);
  const end = Math.min(clean.length, start + maxLen);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < clean.length ? '…' : '';
  return prefix + clean.substring(start, end).trim() + suffix;
}

/**
 * Build index from memory (offline bundle) or via fetch (web app).
 */
async function buildIndex() {
  if (searchIndex) return searchIndex;
  if (indexPromise) return indexPromise;

  indexPromise = (async () => {
    searchIndex = [];

    // 1. If inlined in window.__ALL_DATA__ (Platform.html offline mode)
    if (typeof window !== 'undefined' && window.__ALL_DATA__) {
      for (const [subjId, assessments] of Object.entries(window.__ALL_DATA__)) {
        const sMeta = SUBJECT_MAP[subjId] || {};
        for (const [aId, aData] of Object.entries(assessments)) {
          const aMeta = aData.meta || {};
          const isPractice = Boolean(aMeta.practiceMode);
          const category = isPractice ? 'practice' : 'theory';

          for (const sec of (aData.sections || [])) {
            const items = sec.questions || sec.cards || [];
            for (const item of items) {
              const rawText = item.formalText || item.statement || item.title || '';
              searchIndex.push({
                id: item.id,
                title: item.title || '',
                searchText: stripForSearch(rawText + ' ' + (item.title || '') + ' ' + (item.insight || item.tldr || '')),
                displayText: rawText,
                keyIdea: item.insight || item.tldr || item.keyIdea || '',
                category,
                subject: subjId,
                subjectTitle: sMeta.title || subjId,
                subjectIcon: sMeta.icon || '📄',
                assessment: aId,
                assessmentTitle: aMeta.title || aId,
                section: sec.section || '',
              });
            }
          }
        }
      }

      // Index textbooks if inlined
      if (window.__TEXTBOOK_DATA__) {
        for (const [subjId, tb] of Object.entries(window.__TEXTBOOK_DATA__)) {
          const sMeta = SUBJECT_MAP[subjId] || {};
          const chapters = tb.chapters || {};
          for (const [file, ch] of Object.entries(chapters)) {
            searchIndex.push({
              id: ch.id || file,
              title: ch.title || file,
              searchText: stripForSearch((ch.title || '') + ' ' + (ch.content || ch.sections?.map(s => s.title + ' ' + (s.content || '')).join(' ') || '')),
              displayText: (ch.description || ch.subtitle || '').substring(0, 120),
              keyIdea: ch.subtitle || '',
              category: 'textbook',
              subject: subjId,
              subjectTitle: sMeta.title || subjId,
              subjectIcon: sMeta.icon || '📖',
              assessment: 'textbook',
              assessmentTitle: 'Учебное пособие',
              section: ch.title || '',
              customUrl: `?subject=${encodeURIComponent(subjId)}&type=textbook#ch=${encodeURIComponent(file.replace('.json', ''))}`
            });
          }
        }
      }

      return searchIndex;
    }

    // 2. Fetch-based indexing (web mode)
    const targets = [];
    for (const sub of SUBJECTS) {
      for (const a of sub.assessments) {
        if (a.assessment) {
          targets.push({
            subjectId: sub.id,
            assessmentId: a.assessment,
            assessmentName: a.name,
          });
        }
      }
    }

    const assessmentData = await Promise.all(
      targets.map(async ({ subjectId, assessmentId, assessmentName }) => {
        try {
          const basePath = `./data/${subjectId}/${assessmentId}`;
          const [metaRes, indexRes] = await Promise.all([
            fetch(`${basePath}/meta.json`).catch(() => null),
            fetch(`${basePath}/index.json`).catch(() => null),
          ]);
          if (!metaRes?.ok || !indexRes?.ok) return null;
          const meta = await metaRes.json();
          const index = await indexRes.json();
          return {
            subjectId,
            assessmentId,
            assessmentName,
            meta,
            sections: index.sections || [],
          };
        } catch {
          return null;
        }
      })
    );

    const validAssessments = assessmentData.filter(Boolean);

    for (const { subjectId, assessmentId, assessmentName, meta, sections } of validAssessments) {
      const basePath = `./data/${subjectId}/${assessmentId}`;
      const isPractice = Boolean(meta.practiceMode);
      const category = isPractice ? 'practice' : 'theory';

      const secFetches = sections.map(async (secFile) => {
        try {
          const resp = await fetch(`${basePath}/${secFile}`);
          if (!resp.ok) return null;
          return { data: await resp.json(), secFile };
        } catch {
          return null;
        }
      });

      const secResults = await Promise.all(secFetches);
      for (const res of secResults) {
        if (!res) continue;
        const { data, secFile } = res;
        const items = data.questions || data.cards || [];

        for (const item of items) {
          const rawText = item.formalText || item.statement || item.title || '';
          searchIndex.push({
            id: item.id,
            title: item.title || '',
            searchText: stripForSearch(rawText + ' ' + (item.title || '') + ' ' + (item.insight || item.tldr || '')),
            displayText: rawText,
            keyIdea: item.insight || item.tldr || item.keyIdea || '',
            category,
            subject: subjectId,
            subjectTitle: SUBJECT_MAP[subjectId]?.title || subjectId,
            subjectIcon: SUBJECT_MAP[subjectId]?.icon || '📄',
            assessment: assessmentId,
            assessmentTitle: meta.title || assessmentName,
            section: data.section || secFile,
          });
        }
      }
    }

    return searchIndex;
  })();

  return indexPromise;
}

function search(query, items, categoryFilter = 'all', maxResults = 30) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/).filter(w => w.length >= 2);
  if (!words.length) return [];

  const scored = [];
  for (const item of items) {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) {
      continue;
    }

    const haystack = `${item.title} ${item.searchText} ${item.keyIdea} ${item.section}`.toLowerCase();
    let score = 0;
    let allMatch = true;

    for (const w of words) {
      if (haystack.includes(w)) {
        score += 10;
        if (item.title.toLowerCase().includes(w)) score += 35;
        if (item.keyIdea?.toLowerCase().includes(w)) score += 15;
      } else {
        allMatch = false;
      }
    }

    if (allMatch && score > 0) {
      scored.push({ item, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxResults).map(s => s.item);
}

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function highlightMatches(text, query) {
  if (!query || !text) return escapeHtml(text);
  const words = query.toLowerCase().trim().split(/\s+/).filter(w => w.length >= 2);
  if (!words.length) return escapeHtml(text);

  let escaped = escapeHtml(text);
  for (const w of words) {
    const reg = new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    escaped = escaped.replace(reg, '<mark class="cp-highlight">$1</mark>');
  }
  return escaped;
}

function getCategoryBadge(category) {
  switch (category) {
    case 'practice': return '<span class="cp-tag cp-tag--prac">✏️ Задачи</span>';
    case 'textbook': return '<span class="cp-tag cp-tag--tb">📖 Учебник</span>';
    case 'labs': return '<span class="cp-tag cp-tag--labs">🔬 Лабы</span>';
    default: return '<span class="cp-tag cp-tag--theory">📘 Теория</span>';
  }
}

let activeHits = [];

function renderPaletteModal() {
  let modal = document.getElementById('commandPaletteModal');
  if (modal) return modal;

  modal = document.createElement('div');
  modal.id = 'commandPaletteModal';
  modal.className = 'cp-backdrop';
  modal.style.display = 'none';

  modal.innerHTML = `
    <div class="cp-dialog" role="dialog" aria-modal="true" aria-label="Поиск">
      <div class="cp-header">
        <div class="cp-input-wrap">
          <span class="cp-search-icon">🔍</span>
          <input type="text" class="cp-input" id="cpInput" placeholder="Поиск по вопросам, теоремам, задачам и лабам..." autocomplete="off" spellcheck="false">
          <span class="cp-loading" id="cpLoading" style="display:none"><span class="cp-spinner"></span></span>
          <button class="cp-clear-btn" id="cpClearBtn" title="Очистить" aria-label="Очистить">✕</button>
        </div>
        <button class="cp-close-btn" id="cpCloseBtn" title="Закрыть" aria-label="Закрыть">
          <span class="cp-close-text">Отмена</span>
          <kbd class="cp-kbd-esc" id="cpCloseKbd">Esc</kbd>
        </button>
      </div>

      <div class="cp-filter-bar">
        <button class="cp-filter-chip active" data-filter="all">Все</button>
        <button class="cp-filter-chip" data-filter="theory">📘 Теория</button>
        <button class="cp-filter-chip" data-filter="practice">✏️ Задачи</button>
        <button class="cp-filter-chip" data-filter="textbook">📖 Учебник</button>
      </div>

      <div class="cp-body" id="cpBody">
        <div class="cp-initial-state" id="cpInitial">
          ${recentSearches.length > 0 ? `
            <div class="cp-section-label">Недавние запросы</div>
            <div class="cp-recent-list">
              ${recentSearches.map(q => `
                <button class="cp-recent-item" data-query="${escapeHtml(q)}">
                  <span class="cp-recent-icon">🕒</span>
                  <span class="cp-recent-text">${escapeHtml(q)}</span>
                </button>
              `).join('')}
            </div>
          ` : `
            <div class="cp-hint-box">
              <div class="cp-hint-title">Умный поиск по всей базе знаний</div>
              <div class="cp-hint-desc">Начните вводить тему, номер вопроса, термин или фамилию учёного (например: <i>Коши</i>, <i>Гаусс</i>, <i>виртуальный деструктор</i>).</div>
            </div>
          `}
        </div>

        <div class="cp-results-list" id="cpResults" style="display:none"></div>
      </div>

      <div class="cp-footer">
        <span class="cp-shortcut"><span>↑</span><span>↓</span> навигация</span>
        <span class="cp-shortcut"><span>↵</span> открыть</span>
        <span class="cp-shortcut"><span>esc</span> закрыть</span>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Setup palette listeners
  const input = modal.querySelector('#cpInput');
  const clearBtn = modal.querySelector('#cpClearBtn');
  const closeBtn = modal.querySelector('#cpCloseBtn');
  const resultsEl = modal.querySelector('#cpResults');
  const initialEl = modal.querySelector('#cpInitial');
  const loadingEl = modal.querySelector('#cpLoading');

  // Filter chips click
  modal.querySelectorAll('.cp-filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      modal.querySelectorAll('.cp-filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.dataset.filter;
      triggerSearch(input.value);
    });
  });

  // Recent queries click
  modal.addEventListener('click', (e) => {
    const recentBtn = e.target.closest('.cp-recent-item');
    if (recentBtn) {
      input.value = recentBtn.dataset.query;
      triggerSearch(input.value);
      input.focus();
    }
  });

  // Backdrop click close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closePalette();
    }
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.style.display = 'none';
    resultsEl.style.display = 'none';
    initialEl.style.display = '';
    input.focus();
  });

  closeBtn.addEventListener('click', closePalette);

  let debounceTimer = null;

  async function triggerSearch(q) {
    clearTimeout(debounceTimer);
    activeItemIndex = -1;

    if (!q || q.trim().length < 2) {
      clearBtn.style.display = 'none';
      resultsEl.style.display = 'none';
      initialEl.style.display = '';
      return;
    }

    clearBtn.style.display = 'inline-flex';
    loadingEl.style.display = 'inline-block';

    debounceTimer = setTimeout(async () => {
      try {
        const index = await buildIndex();
        loadingEl.style.display = 'none';

        const hits = search(q, index, currentFilter);
        activeHits = hits;

        if (hits.length === 0) {
          resultsEl.innerHTML = `
            <div class="cp-no-hits">
              <span class="cp-no-hits-icon">🔍</span>
              <div class="cp-no-hits-title">Ничего не найдено</div>
              <div class="cp-no-hits-sub">Попробуйте изменить формулировку или выбрать категорию «Все»</div>
            </div>
          `;
        } else {
          resultsEl.innerHTML = `
            <div class="cp-count-header">Найдено: <b>${hits.length}</b></div>
            ${hits.map((item, idx) => {
              const hash = item.id != null ? `#q${item.id}` : '';
              const href = item.customUrl || `?subject=${encodeURIComponent(item.subject)}&assessment=${encodeURIComponent(item.assessment)}${hash}`;
              const snippet = extractSnippet(item.displayText || item.keyIdea || '', q, 130);

              return `
                <a href="${href}" class="cp-item" data-idx="${idx}">
                  <div class="cp-item-top">
                    <div class="cp-item-title-wrap">
                      <span class="cp-item-icon">${item.subjectIcon}</span>
                      <span class="cp-item-title">${highlightMatches(item.title, q)}</span>
                    </div>
                    ${getCategoryBadge(item.category)}
                  </div>
                  ${snippet ? `<div class="cp-item-snippet">${highlightMatches(snippet, q)}</div>` : ''}
                  <div class="cp-item-meta">${escapeHtml(item.subjectTitle)} · ${escapeHtml(item.assessmentTitle)}${item.section ? ` · ${escapeHtml(item.section)}` : ''}</div>
                </a>
              `;
            }).join('')}
          `;
        }

        initialEl.style.display = 'none';
        resultsEl.style.display = 'block';
      } catch (err) {
        loadingEl.style.display = 'none';
        console.error('Search error:', err);
      }
    }, 150);
  }

  input.addEventListener('input', () => {
    triggerSearch(input.value);
  });

  // Keyboard navigation inside Palette
  input.addEventListener('keydown', (e) => {
    const items = resultsEl.querySelectorAll('.cp-item');

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (items.length > 0) {
        activeItemIndex = (activeItemIndex + 1) % items.length;
        updateActiveItem(items);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (items.length > 0) {
        activeItemIndex = (activeItemIndex - 1 + items.length) % items.length;
        updateActiveItem(items);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeItemIndex >= 0 && items[activeItemIndex]) {
        saveRecentSearch(input.value);
        items[activeItemIndex].click();
      } else if (items.length > 0) {
        saveRecentSearch(input.value);
        items[0].click();
      }
    } else if (e.key === 'Escape') {
      closePalette();
    }
  });

  return modal;
}

function updateActiveItem(items) {
  items.forEach((el, i) => {
    if (i === activeItemIndex) {
      el.classList.add('active');
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    } else {
      el.classList.remove('active');
    }
  });
}

export function openPalette(prefill = '') {
  const modal = renderPaletteModal();
  modal.style.display = 'flex';
  requestAnimationFrame(() => modal.classList.add('cp-backdrop--open'));

  const input = modal.querySelector('#cpInput');
  if (input) {
    if (prefill) input.value = prefill;
    input.focus();
    input.select();
  }
}

export function closePalette() {
  const modal = document.getElementById('commandPaletteModal');
  if (!modal) return;
  modal.classList.remove('cp-backdrop--open');
  setTimeout(() => {
    modal.style.display = 'none';
  }, 180);
}

/**
 * Initializes the triggers for the Command Palette on the page.
 */
export function initGlobalSearch(container) {
  renderPaletteModal();

  window.openCommandPalette = openPalette;

  // Global keyboard shortcuts (Ctrl+K, Cmd+K, /)
  if (!window.__commandPaletteShortcutsBound) {
    window.__commandPaletteShortcutsBound = true;
    window.addEventListener('keydown', (e) => {
      const isInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openPalette();
      } else if (e.key === '/' && !isInput) {
        e.preventDefault();
        openPalette();
      }
    });
  }

  // Trigger search bar ONLY on platform home and ONLY ONCE
  const platformHero = container?.querySelector('.platform-hero');
  if (platformHero && !document.getElementById('globalSearchTrigger')) {
    const triggerHtml = `
      <div class="global-search-trigger" id="globalSearchTrigger" title="Быстрый поиск (Ctrl + K)">
        <div class="gst-box">
          <span class="gst-icon">🔍</span>
          <span class="gst-text">Поиск по всем предметам, формулам и билетам...</span>
          <kbd class="gst-kbd">Ctrl K</kbd>
        </div>
      </div>
    `;
    platformHero.insertAdjacentHTML('afterend', triggerHtml);

    const trigger = document.getElementById('globalSearchTrigger');
    if (trigger) {
      trigger.addEventListener('click', () => openPalette());
    }
  }
}
