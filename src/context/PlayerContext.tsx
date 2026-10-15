import React, { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import { Track, Project } from '../types';
import { normalizeAudioUrl } from '../lib/drive';

interface PlayerContextType {
  currentTrack: Track | null;
  currentProject: Project | null;
  isPlaying: boolean;
  volume: number;
  queue: Track[];
  currentTime: number;
  duration: number;
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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(() => {
    try {
      const saved = localStorage.getItem('rw_volume');
      return saved ? parseFloat(saved) : 0.85;
    } catch {
      return 0.85;
    }
  });
  const [queue, setQueue] = useState<Track[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Active state ref to avoid stale closures in event listeners
  const stateRef = useRef({
    currentTrack,
    currentProject,
    queue,
    isPlaying
  });

  useEffect(() => {
    stateRef.current = {
      currentTrack,
      currentProject,
      queue,
      isPlaying
    };
  }, [currentTrack, currentProject, queue, isPlaying]);

  const playTrackInternal = useCallback(async (track: Track, project: Project, newQueue?: Track[]) => {
    try {
      const src = normalizeAudioUrl(track.driveFileId);
      setCurrentTrack(track);
      setCurrentProject(project);
      if (newQueue) {
        setQueue(newQueue);
      }
      
      if (audioRef.current) {
        audioRef.current.src = src;
        audioRef.current.load();
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (playErr) {
          console.warn('Playback interrupted:', playErr);
          setIsPlaying(false);
        }
      }
    } catch (err) {
      console.error('Failed to play track:', err);
    }
  }, []);

  const nextTrack = useCallback(() => {
    const { queue: q, currentTrack: ct, currentProject: cp } = stateRef.current;
    if (!ct || q.length === 0) return;
    const idx = q.findIndex(t => t.id === ct.id);
    if (idx >= 0 && idx < q.length - 1) {
      playTrackInternal(q[idx + 1], cp as Project, q);
    }
  }, [playTrackInternal]);

  const prevTrack = useCallback(() => {
    const { queue: q, currentTrack: ct, currentProject: cp } = stateRef.current;
    if (!ct || q.length === 0) return;
    
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    
    const idx = q.findIndex(t => t.id === ct.id);
    if (idx > 0) {
      playTrackInternal(q[idx - 1], cp as Project, q);
    }
  }, [playTrackInternal]);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn('Play was prevented:', err);
      });
    }
  }, [currentTrack, isPlaying]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    setVolumeState(clamped);
    try {
      localStorage.setItem('rw_volume', clamped.toString());
    } catch {}
  }, []);

  // Initialize Audio element with robust event handling
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous';
    audio.volume = volume;
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      nextTrack();
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.pause();
      audio.src = '';
    };
  }, [nextTrack, volume]);

  // Global keyboard shortcuts (Space: play/pause when not in an input)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause]);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        currentProject,
        isPlaying,
        volume,
        queue,
        currentTime,
        duration,
        playTrack: playTrackInternal,
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
