import React from 'react';
import { useLibrary } from '../context/LibraryContext';
import { ProjectCard } from '../components/ProjectCard';

export function TimelineView() {
  const { projects } = useLibrary();

  // Group by year
  const byYear = projects.reduce((acc, project) => {
    if (!acc[project.year]) acc[project.year] = [];
    acc[project.year].push(project);
    return acc;
  }, {} as Record<number, typeof projects>);

  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

  return (
    <div className="p-8 pb-24 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-white mb-12 tracking-tighter">Timeline</h1>
      
      <div className="space-y-16">
        {years.map(year => (
          <div key={year} className="relative">
            {/* Timeline Line */}
            <div className="absolute left-[2.5rem] top-12 bottom-[-4rem] w-px bg-white/10" />
            
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 rounded-full bg-black border border-white/10 flex items-center justify-center shadow-xl z-10 shrink-0">
                <span className="text-xl font-bold text-purple-400">{year}</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Releases from {year}</h2>
            </div>
            
            <div className="pl-32 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {byYear[year].map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
