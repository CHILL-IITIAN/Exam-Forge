import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAttemptsStore } from "@/stores/attemptsStore";
import { useAuth } from "@/features/auth/useAuth";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { formatDuration, relativeTime } from "@/lib/time";
import type { Subject } from "@/types/test";

const SUBJECTS: ("All" | Subject)[] = ["All", "Physics", "Chemistry", "Mathematics", "Biology", "General"];

export default function History() {
  const { user } = useAuth();
  const attempts = useAttemptsStore((s) => s.attempts);
  const remove = useAttemptsStore((s) => s.remove);
  const nav = useNavigate();

  const [subject, setSubject] = useState<(typeof SUBJECTS)[number]>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return attempts
      .filter((a) => (subject === "All" ? true : a.subject === subject))
      .filter((a) =>
        query.trim() ? a.testTitle.toLowerCase().includes(query.trim().toLowerCase()) : true
      )
      .sort((a, b) => b.submittedAt - a.submittedAt);
  }, [attempts, subject, query]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-6">
        <h2 className="text-[22px] font-semibold tracking-[-0.025em]">History</h2>
        <p className="text-[13.5px] text-muted mt-1">Every attempt, ever. Compare, retake, learn.</p>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by test name…"
            className="w-full bg-elevated border border-DEFAULT rounded-[10px] pl-9 pr-3 py-2 text-[13.5px] outline-none focus:border-red/50 focus:ring-2 focus:ring-red/20 transition"
          />
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-dim" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <div className="flex gap-1 bg-elevated p-1 rounded-lg border border-DEFAULT">
          {SUBJECTS.map((s) => (
            <button
              key={s}
              onClick={() => setSubject(s)}
              className={`px-3 py-1 rounded-md text-[12px] transition ${
                subject === s ? "bg-bg text-text" : "text-dim hover:text-muted"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {attempts.length === 0 ? (
        <Card padded={false}>
          <EmptyState
            title="No attempts yet"
            description="Take a test from your library and your performance history will live here."
            action={<Link to="/tests"><Button>Go to My Tests</Button></Link>}
          />
        </Card>
      ) : filtered.length === 0 ? (
        <Card padded={false}>
          <EmptyState title="No matches" description="Try clearing filters." />
        </Card>
      ) : (
        <Card padded={false}>
          <div className="divide-y divide-DEFAULT">
            {filtered.map((a) => {
              const pct = a.correctCount + a.wrongCount > 0
                ? Math.round((a.correctCount / (a.correctCount + a.wrongCount)) * 100)
                : 0;
              const tone = pct >= 70 ? "good" : pct >= 50 ? "warn" : "bad";
              return (
                <div key={a.id} className="px-5 py-4 flex items-center gap-4 hover:bg-hover/30 transition">
                  <div className="flex-1 min-w-0">
                    <button onClick={() => nav(`/results/${a.id}`)} className="text-left">
                      <div className="text-[14px] font-medium truncate hover:text-red-soft transition">{a.testTitle}</div>
                    </button>
                    <div className="text-[11.5px] text-dim mt-0.5 flex items-center gap-2 flex-wrap">
                      <span>{a.subject}</span><span>·</span>
                      <span>{a.totalQuestions} Qs</span><span>·</span>
                      <span>{formatDuration(a.durationUsedSec)}</span><span>·</span>
                      <span>{relativeTime(a.submittedAt)}</span>
                    </div>
                  </div>
                  <Pill tone={tone as any}>{pct}%</Pill>
                  <Pill>{a.scoreObtained}/{a.scoreMax}</Pill>
                  <button onClick={() => nav(`/results/${a.id}`)} className="text-[12px] text-muted hover:text-text px-2.5 py-1 rounded-md hover:bg-elevated transition">View</button>
                  <button onClick={() => nav(`/exam/${a.testId}`)} className="text-[12px] text-red-soft hover:underline px-2 py-1">Retake</button>
                  <button
                    onClick={() => user && confirm("Delete this attempt?") && remove(user.id, a.id)}
                    className="text-dim hover:text-red-soft px-2 py-1 text-[14px]"
                    title="Delete attempt"
                  >×</button>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
