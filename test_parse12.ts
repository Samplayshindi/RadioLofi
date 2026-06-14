import fs from 'fs';
const html = fs.readFileSync('test_drive.html', 'utf8');
const chunks = html.split('AF_initDataCallback');
for (const chunk of chunks) {
  if (chunk.includes('1t0W9W1aOLhx-eqgbWfcWPu4d8ye8N151')) {
    fs.writeFileSync('chunk.txt', chunk);
    console.log("Chunk written, length:", chunk.length);
  }
}
