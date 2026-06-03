import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";
import { useTestsStore } from "@/stores/testsStore";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import type { Question, QuestionType, Subject, Test } from "@/types/test";
import { uid } from "@/lib/ids";

const SUBJECTS: Subject[] = ["Physics", "Chemistry", "Mathematics", "Biology", "General"];

function blankQuestion(type: QuestionType = "mcq"): Question {
  const base = { id: uid("q"), stem: "", marks: 4, negativeMarks: 1, explanation: "" };
  if (type === "mcq") return { ...base, type, options: ["", "", "", ""], correct: 0 } as Question;
  if (type === "multi") return { ...base, type, options: ["", "", "", ""], correct: [] } as Question;
  return { ...base, type, correct: 0 } as Question;
}

export default function TestBuilder() {
  const { id } = useParams();
  const isEdit = !!id;
  const { user } = useAuth();
  const tests = useTestsStore((s) => s.tests);
  const upsert = useTestsStore((s) => s.upsert);
  const nav = useNavigate();

  const existing = useMemo(() => tests.find((t) => t.id === id), [tests, id]);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState<Subject>("Physics");
  const [durationMin, setDurationMin] = useState(30);
  const [instructions, setInstructions] = useState("");
  const [questions, setQuestions] = useState<Question[]>([blankQuestion("mcq")]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setSubject(existing.subject);
      setDurationMin(Math.round(existing.durationSec / 60));
      setInstructions(existing.instructions ?? "");
      setQuestions(existing.questions.length ? existing.questions : [blankQuestion()]);
    }
  }, [existing]);

  const totalMarks = questions.reduce((s, q) => s + (q.marks || 0), 0);

  function updateQuestion(idx: number, next: Question) {
    setQuestions((qs) => qs.map((q, i) => (i === idx ? next : q)));
  }
  function addQuestion(type: QuestionType = "mcq") {
    setQuestions((qs) => {
      const next = [...qs, blankQuestion(type)];
      setActiveIdx(next.length - 1);
      return next;
    });
  }
  function removeQuestion(idx: number) {
    setQuestions((qs) => {
      const next = qs.filter((_, i) => i !== idx);
      if (next.length === 0) next.push(blankQuestion());
      setActiveIdx(Math.max(0, Math.min(activeIdx, next.length - 1)));
      return next;
    });
  }
  function moveQuestion(idx: number, dir: -1 | 1) {
    setQuestions((qs) => {
      const j = idx + dir;
      if (j < 0 || j >= qs.length) return qs;
      const copy = [...qs];
      [copy[idx], copy[j]] = [copy[j], copy[idx]];
      setActiveIdx(j);
      return copy;
    });
  }

  function validate(): string | null {
    if (!title.trim()) return "Test title is required.";
    if (durationMin <= 0) return "Duration must be greater than zero.";
    if (questions.length === 0) return "Add at least one question.";
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.stem.trim()) return `Question ${i + 1}: stem is empty.`;
      if (q.type === "mcq") {
        if (q.options.length < 2) return `Q${i + 1}: at least 2 options required.`;
        if (q.options.some((o) => !o.trim())) return `Q${i + 1}: an option is empty.`;
        if (q.correct < 0 || q.correct >= q.options.length) return `Q${i + 1}: pick a correct answer.`;
      }
      if (q.type === "multi") {
        if (q.options.length < 2) return `Q${i + 1}: at least 2 options required.`;
        if (q.options.some((o) => !o.trim())) return `Q${i + 1}: an option is empty.`;
        if (!q.correct.length) return `Q${i + 1}: pick at least one correct answer.`;
      }
      if (q.type === "integer") {
        if (!Number.isFinite(q.correct)) return `Q${i + 1}: enter a valid integer answer.`;
      }
    }
    return null;
  }

  function save() {
    const err = validate();
    setError(err);
    if (err || !user) return;
    const now = Date.now();
    const test: Test = {
      id: existing?.id ?? uid("t"),
      ownerId: user.id,
      title: title.trim(),
      subject,
      durationSec: durationMin * 60,
      instructions: instructions.trim() || undefined,
      questions,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    upsert(user.id, test);
    nav("/tests");
  }

  const active = questions[activeIdx];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="flex items-end justify-between mb-6 gap-4 flex-wrap">
        <div>
          <button onClick={() => nav("/tests")} className="text-[12px] text-dim hover:text-text transition mb-1.5 flex items-center gap-1">
            ← My Tests
          </button>
          <h2 className="text-[22px] font-semibold tracking-[-0.025em]">
            {isEdit ? "Edit Test" : "New Test"}
          </h2>
          <p className="text-[13.5px] text-muted mt-1">
            {questions.length} {questions.length === 1 ? "question" : "questions"} · {totalMarks} marks · {durationMin} min
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => nav("/tests")}>Cancel</Button>
          <Button onClick={save}>{isEdit ? "Save changes" : "Create test"}</Button>
        </div>
      </header>

      {error && (
        <div className="mb-4 text-[13px] text-red-soft bg-red/10 border border-red/20 rounded-lg px-3 py-2.5">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-3.5">
        {/* Left: meta + question list */}
        <div className="lg:col-span-1 space-y-3.5">
          <Card title="Test details">
            <div className="space-y-3.5">
              <Field
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. JEE Mock — Mechanics Sprint"
              />
              <div>
                <span className="text-[12px] text-muted">Subject</span>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as Subject)}
                  className="mt-1.5 w-full bg-elevated border border-DEFAULT rounded-[10px] px-3.5 py-2.5 text-[14px] outline-none focus:border-red/50 focus:ring-2 focus:ring-red/20 transition"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <Field
                label="Duration (minutes)"
                type="number"
                min={1}
                value={durationMin}
                onChange={(e) => setDurationMin(Math.max(1, parseInt(e.target.value || "0", 10)))}
              />
              <div>
                <span className="text-[12px] text-muted">Instructions (optional)</span>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={3}
                  className="mt-1.5 w-full bg-elevated border border-DEFAULT rounded-[10px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-red/50 focus:ring-2 focus:ring-red/20 transition resize-y"
                  placeholder="Mark for review allowed. Negative marking applies…"
                />
              </div>
            </div>
          </Card>

          <Card
            title="Questions"
            action={
              <div className="flex gap-1">
                <Button variant="ghost" className="!px-2 !py-1 text-[12px]" onClick={() => addQuestion("mcq")}>+ MCQ</Button>
                <Button variant="ghost" className="!px-2 !py-1 text-[12px]" onClick={() => addQuestion("multi")}>+ Multi</Button>
                <Button variant="ghost" className="!px-2 !py-1 text-[12px]" onClick={() => addQuestion("integer")}>+ Int</Button>
              </div>
            }
          >
            <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
              {questions.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => setActiveIdx(i)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg border transition ${
                    i === activeIdx
                      ? "bg-red/10 border-red/25 text-text"
                      : "bg-raised border-DEFAULT text-muted hover:text-text hover:border-strong"
                  }`}
                >
                  <span className="font-mono text-[11.5px] text-dim w-5">{i + 1}.</span>
                  <span className="flex-1 truncate text-[13px]">
                    {q.stem.trim() || <span className="text-dim italic">empty question</span>}
                  </span>
                  <Pill tone="info" className="!text-[10px] !py-0">{q.type}</Pill>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: question editor */}
        <div className="lg:col-span-2">
          {active && (
            <Card
              title={`Question ${activeIdx + 1}`}
              badge={active.type.toUpperCase()}
              action={
                <div className="flex gap-1">
                  <Button variant="ghost" className="!px-2 !py-1" onClick={() => moveQuestion(activeIdx, -1)} disabled={activeIdx === 0}>↑</Button>
                  <Button variant="ghost" className="!px-2 !py-1" onClick={() => moveQuestion(activeIdx, 1)} disabled={activeIdx === questions.length - 1}>↓</Button>
                  <Button variant="ghost" className="!px-2 !py-1 text-dim hover:!text-red-soft" onClick={() => removeQuestion(activeIdx)}>Delete</Button>
                </div>
              }
            >
              <QuestionEditor q={active} onChange={(q) => updateQuestion(activeIdx, q)} />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Question Editor ---------------- */

function QuestionEditor({ q, onChange }: { q: Question; onChange: (q: Question) => void }) {
  function setType(type: QuestionType) {
    if (type === q.type) return;
    if (type === "mcq") onChange({ id: q.id, type, stem: q.stem, marks: q.marks, negativeMarks: q.negativeMarks, explanation: q.explanation, options: ["", "", "", ""], correct: 0, topic: q.topic } as Question);
    else if (type === "multi") onChange({ id: q.id, type, stem: q.stem, marks: q.marks, negativeMarks: q.negativeMarks, explanation: q.explanation, options: ["", "", "", ""], correct: [], topic: q.topic } as Question);
    else onChange({ id: q.id, type, stem: q.stem, marks: q.marks, negativeMarks: q.negativeMarks, explanation: q.explanation, correct: 0, topic: q.topic } as Question);
  }

  return (
    <div className="space-y-4">
      {/* type switcher */}
      <div className="flex gap-1.5 bg-bg p-1 rounded-lg w-fit border border-DEFAULT">
        {(["mcq", "multi", "integer"] as QuestionType[]).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition ${
              q.type === t ? "bg-elevated text-text shadow-soft" : "text-dim hover:text-muted"
            }`}
          >
            {t === "mcq" ? "MCQ" : t === "multi" ? "Multi-correct" : "Integer"}
          </button>
        ))}
      </div>

      {/* stem */}
      <div>
        <span className="text-[12px] text-muted">Question</span>
        <textarea
          rows={3}
          value={q.stem}
          onChange={(e) => onChange({ ...q, stem: e.target.value })}
          className="mt-1.5 w-full bg-elevated border border-DEFAULT rounded-[10px] px-3.5 py-2.5 text-[14px] outline-none focus:border-red/50 focus:ring-2 focus:ring-red/20 transition resize-y"
          placeholder="Type the question stem…"
        />
      </div>

      {/* options / answer */}
      {q.type === "mcq" && (
        <McqEditor q={q} onChange={onChange} />
      )}
      {q.type === "multi" && (
        <MultiEditor q={q} onChange={onChange} />
      )}
      {q.type === "integer" && (
        <IntegerEditor q={q} onChange={onChange} />
      )}

      {/* meta */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        <Field
          label="Marks"
          type="number"
          min={1}
          value={q.marks}
          onChange={(e) => onChange({ ...q, marks: Math.max(0, parseInt(e.target.value || "0", 10)) })}
        />
        <Field
          label="Negative marks"
          type="number"
          min={0}
          value={q.negativeMarks}
          onChange={(e) => onChange({ ...q, negativeMarks: Math.max(0, parseFloat(e.target.value || "0")) })}
        />
        <Field
          label="Topic (optional)"
          value={q.topic ?? ""}
          onChange={(e) => onChange({ ...q, topic: e.target.value })}
          placeholder="e.g. Kinematics"
        />
      </div>

      <div>
        <span className="text-[12px] text-muted">Explanation (optional)</span>
        <textarea
          rows={2}
          value={q.explanation ?? ""}
          onChange={(e) => onChange({ ...q, explanation: e.target.value })}
          className="mt-1.5 w-full bg-elevated border border-DEFAULT rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none focus:border-red/50 focus:ring-2 focus:ring-red/20 transition resize-y"
          placeholder="Shown on the results page after the test."
        />
      </div>
    </div>
  );
}

