import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  children,
  className,
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white focus:ring-violet-500 shadow-lg shadow-violet-900/40',
    secondary:
      'bg-gray-800 hover:bg-gray-700 active:bg-gray-900 text-gray-100 focus:ring-gray-600 border border-gray-700',
    danger:
      'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white focus:ring-red-500 shadow-lg shadow-red-900/40',
    ghost:
      'bg-transparent hover:bg-gray-800 text-gray-400 hover:text-gray-100 focus:ring-gray-700',
    outline:
      'bg-transparent border border-violet-500 text-violet-400 hover:bg-violet-600/10 focus:ring-violet-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon
      )}
      {children}
      {!loading && iconRight}
    </button>
  );
};
