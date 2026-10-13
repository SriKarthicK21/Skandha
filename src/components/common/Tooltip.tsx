import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { HelpCircle, Info, Calculator, Target, Sparkles, CheckCircle2, History, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type TooltipAlign = 'left' | 'right' | 'center';

export interface TooltipProps {
  children: ReactNode;
  title?: string;
  content: ReactNode;
  formula?: string;
  benchmark?: string;
  badge?: string;
  recommendation?: string;
  position?: TooltipPosition;
  align?: TooltipAlign;
  delay?: number;
  hideDelay?: number;
  interactive?: boolean;
  className?: string;
  triggerClassName?: string;
  maxWidth?: string;
  icon?: ReactNode;
  footer?: ReactNode;
  arrow?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  title,
  content,
  formula,
  benchmark,
  badge,
  recommendation,
  position = 'top',
  align = 'center',
  delay = 100,
  hideDelay = 200,
  interactive = false,
  className = '',
  triggerClassName = '',
  maxWidth = 'max-w-xs sm:max-w-sm',
  icon,
  footer,
  arrow = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (interactive) {
      timerRef.current = window.setTimeout(() => {
        setIsVisible(false);
      }, hideDelay);
    } else {
      setIsVisible(false);
    }
  };

  const cancelHide = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const toggleTooltip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(prev => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };
    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isVisible]);

  // Positioning classes
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return align === 'left'
          ? 'top-full left-0 mt-2'
          : align === 'right'
          ? 'top-full right-0 mt-2'
          : 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      case 'top':
      default:
        return align === 'left'
          ? 'bottom-full left-0 mb-2'
          : align === 'right'
          ? 'bottom-full right-0 mb-2'
          : 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  };

  // Arrow indicators
  const getArrowClasses = () => {
    switch (position) {
      case 'bottom':
        return align === 'left'
          ? 'bottom-full left-4 border-b-slate-800 border-x-transparent border-t-transparent border-[5px]'
          : align === 'right'
          ? 'bottom-full right-4 border-b-slate-800 border-x-transparent border-t-transparent border-[5px]'
          : 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-800 border-x-transparent border-t-transparent border-[5px]';
      case 'left':
        return 'left-full top-1/2 -translate-y-1/2 border-l-slate-800 border-y-transparent border-r-transparent border-[5px]';
      case 'right':
        return 'right-full top-1/2 -translate-y-1/2 border-r-slate-800 border-y-transparent border-l-transparent border-[5px]';
      case 'top':
      default:
        return align === 'left'
          ? 'top-full left-4 border-t-slate-800 border-x-transparent border-b-transparent border-[5px]'
          : align === 'right'
          ? 'top-full right-4 border-t-slate-800 border-x-transparent border-b-transparent border-[5px]'
          : 'top-full left-1/2 -translate-x-1/2 border-t-slate-800 border-x-transparent border-b-transparent border-[5px]';
    }
  };

  const containerDisplayClass = triggerClassName
    ? (triggerClassName.includes('flex') || triggerClassName.includes('block') || triggerClassName.includes('grid'))
      ? `relative ${triggerClassName}`
      : `relative inline-flex items-center ${triggerClassName}`
    : 'relative inline-flex items-center';

  return (
    <div
      ref={containerRef}
      className={containerDisplayClass}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      onClick={toggleTooltip}
    >
      {children}

      {isVisible && (
        <div
          role="tooltip"
          className={`absolute z-50 ${interactive ? 'pointer-events-auto' : 'pointer-events-none'} transition-all duration-150 ${getPositionClasses()}`}
          onMouseEnter={cancelHide}
          onMouseLeave={hideTooltip}
        >
          <div
            data-theme-surface="dark"
            className={`w-72 ${maxWidth} rounded-xl bg-slate-900 border border-slate-700/80 p-3 shadow-2xl text-left text-slate-100 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 dark-surface ${className}`}
          >
            {/* Header: Title + Badge */}
            {(title || badge) && (
              <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-800/80 mb-2">
                {title && (
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-white tracking-tight">
                    {icon || <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                    <span>{title}</span>
                  </div>
                )}
                {badge && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                    {badge}
                  </span>
                )}
              </div>
            )}

            {/* Core Explanatory Content */}
            <div className="text-xs text-slate-300 leading-relaxed font-normal">
              {content}
            </div>

            {/* Calculation / Formula Section */}
            {formula && (
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-start space-x-1.5">
                <Calculator className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                <div className="text-[11px] font-mono text-slate-300">
                  <span className="text-slate-400 font-sans text-[10px] block font-semibold uppercase tracking-wider">
                    Calculation Logic
                  </span>
                  <span className="text-sky-300">{formula}</span>
                </div>
              </div>
            )}

            {/* Benchmark / Target Thresholds */}
            {benchmark && (
              <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-start space-x-1.5">
                <Target className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-slate-300">
                  <span className="text-slate-400 text-[10px] block font-semibold uppercase tracking-wider">
                    Target Thresholds
                  </span>
                  <span className="text-amber-200">{benchmark}</span>
                </div>
              </div>
            )}

            {/* Practical Recommendation / Actionable guidance */}
            {recommendation && (
              <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-start space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-[10px] text-slate-300">
                  <span className="text-emerald-400 block font-semibold uppercase tracking-wider">
                    Auditor Guidance
                  </span>
                  <span className="text-slate-300">{recommendation}</span>
                </div>
              </div>
            )}

            {/* Optional Custom Footer */}
            {footer && (
              <div className="mt-2 pt-2 border-t border-slate-800/80">
                {footer}
              </div>
            )}
          </div>

          {/* Pointing triangle */}
          {arrow && <div className={`absolute w-0 h-0 ${getArrowClasses()}`} />}
        </div>
      )}
    </div>
  );
};

/**
 * Dedicated Informative Metric Icon Button with Rich Context Tooltip
 */
export interface MetricInfoTooltipProps {
  title: string;
  content: ReactNode;
  formula?: string;
  benchmark?: string;
  badge?: string;
  recommendation?: string;
  position?: TooltipPosition;
  align?: TooltipAlign;
  interactive?: boolean;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  icon?: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
  buttonClassName?: string;
  label?: string;
}

export const MetricInfoTooltip: React.FC<MetricInfoTooltipProps> = ({
  title,
  content,
  formula,
  benchmark,
  badge,
  recommendation,
  position = 'top',
  align = 'center',
  interactive = false,
  size = 'sm',
  className = '',
  icon,
  footer,
  maxWidth = 'max-w-xs sm:max-w-sm',
  buttonClassName = '',
  label
}) => {
  const iconSize = size === 'xs' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <Tooltip
      title={title}
      content={content}
      formula={formula}
      benchmark={benchmark}
      badge={badge}
      recommendation={recommendation}
      position={position}
      align={align}
      interactive={interactive}
      className={className}
      icon={icon}
      footer={footer}
      maxWidth={maxWidth}
    >
      <button
        type="button"
        className={`p-0.5 text-slate-500 hover:text-indigo-400 focus:text-indigo-300 transition-colors rounded-full focus:outline-hidden focus:ring-1 focus:ring-indigo-500/50 inline-flex items-center gap-1 justify-center group ${buttonClassName}`}
        aria-label={`Learn more about ${title}`}
      >
        {label && <span className="text-[10px] font-medium text-slate-400 group-hover:text-indigo-400">{label}</span>}
        <Info className={`${iconSize} opacity-70 group-hover:opacity-100 transition-opacity`} />
      </button>
    </Tooltip>
  );
};
