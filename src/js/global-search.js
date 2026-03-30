// Global Search: search across all subjects and assessments
// Loaded lazily on the platform page

import { getSubjectMap } from './subjects-config.js';
const SUBJECT_MAP = getSubjectMap();

let searchIndex = null; // Lazy-loaded
let indexPromise = null; // Prevent double-building

async function buildIndex() {
  if (searchIndex) return searchIndex;
  if (indexPromise) return indexPromise;

  indexPromise = (async () => {
    searchIndex = [];
    const subjects = Object.keys(SUBJECT_MAP);

    // Fetch all assessments in parallel per subject
    const allFetches = subjects.map(subjectId =>
      discoverAssessments(subjectId).then(assessments => ({ subjectId, assessments }))
    );

    const results = await Promise.all(allFetches);

    for (const { subjectId, assessments } of results) {
      for (const { assessment, meta } of assessments) {
        if (!meta.sections) continue;

        for (const secFile of meta.sections) {
          try {
            const resp = await fetch(`/data/${subjectId}/${assessment}/${secFile}`);
            if (!resp.ok) continue;
            const data = await resp.json();
            const items = data.questions || data.cards || [];

            for (const item of items) {
              const rawText = item.formalText || item.statement || '';
              searchIndex.push({
                id: item.id,
                title: item.title || '',
                // Strip LaTeX and markdown for search text
                searchText: stripForSearch(rawText),
                displayText: rawText,
                keyIdea: item.keyIdea || '',
                type: item.type || '',
                subject: subjectId,
                subjectTitle: SUBJECT_MAP[subjectId]?.title || subjectId,
                subjectIcon: SUBJECT_MAP[subjectId]?.icon || '📄',
                assessment,
                assessmentTitle: meta.title || assessment,
                section: data.section || secFile,
              });
            }
          } catch { /* skip individual files */ }
        }
      }
    }

    return searchIndex;
  })();

  return indexPromise;
}

/**
 * Strip LaTeX, markdown, and special chars to build a clean search string.
 */
function stripForSearch(text) {
  return text
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')  // remove display math
    .replace(/\$[^$]+?\$/g, ' ')          // remove inline math
    .replace(/\*\*(.*?)\*\*/g, '$1')      // strip bold markers
    .replace(/\\[a-zA-Z]+/g, ' ')         // remove LaTeX commands
    .replace(/[{}\\]/g, ' ')              // remove braces
    .replace(/\s+/g, ' ')                 // collapse whitespace
    .trim();
}

async function discoverAssessments(subjectId) {
  const results = [];
  const possibleAssessments = [
    'exam', 'exam-practice', 'midterm-1', 'midterm-1-practice',
    'midterm-2', 'midterm-2-practice', 'kr-1', 'kr-1-practice',
    'kr-2', 'kr-2-practice', 'zachet',
  ];

  // Fetch all meta.json in parallel
  const fetches = possibleAssessments.map(async (assessment) => {
    try {
      const resp = await fetch(`/data/${subjectId}/${assessment}/meta.json`);
      if (!resp.ok) return null;
      const meta = await resp.json();
      return { assessment, meta };
    } catch { return null; }
  });

  const settled = await Promise.all(fetches);
  return settled.filter(Boolean);
}

function search(query, items, maxResults = 30) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/).filter(w => w.length >= 2);
  if (!words.length) return [];

  const scored = [];
  for (const item of items) {
    const haystack = `${item.title} ${item.searchText} ${item.keyIdea} ${item.type}`.toLowerCase();
    let score = 0;
    let allMatch = true;

    for (const w of words) {
      if (haystack.includes(w)) {
        score += 10;
        // Boost title matches heavily
        if (item.title.toLowerCase().includes(w)) score += 25;
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

function renderResult(item) {
  const href = `?subject=${encodeURIComponent(item.subject)}&assessment=${encodeURIComponent(item.assessment)}`;
  // Clean display text: strip LaTeX and markdown for preview
  const cleanText = stripForSearch(item.displayText).substring(0, 120);

  return `
    <a href="${href}" class="gs-result">
      <div class="gs-result-header">
        <span class="gs-result-icon">${item.subjectIcon}</span>
        <span class="gs-result-title">${escapeHtml(item.title)}</span>
        <span class="gs-result-badge">${escapeHtml(item.subjectTitle)}</span>
      </div>
      ${cleanText ? `<div class="gs-result-text">${escapeHtml(cleanText)}…</div>` : ''}
      <div class="gs-result-meta">${escapeHtml(item.assessmentTitle)} · ${escapeHtml(item.type || item.section)}</div>
    </a>
  `;
}

let debounceTimer = null;

export function initGlobalSearch(container) {
  const html = `
    <div class="global-search" id="globalSearch">
      <div class="gs-input-wrap">
        <span class="gs-search-icon">🔍</span>
        <input type="text" class="gs-input" id="gsInput" placeholder="Поиск по всем предметам…" autocomplete="off">
        <span class="gs-loading" id="gsLoading" style="display:none">⏳</span>
      </div>
      <div class="gs-results" id="gsResults" style="display:none"></div>
    </div>
  `;

  // Insert after hero
  const hero = container.querySelector('.hero');
  if (hero) {
    hero.insertAdjacentHTML('afterend', html);
  }

  const input = document.getElementById('gsInput');
  const results = document.getElementById('gsResults');
  const loading = document.getElementById('gsLoading');

  if (!input || !results || !loading) return;

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const q = input.value;

    if (q.length < 2) {
      results.style.display = 'none';
      results.innerHTML = '';
      return;
    }

    debounceTimer = setTimeout(async () => {
      loading.style.display = '';
      try {
        const index = await buildIndex();
        loading.style.display = 'none';

        const hits = search(q, index);
        if (hits.length === 0) {
          results.innerHTML = '<div class="gs-no-results">Ничего не найдено</div>';
        } else {
          results.innerHTML = hits.map(renderResult).join('');
        }
        results.style.display = '';
      } catch (err) {
        loading.style.display = 'none';
        console.error('Search error:', err);
      }
    }, 300);
  });

  // Close on Escape
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      input.value = '';
      results.style.display = 'none';
      results.innerHTML = '';
      input.blur();
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.global-search')) {
      results.style.display = 'none';
    }
  });

  // Refocus shows results
  input.addEventListener('focus', () => {
    if (input.value.length >= 2 && results.innerHTML) {
      results.style.display = '';
    }
  });
}
