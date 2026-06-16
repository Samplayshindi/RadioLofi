import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project } from '../types';
import { scanCatalog } from '../lib/drive';

interface LibraryContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  durations: Record<string, number>;
  getProjectRuntime: (project: Project) => number;
  fetchProjectDurations: (project: Project, limitTrackIds?: string[]) => Promise<void>;
}

const LibraryContext = createContext<LibraryContextType | null>(null);

export const useLibrary = () => {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider');
  return ctx;
};

export function normalizeAudioUrl(url: string): string {
  if (!url) return '';
  if (url.includes('github.com/') && url.includes('/blob/')) {
    return url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
  }
  if (!url.startsWith('/') && !url.startsWith('http')) {
    return `https://drive.google.com/uc?export=download&id=${url}`;
  }
  return url;
}

const getAudioDuration = (trackId: string, url: string): Promise<number> => {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.crossOrigin = 'anonymous';
    audio.src = url;
    
    const timeout = setTimeout(() => {
      audio.src = '';
      resolve(0);
    }, 15000); // 15s timeout

    audio.onloadedmetadata = () => {
      clearTimeout(timeout);
      const dur = audio.duration;
      audio.src = '';
      resolve(dur || 0);
    };

    audio.onerror = () => {
      clearTimeout(timeout);
      audio.src = '';
      resolve(0);
    };
  });
};

export const LibraryProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [durations, setDurations] = useState<Record<string, number>>({});

  const fetchCatalog = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await scanCatalog();
      setProjects(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to scan catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  // Background Duration Fetcher - ONLY load existing cached items on startup to prevent network flood
  useEffect(() => {
    if (projects.length === 0) return;

    const loaded: Record<string, number> = {};
    projects.forEach(p => {
      p.tracks.forEach(t => {
        const cacheKey = `rw_dur_${t.id}`;
        try {
          const saved = localStorage.getItem(cacheKey);
          if (saved) {
            const val = parseFloat(saved);
            if (val > 0) {
              loaded[t.id] = val;
            }
          }
        } catch (e) {
          console.warn('Storage read error:', e);
        }
      });
    });

    setDurations(prev => ({ ...prev, ...loaded }));
  }, [projects]);

  // Lazy-load durations for a specific project on-demand
  const fetchProjectDurations = React.useCallback(async (project: Project, limitTrackIds?: string[]) => {
    const toFetch: { id: string; url: string }[] = [];
    
    const targetTracks = limitTrackIds 
      ? project.tracks.filter(t => limitTrackIds.includes(t.id))
      : project.tracks;

    targetTracks.forEach(t => {
      const cacheKey = `rw_dur_${t.id}`;
      let isCached = false;
      try {
        const saved = localStorage.getItem(cacheKey);
        if (saved && parseFloat(saved) > 0) {
          isCached = true;
        }
      } catch {}

      if (!isCached) {
        toFetch.push({ id: t.id, url: normalizeAudioUrl(t.driveFileId) });
      }
    });

    if (toFetch.length === 0) return;

    // Fetch batch in small chunks of 3 concurrently to avoid browser resource choke
    const results: { id: string; duration: number }[] = [];
    const chunkSize = 3;
    for (let i = 0; i < toFetch.length; i += chunkSize) {
      const chunk = toFetch.slice(i, i + chunkSize);
      const chunkResults = await Promise.all(
        chunk.map(async (item) => {
          const dur = await getAudioDuration(item.id, item.url);
          return { id: item.id, duration: dur };
        })
      );
      results.push(...chunkResults);
    }

    const newDurations: Record<string, number> = {};
    results.forEach(res => {
      if (res.duration > 0) {
        newDurations[res.id] = res.duration;
        try {
          localStorage.setItem(`rw_dur_${res.id}`, res.duration.toString());
        } catch (err) {
          console.warn('Storage quota margin exceeded:', err);
        }
      }
    });

    if (Object.keys(newDurations).length > 0) {
      setDurations(prev => ({ ...prev, ...newDurations }));
    }
  }, []);

  const projectRuntimes = React.useMemo(() => {
    const runtimes: Record<string, number> = {};
    projects.forEach(p => {
      runtimes[p.id] = p.tracks.reduce((total, track) => {
        return total + (durations[track.id] || 0);
      }, 0);
    });
    return runtimes;
  }, [projects, durations]);

  const getProjectRuntime = React.useCallback((project: Project) => {
    return projectRuntimes[project.id] || 0;
  }, [projectRuntimes]);

  return (
    <LibraryContext.Provider value={{ projects, loading, error, refresh: fetchCatalog, durations, getProjectRuntime, fetchProjectDurations }}>
      {children}
    </LibraryContext.Provider>
  );
};
