import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({ open, onClose, children, title, size = 'md', className = '' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative w-full ${sizeClasses[size]} bg-white rounded-2xl shadow-float max-h-[90vh] overflow-hidden flex flex-col animate-scale-in ${className}`}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-navy-100">
            <h2 className="text-lg font-bold text-navy-800">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-navy-50 transition text-navy-400 hover:text-navy-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto scroll-thin flex-1">{children}</div>
      </div>
    </div>
  );
}

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  side?: 'right' | 'left';
  width?: string;
}

export function Drawer({ open, onClose, children, title, side = 'right', width = 'max-w-md' }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex animate-fade-in">
      <div className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative ${width} w-full bg-white shadow-float h-full flex flex-col animate-slide-in-right`}
        style={{ marginLeft: side === 'left' ? 'auto' : undefined, marginRight: side === 'right' ? 'auto' : undefined }}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-navy-100 shrink-0">
            <h2 className="text-lg font-bold text-navy-800">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-navy-50 transition text-navy-400 hover:text-navy-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto scroll-thin flex-1">{children}</div>
      </div>
    </div>
  );
}
