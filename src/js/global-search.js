// Global Search: search across all subjects and assessments
// Loaded lazily on the platform page

import { SUBJECTS, getSubjectMap } from './subjects-config.js';
const SUBJECT_MAP = getSubjectMap();

let searchIndex = null; // Lazy-loaded
let indexPromise = null; // Prevent double-building

async function buildIndex() {
  if (searchIndex) return searchIndex;
  if (indexPromise) return indexPromise;

  indexPromise = (async () => {
    searchIndex = [];

    // Collect all assessment targets from SUBJECTS
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

    // Fetch meta and index for all assessments
    const assessmentData = await Promise.all(
      targets.map(async ({ subjectId, assessmentId, assessmentName }) => {
        try {
          const basePath = `/data/${subjectId}/${assessmentId}`;
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
      const basePath = `/data/${subjectId}/${assessmentId}`;
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
            type: item.type || '',
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
  const hash = item.id != null ? `#q${item.id}` : '';
  const href = `?subject=${encodeURIComponent(item.subject)}&assessment=${encodeURIComponent(item.assessment)}${hash}`;
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
        <input type="text" class="gs-input" id="gsInput" placeholder="Поиск по всем предметам и билетам…" autocomplete="off">
        <kbd class="gs-kbd-hint">Ctrl K</kbd>
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
          results.innerHTML = `
            <div class="gs-results-header">Найдено: ${hits.length}</div>
            ${hits.map(renderResult).join('')}
          `;
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
