import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '../types';
import { DriveImage } from './DriveImage';
import { Play, Pause, Disc3, Clock } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useLibrary } from '../context/LibraryContext';
import { formatProjectRuntime } from '../lib/time';

import { imagePreloader } from '../lib/imagePreloader';

interface ProjectCardProps {
  project: Project;
  priority?: boolean;
}

export const ProjectCard = memo(function ProjectCard({ project, priority = false }: ProjectCardProps) {
  const navigate = useNavigate();
  const { currentProject, isPlaying, playTrack, togglePlayPause } = usePlayer();
  const { getProjectRuntime } = useLibrary();

  const isCurrent = currentProject?.id === project.id;
  const isThisPlaying = isCurrent && isPlaying;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlayPause();
    } else if (project.tracks.length > 0) {
      playTrack(project.tracks[0], project, project.tracks);
    }
  };

  const handleCardClick = () => {
    navigate(`/project/${project.id}`);
  };

  const handleMouseEnter = () => {
    if (project.coverArtId) {
      // Prefetch large 800px artwork in advance for the destination Album page
      imagePreloader.preload(project.coverArtId, { priority: true, width: 800 });
    }
  };

  const runtimeSec = getProjectRuntime(project);
  const runtimeFormatted = formatProjectRuntime(runtimeSec);

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      className="group relative flex flex-col bg-slate-900/40 dark:bg-[#0c101a]/70 hover:bg-slate-800/60 dark:hover:bg-[#121826] border border-white/[0.06] hover:border-cyan-500/30 rounded-2xl p-3.5 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1 select-none"
    >
      {/* Artwork Container */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-black/40">
        <DriveImage
          fileId={project.coverArtId}
          alt={project.title}
          priority={priority}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Floating Quick Play Action Button */}
        <button
          onClick={handlePlayClick}
          aria-label={isThisPlaying ? 'Pause' : 'Play'}
          className={`absolute bottom-3 right-3 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-xl cursor-pointer ${
            isThisPlaying
              ? 'bg-cyan-400 text-black scale-100 opacity-100 shadow-cyan-400/40'
              : 'bg-white text-black opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 hover:bg-cyan-400 hover:text-black hover:scale-105'
          }`}
        >
          {isThisPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        {/* Format Badge */}
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono uppercase tracking-wider font-bold text-cyan-300">
          {project.type}
        </div>
      </div>

      {/* Release Details */}
      <div className="flex flex-col flex-1 min-w-0">
        <h3 className="font-display font-bold text-white text-base tracking-tight truncate group-hover:text-cyan-300 transition-colors">
          {project.title}
        </h3>
        
        <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
          Radio Waves
        </p>

        {/* Metadata Footer: Tracks count & Runtime */}
        <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <Disc3 className="w-3.5 h-3.5 text-slate-500" />
            {project.tracks.length} {project.tracks.length === 1 ? 'Track' : 'Tracks'}
          </span>

          {runtimeSec > 0 && (
            <span className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3 h-3 text-slate-500" />
              {runtimeFormatted}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});
