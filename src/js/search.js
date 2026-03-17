// Search module: search input and section filtering
import { render } from './renderer.js';

export function initSearch() {
  const input = document.getElementById('search');
  const clearBtn = document.getElementById('searchClear');

  input.addEventListener('input', () => {
    render(input.value);
    clearBtn.style.display = input.value ? 'block' : 'none';
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    render('');
    clearBtn.style.display = 'none';
  });
}
