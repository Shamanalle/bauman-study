// Cheatsheet: generate a printable formula sheet
// Strategy: pre-render KaTeX in main page, extract ALL styles, inject into print window

import { renderMath } from './math-utils.js';

export function initCheatsheet(meta, sections) {
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

      // 1. Create hidden container in main page to pre-render KaTeX
      const tmp = document.createElement('div');
      tmp.style.cssText = 'position:absolute;top:-9999px;left:0;width:900px;font-size:10pt;visibility:hidden;';
      document.body.appendChild(tmp);

      const safeTitle = esc(meta.title || '');
      const safeIcon = esc(meta.icon || '');
      const secTitle = esc(formulaSec.section || '');

      // Build formula HTML
      tmp.innerHTML = items.map((item, i) => {
        let body = '';
        if (item.formalText) {
          body = item.formalText
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n- (.+)/g, '\n• $1')
            .replace(/\n/g, '<br>');
        }
        const ki = item.keyIdea
          ? `<div class="cs-ki">💡 ${esc(item.keyIdea)}</div>`
          : '';
        return `<div class="cs-f"><div class="cs-t">${i + 1}. ${esc(item.title || '')}</div><div class="cs-b">${body}</div>${ki}</div>`;
      }).join('');

      // 2. Render KaTeX using the main page's renderer (fonts are loaded here)
      renderMath(tmp);

      // 3. Wait for rendering, then extract
      requestAnimationFrame(() => {
        setTimeout(() => {
          const renderedCards = tmp.innerHTML;
          tmp.remove();

          // 4. Collect ALL stylesheets from the main page (includes KaTeX CSS)
          const allStyles = collectStyles();

          const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<title>${safeTitle} · Шпаргалка</title>
<style>
${allStyles}

/* === Cheatsheet layout === */
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: "Inter", -apple-system, sans-serif;
  font-size: 10pt; line-height: 1.45;
  padding: 12px 16px;
  column-count: 2; column-gap: 16px;
  color: #111; background: #fff;
}
h1 { font-size: 14pt; text-align: center; margin-bottom: 4px; column-span: all; font-weight: 800; }
.cs-sub { text-align: center; color: #666; font-size: 8pt; margin-bottom: 12px; column-span: all; }
.cs-f {
  break-inside: avoid; page-break-inside: avoid;
  border: 1px solid #d0d7de; border-radius: 6px;
  padding: 6px 8px; margin-bottom: 6px;
}
.cs-t {
  font-size: 7.5pt; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.03em; color: #1a7f37; margin-bottom: 2px;
}
.cs-b { font-size: 9pt; line-height: 1.45; }
.cs-b strong { font-weight: 700; }
.cs-ki {
  color: #8250df; font-size: 7.5pt; margin-top: 3px;
  border-top: 1px dashed #d8dee4; padding-top: 2px;
}
/* KaTeX sizing for cheatsheet */
.katex { font-size: 1em !important; }
.katex-display { margin: 3px 0 !important; }

@media print {
  body { padding: 8px 12px; font-size: 9pt; }
  .cs-f { border-color: #ccc; padding: 5px 7px; margin-bottom: 5px; }
  .cs-t { font-size: 7pt; }
  .cs-b { font-size: 8.5pt; }
}
@page { margin: 8mm; }
</style>
</head>
<body>
<h1>${safeIcon} ${safeTitle} · Формулы</h1>
<div class="cs-sub">${secTitle} · ${items.length} позиций</div>
${renderedCards}
</body>
</html>`;

          const win = window.open('', '_blank');
          if (!win) {
            alert('Разрешите всплывающие окна для генерации шпаргалки');
            return;
          }
          win.document.write(html);
          win.document.close();

          win.addEventListener('load', () => {
            setTimeout(() => win.print(), 600);
          });
        }, 300);
      });
    }
  };
}

/**
 * Extract all stylesheets from the current page (including KaTeX) as inline CSS text.
 * This ensures the print window has all styling without needing CDN access.
 */
function collectStyles() {
  const parts = [];

  for (const sheet of document.styleSheets) {
    try {
      // Only collect KaTeX styles (from CDN)
      if (sheet.href && sheet.href.includes('katex')) {
        const rules = [];
        for (const rule of sheet.cssRules) {
          rules.push(rule.cssText);
        }
        parts.push(`/* KaTeX inline */\n${rules.join('\n')}`);
      }
    } catch {
      // CORS — can't read cross-origin sheets, fallback to link
      if (sheet.href && sheet.href.includes('katex')) {
        // We'll add the link tag instead
        parts.push(`@import url("${sheet.href}");`);
      }
    }
  }

  return parts.join('\n');
}

function esc(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
