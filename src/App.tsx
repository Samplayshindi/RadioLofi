import React, { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { LibraryProvider } from './context/LibraryContext';
import { PlayerProvider } from './context/PlayerContext';
import { Sidebar } from './components/Sidebar';
import { PlayerBar } from './components/PlayerBar';
import { Home as HomeIcon, Search as SearchIcon, Disc3 as DiscIcon, Mic2 as MicIcon, Music as MusicIcon, History as HistoryIcon, Library as LibraryIcon } from 'lucide-react';
import { PasswordBarrier } from './components/PasswordBarrier';

// Lazy-load pages
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const AlbumView = lazy(() => import('./pages/AlbumView').then(m => ({ default: m.AlbumView })));
const LibraryView = lazy(() => import('./pages/LibraryView').then(m => ({ default: m.LibraryView })));
const SearchView = lazy(() => import('./pages/SearchView').then(m => ({ default: m.SearchView })));
const TimelineView = lazy(() => import('./pages/TimelineView').then(m => ({ default: m.TimelineView })));

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) => 
    `flex flex-col items-center gap-1 text-[9px] uppercase font-bold tracking-widest transition-colors ${
      isActive ? 'text-cyan-450 text-cyan-400' : 'text-white/50 hover:text-white'
    }`;

  const loadingSpinner = (
    <div className="h-full flex flex-col items-center justify-center text-white/40 bg-[#050505] min-h-[400px]">
      <div className="w-8 h-8 rounded-full border-2 border-t-cyan-400 border-r-transparent border-b-cyan-450 border-l-transparent animate-spin mb-4" />
      <span className="font-mono text-[10px] uppercase tracking-widest text-white/30">Loading Unit...</span>
    </div>
  );

  if (!isAuthenticated) {
    return <PasswordBarrier onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <LibraryProvider>
      <PlayerProvider>
        <BrowserRouter>
          <div className="bg-[#050505] text-white flex flex-col h-screen overflow-hidden font-sans selection:bg-cyan-500/30">
            <div className="flex flex-1 overflow-hidden h-[calc(100vh-90px)]">
              <Sidebar />
              <main className="flex-1 relative flex flex-col overflow-y-auto">
                {/* Mobile Top Header (Mobile Artist Profile) */}
                <div className="md:hidden flex items-center justify-between p-4 bg-black/85 backdrop-blur-md border-b border-white/5 sticky top-0 z-30 shrink-0">
                  <div className="flex items-center gap-2">
                    <img 
                      src="https://raw.githubusercontent.com/Samplayshindi/radio/main/cropped_circle_image.png" 
                      alt="Radio Waves" 
                      className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/10" 
                      referrerPolicy="no-referrer"
                    />
                    <span className="font-bold text-sm text-white tracking-tight">
                      Radio Waves <span className="text-cyan-400 text-xs ml-1 font-normal">Archive</span>
                    </span>
                  </div>
                </div>

                <div className="flex-1">
                  <Suspense fallback={loadingSpinner}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/search" element={<SearchView />} />
                      <Route path="/all" element={<LibraryView filterType="All" title="All Releases" />} />
                      <Route path="/albums" element={<LibraryView filterType="Album" title="Albums" />} />
                      <Route path="/eps" element={<LibraryView filterType="EP" title="EPs" />} />
                      <Route path="/singles" element={<LibraryView filterType="Single" title="Singles" />} />
                      <Route path="/timeline" element={<TimelineView />} />
                      <Route path="/roadmap" element={<Navigate to="/" replace />} />
                      <Route path="/project/:id" element={<AlbumView />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Suspense>
                </div>

                {/* Mobile Bottom Navigation */}
                <div className="md:hidden bg-[#070707]/95 backdrop-blur-md border-t border-white/5 flex justify-around py-3.5 px-1 sticky bottom-0 z-30 shrink-0">
                  <NavLink to="/" className={mobileLinkClass}>
                    <HomeIcon className="w-5 h-5" />
                    <span>Home</span>
                  </NavLink>
                  <NavLink to="/all" className={mobileLinkClass}>
                    <LibraryIcon className="w-5 h-5" />
                    <span>All</span>
                  </NavLink>
                  <NavLink to="/search" className={mobileLinkClass}>
                    <SearchIcon className="w-5 h-5" />
                    <span>Search</span>
                  </NavLink>
                  <NavLink to="/timeline" className={mobileLinkClass}>
                    <HistoryIcon className="w-5 h-5" />
                    <span>Timeline</span>
                  </NavLink>
                  <NavLink to="/albums" className={mobileLinkClass}>
                    <DiscIcon className="w-5 h-5" />
                    <span>Albums</span>
                  </NavLink>
                  <NavLink to="/eps" className={mobileLinkClass}>
                    <MicIcon className="w-5 h-5" />
                    <span>EPs</span>
                  </NavLink>
                  <NavLink to="/singles" className={mobileLinkClass}>
                    <MusicIcon className="w-5 h-5" />
                    <span>Singles</span>
                  </NavLink>
                </div>
              </main>
            </div>
            <PlayerBar />
          </div>
        </BrowserRouter>
      </PlayerProvider>
    </LibraryProvider>
  );
}
