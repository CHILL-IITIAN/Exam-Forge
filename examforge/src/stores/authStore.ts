import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types/user";
import { usersRepo, softHash } from "@/lib/storage";
import { uid } from "@/lib/ids";

interface AuthState {
  user: User | null;
  hydrated: boolean;
  setHydrated: () => void;

  signup: (input: { name: string; email: string; password: string }) => Promise<void>;
  login:  (input: { email: string; password: string }) => Promise<void>;
  loginAsGuest: (name?: string) => void;
  logout: () => void;
  promoteGuest: (input: { name: string; email: string; password: string }) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),

      async signup({ name, email, password }) {
        const cleanEmail = email.trim().toLowerCase();
        if (!name.trim()) throw new Error("Please enter your name.");
        if (!cleanEmail.includes("@")) throw new Error("Enter a valid email.");
        if (password.length < 6) throw new Error("Password must be at least 6 characters.");

        const exists = usersRepo.findByEmail(cleanEmail);
        if (exists) throw new Error("An account with this email already exists.");

        const user: User = {
          id: uid("u"),
          kind: "registered",
          name: name.trim(),
          email: cleanEmail,
          createdAt: Date.now(),
          passwordHash: await softHash(password),
        };
        usersRepo.upsert(user);
        set({ user });
      },

      async login({ email, password }) {
        const found = usersRepo.findByEmail(email);
        if (!found) throw new Error("No account found for this email.");
        const ph = await softHash(password);
        if (found.passwordHash !== ph) throw new Error("Incorrect password.");
        set({ user: found });
      },

      loginAsGuest(name = "Aspirant") {
        // If the current session is already a guest, reuse it (don't fragment data).
        const current = get().user;
        if (current?.kind === "guest") return;

        const guest: User = {
          id: uid("g"),
          kind: "guest",
          name,
          email: null,
          createdAt: Date.now(),
        };
        usersRepo.upsert(guest);
        set({ user: guest });
      },

      logout() {
        set({ user: null });
      },

      async promoteGuest({ name, email, password }) {
        const current = get().user;
        if (!current || current.kind !== "guest") {
          throw new Error("Not in guest mode.");
        }
        const cleanEmail = email.trim().toLowerCase();
        if (usersRepo.findByEmail(cleanEmail)) {
          throw new Error("That email is already in use.");
        }
        const promoted: User = {
          ...current,
          kind: "registered",
          name: name.trim() || current.name,
          email: cleanEmail,
          passwordHash: await softHash(password),
        };
        usersRepo.upsert(promoted);
        set({ user: promoted });
      },
    }),
    {
      name: "examforge.auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ user: s.user }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    }
  )
);
