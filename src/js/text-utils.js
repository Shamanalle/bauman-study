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
    // Markdown tables
    p = p.replace(/(?:^|\n)((?:\|[^\n]+\|\s*\n)+)/g, (_, tableBlock) => {
      const rows = tableBlock.trim().split('\n').map(r => r.trim()).filter(Boolean);
      if (rows.length < 2) return '\n' + tableBlock;
      const sepIdx = rows.findIndex(r => /^\|[\s:]*-+[\s:]*([\s:]*\|[\s:]*-+[\s:]*)*\|$/.test(r));
      let html = '<table class="md-table">';
      rows.forEach((row, i) => {
        if (i === sepIdx) return;
        const cells = row.split('|').filter((_, ci, arr) => ci > 0 && ci < arr.length - 1);
        const tag = (sepIdx >= 0 && i < sepIdx) ? 'th' : 'td';
        html += '<tr>' + cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>';
      });
      html += '</table>';
      return '\n' + html + '\n';
    });
    p = p
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(?:\\n\s*){2,}/g, '</p><p class="nl-p">')      // double+ escaped newlines → paragraph break
      .replace(/\n\s*\n/g, '</p><p class="nl-p">')             // double+ real newlines → paragraph break
      .replace(/\\n(?![a-zA-Z])/g, '<br>')                      // remaining single escaped \n → <br>
      .replace(/\n/g, '<br>');                                   // remaining single real newlines → <br>
    // Strip <br> adjacent to display math $$ to prevent double-spacing
    p = p.replace(/(<br\s*\/?>)+\s*(\$\$)/g, '$2');
    p = p.replace(/(\$\$)\s*(<br\s*\/?>)+/g, '$1');
    // Strip <br> adjacent to paragraph boundaries
    p = p.replace(/(<br\s*\/?>)+\s*(<\/p>)/g, '$2');
    p = p.replace(/(<p[^>]*>)\s*(<br\s*\/?>)+/g, '$1');
    // Strip <br> around tables
    p = p.replace(/<br\s*\/?>\s*<table/g, '<table');
    p = p.replace(/<\/table>\s*<br\s*\/?>/g, '</table>');
    return p;
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
