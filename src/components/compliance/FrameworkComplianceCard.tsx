import React from 'react';
import {
  ShieldCheck,
  Cpu,
  Building2,
  Lock,
  FileCheck2,
  Shield,
  Layers,
  Globe2,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  ArrowRight,
  Clock,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { Tooltip, MetricInfoTooltip } from '../common/Tooltip';
import { DataCollectionRequired } from '../common/DataCollectionRequired';
import {
  FrameworkComplianceItem,
  AuditPeriodOption,
  calculateComplianceTrend
} from '../../utils/complianceTrendCalculator';

interface FrameworkComplianceCardProps {
  framework: FrameworkComplianceItem;
  selectedPeriod: AuditPeriodOption;
  scoreType?: 'executive' | 'operational';
  onNavigateModule?: (moduleId: string) => void;
  compact?: boolean;
}

export const FrameworkComplianceCard: React.FC<FrameworkComplianceCardProps> = ({
  framework,
  selectedPeriod,
  scoreType = 'executive',
  onNavigateModule,
  compact = false
}) => {
  const { theme, currentTenant } = useGRC();
  const isUninitialized = currentTenant?.isDemo || !currentTenant?.soaBaselineLocked || !currentTenant?.readinessScore || currentTenant?.readinessScore === 0;

  const currentScore = scoreType === 'executive' ? framework.executiveScore : framework.operationalScore;
  const previousScore = scoreType === 'executive'
    ? framework.previousScores[selectedPeriod.id].executive
    : framework.previousScores[selectedPeriod.id].operational;

  const trend = calculateComplianceTrend(currentScore, previousScore, selectedPeriod);

  // Icon mapping
  const renderIcon = () => {
    const iconClass = `w-4 h-4 ${theme === 'light' ? framework.lightColor : framework.color}`;
    switch (framework.iconName) {
      case 'ShieldCheck': return <ShieldCheck className={iconClass} />;
      case 'Cpu': return <Cpu className={iconClass} />;
      case 'Building2': return <Building2 className={iconClass} />;
      case 'Lock': return <Lock className={iconClass} />;
      case 'FileCheck2': return <FileCheck2 className={iconClass} />;
      case 'Shield': return <Shield className={iconClass} />;
      case 'Layers': return <Layers className={iconClass} />;
      case 'Globe2': return <Globe2 className={iconClass} />;
      default: return <ShieldCheck className={iconClass} />;
    }
  };

  const isPositive = trend.direction === 'up';
  const isNegative = trend.direction === 'down';

  // Professional ISO / Regulatory Display Formatter
  const getFrameworkDisplay = () => {
    switch (framework.id) {
      case 'iso_27001':
        return {
          title: 'ISO/IEC 27001',
          edition: '2022 • 93 Controls',
          authority: 'ISO/IEC',
          statusShort: 'Stage 1 & 2 Ready'
        };
      case 'mas_trm':
        return {
          title: 'MAS TRM',
          edition: '2024 Guidelines',
          authority: 'MAS (SG)',
          statusShort: 'Critical Compliant'
        };
      case 'soc_2':
        return {
          title: 'SOC 2 Type II',
          edition: 'TSC 2017 Criteria',
          authority: 'AICPA (US)',
          statusShort: 'Observation Window'
        };
      case 'iso_42001':
        return {
          title: 'ISO/IEC 42001',
          edition: '2023 • AI Governance',
          authority: 'ISO/IEC',
          statusShort: 'SoA Ratified'
        };
      case 'gdpr':
        return {
          title: 'GDPR & DPDPA',
          edition: 'EU & India Privacy',
          authority: 'EU / IN',
          statusShort: 'DPA Attested'
        };
      case 'iso_27701':
        return {
          title: 'ISO/IEC 27701',
          edition: '2019 • PIMS Controls',
          authority: 'ISO/IEC',
          statusShort: 'PIMS Scoped'
        };
      case 'dpdpa':
        return {
          title: 'India DPDPA',
          edition: '2023 Privacy Act',
          authority: 'DPB (IN)',
          statusShort: 'Consent Active'
        };
      case 'ndpr':
        return {
          title: 'Nigeria NDPA',
          edition: 'Data Protection Act',
          authority: 'NDPC (NG)',
          statusShort: 'Audit Filing Ready'
        };
      default:
        return {
          title: framework.code || framework.name,
          edition: framework.standardVersion.split('•')[0].trim(),
          authority: framework.jurisdiction.includes('(')
            ? framework.jurisdiction.split('(')[1].replace(')', '')
            : framework.jurisdiction,
          statusShort: framework.status
        };
    }
  };

  const display = getFrameworkDisplay();

  return (
    <div
      onClick={() => onNavigateModule?.(framework.targetModuleId)}
      className={`rounded-2xl transition-all flex flex-col justify-between group border border-[var(--skanda-border)] bg-[var(--skanda-bg-elevated)] cursor-pointer ${
        compact ? 'p-3.5' : 'p-4'
      } ${
        theme === 'light'
          ? 'hover:border-indigo-400 hover:shadow-lg shadow-[0_1px_3px_rgba(15,23,42,0.04),0_6px_16px_-4px_rgba(15,23,42,0.04)] hover:-translate-y-0.5'
          : 'hover:border-[#384966] hover:border-indigo-500/50 shadow-md hover:-translate-y-0.5'
      }`}
    >
      {/* Top Bar: Icon + Framework Code & Name + Authority Badge */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center space-x-2.5 min-w-0 flex-1">
            <div
              className={`p-2 rounded-xl border shrink-0 transition shadow-2xs ${
                theme === 'light' ? framework.lightBgColor : framework.bgColor
              }`}
            >
              {renderIcon()}
            </div>
            <div className="min-w-0 flex-1">
              <h4
                className="text-xs font-bold leading-snug truncate text-[var(--skanda-text-primary)]"
                title={framework.name}
              >
                {display.title}
              </h4>
              <p
                className="text-[11px] font-mono leading-tight mt-0.5 truncate text-[var(--skanda-text-secondary)] font-medium"
                title={framework.standardVersion}
              >
                {display.edition}
              </p>
            </div>
          </div>

          {/* Compact Authority / Scope Badge */}
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded-md shrink-0 border font-semibold whitespace-nowrap ${
              theme === 'light'
                ? 'bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
                : 'bg-slate-950 text-slate-300 border-slate-800'
            }`}
            title={framework.jurisdiction}
          >
            {display.authority}
          </span>
        </div>

        {/* Middle Score & Trend Indicator Row (No overlap, proper alignment) */}
        <div className="mt-3.5 flex items-center justify-between gap-2">
          {isUninitialized ? (
            <DataCollectionRequired
              variant="badge"
              title="Data collection required"
              theme={theme === 'light' ? 'light' : 'dark'}
            />
          ) : (
            <>
              <Tooltip
                title={`${framework.name} Readiness`}
                badge={`${currentScore.toFixed(1)}%`}
                content={`Calculated audit preparedness score across ${framework.totalControls} mandatory technical & governance controls.`}
                formula={`(Tested Controls / ${framework.totalControls}) × 50% + Evidence Freshness × 30% + Audit Sign-offs × 20%`}
                benchmark="Benchmark: ≥ 90% for accredited audit qualification."
                position="top"
              >
                <div className="cursor-help flex items-baseline space-x-1.5 shrink-0">
                  <span
                    className="text-2xl sm:text-3xl font-black font-mono tracking-tight leading-none transition text-[var(--skanda-text-primary)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                  >
                    {currentScore.toFixed(1)}%
                  </span>
                  <span
                    className="text-[11px] font-mono uppercase font-semibold text-[var(--skanda-text-secondary)]"
                  >
                    score
                  </span>
                </div>
              </Tooltip>

              {/* VISUAL COMPLIANCE TREND INDICATOR (Clear, isolated pill badge) */}
              <Tooltip
                title="Compliance Trend Indicator"
                badge={`${trend.deltaFormatted} (${trend.percentChangeFormatted} rel)`}
                content={`Audit trajectory measured against ${selectedPeriod.label}.`}
                formula={`Current (${currentScore.toFixed(1)}%) - Previous Period (${previousScore.toFixed(1)}%) = ${trend.deltaFormatted}`}
                recommendation={
                  isPositive
                    ? 'Positive upward trajectory. Controls implementation outpacing audit deadlines.'
                    : isNegative
                    ? 'Score regression detected. New findings or expired evidence requires immediate CAPA.'
                    : 'Steady posture. Maintain evidence refresh cadence.'
                }
                position="left"
              >
                <div
                  className={`h-6 px-2.5 inline-flex items-center justify-center space-x-1.5 rounded-md border font-mono text-xs font-bold transition shadow-2xs cursor-help shrink-0 whitespace-nowrap leading-none ${
                    isPositive
                      ? theme === 'light'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                      : isNegative
                      ? theme === 'light'
                        ? 'bg-rose-50 text-rose-800 border-rose-300'
                        : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                      : theme === 'light'
                      ? 'bg-slate-100 text-slate-700 border-slate-300'
                      : 'bg-slate-850 text-slate-300 border-slate-700'
                  }`}
                >
                  {isPositive && <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                  {isNegative && <TrendingDown className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                  {!isPositive && !isNegative && <Minus className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                  <span className="whitespace-nowrap leading-none">{trend.deltaFormatted}</span>
                </div>
              </Tooltip>
            </>
          )}
        </div>

        {/* Visual Progress Bar with Baseline Metadata Row */}
        <div className="mt-2.5 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span
              className="truncate max-w-[155px] text-[var(--skanda-text-secondary)]"
              title={`Previous Audit Baseline (${selectedPeriod.shortLabel}): ${previousScore.toFixed(1)}%`}
            >
              Baseline ({selectedPeriod.shortLabel}):{' '}
              <strong className="text-[var(--skanda-text-primary)]">
                {previousScore.toFixed(1)}%
              </strong>
            </span>
            <span
              className={`font-semibold shrink-0 whitespace-nowrap ${
                isPositive
                  ? theme === 'light' ? 'text-emerald-700' : 'text-emerald-300'
                  : isNegative
                  ? theme === 'light' ? 'text-rose-700' : 'text-rose-300'
                  : 'text-[var(--skanda-text-secondary)]'
              }`}
            >
              {isPositive ? '▲ Velocity Gain' : isNegative ? '▼ Action Req.' : 'Steady'}
            </span>
          </div>

          <div
            className={`h-2 w-full rounded-full overflow-hidden relative ${
              theme === 'light' ? 'bg-slate-100 border border-slate-200' : 'bg-slate-950 border border-slate-800'
            }`}
          >
            {/* Current Score Progress */}
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                currentScore >= 90
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : currentScore >= 75
                  ? 'bg-gradient-to-r from-indigo-500 to-sky-400'
                  : 'bg-gradient-to-r from-amber-500 to-orange-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, currentScore))}%` }}
            />

            {/* Previous Audit Period Marker Tick */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-slate-400 shadow-xs z-10"
              style={{ left: `${Math.min(99, Math.max(1, previousScore))}%` }}
              title={`Previous Audit Baseline: ${previousScore.toFixed(1)}%`}
            />
          </div>
        </div>

        {/* Secondary Sub-metrics Grid (3 crisp columns) */}
        <div
          className="grid grid-cols-3 gap-1.5 mt-3 pt-2.5 border-t border-[var(--skanda-border)] text-[11px]"
        >
          <div className="min-w-0">
            <span className="text-[10px] block font-medium truncate text-[var(--skanda-text-secondary)]">Controls</span>
            <span
              className="font-mono font-bold truncate block text-[var(--skanda-text-primary)]"
            >
              {framework.testedControls}/{framework.totalControls}
            </span>
          </div>
          <div className="min-w-0">
            <span className="text-[10px] block font-medium truncate text-[var(--skanda-text-secondary)]">Evidence</span>
            <span
              className="font-mono font-bold truncate block text-[var(--skanda-text-primary)]"
            >
              {framework.evidencePct}%
            </span>
          </div>
          <div className="min-w-0">
            <span className="text-[10px] block font-medium truncate text-[var(--skanda-text-secondary)]">Findings</span>
            <span
              className={`font-mono font-bold flex items-center space-x-0.5 truncate ${
                framework.openFindings === 0
                  ? 'text-emerald-500'
                  : framework.criticalFindings > 0
                  ? 'text-rose-400'
                  : 'text-amber-400'
              }`}
            >
              <span className="truncate">{framework.openFindings} open</span>
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Footer: Status + Target Window + Navigate Action */}
      <div
        className="mt-3 pt-2.5 border-t border-[var(--skanda-border)] flex items-center justify-between text-xs gap-2"
      >
        <div className="flex items-center space-x-1.5 min-w-0 flex-1">
          <CheckCircle2
            className={`w-3.5 h-3.5 shrink-0 ${
              theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'
            }`}
          />
          <span
            className="text-[11px] font-semibold truncate text-[var(--skanda-text-secondary)]"
            title={framework.status}
          >
            {display.statusShort}
          </span>
        </div>

        {onNavigateModule && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigateModule(framework.targetModuleId);
            }}
            className={`px-2 py-1 rounded-lg border transition flex items-center space-x-1 text-[11px] font-semibold shrink-0 cursor-pointer ${
              theme === 'light'
                ? 'bg-slate-50 hover:bg-indigo-50 text-indigo-700 border-slate-200 hover:border-indigo-300'
                : 'bg-slate-950 hover:bg-indigo-950/50 text-indigo-300 border-slate-800 hover:border-indigo-500/50'
            }`}
            title={`Open ${framework.name} Workbench`}
          >
            <span>Workbench</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
