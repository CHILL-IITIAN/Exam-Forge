import type { Question } from "@/types/test";

/** Returns true if `value` is a correct answer for the question. */
export function isAnswerCorrect(q: Question, value: number | number[] | null): boolean {
  if (value === null || value === undefined) return false;
  if (q.type === "mcq") {
    return typeof value === "number" && value === q.correct;
  }
  if (q.type === "integer") {
    if (typeof value !== "number") return false;
    const tol = q.tolerance ?? 0;
    return Math.abs(value - q.correct) <= tol;
  }
  if (q.type === "multi") {
    if (!Array.isArray(value)) return false;
    if (value.length !== q.correct.length) return false;
    const a = [...value].sort();
    const b = [...q.correct].sort();
    return a.every((x, i) => x === b[i]);
  }
  return false;
}
