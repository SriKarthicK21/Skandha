import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface PremiumSectionHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  badgeVariant?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  actions?: React.ReactNode;
  className?: string;
}

export const PremiumSectionHeader: React.FC<PremiumSectionHeaderProps> = ({
  title,
  description,
  badge,
  badgeVariant = 'neutral',
  icon: Icon,
  actions,
  className = ''
}) => {
  const badgeStyles = {
    neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
    danger: 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
    info: 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
  };

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-200/80 dark:border-slate-800/80 gap-3 ${className}`}>
      <div className="space-y-0.5 min-w-0">
        <div className="flex items-center space-x-2.5 flex-wrap">
          {Icon && (
            <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
              <Icon className="w-3.5 h-3.5" />
            </div>
          )}
          <h2 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h2>
          {badge && (
            <span className={`text-[10px] font-semibold font-mono px-2 py-0.5 rounded-full border ${badgeStyles[badgeVariant]}`}>
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center space-x-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PremiumSectionHeader;
