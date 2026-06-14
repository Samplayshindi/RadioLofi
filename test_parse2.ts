import fs from 'fs';

const html = fs.readFileSync('test_drive.html', 'utf8');

const m2 = html.match(/"([^"]{20,40})","([^"]+)"/g);
if (m2) {
    console.log(m2.slice(0, 20));
}
