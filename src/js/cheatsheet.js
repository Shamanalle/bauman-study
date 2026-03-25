// Cheatsheet: generate a printable formula sheet from section-00 formulas
// Triggered from practice-browser via a button

export function initCheatsheet(meta, sections) {
  // Find formulas section by checking:
  // 1. Section name containing "Формулы" or "Синтаксис"
  // 2. Fallback to first section  
  const formulaSec = sections.find(s => {
    const secName = (s.section || '').toLowerCase();
    return secName.includes('формул') || secName.includes('синтаксис') || secName.includes('справочник');
  }) || sections[0];

  if (!formulaSec) return null;

  return {
    render() {
      const items = formulaSec.questions || formulaSec.cards || [];
      if (!items.length) {
        alert('Нет формул для генерации шпаргалки');
        return;
      }

      // Build cheatsheet HTML
      const safeTitle = escapeHtml(meta.title || '');
      const safeIcon = escapeHtml(meta.icon || '');

      const cheatHtml = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle} · Шпаргалка</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"><\/script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"
    onload="renderMathInElement(document.body, {delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],throwOnError:false})"><\/script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: "Inter", -apple-system, sans-serif;
      font-size: 9pt; line-height: 1.5; padding: 12px;
      column-count: 2; column-gap: 16px;
    }
    h1 { font-size: 12pt; text-align: center; margin-bottom: 8px; column-span: all; }
    .subtitle { text-align: center; color: #666; font-size: 8pt; margin-bottom: 12px; column-span: all; }
    .formula {
      break-inside: avoid; page-break-inside: avoid;
      border: 1px solid #ddd; border-radius: 6px;
      padding: 6px 8px; margin-bottom: 6px;
    }
    .formula-title {
      font-size: 7pt; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.05em; color: #2da44e; margin-bottom: 3px;
    }
    .formula-body { font-size: 8pt; overflow-x: hidden; }
    .formula-body .katex { font-size: 0.85em; }
    .formula-body strong { font-weight: 700; }
    .formula-key-idea {
      color: #8250df; font-size: 7pt; margin-top: 2px;
      border-top: 1px dashed #e8ecf0; padding-top: 2px;
    }
    .katex-display { margin: 2px 0 !important; text-align: left !important; }
    @media print {
      body { padding: 6px; font-size: 8pt; }
      .formula { border: 0.5pt solid #ccc; padding: 4px 6px; margin-bottom: 4px; }
    }
    @page { margin: 10mm; }
  </style>
</head>
<body>
  <h1>${safeIcon} ${safeTitle} · Формулы</h1>
  <div class="subtitle">${escapeHtml(formulaSec.section || '')} · ${items.length} позиций</div>
  ${items.map((item, i) => `
    <div class="formula">
      <div class="formula-title">${i + 1}. ${escapeHtml(item.title || '')}</div>
      <div class="formula-body">${formatFormulaContent(item)}</div>
    </div>
  `).join('')}
</body>
</html>`;

      // Open in new window for printing
      const win = window.open('', '_blank');
      if (!win) {
        alert('Разрешите всплывающие окна для генерации шпаргалки');
        return;
      }
      win.document.write(cheatHtml);
      win.document.close();

      // Auto-trigger print after KaTeX loads
      win.addEventListener('load', () => {
        setTimeout(() => win.print(), 800);
      });
    }
  };
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatFormulaContent(item) {
  let html = '';

  if (item.formalText) {
    // Process markdown-like content: **bold**, newlines, bullet lists
    html += item.formalText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Restore $ math delimiters that were escaped
      .replace(/\$\$/g, '$$')
      .replace(/\$/g, '$')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n- (.+)/g, '\n• $1')
      .replace(/\n/g, '<br>');
  }

  if (item.keyIdea) {
    html += `<div class="formula-key-idea">💡 ${escapeHtml(item.keyIdea)}</div>`;
  }

  return html;
}
