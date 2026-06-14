import fs from 'fs';
const html = fs.readFileSync('test_drive.html', 'utf8');
const callbacks = html.match(/AF_initDataCallback/g);
console.log("AF_initDataCallback:", callbacks ? callbacks.length : 0);
