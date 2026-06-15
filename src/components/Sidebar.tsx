import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Disc3, Mic2, Music, Search, Library, ListMusic, FastForward } from 'lucide-react';

export function Sidebar() {
  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 py-1.5 text-sm font-medium transition-colors ${
      isActive ? 'text-purple-400' : 'text-white/60 hover:text-white'
    }`;

  return (
    <div className="hidden md:flex w-64 bg-black flex-shrink-0 flex flex-col p-6 border-r border-white/5">
      <div className="flex items-center gap-3 mb-8">
        <img 
          src="https://raw.githubusercontent.com/Samplayshindi/radio/main/cropped_circle_image.png" 
          alt="Radio Waves" 
          className="w-8 h-8 rounded-full object-cover shrink-0" 
          referrerPolicy="no-referrer"
        />
        <h1 className="font-bold tracking-tight text-lg text-white">Radio Waves <span className="text-purple-400">Archive</span></h1>
      </div>

      <nav className="flex flex-col gap-2 mb-8">
        <NavLink to="/" className={linkClasses}>
          <Home className="w-5 h-5" /> Home
        </NavLink>
        <NavLink to="/search" className={linkClasses}>
          <Search className="w-5 h-5" /> Search
        </NavLink>
      </nav>

      <div className="flex-1 flex flex-col gap-2 overflow-y-auto border-t border-white/5 pt-4">
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">
          Vaults
        </h3>
        <NavLink to="/albums" className={linkClasses}>
          <Disc3 className="w-5 h-5" /> Albums
        </NavLink>
        <NavLink to="/eps" className={linkClasses}>
          <Mic2 className="w-5 h-5" /> EPs
        </NavLink>
        <NavLink to="/singles" className={linkClasses}>
          <Music className="w-5 h-5" /> Singles
        </NavLink>

      </div>
    </div>
  );
}
