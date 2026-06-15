import fs from 'fs';
import path from 'path';

// Define structures matching the application's types
interface Track {
  id: string;
  title: string;
  driveFileId: string; // will be relative path now
  trackNumber: number;
}

interface Project {
  id: string;
  title: string;
  year: number;
  type: string;
  coverArtId: string;
  tracks: Track[];
  status?: string;
  description?: string;
  releaseDate?: string;
}

const ARCHIVE_ROOT = path.join(process.cwd(), 'archive'); // Assumes user extracts archive here
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const CATALOG_OUT = path.join(PUBLIC_DIR, 'catalog.json');

const SUPPORTED_AUDIO = ['.mp3', '.wav', '.flac', '.m4a'];
const SUPPORTED_IMAGES = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

function generateId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

async function scan() {
  console.log(`Scanning archive at: ${ARCHIVE_ROOT}`);
  
  if (!fs.existsSync(ARCHIVE_ROOT)) {
    console.error('Archive folder not found! Please extract your ZIP into a folder named "archive" in the project root.');
    process.exit(1);
  }

  const projects: Project[] = [];
  const years = fs.readdirSync(ARCHIVE_ROOT).filter(f => /^\d{4}$/.test(f));

  let totalYears = 0;
  let totalProjects = 0;
  let totalTracks = 0;
  let missingArtwork = 0;
  let missingAudio = 0;

  for (const yearStr of years) {
    const year = parseInt(yearStr, 10);
    const yearPath = path.join(ARCHIVE_ROOT, yearStr);
    if (!fs.statSync(yearPath).isDirectory()) continue;

    totalYears++;
    const releaseFolders = fs.readdirSync(yearPath).filter(f => !f.startsWith('.'));

    for (const release of releaseFolders) {
      const releasePath = path.join(yearPath, release);
      if (!fs.statSync(releasePath).isDirectory()) continue;

      totalProjects++;
      const files = fs.readdirSync(releasePath).filter(f => !f.startsWith('.'));
      
      const audioFiles = files.filter(f => SUPPORTED_AUDIO.includes(path.extname(f).toLowerCase())).sort();
      const imageFiles = files.filter(f => SUPPORTED_IMAGES.includes(path.extname(f).toLowerCase()));

      // Copy artwork to public/assets
      let coverArtPath = '';
      if (imageFiles.length > 0) {
        // use the first image as cover
        const imgName = imageFiles[0];
        const srcPath = path.join(releasePath, imgName);
        const destRelative = `/assets/covers/${year}_${release}_${imgName}`.replace(/\s+/g, '_');
        const destPath = path.join(PUBLIC_DIR, destRelative);
        
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.copyFileSync(srcPath, destPath);
        coverArtPath = destRelative;
      } else {
        missingArtwork++;
      }

      const tracks: Track[] = [];
      for (let i = 0; i < audioFiles.length; i++) {
        const audioName = audioFiles[i];
        const srcPath = path.join(releasePath, audioName);
        const destRelative = `/assets/audio/${year}_${release}_${audioName}`.replace(/\s+/g, '_');
        const destPath = path.join(PUBLIC_DIR, destRelative);
        
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.copyFileSync(srcPath, destPath);

        tracks.push({
          id: generateId('t'),
          title: path.basename(audioName, path.extname(audioName)).replace(/^\d+[\s\-._]*/, ''), // remove leading numbers
          driveFileId: destRelative,
          trackNumber: i + 1
        });
        totalTracks++;
      }

      if (audioFiles.length === 0) {
          missingAudio++;
      }

      // Classification
      let type = 'Single';
      if (audioFiles.length === 5) type = 'EP';
      else if (audioFiles.length >= 2 && audioFiles.length <= 5) type = 'EP';
      else if (audioFiles.length >= 6) type = 'Album';

      // Status Roadmap Determination
      // Default guess based on year
      const currentYear = new Date().getFullYear();
      let status = year > currentYear ? 'Scheduled' : 'Released';
      
      // Let's see if there's a roadmap.txt or notes.txt
      const txtFiles = files.filter(f => f.toLowerCase().endsWith('.txt') || f.toLowerCase().endsWith('.md'));
      let description = '';
      if (txtFiles.length > 0) {
          const notesPath = path.join(releasePath, txtFiles[0]);
          description = fs.readFileSync(notesPath, 'utf8');
          const lowerDesc = description.toLowerCase();
          if (lowerDesc.includes('in progress')) status = 'In Progress';
          else if (lowerDesc.includes('planned')) status = 'Planned';
          else if (lowerDesc.includes('archived')) status = 'Archived';
      }

      projects.push({
        id: generateId('proj'),
        title: release,
        year,
        type,
        coverArtId: coverArtPath,
        tracks,
        status,
        description
      });
    }
  }

  fs.writeFileSync(CATALOG_OUT, JSON.stringify({
    lastUpdated: new Date().toISOString(),
    projects
  }, null, 2));

  console.log('\n--- SCAN COMPLETE ---');
  console.log(`Years discovered: ${totalYears}`);
  console.log(`Projects discovered: ${totalProjects}`);
  console.log(`Tracks discovered: ${totalTracks}`);
  console.log(`Missing Artwork (Projects): ${missingArtwork}`);
  console.log(`Missing Audio (Projects): ${missingAudio}`);
  console.log(`\nCatalog compiled to: ${CATALOG_OUT}`);
}

scan().catch(console.error);
