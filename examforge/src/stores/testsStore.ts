import { create } from "zustand";
import type { Test } from "@/types/test";
import { testsRepo } from "@/lib/storage";

interface TestsState {
  tests: Test[];
  loadedFor: string | null;     // userId we currently hold data for

  loadFor: (userId: string) => void;
  upsert: (userId: string, test: Test) => void;
  remove: (userId: string, testId: string) => void;
  clear: () => void;
}

/**
 * The store mirrors the per-user data in repo. Components call loadFor(user.id)
 * once when the session changes; subsequent reads are O(1) from memory.
 */
export const useTestsStore = create<TestsState>((set) => ({
  tests: [],
  loadedFor: null,

  loadFor(userId) {
    set({ tests: testsRepo.all(userId), loadedFor: userId });
  },
  upsert(userId, test) {
    testsRepo.upsert(userId, test);
    set({ tests: testsRepo.all(userId), loadedFor: userId });
  },
  remove(userId, testId) {
    testsRepo.remove(userId, testId);
    set({ tests: testsRepo.all(userId), loadedFor: userId });
  },
  clear() {
    set({ tests: [], loadedFor: null });
  },
}));
