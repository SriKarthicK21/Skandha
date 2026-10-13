import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Download,
  Building2,
  Users,
  Compass,
  Headphones,
  Sliders,
  Activity,
  TrendingUp,
  Award,
  Layers,
  Sparkles,
  ExternalLink,
  Shield,
  FileCheck2,
  Eye,
  X,
  Printer,
  SlidersHorizontal,
  CheckSquare,
  Lock,
  ArrowUpRight,
  Info,
  Calendar,
  Target,
  Zap,
  Gauge,
  ArrowRight,
  Play,
  AlertTriangle,
  Flame,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { RadialProgressIndicator } from '../common/RadialProgressIndicator';
import { useGRC } from '../../context/GRCContext';
import { organizationService } from '../../services/organizationService';
import { ControlItem, EvidenceRecord, InternalAuditPlan, FindingCAPARecord } from '../../types';
import { INITIAL_CLAUSES_DATA, MajorClauseGroup } from '../modules/ISO27001ClausesModule';
import {
  calculateISO27001ReadinessScorecard,
  calculateComplianceForecast,
  ClauseProgress,
  ThemeProgress,
  AuditStageGate,
  ComplianceForecastData,
  CriticalPathControl,
  ComplianceBottleneck
} from '../../utils/readinessScorecardHelper';

interface ISO27001ReadinessScorecardProps {
  controls: ControlItem[];
  evidence?: EvidenceRecord[];
  internalAudits?: InternalAuditPlan[];
  findings?: FindingCAPARecord[];
  onSelectThemeFilter?: (themeCode: string) => void;
  onOpenRemediationDrawer?: (ctrl: ControlItem) => void;
  onNavigateToClauses?: () => void;
}

