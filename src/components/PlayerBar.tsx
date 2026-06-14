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
  const { currentTrack, currentProject, isPlaying, progress, duration, volume, togglePlayPause, nextTrack, prevTrack, seek, setVolume } = usePlayer();

  if (!currentTrack) {
    return (
      <footer className="h-[90px] bg-[#121212] border-t border-white/5 flex items-center px-6" />
    );
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(Number(e.target.value));
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  };

  return (
    <footer className="h-[90px] bg-[#121212] border-t border-white/5 flex items-center px-6 justify-between z-20">
      
      {/* Now Playing Info */}
      <div className="flex items-center gap-4 w-[30%] min-w-[200px]">
        <div className="w-14 h-14 rounded bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-lg overflow-hidden">
          {currentProject?.coverArtId ? (
            <DriveImage fileId={currentProject.coverArtId} className="w-full h-full" />
          ) : (
            <div className="w-full h-full" />
          )}
        </div>
        <div className="flex flex-col">
          <p className="text-sm font-bold text-white hover:underline cursor-pointer truncate">{currentTrack.title}</p>
          <p className="text-xs text-white/60 hover:underline cursor-pointer truncate">{currentProject?.title}</p>
        </div>
      </div>

      {/* Primary Controls */}
      <div className="flex flex-col items-center gap-2 w-[40%] max-w-[500px]">
        <div className="flex items-center gap-6">
          <button className="text-white/40 hover:text-white transition-colors"><Shuffle className="w-5 h-5" /></button>
          <button onClick={prevTrack} className="text-white hover:text-purple-400 transition-colors"><SkipBack className="w-6 h-6 fill-current" /></button>
          <button
            onClick={togglePlayPause}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-black hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>
          <button onClick={nextTrack} className="text-white hover:text-purple-400 transition-colors"><SkipForward className="w-6 h-6 fill-current" /></button>
          <button className="text-white/40 hover:text-white transition-colors"><Repeat className="w-5 h-5" /></button>
        </div>
        
        <div className="flex items-center w-full gap-3 max-w-md">
          <span className="text-[10px] text-white/40 w-8 text-right">{formatTime(progress)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={progress}
            onChange={handleSeek}
            className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-runnable-track]:bg-gradient-to-r [&::-webkit-slider-runnable-track]:from-purple-500 [&::-webkit-slider-runnable-track]:to-purple-500"
          />
          <span className="text-[10px] text-white/40 w-8">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Secondary Controls */}
      <div className="flex items-center justify-end w-[30%] gap-4 pr-2">
        <Volume2 className="w-5 h-5 text-white/40 hover:text-white" />
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={handleVolume}
            className="w-24 h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-0 [&::-webkit-slider-thumb]:h-0 [&::-webkit-slider-runnable-track]:bg-gradient-to-r [&::-webkit-slider-runnable-track]:from-blue-500 [&::-webkit-slider-runnable-track]:to-blue-500"
          />
        </div>
      </div>

    </footer>
  );
}
