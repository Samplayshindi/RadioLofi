import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { Track, Project } from '../types';
import { getAccessToken } from '../lib/firebase';

interface PlayerContextType {
  currentTrack: Track | null;
  currentProject: Project | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  queue: Track[];
  playTrack: (track: Track, project: Project, queue?: Track[]) => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
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
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [queue, setQueue] = useState<Track[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;

    const audio = audioRef.current;
    
    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => nextTrack();
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  const playTrack = async (track: Track, project: Project, newQueue?: Track[]) => {
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('No admin token');

      // To play directly without building a blob (which takes RAM), 
      // we can append access_token to the URL.
      // E.g., https://www.googleapis.com/drive/v3/files/ID?alt=media&access_token=...
      const src = `https://www.googleapis.com/drive/v3/files/${track.driveFileId}?alt=media&access_token=${token}`;
      
      setCurrentTrack(track);
      setCurrentProject(project);
      if (newQueue) setQueue(newQueue);
      
      if (audioRef.current) {
        audioRef.current.src = src;
        audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Failed to play track:', err);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    if (!currentTrack || queue.length === 0) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    if (currentIndex >= 0 && currentIndex < queue.length - 1) {
      playTrack(queue[currentIndex + 1], currentProject as Project, queue);
    }
  };

  const prevTrack = () => {
    if (!currentTrack || queue.length === 0) return;
    if (progress > 3) {
      seek(0);
      return;
    }
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    if (currentIndex > 0) {
      playTrack(queue[currentIndex - 1], currentProject as Project, queue);
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const setVolume = (vol: number) => {
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    setVolumeState(vol);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        currentProject,
        isPlaying,
        progress,
        duration,
        volume,
        queue,
        playTrack,
        togglePlayPause,
        nextTrack,
        prevTrack,
        seek,
        setVolume
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
