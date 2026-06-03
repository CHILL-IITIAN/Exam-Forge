import { useEffect } from "react";
import { useAuth } from "./useAuth";
import { useTestsStore } from "@/stores/testsStore";
import { useAttemptsStore } from "@/stores/attemptsStore";

/**
 * Loads per-user tests + attempts whenever the active session changes.
 * Mounted once at the top of the protected app shell.
 */
export function useSessionBootstrap() {
  const { user } = useAuth();
  const loadTests = useTestsStore((s) => s.loadFor);
  const loadAttempts = useAttemptsStore((s) => s.loadFor);
  const clearTests = useTestsStore((s) => s.clear);
  const clearAttempts = useAttemptsStore((s) => s.clear);

  useEffect(() => {
    if (!user) {
      clearTests();
      clearAttempts();
      return;
    }
    loadTests(user.id);
    loadAttempts(user.id);
  }, [user?.id, loadTests, loadAttempts, clearTests, clearAttempts]);
}
