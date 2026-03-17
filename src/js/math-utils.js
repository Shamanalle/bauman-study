// KaTeX math rendering wrapper

/**
 * Render all LaTeX expressions within a DOM element using KaTeX auto-render.
 * Supports $...$ (inline) and $$...$$ (display) delimiters.
 */
export function renderMath(el) {
  if (!el || typeof renderMathInElement !== 'function') return;
  renderMathInElement(el, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '\\[', right: '\\]', display: true },
      { left: '$', right: '$', display: false },
      { left: '\\(', right: '\\)', display: false },
    ],
    throwOnError: false,
  });
}
