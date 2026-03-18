#!/usr/bin/env node
// Запусти: node /tmp/audit-game.js <путь к папке проекта>
// Пример: node /tmp/audit-game.js src/game/
//
// Аудит оценивает 5 столпов качества игры (1-10).
// Минимальный балл для release: 7/10 по каждому столпу.

const fs = require('fs');
const path = require('path');

const BASE = process.argv[2];
if (!BASE) {
  console.log('Укажи путь: node audit-game.js <путь к папке проекта>');
  process.exit(1);
}

function walkDir(dir, ext = ['.js', '.ts', '.jsx', '.tsx']) {
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

const jsFiles = walkDir(BASE);
const allContent = jsFiles.map(f => fs.readFileSync(f, 'utf8')).join('\n');
const allCSS = walkDir(BASE, ['.css']).map(f => fs.readFileSync(f, 'utf8')).join('\n');
const allHTML = walkDir(BASE, ['.html']).map(f => fs.readFileSync(f, 'utf8')).join('\n');

// === Столп 1: Game Feel (🎮) ===
function auditGameFeel() {
  const checks = [];

  // requestAnimationFrame
  checks.push({
    name: 'requestAnimationFrame',
    pass: allContent.includes('requestAnimationFrame'),
    weight: 2
  });

  // Delta-time
  checks.push({
    name: 'Delta-time в update',
    pass: /update\s*\(\s*(dt|delta|deltaTime|elapsed)/i.test(allContent),
    weight: 2
  });

  // Input handling
  checks.push({
    name: 'Input handling (keyboard/mouse/touch)',
    pass: allContent.includes('keydown') || allContent.includes('keyup') || 
          allContent.includes('pointerdown') || allContent.includes('mousedown') ||
          allContent.includes('touchstart'),
    weight: 2
  });

  // State machine
  checks.push({
    name: 'State machine',
    pass: /state\s*[=:]\s*['"`](MENU|PLAYING|GAME_OVER|menu|playing|gameOver)/i.test(allContent) ||
          /switch\s*\(\s*this\.state\s*\)/.test(allContent) ||
          /GameState/i.test(allContent),
    weight: 1
  });

  // Collision detection
  checks.push({
    name: 'Collision detection',
    pass: /collision|intersect|hitbox|overlap|AABB|checkHit|checkCollision/i.test(allContent),
    weight: 1
  });

  // Coyote time / input buffering (бонус)
  checks.push({
    name: 'Coyote time / Input buffering',
    pass: /coyote|buffer|graceTime|lateJump/i.test(allContent),
    weight: 1
  });

  // Easing functions
  checks.push({
    name: 'Easing/tween functions',
    pass: /ease|tween|lerp|smoothstep|cubicBezier/i.test(allContent),
    weight: 1
  });

  return score(checks, 'Game Feel');
}

// === Столп 2: Progression (📈) ===
function auditProgression() {
  const checks = [];

  // Difficulty scaling
  checks.push({
    name: 'Difficulty scaling',
    pass: /difficulty|speed.*incr|level|wave|stage/i.test(allContent),
    weight: 2
  });

  // Score system
  checks.push({
    name: 'Score system',
    pass: /score|points/i.test(allContent),
    weight: 2
  });

  // Multiple entity types
  const entityTypes = new Set();
  const entityMatches = allContent.match(/class\s+\w*(Enemy|Obstacle|Item|PowerUp|Boss|Projectile|Bullet|Coin|Hazard)\w*/gi);
  if (entityMatches) entityMatches.forEach(m => entityTypes.add(m));
  checks.push({
    name: 'Multiple entity types (≥2)',
    pass: entityTypes.size >= 2 || /type\s*[=:]\s*['"`]\w+/i.test(allContent),
    weight: 1
  });

  // Power-ups
  checks.push({
    name: 'Power-up system',
    pass: /powerUp|power_up|buff|shield|magnet|slowMotion|boost|invincib/i.test(allContent),
    weight: 1
  });

  // S-curve / exponential difficulty
  checks.push({
    name: 'Non-linear difficulty (S-curve/exp)',
    pass: /Math\.exp|Math\.log|Math\.pow|sigmoid|\*\*|exponential|curve/i.test(allContent) &&
          /speed|difficulty|spawn/i.test(allContent),
    weight: 1
  });

  // Combo system
  checks.push({
    name: 'Combo/multiplier system',
    pass: /combo|multiplier|streak/i.test(allContent),
    weight: 1
  });

  return score(checks, 'Progression');
}

// === Столп 3: Visual Polish (💎) ===
function auditVisual() {
  const checks = [];

  // Gradients (not flat colors)
  checks.push({
    name: 'Gradients used',
    pass: /createLinearGradient|createRadialGradient|linear-gradient|radial-gradient/i.test(allContent + allCSS),
    weight: 1
  });

  // Animations / transitions
  checks.push({
    name: 'CSS transitions or animations',
    pass: /transition|@keyframes|animation/i.test(allCSS + allHTML),
    weight: 1
  });

  // Canvas sprite drawing (not just fillRect)
  checks.push({
    name: 'Custom sprites (not just fillRect)',
    pass: /drawImage|ellipse|arc\(|bezierCurveTo|quadraticCurveTo|beginPath/i.test(allContent),
    weight: 2
  });

  // Particles
  checks.push({
    name: 'Particle system',
    pass: /particle|Particle|emitter|explosion/i.test(allContent),
    weight: 2
  });

  // Google Fonts or custom fonts
  checks.push({
    name: 'Custom fonts',
    pass: /fonts\.googleapis|font-face|@import.*font|fontFamily|font-family.*['"]\w/i.test(allContent + allCSS + allHTML),
    weight: 1
  });

  // Glassmorphism / blur effects
  checks.push({
    name: 'Glassmorphism / blur',
    pass: /backdrop-filter|blur\(|glass|frosted/i.test(allCSS + allContent + allHTML),
    weight: 1
  });

  // Parallax
  checks.push({
    name: 'Parallax background',
    pass: /parallax|layer|backgroundSpeed|bgLayer|scrollSpeed/i.test(allContent),
    weight: 1
  });

  // Screen shake
  checks.push({
    name: 'Screen shake',
    pass: /shake|screenShake|camShake/i.test(allContent),
    weight: 1
  });

  return score(checks, 'Visual Polish');
}

// === Столп 4: Audio Feedback (🔊) ===
function auditAudio() {
  const checks = [];

  // AudioContext
  checks.push({
    name: 'Web Audio API (AudioContext)',
    pass: /AudioContext|webkitAudioContext/i.test(allContent),
    weight: 2
  });

  // Multiple sound types
  const soundNames = allContent.match(/(play|sound)\w*\s*\(?\s*['"`]?\w*(jump|score|death|hit|click|coin|powerup|explosion|menu)/gi) || [];
  checks.push({
    name: 'Multiple sound types (≥3)',
    pass: soundNames.length >= 3 || /jump.*score|score.*death|death.*click/is.test(allContent),
    weight: 2
  });

  // Audio error handling
  checks.push({
    name: 'Audio error handling (try/catch)',
    pass: allContent.includes('AudioContext') ? 
          (allContent.includes('try') && allContent.includes('catch') && allContent.includes('Audio')) :
          true,
    weight: 1
  });

  // Volume control
  checks.push({
    name: 'Volume control',
    pass: /volume|gain\.gain|mute|masterVolume/i.test(allContent),
    weight: 1
  });

  // Procedural sound generation (oscillator)
  checks.push({
    name: 'Procedural sound (OscillatorNode)',
    pass: /createOscillator|OscillatorNode|createBufferSource/i.test(allContent),
    weight: 2
  });

  return score(checks, 'Audio Feedback');
}

// === Столп 5: Meta Systems (🏆) ===
function auditMeta() {
  const checks = [];

  // High score persistence
  checks.push({
    name: 'High score + localStorage',
    pass: /highScore|high_score|bestScore/i.test(allContent) && /localStorage/i.test(allContent),
    weight: 2
  });

  // Achievements
  checks.push({
    name: 'Achievement system',
    pass: /achievement|ACHIEVEMENTS|unlock/i.test(allContent),
    weight: 2
  });

  // Game over screen
  checks.push({
    name: 'Game Over screen',
    pass: /gameOver|game.over|GAME_OVER|gameOverScreen/i.test(allContent + allHTML),
    weight: 2
  });

  // Restart mechanism
  checks.push({
    name: 'Restart / retry',
    pass: /restart|retry|playAgain|newGame|resetGame/i.test(allContent),
    weight: 1
  });

  // Settings / preferences
  checks.push({
    name: 'Settings (volume/controls)',
    pass: /settings|preferences|options.*menu|volume.*slider|toggleSound/i.test(allContent),
    weight: 1
  });

  // Pause
  checks.push({
    name: 'Pause functionality',
    pass: /pause|PAUSED|isPaused|togglePause/i.test(allContent),
    weight: 1
  });

  return score(checks, 'Meta Systems');
}

function score(checks, name) {
  let totalWeight = 0;
  let earnedWeight = 0;
  const details = [];

  for (const c of checks) {
    totalWeight += c.weight;
    if (c.pass) earnedWeight += c.weight;
    details.push({
      name: c.name,
      pass: c.pass,
      weight: c.weight
    });
  }

  const raw = totalWeight > 0 ? (earnedWeight / totalWeight) * 10 : 0;
  const finalScore = Math.round(raw * 10) / 10;

  return { name, score: finalScore, details, rawEarned: earnedWeight, rawTotal: totalWeight };
}

// === Run Audit ===
console.log('\n🎮 GAME QUALITY AUDIT\n');
console.log(`Проект: ${BASE}`);
console.log(`Файлов: JS=${jsFiles.length}, CSS=${walkDir(BASE, ['.css']).length}, HTML=${walkDir(BASE, ['.html']).length}\n`);
console.log('═'.repeat(60));

const pillars = [
  auditGameFeel(),
  auditProgression(),
  auditVisual(),
  auditAudio(),
  auditMeta()
];

const icons = ['🎮', '📈', '💎', '🔊', '🏆'];
let allPass = true;

for (let i = 0; i < pillars.length; i++) {
  const p = pillars[i];
  const icon = icons[i];
  const bar = '█'.repeat(Math.round(p.score)) + '░'.repeat(10 - Math.round(p.score));
  const status = p.score >= 7 ? '✅' : '❌';
  
  console.log(`\n${icon} ${p.name}: ${p.score}/10 ${bar} ${status}`);
  
  for (const d of p.details) {
    const mark = d.pass ? '  ✓' : '  ✗';
    const weight = '●'.repeat(d.weight) + '○'.repeat(2 - d.weight);
    console.log(`${mark} ${weight} ${d.name}`);
  }

  if (p.score < 7) allPass = false;
}

// === Итог ===
const totalScore = pillars.reduce((sum, p) => sum + p.score, 0) / pillars.length;
console.log('\n' + '═'.repeat(60));
console.log(`\n📊 ОБЩИЙ БАЛЛ: ${totalScore.toFixed(1)}/10\n`);

if (allPass) {
  console.log('🎉 ВСЕ СТОЛПЫ ≥ 7/10 — ИГРА ГОТОВА К RELEASE!\n');
} else {
  const failing = pillars.filter(p => p.score < 7);
  console.log(`⚠️ ${failing.length} СТОЛП(ОВ) НИЖЕ ПОРОГА 7/10:\n`);
  for (const f of failing) {
    const missing = f.details.filter(d => !d.pass);
    console.log(`  ❌ ${f.name} (${f.score}/10) — не хватает:`);
    for (const m of missing) {
      console.log(`     → ${m.name}`);
    }
  }
  console.log(`\n⛔ ИСПРАВЬ ПЕРЕД RELEASE!\n`);
}

process.exit(allPass ? 0 : 1);
