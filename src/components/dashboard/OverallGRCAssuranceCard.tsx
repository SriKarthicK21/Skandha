import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  Lock,
  Cpu,
  Info,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Sliders,
  X,
  Target,
  BarChart2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { Tooltip, MetricInfoTooltip } from '../common/Tooltip';
import { KPICard } from './KPICard';
import { useGRC } from '../../context/GRCContext';
import { DataCollectionRequired } from '../common/DataCollectionRequired';

interface OverallGRCAssuranceCardProps {
  overallScore?: number;
  gradeLabel?: string;
  controlsEffectiveness?: number;
  evidenceFreshness?: number;
  capaResolutionRate?: number;
  tenantRisksCount?: number;
  openFindingsCount?: number;
  criticalThreshold?: number;
  isPulsingEnabled?: boolean;
  onNavigateModule?: (moduleId: string) => void;
  className?: string;
  density?: 'compact' | 'expanded';
}

export const OverallGRCAssuranceCard: React.FC<OverallGRCAssuranceCardProps> = ({
  overallScore = 96.4,
  gradeLabel = 'Strong Assurance',
  controlsEffectiveness = 95.2,
  evidenceFreshness = 87.0,
  capaResolutionRate = 71.0,
  tenantRisksCount = 14,
  openFindingsCount = 7,
  criticalThreshold = 85,
  isPulsingEnabled = true,
  onNavigateModule,
  className = '',
  density = 'expanded'
}) => {
  const { theme, currentTenant } = useGRC();
  const isLight = theme === 'light';
  const isUninitialized = currentTenant?.isDemo || !currentTenant?.soaBaselineLocked || !currentTenant?.readinessScore || currentTenant?.readinessScore === 0;
  const [isBreakdownOpen, setIsBreakdownOpen] = useState<boolean>(false);

  // Unified list of all 8 assurance & operational readiness metrics
  const allAssuranceMetrics = [
    {
      id: 'compliance',
      label: 'Compliance',
      icon: ShieldCheck,
      iconTheme: isLight
        ? 'bg-indigo-50 text-indigo-700 border-indigo-200/90'
        : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
      value: '95.2%',
      trendDirection: 'up' as const,
      trendValue: '+2.4%',
      trendIsPositive: true,
      trendLabel: '+2.4% vs last audit baseline',
      sparklineData: [92.8, 93.0, 93.4, 93.5, 93.9, 94.0, 94.2, 94.4, 94.5, 94.7, 94.8, 94.9, 95.0, 95.0, 95.1, 95.1, 95.2, 95.2, 95.2, 95.2],
      secondaryBadge: '35% WT',
      secondaryBadgeType: 'outline' as const,
      statusPill: 'Strong',
      statusType: 'positive' as const,
      progressPercent: 95.2,
      progressBarType: 'positive' as const,
      tooltipTitle: 'Compliance Posture',
      tooltipContent: 'Continuous testing across 93 Annex A & MAS TRM baseline controls.',
      tooltipBadge: '35% WEIGHT'
    },
    {
      id: 'risk_exposure',
      label: 'Risk Exposure',
      icon: ShieldAlert,
      iconTheme: isLight
        ? 'bg-purple-50 text-purple-700 border-purple-200/90'
        : 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      value: '96%',
      trendDirection: 'up' as const,
      trendValue: '+1.8%',
      trendIsPositive: true,
      trendLabel: '+1.8% hedge against risk appetite',
      sparklineData: [94.2, 94.5, 94.6, 94.8, 95.0, 95.1, 95.2, 95.4, 95.5, 95.5, 95.6, 95.7, 95.8, 95.8, 95.9, 95.9, 96.0, 96.0, 96.0, 96.0],
      secondaryBadge: '25% WT',
      secondaryBadgeType: 'outline' as const,
      statusPill: 'Strong',
      statusType: 'positive' as const,
      progressPercent: 96,
      progressBarType: 'positive' as const,
      tooltipTitle: 'Risk Exposure Posture',
      tooltipContent: 'Hedging effectiveness against enterprise risk appetite. Zero critical risks unhedged.',
      tooltipBadge: '25% WEIGHT'
    },
    {
      id: 'evidence',
      label: 'Evidence Health',
      icon: FileCheck2,
      iconTheme: isLight
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/90'
        : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      value: '87%',
      trendDirection: 'up' as const,
      trendValue: '+4.5%',
      trendIsPositive: true,
      trendLabel: '+4.5% cryptographic hashes',
      sparklineData: [82.5, 83.0, 83.4, 83.8, 84.2, 84.5, 85.0, 85.4, 85.8, 86.0, 86.2, 86.4, 86.6, 86.8, 86.9, 87.0, 87.0, 87.0, 87.0, 87.0],
      secondaryBadge: '20% WT',
      secondaryBadgeType: 'outline' as const,
      statusPill: 'Healthy',
      statusType: 'positive' as const,
      progressPercent: 87,
      progressBarType: 'positive' as const,
      tooltipTitle: 'Evidence Health Posture',
      tooltipContent: 'Cryptographic SHA-256 validity of audit workpapers in Evidence Centre.',
      tooltipBadge: '20% WEIGHT'
    },
    {
      id: 'capa',
      label: 'CAPA Remediation',
      icon: Clock,
      iconTheme: isLight
        ? 'bg-amber-50 text-amber-700 border-amber-200/90'
        : 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      value: '71%',
      trendDirection: 'down' as const,
      trendValue: '-3.2%',
      trendIsPositive: false,
      trendLabel: '-3.2% 30d SLA remediation velocity',
      sparklineData: [74.2, 74.0, 73.8, 73.5, 73.2, 73.0, 72.8, 72.5, 72.4, 72.2, 72.0, 71.8, 71.6, 71.5, 71.4, 71.2, 71.0, 71.0, 71.0, 71.0],
      secondaryBadge: '10% WT',
      secondaryBadgeType: 'outline' as const,
      statusPill: 'Attention',
      statusType: 'warning' as const,
      progressPercent: 71,
      progressBarType: 'warning' as const,
      tooltipTitle: 'CAPA Posture',
      tooltipContent: 'Active corrective actions under 30-day remediation SLA. No major non-conformities.',
      tooltipBadge: '10% WEIGHT'
    },
    {
      id: 'ai_gov',
      label: 'AI Governance',
      icon: Cpu,
      iconTheme: isLight
        ? 'bg-sky-50 text-sky-700 border-sky-200/90'
        : 'bg-sky-500/15 text-sky-400 border-sky-500/30',
      value: '91.5%',
      trendDirection: 'up' as const,
      trendValue: '+6.0%',
      trendIsPositive: true,
      trendLabel: '+6.0% ISO 42001 maturity',
      sparklineData: [85.5, 86.0, 86.8, 87.2, 87.9, 88.4, 89.0, 89.5, 90.0, 90.2, 90.5, 90.8, 91.0, 91.2, 91.3, 91.4, 91.5, 91.5, 91.5, 91.5],
      secondaryBadge: '10% WT',
      secondaryBadgeType: 'outline' as const,
      statusPill: 'Strong',
      statusType: 'positive' as const,
      progressPercent: 91.5,
      progressBarType: 'positive' as const,
      tooltipTitle: 'AI Governance Posture',
      tooltipContent: 'ISO/IEC 42001 AI management system readiness and algorithmic impact assessments.',
      tooltipBadge: '10% WEIGHT'
    },
    {
      id: 'open_findings',
      label: 'Open Findings',
      icon: AlertCircle,
      iconTheme: isLight
        ? 'bg-amber-50 text-amber-700 border-amber-200/90'
        : 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      value: `${openFindingsCount || 7}`,
      trendDirection: 'down' as const,
      trendValue: '-2',
      trendIsPositive: true,
      trendInverted: true,
      trendLabel: '2 findings verified and closed',
      sparklineData: [9, 9, 8, 8, 8, 8, 8, 8, 8, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, openFindingsCount || 7],
      secondaryBadge: '3 High',
      secondaryBadgeType: 'negative' as const,
      statusPill: '30d SLA Track',
      statusType: 'neutral' as const,
      progressPercent: 75,
      progressBarType: 'warning' as const,
      tooltipTitle: 'Open Findings',
      tooltipContent: '7 total findings tracked; 3 High severity findings undergoing active corrective action.',
      onClick: () => handleNavigate('findings_capa')
    },
    {
      id: 'critical_risks',
      label: 'Critical Risks',
      icon: AlertTriangle,
      iconTheme: isLight
        ? 'bg-rose-50 text-rose-700 border-rose-200/90'
        : 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      value: '0',
      trendDirection: 'down' as const,
      trendValue: '-1',
      trendIsPositive: true,
      trendInverted: true,
      trendLabel: '1 critical threat mitigated',
      sparklineData: [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      secondaryBadge: 'None',
      secondaryBadgeType: 'neutral' as const,
      statusPill: 'Zero Exposure',
      statusType: 'neutral' as const,
      progressPercent: 100,
      progressBarType: 'positive' as const,
      tooltipTitle: 'Critical Risks',
      tooltipContent: 'Zero unmitigated critical residual risks exceeding board risk tolerance.',
      onClick: () => handleNavigate('risk_map')
    },
    {
      id: 'audit_readiness',
      label: 'Audit Readiness',
      icon: Target,
      iconTheme: isLight
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/90'
        : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      value: 'READY',
      trendDirection: 'up' as const,
      trendValue: '+5.0%',
      trendIsPositive: true,
      trendLabel: 'Stage 2 certification qualified',
      sparklineData: [93.0, 93.5, 94.2, 95.0, 95.5, 96.0, 96.5, 97.0, 97.5, 98.0, 98.5, 99.0, 99.2, 99.5, 99.8, 100, 100, 100, 100, 100],
      valueColor: 'emerald' as const,
      secondaryBadge: 'Stage 2 Pass',
      secondaryBadgeType: 'positive' as const,
      statusPill: 'Surveillance Q2',
      statusType: 'neutral' as const,
      progressPercent: 100,
      progressBarType: 'positive' as const,
      tooltipTitle: 'Audit Readiness',
      tooltipContent: 'External Stage 2 Surveillance audit threshold achieved based on verified controls and zero major NCs.',
      onClick: () => handleNavigate('audit_centre')
    }
  ];

  const handleNavigate = (moduleId: string) => {
    if (onNavigateModule) {
      onNavigateModule(moduleId);
    }
    setIsBreakdownOpen(false);
  };

  if (isUninitialized) {
    return (
      <div
        id="overall-grc-assurance-card"
        className={`rounded-2xl p-6 sm:p-7 border transition-all flex flex-col justify-between ${
          isLight
            ? 'bg-white/72 backdrop-blur-xl border-slate-200/68 text-slate-900 shadow-[0_1px_3px_rgba(15,23,42,0.025),0_12px_28px_-6px_rgba(15,23,42,0.035),inset_0_1px_0_rgba(255,255,255,0.90)]'
            : 'bg-slate-900 border-slate-800 text-white shadow-xl'
        } ${className}`}
      >
        <DataCollectionRequired
          variant="card"
          title="Data collection required"
          description="Overall GRC Assurance and operational readiness metrics cannot be calculated until real control telemetry and evidence artifacts are collected and verified for this organization."
          actionLabel="Configure Real Data Collection"
          onAction={() => handleNavigate('evidence_upload')}
          theme={isLight ? 'light' : 'dark'}
        />
      </div>
    );
  }

  return (
    <>
      <div
        id="overall-grc-assurance-card"
        className={`rounded-2xl p-4 sm:p-5 border transition-all flex flex-col justify-between relative overflow-hidden ${
          isLight
            ? 'bg-white/72 backdrop-blur-xl border-slate-200/68 text-slate-900 shadow-[0_1px_3px_rgba(15,23,42,0.025),0_12px_28px_-6px_rgba(15,23,42,0.035),inset_0_1px_0_rgba(255,255,255,0.90)]'
            : 'bg-slate-900 border-slate-800 text-white shadow-xl'
        } ${className}`}
      >
        {isLight && (
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/5 via-sky-500/3 to-transparent rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />
        )}
        <div className="relative z-10">
          {/* Section Header with WCAG AA Compliant High Contrast */}
          <div
            className={`flex items-center justify-between gap-2 pb-3 border-b ${
              isLight ? 'border-slate-200/65' : 'border-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <h2
                className={`text-sm font-bold tracking-wide flex items-center space-x-2 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                <div className={`p-1.5 rounded-lg border flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-indigo-50 text-indigo-700 border-indigo-200/90 shadow-2xs' : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
                }`}>
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                </div>
                <span className="uppercase tracking-wider font-extrabold text-xs">
                  Overall GRC Assurance
                </span>
              </h2>

              <Tooltip
                title="Overall GRC Assurance"
                content="Overall GRC Assurance is a weighted executive indicator derived from compliance effectiveness, risk exposure, evidence health, remediation performance and governance maturity."
                benchmark="≥ 90% = Strong Assurance | 75–89% = Moderate Assurance | < 75% = Elevated Risk"
                position="bottom"
              >
                <button
                  type="button"
                  className={`p-0.5 rounded cursor-help transition-colors ${
                    isLight
                      ? 'text-slate-400 hover:text-slate-600'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  aria-label="Overall GRC Assurance methodology info"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            </div>

            <button
              type="button"
              onClick={() => setIsBreakdownOpen(true)}
              className={`text-xs font-semibold inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                isLight
                  ? 'bg-indigo-50/70 hover:bg-indigo-100/90 text-indigo-700 border-indigo-200/90 shadow-2xs'
                  : 'bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 border-indigo-800/60'
              }`}
            >
              <span>View Assurance Breakdown</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Primary KPI Hierarchy (96.4% as largest element, badges row, supporting text) */}
          <div className="pt-3 pb-2">
            <div>
              {/* Largest Text Element: 96.4% in Maximum Contrast with Trend Arrow */}
              <div className="flex items-baseline space-x-2">
                <div
                  className={`text-4xl sm:text-[36px] font-bold tracking-tight leading-none ${
                    isLight ? 'text-slate-950' : 'text-white'
                  }`}
                >
                  {overallScore.toFixed(1)}%
                </div>
                <span
                  className={`inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded font-mono text-[11px] font-bold border leading-none shrink-0 ${
                    isLight
                      ? 'text-emerald-800 bg-emerald-50 border-emerald-300 shadow-2xs'
                      : 'text-emerald-300 bg-emerald-950/70 border-emerald-500/40'
                  }`}
                  title="Overall performance improvement: +5.4% QoQ"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>+5.4%</span>
                </span>
              </div>

              {/* Status Badges Row: Strong Assurance | +5.4% QoQ | High Confidence */}
              <div className="flex items-center flex-wrap gap-2 mt-2.5">
                {/* Semantic Status Badge: Green = Strong Assurance */}
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border whitespace-nowrap shrink-0 ${
                    isLight
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                  }`}
                >
                  {gradeLabel}
                </span>

                {/* Quarterly Trend Badge */}
                <span
                  className={`h-6 px-2.5 inline-flex items-center justify-center space-x-1 font-mono text-xs font-semibold rounded-md border whitespace-nowrap shrink-0 leading-none ${
                    isLight
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs'
                      : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap leading-none">+5.4% QoQ</span>
                </span>

                {/* Confidence Level Badge */}
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border whitespace-nowrap shrink-0 ${
                    isLight
                      ? 'bg-slate-100 text-slate-700 border-slate-300 shadow-2xs'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700'
                  }`}
                >
                  High Confidence
                </span>
              </div>
            </div>

            {/* Supporting Text: Clean WCAG AA Contrast without competing with 96.4% */}
            <p
              className={`text-xs mt-2 leading-relaxed ${
                isLight ? 'text-slate-600 font-medium' : 'text-slate-300'
              }`}
            >
              Based on compliance posture, risk exposure, evidence health, remediation performance and governance.
            </p>
          </div>

          {/* Standard Layout Container: CSS Grid with 4 columns for large screens and 2 columns for smaller screens */}
          <div className="mt-3.5 sm:mt-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  isLight ? 'text-slate-700' : 'text-slate-400'
                }`}
              >
                Key Assurance Drivers & Operational Indicators (8 Metrics)
              </span>
              <span
                className={`text-[10px] font-mono ${
                  isLight ? 'text-indigo-700 bg-indigo-50/80 border border-indigo-200/80 px-2 py-0.5 rounded-md font-bold shadow-2xs' : 'text-slate-400'
                }`}
              >
                Weighted Formulation (100%) + Live Controls
              </span>
            </div>

            {/* Responsive CSS Grid: 1 col on mobile, 2 on tablet, 4 on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 auto-rows-fr stagger-cards">
              {allAssuranceMetrics.map((metric) => (
                <div key={metric.id} className="h-full flex flex-col">
                  <KPICard
                    id={`assurance-metric-${metric.id}`}
                    label={metric.label}
                    icon={metric.icon}
                    iconTheme={metric.iconTheme}
                    value={metric.value}
                    valueColor={metric.valueColor}
                    trendDirection={metric.trendDirection}
                    trendValue={metric.trendValue}
                    trendIsPositive={metric.trendIsPositive}
                    trendInverted={metric.trendInverted}
                    trendLabel={metric.trendLabel}
                    sparklineData={metric.sparklineData}
                    secondaryBadge={metric.secondaryBadge}
                    secondaryBadgeType={metric.secondaryBadgeType}
                    statusPill={metric.statusPill}
                    statusType={metric.statusType}
                    progressPercent={metric.progressPercent}
                    progressBarType={metric.progressBarType}
                    criticalThreshold={criticalThreshold}
                    enableAlertPulse={isPulsingEnabled}
                    tooltipTitle={metric.tooltipTitle}
                    tooltipContent={metric.tooltipContent}
                    tooltipBadge={metric.tooltipBadge}
                    onClick={metric.onClick}
                    isLight={isLight}
                    density={density}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Surveillance Audit Gatekeeper Panel (Compact & High Contrast) */}
          <div
            className={`mt-3.5 sm:mt-4 p-2.5 sm:p-3 rounded-xl border transition-all duration-200 hover:scale-[1.01] ${
              isLight
                ? 'bg-slate-50/55 backdrop-blur-md border-slate-200/65 shadow-2xs'
                : 'bg-slate-950/70 border-slate-800'
            }`}
          >
            <div
              className={`flex items-center justify-between pb-1.5 border-b ${
                isLight ? 'border-slate-200/60' : 'border-slate-800'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <ShieldCheck
                  className={`w-3.5 h-3.5 ${
                    isLight ? 'text-emerald-600' : 'text-emerald-400'
                  }`}
                />
                <span
                  className={`text-xs font-bold ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Surveillance Audit Gatekeeper
                </span>
              </div>
              <span
                className={`text-[9.5px] font-mono px-2 py-0.5 rounded-md font-bold border ${
                  isLight
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                }`}
              >
                Accreditation Intact
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1.5 font-mono text-[11px]">
              <div
                className={`p-1.5 rounded-lg border ${
                  isLight
                    ? 'bg-white border-slate-200'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <span
                  className={`text-[9.5px] block font-sans ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Surveillance Cycle
                </span>
                <strong
                  className={`text-xs ${
                    isLight ? 'text-slate-900' : 'text-slate-100'
                  }`}
                >
                  Cycle 1 (Oct 2026)
                </strong>
              </div>

              <div
                className={`p-1.5 rounded-lg border ${
                  isLight
                    ? 'bg-white border-slate-200'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <span
                  className={`text-[9.5px] block font-sans ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Statement of Applicability
                </span>
                <strong
                  className={`text-xs ${
                    isLight ? 'text-slate-900' : 'text-slate-100'
                  }`}
                >
                  v3.2 Ratified (93/93)
                </strong>
              </div>
            </div>

            <div className="mt-1.5 text-[10.5px] leading-relaxed flex items-start space-x-1.5">
              <CheckCircle2
                className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                  isLight ? 'text-emerald-600' : 'text-emerald-400'
                }`}
              />
              <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>
                <strong>Lead Auditor Note:</strong> Zero Major NCs detected. 71% CAPA is within approved 30d SLAs, satisfying UKAS/ANAB surveillance criteria.
              </span>
            </div>
          </div>
        </div>

        {/* Footer / Context Line */}
        <div
          className={`pt-2.5 mt-2.5 border-t flex items-center justify-between text-[11px] ${
            isLight
              ? 'border-slate-200 text-slate-500'
              : 'border-slate-800 text-slate-400'
          }`}
        >
          <span className="truncate pr-2">
            Audit Readiness is independently verified against registrar Stage 2 criteria.
          </span>
          <button
            type="button"
            onClick={() => setIsBreakdownOpen(true)}
            className={`font-semibold shrink-0 cursor-pointer ${
              isLight
                ? 'text-indigo-600 hover:text-indigo-700'
                : 'text-indigo-400 hover:text-indigo-300'
            }`}
          >
            How it&apos;s calculated →
          </button>
        </div>
      </div>

      {/* Assurance Breakdown Detailed Modal */}
      <AnimatePresence>
        {isBreakdownOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={`rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border ${
                isLight
                  ? 'bg-white text-slate-900 border-slate-200'
                  : 'bg-slate-900 text-white border-slate-800'
              }`}
            >
              {/* Modal Header */}
              <div
                className={`flex items-center justify-between border-b pb-3 ${
                  isLight ? 'border-slate-200' : 'border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`p-2 rounded-xl border ${
                      isLight
                        ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                        : 'bg-indigo-950/80 text-indigo-400 border-indigo-800'
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3
                      className={`text-base font-bold ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      Overall GRC Assurance Formulation
                    </h3>
                    <p
                      className={`text-xs ${
                        isLight ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      Transparent weighted executive index calculation & operational integrity
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsBreakdownOpen(false)}
                  className={`p-1 rounded-lg transition cursor-pointer ${
                    isLight
                      ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* High-Level Score Banner */}
              <div
                className={`p-4 rounded-xl border transition-all duration-200 hover:scale-[1.01] flex items-center justify-between gap-3 ${
                  isLight
                    ? 'bg-gradient-to-r from-indigo-50/90 via-white to-emerald-50/80 border-slate-200/90 shadow-2xs'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div>
                  <span
                    className={`text-xs ${
                      isLight ? 'text-slate-500 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    Overall Assurance Score
                  </span>
                  <div className="flex items-baseline space-x-2 mt-0.5">
                    <span
                      className={`text-3xl font-black font-mono ${
                        isLight ? 'text-slate-950' : 'text-white'
                      }`}
                    >
                      {overallScore.toFixed(1)}%
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded border ${
                        isLight
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                          : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                      }`}
                    >
                      {gradeLabel}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs ${
                      isLight ? 'text-slate-500 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    Quarterly Trajectory
                  </span>
                  <span
                    className={`text-sm font-bold font-mono block mt-0.5 ${
                      isLight ? 'text-emerald-700' : 'text-emerald-400'
                    }`}
                  >
                    +5.4% QoQ
                  </span>
                </div>
              </div>

              {/* Mathematical Formula Specification */}
              <div className="space-y-2">
                <span
                  className={`text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${
                    isLight ? 'text-slate-800' : 'text-slate-300'
                  }`}
                >
                  <Sliders
                    className={`w-3.5 h-3.5 ${
                      isLight ? 'text-indigo-600' : 'text-indigo-400'
                    }`}
                  />
                  <span>Weighted Mathematical Formulation</span>
                </span>
                <div
                  className={`p-3 rounded-xl font-mono text-xs border ${
                    isLight
                      ? 'bg-slate-950 text-indigo-300 border-slate-800 shadow-inner'
                      : 'bg-slate-950 text-indigo-300 border-slate-800'
                  }`}
                >
                  Assurance = (Compliance × 35%) + (Risk Exposure × 25%) + (Evidence Health × 20%) + (AI Governance × 10%) + (CAPA Remediation × 10%)
                </div>
              </div>

              {/* Table of Components */}
              <div
                className={`border rounded-xl overflow-hidden shadow-2xs ${
                  isLight ? 'border-slate-200/90 bg-white' : 'border-slate-800'
                }`}
              >
                <table className="w-full text-xs text-left">
                  <thead
                    className={`font-semibold border-b ${
                      isLight
                        ? 'bg-slate-50 text-slate-800 border-slate-200'
                        : 'bg-slate-800/80 text-slate-200 border-slate-800'
                    }`}
                  >
                    <tr>
                      <th className="p-2.5">Assurance Component</th>
                      <th className="p-2.5 text-center">Score</th>
                      <th className="p-2.5 text-center">Weight</th>
                      <th className="p-2.5 text-center">Weighted Pts</th>
                      <th className="p-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y ${
                      isLight
                        ? 'divide-slate-200 text-slate-800'
                        : 'divide-slate-800 text-slate-200'
                    }`}
                  >
                    <tr>
                      <td className="p-2.5 font-medium">
                        <div className="flex items-center space-x-2">
                          <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${
                            isLight ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                          }`}>
                            <ShieldCheck className="w-3 h-3 shrink-0" />
                          </div>
                          <span>Compliance Controls Effectiveness</span>
                        </div>
                      </td>
                      <td
                        className={`p-2.5 text-center font-mono font-bold ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        95.2%
                      </td>
                      <td
                        className={`p-2.5 text-center font-mono ${
                          isLight ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        35%
                      </td>
                      <td
                        className={`p-2.5 text-center font-mono font-bold ${
                          isLight ? 'text-indigo-600' : 'text-indigo-400'
                        }`}
                      >
                        33.32
                      </td>
                      <td className="p-2.5 text-right">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                            isLight
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                          }`}
                        >
                          Strong
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">
                        <div className="flex items-center space-x-2">
                          <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${
                            isLight ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                          }`}>
                            <ShieldAlert className="w-3 h-3 shrink-0" />
                          </div>
                          <span>Enterprise Risk Exposure Management</span>
                        </div>
                      </td>
                      <td
                        className={`p-2.5 text-center font-mono font-bold ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        96.0%
                      </td>
                      <td
                        className={`p-2.5 text-center font-mono ${
                          isLight ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        25%
                      </td>
                      <td
                        className={`p-2.5 text-center font-mono font-bold ${
                          isLight ? 'text-indigo-600' : 'text-indigo-400'
                        }`}
                      >
                        24.00
                      </td>
                      <td className="p-2.5 text-right">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                            isLight
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                          }`}
                        >
                          Strong
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">
                        <div className="flex items-center space-x-2">
                          <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${
                            isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          }`}>
                            <FileCheck2 className="w-3 h-3 shrink-0" />
                          </div>
                          <span>Cryptographic Evidence Integrity</span>
                        </div>
                      </td>
                      <td
                        className={`p-2.5 text-center font-mono font-bold ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        87.0%
                      </td>
                      <td
                        className={`p-2.5 text-center font-mono ${
                          isLight ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        20%
                      </td>
                      <td
                        className={`p-2.5 text-center font-mono font-bold ${
                          isLight ? 'text-indigo-600' : 'text-indigo-400'
                        }`}
                      >
                        17.40
                      </td>
                      <td className="p-2.5 text-right">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                            isLight
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                          }`}
                        >
                          Healthy
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">
                        <div className="flex items-center space-x-2">
                          <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${
                            isLight ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                          }`}>
                            <Cpu className="w-3 h-3 shrink-0" />
                          </div>
                          <span>AI Governance & Policy Maturity</span>
                        </div>
                      </td>
                      <td
                        className={`p-2.5 text-center font-mono font-bold ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        91.5%
                      </td>
                      <td
                        className={`p-2.5 text-center font-mono ${
                          isLight ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        10%
                      </td>
                      <td
                        className={`p-2.5 text-center font-mono font-bold ${
                          isLight ? 'text-indigo-600' : 'text-indigo-400'
                        }`}
                      >
                        9.15
                      </td>
                      <td className="p-2.5 text-right">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                            isLight
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                          }`}
                        >
                          Strong
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">
                        <div className="flex items-center space-x-2">
                          <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${
                            isLight ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          }`}>
                            <Clock className="w-3 h-3 shrink-0" />
                          </div>
                          <span>CAPA & Corrective Action Resolution</span>
                        </div>
                      </td>
                      <td
                        className={`p-2.5 text-center font-mono font-bold ${
                          isLight ? 'text-amber-700' : 'text-amber-300'
                        }`}
                      >
                        71.0%
                      </td>
                      <td
                        className={`p-2.5 text-center font-mono ${
                          isLight ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        10%
                      </td>
                      <td
                        className={`p-2.5 text-center font-mono font-bold ${
                          isLight ? 'text-indigo-600' : 'text-indigo-400'
                        }`}
                      >
                        7.10
                      </td>
                      <td className="p-2.5 text-right">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                            isLight
                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                              : 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                          }`}
                        >
                          Attention
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Explaining Underlying Indicators & Audit Readiness */}
              <div
                className={`p-4 rounded-xl border transition-all duration-200 hover:scale-[1.01] space-y-2.5 text-xs ${
                  isLight
                    ? 'bg-slate-50/80 border-slate-200/90 shadow-2xs'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <h4
                  className={`font-bold flex items-center space-x-1.5 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      isLight ? 'text-emerald-600' : 'text-emerald-400'
                    }`}
                  />
                  <span>Audit Readiness vs. Overall Assurance Explained</span>
                </h4>
                <p
                  className={`leading-relaxed ${
                    isLight ? 'text-slate-600' : 'text-slate-300'
                  }`}
                >
                  The organization does not claim to be &quot;Auditor Ready&quot; simply because the high-level assurance score is 96.4%. Instead, <strong>Audit Readiness</strong> is evaluated as a distinct, measurable gatekeeper indicator.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                  <div
                    className={`p-2.5 rounded-lg border shadow-2xs ${
                      isLight
                        ? 'bg-white border-slate-200/90'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <span
                      className={`block ${
                        isLight ? 'text-slate-500 font-semibold' : 'text-slate-400'
                      }`}
                    >
                      Gate 1: Critical Non-Conformities
                    </span>
                    <strong
                      className={isLight ? 'text-emerald-700' : 'text-emerald-300'}
                    >
                      0 Major Findings (Pass)
                    </strong>
                  </div>
                  <div
                    className={`p-2.5 rounded-lg border shadow-2xs ${
                      isLight
                        ? 'bg-white border-slate-200/90'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <span
                      className={`block ${
                        isLight ? 'text-slate-500 font-semibold' : 'text-slate-400'
                      }`}
                    >
                      Gate 2: CAPA Burn-down
                    </span>
                    <strong
                      className={isLight ? 'text-amber-700' : 'text-amber-300'}
                    >
                      71% On-Track (Approved 30d SLAs)
                    </strong>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div
                className={`flex items-center justify-between pt-2 border-t ${
                  isLight ? 'border-slate-200' : 'border-slate-800'
                }`}
              >
                <span
                  className={`text-xs ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Complies with ISO 27001, SOC 2 Type II, and MAS TRM assurance standards
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleNavigate('findings_capa')}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                      isLight
                        ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                        : 'border-slate-700 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    Inspect CAPA (71%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsBreakdownOpen(false)}
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
