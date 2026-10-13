import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GripVertical,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Columns,
  Star,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Award,
  Layers,
  Activity,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Info
} from 'lucide-react';
import { MetricWidgetConfig, MetricWidgetId, MetricWidgetSize } from './metricWidgetTypes';
import { useGRC } from '../../context/GRCContext';
import { Tooltip } from '../common/Tooltip';
import { MiniSparkline } from '../common/MiniSparkline';

interface DraggableMetricWidgetProps {
  widget: MetricWidgetConfig;
  priorityIndex: number;
  totalWidgets: number;
  isReorderMode: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  dropPosition: 'before' | 'after' | null;
  criticalThreshold?: number;
  isAlertPulsingEnabled?: boolean;
  density?: 'compact' | 'expanded';
  onDragStart: (e: React.DragEvent, id: MetricWidgetId) => void;
  onDragOver: (e: React.DragEvent, id: MetricWidgetId) => void;
  onDragLeave: (e: React.DragEvent, id: MetricWidgetId) => void;
  onDrop: (e: React.DragEvent, id: MetricWidgetId) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onMoveLeft: (id: MetricWidgetId) => void;
  onMoveRight: (id: MetricWidgetId) => void;
  onResize: (id: MetricWidgetId, newSize: MetricWidgetSize) => void;
  onNavigateModule: (moduleId: string) => void;
  onOpenScoreModal?: () => void;
}

