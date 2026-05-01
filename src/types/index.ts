export type QuestionType = 'mcq' | 'subjective' | 'numerical';

export interface MCQOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: MCQOption[];
  correctAnswer: string; // For MCQ: option id. For subjective/numerical: the answer text
  marks: number;
  subject?: string;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  totalTime: number; // in seconds
  questions: Question[];
  createdAt: string;
}

export type ReflectionReason =
  | 'concept_not_clear'
  | 'calculation_mistake'
  | 'silly_mistake'
  | 'time_pressure'
  | 'lack_of_revision';

export interface ReflectionEntry {
  questionId: string;
  reason: ReflectionReason;
}

export interface QuestionAttempt {
  questionId: string;
  userAnswer: string;
  timeTaken: number; // in seconds
  isCorrect: boolean;
  marksAwarded: number;
}

export interface TestResult {
  id: string;
  examId: string;
  examTitle: string;
  subject: string;
  totalMarks: number;
  scoredMarks: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  totalTimeTaken: number; // in seconds
  avgTimePerQuestion: number;
  attempts: QuestionAttempt[];
  reflections: ReflectionEntry[];
  completedAt: string;
  autoSubmitted: boolean;
}

export interface AnalyticsData {
  totalTests: number;
  avgScore: number;
  avgAccuracy: number;
  avgSpeed: number;
  topReflection: ReflectionReason | null;
  reflectionCounts: Record<ReflectionReason, number>;
  scoreHistory: { date: string; score: number; accuracy: number }[];
  speedHistory: { date: string; avgSpeed: number }[];
}

export type AppView =
  | 'dashboard'
  | 'create-exam'
  | 'exam-list'
  | 'exam-mode'
  | 'result'
  | 'analytics'
  | 'history';
