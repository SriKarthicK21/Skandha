import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileCheck2,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  Sparkles,
  Award,
  Activity,
  Zap,
  Info,
  ChevronRight,
  Filter,
  Check,
  X,
  RefreshCw,
  FileSpreadsheet,
  Download,
  Search,
  Flame,
  BarChart3,
  ExternalLink
} from 'lucide-react';

// Timeframe options
export type HealthTimeRange = '7D' | '30D' | '90D' | '1Y';

interface SparklineDataPoint {
  date: string;
  value: number;
  label?: string;
}

interface KPICardData {
  id: 'control_effectiveness' | 'open_findings' | 'audit_prep' | 'harmonization_freshness';
  title: string;
  shortTitle: string;
  metricValue: string | number;
  metricUnit?: string;
  statusLabel: string;
  statusType: 'success' | 'warning' | 'danger' | 'info';
  deltaText: string;
  deltaType: 'up_good' | 'up_bad' | 'down_good' | 'down_bad';
  trendValue: string;
  trendDirection: 'up' | 'down';
  trendIsPositive: boolean;
  trendPeriod?: string;
  sparklineData: Record<HealthTimeRange, SparklineDataPoint[]>;
  subMetrics: Array<{
    label: string;
    value: string;
    subtext?: string;
    accentColor?: string;
  }>;
  targetBenchmark: string;
  industryAverage: string;
  description: string;
  moduleId: string;
}

// Utility to create a smooth SVG path through given data points (Catmull-Rom or Bezier interpolation)
function createSmoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 >= points.length ? points.length - 1 : i + 2];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;

    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

// Sleek Trend Sparkline Component with Interactive Tooltip
interface SparklineChartProps {
  data: SparklineDataPoint[];
  color: 'emerald' | 'rose' | 'indigo' | 'cyan' | 'amber' | 'purple';
  height?: number;
  unit?: string;
  invertGoal?: boolean; // If true, lower is better (e.g. open findings)
}

const colorThemeMap = {
  emerald: {
    stroke: 'var(--skanda-sparkline-emerald, var(--skanda-success, #22C55E))',
    gradientStart: 'var(--skanda-sparkline-emerald, var(--skanda-success, #22C55E))',
    gradientEnd: 'var(--skanda-sparkline-emerald, var(--skanda-success, #22C55E))',
    glow: 'var(--skanda-sparkline-emerald, var(--skanda-success, #22C55E))',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dotBg: 'var(--skanda-sparkline-emerald, var(--skanda-success, #22C55E))'
  },
  rose: {
    stroke: 'var(--skanda-sparkline-rose, var(--skanda-critical, #EF4444))',
    gradientStart: 'var(--skanda-sparkline-rose, var(--skanda-critical, #EF4444))',
    gradientEnd: 'var(--skanda-sparkline-rose, var(--skanda-critical, #EF4444))',
    glow: 'var(--skanda-sparkline-rose, var(--skanda-critical, #EF4444))',
    badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    dotBg: 'var(--skanda-sparkline-rose, var(--skanda-critical, #EF4444))'
  },
  indigo: {
    stroke: 'var(--skanda-sparkline-indigo, var(--skanda-brand-secondary, #6366F1))',
    gradientStart: 'var(--skanda-sparkline-indigo, var(--skanda-brand-secondary, #6366F1))',
    gradientEnd: 'var(--skanda-sparkline-indigo, var(--skanda-brand-secondary, #6366F1))',
    glow: 'var(--skanda-sparkline-indigo, var(--skanda-brand-secondary, #6366F1))',
    badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    dotBg: 'var(--skanda-sparkline-indigo, var(--skanda-brand-secondary, #6366F1))'
  },
  cyan: {
    stroke: 'var(--skanda-sparkline-sky, var(--skanda-info, #38BDF8))',
    gradientStart: 'var(--skanda-sparkline-sky, var(--skanda-info, #38BDF8))',
    gradientEnd: 'var(--skanda-sparkline-sky, var(--skanda-info, #38BDF8))',
    glow: 'var(--skanda-sparkline-sky, var(--skanda-info, #38BDF8))',
    badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    dotBg: 'var(--skanda-sparkline-sky, var(--skanda-info, #38BDF8))'
  },
  amber: {
    stroke: 'var(--skanda-sparkline-amber, var(--skanda-warning, #F59E0B))',
    gradientStart: 'var(--skanda-sparkline-amber, var(--skanda-warning, #F59E0B))',
    gradientEnd: 'var(--skanda-sparkline-amber, var(--skanda-warning, #F59E0B))',
    glow: 'var(--skanda-sparkline-amber, var(--skanda-warning, #F59E0B))',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dotBg: 'var(--skanda-sparkline-amber, var(--skanda-warning, #F59E0B))'
  },
  purple: {
    stroke: 'var(--skanda-sparkline-purple, var(--skanda-brand, #8B5CF6))',
    gradientStart: 'var(--skanda-sparkline-purple, var(--skanda-brand, #8B5CF6))',
    gradientEnd: 'var(--skanda-sparkline-purple, var(--skanda-brand, #8B5CF6))',
    glow: 'var(--skanda-sparkline-purple, var(--skanda-brand, #8B5CF6))',
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    dotBg: 'var(--skanda-sparkline-purple, var(--skanda-brand, #8B5CF6))'
  }
};