export const DraggableMetricWidget: React.FC<DraggableMetricWidgetProps> = ({
  widget,
  priorityIndex,
  totalWidgets,
  isReorderMode,
  isDragging,
  isDragOver,
  dropPosition,
  criticalThreshold = 85,
  isAlertPulsingEnabled = true,
  density = 'expanded',
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onMoveLeft,
  onMoveRight,
  onResize,
  onNavigateModule,
  onOpenScoreModal
}) => {
  const { theme, currentTenant, risks, findings, evidence } = useGRC();
  const [isHovered, setIsHovered] = useState(false);
  const isLight = theme === 'light';

  // Dynamic context metrics derived deterministically from persisted records
  const openFindingsCount = findings.filter(
    f => (!f.tenantId || f.tenantId === currentTenant?.id) && f.status !== 'Closed Verified'
  ).length;

  const criticalRisksCount = risks.filter(
    r => (!r.tenantId || r.tenantId === currentTenant?.id) && ((r.residualScore || r.inherentScore || 0) >= 16 || (r as any).residualLevel === 'CRITICAL')
  ).length;

  const highRisksCount = risks.filter(
    r => (!r.tenantId || r.tenantId === currentTenant?.id) && (r.residualScore || r.inherentScore || 0) >= 10 && (r.residualScore || r.inherentScore || 0) < 16
  ).length;

  const validEvidenceCount = evidence.filter(
    e => (!e.tenantId || e.tenantId === currentTenant?.id) && (e.status === 'Verified' || (e as any).verificationStatus === 'VERIFIED')
  ).length;

  const totalEvidenceCount = evidence.filter(
    e => !e.tenantId || e.tenantId === currentTenant?.id
  ).length || 1;

  const readinessScore = currentTenant?.readinessScore || 96.4;

  // Compute grid span classes based on widget size
  const getGridSpanClass = (size: MetricWidgetSize) => {
    switch (size) {
      case 'compact':
        return 'col-span-12 sm:col-span-6 lg:col-span-3 xl:col-span-3';
      case 'standard':
        return 'col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-4';
      case 'expanded':
        return 'col-span-12 sm:col-span-12 lg:col-span-8 xl:col-span-6';
      default:
        return 'col-span-12 sm:col-span-6 lg:col-span-3';
    }
  };

  // Next size cycler
  const cycleSize = () => {
    if (widget.size === 'compact') onResize(widget.id, 'standard');
    else if (widget.size === 'standard') onResize(widget.id, 'expanded');
    else onResize(widget.id, 'compact');
  };

  // Priority ranking badge
  const getPriorityBadge = (index: number) => {
    if (index === 0) {
      return {
        bg: isLight
          ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
          : 'bg-amber-500/15 text-amber-300 border-amber-500/30 font-bold',
        label: '#1 Focus Area',
        icon: Star,
        iconColor: isLight ? 'text-amber-600 fill-amber-500' : 'text-amber-400 fill-amber-400'
      };
    }
    if (index === 1) {
      return {
        bg: isLight
          ? 'bg-indigo-50 text-indigo-900 border-indigo-300 font-semibold'
          : 'bg-[#8B5CF6]/15 text-[#A78BFA] border-[#8B5CF6]/30 font-semibold',
        label: '#2 Priority',
        icon: Sparkles,
        iconColor: isLight ? 'text-indigo-600' : 'text-[#A78BFA]'
      };
    }
    return {
      bg: isLight
        ? 'bg-slate-100 text-slate-700 border-slate-300 font-medium'
        : 'bg-[#111A2C] text-[#A7B0C0] border-[#1B2639] font-medium',
      label: `#${index + 1}`,
      icon: null,
      iconColor: isLight ? 'text-slate-500' : 'text-[#7F8BA3]'
    };
  };

  const priorityBadge = getPriorityBadge(priorityIndex);
  const PriorityIcon = priorityBadge.icon;

  // Determine if this widget has breached the critical alert threshold
  const isWidgetCritical: boolean = (() => {
    switch (widget.id) {
      case 'compliance_health':
        return readinessScore < criticalThreshold;
      case 'controls_effective':
        return 95.2 < criticalThreshold;
      case 'evidence_vault':
        return Math.round((validEvidenceCount / totalEvidenceCount) * 100) < criticalThreshold;
      case 'framework_alignment':
        return readinessScore < criticalThreshold;
      case 'audit_readiness':
        return readinessScore < criticalThreshold;
      case 'risk_status':
        return criticalRisksCount > 0;
      case 'tasks_due':
        return openFindingsCount > 5;
      case 'regulatory_alerts':
        return false;
      default:
        return false;
    }
  })();

  const shouldPulseAlert = isWidgetCritical && isAlertPulsingEnabled;

  // Render widget body content according to widget ID and size
  const renderWidgetContent = () => {
    switch (widget.id) {
      case 'risk_status': {
        return (
          <div className="flex flex-col justify-between h-full space-y-2.5">
            <div className="grid grid-cols-[1fr_auto] items-start gap-x-2 gap-y-1">
              <div className="grid grid-cols-[auto_1fr] sm:grid-cols-[auto_auto_1fr] items-baseline gap-2 min-w-0">
                <span className="text-2xl sm:text-[26px] font-black font-mono tracking-tight text-[var(--skanda-text-heading)] leading-none truncate">
                  Low
                </span>
                {density !== 'compact' && (
                  <div className="inline-flex items-center space-x-1.5 shrink-0">
                    <MiniSparkline
                      data={[4.4, 4.3, 4.2, 4.1, 4.0, 4.1, 3.9, 3.8, 3.7, 3.8, 3.6, 3.5, 3.5, 3.4, 3.3, 3.4, 3.3, 3.2, 3.2, 3.2]}
                      trendDirection="down"
                      isPositive={true}
                      color="emerald"
                      width={46}
                      height={18}
                      title="30-Day Residual Risk Velocity (4.4 → 3.2, -1.2 decrease)"
                    />
                    <span
                      className={`inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded font-mono text-[10.5px] font-bold border leading-none shrink-0 ${
                        isLight
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                          : 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                      }`}
                      title="Improving: +20.0% residual risk reduction compared to previous period"
                    >
                      <TrendingUp className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>+20.0%</span>
                    </span>
                  </div>
                )}
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold border shrink-0 justify-self-start whitespace-nowrap ${
                  isLight
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                }`}>
                  Within Appetite
                </span>
                <p className="col-span-full text-sm mt-0.5 text-[var(--skanda-text-muted)] truncate">
                  Residual Threat Score: <span className="font-semibold font-mono text-indigo-600 dark:text-indigo-400">3.2 / 10</span> (Limit: 4.0)
                </p>
              </div>

              <button
                type="button"
                onClick={() => onNavigateModule('risk_map')}
                className={`p-1.5 rounded-lg border transition shrink-0 justify-self-end ${
                  isLight
                    ? 'hover:bg-slate-100 text-slate-500 hover:text-indigo-600 border-slate-200'
                    : 'hover:bg-slate-800 text-slate-400 hover:text-indigo-300 border-slate-700'
                }`}
                title="Open Risk Heatmap & Threat Landscape"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {/* Standard & Expanded: Risk Appetite Bar & Threat breakdown */}
            {widget.size !== 'compact' && (
              <div className={`p-2.5 rounded-xl border transition-all duration-200 hover:scale-[1.01] space-y-2 ${
                isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-950/50 border-slate-800/80'
              }`}>
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Risk Appetite Threshold
                  </span>
                  <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    80% of Tolerance Ceiling
                  </span>
                </div>
                {/* Visual tolerance progress meter */}
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="h-full bg-emerald-500 w-[60%]" title="Normal operating zone" />
                  <div className="h-full bg-amber-400 w-[20%]" title="Current score: 3.2" />
                  <div className="h-full bg-slate-300 dark:bg-slate-700 w-[20%]" title="Remaining buffer" />
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <div className="flex items-center space-x-2 font-mono">
                    <span className="text-rose-600 dark:text-rose-400 font-bold">{criticalRisksCount} Critical</span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold">{highRisksCount} High</span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-slate-500 dark:text-slate-400">10 Medium/Low</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400">
                    3 Mitigations Active
                  </span>
                </div>
              </div>
            )}

            {/* Expanded Deep-Dive Details */}
            {widget.size === 'expanded' && (
              <div className={`pt-2 border-t grid grid-cols-1 md:grid-cols-2 gap-2 text-xs ${
                isLight ? 'border-slate-200 text-slate-600' : 'border-slate-800 text-slate-400'
              }`}>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Primary Monitored Threat</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    Privileged Access Over-Retention (A.5.15)
                  </p>
                  <p className="text-[11px] text-slate-500">
                    PAM rotation policy active; residual rating decreased from 7.5 to 3.2.
                  </p>
                </div>
                <div className="flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Board Governance Review</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Next Quarterly Sign-off:</span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">28 Sep 2026</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigateModule('risk_map')}
                    className="mt-1 text-left text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center space-x-1"
                  >
                    <span>View 12 Threats in Residual Heatmap</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'tasks_due': {
        return (
          <div className="flex flex-col justify-between h-full space-y-2.5">
            <div className="grid grid-cols-[1fr_auto] items-start gap-x-2 gap-y-1">
              <div className="grid grid-cols-[auto_1fr] sm:grid-cols-[auto_auto_1fr] items-baseline gap-2 min-w-0">
                <span className="text-2xl sm:text-[26px] font-black font-mono tracking-tight text-[var(--skanda-text-heading)] leading-none truncate">
                  {openFindingsCount} Due Soon
                </span>
                {density !== 'compact' && (
                  <div className="inline-flex items-center space-x-1.5 shrink-0">
                    <MiniSparkline
                      data={[8, 8, 7, 7, 6, 6, 5, 5, 5, 4, 4, 4, 3, 3, 3, 2, 2, 1, 1, openFindingsCount]}
                      trendDirection="down"
                      isPositive={true}
                      color="emerald"
                      width={46}
                      height={18}
                      title="30-Day Open Action Items Burndown"
                    />
                    <span
                      className={`inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded font-mono text-[10.5px] font-bold border leading-none shrink-0 ${
                        isLight
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                          : 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                      }`}
                      title="Improving: +66.7% CAPA burn-down velocity compared to previous period"
                    >
                      <TrendingUp className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>+66.7%</span>
                    </span>
                  </div>
                )}
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold border shrink-0 justify-self-start whitespace-nowrap ${
                  isLight
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                }`}>
                  0 Overdue
                </span>
                <p className="col-span-full text-sm mt-0.5 text-[var(--skanda-text-muted)] truncate">
                  SLA Health: <span className="font-semibold font-mono text-emerald-600 dark:text-emerald-400">100% On-Track</span> (14-day window)
                </p>
              </div>

              <button
                type="button"
                onClick={() => onNavigateModule('priority_actions')}
                className={`p-1.5 rounded-lg border transition shrink-0 justify-self-end ${
                  isLight
                    ? 'hover:bg-slate-100 text-slate-500 hover:text-indigo-600 border-slate-200'
                    : 'hover:bg-slate-800 text-slate-400 hover:text-indigo-300 border-slate-700'
                }`}
                title="Inspect Priority Action Items & SLAs"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {/* Standard & Expanded: SLA Countdown & Action item */}
            {widget.size !== 'compact' && (
              <div className={`p-2.5 rounded-xl border transition-all duration-200 hover:scale-[1.01] space-y-2 ${
                isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-950/50 border-slate-800/80'
              }`}>
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Remediation Velocity (CAPA Closure)
                  </span>
                  <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    84% Closure Rate
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '84%' }} />
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <div className="flex items-center space-x-2 font-mono">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">1 Access Review (3d)</span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-slate-500 dark:text-slate-400">1 Vendor Audit (5d)</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400">
                    No SLA Breaches
                  </span>
                </div>
              </div>
            )}

            {/* Expanded Deep-Dive Details */}
            {widget.size === 'expanded' && (
              <div className={`pt-2 border-t grid grid-cols-1 md:grid-cols-2 gap-2 text-xs ${
                isLight ? 'border-slate-200 text-slate-600' : 'border-slate-800 text-slate-400'
              }`}>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Top Priority Action</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    Privileged IAM Review • A.5.15
                  </p>
                  <p className="text-[11px] text-slate-500">
                    SecOps Team assigned; 72 hours remaining on corrective plan.
                  </p>
                </div>
                <div className="flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Policy Renewal Task</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">ISMS Master Policy:</span>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">Due in 8 days</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigateModule('priority_actions')}
                    className="mt-1 text-left text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center space-x-1"
                  >
                    <span>Open Critical Priority Actions Feed</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'compliance_health': {
        return (
          <div className="flex flex-col justify-between h-full space-y-2.5">
            <div className="grid grid-cols-[1fr_auto] items-start gap-x-2 gap-y-1">
              <div className="grid grid-cols-[auto_1fr] sm:grid-cols-[auto_auto_1fr] items-baseline gap-2 min-w-0">
                <span className="text-2xl sm:text-[26px] font-black font-mono tracking-tight text-[var(--skanda-text-heading)] leading-none truncate">
                  96.4%
                </span>
                {density !== 'compact' && (
                  <div className="inline-flex items-center space-x-1.5 shrink-0">
                    <MiniSparkline
                      data={[91.0, 91.5, 91.8, 92.4, 92.2, 92.8, 93.4, 93.6, 94.0, 94.2, 94.8, 94.5, 95.0, 95.2, 95.5, 95.8, 96.0, 96.1, 96.3, 96.4]}
                      trendDirection="up"
                      isPositive={true}
                      color="emerald"
                      width={46}
                      height={18}
                      title="30-Day Compliance Health (91.0% → 96.4%, +5.4% gain)"
                    />
                    <span
                      className={`inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded font-mono text-[10.5px] font-bold border leading-none shrink-0 ${
                        isLight
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                          : 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                      }`}
                      title="Continuous compliance health +5.4% vs baseline"
                    >
                      <TrendingUp className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>+5.4%</span>
                    </span>
                  </div>
                )}
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold border shrink-0 justify-self-start whitespace-nowrap ${
                  isLight
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                }`}>
                  A+ Posture
                </span>
                <p className="col-span-full text-sm mt-0.5 flex items-center space-x-1 text-[var(--skanda-text-muted)] truncate">
                  <TrendingUp className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span className="truncate">Velocity: <span className="font-semibold font-mono text-emerald-600 dark:text-emerald-400">+5.4%</span> vs Q2 baseline</span>
                </p>
              </div>

              {onOpenScoreModal && (
                <button
                  type="button"
                  onClick={onOpenScoreModal}
                  className={`p-1.5 rounded-lg border transition shrink-0 justify-self-end ${
                    isLight
                      ? 'hover:bg-slate-100 text-slate-500 hover:text-indigo-600 border-slate-200'
                      : 'hover:bg-slate-800 text-slate-400 hover:text-indigo-300 border-slate-700'
                  }`}
                  title="Inspect Deterministic Scoring Methodology"
                >
                  <Info className="w-4 h-4" />
                </button>
              )}
            </div>

            {widget.size !== 'compact' && (
              <div className={`p-2.5 rounded-xl border transition-all duration-200 hover:scale-[1.01] space-y-2 ${
                isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-950/50 border-slate-800/80'
              }`}>
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Continuous Health Index
                  </span>
                  <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    Deterministic 5-Pillar Weight
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 text-[10px] text-center font-mono">
                  <div className="p-1 rounded bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50">
                    <span className="block font-bold text-indigo-700 dark:text-indigo-300">ISO 27001</span>
                    <span className="text-slate-500">74%</span>
                  </div>
                  <div className="p-1 rounded bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/50">
                    <span className="block font-bold text-sky-700 dark:text-sky-300">MAS TRM</span>
                    <span className="text-slate-500">82%</span>
                  </div>
                  <div className="p-1 rounded bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50">
                    <span className="block font-bold text-purple-700 dark:text-purple-300">SOC 2</span>
                    <span className="text-slate-500">68%</span>
                  </div>
                  <div className="p-1 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50">
                    <span className="block font-bold text-amber-700 dark:text-amber-300">ISO 42001</span>
                    <span className="text-slate-500">31%</span>
                  </div>
                </div>
              </div>
            )}

            {widget.size === 'expanded' && (
              <div className={`pt-2 border-t flex items-center justify-between text-xs ${
                isLight ? 'border-slate-200 text-slate-600' : 'border-slate-800 text-slate-400'
              }`}>
                <span>Pillars: Controls (35%) • Vault (25%) • CAPA (20%) • Clauses (10%) • Risk (10%)</span>
                <button
                  type="button"
                  onClick={onOpenScoreModal}
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  Inspect Math
                </button>
              </div>
            )}
          </div>
        );
      }

      case 'controls_effective': {
        return (
          <div className="flex flex-col justify-between h-full space-y-2">
            <div className="grid grid-cols-[1fr_auto] items-start gap-x-2 gap-y-1">
              <div className="grid grid-cols-[auto_1fr] sm:grid-cols-[auto_auto_1fr] items-baseline gap-2 min-w-0">
                <span className="text-2xl sm:text-[26px] font-black font-mono tracking-tight text-[var(--skanda-text-heading)] leading-none truncate">
                  95%
                </span>
                {density !== 'compact' && (
                  <div className="inline-flex items-center space-x-1.5 shrink-0">
                    <MiniSparkline
                      data={[88, 89, 89, 90, 90, 91, 91, 92, 92, 92, 93, 93, 93, 94, 94, 94, 95, 95, 95, 95]}
                      trendDirection="up"
                      isPositive={true}
                      color="emerald"
                      width={46}
                      height={18}
                      title="30-Day Control Effectiveness (88% → 95%, +7% gain)"
                    />
                    <span
                      className={`inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded font-mono text-[10.5px] font-bold border leading-none shrink-0 ${
                        isLight
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                          : 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                      }`}
                      title="Control operational effectiveness +3.2% vs previous audit"
                    >
                      <TrendingUp className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>+3.2%</span>
                    </span>
                  </div>
                )}
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold border shrink-0 justify-self-start whitespace-nowrap ${
                  isLight
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                }`}>
                  88 / 93 Verified
                </span>
                <p className="col-span-full text-sm text-[var(--skanda-text-muted)] truncate">
                  5 controls remediating • Target: ≥ 90%
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateModule('control_library')}
                className={`p-1.5 rounded-lg border transition shrink-0 justify-self-end ${
                  isLight
                    ? 'hover:bg-slate-100 text-slate-500 hover:text-indigo-600 border-slate-200'
                    : 'hover:bg-slate-800 text-slate-400 hover:text-indigo-300 border-slate-700'
                }`}
                title="Inspect Master Control Library"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {widget.size !== 'compact' && (
              <div className={`p-2 rounded-lg border text-xs space-y-1 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800'
              }`}>
                <div className="flex justify-between text-[11px] font-mono">
                  <span>Operational: 88</span>
                  <span className="text-amber-600">Remediating: 5</span>
                  <span className="text-emerald-600">Failed: 0</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="h-full bg-emerald-500 w-[95%]" />
                  <div className="h-full bg-amber-400 w-[5%]" />
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'audit_readiness': {
        return (
          <div className="flex flex-col justify-between h-full space-y-2">
            <div className="grid grid-cols-[1fr_auto] items-start gap-x-2 gap-y-1">
              <div className="grid grid-cols-[auto_1fr] sm:grid-cols-[auto_auto_1fr] items-baseline gap-2 min-w-0">
                <span className="text-2xl sm:text-[26px] font-black font-mono tracking-tight text-[var(--skanda-text-heading)] leading-none truncate">
                  98%
                </span>
                {density !== 'compact' && (
                  <div className="inline-flex items-center space-x-1.5 shrink-0">
                    <MiniSparkline
                      data={[86, 88, 89, 90, 91, 91, 92, 93, 94, 94, 95, 95, 96, 96, 97, 97, 97, 98, 98, 98]}
                      trendDirection="up"
                      isPositive={true}
                      color="purple"
                      width={46}
                      height={18}
                      title="30-Day Audit Readiness (86% → 98%, +12% sprint gain)"
                    />
                    <span
                      className={`inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded font-mono text-[10.5px] font-bold border leading-none shrink-0 ${
                        isLight
                          ? 'bg-purple-50 text-purple-800 border-purple-300 shadow-2xs'
                          : 'bg-purple-950/70 text-purple-300 border-purple-500/40'
                      }`}
                      title="Stage 2 qualification readiness +4.0% milestone completion"
                    >
                      <TrendingUp className="w-3 h-3 text-purple-500 shrink-0" />
                      <span>+4.0%</span>
                    </span>
                  </div>
                )}
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold border shrink-0 justify-self-start whitespace-nowrap ${
                  isLight
                    ? 'bg-purple-50 text-purple-800 border-purple-300'
                    : 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                }`}>
                  Stage 2 Qualified
                </span>
                <p className="col-span-full text-sm text-[var(--skanda-text-muted)] truncate">
                  Surveillance window: 42 days remaining
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateModule('readiness_cert')}
                className={`p-1.5 rounded-lg border transition shrink-0 justify-self-end ${
                  isLight
                    ? 'hover:bg-slate-100 text-slate-500 hover:text-indigo-600 border-slate-200'
                    : 'hover:bg-slate-800 text-slate-400 hover:text-indigo-300 border-slate-700'
                }`}
                title="External Audit Dossier & Certification"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {widget.size !== 'compact' && (
              <div className={`p-2 rounded-lg border text-xs space-y-1 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800'
              }`}>
                <div className="flex justify-between text-[11px]">
                  <span>Stage 1 Doc Review:</span>
                  <span className="font-bold text-emerald-600">100% Locked</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Stage 2 Controls Sample:</span>
                  <span className="font-bold text-indigo-600">97% Verified</span>
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'evidence_vault': {
        return (
          <div className="flex flex-col justify-between h-full space-y-2">
            <div className="grid grid-cols-[1fr_auto] items-start gap-x-2 gap-y-1">
              <div className="grid grid-cols-[auto_1fr] sm:grid-cols-[auto_auto_1fr] items-baseline gap-2 min-w-0">
                <span className="text-2xl sm:text-[26px] font-black font-mono tracking-tight text-[var(--skanda-text-heading)] leading-none truncate">
                  94%
                </span>
                {density !== 'compact' && (
                  <div className="inline-flex items-center space-x-1.5 shrink-0">
                    <MiniSparkline
                      data={[89, 90, 90, 91, 91, 92, 92, 92, 93, 93, 93, 93, 94, 93, 94, 94, 94, 94, 94, 94]}
                      trendDirection="up"
                      isPositive={true}
                      color="emerald"
                      width={46}
                      height={18}
                      title="30-Day Evidence Integrity (89% → 94%, +5% collector sync)"
                    />
                    <span
                      className={`inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded font-mono text-[10.5px] font-bold border leading-none shrink-0 ${
                        isLight
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                          : 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                      }`}
                      title="Cryptographic evidence health up +2.1% across automated collectors"
                    >
                      <TrendingUp className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>+2.1%</span>
                    </span>
                  </div>
                )}
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold border shrink-0 justify-self-start whitespace-nowrap ${
                  isLight
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                }`}>
                  {validEvidenceCount.toLocaleString()} Hashes
                </span>
                <p className="col-span-full text-sm text-[var(--skanda-text-muted)] truncate">
                  100% SHA-256 cryptographic validity • 90d fresh
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateModule('evidence_centre')}
                className={`p-1.5 rounded-lg border transition shrink-0 justify-self-end ${
                  isLight
                    ? 'hover:bg-slate-100 text-slate-500 hover:text-indigo-600 border-slate-200'
                    : 'hover:bg-slate-800 text-slate-400 hover:text-indigo-300 border-slate-700'
                }`}
                title="Open Evidence Vault"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {widget.size !== 'compact' && (
              <div className={`p-2 rounded-lg border text-xs space-y-1 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800'
              }`}>
                <div className="flex justify-between text-[11px]">
                  <span>Fresh (&lt;90 days):</span>
                  <span className="font-mono font-bold text-emerald-600">96%</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Cloud Sync Integrity:</span>
                  <span className="font-mono font-bold text-sky-600">Tamper-Evident</span>
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'framework_alignment': {
        return (
          <div className="flex flex-col justify-between h-full space-y-2">
            <div className="grid grid-cols-[1fr_auto] items-start gap-x-2 gap-y-1">
              <div className="grid grid-cols-[auto_1fr] sm:grid-cols-[auto_auto_1fr] items-baseline gap-2 min-w-0">
                <span className="text-2xl sm:text-[26px] font-black font-mono tracking-tight text-[var(--skanda-text-heading)] leading-none truncate">
                  96.4%
                </span>
                {density !== 'compact' && (
                  <div className="inline-flex items-center space-x-1.5 shrink-0">
                    <MiniSparkline
                      data={[90.5, 91.0, 91.5, 92.0, 92.5, 93.0, 93.5, 93.8, 94.2, 94.5, 94.8, 95.2, 95.5, 95.8, 96.0, 96.1, 96.2, 96.3, 96.4, 96.4]}
                      trendDirection="up"
                      isPositive={true}
                      color="sky"
                      width={46}
                      height={18}
                      title="30-Day Cross-Framework Mapping (90.5% → 96.4%, +5.9% crosswalk reuse)"
                    />
                    <span
                      className={`inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded font-mono text-[10.5px] font-bold border leading-none shrink-0 ${
                        isLight
                          ? 'bg-sky-50 text-sky-800 border-sky-300 shadow-2xs'
                          : 'bg-sky-950/70 text-sky-300 border-sky-500/40'
                      }`}
                      title="Cross-framework control reuse expanded +5.0%"
                    >
                      <TrendingUp className="w-3 h-3 text-sky-500 shrink-0" />
                      <span>+5.0%</span>
                    </span>
                  </div>
                )}
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold border shrink-0 justify-self-start whitespace-nowrap ${
                  isLight
                    ? 'bg-sky-50 text-sky-800 border-sky-300'
                    : 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                }`}>
                  82% Reuse
                </span>
                <p className="col-span-full text-sm text-[var(--skanda-text-muted)] truncate">
                  240+ engineering hours saved via crosswalk
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateModule('cross_framework_crosswalk')}
                className={`p-1.5 rounded-lg border transition shrink-0 justify-self-end ${
                  isLight
                    ? 'hover:bg-slate-100 text-slate-500 hover:text-indigo-600 border-slate-200'
                    : 'hover:bg-slate-800 text-slate-400 hover:text-indigo-300 border-slate-700'
                }`}
                title="Launch Framework Crosswalk Visualizer"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {widget.size !== 'compact' && (
              <div className={`p-2 rounded-lg border text-xs space-y-1 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800'
              }`}>
                <div className="flex justify-between text-[11px]">
                  <span>ISO 27001 ↔ MAS TRM:</span>
                  <span className="font-bold text-sky-600">78% Overlap</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>ISO 27001 ↔ SOC 2:</span>
                  <span className="font-bold text-indigo-600">85% Overlap</span>
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'regulatory_alerts': {
        return (
          <div className="flex flex-col justify-between h-full space-y-2">
            <div className="grid grid-cols-[1fr_auto] items-start gap-x-2 gap-y-1">
              <div className="grid grid-cols-[auto_1fr] sm:grid-cols-[auto_auto_1fr] items-baseline gap-2 min-w-0">
                <span className="text-2xl sm:text-[26px] font-black font-mono tracking-tight text-[var(--skanda-text-heading)] leading-none truncate">
                  4 Monitored
                </span>
                {density !== 'compact' && (
                  <div className="inline-flex items-center space-x-1.5 shrink-0">
                    <MiniSparkline
                      data={[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}
                      trendDirection="flat"
                      isPositive={true}
                      color="emerald"
                      width={46}
                      height={18}
                      title="30-Day Regulatory Breaches: 0 breaches across all jurisdictions"
                    />
                    <span
                      className={`inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded font-mono text-[10.5px] font-bold border leading-none shrink-0 ${
                        isLight
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                          : 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                      }`}
                      title="0 regulatory breaches recorded across all jurisdictions"
                    >
                      <TrendingDown className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>0 Breaches</span>
                    </span>
                  </div>
                )}
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold border shrink-0 justify-self-start whitespace-nowrap ${
                  isLight
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                }`}>
                  Active
                </span>
                <p className="col-span-full text-sm text-[var(--skanda-text-muted)] truncate">
                  MAS TRM guidelines updated • EU AI Act active
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateModule('global_regulatory_news')}
                className={`p-1.5 rounded-lg border transition shrink-0 justify-self-end ${
                  isLight
                    ? 'hover:bg-slate-100 text-slate-500 hover:text-indigo-600 border-slate-200'
                    : 'hover:bg-slate-800 text-slate-400 hover:text-indigo-300 border-slate-700'
                }`}
                title="Review Live Regulatory Intelligence"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {widget.size !== 'compact' && (
              <div className={`p-2 rounded-lg border text-xs space-y-1 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800'
              }`}>
                <div className="flex justify-between text-[11px]">
                  <span>Mandatory Circulars:</span>
                  <span className="font-bold text-amber-600">MAS Cloud Resilience</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Conformity Status:</span>
                  <span className="font-bold text-emerald-600">Compliant</span>
                </div>
              </div>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  const gridSpanClass = getGridSpanClass(widget.size);

  return (
    <motion.div
      initial={false}
      animate={{
        scale: isDragging ? 0.98 : 1,
        opacity: isDragging ? 0.4 : 1
      }}
      transition={{ duration: 0.15 }}
      id={`metric-widget-${widget.id}`}
      className={`relative flex flex-col min-w-0 ${gridSpanClass}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragOver={(e) => onDragOver(e, widget.id)}
      onDragLeave={(e) => onDragLeave(e, widget.id)}
      onDrop={(e) => onDrop(e, widget.id)}
    >
      {/* Drop Target Indicator (Before) */}
      {isDragOver && dropPosition === 'before' && (
        <div className="absolute top-0 left-0 right-0 z-30 h-1 bg-blue-500 rounded-full" />
      )}

      {/* Main Draggable Card Container */}
      <div
        className={`rounded-xl transition-colors duration-150 group flex flex-col h-full overflow-hidden ${
          shouldPulseAlert
            ? isLight
              ? 'kpi-critical-glow ring-2 ring-rose-500/50 border border-rose-400 bg-rose-50/20 shadow-xs'
              : 'kpi-critical-glow ring-2 ring-rose-500/50 border border-rose-500/80 bg-rose-950/20 shadow-md'
            : isLight
            ? 'border border-slate-200/90 bg-white shadow-2xs ' +
              (isReorderMode
                ? 'ring-2 ring-blue-500 border-blue-400'
                : isHovered
                ? 'border-slate-300 shadow-xs'
                : '')
            : 'border border-slate-800 bg-slate-900/90 shadow-xs ' +
              (isReorderMode
                ? 'ring-2 ring-blue-500/60 border-blue-500/50'
                : isHovered
                ? 'border-slate-700'
                : '')
        }`}
      >
        {/* Tactile Drag Handle Header Bar */}
        <div
          draggable
          onDragStart={(e) => onDragStart(e, widget.id)}
          onDragEnd={onDragEnd}
          className={`flex items-center justify-between px-3 py-2 border-b select-none cursor-grab active:cursor-grabbing transition-colors shrink-0 ${
            shouldPulseAlert
              ? isLight
                ? 'bg-rose-100/60 border-rose-200'
                : 'bg-rose-950/60 border-rose-900/60'
              : isLight
              ? priorityIndex === 0
                ? 'bg-gradient-to-r from-amber-50/60 via-slate-50/40 to-transparent border-[var(--skanda-border)]'
                : 'bg-slate-50/80 hover:bg-slate-100/90 border-[var(--skanda-border)]'
              : priorityIndex === 0
              ? 'bg-[#152035] border-[var(--skanda-border)]'
              : 'bg-[#0E1627] hover:bg-[#152035] border-[var(--skanda-border)]'
          }`}
          title="Drag and drop to reorder widget priority"
        >
          {/* Left: Drag grip + Priority badge + Short Title + Alert Beacon */}
          <div className="flex items-center space-x-2 min-w-0">
            <div
              className={`p-1 rounded-md transition-colors flex items-center justify-center shrink-0 ${
                isReorderMode
                  ? 'bg-[#7C3AED] text-white shadow-xs animate-pulse'
                  : isLight
                  ? 'text-slate-400 group-hover:text-indigo-600 hover:bg-slate-200'
                  : 'text-[#7F8BA3] group-hover:text-[#A78BFA] hover:bg-[#1B2639]'
              }`}
              title="Click and drag to rearrange metric priority"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </div>

            {/* Ranking Badge */}
            <span
              className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] border shrink-0 ${priorityBadge.bg}`}
            >
              {PriorityIcon && <PriorityIcon className={`w-2.5 h-2.5 ${priorityBadge.iconColor}`} />}
              <span>{priorityBadge.label}</span>
            </span>

            {/* Widget Short Label */}
            <span className="text-xs font-medium uppercase tracking-wider truncate text-[var(--skanda-text-secondary)]">
              {widget.shortLabel}
            </span>

            {/* Critical Alert Beacon Badge */}
            {shouldPulseAlert && (
              <span
                className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold border shrink-0 transition-colors ${
                  isLight
                    ? 'bg-rose-100 text-rose-900 border-rose-300 shadow-2xs'
                    : 'bg-rose-950/90 text-rose-300 border-rose-500/60 shadow-xs'
                }`}
                title={`CRITICAL ALERT: Metric dropped below configured executive threshold (${criticalThreshold}%)`}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
                </span>
                <span>ALERT &lt;{criticalThreshold}%</span>
              </span>
            )}
          </div>

          {/* Right: Quick Action Controls (Nudge Left/Right, Size Selector) */}
          <div className="flex items-center space-x-1 shrink-0">
            {/* Move Left Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveLeft(widget.id);
              }}
              disabled={priorityIndex === 0}
              className={`p-1 rounded transition disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer ${
                isLight
                  ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                  : 'text-[#7F8BA3] hover:text-[#FFFFFF] hover:bg-[#1B2639] disabled:hover:text-[#7F8BA3]'
              }`}
              title="Move metric left in priority"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>

            {/* Move Right Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveRight(widget.id);
              }}
              disabled={priorityIndex === totalWidgets - 1}
              className={`p-1 rounded transition disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer ${
                isLight
                  ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                  : 'text-[#7F8BA3] hover:text-[#FFFFFF] hover:bg-[#1B2639] disabled:hover:text-[#7F8BA3]'
              }`}
              title="Move metric right in priority"
            >
              <ChevronRight className="w-3 h-3" />
            </button>

            {/* Size Cycler Button (Compact -> Standard -> Expanded) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                cycleSize();
              }}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold transition flex items-center space-x-1 border cursor-pointer ${
                widget.size === 'expanded'
                  ? isLight
                    ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                    : 'bg-[#8B5CF6]/15 text-[#A78BFA] border-[#8B5CF6]/30'
                  : widget.size === 'standard'
                  ? isLight
                    ? 'bg-slate-100 text-slate-800 border-slate-300'
                    : 'bg-[#111A2C] text-[#A7B0C0] border-[#1B2639]'
                  : isLight
                  ? 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  : 'bg-[#0D1424] text-[#7F8BA3] border-[#1B2639] hover:bg-[#111A2C]'
              }`}
              title={`Current size: ${widget.size.toUpperCase()}. Click to cycle (Compact 1x → Standard 2x → Expanded 3x)`}
            >
              <Columns className="w-2.5 h-2.5" />
              <span>{widget.size === 'expanded' ? '3x Wide' : widget.size === 'standard' ? '2x' : '1x'}</span>
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className={`${density === 'compact' ? 'p-2.5 sm:p-3' : 'p-3.5 sm:p-4'} flex-1 flex flex-col justify-between`}>
          {renderWidgetContent()}
        </div>
      </div>

      {/* Drop Target Indicator (After) */}
      {isDragOver && dropPosition === 'after' && (
        <div className="absolute bottom-0 left-0 right-0 z-30 h-1 bg-blue-500 rounded-full" />
      )}
    </motion.div>
  );
};
