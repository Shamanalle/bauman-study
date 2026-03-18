#!/usr/bin/env node
// Запусти: node /tmp/validate-game.js <путь к папке проекта>
// Пример: node /tmp/validate-game.js src/game/

const fs = require('fs');
const path = require('path');

const BASE = process.argv[2];
if (!BASE) {
  console.log('Укажи путь: node validate-game.js <путь к папке проекта>');
  process.exit(1);
}

// Рекурсивно собираем все .js, .ts, .html, .css файлы
function walkDir(dir, ext = ['.js', '.ts', '.jsx', '.tsx', '.html', '.css']) {
  let results = [];
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const full = path.join(dir, item);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        if (['node_modules', '.git', 'dist', 'build', '.cache'].includes(item)) continue;
        results = results.concat(walkDir(full, ext));
      } else if (ext.some(e => item.endsWith(e))) {
        results.push(full);
      }
    }
  } catch (e) { /* skip */ }
  return results;
}

const files = walkDir(BASE);
const issues = [];

function check(cond, file, line, rule, msg) {
  if (!cond) issues.push({ file: path.relative(BASE, file), line, rule, msg });
}

const jsFiles = files.filter(f => /\.(js|ts|jsx|tsx)$/.test(f));
const cssFiles = files.filter(f => f.endsWith('.css'));
const htmlFiles = files.filter(f => f.endsWith('.html'));

