// Сохрани как /tmp/validate-theory.js
// Запусти: node /tmp/validate-theory.js <путь к папке бандла>
// Пример: node /tmp/validate-theory.js src/data/physics/midterm-1/

const fs = require('fs');
const path = require('path');

const BASE = process.argv[2] || 'src/data/<subject>/<assessment>/';
if (BASE.includes('<')) { console.log('Укажи путь: node validate-theory.js src/data/physics/midterm-1/'); process.exit(1); }

const files = fs.readdirSync(BASE).filter(f => f.startsWith('section-') && f.endsWith('.json'));
const issues = [];

function check(cond, file, id, msg) { if (!cond) issues.push({ file, id, msg }); }

// Разрешённые типы
const ALLOWED_TYPES = ['Определение', 'Теорема', 'Формулировка', 'Закон', 'Понятие', 'Формула + вывод'];

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(BASE, file), 'utf8'));
  let prevId = 0;

  for (const q of (data.questions || [])) {
    const needsSteps = q.type === 'Теорема' || q.type === 'Формула + вывод'
      || (q.type || '').toLowerCase().includes('теорема')
      || (q.type || '').toLowerCase().includes('вывод');
    const steps = q.steps || [];

    // === Обязательные поля ===
    check(q.title, file, q.id, 'Нет title');
    check(q.type, file, q.id, 'Нет type');
    check(q.formalText, file, q.id, 'Нет formalText');
    check(q.insight, file, q.id, 'Нет insight');

    // === type из разрешённого списка ===
    if (q.type) {
      check(ALLOWED_TYPES.includes(q.type), file, q.id, `Неразрешённый type: "${q.type}". Допустимые: ${ALLOWED_TYPES.join(', ')}`);
    }

    // === ID последовательные ===
    check(q.id === prevId + 1, file, q.id, `ID не последовательный: ожидали ${prevId + 1}, получили ${q.id}`);
    prevId = q.id;

    // === insight содержательный ===
    if (q.insight) {
      check(q.insight.length > 20, file, q.id, `insight слишком короткий: ${q.insight.length} символов`);
      const badInsights = ['это важно', 'важное определение', 'применяется в', 'часто встречается'];
      for (const bad of badInsights) {
        check(!q.insight.toLowerCase().includes(bad), file, q.id, `insight содержит заглушку: "${bad}"`);
      }
    }

    // === Теоремы: steps обязательны ===
    if (needsSteps) {
      check(steps.length >= 3, file, q.id, `Теорема/Вывод: мало шагов доказательства: ${steps.length} (нужно ≥3)`);
      check(q.example, file, q.id, 'Теорема/Вывод без example');
    }

    // === HTML-теги запрещены ===
    const allText = [q.formalText, q.insight, q.note].filter(Boolean).join(' ');
    const htmlTags = allText.match(/<(strong|em|br|ol|li|ul|p|div|span)\b/gi);
    if (htmlTags) {
      check(false, file, q.id, `HTML-теги запрещены: ${htmlTags.join(', ')}`);
    }

    // === Unicode math ===
    if (/[αβγδεζηθλμντπρσφχψωΑΒΓΔ∫√∑∏∞≠≈≤≥±∂∇²³¹⁰₀₁₂₃]/.test(allText)) {
      check(false, file, q.id, 'Unicode math в тексте (используй KaTeX)');
    }

    // === Уникальность title шагов ===
    if (steps.length > 0) {
      const titles = steps.map(s => typeof s === 'string' ? s.slice(0, 30) : s.title);
      const uniqueTitles = new Set(titles);
      check(uniqueTitles.size === titles.length, file, q.id,
        `Дубли title шагов: ${titles.filter((t,i) => titles.indexOf(t) !== i).join(', ')}`);
    }

    // === formula без $$ ===
    if (q.formula) {
      check(!q.formula.startsWith('$$'), file, q.id, 'formula начинается с $$ (не нужно)');
      check(!q.formula.endsWith('$$'), file, q.id, 'formula заканчивается на $$ (не нужно)');
    }

    // === Запрещённые фразы ===
    const banned = ['очевидно, что', 'нетрудно показать', 'легко видеть'];
    for (const phrase of banned) {
      check(!allText.toLowerCase().includes(phrase), file, q.id,
        `Запрещённая фраза: "${phrase}"`);
    }

    // === Проверка LaTeX скобок ===
    const dollars = (allText.match(/(?<!\$)\$(?!\$)/g) || []).length;
    check(dollars % 2 === 0, file, q.id, `Незакрытые $ (нечётное: ${dollars})`);

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

    // === Устаревшие поля (предупреждения) ===
    if (q.tldr) check(false, file, q.id, 'Устаревшее поле "tldr" — используй "insight"');
    if (q.intuition) check(false, file, q.id, 'Устаревшее поле "intuition" — используй "insight"');
    if (q.keyIdea) check(false, file, q.id, 'Устаревшее поле "keyIdea" — используй "insight"');
    if (q.examSay) check(false, file, q.id, 'Устаревшее поле "examSay" — используй "note"');
    if (q.proof && !q.steps?.length) check(false, file, q.id, 'Устаревшее поле "proof" — используй "steps"');
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
