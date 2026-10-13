import React, { useId } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import {
  MonthOverMonthDataPoint,
  MOM_COMPLIANCE_METRICS
} from '../../utils/momComplianceMetrics';

export type SparklineColor = 'emerald' | 'rose' | 'indigo' | 'sky' | 'amber' | 'purple' | 'slate';

export interface RechartsSparklineProps {
  /**
   * Predefined metric ID to pull calibrated Month-over-Month historical series
   * ('compliance_health' | 'controls_effective' | 'open_findings' | 'audit_readiness' | 'framework_alignment' | 'evidence_coverage' | 'risk_exposure' | 'tasks_due')
   */
  metricId?: string;
  /** Custom data: array of raw numbers OR MonthOverMonthDataPoint objects */
  data?: number[] | MonthOverMonthDataPoint[];
  /** Color theme for stroke and gradient */
  color?: SparklineColor;
  /** Width in pixels (default: 56) */
  width?: number;
  /** Height in pixels (default: 22) */
  height?: number;
  /** Line stroke width (default: 1.5) */
  strokeWidth?: number;
  /** Show subtle area gradient fill underneath the curve (default: true) */
  showArea?: boolean;
  /** Highlight dot on latest reading (default: true) */
  showEndDot?: boolean;
  /** Invert color semantics: decreasing value is good/green (for risks and open findings) */
  invertColor?: boolean;
  /** Unit to display in tooltip (e.g. '%', 'items', '/10') */
  unit?: string;
  /** Whether to render an interactive rich MoM hover tooltip (default: true) */
  showTooltip?: boolean;
  /** Custom accessible title or label */
  title?: string;
  /** Extra container class names */
  className?: string;
  /** Fallback trend direction */
  trendDirection?: 'up' | 'down' | 'neutral' | 'flat';
  /** Whether the overall trend is positive */
  isPositive?: boolean;
  /** Light mode toggle */
  isLight?: boolean;
}

interface SparklineColorToken {
  cssVar: string;
  fallback: string;
}

const COLOR_TOKENS: Record<SparklineColor, SparklineColorToken> = {
  emerald: {
    cssVar: 'var(--skanda-sparkline-emerald, var(--skanda-success, #22C55E))',
    fallback: '#22C55E'
  },
  indigo: {
    cssVar: 'var(--skanda-sparkline-indigo, var(--skanda-brand-secondary, #6366F1))',
    fallback: '#6366F1'
  },
  sky: {
    cssVar: 'var(--skanda-sparkline-sky, var(--skanda-info, #38BDF8))',
    fallback: '#38BDF8'
  },
  purple: {
    cssVar: 'var(--skanda-sparkline-purple, var(--skanda-brand, #8B5CF6))',
    fallback: '#8B5CF6'
  },
  amber: {
    cssVar: 'var(--skanda-sparkline-amber, var(--skanda-warning, #F59E0B))',
    fallback: '#F59E0B'
  },
  rose: {
    cssVar: 'var(--skanda-sparkline-rose, var(--skanda-critical, #EF4444))',
    fallback: '#EF4444'
  },
  slate: {
    cssVar: 'var(--skanda-sparkline-slate, var(--skanda-text-disabled, #94A3B8))',
    fallback: '#94A3B8'
  }
};

const MONTH_NAMES = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

/**
 * Custom Hover Tooltip component displaying exact data point value,
 * corresponding date, period delta, and milestone annotation.
 */
interface CustomSparklineTooltipProps {
  active?: boolean;
  payload?: any[];
  unit?: string;
  themeTokens: SparklineColorToken;
  isLight?: boolean;
}

