import React, { useState, useMemo } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  ShieldCheck,
  Eye,
  EyeOff,
  Filter,
  RefreshCw,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Flame,
  CheckCircle2,
  X,
  Clock,
  FileCheck2,
  SlidersHorizontal,
  Layers,
  ArrowRight
} from 'lucide-react';
import { RiskSeverityLevel } from '../../services/complianceHeatmapService';

export interface RiskCategoryDistribution {
  total: number;
  counts: Record<RiskSeverityLevel, number>;
  percentages: Record<RiskSeverityLevel, number>;
  openFindings: Record<RiskSeverityLevel, number>;
  avgScores: Record<RiskSeverityLevel, number>;
}

export interface RiskCategoryLegendProps {
  theme: 'dark' | 'light' | 'midnight' | string;
  selectedCategories: RiskSeverityLevel[];
  onToggleCategory: (category: RiskSeverityLevel) => void;
  onSelectAllCategories: () => void;
  onIsolateCategory: (category: RiskSeverityLevel) => void;
  onSetCategories?: (categories: RiskSeverityLevel[]) => void;
  filterDisplayMode: 'dim' | 'hide';
  onToggleDisplayMode: (mode: 'dim' | 'hide') => void;
  distribution?: RiskCategoryDistribution;
  totalIntersections?: number;
  compactBarOnly?: boolean;
}

export interface DetailedRiskCategory {
  level: RiskSeverityLevel;
  title: string;
  shortLabel: string;
  badgeCode: string;
  scoreRange: string;
  exposureBand: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  swatchBg: string;
  borderColor: string;
  lightCardBg: string;
  darkCardBg: string;
  lightInactiveBg: string;
  darkInactiveBg: string;
  activeRing: string;
  badgeActiveLight: string;
  badgeActiveDark: string;
  slaDays: number;
  slaLabel: string;
  operationalImpact: string;
  auditEvidenceExpectation: string;
  mandatoryRemediation: string;
  regulatoryBreachRisk: string;
}

