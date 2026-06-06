import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../store/useStore';
import clsx from 'clsx';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CheckSquare,
  FileText,
  CreditCard,
  UserCog,
  CalendarDays,
  FolderOpen,
  StickyNote,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import Avatar from '../ui/Avatar';

export const Sidebar: React.FC = () => {
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const user = useAppStore((state) => state.user);
  const logout = useAppStore((state) => state.logout);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Clients', path: '/clients', icon: <Users className="h-5 w-5" /> },
    { name: 'Projects', path: '/projects', icon: <FolderKanban className="h-5 w-5" /> },
    { name: 'Tasks', path: '/tasks', icon: <CheckSquare className="h-5 w-5" /> },
    { name: 'Invoices', path: '/invoices', icon: <FileText className="h-5 w-5" /> },
    { name: 'Payments', path: '/payments', icon: <CreditCard className="h-5 w-5" /> },
    { name: 'Team', path: '/employees', icon: <UserCog className="h-5 w-5" /> },
    { name: 'Calendar', path: '/calendar', icon: <CalendarDays className="h-5 w-5" /> },
    { name: 'Documents', path: '/documents', icon: <FolderOpen className="h-5 w-5" /> },
    { name: 'Activities', path: '/activities', icon: <StickyNote className="h-5 w-5" /> },
    { name: 'Reports', path: '/reports', icon: <BarChart3 className="h-5 w-5" /> },
    { name: 'Settings', path: '/settings', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <aside
      className={clsx(
        'sidebar-gradient h-screen flex flex-col justify-between transition-all duration-300 relative text-slate-400 select-none z-30',
        sidebarCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Top logo */}
      <div className="flex items-center justify-between px-5 py-6 border-b border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-9 w-9 bg-primary-600 rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-primary-500/20">
            <span className="text-white font-extrabold text-lg tracking-wider">U</span>
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="text-white font-black text-sm tracking-widest uppercase">URDIGIX</span>
              <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">SOLUTIONS</span>
            </div>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="absolute -right-3.5 top-8 bg-slate-900 border border-slate-800 p-1.5 rounded-full text-slate-400 hover:text-white shrink-0 hover:bg-slate-800 transition-colors shadow-lg"
        >
          {sidebarCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Nav list */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 flex flex-col gap-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:text-white group',
                isActive
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-500/10'
                  : 'hover:bg-slate-800/60'
              )
            }
          >
            <span className="shrink-0 group-hover:scale-105 transition-transform">{item.icon}</span>
            {!sidebarCollapsed && <span className="truncate">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer Profile */}
      <div className="p-4 border-t border-slate-800 flex flex-col gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <Avatar name={user?.firstName || 'Admin'} size="sm" src={user?.avatar} />
          {!sidebarCollapsed && (
            <div className="flex flex-col truncate">
              <span className="text-white font-bold text-sm leading-tight">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                {user?.roles?.[0] || 'Administrator'}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-4 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all duration-200"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!sidebarCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
