import { forwardRef, InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export const Field = forwardRef<HTMLInputElement, Props>(function Field(
  { label, hint, className = "", ...rest },
  ref
) {
  return (
    <label className="block">
      <span className="text-[12px] text-muted tracking-wide">{label}</span>
      <input
        ref={ref}
        {...rest}
        className={
          "mt-1.5 w-full rounded-[10px] bg-elevated border border-DEFAULT " +
          "px-3.5 py-2.5 text-[14px] text-text placeholder:text-dim " +
          "outline-none transition focus:border-red/50 focus:ring-2 focus:ring-red/20 " +
          className
        }
      />
      {hint && <span className="block mt-1.5 text-[11.5px] text-dim">{hint}</span>}
    </label>
  );
});