for (const file of jsFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const relFile = path.relative(BASE, file);

  // === Правило: Нет TODO/FIXME/HACK ===
  lines.forEach((line, i) => {
    if (/\/\/\s*(TODO|FIXME|HACK|XXX)\b/i.test(line)) {
      check(false, file, i + 1, 'NO_TODO',
        `Найден TODO/FIXME/HACK: "${line.trim().slice(0, 80)}"`);
    }
  });

  // === Правило: Нет var ===
  lines.forEach((line, i) => {
    // Исключаем комментарии и строки
    const stripped = line.replace(/\/\/.*$/, '').replace(/'[^']*'/g, '').replace(/"[^"]*"/g, '');
    if (/\bvar\s+\w/.test(stripped)) {
      check(false, file, i + 1, 'NO_VAR',
        `Используется var: "${line.trim().slice(0, 80)}"`);
    }
  });

  // === Правило: Нет setInterval для game loop ===
  lines.forEach((line, i) => {
    if (/setInterval\s*\(/.test(line) && /update|gameLoop|tick|render|draw|animate/i.test(line)) {
      check(false, file, i + 1, 'NO_SETINTERVAL_GAMELOOP',
        `setInterval для game loop — используй requestAnimationFrame`);
    }
  });

  // === Правило: Нет alert/prompt/confirm ===
  lines.forEach((line, i) => {
    const stripped = line.replace(/\/\/.*$/, '');
    if (/\b(alert|prompt|confirm)\s*\(/.test(stripped)) {
      check(false, file, i + 1, 'NO_ALERT',
        `Используется alert/prompt/confirm — замени на in-game UI`);
    }
  });

  // === Правило: Файл не слишком большой ===
  if (lines.length > 500) {
    check(false, file, lines.length, 'FILE_SIZE',
      `Файл слишком большой: ${lines.length} строк (макс 500). Разбей на модули.`);
  }

  // === Правило: Магические числа (эвристика) ===
  // Ищем числа > 10 в контексте, похожем на движение/размер/скорость
  lines.forEach((line, i) => {
    const stripped = line.replace(/\/\/.*$/, '').replace(/'[^']*'/g, '').replace(/"[^"]*"/g, '');
    // Пропускаем конфиг-файлы, определения констант, массивы цветов
    if (/const\s+CONFIG|SETTINGS|DEFAULTS|export|import|require|\.length|Array|Math\.|rgba?\(|hsl/.test(stripped)) return;
    // Ищем сомнительные числа в контексте движения/позиции
    const match = stripped.match(/(speed|velocity|gravity|jump|force|width|height|size|gap|spawn|interval)\s*[=+\-*\/]\s*(\d{2,})/i);
    if (match && !stripped.includes('CONFIG') && !stripped.includes('CONST') && !stripped.includes('const ')) {
      check(false, file, i + 1, 'MAGIC_NUMBER',
        `Возможно магическое число: "${line.trim().slice(0, 80)}" — вынеси в CONFIG`);
    }
  });

  // === Правило: Есть delta-time ===
  // Если файл содержит update/tick метод, dt должен использоваться
  if (/\b(update|tick)\s*\(\s*\)/.test(content) && 
      (content.includes('this.x') || content.includes('this.y') || content.includes('position'))) {
    // update() без параметра dt — подозрительно
    const hasUpdateWithoutDt = /\b(update|tick)\s*\(\s*\)\s*{/.test(content);
    if (hasUpdateWithoutDt) {
      check(false, file, 0, 'NO_DELTA_TIME',
        `update()/tick() без параметра dt — движение будет fps-зависимым`);
    }
  }

  // === Правило: requestAnimationFrame существует где-то ===
  // (проверяем наличие хотя бы в одном файле — будет проверено после цикла)

  // === Правило: Error handling для AudioContext ===
  if (content.includes('AudioContext') && !content.includes('try') && !content.includes('catch')) {
    check(false, file, 0, 'AUDIO_NO_TRY_CATCH',
      `AudioContext без try/catch — может крашнуться на iOS/Safari`);
  }

  // === Правило: localStorage без try/catch ===
  if (content.includes('localStorage') && !content.includes('try') && !content.includes('catch')) {
    check(false, file, 0, 'LOCALSTORAGE_NO_TRY_CATCH',
      `localStorage без try/catch — приватный режим/квота может вызвать ошибку`);
  }

  // === Правило: event listener cleanup ===
  const addListenerCount = (content.match(/addEventListener/g) || []).length;
  const removeListenerCount = (content.match(/removeEventListener/g) || []).length;
  if (addListenerCount > 0 && removeListenerCount === 0 && 
      !content.includes('destroy') && !content.includes('cleanup') && !content.includes('dispose')) {
    check(false, file, 0, 'NO_EVENT_CLEANUP',
      `${addListenerCount} addEventListener без removeEventListener — возможна утечка памяти`);
  }

  // === Правило: console.log в продакшн коде (предупреждение) ===
  const consoleLogs = lines.filter(l => /console\.(log|warn|error|debug)\(/.test(l) && !/\/\//.test(l.split('console')[0]));
  if (consoleLogs.length > 5) {
    check(false, file, 0, 'EXCESS_CONSOLE',
      `${consoleLogs.length} вызовов console.log — убери лишние перед release`);
  }
}

// === Глобальная проверка: requestAnimationFrame ===
const allJsContent = jsFiles.map(f => fs.readFileSync(f, 'utf8')).join('\n');
if (jsFiles.length > 0 && !allJsContent.includes('requestAnimationFrame')) {
  check(false, jsFiles[0], 0, 'NO_RAF',
    `Нигде не используется requestAnimationFrame — game loop должен быть на RAF`);
}

// === Глобальная проверка: Наличие Config ===
const hasConfig = jsFiles.some(f => {
  const c = fs.readFileSync(f, 'utf8');
  return /CONFIG|Config|SETTINGS|GameConfig/i.test(c) && /(export|module\.exports)/.test(c);
});
if (jsFiles.length > 3 && !hasConfig) {
  check(false, jsFiles[0], 0, 'NO_CONFIG',
    `Нет файла конфигурации (Config.js) — магические числа должны быть централизованы`);
}

// === Глобальная проверка: State Machine ===
const hasStateMachine = allJsContent.includes('state') && 
  (allJsContent.includes('MENU') || allJsContent.includes('PLAYING') || 
   allJsContent.includes('GAME_OVER') || allJsContent.includes('switch'));
if (jsFiles.length > 2 && !hasStateMachine) {
  check(false, jsFiles[0], 0, 'NO_STATE_MACHINE',
    `Нет state machine — игра должна иметь состояния (MENU, PLAYING, PAUSED, GAME_OVER)`);
}

// === Вывод ===
console.log('\n🎮 GAME DEVELOPMENT VALIDATOR\n');
console.log(`Проверено файлов: ${files.length} (JS: ${jsFiles.length}, CSS: ${cssFiles.length}, HTML: ${htmlFiles.length})\n`);

if (issues.length === 0) {
  console.log('✅ ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ! 0 ошибок.\n');
  console.log('Следующий шаг: запусти audit-game.js для оценки качества.');
} else {
  // Группируем по правилу
  const byRule = {};
  for (const i of issues) {
    (byRule[i.rule] ??= []).push(i);
  }

  console.log(`❌ НАЙДЕНО ${issues.length} ПРОБЛЕМ:\n`);
  
  for (const [rule, items] of Object.entries(byRule)) {
    console.log(`\n  📌 ${rule} (${items.length}):`);
    for (const i of items) {
      const loc = i.line > 0 ? `:${i.line}` : '';
      console.log(`     ${i.file}${loc}: ${i.msg}`);
    }
  }

  console.log(`\n⚠️ ИСПРАВЬ ВСЕ ПРОБЛЕМЫ ПЕРЕД ПЕРЕХОДОМ К СЛЕДУЮЩЕЙ ФАЗЕ!`);
}

process.exit(issues.length > 0 ? 1 : 0);
