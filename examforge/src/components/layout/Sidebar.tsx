import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";

const items = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/tests",     label: "My Tests"  },
  { to: "/exam",      label: "Exam Engine" },
  { to: "/analytics", label: "Analytics" },
  { to: "/reflection",label: "Reflection" },
  { to: "/history",   label: "History"   },
];

export default function Sidebar() {
  const { user, isGuest, logout } = useAuth();
  const nav = useNavigate();

  function onLogout() {
    logout();
    nav("/", { replace: true });
  }

  const initial = (user?.name?.[0] ?? "A").toUpperCase();

  return (
    <aside className="w-[220px] shrink-0 border-r border-DEFAULT bg-black/20 p-3 hidden md:flex md:flex-col gap-1">
      <div className="px-2 py-3 flex items-center gap-2.5 font-semibold tracking-tight">
        <div className="w-6 h-6 rounded-[7px] bg-gradient-to-br from-red to-[#7a0d18] shadow-red flex items-center justify-center text-white text-[11px]">EF</div>
        ExamForge
      </div>

      <div className="text-[11px] uppercase tracking-wider text-dim px-3 pt-3 pb-1">Workspace</div>
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          className={({ isActive }) =>
            `px-3 py-2 rounded-lg text-[13.5px] transition-colors ease-smooth ${
              isActive
                ? "bg-red/10 text-text ring-1 ring-red/20"
                : "text-muted hover:text-text hover:bg-elevated"
            }`
          }
        >
          {it.label}
        </NavLink>
      ))}

      {/* user chip pinned to bottom */}
      <div className="mt-auto pt-3 border-t border-DEFAULT">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2a2a32] to-[#15151A] border border-strong grid place-items-center text-[12px] font-semibold">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] truncate flex items-center gap-1.5">
              {user?.name ?? "Aspirant"}
              {isGuest && (
                <span className="text-[9.5px] uppercase tracking-wider text-red-soft bg-red/10 border border-red/20 px-1.5 py-px rounded-md">
                  Guest
                </span>
              )}
            </div>
            <div className="text-[11px] text-dim truncate">
              {user?.email ?? "Local session"}
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Sign out"
            className="text-dim hover:text-red-soft transition p-1.5 rounded-md hover:bg-elevated"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
