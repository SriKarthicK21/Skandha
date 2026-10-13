import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { LucideIcon, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { useGRC } from '../../../context/GRCContext';
import { Tooltip } from '../../common/Tooltip';

export interface PremiumKpiProps {
  id?: string;
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconTheme?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value?: string | number;
    isPositive?: boolean;
    invertColor?: boolean;
    label?: string;
  };
  secondaryBadge?: string;
  statusPill?: string;
  statusType?: 'success' | 'warning' | 'critical' | 'info' | 'neutral';
  progressPercent?: number;
  criticalThreshold?: number;
  isCriticalAlert?: boolean;
  tooltipContent?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

/**
 * Animated Number Counter Hook with smooth deceleration easing
 */
function useCountUp(targetValue: number | string, durationMs: number = 800) {
  const [displayValue, setDisplayValue] = useState<string | number>(() => {
    if (typeof targetValue === 'number') return 0;
    const parsed = parseFloat(String(targetValue).replace(/[^0-9.-]/g, ''));
    return isNaN(parsed) ? targetValue : 0;
  });

  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    if (typeof targetValue === 'string') {
      const numericPart = parseFloat(targetValue.replace(/[^0-9.-]/g, ''));
      if (isNaN(numericPart)) {
        setDisplayValue(targetValue);
        return;
      }
      const prefix = targetValue.match(/^[^\d-]*/)?.[0] || '';
      const suffix = targetValue.match(/[^\d.]*$/)?.[0] || '';
      const isDecimal = targetValue.includes('.');
      const decimalPlaces = isDecimal ? (targetValue.split('.')[1]?.length || 1) : 0;

      let startTimestamp: number | null = null;
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / durationMs, 1);
        // Easing: easeOutCubic
        const ease = 1 - Math.pow(1 - progress, 3);
        const currentNum = numericPart * ease;
        const formatted = isDecimal ? currentNum.toFixed(decimalPlaces) : Math.round(currentNum).toString();
        setDisplayValue(`${prefix}${formatted}${suffix}`);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          setDisplayValue(targetValue);
        }
      };
      requestAnimationFrame(step);
    } else if (typeof targetValue === 'number') {
      let startTimestamp: number | null = null;
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / durationMs, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.round(targetValue * ease));

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          setDisplayValue(targetValue);
        }
      };
      requestAnimationFrame(step);
    }
  }, [targetValue, durationMs, isInView]);

  return { displayValue, ref };
}

export const PremiumKpi: React.FC<PremiumKpiProps> = ({
  id,
  label,
  value,
  icon: Icon,
  iconTheme,
  trend,
  secondaryBadge,
  statusPill,
  statusType = 'neutral',
  progressPercent,
  criticalThreshold,
  isCriticalAlert = false,
  tooltipContent,
  onClick,
  className = ''
}) => {
  const { theme } = useGRC();
  const isLight = theme === 'light';
  const { displayValue, ref } = useCountUp(value, 850);

  // Derive critical alert status
  const numericVal = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  const isAlert = isCriticalAlert || (criticalThreshold !== undefined && !isNaN(numericVal) && numericVal < criticalThreshold);

  // Status Colors
  const statusClasses = {
    success: isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
    warning: isLight ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-950/60 text-amber-300 border-amber-800/60',
    critical: isLight ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-rose-950/60 text-rose-300 border-rose-800/60',
    info: isLight ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-950/60 text-blue-300 border-blue-800/60',
    neutral: isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-800 text-slate-300 border-slate-700'
  }[statusType];

  return (
    <motion.div
      ref={ref}
      id={id}
      whileHover={onClick ? { y: -2, transition: { duration: 0.16 } } : undefined}
      whileTap={onClick ? { y: 1 } : undefined}
      onClick={onClick}
      className={`relative group rounded-xl p-4 sm:p-5 border transition-all duration-200 min-h-[132px] flex flex-col justify-between ${
        isAlert
          ? isLight
            ? 'bg-rose-50/40 border-rose-300 shadow-2xs'
            : 'bg-rose-950/20 border-rose-800/80 shadow-xs'
          : isLight
          ? 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-xs'
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Subtle Alert Indicator */}
      {isAlert && (
        <div className="absolute top-3 right-3 flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span>Action Required</span>
        </div>
      )}

      {/* Header: Icon & Label */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
              iconTheme ||
              (isLight
                ? 'bg-slate-100 text-slate-700 border-slate-200/80'
                : 'bg-slate-800 text-slate-300 border-slate-700/80')
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate tracking-tight">
            {label}
          </span>
        </div>

        {secondaryBadge && !isAlert && (
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0">
            {secondaryBadge}
          </span>
        )}
      </div>

      {/* Metric Value & Context */}
      <div className="my-2 flex items-baseline justify-between gap-3">
        <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
          {displayValue}
        </div>

        {trend && (
          <div
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
              (trend.direction === 'up' && !trend.invertColor) || (trend.direction === 'down' && trend.invertColor)
                ? isLight
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                : trend.direction === 'down'
                ? isLight
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-rose-950/60 text-rose-300 border-rose-800/60'
                : isLight
                ? 'bg-slate-100 text-slate-600 border-slate-200'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {trend.direction === 'up' ? (
              <TrendingUp className="w-3 h-3" />
            ) : trend.direction === 'down' ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            <span>{trend.value}</span>
          </div>
        )}
      </div>

      {/* Progress or Status Pill */}
      {progressPercent !== undefined ? (
        <div className="space-y-1 pt-1">
          <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className={`h-full rounded-full ${
                progressPercent >= 80 ? 'bg-emerald-500' : progressPercent >= 50 ? 'bg-blue-500' : 'bg-amber-500'
              }`}
            />
          </div>
        </div>
      ) : statusPill ? (
        <div className="pt-1 flex items-center justify-between text-xs">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10.5px] font-medium border ${statusClasses}`}>
            {statusPill}
          </span>
          {tooltipContent && (
            <Tooltip content={tooltipContent}>
              <span className="text-[10.5px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-help">
                Details
              </span>
            </Tooltip>
          )}
        </div>
      ) : null}
    </motion.div>
  );
};

export default PremiumKpi;
