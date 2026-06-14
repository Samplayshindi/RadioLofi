import fs from 'fs';
const html = fs.readFileSync('test_drive.html', 'utf8');

const unescaped = html.replace(/\\x22/g, '"').replace(/\\u003d/g, '=').replace(/\\\//g, '/');
fs.writeFileSync('test_drive_unescaped.html', unescaped);

const matches = unescaped.match(/\["([^"]{25,40})","([^"]+)",2/g) || [];
console.log("Found matches with ,2:", matches.length);

const audioMatches = unescaped.match(/\["([^"]{25,40})","([^"]+\.(?:mp3|wav|png|jpg|flac))"/gi) || [];
console.log("Audio matches:", audioMatches.length);

const folderMatches = unescaped.match(/\["([^"]{25,40})","([^"]+)","application\/vnd.google-apps.folder"/gi) || [];
console.log("Folder matches:", folderMatches.length);
console.log(folderMatches.slice(0, 5));

const anyFile = unescaped.match(/\["([^"]{25,40})","([^"]+)","application\/[^"]+"/gi) || [];
console.log("Any file matches:", anyFile.length);
