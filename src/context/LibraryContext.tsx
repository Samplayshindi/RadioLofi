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

  // Background Duration Fetcher
  useEffect(() => {
    if (projects.length === 0) return;

    // Load available metrics from localStorage immediately
    const loaded: Record<string, number> = {};
    const toFetch: { id: string; url: string }[] = [];

    projects.forEach(p => {
      p.tracks.forEach(t => {
        const cacheKey = `rw_dur_${t.id}`;
        const saved = localStorage.getItem(cacheKey);
        if (saved) {
          const val = parseFloat(saved);
          if (val > 0) {
            loaded[t.id] = val;
            return;
          }
        }
        toFetch.push({ id: t.id, url: normalizeAudioUrl(t.driveFileId) });
      });
    });

    setDurations(prev => ({ ...prev, ...loaded }));

    if (toFetch.length === 0) return;

    let cancelled = false;

    const fetchBatch = async () => {
      const batchSize = 4;
      for (let i = 0; i < toFetch.length; i += batchSize) {
        if (cancelled) break;
        const slice = toFetch.slice(i, i + batchSize);
        const results = await Promise.all(
          slice.map(async (item) => {
            const dur = await getAudioDuration(item.id, item.url);
            return { id: item.id, duration: dur };
          })
        );

        if (cancelled) break;

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
      }
    };

    fetchBatch();

    return () => {
      cancelled = true;
    };
  }, [projects]);

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
    <LibraryContext.Provider value={{ projects, loading, error, refresh: fetchCatalog, durations, getProjectRuntime }}>
      {children}
    </LibraryContext.Provider>
  );
};
