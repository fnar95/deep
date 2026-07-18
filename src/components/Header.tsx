import React from 'react';
import { School, Users, GraduationCap, ClipboardList } from 'lucide-react';
import { UserSession } from '../types';

interface HeaderProps {
  currentView: 'parent' | 'teacher' | 'principal';
  setView: (view: 'parent' | 'teacher' | 'principal') => void;
  session: UserSession | null;
  onLogout: () => void;
}

export default function Header({ currentView, setView, session, onLogout }: HeaderProps) {
  return (
    <header id="app-header" className="bg-emerald-900 text-white shadow-lg border-b border-amber-500/30">
      {/* Top bar with school context */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 text-xs border-b border-emerald-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-emerald-300">وزارة التعليم</span>
          <span className="text-emerald-500">•</span>
          <span className="text-emerald-300">إدارة التعليم بمحافظة الاحساء</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-amber-400 font-medium font-mono">العام الدراسي ١٤٤٨هـ</span>
        </div>
      </div>

      {/* Main header content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          {/* Logo and title */}
          <div className="flex items-center gap-4">
            <div className="bg-amber-500 p-3 rounded-2xl shadow-inner text-emerald-950 flex items-center justify-center">
              <School className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                مدرسة عمرو بن العاص المتوسطة
              </h1>
              <p className="text-xs sm:text-sm text-emerald-200 mt-1">
                المنصة الإلكترونية الشاملة للخطط الدراسية الأسبوعية
              </p>
            </div>
          </div>

          {/* Navigation view switchers */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="nav-parent"
              onClick={() => setView('parent')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 border ${
                currentView === 'parent'
                  ? 'bg-amber-500 text-emerald-950 border-amber-400 shadow-md'
                  : 'bg-emerald-800/50 text-emerald-100 border-emerald-700/50 hover:bg-emerald-800'
              }`}
            >
              <Users className="w-4 h-4" />
              أولياء الأمور
            </button>

            <button
              id="nav-teacher"
              onClick={() => setView('teacher')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 border ${
                currentView === 'teacher'
                  ? 'bg-amber-500 text-emerald-950 border-amber-400 shadow-md'
                  : 'bg-emerald-800/50 text-emerald-100 border-emerald-700/50 hover:bg-emerald-800'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              بوابة المعلمين
              {session?.role === 'teacher' && (
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
              )}
            </button>

            <button
              id="nav-principal"
              onClick={() => setView('principal')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 border ${
                currentView === 'principal'
                  ? 'bg-amber-500 text-emerald-950 border-amber-400 shadow-md'
                  : 'bg-emerald-800/50 text-emerald-100 border-emerald-700/50 hover:bg-emerald-800'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              لوحة المدير
              {session?.role === 'principal' && (
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
              )}
            </button>

            {session && (
              <div className="h-6 w-[1px] bg-emerald-700 mx-2 hidden sm:block" />
            )}

            {session && (
              <div className="flex items-center gap-3 bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-800">
                <span className="text-xs text-emerald-300 font-medium">
                  مرحباً، {session.name}
                </span>
                <button
                  onClick={onLogout}
                  className="text-xs text-red-300 hover:text-red-200 font-bold underline cursor-pointer"
                >
                  خروج
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
