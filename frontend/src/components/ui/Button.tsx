import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-brand-cranberry text-white hover:bg-brand-600 active:bg-brand-700 shadow-soft hover:shadow-card',
  secondary: 'bg-navy-800 text-white hover:bg-navy-700 active:bg-navy-900 shadow-soft',
  outline: 'border-2 border-navy-200 text-navy-700 hover:border-brand-cranberry hover:text-brand-cranberry bg-white',
  ghost: 'text-navy-600 hover:bg-navy-50 active:bg-navy-100',
  danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-soft',
  success: 'bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 shadow-soft',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-2 text-sm gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3.5 text-base gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

interface BadgeProps {
  children: ReactNode;
  color?: string;
  variant?: 'solid' | 'soft' | 'outline';
  className?: string;
}

export function Badge({ children, color = 'navy', variant = 'soft', className = '' }: BadgeProps) {
  const colorMap: Record<string, { solid: string; soft: string; outline: string }> = {
    navy: { solid: 'bg-navy-800 text-white', soft: 'bg-navy-100 text-navy-700', outline: 'border-navy-200 text-navy-600' },
    brand: { solid: 'bg-brand-cranberry text-white', soft: 'bg-brand-50 text-brand-700', outline: 'border-brand-200 text-brand-600' },
    emerald: { solid: 'bg-emerald-500 text-white', soft: 'bg-emerald-100 text-emerald-700', outline: 'border-emerald-200 text-emerald-600' },
    amber: { solid: 'bg-amber-500 text-white', soft: 'bg-amber-100 text-amber-700', outline: 'border-amber-200 text-amber-600' },
    blue: { solid: 'bg-blue-500 text-white', soft: 'bg-blue-100 text-blue-700', outline: 'border-blue-200 text-blue-600' },
    gray: { solid: 'bg-gray-500 text-white', soft: 'bg-gray-100 text-gray-600', outline: 'border-gray-200 text-gray-500' },
    red: { solid: 'bg-red-500 text-white', soft: 'bg-red-100 text-red-700', outline: 'border-red-200 text-red-600' },
    teal: { solid: 'bg-teal-500 text-white', soft: 'bg-teal-100 text-teal-700', outline: 'border-teal-200 text-teal-600' },
    purple: { solid: 'bg-purple-500 text-white', soft: 'bg-purple-100 text-purple-700', outline: 'border-purple-200 text-purple-600' },
    cyan: { solid: 'bg-cyan-500 text-white', soft: 'bg-cyan-100 text-cyan-700', outline: 'border-cyan-200 text-cyan-600' },
  };

  const c = colorMap[color] || colorMap.navy;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${c[variant]} ${className}`}>
      {children}
    </span>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-navy-700">{label}</label>}
      <input
        className={`px-4 py-3 rounded-xl border-2 transition-colors text-navy-800 placeholder:text-navy-300 outline-none ${
          error ? 'border-red-300 focus:border-red-400' : 'border-navy-200 focus:border-brand-cranberry'
        } ${className}`}
        {...props}
      />
      {hint && !error && <p className="text-xs text-navy-400">{hint}</p>}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-navy-700">{label}</label>}
      <textarea
        className={`px-4 py-3 rounded-xl border-2 transition-colors text-navy-800 placeholder:text-navy-300 outline-none resize-none ${
          error ? 'border-red-300 focus:border-red-400' : 'border-navy-200 focus:border-brand-cranberry'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showValue?: boolean;
  color?: string;
}

export function ProgressBar({ value, max, label, showValue = true, color = 'bg-brand-cranberry' }: ProgressBarProps) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs font-semibold text-navy-500">{label}</span>}
          {showValue && <span className="text-xs font-bold text-navy-700">{value}/{max}</span>}
        </div>
      )}
      <div className="h-2 rounded-full bg-navy-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface SpinnerProps {
  className?: string;
}

export function Spinner({ className = '' }: SpinnerProps) {
  return <Loader2 className={`w-5 h-5 animate-spin ${className}`} />;
}
