// Cheatsheet: generate a printable formula sheet from section-00 formulas
// Triggered from practice-browser via a button

export function initCheatsheet(meta, sections) {
  // Find formulas section by checking section name
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
      font-size: 8.5pt;
      line-height: 1.4;
      padding: 8px;
      column-count: 2;
      column-gap: 12px;
      color: #1a1a1a;
    }

    h1 {
      font-size: 11pt;
      text-align: center;
      margin-bottom: 6px;
      column-span: all;
    }

    .subtitle {
      text-align: center;
      color: #666;
      font-size: 7pt;
      margin-bottom: 10px;
      column-span: all;
    }

    .f {
      break-inside: avoid;
      page-break-inside: avoid;
      border: 0.5pt solid #ccc;
      border-radius: 4px;
      padding: 4px 6px;
      margin-bottom: 5px;
    }

    .f-t {
      font-size: 6.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #2da44e;
      margin-bottom: 2px;
      line-height: 1.2;
    }

    .f-b {
      font-size: 7.5pt;
      line-height: 1.35;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .f-b strong { font-weight: 700; }

    .f-k {
      color: #8250df;
      font-size: 6.5pt;
      margin-top: 1px;
      border-top: 0.5pt dashed #ddd;
      padding-top: 1px;
      line-height: 1.2;
    }

    /* KaTeX: compact, no overflow, no scroll */
    .katex { font-size: 0.82em !important; }
    .katex-display {
      margin: 1px 0 !important;
      text-align: left !important;
      overflow: visible !important;
    }
    .katex-display > .katex {
      text-align: left !important;
      white-space: normal !important;
    }
    /* Kill any KaTeX scroll containers */
    .katex-html { overflow: visible !important; }
    .katex .base { white-space: normal !important; }

    /* No scrollbars anywhere */
    * { overflow: visible !important; }
    body { overflow: visible !important; }

    @media print {
      body { padding: 4px; font-size: 7.5pt; }
      .f { border: 0.4pt solid #bbb; padding: 3px 5px; margin-bottom: 3px; }
      .f-t { font-size: 6pt; }
      .f-b { font-size: 7pt; }
      .katex { font-size: 0.78em !important; }
    }

    @page { margin: 8mm; }
  </style>
</head>
<body>
  <h1>${safeIcon} ${safeTitle} · Формулы</h1>
  <div class="subtitle">${escapeHtml(formulaSec.section || '')} · ${items.length} позиций</div>
  ${items.map((item, i) => `<div class="f">
<div class="f-t">${i + 1}. ${escapeHtml(item.title || '')}</div>
<div class="f-b">${formatFormulaContent(item)}</div>
</div>`).join('\n')}
</body>
</html>`;

      const win = window.open('', '_blank');
      if (!win) {
        alert('Разрешите всплывающие окна для генерации шпаргалки');
        return;
      }
      win.document.write(cheatHtml);
      win.document.close();

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
    html += item.formalText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\$\$/g, '$$')
      .replace(/\$/g, '$')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n- (.+)/g, '\n• $1')
      .replace(/\n/g, '<br>');
  }

  if (item.keyIdea) {
    html += `<div class="f-k">💡 ${escapeHtml(item.keyIdea)}</div>`;
  }

  return html;
}
