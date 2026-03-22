// Practice Engine — pure logic module for practice sessions
// No UI. Handles: topic extraction, session building, progress tracking, exam generation.

import { getPrefix } from './progress.js';

const PRAC_SUFFIX = '_prac';

// ── Difficulty classification ──
export const DIFFICULTY = { ALL: 'all', MAIN: 'main', EXTRA: 'extra' };

/**
 * Classify a section as 'main' or 'extra' based on its section name.
 * "✏️ Задачи" and "🎫 Билеты" → main (exam-level)
 * "🎯 Доп. задачи" → extra (simpler/supplementary)
 */
export function classifySection(section) {
  if (!section || !section.section) return DIFFICULTY.MAIN;
  const name = section.section.toLowerCase();
  if (name.includes('доп')) return DIFFICULTY.EXTRA;
  return DIFFICULTY.MAIN;
}

// ── localStorage helpers ──

function pracKey() { return getPrefix() + PRAC_SUFFIX; }

function loadResults() {
  try { return JSON.parse(localStorage.getItem(pracKey()) || '{}'); }
  catch { return {}; }
}

function saveResults(data) {
  localStorage.setItem(pracKey(), JSON.stringify(data));
}

function sessionsKey() { return getPrefix() + PRAC_SUFFIX + '_sessions'; }

function loadSessions() {
  try { return JSON.parse(localStorage.getItem(sessionsKey()) || '[]'); }
  catch { return []; }
}

function saveSessions(data) {
  localStorage.setItem(sessionsKey(), JSON.stringify(data));
}

// ── Topic extraction ──

/**
 * Extract topic name from a question's `type` field.
 * Type format examples:
 *   "Задача · Кинематика"         → "Кинематика"
 *   "Задача · 3 б. · Площадь"    → "Площадь"
 *   "Билет · СТО"                 → "СТО"
 *   undefined                     → "Без темы"
 */
export function extractTopic(type) {
  if (!type) return 'Без темы';
  const parts = type.split('·').map(s => s.trim());
  // Last meaningful part is the topic
  return parts[parts.length - 1] || 'Без темы';
}

/**
 * Get all unique topics from questions with counts.
 * @param {Array} questions — flat array of practice questions
 * @returns {Array<{ topic: string, count: number }>}
 */
export function extractTopics(questions) {
  const map = {};
  for (const q of questions) {
    const topic = extractTopic(q.type);
    map[topic] = (map[topic] || 0) + 1;
  }
  return Object.entries(map)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count);
}

// ── Progress tracking ──

/**
 * Get result for a single question.
 * @returns {{ understood: boolean|null, attempts: number, lastSeen: string|null }}
 */
export function getQuestionResult(questionId) {
  const all = loadResults();
  return all[questionId] || { understood: null, attempts: 0, lastSeen: null };
}

/**
 * Record self-assessment result for a question.
 * @param {string} questionId
 * @param {boolean} understood
 */
export function recordResult(questionId, understood) {
  const all = loadResults();
  const prev = all[questionId] || { understood: null, attempts: 0, lastSeen: null };
  all[questionId] = {
    understood,
    attempts: prev.attempts + 1,
    lastSeen: new Date().toISOString(),
  };
  saveResults(all);
}

/**
 * Get per-topic statistics.
 * @param {Array} questions
 * @returns {Array<{ topic, total, solved, understood, weak }>}
 */
export function getTopicStats(questions) {
  const topics = {};
  for (const q of questions) {
    const topic = extractTopic(q.type);
    if (!topics[topic]) topics[topic] = { topic, total: 0, solved: 0, understood: 0, weak: 0 };
    topics[topic].total++;
    const r = getQuestionResult(q.id);
    if (r.lastSeen) {
      topics[topic].solved++;
      if (r.understood) topics[topic].understood++;
      else topics[topic].weak++;
    }
  }
  return Object.values(topics).sort((a, b) => b.total - a.total);
}

