import React from 'react';
import { useLibrary } from '../context/LibraryContext';
import { ProjectCard } from '../components/ProjectCard';
import { LoaderIcon } from 'lucide-react';
import { motion } from 'motion/react';

export function Home() {
  const { projects, loading, error } = useLibrary();

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-white/40 bg-[#050505]">
        <LoaderIcon className="w-8 h-8 animate-spin mb-4 text-cyan-400" />
        <p className="font-mono text-xs tracking-widest uppercase">Syncing Archive Database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-red-400 bg-[#050505] p-6 text-center">
        <p className="font-bold text-lg mb-2">Failed to load archive</p>
        <p className="text-white/60 text-xs font-mono">{error}</p>
      </div>
    );
  }

  const recentlyAdded = projects; // Display all indexed projects

  const stats = {
    totalProjects: projects.length,
    totalTracks: projects.reduce((acc, p) => acc + p.tracks.length, 0)
  };

  return (
    <div className="relative pb-24 flex-1 flex flex-col overflow-x-hidden min-h-screen bg-[#050505]">
      {/* Immersive RGB Aurora Background Lights */}
      <div className="aurora-bg aurora-1" />
      <div className="aurora-bg aurora-2" />

      {/* Artist Hero Segment */}
      <section className="relative z-10 w-full bg-gradient-to-b from-[#0e0024]/40 via-[#050505]/75 to-[#050505] py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 text-center md:text-left">
          
          {/* Glowing Circular Profile Photo */}
          <div className="relative w-40 h-40 md:w-44 md:h-44 rounded-full overflow-hidden shrink-0 bg-black/60 border border-white/10 shadow-[0_0_50px_rgba(0,250,250,0.15)] ring-2 ring-cyan-500/20">
            <img 
              src="https://raw.githubusercontent.com/Samplayshindi/radio/main/cropped_circle_image.png" 
              alt="Radio Waves" 
              className="w-full h-full object-cover block animate-[pulse_6s_ease-in-out_infinite]" 
              referrerPolicy="no-referrer"
              loading="eager"
            />
          </div>

          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-black flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Verified Artist
              </span>
            </div>
            
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter mb-4 text-white relative">
              Radio Waves
            </h2>

            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-xs font-semibold text-white/50 tracking-wider font-mono">
              <span className="text-white/80">{stats.totalProjects} Releases</span>
              <span>•</span>
              <span className="text-white/80">{stats.totalTracks} Audio Tracks</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid Section */}
      <div className="relative z-10 w-full px-6 md:px-12 flex-1 max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
            <h3 className="text-lg md:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span className="h-2 w-2 rounded-full rgb-btn bg-cyan-500 shadow-md" />
              Complete Discography
            </h3>
            <span className="text-xs font-bold text-white/30 uppercase tracking-widest font-mono">
              Index Catalog
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-6">
            {recentlyAdded.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
