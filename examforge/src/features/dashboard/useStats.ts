import { useMemo } from "react";
import { useAttemptsStore } from "@/stores/attemptsStore";
import { startOfDay } from "@/lib/time";
import type { Subject } from "@/types/test";

export interface Stats {
  totalAttempts: number;
  accuracy: number | null;       // 0..1
  avgSecPerQ: number | null;
  streakDays: number;
  weeklyCounts: number[];        // length 14, oldest → newest
  subjectAccuracy: { subject: Subject; accuracy: number; total: number }[];
  weakSubjects: { subject: Subject; accuracy: number; total: number }[];
  recent: import("@/types/attempt").Attempt[];
}

/** Derives every dashboard number from raw attempts. Single source of truth. */
export function useStats(): Stats {
  const attempts = useAttemptsStore((s) => s.attempts);

  return useMemo<Stats>(() => {
    const total = attempts.length;

    if (total === 0) {
      return {
        totalAttempts: 0,
        accuracy: null,
        avgSecPerQ: null,
        streakDays: 0,
        weeklyCounts: new Array(14).fill(0),
        subjectAccuracy: [],
        weakSubjects: [],
        recent: [],
      };
    }

    // Aggregate accuracy + time
    let correct = 0;
    let wrong = 0;
    let answered = 0;
    let timeSum = 0;
    for (const a of attempts) {
      correct += a.correctCount;
      wrong += a.wrongCount;
      // count answered questions (anything not skipped)
      const ansd = a.totalQuestions - a.skippedCount;
      answered += ansd;
      timeSum += a.durationUsedSec;
    }
    const accuracy = correct + wrong > 0 ? correct / (correct + wrong) : null;
    const avgSecPerQ = answered > 0 ? timeSum / answered : null;

    // Streak: consecutive days (counting today backwards) with ≥1 attempt
    const dayKeys = new Set(attempts.map((a) => startOfDay(a.submittedAt)));
    let streak = 0;
    let cursor = startOfDay(Date.now());
    while (dayKeys.has(cursor)) {
      streak++;
      cursor -= 86400_000;
    }

    // Weekly counts (last 14 days, oldest → newest)
    const today = startOfDay(Date.now());
    const weekly = new Array(14).fill(0);
    for (const a of attempts) {
      const day = startOfDay(a.submittedAt);
      const idx = 13 - Math.floor((today - day) / 86400_000);
      if (idx >= 0 && idx < 14) weekly[idx]++;
    }

    // Per-subject accuracy
    const map = new Map<Subject, { c: number; w: number }>();
    for (const a of attempts) {
      const m = map.get(a.subject) ?? { c: 0, w: 0 };
      m.c += a.correctCount;
      m.w += a.wrongCount;
      map.set(a.subject, m);
    }
    const subjectAccuracy = Array.from(map.entries())
      .map(([subject, { c, w }]) => ({
        subject,
        accuracy: c + w > 0 ? c / (c + w) : 0,
        total: c + w,
      }))
      .sort((a, b) => b.total - a.total);

    const weakSubjects = [...subjectAccuracy]
      .filter((s) => s.total >= 5)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3);

    const recent = [...attempts]
      .sort((a, b) => b.submittedAt - a.submittedAt)
      .slice(0, 5);

    return {
      totalAttempts: total,
      accuracy,
      avgSecPerQ,
      streakDays: streak,
      weeklyCounts: weekly,
      subjectAccuracy,
      weakSubjects,
      recent,
    };
  }, [attempts]);
}
