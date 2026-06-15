import { Project, ProjectType, Track } from '../types';

export async function scanCatalog(): Promise<Project[]> {
  try {
    const response = await fetch('/catalog.json');
    if (!response.ok) {
      console.warn('Could not fetch catalog.json');
      return [];
    }
    const data = await response.json();
    return data.projects || [];
  } catch (error) {
    console.error('Error loading catalog:', error);
    return [];
  }
}

export function getDriveImageUrl(fileId?: string, fallbackPath: string = '/default-cover.png') {
  if (!fileId || fileId === "") {
    return fallbackPath;
  }
  // If we already have an absolute or relative path from the archive scanner
  if (fileId.startsWith('/') || fileId.startsWith('http')) {
    return fileId;
  }
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}
