import React from 'react';
import { LucideIcon } from 'lucide-react';

export type PremiumBadgeVariant =
  | 'success'
  | 'warning'
  | 'critical'
  | 'info'
  | 'neutral'
  | 'ai'
  | 'purple'
  | 'outline';

export interface PremiumBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: PremiumBadgeVariant;
  size?: 'sm' | 'md';
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  pulse?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  icon: Icon,
  pulse = false,
  children,
  className = '',
  ...props
}) => {
  const sizeClasses = size === 'sm'
    ? 'px-1.5 py-0.2 text-[9.5px] gap-1'
    : 'px-2 py-0.5 text-[10.5px] gap-1.5';

  const variantClasses = {
    success:
      'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/70',
    warning:
      'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/70',
    critical:
      'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/70',
    info:
      'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/70',
    neutral:
      'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    ai:
      'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/70',
    purple:
      'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/70',
    outline:
      'bg-transparent text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
  }[variant];

  const pulseDotColor = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    critical: 'bg-rose-500',
    info: 'bg-blue-500',
    neutral: 'bg-slate-400',
    ai: 'bg-indigo-500',
    purple: 'bg-purple-500',
    outline: 'bg-slate-400'
  }[variant];

  return (
    <span
      className={`inline-flex items-center font-medium font-sans border rounded-md leading-none whitespace-nowrap shrink-0 transition-colors select-none ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseDotColor}`} />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${pulseDotColor}`} />
        </span>
      )}
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{children}</span>
    </span>
  );
};

export default PremiumBadge;
