import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useSessionBootstrap } from "@/features/auth/useSessionBootstrap";

export default function AppShell() {
  // Loads tests + attempts for the active user (and clears on logout).
  useSessionBootstrap();

  return (
    <div className="min-h-screen flex bg-bg text-text">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
