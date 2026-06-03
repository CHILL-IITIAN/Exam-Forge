import { HTMLAttributes, ReactNode } from "react";

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  badge?: ReactNode;
  action?: ReactNode;
  padded?: boolean;
}

export function Card({ title, badge, action, padded = true, className = "", children, ...rest }: Props) {
  return (
    <div
      {...rest}
      className={`bg-elevated border border-DEFAULT rounded-2xl ${padded ? "p-5" : ""} transition-colors hover:border-strong ${className}`}
    >
      {(title || action) && (
        <div className={`flex items-center justify-between ${padded ? "mb-4" : "px-5 pt-5"}`}>
          <div className="flex items-center gap-2 text-[13.5px] font-semibold tracking-tight">
            {title}
            {badge && (
              <span className="text-[10.5px] font-medium text-dim border border-DEFAULT rounded-full px-2 py-0.5">
                {badge}
              </span>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
