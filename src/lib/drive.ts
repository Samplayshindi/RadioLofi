import { getAccessToken } from './firebase';
import { Project, ProjectType, Track } from '../types';

const ROOT_FOLDER_ID = '1t0W9W1aOLhx-eqgbWfcWPu4d8ye8N151';

// Fetch files from Google Drive
async function fetchDriveFiles(query: string, fields: string = 'files(id, name, mimeType)') {
  const token = await getAccessToken();
  if (!token) throw new Error('No access token');

  let allFiles: any[] = [];
  let pageToken: string | undefined = undefined;

  do {
    const url = new URL('https://www.googleapis.com/drive/v3/files');
    url.searchParams.append('q', query);
    url.searchParams.append('fields', `nextPageToken, ${fields}`);
    url.searchParams.append('pageSize', '1000');
    if (pageToken) {
      url.searchParams.append('pageToken', pageToken);
    }

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.error('Drive API error:', await res.text());
      throw new Error('Failed to fetch from Drive');
    }

    const data = await res.json();
    allFiles = allFiles.concat(data.files || []);
    pageToken = data.nextPageToken;
  } while (pageToken);

  return allFiles;
}

export async function scanCatalog(): Promise<Project[]> {
  const projects: Project[] = [];

  // 1. Get Year Folders (2026-2032)
  const yearFolders = await fetchDriveFiles(
    `'${ROOT_FOLDER_ID}' in parents and trashed = false and mimeType = 'application/vnd.google-apps.folder'`
  );

  for (const yearFolder of yearFolders) {
    const yearMatch = yearFolder.name.match(/^(\\d{4})$/);
    if (!yearMatch) continue;
    const year = parseInt(yearMatch[1], 10);

    // 2. Get children of Year Folder
    const yearChildren = await fetchDriveFiles(
      `'${yearFolder.id}' in parents and trashed = false`
    );

    // Some users organize as Year -> Project, some as Year -> Category -> Project
    // We check if the children are mostly folders containing projects.
    const potentialCategoriesOrProjects = yearChildren.filter(f => f.mimeType === 'application/vnd.google-apps.folder');

    // Helper to process a project folder
    const processProjectFolder = async (projectFolder: any) => {
      const contents = await fetchDriveFiles(
        `'${projectFolder.id}' in parents and trashed = false`
      );

      const audioFiles = contents
        .filter((f) => f.mimeType.startsWith('audio/') || f.name.endsWith('.mp3') || f.name.endsWith('.wav') || f.name.endsWith('.flac'))
        .sort((a, b) => a.name.localeCompare(b.name));

      const coverArt = contents.find(
        (f) =>
          f.mimeType.startsWith('image/') ||
          f.name.toLowerCase().includes('cover') ||
          f.name.toLowerCase().includes('artwork') ||
          f.name.endsWith('.jpg') ||
          f.name.endsWith('.png')
      );

      if (audioFiles.length === 0) return false;

      // Categorize Project based on track count
      const trackCount = audioFiles.length;
      let type: ProjectType = 'Album';
      if (trackCount === 1) type = 'Single';
      else if (trackCount >= 2 && trackCount <= 5) type = 'EP';
      else if (trackCount >= 6) type = 'Album';

      // Always force 5 tracks to EP per custom rules
      if (trackCount === 5) type = 'EP';

      const tracks: Track[] = audioFiles.map((file, index) => {
        let cleanTitle = file.name.replace(/^\\d+[-_\\.\\s]*/, '').replace(/\\.[^/.]+$/, '');
        return {
          id: file.id,
          title: cleanTitle,
          driveFileId: file.id,
          trackNumber: index + 1,
        };
      });

      projects.push({
        id: projectFolder.id,
        title: projectFolder.name,
        year,
        type,
        tracks,
        coverArtId: coverArt?.id,
      });

      return true;
    };

    for (const folder of potentialCategoriesOrProjects) {
       // Peek inside this folder to see if it has audio files or more folders
       const contents = await fetchDriveFiles(`'${folder.id}' in parents and trashed = false`);
       const hasAudioFiles = contents.some(f => f.mimeType.startsWith('audio/') || f.name.endsWith('.mp3') || f.name.endsWith('.wav'));
       
       if (hasAudioFiles) {
          // This must be a Project Folder directly inside Year
          await processProjectFolder(folder);
       } else {
          // This is a Category Folder (e.g. "Albums", "EPs")
          const subFolders = contents.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
          for (const subFolder of subFolders) {
            await processProjectFolder(subFolder);
          }
       }
    }
  }

  // Sort by year descending
  return projects.sort((a, b) => b.year - a.year);
}

export function getDriveImageUrl(fileId?: string) {
  if (!fileId) return '/default-cover.png';
  // To load images directly from Drive, we can use the webContentLink or fetch with token.
  // Wait, directly linking is blocked unless public.
  // We can use a special URL or proxy it. Since we are client-side we can fetch it as blob
  // But doing that for every image might be slow.
  // Actually, Drive files have thumbnailLink which is accessible with token or sometimes public.
  // Let's use a helper that components can call.
  return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
}
