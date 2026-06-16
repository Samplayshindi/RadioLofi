import React, { useState, useMemo } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { usePlayer } from '../context/PlayerContext';
import { useNavigate } from 'react-router-dom';
import { formatProjectRuntime } from '../lib/time';
import { DriveImage } from '../components/DriveImage';
import { Play, Pause, Disc3, Mic2, Music, Shuffle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProjectType } from '../types';

export function TimelineView() {
  const { projects, loading, error, getProjectRuntime } = useLibrary();
  const { playTrack, currentProject, isPlaying, togglePlayPause } = usePlayer();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'All' | ProjectType>('All');

  // Filter projects by type
  const filteredProjects = useMemo(() => {
    if (filter === 'All') return projects;
    return projects.filter(p => p.type === filter);
  }, [projects, filter]);

  if (loading) {
    return (
      <div className="h-full min-h-screen flex flex-col items-center justify-center text-white/40 bg-[#050505]">
        <p className="font-mono text-xs tracking-widest uppercase">Parsing Timeline Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full min-h-screen flex flex-col items-center justify-center text-red-400 bg-[#050505] p-6 text-center">
        <p className="font-bold text-lg mb-2">Failed to load timeline</p>
        <p className="text-white/60 text-xs font-mono">{error}</p>
      </div>
    );
  }

  const handlePlayProject = (e: React.MouseEvent, project: any) => {
    e.stopPropagation();
    const isCurrent = currentProject?.id === project.id;
    if (project.tracks.length > 0) {
      if (isCurrent) {
        togglePlayPause();
      } else {
        playTrack(project.tracks[0], project, project.tracks);
      }
    }
  };

  return (
    <div className="relative pb-24 min-h-screen bg-[#050505] overflow-x-hidden">
      {/* Immersive subtle aurora lights */}
      <div className="aurora-bg aurora-1 opacity-[0.06] top-1/4" />
      <div className="aurora-bg aurora-2 opacity-[0.06] bottom-1/4" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-8 py-10">
        
        {/* Header Section */}
        <div className="border-b border-white/5 pb-6 mb-10 text-center md:text-left">
          <h1 className="text-4xl font-extrabold tracking-tighter text-white mb-3">
            Discography Timeline
          </h1>
          <p className="text-xs text-white/40 uppercase tracking-widest font-bold font-mono">
            Sequential Release Path of Radio Waves
          </p>
        </div>

        {/* Categories Tab Filter of Type (Albums, EPs, Singles) */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-12">
          {(['All', 'Album', 'EP', 'Single'] as const).map((type) => {
            const isActive = filter === type;
            const count = type === 'All' ? projects.length : projects.filter(p => p.type === type).length;
            
            return (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 border ${
                  isActive 
                    ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
                    : 'bg-white/[0.02] border-white/5 text-white/50 hover:text-white hover:bg-white/5 hover:border-white/10'
                }`}
              >
                {type === 'Album' && <Disc3 className="w-3.5 h-3.5" />}
                {type === 'EP' && <Mic2 className="w-3.5 h-3.5" />}
                {type === 'Single' && <Music className="w-3.5 h-3.5" />}
                <span>
                  {type === 'All' ? 'All Releases' : type === 'Album' ? 'Albums' : type === 'EP' ? 'EPs' : 'Singles'}
                </span>
                <span className={`text-[10px] px-1.5 py-0.1 ml-1 rounded-full ${isActive ? 'bg-black/10 text-black' : 'bg-white/5 text-white/35 font-mono'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Vertical Timeline Track */}
        <div className="relative pl-6 md:pl-10 border-l border-white/10 space-y-12 ml-4">
          
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, idx) => {
              const isCurrent = currentProject?.id === project.id;
              const isCurrentlyPlaying = isCurrent && isPlaying;
              const runtime = getProjectRuntime(project);
              const runtimeStr = formatProjectRuntime(runtime, project.type);

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4, delay: idx * 0.04 }}
                  onClick={() => navigate(`/project/${project.id}`)}
                  className="relative group cursor-pointer select-none"
                >
                  
                  {/* Outer glowing point indicator node along vertical border */}
                  <div className="absolute -left-[31px] md:-left-[47px] top-6 flex items-center justify-center z-20">
                    <div className={`w-3.5 h-3.5 rounded-full transition-all duration-500 ring-4 ${
                      isCurrentlyPlaying 
                        ? 'bg-cyan-400 ring-cyan-500/20 scale-125 shadow-[0_0_12px_rgba(6,182,212,0.8)]' 
                        : 'bg-white/20 ring-transparent group-hover:bg-cyan-500 group-hover:ring-cyan-500/20 scale-100'
                    }`} />
                  </div>

                  {/* Beautiful Glassmorphism Release Card */}
                  <div className={`p-4 md:p-5 rounded-2xl transition-all duration-300 border ${
                    isCurrent 
                      ? 'bg-white/10 border-cyan-500/30 shadow-[0_0_25px_rgba(0,250,250,0.06)]' 
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10'
                  }`}>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                      
                      {/* Cover art display */}
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shadow-lg bg-black/40 shrink-0 self-start sm:self-center">
                        <DriveImage fileId={project.coverArtId} className="w-full h-full transform group-hover:scale-105 transition-transform duration-500" />
                        
                        {/* Play Action Hover overlay on artwork */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                          <button
                            type="button"
                            onClick={(e) => handlePlayProject(e, project)}
                            className="p-2 bg-white rounded-full text-black hover:scale-105 active:scale-95 transition-all shadow-md"
                            aria-label="Play Action"
                          >
                            {isCurrentlyPlaying ? (
                              <Pause className="w-4 h-4 text-black fill-current" />
                            ) : (
                              <Play className="w-4 h-4 text-black fill-current ml-0.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Info details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded ${
                            project.type === 'Album' 
                              ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' 
                              : project.type === 'EP' 
                                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-400/20' 
                                : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          }`}>
                            {project.type}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors truncate mb-1">
                          {project.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-white/40">
                          <span>{project.tracks.length} track{project.tracks.length !== 1 ? 's' : ''}</span>
                          <span>•</span>
                          <span className="text-cyan-400/80 font-medium">{runtimeStr}</span>
                        </div>
                      </div>

                      {/* Mini visual state bar */}
                      {isCurrentlyPlaying && (
                        <div className="self-end sm:self-center">
                          <div className="flex gap-0.5 items-end h-4 w-4">
                            <span className="w-0.5 bg-cyan-400 animate-[bounce_0.8s_infinite] h-2" style={{ animationDelay: '0.1s' }} />
                            <span className="w-0.5 bg-cyan-400 animate-[bounce_0.8s_infinite] h-4" style={{ animationDelay: '0.3s' }} />
                            <span className="w-0.5 bg-cyan-400 animate-[bounce_0.8s_infinite] h-3" style={{ animationDelay: '0.5s' }} />
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredProjects.length === 0 && (
            <div className="text-white/20 text-center py-20 text-xs font-mono uppercase tracking-widest leading-loose">
              No matching archival releases in this view path
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
