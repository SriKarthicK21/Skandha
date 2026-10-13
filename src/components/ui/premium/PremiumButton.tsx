import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { LucideIcon, Loader2 } from 'lucide-react';

export type PremiumButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'ghost'
  | 'ai'
  | 'outline'
  | 'success';

export type PremiumButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface PremiumButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: PremiumButtonVariant;
  size?: PremiumButtonSize;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  iconRight?: LucideIcon | React.ComponentType<{ className?: string }>;
  isLoading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: IconLeft,
  iconRight: IconRight,
  isLoading = false,
  loadingText,
  disabled = false,
  fullWidth = false,
  children,
  className = '',
  ...props
}) => {
  // Height & Padding scale (Zero arbitrary dimensions)
  const sizeClasses = {
    sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
    md: 'h-9 px-3.5 text-xs font-semibold gap-2 rounded-lg',
    lg: 'h-10 px-4 text-sm font-semibold gap-2 rounded-xl',
    xl: 'h-11 px-5 text-sm font-semibold gap-2.5 rounded-xl'
  }[size];

  // Visual variants
  const variantClasses = {
    primary:
      'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-2xs hover:shadow-xs border border-blue-700/30 focus-visible:ring-2 focus-visible:ring-blue-500/40',
    secondary:
      'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-2xs focus-visible:ring-2 focus-visible:ring-slate-400/30',
    danger:
      'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-2xs border border-rose-700/30 focus-visible:ring-2 focus-visible:ring-rose-500/40',
    ghost:
      'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 border border-transparent focus-visible:ring-2 focus-visible:ring-slate-400/30',
    ai:
      'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xs border border-indigo-400/30 focus-visible:ring-2 focus-visible:ring-indigo-400/40',
    outline:
      'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 focus-visible:ring-2 focus-visible:ring-slate-400/30',
    success:
      'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-2xs border border-emerald-700/30 focus-visible:ring-2 focus-visible:ring-emerald-500/40'
  }[variant];

  const disabledClasses = disabled || isLoading
    ? 'opacity-50 cursor-not-allowed pointer-events-none'
    : 'cursor-pointer';

  const widthClasses = fullWidth ? 'w-full justify-center' : 'inline-flex';

  return (
    <motion.button
      whileHover={(!disabled && !isLoading) ? { y: -1 } : undefined}
      whileTap={(!disabled && !isLoading) ? { y: 1 } : undefined}
      transition={{ duration: 0.12, ease: 'easeOut' }}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      aria-disabled={disabled}
      className={`relative select-none items-center justify-center font-sans tracking-tight transition-all duration-150 focus-visible:outline-hidden ${sizeClasses} ${variantClasses} ${disabledClasses} ${widthClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {IconLeft && <IconLeft className="w-3.5 h-3.5 shrink-0" />}
          <span>{children}</span>
          {IconRight && <IconRight className="w-3.5 h-3.5 shrink-0" />}
        </>
      )}
    </motion.button>
  );
};

export default PremiumButton;
