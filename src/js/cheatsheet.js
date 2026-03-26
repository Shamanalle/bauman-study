// Cheatsheet: opens pre-generated static HTML cheatsheet for the current assessment
// Static files are in /cheatsheets/{subject}-{assessment}.html

const CHEATSHEET_MAP = {
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

      window.open(`/cheatsheets/${file}.html`, '_blank');
    }
  };
}
