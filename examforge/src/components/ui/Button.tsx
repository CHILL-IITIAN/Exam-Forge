import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] " +
  "text-[13.5px] font-medium tracking-tight transition-all ease-smooth " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "bg-red text-white shadow-red hover:brightness-110 active:brightness-95",
  secondary:
    "bg-elevated border border-strong text-text hover:bg-hover",
  ghost:
    "text-muted hover:text-text hover:bg-elevated",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", loading, children, className = "", disabled, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      {...rest}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {loading && (
        <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
      )}
      {children}
    </button>
  );
});
