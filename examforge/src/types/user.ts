export type UserKind = "registered" | "guest";

export interface User {
  id: string;
  kind: UserKind;
  name: string;
  email: string | null;     // null for guests
  createdAt: number;
  // NOTE: passwords are stored only client-side in Phase 2 for local-only auth.
  // When a backend is introduced, this field disappears from the client and
  // is replaced by a session token. The shape of `User` itself does not change.
  passwordHash?: string;
}