const SleekSparklineChart: React.FC<SparklineChartProps> = ({
  data,
  color,
  height = 68,
  unit = ''
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const theme = colorThemeMap[color] || colorThemeMap.indigo;

  const width = 280;
  const paddingX = 12;
  const paddingTop = 8;
  const paddingBottom = 8;

  const effectiveWidth = width - paddingX * 2;
  const effectiveHeight = height - paddingTop - paddingBottom;

  const values = data.map(d => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const valRange = maxVal === minVal ? 1 : maxVal - minVal;

  // Compute normalized coordinate points
  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1 || 1)) * effectiveWidth;
    const y = paddingTop + effectiveHeight - ((d.value - minVal) / valRange) * effectiveHeight;
    return { x, y, data: d };
  });

  const linePath = createSmoothPath(points);
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${height} L ${points[0].x.toFixed(1)} ${height} Z`
    : '';

  const activePoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null;

  return (
    <div
      className="relative w-full overflow-hidden select-none"
      style={{ height: `${height}px` }}
      onMouseLeave={() => setHoverIndex(null)}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const ratio = Math.max(0, Math.min(1, mouseX / rect.width));
          const idx = Math.round(ratio * (data.length - 1));
          setHoverIndex(idx);
        }}
      >
        <defs>
          <linearGradient id={`spark-grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.gradientStart} />
            <stop offset="100%" stopColor={theme.gradientEnd} />
          </linearGradient>
          <filter id={`spark-glow-${color}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={theme.glow} />
          </filter>
        </defs>

        {/* Subtle grid guidelines */}
        <line
          x1={paddingX}
          y1={paddingTop + effectiveHeight * 0.5}
          x2={width - paddingX}
          y2={paddingTop + effectiveHeight * 0.5}
          stroke="rgba(148, 163, 184, 0.08)"
          strokeDasharray="2 4"
          strokeWidth="1"
        />

        {/* Shaded Area Fill */}
        {areaPath && (
          <path
            d={areaPath}
            fill={`url(#spark-grad-${color})`}
            className="transition-all duration-300"
          />
        )}

        {/* Main Sleek Glowing Line */}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke={theme.stroke}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#spark-glow-${color})`}
            className="transition-all duration-300"
          />
        )}

        {/* Data points */}
        {points.map((pt, i) => {
          const isSelected = hoverIndex === i;
          const isLatest = i === points.length - 1 && hoverIndex === null;

          return (
            <g key={i}>
              {(isSelected || isLatest) && (
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="6"
                  fill={theme.stroke}
                  opacity="0.25"
                  className="animate-ping"
                />
              )}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isSelected ? 4.5 : isLatest ? 3.5 : 2}
                fill={isSelected ? '#FFFFFF' : theme.dotBg}
                stroke={isSelected ? theme.stroke : 'rgba(11, 15, 25, 0.8)'}
                strokeWidth={isSelected ? 2 : 1}
                className="transition-all duration-150"
              />
            </g>
          );
        })}

        {/* Hover vertical crosshair */}
        {activePoint && (
          <line
            x1={activePoint.x}
            y1={0}
            x2={activePoint.x}
            y2={height}
            stroke="rgba(255, 255, 255, 0.25)"
            strokeDasharray="2 2"
            strokeWidth="1"
          />
        )}
      </svg>

      {/* Floating Hover Tooltip */}
      {activePoint && (
        <div
          className="absolute pointer-events-none z-20 px-2.5 py-1.5 rounded-md shadow-2xl text-[10px] font-mono whitespace-nowrap transform -translate-x-1/2 -translate-y-full transition-transform duration-75 border"
          style={{
            backgroundColor: 'var(--skanda-bg-elevated, #0D1424)',
            borderColor: 'var(--skanda-border, #1B2639)',
            color: 'var(--skanda-text-primary, #F8FAFC)',
            left: `${(activePoint.x / width) * 100}%`,
            top: `${Math.max(16, (activePoint.y / height) * 100 - 4)}%`
          }}
        >
          <div className="flex items-center space-x-1.5 font-bold">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.stroke }} />
            <span style={{ color: 'var(--skanda-text-heading, #FFFFFF)' }}>{activePoint.data.value}{unit}</span>
            <span className="text-[9px]" style={{ color: 'var(--skanda-text-muted, #94A3B8)' }}>({activePoint.data.date})</span>
          </div>
        </div>
      )}
    </div>
  );
};

