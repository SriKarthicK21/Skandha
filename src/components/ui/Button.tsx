import React from 'react';
import { LucideIcon } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

/**
 * Standardized SKANDA Enterprise Button Component.
 * Strict standard heights: 32px (sm), 36px (md), 40px (lg), 44px (xl).
 * Solid high-contrast enterprise colors (no AI slop gradients or scale bounce).
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...props
}) => {
  // Strict standard heights
  const sizeClasses = {
    sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg font-medium',
    md: 'h-9 px-3.5 text-xs sm:text-[13px] gap-2 rounded-lg font-medium',
    lg: 'h-10 px-4 text-sm gap-2 rounded-lg font-semibold',
    xl: 'h-11 px-5 text-sm gap-2.5 rounded-xl font-semibold',
  }[size];

  // Professional enterprise visual variants
  const variantClasses = {
    // Brand action colours come from the token layer (`--brand-action*`), which
    // carries one definition per theme instead of six literal hex values here.
    primary:
      'bg-action hover:bg-action-hover active:bg-action-active text-on-action border border-action shadow-2xs focus-visible:ring-2 focus-visible:ring-ring/50',
    secondary:
      'bg-elevated text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 hover:text-slate-900 dark:hover:text-white shadow-2xs focus-visible:ring-2 focus-visible:ring-ring/50',
    ghost:
      'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-transparent focus-visible:ring-2 focus-visible:ring-ring/50',
    outline:
      'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 focus-visible:ring-2 focus-visible:ring-ring/50',
    danger:
      'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white border border-rose-600 shadow-2xs focus-visible:ring-2 focus-visible:ring-rose-500/50',
    // emerald-600 carries white at only 3.07:1, which fails WCAG 2.2 AA for
    // normal-size button labels; emerald-700 reaches 4.83:1.
    success:
      'bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white border border-emerald-700 shadow-2xs focus-visible:ring-2 focus-visible:ring-emerald-500/50',
    link:
      'bg-transparent text-blue-600 dark:text-blue-400 hover:underline p-0 h-auto font-medium focus-visible:ring-2 focus-visible:ring-ring/50 border-0',
  }[variant];

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center tracking-tight transition-colors duration-150 cursor-pointer select-none whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none ${sizeClasses} ${variantClasses} ${widthClass} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" />
      ) : (
        Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />
      )}
      {children && <span>{children}</span>}
      {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
};

export default Button;