/**
 * Get overall stats for a set of questions.
 * @param {Array} questions
 * @returns {{ total, solved, understood, weak, fresh }}
 */
export function getOverallStats(questions) {
  let solved = 0, understood = 0, weak = 0;
  for (const q of questions) {
    const r = getQuestionResult(q.id);
    if (r.lastSeen) {
      solved++;
      if (r.understood) understood++;
      else weak++;
    }
  }
  return {
    total: questions.length,
    solved,
    understood,
    weak,
    fresh: questions.length - solved,
  };
}

// ── Session building ──

/**
 * Build a training session.
 * @param {Array} questions — full question pool
 * @param {{ topic?: string, limit?: number, mode?: 'all'|'weak'|'fresh' }} options
 * @returns {Array} selected questions for the session
 */
export function buildTrainingSession(questions, { topic = null, limit = 8, mode = 'all' } = {}) {
  let pool = [...questions];

  // Filter by topic
  if (topic && topic !== 'all') {
    pool = pool.filter(q => extractTopic(q.type) === topic);
  }

  // Filter by mode
  if (mode === 'weak') {
    pool = pool.filter(q => {
      const r = getQuestionResult(q.id);
      return r.lastSeen && !r.understood;
    });
  } else if (mode === 'fresh') {
    pool = pool.filter(q => !getQuestionResult(q.id).lastSeen);
  }

  // Shuffle
  shuffle(pool);

  // Limit
  if (limit && pool.length > limit) {
    pool = pool.slice(0, limit);
  }

  return pool;
}

/**
 * Build an exam ticket from problem/ticket sections.
 * @param {Array} sections — all sections of the practice bundle
 * @param {number} count — number of tasks in the ticket
 * @returns {Array} selected questions
 */
export function buildExamTicket(sections, count = 5, { difficulty = DIFFICULTY.MAIN } = {}) {
  // Collect questions from problem sections (✏️) only
  const pool = [];
  for (const sec of sections) {
    if (sec.icon === '✏️') {
      const diff = classifySection(sec);
      // Filter by difficulty
      if (difficulty !== DIFFICULTY.ALL && diff !== difficulty) continue;
      for (const q of sec.questions) {
        pool.push({ ...q, _section: sec.section, _difficulty: diff });
      }
    }
  }

  shuffle(pool);

  // Try to get diverse topics
  const topics = [...new Set(pool.map(q => extractTopic(q.type)))];
  const selected = [];
  const usedTopics = new Set();

  // First pass: one from each topic
  for (const topic of topics) {
    if (selected.length >= count) break;
    const candidate = pool.find(q => extractTopic(q.type) === topic && !selected.includes(q));
    if (candidate) {
      selected.push(candidate);
      usedTopics.add(topic);
    }
  }

  // Fill remaining from shuffled pool
  for (const q of pool) {
    if (selected.length >= count) break;
    if (!selected.includes(q)) selected.push(q);
  }

  return selected;
}

/**
 * Get real tickets from section-04 (🎫 sections).
 * @param {Array} sections
 * @returns {Array} ticket objects (each has .questions array of tasks)
 */
export function getRealTickets(sections) {
  const ticketSections = sections.filter(s => s.icon === '🎫');
  // Each question in a ticket section IS a ticket with nested tasks
  const tickets = [];
  for (const sec of ticketSections) {
    for (const q of sec.questions) {
      tickets.push(q);
    }
  }
  return tickets;
}

/**
 * Save a completed session.
 */
export function saveSession({ mode, score, total, duration, topics }) {
  const sessions = loadSessions();
  sessions.push({
    date: new Date().toISOString(),
    mode,
    score,
    total,
    duration,
    topics,
  });
  // Keep last 50 sessions
  if (sessions.length > 50) sessions.splice(0, sessions.length - 50);
  saveSessions(sessions);
}

/**
 * Get session history.
 */
export function getSessionHistory() {
  return loadSessions();
}

// ── Helpers ──

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
