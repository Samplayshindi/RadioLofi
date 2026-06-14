import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project } from '../types';
import { scanCatalog } from '../lib/drive';

interface LibraryContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
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

  return (
    <LibraryContext.Provider value={{ projects, loading, error, refresh: fetchCatalog }}>
      {children}
    </LibraryContext.Provider>
  );
};
