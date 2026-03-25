// Cheatsheet: generate a printable formula sheet from section-00 formulas
// Triggered from practice-browser via a button

export function initCheatsheet(meta, sections) {
  // Find formulas section (section-00)
  const formulaSec = sections.find(s => {
    const items = s.questions || s.cards || [];
    return items.length > 0 && items[0]?.type?.toLowerCase().includes('формула');
  }) || sections[0];

  if (!formulaSec) return null;

  return {
    render() {
      const items = formulaSec.questions || formulaSec.cards || [];
      if (!items.length) return;

      // Build cheatsheet HTML
      const cheatHtml = `
        <!DOCTYPE html>
        <html lang="ru">
        <head>
          <meta charset="UTF-8">
          <title>${meta.title} · Шпаргалка</title>
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
            .katex-display { margin: 2px 0 !important; text-align: left !important; }
            @media print {
              body { padding: 6px; font-size: 8pt; }
              .formula { border: 0.5pt solid #ccc; padding: 4px 6px; margin-bottom: 4px; }
            }
            @page { margin: 10mm; }
          </style>
        </head>
        <body>
          <h1>${meta.icon} ${meta.title} · Формулы</h1>
          ${items.map((item, i) => `
            <div class="formula">
              <div class="formula-title">${i + 1}. ${item.title || ''}</div>
              <div class="formula-body">${formatFormulaContent(item)}</div>
            </div>
          `).join('')}
        </body>
        </html>
      `;

      // Open in new window for printing
      const win = window.open('', '_blank');
      win.document.write(cheatHtml);
      win.document.close();

      // Auto-trigger print after KaTeX loads
      win.addEventListener('load', () => {
        setTimeout(() => win.print(), 500);
      });
    }
  };
}

function formatFormulaContent(item) {
  let html = '';

  if (item.formalText) {
    html += item.formalText
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }

  if (item.keyIdea) {
    html += `<div style="color:#8250df;font-size:7pt;margin-top:2px;">💡 ${item.keyIdea}</div>`;
  }

  return html;
}
