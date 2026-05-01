import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Brain,
  TrendingUp,
  Target,
  Zap,
  BookOpen,
  AlertCircle,
  BarChart3,
} from 'lucide-react';
import { useExamStore } from '../store/examStore';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { clsx } from 'clsx';

const REFLECTION_LABELS: Record<string, string> = {
  concept_not_clear: 'Concept not clear',
  calculation_mistake: 'Calculation mistake',
  silly_mistake: 'Silly mistake',
  time_pressure: 'Time pressure',
  lack_of_revision: 'Lack of revision',
};

const REFLECTION_COLORS: Record<string, string> = {
  concept_not_clear: 'bg-red-500',
  calculation_mistake: 'bg-orange-500',
  silly_mistake: 'bg-yellow-500',
  time_pressure: 'bg-blue-500',
  lack_of_revision: 'bg-violet-500',
};

const REFLECTION_EMOJIS: Record<string, string> = {
  concept_not_clear: '📚',
  calculation_mistake: '🔢',
  silly_mistake: '🤦',
  time_pressure: '⏱',
  lack_of_revision: '📖',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 shadow-xl">
        <p className="text-xs text-gray-400 mb-2">{label}</p>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-gray-300">{p.name}:</span>
            <span className="text-white font-bold">{p.value}{p.dataKey === 'avgSpeed' ? 's' : '%'}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const Analytics: React.FC = () => {
  const { getAnalytics, results, setView } = useExamStore();
  const analytics = getAnalytics();

  if (analytics.totalTests === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center mb-4">
          <BarChart3 size={28} className="text-gray-700" />
        </div>
        <h3 className="text-base font-semibold text-gray-300 mb-2">No data yet</h3>
        <p className="text-sm text-gray-600 mb-6 max-w-xs">
          Complete at least one exam to see your performance analytics.
        </p>
        <Button variant="primary" onClick={() => setView('exam-list')}>
          Start an Exam
        </Button>
      </div>
    );
  }

  const totalReflections = Object.values(analytics.reflectionCounts).reduce((s, v) => s + v, 0);
  const reflectionSorted = Object.entries(analytics.reflectionCounts)
    .sort((a, b) => b[1] - a[1])
    .filter(([, v]) => v > 0);

  const getSpeedInsight = () => {
    if (analytics.avgSpeed <= 30) return { label: 'Very Fast', color: 'text-emerald-400', badge: 'green' as const };
    if (analytics.avgSpeed <= 60) return { label: 'Moderate', color: 'text-yellow-400', badge: 'yellow' as const };
    return { label: 'Slow', color: 'text-red-400', badge: 'red' as const };
  };

  const speedInsight = getSpeedInsight();

  const getAccuracyInsight = () => {
    if (analytics.avgAccuracy >= 80) return 'High accuracy — you know your material well.';
    if (analytics.avgAccuracy >= 60) return 'Average accuracy — some gaps in understanding.';
    return 'Low accuracy — focus on fundamentals before attempting more tests.';
  };

  return (
    <div className="space-y-6">
      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: 'Tests Completed',
            value: analytics.totalTests,
            icon: <BookOpen size={16} className="text-violet-400" />,
            bg: 'bg-violet-500/10',
          },
          {
            label: 'Avg Score',
            value: `${analytics.avgScore}%`,
            icon: <Target size={16} className="text-emerald-400" />,
            bg: 'bg-emerald-500/10',
          },
          {
            label: 'Avg Accuracy',
            value: `${analytics.avgAccuracy}%`,
            icon: <TrendingUp size={16} className="text-blue-400" />,
            bg: 'bg-blue-500/10',
          },
          {
            label: 'Avg Speed',
            value: `${analytics.avgSpeed}s/q`,
            icon: <Zap size={16} className="text-yellow-400" />,
            bg: 'bg-yellow-500/10',
          },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-white mb-0.5">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Score progress chart */}
      {analytics.scoreHistory.length > 1 && (
        <Card>
          <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-400" />
            <h3 className="text-sm font-semibold text-gray-200">Score & Accuracy Trend</h3>
          </div>
          <CardBody className="!pb-2">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={analytics.scoreHistory} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', color: '#9ca3af', paddingTop: '8px' }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Score"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  dot={{ fill: '#8b5cf6', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#a78bfa' }}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  name="Accuracy"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#34d399' }}
                  strokeDasharray="5 3"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      )}

      {/* Speed trend */}
      {analytics.speedHistory.length > 1 && (
        <Card>
          <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-2">
            <Zap size={16} className="text-yellow-400" />
            <h3 className="text-sm font-semibold text-gray-200">Speed Trend (seconds per question)</h3>
          </div>
          <CardBody className="!pb-2">
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={analytics.speedHistory} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}s`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="avgSpeed"
                  name="Avg Speed"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ fill: '#f59e0b', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#fbbf24' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Reflection Analysis */}
        <Card>
          <div className="px-5 py-4 border-b border-gray-800 flex items-center gap-2">
            <Brain size={16} className="text-violet-400" />
            <h3 className="text-sm font-semibold text-gray-200">Why You Lose Marks</h3>
          </div>
          <CardBody>
            {totalReflections === 0 ? (
              <div className="text-center py-6">
                <AlertCircle size={24} className="text-gray-700 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No reflections recorded yet.</p>
                <p className="text-xs text-gray-700 mt-1">Submit reflections after each test.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {analytics.topReflection && (
                  <div className="px-4 py-3 bg-violet-500/10 border border-violet-500/20 rounded-xl mb-4">
                    <p className="text-xs font-semibold text-violet-400 mb-1">Pattern Detected</p>
                    <p className="text-sm text-gray-200">
                      You mostly lose marks due to{' '}
                      <span className="text-violet-300 font-semibold">
                        {REFLECTION_LABELS[analytics.topReflection]}
                      </span>
                    </p>
                  </div>
                )}
                {reflectionSorted.map(([reason, count]) => {
                  const pct = Math.round((count / totalReflections) * 100);
                  return (
                    <div key={reason}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{REFLECTION_EMOJIS[reason]}</span>
                          <span className="text-xs font-medium text-gray-300">
                            {REFLECTION_LABELS[reason]}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{count}x</span>
                          <span className="text-xs font-bold text-gray-300">{pct}%</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={clsx('h-full rounded-full transition-all duration-500', REFLECTION_COLORS[reason])}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Speed vs Accuracy */}
        <Card>
          <div className="px-5 py-4 border-b border-gray-800 flex items-center gap-2">
            <Zap size={16} className="text-yellow-400" />
            <h3 className="text-sm font-semibold text-gray-200">Speed vs Accuracy</h3>
          </div>
          <CardBody className="space-y-4">
            <div className="text-center p-4 bg-gray-800/40 rounded-xl">
              <p className={`text-2xl font-black mb-1 ${speedInsight.color}`}>{speedInsight.label}</p>
              <p className="text-xs text-gray-500">Solving speed</p>
              <Badge variant={speedInsight.badge} className="mt-2">
                {analytics.avgSpeed}s avg per question
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Accuracy</span>
                <span className={clsx(
                  'font-bold',
                  analytics.avgAccuracy >= 80 ? 'text-emerald-400' :
                  analytics.avgAccuracy >= 60 ? 'text-yellow-400' : 'text-red-400'
                )}>
                  {analytics.avgAccuracy}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={clsx(
                    'h-full rounded-full',
                    analytics.avgAccuracy >= 80 ? 'bg-emerald-500' :
                    analytics.avgAccuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  )}
                  style={{ width: `${analytics.avgAccuracy}%` }}
                />
              </div>
            </div>

            <div className="px-3 py-2.5 bg-gray-800/40 rounded-xl">
              <p className="text-xs text-gray-400 leading-relaxed">{getAccuracyInsight()}</p>
            </div>

            {/* Subject breakdown */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Subject Performance</p>
              {(() => {
                const subjectMap: Record<string, { total: number; scored: number }> = {};
                results.forEach((r) => {
                  if (!subjectMap[r.subject]) subjectMap[r.subject] = { total: 0, scored: 0 };
                  subjectMap[r.subject].total += r.totalMarks;
                  subjectMap[r.subject].scored += r.scoredMarks;
                });
                return Object.entries(subjectMap).map(([subj, data]) => {
                  const pct = Math.round((data.scored / data.total) * 100);
                  return (
                    <div key={subj} className="flex items-center gap-3 mb-2">
                      <span className="text-xs text-gray-400 w-20 truncate">{subj}</span>
                      <div className="flex-1 h-1.5 bg-gray-800 rounded-full">
                        <div
                          className={clsx('h-full rounded-full', pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-500')}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-300 w-8 text-right">{pct}%</span>
                    </div>
                  );
                });
              })()}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
