import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Clock,
  ArrowRight,
  Flame,
  Target,
  Brain,
  Zap,
} from 'lucide-react';
import { useExamStore } from '../store/examStore';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { format } from 'date-fns';

const REFLECTION_LABELS: Record<string, string> = {
  concept_not_clear: 'Concept not clear',
  calculation_mistake: 'Calculation mistake',
  silly_mistake: 'Silly mistake',
  time_pressure: 'Time pressure',
  lack_of_revision: 'Lack of revision',
};

export const Dashboard: React.FC = () => {
  const { results, exams, setView, getAnalytics } = useExamStore();
  const analytics = getAnalytics();
  const recentResults = [...results]
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 3);

  const getScoreColor = (pct: number) => {
    if (pct >= 80) return 'text-emerald-400';
    if (pct >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getInsightText = () => {
    if (analytics.totalTests === 0) return null;
    const { avgAccuracy, avgSpeed, topReflection } = analytics;
    if (avgAccuracy >= 80 && avgSpeed <= 30) return { text: 'You are fast and accurate. Keep it up!', color: 'text-emerald-400' };
    if (avgAccuracy >= 80 && avgSpeed > 60) return { text: 'You are accurate but slow. Work on speed.', color: 'text-yellow-400' };
    if (avgAccuracy < 60 && avgSpeed <= 30) return { text: 'You are fast but making careless mistakes. Slow down slightly.', color: 'text-orange-400' };
    if (topReflection === 'silly_mistake') return { text: 'Silly mistakes are costing you marks. Double-check your answers.', color: 'text-orange-400' };
    if (topReflection === 'concept_not_clear') return { text: 'Focus on strengthening core concepts before attempting more tests.', color: 'text-red-400' };
    return { text: 'Consistent practice is key. Keep going!', color: 'text-violet-400' };
  };

  const insight = getInsightText();

  const StatCard = ({
    label,
    value,
    sub,
    icon,
    color,
  }: {
    label: string;
    value: string;
    sub?: string;
    icon: React.ReactNode;
    color: string;
  }) => (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${color}`}>{icon}</div>
        {sub && <span className="text-xs text-gray-500">{sub}</span>}
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-violet-600/10 via-violet-500/5 to-transparent border border-violet-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flame size={16} className="text-violet-400" />
              <span className="text-xs font-medium text-violet-400 uppercase tracking-widest">Performance Training System</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Welcome to ExamForge</h2>
            <p className="text-gray-400 text-sm max-w-md">
              Create exam papers, train under real pressure, and analyze your performance with deep insights.
            </p>
          </div>
          <div className="hidden md:flex gap-3">
            <Button variant="primary" icon={<Zap size={15} />} onClick={() => setView('create-exam')}>
              Create Exam
            </Button>
            <Button variant="secondary" onClick={() => setView('exam-list')}>
              Start Test
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Tests Taken"
          value={analytics.totalTests.toString()}
          icon={<BookOpen size={18} className="text-violet-400" />}
          color="bg-violet-500/10"
        />
        <StatCard
          label="Avg Score"
          value={analytics.totalTests > 0 ? `${analytics.avgScore}%` : '—'}
          icon={<Target size={18} className="text-emerald-400" />}
          color="bg-emerald-500/10"
        />
        <StatCard
          label="Avg Accuracy"
          value={analytics.totalTests > 0 ? `${analytics.avgAccuracy}%` : '—'}
          icon={<CheckCircle2 size={18} className="text-blue-400" />}
          color="bg-blue-500/10"
        />
        <StatCard
          label="Avg Speed"
          value={analytics.totalTests > 0 ? `${analytics.avgSpeed}s/q` : '—'}
          sub="per question"
          icon={<Clock size={18} className="text-yellow-400" />}
          color="bg-yellow-500/10"
        />
      </div>

      {/* AI Insight */}
      {insight && (
        <div className="flex items-start gap-3 bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <Brain size={18} className="text-violet-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-1">Performance Insight</p>
            <p className={`text-sm font-medium ${insight.color}`}>{insight.text}</p>
            {analytics.topReflection && (
              <p className="text-xs text-gray-500 mt-1">
                Most common mistake: <span className="text-gray-300">{REFLECTION_LABELS[analytics.topReflection]}</span>
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Results */}
        <Card>
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-200">Recent Tests</h3>
            <Button variant="ghost" size="sm" iconRight={<ArrowRight size={13} />} onClick={() => setView('history')}>
              View all
            </Button>
          </div>
          <CardBody className="space-y-3 !py-4">
            {recentResults.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp size={32} className="text-gray-700 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No tests taken yet.</p>
                <p className="text-xs text-gray-600 mt-1">Start your first exam to see results here.</p>
              </div>
            ) : (
              recentResults.map((r) => {
                const pct = Math.round((r.scoredMarks / r.totalMarks) * 100);
                return (
                  <div
                    key={r.id}
                    className="flex items-center gap-4 p-3 bg-gray-800/40 rounded-xl border border-gray-700/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">{r.examTitle}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {format(new Date(r.completedAt), 'MMM d, yyyy • h:mm a')}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-lg font-bold ${getScoreColor(pct)}`}>{pct}%</p>
                      <p className="text-xs text-gray-600">{r.scoredMarks}/{r.totalMarks}</p>
                    </div>
                  </div>
                );
              })
            )}
          </CardBody>
        </Card>

        {/* Exam Library */}
        <Card>
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-200">Exam Library</h3>
            <Button variant="ghost" size="sm" iconRight={<ArrowRight size={13} />} onClick={() => setView('exam-list')}>
              View all
            </Button>
          </div>
          <CardBody className="space-y-3 !py-4">
            {exams.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen size={32} className="text-gray-700 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No exams created yet.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  icon={<Zap size={13} />}
                  onClick={() => setView('create-exam')}
                >
                  Create Your First Exam
                </Button>
              </div>
            ) : (
              exams.slice(0, 4).map((exam) => (
                <div
                  key={exam.id}
                  className="flex items-center gap-3 p-3 bg-gray-800/40 rounded-xl border border-gray-700/50"
                >
                  <div className="w-9 h-9 bg-violet-600/15 rounded-lg flex items-center justify-center shrink-0">
                    <BookOpen size={15} className="text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">{exam.title}</p>
                    <p className="text-xs text-gray-500">
                      {exam.questions.length} questions • {Math.floor(exam.totalTime / 60)} min
                    </p>
                  </div>
                  <Badge variant="violet">{exam.subject}</Badge>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
