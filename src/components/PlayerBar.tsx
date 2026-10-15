import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, Disc3 } from 'lucide-react';
import { DriveImage } from './DriveImage';
import { useNavigate } from 'react-router-dom';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function PlayerBar() {
  const { 
    currentTrack, 
    currentProject, 
    isPlaying, 
    volume, 
    currentTime, 
    duration,
    togglePlayPause, 
    nextTrack, 
    prevTrack, 
    seek, 
    setVolume 
  } = usePlayer();

  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  if (!currentTrack) {
    return (
      <footer className="h-20 bg-[#090c14] dark:bg-[#07090e] border-t border-white/[0.06] flex items-center justify-between px-6 z-40 select-none">
        <div className="flex items-center gap-3 text-slate-500 text-xs font-mono">
          <Disc3 className="w-5 h-5 opacity-40" />
          <span>No track selected • Select any song to begin playback</span>
        </div>
      </footer>
    );
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(parseFloat(e.target.value));
  };

  const handleVolumeToggle = () => {
    if (isMuted) {
      setVolume(prevVolume || 0.8);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const trackDuration = duration > 0 ? duration : (currentTrack.duration || 0);
  const progressPercent = trackDuration > 0 ? (currentTime / trackDuration) * 100 : 0;

  return (
    <footer className="h-24 bg-[#0a0d14]/95 dark:bg-[#06080e]/95 backdrop-blur-xl border-t border-white/[0.08] flex items-center justify-between px-4 md:px-8 z-40 select-none shrink-0 shadow-2xl">
      {/* Track & Project Information */}
      <div className="flex items-center gap-3.5 w-1/4 min-w-[180px]">
        {currentProject && (
          <div 
            onClick={() => navigate(`/project/${currentProject.id}`)}
            className="relative w-14 h-14 rounded-xl overflow-hidden shadow-lg cursor-pointer group shrink-0 bg-black/40 border border-white/10"
          >
            <DriveImage
              fileId={currentProject.coverArtId}
              alt={currentTrack.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-0.5">
                <span className="w-1 bg-cyan-400 rounded-full animate-eq-1" />
                <span className="w-1 bg-cyan-400 rounded-full animate-eq-2" />
                <span className="w-1 bg-cyan-400 rounded-full animate-eq-3" />
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col min-w-0 pr-2">
          <h4 className="text-sm font-bold text-white truncate tracking-tight font-display">
            {currentTrack.title}
          </h4>
          <span 
            onClick={() => currentProject && navigate(`/project/${currentProject.id}`)}
            className="text-xs text-slate-400 truncate cursor-pointer hover:text-cyan-400 transition-colors mt-0.5"
          >
            {currentProject?.title || 'Radio Waves'}
          </span>
        </div>
      </div>

      {/* Primary Center Controls & Progress Bar */}
      <div className="flex flex-col items-center max-w-xl w-2/4 px-2 md:px-6">
        <div className="flex items-center gap-4 md:gap-6 mb-2">
          <button 
            onClick={() => setIsShuffle(!isShuffle)}
            className={`p-1.5 transition-colors hidden sm:block ${
              isShuffle ? 'text-cyan-400' : 'text-slate-500 hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button 
            onClick={prevTrack} 
            className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Previous track"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={togglePlayPause}
            className="w-11 h-11 rounded-full bg-white hover:bg-cyan-400 text-black flex items-center justify-center transition-all duration-200 shadow-lg shadow-white/10 hover:shadow-cyan-400/30 hover:scale-105 active:scale-95 cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button 
            onClick={nextTrack} 
            className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Next track"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          <button 
            onClick={() => setIsRepeat(!isRepeat)}
            className={`p-1.5 transition-colors hidden sm:block ${
              isRepeat ? 'text-cyan-400' : 'text-slate-500 hover:text-white'
            }`}
            title="Repeat"
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Scrub Bar */}
        <div className="w-full flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-400 w-9 text-right tabular-nums">
            {formatTime(currentTime)}
          </span>

          <div className="relative flex-1 flex items-center h-4 group cursor-pointer">
            <input
              type="range"
              min={0}
              max={trackDuration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            {/* Background Track */}
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden group-hover:h-1.5 transition-all">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {/* Scrubber thumb */}
            <div 
              className="absolute w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -translate-x-1/2"
              style={{ left: `${progressPercent}%` }}
            />
          </div>

          <span className="text-[11px] font-mono text-slate-400 w-9 text-left tabular-nums">
            {formatTime(trackDuration)}
          </span>
        </div>
      </div>

      {/* Volume & Utility Controls */}
      <div className="flex items-center justify-end gap-3 w-1/4">
        <div className="flex items-center gap-2.5 hidden sm:flex">
          <button 
            onClick={handleVolumeToggle}
            className="text-slate-400 hover:text-white transition-colors p-1"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              if (isMuted) setIsMuted(false);
              setVolume(parseFloat(e.target.value));
            }}
            className="w-20 md:w-24 h-1 bg-white/10 rounded-full accent-cyan-400 cursor-pointer"
          />
        </div>
      </div>
    </footer>
  );
}
