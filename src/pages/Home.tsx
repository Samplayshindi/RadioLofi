import React from 'react';
import { useLibrary } from '../context/LibraryContext';
import { ProjectCard } from '../components/ProjectCard';
import { LoaderIcon, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export function Home() {
  const { projects, loading, error, getProjectRuntime } = useLibrary();
  const navigate = useNavigate();

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

  const [visibleCount, setVisibleCount] = React.useState(15);

  const visibleProjects = React.useMemo(() => {
    return recentlyAdded.slice(0, visibleCount);
  }, [recentlyAdded, visibleCount]);

  React.useEffect(() => {
    if (visibleCount >= recentlyAdded.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 15, recentlyAdded.length));
        }
      },
      { rootMargin: '300px' } // Pre-load 300px before reaching viewport
    );

    const sentinel = document.getElementById('grid-sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => observer.disconnect();
  }, [recentlyAdded, visibleCount]);

  const stats = React.useMemo(() => {
    return {
      totalProjects: projects.length,
      totalTracks: projects.reduce((acc, p) => acc + p.tracks.length, 0),
      totalAlbums: projects.filter(p => p.type === 'Album').length,
      totalEPs: projects.filter(p => p.type === 'EP').length,
      totalSingles: projects.filter(p => p.type === 'Single').length,
    };
  }, [projects]);

  const formattedLibraryRuntime = React.useMemo(() => {
    const totalRuntimeInSeconds = projects.reduce((total, p) => total + getProjectRuntime(p), 0);
    if (totalRuntimeInSeconds <= 0) return 'Calculating...';
    const h = Math.floor(totalRuntimeInSeconds / 3600);
    const m = Math.floor((totalRuntimeInSeconds % 3600) / 60);
    const s = Math.floor(totalRuntimeInSeconds % 60);

    const parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' ');
  }, [projects, getProjectRuntime]);

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

          <div className="flex flex-col items-center md:items-start w-full">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-black flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Verified Artist
              </span>
            </div>
            
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-4 text-white relative">
              Radio Waves
            </h2>

            {/* Comprehensive statistics grid tray */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-4 w-full text-left border-t border-white/5 pt-5 relative z-10 font-mono">
              <div className="bg-white/[0.015] border border-white/5 hover:border-white/10 rounded-xl p-2.5 transition-colors">
                <p className="text-[9px] text-white/40 uppercase font-bold tracking-wider mb-0.5">Total Releases</p>
                <p className="text-md sm:text-lg font-bold text-white">{stats.totalProjects}</p>
              </div>
              <div className="bg-white/[0.015] border border-white/5 hover:border-white/10 rounded-xl p-2.5 transition-colors">
                <p className="text-[9px] text-white/40 uppercase font-bold tracking-wider mb-0.5">Total Tracks</p>
                <p className="text-md sm:text-lg font-bold text-white">{stats.totalTracks}</p>
              </div>
              <div className="bg-white/[0.015] border border-white/5 hover:border-white/10 rounded-xl p-2.5 transition-colors">
                <p className="text-[9px] text-white/40 uppercase font-bold tracking-wider mb-0.5">Albums</p>
                <p className="text-md sm:text-lg font-bold text-[#ff007f]">{stats.totalAlbums}</p>
              </div>
              <div className="bg-white/[0.015] border border-white/5 hover:border-white/10 rounded-xl p-2.5 transition-colors">
                <p className="text-[9px] text-white/40 uppercase font-bold tracking-wider mb-0.5">EPs</p>
                <p className="text-md sm:text-lg font-bold text-[#00f2fe]">{stats.totalEPs}</p>
              </div>
              <div className="bg-white/[0.015] border border-white/5 hover:border-white/10 rounded-xl p-2.5 transition-colors">
                <p className="text-[9px] text-white/40 uppercase font-bold tracking-wider mb-0.5">Singles</p>
                <p className="text-md sm:text-lg font-bold text-[#7f00ff]">{stats.totalSingles}</p>
              </div>
              <div className="bg-white/[0.015] border border-white/5 hover:border-white/10 rounded-xl p-2.5 transition-colors col-span-2 sm:col-span-1 md:col-span-1">
                <p className="text-[9px] text-cyan-400/80 uppercase font-bold tracking-wider mb-0.5">Total Runtime</p>
                <p className="text-md sm:text-lg font-bold text-cyan-400 truncate">{formattedLibraryRuntime}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid Section */}
      <div className="relative z-10 w-full px-6 md:px-12 flex-1 max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-white/5 pb-4">
            <h3 className="text-lg md:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span className="h-2 w-2 rounded-full rgb-btn bg-cyan-500 shadow-md" />
              Complete Discography
            </h3>
            <button
              onClick={() => navigate('/timeline')}
              className="flex items-center justify-center gap-2 px-4.5 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 text-xs font-bold tracking-wider uppercase hover:bg-cyan-400 hover:text-black hover:border-transparent transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)] active:scale-95 duration-300"
            >
              <History className="w-3.5 h-3.5" />
              View Timeline Path
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-6">
            {visibleProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          <div id="grid-sentinel" className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
