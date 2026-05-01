import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  Zap,
  Brain,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Home,
  RotateCcw,
  AlertCircle,
  Minus,
} from 'lucide-react';
import { useExamStore } from '../store/examStore';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import type { ReflectionEntry, ReflectionReason } from '../types';
import { clsx } from 'clsx';

const REFLECTION_OPTIONS: { reason: ReflectionReason; label: string; emoji: string; color: string }[] = [
  { reason: 'concept_not_clear', label: 'Concept not clear', emoji: '📚', color: 'border-red-500/40 bg-red-500/10 text-red-300' },
  { reason: 'calculation_mistake', label: 'Calculation mistake', emoji: '🔢', color: 'border-orange-500/40 bg-orange-500/10 text-orange-300' },
  { reason: 'silly_mistake', label: 'Silly mistake', emoji: '🤦', color: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300' },
  { reason: 'time_pressure', label: 'Time pressure', emoji: '⏱', color: 'border-blue-500/40 bg-blue-500/10 text-blue-300' },
  { reason: 'lack_of_revision', label: 'Lack of revision', emoji: '📖', color: 'border-violet-500/40 bg-violet-500/10 text-violet-300' },
];

const getInsightMessage = (accuracy: number, avgSpeed: number, topReason: ReflectionReason | null): string => {
  if (accuracy >= 90) return '🔥 Outstanding performance! You\'re in excellent shape.';
  if (accuracy >= 75 && avgSpeed <= 40) return '✅ Good accuracy with decent speed. Keep sharpening.';
  if (accuracy >= 75 && avgSpeed > 60) return '🐢 Accurate but slow. Work on solving speed.';
  if (accuracy < 50 && avgSpeed <= 30) return '⚡ You\'re fast but making too many mistakes. Slow down.';
  if (topReason === 'silly_mistake') return '🎯 Silly mistakes are costing you. Read questions carefully.';
  if (topReason === 'concept_not_clear') return '📚 Strengthen your core concepts before the next attempt.';
  if (topReason === 'time_pressure') return '⏱ Time management is your next growth area.';
  if (topReason === 'calculation_mistake') return '🔢 Practice mental math and step-by-step calculation.';
  return '📈 Keep practicing consistently. Progress takes time.';
};

export const Result: React.FC = () => {
  const { activeResult, results, setView, activeExam } = useExamStore();
  const [reflections, setReflections] = useState<Record<string, ReflectionReason | null>>({});
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [reflectionSaved, setReflectionSaved] = useState(false);

  if (!activeResult) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <AlertCircle size={32} className="mb-3" />
        <p>No result to display.</p>
        <Button variant="secondary" size="sm" className="mt-4" onClick={() => setView('dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  const r = activeResult;
  const scorePct = Math.round((r.scoredMarks / r.totalMarks) * 100);
  const accuracyPct = Math.round((r.correctCount / r.totalQuestions) * 100);
  const exam = useExamStore.getState().exams.find((e) => e.id === r.examId);
  const incorrectAttempts = r.attempts.filter((a) => !a.isCorrect && a.userAnswer !== '');
  const topReasonEntry = Object.entries(
    reflections as Record<string, ReflectionReason>
  ).reduce<Record<ReflectionReason, number>>(
    (acc, [, reason]) => {
      if (reason) acc[reason] = (acc[reason] ?? 0) + 1;
      return acc;
    },
    {} as Record<ReflectionReason, number>
  );
  const topReason = (Object.entries(topReasonEntry).sort((a, b) => b[1] - a[1])[0]?.[0] as ReflectionReason) ?? null;

  const getScoreColor = (pct: number) => {
    if (pct >= 80) return 'text-emerald-400';
    if (pct >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreRingColor = (pct: number) => {
    if (pct >= 80) return '#10b981';
    if (pct >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const handleSaveReflections = () => {
    const reflectionEntries: ReflectionEntry[] = Object.entries(reflections)
      .filter(([, reason]) => reason !== null)
      .map(([qId, reason]) => ({ questionId: qId, reason: reason as ReflectionReason }));

    // Update the result with reflections
    const updatedResults = results.map((res) =>
      res.id === r.id ? { ...res, reflections: reflectionEntries } : res
    );
    try {
      localStorage.setItem('examforge_results', JSON.stringify(updatedResults));
    } catch {}
    setReflectionSaved(true);
  };

  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference - (scorePct / 100) * circumference;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Score Hero */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-8 text-center">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">
          {r.autoSubmitted ? '⚡ Auto-Submitted (Time Up)' : '✓ Test Completed'}
        </p>

        {/* Score ring */}
        <div className="flex justify-center mb-6">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#1f2937" strokeWidth="8" />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke={getScoreRingColor(scorePct)}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-black ${getScoreColor(scorePct)}`}>{scorePct}%</span>
              <span className="text-xs text-gray-500">{r.scoredMarks}/{r.totalMarks}</span>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-white mb-1">{r.examTitle}</h2>
        <p className="text-sm text-gray-500">{r.subject}</p>

        {/* Insight */}
        <div className="mt-5 px-5 py-3 bg-gray-800/60 rounded-xl border border-gray-700/50 inline-block">
          <p className="text-sm text-gray-300">
            {getInsightMessage(accuracyPct, r.avgTimePerQuestion, topReason)}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            icon: <CheckCircle2 size={16} className="text-emerald-400" />,
            label: 'Correct',
            value: r.correctCount.toString(),
            color: 'bg-emerald-500/10',
          },
          {
            icon: <XCircle size={16} className="text-red-400" />,
            label: 'Incorrect',
            value: r.incorrectCount.toString(),
            color: 'bg-red-500/10',
          },
          {
            icon: <Minus size={16} className="text-gray-500" />,
            label: 'Unattempted',
            value: r.unattemptedCount.toString(),
            color: 'bg-gray-800',
          },
          {
            icon: <Clock size={16} className="text-blue-400" />,
            label: 'Avg Speed',
            value: `${Math.round(r.avgTimePerQuestion)}s/q`,
            color: 'bg-blue-500/10',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center"
          >
            <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center mx-auto mb-2`}>
              {stat.icon}
            </div>
            <p className="text-xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Speed Analysis */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-2">
          <Zap size={16} className="text-yellow-400" />
          <h3 className="text-sm font-semibold text-gray-200">Speed Analysis</h3>
        </div>
        <CardBody>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-800/40 rounded-xl">
              <p className="text-lg font-bold text-white">{Math.floor(r.totalTimeTaken / 60)}m {r.totalTimeTaken % 60}s</p>
              <p className="text-xs text-gray-500 mt-1">Total time used</p>
            </div>
            <div className="text-center p-3 bg-gray-800/40 rounded-xl">
              <p className="text-lg font-bold text-white">{Math.round(r.avgTimePerQuestion)}s</p>
              <p className="text-xs text-gray-500 mt-1">Avg per question</p>
            </div>
            <div className="text-center p-3 bg-gray-800/40 rounded-xl">
              <p className={clsx('text-lg font-bold', getScoreColor(accuracyPct))}>{accuracyPct}%</p>
              <p className="text-xs text-gray-500 mt-1">Accuracy</p>
            </div>
          </div>

          {/* Per-question speed breakdown */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Time Per Question</p>
            {r.attempts.map((attempt, i) => {
              const maxTime = Math.max(...r.attempts.map((a) => a.timeTaken), 1);
              const pct = (attempt.timeTaken / maxTime) * 100;
              return (
                <div key={attempt.questionId} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-8 shrink-0">Q{i + 1}</span>
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={clsx(
                        'h-full rounded-full transition-all duration-500',
                        attempt.isCorrect
                          ? 'bg-emerald-500'
                          : attempt.userAnswer
                          ? 'bg-red-500'
                          : 'bg-gray-700'
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right shrink-0">
                    {attempt.timeTaken}s
                  </span>
                  {attempt.isCorrect ? (
                    <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                  ) : attempt.userAnswer ? (
                    <XCircle size={12} className="text-red-400 shrink-0" />
                  ) : (
                    <Minus size={12} className="text-gray-600 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Mistakes Breakdown */}
      {incorrectAttempts.length > 0 && (
        <Card>
          <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-2">
            <Target size={16} className="text-red-400" />
            <h3 className="text-sm font-semibold text-gray-200">Mistakes Review</h3>
            <Badge variant="red" className="ml-auto">{incorrectAttempts.length} incorrect</Badge>
          </div>
          <CardBody className="space-y-3 !py-4">
            {r.attempts.map((attempt, i) => {
              if (attempt.isCorrect || attempt.userAnswer === '') return null;
              const q = exam?.questions.find((q) => q.id === attempt.questionId);
              if (!q) return null;
              const isExpanded = expandedQ === attempt.questionId;

              return (
                <div
                  key={attempt.questionId}
                  className="bg-red-500/5 border border-red-500/20 rounded-xl overflow-hidden"
                >
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 text-left"
                    onClick={() => setExpandedQ(isExpanded ? null : attempt.questionId)}
                  >
                    <div className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-red-400">{i + 1}</span>
                    </div>
                    <p className="text-sm text-gray-300 flex-1 truncate">{q.text}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="red">{q.marks} marks lost</Badge>
                      {isExpanded ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 border-t border-red-500/15 pt-3">
                      <p className="text-sm text-gray-300 leading-relaxed">{q.text}</p>
                      {q.type === 'mcq' && (
                        <div className="grid grid-cols-2 gap-2">
                          {q.options?.map((opt) => (
                            <div
                              key={opt.id}
                              className={clsx(
                                'px-3 py-2 rounded-lg text-xs border',
                                opt.id === q.correctAnswer
                                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                                  : opt.id === attempt.userAnswer
                                  ? 'bg-red-500/15 border-red-500/40 text-red-300'
                                  : 'bg-gray-800/40 border-gray-700 text-gray-500'
                              )}
                            >
                              <span className="font-bold mr-1">{opt.id.toUpperCase()}.</span>
                              {opt.text}
                              {opt.id === q.correctAnswer && (
                                <span className="ml-1 text-emerald-400">✓ Correct</span>
                              )}
                              {opt.id === attempt.userAnswer && opt.id !== q.correctAnswer && (
                                <span className="ml-1 text-red-400">✗ Your answer</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {(q.type === 'numerical' || q.type === 'subjective') && (
                        <div className="space-y-2">
                          <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-xs text-red-400 font-medium mb-0.5">Your answer</p>
                            <p className="text-sm text-gray-300">{attempt.userAnswer || '—'}</p>
                          </div>
                          <div className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                            <p className="text-xs text-emerald-400 font-medium mb-0.5">Correct answer</p>
                            <p className="text-sm text-gray-300">{q.correctAnswer}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </CardBody>
        </Card>
      )}

      {/* Reflection System */}
      <Card className="border-violet-500/20">
        <div className="px-6 py-4 border-b border-violet-500/20 flex items-center gap-2 bg-violet-500/5">
          <Brain size={16} className="text-violet-400" />
          <div>
            <h3 className="text-sm font-semibold text-violet-300">Reflection System</h3>
            <p className="text-xs text-gray-500">Why did you lose marks? (helps detect patterns)</p>
          </div>
        </div>
        <CardBody className="space-y-4">
          {reflectionSaved ? (
            <div className="text-center py-6">
              <CheckCircle2 size={32} className="text-emerald-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-emerald-400">Reflections saved!</p>
              <p className="text-xs text-gray-500 mt-1">Your patterns will be tracked in Analytics.</p>
            </div>
          ) : incorrectAttempts.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle2 size={32} className="text-emerald-400 mx-auto mb-3" />
              <p className="text-sm text-emerald-400 font-medium">Perfect score — no mistakes to reflect on!</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-400">
                For each incorrect question, select the reason you lost marks:
              </p>
              <div className="space-y-4">
                {r.attempts.map((attempt, i) => {
                  if (attempt.isCorrect || attempt.userAnswer === '') return null;
                  const q = exam?.questions.find((q) => q.id === attempt.questionId);
                  if (!q) return null;
                  const selected = reflections[attempt.questionId];

                  return (
                    <div key={attempt.questionId} className="space-y-2">
                      <p className="text-xs font-semibold text-gray-400">
                        Q{i + 1}: <span className="text-gray-500 font-normal">{q.text.slice(0, 60)}...</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {REFLECTION_OPTIONS.map((opt) => (
                          <button
                            key={opt.reason}
                            onClick={() =>
                              setReflections((prev) => ({
                                ...prev,
                                [attempt.questionId]: prev[attempt.questionId] === opt.reason ? null : opt.reason,
                              }))
                            }
                            className={clsx(
                              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150',
                              selected === opt.reason
                                ? opt.color
                                : 'border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-300'
                            )}
                          >
                            <span>{opt.emoji}</span>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button
                variant="primary"
                icon={<Brain size={14} />}
                onClick={handleSaveReflections}
                className="w-full"
              >
                Save Reflections
              </Button>
            </>
          )}
        </CardBody>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3 pb-8">
        <Button
          variant="secondary"
          icon={<Home size={15} />}
          onClick={() => setView('dashboard')}
          className="flex-1"
        >
          Dashboard
        </Button>
        <Button
          variant="secondary"
          icon={<BarChart3 size={15} />}
          onClick={() => setView('analytics')}
          className="flex-1"
        >
          Analytics
        </Button>
        <Button
          variant="primary"
          icon={<RotateCcw size={15} />}
          onClick={() => {
            if (activeExam) {
              setView('exam-mode');
            } else {
              setView('exam-list');
            }
          }}
          className="flex-1"
        >
          Retry / New Test
        </Button>
      </div>
    </div>
  );
};