export const RISK_CATEGORY_DEFINITIONS: DetailedRiskCategory[] = [
  {
    level: 'CRITICAL',
    title: 'Critical Residual Risk',
    shortLabel: 'Critical',
    badgeCode: 'CRIT',
    scoreRange: '< 40%',
    exposureBand: 'Exposure Index ≥ 75',
    icon: AlertOctagon,
    accentColor: '#f43f5e',
    swatchBg: 'bg-rose-500',
    borderColor: 'border-rose-500',
    lightCardBg: 'bg-rose-50/80 hover:bg-rose-100/80 border-rose-300 text-rose-950',
    darkCardBg: 'bg-rose-950/40 hover:bg-rose-950/60 border-rose-700/60 text-rose-100',
    lightInactiveBg: 'bg-slate-100/70 border-slate-300 text-slate-400 opacity-60',
    darkInactiveBg: 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-50',
    activeRing: 'ring-2 ring-rose-500 shadow-md shadow-rose-500/25',
    badgeActiveLight: 'bg-rose-500/20 text-rose-700 border-rose-500/40',
    badgeActiveDark: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    slaDays: 7,
    slaLabel: '7-Day Emergency SLA',
    operationalImpact:
      'Severe control deficiency or absent technical safeguards exposing critical production assets, cryptographic keys, or sensitive customer records to acute compromise.',
    auditEvidenceExpectation:
      'Absence of audit-grade verification logs, expired policy signoffs, or failed penetration testing. Triggers automatic Major Non-Conformity (MNC).',
    mandatoryRemediation:
      'Issue immediate board-level CAPA escalation, dispatch emergency incident response leads, and quarantine affected digital endpoints.',
    regulatoryBreachRisk: 'Statutory 1-hour MAS TRM incident notification threshold risk'
  },
  {
    level: 'HIGH',
    title: 'High Residual Risk',
    shortLabel: 'High',
    badgeCode: 'HIGH',
    scoreRange: '40% – 59%',
    exposureBand: 'Exposure Index 55 – 74',
    icon: AlertTriangle,
    accentColor: '#f97316',
    swatchBg: 'bg-orange-500',
    borderColor: 'border-orange-500',
    lightCardBg: 'bg-orange-50/80 hover:bg-orange-100/80 border-orange-300 text-orange-950',
    darkCardBg: 'bg-orange-950/40 hover:bg-orange-950/60 border-orange-700/60 text-orange-100',
    lightInactiveBg: 'bg-slate-100/70 border-slate-300 text-slate-400 opacity-60',
    darkInactiveBg: 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-50',
    activeRing: 'ring-2 ring-orange-500 shadow-md shadow-orange-500/25',
    badgeActiveLight: 'bg-orange-500/20 text-orange-700 border-orange-500/40',
    badgeActiveDark: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    slaDays: 30,
    slaLabel: '30-Day Mandatory SLA',
    operationalImpact:
      'Repeatable processes in project silos, but inconsistent cross-departmental enforcement leaves substantial gaps in patch cycles, access reviews, or encryption.',
    auditEvidenceExpectation:
      'Partial documentation exists; evidence chains have sampling gaps. Verification passes with conditional remarks; Minor Non-Conformity (mNC) expected.',
    mandatoryRemediation:
      'Mandate automated configuration baselines (CIS Level 2), close open penetration testing tickets, and verify vendor supply chain attestations.',
    regulatoryBreachRisk: 'Supervisory remediation notice under MAS TRM statutory inspection'
  },
  {
    level: 'MEDIUM',
    title: 'Medium Residual Risk',
    shortLabel: 'Medium',
    badgeCode: 'MED',
    scoreRange: '60% – 74%',
    exposureBand: 'Exposure Index 35 – 54',
    icon: Info,
    accentColor: '#f59e0b',
    swatchBg: 'bg-amber-500',
    borderColor: 'border-amber-500',
    lightCardBg: 'bg-amber-50/80 hover:bg-amber-100/80 border-amber-300 text-amber-950',
    darkCardBg: 'bg-amber-950/40 hover:bg-amber-950/60 border-amber-700/60 text-amber-100',
    lightInactiveBg: 'bg-slate-100/70 border-slate-300 text-slate-400 opacity-60',
    darkInactiveBg: 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-50',
    activeRing: 'ring-2 ring-amber-500 shadow-md shadow-amber-500/25',
    badgeActiveLight: 'bg-amber-500/20 text-amber-700 border-amber-500/40',
    badgeActiveDark: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    slaDays: 60,
    slaLabel: '60-Day Remediation SLA',
    operationalImpact:
      'Standardized security procedures are formally defined and operational across the enterprise, but lack automated telemetry or continuous drift verification.',
    auditEvidenceExpectation:
      'Traceable, versioned evidence binders aligned to ISO 27001 clauses. Satisfies baseline external audit sampling with low residual risk.',
    mandatoryRemediation:
      'Instrument quantitative Key Risk Indicators (KRIs), automate periodic control checks, and integrate SIEM alert thresholds into the SOC.',
    regulatoryBreachRisk: 'Standard audit observation requiring corrective action plan'
  },
  {
    level: 'LOW',
    title: 'Low / Controlled Risk',
    shortLabel: 'Low',
    badgeCode: 'LOW',
    scoreRange: '75% – 100%',
    exposureBand: 'Exposure Index < 35',
    icon: ShieldCheck,
    accentColor: '#10b981',
    swatchBg: 'bg-emerald-500',
    borderColor: 'border-emerald-500',
    lightCardBg: 'bg-emerald-50/80 hover:bg-emerald-100/80 border-emerald-300 text-emerald-950',
    darkCardBg: 'bg-emerald-950/40 hover:bg-emerald-950/60 border-emerald-700/60 text-emerald-100',
    lightInactiveBg: 'bg-slate-100/70 border-slate-300 text-slate-400 opacity-60',
    darkInactiveBg: 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-50',
    activeRing: 'ring-2 ring-emerald-500 shadow-md shadow-emerald-500/25',
    badgeActiveLight: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/40',
    badgeActiveDark: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    slaDays: 90,
    slaLabel: '90-Day Continual Review',
    operationalImpact:
      'Controls are quantitatively managed, statistically controlled, or self-healing with zero-touch telemetry and continuous posture validation.',
    auditEvidenceExpectation:
      'Automated SIEM telemetry, cryptographic SHA-256 evidence digests, and continuous compliance verification. Predictable zero-deficiency audits.',
    mandatoryRemediation:
      'Maintain continuous control telemetry, execute proactive red-team exercises, and benchmark threat posture against evolving TTPs.',
    regulatoryBreachRisk: 'Full regulatory compliance readiness & zero reportable gap'
  }
];

