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
  // If data is inlined (offline single-file bundles), return immediately
  if (typeof window !== 'undefined' && window.__INLINE_META__ && window.__INLINE_SECTIONS__) {
    const meta = window.__INLINE_META__;
    const sections = window.__INLINE_SECTIONS__;
    for (const section of sections) {
      for (const q of (section.questions || section.cards || [])) {
        if (meta.practiceMode) {
          q.practiceMode = true;
        }
      }
    }
    return { meta, sections, svgs: {} };
  }

  const params = new URLSearchParams(window.location.search);
  const subject = params.get('subject') || 'physics';
  const assessment = params.get('assessment') || 'midterm-2';

  const basePath = `./data/${subject}/${assessment}`;

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
  const svgBasePath = `./data/${subject}/svg`;
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
 * Get all available subjects and assessments for the platform landing page.
 * Re-exported from the single source of truth in subjects-config.js
 */
export { SUBJECTS as getSubjectsConfig } from './subjects-config.js';