const CustomSparklineTooltip: React.FC<CustomSparklineTooltipProps> = ({
  active,
  payload,
  unit = '%',
  themeTokens,
  isLight
}) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload as MonthOverMonthDataPoint;
  if (!item) return null;

  const displayDate = item.date || item.fullDate || `${item.month} 2026`;
  const displayValue = item.value;
  const hasDelta = item.delta !== undefined;

  return (
    <div
      className="z-[99999] px-2.5 py-1.5 rounded-md shadow-2xl border text-[11px] font-mono whitespace-nowrap pointer-events-none transition-all duration-75"
      style={{
        backgroundColor: 'var(--skanda-bg-elevated, #0D1424)',
        borderColor: 'var(--skanda-border, #243047)',
        color: 'var(--skanda-text-primary, #F8FAFC)',
        boxShadow: isLight
          ? '0 10px 25px -5px rgba(15, 23, 42, 0.18), 0 8px 10px -6px rgba(15, 23, 42, 0.12)'
          : '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.5)'
      }}
    >
      {/* 1. Header: Corresponding Date & Period Delta */}
      <div
        className="flex items-center justify-between gap-2 pb-1 border-b text-[10px]"
        style={{ borderColor: 'var(--skanda-border-subtle, #1B2639)' }}
      >
        <div className="flex items-center space-x-1" style={{ color: 'var(--skanda-text-muted, #94A3B8)' }}>
          <Calendar className="w-2.5 h-2.5 shrink-0 opacity-80" />
          <span className="font-semibold tracking-tight">{displayDate}</span>
        </div>
        {hasDelta && (
          <span
            className="inline-flex items-center space-x-0.5 px-1 py-0.5 rounded text-[9px] font-bold leading-none"
            style={{
              backgroundColor: item.isImprovement
                ? isLight ? '#DCFCE7' : 'rgba(34, 197, 94, 0.18)'
                : isLight ? '#FEE2E2' : 'rgba(239, 68, 68, 0.18)',
              color: item.isImprovement
                ? isLight ? '#166534' : '#4ADE80'
                : isLight ? '#991B1B' : '#F87171'
            }}
          >
            {item.isImprovement ? (
              <TrendingUp className="w-2.5 h-2.5 shrink-0" />
            ) : (
              <TrendingDown className="w-2.5 h-2.5 shrink-0" />
            )}
            <span>{item.deltaFormatted}</span>
          </span>
        )}
      </div>

      {/* 2. Main Row: Exact Data Point Value */}
      <div className="flex items-center space-x-1.5 pt-1">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{
            backgroundColor: themeTokens.cssVar,
            boxShadow: `0 0 6px ${themeTokens.fallback}`
          }}
        />
        <div className="flex items-baseline space-x-1">
          <span className="text-[10px] font-normal" style={{ color: 'var(--skanda-text-muted, #94A3B8)' }}>
            Value:
          </span>
          <span
            className="text-xs font-bold tracking-tight"
            style={{ color: 'var(--skanda-text-heading, #FFFFFF)' }}
          >
            {displayValue}
          </span>
          {unit && (
            <span className="text-[10px] font-normal" style={{ color: 'var(--skanda-text-muted, #94A3B8)' }}>
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* 3. Milestone Annotation (if present) */}
      {item.milestone && (
        <div
          className="text-[9px] truncate max-w-[150px] mt-1 pt-1 border-t"
          style={{
            color: 'var(--skanda-text-muted, #94A3B8)',
            borderColor: 'var(--skanda-border-subtle, #1B2639)'
          }}
        >
          {item.milestone}
        </div>
      )}
    </div>
  );
};

/**
 * Recharts-powered Sparkline component explicitly designed for SKANDA's
 * CommandCenterDashboard to visualize month-over-month performance improvements
 * across key compliance, control, risk, and audit readiness metrics.
 */
