import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { DriveImage } from '../components/DriveImage';
import { usePlayer } from '../context/PlayerContext';
import { Play, Clock, Pause, ChevronLeft, Volume2, Music } from 'lucide-react';
import { formatTrackDuration, formatProjectRuntime } from '../lib/time';
import { motion } from 'motion/react';

export function AlbumView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, durations, getProjectRuntime, fetchProjectDurations } = useLibrary();
  const { currentTrack, playTrack, currentProject, isPlaying, togglePlayPause } = usePlayer();

  const project = projects.find(p => p.id === id);

  // Progressive rendering state for displaying long tracks lists cleanly list
  const [visibleCount, setVisibleCount] = React.useState(15);

  const visibleTracks = React.useMemo(() => {
    if (!project) return [];
    return project.tracks.slice(0, visibleCount);
  }, [project, visibleCount]);

  React.useEffect(() => {
    setVisibleCount(15); // Reset limit on project mount or change
  }, [id]);

  React.useEffect(() => {
    if (project && visibleTracks.length > 0) {
      const visibleTrackIds = visibleTracks.map(t => t.id);
      fetchProjectDurations(project, visibleTrackIds);
    }
  }, [project, visibleTracks, fetchProjectDurations]);

  React.useEffect(() => {
    if (!project || visibleCount >= project.tracks.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 10, project.tracks.length));
        }
      },
      { rootMargin: '250px' } // Preload tracks 250px before entering viewport
    );

    const sentinel = document.getElementById('tracklist-sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => observer.disconnect();
  }, [project, visibleCount]);

  if (!project) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-white/40 bg-[#050505]">
        <p className="font-mono text-xs mb-4">Project Archive Not Found</p>
        <button onClick={() => navigate('/')} className="text-sm font-bold text-cyan-400 hover:underline">
          Return to Discography
        </button>
      </div>
    );
  }

  const isCurrentProject = currentProject?.id === project.id;
  const isProjectPlaying = isCurrentProject && isPlaying;
  
  const projectRuntime = getProjectRuntime(project);

  const handlePlayAll = () => {
    if (project.tracks.length > 0) {
      if (isCurrentProject) {
        togglePlayPause();
      } else {
        // Start streaming album from the beginning with target queue
        playTrack(project.tracks[0], project, project.tracks);
      }
    }
  };

  const handleTrackSelect = (track: any) => {
    const isThisTrack = currentTrack?.id === track.id;
    if (isThisTrack) {
      togglePlayPause();
    } else {
      playTrack(track, project, project.tracks);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="pb-32 min-h-screen bg-[#050505] relative z-10 select-none scroll-smooth"
    >
      {/* Decorative localized ambient glowing spot */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/10 to-transparent blur-[120px] pointer-events-none -z-10" />

      {/* Header action bar */}
      <div className="px-6 md:px-8 pt-6 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-white/60 hover:text-white transition-colors uppercase tracking-wider font-mono bg-white/[0.02] hover:bg-white/5 border border-white/5 px-3 py-2 rounded-full"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Catalog
        </button>
      </div>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10 px-6 md:px-8 py-8 md:py-12">
        <div className="w-56 h-56 sm:w-64 sm:h-64 shrink-0 shadow-[0_4px_45px_rgba(0,0,0,0.85)] overflow-hidden rounded-2xl bg-white/5 border border-white/10 group relative">
          <DriveImage fileId={project.coverArtId} priority={true} className="w-full h-full transform group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors pointer-events-none" />
        </div>
        
        <div className="flex flex-col items-center md:items-start text-center md:text-left min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-[0.25em] font-black text-white/40 mb-2 font-mono">
            Verified {project.type}
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight mb-4 max-w-full break-words">
            {project.title}
          </h1>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm text-white/50 font-semibold font-mono">
            <img 
              src="https://raw.githubusercontent.com/Samplayshindi/radio/main/cropped_circle_image.png" 
              alt="Radio Waves" 
              className="w-5 h-5 rounded-full object-cover shrink-0 ring-1 ring-white/10" 
              referrerPolicy="no-referrer"
            />
            <span className="text-white hover:text-cyan-400 transition-colors select-none font-bold">Radio Waves</span>
            <span className="text-white/20">•</span>
            <span className="text-xs font-normal text-white/70">{project.tracks.length} track{project.tracks.length !== 1 && 's'}</span>
            <span className="text-white/20">•</span>
            <span className="text-xs font-normal text-cyan-400">{formatProjectRuntime(projectRuntime, project.type)}</span>
          </div>
        </div>
      </div>

      {/* Sticky Action / Playback Controls Bar */}
      <div className="sticky top-[53px] md:top-0 z-20 bg-[#050505]/90 backdrop-blur-md px-6 md:px-8 py-4 flex items-center justify-between gap-4 border-b border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-4 min-w-0">
          <button 
            onClick={handlePlayAll}
            className="px-6 py-3 rounded-full flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl font-bold text-xs tracking-wider uppercase rgb-btn select-none shrink-0"
            id={`play-all-btn-${project.id}`}
          >
            {isProjectPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current text-white animate-pulse" />
                <span>Pause Release</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-white ml-0.5" />
                <span>Play Release</span>
              </>
            )}
          </button>
          
          <div className="hidden sm:flex flex-col min-w-0">
            <span className="text-white font-extrabold text-sm truncate">{project.title}</span>
            <span className="text-white/40 text-[10px] uppercase tracking-wider font-mono">Radio Waves</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-semibold font-mono text-white/40">
          <span className="hidden md:inline">{project.tracks.length} tracks</span>
          <span className="hidden md:inline text-white/10">•</span>
          <span className="text-cyan-400">{formatProjectRuntime(projectRuntime, project.type)}</span>
        </div>
      </div>

      {/* Tracklist List */}
      <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto w-full">
        {/* Table Head */}
        <div className="grid grid-cols-[40px_1fr_60px] md:grid-cols-[48px_1fr_80px] gap-4 px-4 py-3 border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2 font-bold font-mono">
          <div className="text-center">#</div>
          <div>Title</div>
          <div className="text-right flex items-center justify-end"><Clock className="w-4 h-4 mr-1 shrink-0" /> TIME</div>
        </div>

        {/* Tracks Grid Loop */}
        <div className="space-y-1">
          {visibleTracks.map((track, i) => {
            const isThisTrackActive = currentTrack?.id === track.id;
            const isThisTrackPlaying = isThisTrackActive && isPlaying;
            const itemDuration = durations[track.id] || 0;

            return (
              <div 
                key={track.id}
                onClick={() => handleTrackSelect(track)}
                className={`group grid grid-cols-[40px_1fr_60px] md:grid-cols-[48px_1fr_80px] gap-4 px-4 py-3.5 rounded-xl cursor-pointer items-center transition-all duration-300 select-none border-l-2 ${
                  isThisTrackActive 
                    ? 'bg-white/[0.08] text-cyan-450 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.04)] pl-3.5' 
                    : 'hover:bg-white/[0.04] text-white/85 border-transparent active:bg-white/[0.02]'
                }`}
                id={`track-row-${track.id}`}
              >
                {/* Track Index/Action Selector */}
                <div className="flex items-center justify-center w-full min-h-[24px]">
                  {/* Active playing indicator wave */}
                  {isThisTrackPlaying ? (
                    <div className="flex gap-0.5 items-end h-3 w-4 justify-center group-hover:hidden">
                      <span className="w-0.5 bg-cyan-400 animate-[bounce_0.6s_infinite] h-2" style={{ animationDelay: '0.1s' }} />
                      <span className="w-0.5 bg-cyan-400 animate-[bounce_0.6s_infinite] h-3.5" style={{ animationDelay: '0.3s' }} />
                      <span className="w-0.5 bg-cyan-400 animate-[bounce_0.6s_infinite] h-1.5" style={{ animationDelay: '0.5s' }} />
                    </div>
                  ) : isThisTrackActive ? (
                    <Volume2 className="w-4 h-4 text-cyan-400 group-hover:hidden shrink-0" />
                  ) : (
                    <span className="text-xs font-mono font-medium text-white/20 group-hover:hidden">
                      {String(track.trackNumber).padStart(2, '0')}
                    </span>
                  )}

                  {/* Explicit custom control buttons on Hover */}
                  <div className="hidden group-hover:flex items-center justify-center shrink-0">
                    {isThisTrackPlaying ? (
                      <Pause className="w-3.5 h-3.5 fill-current text-cyan-400" id={`pause-track-${track.id}`} />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current text-white ml-0.5" id={`play-track-${track.id}`} />
                    )}
                  </div>
                </div>

                {/* Track title and descriptive meta details */}
                <div className="min-w-0 pr-2">
                  <p className={`font-bold text-sm truncate leading-snug transition-colors ${isThisTrackActive ? 'text-cyan-300 font-black' : 'text-white'}`}>
                    {track.title}
                  </p>
                  <p className="text-[10px] text-white/35 font-mono truncate uppercase tracking-widest mt-0.5">Radio Waves</p>
                </div>

                {/* Duration text */}
                <div className={`text-right text-xs font-mono font-bold tracking-tight ${isThisTrackActive ? 'text-cyan-300' : 'text-white/30'}`}>
                  {formatTrackDuration(itemDuration)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sentinel to lazy-load more tracks dynamically on scroll */}
        {project.tracks.length > visibleCount && (
          <div id="tracklist-sentinel" className="h-10 flex items-center justify-center text-white/20 text-[10px] uppercase tracking-widest font-mono py-4">
            Loading tracks...
          </div>
        )}
      </div>
    </motion.div>
  );
}
