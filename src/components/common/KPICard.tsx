import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { Tooltip, TooltipPosition } from './Tooltip';
import { MiniSparkline } from './MiniSparkline';
import { parseMetricNumericValue } from '../../utils/kpiAlertThresholds';

export type KPIBadgeType = 'positive' | 'warning' | 'negative' | 'neutral' | 'info' | 'outline';
export type KPITrendDirection = 'up' | 'down' | 'neutral' | 'flat';

export interface KPITrendConfig {
  /** Direction of the performance movement */
  direction: KPITrendDirection;
  /** Performance change value (e.g. '+3.5%', '-2.1%', '+12', '-2') */
  value?: string | number;
  /** Whether the movement is considered positive (green) or negative (red). If undefined, 'up' is positive and 'down' is negative */
  isPositive?: boolean;
  /** Invert standard polarity: treat 'down' as positive (green) and 'up' as negative (red). Useful for risks, findings, defect counts */
  invertColor?: boolean;
  /** Optional label or tooltip explaining the delta */
  label?: string;
}

export interface KPICardProps {
  /** Unique HTML id for testing & DOM targeting */
  id?: string;
  /** Primary label/title of the metric (Level 2 Hierarchy: 12px / text-xs font-semibold) */
  label: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Custom icon theme styles (optional; auto-derived if omitted) */
  iconTheme?: string;
  /** Primary value (Level 1 Hierarchy: 18-20px / text-lg sm:text-xl font-bold font-mono) */
  value: string | number;
  /** Optional custom color override for primary value (e.g. 'emerald', 'amber', 'rose', 'indigo') */
  valueColor?: 'default' | 'emerald' | 'amber' | 'rose' | 'indigo';
  /** Trend indicator configuration or direction for performance movement context */
  trend?: KPITrendConfig | KPITrendDirection;
  /** Simplified direct trend direction */
  trendDirection?: KPITrendDirection;
  /** Simplified direct trend value (e.g., '+2.4%', '-3', '+12') */
  trendValue?: string | number;
  /** Explicit override for whether the trend is positive (green) or negative (red) */
  trendIsPositive?: boolean;
  /** Invert color semantics (e.g., for findings or risks, where down is good/green) */
  trendInverted?: boolean;
  /** Tooltip or accessible label for the trend */
  trendLabel?: string;
  /** 30-day historical performance data for the mini sparkline chart */
  sparklineData?: number[];
  /** Display density mode: 'expanded' displays sparklines and trend pills; 'compact' hides them to maximize density */
  density?: 'compact' | 'expanded';
  /** Whether to show the 30-day mini sparkline chart (defaults to true if density !== 'compact') */
  showSparkline?: boolean;
  /** Whether to show the trend indicator badge (defaults to true if density !== 'compact') */
  showTrend?: boolean;
  /** Secondary badge text (Level 3 Hierarchy: 9.5px / font-mono font-bold uppercase) */
  secondaryBadge?: string;
  /** Visual semantic type for the secondary badge */
  secondaryBadgeType?: KPIBadgeType;
  /** Status/context pill text (Level 4 Hierarchy: 10px / font-semibold) */
  statusPill?: string;
  /** Visual semantic type for the status/context pill */
  statusType?: KPIBadgeType;
  /** Progress bar completion percentage (0 - 100) */
  progressPercent?: number;
  /** Semantic type for progress bar color fill */
  progressBarType?: KPIBadgeType;
  /** Optional tooltip title and content */
  tooltipTitle?: string;
  /** Configurable critical alert threshold (e.g. 85). Triggers pulsing glow if metric drops below */
  criticalThreshold?: number;
  /** Explicit override for critical alert status */
  isCriticalAlert?: boolean;
  /** Whether pulsing glow animation is enabled for critical alert cards (defaults to true) */
  enableAlertPulse?: boolean;
  /** Custom label for critical alert badge */
  alertLabel?: string;
  tooltipContent?: React.ReactNode;
  tooltipBadge?: string;
  tooltipPosition?: TooltipPosition;
  /** Click handler if the tile is interactive (e.g., opens details or navigates) */
  onClick?: () => void;
  /** Additional container CSS classes */
  className?: string;
  /** Explicit theme toggle support (light vs dark) */
  isLight?: boolean;
}

/**
 * Returns standardized styles for the secondary badge.
 * Enforces Level 3 Typographic Hierarchy (9.5px font-mono font-bold tracking-wider).
 */
