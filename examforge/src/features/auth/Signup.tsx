import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useAuth } from "./useAuth";

export default function Signup() {
  const { signup, loginAsGuest, isGuest, promoteGuest } = useAuth();
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      // If currently in guest mode, promote (preserves tests + attempts).
      if (isGuest) {
        await promoteGuest({ name, email, password });
      } else {
        await signup({ name, email, password });
      }
      nav("/dashboard", { replace: true });
    } catch (e: any) {
      setErr(e?.message ?? "Signup failed.");
    } finally {
      setBusy(false);
    }
  }

  function asGuest() {
    loginAsGuest(name || undefined);
    nav("/dashboard", { replace: true });
  }

  return (
    <AuthLayout
      title={isGuest ? "Save your progress." : "Create your account."}
      subtitle={isGuest
        ? "Promote your guest session — all your tests and attempts will carry over."
        : "Start tracking your prep with precision."}
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-red-soft hover:underline">Sign in</Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Name" autoComplete="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Field label="Email" type="email" autoComplete="email" placeholder="you@aspirant.in" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Field label="Password" type="password" autoComplete="new-password" placeholder="At least 6 characters" hint="Stored only on this device for now." value={password} onChange={(e) => setPassword(e.target.value)} required />

        {err && <div className="text-[12.5px] text-red-soft bg-red/10 border border-red/20 rounded-lg px-3 py-2">{err}</div>}

        <Button type="submit" loading={busy} className="w-full">{isGuest ? "Promote account" : "Create account"}</Button>

        {!isGuest && (
          <>
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-DEFAULT" />
              <span className="text-[11px] uppercase tracking-wider text-dim">or</span>
              <div className="flex-1 h-px bg-DEFAULT" />
            </div>
            <Button type="button" variant="secondary" onClick={asGuest} className="w-full">Try as Guest first</Button>
          </>
        )}
      </form>
    </AuthLayout>
  );
}
