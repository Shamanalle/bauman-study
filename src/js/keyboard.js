// Keyboard shortcuts
import { goRandom } from './renderer.js';

export function initKeyboard() {
  document.addEventListener('keydown', e => {
    // Don't intercept when typing in search
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.code === 'Slash' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      document.getElementById('search')?.focus();
    } else if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
      goRandom();
    }
  });
}