function getSecondaryBadgeClasses(type: KPIBadgeType = 'neutral', isLight: boolean): string {
  switch (type) {
    case 'positive':
      return isLight
        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
        : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50';
    case 'warning':
      return isLight
        ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs'
        : 'bg-amber-950/80 text-amber-300 border-amber-500/50';
    case 'negative':
      return isLight
        ? 'bg-rose-50 text-rose-800 border-rose-300 shadow-2xs'
        : 'bg-rose-950/80 text-rose-300 border-rose-500/50';
    case 'info':
      return isLight
        ? 'bg-sky-50 text-sky-800 border-sky-300 shadow-2xs'
        : 'bg-sky-950/80 text-sky-300 border-sky-500/50';
    case 'outline':
    case 'neutral':
    default:
      return isLight
        ? 'bg-slate-100 text-slate-700 border-slate-300 shadow-2xs'
        : 'bg-slate-800/90 text-slate-300 border-slate-700';
  }
}

/**
 * Returns standardized styles for the qualitative status pill.
 * Enforces Level 4 Typographic Hierarchy (10px font-semibold).
 */
function getStatusPillClasses(type: KPIBadgeType = 'neutral', isLight: boolean): string {
  switch (type) {
    case 'positive':
      return isLight
        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
        : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50';
    case 'warning':
      return isLight
        ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs'
        : 'bg-amber-950/80 text-amber-300 border-amber-500/50';
    case 'negative':
      return isLight
        ? 'bg-rose-50 text-rose-800 border-rose-300 shadow-2xs'
        : 'bg-rose-950/80 text-rose-300 border-rose-500/50';
    case 'info':
      return isLight
        ? 'bg-sky-50 text-sky-800 border-sky-300 shadow-2xs'
        : 'bg-sky-950/80 text-sky-300 border-sky-500/50';
    case 'neutral':
    case 'outline':
    default:
      return isLight
        ? 'bg-slate-100 text-slate-700 border-slate-200/90 shadow-2xs'
        : 'bg-slate-800/80 text-slate-300 border-slate-700/60';
  }
}

/**
 * Returns standardized progress bar fill colors with vibrant gradients.
 */
function getProgressBarColorClasses(type: KPIBadgeType = 'positive'): string {
  switch (type) {
    case 'warning':
      return 'bg-gradient-to-r from-amber-400 to-amber-500';
    case 'negative':
      return 'bg-gradient-to-r from-rose-500 to-red-600';
    case 'info':
      return 'bg-gradient-to-r from-sky-400 to-blue-500';
    case 'neutral':
      return 'bg-slate-400';
    case 'positive':
    default:
      return 'bg-gradient-to-r from-emerald-400 to-teal-500';
  }
}

/**
 * Normalized shared KPICard component that strictly enforces:
 * 1. Standard Padding: p-3 sm:p-3.5 container with uniform inner margins
 * 2. Font-Size Hierarchy:
 *    - Level 1: Primary Value (18-20px font-mono font-bold)
 *    - Level 2: Metric Title (12px font-semibold truncate)
 *    - Level 3: Secondary Badge (9.5px font-mono font-bold uppercase)
 *    - Level 4: Status / Context Pill (10px font-semibold)
 * 3. Icon Positioning: Dedicated w-6 h-6 square frame pinned top-left with shrink-0
 * 4. Enterprise Polish: Consistent border radii, hover states, and WCAG AA contrast
 */
