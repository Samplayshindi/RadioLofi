import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { LibraryProvider } from './context/LibraryContext';
import { PlayerProvider } from './context/PlayerContext';
import { Sidebar } from './components/Sidebar';
import { PlayerBar } from './components/PlayerBar';
import { Home as HomeIcon, Search as SearchIcon, Disc3 as DiscIcon, Mic2 as MicIcon, Music as MusicIcon } from 'lucide-react';
// Import pages
import { Home } from './pages/Home';
import { AlbumView } from './pages/AlbumView';
import { LibraryView } from './pages/LibraryView';
import { SearchView } from './pages/SearchView';

export default function App() {
  const mobileLinkClass = ({ isActive }: { isActive: boolean }) => 
    `flex flex-col items-center gap-1 text-[9px] uppercase font-bold tracking-widest transition-colors ${
      isActive ? 'text-cyan-450 text-cyan-400' : 'text-white/50 hover:text-white'
    }`;

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
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/search" element={<SearchView />} />
                    <Route path="/albums" element={<LibraryView filterType="Album" title="Albums" />} />
                    <Route path="/eps" element={<LibraryView filterType="EP" title="EPs" />} />
                    <Route path="/singles" element={<LibraryView filterType="Single" title="Singles" />} />
                    <Route path="/timeline" element={<Navigate to="/" replace />} />
                    <Route path="/roadmap" element={<Navigate to="/" replace />} />
                    <Route path="/project/:id" element={<AlbumView />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>

                {/* Mobile Bottom Navigation */}
                <div className="md:hidden bg-[#070707]/95 backdrop-blur-md border-t border-white/5 flex justify-around py-3.5 px-2 sticky bottom-0 z-30 shrink-0">
                  <NavLink to="/" className={mobileLinkClass}>
                    <HomeIcon className="w-5 h-5" />
                    <span>Home</span>
                  </NavLink>
                  <NavLink to="/search" className={mobileLinkClass}>
                    <SearchIcon className="w-5 h-5" />
                    <span>Search</span>
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
