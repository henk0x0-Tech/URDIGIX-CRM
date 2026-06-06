import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-screen bg-slate-50 dark:bg-slate-950 transition-theme overflow-hidden">
      {/* Left branding panel */}
      <div className="hidden lg:flex w-1/2 sidebar-gradient flex-col justify-between p-12 text-white select-none">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
            <span className="text-white font-extrabold text-xl">U</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-black text-base tracking-widest uppercase">URDIGIX</span>
            <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">SOLUTIONS</span>
          </div>
        </div>

        <div className="flex flex-col gap-6 max-w-md">
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            Company Management Desktop Application
          </h1>
          <p className="text-slate-400 text-sm font-medium leading-relaxed">
            A complete solution to manage clients, projects, tasks, invoices, payments, employees, and more.
          </p>
          
          <ul className="flex flex-col gap-3 text-sm text-slate-300 font-semibold mt-4">
            <li className="flex items-center gap-2">✓ Client Management</li>
            <li className="flex items-center gap-2">✓ Project Tracking</li>
            <li className="flex items-center gap-2">✓ Invoices & Payments</li>
            <li className="flex items-center gap-2">✓ Document Storage & Calendar</li>
          </ul>
        </div>

        <div className="text-xs font-semibold text-slate-500 tracking-wider">
          © {new Date().getFullYear()} URDIGIX SOLUTIONS ERP
        </div>
      </div>

      {/* Right form container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3 mb-6 lg:hidden">
            <div className="h-9 w-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-extrabold text-lg">U</span>
            </div>
            <span className="text-slate-900 dark:text-white font-bold text-sm tracking-widest uppercase">URDIGIX</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
