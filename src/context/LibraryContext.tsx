import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { Project } from '../types';
import { scanCatalog } from '../lib/drive';
import { imagePreloader, PreloadStatus } from '../lib/imagePreloader';
import staticDurations from '../lib/durations.json';

const BOOMBOX_LOGO = "https://raw.githubusercontent.com/Samplayshindi/RadioLofi/fecae3756d78e99e59964fdbe845c95cb42c645c/Retro_Cream_and_Burgundy_Boombox_cleaned-Photoroom.png";

interface LibraryContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  durations: Record<string, number>;
  getProjectRuntime: (project: Project) => number;
  preloadStatus: PreloadStatus;
  stats: {
    totalProjects: number;
    totalTracks: number;
    albumsCount: number;
    epsCount: number;
    singlesCount: number;
    totalSeconds: number;
    runtimeFormatted: string;
  };
}

const LibraryContext = createContext<LibraryContextType | null>(null);

export const useLibrary = () => {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider');
  return ctx;
};

export const LibraryProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preloadStatus, setPreloadStatus] = useState<PreloadStatus>(() => imagePreloader.getStatus());

  // Subscribe to image preloading events
  useEffect(() => {
    return imagePreloader.subscribe((status) => {
      setPreloadStatus(status);
    });
  }, []);

  // Pre-loaded durations dictionary from static dataset + track metadata
  const durations = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = { ...(staticDurations as Record<string, number>) };
    for (const p of projects) {
      for (const t of p.tracks) {
        if (t.duration) {
          map[t.id] = t.duration;
        }
      }
    }
    return map;
  }, [projects]);

  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await scanCatalog();
      setProjects(data);

      // Preload boombox logo immediately
      imagePreloader.preload(BOOMBOX_LOGO, { priority: true });

      // Automatically launch global image preloader across all projects in advance
      if (typeof window !== 'undefined' && data.length > 0) {
        imagePreloader.preloadCatalog(data);
      }
    } catch (err: any) {
      console.error('Failed to load library catalog:', err);
      setError(err.message || 'Failed to scan catalog');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  // Instantaneous project runtime calculation (pure synchronous addition)
  const getProjectRuntime = useCallback((project: Project): number => {
    let total = 0;
    for (let i = 0; i < project.tracks.length; i++) {
      const t = project.tracks[i];
      total += t.duration || durations[t.id] || 0;
    }
    return total;
  }, [durations]);

  // Instantaneous precomputed global archive statistics
  const stats = useMemo(() => {
    let totalTracks = 0;
    let albumsCount = 0;
    let epsCount = 0;
    let singlesCount = 0;
    let totalSeconds = 0;

    for (let i = 0; i < projects.length; i++) {
      const p = projects[i];
      totalTracks += p.tracks.length;

      if (p.type === 'Album') albumsCount++;
      else if (p.type === 'EP') epsCount++;
      else if (p.type === 'Single') singlesCount++;

      for (let j = 0; j < p.tracks.length; j++) {
        const t = p.tracks[j];
        totalSeconds += t.duration || durations[t.id] || 0;
      }
    }

    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const runtimeFormatted = hours > 0 
      ? `${hours}h ${mins}m` 
      : mins > 0 
        ? `${mins}m ${secs}s` 
        : `${secs}s`;

    return {
      totalProjects: projects.length,
      totalTracks,
      albumsCount,
      epsCount,
      singlesCount,
      totalSeconds,
      runtimeFormatted
    };
  }, [projects, durations]);

  const value = useMemo(() => ({
    projects,
    loading,
    error,
    refresh: fetchCatalog,
    durations,
    getProjectRuntime,
    preloadStatus,
    stats
  }), [projects, loading, error, fetchCatalog, durations, getProjectRuntime, preloadStatus, stats]);

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  );
};
