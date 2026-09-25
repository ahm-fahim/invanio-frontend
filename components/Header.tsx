'use client';
import { Search, Bell, ChevronDown } from 'lucide-react';

export default function Header({ breadcrumb = 'Dashboard' }: { breadcrumb?: string }) {
  return (
    <header className="h-20 bg-slate-50/50 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10">
      <div>
        <p className="text-xs font-medium text-slate-400">Workspace / <span className="text-slate-600">{breadcrumb}</span></p>
        <h1 className="text-2xl font-bold text-slate-900 mt-0.5">{breadcrumb}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="p-2.5 bg-white border border-slate-200 rounded-full text-slate-600 hover:bg-slate-50 relative">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-white"></span>
        </button>

        {/* Profile Dropdown */}
        <div className="flex items-center gap-3 pl-2 cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs flex items-center justify-center border border-indigo-200">
            JD
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-900 leading-tight">Jordan Davis</p>
            <p className="text-[10px] text-slate-400">Administrator</p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </header>
  );
}