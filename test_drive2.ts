import fs from 'fs';

async function test() {
  const url = `https://drive.google.com/drive/folders/1t0W9W1aOLhx-eqgbWfcWPu4d8ye8N151?usp=sharing`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  });
  const html = await res.text();
  fs.writeFileSync('test_drive.html', html);
  console.log("Written to test_drive.html, length:", html.length);
}
test();
