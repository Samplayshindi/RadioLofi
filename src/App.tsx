import React, { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { LibraryProvider } from './context/LibraryContext';
import { PlayerProvider } from './context/PlayerContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { PlayerBar } from './components/PlayerBar';
import { PasswordBarrier } from './components/PasswordBarrier';
import { Home as HomeIcon, Search as SearchIcon, Disc3 as DiscIcon, Mic2 as MicIcon, Library as LibraryIcon, Sun, Moon } from 'lucide-react';

const BOOMBOX_LOGO = "https://raw.githubusercontent.com/Samplayshindi/RadioLofi/fecae3756d78e99e59964fdbe845c95cb42c645c/Retro_Cream_and_Burgundy_Boombox_cleaned-Photoroom.png";

// Lazy-load pages
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const AlbumView = lazy(() => import('./pages/AlbumView').then(m => ({ default: m.AlbumView })));
const LibraryView = lazy(() => import('./pages/LibraryView').then(m => ({ default: m.LibraryView })));
const SearchView = lazy(() => import('./pages/SearchView').then(m => ({ default: m.SearchView })));

function MobileHeader() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="md:hidden flex items-center justify-between p-4 bg-[#0a0d14]/90 dark:bg-[#07090e]/90 backdrop-blur-xl border-b border-white/[0.06] sticky top-0 z-30 shrink-0 select-none">
      <div className="flex items-center gap-2.5">
        <img 
          src={BOOMBOX_LOGO} 
          alt="Radio Waves" 
          className="w-8 h-8 object-contain shrink-0" 
          referrerPolicy="no-referrer"
        />
        <span className="font-display font-black text-lg text-white tracking-tight">
          Radio Waves
        </span>
      </div>

      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Sun className="w-4 h-4 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4 text-slate-400" />
        )}
      </button>
    </div>
  );
}

function MainApp() {
  const mobileLinkClass = ({ isActive }: { isActive: boolean }) => 
    `flex flex-col items-center gap-1 text-[10px] font-mono font-bold tracking-tight transition-colors ${
      isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
    }`;

  const loadingSpinner = (
    <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-[#07090e] min-h-[400px]">
      <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-cyan-400 animate-spin mb-4" />
      <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Loading Catalog...</span>
    </div>
  );

  return (
    <BrowserRouter>
      <div className="bg-[#07090e] text-slate-200 flex flex-col h-screen overflow-hidden font-sans select-none">
        <div className="flex flex-1 overflow-hidden h-[calc(100vh-96px)]">
          <Sidebar />

          <main className="flex-1 relative flex flex-col overflow-y-auto bg-[#07090e]">
            {/* Mobile Header */}
            <MobileHeader />

            <div className="flex-1">
              <Suspense fallback={loadingSpinner}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/search" element={<SearchView />} />
                  <Route path="/all" element={<LibraryView filterType="All" title="Complete Discography" />} />
                  <Route path="/albums" element={<LibraryView filterType="Album" title="Albums" />} />
                  <Route path="/eps" element={<LibraryView filterType="EP" title="Extended Plays" />} />
                  <Route path="/singles" element={<LibraryView filterType="Single" title="Singles" />} />
                  <Route path="/project/:id" element={<AlbumView />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden bg-[#0a0d14]/95 dark:bg-[#07090e]/95 backdrop-blur-xl border-t border-white/[0.08] flex justify-around py-3 px-2 sticky bottom-0 z-30 shrink-0">
              <NavLink to="/" end className={mobileLinkClass}>
                <HomeIcon className="w-4 h-4" />
                <span>Home</span>
              </NavLink>
              <NavLink to="/search" className={mobileLinkClass}>
                <SearchIcon className="w-4 h-4" />
                <span>Search</span>
              </NavLink>
              <NavLink to="/all" className={mobileLinkClass}>
                <LibraryIcon className="w-4 h-4" />
                <span>All</span>
              </NavLink>
              <NavLink to="/albums" className={mobileLinkClass}>
                <DiscIcon className="w-4 h-4" />
                <span>Albums</span>
              </NavLink>
              <NavLink to="/eps" className={mobileLinkClass}>
                <MicIcon className="w-4 h-4" />
                <span>EPs</span>
              </NavLink>
            </div>
          </main>
        </div>

        {/* Global Audiophile Player Bar */}
        <PlayerBar />
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('rw_auth') === 'true';
    } catch {
      return false;
    }
  });

  if (!isAuthenticated) {
    return <PasswordBarrier onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <ThemeProvider>
      <LibraryProvider>
        <PlayerProvider>
          <MainApp />
        </PlayerProvider>
      </LibraryProvider>
    </ThemeProvider>
  );
}
