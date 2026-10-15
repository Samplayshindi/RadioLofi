import React, { useState, useMemo } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { ProjectCard } from '../components/ProjectCard';
import { LoaderIcon, Play, Disc3, Mic2, Music, Clock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { ProjectType } from '../types';

const BOOMBOX_LOGO = "https://raw.githubusercontent.com/Samplayshindi/RadioLofi/fecae3756d78e99e59964fdbe845c95cb42c645c/Retro_Cream_and_Burgundy_Boombox_cleaned-Photoroom.png";

export function Home() {
  const { projects, loading, error, stats } = useLibrary();
  const { playTrack } = usePlayer();
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState<'All' | ProjectType>('All');
  const [visibleCount, setVisibleCount] = useState(24);

  // Filter projects by active category tab
  const filteredProjects = useMemo(() => {
    if (activeFilter === 'All') return projects;
    return projects.filter(p => p.type === activeFilter);
  }, [projects, activeFilter]);

  const visibleProjects = useMemo(() => {
    return filteredProjects.slice(0, visibleCount);
  }, [filteredProjects, visibleCount]);

  // Featured release (first release in catalog, e.g. Window Seat)
  const featured = projects[0];

  const handlePlayFeatured = () => {
    if (featured && featured.tracks.length > 0) {
      playTrack(featured.tracks[0], featured, featured.tracks);
    }
  };

  React.useEffect(() => {
    setVisibleCount(24);
  }, [activeFilter]);

  React.useEffect(() => {
    if (visibleCount >= filteredProjects.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 24, filteredProjects.length));
        }
      },
      { rootMargin: '300px' }
    );

    const sentinel = document.getElementById('home-grid-sentinel');
    if (sentinel) observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredProjects.length, visibleCount]);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-[#07090e] min-h-[500px]">
        <LoaderIcon className="w-8 h-8 animate-spin text-cyan-400 mb-4" />
        <span className="font-mono text-xs uppercase tracking-widest text-slate-400">
          Loading Audiophile Catalog...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-rose-400 bg-[#07090e] p-6 text-center">
        <Disc3 className="w-12 h-12 opacity-30 mb-4" />
        <h2 className="font-display font-black text-xl mb-2 text-white">Archive Offline</h2>
        <p className="text-slate-400 text-xs font-mono max-w-xs mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#07090e] text-white min-h-screen pb-32 select-none overflow-x-hidden">
      {/* Editorial Audiophile Hero Section */}
      <section className="relative px-6 md:px-12 pt-10 pb-12 border-b border-white/[0.06] overflow-hidden">
        {/* Subtle background ambient mesh */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-cyan-500/[0.07] rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-[400px] h-[250px] bg-purple-500/[0.06] rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 md:gap-12">
            {/* Left Brand & Headline */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-xl">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-bold tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>OFFICIAL DISCOGRAPHY ARCHIVE</span>
              </div>

              <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.08] mb-3">
                Radio Waves
              </h1>

              <p className="text-slate-400 text-sm sm:text-base font-medium max-w-md mb-8">
                Complete lossless catalog, master recordings, and full release archive.
              </p>

              {/* Quick Action Button */}
              {featured && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePlayFeatured}
                    className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-lg shadow-cyan-400/25 active:scale-95 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Play {featured.title}</span>
                  </button>

                  <button
                    onClick={() => navigate(`/project/${featured.id}`)}
                    className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white font-bold text-xs uppercase tracking-wider border border-white/10 transition-all cursor-pointer"
                  >
                    View Details
                  </button>
                </div>
              )}
            </div>

            {/* Right: Boombox Logo Display & Archive Telemetry Board */}
            <div className="flex flex-col items-center lg:items-end w-full lg:w-auto">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-2xl" />
                <img 
                  src={BOOMBOX_LOGO} 
                  alt="Radio Waves" 
                  className="w-36 h-36 md:w-44 md:h-44 object-contain relative z-10 filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]" 
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Instant Telemetry Grid */}
              <div className="grid grid-cols-3 gap-3 w-full max-w-md">
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">
                    Projects
                  </div>
                  <div className="font-display font-black text-2xl text-white">
                    {stats.totalProjects}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">
                    Tracks
                  </div>
                  <div className="font-display font-black text-2xl text-cyan-400">
                    {stats.totalTracks}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">
                    Runtime
                  </div>
                  <div className="font-display font-black text-2xl text-rose-400">
                    {stats.runtimeFormatted}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Browsing Section */}
      <section className="px-6 md:px-12 pt-8 max-w-7xl mx-auto w-full">
        {/* Format Filter Bar */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4 border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {(['All', 'Album', 'EP', 'Single'] as const).map((type) => {
              const count = type === 'All' 
                ? stats.totalProjects 
                : type === 'Album' 
                  ? stats.albumsCount 
                  : type === 'EP' 
                    ? stats.epsCount 
                    : stats.singlesCount;

              const isActive = activeFilter === type;

              return (
                <button
                  key={type}
                  onClick={() => setActiveFilter(type)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/20'
                      : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
                  }`}
                >
                  <span>{type === 'All' ? 'All Releases' : `${type}s`}</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                    isActive ? 'bg-black/20 text-black' : 'bg-white/[0.06] text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-xs font-mono text-slate-400">
            Showing {filteredProjects.length} {filteredProjects.length === 1 ? 'Release' : 'Releases'}
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

        {/* Sentinel for progressive rendering */}
        <div id="home-grid-sentinel" className="h-10 mt-6" />
      </section>
    </div>
  );
}
