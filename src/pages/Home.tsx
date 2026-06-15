import React from 'react';
import { useLibrary } from '../context/LibraryContext';
import { ProjectCard } from '../components/ProjectCard';
import { Disc3, LoaderIcon } from 'lucide-react';

export function Home() {
  const { projects, loading, error } = useLibrary();

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-white/40">
        <LoaderIcon className="w-8 h-8 animate-spin mb-4" />
        <p>Scanning Google Drive Catalog...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-red-400">
        <p>Error: {error}</p>
      </div>
    );
  }

  const recentlyAdded = projects.slice(0, 10); // Display recent 10 projects

  const stats = {
    totalProjects: projects.length,
    totalTracks: projects.reduce((acc, p) => acc + p.tracks.length, 0)
  };

  return (
    <div className="pb-24 flex-1 flex flex-col">
      {/* Artist Hero */}
      <section className="h-[280px] bg-gradient-to-b from-indigo-900/60 to-[#050505] flex items-end p-8 pb-6">
        <div className="flex gap-6 items-end">
          <div className="w-48 h-48 shadow-2xl rounded-sm overflow-hidden bg-white/5">
            <div className="w-full h-full bg-gradient-to-tr from-purple-800 to-blue-700 flex items-center justify-center">
              <Disc3 className="w-24 h-24 text-white/20" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-600 p-0.5 rounded-full">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white">Verified Artist</span>
            </div>
            <h2 className="text-7xl font-black tracking-tighter mb-4 text-white">Radio Lofi</h2>
            <div className="flex gap-4 text-sm text-white/80 font-medium">
              <span>{stats.totalProjects} Project{stats.totalProjects !== 1 ? 's' : ''}</span>
              <span>•</span>
              <span>{stats.totalTracks} Track{stats.totalTracks !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="p-8 flex-1">
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Recently Added</h3>
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest cursor-pointer hover:text-white">See All</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {recentlyAdded.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
