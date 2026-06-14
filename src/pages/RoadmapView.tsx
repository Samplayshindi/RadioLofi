import React from 'react';
import { useLibrary } from '../context/LibraryContext';
import { ProjectCard } from '../components/ProjectCard';

export function RoadmapView() {
  const { projects } = useLibrary();

  // Pseudo-categorize based on year for the roadmap effect
  // Current year is assumed to be 2026
  const CURRENT_YEAR = 2026;

  const released = projects.filter(p => p.year === CURRENT_YEAR);
  const archived = projects.filter(p => p.year < CURRENT_YEAR);
  const inProgress = projects.filter(p => p.year === CURRENT_YEAR + 1).slice(0, 2);
  const scheduled = projects.filter(p => p.year === CURRENT_YEAR + 1 && !inProgress.includes(p));
  const planned = projects.filter(p => p.year > CURRENT_YEAR + 1);

  const sections = [
    { title: 'In Progress', description: 'Currently in the studio.', items: inProgress, color: 'text-yellow-400' },
    { title: 'Scheduled', description: 'Mastered and ready for release.', items: scheduled, color: 'text-blue-400' },
    { title: 'Planned', description: 'Concepts and demos.', items: planned, color: 'text-purple-400' },
    { title: 'Recently Released', description: 'Out now on all platforms.', items: released, color: 'text-white' },
    { title: 'Archived', description: 'Legacy releases.', items: archived, color: 'text-white/40' },
  ];

  return (
    <div className="p-8 pb-24 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4 tracking-tighter">Artist Roadmap</h1>
        <p className="text-white/60 text-sm max-w-2xl">
          The master plan for Radio Lofi. See what's currently in the studio, what's queued for release, and future horizons.
        </p>
      </div>

      <div className="space-y-12">
        {sections.filter(s => s.items.length > 0).map((section) => (
          <div key={section.title} className="bg-white/5 rounded-xl p-8 border border-white/10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className={`text-xl font-bold ${section.color} tracking-tight mb-1`}>{section.title}</h2>
                <p className="text-white/40 text-xs">{section.description}</p>
              </div>
              <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-black text-white/60 text-sm font-bold">
                {section.items.length}
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {section.items.map(project => (
                 <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
