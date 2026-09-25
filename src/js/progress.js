// Progress tracking: learned state, quiz strength, localStorage

const THEME_KEY = 'bauman_theme'; // Global dark/light theme

/** Get the localStorage prefix for the current assessment. */
let _prefix = 'app';
export function setPrefix(code) { _prefix = code; }
export function getPrefix() { return _prefix; }

// --- Dark/Light Theme (global, not per-assessment) ---

export function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark') document.body.classList.add('dark');
  updateThemeButton();
}

export function toggleTheme() {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  updateThemeButton();
}

function updateThemeButton() {
  const icon = document.body.classList.contains('dark') ? '☀️' : '🌙';
  ['darkToggle', 'darkToggle2', 'themeFab'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.textContent = icon;
  });
}

// --- Learned Questions ---

let learned = [];

export function loadLearned() {
  const raw = JSON.parse(localStorage.getItem(`${_prefix}_learned3`) || '[]');
  learned = raw.map(id => String(id));
  return learned;
}

export function getLearned() { return learned; }

export function saveLearned() {
  localStorage.setItem(`${_prefix}_learned3`, JSON.stringify(learned));
}

export function toggleLearnedItem(id) {
  const strId = String(id);
  const idx = learned.indexOf(strId);
  if (idx > -1) learned.splice(idx, 1);
  else learned.push(strId);
  saveLearned();
}

export function isLearned(id) {
  return learned.includes(String(id));
}

export function markLearned(id) {
  const strId = String(id);
  if (!learned.includes(strId)) {
    learned.push(strId);
    saveLearned();
  }
}

export function resetProgress() {
  if (!confirm('Сбросить весь прогресс? Все отметки «выучено» будут удалены.')) return;
  learned = [];
  saveLearned();
}

// --- Quiz Strength ---

let qStrength = {};

export function loadStrength() {
  qStrength = JSON.parse(localStorage.getItem(`${_prefix}_qstrength`) || '{}');
}

export function getStrength(id) {
  return qStrength[id] || { right: 0, wrong: 0, last: null };
}

export function setStrength(id, data) {
  qStrength[id] = data;
  localStorage.setItem(`${_prefix}_qstrength`, JSON.stringify(qStrength));
}

// --- Quiz History ---

export function getQuizHistory() {
  return JSON.parse(localStorage.getItem(`${_prefix}_quiz_hist`) || '[]');
}

export function saveQuizResult(result) {
  const hist = getQuizHistory();
  hist.push(result);
  if (hist.length > 20) hist.shift();
  localStorage.setItem(`${_prefix}_quiz_hist`, JSON.stringify(hist));
  return hist;
}

// --- Confetti Celebration ---

export function celebrate() {
  const c = document.createElement('div');
  c.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden';
  document.body.appendChild(c);

  for (let i = 0; i < 50; i++) {
    const p = document.createElement('div');
    p.textContent = ['🎉', '⭐', '✨', '🏆', '💯'][Math.floor(Math.random() * 5)];
    p.style.cssText = `position:absolute;font-size:${16 + Math.random() * 20}px;left:${Math.random() * 100}%;top:-30px;animation:confetti-fall ${2 + Math.random() * 2}s ease-out forwards;animation-delay:${Math.random() * 0.8}s`;
    c.appendChild(p);
  }

  if (!document.getElementById('confetti-style')) {
    const s = document.createElement('style');
    s.id = 'confetti-style';
    s.textContent = `@keyframes confetti-fall{to{top:110%;transform:rotate(${Math.random() * 720}deg)}}`;
    document.head.appendChild(s);
  }

  setTimeout(() => c.remove(), 4000);
}

// --- Overall Platform Progress ---

export function getOverallProgress() {
  let totalLearned = 0;
  const subjectLearned = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.endsWith('_learned3')) {
        const arr = JSON.parse(localStorage.getItem(key) || '[]');
        const count = Array.isArray(arr) ? arr.length : 0;
        totalLearned += count;
        const prefix = key.replace('_learned3', '');
        let subId = null;
        if (prefix.startsWith('ph')) subId = 'physics';
        else if (prefix.startsWith('id')) subId = 'differential-equations';
        else if (prefix.startsWith('la')) subId = 'linear-algebra';
        else if (prefix.startsWith('al') || prefix.startsWith('ay')) subId = 'algorithmic-languages';
        else if (prefix.startsWith('timp') || prefix.startsWith('pt')) subId = 'programming-technologies';
        else if (prefix.startsWith('moi')) subId = 'math-cs-foundations';
        if (subId) {
          subjectLearned[subId] = (subjectLearned[subId] || 0) + count;
        }
      }
    }
  } catch (e) {
    console.warn('Error reading progress:', e);
  }
  return { totalLearned, subjectLearned };
}
