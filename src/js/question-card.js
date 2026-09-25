// Question card HTML builder
import { nl } from './text-utils.js';

function escapeAttr(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function renderMathBox(formula) {
  if (!formula) return '';
  const cleanLatex = String(formula).trim().replace(/^\\?\[|\\?\]$/g, '').replace(/^\$\$|\$\$$/g, '').trim();
  const escaped = escapeAttr(cleanLatex);
  return `
    <div class="math-box-wrap" data-latex="${escaped}">
      <div class="math-box">$$${cleanLatex}$$</div>
      <button class="copy-latex-btn" title="Скопировать формулу LaTeX" onclick="window.__copyLatex(this, event)">
        <span class="cl-icon">📋</span> LaTeX
      </button>
    </div>
  `;
}

/**
 * Build the full HTML for a question card (header + collapsible body).
 */
export function buildQuestionCard(q) {
  const isTask = String(q.id).includes('Задача');
  const t = (q.type || '').toLowerCase();
  const proofLabel = isTask ? 'Идея'
    : t.includes('формула') || t.includes('вывод') ? 'Вывод'
    : 'Доказательство';
  const exampleLabel = isTask ? 'Решение' : 'Пример';

  return `
    <div class="tp-header ${isTask ? 'tp-header-task' : ''}" onclick="this.parentElement.classList.toggle('open');window.__renderMath?.(this.parentElement)">
      <div class="tp-num" data-id="${q.id}" title="Двойной клик = выучено" ondblclick="window.__toggleLearn('${q.id}',event)">${q.id}</div>
      <div class="tp-header-text">
        <div class="tp-title">${q.title}</div>
        <div class="tp-subtitle">${q.type}</div>
      </div>
      <button class="tp-learn-btn" data-id="${q.id}" title="Отметить как выученное" onclick="window.__toggleLearn('${q.id}',event)">
        <svg class="tp-learn-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </button>
      <span class="tp-chevron">▼</span>
    </div>
    <div class="tp-body">
      ${buildQuestionBody(q, proofLabel, exampleLabel)}
    </div>`;
}

/**
 * Build just the body content (used in both card view and quiz/flashcard views).
 *
 * Card layout (5-block structure):
 *   ① 📖 Definition    (formalText)  — always, labeled block
 *   ② Formula          (formula)     — optional, prominent math box after definition
 *   ③ 💡 Plain words   (insight)     — always, labeled block  [NEW: merges old tldr+intuition+keyIdea]
 *   ④ 📌 Note          (note)        — optional               [NEW: merges old examSay+note]
 *   ⑤ Proof / Example  (steps, example) — collapsible toggles
 *
 *   Legacy fields (tldr, intuition, keyIdea, examSay) are also supported for backward compatibility.
 */
export function buildQuestionBody(q, proofLabel, exampleLabel) {
  if (!proofLabel) {
    const isTask = String(q.id).includes('Задача');
    if (isTask) {
      proofLabel = 'Идея';
      exampleLabel = 'Решение';
    } else {
      const t = (q.type || '').toLowerCase();
      proofLabel = t.includes('формула') || t.includes('вывод') ? 'Вывод'
        : 'Доказательство';
      exampleLabel = 'Пример';
    }
  }

  // --- Practice mode: strong solution hiding ---
  if (q.practiceMode) {
    return buildPracticeModeBody(q, proofLabel, exampleLabel);
  }

  // --- Theory mode: 5-block structure ---
  const proofContent = buildProofContent(q);
  const proofTitle = q.proofTitle || proofLabel;

  // Resolve insight: new field or legacy fallback
  const insightText = q.insight || buildLegacyInsight(q);

  // Resolve note: new field or legacy fallback
  const noteText = q.note || q.examSay || '';

  // Determine label for the formal block based on type
  const formalLabel = getFormalLabel(q.type);

  return `
    <div class="card-formal">
      <div class="card-formal-label">${formalLabel}</div>
      <div class="card-formal-text">${nl(q.formalText || q.statement || '')}</div>
      ${q.conditions ? '<ul class="card-cond">' + q.conditions.map(c => '<li>' + c + '</li>').join('') + '</ul>' : ''}
    </div>
    ${q.formula ? renderMathBox(q.formula) : ''}
    ${q.visual ? `<div class="visual-block">${q.visual}${q.visualLabel ? `<div class="visual-label">${q.visualLabel}</div>` : ''}</div>` : ''}
    ${insightText ? `<div class="card-insight"><div class="card-insight-label">💡 Простыми словами</div><div class="card-insight-text">${nl(insightText)}</div></div>` : ''}
    ${noteText ? `<div class="card-note">📌 ${nl(noteText)}</div>` : ''}
    ${proofContent ? `
      <div class="proof-toggle" onclick="this.classList.toggle('open');window.__renderMath?.(this.closest('.theorem-page') || this.closest('.quiz-card') || this.closest('.fc-answer') || this.closest('.fc-card'))">
        <span class="proof-toggle-icon">📐</span> ${proofTitle} <span class="adv-chevron">▸</span>
      </div>
      <div class="proof-body">
        ${proofContent}
      </div>` : ''}
    ${q.example ? `
      <div class="example-toggle" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('show')">
        <span class="example-toggle-icon">${(q.example.title || exampleLabel).includes('📝') ? '' : '📝'}</span> ${q.example.title || exampleLabel} <span class="adv-chevron">▸</span>
      </div>
      <div class="example-body">
        <div class="card-example-text">${nl(typeof q.example === 'string' ? q.example : q.example.text)}</div>
        ${q.example?.math ? renderMathBox(q.example.math) : ''}
      </div>` : ''}
    ${q.advanced ? `
      <div class="adv-toggle" onclick="this.classList.toggle('open');window.__renderMath?.(this.closest('.theorem-page') || this.closest('.fc-answer') || this.closest('.fc-card'))">
        <span class="adv-toggle-icon">🎓</span> Строгая формулировка <span class="adv-chevron">▸</span>
      </div>
      <div class="adv-body"><div class="advanced-block"><div>${nl(q.advanced)}</div>
        ${q.advancedProof ? `<div class="adv-proof"><strong>${proofLabel}.</strong> ${nl(q.advancedProof)}</div>` : ''}
      </div></div>` : ''}`;
}

/**
 * Get the label for the formal text block based on card type.
 */
function getFormalLabel(type) {
  if (!type) return '📖 Формулировка';
  const t = type.toLowerCase();
  if (t.includes('определение')) return '📖 Определение';
  if (t.includes('теорема')) return '📖 Теорема';
  if (t.includes('закон')) return '📖 Закон';
  if (t.includes('формула')) return '📖 Формула';
  if (t.includes('понятие')) return '📖 Понятие';
  return '📖 Формулировка';
}

/**
 * Build legacy insight from old tldr + intuition + keyIdea fields.
 * Supports old card format for backward compatibility.
 */
function buildLegacyInsight(q) {
  const parts = [];
  // intuition is the most valuable legacy field (contains analogy)
  if (q.intuition) parts.push(q.intuition);
  // keyIdea adds the key takeaway if not already in intuition
  if (q.keyIdea && !q.intuition?.includes(q.keyIdea)) parts.push(q.keyIdea);
  // tldr only if nothing else (it's usually redundant)
  if (parts.length === 0 && q.tldr) parts.push(q.tldr);
  return parts.join(' ');
}

/**
 * Build body for practice-mode cards: only formalText visible, rest hidden.
 */
function buildPracticeModeBody(q, proofLabel, exampleLabel) {
  const isAlgorithm = q.type === 'Алгоритм' || q.type === 'Справочник' || q.type === 'Метод';
  
  // Algorithm/reference cards in practice bundles are shown fully
  if (isAlgorithm) {
    const proofContent = buildProofContent(q);
    const insightText = q.insight || buildLegacyInsight(q);
    return `
      ${insightText ? `<div class="card-insight"><div class="card-insight-label">💡 Простыми словами</div><div class="card-insight-text">${nl(insightText)}</div></div>` : ''}
      <div class="card-formal">
        <div class="card-formal-text">${nl(q.formalText || '')}</div>
        ${q.conditions ? '<ul class="card-cond">' + q.conditions.map(c => '<li>' + c + '</li>').join('') + '</ul>' : ''}
        ${q.formula ? renderMathBox(q.formula) : ''}
      </div>
      ${proofContent || ''}
      ${q.example ? `
        <div class="example-toggle" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('show')">
          <span class="example-toggle-icon">📝</span> ${q.example.title || 'Пример'} <span class="adv-chevron">▸</span>
        </div>
        <div class="example-body">
          <div class="card-example-text">${nl(typeof q.example === 'string' ? q.example : q.example.text)}</div>
          ${q.example?.math ? renderMathBox(q.example.math) : ''}
        </div>` : ''}
      ${q.note ? `<div class="card-note">📌 ${nl(q.note)}</div>` : ''}`;
  }

  // Task cards: only formalText visible, rest behind solution-reveal
  const hasSolution = q.insight || q.tldr || q.keyIdea || q.steps?.length || q.proof || q.formula || q.example || q.note || q.examSay;
  const proofContent = buildProofContent(q);
  const insightText = q.insight || buildLegacyInsight(q);

  return `
    <div class="card-formal practice-condition">
      <div class="card-formal-text">${nl(q.formalText || q.statement || '')}</div>
    </div>
    ${hasSolution ? `
      <div class="solution-reveal" onclick="this.classList.toggle('open');window.__renderMath?.(this.closest('.theorem-page'))">
        <span class="solution-reveal-icon">🔓</span>
        <span class="solution-reveal-text">Показать решение</span>
        <span class="solution-reveal-text-open">Скрыть решение</span>
        <span class="adv-chevron">▸</span>
      </div>
      <div class="solution-body">
        ${insightText ? `<div class="card-insight"><div class="card-insight-label">💡 Простыми словами</div><div class="card-insight-text">${nl(insightText)}</div></div>` : ''}
        ${proofContent || ''}
        ${q.formula ? `<div class="solution-answer"><span class="solution-answer-label">Ответ:</span> ${renderMathBox(q.formula)}</div>` : ''}
        ${q.example ? `
          <div class="card-example-text">${nl(typeof q.example === 'string' ? q.example : q.example.text)}</div>
          ${q.example?.math ? renderMathBox(q.example.math) : ''}` : ''}
        ${q.note || q.examSay ? `<div class="card-note">📌 ${nl(q.note || q.examSay)}</div>` : ''}
      </div>` : ''}`;
}

function buildProofContent(q) {
  if (q.steps?.length) {
    return '<div class="proof-steps">' + q.steps.map(s => {
      if (typeof s === 'string') {
        const m = s.match(/^\*\*([^*]+)\*\*:\s*(.*)$/);
        if (m) return `<div class="step"><div class="step-content"><div class="step-title">${m[1]}</div><div class="step-text">${nl(m[2])}</div></div></div>`;
        return `<div class="step"><div class="step-content"><div class="step-text">${nl(s)}</div></div></div>`;
      }
      return `<div class="step"><div class="step-content">
        <div class="step-title">${s.title}</div>
        <div class="step-text">${nl(s.text)}</div>
        ${s.math ? `<div class="step-math">${s.math}</div>` : ''}
        ${s.tip ? `<div class="step-tip">${s.tip}</div>` : ''}
      </div></div>`;
    }).join('') + '</div>';
  }
  if (q.proof) return `<div class="proof-text">${nl(q.proof)}</div>`;
  return '';
}
