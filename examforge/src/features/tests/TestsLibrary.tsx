import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";
import { useTestsStore } from "@/stores/testsStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pill } from "@/components/ui/Pill";
import { formatDuration, relativeTime } from "@/lib/time";
import { useSeedDemo } from "./useSeedDemo";

export default function TestsLibrary() {
  const { user } = useAuth();
  const tests = useTestsStore((s) => s.tests);
  const remove = useTestsStore((s) => s.remove);
  const seed = useSeedDemo();
  const nav = useNavigate();
  const [query, setQuery] = useState("");

  const filtered = tests
    .filter((t) => query.trim() ? (t.title + " " + t.subject).toLowerCase().includes(query.trim().toLowerCase()) : true)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="flex items-end justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h2 className="text-[22px] font-semibold tracking-[-0.025em]">My Tests</h2>
          <p className="text-[13.5px] text-muted mt-1">Create custom exams, retake, or import the starter pack.</p>
        </div>
        <div className="flex gap-2">
          {tests.length === 0 && (
            <Button variant="secondary" onClick={seed}>Load starter pack</Button>
          )}
          <Link to="/tests/new"><Button>+ New Test</Button></Link>
        </div>
      </header>

      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tests by name or subject…"
            className="w-full bg-elevated border border-DEFAULT rounded-[10px] pl-9 pr-3 py-2 text-[13.5px] outline-none focus:border-red/50 focus:ring-2 focus:ring-red/20 transition"
          />
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-dim" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
          </svg>
        </div>
      </div>

      {tests.length === 0 ? (
        <Card padded={false}>
          <EmptyState
            title="No tests yet"
            description="Start with the curated starter pack of JEE & NEET-style tests, or build your own."
            action={
              <div className="flex gap-2">
                <Button variant="secondary" onClick={seed}>Load starter pack</Button>
                <Link to="/tests/new"><Button>+ New Test</Button></Link>
              </div>
            }
          />
        </Card>
      ) : filtered.length === 0 ? (
        <Card padded={false}>
          <EmptyState title="No matches" description={`Nothing matches "${query}".`} action={<Button variant="secondary" onClick={() => setQuery("")}>Clear search</Button>} />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtered.map((t) => (
            <div key={t.id} className="bg-elevated border border-DEFAULT rounded-2xl p-5 flex flex-col gap-4 hover:border-strong transition-colors">
              <div className="flex items-start justify-between gap-2">
                <Pill tone="info">{t.subject}</Pill>
                <span className="text-[11px] text-dim">{relativeTime(t.updatedAt)}</span>
              </div>
              <div>
                <h3 className="text-[15px] font-semibold tracking-tight leading-snug">{t.title}</h3>
                <div className="mt-2 flex items-center gap-3 text-[12px] text-dim font-mono">
                  <span>{t.questions.length} Qs</span><span>·</span><span>{formatDuration(t.durationSec)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-1 mt-auto pt-2 border-t border-DEFAULT">
                <div className="flex gap-1">
                  <button
                    onClick={() => nav(`/tests/${t.id}/edit`)}
                    className="text-[12px] text-muted hover:text-text px-2 py-1.5 rounded-md hover:bg-bg transition"
                  >Edit</button>
                  <button
                    onClick={() => { if (user && confirm(`Delete "${t.title}"?`)) remove(user.id, t.id); }}
                    className="text-[12px] text-dim hover:text-red-soft px-2 py-1.5 rounded-md hover:bg-bg transition"
                  >Delete</button>
                </div>
                <Button onClick={() => nav(`/exam/${t.id}`)}>Start →</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
