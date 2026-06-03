import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "./useAuth";

export default function Landing() {
  const { isAuthed, loginAsGuest } = useAuth();
  const nav = useNavigate();

  function tryGuest() {
    loginAsGuest();
    nav("/dashboard");
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ambient glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-48 -left-32 w-[600px] h-[600px] rounded-full blur-[120px] opacity-50 bg-[radial-gradient(circle,rgba(225,29,46,0.35),transparent_70%)]" />
        <div className="absolute -bottom-48 -right-24 w-[500px] h-[500px] rounded-full blur-[120px] opacity-50 bg-[radial-gradient(circle,rgba(120,30,50,0.25),transparent_70%)]" />
      </div>

      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-bg/60 border-b border-DEFAULT">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-semibold tracking-tight">
            <div className="w-[26px] h-[26px] rounded-[7px] bg-gradient-to-br from-red to-[#7a0d18] shadow-red" />
            ExamForge
          </div>
          <div className="flex items-center gap-2">
            {isAuthed ? (
              <Link to="/dashboard" className="px-4 py-2 rounded-[10px] bg-red text-white text-[13.5px] font-medium shadow-red hover:brightness-110 transition">
                Open app →
              </Link>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 rounded-[10px] text-muted hover:text-text hover:bg-elevated text-[13.5px] transition">
                  Sign in
                </Link>
                <Link to="/signup" className="px-4 py-2 rounded-[10px] bg-red text-white text-[13.5px] font-medium shadow-red hover:brightness-110 transition">
                  Start Forging
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red/10 ring-1 ring-red/25 text-red-soft text-xs font-medium mb-7"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-soft shadow-[0_0_8px_rgb(255,59,77)]" />
          Phase 2 · Auth & guest mode online
        </motion.div>

        <h1 className="text-5xl md:text-6xl font-semibold tracking-[-0.035em] leading-[1.05] bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
          The exam-performance<br />
          <span className="bg-gradient-to-b from-red-soft to-red bg-clip-text text-transparent">operating system.</span>
        </h1>
        <p className="mt-6 max-w-xl mx-auto text-[17px] text-muted leading-relaxed">
          Simulate real exam pressure. Analyze every mistake. Build the temperament that JEE and NEET demand.
        </p>
        <div className="mt-9 flex gap-3 justify-center">
          <Link to="/signup" className="px-4 py-2.5 rounded-[10px] bg-red text-white text-[13.5px] font-medium shadow-red hover:brightness-110 transition">
            Create account
          </Link>
          <button onClick={tryGuest} className="px-4 py-2.5 rounded-[10px] bg-elevated border border-strong text-[13.5px] hover:bg-hover transition">
            Try as Guest
          </button>
        </div>
        <p className="mt-4 text-[12px] text-dim">No email required for guest mode · your data stays on this device</p>
      </section>
    </div>
  );
}
