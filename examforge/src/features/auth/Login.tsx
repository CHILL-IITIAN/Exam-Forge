import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useAuth } from "./useAuth";

export default function Login() {
  const { login, loginAsGuest } = useAuth();
  const nav = useNavigate();
  const loc = useLocation() as { state?: { from?: string } };
  const redirectTo = loc.state?.from || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await login({ email, password });
      nav(redirectTo, { replace: true });
    } catch (e: any) {
      setErr(e?.message ?? "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  function asGuest() {
    loginAsGuest();
    nav(redirectTo, { replace: true });
  }

  return (
    <AuthLayout
      title="Welcome back."
      subtitle="Sign in to resume forging."
      footer={
        <>
          New to ExamForge?{" "}
          <Link to="/signup" className="text-red-soft hover:underline">Create an account</Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@aspirant.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Field
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {err && (
          <div className="text-[12.5px] text-red-soft bg-red/10 border border-red/20 rounded-lg px-3 py-2">
            {err}
          </div>
        )}

        <Button type="submit" loading={busy} className="w-full">Sign in</Button>

        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-DEFAULT" />
          <span className="text-[11px] uppercase tracking-wider text-dim">or</span>
          <div className="flex-1 h-px bg-DEFAULT" />
        </div>

        <Button type="button" variant="secondary" onClick={asGuest} className="w-full">
          Continue as Guest
        </Button>
      </form>
    </AuthLayout>
  );
}
