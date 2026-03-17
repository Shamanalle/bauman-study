// Text utilities: markdown-like formatting and code highlighting

/**
 * Apply inline formatting: backticks → code, **bold**, newlines → <br>.
 * Preserves <pre> blocks from being processed.
 */
export function nl(str) {
  if (!str) return '';
  let res = highlightCode(str);
  const parts = res.split(/(<pre[\s\S]*?<\/pre>)/gi);
  return parts.map(p => {
    if (p.toLowerCase().startsWith('<pre')) return p;
    return p
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\\n(?![a-zA-Z])|\n/g, '<br>');
  }).join('');
}

/**
 * Convert backticks to <code> and apply syntax highlighting to <pre><code> blocks.
 */
export function highlightCode(str) {
  if (typeof str !== 'string') return str;

  // Inline code: `text` → <code>
  str = str.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Block code: <pre><code>...</code></pre> → highlighted
  return str.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/gi, (_, code) => {
    const dict = [];

    // Protect comments
    code = code.replace(/(\/\/.*$)/gm, m => {
      dict.push(`<span class="hljs-comment">${m}</span>`);
      return `___T${dict.length - 1}___`;
    });

    // Protect strings
    code = code.replace(/("[^"\\]*(?:\\.[^"\\]*)*")/g, m => {
      dict.push(`<span class="hljs-string">${m}</span>`);
      return `___T${dict.length - 1}___`;
    });

    // Protect #include
    code = code.replace(/(#include\s+&lt;.*?[>&gt;])/g, m => {
      dict.push(`<span class="hljs-meta">${m}</span>`);
      return `___T${dict.length - 1}___`;
    });

    // Keywords
    const kw = '\\b(int|float|double|bool|char|void|class|struct|public|private|protected|template|typename|const|static|virtual|override|return|if|else|for|while|new|delete|namespace|using|try|catch|throw|noexcept|auto|size_t|std|vector|string|cout|cin|endl|main|nullptr|true|false)\\b';
    code = code.replace(new RegExp(kw, 'g'), '<span class="hljs-keyword">$1</span>');

    // Types (PascalCase)
    code = code.replace(/\b([A-Z][a-zA-Z0-9_]*)\b/g, '<span class="hljs-type">$1</span>');

    // Restore protected tokens
    dict.forEach((val, i) => { code = code.replace(`___T${i}___`, val); });

    return `<pre class="code-block"><code>${code.trim()}</code></pre>`;
  });
}
