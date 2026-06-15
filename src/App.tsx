import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LibraryProvider } from './context/LibraryContext';
import { PlayerProvider } from './context/PlayerContext';
import { Sidebar } from './components/Sidebar';
import { PlayerBar } from './components/PlayerBar';
// Import pages
import { Home } from './pages/Home';
import { AlbumView } from './pages/AlbumView';
import { LibraryView } from './pages/LibraryView';
import { SearchView } from './pages/SearchView';

export default function App() {
  return (
    <LibraryProvider>
      <PlayerProvider>
        <BrowserRouter>
          <div className="bg-[#050505] text-white flex flex-col h-screen overflow-hidden font-sans selection:bg-purple-500/30">
            <div className="flex flex-1 overflow-hidden h-[calc(100vh-90px)]">
              <Sidebar />
              <main className="flex-1 relative flex flex-col overflow-y-auto">
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
              </main>
            </div>
            <PlayerBar />
          </div>
        </BrowserRouter>
      </PlayerProvider>
    </LibraryProvider>
  );
}
