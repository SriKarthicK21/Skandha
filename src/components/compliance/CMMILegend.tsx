import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Minus,
  ShieldCheck,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Layers,
  HelpCircle,
  Activity,
  FileCheck,
  Eye
} from 'lucide-react';
import { MATURITY_TIERS, MaturityTierInfo } from './ComplianceHeatmap';

export interface CMMILegendProps {
  theme: 'dark' | 'light' | 'midnight' | string;
  activeTierFilter?: 'ALL' | 1 | 2 | 3 | 4 | 5;
  onSelectTierFilter?: (tier: 'ALL' | 1 | 2 | 3 | 4 | 5) => void;
  maturityDistribution?: {
    total: number;
    counts: Record<number, number>;
    avgScore: number;
    avgMaturity: string;
    l1Pct: number;
    l2Pct: number;
    l3Pct: number;
    l4Pct: number;
    l5Pct: number;
  };
  totalIntersections?: number;
}

interface DetailedCMMILevel {
  tier: 1 | 2 | 3 | 4 | 5;
  title: string;
  shortLabel: string;
  badgeCode: string;
  scoreRange: string;
  riskRating: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'CONTROLLED' | 'OPTIMIZED';
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  swatchBg: string;
  borderColor: string;
  lightCardBg: string;
  darkCardBg: string;
  activeRing: string;
  processState: string;
  operationalDescription: string;
  auditEvidenceExpectation: string;
  recommendedAction: string;
  auditFrequency: string;
}

