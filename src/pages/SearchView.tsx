import React, { useState, useMemo } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { ProjectCard } from '../components/ProjectCard';
import { Search, Play, Pause } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { Project, Track } from '../types';
import { DriveImage } from '../components/DriveImage';
import { motion, AnimatePresence } from 'motion/react';

export function SearchView() {
  const { projects } = useLibrary();
  const { currentTrack, playTrack, isPlaying, togglePlayPause } = usePlayer();
  const [query, setQuery] = useState('');

  const q = query.toLowerCase().trim();

  // Memoized lists to maximize frame rates and prevent heavy string indexing on high inputs
  const filteredProjects = useMemo(() => {
    if (!q) return [];
    return projects.filter(
      p => 
        p.title.toLowerCase().includes(q) || 
        p.type.toLowerCase().includes(q)
    );
  }, [projects, q]);

  const filteredTracks = useMemo(() => {
    if (q.length <= 1) return [];
    const results: { track: Track; project: Project }[] = [];
    projects.forEach(p => {
      p.tracks.forEach(t => {
        if (t.title.toLowerCase().includes(q)) {
          results.push({ track: t, project: p });
        }
      });
    });
    return results;
  }, [projects, q]);

  const handleTrackClick = (track: Track, project: Project) => {
    const isThisTrack = currentTrack?.id === track.id;
    if (isThisTrack) {
      togglePlayPause();
    } else {
      playTrack(track, project, project.tracks);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 md:p-8 pb-24 max-w-7xl mx-auto w-full relative z-10"
    >
      {/* Search Input Box */}
      <div className="relative mb-12 max-w-xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-white/30" />
        </div>
        <input
          type="text"
          className="block w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/10 rounded-full text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all shadow-xl text-sm font-semibold tracking-wide"
          placeholder="Search for tracks, albums, EPs, or singles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <AnimatePresence mode="wait">
        {query ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-12"
          >
            {/* Track Results */}
            {filteredTracks.length > 0 ? (
              <section>
                <h2 className="text-md uppercase font-bold tracking-widest text-[#00f2fe] mb-6 font-mono">
                  Matching Audio Tracks
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTracks.slice(0, 15).map(({ track, project }) => {
                    const isThisCurrentTrack = currentTrack?.id === track.id;
                    const isThisTrackPlaying = isThisCurrentTrack && isPlaying;

                    return (
                      <div 
                        key={track.id}
                        onClick={() => handleTrackClick(track, project)}
                        className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer group transition-all duration-300 border select-none ${
                          isThisCurrentTrack 
                            ? 'bg-white/10 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.05)]' 
                            : 'bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-md bg-black/40">
                          <DriveImage fileId={project.coverArtId} className="w-full h-full" />
                          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isThisCurrentTrack ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            {isThisTrackPlaying ? (
                              <Pause className="w-4 h-4 text-cyan-400 fill-current" />
                            ) : (
                              <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                            )}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`font-bold text-sm truncate mb-0.5 transition-colors ${isThisCurrentTrack ? 'text-cyan-300' : 'text-white'}`}>
                            {track.title}
                          </div>
                          <div className="text-[10px] text-white/40 truncate uppercase tracking-widest font-mono">
                            {project.title}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : (
              q.length > 1 && (
                <div className="text-white/30 text-xs font-mono">No matching track titles.</div>
              )
            )}

            {/* Project / Album Results */}
            {filteredProjects.length > 0 && (
              <section>
                <h2 className="text-md uppercase font-bold tracking-widest text-[#ff007f] mb-6 font-mono">
                  Matching Releases
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {filteredProjects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </section>
            )}

            {filteredProjects.length === 0 && filteredTracks.length === 0 && (
              <div className="text-center text-white/30 py-20 text-xs font-mono uppercase tracking-widest">
                No archived results found for "{query}"
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white/20 text-xs font-mono uppercase tracking-widest py-10"
          >
            Awaiting query inputs...
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
