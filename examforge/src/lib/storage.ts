/**
 * Repository layer.
 *
 * Every persistence call in the app goes through this file. When we move from
 * localStorage to a real backend, ONLY this file changes — components/stores
 * stay untouched.
 *
 * Data is namespaced per-user so multiple guests/accounts on one browser stay
 * isolated and migration to a server is trivial (userId already encoded).
 */

import type { User } from "@/types/user";
import type { Test } from "@/types/test";
import type { Attempt } from "@/types/attempt";

const NAMESPACE = "examforge.v1";

function gkey(key: "users"): string {
  return `${NAMESPACE}.${key}`;
}
function ukey(userId: string, key: "tests" | "attempts"): string {
  return `${NAMESPACE}.u.${userId}.${key}`;
}

function read<T>(k: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(k: string, v: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* quota / serialization */
  }
}

/* ----------------- USERS (global) ----------------- */
export const usersRepo = {
  all(): User[] {
    return read<User[]>(gkey("users"), []);
  },
  saveAll(users: User[]): void {
    write(gkey("users"), users);
  },
  findByEmail(email: string): User | null {
    const e = email.trim().toLowerCase();
    return this.all().find((u) => u.email?.toLowerCase() === e) ?? null;
  },
  upsert(user: User): void {
    const list = this.all();
    const idx = list.findIndex((u) => u.id === user.id);
    if (idx >= 0) list[idx] = user;
    else list.push(user);
    this.saveAll(list);
  },
};

/* ----------------- TESTS (per user) ----------------- */
export const testsRepo = {
  all(userId: string): Test[] {
    return read<Test[]>(ukey(userId, "tests"), []);
  },
  saveAll(userId: string, tests: Test[]): void {
    write(ukey(userId, "tests"), tests);
  },
  upsert(userId: string, test: Test): void {
    const list = this.all(userId);
    const i = list.findIndex((t) => t.id === test.id);
    if (i >= 0) list[i] = test;
    else list.push(test);
    this.saveAll(userId, list);
  },
  remove(userId: string, testId: string): void {
    this.saveAll(userId, this.all(userId).filter((t) => t.id !== testId));
  },
};

/* ----------------- ATTEMPTS (per user) ----------------- */
export const attemptsRepo = {
  all(userId: string): Attempt[] {
    return read<Attempt[]>(ukey(userId, "attempts"), []);
  },
  saveAll(userId: string, attempts: Attempt[]): void {
    write(ukey(userId, "attempts"), attempts);
  },
  add(userId: string, attempt: Attempt): void {
    const list = this.all(userId);
    list.push(attempt);
    this.saveAll(userId, list);
  },
  remove(userId: string, attemptId: string): void {
    this.saveAll(userId, this.all(userId).filter((a) => a.id !== attemptId));
  },
};

/* ------------ tiny "hash" helper (NOT real crypto) ------------ */
export async function softHash(input: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const data = new TextEncoder().encode(input);
    const buf = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) | 0;
  return String(h);
}
