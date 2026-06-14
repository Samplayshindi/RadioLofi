import fs from 'fs';

async function fetchFolder(id) {
  const url = `https://drive.google.com/drive/folders/${id}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  const html = await res.text();
  // We look for window._BOQ_ ...
  // It's too complex as determined earlier.
}
