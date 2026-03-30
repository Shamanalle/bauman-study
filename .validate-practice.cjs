// Запусти: node /tmp/validate-practice.js <путь к папке бандла>
// Пример: node /tmp/validate-practice.js src/data/differential-equations/kr-1/

const fs = require('fs');
const path = require('path');

const BASE = process.argv[2] || 'src/data/<subject>/<assessment>/';
if (BASE.includes('<')) { console.log('Укажи путь: node validate-practice.js src/data/differential-equations/kr-1/'); process.exit(1); }

const files = fs.readdirSync(BASE).filter(f => f.endsWith('.json') && !['meta.json','index.json'].includes(f));
const issues = [];

function check(cond, file, id, msg) { if (!cond) issues.push({ file, id, msg }); }

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(BASE, file), 'utf8'));
  const isTask = file.includes('задач');
  const isTicket = file.includes('билет');

  for (const q of (data.questions || [])) {
    const steps = q.steps || [];

    // === Структурные проверки ===
    if (isTask) {
      check(q.hint, file, q.id, 'Нет hint');
      check(q.tldr, file, q.id, 'Нет tldr');
      check(q.tldr !== 'Анализ' && q.tldr !== 'Шаг 1:', file, q.id, `tldr бесполезный: "${q.tldr}"`);
      check(steps.length >= 3, file, q.id, `Мало шагов: ${steps.length}`);

      // Проверка type
      const parts = (q.type || '').split('·').map(s => s.trim());
      check(parts.length >= 2, file, q.id, `type без темы: "${q.type}"`);
    }

    // === Проверка шагов ===
    const titles = steps.map(s => s.title);
    const uniqueTitles = new Set(titles);
    check(uniqueTitles.size === titles.length, file, q.id,
      `Дубли title шагов: ${titles.filter((t,i) => titles.indexOf(t) !== i).join(', ')}`);

    // Последний step должен иметь boxed
    if (steps.length > 0) {
      const lastMath = steps[steps.length - 1].math || '';
      check(lastMath.includes('\\boxed{'), file, q.id, 'Нет \\boxed{} в последнем шаге');
      check(lastMath.startsWith('$$') && lastMath.endsWith('$$'), file, q.id, 'math не обёрнут в $$');
    }

    // === LaTeX проверки ===
    for (const s of steps) {
      const text = s.text || '';
      // Unicode math в text (α, β, ∫, √, ², ₁)
      if (/[αβγδεζηθλμντπρσφχψωΑΒΓΔ∫√∑∏∞≠≈≤≥±∂∇²³¹⁰₀₁₂₃]/.test(text)) {
        check(false, file, q.id, `Unicode math в step "${s.title}"`);
      }
      // Незакрытые $
      const dollars = (text.match(/(?<!\$)\$(?!\$)/g) || []).length;
      check(dollars % 2 === 0, file, q.id, `Незакрытые $ в step "${s.title}" (${dollars})`);

      // Запрещённые фразы
      const banned = ['стандартным методом', 'аналогично', 'по формуле из лекций',
                       'вычисляется стандартно', 'несколько раз по частям',
                       'решается стандартно', 'далее стандартно'];
      for (const phrase of banned) {
        check(!text.toLowerCase().includes(phrase), file, q.id,
          `Запрещённая фраза "${phrase}" в step "${s.title}"`);
      }

      // Заглушки в math
      if (s.math) {
        check(!s.math.includes('\\text{Сводится'), file, q.id, `Заглушка в math: ${s.math.slice(0, 50)}`);
        check(!s.math.includes('\\text{Решение'), file, q.id, `Заглушка в math: ${s.math.slice(0, 50)}`);
        check(!s.math.includes('\\text{Вычисляется'), file, q.id, `Заглушка в math: ${s.math.slice(0, 50)}`);
      }
    }

    // === Билеты: каждый step должен иметь math ===
    if (isTicket) {
      for (const s of steps) {
        check(s.math, file, q.id, `Билет: step "${s.title}" без math`);
        if (s.math) check(s.math.includes('\\boxed{'), file, q.id, `Билет: step "${s.title}" без \\boxed{}`);
      }
    }

    // === Проверка дублирования текста между шагами ===
    for (let i = 0; i < steps.length - 1; i++) {
      for (let j = i + 1; j < steps.length; j++) {
        const t1 = (steps[i].text || '').slice(0, 80);
        const t2 = (steps[j].text || '').slice(0, 80);
        if (t1.length > 30 && t1 === t2) {
          check(false, file, q.id, `Дубль текста: step "${steps[i].title}" = step "${steps[j].title}"`);
        }
      }
    }
  }
}

// === Вывод ===
if (issues.length === 0) {
  console.log('✅ ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ! 0 ошибок.');
} else {
  console.log(`❌ НАЙДЕНО ${issues.length} ОШИБОК:\n`);
  for (const i of issues) {
    console.log(`  [${i.id}] ${i.file}: ${i.msg}`);
  }
  console.log(`\n⚠️ ИСПРАВЬ ВСЕ ОШИБКИ ПЕРЕД СБОРКОЙ!`);
}