export const RechartsSparkline: React.FC<RechartsSparklineProps> = ({
  metricId,
  data,
  color,
  width = 56,
  height = 22,
  strokeWidth = 1.5,
  showArea = true,
  showEndDot = true,
  invertColor = false,
  unit = '%',
  showTooltip = true,
  title,
  className = '',
  trendDirection,
  isPositive,
  isLight
}) => {
  const gradientId = useId();

  // 1. Resolve dataset
  const chartData: MonthOverMonthDataPoint[] = React.useMemo(() => {
    // If metricId is provided, pull from calibrated MOM_COMPLIANCE_METRICS
    if (metricId && MOM_COMPLIANCE_METRICS[metricId]) {
      return MOM_COMPLIANCE_METRICS[metricId].history;
    }

    // If array of objects already conforming to MonthOverMonthDataPoint
    if (data && data.length > 0 && typeof data[0] === 'object' && 'value' in data[0]) {
      return data as MonthOverMonthDataPoint[];
    }

    // If array of raw numbers
    if (data && data.length > 0 && typeof data[0] === 'number') {
      const numbers = data as number[];
      const totalPoints = numbers.length;

      return numbers.map((val, idx) => {
        const prev = idx > 0 ? numbers[idx - 1] : undefined;
        const delta = prev !== undefined ? Number((val - prev).toFixed(1)) : undefined;
        const isImp = delta !== undefined ? (invertColor ? delta <= 0 : delta >= 0) : true;

        if (totalPoints > 6) {
          // High-frequency sample window (e.g. 20 points over 30 days ending today, 14 Sep 2026)
          const daysAgo = Math.round(((totalPoints - 1 - idx) / (totalPoints - 1 || 1)) * 30);
          const pointDate = new Date(2026, 8, 14); // Sep 14, 2026
          pointDate.setDate(pointDate.getDate() - daysAgo);

          const day = pointDate.getDate().toString().padStart(2, '0');
          const monthShort = pointDate.toLocaleDateString('en-US', { month: 'short' });
          const exactDateStr = `${day} ${monthShort} 2026`;

          return {
            month: monthShort,
            year: 2026,
            date: exactDateStr,
            fullDate: exactDateStr,
            value: val,
            previousValue: prev,
            delta,
            deltaFormatted: delta !== undefined ? `${delta > 0 ? '+' : ''}${delta}${unit}` : undefined,
            isImprovement: isImp
          };
        }

        // Standard 6-month progression ending in Sep 2026
        const month = MONTH_NAMES[idx] || `M${idx + 1}`;
        const defaultDates: Record<string, string> = {
          Apr: '30 Apr 2026',
          May: '31 May 2026',
          Jun: '30 Jun 2026',
          Jul: '31 Jul 2026',
          Aug: '31 Aug 2026',
          Sep: '14 Sep 2026'
        };
        const exactDateStr = defaultDates[month] || `${month} 2026`;

        return {
          month,
          year: 2026,
          date: exactDateStr,
          fullDate: exactDateStr,
          value: val,
          previousValue: prev,
          delta,
          deltaFormatted: delta !== undefined ? `${delta > 0 ? '+' : ''}${delta}${unit}` : undefined,
          isImprovement: isImp
        };
      });
    }

    // Fallback: standard 6-month progression
    return MOM_COMPLIANCE_METRICS.compliance_health.history;
  }, [metricId, data, invertColor, unit]);

  // 2. Resolve color theme
  const resolvedColor: SparklineColor = React.useMemo(() => {
    if (color) return color;
    if (metricId && MOM_COMPLIANCE_METRICS[metricId]) {
      return MOM_COMPLIANCE_METRICS[metricId].themeColor;
    }
    if (isPositive !== undefined) {
      return isPositive ? 'emerald' : 'rose';
    }
    if (trendDirection === 'down') {
      return invertColor ? 'emerald' : 'rose';
    }
    if (trendDirection === 'up') {
      return invertColor ? 'rose' : 'emerald';
    }
    return 'indigo';
  }, [color, metricId, isPositive, trendDirection, invertColor]);

  const themeTokens = COLOR_TOKENS[resolvedColor] || COLOR_TOKENS.indigo;

  // 3. Domain calculation with optical headroom
  const values = chartData.map(d => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;
  const yDomain: [number, number] = [
    Math.max(0, Number((minVal - range * 0.15).toFixed(1))),
    Number((maxVal + range * 0.15).toFixed(1))
  ];

  // 4. Last point for highlight dot
  const lastIndex = chartData.length - 1;
  const firstPoint = chartData[0];
  const lastPoint = chartData[lastIndex];
  const overallDelta = lastPoint && firstPoint ? Number((lastPoint.value - firstPoint.value).toFixed(1)) : 0;
  const defaultTitle = title || `MoM Trajectory: ${firstPoint?.value ?? ''} → ${lastPoint?.value ?? ''} (${overallDelta >= 0 ? '+' : ''}${overallDelta}${unit})`;

  return (
    <span
      className={`relative inline-flex items-center justify-center shrink-0 select-none overflow-visible ${className}`}
      style={{ width: `${width}px`, height: `${height}px`, minWidth: `${width}px` }}
      aria-label={defaultTitle}
      onMouseEnter={(e) => e.stopPropagation()}
      onMouseMove={(e) => e.stopPropagation()}
    >
      <AreaChart
        width={width}
        height={height}
        data={chartData}
        margin={{ top: 2, right: 3, bottom: 2, left: 3 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={themeTokens.cssVar} stopOpacity={0.35} />
            <stop offset="100%" stopColor={themeTokens.cssVar} stopOpacity={0.0} />
          </linearGradient>
        </defs>

        <YAxis hide domain={yDomain} />
        <XAxis dataKey="month" hide />

        {showTooltip && (
          <Tooltip
            isAnimationActive={false}
            allowEscapeViewBox={{ x: true, y: true }}
            wrapperStyle={{ zIndex: 99999, pointerEvents: 'none' }}
            cursor={{
              stroke: themeTokens.cssVar,
              strokeWidth: 1.5,
              strokeDasharray: '2 2',
              opacity: 0.65
            }}
            offset={10}
            content={
              <CustomSparklineTooltip
                unit={unit}
                themeTokens={themeTokens}
                isLight={isLight}
              />
            }
          />
        )}

        <Area
          type="monotone"
          dataKey="value"
          stroke={themeTokens.cssVar}
          strokeWidth={strokeWidth}
          fill={showArea ? `url(#${gradientId})` : 'transparent'}
          isAnimationActive={false}
          dot={(props: any) => {
            if (!showEndDot || props.index !== lastIndex) {
              return <circle key={props.key || `dot-${props.index}`} cx={0} cy={0} r={0} fill="none" />;
            }
            return (
              <circle
                key="last-point-dot"
                className="recharts-sparkline-dot"
                cx={props.cx}
                cy={props.cy}
                r={Math.max(2.2, strokeWidth * 1.4)}
                fill={themeTokens.cssVar}
                stroke="var(--skanda-bg-elevated, #0D1424)"
                strokeWidth={1.5}
              />
            );
          }}
          activeDot={{
            r: 3.5,
            stroke: 'var(--skanda-bg-elevated, #0D1424)',
            strokeWidth: 2,
            fill: themeTokens.cssVar
          }}
        />
      </AreaChart>
    </span>
  );
};

export default RechartsSparkline;
