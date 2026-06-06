import React, { useState } from 'react';
import { useAppStore } from '../../store/useStore';
import { Bell, Sun, Moon, Search, Plus, Mail } from 'lucide-react';
import Input from '../ui/Input';
import Avatar from '../ui/Avatar';

export const TopBar: React.FC = () => {
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const user = useAppStore((state) => state.user);
  const [search, setSearch] = useState('');

  // Support window controls in Electron if window.electronAPI is available
  const handleMinimize = () => window.electronAPI?.minimizeWindow();
  const handleMaximize = () => window.electronAPI?.maximizeWindow();
  const handleClose = () => window.electronAPI?.closeWindow();

  return (
    <header className="sticky top-0 z-20 w-full flex items-center justify-between px-6 py-3.5 bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md">
      {/* Title / Search */}
      <div className="flex items-center gap-6 flex-1 max-w-md">
        <div className="w-full">
          <Input
            type="text"
            placeholder="Search anything..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            iconLeft={<Search className="h-4 w-4" />}
            className="!py-2 bg-slate-100/50 dark:bg-slate-800/40 border-transparent hover:border-slate-200 dark:hover:border-slate-800"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Quick Add */}
        <button className="p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all duration-200 shadow-md shadow-primary-500/10 active:scale-95">
          <Plus className="h-4 w-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-rose-500 rounded-full" />
        </button>

        {/* Messages */}
        <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
          <Mail className="h-4 w-4" />
        </button>

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />

        {/* User Info */}
        <div className="flex items-center gap-3">
          <Avatar name={user?.firstName || 'Admin'} size="sm" src={user?.avatar} />
        </div>

        {/* Electron Window Controls (Only visible in Electron) */}
        {window.electronAPI && (
          <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-800 pl-3">
            <button
              onClick={handleMinimize}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              —
            </button>
            <button
              onClick={handleMaximize}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              ⬜
            </button>
            <button
              onClick={handleClose}
              className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopBar;
