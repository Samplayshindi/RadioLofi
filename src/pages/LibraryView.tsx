import React from 'react';
import { useLibrary } from '../context/LibraryContext';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectType } from '../types';

export function LibraryView({ filterType, title }: { filterType: ProjectType; title: string }) {
  const { projects } = useLibrary();

  const filtered = projects.filter(p => p.type === filterType);

  return (
    <div className="p-8 pb-24">
      <h1 className="text-4xl font-bold text-white mb-8 tracking-tighter">{title}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filtered.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-white/40 mt-12 text-center text-sm font-medium">
          No {title.toLowerCase()} found in the catalog.
        </div>
      )}
    </div>
  );
}