export const ISO27001ReadinessScorecard: React.FC<ISO27001ReadinessScorecardProps> = ({
  controls,
  evidence = [],
  internalAudits = [],
  findings = [],
  onSelectThemeFilter,
  onOpenRemediationDrawer,
  onNavigateToClauses
}) => {
  const { currentTenant } = useGRC();
  const orgName = organizationService.getOrganizationName(currentTenant);
  const [activeTab, setActiveTab] = useState<'overview' | 'forecast' | 'clauses' | 'annex_a' | 'stage_gates'>('overview');
  const [selectedClause, setSelectedClause] = useState<MajorClauseGroup | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Compliance Forecast Interactive State
  const [customVelocity, setCustomVelocity] = useState<number>(2.2);
  const [selectedScenario, setSelectedScenario] = useState<'conservative' | 'realistic' | 'aggressive' | 'custom'>('realistic');
  const [targetPercent, setTargetPercent] = useState<number>(98);
  const [trajectoryViewMode, setTrajectoryViewMode] = useState<'cards' | 'table'>('cards');

  // Compute scorecard data
  const scorecard = useMemo(() => {
    return calculateISO27001ReadinessScorecard(
      controls,
      INITIAL_CLAUSES_DATA,
      evidence,
      internalAudits,
      findings
    );
  }, [controls, evidence, internalAudits, findings]);

  // Compute dynamic Compliance Forecast based on active velocity & target
  const activeForecast = useMemo(() => {
    return calculateComplianceForecast(
      controls,
      scorecard.overallReadinessPercent,
      customVelocity,
      targetPercent
    );
  }, [controls, scorecard.overallReadinessPercent, customVelocity, targetPercent]);

  const handleScenarioChange = (scenario: 'conservative' | 'realistic' | 'aggressive') => {
    setSelectedScenario(scenario);
    if (scenario === 'conservative') setCustomVelocity(1.0);
    else if (scenario === 'realistic') setCustomVelocity(2.2);
    else if (scenario === 'aggressive') setCustomVelocity(3.8);
  };

  const handlePrintScorecard = () => {
    setIsExporting(true);
    setTimeout(() => {
      window.print();
      setIsExporting(false);
    }, 300);
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden space-y-0">
      {/* Top Banner & Hero Readiness Gauge */}
      <div className="p-6 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border-b border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Title & Metadata */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 px-2.5 py-0.5 rounded bg-indigo-950 border border-indigo-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                ISO/IEC 27001:2022 Certification Scorecard
              </span>
              <span className="text-[11px] font-semibold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {scorecard.readinessLevel}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              ISO 27001 Certification Readiness Scorecard
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Consolidated readiness index aggregating the progress of <strong>Clauses 4–10</strong> (Management System Requirements) and <strong>Annex A Controls</strong> (Technical, Organizational, Physical, and People Safeguards).
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-start lg:self-center">
            <button
              type="button"
              onClick={handlePrintScorecard}
              disabled={isExporting}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-400" />
              <span>Print Scorecard</span>
            </button>
            {onNavigateToClauses && (
              <button
                type="button"
                onClick={onNavigateToClauses}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
              >
                <span>View Clauses 4–10</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Hero Score Cards Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-6 border-t border-slate-800/80">
          {/* Main Overall Readiness Metric */}
          <div className="sm:col-span-2 lg:col-span-2 p-4 rounded-xl bg-slate-950/90 border border-indigo-900/50 flex items-center justify-between gap-4 shadow-inner">
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Certification Readiness
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white flex items-baseline gap-1">
                <span>{scorecard.overallReadinessPercent}%</span>
                <span className="text-xs font-normal text-slate-400">/ 100%</span>
              </div>
              <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{scorecard.auditRecommendation}</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Target: ≥ 85% for Unconditional Audit Recommendation
              </div>
            </div>
            <RadialProgressIndicator
              value={scorecard.overallReadinessPercent}
              size={82}
              strokeWidth={8}
              colorVariant="emerald"
            />
          </div>

          {/* Pillar 1: Clauses 4-10 Metric */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Clauses 4–10 (ISMS)
              </div>
              <div className="text-xl font-bold text-white">
                {scorecard.clausesScorePercent}%
              </div>
              <div className="text-[10px] text-indigo-400 font-medium">
                7 / 7 Clauses Active
              </div>
            </div>
            <RadialProgressIndicator
              value={scorecard.clausesScorePercent}
              size={54}
              strokeWidth={5}
              colorVariant="indigo"
            />
          </div>

          {/* Pillar 2: Annex A Controls Metric */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Annex A Controls
              </div>
              <div className="text-xl font-bold text-white">
                {scorecard.annexAScorePercent}%
              </div>
              <div className="text-[10px] text-sky-400 font-medium">
                93 Total (72 Done, 14 IP)
              </div>
            </div>
            <RadialProgressIndicator
              value={scorecard.annexAScorePercent}
              size={54}
              strokeWidth={5}
              colorVariant="sky"
            />
          </div>

          {/* Pillar 3: Stage 1 Adequacy Metric */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Stage 1 Adequacy
              </div>
              <div className="text-xl font-bold text-white">
                {scorecard.stage1ReadinessPercent}%
              </div>
              <div className="text-[10px] text-emerald-400 font-medium">
                Governance Locked
              </div>
            </div>
            <RadialProgressIndicator
              value={scorecard.stage1ReadinessPercent}
              size={54}
              strokeWidth={5}
              colorVariant="emerald"
            />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="px-6 border-b border-slate-800 bg-slate-950/50 flex items-center space-x-1 overflow-x-auto">
        {[
          { id: 'overview', label: 'Executive Overview', count: null },
          { id: 'forecast', label: 'Compliance Forecast', count: activeForecast.stage2ReadyDate },
          { id: 'clauses', label: 'Clauses 4–10 Progress', count: '7 Clauses' },
          { id: 'annex_a', label: 'Annex A Themes (93 Controls)', count: '4 Themes' },
          { id: 'stage_gates', label: 'Stage 1 vs. Stage 2 Audit Gates', count: '10 Gates' }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 text-xs font-bold transition border-b-2 flex items-center space-x-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-normal ${
                tab.id === 'forecast' 
                  ? 'bg-indigo-900/80 text-indigo-200 border border-indigo-700/50 font-mono' 
                  : 'bg-slate-800 text-slate-300'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="p-6">
        {/* TAB 1: EXECUTIVE OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top 2 Columns: Clauses 4-10 summary & Annex A summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Clauses 4-10 Snapshot */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Clauses 4–10 (Management System)</h3>
                      <p className="text-[11px] text-slate-400">ISO/IEC 27001:2022 Core Clauses</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-indigo-400 font-mono">
                    Score: {scorecard.clausesScorePercent}%
                  </span>
                </div>

                <div className="space-y-2.5">
                  {scorecard.clausesBreakdown.map(clause => (
                    <div
                      key={clause.clauseNumber}
                      onClick={() => {
                        const matched = INITIAL_CLAUSES_DATA.find(c => c.number === clause.clauseNumber);
                        if (matched) setSelectedClause(matched);
                      }}
                      className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 hover:border-indigo-800 transition cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="font-mono text-xs font-bold text-indigo-400 w-16">
                          Clause {clause.clauseNumber}
                        </span>
                        <div className="text-xs font-medium text-slate-200 truncate max-w-xs sm:max-w-sm">
                          {clause.shortTitle}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-20 sm:w-28 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-indigo-500 h-full rounded-full transition-all"
                            style={{ width: `${clause.progressPercent}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-semibold text-slate-300 w-10 text-right">
                          {clause.progressPercent}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('clauses')}
                  className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-300 text-xs font-semibold transition flex items-center justify-center gap-1"
                >
                  <span>Deep Dive into 7 Clauses</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Right: Annex A 4-Themes Snapshot */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-lg bg-sky-950 border border-sky-800 text-sky-400">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Annex A Safeguards (93 Controls)</h3>
                      <p className="text-[11px] text-slate-400">4 Consolidated ISO 27001:2022 Themes</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-sky-400 font-mono">
                    Score: {scorecard.annexAScorePercent}%
                  </span>
                </div>

                <div className="space-y-3">
                  {scorecard.themesBreakdown.map(theme => (
                    <div key={theme.themeNumber} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-mono text-xs font-bold text-sky-400 mr-2">
                            Theme {theme.themeNumber}
                          </span>
                          <span className="text-xs font-medium text-slate-200">{theme.themeName}</span>
                        </div>
                        <span className="font-mono text-xs font-bold text-white">{theme.progressPercent}%</span>
                      </div>

                      {/* Stacked Bar */}
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex">
                        <div
                          className="bg-emerald-500 h-full"
                          style={{ width: `${(theme.implementedCount / theme.totalControls) * 100}%` }}
                          title={`Implemented: ${theme.implementedCount}`}
                        />
                        <div
                          className="bg-amber-500 h-full"
                          style={{ width: `${(theme.inProgressCount / theme.totalControls) * 100}%` }}
                          title={`In Progress: ${theme.inProgressCount}`}
                        />
                        <div
                          className="bg-slate-700 h-full"
                          style={{ width: `${(theme.plannedCount / theme.totalControls) * 100}%` }}
                          title={`Planned: ${theme.plannedCount}`}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            {theme.implementedCount} Done
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            {theme.inProgressCount} In Progress
                          </span>
                          {theme.excludedCount > 0 && (
                            <span className="text-slate-400">({theme.excludedCount} Excluded)</span>
                          )}
                        </div>
                        {onSelectThemeFilter && (
                          <button
                            type="button"
                            onClick={() => onSelectThemeFilter(`theme_${theme.themeNumber}`)}
                            className="text-sky-400 hover:text-sky-300 font-semibold"
                          >
                            Filter Table →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('annex_a')}
                  className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sky-300 text-xs font-semibold transition flex items-center justify-center gap-1"
                >
                  <span>Explore All 93 Controls</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Compliance Forecast Quick Projection Card */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/70 via-slate-950 to-slate-900 border border-indigo-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-indigo-950/20">
              <div className="flex items-start sm:items-center space-x-3.5">
                <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Compliance Forecast Projection
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {activeForecast.auditAlignment.confidenceLevel} Confidence
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                      Velocity: {customVelocity.toFixed(1)} ctrls/wk
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Estimated Stage 2 Certification Readiness: <strong className="text-white font-bold">{activeForecast.stage2ReadyDate}</strong> ({activeForecast.daysUntilStage2Ready} days remaining). Full 100% control closure projected for <strong className="text-indigo-300 font-bold">{activeForecast.fullClosureDate}</strong>.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('forecast')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-indigo-600/20"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Forecast Simulator & Burndown</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </div>
            </div>

            {/* Bottom Audit Readiness Verdict Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 via-slate-950 to-indigo-950/60 border border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">
                    Official Audit Recommendation: {scorecard.auditRecommendation}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  {orgName} is currently eligible for <strong>Stage 1 Adequacy Audit</strong> scheduling. Stage 2 operational readiness is on track at {scorecard.stage2ReadinessPercent}% with 5 priority remediations active.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('stage_gates')}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md flex items-center gap-1.5"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Inspect 10 Audit Gates</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: COMPLIANCE FORECAST & READINESS PROJECTION */}
        {activeTab === 'forecast' && (
          <div className="space-y-6">
            {/* Forecast Simulator Control Bar */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-400">
                      <Zap className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-white">Compliance Forecast Simulator</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                      Predictive Remediation Model
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Estimates ISO 27001 certification readiness date based on the current rate of control remediation across {activeForecast.controlsRemainingCount} remaining In-Progress and Planned controls.
                  </p>
                </div>

                {/* Quick Scenario Selector Pills */}
                <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleScenarioChange('conservative')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      selectedScenario === 'conservative'
                        ? 'bg-slate-800 text-amber-300 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Conservative (1.0/wk)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScenarioChange('realistic')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      selectedScenario === 'realistic'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Realistic (2.2/wk)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScenarioChange('aggressive')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      selectedScenario === 'aggressive'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Aggressive (3.8/wk)
                  </button>
                </div>
              </div>

              {/* Velocity & Target Fine-Tuning Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-900">
                {/* Velocity Slider */}
                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200">
                      <Gauge className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Remediation Velocity:</span>
                      <span className="font-mono font-bold text-indigo-300">
                        {customVelocity.toFixed(1)} controls / week
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ~{(customVelocity * 3).toFixed(1)} milestones/wk
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="5.0"
                    step="0.1"
                    value={customVelocity}
                    onChange={(e) => {
                      setCustomVelocity(parseFloat(e.target.value));
                      setSelectedScenario('custom');
                    }}
                    className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>0.5/wk (Slow review pace)</span>
                    <span>2.2/wk (Current steady state)</span>
                    <span>5.0/wk (Max team sprint capacity)</span>
                  </div>
                </div>

                {/* Target Threshold Selector */}
                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                    <div className="flex items-center space-x-2">
                      <Target className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Target Readiness Level:</span>
                      <span className="font-mono font-bold text-emerald-300">{targetPercent}%</span>
                    </div>
                    <span className="text-[10px] text-emerald-400">
                      {targetPercent >= 98 ? 'Zero-Deficiency Target' : 'Stage 2 Minimum Pass'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 85, label: '85% (Stage 2 Pass)' },
                      { val: 95, label: '95% (Strong Posture)' },
                      { val: 98, label: '98% (Excellence Target)' }
                    ].map(btn => (
                      <button
                        key={btn.val}
                        type="button"
                        onClick={() => setTargetPercent(btn.val)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition border ${
                          targetPercent === btn.val
                            ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Hero Forecast Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Metric 1: Stage 2 Readiness Date */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 text-emerald-500/20">
                  <Award className="w-12 h-12" />
                </div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Stage 2 Readiness Date</span>
                </div>
                <div className="text-2xl font-bold text-emerald-400 font-mono pt-0.5">
                  {activeForecast.stage2ReadyDate}
                </div>
                <div className="text-xs text-slate-300 font-medium">
                  {activeForecast.daysUntilStage2Ready} days from today
                </div>
                <div className="text-[10px] text-emerald-400/80 pt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>All critical controls closed</span>
                </div>
              </div>

              {/* Metric 2: Full 100% Remediation Target */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 text-indigo-500/20">
                  <Target className="w-12 h-12" />
                </div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                  <span>100% Control Closure</span>
                </div>
                <div className="text-2xl font-bold text-indigo-400 font-mono pt-0.5">
                  {activeForecast.fullClosureDate}
                </div>
                <div className="text-xs text-slate-300 font-medium">
                  {activeForecast.daysUntilFullClosure} days remaining
                </div>
                <div className="text-[10px] text-indigo-400/80 pt-1">
                  Zero open Annex A deficiencies
                </div>
              </div>

              {/* Metric 3: Active Burndown Pace */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Burndown Velocity</span>
                </div>
                <div className="text-2xl font-bold text-amber-400 font-mono pt-0.5">
                  {customVelocity.toFixed(1)} <span className="text-xs font-normal text-slate-400">ctrl/wk</span>
                </div>
                <div className="text-xs text-slate-300 font-medium">
                  {activeForecast.milestonesCompletedCount} of {activeForecast.milestonesTotalCount} milestones done
                </div>
                <div className="text-[10px] text-slate-400 pt-1">
                  Historical pace: 2.2 controls/wk
                </div>
              </div>

              {/* Metric 4: External Audit Window Alignment */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                  <span>Audit Window Alignment</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono pt-0.5">
                  {activeForecast.auditAlignment.bufferDays >= 0 ? `+${activeForecast.auditAlignment.bufferDays}` : `${activeForecast.auditAlignment.bufferDays}`} <span className="text-xs font-normal text-slate-400">buffer days</span>
                </div>
                <div className="text-xs text-slate-300 font-medium">
                  Window: {activeForecast.auditAlignment.auditTargetDate}
                </div>
                <div className="text-[10px] text-emerald-400 pt-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Confidence: {activeForecast.auditAlignment.confidenceLevel}</span>
                </div>
              </div>
            </div>

            {/* 3-Scenario Comparative Matrix */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-white">3-Scenario Velocity Benchmark</h4>
                  <p className="text-xs text-slate-400">
                    Comparing timeline outcomes across Conservative, Realistic, and Aggressive remediation cadences.
                  </p>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {activeForecast.controlsRemainingCount} Controls In Scope
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Conservative Scenario */}
                <div
                  onClick={() => handleScenarioChange('conservative')}
                  className={`p-4 rounded-xl cursor-pointer transition border space-y-3 ${
                    selectedScenario === 'conservative'
                      ? 'bg-amber-950/30 border-amber-500/80 ring-1 ring-amber-500/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Conservative
                    </span>
                    <span className="text-xs font-mono font-bold text-white">1.0 ctrl/wk</span>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white font-mono">
                      {activeForecast.scenarios.conservative.date}
                    </div>
                    <div className="text-xs text-slate-400">
                      {activeForecast.scenarios.conservative.days} days duration
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {activeForecast.scenarios.conservative.paceDescription}
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[10px]">
                    <span className="text-amber-400 font-medium">Stage 2 Buffer: +7 Days</span>
                    <span className="text-slate-500">Click to apply</span>
                  </div>
                </div>

                {/* Realistic Scenario (Recommended) */}
                <div
                  onClick={() => handleScenarioChange('realistic')}
                  className={`p-4 rounded-xl cursor-pointer transition border space-y-3 relative ${
                    selectedScenario === 'realistic'
                      ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="absolute -top-2.5 right-4 bg-indigo-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow">
                    Recommended Baseline
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                      Realistic (Current)
                    </span>
                    <span className="text-xs font-mono font-bold text-white">2.2 ctrl/wk</span>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white font-mono">
                      {activeForecast.scenarios.realistic.date}
                    </div>
                    <div className="text-xs text-slate-400">
                      {activeForecast.scenarios.realistic.days} days duration
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {activeForecast.scenarios.realistic.paceDescription}
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[10px]">
                    <span className="text-emerald-400 font-medium">Stage 2 Buffer: +18 Days</span>
                    <span className="text-indigo-400 font-bold">Active Selection</span>
                  </div>
                </div>

                {/* Aggressive Scenario */}
                <div
                  onClick={() => handleScenarioChange('aggressive')}
                  className={`p-4 rounded-xl cursor-pointer transition border space-y-3 ${
                    selectedScenario === 'aggressive'
                      ? 'bg-emerald-950/30 border-emerald-500/80 ring-1 ring-emerald-500/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      Aggressive
                    </span>
                    <span className="text-xs font-mono font-bold text-white">3.8 ctrl/wk</span>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white font-mono">
                      {activeForecast.scenarios.aggressive.date}
                    </div>
                    <div className="text-xs text-slate-400">
                      {activeForecast.scenarios.aggressive.days} days duration
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {activeForecast.scenarios.aggressive.paceDescription}
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[10px]">
                    <span className="text-emerald-400 font-medium">Stage 2 Buffer: +25 Days</span>
                    <span className="text-slate-500">Click to apply</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Burndown & Readiness Trajectory Visualizer */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-sm font-bold text-white">8-Week Readiness Burndown Trajectory</h4>
                  </div>
                  <p className="text-xs text-slate-400">
                    Projected climb from current {scorecard.overallReadinessPercent}% to 100% certification target at {customVelocity.toFixed(1)} controls/week.
                  </p>
                </div>

                {/* View Toggle */}
                <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => setTrajectoryViewMode('cards')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                      trajectoryViewMode === 'cards'
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Timeline Cards
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrajectoryViewMode('table')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                      trajectoryViewMode === 'table'
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Burndown Table
                  </button>
                </div>
              </div>

              {trajectoryViewMode === 'cards' ? (
                /* Cards Progression View */
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2.5 pt-2">
                  {activeForecast.trajectory.map((point) => (
                    <div
                      key={point.weekIndex}
                      className={`p-3 rounded-xl border transition flex flex-col justify-between space-y-2.5 ${
                        point.weekIndex === 0
                          ? 'bg-slate-900 border-indigo-500/60 ring-1 ring-indigo-500/40'
                          : point.isTargetMet
                          ? 'bg-emerald-950/20 border-emerald-800/60'
                          : 'bg-slate-900/60 border-slate-800/80'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {point.weekIndex === 0 ? 'Today' : `Wk ${point.weekIndex}`}
                          </span>
                          {point.projectedReadinessPercent >= 85 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Exceeds 85% Stage 2 Threshold" />
                          )}
                        </div>
                        <div className="text-[11px] font-medium text-slate-300 truncate">
                          {point.dateStr.split(',')[0]}
                        </div>
                      </div>

                      {/* Percentage Display & Mini Progress Bar */}
                      <div className="space-y-1">
                        <div className="text-base font-bold font-mono text-white">
                          {point.projectedReadinessPercent}%
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              point.projectedReadinessPercent >= targetPercent
                                ? 'bg-emerald-400'
                                : 'bg-indigo-500'
                            }`}
                            style={{ width: `${point.projectedReadinessPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-0.5 text-[10px] pt-1 border-t border-slate-800/60">
                        <div className="text-slate-400 flex justify-between">
                          <span>Done:</span>
                          <strong className="text-slate-200 font-mono">{point.projectedImplementedCount}</strong>
                        </div>
                        <div className="text-slate-400 flex justify-between">
                          <span>Open:</span>
                          <strong className="text-amber-400 font-mono">{point.remainingInProgressCount}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Tabular Burndown View */
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-2.5">Timeline Milestone</th>
                        <th className="px-4 py-2.5">Projected Date</th>
                        <th className="px-4 py-2.5">Readiness Score</th>
                        <th className="px-4 py-2.5">Implemented Controls</th>
                        <th className="px-4 py-2.5">Remaining In-Progress</th>
                        <th className="px-4 py-2.5">Audit Eligibility</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-950">
                      {activeForecast.trajectory.map((p) => (
                        <tr key={p.weekIndex} className="hover:bg-slate-900/50">
                          <td className="px-4 py-2.5 font-bold text-white flex items-center gap-2">
                            {p.weekIndex === 0 ? (
                              <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono text-[10px]">
                                Baseline (W0)
                              </span>
                            ) : (
                              <span>Week {p.weekIndex}</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-slate-300">{p.dateStr}</td>
                          <td className="px-4 py-2.5">
                            <span className="font-mono font-bold text-white">{p.projectedReadinessPercent}%</span>
                          </td>
                          <td className="px-4 py-2.5 font-mono text-emerald-400">
                            {p.projectedImplementedCount} / {activeForecast.controlsTotalApplicable}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-amber-400">{p.remainingInProgressCount} open</td>
                          <td className="px-4 py-2.5">
                            {p.projectedReadinessPercent >= targetPercent ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold text-[10px]">
                                Target Achieved
                              </span>
                            ) : p.projectedReadinessPercent >= 85 ? (
                              <span className="px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-semibold text-[10px]">
                                Stage 2 Eligible (≥85%)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-semibold text-[10px]">
                                In Remediation
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Critical Path Control Remediation Tracker */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-sm font-bold text-white">Critical Path Remediation Queue</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                      High Impact Controls
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Highest-priority Annex A controls requiring closure to maintain projected Stage 2 readiness date.
                  </p>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {activeForecast.criticalPathControls.length} Priority Controls
                </span>
              </div>

              <div className="space-y-2.5">
                {activeForecast.criticalPathControls.map((ctrl) => {
                  const fullControl = controls.find((c) => c.controlCode === ctrl.controlCode);
                  return (
                    <div
                      key={ctrl.controlCode}
                      className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-700 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800">
                            {ctrl.controlCode}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              ctrl.priority === 'Critical'
                                ? 'bg-red-950 text-red-300 border border-red-800'
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}
                          >
                            {ctrl.priority} Priority
                          </span>
                          <span className="text-xs font-bold text-white">{ctrl.title}</span>
                        </div>
                        <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-0.5">
                          <span>
                            Owner: <strong className="text-slate-200">{ctrl.owner}</strong>
                          </span>
                          <span>
                            Target: <strong className="text-slate-200">{ctrl.targetDate || 'Within 30 days'}</strong>
                          </span>
                          <span>
                            Pending Milestones: <strong className="text-amber-400">{ctrl.milestonesPending}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                        <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                          Est. {ctrl.estimatedDaysToRemediate}d to complete
                        </span>
                        {fullControl && onOpenRemediationDrawer && (
                          <button
                            type="button"
                            onClick={() => onOpenRemediationDrawer(fullControl)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1 shadow-sm"
                          >
                            <span>Remediate</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Velocity Inhibitors & Remediation Bottlenecks */}
            {activeForecast.bottlenecks.length > 0 && (
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-white">Velocity Inhibitors & Proactive Mitigations</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  {activeForecast.bottlenecks.map((bn) => (
                    <div key={bn.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300">{bn.title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                          {bn.affectedControlsCount} affected
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">{bn.description}</p>
                      <div className="text-[10px] text-indigo-400 pt-1 border-t border-slate-800/80">
                        <strong>Action:</strong> {bn.recommendedAction}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CLAUSES 4-10 PROGRESS */}
        {activeTab === 'clauses' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">Clauses 4 through 10 Progress Breakdown</h3>
                <p className="text-xs text-slate-400">
                  Management system requirements mandated for Stage 1 documentation review.
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950 px-3 py-1 rounded-lg border border-indigo-800">
                Aggregated Score: {scorecard.clausesScorePercent}%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {scorecard.clausesBreakdown.map(clause => {
                const fullClause = INITIAL_CLAUSES_DATA.find(c => c.number === clause.clauseNumber);
                const IconComponent = fullClause?.icon || Building2;

                return (
                  <div
                    key={clause.clauseNumber}
                    onClick={() => fullClause && setSelectedClause(fullClause)}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-700/60 transition cursor-pointer flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-indigo-400">
                          Clause {clause.clauseNumber}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
                          {clause.status}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <IconComponent className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span>{clause.title}</span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">{clause.description}</p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Readiness Score:</span>
                        <span className="font-mono font-bold text-white">{clause.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full transition-all"
                          style={{ width: `${clause.progressPercent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{clause.totalRequirements} Requirements</span>
                        <span className="text-indigo-400 hover:underline flex items-center gap-0.5">
                          <span>Inspect Clause</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: ANNEX A THEMES BREAKDOWN */}
        {activeTab === 'annex_a' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">Annex A Controls Progress (93 Controls)</h3>
                <p className="text-xs text-slate-400">
                  Technical, physical, and organizational safeguards categorized across 4 ISO/IEC 27001:2022 themes.
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950 px-3 py-1 rounded-lg border border-sky-800">
                Annex A Score: {scorecard.annexAScorePercent}%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scorecard.themesBreakdown.map(theme => (
                <div key={theme.themeNumber} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-sky-400 mr-2">
                        Theme {theme.themeNumber}
                      </span>
                      <h4 className="text-sm font-bold text-white inline">{theme.themeName}</h4>
                    </div>
                    <span className="font-mono text-sm font-bold text-white">{theme.progressPercent}%</span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: `${(theme.implementedCount / theme.totalControls) * 100}%` }}
                      title={`Implemented: ${theme.implementedCount}`}
                    />
                    <div
                      className="bg-amber-500 h-full"
                      style={{ width: `${(theme.inProgressCount / theme.totalControls) * 100}%` }}
                      title={`In Progress: ${theme.inProgressCount}`}
                    />
                    <div
                      className="bg-slate-700 h-full"
                      style={{ width: `${(theme.plannedCount / theme.totalControls) * 100}%` }}
                      title={`Planned: ${theme.plannedCount}`}
                    />
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Total</div>
                      <div className="font-bold text-white mt-0.5">{theme.totalControls}</div>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-emerald-400">Done</div>
                      <div className="font-bold text-emerald-300 mt-0.5">{theme.implementedCount}</div>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-amber-400">In Progress</div>
                      <div className="font-bold text-amber-300 mt-0.5">{theme.inProgressCount}</div>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Excl.</div>
                      <div className="font-bold text-slate-300 mt-0.5">{theme.excludedCount}</div>
                    </div>
                  </div>

                  {onSelectThemeFilter && (
                    <button
                      type="button"
                      onClick={() => onSelectThemeFilter(`theme_${theme.themeNumber}`)}
                      className="w-full py-1.5 rounded-lg bg-sky-950/70 hover:bg-sky-900 border border-sky-800/80 text-sky-300 text-xs font-medium transition flex items-center justify-center gap-1"
                    >
                      <span>Filter Theme {theme.themeNumber} in Controls Table</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: STAGE 1 VS STAGE 2 AUDIT GATES */}
        {activeTab === 'stage_gates' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">Stage 1 & Stage 2 Audit Gate Matrix</h3>
                <p className="text-xs text-slate-400">
                  Critical compliance gates verified by external certification auditors during Adequacy (Stage 1) and Effectiveness (Stage 2) audits.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-400 font-bold bg-emerald-950 border border-emerald-800 px-2.5 py-1 rounded">
                  Stage 1: {scorecard.stage1ReadinessPercent}%
                </span>
                <span className="text-xs text-sky-400 font-bold bg-sky-950 border border-sky-800 px-2.5 py-1 rounded">
                  Stage 2: {scorecard.stage2ReadinessPercent}%
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {scorecard.stageGates.map((gate, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          gate.category === 'Stage 1'
                            ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                            : 'bg-sky-950 text-sky-300 border border-sky-800'
                        }`}
                      >
                        {gate.category}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-300">{gate.clauseOrControl}</span>
                      <span className="text-xs font-bold text-white">{gate.name}</span>
                    </div>
                    <p className="text-xs text-slate-400">{gate.requirement}</p>
                    {gate.evidenceRef && (
                      <div className="text-[10px] text-indigo-400 font-mono flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>Evidence Artifact: {gate.evidenceRef}</span>
                      </div>
                    )}
                  </div>

                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-3 py-1 rounded-lg flex items-center gap-1 self-start sm:self-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{gate.status}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CLAUSE DRILL-DOWN MODAL */}
      {selectedClause && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950 border border-indigo-800 px-2 py-0.5 rounded">
                    Clause {selectedClause.number}
                  </span>
                  <span className="text-xs text-slate-400">ISO/IEC 27001:2022 Requirement</span>
                </div>
                <h3 className="text-lg font-bold text-white">{selectedClause.title}</h3>
                <p className="text-xs text-slate-400">{selectedClause.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClause(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Requirements Checklist */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Audited Requirements ({selectedClause.requirements.length})
              </h4>
              <div className="space-y-2.5">
                {selectedClause.requirements.map(req => (
                  <div key={req.code} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-indigo-400">{req.code} - {req.name}</span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{req.text}</p>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800/80 text-[11px] text-slate-400">
                      <strong className="text-indigo-300">Auditor Check:</strong> {req.auditCheck}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mandatory Evidence Checklist */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Mandatory Stage 1 Evidence Artifacts
              </h4>
              <div className="space-y-1.5">
                {selectedClause.mandatoryEvidenceChecklist.map((ev, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white">{ev.title}</div>
                      <div className="text-[10px] text-slate-400">{ev.description}</div>
                    </div>
                    <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                      {ev.controlCode}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Auditor Key Questions */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Key Auditor Interview Questions
              </h4>
              <div className="space-y-2">
                {selectedClause.auditorKeyInterviews.map((interview, i) => (
                  <div key={i} className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-900/40 text-xs space-y-1">
                    <div className="font-semibold text-indigo-200">Q: "{interview.question}"</div>
                    <div className="text-[11px] text-slate-300">
                      <strong>Evidence to show:</strong> {interview.evidenceToInspect}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedClause(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Close Clause Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
