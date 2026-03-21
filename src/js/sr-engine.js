// Spaced Repetition Engine — SM-2 algorithm
// Pure logic module, no UI. Stores SR data in localStorage via progress.js prefix.

import { getPrefix } from './progress.js';

const SR_SUFFIX = '_sr';
const DEFAULT_EF = 2.5;
const MIN_EF = 1.3;
const MS_PER_DAY = 86400000;

// ── localStorage helpers ──

function srKey() { return getPrefix() + SR_SUFFIX; }

function loadAll() {
  try { return JSON.parse(localStorage.getItem(srKey()) || '{}'); }
  catch { return {}; }
}

function saveAll(data) {
  localStorage.setItem(srKey(), JSON.stringify(data));
}

// ── Card SR state ──

const DEFAULT_CARD = () => ({
  strength: 0,      // 0-5: current knowledge level
  interval: 0,      // days until next review
  ef: DEFAULT_EF,   // ease factor (SM-2 multiplier)
  reps: 0,          // consecutive correct reps
  lapses: 0,        // total fail count
  lastSeen: null,   // ISO timestamp
});

/**
 * Get SR data for a single card.
 * @param {string|number} cardId
 * @returns {object} SR state
 */
export function getCardSR(cardId) {
  const all = loadAll();
  return all[cardId] || DEFAULT_CARD();
}

/**
 * Update SR data after student self-assessment.
 * @param {string|number} cardId
 * @param {number} grade — 1 (fail), 3 (ok), 5 (easy)
 * @returns {object} updated SR state
 */
export function updateCardSR(cardId, grade) {
  const all = loadAll();
  const card = all[cardId] || DEFAULT_CARD();

  if (grade < 3) {
    // ── Fail: reset interval, keep lapses count ──
    card.interval = 1;
    card.reps = 0;
    card.lapses++;
    card.ef = Math.max(MIN_EF, card.ef - 0.2);
  } else {
    // ── Success: grow interval ──
    card.reps++;
    if (card.reps === 1) card.interval = 1;
    else if (card.reps === 2) card.interval = 3;
    else card.interval = Math.round(card.interval * card.ef);

    // SM-2 ease factor adjustment
    card.ef += 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02);
    card.ef = Math.max(MIN_EF, card.ef);
  }

  card.strength = Math.min(5, Math.max(0, grade));
  card.lastSeen = new Date().toISOString();

  all[cardId] = card;
  saveAll(all);
  return card;
}

// ── Due / new detection ──

/**
 * Check if a card is due for review.
 */
export function isDue(sr) {
  if (!sr.lastSeen) return false; // new cards aren't "due"
  const daysSince = (Date.now() - new Date(sr.lastSeen).getTime()) / MS_PER_DAY;
  return daysSince >= sr.interval;
}

/**
 * Check if a card is new (never seen).
 */
export function isNew(sr) {
  return !sr.lastSeen;
}

/**
 * Check if a card is "learned" (strong enough and not due).
 */
export function isLearned(sr) {
  return sr.lastSeen && sr.strength >= 4 && !isDue(sr);
}

// ── Session building ──

/**
 * Get cards grouped by SR status.
 * @param {Array} allCards — flat array of question objects (must have .id)
 * @returns {{ due: Array, new: Array, learned: Array, inProgress: Array }}
 */
export function categorize(allCards) {
  const due = [], newCards = [], learned = [], inProgress = [];
  for (const q of allCards) {
    const sr = getCardSR(q.id);
    if (isNew(sr)) newCards.push(q);
    else if (isDue(sr)) due.push(q);
    else if (isLearned(sr)) learned.push(q);
    else inProgress.push(q);
  }
  return { due, new: newCards, learned, inProgress };
}

/**
 * Build a flashcard session.
 * Priority: due cards first → new cards → in-progress.
 * @param {Array} allCards
 * @param {object} options — { mode: 'all'|'due'|'new', section: string|null, limit: number }
 * @returns {Array} ordered session cards
 */
export function buildSession(allCards, { mode = 'all', section = null, limit = 15 } = {}) {
  let pool = [...allCards];

  // Section filter
  if (section) {
    pool = pool.filter(q => q._section === section);
  }

  const { due, new: newCards, inProgress } = categorize(pool);
  let session;

  switch (mode) {
    case 'due':
      session = [...due];
      break;
    case 'new':
      session = [...newCards];
      break;
    default: // 'all'
      // Due first (most urgent), then new, then in-progress
      session = [...due, ...newCards, ...inProgress];
  }

  // Shuffle within priority groups for variety
  shuffle(session);

  // Apply limit
  if (limit && session.length > limit) {
    session = session.slice(0, limit);
  }

  return session;
}

// ── Statistics ──

/**
 * Get stats for a set of cards.
 * @param {Array} allCards
 * @returns {{ total, learned, due, new, inProgress }}
 */
export function getStats(allCards) {
  const cats = categorize(allCards);
  return {
    total: allCards.length,
    learned: cats.learned.length,
    due: cats.due.length,
    new: cats.new.length,
    inProgress: cats.inProgress.length,
  };
}

/**
 * Days until next review for a card. null if new.
 */
export function daysUntilReview(sr) {
  if (!sr.lastSeen) return null;
  const elapsed = (Date.now() - new Date(sr.lastSeen).getTime()) / MS_PER_DAY;
  return Math.max(0, Math.round(sr.interval - elapsed));
}

// ── Helpers ──

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
