import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface PremiumStatProps {
  label: string;
  value: string | number;
  subValue?: string;
  change?: number | string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  iconColor?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  onClick?: () => void;
  className?: string;
}

export const PremiumStat: React.FC<PremiumStatProps> = ({
  label,
  value,
  subValue,
  change,
  trend,
  trendLabel,
  icon: Icon,
  iconColor,
  variant = 'default',
  onClick,
  className = ''
}) => {
  const isInteractive = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={`relative rounded-xl border p-4 transition-all duration-200 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xs ${
        isInteractive ? 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
          {label}
        </span>
        {Icon && (
          <div className={`p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 ${iconColor || 'text-slate-600 dark:text-slate-300'}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
          {value}
        </span>
        {subValue && (
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {subValue}
          </span>
        )}
      </div>

      {(change !== undefined || trendLabel) && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />}
          {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-rose-500" />}
          {trend === 'neutral' && <Minus className="w-3.5 h-3.5 text-slate-400" />}
          {change !== undefined && (
            <span
              className={`font-semibold ${
                trend === 'up'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : trend === 'down'
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {typeof change === 'number' && change > 0 ? `+${change}%` : `${change}%`}
            </span>
          )}
          {trendLabel && (
            <span className="text-slate-500 dark:text-slate-400 font-normal">
              {trendLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default PremiumStat;
