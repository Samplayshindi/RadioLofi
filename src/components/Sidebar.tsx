import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Disc3, Mic2, Music, Search, Library, Sun, Moon } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { useTheme } from '../context/ThemeContext';

const BOOMBOX_LOGO = "https://raw.githubusercontent.com/Samplayshindi/RadioLofi/fecae3756d78e99e59964fdbe845c95cb42c645c/Retro_Cream_and_Burgundy_Boombox_cleaned-Photoroom.png";

export function Sidebar() {
  const { stats } = useLibrary();
  const { theme, toggleTheme } = useTheme();

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
      isActive
        ? 'bg-gradient-to-r from-cyan-500/15 to-transparent text-cyan-400 font-bold border-l-2 border-cyan-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
        : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
    }`;

  return (
    <aside className="w-64 bg-[#0a0d14] dark:bg-[#07090e] border-r border-white/[0.07] flex flex-col justify-between shrink-0 hidden md:flex z-20 select-none">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <img 
                src={BOOMBOX_LOGO} 
                alt="Radio Waves" 
                className="w-10 h-10 object-contain relative z-10 transition-transform duration-300 group-hover:scale-105" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="font-display font-black text-lg text-white tracking-tight flex items-center gap-1">
                Radio Waves
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/80 block -mt-1 font-semibold">
                Audiophile Archive
              </span>
            </div>
          </NavLink>

          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>

        {/* Primary Navigation */}
        <div className="p-4 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
            Navigation
          </div>

          <NavLink to="/" end className={linkClasses}>
            <Home className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span>Home</span>
          </NavLink>

          <NavLink to="/search" className={linkClasses}>
            <Search className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span>Search</span>
          </NavLink>

          <NavLink to="/all" className={linkClasses}>
            <Library className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span>All Releases</span>
            <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-400">
              {stats.totalProjects}
            </span>
          </NavLink>
        </div>

        {/* Categories Section */}
        <div className="p-4 pt-1 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
            Catalog Formats
          </div>

          <NavLink to="/albums" className={linkClasses}>
            <Disc3 className="w-4 h-4 transition-transform group-hover:scale-110 text-cyan-400/70" />
            <span>Albums</span>
            <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-400">
              {stats.albumsCount}
            </span>
          </NavLink>

          <NavLink to="/eps" className={linkClasses}>
            <Mic2 className="w-4 h-4 transition-transform group-hover:scale-110 text-purple-400/70" />
            <span>EPs</span>
            <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-400">
              {stats.epsCount}
            </span>
          </NavLink>

          <NavLink to="/singles" className={linkClasses}>
            <Music className="w-4 h-4 transition-transform group-hover:scale-110 text-rose-400/70" />
            <span>Singles</span>
            <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-400">
              {stats.singlesCount}
            </span>
          </NavLink>
        </div>
      </div>

      {/* Archive Overview Footer */}
      <div className="p-4 m-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-2.5">
          Archive Overview
        </div>
        <div className="space-y-1.5 font-mono text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Total Tracks</span>
            <span className="text-white font-bold">{stats.totalTracks}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Total Runtime</span>
            <span className="text-white font-bold">{stats.runtimeFormatted}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Total Projects</span>
            <span className="text-white font-bold">{stats.totalProjects}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
