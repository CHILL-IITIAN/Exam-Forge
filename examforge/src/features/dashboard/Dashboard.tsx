import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { useStats } from "./useStats";
import { useSeedDemo } from "@/features/tests/useSeedDemo";
import { formatPerQuestion, relativeTime } from "@/lib/time";

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Burning the midnight oil";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Late session";
}

export default function Dashboard() {
  const { user, isGuest } = useAuth();
  const stats = useStats();
  const seed = useSeedDemo();
  const empty = stats.totalAttempts === 0;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="flex items-end justify-between mb-7 gap-4 flex-wrap">
        <div>
          <h2 className="text-[22px] font-semibold tracking-[-0.025em]">
            {greeting()}, {user?.name ?? "Aspirant"}.
          </h2>
          <p className="text-[13.5px] text-muted mt-1">
            {empty
              ? "Your performance dashboard. Take a test to start seeing real data here."
              : stats.streakDays > 0
                ? `${stats.streakDays}-day streak active. Your discipline is compounding.`
                : "Welcome back. Take a test today to keep momentum."}
          </p>
        </div>
        <div className="flex gap-2">
          {empty && (
            <Button variant="secondary" onClick={seed}>
              Load starter pack
            </Button>
          )}
          <Link to="/tests">
            <Button>+ New Test</Button>
          </Link>
        </div>
      </header>

      {/* Guest banner */}
      {isGuest && (
        <div className="mb-5 flex items-center justify-between gap-4 px-4 py-3 rounded-[12px] bg-red/5 border border-red/15">
          <div className="text-[13px] text-text">
            <span className="text-red-soft font-medium">Guest session active.</span>{" "}
            <span className="text-muted">Create an account to keep your tests across devices.</span>
          </div>
          <Link to="/signup" className="text-[12.5px] text-red-soft hover:underline whitespace-nowrap">
            Promote account →
          </Link>
        </div>
      )}

      {/* Stat row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <StatTile
          label="Accuracy"
          value={stats.accuracy != null ? `${(stats.accuracy * 100).toFixed(1)}%` : "—"}
          sub={stats.accuracy != null ? "across all attempts" : "no tests yet"}
        />
        <StatTile
          label="Avg time / Q"
          value={stats.avgSecPerQ != null ? formatPerQuestion(stats.avgSecPerQ) : "—"}
          sub={stats.avgSecPerQ != null ? "rolling average" : "no tests yet"}
        />
        <StatTile
          label="Streak"
          value={`${stats.streakDays} ${stats.streakDays === 1 ? "day" : "days"}`}
          sub={stats.streakDays > 0 ? "keep going" : "start today"}
        />
        <StatTile
          label="Tests taken"
          value={String(stats.totalAttempts)}
          sub={stats.totalAttempts > 0 ? "all-time" : "create your first"}
        />
      </div>

      {/* Lower grid */}
      <div className="grid lg:grid-cols-3 gap-3.5 mt-3.5">
        <Card
          title="Weekly activity"
          badge="last 14 days"
          className="lg:col-span-2"
        >
          <WeeklyChart data={stats.weeklyCounts} />
        </Card>

        <Card title="Weak subjects" badge={stats.weakSubjects.length ? "fix these first" : undefined}>
          {stats.weakSubjects.length === 0 ? (
            <p className="text-[12.5px] text-dim">
              Need at least 5 questions in a subject to identify weak areas.
            </p>
          ) : (
            <div className="space-y-3">
              {stats.weakSubjects.map((w) => (
                <div key={w.subject}>
                  <div className="flex items-center justify-between text-[13px]">
                    <span>{w.subject}</span>
                    <span className="font-mono text-dim">{(w.accuracy * 100).toFixed(0)}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-bg overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red to-red-soft"
                      style={{ width: `${Math.max(4, w.accuracy * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent tests */}
      <Card
        title="Recent attempts"
        badge={stats.recent.length ? `${stats.recent.length} shown` : undefined}
        className="mt-3.5"
      >
        {stats.recent.length === 0 ? (
          <EmptyState
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6M8 13h8M8 17h5" />
              </svg>
            }
            title="No attempts yet"
            description="Take a test to start building your performance history. Or load the starter pack to see how the dashboard feels with real data."
            action={
              <div className="flex gap-2">
                <Button variant="secondary" onClick={seed}>Load starter pack</Button>
                <Link to="/tests"><Button>Browse tests</Button></Link>
              </div>
            }
          />
        ) : (
          <div className="divide-y divide-DEFAULT -mx-1">
            {stats.recent.map((a) => {
              const pct = a.totalQuestions > 0
                ? Math.round((a.correctCount / (a.correctCount + a.wrongCount || 1)) * 100)
                : 0;
              const tone = pct >= 70 ? "good" : pct >= 50 ? "warn" : "bad";
              return (
                <div key={a.id} className="flex items-center gap-3 px-1 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-medium truncate">{a.testTitle}</div>
                    <div className="text-[11.5px] text-dim mt-0.5 flex items-center gap-2">
                      <span>{a.subject}</span>
                      <span>·</span>
                      <span>{a.totalQuestions} Qs</span>
                      <span>·</span>
                      <span>{relativeTime(a.submittedAt)}</span>
                    </div>
                  </div>
                  <Pill tone={tone}>{pct}%</Pill>
                  <Pill>{a.scoreObtained}/{a.scoreMax}</Pill>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ----------------- bits ----------------- */

function StatTile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-elevated border border-DEFAULT rounded-2xl p-4 transition-colors hover:border-strong">
      <div className="text-[11.5px] uppercase tracking-wider text-dim">{label}</div>
      <div className="font-mono text-[26px] font-semibold mt-2 tracking-tight">{value}</div>
      <div className="text-[11.5px] text-dim mt-1">{sub}</div>
    </div>
  );
}

function WeeklyChart({ data }: { data: number[] }) {
  const max = Math.max(1, ...data);
  return (
    <div className="h-[140px] flex items-end gap-1.5 pt-2">
      {data.map((v, i) => {
        const h = `${(v / max) * 100}%`;
        const isRecent = i >= data.length - 7;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group" title={`${v} attempt${v === 1 ? "" : "s"}`}>
            <div className="w-full h-[110px] flex items-end">
              <div
                className={`w-full rounded-t-md transition-all ${
                  isRecent
                    ? "bg-gradient-to-t from-red/30 to-red shadow-[0_0_12px_rgba(225,29,46,0.25)]"
                    : "bg-gradient-to-t from-[#1f1f26] to-[#3a3a44]"
                } group-hover:brightness-125`}
                style={{ height: v > 0 ? h : "4px", opacity: v > 0 ? 1 : 0.4 }}
              />
            </div>
            <div className="text-[9.5px] text-dim font-mono">
              {i === data.length - 1 ? "today" : i % 3 === 0 ? `${data.length - 1 - i}d` : ""}
            </div>
          </div>
        );
      })}
    </div>
  );
}
