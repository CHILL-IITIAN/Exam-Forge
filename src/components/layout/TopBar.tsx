import React from 'react';
import { Bell, User } from 'lucide-react';
import { useExamStore } from '../../store/examStore';

const viewTitles: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Your performance overview' },
  'create-exam': { title: 'Create Exam', subtitle: 'Build a new exam paper' },
  'exam-list': { title: 'My Exams', subtitle: 'Manage your exam library' },
  analytics: { title: 'Analytics', subtitle: 'Deep performance insights' },
  history: { title: 'Test History', subtitle: 'Your past test results' },
  result: { title: 'Result', subtitle: 'Test performance breakdown' },
};

export const TopBar: React.FC = () => {
  const { currentView } = useExamStore();
  const info = viewTitles[currentView] ?? { title: 'ExamForge', subtitle: '' };

  return (
    <header className="fixed top-0 left-60 right-0 h-16 bg-gray-950/80 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-8 z-30">
      <div>
        <h1 className="text-base font-semibold text-gray-100">{info.title}</h1>
        <p className="text-xs text-gray-500">{info.subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors">
          <Bell size={16} />
        </button>
        <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center">
          <User size={14} className="text-white" />
        </div>
      </div>
    </header>
  );
};
