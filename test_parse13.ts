import fs from 'fs';
const html = fs.readFileSync('test_drive.html', 'utf8');

// The file definitions in _BOQ_ are arrays.
// Something like: ["1t0W9W...", "filename.mp3", ...]
const matches = html.match(/\["([^"]{25,40})","([^"]+\.(?:mp3|wav|png|jpg))",/g);
if (matches) {
  console.log("Found matches:", matches.length);
  console.log(matches.slice(0, 10));
} else {
  console.log("No file matches.");
}
