import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, hint, icon, className, ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{icon}</div>
        )}
        <input
          className={clsx(
            'w-full bg-gray-800 border rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200',
            error ? 'border-red-500/60' : 'border-gray-700 hover:border-gray-600',
            icon && 'pl-10',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, error, hint, className, ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
      <textarea
        className={clsx(
          'w-full bg-gray-800 border rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 resize-none',
          'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200',
          error ? 'border-red-500/60' : 'border-gray-700 hover:border-gray-600',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ label, error, children, className, ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
      <select
        className={clsx(
          'w-full bg-gray-800 border rounded-xl px-4 py-2.5 text-sm text-gray-100',
          'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200',
          error ? 'border-red-500/60' : 'border-gray-700 hover:border-gray-600',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};
