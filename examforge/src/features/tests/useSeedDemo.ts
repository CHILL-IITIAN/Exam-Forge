import { useAuth } from "@/features/auth/useAuth";
import { useTestsStore } from "@/stores/testsStore";
import { useAttemptsStore } from "@/stores/attemptsStore";
import { testsRepo, attemptsRepo } from "@/lib/storage";
import { buildSampleTests, buildSampleAttempts } from "./sampleSeeder";

/** One-shot demo population for the current user. */
export function useSeedDemo() {
  const { user } = useAuth();
  const loadTests = useTestsStore((s) => s.loadFor);
  const loadAttempts = useAttemptsStore((s) => s.loadFor);

  return function seed() {
    if (!user) return;
    const tests = buildSampleTests(user.id);
    const attempts = buildSampleAttempts(user.id, tests);
    testsRepo.saveAll(user.id, [...testsRepo.all(user.id), ...tests]);
    attemptsRepo.saveAll(user.id, [...attemptsRepo.all(user.id), ...attempts]);
    loadTests(user.id);
    loadAttempts(user.id);
  };
}
