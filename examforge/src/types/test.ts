export type Subject =
  | "Physics"
  | "Chemistry"
  | "Mathematics"
  | "Biology"
  | "General";

export type QuestionType = "mcq" | "multi" | "integer";

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  stem: string;            // the question text
  explanation?: string;
  subject?: Subject;
  topic?: string;
  marks: number;           // marks awarded for correct answer
  negativeMarks: number;   // marks deducted for wrong answer (0 if none)
}

export interface MCQQuestion extends BaseQuestion {
  type: "mcq";
  options: string[];       // 2..6
  correct: number;         // index into options
}

export interface MultiQuestion extends BaseQuestion {
  type: "multi";
  options: string[];
  correct: number[];       // indices; partial-credit handled in Phase 5
}

export interface IntegerQuestion extends BaseQuestion {
  type: "integer";
  correct: number;
  tolerance?: number;      // optional ±
}

export type Question = MCQQuestion | MultiQuestion | IntegerQuestion;

export interface Test {
  id: string;
  ownerId: string;
  title: string;
  subject: Subject;
  durationSec: number;        // total exam time
  instructions?: string;
  questions: Question[];
  createdAt: number;
  updatedAt: number;
}
