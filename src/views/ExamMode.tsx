import React, { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Flag,
  Clock,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { useExamStore } from '../store/examStore';
import { Button } from '../components/ui/Button';
import type { Question, QuestionAttempt, TestResult } from '../types';
import { clsx } from 'clsx';

interface WarningBannerProps {
  message: string;
  onDismiss: () => void;
}

const WarningBanner: React.FC<WarningBannerProps> = ({ message, onDismiss }) => (
  <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-4 py-2.5 bg-yellow-500/20 border-b border-yellow-500/40 animate-pulse">
    <AlertTriangle size={14} className="text-yellow-400 mr-2 shrink-0" />
    <span className="text-xs font-semibold text-yellow-300">{message}</span>
    <button
      onClick={onDismiss}
      className="ml-4 text-xs text-yellow-400 underline hover:no-underline"
    >
      Dismiss
    </button>
  </div>
);

interface ExitConfirmProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const ExitConfirm: React.FC<ExitConfirmProps> = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
    <div className="relative bg-gray-900 border border-red-500/30 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl shadow-red-900/20">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center">
          <AlertTriangle size={26} className="text-red-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-2">Exit Exam?</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Your answers will be submitted and the test will be marked as complete.
            <span className="text-red-400 font-medium"> This cannot be undone.</span>
          </p>
        </div>
        <div className="flex gap-3 w-full pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-semibold transition-colors"
          >
            Continue Test
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors"
          >
            Submit & Exit
          </button>
        </div>
      </div>
    </div>
  </div>
);

interface TimerDisplayProps {
  seconds: number;
  totalSeconds: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ seconds, totalSeconds }) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isWarning = seconds <= 60;
  const isCritical = seconds <= 30;
  const pct = (seconds / totalSeconds) * 100;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Time */}
      <div
        className={clsx(
          'font-mono text-5xl font-bold tracking-tight tabular-nums transition-colors',
          isCritical
            ? 'text-red-400 animate-pulse'
            : isWarning
            ? 'text-orange-400'
            : 'text-white'
        )}
        style={{
          textShadow: isCritical
            ? '0 0 30px rgba(239,68,68,0.6)'
            : isWarning
            ? '0 0 20px rgba(251,146,60,0.4)'
            : '0 0 15px rgba(255,255,255,0.15)',
        }}
      >
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </div>

      {/* Progress bar */}
      <div className="w-32 h-1 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-1000',
            isCritical ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-violet-500'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      {isWarning && (
        <p className={clsx('text-xs font-medium', isCritical ? 'text-red-400' : 'text-orange-400')}>
          {isCritical ? '⚠ Final moments!' : 'Less than 1 minute remaining'}
        </p>
      )}
    </div>
  );
};

interface QuestionDisplayProps {
  question: Question;
  index: number;
  total: number;
  userAnswer: string;
  onAnswer: (answer: string) => void;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  index,
  total,
  userAnswer,
  onAnswer,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-250">
      {/* Question meta */}
      <div className="flex items-center gap-3">
        <div className="px-3 py-1 bg-violet-600/20 border border-violet-500/30 rounded-full">
          <span className="text-xs font-bold text-violet-300 uppercase tracking-widest">
            Q{index + 1} of {total}
          </span>
        </div>
        <div className="px-3 py-1 bg-gray-800 rounded-full">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">
            {question.type === 'mcq' ? 'Multiple Choice' : question.type === 'numerical' ? 'Numerical' : 'Subjective'} • {question.marks} marks
          </span>
        </div>
        {question.subject && (
          <div className="px-3 py-1 bg-gray-800 rounded-full">
            <span className="text-xs font-medium text-gray-500">{question.subject}</span>
          </div>
        )}
      </div>

