import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { DriveImage } from '../components/DriveImage';
import { usePlayer } from '../context/PlayerContext';
import { Play, Clock, Pause, ChevronLeft, Disc3 } from 'lucide-react';
import { formatTrackDuration, formatProjectRuntime } from '../lib/time';

export function AlbumView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, durations, getProjectRuntime } = useLibrary();
  const { currentTrack, playTrack, currentProject, isPlaying, togglePlayPause } = usePlayer();

  const project = useMemo(() => {
    return projects.find(p => p.id === id);
  }, [projects, id]);

  if (!project) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-[#07090e] p-8 text-center min-h-[500px]">
        <Disc3 className="w-12 h-12 opacity-20 mb-4 text-cyan-400" />
        <p className="font-display font-black text-xl text-white mb-4">Release Not Found</p>
        <button 
          onClick={() => navigate('/')} 
          className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 hover:text-black hover:bg-cyan-400 px-5 py-2.5 rounded-xl border border-cyan-400/30 transition-all cursor-pointer"
        >
          Return to Archive
        </button>
      </div>
    );
  }

  const isCurrentProject = currentProject?.id === project.id;
  const isProjectPlaying = isCurrentProject && isPlaying;
  const totalRuntimeSeconds = getProjectRuntime(project);
  const totalRuntimeFormatted = formatProjectRuntime(totalRuntimeSeconds);

  const handlePlayAll = () => {
    if (project.tracks.length > 0) {
      if (isCurrentProject) {
        togglePlayPause();
      } else {
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
    <div className="min-h-screen bg-[#07090e] text-white pb-36 select-none overflow-x-hidden">
      {/* Top Back Navigation Bar */}
      <div className="px-6 md:px-12 py-4 border-b border-white/[0.06] flex items-center justify-between bg-[#07090e]/80 backdrop-blur-md sticky top-0 z-30">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>

        <div className="text-xs font-mono text-cyan-400/80 font-bold uppercase tracking-wider">
          {project.type} Release
        </div>
      </div>

      {/* Hero Header Area */}
      <section className="relative px-6 md:px-12 py-10 md:py-14 border-b border-white/[0.06] overflow-hidden">
        {/* Ambient background glow from artwork */}
        <div className="absolute top-0 right-1/3 w-[600px] h-[400px] bg-cyan-500/[0.08] rounded-full blur-[160px] pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-end gap-8 md:gap-12 relative z-10">
          {/* Prominent Artwork Display */}
          <div className="relative group shrink-0">
            <div className="w-56 h-56 md:w-72 md:h-72 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/50">
              <DriveImage
                fileId={project.coverArtId}
                alt={project.title}
                priority={true}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Album Information */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left min-w-0 flex-1">
            <span className="px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-3">
              {project.type}
            </span>

            <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight mb-2">
              {project.title}
            </h1>

            <p className="text-lg text-slate-300 font-semibold mb-6">
              Radio Waves
            </p>

            {/* Metadata Badges */}
            <div className="flex items-center flex-wrap gap-4 text-xs font-mono text-slate-400 mb-8">
              <span className="flex items-center gap-1.5">
                <Disc3 className="w-4 h-4 text-slate-500" />
                {project.tracks.length} {project.tracks.length === 1 ? 'Track' : 'Tracks'}
              </span>

              {totalRuntimeSeconds > 0 && (
                <>
                  <span className="text-white/20">•</span>
                  <span className="flex items-center gap-1.5 text-cyan-300">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    Total Runtime: {totalRuntimeFormatted}
                  </span>
                </>
              )}
            </div>

            {/* Play All Button */}
            {project.tracks.length > 0 && (
              <button
                onClick={handlePlayAll}
                className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-sm uppercase tracking-wider transition-all duration-200 shadow-xl shadow-cyan-400/25 active:scale-95 cursor-pointer"
              >
                {isProjectPlaying ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" />
                    <span>Pause Album</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                    <span>Play All</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Tracklist Table */}
      <section className="px-6 md:px-12 py-10 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/[0.06] text-xs font-mono uppercase tracking-wider text-slate-400">
          <div className="flex items-center gap-4">
            <span className="w-8 text-center">#</span>
            <span>Title</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Time</span>
          </div>
        </div>

        <div className="space-y-1.5">
          {project.tracks.map((track, index) => {
            const isThisTrack = currentTrack?.id === track.id;
            const isThisPlaying = isThisTrack && isPlaying;
            const trackSec = track.duration || durations[track.id] || 0;
            const trackFormatted = formatTrackDuration(trackSec);

            return (
              <div
                key={track.id}
                onClick={() => handleTrackSelect(track)}
                className={`group flex items-center justify-between p-3.5 rounded-xl transition-all duration-150 cursor-pointer ${
                  isThisTrack
                    ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-300'
                    : 'hover:bg-white/[0.04] text-slate-300 hover:text-white border border-transparent'
                }`}
              >
                {/* Track Number / Play Action / Title */}
                <div className="flex items-center gap-4 min-w-0 pr-4">
                  {/* Number or Equalizer or Play Icon */}
                  <div className="w-8 flex items-center justify-center shrink-0">
                    {isThisPlaying ? (
                      <div className="flex items-center gap-0.5">
                        <span className="w-1 bg-cyan-400 rounded-full animate-eq-1" />
                        <span className="w-1 bg-cyan-400 rounded-full animate-eq-2" />
                        <span className="w-1 bg-cyan-400 rounded-full animate-eq-3" />
                      </div>
                    ) : (
                      <>
                        <span className="text-xs font-mono text-slate-500 group-hover:hidden">
                          {track.trackNumber || index + 1}
                        </span>
                        <Play className="w-4 h-4 fill-current text-white hidden group-hover:block" />
                      </>
                    )}
                  </div>

                  {/* Title & Artist */}
                  <div className="flex flex-col min-w-0">
                    <span className={`text-sm font-bold tracking-tight truncate ${
                      isThisTrack ? 'text-cyan-300' : 'text-white'
                    }`}>
                      {track.title}
                    </span>
                    <span className="text-xs text-slate-500 font-medium truncate">
                      Radio Waves
                    </span>
                  </div>
                </div>

                {/* Individual Play Button & Duration */}
                <div className="flex items-center gap-4 shrink-0 font-mono text-xs text-slate-400 tabular-nums">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTrackSelect(track);
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isThisPlaying
                        ? 'bg-cyan-400 text-black shadow-md'
                        : 'opacity-0 group-hover:opacity-100 hover:bg-white hover:text-black text-white'
                    }`}
                    title={isThisPlaying ? 'Pause' : 'Play track'}
                  >
                    {isThisPlaying ? (
                      <Pause className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    )}
                  </button>

                  <span className={isThisTrack ? 'text-cyan-400 font-bold' : ''}>
                    {trackFormatted}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
