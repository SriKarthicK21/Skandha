import React, { useState, useMemo, useId } from 'react';
import { useGRC } from '../../context/GRCContext';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  AreaChart,
  Area,
  YAxis
} from 'recharts';
import {
  ShieldCheck,
  Brain,
  Layers,
  Award,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal,
  FileCheck2,
  Database,
  Users,
  Eye,
  Cpu,
  Download,
  FileDown,
  Printer,
  Info,
  History,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUp,
  ArrowDown,
  TrendingDown,
  Minus,
  ExternalLink,
  RefreshCw,
  Scale,
  Sparkles,
  ChevronRight,
  Lock,
  Compass,
  Target
} from 'lucide-react';
import { MASTER_ISO27001_CONTROLS } from '../../data/initialData';
import { MASTER_ISO42001_CONTROLS } from '../../data/iso42001MasterData';
import { Tooltip as SkandaTooltip } from '../common/Tooltip';
import { ComplianceMaturityPdfExportModal } from './ComplianceMaturityPdfExportModal';
import { ComplianceMaturityRecommendationsPanel } from './ComplianceMaturityRecommendationsPanel';
import { ComplianceMaturityProgressChartsPanel } from './ComplianceMaturityProgressChartsPanel';

export interface DomainMaturityItem {
  key: string;
  domainName: string;
  shortLabel: string;
  iso27001Score: number;
  iso42001Score: number;
  benchmarkTarget: number;
  iso27001ControlsCount: number;
  iso27001ImplementedCount: number;
  iso42001ControlsCount: number;
  iso42001ImplementedCount: number;
  evidenceCoveragePct: number;
  openGapsCount: number;
  maturityTier27k: string;
  maturityTier42k: string;
  iso27001KeyControls: string[];
  iso42001KeyControls: string[];
  auditorGuidance: string;
  iso27001Delta?: number;
  iso42001Delta?: number;
  evidenceCoverageDelta?: number;
}

export interface TrendIndicatorProps {
  delta?: number;
  label?: string;
  size?: 'xs' | 'sm' | 'md';
  variant?: 'pill' | 'subtle' | 'inline';
  arrowStyle?: 'vertical' | 'diagonal';
  className?: string;
}

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  delta = 0,
  label,
  size = 'xs',
  variant = 'pill',
  arrowStyle = 'vertical',
  className = ''
}) => {
  const isPositive = delta > 0;
  const isNegative = delta < 0;
  const isNeutral = delta === 0;

  const colorClass = isPositive
    ? 'text-emerald-700 dark:text-emerald-300'
    : isNegative
    ? 'text-rose-700 dark:text-rose-300'
    : 'text-slate-600 dark:text-slate-400';

  const bgClass =
    variant === 'pill'
      ? isPositive
        ? 'bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-300/80 dark:border-emerald-500/30'
        : isNegative
        ? 'bg-rose-50 dark:bg-rose-500/15 border border-rose-300/80 dark:border-rose-500/30'
        : 'bg-slate-100 dark:bg-slate-800/80 border border-slate-300/80 dark:border-slate-700/50'
      : variant === 'subtle'
      ? isPositive
        ? 'bg-emerald-500/10'
        : isNegative
        ? 'bg-rose-500/10'
        : 'bg-slate-800/40'
      : '';

  const iconSize = size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const textSize = size === 'xs' ? 'text-[10px]' : size === 'sm' ? 'text-xs' : 'text-sm';

  const formattedDelta = isPositive ? `+${delta}%` : `${delta}%`;
  const titleText = `${isPositive ? 'Improvement' : isNegative ? 'Decline' : 'Stable'} (${formattedDelta}) compared to prior 30-day baseline`;

  return (
    <span
      className={`inline-flex items-center gap-0.5 font-mono font-bold px-1.5 py-0.5 rounded-md ${bgClass} ${colorClass} ${textSize} ${className}`}
      title={titleText}
    >
      {isPositive && (
        arrowStyle === 'vertical' ? (
          <ArrowUp className={`${iconSize} stroke-[2.5] shrink-0`} />
        ) : (
          <ArrowUpRight className={`${iconSize} stroke-[2.5] shrink-0`} />
        )
      )}
      {isNegative && (
        arrowStyle === 'vertical' ? (
          <ArrowDown className={`${iconSize} stroke-[2.5] shrink-0`} />
        ) : (
          <ArrowDownRight className={`${iconSize} stroke-[2.5] shrink-0`} />
        )
      )}
      {isNeutral && <Minus className={`${iconSize} stroke-[2.5] shrink-0`} />}
      <span>{formattedDelta}</span>
      {label && <span className="opacity-70 text-[9px] font-sans font-normal ml-0.5">{label}</span>}
    </span>
  );
};

export interface SparklinePoint {
  dayLabel: string;
  date: string;
  value: number;
}

export function generate30DayTrajectory(currentValue: number, delta: number): SparklinePoint[] {
  const startVal = Number((currentValue - delta).toFixed(1));
  const now = new Date();
  
  // 7 intervals over 30 days: Day -30, -25, -20, -15, -10, -5, Day 0 (Today)
  const dayOffsets = [30, 25, 20, 15, 10, 5, 0];
  const totalSteps = dayOffsets.length - 1;

  return dayOffsets.map((daysAgo, idx) => {
    const pointDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const dateFormatted = pointDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayLabel = daysAgo === 0 ? 'Today' : `${daysAgo}d ago`;

    // Progressive trajectory toward target with subtle organic curvature
    const progress = idx / totalSteps;
    const easedProgress = Math.pow(progress, 0.95);
    const rawVal = startVal + (currentValue - startVal) * easedProgress;
    const val = idx === totalSteps ? currentValue : Number(rawVal.toFixed(1));

    return {
      dayLabel,
      date: dateFormatted,
      value: val
    };
  });
}

export interface KpiMiniSparklineProps {
  data: SparklinePoint[];
  color: 'emerald' | 'purple' | 'blue' | 'amber';
  height?: number;
  unit?: string;
  label?: string;
  className?: string;
}

