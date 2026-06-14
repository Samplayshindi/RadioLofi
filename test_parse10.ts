import fs from 'fs';

const html = fs.readFileSync('test_drive.html', 'utf8');
const callbacks = html.match(/AF_initDataCallback\(\{key: '([^']+)', isError: false, hash: '[^']+', data:(.*?)\}\);/g);
if (callbacks) {
  for (const c of callbacks) {
    if (c.includes('1t0W9W1aOLhx-eqgbWfcWPu4d8ye8N151')) {
      console.log(c.substring(0, 100));
      fs.writeFileSync('callback_data.txt', c);
    }
  }
}
