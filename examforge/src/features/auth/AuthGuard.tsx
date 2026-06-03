import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

/** Wraps protected route subtrees. Redirects to /login if not signed in. */
export default function AuthGuard() {
  const { isAuthed, hydrated } = useAuth();
  const loc = useLocation();

  // Wait for persist rehydration to avoid a redirect flash on hard reload.
  if (!hydrated) {
    return (
      <div className="min-h-screen grid place-items-center bg-bg">
        <div className="text-dim text-sm font-mono">loading…</div>
      </div>
    );
  }

  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }
  return <Outlet />;
}
