// Cheatsheet: opens pre-generated static HTML cheatsheet for the current assessment
// Static files are in /cheatsheets/{subject}-{assessment}.html
import { showToast } from './toast.js';

export const CHEATSHEET_MAP = {
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

export function getCheatsheetUrl(file) {
  try {
    const loc = window.location;
    let path = loc.pathname;
    if (!path.endsWith('/')) {
      if (path.endsWith('.html')) {
        path = path.substring(0, path.lastIndexOf('/') + 1);
      } else {
        path = path + '/';
      }
    }
    return loc.origin + path + 'cheatsheets/' + file + '.html';
  } catch (e) {
    return './cheatsheets/' + file + '.html';
  }
}

function resolveCheatsheetTarget() {
  const params = new URLSearchParams(window.location.search);
  const subject = params.get('subject') || '';
  const assessment = params.get('assessment') || '';
  const key = `${subject}|${assessment}`;
  const file = CHEATSHEET_MAP[key];

  if (!file) return null;

  const inlinedHtml = (typeof window !== 'undefined' && window.__CHEATSHEET_DATA__ && window.__CHEATSHEET_DATA__[file])
    || (typeof window !== 'undefined' && window.__INLINE_CHEATSHEET__);

  let url = '';
  if (inlinedHtml) {
    try {
      const blob = new Blob([inlinedHtml], { type: 'text/html; charset=utf-8' });
      url = URL.createObjectURL(blob);
    } catch (e) {
      url = getCheatsheetUrl(file);
    }
  } else {
    url = getCheatsheetUrl(file);
  }

  return { file, url, inlinedHtml };
}

let activeDrawer = null;

export function openCheatsheetDrawer(meta) {
  const target = resolveCheatsheetTarget();
  if (!target) {
    showToast('Шпаргалка для этого раздела пока не создана', 'info');
    return;
  }

  if (activeDrawer && document.body.contains(activeDrawer)) {
    activeDrawer.classList.add('cs-drawer-backdrop--open');
    return;
  }

  const backdrop = document.createElement('div');
  backdrop.id = 'csDrawerBackdrop';
  backdrop.className = 'cs-drawer-backdrop';
  backdrop.innerHTML = `
    <div class="cs-drawer" id="csDrawer">
      <div class="cs-drawer-header">
        <div class="cs-drawer-title-group">
          <span class="cs-drawer-icon">📄</span>
          <span class="cs-drawer-title">Шпаргалка · ${meta?.title || 'Формулы'}</span>
        </div>
        <div class="cs-drawer-actions">
          <button class="cs-drawer-btn" id="csOpenTabBtn" title="Открыть в новой вкладке">↗ Новая вкладка</button>
          <button class="cs-drawer-close" id="csCloseBtn" title="Закрыть (Esc)">✕</button>
        </div>
      </div>
      <div class="cs-drawer-body">
        <iframe class="cs-drawer-iframe" src="${target.url}" title="Шпаргалка"></iframe>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);
  activeDrawer = backdrop;

  requestAnimationFrame(() => {
    backdrop.classList.add('cs-drawer-backdrop--open');
  });

  const closeDrawer = () => {
    backdrop.classList.remove('cs-drawer-backdrop--open');
    setTimeout(() => {
      backdrop.remove();
      if (activeDrawer === backdrop) activeDrawer = null;
    }, 220);
    document.removeEventListener('keydown', onKeyDown);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') closeDrawer();
  };
  document.addEventListener('keydown', onKeyDown);

  backdrop.querySelector('#csCloseBtn')?.addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeDrawer();
  });
  backdrop.querySelector('#csOpenTabBtn')?.addEventListener('click', () => {
    window.open(target.url, '_blank');
  });
}

export function initCheatsheet(meta, sections) {
  return {
    render() {
      // Open the in-page drawer for smooth split reading
      openCheatsheetDrawer(meta);
    }
  };
}

