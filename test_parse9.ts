import fs from 'fs';

const html = fs.readFileSync('test_drive.html', 'utf8');

// The JSON with files usually starts with something like '\\x22mimeType\\x22' or similar
const matches = html.match(/[A-Za-z0-9-_]{25,40}/g) || [];
console.log("Unique IDs length:", new Set(matches).size);

const chunks = html.split('bWfcWPu4d8ye8N151');
console.log("Occurrences of root folder:", chunks.length);
