import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  Exam,
  TestResult,
  AppView,
  AnalyticsData,
  ReflectionReason,
} from '../types';

interface ExamStore {
  // Navigation
  currentView: AppView;
  setView: (view: AppView) => void;

  // Exams
  exams: Exam[];
  addExam: (exam: Exam) => void;
  deleteExam: (id: string) => void;
  getExam: (id: string) => Exam | undefined;

  // Active exam session
  activeExam: Exam | null;
  setActiveExam: (exam: Exam | null) => void;

  // Results
  results: TestResult[];
  activeResult: TestResult | null;
  addResult: (result: TestResult) => void;
  setActiveResult: (result: TestResult | null) => void;

  // Analytics
  getAnalytics: () => AnalyticsData;
}

const STORAGE_KEY_EXAMS = 'examforge_exams';
const STORAGE_KEY_RESULTS = 'examforge_results';

const loadFromStorage = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const saveToStorage = <T>(key: string, data: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
};

const SEED_EXAMS: Exam[] = [
  {
    id: uuidv4(),
    title: 'Physics — Mechanics Basics',
    subject: 'Physics',
    totalTime: 600,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    questions: [
      {
        id: uuidv4(),
        type: 'mcq',
        text: 'A ball is dropped from a height of 20m. What is its velocity just before hitting the ground? (g = 10 m/s²)',
        options: [
          { id: 'a', text: '10 m/s' },
          { id: 'b', text: '15 m/s' },
          { id: 'c', text: '20 m/s' },
          { id: 'd', text: '25 m/s' },
        ],
        correctAnswer: 'c',
        marks: 4,
        subject: 'Physics',
      },
      {
        id: uuidv4(),
        type: 'mcq',
        text: 'Which of the following is a vector quantity?',
        options: [
          { id: 'a', text: 'Speed' },
          { id: 'b', text: 'Mass' },
          { id: 'c', text: 'Velocity' },
          { id: 'd', text: 'Temperature' },
        ],
        correctAnswer: 'c',
        marks: 4,
        subject: 'Physics',
      },
      {
        id: uuidv4(),
        type: 'numerical',
        text: 'A car accelerates from rest to 72 km/h in 10 seconds. Find the acceleration in m/s².',
        correctAnswer: '2',
        marks: 6,
        subject: 'Physics',
      },
    ],
  },
];

export const useExamStore = create<ExamStore>((set, get) => ({
  currentView: 'dashboard',
  setView: (view) => set({ currentView: view }),

  exams: loadFromStorage<Exam[]>(STORAGE_KEY_EXAMS, SEED_EXAMS),
  addExam: (exam) => {
    const updated = [...get().exams, exam];
    saveToStorage(STORAGE_KEY_EXAMS, updated);
    set({ exams: updated });
  },
  deleteExam: (id) => {
    const updated = get().exams.filter((e) => e.id !== id);
    saveToStorage(STORAGE_KEY_EXAMS, updated);
    set({ exams: updated });
  },
  getExam: (id) => get().exams.find((e) => e.id === id),

  activeExam: null,
  setActiveExam: (exam) => set({ activeExam: exam }),

  results: loadFromStorage<TestResult[]>(STORAGE_KEY_RESULTS, []),
  activeResult: null,
  addResult: (result) => {
    const updated = [...get().results, result];
    saveToStorage(STORAGE_KEY_RESULTS, updated);
    set({ results: updated, activeResult: result });
  },
  setActiveResult: (result) => set({ activeResult: result }),

  getAnalytics: (): AnalyticsData => {
    const results = get().results;
    if (results.length === 0) {
      return {
        totalTests: 0,
        avgScore: 0,
        avgAccuracy: 0,
        avgSpeed: 0,
        topReflection: null,
        reflectionCounts: {
          concept_not_clear: 0,
          calculation_mistake: 0,
          silly_mistake: 0,
          time_pressure: 0,
          lack_of_revision: 0,
        },
        scoreHistory: [],
        speedHistory: [],
      };
    }

    const totalTests = results.length;
    const avgScore =
      results.reduce((sum, r) => sum + (r.scoredMarks / r.totalMarks) * 100, 0) / totalTests;
    const avgAccuracy =
      results.reduce((sum, r) => sum + (r.correctCount / r.totalQuestions) * 100, 0) / totalTests;
    const avgSpeed =
      results.reduce((sum, r) => sum + r.avgTimePerQuestion, 0) / totalTests;

    const reflectionCounts: Record<ReflectionReason, number> = {
      concept_not_clear: 0,
      calculation_mistake: 0,
      silly_mistake: 0,
      time_pressure: 0,
      lack_of_revision: 0,
    };

    results.forEach((r) => {
      r.reflections.forEach((ref) => {
        reflectionCounts[ref.reason]++;
      });
    });

    const topReflection = (Object.entries(reflectionCounts) as [ReflectionReason, number][])
      .sort((a, b) => b[1] - a[1])
      .find(([, count]) => count > 0)?.[0] ?? null;

    const sortedResults = [...results].sort(
      (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );

    const scoreHistory = sortedResults.map((r) => ({
      date: new Date(r.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: Math.round((r.scoredMarks / r.totalMarks) * 100),
      accuracy: Math.round((r.correctCount / r.totalQuestions) * 100),
    }));

    const speedHistory = sortedResults.map((r) => ({
      date: new Date(r.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      avgSpeed: Math.round(r.avgTimePerQuestion),
    }));

    return {
      totalTests,
      avgScore: Math.round(avgScore),
      avgAccuracy: Math.round(avgAccuracy),
      avgSpeed: Math.round(avgSpeed),
      topReflection,
      reflectionCounts,
      scoreHistory,
      speedHistory,
    };
  },
}));
