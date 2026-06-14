import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn } from './lib/firebase';
import { LibraryProvider } from './context/LibraryContext';
import { PlayerProvider } from './context/PlayerContext';
import { Sidebar } from './components/Sidebar';
import { PlayerBar } from './components/PlayerBar';
// Import pages (we will create these next)
import { Home } from './pages/Home';
import { AlbumView } from './pages/AlbumView';
import { TimelineView } from './pages/TimelineView';
import { RoadmapView } from './pages/RoadmapView';
import { LibraryView } from './pages/LibraryView';
import { SearchView } from './pages/SearchView';

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      // On success
      () => {
        setNeedsAuth(false);
        setIsInitializing(false);
      },
      // On failure / no session
      () => {
        setNeedsAuth(true);
        setIsInitializing(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await googleSignIn();
      setNeedsAuth(false);
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (needsAuth) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        <div className="max-w-md w-full bg-[#121212] border border-white/5 rounded-xl p-10 text-center shadow-2xl">
          <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/20">
            <span className="font-black text-2xl text-white">RL</span>
          </div>
          <h1 className="text-3xl font-black mb-3 tracking-tighter">Radio Lofi Archive</h1>
          <p className="text-white/60 mb-8 text-sm">Sign in with Google to access your music catalog stored in Drive.</p>
          <button 
            onClick={handleLogin} 
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 px-4 rounded-full font-bold hover:bg-zinc-200 transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-xl"
          >
            {isLoggingIn ? 'Connecting...' : 'Sign in with Google'}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthWrapper>
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
                    <Route path="/timeline" element={<TimelineView />} />
                    <Route path="/roadmap" element={<RoadmapView />} />
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
    </AuthWrapper>
  );
}