      {/* Question text */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <p className="text-lg font-medium text-white leading-relaxed">{question.text}</p>
      </div>

      {/* Answer area */}
      {question.type === 'mcq' && (
        <div className="space-y-3">
          {(question.options ?? []).map((opt) => {
            const selected = userAnswer === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onAnswer(opt.id)}
                className={clsx(
                  'w-full flex items-center gap-4 px-5 py-4 rounded-xl border transition-all duration-150 text-left group',
                  selected
                    ? 'bg-violet-600/20 border-violet-500/60 shadow-sm shadow-violet-900/30'
                    : 'bg-gray-900/40 border-gray-800 hover:border-gray-600 hover:bg-gray-800/40'
                )}
              >
                <div
                  className={clsx(
                    'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors',
                    selected
                      ? 'bg-violet-500 text-white'
                      : 'bg-gray-800 text-gray-500 group-hover:bg-gray-700 group-hover:text-gray-300'
                  )}
                >
                  {opt.id.toUpperCase()}
                </div>
                <span
                  className={clsx(
                    'text-sm font-medium',
                    selected ? 'text-white' : 'text-gray-300 group-hover:text-gray-100'
                  )}
                >
                  {opt.text}
                </span>
                {selected && (
                  <CheckCircle2 size={16} className="ml-auto text-violet-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {question.type === 'numerical' && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
            Your Answer
          </label>
          <input
            type="number"
            placeholder="Enter your numerical answer..."
            value={userAnswer}
            onChange={(e) => onAnswer(e.target.value)}
            className="w-full bg-gray-900/60 border border-gray-700 rounded-xl px-5 py-4 text-white text-lg font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all placeholder-gray-700"
          />
        </div>
      )}

      {question.type === 'subjective' && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
            Your Answer
          </label>
          <textarea
            rows={5}
            placeholder="Write your answer here..."
            value={userAnswer}
            onChange={(e) => onAnswer(e.target.value)}
            className="w-full bg-gray-900/60 border border-gray-700 rounded-xl px-5 py-4 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all placeholder-gray-700"
          />
        </div>
      )}
    </div>
  );
};

export const ExamMode: React.FC = () => {
  const { activeExam, addResult, setView } = useExamStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(activeExam?.totalTime ?? 0);
  const [questionTimers, setQuestionTimers] = useState<Record<string, number>>({});
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
    // Disable right-click
    const noContext = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', noContext);
    return () => document.removeEventListener('contextmenu', noContext);
  }, []);

  // Tab visibility detection
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && !submitted) {
        setWarning('⚠ Tab switching detected! Stay focused on your exam.');
        if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
        warningTimeoutRef.current = setTimeout(() => setWarning(null), 5000);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [submitted]);

