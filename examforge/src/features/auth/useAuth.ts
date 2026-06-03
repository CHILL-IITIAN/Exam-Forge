import { useAuthStore } from "@/stores/authStore";

/** Single ergonomic entry point for auth — components should use this, not the store directly. */
export function useAuth() {
  const user        = useAuthStore((s) => s.user);
  const hydrated    = useAuthStore((s) => s.hydrated);
  const signup      = useAuthStore((s) => s.signup);
  const login       = useAuthStore((s) => s.login);
  const loginAsGuest= useAuthStore((s) => s.loginAsGuest);
  const logout      = useAuthStore((s) => s.logout);
  const promoteGuest= useAuthStore((s) => s.promoteGuest);

  return {
    user,
    hydrated,
    isAuthed: !!user,
    isGuest:  user?.kind === "guest",
    signup,
    login,
    loginAsGuest,
    logout,
    promoteGuest,
  };
}
