// Cheatsheet: opens pre-generated static HTML cheatsheet for the current assessment
// Static files are in /cheatsheets/{subject}-{assessment}.html

export const CHEATSHEET_MAP = {
  'physics|midterm-1-practice': 'physics-rk1',
  'physics|midterm-2-practice': 'physics-rk2',
  'physics|exam-practice': 'physics-exam',
  'differential-equations|midterm-1-practice': 'diffeq-rk1',
  'differential-equations|midterm-2-practice': 'diffeq-rk2',
  'differential-equations|exam-practice': 'diffeq-exam',
  'differential-equations|kr-1': 'diffeq-rk1',
  'differential-equations|kr-2': 'diffeq-rk2',
  'differential-equations|kr-2-practice': 'diffeq-rk2',
  'linear-algebra|midterm-1-practice': 'linalg-rk1',
  'linear-algebra|midterm-2-practice': 'linalg-rk2',
  'linear-algebra|exam-practice': 'linalg-exam',
  'linear-algebra|kr-1-practice': 'linalg-rk1',
  'algorithmic-languages|exam-practice': 'alglang-exam',
};

export function getCheatsheetUrl(file) {
  try {
    const loc = window.location;
    let path = loc.pathname;
    if (!path.endsWith('/')) {
      if (path.endsWith('.html')) {
        path = path.substring(0, path.lastIndexOf('/') + 1);
      } else {
        path = path + '/';
      }
    }
    return loc.origin + path + 'cheatsheets/' + file + '.html';
  } catch (e) {
    return './cheatsheets/' + file + '.html';
  }
}

export function initCheatsheet(meta, sections) {
  return {
    render() {
      // Determine which cheatsheet to open
      const params = new URLSearchParams(window.location.search);
      const subject = params.get('subject') || '';
      const assessment = params.get('assessment') || '';
      const key = `${subject}|${assessment}`;
      const file = CHEATSHEET_MAP[key];

      if (!file) {
        alert('Шпаргалка для этого раздела пока не создана');
        return;
      }

      // Priority 1: Inlined HTML from standalone platform or bundle (Blob URL works 100% offline)
      const inlinedHtml = (window.__CHEATSHEET_DATA__ && window.__CHEATSHEET_DATA__[file])
        || window.__INLINE_CHEATSHEET__;

      if (inlinedHtml) {
        try {
          const blob = new Blob([inlinedHtml], { type: 'text/html; charset=utf-8' });
          const blobUrl = URL.createObjectURL(blob);
          const win = window.open(blobUrl, '_blank');
          if (win) return;
        } catch (e) {
          console.warn('Failed to open blob URL, falling back to static URL', e);
        }
      }

      // Priority 2: Static URL relative to application root
      const url = getCheatsheetUrl(file);
      const win = window.open(url, '_blank');
      if (!win) {
        window.location.href = url;
      }
    }
  };
}

