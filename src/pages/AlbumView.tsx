import React from 'react';
import { useParams } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { DriveImage } from '../components/DriveImage';
import { usePlayer } from '../context/PlayerContext';
import { Play, Clock, Pause } from 'lucide-react';

export function AlbumView() {
  const { id } = useParams<{ id: string }>();
  const { projects } = useLibrary();
  const { playTrack, currentProject, isPlaying, togglePlayPause } = usePlayer();

  const project = projects.find(p => p.id === id);

  if (!project) {
    return <div className="p-8 text-white/40">Project not found.</div>;
  }

  const isCurrentProject = currentProject?.id === project.id;

  const handlePlayAll = () => {
    if (project.tracks.length > 0) {
      if (isCurrentProject && isPlaying) {
        togglePlayPause(); // Pause
      } else {
        playTrack(project.tracks[0], project, project.tracks);
      }
    }
  };

  return (
    <div className="pb-24">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row items-end gap-6 p-8 bg-gradient-to-b from-indigo-900/60 to-[#050505] pt-16">
        <div className="w-56 h-56 shrink-0 shadow-2xl overflow-hidden rounded-sm bg-white/5">
          <DriveImage fileId={project.coverArtId} className="w-full h-full" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-white mb-2">{project.type}</div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-4">{project.title}</h1>
          <div className="flex items-center gap-4 text-sm text-white/80 font-medium">
            <span className="text-white hover:underline cursor-pointer">Radio Lofi</span>
            <span>•</span>
            <span>{project.tracks.length} track{project.tracks.length !== 1 && 's'}</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-8 py-6">
        <button 
          onClick={handlePlayAll}
          className="w-14 h-14 bg-purple-500 rounded-full flex items-center justify-center hover:bg-purple-400 hover:scale-105 transition-transform shadow-xl"
        >
          {isCurrentProject && isPlaying ? (
            <Pause className="w-6 h-6 text-black fill-current" />
          ) : (
            <Play className="w-7 h-7 text-black fill-current ml-1" />
          )}
        </button>
      </div>

      {/* Tracklist */}
      <div className="px-8 max-w-5xl">
        <div className="grid grid-cols-[16px_1fr_48px] gap-4 px-4 py-2 border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2 font-bold">
          <div className="text-right">#</div>
          <div>Title</div>
          <div><Clock className="w-4 h-4 ml-auto" /></div>
        </div>
        <div className="space-y-1">
          {project.tracks.map((track, i) => (
            <div 
              key={track.id}
              onClick={() => playTrack(track, project, project.tracks)}
              className="group grid grid-cols-[16px_1fr_48px] gap-4 px-4 py-3 rounded-md hover:bg-white/5 cursor-pointer text-white/80 items-center transition-colors"
            >
              <div className="text-right flex items-center justify-end">
                <span className="group-hover:hidden text-sm">{track.trackNumber}</span>
                <Play className="w-4 h-4 hidden group-hover:block fill-current text-white" />
              </div>
              <div className="font-medium text-white truncate text-sm">{track.title}</div>
              <div className="text-right text-sm text-white/40">--:--</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