export const KPICard: React.FC<KPICardProps> = ({
  id,
  label,
  icon: IconComponent,
  iconTheme,
  value,
  valueColor = 'default',
  trend,
  trendDirection,
  trendValue,
  trendIsPositive,
  trendInverted = false,
  trendLabel,
  sparklineData,
  density = 'expanded',
  showSparkline,
  showTrend,
  secondaryBadge,
  secondaryBadgeType = 'neutral',
  statusPill,
  statusType = 'neutral',
  progressPercent,
  progressBarType = 'positive',
  tooltipTitle,
  criticalThreshold,
  isCriticalAlert,
  enableAlertPulse = true,
  alertLabel,
  tooltipContent,
  tooltipBadge,
  tooltipPosition = 'top',
  onClick,
  className = '',
  isLight: isLightProp
}) => {
  const { theme } = useGRC();
  const isLight = isLightProp !== undefined ? isLightProp : (theme ? theme === 'light' : true);
  const isClickable = typeof onClick === 'function';
  const isCompact = density === 'compact';
  const shouldShowSparkline = showSparkline !== undefined ? showSparkline : !isCompact;
  const shouldShowTrend = showTrend !== undefined ? showTrend : !isCompact;

  // Check if metric dropped below critical alert threshold (configurable, e.g. 85%)
  const parsedNumeric = typeof progressPercent === 'number'
    ? progressPercent
    : parseMetricNumericValue(value);

  const isTriggeredCriticalAlert = Boolean(
    isCriticalAlert !== undefined
      ? isCriticalAlert
      : criticalThreshold !== undefined && parsedNumeric !== null
      ? trendInverted
        ? parsedNumeric > 0
        : parsedNumeric < criticalThreshold
      : false
  );

  const shouldPulseAlert = isTriggeredCriticalAlert && enableAlertPulse;

  // Resolve trend indicator configuration (Level 1 Supplementary Context)
  const resolvedTrend: KPITrendConfig | null = (() => {
    let raw: Partial<KPITrendConfig> | null = null;
    if (typeof trend === 'string') {
      raw = { direction: trend, value: trendValue };
    } else if (trend && typeof trend === 'object') {
      raw = { ...trend };
    } else if (trendDirection) {
      raw = { direction: trendDirection, value: trendValue };
    }

    if (!raw || !raw.direction) return null;

    const direction = raw.direction;
    const invertColor = raw.invertColor ?? trendInverted ?? false;
    let isPositive: boolean;

    if (typeof raw.isPositive === 'boolean') {
      isPositive = raw.isPositive;
    } else if (typeof trendIsPositive === 'boolean') {
      isPositive = trendIsPositive;
    } else if (direction === 'neutral' || direction === 'flat') {
      isPositive = false;
    } else if (direction === 'up') {
      isPositive = !invertColor;
    } else {
      // direction === 'down'
      isPositive = invertColor;
    }

    return {
      direction,
      value: raw.value ?? trendValue,
      isPositive,
      invertColor,
      label: raw.label ?? trendLabel
    };
  })();

  // Value color styling (Level 1 Hierarchy)
  let valueColorClass = 'text-[var(--skanda-text-primary)]';
  if (valueColor === 'emerald') {
    valueColorClass = isLight ? 'text-emerald-700' : 'text-emerald-300';
  } else if (valueColor === 'amber') {
    valueColorClass = isLight ? 'text-amber-700' : 'text-amber-300';
  } else if (valueColor === 'rose') {
    valueColorClass = isLight ? 'text-rose-700' : 'text-rose-300';
  } else if (valueColor === 'indigo') {
    valueColorClass = isLight ? 'text-indigo-700' : 'text-indigo-300';
  }

  // Fallback icon theme
  const defaultIconTheme = isLight
    ? 'bg-indigo-50 text-indigo-700 border-indigo-200/90 shadow-2xs'
    : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';

  const finalIconTheme = iconTheme || defaultIconTheme;

  // Clamped progress percentage (0 - 100)
  // Clamped progress percentage (0 - 100)
  const clampedProgress =
    typeof progressPercent === 'number'
      ? Math.max(0, Math.min(100, progressPercent))
      : null;

  // Animated count-up representation for numeric values
  const [animatedValue, setAnimatedValue] = React.useState<string | number>(value);
  React.useEffect(() => {
    if (typeof value === 'string') {
      const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
      if (isNaN(num)) {
        setAnimatedValue(value);
        return;
      }
      const prefix = value.match(/^[^\d-]*/)?.[0] || '';
      const suffix = value.match(/[^\d.]*$/)?.[0] || '';
      const isDecimal = value.includes('.');
      const decimals = isDecimal ? (value.split('.')[1]?.length || 1) : 0;

      let start: number | null = null;
      const duration = 750;
      const step = (now: number) => {
        if (!start) start = now;
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = num * ease;
        const formatted = isDecimal ? current.toFixed(decimals) : Math.round(current).toString();
        setAnimatedValue(`${prefix}${formatted}${suffix}`);
        if (progress < 1) requestAnimationFrame(step);
        else setAnimatedValue(value);
      };
      requestAnimationFrame(step);
    } else if (typeof value === 'number') {
      let start: number | null = null;
      const duration = 750;
      const step = (now: number) => {
        if (!start) start = now;
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        setAnimatedValue(Math.round(value * ease));
        if (progress < 1) requestAnimationFrame(step);
        else setAnimatedValue(value);
      };
      requestAnimationFrame(step);
    }
  }, [value]);

  const cardContent = (
    <div
      id={id}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`relative overflow-hidden ${
        isCompact
          ? 'p-3 min-h-[104px] sm:min-h-[108px]'
          : 'p-4 sm:p-5 min-h-[132px] sm:min-h-[136px]'
      } rounded-xl border transition-all duration-200 grid grid-rows-[auto_1fr_auto] gap-2 w-full h-full select-none group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500/50 hover:-translate-y-0.5 ${
        shouldPulseAlert
          ? isLight
            ? 'kpi-critical-glow ring-2 ring-rose-500/50 border-rose-400 bg-rose-50/40 hover:bg-rose-50/70 shadow-xs'
            : 'kpi-critical-glow ring-2 ring-rose-500/50 border-rose-500/80 bg-rose-950/25 hover:bg-rose-950/40 shadow-md'
          : isLight
          ? 'border-[#E2E8F0] bg-white shadow-2xs hover:border-[#CBD5E1] hover:shadow-xs'
          : 'border-[#273449] bg-[#162033] shadow-xs hover:border-[#334155] hover:shadow-sm'
      } ${
        isClickable
          ? isLight
            ? 'hover:bg-slate-50/80 hover:border-[#CBD5E1] cursor-pointer'
            : 'hover:border-[#334155] hover:bg-[#1E293B] cursor-pointer'
          : 'cursor-default'
      } ${className}`}
    >
      {/* 0. Top Accent Line (Blue #2563EB, Violet #6D28D9, Teal/Emerald #10B981, Amber #F59E0B) */}
      <div
        className={`absolute top-0 left-0 right-0 h-[3px] ${
          shouldPulseAlert
            ? 'bg-[#EF4444]'
            : valueColor === 'emerald'
            ? 'bg-[#10B981]'
            : valueColor === 'amber'
            ? 'bg-[#F59E0B]'
            : valueColor === 'rose'
            ? 'bg-[#EF4444]'
            : valueColor === 'indigo'
            ? 'bg-[#6D28D9]'
            : 'bg-[#2563EB]'
        }`}
      />

      {/* 1. Header: Icon & Title Normalized + Alert Beacon (Level 2 Hierarchy) */}
      <div className="flex items-center justify-between space-x-2 min-w-0 pt-0.5">
        <div className="flex items-center space-x-2 min-w-0">
          {/* Enforced Icon Positioning: square 24px container, shrink-0, perfectly centered */}
          <div
            className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border leading-none transition-transform group-hover:scale-105 shadow-2xs ${
              shouldPulseAlert
                ? isLight
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-rose-950/80 text-rose-300 border-rose-500/60'
                : isLight
                ? 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]'
                : finalIconTheme
            }`}
          >
            <IconComponent className="w-3.5 h-3.5 shrink-0" />
          </div>
          <span
            className={`text-xs font-semibold uppercase tracking-wider truncate leading-tight ${
              shouldPulseAlert
                ? isLight
                  ? 'text-rose-900 font-bold'
                  : 'text-rose-200 font-bold'
                : isLight
                ? 'text-[#64748B]'
                : 'text-[#94A3B8]'
            }`}
            title={label}
          >
            {label}
          </span>
        </div>

        {/* Critical Alert Beacon Badge */}
        {shouldPulseAlert && (
          <span
            className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold border shrink-0 transition-colors ${
              isLight
                ? 'bg-rose-100 text-rose-900 border-rose-300 shadow-2xs'
                : 'bg-rose-950/90 text-rose-300 border-rose-500/60 shadow-xs'
            }`}
            title={alertLabel || `CRITICAL ALERT: Current score (${value}) is below ${criticalThreshold ?? 85}% critical threshold`}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
            </span>
            <span>{alertLabel || `<${criticalThreshold ?? 85}%`}</span>
          </span>
        )}
      </div>

      {/* 2. Primary Metric Score, Sub-label & Trend Indicator in Responsive Grid */}
      <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-2 gap-y-1 my-auto min-w-0">
        {/* Metric Value */}
        <div className="flex items-baseline min-w-0">
          <span
            className={`text-xl sm:text-2xl font-black font-mono tracking-tight leading-none truncate ${valueColorClass}`}
          >
            {animatedValue}
          </span>
        </div>

        {/* Trend Indicator & Secondary Badge (Right-aligned, baseline/center) */}
        <div className="flex items-center space-x-1.5 shrink-0 justify-self-end">
          {shouldShowSparkline && (
            <MiniSparkline
              data={sparklineData}
              trendDirection={resolvedTrend?.direction || 'up'}
              isPositive={resolvedTrend?.isPositive ?? true}
              color={
                resolvedTrend
                  ? resolvedTrend.direction === 'neutral' || resolvedTrend.direction === 'flat'
                    ? 'slate'
                    : resolvedTrend.isPositive
                    ? 'emerald'
                    : 'rose'
                  : 'emerald'
              }
              width={46}
              height={18}
              title={`30-day performance trajectory for ${label}`}
            />
          )}

          {shouldShowTrend && resolvedTrend && (
            <span
              className={`inline-flex items-center space-x-0.5 font-mono text-[10px] font-bold shrink-0 px-1.5 py-0.5 rounded border transition-colors leading-none ${
                resolvedTrend.direction === 'neutral' || resolvedTrend.direction === 'flat'
                  ? isLight
                    ? 'text-slate-600 bg-slate-100/90 border-slate-200'
                    : 'text-slate-400 bg-slate-800/80 border-slate-700/60'
                  : resolvedTrend.isPositive
                  ? isLight
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200 shadow-2xs'
                    : 'text-emerald-300 bg-emerald-950/70 border-emerald-500/40'
                  : isLight
                  ? 'text-rose-700 bg-rose-50 border-rose-200 shadow-2xs'
                  : 'text-rose-300 bg-rose-950/70 border-rose-500/40'
              }`}
              title={
                resolvedTrend.label ||
                (resolvedTrend.direction === 'neutral' || resolvedTrend.direction === 'flat'
                  ? 'Stable performance'
                  : resolvedTrend.isPositive
                  ? `Positive movement (${resolvedTrend.value || resolvedTrend.direction})`
                  : `Negative movement (${resolvedTrend.value || resolvedTrend.direction})`)
              }
            >
              {resolvedTrend.direction === 'up' && (
                <TrendingUp
                  className={`w-3 h-3 shrink-0 ${
                    resolvedTrend.isPositive
                      ? isLight ? 'text-emerald-600' : 'text-emerald-400'
                      : isLight ? 'text-rose-600' : 'text-rose-400'
                  }`}
                />
              )}
              {resolvedTrend.direction === 'down' && (
                <TrendingDown
                  className={`w-3 h-3 shrink-0 ${
                    resolvedTrend.isPositive
                      ? isLight ? 'text-emerald-600' : 'text-emerald-400'
                      : isLight ? 'text-rose-600' : 'text-rose-400'
                  }`}
                />
              )}
              {(resolvedTrend.direction === 'neutral' || resolvedTrend.direction === 'flat') && (
                <Minus className="w-2.5 h-2.5 shrink-0 text-slate-400" />
              )}
              {resolvedTrend.value && (
                <span className="text-[9.5px] whitespace-nowrap">{resolvedTrend.value}</span>
              )}
            </span>
          )}

          {secondaryBadge && (
            <span
              className={`h-5 px-1.5 inline-flex items-center justify-center rounded font-mono text-[9.5px] font-bold border tracking-wider uppercase leading-none whitespace-nowrap shrink-0 ${getSecondaryBadgeClasses(
                secondaryBadgeType,
                isLight
              )}`}
            >
              {secondaryBadge}
            </span>
          )}
        </div>

        {/* Sub-label / Semantic Status Pill (Spans both columns for full width and consistent height) */}
        <div className="col-span-2 flex items-center justify-between min-w-0 h-5 mt-0.5">
          {statusPill ? (
            <span
              className={`h-5 px-2 inline-flex items-center justify-center rounded text-[10px] font-semibold border leading-none whitespace-nowrap truncate max-w-full ${getStatusPillClasses(
                statusType,
                isLight
              )}`}
            >
              {statusPill}
            </span>
          ) : (
            <div className="h-5" />
          )}
        </div>
      </div>

      {/* 3. Micro Progress Bar Normalized */}
      <div
        className={`w-full h-1 rounded-full overflow-hidden self-end ${
          isLight ? 'bg-slate-100 border border-slate-200/60' : 'bg-slate-800'
        }`}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${getProgressBarColorClasses(
            progressBarType
          )}`}
          style={{ width: `${clampedProgress ?? 100}%` }}
        />
      </div>
    </div>
  );

  const renderedTooltipContent = (tooltipContent || shouldPulseAlert) ? (
    <div className="space-y-1.5">
      {shouldPulseAlert && (
        <div className="p-1.5 rounded-md bg-rose-500/15 border border-rose-500/40 text-rose-600 dark:text-rose-300 text-[11px] font-medium flex items-start space-x-1.5 leading-snug">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
          <span>
            <strong>Executive Alert:</strong> Metric value ({value}) has breached the {criticalThreshold ?? 85}% critical threshold. Immediate remediation recommended.
          </span>
        </div>
      )}
      {tooltipContent}
    </div>
  ) : undefined;

  if (renderedTooltipContent) {
    return (
      <Tooltip
        title={tooltipTitle || label}
        content={renderedTooltipContent}
        badge={shouldPulseAlert ? (tooltipBadge || 'CRITICAL') : tooltipBadge}
        position={tooltipPosition}
        triggerClassName="w-full h-full flex flex-col"
      >
        {cardContent}
      </Tooltip>
    );
  }

  return cardContent;
};

export default KPICard;
