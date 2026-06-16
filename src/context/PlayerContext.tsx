import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { Track, Project } from '../types';

interface PlayerContextType {
  currentTrack: Track | null;
  currentProject: Project | null;
  isPlaying: boolean;
  volume: number;
  queue: Track[];
  playTrack: (track: Track, project: Project, queue?: Track[]) => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
};

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState((() => {
    try {
      const saved = localStorage.getItem('rw_volume');
      return saved ? parseFloat(saved) : 0.8;
    } catch {
      return 0.8;
    }
  })());
  const [queue, setQueue] = useState<Track[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Keep references to active state for listeners to avoid stale closures
  const activeStateRef = useRef({
    currentTrack,
    currentProject,
    queue,
    isPlaying
  });

  useEffect(() => {
    activeStateRef.current = {
      currentTrack,
      currentProject,
      queue,
      isPlaying
    };
  }, [currentTrack, currentProject, queue, isPlaying]);

  useEffect(() => {
    // Persistent single audio instance
    const audio = new Audio();
    audio.preload = 'auto'; // Optimize buffering
    audio.crossOrigin = 'anonymous';
    audio.volume = volume;
    audioRef.current = audio;

    const handleEnded = () => {
      const { queue: currentQueue, currentTrack: activeTrack, currentProject: activeProj } = activeStateRef.current;
      if (!activeTrack || currentQueue.length === 0) return;
      const currentIndex = currentQueue.findIndex(t => t.id === activeTrack.id);
      if (currentIndex >= 0 && currentIndex < currentQueue.length - 1) {
        playTrackInternal(currentQueue[currentIndex + 1], activeProj as Project, currentQueue);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  const playTrackInternal = async (track: Track, project: Project, newQueue?: Track[]) => {
    try {
      let src = track.driveFileId;
      if (!src.startsWith('/') && !src.startsWith('http')) {
        src = `https://drive.google.com/uc?export=download&id=${track.driveFileId}`;
      }
      
      setCurrentTrack(track);
      setCurrentProject(project);
      if (newQueue) {
        setQueue(newQueue);
      }
      
      if (audioRef.current) {
        audioRef.current.src = src;
        audioRef.current.preload = 'auto';
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (playErr) {
          console.warn('Playback interrupted or failed:', playErr);
          setIsPlaying(false);
        }
      }
    } catch (err) {
      console.error('Failed to play track:', err);
    }
  };

  const playTrack = (track: Track, project: Project, newQueue?: Track[]) => {
    playTrackInternal(track, project, newQueue);
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn('Play was prevented or failed:', err);
      });
    }
  };

  const nextTrack = () => {
    const { queue: currentQueue, currentTrack: activeTrack, currentProject: activeProj } = activeStateRef.current;
    if (!activeTrack || currentQueue.length === 0) return;
    const currentIndex = currentQueue.findIndex(t => t.id === activeTrack.id);
    if (currentIndex >= 0 && currentIndex < currentQueue.length - 1) {
      playTrackInternal(currentQueue[currentIndex + 1], activeProj as Project, currentQueue);
    }
  };

  const prevTrack = () => {
    const { queue: currentQueue, currentTrack: activeTrack, currentProject: activeProj } = activeStateRef.current;
    if (!activeTrack || currentQueue.length === 0) return;
    
    if (audioRef.current && audioRef.current.currentTime > 3) {
      seek(0);
      return;
    }
    
    const currentIndex = currentQueue.findIndex(t => t.id === activeTrack.id);
    if (currentIndex > 0) {
      playTrackInternal(currentQueue[currentIndex - 1], activeProj as Project, currentQueue);
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const setVolume = (vol: number) => {
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    setVolumeState(vol);
    try {
      localStorage.setItem('rw_volume', vol.toString());
    } catch {}
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        currentProject,
        isPlaying,
        volume,
        queue,
        playTrack,
        togglePlayPause,
        nextTrack,
        prevTrack,
        seek,
        setVolume,
        audioRef
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
