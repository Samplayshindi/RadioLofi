import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '../types';
import { DriveImage } from './DriveImage';
import { Play } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

interface ProjectCardProps {
  project: Project;
  key?: React.Key;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();
  const { playTrack } = usePlayer();

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (project.tracks.length > 0) {
      playTrack(project.tracks[0], project, project.tracks);
    }
  };

  return (
    <div 
      onClick={() => navigate(`/project/${project.id}`)}
      className="bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors group cursor-pointer"
    >
      <div className="relative aspect-square bg-gradient-to-br from-indigo-500 to-purple-800 rounded-lg mb-4 shadow-lg overflow-hidden">
        <DriveImage fileId={project.coverArtId} className="w-full h-full" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
          <button 
            onClick={handlePlayClick}
            className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-black shadow-xl hover:scale-105 transition-transform"
          >
            <Play className="w-6 h-6 fill-current ml-1" />
          </button>
        </div>
      </div>
      <h4 className="font-bold text-sm mb-1 text-white truncate">{project.title}</h4>
      <p className="text-xs text-white/50 uppercase tracking-tighter truncate">{project.year} • {project.type}</p>
    </div>
  );
}
