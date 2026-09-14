import React from 'react';
import { Sparkles, Users, BarChart3, Settings, ShieldCheck, LogIn, LogOut, Coffee, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, isAdmin, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div 
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center relative overflow-hidden">
                {/* AI wave & Queue silhouette concept */}
                <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                  <span className="w-6 h-6 rounded-full bg-emerald-400/20 animate-ping opacity-60"></span>
                </div>
                <div className="relative flex items-center gap-0.5">
                  <div className="w-1.5 h-4 bg-emerald-400 rounded-full"></div>
                  <div className="w-1.5 h-5 bg-teal-300 rounded-full"></div>
                  <div className="w-1.5 h-3 bg-cyan-400 rounded-full"></div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                  QueueSense<span className="text-emerald-400">.AI</span>
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 leading-none hidden sm:block">
                Smart Canteen Queue Prediction & Management System
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('landing')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'landing'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('student')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'student'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Student View
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'admin'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Portal
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'analytics'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Analytics
            </button>
          </nav>

          {/* User Profile & Auth Controls */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-slate-200 truncate max-w-[120px]">
                    {user?.name || 'Logged User'}
                  </span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                    isAdmin ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-300 border border-slate-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('login')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 rounded-lg transition-all shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/80 text-xs">
          <button
            onClick={() => setActiveTab('landing')}
            className={`px-2 py-1 rounded ${activeTab === 'landing' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('student')}
            className={`px-2 py-1 rounded ${activeTab === 'student' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
          >
            Student
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-2 py-1 rounded ${activeTab === 'admin' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
          >
            Admin
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-2 py-1 rounded ${activeTab === 'analytics' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
          >
            Analytics
          </button>
        </div>
      </div>
    </header>
  );
}
