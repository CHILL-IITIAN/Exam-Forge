import { HTMLAttributes, ReactNode } from "react";

type Tone = "default" | "good" | "bad" | "warn" | "info";

interface Props extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  children: ReactNode;
}

const tones: Record<Tone, string> = {
  default: "bg-raised border-DEFAULT text-muted",
  good:    "bg-emerald-500/8 border-emerald-500/20 text-emerald-400",
  bad:     "bg-red/8 border-red/20 text-red-soft",
  warn:    "bg-amber-500/8 border-amber-500/20 text-amber-400",
  info:    "bg-sky-500/8 border-sky-500/20 text-sky-400",
};

export function Pill({ tone = "default", className = "", children, ...rest }: Props) {
  return (
    <span
      {...rest}
      className={`inline-flex items-center gap-1 font-mono text-[11.5px] px-2 py-0.5 rounded-md border ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