function McqEditor({ q, onChange }: { q: Extract<Question, { type: "mcq" }>; onChange: (q: Question) => void }) {
  function setOpt(i: number, v: string) { onChange({ ...q, options: q.options.map((o, j) => j === i ? v : o) }); }
  function addOpt() { if (q.options.length < 6) onChange({ ...q, options: [...q.options, ""] }); }
  function delOpt(i: number) {
    if (q.options.length <= 2) return;
    const next = q.options.filter((_, j) => j !== i);
    onChange({ ...q, options: next, correct: Math.min(q.correct, next.length - 1) });
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] text-muted">Options · click radio to mark correct</span>
        <Button variant="ghost" className="!px-2 !py-1 text-[12px]" onClick={addOpt} disabled={q.options.length >= 6}>+ Add option</Button>
      </div>
      <div className="space-y-2">
        {q.options.map((o, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              onClick={() => onChange({ ...q, correct: i })}
              className={`w-5 h-5 rounded-full border-2 grid place-items-center transition ${
                q.correct === i ? "border-red bg-red/20" : "border-DEFAULT hover:border-strong"
              }`}
              title="Mark as correct"
            >
              {q.correct === i && <span className="w-2 h-2 rounded-full bg-red-soft" />}
            </button>
            <input
              value={o}
              onChange={(e) => setOpt(i, e.target.value)}
              placeholder={`Option ${String.fromCharCode(65 + i)}`}
              className="flex-1 bg-elevated border border-DEFAULT rounded-[10px] px-3 py-2 text-[13.5px] outline-none focus:border-red/50 focus:ring-2 focus:ring-red/20 transition"
            />
            <button onClick={() => delOpt(i)} disabled={q.options.length <= 2} className="text-dim hover:text-red-soft disabled:opacity-30 px-2 py-1 text-[12px]">×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function MultiEditor({ q, onChange }: { q: Extract<Question, { type: "multi" }>; onChange: (q: Question) => void }) {
  function setOpt(i: number, v: string) { onChange({ ...q, options: q.options.map((o, j) => j === i ? v : o) }); }
  function toggleCorrect(i: number) {
    const set = new Set(q.correct);
    if (set.has(i)) set.delete(i); else set.add(i);
    onChange({ ...q, correct: Array.from(set).sort() });
  }
  function addOpt() { if (q.options.length < 6) onChange({ ...q, options: [...q.options, ""] }); }
  function delOpt(i: number) {
    if (q.options.length <= 2) return;
    const next = q.options.filter((_, j) => j !== i);
    onChange({ ...q, options: next, correct: q.correct.filter((c) => c !== i).map((c) => (c > i ? c - 1 : c)) });
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] text-muted">Options · click checkbox(es) for all correct answers</span>
        <Button variant="ghost" className="!px-2 !py-1 text-[12px]" onClick={addOpt} disabled={q.options.length >= 6}>+ Add option</Button>
      </div>
      <div className="space-y-2">
        {q.options.map((o, i) => {
          const checked = q.correct.includes(i);
          return (
            <div key={i} className="flex items-center gap-2">
              <button
                onClick={() => toggleCorrect(i)}
                className={`w-5 h-5 rounded-[5px] border-2 grid place-items-center transition ${
                  checked ? "border-red bg-red/20" : "border-DEFAULT hover:border-strong"
                }`}
              >
                {checked && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-red-soft">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
              <input
                value={o}
                onChange={(e) => setOpt(i, e.target.value)}
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                className="flex-1 bg-elevated border border-DEFAULT rounded-[10px] px-3 py-2 text-[13.5px] outline-none focus:border-red/50 focus:ring-2 focus:ring-red/20 transition"
              />
              <button onClick={() => delOpt(i)} disabled={q.options.length <= 2} className="text-dim hover:text-red-soft disabled:opacity-30 px-2 py-1 text-[12px]">×</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function IntegerEditor({ q, onChange }: { q: Extract<Question, { type: "integer" }>; onChange: (q: Question) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field
        label="Correct answer (integer)"
        type="number"
        value={q.correct}
        onChange={(e) => onChange({ ...q, correct: parseFloat(e.target.value || "0") })}
      />
      <Field
        label="Tolerance ± (optional)"
        type="number"
        min={0}
        value={q.tolerance ?? 0}
        onChange={(e) => onChange({ ...q, tolerance: Math.max(0, parseFloat(e.target.value || "0")) })}
      />
    </div>
  );
}
