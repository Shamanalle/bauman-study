/**
 * subjects-config.js — Single source of truth for all subject/assessment definitions.
 *
 * Used by:
 *   - app.js (platform page, routing)
 *   - data-loader.js (exported for external consumers)
 *   - global-search.js (subject map)
 *   - scripts/build-bundles.js (bundle generation)
 *   - scripts/build-platform.js (platform generation)
 *
 * Each assessment entry supports these fields:
 *   - name        (string)  Display name
 *   - assessment  (string)  Folder name in /data/subject/assessment/
 *   - type        (string)  'exam' | 'midterm' | 'kr' | 'zachet' | 'textbook' | 'labs'
 *   - icon        (string)  Emoji icon
 *   - href        (string)  Optional override URL (for textbook/labs links)
 *   - bundleName  (string)  Output filename for build-bundles.js
 *   - skipBundle  (bool)    If true, build-platform.js won't inline bundle data
 */

export const SUBJECTS = [
  {
    id: 'physics',
    title: 'Физика',
    subtitle: 'Механика, термодинамика, волны',
    icon: '⚛️',
    theme: 'physics',
    assessments: [
      { name: 'Экзамен · Теория',  assessment: 'exam',              type: 'exam',     icon: '📋', bundleName: 'Физика_Экзамен' },
      { name: 'Экзамен · Практика', assessment: 'exam-practice',     type: 'kr',       icon: '✏️', bundleName: 'Физика_Экзамен_Практика' },
      { name: 'РК-1 · Теория',     assessment: 'midterm-1',         type: 'midterm',  icon: '📝', bundleName: 'Физика_РК-1' },
      { name: 'РК-1 · Практика',   assessment: 'midterm-1-practice', type: 'kr',       icon: '✏️', bundleName: 'Физика_РК-1_Практика' },
      { name: 'РК-2 · Теория',     assessment: 'midterm-2',         type: 'midterm',  icon: '📝', bundleName: 'Физика_РК-2' },
      { name: 'РК-2 · Практика',   assessment: 'midterm-2-practice', type: 'kr',       icon: '✏️', bundleName: 'Физика_РК-2_Практика' },
      { name: 'Учебное пособие',    assessment: null,                type: 'textbook', icon: '📖', href: '?subject=physics&type=textbook', skipBundle: true },
    ],
  },
  {
    id: 'differential-equations',
    title: 'Интегралы и ДУ',
    subtitle: 'Определённые интегралы, несобственные интегралы, ОДУ',
    icon: '∫',
    theme: 'diffeq',
    assessments: [
      { name: 'Экзамен · Теория',      assessment: 'exam',              type: 'exam',     icon: '📋', bundleName: 'ИнтДУ_Экзамен' },
      { name: 'Экзамен · Практика',     assessment: 'exam-practice',     type: 'kr',       icon: '✏️', bundleName: 'ИнтДУ_Экзамен_Практика' },
      { name: 'РК-1 · Теория',         assessment: 'midterm-1',         type: 'midterm',  icon: '📝', bundleName: 'ИнтДУ_РК-1' },
      { name: 'РК-1 · Практика',       assessment: 'midterm-1-practice', type: 'kr',       icon: '✏️', bundleName: 'ИнтДУ_РК-1_Практика' },
      { name: 'РК-2 · Теория',         assessment: 'midterm-2',         type: 'midterm',  icon: '📝', bundleName: 'ИнтДУ_РК-2' },
      { name: 'РК-2 · Практика',       assessment: 'midterm-2-practice', type: 'kr',       icon: '✏️', bundleName: 'ИнтДУ_РК-2_Практика' },
      { name: 'КР-1 · Интегрирование', assessment: 'kr-1',              type: 'kr',       icon: '✏️', bundleName: 'ИнтДУ_КР-1' },
      { name: 'КР-2 · ДУ 1-го порядка', assessment: 'kr-2',             type: 'kr',       icon: '✏️', bundleName: 'ИнтДУ_КР-2' },
      { name: 'КР-2 · Практика',       assessment: 'kr-2-practice',     type: 'kr',       icon: '✏️', bundleName: 'ИнтДУ_КР-2_Практика' },
      { name: 'Учебное пособие',        assessment: null,                type: 'textbook', icon: '📖', href: '?subject=differential-equations&type=textbook', skipBundle: true },
    ],
  },
  {
    id: 'linear-algebra',
    title: 'Линейная алгебра и ФНП',
    subtitle: 'Пространства, операторы, квадратичные формы, ФНП',
    icon: '📐',
    theme: 'linalg',
    assessments: [
      { name: 'РК-1 · Теория',    assessment: 'midterm-1',          type: 'midterm',  icon: '📝', bundleName: 'ЛинАлг_РК-1' },
      { name: 'РК-1 · Практика',  assessment: 'midterm-1-practice', type: 'kr',       icon: '✏️', bundleName: 'ЛинАлг_РК-1_Практика' },
      { name: 'РК-2 · Теория',    assessment: 'midterm-2',          type: 'midterm',  icon: '📝', bundleName: 'ЛинАлг_РК-2' },
      { name: 'РК-2 · Практика',  assessment: 'midterm-2-practice', type: 'kr',       icon: '✏️', bundleName: 'ЛинАлг_РК-2_Практика' },
      { name: 'КР · Теория',      assessment: 'kr-1',               type: 'kr',       icon: '✏️', bundleName: 'ЛинАлг_КР-1' },
      { name: 'КР · Практика',    assessment: 'kr-1-practice',      type: 'kr',       icon: '✏️', bundleName: 'ЛинАлг_КР-1_Практика' },
      { name: 'Экзамен · Практика', assessment: 'exam-practice',    type: 'kr',       icon: '✏️', bundleName: 'ЛинАлг_Экзамен_Практика' },
      { name: 'Учебное пособие',   assessment: null,                type: 'textbook', icon: '📖', href: '?subject=linear-algebra&type=textbook', skipBundle: true },
    ],
  },
  {
    id: 'algorithmic-languages',
    title: 'Алгоритмические языки',
    subtitle: 'C++: ООП, шаблоны, исключения, многопоточность',
    icon: '💻',
    theme: 'alglang',
    assessments: [
      { name: 'Экзамен · Теория',  assessment: 'exam',          type: 'exam', icon: '📋', bundleName: 'АЯ_Экзамен' },
      { name: 'Экзамен · Практика', assessment: 'exam-practice', type: 'kr',   icon: '✏️', bundleName: 'АЯ_Экзамен_Практика' },
      { name: 'Лабораторные',       assessment: null,            type: 'labs', icon: '💻', href: '?subject=algorithmic-languages&type=labs', skipBundle: true },
      { name: 'Учебное пособие',    assessment: null,            type: 'textbook', icon: '📖', href: '?subject=algorithmic-languages&type=textbook', skipBundle: true },
    ],
  },
  {
    id: 'programming-technologies',
    title: 'Технологии и методы программирования',
    subtitle: 'Git: контроль версий, ветвление, GitHub',
    icon: '🔀',
    theme: 'progtech',
    assessments: [
      { name: 'Учебное пособие', assessment: null, type: 'textbook', icon: '📖', href: '?subject=programming-technologies&type=textbook', skipBundle: true },
      { name: 'Лабораторные',    assessment: null, type: 'labs',     icon: '🔬', href: '?subject=programming-technologies&type=labs', skipBundle: true },
    ],
  },
  {
    id: 'math-cs-foundations',
    title: 'Мат. основы информатики',
    subtitle: 'Булевы функции, нормальные формы, теорема Поста',
    icon: '🔢',
    theme: 'moi',
    assessments: [
      { name: 'КР-1 · Практика', assessment: 'kr-1',   type: 'kr',       icon: '✏️', bundleName: 'МОИ_КР-1' },
      { name: 'Зачёт',           assessment: 'zachet',  type: 'zachet',   icon: '✅', bundleName: 'МОИ_Зачёт' },
      { name: 'Учебное пособие', assessment: null,      type: 'textbook', icon: '📖', href: '?subject=math-cs-foundations&type=textbook', skipBundle: true },
    ],
  },
];

/**
 * Build a { subjectId → { title, icon } } map for global search.
 */
export function getSubjectMap() {
  const map = {};
  for (const s of SUBJECTS) {
    map[s.id] = { title: s.title, icon: s.icon };
  }
  return map;
}

/**
 * Get assessments that have actual data (assessment != null, not skipBundle).
 * Used by build-bundles.js
 */
export function getBundleableAssessments() {
  return SUBJECTS.map(s => ({
    ...s,
    assessments: s.assessments.filter(a => a.assessment && a.bundleName),
  })).filter(s => s.assessments.length > 0);
}
