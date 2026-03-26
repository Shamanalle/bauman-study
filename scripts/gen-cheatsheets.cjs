/**
 * Cheatsheet Generator: reads formula JSONs and generates static printable HTML files.
 * Usage: node scripts/gen-cheatsheets.js
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const OUT_DIR = path.join(__dirname, '..', 'src', 'public', 'cheatsheets');

// Config: which formula files to use per cheatsheet
const CHEATSHEETS = [
  {
    id: 'physics-rk1',
    title: 'Физика · РК-1',
    icon: '⚛️',
    subtitle: 'Механика: кинематика, динамика, энергия, импульс, колебания',
    sources: ['physics/midterm-1-practice/section-00-формулы.json'],
  },
  {
    id: 'physics-rk2',
    title: 'Физика · РК-2',
    icon: '⚛️',
    subtitle: 'Термодинамика, молекулярная физика, СТО',
    sources: ['physics/midterm-2-practice/section-00-формулы.json'],
  },
  {
    id: 'physics-exam',
    title: 'Физика · Экзамен',
    icon: '⚛️',
    subtitle: 'Полный курс: механика + термодинамика',
    sources: ['physics/exam-practice/section-00-формулы.json'],
  },
  {
    id: 'diffeq-rk1',
    title: 'Интегралы и ДУ · РК-1',
    icon: '∫',
    subtitle: 'Определённые интегралы, методы интегрирования',
    sources: ['differential-equations/midterm-1-practice/section-00-формулы.json'],
  },
  {
    id: 'diffeq-rk2',
    title: 'Интегралы и ДУ · РК-2',
    icon: '∫',
    subtitle: 'Несобственные интегралы, ОДУ',
    sources: ['differential-equations/midterm-2-practice/section-00-формулы.json'],
  },
  {
    id: 'diffeq-exam',
    title: 'Интегралы и ДУ · Экзамен',
    icon: '∫',
    subtitle: 'Полный курс: интегралы + ОДУ',
    sources: ['differential-equations/exam-practice/section-00-формулы.json'],
  },
  {
    id: 'linalg-rk1',
    title: 'ЛинАлг и ФНП · РК-1',
    icon: '📐',
    subtitle: 'Пространства, базисы, операторы',
    sources: ['linear-algebra/midterm-1-practice/section-00-формулы.json'],
  },
  {
    id: 'linalg-rk2',
    title: 'ЛинАлг и ФНП · РК-2',
    icon: '📐',
    subtitle: 'ФНП, экстремумы, касательные плоскости',
    sources: ['linear-algebra/midterm-2-practice/section-00-формулы.json'],
  },
  {
    id: 'linalg-exam',
    title: 'ЛинАлг и ФНП · Экзамен',
    icon: '📐',
    subtitle: 'Полный курс: ЛА + ФНП',
    sources: ['linear-algebra/exam-practice/section-00-формулы.json'],
  },
  {
    id: 'alglang-exam',
    title: 'Алг. языки · Экзамен',
    icon: '💻',
    subtitle: 'Синтаксис C++, STL, ООП',
    sources: ['algorithmic-languages/exam-practice/section-00-формулы.json'],
  },
];

function esc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatBody(item) {
  let html = '';
  if (item.formalText) {
    html = item.formalText
      // Convert display math $$ to inline $ for compactness
      .replace(/\$\$(.*?)\$\$/g, '$$$1$$')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      // Bullet lists
      .replace(/\n- /g, '\n• ')
      // Remove empty lines (double newlines)
      .replace(/\n\n+/g, '\n')
      // Tables: convert markdown tables to compact HTML
      .replace(/\|(.+)\|\n\|[-|]+\|\n([\s\S]*?)(?=\n[^|]|$)/g, (match, header, body) => {
        const ths = header.split('|').filter(Boolean).map(h => `<th>${h.trim()}</th>`).join('');
        const rows = body.trim().split('\n').map(row => {
          const tds = row.split('|').filter(Boolean).map(d => `<td>${d.trim()}</td>`).join('');
          return `<tr>${tds}</tr>`;
        }).join('');
        return `<table><tr>${ths}</tr>${rows}</table>`;
      })
      // Newlines to <br>
      .replace(/\n/g, '<br>');
  }
  if (item.keyIdea) {
    html += `<div class="ki">💡 ${esc(item.keyIdea)}</div>`;
  }
  return html;
}

function generateHTML(config, items) {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(config.title)} · Шпаргалка</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
  crossorigin="anonymous">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"
  crossorigin="anonymous"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"
  crossorigin="anonymous"
  onload="renderMathInElement(document.body,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],throwOnError:false})"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{
  font-family:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  font-size:8pt;line-height:1.25;
  padding:6px 8px;
  column-count:2;column-gap:10px;
  color:#1a1a1a;background:#fff;
}
h1{font-size:10pt;text-align:center;margin-bottom:1px;column-span:all;font-weight:800;letter-spacing:-0.02em}
.sub{text-align:center;color:#57606a;font-size:6.5pt;margin-bottom:6px;column-span:all}
.f{
  break-inside:avoid;page-break-inside:avoid;
  border:0.5pt solid #ccc;border-radius:3px;
  padding:2px 4px;margin-bottom:3px;
}
.t{
  font-size:6pt;font-weight:700;text-transform:uppercase;
  letter-spacing:0.02em;color:#1a7f37;margin-bottom:1px;line-height:1.1;
}
.b{font-size:7.5pt;line-height:1.2}
.b b{font-weight:700}
.ki{
  color:#8250df;font-size:6pt;margin-top:1px;
  border-top:0.5pt dashed #d8dee4;padding-top:1px;line-height:1.1;
}
.katex{font-size:0.88em!important}
.katex-display{margin:0!important;padding:0!important}
table{border-collapse:collapse;font-size:7pt;margin:2px 0;width:100%}
th,td{border:0.5pt solid #ccc;padding:1px 3px;text-align:left}
th{background:#f6f8fa;font-weight:600}
@media print{
  body{padding:4px 6px;font-size:7pt}
  .f{border-color:#bbb;padding:2px 3px;margin-bottom:2px}
  .t{font-size:5.5pt}.b{font-size:7pt}
  .katex{font-size:0.82em!important}
}
@page{margin:6mm}
</style>
</head>
<body>
<h1>${config.icon} ${esc(config.title)} · Формулы</h1>
<div class="sub">${esc(config.subtitle)} · ${items.length} позиций</div>
${items.map((item, i) => `<div class="f">
<div class="t">${i + 1}. ${esc(item.title || '')}</div>
<div class="b">${formatBody(item)}</div>
</div>`).join('\n')}
</body>
</html>`;
}

// Main
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

let generated = 0;
for (const config of CHEATSHEETS) {
  let allItems = [];

  for (const src of config.sources) {
    const filePath = path.join(DATA_DIR, src);
    if (!fs.existsSync(filePath)) {
      console.warn(`  ⚠️ Не найден: ${src}`);
      continue;
    }
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const items = data.questions || data.cards || [];
    allItems.push(...items);
  }

  if (!allItems.length) {
    console.warn(`  ⚠️ Нет формул для ${config.id}`);
    continue;
  }

  const html = generateHTML(config, allItems);
  const outPath = path.join(OUT_DIR, `${config.id}.html`);
  fs.writeFileSync(outPath, html, 'utf-8');
  console.log(`  ✅ ${config.id}.html — ${allItems.length} формул`);
  generated++;
}

console.log(`\n✅ Сгенерировано ${generated} шпаргалок в ${OUT_DIR}`);
