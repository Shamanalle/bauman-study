// Data loader: dynamically loads assessment data from JSON files

/**
 * Load assessment data from URL parameters.
 * URL format: ?subject=physics&assessment=midterm-2
 * 
 * Returns { meta, sections, svgs } where:
 * - meta: { title, subtitle, icon, shortCode, bundleName }
 * - sections: [{ section, icon, questions: [...] }]
 * - svgs: { img_1: "<svg>...</svg>", ... }
 */
export async function loadAssessmentData() {
  const params = new URLSearchParams(window.location.search);
  const subject = params.get('subject') || 'physics';
  const assessment = params.get('assessment') || 'midterm-2';

  const basePath = `/data/${subject}/${assessment}`;

  // Load meta
  const metaResp = await fetch(`${basePath}/meta.json`);
  if (!metaResp.ok) {
    throw new Error(`Assessment not found: ${subject}/${assessment}`);
  }
  const meta = await metaResp.json();

  // Discover and load section files
  // Since we can't list directories in browser, we use a manifest approach:
  // Try loading sections sequentially until we get a 404
  const sections = [];
  const indexResp = await fetch(`${basePath}/index.json`);

  if (indexResp.ok) {
    // Use index if available
    const index = await indexResp.json();
    for (const file of index.sections) {
      const resp = await fetch(`${basePath}/${file}`);
      if (resp.ok) sections.push(await resp.json());
    }
  } else {
    // Fallback: try numbered sections
    for (let i = 1; i <= 20; i++) {
      const prefix = `section-${String(i).padStart(2, '0')}`;
      // Try to find matching file
      const resp = await fetch(`${basePath}/${prefix}.json`).catch(() => null);
      if (resp && resp.ok) {
        sections.push(await resp.json());
      } else {
        // Try with names by fetching the directory listing (won't work in browser)
        // We'll need to generate an index.json during migration
        break;
      }
    }
  }

  // Load SVGs
  const svgs = {};
  const svgBasePath = `/data/${subject}/svg`;
  // Process SVG references in questions + propagate practiceMode
  for (const section of sections) {
    for (const q of section.questions) {
      if (q.visual && typeof q.visual === 'string' && q.visual.startsWith('svg:')) {
        const svgName = q.visual.replace('svg:', '');
        if (!svgs[svgName]) {
          try {
            const svgResp = await fetch(`${svgBasePath}/${svgName}.svg`);
            if (svgResp.ok) svgs[svgName] = await svgResp.text();
          } catch { /* SVG not found, skip */ }
        }
        // Replace marker with actual SVG content
        q.visual = svgs[svgName] || null;
      }
      // Propagate practiceMode from meta to each question
      if (meta.practiceMode) {
        q.practiceMode = true;
      }
    }
  }

  return { meta, sections, svgs };
}

/**
 * Get a flat array of all questions across all sections.
 */
export function allQuestions(sections) {
  return sections.flatMap(s => s.questions);
}

/**
 * Get all available assessments for the platform landing page.
 */
export function getSubjectsConfig() {
  return [
    {
      id: 'physics', title: 'Физика', subtitle: 'Механика, термодинамика, волны',
      icon: '⚛️', theme: 'physics',
      assessments: [
        { name: 'Экзамен', assessment: 'exam', type: 'exam', icon: '📋' },
        { name: 'РК-1', assessment: 'midterm-1', type: 'midterm', icon: '📝' },
        { name: 'РК-2', assessment: 'midterm-2', type: 'midterm', icon: '📝' },
        { name: 'Учебное пособие', assessment: null, type: 'textbook', icon: '📖', href: '?subject=physics&type=textbook' },
      ],
    },
    {
      id: 'differential-equations', title: 'Интегралы и ДУ',
      subtitle: 'Определённые интегралы, несобственные интегралы, ОДУ',
      icon: '∫', theme: 'diffeq',
      assessments: [
        { name: 'Экзамен', assessment: 'exam', type: 'exam', icon: '📋' },
        { name: 'РК-1', assessment: 'midterm-1', type: 'midterm', icon: '📝' },
        { name: 'РК-2', assessment: 'midterm-2', type: 'midterm', icon: '📝' },
        { name: 'КР-1 · Интегрирование', assessment: 'kr-1', type: 'kr', icon: '✏️' },
        { name: 'КР-2 · ДУ 1-го порядка', assessment: 'kr-2', type: 'kr', icon: '✏️' },
        { name: 'Учебное пособие', assessment: null, type: 'textbook', icon: '📖', href: '?subject=differential-equations&type=textbook' },
      ],
    },
    {
      id: 'linear-algebra', title: 'Линейная алгебра и ФНП',
      subtitle: 'Пространства, операторы, квадратичные формы, ФНП',
      icon: '📐', theme: 'linalg',
      assessments: [
        { name: 'РК-1 · Линалг', assessment: 'midterm-1', type: 'midterm', icon: '📝' },
        { name: 'РК-2 · ФНП', assessment: 'midterm-2', type: 'midterm', icon: '📝' },
        { name: 'КР · Дифф. ФНП', assessment: 'kr-1', type: 'kr', icon: '✏️' },
        { name: 'Учебное пособие', assessment: null, type: 'textbook', icon: '📖', href: '?subject=linear-algebra&type=textbook' },
      ],
    },
    {
      id: 'algorithmic-languages', title: 'Алгоритмические языки',
      subtitle: 'C++: ООП, шаблоны, исключения, многопоточность',
      icon: '💻', theme: 'alglang',
      assessments: [
        { name: 'Экзамен', assessment: 'exam', type: 'exam', icon: '📋' },
        { name: 'Лабораторные', assessment: null, type: 'labs', icon: '💻', href: '?subject=algorithmic-languages&type=labs' },
      ],
    },
    {
      id: 'programming-technologies', title: 'Технологии и методы программирования',
      subtitle: 'Git: контроль версий, ветвление, GitHub',
      icon: '🔀', theme: 'progtech',
      assessments: [
        { name: 'Учебное пособие', assessment: null, type: 'textbook', icon: '📖', href: '?subject=programming-technologies&type=textbook' },
        { name: 'Лабораторные', assessment: null, type: 'labs', icon: '🔬', href: '?subject=programming-technologies&type=labs' },
      ],
    },
    {
      id: 'math-cs-foundations', title: 'Мат. основы информатики',
      subtitle: 'Булевы функции, нормальные формы, теорема Поста',
      icon: '🔢', theme: 'moi',
      assessments: [
        { name: 'Зачёт', assessment: 'zachet', type: 'zachet', icon: '✅' },
      ],
    },
  ];
}
