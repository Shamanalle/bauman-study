// Toast notification system: lightweight, non-blocking, accessible
let toastContainer = null;

function getContainer() {
  if (!toastContainer || !document.body.contains(toastContainer)) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.className = 'toast-container';
    toastContainer.setAttribute('aria-live', 'polite');
    toastContainer.setAttribute('aria-atomic', 'true');
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

export function showToast(message, type = 'info', duration = 3000) {
  const container = getContainer();

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'status');

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
    copy: '📋'
  };

  const icon = icons[type] || 'ℹ️';

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('toast--visible');
  });

  let timeoutId = setTimeout(dismiss, duration);

  function dismiss() {
    toast.classList.remove('toast--visible');
    toast.classList.add('toast--hiding');
    toast.addEventListener('transitionend', () => {
      toast.remove();
      if (container.children.length === 0) {
        // keep container for reuse
      }
    }, { once: true });
  }

  // Click to dismiss
  toast.addEventListener('click', () => {
    clearTimeout(timeoutId);
    dismiss();
  });

  return { dismiss };
}

// Global exposure for onclick handlers and inline modules
if (typeof window !== 'undefined') {
  window.__showToast = showToast;
}
