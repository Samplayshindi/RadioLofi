import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle } from 'lucide-react';
import { DriveImage } from './DriveImage';

function formatTime(seconds: number) {
  if (isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function PlayerBar() {
  const { currentTrack, currentProject, isPlaying, volume, togglePlayPause, nextTrack, prevTrack, seek, setVolume, audioRef } = usePlayer();
  const [progress, setProgress] = React.useState(0);
  const [duration, setDuration] = React.useState(0);

  React.useEffect(() => {
    const audio = audioRef?.current;
    if (!audio) return;

    setProgress(audio.currentTime || 0);
    setDuration(audio.duration || 0);

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime || 0);
    };

    const handleDurationChange = () => {
      setDuration(audio.duration || 0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleDurationChange);
    audio.addEventListener('durationchange', handleDurationChange);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleDurationChange);
      audio.removeEventListener('durationchange', handleDurationChange);
    };
  }, [audioRef, currentTrack]);

  if (!currentTrack) {
    return (
      <footer className="h-16 md:h-[90px] bg-[#0c0c0c] border-t border-white/5 flex items-center px-6 relative z-30" />
    );
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    seek(val);
    setProgress(val);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  };

  return (
    <footer className="h-20 md:h-[90px] bg-[#0c0c0c]/95 backdrop-blur-md border-t border-white/5 flex items-center px-4 md:px-6 justify-between z-30 relative select-none">
      
      {/* Now Playing Info */}
      <div className="flex items-center gap-3 w-[45%] md:w-[30%] min-w-0">
        <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg bg-gradient-to-tr from-[#ff007f] to-cyan-500 shadow-md overflow-hidden shrink-0 ring-1 ring-white/10">
          {currentProject?.coverArtId ? (
            <DriveImage fileId={currentProject.coverArtId} className="w-full h-full" />
          ) : (
            <div className="w-full h-full bg-[#151515]" />
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <p className="text-xs md:text-sm font-bold text-white hover:text-cyan-400 cursor-pointer truncate">
            {currentTrack.title}
          </p>
          <p className="text-[10px] md:text-xs text-white/55 hover:underline cursor-pointer truncate">
            {currentProject?.title}
          </p>
        </div>
      </div>

      {/* Primary Playback controls */}
      <div className="flex flex-col items-center gap-1.5 flex-1 md:flex-initial md:w-[40%] max-w-[450px]">
        <div className="flex items-center gap-5">
          <button className="hidden sm:block text-white/30 hover:text-white transition-colors">
            <Shuffle className="w-4 h-4" />
          </button>
          <button 
            onClick={prevTrack} 
            className="text-white/70 hover:text-cyan-400 transition-colors"
            aria-label="Previous Track"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>
          <button
            onClick={togglePlayPause}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-black hover:scale-105 active:scale-95 transition-all duration-300 shadow-md"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4.5 h-4.5 fill-current text-black" />
            ) : (
              <Play className="w-4.5 h-4.5 fill-current text-black ml-0.5" />
            )}
          </button>
          <button 
            onClick={nextTrack} 
            className="text-white/70 hover:text-cyan-400 transition-colors"
            aria-label="Next Track"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
          <button className="hidden sm:block text-white/30 hover:text-white transition-colors">
            <Repeat className="w-4 h-4" />
          </button>
        </div>
        
        {/* Seek timeline (hidden on small phones, visible on larger viewports) */}
        <div className="hidden sm:flex items-center w-full gap-2.5">
          <span className="text-[9px] font-mono text-white/40 w-7 text-right">{formatTime(progress)}</span>
          <div className="flex-1 flex items-center relative group">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={progress}
              onChange={handleSeek}
              className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:bg-cyan-400 transition-all"
            />
          </div>
          <span className="text-[9px] font-mono text-white/40 w-7">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume / Secondary controllers */}
      <div className="hidden md:flex items-center justify-end w-[30%] gap-3 pr-2">
        <Volume2 className="w-4 h-4 text-white/40 hover:text-white" />
        <div className="flex items-center">
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={handleVolume}
            className="w-20 lg:w-24 h-1 bg-white/10 rounded-full appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:bg-cyan-400 transition-all"
            aria-label="Volume Slider"
          />
        </div>
      </div>

    </footer>
  );
}
