import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";
import { useTestsStore } from "@/stores/testsStore";
import { useAttemptsStore } from "@/stores/attemptsStore";
import type { Question } from "@/types/test";
import type { AnswerRecord, Attempt } from "@/types/attempt";
import { isAnswerCorrect } from "./grading";
import { formatDuration } from "@/lib/time";
import { uid } from "@/lib/ids";

interface AnswerDraft {
  value: number | number[] | null;
  marked: boolean;
  timeSpentSec: number;
}

export default function ExamRunner() {
  const { testId } = useParams();
  const { user } = useAuth();
  const test = useTestsStore((s) => s.tests.find((t) => t.id === testId));
  const addAttempt = useAttemptsStore((s) => s.add);
  const nav = useNavigate();

  // ---------- state ----------
  const [currentIdx, setCurrentIdx] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, AnswerDraft>>({});
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const startedAtRef = useRef<number>(Date.now());
  const lastEnterRef = useRef<number>(Date.now());
  const [now, setNow] = useState(Date.now());

  // initialise drafts when test loads
  useEffect(() => {
    if (!test) return;
    const init: Record<string, AnswerDraft> = {};
    test.questions.forEach((q) => {
      init[q.id] = { value: null, marked: false, timeSpentSec: 0 };
    });
    setDrafts(init);
    startedAtRef.current = Date.now();
    lastEnterRef.current = Date.now();
  }, [test?.id]);

  // tick every second
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const remainingSec = test
    ? Math.max(0, test.durationSec - Math.floor((now - startedAtRef.current) / 1000))
    : 0;

  // commit time spent on the question we are leaving
  const commitTime = useCallback((qId: string) => {
    setDrafts((d) => {
      const prev = d[qId] ?? { value: null, marked: false, timeSpentSec: 0 };
      const delta = Math.max(0, Math.floor((Date.now() - lastEnterRef.current) / 1000));
      lastEnterRef.current = Date.now();
      return { ...d, [qId]: { ...prev, timeSpentSec: prev.timeSpentSec + delta } };
    });
  }, []);

  // ---------- submit ----------
  const submit = useCallback(() => {
    if (!test || !user) return;
    // commit time on the question currently on screen
    const currentQ = test.questions[currentIdx];
    if (currentQ) commitTime(currentQ.id);

    let correct = 0, wrong = 0, skipped = 0;
    let scoreObtained = 0, scoreMax = 0;
    const answers: Record<string, AnswerRecord> = {};
    for (const q of test.questions) {
      const d = drafts[q.id] ?? { value: null, marked: false, timeSpentSec: 0 };
      scoreMax += q.marks;
      const isSkipped = d.value === null || (Array.isArray(d.value) && d.value.length === 0);
      const ok = !isSkipped && isAnswerCorrect(q, d.value);
      if (isSkipped) {
        skipped++;
      } else if (ok) {
        correct++; scoreObtained += q.marks;
      } else {
        wrong++; scoreObtained -= q.negativeMarks;
      }
      answers[q.id] = {
        questionId: q.id,
        value: d.value,
        isCorrect: ok,
        marked: d.marked,
        timeSpentSec: d.timeSpentSec,
      };
    }
    const attempt: Attempt = {
      id: uid("a"),
      ownerId: user.id,
      testId: test.id,
      testTitle: test.title,
      subject: test.subject,
      startedAt: startedAtRef.current,
      submittedAt: Date.now(),
      durationUsedSec: Math.min(test.durationSec, Math.floor((Date.now() - startedAtRef.current) / 1000)),
      totalQuestions: test.questions.length,
      correctCount: correct,
      wrongCount: wrong,
      skippedCount: skipped,
      scoreObtained,
      scoreMax,
      answers,
    };
    addAttempt(user.id, attempt);
    nav(`/results/${attempt.id}`, { replace: true });
  }, [test, user, drafts, currentIdx, commitTime, addAttempt, nav]);

  // auto-submit on timeout
  useEffect(() => {
    if (!test) return;
    if (remainingSec <= 0) submit();
  }, [remainingSec, test, submit]);

  // ---------- helpers ----------
  const goTo = useCallback((idx: number) => {
    if (!test) return;
    if (idx < 0 || idx >= test.questions.length) return;
    const currentQ = test.questions[currentIdx];
    if (currentQ) commitTime(currentQ.id);
    setCurrentIdx(idx);
  }, [test, currentIdx, commitTime]);

  const setValue = useCallback((qId: string, value: number | number[] | null) => {
    setDrafts((d) => ({ ...d, [qId]: { ...(d[qId] ?? { value: null, marked: false, timeSpentSec: 0 }), value } }));
  }, []);
  const toggleMark = useCallback((qId: string) => {
    setDrafts((d) => ({ ...d, [qId]: { ...(d[qId] ?? { value: null, marked: false, timeSpentSec: 0 }), marked: !(d[qId]?.marked) } }));
  }, []);
  const clearResponse = useCallback((qId: string) => setValue(qId, null), [setValue]);

  // keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!test) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const q = test.questions[currentIdx];
      if (!q) return;
      if (e.key === "ArrowRight" || e.key.toLowerCase() === "n") { e.preventDefault(); goTo(currentIdx + 1); }
      else if (e.key === "ArrowLeft" || e.key.toLowerCase() === "p") { e.preventDefault(); goTo(currentIdx - 1); }
      else if (e.key.toLowerCase() === "m") { e.preventDefault(); toggleMark(q.id); }
      else if (e.key.toLowerCase() === "c") { e.preventDefault(); clearResponse(q.id); }
      else if (q.type === "mcq" && /^[1-9]$/.test(e.key)) {
        const i = parseInt(e.key, 10) - 1;
        if (i < q.options.length) { e.preventDefault(); setValue(q.id, i); }
      } else if (q.type === "multi" && /^[1-9]$/.test(e.key)) {
        const i = parseInt(e.key, 10) - 1;
        if (i < q.options.length) {
          e.preventDefault();
          const cur = (drafts[q.id]?.value as number[] | null) ?? [];
          const set = new Set(cur);
          set.has(i) ? set.delete(i) : set.add(i);
          setValue(q.id, Array.from(set).sort());
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [test, currentIdx, drafts, goTo, toggleMark, clearResponse, setValue]);

  // warn on close/refresh
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  // ---------- render ----------
  if (!test) {
    return (
      <div className="min-h-screen grid place-items-center text-muted">
        Test not found. <button onClick={() => nav("/tests")} className="ml-2 text-red-soft hover:underline">Back to My Tests</button>
      </div>
    );
  }

  const counts = useMemo(() => {
    let answered = 0, marked = 0, notAnswered = 0;
    for (const q of test.questions) {
      const d = drafts[q.id];
      const hasVal = d && d.value !== null && !(Array.isArray(d.value) && d.value.length === 0);
      if (d?.marked && !hasVal) marked++;
      else if (hasVal && d?.marked) marked++;
      else if (hasVal) answered++;
      else notAnswered++;
    }
    return { answered, marked, notAnswered };
  }, [drafts, test]);

  const currentQ = test.questions[currentIdx];
  const lowTime = remainingSec < 60;

  return (
    <div className="fixed inset-0 bg-bg text-text flex flex-col z-50">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-DEFAULT bg-raised/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-[6px] bg-gradient-to-br from-red to-[#7a0d18] shadow-red" />
          <div>
            <div className="text-[13px] font-semibold tracking-tight leading-tight">{test.title}</div>
            <div className="text-[11px] text-dim">{test.subject} · {test.questions.length} questions</div>
          </div>
        </div>
        <div className={`font-mono text-[20px] tabular-nums tracking-tight px-4 py-1.5 rounded-lg border transition ${
          lowTime ? "text-red-soft border-red/40 bg-red/10 animate-pulse" : "text-text border-DEFAULT bg-elevated"
        }`}>
          {formatDuration(remainingSec)}
        </div>
        <button
          onClick={() => setConfirmSubmit(true)}
          className="px-4 py-2 rounded-[10px] bg-red text-white text-[13px] font-medium shadow-red hover:brightness-110 transition"
        >
          Submit exam
        </button>
      </header>

      {/* Body */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_280px] overflow-hidden">
        {/* Question area */}
        <section className="overflow-y-auto p-8 md:p-12">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <span className="font-mono text-[12px] text-dim">Q {currentIdx + 1} / {test.questions.length}</span>
              <span className="text-[11px] px-2 py-0.5 rounded-md border border-DEFAULT text-muted uppercase tracking-wider">{currentQ.type}</span>
              <span className="text-[11px] text-dim">+{currentQ.marks} / −{currentQ.negativeMarks}</span>
              {currentQ.topic && <span className="text-[11px] text-dim">· {currentQ.topic}</span>}
            </div>
            <div className="text-[17px] leading-relaxed whitespace-pre-wrap">{currentQ.stem}</div>

            <div className="mt-7">
              <QuestionInput
                q={currentQ}
                value={drafts[currentQ.id]?.value ?? null}
                onChange={(v) => setValue(currentQ.id, v)}
              />
            </div>

            {/* Controls */}
            <div className="mt-10 flex flex-wrap items-center gap-2">
              <button
                onClick={() => goTo(currentIdx - 1)}
                disabled={currentIdx === 0}
                className="px-4 py-2 rounded-[10px] bg-elevated border border-DEFAULT text-[13px] hover:bg-hover disabled:opacity-40 transition"
              >
                ← Previous
              </button>
              <button
                onClick={() => clearResponse(currentQ.id)}
                className="px-4 py-2 rounded-[10px] bg-elevated border border-DEFAULT text-[13px] hover:bg-hover text-muted transition"
              >
                Clear response
              </button>
              <button
                onClick={() => toggleMark(currentQ.id)}
                className={`px-4 py-2 rounded-[10px] border text-[13px] transition ${
                  drafts[currentQ.id]?.marked
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                    : "bg-elevated border-DEFAULT hover:bg-hover"
                }`}
              >
                {drafts[currentQ.id]?.marked ? "★ Marked" : "☆ Mark for review"}
              </button>
              <div className="flex-1" />
              <button
                onClick={() => goTo(currentIdx + 1)}
                disabled={currentIdx >= test.questions.length - 1}
                className="px-4 py-2 rounded-[10px] bg-red text-white text-[13px] font-medium shadow-red hover:brightness-110 disabled:opacity-40 transition"
              >
                Save & Next →
              </button>
            </div>

            <p className="mt-6 text-[11px] text-dim font-mono">
              Shortcuts: 1–{currentQ.type === "integer" ? "—" : "9"} select · N next · P prev · M mark · C clear
            </p>
          </div>
        </section>

        {/* Palette */}
        <aside className="border-l border-DEFAULT bg-raised/60 overflow-y-auto p-5">
          <div className="space-y-2 mb-5 text-[11.5px]">
            <LegendRow color="bg-emerald-500" label="Answered" count={counts.answered} />
            <LegendRow color="bg-amber-500" label="Marked" count={counts.marked} />
            <LegendRow color="bg-zinc-700" label="Not visited / blank" count={counts.notAnswered} />
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {test.questions.map((q, i) => {
              const d = drafts[q.id];
              const hasVal = d && d.value !== null && !(Array.isArray(d.value) && d.value.length === 0);
              const cls = i === currentIdx
                ? "bg-red text-white ring-2 ring-red/40"
                : d?.marked && hasVal
                  ? "bg-violet-500/30 text-violet-200 border border-violet-400/40"
                  : d?.marked
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : hasVal
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-elevated text-muted border border-DEFAULT hover:border-strong";
              return (
                <button
                  key={q.id}
                  onClick={() => goTo(i)}
                  title={`Question ${i + 1}`}
                  className={`h-9 rounded-md text-[12px] font-mono tabular-nums transition ${cls}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-DEFAULT space-y-1.5 text-[11.5px] text-dim font-mono">
            <div>Answered + Marked = violet</div>
            <div>Current = red</div>
          </div>
        </aside>
      </div>

      {/* Submit confirm modal */}
      {confirmSubmit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm grid place-items-center z-[60]">
          <div className="bg-raised border border-strong rounded-2xl p-6 max-w-md w-full mx-4 shadow-soft">
            <h3 className="text-[16px] font-semibold tracking-tight">Submit exam?</h3>
            <p className="text-[13px] text-muted mt-1.5">
              You cannot change answers after submission.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Mini label="Answered" value={counts.answered} tone="text-emerald-400" />
              <Mini label="Marked" value={counts.marked} tone="text-amber-400" />
              <Mini label="Blank" value={counts.notAnswered} tone="text-zinc-400" />
            </div>
            <div className="mt-5 flex gap-2 justify-end">
              <button onClick={() => setConfirmSubmit(false)} className="px-4 py-2 rounded-[10px] bg-elevated border border-DEFAULT text-[13px] hover:bg-hover transition">
                Keep going
              </button>
              <button onClick={submit} className="px-4 py-2 rounded-[10px] bg-red text-white text-[13px] font-medium shadow-red hover:brightness-110 transition">
                Submit now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LegendRow({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <div className="flex items-center justify-between text-muted">
      <div className="flex items-center gap-2"><span className={`w-2.5 h-2.5 rounded-sm ${color}`} /> {label}</div>
      <span className="font-mono text-dim">{count}</span>
    </div>
  );
}

function Mini({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="bg-elevated border border-DEFAULT rounded-lg p-3">
      <div className={`font-mono text-[20px] font-semibold ${tone}`}>{value}</div>
      <div className="text-[11px] text-dim mt-0.5">{label}</div>
    </div>
  );
}

/* --------------- Input by question type --------------- */

function QuestionInput({ q, value, onChange }: {
  q: Question;
  value: number | number[] | null;
  onChange: (v: number | number[] | null) => void;
}) {
  if (q.type === "mcq") {
    return (
      <div className="space-y-2">
        {q.options.map((opt, i) => {
          const selected = value === i;
          return (
            <button
              key={i}
              onClick={() => onChange(i)}
              className={`w-full text-left px-4 py-3 rounded-[12px] border transition flex items-start gap-3 ${
                selected
                  ? "bg-red/10 border-red/40 ring-1 ring-red/30"
                  : "bg-elevated border-DEFAULT hover:border-strong"
              }`}
            >
              <span className={`mt-0.5 w-5 h-5 rounded-full grid place-items-center border-2 flex-shrink-0 ${
                selected ? "border-red bg-red/20" : "border-DEFAULT"
              }`}>
                {selected && <span className="w-2 h-2 rounded-full bg-red-soft" />}
              </span>
              <span className="text-[14px] leading-relaxed">
                <span className="font-mono text-dim mr-2">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </span>
            </button>
          );
        })}
      </div>
    );
  }
  if (q.type === "multi") {
    const cur = (value as number[] | null) ?? [];
    return (
      <div className="space-y-2">
        {q.options.map((opt, i) => {
          const checked = cur.includes(i);
          return (
            <button
              key={i}
              onClick={() => {
                const set = new Set(cur);
                set.has(i) ? set.delete(i) : set.add(i);
                onChange(Array.from(set).sort());
              }}
              className={`w-full text-left px-4 py-3 rounded-[12px] border transition flex items-start gap-3 ${
                checked
                  ? "bg-red/10 border-red/40 ring-1 ring-red/30"
                  : "bg-elevated border-DEFAULT hover:border-strong"
              }`}
            >
              <span className={`mt-0.5 w-5 h-5 rounded-[5px] grid place-items-center border-2 flex-shrink-0 ${
                checked ? "border-red bg-red/20" : "border-DEFAULT"
              }`}>
                {checked && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-red-soft">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </span>
              <span className="text-[14px] leading-relaxed">
                <span className="font-mono text-dim mr-2">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </span>
            </button>
          );
        })}
      </div>
    );
  }
  // integer
  return (
    <div>
      <label className="text-[12px] text-muted">Your answer (integer)</label>
      <input
        type="number"
        value={value === null ? "" : String(value)}
        onChange={(e) => onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
        className="mt-1.5 w-full max-w-xs bg-elevated border border-DEFAULT rounded-[10px] px-4 py-3 text-[18px] font-mono outline-none focus:border-red/50 focus:ring-2 focus:ring-red/20 transition"
        placeholder="—"
      />
    </div>
  );
}
