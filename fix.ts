import fs from 'fs';
import path from 'path';
function fix(dir) {
  for (const f of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) fix(full);
    else if (full.endsWith('.ts') || full.endsWith('.tsx')) {
      let content = fs.readFileSync(full, 'utf8');
      content = content.replace(/\\`/g, '`').replace(/\\\$/g, '$');
      fs.writeFileSync(full, content);
    }
  }
}
fix('src');
