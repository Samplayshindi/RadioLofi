import fs from 'fs';

async function listFiles(folderId) {
  const url = `https://drive.google.com/batchexecute?hl=en`;
  // The RPC ID for listing folders is usually 'vgaYT' or similar, but it changes.
  // Actually, this is super fragile and undocumented.
}
