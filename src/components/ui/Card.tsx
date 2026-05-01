import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className, hover, glow, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-gray-900 border border-gray-800 rounded-2xl',
        hover && 'hover:border-gray-700 hover:bg-gray-850 transition-all duration-200',
        glow && 'shadow-lg shadow-violet-900/10',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={clsx('px-6 py-5 border-b border-gray-800', className)}>{children}</div>
);

export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={clsx('px-6 py-5', className)}>{children}</div>;
