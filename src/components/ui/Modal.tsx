import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  closable?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  size = 'md',
  closable = true,
}) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={closable ? onClose : undefined}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div
        className={clsx(
          'relative w-full bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl',
          'animate-in fade-in slide-in-from-bottom-4 duration-200',
          sizes[size]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || closable) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            {title && <h3 className="text-base font-semibold text-gray-100">{title}</h3>}
            {closable && onClose && (
              <button
                onClick={onClose}
                className="ml-auto p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