const CMMI_DETAILED_LEVELS: DetailedCMMILevel[] = [
  {
    tier: 1,
    title: 'Initial / Ad-Hoc',
    shortLabel: 'L1 Initial',
    badgeCode: 'CMMI-1',
    scoreRange: '0% – 39%',
    riskRating: 'CRITICAL',
    icon: AlertOctagon,
    accentColor: '#f43f5e',
    swatchBg: 'bg-rose-500',
    borderColor: 'border-rose-500',
    lightCardBg: 'bg-rose-50/70 hover:bg-rose-100/70 border-rose-200 text-rose-950',
    darkCardBg: 'bg-rose-950/30 hover:bg-rose-950/50 border-rose-800/60 text-rose-100',
    activeRing: 'ring-2 ring-rose-500 shadow-md shadow-rose-500/20',
    processState: 'Unpredictable, Unstandardized & Reactive',
    operationalDescription:
      'Security controls are ad-hoc, informal, or neglected. Outcomes depend on heroics without repeatable processes; critical control gaps produce acute exposure.',
    auditEvidenceExpectation:
      'Evidence is absent, outdated, or incomplete. Fails verification walkthroughs; triggers immediate Major Non-Conformity (MNC).',
    recommendedAction:
      'Issue immediate CAPA escalation, assign risk owners, establish baseline technical safeguards, and notify Risk Committee.',
    auditFrequency: 'Continuous weekly remediation reviews'
  },
  {
    tier: 2,
    title: 'Developing / Managed',
    shortLabel: 'L2 Developing',
    badgeCode: 'CMMI-2',
    scoreRange: '40% – 59%',
    riskRating: 'HIGH',
    icon: AlertTriangle,
    accentColor: '#f97316',
    swatchBg: 'bg-orange-500',
    borderColor: 'border-orange-500',
    lightCardBg: 'bg-orange-50/70 hover:bg-orange-100/70 border-orange-200 text-orange-950',
    darkCardBg: 'bg-orange-950/30 hover:bg-orange-950/50 border-orange-800/60 text-orange-100',
    activeRing: 'ring-2 ring-orange-500 shadow-md shadow-orange-500/20',
    processState: 'Repeatable at Project / Department Level',
    operationalDescription:
      'Controls are planned and executed according to policy within specific teams, but enforcement remains siloed, largely manual, and inconsistent across departments.',
    auditEvidenceExpectation:
      'Basic documentation exists, but evidence trails have sampling gaps. Verification passes partially; minor non-conformities common.',
    recommendedAction:
      'Centralize SOPs in the governance repository, eliminate single-person dependencies, and institute structured monthly review cycles.',
    auditFrequency: 'Monthly department compliance reviews'
  },
  {
    tier: 3,
    title: 'Defined / Standardized',
    shortLabel: 'L3 Defined',
    badgeCode: 'CMMI-3',
    scoreRange: '60% – 74%',
    riskRating: 'MODERATE',
    icon: Info,
    accentColor: '#f59e0b',
    swatchBg: 'bg-amber-500',
    borderColor: 'border-amber-500',
    lightCardBg: 'bg-amber-50/70 hover:bg-amber-100/70 border-amber-200 text-amber-950',
    darkCardBg: 'bg-amber-950/30 hover:bg-amber-950/50 border-amber-800/60 text-amber-100',
    activeRing: 'ring-2 ring-amber-500 shadow-md shadow-amber-500/20',
    processState: 'Standardized Organization-Wide',
    operationalDescription:
      'Security procedures and controls are comprehensively documented, formally approved, and consistently operationalized across all business units.',
    auditEvidenceExpectation:
      'Traceable, versioned evidence binders aligned to ISO 27001 and MAS TRM domains. Satisfies standard regulatory compliance thresholds.',
    recommendedAction:
      'Introduce quantitative Key Risk Indicators (KRIs), automate periodic control checks, and conduct cross-functional peer walkthroughs.',
    auditFrequency: 'Quarterly enterprise internal audits'
  },
  {
    tier: 4,
    title: 'Quantitatively Managed',
    shortLabel: 'L4 Managed',
    badgeCode: 'CMMI-4',
    scoreRange: '75% – 89%',
    riskRating: 'CONTROLLED',
    icon: CheckCircle2,
    accentColor: '#10b981',
    swatchBg: 'bg-emerald-500',
    borderColor: 'border-emerald-500',
    lightCardBg: 'bg-emerald-50/70 hover:bg-emerald-100/70 border-emerald-200 text-emerald-950',
    darkCardBg: 'bg-emerald-950/30 hover:bg-emerald-950/50 border-emerald-800/60 text-emerald-100',
    activeRing: 'ring-2 ring-emerald-500 shadow-md shadow-emerald-500/20',
    processState: 'Measured & Statistically Controlled',
    operationalDescription:
      'Processes and control effectiveness are quantitatively monitored using automated metrics and statistical tolerances with minimal control drift.',
    auditEvidenceExpectation:
      'Automated telemetry, SIEM log captures, and cryptographic evidence hashes. High audit predictability with low sampling variance.',
    recommendedAction:
      'Expand automated continuous monitoring pipelines to secondary cloud services and establish predictive drift alert thresholds.',
    auditFrequency: 'Bi-annual external audit & continuous telemetry'
  },
  {
    tier: 5,
    title: 'Optimized / Continuous Assurance',
    shortLabel: 'L5 Optimized',
    badgeCode: 'CMMI-5',
    scoreRange: '90% – 100%',
    riskRating: 'OPTIMIZED',
    icon: Sparkles,
    accentColor: '#6366f1',
    swatchBg: 'bg-indigo-500',
    borderColor: 'border-indigo-500',
    lightCardBg: 'bg-indigo-50/70 hover:bg-indigo-100/70 border-indigo-200 text-indigo-950',
    darkCardBg: 'bg-indigo-950/30 hover:bg-indigo-950/50 border-indigo-800/60 text-indigo-100',
    activeRing: 'ring-2 ring-indigo-500 shadow-md shadow-indigo-500/20',
    processState: 'Automated Continuous Assurance & Self-Healing',
    operationalDescription:
      'Continuous compliance verification, real-time automated posture validation, self-healing controls, and proactive mitigation informed by threat intel.',
    auditEvidenceExpectation:
      'Zero-touch continuous audit evidence trails, real-time posture attestations, and end-to-end evidence hash chaining.',
    recommendedAction:
      'Benchmark controls against evolving state-sponsored threats, share best practices across industry peers, and optimize control cost-efficiency.',
    auditFrequency: 'Continuous real-time audit readiness'
  }
];

