// Keyboard shortcuts and helper modal
import { goRandom } from './renderer.js';
import * as progress from './progress.js';

let modalEl = null;

function isModalOpen() {
  return modalEl && modalEl.classList.contains('open');
}

export function openShortcutsModal() {
  if (!modalEl) createShortcutsModal();
  modalEl.classList.add('open');
  modalEl.setAttribute('aria-hidden', 'false');
}

export function closeShortcutsModal() {
  if (modalEl) {
    modalEl.classList.remove('open');
    modalEl.setAttribute('aria-hidden', 'true');
  }
}

export function toggleShortcutsModal() {
  if (isModalOpen()) {
    closeShortcutsModal();
  } else {
    openShortcutsModal();
  }
}

function focusSearch() {
  const input = document.getElementById('search') || document.getElementById('gsInput');
  if (input) {
    input.focus();
    input.select?.();
  }
}

function navigateCard(direction) {
  const cards = Array.from(document.querySelectorAll('.theorem-page, .prac-problem, .prac-ticket, .textbook-chapter, .lab-task-card'));
  if (!cards.length) return;

  let currentIndex = -1;
  for (let i = 0; i < cards.length; i++) {
    const rect = cards[i].getBoundingClientRect();
    if (rect.top >= -40) {
      currentIndex = i;
      break;
    }
  }

  let targetIndex = currentIndex + direction;
  if (targetIndex < 0) targetIndex = 0;
  if (targetIndex >= cards.length) targetIndex = cards.length - 1;
  cards[targetIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function createShortcutsModal() {
  if (document.getElementById('shortcutsModal')) {
    modalEl = document.getElementById('shortcutsModal');
    return;
  }

  modalEl = document.createElement('div');
  modalEl.id = 'shortcutsModal';
  modalEl.className = 'shortcuts-modal-backdrop';
  modalEl.setAttribute('aria-hidden', 'true');
  modalEl.innerHTML = `
    <div class="shortcuts-modal" role="dialog" aria-modal="true" aria-labelledby="smTitle">
      <div class="shortcuts-modal-header">
        <h3 id="smTitle">⌨️ Горячие клавиши</h3>
        <button class="shortcuts-modal-close" id="smCloseBtn" aria-label="Закрыть">✕</button>
      </div>
      <div class="shortcuts-modal-body">
        <div class="shortcut-row">
          <div class="shortcut-keys"><kbd>/</kbd> <span class="shortcut-or">или</span> <kbd>Ctrl</kbd><kbd>K</kbd></div>
          <div class="shortcut-desc">Быстрый поиск</div>
        </div>
        <div class="shortcut-row">
          <div class="shortcut-keys"><kbd>J</kbd> / <kbd>K</kbd> <span class="shortcut-or">или</span> <kbd>↓</kbd> / <kbd>↑</kbd></div>
          <div class="shortcut-desc">Следующий / предыдущий вопрос</div>
        </div>
        <div class="shortcut-row">
          <div class="shortcut-keys"><kbd>R</kbd></div>
          <div class="shortcut-desc">Случайный вопрос</div>
        </div>
        <div class="shortcut-row">
          <div class="shortcut-keys"><kbd>T</kbd></div>
          <div class="shortcut-desc">Переключить тему (светлая/тёмная)</div>
        </div>
        <div class="shortcut-row">
          <div class="shortcut-keys"><kbd>?</kbd></div>
          <div class="shortcut-desc">Открыть это окно подсказок</div>
        </div>
        <div class="shortcut-row">
          <div class="shortcut-keys"><kbd>Esc</kbd></div>
          <div class="shortcut-desc">Закрыть окно / очистить поиск</div>
        </div>
      </div>
      <div class="shortcuts-modal-footer">
        <span>МГТУ им. Н.Э. Баумана · bauman-study</span>
      </div>
    </div>
  `;
  document.body.appendChild(modalEl);

  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl || e.target.closest('#smCloseBtn')) {
      closeShortcutsModal();
    }
  });

  // FAB button in bottom corner
  const fab = document.getElementById('shortcutsFab');
  if (fab) {
    fab.addEventListener('click', toggleShortcutsModal);
  }
}

export function initKeyboard() {
  createShortcutsModal();

  document.addEventListener('keydown', e => {
    // If typing in input / textarea, allow Escape to blur
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      if (e.key === 'Escape') {
        e.target.blur();
      }
      return;
    }

    // Ctrl+K or Cmd+K
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      focusSearch();
      return;
    }

    // Question mark (?) -> show shortcuts modal
    if (e.key === '?' || (e.shiftKey && e.code === 'Slash')) {
      e.preventDefault();
      toggleShortcutsModal();
      return;
    }

    // Escape -> close modal
    if (e.key === 'Escape') {
      if (isModalOpen()) {
        closeShortcutsModal();
      }
      return;
    }

    // If modal is open, ignore other shortcuts
    if (isModalOpen()) return;

    // Slash -> focus search
    if (e.code === 'Slash' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      focusSearch();
      return;
    }

    // Theme toggle: 't'
    if (e.key.toLowerCase() === 't' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      progress.toggleTheme();
      return;
    }

    // Random question: 'r'
    if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      goRandom();
      return;
    }

    // J / K navigation
    if ((e.key === 'j' || e.key === 'ArrowDown') && !e.ctrlKey && !e.metaKey) {
      navigateCard(1);
    } else if ((e.key === 'k' || e.key === 'ArrowUp') && !e.ctrlKey && !e.metaKey) {
      navigateCard(-1);
    }
  });
}
