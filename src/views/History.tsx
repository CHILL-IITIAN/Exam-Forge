import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Filter,
  BarChart3,
  ArrowUpRight,
  Zap,
} from 'lucide-react';
import { useExamStore } from '../store/examStore';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { format } from 'date-fns';
import { clsx } from 'clsx';

export const History: React.FC = () => {
  const { results, setView, setActiveResult } = useExamStore();
  const [filterSubject, setFilterSubject] = useState<string>('all');

  const subjects = Array.from(new Set(results.map((r) => r.subject)));
  const sortedResults = [...results]
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .filter((r) => filterSubject === 'all' || r.subject === filterSubject);

  const getScoreColor = (pct: number) => {
    if (pct >= 80) return 'text-emerald-400';
    if (pct >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (pct: number) => {
    if (pct >= 80) return 'bg-emerald-500/10 border-emerald-500/20';
    if (pct >= 60) return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          {results.length} test{results.length !== 1 ? 's' : ''} completed
        </p>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-500" />
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {sortedResults.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center mb-4">
            <BarChart3 size={28} className="text-gray-700" />
          </div>
          <h3 className="text-base font-semibold text-gray-300 mb-2">No tests yet</h3>
          <p className="text-sm text-gray-600 mb-6 max-w-xs">
            Your test history will appear here once you complete an exam.
          </p>
          <Button variant="primary" onClick={() => setView('exam-list')}>
            Start an Exam
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedResults.map((r) => {
            const pct = Math.round((r.scoredMarks / r.totalMarks) * 100);
            const accPct = Math.round((r.correctCount / r.totalQuestions) * 100);

            return (
              <Card key={r.id} hover>
                <CardBody className="!py-4">
                  <div className="flex items-start gap-4">
                    {/* Score */}
                    <div className={clsx('px-4 py-3 rounded-xl border text-center shrink-0 min-w-[72px]', getScoreBg(pct))}>
                      <p className={`text-2xl font-black ${getScoreColor(pct)}`}>{pct}%</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{r.scoredMarks}/{r.totalMarks}</p>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-100">{r.examTitle}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="violet">{r.subject}</Badge>
                            {r.autoSubmitted && (
                              <Badge variant="yellow">⚡ Auto-submitted</Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<ArrowUpRight size={13} />}
                          onClick={() => {
                            setActiveResult(r);
                            setView('result');
                          }}
                          className="shrink-0 text-gray-500 hover:text-gray-200"
                        >
                          View
                        </Button>
                      </div>

                      {/* Stats row */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={11} className="text-gray-600" />
                          {format(new Date(r.completedAt), 'MMM d, yyyy • h:mm a')}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 size={11} className="text-emerald-400" />
                          {r.correctCount} correct
                        </div>
                        <div className="flex items-center gap-1.5">
                          <XCircle size={11} className="text-red-400" />
                          {r.incorrectCount} wrong
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={11} className="text-gray-600" />
                          {formatDuration(r.totalTimeTaken)}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Zap size={11} className="text-yellow-400" />
                          {Math.round(r.avgTimePerQuestion)}s/q
                        </div>
                      </div>

                      {/* Progress bars */}
                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${accPct}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-gray-500 shrink-0 w-10 text-right">
                            {accPct}% acc
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
