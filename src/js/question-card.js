// Question card HTML builder
import { nl } from './text-utils.js';

/**
 * Build the full HTML for a question card (header + collapsible body).
 */
export function buildQuestionCard(q) {
  const isTask = String(q.id).includes('Задача');
  const proofLabel = isTask ? 'Идея' : 'Доказательство';
  const exampleLabel = isTask ? 'Решение' : 'Пример';

  return `
    <div class="tp-header ${isTask ? 'tp-header-task' : ''}" onclick="this.parentElement.classList.toggle('open');window.__renderMath?.(this.parentElement)">
      <div class="tp-num" data-id="${q.id}" ondblclick="window.__toggleLearn('${q.id}',event)">${q.id}</div>
      <div class="tp-header-text">
        <div class="tp-title">${q.title}</div>
        <div class="tp-subtitle">${q.type}</div>
      </div>
      <span class="tp-chevron">▼</span>
    </div>
    <div class="tp-body">
      ${buildQuestionBody(q, proofLabel, exampleLabel)}
    </div>`;
}

/**
 * Build just the body content (used in both card view and quiz/flashcard views).
 */
export function buildQuestionBody(q, proofLabel, exampleLabel) {
  if (!proofLabel) {
    const isTask = String(q.id).includes('Задача');
    proofLabel = isTask ? 'Идея' : 'Доказательство';
    exampleLabel = isTask ? 'Решение' : 'Пример';
  }

  // --- Practice mode: strong solution hiding ---
  if (q.practiceMode) {
    return buildPracticeModeBody(q, proofLabel, exampleLabel);
  }

  // --- Theory mode: standard rendering ---
  const proofContent = buildProofContent(q);
  const proofTitle = q.proofTitle || proofLabel;

  return `
    ${q.tldr ? `<div class="card-tldr">${q.tldr}</div>` : ''}
    ${q.intuition ? `<p class="card-intuition">${nl(q.intuition)}</p>` : ''}
    ${q.analogy ? `<p class="card-analogy">${q.analogy}</p>` : ''}
    ${q.visual ? `<div class="visual-block">${q.visual}${q.visualLabel ? `<div class="visual-label">${q.visualLabel}</div>` : ''}</div>` : ''}
    <div class="card-formal">
      <div class="card-formal-text">${nl(q.formalText || q.statement || '')}</div>
      ${q.conditions ? '<ul class="card-cond">' + q.conditions.map(c => '<li>' + c + '</li>').join('') + '</ul>' : ''}
      ${q.formula ? `<div class="math-box">$$${q.formula}$$</div>` : ''}
    </div>
    ${proofContent ? `
      <div class="proof-toggle" onclick="this.classList.toggle('open');window.__renderMath?.(this.closest('.theorem-page') || this.closest('.quiz-card'))">
        <span class="proof-toggle-icon">${proofTitle.includes('📐') ? '' : '📐'}</span> ${proofTitle} <span class="adv-chevron">▸</span>
      </div>
      <div class="proof-body">
        ${q.keyIdea ? `<div class="proof-key-idea">🔑 ${nl(q.keyIdea)}</div>` : ''}
        ${proofContent}
      </div>` : ''}
    ${q.example ? `
      <div class="example-toggle" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('show')">
        <span class="example-toggle-icon">${(q.example.title || exampleLabel).includes('📝') ? '' : '📝'}</span> ${q.example.title || exampleLabel} <span class="adv-chevron">▸</span>
      </div>
      <div class="example-body">
        <div class="card-example-text">${nl(typeof q.example === 'string' ? q.example : q.example.text)}</div>
        ${q.example?.math ? `<div class="math-box">${q.example.math}</div>` : ''}
      </div>` : ''}
    ${q.examSay ? `<p class="card-exam-say">🎓 <em>${nl(q.examSay)}</em></p>` : ''}
    ${q.note ? `<p class="card-note">💡 ${nl(q.note)}</p>` : ''}
    ${q.advanced ? `
      <div class="adv-toggle" onclick="this.classList.toggle('open');window.__renderMath?.(this.closest('.theorem-page'))">
        <span class="adv-toggle-icon">🎓</span> Строгая формулировка <span class="adv-chevron">▸</span>
      </div>
      <div class="adv-body"><div class="advanced-block"><p>${nl(q.advanced)}</p>
        ${q.advancedProof ? `<div class="adv-proof"><strong>${proofLabel}.</strong> ${nl(q.advancedProof)}</div>` : ''}
      </div></div>` : ''}`;
}

/**
 * Build body for practice-mode cards: only formalText visible, rest hidden.
 */
function buildPracticeModeBody(q, proofLabel, exampleLabel) {
  const isAlgorithm = q.type === 'Алгоритм' || q.type === 'Справочник' || q.type === 'Метод';
  
  // Algorithm/reference cards in practice bundles are shown fully (they ARE the theory reference)
  if (isAlgorithm) {
    const proofContent = buildProofContent(q);
    return `
      ${q.tldr ? `<div class="card-tldr">${q.tldr}</div>` : ''}
      ${q.intuition ? `<p class="card-intuition">${nl(q.intuition)}</p>` : ''}
      <div class="card-formal">
        <div class="card-formal-text">${nl(q.formalText || '')}</div>
        ${q.conditions ? '<ul class="card-cond">' + q.conditions.map(c => '<li>' + c + '</li>').join('') + '</ul>' : ''}
        ${q.formula ? `<div class="math-box">$$${q.formula}$$</div>` : ''}
      </div>
      ${q.keyIdea ? `<div class="proof-key-idea">🔑 ${nl(q.keyIdea)}</div>` : ''}
      ${proofContent || ''}
      ${q.example ? `
        <div class="example-toggle" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('show')">
          <span class="example-toggle-icon">📝</span> ${q.example.title || 'Пример'} <span class="adv-chevron">▸</span>
        </div>
        <div class="example-body">
          <div class="card-example-text">${nl(typeof q.example === 'string' ? q.example : q.example.text)}</div>
          ${q.example?.math ? `<div class="math-box">${q.example.math}</div>` : ''}
        </div>` : ''}
      ${q.note ? `<p class="card-note">💡 ${nl(q.note)}</p>` : ''}`;
  }

  // Task cards: only formalText visible, rest behind solution-reveal
  const hasSolution = q.tldr || q.keyIdea || q.steps?.length || q.proof || q.formula || q.example || q.examSay || q.note;
  const proofContent = buildProofContent(q);

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
        ${q.tldr ? `<div class="card-tldr">${q.tldr}</div>` : ''}
        ${q.keyIdea ? `<div class="proof-key-idea">🔑 ${nl(q.keyIdea)}</div>` : ''}
        ${proofContent || ''}
        ${q.formula ? `<div class="solution-answer"><span class="solution-answer-label">Ответ:</span> <div class="math-box">$$${q.formula}$$</div></div>` : ''}
        ${q.example ? `
          <div class="card-example-text">${nl(typeof q.example === 'string' ? q.example : q.example.text)}</div>
          ${q.example?.math ? `<div class="math-box">${q.example.math}</div>` : ''}` : ''}
        ${q.examSay ? `<p class="card-exam-say">🎓 <em>${nl(q.examSay)}</em></p>` : ''}
        ${q.note ? `<p class="card-note">💡 ${nl(q.note)}</p>` : ''}
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
