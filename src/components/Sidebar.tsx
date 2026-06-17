import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Disc3, Mic2, Music, Search, History, Library } from 'lucide-react';

export function Sidebar() {
  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-300 border-l-2 ${
      isActive 
        ? 'text-cyan-400 bg-white/[0.04] font-semibold border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.05)]' 
        : 'text-white/50 hover:text-white border-transparent hover:bg-white/[0.02]'
    }`;

  return (
    <div className="hidden md:flex w-64 bg-black flex-shrink-0 flex flex-col p-6 border-r border-white/5 h-full relative z-10">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <img 
          src="https://raw.githubusercontent.com/Samplayshindi/radio/main/cropped_circle_image.png" 
          alt="Radio Waves" 
          className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-white/15" 
          referrerPolicy="no-referrer"
        />
        <h1 className="font-bold tracking-tight text-md text-white select-none">
          Radio Waves <span className="text-cyan-400 font-normal">Archive</span>
        </h1>
      </div>

      {/* Navigation Groups */}
      <nav className="flex flex-col gap-1.5 mb-8">
        <NavLink to="/" className={linkClasses}>
          <Home className="w-4 h-4" /> Home
        </NavLink>
        <NavLink to="/search" className={linkClasses}>
          <Search className="w-4 h-4" /> Search
        </NavLink>
        <NavLink to="/timeline" className={linkClasses}>
          <History className="w-4 h-4" /> Timeline
        </NavLink>
      </nav>

      {/* Vault Category List */}
      <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto border-t border-white/5 pt-6">
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-3 px-3 font-semibold font-mono">
          Vault Categories
        </h3>
        <NavLink to="/all" className={linkClasses}>
          <Library className="w-4 h-4" /> All Releases
        </NavLink>
        <NavLink to="/albums" className={linkClasses}>
          <Disc3 className="w-4 h-4" /> Albums
        </NavLink>
        <NavLink to="/eps" className={linkClasses}>
          <Mic2 className="w-4 h-4" /> EPs
        </NavLink>
        <NavLink to="/singles" className={linkClasses}>
          <Music className="w-4 h-4" /> Singles
        </NavLink>
      </div>
    </div>
  );
}
