// Global Search: search across all subjects and assessments
// Loaded lazily on the platform page

const SUBJECT_MAP = {
  'physics': { title: 'Физика', icon: '⚛️' },
  'differential-equations': { title: 'Интегралы и ДУ', icon: '∫' },
  'linear-algebra': { title: 'ЛинАлг и ФНП', icon: '📐' },
  'algorithmic-languages': { title: 'Алг. языки', icon: '💻' },
  'math-cs-foundations': { title: 'МОИ', icon: '🔢' },
  'programming-technologies': { title: 'ТиМП', icon: '🔀' },
};

let searchIndex = null; // Lazy-loaded

async function buildIndex() {
  if (searchIndex) return searchIndex;
  searchIndex = [];

  const subjects = Object.keys(SUBJECT_MAP);

  for (const subjectId of subjects) {
    // Find all assessment dirs by fetching meta.json variations
    const assessments = await discoverAssessments(subjectId);

    for (const { assessment, meta } of assessments) {
      if (!meta.sections) continue;

      for (const secFile of meta.sections) {
        try {
          const resp = await fetch(`/data/${subjectId}/${assessment}/${secFile}`);
          if (!resp.ok) continue;
          const data = await resp.json();
          const items = data.questions || data.cards || [];

          for (const item of items) {
            searchIndex.push({
              id: item.id,
              title: item.title || '',
              text: item.formalText || item.statement || '',
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
        } catch { /* skip */ }
      }
    }
  }

  return searchIndex;
}

async function discoverAssessments(subjectId) {
  const results = [];
  const possibleAssessments = [
    'exam', 'exam-practice', 'midterm-1', 'midterm-1-practice',
    'midterm-2', 'midterm-2-practice', 'kr-1', 'kr-1-practice',
    'kr-2', 'kr-2-practice', 'zachet',
  ];

  for (const assessment of possibleAssessments) {
    try {
      const resp = await fetch(`/data/${subjectId}/${assessment}/meta.json`);
      if (!resp.ok) continue;
      const meta = await resp.json();
      results.push({ assessment, meta });
    } catch { /* skip */ }
  }

  return results;
}

function search(query, items, maxResults = 30) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/);

  const scored = [];
  for (const item of items) {
    const haystack = `${item.title} ${item.text} ${item.keyIdea} ${item.type}`.toLowerCase();
    let score = 0;
    let allMatch = true;

    for (const w of words) {
      if (haystack.includes(w)) {
        score += 10;
        // Boost title matches
        if (item.title.toLowerCase().includes(w)) score += 20;
        if (item.keyIdea?.toLowerCase().includes(w)) score += 15;
      } else {
        allMatch = false;
      }
    }

    if (allMatch && score > 0) {
      scored.push({ ...item, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxResults);
}

function renderResult(item) {
  const href = `?subject=${item.subject}&assessment=${item.assessment}`;
  // Strip $$ for display
  const cleanText = (item.text || '').replace(/\$\$/g, '').replace(/\$/g, '').substring(0, 120);

  return `
    <a href="${href}" class="gs-result">
      <div class="gs-result-header">
        <span class="gs-result-icon">${item.subjectIcon}</span>
        <span class="gs-result-title">${highlightMatch(item.title)}</span>
        <span class="gs-result-badge">${item.subjectTitle}</span>
      </div>
      ${cleanText ? `<div class="gs-result-text">${cleanText}...</div>` : ''}
      <div class="gs-result-meta">${item.assessmentTitle} · ${item.type || item.section}</div>
    </a>
  `;
}

function highlightMatch(text) {
  // Simple highlight — just return as-is for now
  return text;
}

let debounceTimer = null;

export function initGlobalSearch(container) {
  const html = `
    <div class="global-search" id="globalSearch">
      <div class="gs-input-wrap">
        <span class="gs-search-icon">🔍</span>
        <input type="text" class="gs-input" id="gsInput" placeholder="Поиск по всем предметам..." autocomplete="off">
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

  input?.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const q = input.value;

    if (q.length < 2) {
      results.style.display = 'none';
      return;
    }

    debounceTimer = setTimeout(async () => {
      loading.style.display = '';
      const index = await buildIndex();
      loading.style.display = 'none';

      const hits = search(q, index);
      if (hits.length === 0) {
        results.innerHTML = '<div class="gs-no-results">Ничего не найдено</div>';
      } else {
        results.innerHTML = hits.map(renderResult).join('');
      }
      results.style.display = '';
    }, 300);
  });

  // Close on Escape
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      input.value = '';
      results.style.display = 'none';
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.global-search')) {
      results.style.display = 'none';
    }
  });
}
