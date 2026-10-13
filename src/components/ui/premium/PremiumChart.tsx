import React from 'react';
import { motion } from 'motion/react';
import { PremiumSkeleton } from './PremiumSkeleton';

export interface PremiumChartProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  isLoading?: boolean;
  minHeight?: string | number;
  children: React.ReactNode;
  className?: string;
}

export const PremiumChart: React.FC<PremiumChartProps> = ({
  title,
  subtitle,
  badge,
  actions,
  isLoading = false,
  minHeight = 260,
  children,
  className = ''
}) => {
  if (isLoading) {
    return <PremiumSkeleton variant="chart" className={className} />;
  }

  return (
    <div className={`p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-2xs flex flex-col justify-between ${className}`}>
      {(title || subtitle || badge || actions) && (
        <div className="flex items-start justify-between gap-3 mb-4 shrink-0">
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              {typeof title === 'string' ? (
                <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white truncate">
                  {title}
                </h3>
              ) : (
                title
              )}
              {badge}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{ minHeight }}
        className="w-full flex-1 flex flex-col justify-center min-w-0"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default PremiumChart;
