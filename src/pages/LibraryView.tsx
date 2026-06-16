import React from 'react';
import { useLibrary } from '../context/LibraryContext';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectType } from '../types';
import { motion } from 'motion/react';

export function LibraryView({ filterType, title }: { filterType: ProjectType; title: string }) {
  const { projects } = useLibrary();

  const filtered = projects.filter(p => p.type === filterType);

  const [visibleCount, setVisibleCount] = React.useState(15);

  const visibleProjects = React.useMemo(() => {
    return filtered.slice(0, visibleCount);
  }, [filtered, visibleCount]);

  React.useEffect(() => {
    setVisibleCount(15); // Reset when category changes
  }, [filterType]);

  React.useEffect(() => {
    if (visibleCount >= filtered.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 15, filtered.length));
        }
      },
      { rootMargin: '300px' }
    );

    const sentinel = document.getElementById('library-grid-sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => observer.disconnect();
  }, [filtered, visibleCount]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 md:p-8 pb-24 max-w-7xl mx-auto w-full relative z-10"
    >
      <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
        <h1 className="text-3xl font-extrabold text-white tracking-tighter flex items-center gap-2">
          {title}
        </h1>
        <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono">
          {filtered.length} Release{filtered.length !== 1 && 's'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {visibleProjects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
      <div id="library-grid-sentinel" className="h-10 w-full" />

      {filtered.length === 0 && (
        <div className="text-white/30 mt-20 text-center text-xs font-mono uppercase tracking-widest">
          No {title.toLowerCase()} currently indexed.
        </div>
      )}
    </motion.div>
  );
}
