import React, { useMemo, useState } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectType } from '../types';
import { Disc3, ArrowUpDown } from 'lucide-react';

interface LibraryViewProps {
  filterType: 'All' | ProjectType;
  title: string;
}

export function LibraryView({ filterType, title }: LibraryViewProps) {
  const { projects, loading, getProjectRuntime } = useLibrary();
  const [sortBy, setSortBy] = useState<'default' | 'title' | 'tracks' | 'runtime'>('default');

  const filtered = useMemo(() => {
    let list = filterType === 'All' 
      ? [...projects] 
      : projects.filter(p => p.type === filterType);

    if (sortBy === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'tracks') {
      list.sort((a, b) => b.tracks.length - a.tracks.length);
    } else if (sortBy === 'runtime') {
      list.sort((a, b) => getProjectRuntime(b) - getProjectRuntime(a));
    }

    return list;
  }, [projects, filterType, sortBy, getProjectRuntime]);

  const [visibleCount, setVisibleCount] = useState(24);

  const visibleProjects = useMemo(() => {
    return filtered.slice(0, visibleCount);
  }, [filtered, visibleCount]);

  React.useEffect(() => {
    setVisibleCount(24);
  }, [filterType, sortBy]);

  React.useEffect(() => {
    if (visibleCount >= filtered.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 24, filtered.length));
        }
      },
      { rootMargin: '300px' }
    );

    const sentinel = document.getElementById('library-sentinel');
    if (sentinel) observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filtered.length, visibleCount]);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-[#07090e] min-h-[500px]">
        <Disc3 className="w-8 h-8 animate-spin text-cyan-400 mb-3" />
        <span className="font-mono text-xs uppercase tracking-widest text-slate-400">Loading {title}...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#07090e] text-white min-h-screen px-6 md:px-12 py-8 pb-32 select-none overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header and Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/[0.06]">
          <div>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight">
              {title}
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Radio Waves Archive • {filtered.length} {filtered.length === 1 ? 'Release' : 'Releases'}
            </p>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-900 border border-white/10 text-xs font-mono text-slate-300 rounded-xl px-3 py-2 outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="default">Default Order</option>
              <option value="title">Alphabetical (A-Z)</option>
              <option value="tracks">Most Tracks</option>
              <option value="runtime">Longest Runtime</option>
            </select>
          </div>
        </div>

        {/* Releases Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {visibleProjects.map((p, idx) => (
            <ProjectCard 
              key={p.id} 
              project={p} 
              priority={idx < 8} 
            />
          ))}
        </div>

        {/* Infinite scroll sentinel */}
        <div id="library-sentinel" className="h-10 mt-6" />
      </div>
    </div>
  );
}
