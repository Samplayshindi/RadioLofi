import fs from 'fs';
const html = fs.readFileSync('test_drive.html', 'utf8');
const snippets = [];
for (let i = 0; i < html.length; i++) {
  if (html.substring(i, i + 4) === '.mp3') {
    snippets.push(html.substring(i - 40, i + 40));
  }
}
console.log(snippets);
