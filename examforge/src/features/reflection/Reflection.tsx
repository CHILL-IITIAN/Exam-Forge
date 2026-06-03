import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";
import { useAttemptsStore } from "@/stores/attemptsStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pill } from "@/components/ui/Pill";
import { relativeTime } from "@/lib/time";
import type { Reflection as ReflectionT } from "@/types/attempt";

const PROMPTS: { key: keyof ReflectionT; label: string; placeholder: string }[] = [
  { key: "whatWentWrong",     label: "What went wrong?",        placeholder: "Where did you slip — concept, time, focus?" },
  { key: "biggestWeakness",   label: "Biggest weakness exposed", placeholder: "Be specific. Topic, type of question, mental block…" },
  { key: "whatImproved",      label: "What improved?",          placeholder: "Even tiny wins. Faster reading? Less panic?" },
  { key: "needsWork",         label: "What needs work tomorrow?", placeholder: "One thing you'll attack in your next session." },
  { key: "emotionalState",    label: "Emotional state during exam", placeholder: "Calm, anxious, scattered, in flow…" },
  { key: "timeManagement",    label: "Time management notes",   placeholder: "Did you spend too long anywhere? Rush at the end?" },
];

export default function Reflection() {
  const { user } = useAuth();
  const attempts = useAttemptsStore((s) => s.attempts);
  const setReflection = useAttemptsStore((s) => s.setReflection);

  const sorted = useMemo(() => [...attempts].sort((a, b) => b.submittedAt - a.submittedAt), [attempts]);
  const [selectedId, setSelectedId] = useState<string | null>(sorted[0]?.id ?? null);

  // keep a valid selection if attempts list changes
  useEffect(() => {
    if (!selectedId && sorted.length) setSelectedId(sorted[0].id);
    else if (selectedId && !sorted.find((a) => a.id === selectedId)) setSelectedId(sorted[0]?.id ?? null);
  }, [sorted, selectedId]);

  const selected = sorted.find((a) => a.id === selectedId);

  const [draft, setDraft] = useState<Partial<ReflectionT>>({});
  const [saved, setSaved] = useState(false);

  // reload draft whenever the selection changes
  useEffect(() => {
    setDraft(selected?.reflection ?? {});
    setSaved(false);
  }, [selectedId, selected?.reflection?.updatedAt]);

  function save() {
    if (!user || !selected) return;
    setReflection(user.id, selected.id, { ...draft, updatedAt: Date.now() } as ReflectionT);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  if (sorted.length === 0) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <header className="mb-6">
          <h2 className="text-[22px] font-semibold tracking-[-0.025em]">Reflection</h2>
          <p className="text-[13.5px] text-muted mt-1">Self-analysis is half the battle.</p>
        </header>
        <Card padded={false}>
          <EmptyState
            title="No attempts to reflect on"
            description="Take a test and come back here to journal what went well and what didn't."
            action={<Link to="/tests"><Button>Go to My Tests</Button></Link>}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-6">
        <h2 className="text-[22px] font-semibold tracking-[-0.025em]">Reflection</h2>
        <p className="text-[13.5px] text-muted mt-1">Pick an attempt, write what you noticed. Your future self will thank you.</p>
      </header>

      <div className="grid lg:grid-cols-[280px_1fr] gap-3.5">
        <Card title="Attempts" padded={false}>
          <div className="divide-y divide-DEFAULT max-h-[600px] overflow-y-auto">
            {sorted.map((a) => {
              const pct = a.correctCount + a.wrongCount > 0
                ? Math.round((a.correctCount / (a.correctCount + a.wrongCount)) * 100) : 0;
              const isActive = a.id === selectedId;
              return (
                <button
                  key={a.id}
                  onClick={() => setSelectedId(a.id)}
                  className={`w-full text-left px-4 py-3 transition ${isActive ? "bg-red/10" : "hover:bg-hover/40"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[13px] font-medium truncate">{a.testTitle}</div>
                    {a.reflection && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" title="Reflected" />}
                  </div>
                  <div className="text-[11.5px] text-dim mt-0.5 flex items-center gap-2">
                    <span>{relativeTime(a.submittedAt)}</span>
                    <span>·</span>
                    <Pill tone={pct >= 70 ? "good" : pct >= 50 ? "warn" : "bad"} className="!text-[10px] !py-0">{pct}%</Pill>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {selected && (
          <Card
            title={selected.testTitle}
            badge={selected.subject}
            action={
              <div className="flex items-center gap-2">
                {saved && <span className="text-[11.5px] text-emerald-400">✓ saved</span>}
                <Button onClick={save}>Save reflection</Button>
              </div>
            }
          >
            <div className="grid md:grid-cols-2 gap-3.5">
              {PROMPTS.map((p) => (
                <div key={p.key}>
                  <span className="text-[12px] text-muted">{p.label}</span>
                  <textarea
                    value={(draft[p.key] as string) ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, [p.key]: e.target.value }))}
                    rows={3}
                    placeholder={p.placeholder}
                    className="mt-1.5 w-full bg-elevated border border-DEFAULT rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none focus:border-red/50 focus:ring-2 focus:ring-red/20 transition resize-y leading-relaxed"
                  />
                </div>
              ))}
            </div>
            {selected.reflection?.updatedAt && (
              <p className="mt-4 text-[11.5px] text-dim">Last updated {relativeTime(selected.reflection.updatedAt)}.</p>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
