export type ProjectType = 'Album' | 'EP' | 'Single';

export interface Track {
  id: string;
  title: string;
  driveFileId: string;
  duration?: number; // In seconds, if available
  trackNumber: number;
}

export interface Project {
  id: string; // Drive folder ID
  title: string; // Folder name
  year: number;
  type: ProjectType;
  tracks: Track[];
  coverArtId?: string; // Drive file ID for the cover image
}

export interface Catalog {
  projects: Project[];
}