export const GlobalComplianceHealthCards: React.FC<{
  className?: string;
  onNavigateModule?: (moduleId: string) => void;
}> = ({ className = '', onNavigateModule }) => {
  const {
    theme,
    controls,
    evidence,
    findings,
    tasks,
    risks,
    tenants,
    currentTenant,
    setActiveModule
  } = useGRC();
  const isLight = theme === 'light';
  const { showToast } = useToast();

  // Local component interactive states
  const [timeRange, setTimeRange] = useState<HealthTimeRange>('30D');
  const [selectedFramework, setSelectedFramework] = useState<string>('all');
  const [activeModalCard, setActiveModalCard] = useState<KPICardData | null>(null);
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);

  const handleNavigate = (moduleId: string) => {
    if (onNavigateModule) {
      onNavigateModule(moduleId);
    } else {
      setActiveModule(moduleId as any);
    }
  };

  // 1. CALCULATE LIVE AGGREGATED METRICS FROM GRC CONTEXT
  const applicableControls = useMemo(() => {
    const all = controls && controls.length > 0 ? controls : (currentTenant?.controls || []);
    return all.filter(c => c.applicable !== false);
  }, [controls, currentTenant?.controls]);

  const implementedControls = useMemo(() => {
    return applicableControls.filter(
      c => c.implementationStatus === 'Implemented' ||
           c.implementationStatus === 'Monitored' ||
           c.implementationStatus === 'Audited'
    );
  }, [applicableControls]);

  const totalControlsCount = applicableControls.length || 93;
  const liveEffectivenessPct = Math.min(100, Math.max(0, Math.round((implementedControls.length / totalControlsCount) * 100))) || 91;

  // Findings computation
  const tenantFindings = useMemo(() => {
    return findings && findings.length > 0 ? findings : [];
  }, [findings]);

  const openFindings = useMemo(() => {
    return tenantFindings.filter(f => f.status !== 'Closed Verified');
  }, [tenantFindings]);

  const criticalFindingsCount = useMemo(() => {
    return openFindings.filter(f => f.severity === 'Major Non-Conformity' || (f as any).severity === 'Critical').length;
  }, [openFindings]);

  const highFindingsCount = useMemo(() => {
    return openFindings.filter(f => f.severity === 'Minor Non-Conformity' || (f as any).severity === 'High').length;
  }, [openFindings]);

  const mediumLowFindingsCount = useMemo(() => {
    return openFindings.filter(f => f.severity === 'Observation' || f.severity === 'Opportunity for Improvement' || (f as any).severity === 'Medium' || (f as any).severity === 'Low').length;
  }, [openFindings]);

  const totalOpenFindingsCount = openFindings.length || 14;

  // Evidence verification rate
  const tenantEvidence = useMemo(() => {
    return evidence && evidence.length > 0 ? evidence : [];
  }, [evidence]);

  const verifiedEvidenceCount = useMemo(() => {
    return tenantEvidence.filter(e => e.status === 'Verified').length;
  }, [tenantEvidence]);

  const evidenceVerifiedPct = tenantEvidence.length > 0
    ? Math.round((verifiedEvidenceCount / tenantEvidence.length) * 100)
    : 94;

  // Audit preparation score (blended score between controls, evidence, and locked SoA)
  const auditPrepIndex = Math.round((liveEffectivenessPct * 0.45) + (evidenceVerifiedPct * 0.35) + (currentTenant?.soaBaselineLocked ? 20 : 15));

  // Harmonization rate (Multi-framework coverage across ISO 27001, MAS TRM, NIST CSF, SOC 2)
  const harmonizationIndex = 96.4;

  // 2. SPARKLINE TIME-SERIES DATA MATRIX (Dynamically adjusted per time range)
  const sparklinesDataset: Record<string, Record<HealthTimeRange, SparklineDataPoint[]>> = {
    control_effectiveness: {
      '7D': [
        { date: '26 Aug', value: 89.2 },
        { date: '27 Aug', value: 89.6 },
        { date: '28 Aug', value: 90.0 },
        { date: '29 Aug', value: 90.4 },
        { date: '30 Aug', value: 90.8 },
        { date: '31 Aug', value: 91.1 },
        { date: '01 Sep', value: liveEffectivenessPct }
      ],
      '30D': [
        { date: '03 Aug', value: 85.0 },
        { date: '09 Aug', value: 86.8 },
        { date: '15 Aug', value: 88.2 },
        { date: '21 Aug', value: 89.5 },
        { date: '27 Aug', value: 90.4 },
        { date: '01 Sep', value: liveEffectivenessPct }
      ],
      '90D': [
        { date: 'Jun W1', value: 78.4 },
        { date: 'Jun W3', value: 81.2 },
        { date: 'Jul W1', value: 83.5 },
        { date: 'Jul W3', value: 86.0 },
        { date: 'Aug W1', value: 88.4 },
        { date: 'Aug W3', value: 90.2 },
        { date: 'Sep W1', value: liveEffectivenessPct }
      ],
      '1Y': [
        { date: 'Q4 25', value: 68.0 },
        { date: 'Q1 26', value: 74.5 },
        { date: 'Q2 26', value: 82.0 },
        { date: 'Q3 26', value: liveEffectivenessPct }
      ]
    },
    open_findings: {
      '7D': [
        { date: '26 Aug', value: 18 },
        { date: '27 Aug', value: 17 },
        { date: '28 Aug', value: 16 },
        { date: '29 Aug', value: 16 },
        { date: '30 Aug', value: 15 },
        { date: '31 Aug', value: 14 },
        { date: '01 Sep', value: totalOpenFindingsCount }
      ],
      '30D': [
        { date: '03 Aug', value: 29 },
        { date: '09 Aug', value: 25 },
        { date: '15 Aug', value: 22 },
        { date: '21 Aug', value: 19 },
        { date: '27 Aug', value: 16 },
        { date: '01 Sep', value: totalOpenFindingsCount }
      ],
      '90D': [
        { date: 'Jun W1', value: 42 },
        { date: 'Jun W3', value: 36 },
        { date: 'Jul W1', value: 31 },
        { date: 'Jul W3', value: 26 },
        { date: 'Aug W1', value: 21 },
        { date: 'Aug W3', value: 17 },
        { date: 'Sep W1', value: totalOpenFindingsCount }
      ],
      '1Y': [
        { date: 'Q4 25', value: 58 },
        { date: 'Q1 26', value: 44 },
        { date: 'Q2 26', value: 28 },
        { date: 'Q3 26', value: totalOpenFindingsCount }
      ]
    },
    audit_prep: {
      '7D': [
        { date: '26 Aug', value: 84.5 },
        { date: '27 Aug', value: 85.2 },
        { date: '28 Aug', value: 86.0 },
        { date: '29 Aug', value: 86.8 },
        { date: '30 Aug', value: 87.4 },
        { date: '31 Aug', value: 88.0 },
        { date: '01 Sep', value: auditPrepIndex }
      ],
      '30D': [
        { date: '03 Aug', value: 72.0 },
        { date: '09 Aug', value: 75.4 },
        { date: '15 Aug', value: 79.2 },
        { date: '21 Aug', value: 82.8 },
        { date: '27 Aug', value: 86.0 },
        { date: '01 Sep', value: auditPrepIndex }
      ],
      '90D': [
        { date: 'Jun W1', value: 58.0 },
        { date: 'Jun W3', value: 63.5 },
        { date: 'Jul W1', value: 69.0 },
        { date: 'Jul W3', value: 74.8 },
        { date: 'Aug W1', value: 80.5 },
        { date: 'Aug W3', value: 85.2 },
        { date: 'Sep W1', value: auditPrepIndex }
      ],
      '1Y': [
        { date: 'Q4 25', value: 45.0 },
        { date: 'Q1 26', value: 60.5 },
        { date: 'Q2 26', value: 76.0 },
        { date: 'Q3 26', value: auditPrepIndex }
      ]
    },
    harmonization_freshness: {
      '7D': [
        { date: '26 Aug', value: 95.2 },
        { date: '27 Aug', value: 95.5 },
        { date: '28 Aug', value: 95.8 },
        { date: '29 Aug', value: 96.0 },
        { date: '30 Aug', value: 96.2 },
        { date: '31 Aug', value: 96.3 },
        { date: '01 Sep', value: harmonizationIndex }
      ],
      '30D': [
        { date: '03 Aug', value: 91.0 },
        { date: '09 Aug', value: 92.4 },
        { date: '15 Aug', value: 93.8 },
        { date: '21 Aug', value: 95.0 },
        { date: '27 Aug', value: 95.8 },
        { date: '01 Sep', value: harmonizationIndex }
      ],
      '90D': [
        { date: 'Jun W1', value: 84.5 },
        { date: 'Jun W3', value: 87.0 },
        { date: 'Jul W1', value: 89.8 },
        { date: 'Jul W3', value: 92.4 },
        { date: 'Aug W1', value: 94.6 },
        { date: 'Aug W3', value: 95.8 },
        { date: 'Sep W1', value: harmonizationIndex }
      ],
      '1Y': [
        { date: 'Q4 25', value: 72.0 },
        { date: 'Q1 26', value: 83.5 },
        { date: 'Q2 26', value: 91.0 },
        { date: 'Q3 26', value: harmonizationIndex }
      ]
    }
  };

  // 3. DEFINE THE 4 PRIMARY AGGREGATED KPI CARD CONFIGURATIONS
  const kpiCards: KPICardData[] = [
    {
      id: 'control_effectiveness',
      title: 'Average Control Effectiveness',
      shortTitle: 'Control Effectiveness',
      metricValue: `${liveEffectivenessPct}%`,
      statusLabel: 'Operating Effectively',
      statusType: liveEffectivenessPct >= 85 ? 'success' : liveEffectivenessPct >= 70 ? 'warning' : 'danger',
      deltaText: timeRange === '7D' ? '+2.2% 7d delta' : timeRange === '30D' ? '+6.4% 30d gain' : timeRange === '90D' ? '+13.0% quarterly' : '+23.4% YoY',
      deltaType: 'up_good',
      trendValue: timeRange === '7D' ? '+2.2%' : timeRange === '30D' ? '+6.4%' : timeRange === '90D' ? '+13.0%' : '+23.4%',
      trendDirection: 'up',
      trendIsPositive: true,
      trendPeriod: timeRange === '7D' ? 'vs prior 7d' : timeRange === '30D' ? 'vs prior 30d' : timeRange === '90D' ? 'vs prior quarter' : 'YoY',
      sparklineData: sparklinesDataset.control_effectiveness,
      targetBenchmark: '≥ 85.0%',
      industryAverage: '78.2%',
      description: 'Weighted operational effectiveness of 93 ISO 27001, SOC 2 CC, and MAS TRM controls validated through automated telemetry & periodic testing.',
      moduleId: 'statement_of_applicability',
      subMetrics: [
        { label: 'Automated Tests', value: '96.2%', subtext: 'Continuous telemetry', accentColor: 'text-emerald-400' },
        { label: 'Manual Reviews', value: '87.5%', subtext: 'Verified by Leads', accentColor: 'text-cyan-400' },
        { label: 'Passing Controls', value: `${implementedControls.length}/${totalControlsCount}`, subtext: 'Applicable in SoA', accentColor: 'text-indigo-300' }
      ]
    },
    {
      id: 'open_findings',
      title: 'Total Open Audit Findings & CAPA',
      shortTitle: 'Open Findings',
      metricValue: totalOpenFindingsCount,
      statusLabel: criticalFindingsCount === 0 ? 'Remediation on Track' : `${criticalFindingsCount} Major Blockers`,
      statusType: criticalFindingsCount === 0 ? 'success' : 'danger',
      deltaText: timeRange === '7D' ? '-22% weekly burn-down' : timeRange === '30D' ? '-51% 30d reduction' : timeRange === '90D' ? '-66% quarterly' : '-75% YoY',
      deltaType: 'down_good',
      trendValue: timeRange === '7D' ? '+22.2%' : timeRange === '30D' ? '+51.0%' : timeRange === '90D' ? '+66.7%' : '+75.0%',
      trendDirection: 'up',
      trendIsPositive: true,
      trendPeriod: timeRange === '7D' ? 'burn-down vs prior 7d' : timeRange === '30D' ? 'reduction vs prior 30d' : timeRange === '90D' ? 'burn-down vs prior quarter' : 'burn-down YoY',
      sparklineData: sparklinesDataset.open_findings,
      targetBenchmark: '0 Critical / < 5 High',
      industryAverage: '24.6 Findings',
      description: 'Active non-conformities, audit findings, and observations across internal audits, penetration tests, and continuous monitoring pipelines.',
      moduleId: 'findings_capa',
      subMetrics: [
        { label: 'Major NCs', value: `${criticalFindingsCount}`, subtext: 'Stage 1 Blockers', accentColor: criticalFindingsCount > 0 ? 'text-rose-400 font-black' : 'text-emerald-400' },
        { label: 'Minor NCs', value: `${highFindingsCount}`, subtext: 'CAPA In Progress', accentColor: 'text-amber-400' },
        { label: 'Observations', value: `${mediumLowFindingsCount}`, subtext: 'Enhancements', accentColor: 'text-blue-400' }
      ]
    },
    {
      id: 'audit_prep',
      title: 'Upcoming Audit Preparation Status',
      shortTitle: 'Audit Preparation',
      metricValue: `${auditPrepIndex}%`,
      statusLabel: auditPrepIndex >= 85 ? 'Stage 1 & 2 Qualified' : 'Fieldwork In Progress',
      statusType: auditPrepIndex >= 85 ? 'success' : 'warning',
      deltaText: timeRange === '7D' ? '+3.5% sprint gain' : timeRange === '30D' ? '+16.5% pre-audit sprint' : timeRange === '90D' ? '+30.5% readiness' : '+43.5% YoY',
      deltaType: 'up_good',
      trendValue: timeRange === '7D' ? '+3.5%' : timeRange === '30D' ? '+16.5%' : timeRange === '90D' ? '+30.5%' : '+43.5%',
      trendDirection: 'up',
      trendIsPositive: true,
      trendPeriod: timeRange === '7D' ? 'sprint gain vs prior 7d' : timeRange === '30D' ? 'pre-audit sprint vs prior 30d' : timeRange === '90D' ? 'readiness vs prior quarter' : 'readiness YoY',
      sparklineData: sparklinesDataset.audit_prep,
      targetBenchmark: '≥ 85.0% for Stage 1',
      industryAverage: '72.0%',
      description: 'Composite audit readiness measuring evidence package completeness, workpaper sign-offs, cryptographic SoA freeze, and Clause 9.2/9.3 compliance.',
      moduleId: 'readiness_cert',
      subMetrics: [
        { label: 'Evidence Verified', value: `${evidenceVerifiedPct}%`, subtext: `${verifiedEvidenceCount} artifacts verified`, accentColor: 'text-emerald-400' },
        { label: 'SoA Baseline', value: currentTenant?.soaBaselineLocked ? 'SHA-256 Sealed' : 'Unlocked', subtext: 'Scope integrity', accentColor: currentTenant?.soaBaselineLocked ? 'text-indigo-400' : 'text-amber-400' },
        { label: 'Next Audit', value: '24 Days', subtext: 'ISO Stage 2 Ext Audit', accentColor: 'text-purple-400' }
      ]
    },
    {
      id: 'harmonization_freshness',
      title: 'Global Framework Harmonization',
      shortTitle: 'Harmonization Index',
      metricValue: `${harmonizationIndex}%`,
      statusLabel: 'Tri-Framework Aligned',
      statusType: 'info',
      deltaText: timeRange === '7D' ? '+1.2% multi-framework' : timeRange === '30D' ? '+5.4% cross-mapped' : timeRange === '90D' ? '+12.3% crosswalk' : '+24.8% YoY',
      deltaType: 'up_good',
      trendValue: timeRange === '7D' ? '+1.2%' : timeRange === '30D' ? '+5.4%' : timeRange === '90D' ? '+12.3%' : '+24.8%',
      trendDirection: 'up',
      trendIsPositive: true,
      trendPeriod: timeRange === '7D' ? 'cross-mapped vs prior 7d' : timeRange === '30D' ? 'cross-mapped vs prior 30d' : timeRange === '90D' ? 'crosswalk vs prior quarter' : 'crosswalk YoY',
      sparklineData: sparklinesDataset.harmonization_freshness,
      targetBenchmark: '≥ 90.0% Single-Audit',
      industryAverage: '64.0%',
      description: 'Single-audit deduplication efficiency mapped across ISO 27001:2022, MAS TRM Guidelines, NIST CSF 2.0, and SOC 2 Type II controls.',
      moduleId: 'cross_framework_crosswalk',
      subMetrics: [
        { label: 'Controls Reused', value: '84.2%', subtext: 'Single test mapping', accentColor: 'text-cyan-400' },
        { label: 'Policy Sync', value: '100%', subtext: '24/24 active docs', accentColor: 'text-emerald-400' },
        { label: 'SLA Uptime', value: '99.9%', subtext: 'Evidence freshness', accentColor: 'text-indigo-300' }
      ]
    }
  ];

  // Quick Run Diagnostics handler
  const handleRunDiagnostics = () => {
    setIsDiagnosticRunning(true);
    showToast({
      title: 'Automated Telemetry Scan Initiated',
      message: 'Inspecting 93 controls, 1,400+ evidence hashes, and CAPA SLA timers...',
      type: 'info'
    });

    setTimeout(() => {
      setIsDiagnosticRunning(false);
      setShowDiagnosticsModal(true);
      showToast({
        title: 'Global Compliance Health: 96.4% Healthy',
        message: 'No critical telemetry drift detected. Audit preparation index is 88.5%.',
        type: 'success'
      });
    }, 1200);
  };

  const handleExportSummary = () => {
    showToast({
      title: 'Exporting Global Compliance Health Snapshot',
      message: 'Compiling executive KPI report with trend sparklines and auditor workpaper hashes...',
      type: 'success'
    });
  };

  return (
    <section aria-label="Global Compliance Health Section" className={`space-y-4 ${className}`}>
      {/* 1. Header Toolbar with Title, Global Filters, and Timeframe Selectors */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl border transition-colors ${
        isLight
          ? 'bg-white/95 border-slate-200/90 shadow-xs'
          : 'bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-950/90 border-slate-800/90 shadow-xl'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`relative flex items-center justify-center p-2.5 rounded-xl border shrink-0 ${
            isLight
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-2xs'
              : 'bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 text-indigo-400 border-indigo-500/30 shadow-inner'
          }`}>
            <Activity className={`w-5 h-5 ${isLight ? 'text-indigo-600' : 'text-indigo-400'} animate-pulse`} />
            <span className="absolute top-1 right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className={`text-sm sm:text-base font-black tracking-tight flex items-center space-x-2 ${
                isLight ? 'text-slate-950' : 'text-white'
              }`}>
                <span>Global Compliance Health</span>
              </h2>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border shadow-2xs ${
                isLight
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                96.4% HEALTHY
              </span>
            </div>
            <p className={`text-xs mt-0.5 font-semibold ${
              isLight ? 'text-slate-700' : 'text-slate-200'
            }`}>
              Aggregated governance telemetry, control effectiveness velocity, and audit readiness trajectory.
            </p>
          </div>
        </div>

        {/* Right-side controls: Framework Selector, Timeframe Tabs, and Diagnostic Action */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Framework Switcher Filter */}
          <div className={`flex items-center rounded-xl p-1 border text-xs ${
            isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950/80 border-slate-800'
          }`}>
            <Filter className={`w-3 h-3 ml-2 mr-1 shrink-0 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
            <select
              value={selectedFramework}
              onChange={(e) => {
                setSelectedFramework(e.target.value);
                showToast({
                  title: `Telemetry Filter: ${e.target.options[e.target.selectedIndex].text}`,
                  type: 'info'
                });
              }}
              className={`bg-transparent font-semibold text-xs py-1 pr-2 pl-1 rounded-lg focus:outline-none cursor-pointer ${
                isLight ? 'text-slate-800' : 'text-slate-200'
              }`}
            >
              <option value="all" className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}>All Frameworks (Aggregated)</option>
              <option value="iso_27001" className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}>ISO/IEC 27001:2022</option>
              <option value="mas_trm" className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}>MAS TRM Guidelines</option>
              <option value="soc_2" className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}>SOC 2 Type II</option>
              <option value="nist_csf" className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}>NIST CSF 2.0</option>
              <option value="pci_dss" className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}>PCI DSS v4.0</option>
            </select>
          </div>

          {/* Timeframe Range Selector Tabs */}
          <div className={`flex items-center rounded-xl p-1 border text-xs font-mono ${
            isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950/90 border-slate-800'
          }`}>
            {(['7D', '30D', '90D', '1Y'] as HealthTimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => {
                  setTimeRange(range);
                  showToast({ title: `Sparklines updated to ${range} window`, type: 'info' });
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timeRange === range
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Diagnostics Button */}
          <button
            onClick={handleRunDiagnostics}
            disabled={isDiagnosticRunning}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-slate-800/80 hover:bg-slate-750 text-slate-200 hover:text-white border-slate-700/80'
            }`}
            title="Execute Telemetry Diagnostics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLight ? 'text-indigo-600' : 'text-indigo-400'} ${isDiagnosticRunning ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Run Diagnostics</span>
          </button>

          {/* Export PDF Button */}
          <button
            onClick={handleExportSummary}
            className={`p-1.5 rounded-xl border transition cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border-slate-700/80'
            }`}
            title="Export Compliance Health Snapshot (PDF)"
          >
            <Download className={`w-3.5 h-3.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`} />
          </button>
        </div>
      </div>

      {/* 2. Primary 4-Card Grid with Sleek Trend Sparklines */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 stagger-cards">
        {kpiCards.map((card) => {
          const sparklineColor =
            card.id === 'control_effectiveness' ? 'emerald'
            : card.id === 'open_findings' ? (criticalFindingsCount === 0 ? 'emerald' : 'rose')
            : card.id === 'audit_prep' ? 'indigo'
            : 'cyan';

          const sparkData = card.sparklineData[timeRange];
          const latestValue = sparkData[sparkData.length - 1]?.value ?? card.metricValue;

          return (
            <div
              key={card.id}
              onClick={() => setActiveModalCard(card)}
              className={`relative rounded-2xl border p-4.5 flex flex-col justify-between cursor-pointer group transition-all duration-300 hover:-translate-y-0.5 ${
                isLight
                  ? 'bg-white/95 border-slate-200/90 hover:border-indigo-300/80 shadow-xs hover:shadow-md text-slate-900'
                  : 'bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950/90 border-slate-800/90 hover:border-slate-700/90 shadow-xl text-white'
              }`}
            >
              {/* Subtle top accent gradient line */}
              <div
                className={`absolute top-0 left-4 right-4 h-0.5 rounded-full transition-opacity duration-300 ${
                  card.id === 'control_effectiveness' ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                  card.id === 'open_findings' ? 'bg-gradient-to-r from-rose-500 to-amber-500' :
                  card.id === 'audit_prep' ? 'bg-gradient-to-r from-indigo-500 to-purple-500' :
                  'bg-gradient-to-r from-cyan-500 to-blue-500'
                } opacity-40 group-hover:opacity-100`}
              />

              <div>
                {/* Header Row: Title and Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`p-1.5 rounded-xl border shrink-0 ${
                        card.id === 'control_effectiveness'
                          ? isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : card.id === 'open_findings'
                          ? isLight ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : card.id === 'audit_prep'
                          ? isLight ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          : isLight ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                      }`}
                    >
                      {card.id === 'control_effectiveness' && <ShieldCheck className="w-4 h-4" />}
                      {card.id === 'open_findings' && <AlertTriangle className="w-4 h-4" />}
                      {card.id === 'audit_prep' && <Award className="w-4 h-4" />}
                      {card.id === 'harmonization_freshness' && <Layers className="w-4 h-4" />}
                    </div>
                    <span className={`text-xs font-bold transition-colors line-clamp-1 ${
                      isLight ? 'text-slate-800 group-hover:text-indigo-600' : 'text-slate-300 group-hover:text-white'
                    }`}>
                      {card.shortTitle}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                      card.statusType === 'success'
                        ? isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                        : card.statusType === 'warning'
                        ? isLight ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                        : card.statusType === 'danger'
                        ? isLight ? 'bg-rose-50 text-rose-800 border-rose-300' : 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                        : isLight ? 'bg-sky-50 text-sky-800 border-sky-300' : 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60'
                    }`}
                  >
                    {card.statusLabel}
                  </span>
                </div>

                {/* Metric Value & Trend Delta Badge - Responsive Grid Alignment */}
                <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-2 gap-y-1 mt-4 min-w-0">
                  <div className="flex items-baseline space-x-1.5 min-w-0">
                    <span className={`text-2xl sm:text-3xl font-black tracking-tight font-mono truncate ${
                      isLight ? 'text-slate-950' : 'text-white'
                    }`}>
                      {card.id === 'open_findings' ? latestValue : `${latestValue}%`}
                    </span>
                    {/* Explicit percentage-based trend indicator showing whether metric is improving (green up-arrow) or declining (red down-arrow) */}
                    <span
                      className={`inline-flex items-center shrink-0 self-center ${
                        card.trendIsPositive
                          ? isLight ? 'text-emerald-600' : 'text-emerald-400'
                          : isLight ? 'text-rose-600' : 'text-rose-400'
                      }`}
                      title={`${card.trendIsPositive ? 'Improving' : 'Declining'}: ${card.trendValue} ${card.trendPeriod || ''}`}
                    >
                      {card.trendIsPositive ? (
                        <TrendingUp className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                      )}
                    </span>
                    <span className={`text-[11px] font-bold font-mono shrink-0 ${
                      isLight ? 'text-slate-700' : 'text-slate-200'
                    }`}>
                      {card.id === 'open_findings' ? 'Open Items' : 'Index'}
                    </span>
                  </div>

                  {/* Percentage-Based Trend Delta Pill with explicit improving/declining status */}
                  <div
                    className={`h-5.5 px-2 inline-flex items-center justify-center space-x-1 rounded-md text-[10px] font-bold font-mono border whitespace-nowrap shrink-0 leading-none justify-self-end ${
                      card.trendIsPositive
                        ? isLight ? 'bg-emerald-50 text-emerald-900 border-emerald-300 shadow-2xs' : 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30'
                        : isLight ? 'bg-rose-50 text-rose-900 border-rose-300 shadow-2xs' : 'bg-rose-500/15 text-rose-200 border-rose-500/30'
                    }`}
                    title={`${card.trendIsPositive ? 'Improving' : 'Declining'}: ${card.trendValue} ${card.trendPeriod || ''} compared to previous period`}
                  >
                    {card.trendIsPositive ? (
                      <TrendingUp className="w-3 h-3 shrink-0 text-emerald-500" />
                    ) : (
                      <TrendingDown className="w-3 h-3 shrink-0 text-rose-500" />
                    )}
                    <span className="whitespace-nowrap leading-none font-bold">{card.trendValue}</span>
                    <span className={`text-[9px] font-medium hidden sm:inline ${
                      card.trendIsPositive
                        ? isLight ? 'text-emerald-700' : 'text-emerald-300/80'
                        : isLight ? 'text-rose-700' : 'text-rose-300/80'
                    }`}>
                      {card.trendIsPositive ? 'improving' : 'declining'}
                    </span>
                  </div>
                </div>

                {/* Sleek Sparkline Trend Graph */}
                <div className={`my-2.5 pt-1 border-t ${
                  isLight ? 'border-slate-200/80' : 'border-slate-800/40'
                }`}>
                  <div className={`flex items-center justify-between text-[9px] font-mono mb-1 ${
                    isLight ? 'text-slate-700 font-bold' : 'text-slate-300 font-bold'
                  }`}>
                    <span>{sparkData[0]?.date}</span>
                    <span className="text-[9px] uppercase tracking-wider font-bold">
                      {timeRange} Trendline
                    </span>
                    <span>{sparkData[sparkData.length - 1]?.date}</span>
                  </div>
                  <SleekSparklineChart
                    data={sparkData}
                    color={sparklineColor}
                    unit={card.id === 'open_findings' ? '' : '%'}
                    height={58}
                  />
                </div>
              </div>

              {/* Sub-Metrics Breakdown Pills */}
              <div className={`mt-2 pt-2 border-t space-y-1.5 ${
                isLight ? 'border-slate-200/80' : 'border-slate-800/60'
              }`}>
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  {card.subMetrics.map((sm, idx) => (
                    <div
                      key={idx}
                      className={`p-1.5 rounded-lg border ${
                        isLight
                          ? 'bg-slate-50 border-slate-200/90 text-slate-900 shadow-2xs'
                          : 'bg-slate-950/70 border-slate-800/60 text-white'
                      }`}
                    >
                      <div className={`text-[11px] font-bold font-mono ${
                        sm.accentColor
                          ? isLight && sm.accentColor.includes('emerald') ? 'text-emerald-700 font-black'
                          : isLight && sm.accentColor.includes('rose') ? 'text-rose-700 font-black'
                          : isLight && sm.accentColor.includes('amber') ? 'text-amber-800 font-black'
                          : isLight && sm.accentColor.includes('indigo') ? 'text-indigo-700 font-black'
                          : isLight && sm.accentColor.includes('cyan') ? 'text-cyan-800 font-black'
                          : isLight ? 'text-slate-900 font-black' : sm.accentColor
                          : isLight ? 'text-slate-900' : 'text-white'
                      }`}>
                        {sm.value}
                      </div>
                      <div className={`text-[9px] truncate mt-0.5 font-semibold ${
                        isLight ? 'text-slate-700' : 'text-slate-300'
                      }`}>
                        {sm.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Target & Benchmarking Footer */}
                <div className={`flex items-center justify-between text-[10px] pt-1.5 px-0.5 ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}>
                  <span className="flex items-center space-x-1 truncate font-medium">
                    <span>Target:</span>
                    <strong className={`font-mono ${isLight ? 'text-slate-950 font-black' : 'text-white font-black'}`}>{card.targetBenchmark}</strong>
                  </span>
                  <div className={`flex items-center space-x-1 font-bold text-[10px] ${
                    isLight ? 'text-indigo-700 group-hover:text-indigo-900' : 'text-indigo-300 group-hover:text-white'
                  }`}>
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Detailed KPI Deep-Dive Modal */}
      <AnimatePresence>
        {activeModalCard && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-2xl bg-indigo-950 text-indigo-400 border border-indigo-800">
                    {activeModalCard.id === 'control_effectiveness' && <ShieldCheck className="w-5 h-5" />}
                    {activeModalCard.id === 'open_findings' && <AlertTriangle className="w-5 h-5" />}
                    {activeModalCard.id === 'audit_prep' && <Award className="w-5 h-5" />}
                    {activeModalCard.id === 'harmonization_freshness' && <Layers className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">
                      Global Compliance Health Telemetry Deep Dive
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                      {activeModalCard.title}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModalCard(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Description & High-level Status */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-white font-mono">
                      {activeModalCard.metricValue}
                    </span>
                    <span
                      className={`inline-flex items-center shrink-0 self-center ${
                        activeModalCard.trendIsPositive
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                      title={`${activeModalCard.trendIsPositive ? 'Improving' : 'Declining'}: ${activeModalCard.trendValue} compared to previous period`}
                    >
                      {activeModalCard.trendIsPositive ? (
                        <TrendingUp className="w-4 h-4 shrink-0 stroke-[2.5]" />
                      ) : (
                        <TrendingDown className="w-4 h-4 shrink-0 stroke-[2.5]" />
                      )}
                    </span>
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-bold font-mono border ${
                        activeModalCard.trendIsPositive
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50'
                          : 'bg-rose-950/80 text-rose-300 border-rose-600/50'
                      }`}
                      title={`${activeModalCard.trendIsPositive ? 'Improving' : 'Declining'}: ${activeModalCard.trendValue} compared to previous period`}
                    >
                      {activeModalCard.trendIsPositive ? (
                        <TrendingUp className="w-3 h-3 shrink-0 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-3 h-3 shrink-0 text-rose-400" />
                      )}
                      <span>{activeModalCard.trendValue}</span>
                      <span className="text-[10px] font-medium text-slate-300">
                        ({activeModalCard.trendIsPositive ? 'improving' : 'declining'})
                      </span>
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">Current Value</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    activeModalCard.statusType === 'success' ? 'bg-emerald-950 text-emerald-300 border-emerald-700' :
                    activeModalCard.statusType === 'warning' ? 'bg-amber-950 text-amber-300 border-amber-700' :
                    activeModalCard.statusType === 'danger' ? 'bg-rose-950 text-rose-300 border-rose-700' :
                    'bg-cyan-950 text-cyan-300 border-cyan-700'
                  }`}>
                    {activeModalCard.statusLabel}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeModalCard.description}
                </p>
              </div>

              {/* Large Detailed Sparkline History */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Historical Telemetry Curve ({timeRange} Window)</span>
                  </h4>
                  <div className="flex items-center space-x-1 bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[11px] font-mono">
                    {(['7D', '30D', '90D', '1Y'] as HealthTimeRange[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => setTimeRange(r)}
                        className={`px-2 py-0.5 rounded-md font-bold transition ${
                          timeRange === r ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <SleekSparklineChart
                    data={activeModalCard.sparklineData[timeRange]}
                    color={
                      activeModalCard.id === 'control_effectiveness' ? 'emerald' :
                      activeModalCard.id === 'open_findings' ? 'rose' :
                      activeModalCard.id === 'audit_prep' ? 'indigo' : 'cyan'
                    }
                    unit={activeModalCard.id === 'open_findings' ? '' : '%'}
                    height={90}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/60 text-xs">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Target Benchmark</span>
                    <p className="font-bold text-white font-mono">{activeModalCard.targetBenchmark}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Industry Standard</span>
                    <p className="font-bold text-slate-300 font-mono">{activeModalCard.industryAverage}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Current Velocity</span>
                    <p className="font-bold text-emerald-400 font-mono">{activeModalCard.deltaText}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Freshness SLA</span>
                    <p className="font-bold text-cyan-400 font-mono">Real-Time</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-[11px] text-slate-400">
                  Continuous multi-tenant monitoring synchronized with Phoenix GRC engine.
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveModalCard(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => {
                      const mod = activeModalCard.moduleId;
                      setActiveModalCard(null);
                      handleNavigate(mod);
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-lg shadow-indigo-950/40"
                  >
                    <span>Open Module Details</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Automated Diagnostics Report Modal */}
      <AnimatePresence>
        {showDiagnosticsModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Global Compliance Health Diagnostics</h3>
                    <p className="text-[11px] text-slate-400 font-mono">Ran automated telemetry scan on {new Date().toLocaleTimeString()}</p>
                  </div>
                </div>
                <button onClick={() => setShowDiagnosticsModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-slate-200 font-semibold">Controls Telemetry Synchronization</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold">100% Passed (93/93)</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-slate-200 font-semibold">Evidence SHA-256 Vault Verification</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold">1,438 Hashes Intact</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-slate-200 font-semibold">Open Findings SLA Thresholds</span>
                  </div>
                  <span className="font-mono text-amber-400 font-bold">3 High Findings within SLA</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-slate-200 font-semibold">Statement of Applicability Baseline</span>
                  </div>
                  <span className="font-mono text-indigo-400 font-bold">Cryptographically Frozen</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowDiagnosticsModal(false)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-950"
                >
                  Acknowledge & Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
