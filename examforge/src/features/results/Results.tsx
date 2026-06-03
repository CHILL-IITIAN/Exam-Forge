import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";
import { useAttemptsStore } from "@/stores/attemptsStore";
import { useTestsStore } from "@/stores/testsStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { formatDuration, formatPerQuestion, relativeTime } from "@/lib/time";
import type { MistakeTag } from "@/types/attempt";

const MISTAKE_TAGS: { id: MistakeTag; label: string }[] = [
  { id: "silly", label: "Silly mistake" },
  { id: "conceptual", label: "Conceptual gap" },
  { id: "time-pressure", label: "Time pressure" },
  { id: "calculation", label: "Calculation error" },
  { id: "confusion", label: "Confusion" },
  { id: "guess", label: "Guessed it" },
];

export default function Results() {
  const { attemptId } = useParams();
  const { user } = useAuth();
  const attempt = useAttemptsStore((s) => s.attempts.find((a) => a.id === attemptId));
  const setTag = useAttemptsStore((s) => s.setMistakeTag);
  const tests = useTestsStore((s) => s.tests);
  const nav = useNavigate();

  if (!attempt) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <p className="text-muted">Attempt not found.</p>
        <Link to="/dashboard" className="text-red-soft hover:underline text-[13px]">← Back to dashboard</Link>
      </div>
    );
  }

  const test = tests.find((t) => t.id === attempt.testId);
  const pct = attempt.correctCount + attempt.wrongCount > 0
    ? Math.round((attempt.correctCount / (attempt.correctCount + attempt.wrongCount)) * 100)
    : 0;
  const tone = pct >= 70 ? "good" : pct >= 50 ? "warn" : "bad";

  const answered = attempt.totalQuestions - attempt.skippedCount;
  const avgPerQ = answered > 0 ? attempt.durationUsedSec / answered : 0;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-6">
        <div className="text-[11.5px] text-dim font-mono mb-1">{relativeTime(attempt.submittedAt)} · {attempt.subject}</div>
        <h2 className="text-[24px] font-semibold tracking-[-0.025em]">{attempt.testTitle}</h2>
        <p className="text-[13.5px] text-muted mt-1">Detailed breakdown of every question.</p>
      </header>

      {/* Score summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-3.5">
        <div className="bg-elevated border border-DEFAULT rounded-2xl p-4 md:col-span-2">
          <div className="text-[11.5px] uppercase tracking-wider text-dim">Score</div>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="font-mono text-[36px] font-semibold tracking-tight">{attempt.scoreObtained}</span>
            <span className="font-mono text-[16px] text-dim">/ {attempt.scoreMax}</span>
            <Pill tone={tone} className="ml-auto self-center">{pct}%</Pill>
          </div>
        </div>
        <StatTile label="Correct" value={String(attempt.correctCount)} tone="text-emerald-400" />
        <StatTile label="Wrong" value={String(attempt.wrongCount)} tone="text-red-soft" />
        <StatTile label="Skipped" value={String(attempt.skippedCount)} tone="text-zinc-400" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 mb-6">
        <StatTile label="Time used" value={formatDuration(attempt.durationUsedSec)} mono />
        <StatTile label="Avg / question" value={formatPerQuestion(avgPerQ)} mono />
        <StatTile label="Total questions" value={String(attempt.totalQuestions)} mono />
      </div>

      <div className="flex gap-2 mb-6">
        {test && (
          <Button onClick={() => nav(`/exam/${test.id}`)}>↻ Retake test</Button>
        )}
        <Link to="/history"><Button variant="secondary">View history</Button></Link>
        <Link to="/reflection"><Button variant="secondary">Reflect on this</Button></Link>
      </div>

      {/* Per-question breakdown */}
      <Card title="Question-by-question breakdown" badge="tap a wrong answer to tag why">
        {!test ? (
          <p className="text-dim text-[13px]">Original test was deleted — detailed view unavailable.</p>
        ) : (
          <div className="space-y-2">
            {test.questions.map((q, i) => {
              const a = attempt.answers[q.id];
              const isSkipped = !a || a.value === null || (Array.isArray(a.value) && a.value.length === 0);
              const status = isSkipped ? "skipped" : a.isCorrect ? "correct" : "wrong";
              const statusTone = status === "correct" ? "good" : status === "wrong" ? "bad" : "default";

              const yourAnswerStr = isSkipped
                ? "—"
                : q.type === "mcq" ? String.fromCharCode(65 + (a.value as number))
                : q.type === "multi" ? (a.value as number[]).map(n => String.fromCharCode(65 + n)).join(", ")
                : String(a.value);
              const correctStr =
                q.type === "mcq" ? String.fromCharCode(65 + q.correct)
                : q.type === "multi" ? q.correct.map(n => String.fromCharCode(65 + n)).join(", ")
                : String(q.correct);

              return (
                <details key={q.id} className="bg-bg border border-DEFAULT rounded-xl group">
                  <summary className="px-4 py-3 cursor-pointer list-none flex items-center gap-3 hover:bg-hover/40 transition rounded-xl">
                    <span className="font-mono text-[12px] text-dim w-7">{i + 1}.</span>
                    <span className="flex-1 truncate text-[13.5px]">{q.stem}</span>
                    <Pill tone={statusTone as any}>{status}</Pill>
                    <span className="font-mono text-[11px] text-dim w-12 text-right">{a ? Math.round(a.timeSpentSec) : 0}s</span>
                  </summary>
                  <div className="px-4 pb-4 pt-1 border-t border-DEFAULT space-y-3">
                    <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{q.stem}</p>
                    <div className="grid grid-cols-2 gap-3 text-[12.5px]">
                      <div className="bg-elevated rounded-lg px-3 py-2">
                        <div className="text-dim text-[11px]">Your answer</div>
                        <div className={`font-mono mt-0.5 ${status === "correct" ? "text-emerald-400" : status === "wrong" ? "text-red-soft" : "text-dim"}`}>{yourAnswerStr}</div>
                      </div>
                      <div className="bg-elevated rounded-lg px-3 py-2">
                        <div className="text-dim text-[11px]">Correct</div>
                        <div className="font-mono text-emerald-400 mt-0.5">{correctStr}</div>
                      </div>
                    </div>
                    {q.explanation && (
                      <div className="bg-elevated rounded-lg px-3 py-2.5 text-[13px] text-muted leading-relaxed">
                        <span className="text-text font-medium">Explanation. </span>{q.explanation}
                      </div>
                    )}
                    {status === "wrong" && user && (
                      <div>
                        <div className="text-[11.5px] text-dim uppercase tracking-wider mb-2">Why did this happen?</div>
                        <div className="flex flex-wrap gap-1.5">
                          {MISTAKE_TAGS.map((m) => (
                            <button
                              key={m.id}
                              onClick={() => setTag(user.id, attempt.id, q.id, { mistakeTag: m.id })}
                              className={`px-2.5 py-1 rounded-md border text-[11.5px] transition ${
                                a.mistakeTag === m.id
                                  ? "bg-red/15 border-red/40 text-red-soft"
                                  : "bg-elevated border-DEFAULT text-muted hover:border-strong"
                              }`}
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function StatTile({ label, value, tone = "text-text", mono }: { label: string; value: string; tone?: string; mono?: boolean }) {
  return (
    <div className="bg-elevated border border-DEFAULT rounded-2xl p-4">
      <div className="text-[11.5px] uppercase tracking-wider text-dim">{label}</div>
      <div className={`${mono ? "font-mono" : ""} text-[22px] font-semibold mt-1.5 tracking-tight ${tone}`}>{value}</div>
    </div>
  );
}
