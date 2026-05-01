import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  BookOpen,
  BarChart3,
  History,
  Zap,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useExamStore } from '../../store/examStore';
import type { AppView } from '../../types';

const navItems: { label: string; icon: React.ReactNode; view: AppView }[] = [
  { label: 'Dashboard', icon: <LayoutDashboard size={18} />, view: 'dashboard' },
  { label: 'Create Exam', icon: <PlusCircle size={18} />, view: 'create-exam' },
  { label: 'My Exams', icon: <BookOpen size={18} />, view: 'exam-list' },
  { label: 'Analytics', icon: <BarChart3 size={18} />, view: 'analytics' },
  { label: 'History', icon: <History size={18} />, view: 'history' },
];

export const Sidebar: React.FC = () => {
  const { currentView, setView } = useExamStore();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-gray-950 border-r border-gray-800 flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-900/50">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight">ExamForge</span>
            <p className="text-[10px] text-gray-500 font-medium tracking-widest uppercase">Performance Lab</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => setView(item.view)}
            className={clsx(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
              currentView === item.view
                ? 'bg-violet-600/20 text-violet-300 border border-violet-500/20'
                : 'text-gray-500 hover:text-gray-200 hover:bg-gray-800/60'
            )}
          >
            <span
              className={clsx(
                currentView === item.view ? 'text-violet-400' : 'text-gray-600'
              )}
            >
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-800">
        <div className="px-3 py-3 bg-gray-900 rounded-xl border border-gray-800">
          <p className="text-[11px] font-medium text-gray-400">Version 1.0.0</p>
          <p className="text-[11px] text-gray-600 mt-0.5">All data stored locally</p>
        </div>
      </div>
    </aside>
  );
};
