import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthLayout({ title, subtitle, children, footer }: Props) {
  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col">
      {/* ambient */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-48 -left-32 w-[600px] h-[600px] rounded-full blur-[120px] opacity-50 bg-[radial-gradient(circle,rgba(225,29,46,0.30),transparent_70%)]" />
        <div className="absolute -bottom-48 -right-24 w-[500px] h-[500px] rounded-full blur-[120px] opacity-40 bg-[radial-gradient(circle,rgba(120,30,50,0.22),transparent_70%)]" />
      </div>

      <header className="px-6 py-5">
        <Link to="/" className="inline-flex items-center gap-2.5 font-semibold tracking-tight">
          <div className="w-[26px] h-[26px] rounded-[7px] bg-gradient-to-br from-red to-[#7a0d18] shadow-red" />
          ExamForge
        </Link>
      </header>

      <main className="flex-1 grid place-items-center px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[400px]"
        >
          <div className="text-center mb-7">
            <h1 className="text-[26px] font-semibold tracking-[-0.025em] text-text">{title}</h1>
            <p className="mt-2 text-[13.5px] text-muted">{subtitle}</p>
          </div>

          <div className="bg-raised border border-DEFAULT rounded-[16px] p-6 shadow-soft">
            {children}
          </div>

          {footer && <div className="mt-5 text-center text-[13px] text-muted">{footer}</div>}
        </motion.div>
      </main>
    </div>
  );
}
