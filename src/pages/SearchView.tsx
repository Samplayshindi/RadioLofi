import React, { useState } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { ProjectCard } from '../components/ProjectCard';
import { Search } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { Project, Track } from '../types';
import { DriveImage } from '../components/DriveImage';
import { Play } from 'lucide-react';

export function SearchView() {
  const { projects } = useLibrary();
  const { playTrack } = usePlayer();
  const [query, setQuery] = useState('');

  const q = query.toLowerCase();

  const filteredProjects = projects.filter(
    p => 
      p.title.toLowerCase().includes(q) || 
      p.type.toLowerCase().includes(q)
  );

  const filteredTracks: { track: Track; project: Project }[] = [];
  if (q.length > 1) {
    projects.forEach(p => {
      p.tracks.forEach(t => {
        if (t.title.toLowerCase().includes(q)) {
          filteredTracks.push({ track: t, project: p });
        }
      });
    });
  }

  return (
    <div className="p-8 pb-24 max-w-7xl mx-auto">
      <div className="relative mb-12 max-w-xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-white/40" />
        </div>
        <input
          type="text"
          className="block w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-full text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all shadow-lg text-sm font-medium"
          placeholder="Search for songs, EPs, or singles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {query && (
        <div className="space-y-12">
          {/* Track Results */}
          {filteredTracks.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6 tracking-tight">Songs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTracks.slice(0, 12).map(({ track, project }) => (
                  <div 
                    key={track.id}
                    onClick={() => playTrack(track, project, project.tracks)}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/10 cursor-pointer group transition-colors bg-white/5 border border-transparent hover:border-white/10"
                  >
                    <div className="relative w-12 h-12 rounded overflow-hidden shrink-0 shadow-md">
                      <DriveImage fileId={project.coverArtId} className="w-full h-full" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-white text-sm truncate mb-0.5">{track.title}</div>
                      <div className="text-xs text-white/50 truncate uppercase tracking-tighter">{project.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Results */}
          {filteredProjects.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6 tracking-tight">Albums & EPs</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredProjects.slice(0, 5).map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>
          )}

          {filteredProjects.length === 0 && filteredTracks.length === 0 && (
            <div className="text-center text-white/50 py-20 text-sm font-medium">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
