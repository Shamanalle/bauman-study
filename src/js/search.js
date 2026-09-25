// Search module: search input and section filtering
import { render } from './renderer.js';

export function initSearch() {
  const input = document.getElementById('search');
  const clearBtn = document.getElementById('searchClear');
  let timer;

  input.addEventListener('input', () => {
    clearBtn.style.display = input.value ? 'block' : 'none';
    clearTimeout(timer);
    timer = setTimeout(() => {
      render(input.value);
    }, 150);
  });

  clearBtn.addEventListener('click', () => {
    clearTimeout(timer);
    input.value = '';
    render('');
    clearBtn.style.display = 'none';
  });
}
