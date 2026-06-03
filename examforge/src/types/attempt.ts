import type { Subject } from "./test";

/** Why a mistake happened (Mistake Analysis). */
export type MistakeTag =
  | "silly"
  | "conceptual"
  | "time-pressure"
  | "calculation"
  | "confusion"
  | "guess";

export interface AnswerRecord {
  questionId: string;
  value: number | number[] | null;
  isCorrect: boolean;
  marked: boolean;
  timeSpentSec: number;
  mistakeTag?: MistakeTag;
  confidence?: 1 | 2 | 3 | 4 | 5;
}

export interface Reflection {
  whatWentWrong?: string;
  biggestWeakness?: string;
  whatImproved?: string;
  needsWork?: string;
  emotionalState?: string;
  timeManagement?: string;
  updatedAt: number;
}

export interface Attempt {
  id: string;
  ownerId: string;
  testId: string;
  testTitle: string;
  subject: Subject;
  startedAt: number;
  submittedAt: number;
  durationUsedSec: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  scoreObtained: number;
  scoreMax: number;
  answers: Record<string, AnswerRecord>;
  reflection?: Reflection;
}