  // ESC key handler
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitted) {
        setShowExitConfirm(true);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [submitted]);

  // Countdown timer
  useEffect(() => {
    if (!activeExam || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeExam, submitted]);

  const saveQuestionTime = useCallback(
    (qId: string) => {
      const elapsed = Math.floor((Date.now() - questionStartTime) / 1000);
      setQuestionTimers((prev) => ({
        ...prev,
        [qId]: (prev[qId] ?? 0) + elapsed,
      }));
      setQuestionStartTime(Date.now());
    },
    [questionStartTime]
  );

  const navigate = (delta: number) => {
    if (!activeExam) return;
    const currentQ = activeExam.questions[currentIndex];
    saveQuestionTime(currentQ.id);
    const next = currentIndex + delta;
    if (next >= 0 && next < activeExam.questions.length) {
      setCurrentIndex(next);
      setQuestionStartTime(Date.now());
    }
  };

  const handleSubmit = (auto = false) => {
    if (submitted || !activeExam) return;
    setSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);

    // Save time for current question
    const currentQ = activeExam.questions[currentIndex];
    const elapsed = Math.floor((Date.now() - questionStartTime) / 1000);
    const finalTimers = {
      ...questionTimers,
      [currentQ.id]: (questionTimers[currentQ.id] ?? 0) + elapsed,
    };

    const totalTimeUsed = activeExam.totalTime - timeLeft + elapsed;

    const attempts: QuestionAttempt[] = activeExam.questions.map((q) => {
      const userAnswer = answers[q.id] ?? '';
      let isCorrect = false;

      if (q.type === 'mcq') {
        isCorrect = userAnswer === q.correctAnswer;
      } else if (q.type === 'numerical') {
        isCorrect =
          parseFloat(userAnswer) === parseFloat(q.correctAnswer) && userAnswer !== '';
      } else {
        // Subjective: check keyword match (simplified)
        isCorrect =
          userAnswer.trim().toLowerCase().includes(q.correctAnswer.toLowerCase()) &&
          userAnswer.trim().length > 0;
      }

      return {
        questionId: q.id,
        userAnswer,
        timeTaken: finalTimers[q.id] ?? 0,
        isCorrect,
        marksAwarded: isCorrect ? q.marks : 0,
      };
    });

    const scoredMarks = attempts.reduce((s, a) => s + a.marksAwarded, 0);
    const totalMarks = activeExam.questions.reduce((s, q) => s + q.marks, 0);
    const correctCount = attempts.filter((a) => a.isCorrect).length;
    const incorrectCount = attempts.filter(
      (a) => !a.isCorrect && a.userAnswer !== ''
    ).length;
    const unattemptedCount = attempts.filter((a) => a.userAnswer === '').length;
    const avgTimePerQuestion = totalTimeUsed / activeExam.questions.length;

    const result: TestResult = {
      id: uuidv4(),
      examId: activeExam.id,
      examTitle: activeExam.title,
      subject: activeExam.subject,
      totalMarks,
      scoredMarks,
      totalQuestions: activeExam.questions.length,
      correctCount,
      incorrectCount,
      unattemptedCount,
      totalTimeTaken: totalTimeUsed,
      avgTimePerQuestion,
      attempts,
      reflections: [],
      completedAt: new Date().toISOString(),
      autoSubmitted: auto,
    };

    addResult(result);
    setView('result');
  };

  if (!activeExam) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <p className="text-gray-400">No exam loaded.</p>
      </div>
    );
  }

  const currentQuestion = activeExam.questions[currentIndex];
  const answeredCount = Object.values(answers).filter((a) => a !== '').length;

  return (
    <div
      className={clsx(
        'fixed inset-0 bg-black z-50 flex flex-col transition-opacity duration-500',
        mounted ? 'opacity-100' : 'opacity-0'
      )}
    >
      {/* Tab warning banner */}
      {warning && (
        <WarningBanner message={warning} onDismiss={() => setWarning(null)} />
      )}

      {/* Exit confirmation */}
      {showExitConfirm && (
        <ExitConfirm
          onConfirm={() => handleSubmit(false)}
          onCancel={() => setShowExitConfirm(false)}
        />
      )}

      {/* TOP BAR */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-900">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">EF</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-300 leading-none">{activeExam.title}</p>
            <p className="text-[10px] text-gray-600 mt-0.5">{activeExam.subject}</p>
          </div>
        </div>

        <TimerDisplay seconds={timeLeft} totalSeconds={activeExam.totalTime} />

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-medium text-gray-400">
              {answeredCount}/{activeExam.questions.length} answered
            </p>
            <div className="w-28 h-1 bg-gray-800 rounded-full mt-1.5">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${(answeredCount / activeExam.questions.length) * 100}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => setShowExitConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-600/20 transition-colors"
          >
            <Flag size={12} />
            Submit
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 overflow-hidden">
        {/* Question Panel */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-8">
            <QuestionDisplay
              key={currentQuestion.id}
              question={currentQuestion}
              index={currentIndex}
              total={activeExam.questions.length}
              userAnswer={answers[currentQuestion.id] ?? ''}
              onAnswer={(ans) =>
                setAnswers((prev) => ({ ...prev, [currentQuestion.id]: ans }))
              }
            />

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-900">
              <Button
                variant="secondary"
                icon={<ChevronLeft size={15} />}
                onClick={() => navigate(-1)}
                disabled={currentIndex === 0}
                className="bg-gray-900 border-gray-800 hover:bg-gray-800"
              >
                Previous
              </Button>

              <div className="flex items-center gap-1.5">
                {activeExam.questions.map((q, i) => {
                  const isAnswered = !!(answers[q.id] && answers[q.id] !== '');
                  const isCurrent = i === currentIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        saveQuestionTime(currentQuestion.id);
                        setCurrentIndex(i);
                        setQuestionStartTime(Date.now());
                      }}
                      className={clsx(
                        'w-7 h-7 rounded-lg text-xs font-bold transition-all duration-150',
                        isCurrent
                          ? 'bg-violet-600 text-white scale-110'
                          : isAnswered
                          ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-600/40 hover:bg-emerald-600/50'
                          : 'bg-gray-900 text-gray-600 border border-gray-800 hover:bg-gray-800 hover:text-gray-300'
                      )}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              {currentIndex < activeExam.questions.length - 1 ? (
                <Button
                  variant="primary"
                  iconRight={<ChevronRight size={15} />}
                  onClick={() => navigate(1)}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="primary"
                  icon={<Flag size={14} />}
                  onClick={() => setShowExitConfirm(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40"
                >
                  Finish
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Side panel — question status */}
        <div className="w-52 border-l border-gray-900 overflow-y-auto p-4 hidden lg:block">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">
            Question Map
          </p>
          <div className="space-y-1.5">
            {activeExam.questions.map((q, i) => {
              const isAnswered = !!(answers[q.id] && answers[q.id] !== '');
              const isCurrent = i === currentIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => {
                    saveQuestionTime(currentQuestion.id);
                    setCurrentIndex(i);
                    setQuestionStartTime(Date.now());
                  }}
                  className={clsx(
                    'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all text-left',
                    isCurrent
                      ? 'bg-violet-600/20 border border-violet-500/30 text-violet-300'
                      : isAnswered
                      ? 'bg-emerald-600/10 border border-emerald-600/20 text-emerald-400 hover:bg-emerald-600/20'
                      : 'text-gray-600 hover:bg-gray-900 hover:text-gray-300'
                  )}
                >
                  {isAnswered ? (
                    <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                  ) : (
                    <Circle size={12} className="shrink-0" />
                  )}
                  <span className="font-medium">Q{i + 1}</span>
                  <span className="text-[10px] text-gray-600 truncate">{q.type}</span>
                  <span className="ml-auto text-[10px] text-gray-700">{q.marks}m</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-900 space-y-2">
            <div className="flex items-center gap-2 text-[10px] text-gray-600">
              <CheckCircle2 size={10} className="text-emerald-400" />
              Answered ({answeredCount})
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-600">
              <Circle size={10} />
              Unanswered ({activeExam.questions.length - answeredCount})
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-600 mb-2">
              <Clock size={10} />
              Time used
            </div>
            <div className="w-full bg-gray-900 rounded-full h-1.5">
              <div
                className="h-1.5 bg-violet-500 rounded-full transition-all duration-1000"
                style={{
                  width: `${((activeExam.totalTime - timeLeft) / activeExam.totalTime) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
