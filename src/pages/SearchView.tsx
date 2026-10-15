import React, { useState, useMemo } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { ProjectCard } from '../components/ProjectCard';
import { DriveImage } from '../components/DriveImage';
import { Search, Play, Pause, Disc3, Music, X } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatTrackDuration } from '../lib/time';

export function SearchView() {
  const { projects, loading, durations } = useLibrary();
  const { currentTrack, playTrack, isPlaying, togglePlayPause } = usePlayer();
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Album' | 'EP' | 'Single'>('All');

  // Multi-target search: projects and songs
  const { matchedProjects, matchedTracks } = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        matchedProjects: filterType === 'All' ? projects : projects.filter(p => p.type === filterType),
        matchedTracks: []
      };
    }

    // Projects match
    const pMatches = projects.filter(p => {
      const matchType = filterType === 'All' || p.type === filterType;
      const matchText = p.title.toLowerCase().includes(q);
      return matchType && matchText;
    });

    // Individual Tracks match
    const tMatches: { track: any; project: any }[] = [];
    for (const p of projects) {
      if (filterType !== 'All' && p.type !== filterType) continue;
      for (const t of p.tracks) {
        if (t.title.toLowerCase().includes(q)) {
          tMatches.push({ track: t, project: p });
        }
      }
    }

    return { matchedProjects: pMatches, matchedTracks: tMatches };
  }, [projects, query, filterType]);

  const handleTrackSelect = (track: any, project: any) => {
    if (currentTrack?.id === track.id) {
      togglePlayPause();
    } else {
      playTrack(track, project, project.tracks);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-[#07090e] min-h-[500px]">
        <Disc3 className="w-8 h-8 animate-spin text-cyan-400 mb-3" />
        <span className="font-mono text-xs uppercase tracking-widest text-slate-400">Loading Search Index...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#07090e] text-white min-h-screen px-6 md:px-12 py-8 pb-36 select-none overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight mb-2">
            Archive Search
          </h1>
          <p className="text-xs font-mono text-slate-400">
            Search across 157 master tracks, singles, EPs, and albums
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="relative mb-6">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by song title, album, EP, or single..."
            autoFocus
            className="w-full pl-12 pr-10 py-4 bg-slate-900/60 border border-white/10 rounded-2xl text-white placeholder-slate-500 text-sm font-sans outline-none focus:border-cyan-400/60 focus:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
          {(['All', 'Album', 'EP', 'Single'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                filterType === type
                  ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/20'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
              }`}
            >
              {type === 'All' ? 'All Results' : `${type}s`}
            </button>
          ))}
        </div>

        {/* Track Results (if query exists) */}
        {matchedTracks.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold mb-4 flex items-center gap-2">
              <Music className="w-4 h-4" /> Matching Tracks ({matchedTracks.length})
            </h2>

            <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
              {matchedTracks.map(({ track, project }) => {
                const isThis = currentTrack?.id === track.id;
                const isThisPlaying = isThis && isPlaying;
                const sec = track.duration || durations[track.id] || 0;

                return (
                  <div
                    key={`${project.id}_${track.id}`}
                    onClick={() => handleTrackSelect(track, project)}
                    className={`group flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                      isThis
                        ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-300'
                        : 'bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 pr-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTrackSelect(track, project);
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                          isThisPlaying
                            ? 'bg-cyan-400 text-black'
                            : 'bg-white/10 group-hover:bg-white group-hover:text-black text-white'
                        }`}
                      >
                        {isThisPlaying ? (
                          <Pause className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        )}
                      </button>

                      <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-black/40">
                        <DriveImage fileId={project.coverArtId} alt={project.title} className="w-full h-full object-cover" />
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span className={`text-sm font-bold truncate ${isThis ? 'text-cyan-300' : 'text-white'}`}>
                          {track.title}
                        </span>
                        <span className="text-xs text-slate-500 truncate">
                          {project.title} • Radio Waves
                        </span>
                      </div>
                    </div>

                    <span className="font-mono text-xs text-slate-400 tabular-nums">
                      {formatTrackDuration(sec)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Releases Grid */}
        <div>
          <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold mb-4 flex items-center gap-2">
            <Disc3 className="w-4 h-4" /> 
            {query ? `Matching Releases (${matchedProjects.length})` : 'All Releases'}
          </h2>

          {matchedProjects.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <Disc3 className="w-10 h-10 opacity-20 mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-mono">No releases found matching "{query}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {matchedProjects.map((p, idx) => (
                <ProjectCard key={p.id} project={p} priority={idx < 8} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
