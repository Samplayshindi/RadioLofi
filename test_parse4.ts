import fs from 'fs';

const html = fs.readFileSync('test_drive.html', 'utf8');
const snippets = [];
for (let i = 0; i < html.length; i++) {
  if (html.substring(i, i + 4) === 'json') {
    snippets.push(html.substring(i - 30, i + 30));
  }
}
console.log(snippets);