export const CMMILegend: React.FC<CMMILegendProps> = ({
  theme,
  activeTierFilter = 'ALL',
  onSelectTierFilter,
  maturityDistribution,
  totalIntersections
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showAuxiliaryGuide, setShowAuxiliaryGuide] = useState<boolean>(true);
  const [highContrastMode, setHighContrastMode] = useState<boolean>(false);

  const total = maturityDistribution?.total || totalIntersections || 1;
  const counts = maturityDistribution?.counts || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  const handleCardClick = (tier: 1 | 2 | 3 | 4 | 5) => {
    if (!onSelectTierFilter) return;
    if (activeTierFilter === tier) {
      onSelectTierFilter('ALL');
    } else {
      onSelectTierFilter(tier);
    }
  };

  return (
    <section
      id="cmmi-maturity-legend"
      role="region"
      aria-label="CMMI Process & Regulatory Maturity Legend"
      className={`mt-6 rounded-2xl border transition-all duration-200 ${
        theme === 'light'
          ? 'bg-white/95 border-slate-200/90 shadow-sm'
          : 'bg-slate-900/90 border-slate-800/90 shadow-lg'
      }`}
    >
      {/* Top Legend Header & Summary Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200/70 dark:border-slate-800/70">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2 flex-wrap">
                  <h3 className={`text-sm sm:text-base font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    CMMI Process &amp; Regulatory Maturity Legend
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    Levels 1 – 5
                  </span>
                  {activeTierFilter !== 'ALL' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center space-x-1">
                      <Filter className="w-2.5 h-2.5" />
                      <span>Filtered to Level {activeTierFilter}</span>
                      <button
                        onClick={() => onSelectTierFilter?.('ALL')}
                        className="ml-1 hover:text-rose-800 dark:hover:text-rose-200 cursor-pointer"
                        title="Clear filter"
                        aria-label="Clear active maturity filter"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
                <p className={`text-xs mt-0.5 leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                  Standardized 5-tier evaluation framework defining process maturity, control rigor, and audit evidence expectations across ISO 27001, MAS TRM, and NIST CSF.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions & Accessibility Toggles */}
          <div className="flex items-center space-x-2 flex-wrap shrink-0">
            <button
              onClick={() => setHighContrastMode(prev => !prev)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                highContrastMode
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-950 dark:border-white shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Enhance card borders and color contrast for accessibility"
              aria-pressed={highContrastMode}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">High Contrast:</span>
              <span>{highContrastMode ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => setIsExpanded(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                isExpanded
                  ? 'bg-indigo-500 text-white border-indigo-600 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isExpanded ? 'Collapse detailed audit descriptions' : 'Expand full audit and evidence criteria'}
              aria-expanded={isExpanded}
            >
              <span>{isExpanded ? 'Compact Cards' : 'Detailed Audit Criteria'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Global Distribution Bar */}
        <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
              <span>Maturity Distribution Across Active Grid</span>
              <span className="text-slate-400 font-normal">({total} evaluated intersections)</span>
            </span>
            <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
              Org Average: CMMI Level {maturityDistribution?.avgMaturity || '3.2'} ({maturityDistribution?.avgScore || 68}%)
            </span>
          </div>

          <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-800 p-0.5 gap-0.5">
            <div
              style={{ width: `${(counts[1] / total) * 100}%` }}
              className="h-full rounded-l-full bg-rose-500 transition-all duration-300"
              title={`Level 1 Initial: ${counts[1]} cells (${Math.round((counts[1] / total) * 100)}%)`}
            />
            <div
              style={{ width: `${(counts[2] / total) * 100}%` }}
              className="h-full bg-orange-500 transition-all duration-300"
              title={`Level 2 Developing: ${counts[2]} cells (${Math.round((counts[2] / total) * 100)}%)`}
            />
            <div
              style={{ width: `${(counts[3] / total) * 100}%` }}
              className="h-full bg-amber-500 transition-all duration-300"
              title={`Level 3 Defined: ${counts[3]} cells (${Math.round((counts[3] / total) * 100)}%)`}
            />
            <div
              style={{ width: `${(counts[4] / total) * 100}%` }}
              className="h-full bg-emerald-500 transition-all duration-300"
              title={`Level 4 Managed: ${counts[4]} cells (${Math.round((counts[4] / total) * 100)}%)`}
            />
            <div
              style={{ width: `${(counts[5] / total) * 100}%` }}
              className="h-full rounded-r-full bg-indigo-500 transition-all duration-300"
              title={`Level 5 Optimized: ${counts[5]} cells (${Math.round((counts[5] / total) * 100)}%)`}
            />
          </div>
        </div>
      </div>

      {/* 5-Column CMMI Level Cards Grid */}
      <div className="p-4 sm:p-5">
        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
          <span>Click any tier card below to spotlight/isolate matching matrix cells:</span>
          {activeTierFilter !== 'ALL' && (
            <button
              onClick={() => onSelectTierFilter?.('ALL')}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer flex items-center space-x-1"
            >
              <X className="w-3 h-3" />
              <span>Reset Matrix Spotlight</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5" role="list">
          {CMMI_DETAILED_LEVELS.map(level => {
            const Icon = level.icon;
            const isSelected = activeTierFilter === level.tier;
            const cellCount = counts[level.tier] || 0;
            const cellPercentage = Math.round((cellCount / total) * 100);

            return (
              <button
                key={level.tier}
                onClick={() => handleCardClick(level.tier)}
                role="listitem"
                aria-pressed={isSelected}
                aria-label={`CMMI Level ${level.tier}: ${level.title}. Score band ${level.scoreRange}. ${cellCount} cells in grid. Click to filter.`}
                className={`text-left rounded-xl p-3.5 border transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                  theme === 'light' ? level.lightCardBg : level.darkCardBg
                } ${
                  isSelected
                    ? level.activeRing
                    : highContrastMode
                    ? 'border-slate-400 dark:border-slate-600'
                    : 'border-slate-200/80 dark:border-slate-800/80 hover:scale-[1.01]'
                }`}
              >
                {/* Level Top Header: Badge, Level Number, and Filter State */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1.5">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-xs ring-1 ring-black/10 dark:ring-white/10"
                        style={{ backgroundColor: level.accentColor }}
                        aria-hidden="true"
                      />
                      <span className="font-mono text-xs font-extrabold uppercase tracking-wide">
                        {level.badgeCode}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                        level.riskRating === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30'
                          : level.riskRating === 'HIGH'
                          ? 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30'
                          : level.riskRating === 'MODERATE'
                          ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30'
                          : level.riskRating === 'CONTROLLED'
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                          : 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30'
                      }`}
                    >
                      {level.riskRating}
                    </span>
                  </div>

                  {/* Title & Score Band */}
                  <div className="mt-1">
                    <h4 className="text-sm font-extrabold flex items-center space-x-1.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{level.title}</span>
                    </h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-mono font-bold opacity-90">
                        Score: {level.scoreRange}
                      </span>
                      <span className="text-[11px] font-mono font-semibold opacity-75">
                        {cellCount} areas ({cellPercentage}%)
                      </span>
                    </div>
                  </div>

                  {/* Process State Description */}
                  <div className="mt-2.5 pt-2 border-t border-black/10 dark:border-white/10">
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 block">
                      Process Characteristics
                    </span>
                    <p className="text-xs leading-relaxed mt-0.5 font-medium line-clamp-3">
                      {level.operationalDescription}
                    </p>
                  </div>

                  {/* Expanded Section: Audit Evidence, Action, and Cadence */}
                  {isExpanded && (
                    <div className="mt-3 pt-2.5 border-t border-black/10 dark:border-white/10 space-y-2 text-[11px]">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 block">
                          Audit Evidence Expectation
                        </span>
                        <p className="leading-snug mt-0.5 opacity-90">
                          {level.auditEvidenceExpectation}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 block">
                          Mandatory Remediation Action
                        </span>
                        <p className="leading-snug mt-0.5 opacity-90 font-medium">
                          {level.recommendedAction}
                        </p>
                      </div>

                      <div className="pt-1 flex items-center justify-between text-[10px] opacity-75">
                        <span>Review Cadence:</span>
                        <span className="font-semibold">{level.auditFrequency}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Filter Prompt */}
                <div className="mt-3 pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[10px] font-semibold">
                  <span className="opacity-75">
                    {isSelected ? '✓ Active in Matrix' : 'Click to spotlight'}
                  </span>
                  <span className="underline decoration-dotted opacity-90 group-hover:opacity-100">
                    {isSelected ? 'Reset' : 'Filter Grid'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Auxiliary Guides: Trend Arrows, Micro-Sparklines & Matrix Interactions */}
        <div className="mt-4 pt-4 border-t border-slate-200/70 dark:border-slate-800/70">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowAuxiliaryGuide(prev => !prev)}
              className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
              aria-expanded={showAuxiliaryGuide}
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
              <span>Supplementary Interpretation: Trend Symbols, Sparklines, &amp; Residual Risk Scoring</span>
              {showAuxiliaryGuide ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
            </button>
          </div>

          {showAuxiliaryGuide && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 pt-2 text-xs">
              {/* 1. Trajectory & Trends */}
              <div className={`p-3 rounded-xl border ${
                theme === 'light' ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-950/40 border-slate-800'
              }`}>
                <div className="flex items-center space-x-2 font-bold text-slate-800 dark:text-slate-200 mb-2">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  <span>Audit Trajectory &amp; Sparklines</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center text-emerald-500 font-bold font-mono">
                      <ArrowUp className="w-3 h-3 mr-0.5" /> +Δ%
                    </span>
                    <span>Score progression from prior audit cycle.</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center text-rose-500 font-bold font-mono">
                      <ArrowDown className="w-3 h-3 mr-0.5" /> -Δ%
                    </span>
                    <span>Maturity regression or newly discovered gap.</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center text-slate-400 font-bold font-mono">
                      <Minus className="w-3 h-3 mr-0.5" /> 0%
                    </span>
                    <span>Stable maturity across consecutive assessments.</span>
                  </div>
                  <div className="pt-1 text-[10px] text-slate-500 border-t border-slate-200 dark:border-slate-800">
                    Micro-sparklines trace 5 historical audit cycles (Cycle 1 &rarr; Active Assessment).
                  </div>
                </div>
              </div>

              {/* 2. Residual Risk Tiers */}
              <div className={`p-3 rounded-xl border ${
                theme === 'light' ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-950/40 border-slate-800'
              }`}>
                <div className="flex items-center space-x-2 font-bold text-slate-800 dark:text-slate-200 mb-2">
                  <ShieldCheck className="w-4 h-4 text-rose-500" />
                  <span>Residual Risk Calculation</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Residual risk is synthesized from <strong>Inherent Threat Weight</strong> (configured in the Threat Engine) combined with <strong>Control Effectiveness</strong> and <strong>Unresolved Findings</strong>:
                </p>
                <div className="grid grid-cols-2 gap-1.5 mt-2 text-[10px] font-mono font-bold">
                  <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-center">
                    CRITICAL (&ge;75)
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30 text-center">
                    HIGH (55–74)
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-center">
                    MEDIUM (35–54)
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-center">
                    LOW (&lt;35)
                  </span>
                </div>
              </div>

              {/* 3. Interactive Matrix Navigation */}
              <div className={`p-3 rounded-xl border ${
                theme === 'light' ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-950/40 border-slate-800'
              }`}>
                <div className="flex items-center space-x-2 font-bold text-slate-800 dark:text-slate-200 mb-2">
                  <FileCheck className="w-4 h-4 text-emerald-500" />
                  <span>Forensic Drill-Down &amp; CAPA</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  <p>
                    <strong>Click any cell</strong> in the matrix to open the forensic inspection drawer or modal.
                  </p>
                  <ul className="list-disc pl-3.5 space-y-0.5 text-[10px]">
                    <li>Inspect specific underlying controls &amp; test logs.</li>
                    <li>Verify cryptographic evidence hashes &amp; owners.</li>
                    <li>Launch immediate CAPA remediation tasks.</li>
                    <li>Review regulatory cross-framework mappings.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
