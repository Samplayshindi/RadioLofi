import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '../types';
import { DriveImage } from './DriveImage';
import { Play, Pause } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useLibrary } from '../context/LibraryContext';
import { formatProjectRuntime } from '../lib/time';

interface ProjectCardProps {
  project: Project;
  key?: React.Key;
}

export const ProjectCard = memo(function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();
  const { playTrack, currentProject, isPlaying, togglePlayPause } = usePlayer();
  const { getProjectRuntime } = useLibrary();

  const isCurrent = currentProject?.id === project.id;
  const isCurrentlyPlaying = isCurrent && isPlaying;
  
  const runtime = getProjectRuntime(project);
  const runtimeStr = formatProjectRuntime(runtime, project.type);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (project.tracks.length > 0) {
      if (isCurrent) {
        togglePlayPause();
      } else {
        playTrack(project.tracks[0], project, project.tracks);
      }
    }
  };

  return (
    <div 
      onClick={() => navigate(`/project/${project.id}`)}
      className={`animate-fade-in-up relative p-4 rounded-2xl cursor-pointer group transition-all duration-300 hover:-translate-y-1 select-none will-change-transform ${
        isCurrent 
          ? 'bg-white/10 ring-1 ring-cyan-500/30 shadow-[0_0_20px_rgba(0,250,250,0.05)]' 
          : 'bg-white/[0.02] hover:bg-white/5 border border-white/5 hover:border-white/10'
      }`}
    >
      {/* Artwork Wrapper */}
      <div className="relative aspect-square rounded-xl overflow-hidden mb-4 shadow-lg bg-black/40">
        <DriveImage fileId={project.coverArtId} className="w-full h-full transform group-hover:scale-105 transition-transform duration-500" />
        
        {/* Glow overlay if playing */}
        {isCurrentlyPlaying && (
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 via-transparent to-pink-500/10 pointer-events-none" />
        )}

        {/* Play Action Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
          <button 
            type="button"
            onClick={handlePlayClick}
            className="w-12 h-12 rounded-full flex items-center justify-center text-black shadow-2xl scale-95 group-hover:scale-100 transition-all duration-300 rgb-btn"
            aria-label={isCurrentlyPlaying ? 'Pause' : 'Play'}
          >
            {isCurrentlyPlaying ? (
              <Pause className="w-5 h-5 text-white fill-current" />
            ) : (
              <Play className="w-5 h-5 text-white fill-current ml-0.5" />
            )}
          </button>
        </div>

        {/* Mini Waveforms if playing */}
        {isCurrentlyPlaying && (
          <div className="absolute bottom-3 right-3 flex gap-0.5 items-end h-4 w-4">
            <span className="w-0.5 bg-cyan-400 animate-[bounce_0.8s_infinite]" style={{ animationDelay: '0.1s' }} />
            <span className="w-0.5 bg-pink-500 animate-[bounce_0.8s_infinite]" style={{ animationDelay: '0.3s' }} />
            <span className="w-0.5 bg-purple-400 animate-[bounce_0.8s_infinite]" style={{ animationDelay: '0.5s' }} />
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="min-w-0">
        <h4 className="font-bold text-sm text-white truncate mb-0.5 group-hover:text-cyan-300 transition-colors">
          {project.title}
        </h4>
        <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] uppercase font-bold tracking-wider text-white/45">
          <span>{project.type}</span>
          <span className="text-right truncate max-w-full">
            {project.tracks.length} track{project.tracks.length !== 1 ? 's' : ''} • {runtimeStr}
          </span>
        </div>
      </div>
    </div>
  );
});
