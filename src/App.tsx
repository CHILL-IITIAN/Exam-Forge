import React from 'react';
import { useExamStore } from './store/examStore';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { Dashboard } from './views/Dashboard';
import { CreateExam } from './views/CreateExam';
import { ExamList } from './views/ExamList';
import { ExamMode } from './views/ExamMode';
import { Result } from './views/Result';
import { Analytics } from './views/Analytics';
import { History } from './views/History';

const ViewRenderer: React.FC = () => {
  const { currentView } = useExamStore();
  switch (currentView) {
    case 'dashboard':    return <Dashboard />;
    case 'create-exam':  return <CreateExam />;
    case 'exam-list':    return <ExamList />;
    case 'result':       return <Result />;
    case 'analytics':    return <Analytics />;
    case 'history':      return <History />;
    default:             return <Dashboard />;
  }
};

const App: React.FC = () => {
  const { currentView } = useExamStore();
  const isExamMode = currentView === 'exam-mode';

  if (isExamMode) {
    return <ExamMode />;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <TopBar />
      <main className="ml-60 pt-16 min-h-screen">
        <div className="px-8 py-8">
          <ViewRenderer />
        </div>
      </main>
    </div>
  );
};

export default App;
