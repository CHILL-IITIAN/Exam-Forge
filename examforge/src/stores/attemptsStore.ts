import { create } from "zustand";
import type { Attempt, AnswerRecord, Reflection } from "@/types/attempt";
import { attemptsRepo } from "@/lib/storage";

interface AttemptsState {
  attempts: Attempt[];
  loadedFor: string | null;

  loadFor: (userId: string) => void;
  add: (userId: string, attempt: Attempt) => void;
  remove: (userId: string, attemptId: string) => void;
  setMistakeTag: (userId: string, attemptId: string, questionId: string, partial: Partial<AnswerRecord>) => void;
  setReflection: (userId: string, attemptId: string, reflection: Reflection) => void;
  clear: () => void;
}

export const useAttemptsStore = create<AttemptsState>((set, get) => ({
  attempts: [],
  loadedFor: null,

  loadFor(userId) {
    set({ attempts: attemptsRepo.all(userId), loadedFor: userId });
  },
  add(userId, attempt) {
    attemptsRepo.add(userId, attempt);
    set({ attempts: attemptsRepo.all(userId), loadedFor: userId });
  },
  remove(userId, attemptId) {
    attemptsRepo.remove(userId, attemptId);
    set({ attempts: attemptsRepo.all(userId), loadedFor: userId });
  },
  setMistakeTag(userId, attemptId, questionId, partial) {
    const list = get().attempts.map((a) => {
      if (a.id !== attemptId) return a;
      const ans = a.answers[questionId];
      if (!ans) return a;
      return { ...a, answers: { ...a.answers, [questionId]: { ...ans, ...partial } } };
    });
    attemptsRepo.saveAll(userId, list);
    set({ attempts: list });
  },
  setReflection(userId, attemptId, reflection) {
    const list = get().attempts.map((a) =>
      a.id === attemptId ? { ...a, reflection } : a
    );
    attemptsRepo.saveAll(userId, list);
    set({ attempts: list });
  },
  clear() {
    set({ attempts: [], loadedFor: null });
  },
}));
