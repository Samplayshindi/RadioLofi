import fs from 'fs';

const html = fs.readFileSync('test_drive.html', 'utf8');

// Find all script tags
const scripts = html.match(/<script([^>]*)>([\s\S]*?)<\/script>/g);
if (scripts) {
  for (const s of scripts) {
    if (s.includes('window._BOQ_')) {
      // Find JSON data
      console.log('Found JS data block length:', s.length);
      const matches = s.match(/\[".*?","[^"]{25,50}".*?\]/g);
      if (matches) {
          console.log(`Found ${matches.length} possible chunk elements`);
          console.log(matches.slice(0, 5));
      }
    }
  }
}

// look for IDs
const matches = html.match(/id\\x22:\\x22([^\\x22]{20,40})\\x22,\\x22name\\x22:\\x22([^\\x22]+)\\x22/g);
if (matches) {
    console.log(`Found ${matches.length} regex matches for files.`);
    console.log(matches.slice(0, 5));
} else {
    // Try matching without escaping
    const m2 = html.match(/"([^"]{20,40})","([^"]+)"/g);
    console.log(`Regex 2 matches: ${m2 ? m2.length : 0}`);
}
