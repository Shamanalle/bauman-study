const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function scan(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const metaPath = path.join(full, 'meta.json');
      if (fs.existsSync(metaPath)) {
        try {
          const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
          if (meta.practiceMode) {
            console.log(`\n========================================`);
            console.log(`Checking ${full}...`);
            try {
              const res = execSync(`node .validate-practice.cjs "${full}"`, { encoding: 'utf8' });
              console.log(res.trim());
            } catch (e) {
              console.log((e.stdout || e.message).trim());
            }
          }
        } catch (err) {}
      }
      scan(full);
    }
  }
}
scan('src/data');