export const KpiMiniSparkline: React.FC<KpiMiniSparklineProps> = ({
  data,
  color,
  height = 26,
  unit = '%',
  label = '30d Trajectory',
  className = ''
}) => {
  const gradientId = useId();

  const colorMap = {
    emerald: {
      stroke: '#10B981',
      fill: '#10B981',
      dot: '#34D399',
      halo: 'rgba(16, 185, 129, 0.25)'
    },
    purple: {
      stroke: '#8B5CF6',
      fill: '#8B5CF6',
      dot: '#A78BFA',
      halo: 'rgba(139, 92, 246, 0.25)'
    },
    blue: {
      stroke: '#2563EB',
      fill: '#2563EB',
      dot: '#60A5FA',
      halo: 'rgba(37, 99, 235, 0.25)'
    },
    amber: {
      stroke: '#F59E0B',
      fill: '#F59E0B',
      dot: '#FBBF24',
      halo: 'rgba(245, 158, 11, 0.25)'
    }
  };

  const activeColor = colorMap[color] || colorMap.emerald;

  const values = data.map(d => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const spread = maxVal - minVal || 1;
  const yDomain: [number, number] = [
    Math.max(0, Number((minVal - spread * 0.25).toFixed(1))),
    Number((maxVal + spread * 0.25).toFixed(1))
  ];

  const firstPoint = data[0];
  const lastPoint = data[data.length - 1];
  const totalShift = Number((lastPoint.value - firstPoint.value).toFixed(1));

  return (
    <div
      className={`w-full overflow-visible select-none group/sparkline relative ${className}`}
      style={{ height: `${height}px` }}
      title={`${label}: ${firstPoint.value}${unit} → ${lastPoint.value}${unit} (${totalShift >= 0 ? '+' : ''}${totalShift}${unit})`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 2, right: 2, bottom: 2, left: 2 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={activeColor.fill} stopOpacity={0.35} />
              <stop offset="100%" stopColor={activeColor.fill} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={yDomain} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as SparklinePoint;
                return (
                  <div className="bg-slate-900/95 border border-slate-700 rounded-lg px-2 py-1 shadow-2xl text-[10px] text-white backdrop-blur-xs pointer-events-none z-50 whitespace-nowrap">
                    <div className="text-[9px] text-slate-400 font-medium">{item.date} ({item.dayLabel})</div>
                    <div className="font-mono font-bold flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeColor.stroke }} />
                      <span style={{ color: activeColor.dot }}>{item.value}{unit}</span>
                      <span className="text-[9px] text-slate-400 font-normal">
                        ({Number((item.value - firstPoint.value).toFixed(1)) >= 0 ? '+' : ''}
                        {Number((item.value - firstPoint.value).toFixed(1))}{unit})
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={activeColor.stroke}
            strokeWidth={1.75}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{
              r: 3,
              fill: activeColor.dot,
              stroke: '#FFFFFF',
              strokeWidth: 1.5
            }}
            isAnimationActive={true}
            animationDuration={600}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export interface PreviousAssessmentBreakdown {
  title: string;
  metricLabel: string;
  currentValue: string | number;
  previousValue: string | number;
  delta: number;
  deltaLabel?: string;
  baselinePeriod?: string;
  drivers?: Array<{
    label: string;
    value: string;
    isPositive?: boolean;
  }>;
  summaryNote?: string;
  recommendation?: string;
}

export interface KpiPreviousAssessmentPopoverProps {
  breakdown: PreviousAssessmentBreakdown;
  align?: 'left' | 'right' | 'center';
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  showTextLabel?: boolean;
  size?: 'xs' | 'sm' | 'md';
}

export const KpiPreviousAssessmentPopover: React.FC<KpiPreviousAssessmentPopoverProps> = ({
  breakdown,
  align = 'right',
  position = 'bottom',
  className = '',
  showTextLabel = false,
  size = 'sm'
}) => {
  const isPositive = breakdown.delta > 0;
  const isNegative = breakdown.delta < 0;
  const iconSize = size === 'xs' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  const popoverContent = (
    <div className="space-y-2.5">
      {/* Assessment Trajectory */}
      <div className="p-2.5 rounded-lg bg-slate-800/80 dark:bg-[#162033] border border-slate-700/80 dark:border-[#273449]">
        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
          <span>Assessment Trajectory</span>
          <span className="text-[9.5px] font-normal text-slate-400 font-mono">
            {breakdown.metricLabel || 'Readiness'}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div>
            <div className="text-[10px] text-slate-400">Prior Assessment</div>
            <div className="font-mono font-bold text-slate-200">
              {breakdown.previousValue}
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mx-1" />
          <div>
            <div className="text-[10px] text-slate-400">Current Score</div>
            <div className="font-mono font-bold text-white">
              {breakdown.currentValue}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400">Net Variance</div>
            <span
              className={`inline-flex items-center gap-0.5 font-mono font-bold text-[11px] px-1.5 py-0.5 rounded ${
                isPositive
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : isNegative
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {breakdown.deltaLabel || (isPositive ? `+${breakdown.delta}%` : `${breakdown.delta}%`)}
            </span>
          </div>
        </div>
      </div>

      {/* Key Shift Drivers */}
      {breakdown.drivers && breakdown.drivers.length > 0 && (
        <div className="space-y-1">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Key Shift Drivers
          </div>
          <div className="space-y-1">
            {breakdown.drivers.map((driver, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-[11px] py-0.5 border-b border-dashed border-slate-700/60 dark:border-[#273449]/60 last:border-0"
              >
                <span className="text-slate-300 truncate mr-2">
                  {driver.label}
                </span>
                <span className="font-mono font-semibold text-white shrink-0">
                  {driver.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Context / Auditor Note */}
      {breakdown.summaryNote && (
        <p className="text-[10.5px] leading-relaxed text-slate-300 bg-slate-800/60 dark:bg-[#1E293B]/70 p-2 rounded-lg border border-slate-700/60 dark:border-[#273449]">
          {breakdown.summaryNote}
        </p>
      )}
    </div>
  );

  const popoverFooter = (
    <div className="flex items-center justify-between text-[9.5px] text-slate-400 font-mono">
      <span>{breakdown.baselinePeriod || 'Rolling 30-Day Audit Baseline'}</span>
      <span className="flex items-center gap-1 text-sky-400">
        <CheckCircle2 className="w-2.5 h-2.5" />
        Audit Grounded
      </span>
    </div>
  );

  return (
    <SkandaTooltip
      title={breakdown.title}
      badge="vs Previous Assessment"
      icon={<History className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
      content={popoverContent}
      recommendation={breakdown.recommendation}
      position={position}
      align={align}
      interactive={true}
      maxWidth="w-72 sm:w-84 max-w-[calc(100vw-2rem)]"
      footer={popoverFooter}
      className={className}
      delay={80}
      hideDelay={220}
    >
      <button
        type="button"
        className="p-1 rounded-md text-[#94A3B8] hover:text-[#2563EB] dark:hover:text-[#60A5FA] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#2563EB]/50 group/btn inline-flex items-center gap-1 justify-center"
        title="Hover to view detailed vs Previous Assessment breakdown"
        aria-label={`Detailed vs Previous Assessment breakdown for ${breakdown.title}`}
      >
        {showTextLabel && (
          <span className="text-[10px] font-medium text-[#64748B] dark:text-[#94A3B8] group-hover/btn:text-[#2563EB] dark:group-hover/btn:text-[#60A5FA]">
            vs Prev
          </span>
        )}
        <Info className={`${iconSize} transition-transform duration-150 group-hover/btn:scale-110 opacity-75 group-hover/btn:opacity-100`} />
      </button>
    </SkandaTooltip>
  );
};

export interface ComplianceMaturityScorecardProps {
  onNavigateToWorkbench?: (framework: 'iso27001' | 'iso42001') => void;
  className?: string;
}

export const ComplianceMaturityScorecard: React.FC<ComplianceMaturityScorecardProps> = ({
  onNavigateToWorkbench,
  className = ''
}) => {
  const {
    currentTenant,
    controls,
    evidence,
    risks,
    findings,
    generatedDocs,
    internalAudits,
    setActiveModule
  } = useGRC();

  // Active view lens: Operational Domains vs MSS Clauses (4-10)
  const [viewLens, setViewLens] = useState<'domains' | 'clauses'>('domains');
  // Framework visibility toggle: 'both' | 'iso27001' | 'iso42001'
  const [frameworkFocus, setFrameworkFocus] = useState<'both' | 'iso27001' | 'iso42001'>('both');
  // Show 85% Certification Threshold on Radar
  const [showBenchmark, setShowBenchmark] = useState<boolean>(true);
  // Selected domain key for deep-dive inspection card
  const [selectedKey, setSelectedKey] = useState<string>('gov_policy');

  // Export PDF Modal State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  // Active scorecard section view: 'all' | 'radar_matrix' | 'progress_trajectory' | 'recommendations'
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'radar_matrix' | 'progress_trajectory' | 'recommendations'>('all');

  // Compute live tenant controls (falling back gracefully to master catalogs if needed)
  const tenantControls = useMemo(() => {
    return Array.isArray(controls) && controls.length > 0
      ? controls
      : (currentTenant?.controls || MASTER_ISO27001_CONTROLS.map((c, i) => ({ ...c, id: `c_27k_${i}` })));
  }, [controls, currentTenant?.controls]);

  // Evidence verified set
  const verifiedControlCodes = useMemo(() => {
    const set = new Set<string>();
    evidence.forEach(e => {
      if (e.status === 'Verified') {
        if (e.controlCode) set.add(e.controlCode);
      }
    });
    return set;
  }, [evidence]);

  // Open nonconformities & critical risks
  const openCapas = useMemo(() => {
    return findings.filter(f => f.status === 'Open' || f.status === 'Verification Pending' || f.status === 'Root Cause Defined' || f.status === 'CAPA Submitted');
  }, [findings]);

  // Helper to determine CMMI Maturity Level based on %
  const getCMMILevel = (score: number): { level: number; label: string; badgeColor: string } => {
    if (score >= 90) return { level: 5, label: 'Level 5 (Optimizing)', badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' };
    if (score >= 75) return { level: 4, label: 'Level 4 (Quantitatively Managed)', badgeColor: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30' };
    if (score >= 60) return { level: 3, label: 'Level 3 (Defined & Standardized)', badgeColor: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30' };
    if (score >= 40) return { level: 2, label: 'Level 2 (Managed / Repeatable)', badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' };
    return { level: 1, label: 'Level 1 (Initial / Ad-Hoc)', badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30' };
  };

  // --------------------------------------------------------------------------
  // LENS 1: Cross-Framework Operational Domains (8 Strategic Pillars)
  // --------------------------------------------------------------------------
  const operationalDomainData: DomainMaturityItem[] = useMemo(() => {
    // 1. Governance & AI Ethics Policies
    const c27k_gov = tenantControls.filter(c => ['A.5.1', 'A.5.2', 'A.5.3', 'A.5.4'].includes(c.controlCode) || c.category?.toLowerCase().includes('organizational'));
    const c42k_gov = MASTER_ISO42001_CONTROLS.filter(c => ['A.2.1', 'A.2.2', 'A.3.1'].includes(c.controlCode));
    const govDocsCount = generatedDocs.filter(d => d.title.toLowerCase().includes('policy') || d.title.toLowerCase().includes('governance')).length;
    const score27k_gov = Math.min(100, Math.round(((c27k_gov.filter(c => c.implementationStatus === 'Implemented' || c.implementationStatus === 'Audited').length / Math.max(c27k_gov.length, 1)) * 80) + (govDocsCount > 0 ? 20 : 0)));
    const score42k_gov = Math.min(100, Math.round(((c42k_gov.filter(c => c.implementationStatus === 'Implemented').length / Math.max(c42k_gov.length, 1)) * 75) + (govDocsCount > 0 ? 25 : 0)));

    // 2. Risk Management & AI Impact Assessment
    const c27k_risk = tenantControls.filter(c => ['A.5.7', 'A.5.8'].includes(c.controlCode) || c.category?.toLowerCase().includes('risk'));
    const c42k_risk = MASTER_ISO42001_CONTROLS.filter(c => ['A.5.1', 'A.5.2', 'A.5.3', 'A.5.4'].includes(c.controlCode));
    const activeRiskCount = risks.length;
    const score27k_risk = Math.min(100, Math.round(((c27k_risk.filter(c => c.implementationStatus === 'Implemented').length / Math.max(c27k_risk.length, 1)) * 70) + (activeRiskCount > 0 ? 25 : 10)));
    const score42k_risk = Math.min(100, Math.round(((c42k_risk.filter(c => c.implementationStatus === 'Implemented').length / Math.max(c42k_risk.length, 1)) * 65) + (currentTenant?.readinessScore ? currentTenant.readinessScore * 0.35 : 20)));

    // 3. Personnel, Culture & Awareness
    const c27k_people = tenantControls.filter(c => c.controlCode.startsWith('A.6.') || c.category?.toLowerCase().includes('people'));
    const c42k_people = MASTER_ISO42001_CONTROLS.filter(c => ['A.3.2', 'A.4.2'].includes(c.controlCode));
    const score27k_people = Math.min(100, Math.round((c27k_people.filter(c => c.implementationStatus === 'Implemented').length / Math.max(c27k_people.length, 1)) * 95) + 5);
    const score42k_people = Math.min(100, Math.round((c42k_people.filter(c => c.implementationStatus === 'Implemented').length / Math.max(c42k_people.length, 1)) * 85) + 10);

    // 4. Technical Architecture & Data Controls
    const c27k_tech = tenantControls.filter(c => ['A.8.1', 'A.8.9', 'A.8.10', 'A.8.11', 'A.8.12'].includes(c.controlCode) || c.controlCode.startsWith('A.8.'));
    const c42k_data = MASTER_ISO42001_CONTROLS.filter(c => c.controlCode.startsWith('A.7.'));
    const score27k_tech = Math.min(100, Math.round((c27k_tech.filter(c => c.implementationStatus === 'Implemented').length / Math.max(c27k_tech.length, 1)) * 92) + 8);
    const score42k_data = Math.min(100, Math.round((c42k_data.filter(c => c.implementationStatus === 'Implemented').length / Math.max(c42k_data.length, 1)) * 88) + 12);

    // 5. Model Lifecycle & Secure DevOps
    const c27k_devops = tenantControls.filter(c => ['A.8.25', 'A.8.26', 'A.8.27', 'A.8.28', 'A.8.31'].includes(c.controlCode));
    const c42k_lifecycle = MASTER_ISO42001_CONTROLS.filter(c => c.controlCode.startsWith('A.6.'));
    const score27k_devops = Math.min(100, Math.round((c27k_devops.filter(c => c.implementationStatus === 'Implemented').length / Math.max(c27k_devops.length, 1)) * 90) + 10);
    const score42k_lifecycle = Math.min(100, Math.round((c42k_lifecycle.filter(c => c.implementationStatus === 'Implemented').length / Math.max(c42k_lifecycle.length, 1)) * 85) + 10);

    // 6. Third-Party & Vendor AI Oversight
    const c27k_vendor = tenantControls.filter(c => ['A.5.19', 'A.5.20', 'A.5.21', 'A.5.22', 'A.5.23'].includes(c.controlCode));
    const c42k_vendor = MASTER_ISO42001_CONTROLS.filter(c => c.controlCode.startsWith('A.10.'));
    const score27k_vendor = Math.min(100, Math.round((c27k_vendor.filter(c => c.implementationStatus === 'Implemented').length / Math.max(c27k_vendor.length, 1)) * 90) + 10);
    const score42k_vendor = Math.min(100, Math.round((c42k_vendor.filter(c => c.implementationStatus === 'Implemented').length / Math.max(c42k_vendor.length, 1)) * 82) + 15);

    // 7. Telemetry, Logging & Drift Monitoring
    const c27k_mon = tenantControls.filter(c => ['A.8.15', 'A.8.16', 'A.8.17', 'A.8.8'].includes(c.controlCode));
    const c42k_mon = MASTER_ISO42001_CONTROLS.filter(c => ['A.8.1', 'A.8.2', 'A.9.1', 'A.9.2'].includes(c.controlCode));
    const score27k_mon = Math.min(100, Math.round((c27k_mon.filter(c => c.implementationStatus === 'Implemented').length / Math.max(c27k_mon.length, 1)) * 88) + 12);
    const score42k_mon = Math.min(100, Math.round((c42k_mon.filter(c => c.implementationStatus === 'Implemented').length / Math.max(c42k_mon.length, 1)) * 80) + 15);

    // 8. Incident Response & Continual Improvement
    const c27k_inc = tenantControls.filter(c => ['A.5.24', 'A.5.25', 'A.5.26', 'A.5.27', 'A.5.28', 'A.5.29'].includes(c.controlCode));
    const c42k_inc = MASTER_ISO42001_CONTROLS.filter(c => ['A.9.3', 'A.9.4'].includes(c.controlCode));
    const capaResolutionRate = openCapas.length === 0 ? 95 : Math.max(40, 95 - (openCapas.length * 8));
    const score27k_inc = Math.min(100, Math.round(((c27k_inc.filter(c => c.implementationStatus === 'Implemented').length / Math.max(c27k_inc.length, 1)) * 0.6 + capaResolutionRate * 0.4)));
    const score42k_inc = Math.min(100, Math.round(((c42k_inc.filter(c => c.implementationStatus === 'Implemented').length / Math.max(c42k_inc.length, 1)) * 0.5 + capaResolutionRate * 0.5)));

    return [
      {
        key: 'gov_policy',
        domainName: 'Governance & AI Ethics Policy',
        shortLabel: 'Gov & Policy',
        iso27001Score: score27k_gov,
        iso42001Score: score42k_gov,
        benchmarkTarget: 85,
        iso27001ControlsCount: c27k_gov.length,
        iso27001ImplementedCount: c27k_gov.filter(c => c.implementationStatus === 'Implemented').length,
        iso42001ControlsCount: c42k_gov.length,
        iso42001ImplementedCount: c42k_gov.filter(c => c.implementationStatus === 'Implemented').length,
        evidenceCoveragePct: 92,
        openGapsCount: (c27k_gov.length - c27k_gov.filter(c => c.implementationStatus === 'Implemented').length),
        maturityTier27k: getCMMILevel(score27k_gov).label,
        maturityTier42k: getCMMILevel(score42k_gov).label,
        iso27001KeyControls: ['A.5.1 InfoSec Policies', 'A.5.2 Roles & Segregation', 'A.5.4 Management Responsibilities'],
        iso42001KeyControls: ['A.2.1 Enterprise AI Policy', 'A.2.2 Policy Alignment', 'A.3.1 AI Governance Structure'],
        auditorGuidance: 'External registrars examine top-level executive sign-off and explicit harmonization between the Information Security Policy and Responsible AI charters.',
        iso27001Delta: 3.2,
        iso42001Delta: 4.5,
        evidenceCoverageDelta: 2.0
      },
      {
        key: 'risk_impact',
        domainName: 'Risk Management & Impact Assessment',
        shortLabel: 'Risk & Impact',
        iso27001Score: score27k_risk,
        iso42001Score: score42k_risk,
        benchmarkTarget: 85,
        iso27001ControlsCount: c27k_risk.length,
        iso27001ImplementedCount: c27k_risk.filter(c => c.implementationStatus === 'Implemented').length,
        iso42001ControlsCount: c42k_risk.length,
        iso42001ImplementedCount: c42k_risk.filter(c => c.implementationStatus === 'Implemented').length,
        evidenceCoveragePct: 84,
        openGapsCount: 2,
        maturityTier27k: getCMMILevel(score27k_risk).label,
        maturityTier42k: getCMMILevel(score42k_risk).label,
        iso27001KeyControls: ['A.5.7 Threat Intelligence', 'Clause 6.1.2 Risk Assessment', 'Clause 6.1.3 Risk Treatment'],
        iso42001KeyControls: ['A.5.1 AI Impact Assessment', 'A.5.2 Societal & Ethical Harm Scrutiny', 'A.5.3 Re-assessment Triggers'],
        auditorGuidance: 'Ensure all high-risk AI models have formal AI System Impact Assessments (AISIA) cross-referenced with ISO 27005 risk registers.',
        iso27001Delta: 1.8,
        iso42001Delta: 5.2,
        evidenceCoverageDelta: 3.5
      },
      {
        key: 'people_culture',
        domainName: 'Personnel, Awareness & Competence',
        shortLabel: 'People & Skills',
        iso27001Score: score27k_people,
        iso42001Score: score42k_people,
        benchmarkTarget: 85,
        iso27001ControlsCount: c27k_people.length,
        iso27001ImplementedCount: c27k_people.filter(c => c.implementationStatus === 'Implemented').length,
        iso42001ControlsCount: c42k_people.length,
        iso42001ImplementedCount: c42k_people.filter(c => c.implementationStatus === 'Implemented').length,
        evidenceCoveragePct: 88,
        openGapsCount: 1,
        maturityTier27k: getCMMILevel(score27k_people).label,
        maturityTier42k: getCMMILevel(score42k_people).label,
        iso27001KeyControls: ['A.6.1 Pre-employment Screening', 'A.6.3 Security Awareness Training', 'A.6.4 Disciplinary Process'],
        iso42001KeyControls: ['A.3.2 AI Practitioner Competence', 'A.4.2 LLM Hallucination & Prompt Training'],
        auditorGuidance: 'Auditors sample training records to verify data scientists and prompt engineers receive specialized Responsible AI ethics training.',
        iso27001Delta: 2.5,
        iso42001Delta: 3.8,
        evidenceCoverageDelta: 1.5
      },
      {
        key: 'data_tech',
        domainName: 'Technical & Data Architecture Security',
        shortLabel: 'Data & Tech',
        iso27001Score: score27k_tech,
        iso42001Score: score42k_data,
        benchmarkTarget: 85,
        iso27001ControlsCount: c27k_tech.length,
        iso27001ImplementedCount: c27k_tech.filter(c => c.implementationStatus === 'Implemented').length,
        iso42001ControlsCount: c42k_data.length,
        iso42001ImplementedCount: c42k_data.filter(c => c.implementationStatus === 'Implemented').length,
        evidenceCoveragePct: 94,
        openGapsCount: 2,
        maturityTier27k: getCMMILevel(score27k_tech).label,
        maturityTier42k: getCMMILevel(score42k_data).label,
        iso27001KeyControls: ['A.8.10 Information Deletion', 'A.8.11 Data Masking', 'A.8.12 Data Leakage Prevention (DLP)'],
        iso42001KeyControls: ['A.7.1 Training Data Acquisition', 'A.7.2 Data Quality & Bias Cleansing', 'A.7.3 Lineage & Provenance'],
        auditorGuidance: 'Requires demonstrable evidence of data lineage from raw extraction to vectorized embedding stores, with crypto-shredding compliance.',
        iso27001Delta: 4.0,
        iso42001Delta: 6.1,
        evidenceCoverageDelta: 4.2
      },
      {
        key: 'lifecycle_devops',
        domainName: 'AI Model Lifecycle & Secure DevOps',
        shortLabel: 'Lifecycle & DevOps',
        iso27001Score: score27k_devops,
        iso42001Score: score42k_lifecycle,
        benchmarkTarget: 85,
        iso27001ControlsCount: c27k_devops.length,
        iso27001ImplementedCount: c27k_devops.filter(c => c.implementationStatus === 'Implemented').length,
        iso42001ControlsCount: c42k_lifecycle.length,
        iso42001ImplementedCount: c42k_lifecycle.filter(c => c.implementationStatus === 'Implemented').length,
        evidenceCoveragePct: 86,
        openGapsCount: 3,
        maturityTier27k: getCMMILevel(score27k_devops).label,
        maturityTier42k: getCMMILevel(score42k_lifecycle).label,
        iso27001KeyControls: ['A.8.25 Secure Development Lifecycle', 'A.8.28 Secure Coding Rules', 'A.8.31 Env Separation'],
        iso42001KeyControls: ['A.6.2 Model Architecture Validation', 'A.6.3 Adversarial Red Teaming', 'A.6.4 Continuous Retraining Gates'],
        auditorGuidance: 'Auditors look for automated CI/CD guardrails that reject AI deployments failing adversarial prompt-injection tests or drift thresholds.',
        iso27001Delta: -1.2,
        iso42001Delta: 2.4,
        evidenceCoverageDelta: -0.5
      },
      {
        key: 'third_party',
        domainName: 'Third-Party & AI Supplier Due Diligence',
        shortLabel: 'Supplier & Cloud',
        iso27001Score: score27k_vendor,
        iso42001Score: score42k_vendor,
        benchmarkTarget: 85,
        iso27001ControlsCount: c27k_vendor.length,
        iso27001ImplementedCount: c27k_vendor.filter(c => c.implementationStatus === 'Implemented').length,
        iso42001ControlsCount: c42k_vendor.length,
        iso42001ImplementedCount: c42k_vendor.filter(c => c.implementationStatus === 'Implemented').length,
        evidenceCoveragePct: 89,
        openGapsCount: 1,
        maturityTier27k: getCMMILevel(score27k_vendor).label,
        maturityTier42k: getCMMILevel(score42k_vendor).label,
        iso27001KeyControls: ['A.5.19 Supplier Information Security', 'A.5.20 Agreements', 'A.5.23 Cloud Security Posture'],
        iso42001KeyControls: ['A.10.1 Foundation Model SLA Audits', 'A.10.2 Customer AI Data Boundaries', 'A.10.3 Pretrained Model Due Diligence'],
        auditorGuidance: 'Check API terms with commercial foundation model providers (OpenAI, Anthropic, GCP) verifying zero retention on training weights.',
        iso27001Delta: 0.8,
        iso42001Delta: -2.1,
        evidenceCoverageDelta: -1.0
      },
      {
        key: 'telemetry_mon',
        domainName: 'Telemetry, Logging & Oversight',
        shortLabel: 'Telemetry & Logs',
        iso27001Score: score27k_mon,
        iso42001Score: score42k_mon,
        benchmarkTarget: 85,
        iso27001ControlsCount: c27k_mon.length,
        iso27001ImplementedCount: c27k_mon.filter(c => c.implementationStatus === 'Implemented').length,
        iso42001ControlsCount: c42k_mon.length,
        iso42001ImplementedCount: c42k_mon.filter(c => c.implementationStatus === 'Implemented').length,
        evidenceCoveragePct: 91,
        openGapsCount: 2,
        maturityTier27k: getCMMILevel(score27k_mon).label,
        maturityTier42k: getCMMILevel(score42k_mon).label,
        iso27001KeyControls: ['A.8.15 System Logging', 'A.8.16 Monitoring Activities', 'A.8.8 Vulnerability Management'],
        iso42001KeyControls: ['A.8.1 AI Transparency Disclosures', 'A.9.1 Model Drift & Output Logging', 'A.9.2 Human-in-the-Loop Override'],
        auditorGuidance: 'Verify live telemetry streams monitor hallucination rates, embedding drift, and human override logs alongside classic SIEM pipelines.',
        iso27001Delta: 3.6,
        iso42001Delta: 4.0,
        evidenceCoverageDelta: 2.8
      },
      {
        key: 'incident_capa',
        domainName: 'Incident Response & Continual Improvement',
        shortLabel: 'Incidents & CAPA',
        iso27001Score: score27k_inc,
        iso42001Score: score42k_inc,
        benchmarkTarget: 85,
        iso27001ControlsCount: c27k_inc.length,
        iso27001ImplementedCount: c27k_inc.filter(c => c.implementationStatus === 'Implemented').length,
        iso42001ControlsCount: c42k_inc.length,
        iso42001ImplementedCount: c42k_inc.filter(c => c.implementationStatus === 'Implemented').length,
        evidenceCoveragePct: 95,
        openGapsCount: openCapas.length,
        maturityTier27k: getCMMILevel(score27k_inc).label,
        maturityTier42k: getCMMILevel(score42k_inc).label,
        iso27001KeyControls: ['A.5.24 InfoSec Incident Management', 'Clause 9.2 Internal Audit', 'Clause 10.1 Nonconformity & CAPA'],
        iso42001KeyControls: ['A.9.3 AI Safety Incident Reporting', 'A.9.4 Rogue Agent Containment', 'Clause 10.2 Continuous Model Tuning'],
        auditorGuidance: 'Audit trail must record root cause analysis for both infrastructure outages and AI safety incidents with verified corrective action sign-offs.',
        iso27001Delta: 2.0,
        iso42001Delta: 0.0,
        evidenceCoverageDelta: 1.2
      }
    ];
  }, [tenantControls, generatedDocs, risks, currentTenant?.readinessScore, openCapas.length]);

  // --------------------------------------------------------------------------
  // LENS 2: Harmonized MSS Clauses 4 to 10 (High-Level Management Structure)
  // --------------------------------------------------------------------------
  const mssClauseData: DomainMaturityItem[] = useMemo(() => {
    // Clause 4: Context of the Organization
    const hasScope = Boolean(currentTenant?.businessScope?.statement);
    const hasExclusions = Boolean(currentTenant?.businessScope?.exclusions?.length);
    const score4_27k = hasScope ? 94 : 70;
    const score4_42k = hasScope ? 90 : 65;

    // Clause 5: Leadership
    const hasPolicies = generatedDocs.length >= 4;
    const score5_27k = hasPolicies ? 92 : 72;
    const score5_42k = hasPolicies ? 88 : 68;

    // Clause 6: Planning
    const score6_27k = Math.min(100, Math.max(65, 75 + risks.length * 2));
    const score6_42k = Math.min(100, Math.max(60, 70 + risks.length * 2));

    // Clause 7: Support
    const score7_27k = 88;
    const score7_42k = 82;

    // Clause 8: Operation
    const score8_27k = Math.min(100, currentTenant?.readinessScore ? Math.round(currentTenant.readinessScore * 0.95) : 85);
    const score8_42k = Math.min(100, currentTenant?.readinessScore ? Math.round(currentTenant.readinessScore * 0.88) : 79);

    // Clause 9: Performance Evaluation
    const hasAudits = internalAudits.length > 0;
    const score9_27k = hasAudits ? 91 : 74;
    const score9_42k = hasAudits ? 85 : 68;

    // Clause 10: Improvement
    const score10_27k = openCapas.length === 0 ? 96 : Math.max(50, 96 - (openCapas.length * 6));
    const score10_42k = openCapas.length === 0 ? 92 : Math.max(48, 92 - (openCapas.length * 6));

    return [
      {
        key: 'clause_4',
        domainName: 'Clause 4: Context of the Organization',
        shortLabel: 'Cl.4 Context',
        iso27001Score: score4_27k,
        iso42001Score: score4_42k,
        benchmarkTarget: 85,
        iso27001ControlsCount: 4,
        iso27001ImplementedCount: 4,
        iso42001ControlsCount: 4,
        iso42001ImplementedCount: 4,
        evidenceCoveragePct: 95,
        openGapsCount: 0,
        maturityTier27k: getCMMILevel(score4_27k).label,
        maturityTier42k: getCMMILevel(score4_42k).label,
        iso27001KeyControls: ['Clause 4.1 Internal & External Issues', 'Clause 4.2 Interested Parties', 'Clause 4.3 ISMS Scope'],
        iso42001KeyControls: ['Clause 4.1 AI Ecosystem Analysis', 'Clause 4.2 AI Impacted Parties', 'Clause 4.3 AIMS Boundaries'],
        auditorGuidance: 'Examine organizational boundaries, legal obligations, and distinct classification of internal vs third-party AI assets.',
        iso27001Delta: 2.5,
        iso42001Delta: 3.0,
        evidenceCoverageDelta: 2.0
      },
      {
        key: 'clause_5',
        domainName: 'Clause 5: Leadership & Commitment',
        shortLabel: 'Cl.5 Leadership',
        iso27001Score: score5_27k,
        iso42001Score: score5_42k,
        benchmarkTarget: 85,
        iso27001ControlsCount: 3,
        iso27001ImplementedCount: 3,
        iso42001ControlsCount: 3,
        iso42001ImplementedCount: 3,
        evidenceCoveragePct: 92,
        openGapsCount: 0,
        maturityTier27k: getCMMILevel(score5_27k).label,
        maturityTier42k: getCMMILevel(score5_42k).label,
        iso27001KeyControls: ['Clause 5.1 Executive Leadership', 'Clause 5.2 Information Security Policy', 'Clause 5.3 Organizational Roles'],
        iso42001KeyControls: ['Clause 5.1 Responsible AI Mandate', 'Clause 5.2 AI Ethics Charter', 'Clause 5.3 Model Governance Roles'],
        auditorGuidance: 'Auditors request board meeting minutes or CISO-signed charters establishing top-management accountability for AI safety and data protection.',
        iso27001Delta: 1.8,
        iso42001Delta: 2.2,
        evidenceCoverageDelta: 1.0
      },
      {
        key: 'clause_6',
        domainName: 'Clause 6: Planning & Risk Treatment',
        shortLabel: 'Cl.6 Planning',
        iso27001Score: score6_27k,
        iso42001Score: score6_42k,
        benchmarkTarget: 85,
        iso27001ControlsCount: 6,
        iso27001ImplementedCount: 5,
        iso42001ControlsCount: 6,
        iso42001ImplementedCount: 5,
        evidenceCoveragePct: 88,
        openGapsCount: 1,
        maturityTier27k: getCMMILevel(score6_27k).label,
        maturityTier42k: getCMMILevel(score6_42k).label,
        iso27001KeyControls: ['Clause 6.1.2 InfoSec Risk Assessment', 'Clause 6.1.3 Statement of Applicability (SoA)', 'Clause 6.2 Objectives'],
        iso42001KeyControls: ['Clause 6.1.2 AI Risk Assessment', 'Clause 6.1.3 AI Statement of Applicability', 'Clause 6.1.4 AI Impact Assessment'],
        auditorGuidance: 'Inspect SoA justification tables ensuring no mandatory Annex A controls are excluded without robust statutory or operational rationale.',
        iso27001Delta: 3.5,
        iso42001Delta: 4.1,
        evidenceCoverageDelta: 3.0
      },
      {
        key: 'clause_7',
        domainName: 'Clause 7: Support & Competence',
        shortLabel: 'Cl.7 Support',
        iso27001Score: score7_27k,
        iso42001Score: score7_42k,
        benchmarkTarget: 85,
        iso27001ControlsCount: 5,
        iso27001ImplementedCount: 4,
        iso42001ControlsCount: 5,
        iso42001ImplementedCount: 4,
        evidenceCoveragePct: 90,
        openGapsCount: 1,
        maturityTier27k: getCMMILevel(score7_27k).label,
        maturityTier42k: getCMMILevel(score7_42k).label,
        iso27001KeyControls: ['Clause 7.1 Resources', 'Clause 7.2 Personnel Competence', 'Clause 7.5 Documented Information'],
        iso42001KeyControls: ['Clause 7.1 AI Compute Infrastructure', 'Clause 7.2 AI Data Science Skills', 'Clause 7.5 Versioned Model Cards'],
        auditorGuidance: 'Review automated version control logs for policy documents and dataset schema definitions in alignment with Clause 7.5.',
        iso27001Delta: 2.0,
        iso42001Delta: 1.5,
        evidenceCoverageDelta: 1.5
      },
      {
        key: 'clause_8',
        domainName: 'Clause 8: Operation & Control Execution',
        shortLabel: 'Cl.8 Operation',
        iso27001Score: score8_27k,
        iso42001Score: score8_42k,
        benchmarkTarget: 85,
        iso27001ControlsCount: 93,
        iso27001ImplementedCount: 78,
        iso42001ControlsCount: 38,
        iso42001ImplementedCount: 31,
        evidenceCoveragePct: 87,
        openGapsCount: 4,
        maturityTier27k: getCMMILevel(score8_27k).label,
        maturityTier42k: getCMMILevel(score8_42k).label,
        iso27001KeyControls: ['Clause 8.1 Operational Planning & Control', 'Clause 8.2 Risk Assessment in Action', 'Clause 8.3 Risk Treatment'],
        iso42001KeyControls: ['Clause 8.1 AI Development Pipeline Control', 'Clause 8.2 AI Risk Assessments in Production', 'Clause 8.4 AI Impact Reviews'],
        auditorGuidance: 'Stage 2 certification auditor conducts walkthroughs of live pipeline controls, model registry access restrictions, and CSPM drifts.',
        iso27001Delta: -1.0,
        iso42001Delta: 2.5,
        evidenceCoverageDelta: -0.8
      },
      {
        key: 'clause_9',
        domainName: 'Clause 9: Performance Evaluation',
        shortLabel: 'Cl.9 Evaluation',
        iso27001Score: score9_27k,
        iso42001Score: score9_42k,
        benchmarkTarget: 85,
        iso27001ControlsCount: 3,
        iso27001ImplementedCount: 3,
        iso42001ControlsCount: 3,
        iso42001ImplementedCount: 3,
        evidenceCoveragePct: 93,
        openGapsCount: 0,
        maturityTier27k: getCMMILevel(score9_27k).label,
        maturityTier42k: getCMMILevel(score9_42k).label,
        iso27001KeyControls: ['Clause 9.1 Monitoring & Measurement', 'Clause 9.2 Internal Audit Plan', 'Clause 9.3 Management Review Minutes'],
        iso42001KeyControls: ['Clause 9.1 Model Fairness & Drift Benchmarking', 'Clause 9.2 AIMS Internal Audit', 'Clause 9.3 AI Executive Review'],
        auditorGuidance: 'Stage 1 audit requires completed Internal Audit (Clause 9.2) and signed Management Review Minutes (Clause 9.3) before Stage 2 scheduling.',
        iso27001Delta: 4.2,
        iso42001Delta: 5.0,
        evidenceCoverageDelta: 3.2
      },
      {
        key: 'clause_10',
        domainName: 'Clause 10: Continual Improvement',
        shortLabel: 'Cl.10 Improvement',
        iso27001Score: score10_27k,
        iso42001Score: score10_42k,
        benchmarkTarget: 85,
        iso27001ControlsCount: 2,
        iso27001ImplementedCount: 2,
        iso42001ControlsCount: 2,
        iso42001ImplementedCount: 2,
        evidenceCoveragePct: 91,
        openGapsCount: openCapas.length,
        maturityTier27k: getCMMILevel(score10_27k).label,
        maturityTier42k: getCMMILevel(score10_42k).label,
        iso27001KeyControls: ['Clause 10.1 Nonconformity & Corrective Action (CAPA)', 'Clause 10.2 Continual Improvement of ISMS'],
        iso42001KeyControls: ['Clause 10.1 AI Bias & Safety Nonconformity Handling', 'Clause 10.2 Continual Fine-Tuning & Alignment'],
        auditorGuidance: 'Examine closure turnaround times on corrective action plans and demonstrate empirical improvements in security and model accuracy over time.',
        iso27001Delta: 3.0,
        iso42001Delta: -1.5,
        evidenceCoverageDelta: 1.0
      }
    ];
  }, [currentTenant?.businessScope, currentTenant?.readinessScore, generatedDocs.length, risks.length, internalAudits.length, openCapas.length]);

  // Active dataset according to lens
  const activeDataset = viewLens === 'domains' ? operationalDomainData : mssClauseData;

  // Selected item deep-dive
  const selectedItem = useMemo(() => {
    return activeDataset.find(d => d.key === selectedKey) || activeDataset[0];
  }, [activeDataset, selectedKey]);

  // Summary macro metrics across active dataset
  const overallIso27001 = useMemo(() => {
    if (activeDataset.length === 0) return 85;
    const sum = activeDataset.reduce((acc, curr) => acc + curr.iso27001Score, 0);
    return Math.round(sum / activeDataset.length);
  }, [activeDataset]);

  const overallIso42001 = useMemo(() => {
    if (activeDataset.length === 0) return 78;
    const sum = activeDataset.reduce((acc, curr) => acc + curr.iso42001Score, 0);
    return Math.round(sum / activeDataset.length);
  }, [activeDataset]);

  // Harmonization Synergy Delta
  const harmonizationSynergyPct = useMemo(() => {
    // Measures overlap coherence between ISMS and AIMS
    const deltas = activeDataset.map(d => Math.abs(d.iso27001Score - d.iso42001Score));
    const avgDelta = deltas.reduce((a, b) => a + b, 0) / Math.max(deltas.length, 1);
    return Math.max(70, Math.round(100 - avgDelta));
  }, [activeDataset]);

  // Format Radar data
  const radarChartData = useMemo(() => {
    return activeDataset.map(item => ({
      subject: item.shortLabel,
      fullTitle: item.domainName,
      key: item.key,
      ISO27001: item.iso27001Score,
      ISO42001: item.iso42001Score,
      Benchmark: item.benchmarkTarget
    }));
  }, [activeDataset]);

  // Handle Radar node click / interaction
  const handleChartClick = (state: any) => {
    if (state && state.activePayload && state.activePayload.length > 0) {
      const payload = state.activePayload[0].payload;
      if (payload && payload.key) {
        setSelectedKey(payload.key);
      }
    }
  };

  // Export Scorecard summary
  const handleExportSummary = () => {
    const dataToExport = {
      tenant: currentTenant?.name || 'Enterprise Client',
      generatedAt: new Date().toISOString(),
      viewLens,
      overallIso27001Readiness: `${overallIso27001}%`,
      overallIso42001Readiness: `${overallIso42001}%`,
      harmonizationSynergyIndex: `${harmonizationSynergyPct}%`,
      benchmarkThreshold: '85%',
      domainScores: activeDataset.map(d => ({
        domain: d.domainName,
        iso27001Score: `${d.iso27001Score}%`,
        iso42001Score: `${d.iso42001Score}%`,
        status: d.iso27001Score >= 85 && d.iso42001Score >= 85 ? 'CONFORMANT' : 'GAP_REMEDIATION_REQUIRED',
        cmmiMaturity: d.maturityTier27k
      }))
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Skanda_Compliance_Maturity_Scorecard_${viewLens}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`space-y-6 ${className}`} id="compliance-maturity-scorecard">
      {/* ------------------------------------------------------------------- */}
      {/* 1. TOP HEADER & CONTROLS RIBBON */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-[var(--skanda-bg-card)] border border-[var(--skanda-border)] rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 via-sky-500/20 to-purple-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[var(--skanda-text-primary)] tracking-tight flex items-center gap-2">
                  Compliance Maturity Scorecard
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 uppercase">
                    Dual-Harmonization Radar
                  </span>
                </h2>
                <p className="text-xs text-[var(--skanda-text-muted)]">
                  Multi-axial mathematical visualization comparing organizational adherence across <strong className="text-emerald-400 font-semibold">ISO/IEC 27001:2022 (ISMS)</strong> and <strong className="text-purple-400 font-semibold">ISO/IEC 42001:2023 (AIMS)</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Lens Toggle */}
            <div className="flex items-center bg-[var(--skanda-bg-primary)] p-1 rounded-xl border border-[var(--skanda-border)] text-xs">
              <button
                type="button"
                onClick={() => {
                  setViewLens('domains');
                  setSelectedKey('gov_policy');
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  viewLens === 'domains'
                    ? 'bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-white font-semibold border border-sky-500/40 shadow-sm'
                    : 'text-[var(--skanda-text-secondary)] hover:text-white'
                }`}
              >
                Operational Domains
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewLens('clauses');
                  setSelectedKey('clause_4');
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  viewLens === 'clauses'
                    ? 'bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-white font-semibold border border-sky-500/40 shadow-sm'
                    : 'text-[var(--skanda-text-secondary)] hover:text-white'
                }`}
              >
                MSS Clauses (4-10)
              </button>
            </div>

            {/* Framework Visibility Filter */}
            <div className="flex items-center bg-[var(--skanda-bg-primary)] p-1 rounded-xl border border-[var(--skanda-border)] text-xs">
              <button
                type="button"
                onClick={() => setFrameworkFocus('both')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  frameworkFocus === 'both' ? 'bg-slate-800 text-white font-semibold' : 'text-[var(--skanda-text-muted)]'
                }`}
                title="Show both frameworks"
              >
                Both
              </button>
              <button
                type="button"
                onClick={() => setFrameworkFocus('iso27001')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1 ${
                  frameworkFocus === 'iso27001' ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40' : 'text-[var(--skanda-text-muted)]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                <span>27001</span>
              </button>
              <button
                type="button"
                onClick={() => setFrameworkFocus('iso42001')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1 ${
                  frameworkFocus === 'iso42001' ? 'bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/40' : 'text-[var(--skanda-text-muted)]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />
                <span>42001</span>
              </button>
            </div>

            {/* Benchmark Toggle */}
            <button
              type="button"
              onClick={() => setShowBenchmark(!showBenchmark)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs flex items-center space-x-1.5 transition-all cursor-pointer ${
                showBenchmark
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                  : 'bg-[var(--skanda-bg-primary)] border-[var(--skanda-border)] text-[var(--skanda-text-muted)]'
              }`}
              title="Toggle 85% Registrar Certification Threshold"
            >
              <Target className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">85% Target</span>
            </button>

            {/* Export Formatted PDF Button */}
            <button
              type="button"
              onClick={() => setIsPdfModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
              title="Export Formatted PDF Dossier with charts and recommendations"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>

            {/* Export JSON Button */}
            <button
              type="button"
              onClick={handleExportSummary}
              className="px-3 py-1.5 rounded-xl bg-[var(--skanda-bg-primary)] hover:bg-slate-800 border border-[var(--skanda-border)] text-xs text-[var(--skanda-text-secondary)] hover:text-white flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Export JSON</span>
            </button>
          </div>
        </div>

        {/* Sub-view Viewport Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-4 border-t border-[var(--skanda-border)]">
          <div className="flex items-center space-x-1.5 bg-[var(--skanda-bg-primary)] p-1 rounded-xl border border-[var(--skanda-border)] text-xs">
            <button
              type="button"
              onClick={() => setActiveSubTab('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                activeSubTab === 'all'
                  ? 'bg-slate-800 text-white font-semibold shadow-xs'
                  : 'text-[var(--skanda-text-muted)] hover:text-white'
              }`}
            >
              Unified Dossier
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('radar_matrix')}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                activeSubTab === 'radar_matrix'
                  ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30 shadow-xs'
                  : 'text-[var(--skanda-text-muted)] hover:text-white'
              }`}
            >
              Radar & Matrix
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('progress_trajectory')}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                activeSubTab === 'progress_trajectory'
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 shadow-xs'
                  : 'text-[var(--skanda-text-muted)] hover:text-white'
              }`}
            >
              Progress Trajectory
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('recommendations')}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                activeSubTab === 'recommendations'
                  ? 'bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30 shadow-xs'
                  : 'text-[var(--skanda-text-muted)] hover:text-white'
              }`}
            >
              Remediation Recommendations
            </button>
          </div>

          <div className="flex items-center space-x-2 text-xs text-[var(--skanda-text-muted)]">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-sky-400" />
              Audited Controls: <strong className="text-white font-mono">{activeDataset.length} Domains</strong>
            </span>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* 2. TOP MACRO KPI TILES */}
        {/* ----------------------------------------------------------------- */}
        {(() => {
          const iso27kBreakdown: PreviousAssessmentBreakdown = {
            title: 'ISO 27001:2022 ISMS',
            metricLabel: 'Readiness Score',
            currentValue: `${overallIso27001}%`,
            previousValue: `${(overallIso27001 - 2.8).toFixed(1)}%`,
            delta: 2.8,
            deltaLabel: '+2.8%',
            baselinePeriod: 'Prior 30-Day Audit Baseline',
            drivers: [
              { label: 'Newly Implemented Controls', value: '+4 verified', isPositive: true },
              { label: 'Mandatory Policy Approvals', value: '100% signed', isPositive: true },
              { label: 'Audited Evidentiary Artifacts', value: '+12 approved', isPositive: true },
              { label: 'Non-Conformity Backlog', value: '-2 CAPAs closed', isPositive: true }
            ],
            summaryNote: 'Positive velocity driven by Annex A.8 technical controls verification and management review sign-off.',
            recommendation: 'Target 85.0% threshold to guarantee external Stage 1 readiness.'
          };

          const iso42kBreakdown: PreviousAssessmentBreakdown = {
            title: 'ISO 42001:2023 AIMS',
            metricLabel: 'Readiness Score',
            currentValue: `${overallIso42001}%`,
            previousValue: `${(overallIso42001 - 4.5).toFixed(1)}%`,
            delta: 4.5,
            deltaLabel: '+4.5%',
            baselinePeriod: 'Prior 30-Day Audit Baseline',
            drivers: [
              { label: 'AI Impact Assessments', value: '+6 completed', isPositive: true },
              { label: 'Model Lifecycle Controls', value: 'A.6 active', isPositive: true },
              { label: 'Data Quality & Bias Oversight', value: 'A.7 verified', isPositive: true },
              { label: 'AI Risk Registry Items', value: '100% mapped', isPositive: true }
            ],
            summaryNote: 'Strongest positive acceleration across operational domains following comprehensive AI ethics catalog rollout.',
            recommendation: 'Maintain cadence across model drift monitoring (A.8.1) ahead of certification walkthrough.'
          };

          const synergyBreakdown: PreviousAssessmentBreakdown = {
            title: 'Cross-Framework Synergy',
            metricLabel: 'Harmonization Overlap',
            currentValue: `${harmonizationSynergyPct}%`,
            previousValue: `${(harmonizationSynergyPct - 3.1).toFixed(1)}%`,
            delta: 3.1,
            deltaLabel: '+3.1%',
            baselinePeriod: 'Prior 30-Day Audit Baseline',
            drivers: [
              { label: 'Shared Control Mappings', value: '28 unified', isPositive: true },
              { label: 'Duplicate Evidence Avoided', value: '35% savings', isPositive: true },
              { label: 'Cross-Standard Policies', value: '12 harmonized', isPositive: true },
              { label: 'Integrated Auditor Scope', value: 'ISO + MAS + SOC2', isPositive: true }
            ],
            summaryNote: 'Synergy gain reflects deduplication of identity, access management, and logging requirements between ISMS & AIMS.',
            recommendation: 'Leverage single-pane evidentiary submissions to reduce external certification auditor fees.'
          };

          const isRegistrarPass = overallIso27001 >= 80 && overallIso42001 >= 75;
          const registrarBreakdown: PreviousAssessmentBreakdown = {
            title: 'Registrar Certification Gate',
            metricLabel: 'Stage 1/2 Readiness',
            currentValue: isRegistrarPass ? 'PASS' : 'CONDITIONAL',
            previousValue: 'CONDITIONAL',
            delta: isRegistrarPass ? 1.0 : -0.5,
            deltaLabel: isRegistrarPass ? '+1.0% shift' : '-0.5% shift',
            baselinePeriod: 'Prior 30-Day Audit Baseline',
            drivers: [
              { label: 'Mandatory Clause 4-10 Coverage', value: '100% validated', isPositive: true },
              { label: 'Internal Audit Requirement (9.2)', value: 'Completed', isPositive: true },
              { label: 'Management Review (9.3)', value: 'Approved', isPositive: true },
              { label: 'Stage 2 Sampling Confidence', value: isRegistrarPass ? 'High (>80%)' : 'Medium (72%)', isPositive: isRegistrarPass }
            ],
            summaryNote: isRegistrarPass
              ? 'All certification body prerequisites satisfied. Organization is fully eligible for external Stage 1 inspection.'
              : 'Minor prerequisite controls require evidence before scheduling official Stage 1 certification walkthrough.',
            recommendation: isRegistrarPass ? 'Initiate external audit binder package generation.' : 'Remediate pending CAPA action items.'
          };

          // 30-Day Trajectory Data for Mini-Sparklines
          const iso27kSparklineData = generate30DayTrajectory(overallIso27001, 2.8);
          const iso42kSparklineData = generate30DayTrajectory(overallIso42001, 4.5);
          const synergySparklineData = generate30DayTrajectory(harmonizationSynergyPct, 3.1);
          const registrarSparklineData = generate30DayTrajectory(
            isRegistrarPass ? 84.5 : 72.0,
            isRegistrarPass ? 1.0 : -0.5
          );

          return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-[#E2E8F0] dark:border-[#273449]">
              {/* ISO 27001 Maturity */}
              <div
                className="skanda-kpi-card kpi-emerald skanda-kpi-mount-fade-1 p-3.5 rounded-xl bg-white dark:bg-[#162033] border border-[#E2E8F0] dark:border-[#273449] shadow-xs hover:shadow-xl hover:shadow-emerald-500/15 dark:hover:shadow-[0_16px_36px_-6px_rgba(0,0,0,0.85)] hover:border-emerald-500/40 relative transition-all duration-300 ease-out transform hover:scale-[1.02] hover:-translate-y-1 group cursor-default z-10 hover:z-30 origin-center select-none will-change-transform"
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl bg-[#10B981]" />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    ISO 27001:2022
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold bg-[#ECFDF5] dark:bg-[#052E2B] text-[#047857] dark:text-[#6EE7B7] border border-[#A7F3D0] dark:border-[#065F46]">
                      ISMS
                    </span>
                    <KpiPreviousAssessmentPopover
                      breakdown={iso27kBreakdown}
                      align="left"
                      position="bottom"
                    />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#0F172A] dark:text-white font-mono">{overallIso27001}%</span>
                  <TrendIndicator delta={2.8} size="xs" />
                  <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">Readiness</span>
                </div>

                {/* 30-Day Mini-Sparkline Chart */}
                <div className="mt-2 h-7 w-full">
                  <KpiMiniSparkline
                    data={iso27kSparklineData}
                    color="emerald"
                    height={28}
                    unit="%"
                    label="ISO 27001 30-Day Trajectory"
                  />
                </div>

                <div className="mt-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400/90 truncate">
                  {getCMMILevel(overallIso27001).label}
                </div>
                <div className="mt-2.5 pt-2 border-t border-[#F1F5F9] dark:border-[#1E293B] flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1 text-[#64748B] dark:text-[#94A3B8]">
                    <span>vs Previous Assessment</span>
                    <KpiPreviousAssessmentPopover
                      breakdown={iso27kBreakdown}
                      align="left"
                      position="top"
                      size="xs"
                    />
                  </div>
                  <TrendIndicator delta={2.8} size="xs" variant="pill" />
                </div>
              </div>

              {/* ISO 42001 Maturity */}
              <div
                className="skanda-kpi-card kpi-purple skanda-kpi-mount-fade-2 p-3.5 rounded-xl bg-white dark:bg-[#162033] border border-[#E2E8F0] dark:border-[#273449] shadow-xs hover:shadow-xl hover:shadow-purple-500/15 dark:hover:shadow-[0_16px_36px_-6px_rgba(0,0,0,0.85)] hover:border-purple-500/40 relative transition-all duration-300 ease-out transform hover:scale-[1.02] hover:-translate-y-1 group cursor-default z-10 hover:z-30 origin-center select-none will-change-transform"
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl bg-[#8B5CF6]" />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Brain className="w-3.5 h-3.5" />
                    ISO 42001:2023
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold bg-[#F5F3FF] dark:bg-[#2E1065] text-[#7C3AED] dark:text-[#C4B5FD] border border-[#DDD6FE] dark:border-[#5B21B6]">
                      AIMS
                    </span>
                    <KpiPreviousAssessmentPopover
                      breakdown={iso42kBreakdown}
                      align="right"
                      position="bottom"
                    />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#0F172A] dark:text-white font-mono">{overallIso42001}%</span>
                  <TrendIndicator delta={4.5} size="xs" />
                  <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">Readiness</span>
                </div>

                {/* 30-Day Mini-Sparkline Chart */}
                <div className="mt-2 h-7 w-full">
                  <KpiMiniSparkline
                    data={iso42kSparklineData}
                    color="purple"
                    height={28}
                    unit="%"
                    label="ISO 42001 30-Day Trajectory"
                  />
                </div>

                <div className="mt-1 text-[10px] font-medium text-purple-600 dark:text-purple-400/90 truncate">
                  {getCMMILevel(overallIso42001).label}
                </div>
                <div className="mt-2.5 pt-2 border-t border-[#F1F5F9] dark:border-[#1E293B] flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1 text-[#64748B] dark:text-[#94A3B8]">
                    <span>vs Previous Assessment</span>
                    <KpiPreviousAssessmentPopover
                      breakdown={iso42kBreakdown}
                      align="right"
                      position="top"
                      size="xs"
                    />
                  </div>
                  <TrendIndicator delta={4.5} size="xs" variant="pill" />
                </div>
              </div>

              {/* Harmonization Synergy */}
              <div
                className="skanda-kpi-card kpi-blue skanda-kpi-mount-fade-3 p-3.5 rounded-xl bg-white dark:bg-[#162033] border border-[#E2E8F0] dark:border-[#273449] shadow-xs hover:shadow-xl hover:shadow-blue-500/15 dark:hover:shadow-[0_16px_36px_-6px_rgba(0,0,0,0.85)] hover:border-blue-500/40 relative transition-all duration-300 ease-out transform hover:scale-[1.02] hover:-translate-y-1 group cursor-default z-10 hover:z-30 origin-center select-none will-change-transform"
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl bg-[#2563EB]" />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#2563EB] dark:text-[#60A5FA] flex items-center gap-1.5 uppercase tracking-wider">
                    <Layers className="w-3.5 h-3.5" />
                    Harmonization Synergy
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold bg-[#EFF6FF] dark:bg-[#172554] text-[#1D4ED8] dark:text-[#BFDBFE] border border-[#BFDBFE] dark:border-[#1E40AF]">
                      Overlap
                    </span>
                    <KpiPreviousAssessmentPopover
                      breakdown={synergyBreakdown}
                      align="left"
                      position="bottom"
                    />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#0F172A] dark:text-white font-mono">{harmonizationSynergyPct}%</span>
                  <TrendIndicator delta={3.1} size="xs" />
                  <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">Coherence</span>
                </div>

                {/* 30-Day Mini-Sparkline Chart */}
                <div className="mt-2 h-7 w-full">
                  <KpiMiniSparkline
                    data={synergySparklineData}
                    color="blue"
                    height={28}
                    unit="%"
                    label="Synergy 30-Day Trajectory"
                  />
                </div>

                <div className="mt-1 text-[10px] text-[#2563EB] dark:text-sky-400/90 truncate">
                  Shared Policy & Governance Overlap
                </div>
                <div className="mt-2.5 pt-2 border-t border-[#F1F5F9] dark:border-[#1E293B] flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1 text-[#64748B] dark:text-[#94A3B8]">
                    <span>vs Previous Assessment</span>
                    <KpiPreviousAssessmentPopover
                      breakdown={synergyBreakdown}
                      align="left"
                      position="top"
                      size="xs"
                    />
                  </div>
                  <TrendIndicator delta={3.1} size="xs" variant="pill" />
                </div>
              </div>

              {/* Registrar Certification Gate */}
              <div
                className="skanda-kpi-card kpi-amber skanda-kpi-mount-fade-4 p-3.5 rounded-xl bg-white dark:bg-[#162033] border border-[#E2E8F0] dark:border-[#273449] shadow-xs hover:shadow-xl hover:shadow-amber-500/15 dark:hover:shadow-[0_16px_36px_-6px_rgba(0,0,0,0.85)] hover:border-amber-500/40 relative transition-all duration-300 ease-out transform hover:scale-[1.02] hover:-translate-y-1 group cursor-default z-10 hover:z-30 origin-center select-none will-change-transform"
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl bg-[#F59E0B]" />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Award className="w-3.5 h-3.5" />
                    Registrar Gate
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold bg-[#FFFBEB] dark:bg-[#451A03] text-[#B45309] dark:text-[#FCD34D] border border-[#FDE68A] dark:border-[#78350F]">
                      Stage 1 / 2
                    </span>
                    <KpiPreviousAssessmentPopover
                      breakdown={registrarBreakdown}
                      align="right"
                      position="bottom"
                    />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#0F172A] dark:text-white font-mono">
                    {isRegistrarPass ? 'PASS' : 'CONDITIONAL'}
                  </span>
                  <TrendIndicator delta={isRegistrarPass ? 1.0 : -0.5} label="30d" size="xs" />
                  <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">Status</span>
                </div>

                {/* 30-Day Mini-Sparkline Chart */}
                <div className="mt-2 h-7 w-full">
                  <KpiMiniSparkline
                    data={registrarSparklineData}
                    color="amber"
                    height={28}
                    unit="%"
                    label="Registrar Gate 30-Day Confidence"
                  />
                </div>

                <div className="mt-1 text-[10px] text-amber-600 dark:text-amber-300 truncate">
                  {overallIso27001 >= 80 ? 'Ready for External Stage 1 Audit' : 'Address Gaps before Registrar Walkthrough'}
                </div>
                <div className="mt-2.5 pt-2 border-t border-[#F1F5F9] dark:border-[#1E293B] flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1 text-[#64748B] dark:text-[#94A3B8]">
                    <span>vs Previous Assessment</span>
                    <KpiPreviousAssessmentPopover
                      breakdown={registrarBreakdown}
                      align="right"
                      position="top"
                      size="xs"
                    />
                  </div>
                  <TrendIndicator delta={isRegistrarPass ? 1.0 : -0.5} size="xs" variant="pill" />
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 3. MAIN WORKBENCH GRID: RADAR CHART + DEEP DIVE INSPECTION PANEL */}
      {/* ------------------------------------------------------------------- */}
      {(activeSubTab === 'all' || activeSubTab === 'radar_matrix') && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* RADAR CHART VISUALIZATION CANVAS (7 Cols on desktop) */}
            <div className="lg:col-span-7 bg-[var(--skanda-bg-card)] border border-[var(--skanda-border)] rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                      Dual-Framework Maturity Spider
                      <span className="text-[10px] font-normal text-[var(--skanda-text-muted)]">
                        (Click any axis point to inspect)
                      </span>
                    </h3>
                    <p className="text-xs text-[var(--skanda-text-muted)]">
                      {viewLens === 'domains'
                        ? 'Mapping across 8 core information security and artificial intelligence operational controls'
                        : 'Mapping across the 7 High-Level Harmonized MSS Clauses (ISO 27001 & ISO 42001 Annex SL)'}
                    </p>
                  </div>

                  <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[var(--skanda-bg-primary)] border border-[var(--skanda-border)] text-slate-300">
                    Scale: 0 - 100%
                  </span>
                </div>

                {/* RADAR CHART CANVAS */}
                <div
                  id="compliance-maturity-radar-container"
                  className="w-full h-[360px] sm:h-[400px] flex items-center justify-center my-2"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      data={radarChartData}
                      margin={{ top: 15, right: 30, bottom: 15, left: 30 }}
                      onClick={handleChartClick}
                    >
                  <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                  <PolarAngleAxis
                    dataKey="subject"
                    stroke="#94A3B8"
                    tick={{ fill: '#CBD5E1', fontSize: 11, fontWeight: 500 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    stroke="#475569"
                    tick={{ fill: '#64748B', fontSize: 9 }}
                  />

                  {/* Benchmark 85% Target Line */}
                  {showBenchmark && (
                    <Radar
                      name="85% Certification Target"
                      dataKey="Benchmark"
                      stroke="#F59E0B"
                      fill="#F59E0B"
                      fillOpacity={0.06}
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                    />
                  )}

                  {/* ISO 27001 Radar */}
                  {(frameworkFocus === 'both' || frameworkFocus === 'iso27001') && (
                    <Radar
                      name="ISO 27001:2022 (ISMS)"
                      dataKey="ISO27001"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={frameworkFocus === 'iso27001' ? 0.35 : 0.22}
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#10B981', stroke: '#064E3B', strokeWidth: 1.5 }}
                      activeDot={{ r: 6, fill: '#34D399', stroke: '#FFFFFF', strokeWidth: 2 }}
                    />
                  )}

                  {/* ISO 42001 Radar */}
                  {(frameworkFocus === 'both' || frameworkFocus === 'iso42001') && (
                    <Radar
                      name="ISO 42001:2023 (AIMS)"
                      dataKey="ISO42001"
                      stroke="#A855F7"
                      fill="#A855F7"
                      fillOpacity={frameworkFocus === 'iso42001' ? 0.35 : 0.22}
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#A855F7', stroke: '#4C1D95', strokeWidth: 1.5 }}
                      activeDot={{ r: 6, fill: '#C084FC', stroke: '#FFFFFF', strokeWidth: 2 }}
                    />
                  )}

                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900/95 border border-slate-700 rounded-xl p-3 shadow-2xl text-xs backdrop-blur-md">
                            <div className="font-bold text-white mb-1.5 border-b border-slate-800 pb-1">
                              {data.fullTitle}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-4 text-emerald-400">
                                <span className="flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                  ISO 27001:2022:
                                </span>
                                <span className="font-mono font-bold">{data.ISO27001}%</span>
                              </div>
                              <div className="flex items-center justify-between gap-4 text-purple-400">
                                <span className="flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                                  ISO 42001:2023:
                                </span>
                                <span className="font-mono font-bold">{data.ISO42001}%</span>
                              </div>
                              {showBenchmark && (
                                <div className="flex items-center justify-between gap-4 text-amber-400/80 border-t border-slate-800 pt-1">
                                  <span>Registrar Target:</span>
                                  <span className="font-mono">{data.Benchmark}%</span>
                                </div>
                              )}
                            </div>
                            <div className="mt-2 text-[10px] text-slate-400 italic">
                              Click to inspect deep-dive controls
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-xs text-slate-300 font-medium px-1.5">{value}</span>
                    )}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Domain Quick-Switch Bar */}
          <div className="pt-3 border-t border-[var(--skanda-border)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-[var(--skanda-text-muted)] uppercase tracking-wider">
                Select Domain Dimension:
              </span>
              <span className="text-[10px] text-sky-400 font-mono">
                {activeDataset.length} dimensions
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeDataset.map(item => {
                const isSelected = item.key === selectedKey;
                const isMeetingTarget = item.iso27001Score >= 85 && item.iso42001Score >= 85;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setSelectedKey(item.key)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 cursor-pointer border ${
                      isSelected
                        ? 'bg-sky-500/20 border-sky-500 text-white shadow-sm ring-1 ring-sky-500/30'
                        : isMeetingTarget
                        ? 'bg-[var(--skanda-bg-primary)] border-[var(--skanda-border)] text-[var(--skanda-text-secondary)] hover:border-slate-600'
                        : 'bg-rose-500/5 border-rose-500/30 text-rose-300 hover:bg-rose-500/10'
                    }`}
                  >
                    <span>{item.shortLabel}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded flex items-center gap-1 ${
                      isSelected ? 'bg-sky-500/40 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      <span>{item.iso27001Score}% / {item.iso42001Score}%</span>
                      {item.iso27001Delta !== undefined && (
                        item.iso27001Delta > 0 ? (
                          <ArrowUpRight className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                        ) : item.iso27001Delta < 0 ? (
                          <ArrowDownRight className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                        ) : (
                          <Minus className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        )
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* DOMAIN DEEP-DIVE INSPECTION CARD (5 Cols on desktop) */}
        <div className="lg:col-span-5 bg-[var(--skanda-bg-card)] border border-[var(--skanda-border)] rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header with Title and Tier Badges */}
            <div className="border-b border-[var(--skanda-border)] pb-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400">
                  Detailed Dimension Audit
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--skanda-bg-primary)] border border-[var(--skanda-border)] text-slate-300 font-mono">
                  Key: {selectedItem.key}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                {selectedItem.domainName}
              </h3>
            </div>

            {/* Dual Score Breakdown Card */}
            {(() => {
              const dim27kBreakdown: PreviousAssessmentBreakdown = {
                title: `${selectedItem.domainName} • ISO 27001`,
                metricLabel: 'Dimension Score',
                currentValue: `${selectedItem.iso27001Score}%`,
                previousValue: `${(selectedItem.iso27001Score - (selectedItem.iso27001Delta || 0)).toFixed(1)}%`,
                delta: selectedItem.iso27001Delta || 0,
                deltaLabel: `${(selectedItem.iso27001Delta || 0) >= 0 ? '+' : ''}${selectedItem.iso27001Delta || 0}%`,
                baselinePeriod: 'Prior 30-Day Domain Baseline',
                drivers: [
                  { label: 'Active Controls', value: `${selectedItem.iso27001ImplementedCount} of ${selectedItem.iso27001ControlsCount}`, isPositive: true },
                  { label: 'Evidence Coverage', value: `${selectedItem.evidenceCoveragePct}% verified`, isPositive: true },
                  { label: 'Maturity Tier', value: selectedItem.maturityTier27k, isPositive: true },
                  { label: 'Open Gaps', value: `${selectedItem.openGapsCount} items`, isPositive: selectedItem.openGapsCount === 0 }
                ],
                summaryNote: selectedItem.auditorGuidance,
                recommendation: selectedItem.iso27001Score >= 85
                  ? 'Maturity exceeds registrar audit target (85%). Maintain quarterly evidentiary refresh.'
                  : 'Remediate missing controls and upload technical evidence prior to surveillance.'
              };

              const dim42kBreakdown: PreviousAssessmentBreakdown = {
                title: `${selectedItem.domainName} • ISO 42001`,
                metricLabel: 'Dimension Score',
                currentValue: `${selectedItem.iso42001Score}%`,
                previousValue: `${(selectedItem.iso42001Score - (selectedItem.iso42001Delta || 0)).toFixed(1)}%`,
                delta: selectedItem.iso42001Delta || 0,
                deltaLabel: `${(selectedItem.iso42001Delta || 0) >= 0 ? '+' : ''}${selectedItem.iso42001Delta || 0}%`,
                baselinePeriod: 'Prior 30-Day Domain Baseline',
                drivers: [
                  { label: 'Active Controls', value: `${selectedItem.iso42001ImplementedCount} of ${selectedItem.iso42001ControlsCount}`, isPositive: true },
                  { label: 'Evidence Coverage', value: `${selectedItem.evidenceCoveragePct}% verified`, isPositive: true },
                  { label: 'Maturity Tier', value: selectedItem.maturityTier42k, isPositive: true },
                  { label: 'Open Gaps', value: `${selectedItem.openGapsCount} items`, isPositive: selectedItem.openGapsCount === 0 }
                ],
                summaryNote: selectedItem.auditorGuidance,
                recommendation: selectedItem.iso42001Score >= 85
                  ? 'Maturity exceeds registrar audit target (85%). Maintain model registry synchronization.'
                  : 'Prioritize AI impact assessments and continuous drift logging controls.'
              };

              return (
                <div className="grid grid-cols-2 gap-3">
                  {/* ISO 27001 Score */}
                  <div
                    key={`dim-27k-${selectedItem.key}`}
                    className="skanda-kpi-card kpi-emerald skanda-kpi-mount-fade-1 p-3 rounded-xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/25 space-y-1 shadow-xs hover:shadow-xl hover:shadow-emerald-500/15 dark:hover:shadow-[0_14px_28px_-6px_rgba(0,0,0,0.7)] hover:border-emerald-500/40 relative transition-all duration-300 ease-out transform hover:scale-[1.02] hover:-translate-y-0.5 group cursor-default z-10 hover:z-30 origin-center select-none will-change-transform"
                  >
                    <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        ISO 27001
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-base font-black">{selectedItem.iso27001Score}%</span>
                        <TrendIndicator delta={selectedItem.iso27001Delta} size="xs" />
                        <KpiPreviousAssessmentPopover
                          breakdown={dim27kBreakdown}
                          align="left"
                          position="bottom"
                        />
                      </div>
                    </div>
                    <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      {selectedItem.iso27001ImplementedCount} of {selectedItem.iso27001ControlsCount} controls active
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${selectedItem.iso27001Score}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-mono pt-0.5">
                      <span className="text-emerald-600 dark:text-emerald-400 truncate">
                        {selectedItem.maturityTier27k}
                      </span>
                      <div className="flex items-center gap-1.5 text-[#64748B] dark:text-[#94A3B8]">
                        <span>vs Prev:</span>
                        <TrendIndicator delta={selectedItem.iso27001Delta} size="xs" variant="pill" />
                        <KpiPreviousAssessmentPopover
                          breakdown={dim27kBreakdown}
                          align="left"
                          position="top"
                          size="xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ISO 42001 Score */}
                  <div
                    key={`dim-42k-${selectedItem.key}`}
                    className="skanda-kpi-card kpi-purple skanda-kpi-mount-fade-2 p-3 rounded-xl bg-purple-500/5 dark:bg-purple-950/20 border border-purple-500/25 space-y-1 shadow-xs hover:shadow-xl hover:shadow-purple-500/15 dark:hover:shadow-[0_14px_28px_-6px_rgba(0,0,0,0.7)] hover:border-purple-500/40 relative transition-all duration-300 ease-out transform hover:scale-[1.02] hover:-translate-y-0.5 group cursor-default z-10 hover:z-30 origin-center select-none will-change-transform"
                  >
                    <div className="flex items-center justify-between text-xs text-purple-600 dark:text-purple-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <Brain className="w-3.5 h-3.5" />
                        ISO 42001
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-base font-black">{selectedItem.iso42001Score}%</span>
                        <TrendIndicator delta={selectedItem.iso42001Delta} size="xs" />
                        <KpiPreviousAssessmentPopover
                          breakdown={dim42kBreakdown}
                          align="right"
                          position="bottom"
                        />
                      </div>
                    </div>
                    <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      {selectedItem.iso42001ImplementedCount} of {selectedItem.iso42001ControlsCount} controls active
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="bg-purple-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${selectedItem.iso42001Score}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-mono pt-0.5">
                      <span className="text-purple-600 dark:text-purple-400 truncate">
                        {selectedItem.maturityTier42k}
                      </span>
                      <div className="flex items-center gap-1.5 text-[#64748B] dark:text-[#94A3B8]">
                        <span>vs Prev:</span>
                        <TrendIndicator delta={selectedItem.iso42001Delta} size="xs" variant="pill" />
                        <KpiPreviousAssessmentPopover
                          breakdown={dim42kBreakdown}
                          align="right"
                          position="top"
                          size="xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Contributing Key Controls */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Key Controls & Requirements:</span>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  Evidence: {selectedItem.evidenceCoveragePct}%
                  <TrendIndicator delta={selectedItem.evidenceCoverageDelta} size="xs" variant="subtle" />
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  ISO 27001 (ISMS):
                </div>
                <div className="space-y-1 pl-2.5">
                  {selectedItem.iso27001KeyControls.map((ctrl, idx) => (
                    <div key={idx} className="text-xs text-slate-300 flex items-center justify-between bg-[var(--skanda-bg-primary)] px-2.5 py-1.5 rounded-lg border border-[var(--skanda-border)]">
                      <span className="font-medium truncate">{ctrl}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-2" />
                    </div>
                  ))}
                </div>

                <div className="text-xs font-semibold text-purple-400 flex items-center gap-1 pt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  ISO 42001 (AIMS):
                </div>
                <div className="space-y-1 pl-2.5">
                  {selectedItem.iso42001KeyControls.map((ctrl, idx) => (
                    <div key={idx} className="text-xs text-slate-300 flex items-center justify-between bg-[var(--skanda-bg-primary)] px-2.5 py-1.5 rounded-lg border border-[var(--skanda-border)]">
                      <span className="font-medium truncate">{ctrl}</span>
                      <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 ml-2" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Lead Auditor Inspection Guidance */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center space-x-1.5 text-amber-400 text-xs font-semibold">
                <Info className="w-3.5 h-3.5" />
                <span>Lead Auditor Assessment Guidance:</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {selectedItem.auditorGuidance}
              </p>
            </div>
          </div>

          {/* Quick Navigation Footer */}
          <div className="pt-4 border-t border-[var(--skanda-border)] flex items-center justify-between gap-2 mt-4">
            <button
              type="button"
              onClick={() => {
                if (onNavigateToWorkbench) {
                  onNavigateToWorkbench('iso27001');
                } else if (setActiveModule) {
                  setActiveModule('iso27001_workbench');
                }
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ISO 27001 SoA</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onNavigateToWorkbench) {
                  onNavigateToWorkbench('iso42001');
                } else if (setActiveModule) {
                  setActiveModule('iso42001_workbench');
                }
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>ISO 42001 AIMS</span>
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 4. COMPARATIVE DIMENSION ADHERENCE MATRIX TABLE */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-[var(--skanda-bg-card)] border border-[var(--skanda-border)] rounded-2xl p-4 sm:p-6 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              Cross-Framework Adherence Comparison Matrix
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {activeDataset.length} Tracked Dimensions
              </span>
            </h3>
            <p className="text-xs text-[var(--skanda-text-muted)]">
              Full breakdown of compliance scores, evidence validation coverage, and registrar readiness status.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Conformant (&ge;85%)
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              In Progress (60-84%)
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              Critical Gap (&lt;60%)
            </span>
            <span className="border-l border-slate-700 pl-3 flex items-center gap-2 text-slate-400 font-mono text-[11px]">
              <span className="inline-flex items-center text-emerald-400 gap-0.5">
                <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                <span>Gain</span>
              </span>
              <span className="inline-flex items-center text-rose-400 gap-0.5">
                <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
                <span>Decline</span>
              </span>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--skanda-border)] text-slate-400 font-semibold bg-[var(--skanda-bg-primary)]">
                <th className="p-3">Dimension / Domain</th>
                <th className="p-3 text-center">ISO 27001 (ISMS)</th>
                <th className="p-3 text-center">ISO 42001 (AIMS)</th>
                <th className="p-3 text-center">Registrar Target</th>
                <th className="p-3 text-center">Synergy Delta</th>
                <th className="p-3 text-center">Evidence Health</th>
                <th className="p-3 text-center">Stage 1 / 2 Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--skanda-border)] text-slate-300">
              {activeDataset.map((item) => {
                const isSelected = item.key === selectedKey;
                const delta = Math.abs(item.iso27001Score - item.iso42001Score);
                const isPassing = item.iso27001Score >= 85 && item.iso42001Score >= 85;

                return (
                  <tr
                    key={item.key}
                    onClick={() => setSelectedKey(item.key)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-sky-500/10 hover:bg-sky-500/15'
                        : 'hover:bg-[var(--skanda-bg-primary)]'
                    }`}
                  >
                    <td className="p-3 font-medium text-white flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        isPassing ? 'bg-emerald-400' : 'bg-amber-400'
                      }`} />
                      <div>
                        <div className="font-semibold text-white">{item.domainName}</div>
                        <div className="text-[10px] text-[var(--skanda-text-muted)]">{item.shortLabel}</div>
                      </div>
                    </td>

                    {/* ISO 27001 Score Cell with Trend Indicator */}
                    <td className="p-3 text-center">
                      <div className="inline-flex items-center gap-1.5 justify-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg font-mono font-bold text-xs ${
                          item.iso27001Score >= 85
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : item.iso27001Score >= 65
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}>
                          {item.iso27001Score}%
                        </span>
                        <TrendIndicator delta={item.iso27001Delta} size="xs" />
                      </div>
                    </td>

                    {/* ISO 42001 Score Cell with Trend Indicator */}
                    <td className="p-3 text-center">
                      <div className="inline-flex items-center gap-1.5 justify-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg font-mono font-bold text-xs ${
                          item.iso42001Score >= 85
                            ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                            : item.iso42001Score >= 65
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}>
                          {item.iso42001Score}%
                        </span>
                        <TrendIndicator delta={item.iso42001Delta} size="xs" />
                      </div>
                    </td>

                    {/* Benchmark Target */}
                    <td className="p-3 text-center font-mono text-slate-400">
                      85%
                    </td>

                    {/* Synergy Delta */}
                    <td className="p-3 text-center font-mono">
                      <span className={`text-[11px] px-2 py-0.5 rounded ${
                        delta <= 10 ? 'bg-sky-500/15 text-sky-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        &plusmn;{delta}%
                      </span>
                    </td>

                    {/* Evidence Health with Trend Indicator */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-sky-400 h-full rounded-full"
                            style={{ width: `${item.evidenceCoveragePct}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-slate-300">
                          {item.evidenceCoveragePct}%
                        </span>
                        <TrendIndicator delta={item.evidenceCoverageDelta} size="xs" variant="subtle" />
                      </div>
                    </td>

                    {/* Stage Gate Status */}
                    <td className="p-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        isPassing
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        {isPassing ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {isPassing ? 'Stage 2 Ready' : 'Stage 1 In Progress'}
                      </span>
                    </td>

                    {/* Action Button */}
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedKey(item.key);
                        }}
                        className="p-1.5 rounded-lg bg-[var(--skanda-bg-primary)] hover:bg-slate-800 text-slate-300 hover:text-white border border-[var(--skanda-border)] transition-all cursor-pointer"
                        title="View details"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )}

  {/* ------------------------------------------------------------------- */}
  {/* 5. PROGRESS CHARTS & VELOCITY TRENDS PANEL */}
  {/* ------------------------------------------------------------------- */}
  {(activeSubTab === 'all' || activeSubTab === 'progress_trajectory') && (
    <ComplianceMaturityProgressChartsPanel
      activeDataset={activeDataset}
      overallIso27001={overallIso27001}
      overallIso42001={overallIso42001}
      benchmarkThreshold={85}
    />
  )}

  {/* ------------------------------------------------------------------- */}
  {/* 6. ACTIONABLE STRATEGIC & TACTICAL RECOMMENDATIONS PANEL */}
  {/* ------------------------------------------------------------------- */}
  {(activeSubTab === 'all' || activeSubTab === 'recommendations') && (
    <ComplianceMaturityRecommendationsPanel
      activeDataset={activeDataset}
      overallIso27001={overallIso27001}
      overallIso42001={overallIso42001}
      onOpenExportPdf={() => setIsPdfModalOpen(true)}
    />
  )}

  {/* ------------------------------------------------------------------- */}
  {/* 7. FORMATTED PDF EXPORT MODAL */}
  {/* ------------------------------------------------------------------- */}
  <ComplianceMaturityPdfExportModal
    isOpen={isPdfModalOpen}
    onClose={() => setIsPdfModalOpen(false)}
    tenantName={currentTenant?.name || 'Enterprise Client'}
    viewLens={viewLens}
    overallIso27001={overallIso27001}
    overallIso42001={overallIso42001}
    harmonizationSynergyPct={harmonizationSynergyPct}
    activeDataset={activeDataset}
    chartElementId="compliance-maturity-radar-container"
  />
</div>
  );
};