export const RiskCategoryLegend: React.FC<RiskCategoryLegendProps> = ({
  theme,
  selectedCategories,
  onToggleCategory,
  onSelectAllCategories,
  onIsolateCategory,
  onSetCategories,
  filterDisplayMode,
  onToggleDisplayMode,
  distribution,
  totalIntersections = 63,
  compactBarOnly = false
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showAuxiliaryGuide, setShowAuxiliaryGuide] = useState<boolean>(false);

  const total = distribution?.total || totalIntersections || 1;
  const counts = distribution?.counts || { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  const percentages = distribution?.percentages || {
    CRITICAL: Math.round((counts.CRITICAL / total) * 100),
    HIGH: Math.round((counts.HIGH / total) * 100),
    MEDIUM: Math.round((counts.MEDIUM / total) * 100),
    LOW: Math.round((counts.LOW / total) * 100)
  };
  const openFindings = distribution?.openFindings || { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };

  const allSelected = selectedCategories.length === 4;
  const noneSelected = selectedCategories.length === 0;
  const elevatedOnly =
    selectedCategories.length === 2 &&
    selectedCategories.includes('CRITICAL') &&
    selectedCategories.includes('HIGH');

  // Compute total active cells in view based on selection
  const activeCellsCount = useMemo(() => {
    return selectedCategories.reduce((acc, cat) => acc + (counts[cat] || 0), 0);
  }, [selectedCategories, counts]);

  // Handle Quick Presets
  const handleElevatedOnly = () => {
    if (onSetCategories) {
      onSetCategories(['CRITICAL', 'HIGH']);
    } else {
      if (!selectedCategories.includes('CRITICAL')) onToggleCategory('CRITICAL');
      if (!selectedCategories.includes('HIGH')) onToggleCategory('HIGH');
      if (selectedCategories.includes('MEDIUM')) onToggleCategory('MEDIUM');
      if (selectedCategories.includes('LOW')) onToggleCategory('LOW');
    }
  };

  const handleInvertSelection = () => {
    const all: RiskSeverityLevel[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
    const inverted = all.filter(c => !selectedCategories.includes(c));
    if (onSetCategories) {
      onSetCategories(inverted);
    } else {
      all.forEach(c => onToggleCategory(c));
    }
  };

  // =========================================================================
  // 1. Compact Mode: Sleek Matrix-Top Toolbar Strip
  // =========================================================================
  if (compactBarOnly) {
    return (
      <div
        id="risk-category-filter-toolbar"
        className={`p-3 rounded-2xl border transition-all ${
          theme === 'light'
            ? 'bg-slate-50/90 border-slate-200 shadow-xs'
            : 'bg-slate-900/80 border-slate-800 shadow-sm'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Section Title & Active Intersections Counter */}
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-500 border border-indigo-500/30">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                  Filter by Residual Risk Severity
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-500 font-bold border border-indigo-500/30">
                  {activeCellsCount} / {total} Active
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Click risk categories below to toggle matrix cell visibility in real time.
              </p>
            </div>
          </div>

          {/* Center: 4 Interactive Risk Category Toggle Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {RISK_CATEGORY_DEFINITIONS.map(cat => {
              const isSelected = selectedCategories.includes(cat.level);
              const count = counts[cat.level] || 0;
              const Icon = cat.icon;

              return (
                <div key={cat.level} className="relative flex items-center group">
                  <button
                    onClick={() => onToggleCategory(cat.level)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                      isSelected
                        ? theme === 'light'
                          ? cat.lightCardBg + ' ' + cat.activeRing
                          : cat.darkCardBg + ' ' + cat.activeRing
                        : theme === 'light'
                        ? cat.lightInactiveBg
                        : cat.darkInactiveBg
                    }`}
                    title={
                      isSelected
                        ? `Click to hide ${cat.title} (${count} cells)`
                        : `Click to show ${cat.title} (${count} cells)`
                    }
                    aria-pressed={isSelected}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: cat.accentColor }}
                    />
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{cat.shortLabel}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/10">
                      {count}
                    </span>
                    {isSelected ? (
                      <Eye className="w-3 h-3 text-emerald-500 ml-0.5 shrink-0" />
                    ) : (
                      <EyeOff className="w-3 h-3 text-slate-400 ml-0.5 shrink-0" />
                    )}
                  </button>

                  {/* Quick Isolate Button on Hover */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onIsolateCategory(cat.level);
                    }}
                    className={`ml-1 px-1.5 py-1 rounded text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border ${
                      theme === 'light'
                        ? 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-indigo-600'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-indigo-400'
                    }`}
                    title={`Isolate: show only ${cat.title}`}
                  >
                    Only
                  </button>
                </div>
              );
            })}
          </div>

          {/* Right: Quick Presets & Display Mode Switcher */}
          <div className="flex items-center space-x-2 flex-wrap">
            {/* Display Mode: Dim vs Blank Out */}
            <div
              className={`flex items-center p-0.5 rounded-lg border text-[11px] font-medium ${
                theme === 'light' ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-800'
              }`}
              title="Change how non-matching cells are visualized in the matrix"
            >
              <button
                onClick={() => onToggleDisplayMode('dim')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  filterDisplayMode === 'dim'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Dim
              </button>
              <button
                onClick={() => onToggleDisplayMode('hide')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  filterDisplayMode === 'hide'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Blank Out
              </button>
            </div>

            {/* Reset / Presets */}
            {!allSelected && (
              <button
                onClick={onSelectAllCategories}
                className="px-2.5 py-1 rounded-xl text-xs font-bold text-indigo-500 hover:bg-indigo-500/10 cursor-pointer flex items-center space-x-1"
                title="Show all 4 risk categories"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Show All</span>
              </button>
            )}

            <button
              onClick={handleElevatedOnly}
              className={`px-2.5 py-1 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                elevatedOnly
                  ? 'bg-rose-500 text-white border-rose-600 font-bold'
                  : 'border-slate-300 dark:border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
              title="Show only Critical and High residual risks"
            >
              High &amp; Crit
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. Full Comprehensive Interactive Risk Category Legend Region
  // =========================================================================
  return (
    <section
      id="risk-severity-category-legend"
      role="region"
      aria-label="Residual Risk Severity & Audit Remediation Legend"
      className={`mt-6 rounded-2xl border transition-all duration-200 ${
        theme === 'light'
          ? 'bg-white/95 border-slate-200/90 shadow-sm'
          : 'bg-slate-900/90 border-slate-800/90 shadow-lg'
      }`}
    >
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200/70 dark:border-slate-800/70">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <h3 className={`text-base font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  Dynamic Residual Risk Category Legend &amp; Filtering
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/15 text-rose-500 border border-rose-500/30">
                  Critical &bull; High &bull; Medium &bull; Low
                </span>
                {!allSelected && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-500 border border-indigo-500/30 flex items-center space-x-1">
                    <Filter className="w-2.5 h-2.5" />
                    <span>{selectedCategories.length} of 4 Categories Active ({activeCellsCount} cells)</span>
                  </span>
                )}
              </div>
              <p className={`text-xs mt-0.5 leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                Synthesized risk taxonomy evaluating Inherent Threat Weighting, audit non-conformities, and control coverage across ISO 27001, MAS TRM, and ISO 27701.
              </p>
            </div>
          </div>

          {/* Quick Filter Actions */}
          <div className="flex items-center space-x-2 flex-wrap shrink-0">
            <button
              onClick={onSelectAllCategories}
              disabled={allSelected}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                allSelected
                  ? 'opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400'
                  : 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-500 cursor-pointer shadow-xs'
              }`}
            >
              <RefreshCw className="w-3 h-3" />
              <span>Select All</span>
            </button>

            <button
              onClick={handleElevatedOnly}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                elevatedOnly
                  ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span>Elevated Risks</span>
            </button>

            <button
              onClick={handleInvertSelection}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
              title="Invert active risk category selection"
            >
              Invert
            </button>

            {/* Display Mode Toggle */}
            <div
              className={`flex items-center p-0.5 rounded-xl border text-xs font-medium ${
                theme === 'light' ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800'
              }`}
            >
              <button
                onClick={() => onToggleDisplayMode('dim')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  filterDisplayMode === 'dim'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Dim non-matching cells in matrix"
              >
                Dim
              </button>
              <button
                onClick={() => onToggleDisplayMode('hide')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  filterDisplayMode === 'hide'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Blank out non-matching cells in matrix"
              >
                Blank Out
              </button>
            </div>

            <button
              onClick={() => setIsExpanded(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                isExpanded
                  ? 'bg-indigo-500 text-white border-indigo-600 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{isExpanded ? 'Compact Cards' : 'Audit Criteria'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Global Multi-Segmented Risk Distribution Bar */}
        <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-2">
              <span>Residual Risk Distribution Across Active Matrix</span>
              <span className="text-slate-400 font-normal">({total} evaluated intersection nodes)</span>
            </span>
            <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
              Active in View: {activeCellsCount} / {total} ({Math.round((activeCellsCount / total) * 100)}%)
            </span>
          </div>

          <div className="w-full h-3.5 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-800 p-0.5 gap-0.5 shadow-inner">
            <button
              onClick={() => onToggleCategory('CRITICAL')}
              style={{ width: `${percentages.CRITICAL}%` }}
              className={`h-full rounded-l-full bg-rose-500 transition-all cursor-pointer hover:brightness-110 relative group ${
                !selectedCategories.includes('CRITICAL') ? 'opacity-30' : ''
              }`}
              title={`Critical Risk: ${counts.CRITICAL} cells (${percentages.CRITICAL}%) - Click to toggle`}
            />
            <button
              onClick={() => onToggleCategory('HIGH')}
              style={{ width: `${percentages.HIGH}%` }}
              className={`h-full bg-orange-500 transition-all cursor-pointer hover:brightness-110 relative group ${
                !selectedCategories.includes('HIGH') ? 'opacity-30' : ''
              }`}
              title={`High Risk: ${counts.HIGH} cells (${percentages.HIGH}%) - Click to toggle`}
            />
            <button
              onClick={() => onToggleCategory('MEDIUM')}
              style={{ width: `${percentages.MEDIUM}%` }}
              className={`h-full bg-amber-500 transition-all cursor-pointer hover:brightness-110 relative group ${
                !selectedCategories.includes('MEDIUM') ? 'opacity-30' : ''
              }`}
              title={`Medium Risk: ${counts.MEDIUM} cells (${percentages.MEDIUM}%) - Click to toggle`}
            />
            <button
              onClick={() => onToggleCategory('LOW')}
              style={{ width: `${percentages.LOW}%` }}
              className={`h-full rounded-r-full bg-emerald-500 transition-all cursor-pointer hover:brightness-110 relative group ${
                !selectedCategories.includes('LOW') ? 'opacity-30' : ''
              }`}
              title={`Low Risk: ${counts.LOW} cells (${percentages.LOW}%) - Click to toggle`}
            />
          </div>
        </div>
      </div>

      {/* 4-Column Interactive Risk Category Cards Grid */}
      <div className="p-4 sm:p-5">
        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
          <span>Toggle any risk category card below to include / exclude it from the matrix view:</span>
          {!allSelected && (
            <button
              onClick={onSelectAllCategories}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer flex items-center space-x-1"
            >
              <X className="w-3 h-3" />
              <span>Reset Filters (Show All 4)</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" role="list">
          {RISK_CATEGORY_DEFINITIONS.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategories.includes(cat.level);
            const cellCount = counts[cat.level] || 0;
            const cellPercentage = percentages[cat.level] || Math.round((cellCount / total) * 100);
            const findings = openFindings[cat.level] || 0;

            return (
              <div
                key={cat.level}
                role="listitem"
                className={`rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between relative overflow-hidden ${
                  isSelected
                    ? theme === 'light'
                      ? cat.lightCardBg + ' ' + cat.activeRing
                      : cat.darkCardBg + ' ' + cat.activeRing
                    : theme === 'light'
                    ? cat.lightInactiveBg
                    : cat.darkInactiveBg
                }`}
              >
                <div>
                  {/* Top Bar: Swatch, Badge, SLA, and Visibility Switch */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs ring-1 ring-black/10 dark:ring-white/10"
                        style={{ backgroundColor: cat.accentColor }}
                      />
                      <span className="font-mono text-xs font-extrabold uppercase tracking-wide">
                        {cat.badgeCode}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                          isSelected
                            ? theme === 'light'
                              ? cat.badgeActiveLight
                              : cat.badgeActiveDark
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {cat.exposureBand}
                      </span>
                    </div>

                    {/* Interactive Toggle Switch */}
                    <button
                      onClick={() => onToggleCategory(cat.level)}
                      className={`p-1.5 rounded-lg border text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700 hover:text-slate-200'
                      }`}
                      title={isSelected ? 'Click to hide this category from matrix' : 'Click to show this category in matrix'}
                      aria-label={`Toggle visibility of ${cat.title}`}
                      aria-pressed={isSelected}
                    >
                      {isSelected ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Active</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Hidden</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Title & Score Band */}
                  <div className="mt-1">
                    <h4 className="text-sm font-extrabold flex items-center space-x-2">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{cat.title}</span>
                    </h4>
                    <div className="flex items-center justify-between mt-1 text-xs">
                      <span className="font-mono font-bold opacity-90">
                        Score Threshold: {cat.scoreRange}
                      </span>
                      <span className="font-mono font-semibold opacity-75">
                        {cellCount} cells ({cellPercentage}%)
                      </span>
                    </div>
                  </div>

                  {/* Metrics Quick Chips */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-black/10 dark:border-white/10 text-[11px]">
                    <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 block">
                        Statutory SLA
                      </span>
                      <span className="font-mono font-bold flex items-center space-x-1 mt-0.5">
                        <Clock className="w-3 h-3 text-indigo-500 shrink-0" />
                        <span className="truncate">{cat.slaLabel}</span>
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 block">
                        Open Findings
                      </span>
                      <span className="font-mono font-bold flex items-center space-x-1 mt-0.5">
                        <Flame className="w-3 h-3 text-rose-500 shrink-0" />
                        <span>{findings} CAPAs</span>
                      </span>
                    </div>
                  </div>

                  {/* Process State Description */}
                  <div className="mt-3 pt-2 border-t border-black/10 dark:border-white/10">
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 block">
                      Operational Severity
                    </span>
                    <p className="text-xs leading-relaxed mt-0.5 font-medium line-clamp-3">
                      {cat.operationalImpact}
                    </p>
                  </div>

                  {/* Expanded Section: Audit Evidence, Action, and Regulatory Breach Risk */}
                  {isExpanded && (
                    <div className="mt-3 pt-2.5 border-t border-black/10 dark:border-white/10 space-y-2 text-[11px]">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 block">
                          External Auditor Evidence Expectation
                        </span>
                        <p className="leading-snug mt-0.5 opacity-90">
                          {cat.auditEvidenceExpectation}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 block">
                          Mandatory Remediation Protocol
                        </span>
                        <p className="leading-snug mt-0.5 opacity-90 font-medium">
                          {cat.mandatoryRemediation}
                        </p>
                      </div>

                      <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 text-[10px]">
                        <span className="font-bold opacity-80 block">Regulatory Compliance Impact:</span>
                        <span className="font-semibold text-rose-600 dark:text-rose-400">
                          {cat.regulatoryBreachRisk}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Action Links */}
                <div className="mt-3.5 pt-2.5 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onToggleCategory(cat.level)}
                    className="font-semibold hover:underline cursor-pointer flex items-center space-x-1 text-slate-600 dark:text-slate-300"
                  >
                    <span>{isSelected ? 'Exclude from Grid' : 'Include in Grid'}</span>
                  </button>

                  <button
                    onClick={() => onIsolateCategory(cat.level)}
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center space-x-1"
                    title={`Isolate: show only ${cat.title} cells in matrix`}
                  >
                    <span>Isolate Category</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Supplementary Audit Guidance Drawer */}
        <div className="mt-4 pt-4 border-t border-slate-200/70 dark:border-slate-800/70">
          <button
            onClick={() => setShowAuxiliaryGuide(prev => !prev)}
            className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
            aria-expanded={showAuxiliaryGuide}
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
            <span>Harmonized GRC Criteria: How Residual Risk Severity Correlates with Inherent Threat Weights &amp; CMMI Tiers</span>
            {showAuxiliaryGuide ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
          </button>

          {showAuxiliaryGuide && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 pt-2 text-xs">
              <div className={`p-3 rounded-xl border ${
                theme === 'light' ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-950/40 border-slate-800'
              }`}>
                <div className="flex items-center space-x-2 font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  <Flame className="w-4 h-4 text-rose-500" />
                  <span>Inherent Threat Weighting Formula</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Effective Exposure = <code>Math.min(100, (100 - Score) × InherentWeight)</code>.
                  Clauses like Annex A.8 (1.8x) or MAS Domain 10 (1.6x) are mathematically amplified, promoting gaps directly into the Critical tier.
                </p>
              </div>

              <div className={`p-3 rounded-xl border ${
                theme === 'light' ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-950/40 border-slate-800'
              }`}>
                <div className="flex items-center space-x-2 font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
                  <span>Dual Filter Matrix Behavior</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  When you toggle risk categories, cells matching unselected categories are either dimmed or masked out.
                  Active KPI cards, export files, and composite scorecards update dynamically to match your filtered view.
                </p>
              </div>

              <div className={`p-3 rounded-xl border ${
                theme === 'light' ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-950/40 border-slate-800'
              }`}>
                <div className="flex items-center space-x-2 font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  <FileCheck2 className="w-4 h-4 text-emerald-500" />
                  <span>Audit Trail Traceability</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Every filtered cell maintains its full forensic lineage: Click any cell to view underlying ISO clauses, MAS requirements, cryptographic evidence hashes, and CAPA remediation history.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default RiskCategoryLegend;
