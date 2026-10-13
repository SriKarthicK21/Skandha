import React, { useState, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import {
  TrendingUp,
  Award,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Sliders,
  ChevronRight,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  History,
  Target,
  FileCheck2,
  Check,
  Info,
  RefreshCw,
  Zap,
  Activity,
  BarChart3,
  X
} from 'lucide-react';
import { Tooltip, MetricInfoTooltip } from '../common/Tooltip';
import {
  calculateComplianceProjection,
  RecertificationProjectionResult,
  HistoricalAuditCycle,
  ProjectionDriver,
  WhatIfScenario
} from '../../services/complianceProjectionService';

interface ComplianceProjectionWidgetProps {
  onNavigateModule?: (moduleId: string) => void;
  selectedFrameworkId?: string;
}

export const ComplianceProjectionWidget: React.FC<ComplianceProjectionWidgetProps> = ({
  onNavigateModule,
  selectedFrameworkId
}) => {
  const { currentTenant, controls, evidence, findings, internalAudits, theme } = useGRC();
  const isLight = theme === 'light';

  // Standard switch state (default to ISO 27001, or ISO 42001 if selectedFrameworkId is iso42001)
  const [selectedStandard, setSelectedStandard] = useState<'ISO_27001' | 'ISO_42001'>(() => {
    return selectedFrameworkId === 'iso42001' ? 'ISO_42001' : 'ISO_27001';
  });

  // What-If Simulation State
  const [activeScenarioId, setActiveScenarioId] = useState<string>('current_baseline');
  const [evidenceFreshnessDelta, setEvidenceFreshnessDelta] = useState<number>(0);
  const [showMethodologyModal, setShowMethodologyModal] = useState<boolean>(false);
  const [activeDriverTab, setActiveDriverTab] = useState<'all' | 'capa' | 'controls' | 'evidence'>('all');

  // Tenant-scoped filtering
  const tenantControls = useMemo(() => {
    return controls || [];
  }, [controls]);

  const tenantEvidence = useMemo(() => {
    return (evidence || []).filter(e => !e.tenantId || e.tenantId === currentTenant?.id);
  }, [evidence, currentTenant?.id]);

  const tenantFindings = useMemo(() => {
    return (findings || []).filter(f => !f.tenantId || f.tenantId === currentTenant?.id);
  }, [findings, currentTenant?.id]);

  const tenantAudits = useMemo(() => {
    return (internalAudits || []).filter(a => !a.tenantId || a.tenantId === currentTenant?.id);
  }, [internalAudits, currentTenant?.id]);

  // Compute projection
  const projection: RecertificationProjectionResult = useMemo(() => {
    return calculateComplianceProjection({
      standard: selectedStandard,
      controls: tenantControls,
      evidence: tenantEvidence,
      findings: tenantFindings,
      internalAudits: tenantAudits,
      customEvidenceFreshnessDelta: evidenceFreshnessDelta,
      customScenarioId: activeScenarioId
    });
  }, [selectedStandard, tenantControls, tenantEvidence, tenantFindings, tenantAudits, evidenceFreshnessDelta, activeScenarioId]);

  const activeScenario = projection.whatIfScenarios.find(s => s.id === activeScenarioId) || projection.whatIfScenarios[0];

  return (
    <div className="p-5 sm:p-6 flex flex-col justify-between h-full space-y-6">
      {/* 1. Header & Standard Selector */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b ${
        isLight ? 'border-slate-200' : 'border-slate-800'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <h2 className="text-base font-bold tracking-tight flex items-center space-x-2">
              <Sparkles className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-sky-400'}`} />
              <span className={isLight ? 'text-slate-900' : 'text-white'}>Compliance Projection & Recertification Forecast</span>
            </h2>

            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
              isLight
                ? 'bg-sky-50 text-sky-800 border-sky-200'
                : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
            }`}>
              Bayesian Forecast Model
            </span>

            <MetricInfoTooltip
              title="ISO Recertification Likelihood Engine"
              badge="Accredited Criteria"
              content="Forecasts the statistical probability of passing upcoming accredited ISO recertifications with Zero Major Non-Conformities and verified 3-year certificate renewal."
              formula="Forecast = (Evidence Freshness × 0.22) + (CAPA Velocity × 0.25) + (Control Effectiveness × 0.25) + (Historical Reliability × 0.18) + (Clauses 4-10 Governance × 0.10) ± Auditor Sample Stress"
              benchmark="≥ 95.0%: High Probability Unconditional Pass | 85-94%: Likely Pass (Minor Remediation) | < 85%: Delay Risk"
              recommendation="Ensure 0 open Major Non-Conformities and continuous evidence verification within 90 days of auditor arrival."
              position="bottom"
            />
          </div>

          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Predictive modeling calibrated against {projection.historicalCycles.length} historical external audit cycles under accredited registrar oversight.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {/* Framework Switcher Pills */}
          <div className={`p-1 rounded-xl border flex items-center space-x-1 text-xs font-semibold ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <button
              onClick={() => {
                setSelectedStandard('ISO_27001');
                setActiveScenarioId('current_baseline');
                setEvidenceFreshnessDelta(0);
              }}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedStandard === 'ISO_27001'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ISO 27001:2022
            </button>
            <button
              onClick={() => {
                setSelectedStandard('ISO_42001');
                setActiveScenarioId('current_baseline');
                setEvidenceFreshnessDelta(0);
              }}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedStandard === 'ISO_42001'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ISO 42001:2023 (AI)
            </button>
          </div>

          {/* Methodology Button */}
          <button
            onClick={() => setShowMethodologyModal(true)}
            className={`p-2 rounded-xl border transition-colors ${
              isLight
                ? 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="View Projection Methodology & Confidence Intervals"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Primary Forecast Hero Panel */}
      <div className={`p-5 sm:p-6 rounded-2xl border relative overflow-hidden shadow-sm ${
        isLight
          ? 'bg-gradient-to-br from-white via-sky-50/40 to-indigo-50/30 border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)]'
          : 'bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-sky-950/25 border-slate-800'
      }`}>
        {/* Ambient glow accent */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Big Percentage Readout & Health Verdict */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center space-x-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                isLight ? 'bg-indigo-100 text-indigo-800 border-indigo-200' : 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60'
              }`}>
                Upcoming Audit Target: {projection.upcomingTarget.targetDate}
              </span>
              <span className={`text-xs font-mono font-bold ${
                isLight ? 'text-amber-700' : 'text-amber-400'
              }`}>
                • {projection.upcomingTarget.daysRemaining} Days to Onsite
              </span>
            </div>

            <div className="flex items-baseline space-x-3">
              <div className="flex items-baseline">
                <span className={`text-4xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tight ${
                  projection.forecastPassLikelihood >= 95
                    ? isLight ? 'text-emerald-700' : 'text-emerald-400'
                    : projection.forecastPassLikelihood >= 85
                    ? isLight ? 'text-sky-700' : 'text-sky-400'
                    : isLight ? 'text-amber-700' : 'text-amber-400'
                }`}>
                  {projection.forecastPassLikelihood}%
                </span>
              </div>

              <div className="space-y-0.5">
                <span className={`text-xs font-bold uppercase tracking-wider block ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}>
                  Likelihood of Passing
                </span>
                <span className={`text-xs font-mono block ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  95% CI: [{projection.confidenceInterval.min}% – {projection.confidenceInterval.max}%]
                </span>
              </div>
            </div>

            {/* Verdict Badge */}
            <div className={`p-3 rounded-xl border flex items-center space-x-3 ${
              projection.verdict === 'High Probability of Unconditional Pass'
                ? isLight
                  ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                  : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                : projection.verdict === 'Likely Pass with Minor Actions'
                ? isLight
                  ? 'bg-sky-50/90 border-sky-200 text-sky-900'
                  : 'bg-sky-950/40 border-sky-800/60 text-sky-300'
                : isLight
                ? 'bg-amber-50/90 border-amber-200 text-amber-900'
                : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
            }`}>
              <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-500" />
              <div className="text-xs">
                <strong className="font-bold block">{projection.verdict}</strong>
                <span className="opacity-90 block">
                  {projection.upcomingTarget.accreditedBody} • {projection.upcomingTarget.cycleType}
                </span>
              </div>
            </div>

            {/* Micro Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>Accredited Registrar Qualification Benchmark</span>
                <span className="font-bold text-emerald-500">Threshold: ≥ 95.0%</span>
              </div>
              <div className={`w-full h-2.5 rounded-full overflow-hidden border ${
                isLight ? 'bg-slate-200/80 border-slate-300' : 'bg-slate-950 border-slate-800'
              }`}>
                <div
                  className="h-full bg-gradient-to-r from-teal-500 via-emerald-400 to-sky-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, projection.forecastPassLikelihood)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Predictive Findings Distribution & Registrar Scope */}
          <div className="lg:col-span-6 space-y-3">
            <div className={`p-4 rounded-xl border ${
              isLight ? 'bg-white/80 border-slate-200 shadow-xs' : 'bg-slate-950/60 border-slate-800/80'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center space-x-1.5 ${
                  isLight ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Forecasted Audit Finding Distribution</span>
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold ${
                  isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'
                }`}>
                  Confidence: High
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                {/* Major NCs */}
                <div className={`p-2.5 rounded-lg border ${
                  projection.projectedMajorNCs < 0.1
                    ? isLight ? 'bg-emerald-50/70 border-emerald-200' : 'bg-emerald-950/30 border-emerald-900/40'
                    : isLight ? 'bg-rose-50/70 border-rose-200' : 'bg-rose-950/30 border-rose-900/40'
                }`}>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Major NCs</span>
                  <span className={`text-lg font-black font-mono mt-0.5 block ${
                    projection.projectedMajorNCs < 0.1
                      ? isLight ? 'text-emerald-700' : 'text-emerald-400'
                      : isLight ? 'text-rose-700' : 'text-rose-400'
                  }`}>
                    {projection.projectedMajorNCs === 0 ? '0' : `< ${projection.projectedMajorNCs}`}
                  </span>
                  <span className="text-[9.5px] text-slate-400 font-mono block">Target: 0 (Pass)</span>
                </div>

                {/* Minor NCs */}
                <div className={`p-2.5 rounded-lg border ${
                  isLight ? 'bg-sky-50/70 border-sky-200' : 'bg-sky-950/30 border-sky-900/40'
                }`}>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Minor NCs</span>
                  <span className={`text-lg font-black font-mono mt-0.5 block ${
                    isLight ? 'text-sky-800' : 'text-sky-300'
                  }`}>
                    {projection.projectedMinorNCs} Expected
                  </span>
                  <span className="text-[9.5px] text-slate-400 font-mono block">Allowable: ≤ 3</span>
                </div>

                {/* Observations / OFIs */}
                <div className={`p-2.5 rounded-lg border ${
                  isLight ? 'bg-slate-100/80 border-slate-200' : 'bg-slate-900/80 border-slate-800'
                }`}>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Observations</span>
                  <span className={`text-lg font-black font-mono mt-0.5 block ${
                    isLight ? 'text-slate-800' : 'text-slate-200'
                  }`}>
                    {projection.projectedObservations}
                  </span>
                  <span className="text-[9.5px] text-slate-400 font-mono block">Advisory Only</span>
                </div>
              </div>
            </div>

            {/* Registrar & Lead Auditor Snapshot */}
            <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800/60'
            }`}>
              <div className="space-y-0.5">
                <span className={`text-[10px] uppercase tracking-wider font-bold block ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  Lead Auditor Assignment
                </span>
                <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  {projection.upcomingTarget.leadAuditor}
                </span>
              </div>
              <div className="text-right space-y-0.5">
                <span className={`text-[10px] uppercase tracking-wider font-bold block ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  Accreditation Body
                </span>
                <span className={`font-semibold ${isLight ? 'text-indigo-700' : 'text-sky-400'}`}>
                  {projection.upcomingTarget.accreditedBody.split('(')[0]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Historical Audit Velocity & Progression Timeline */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <div className="flex items-center space-x-2">
            <History className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-sky-400'}`} />
            <h3 className={`text-sm font-bold tracking-wide uppercase ${isLight ? 'text-slate-800' : 'text-white'}`}>
              Historical Audit Data & Multi-Year Progression Velocity
            </h3>
          </div>
          <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Audit score progression across all past formal accreditation cycles
          </span>
        </div>

        {/* Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {projection.historicalCycles.map((cycle, idx) => {
            const isLatestHistorical = idx === projection.historicalCycles.length - 1;

            return (
              <div
                key={cycle.id}
                className={`p-3.5 rounded-xl border relative transition-all duration-200 hover:scale-[1.01] ${
                  isLatestHistorical
                    ? isLight
                      ? 'bg-sky-50/60 border-sky-300 ring-1 ring-sky-300/40'
                      : 'bg-sky-950/30 border-sky-700/60 ring-1 ring-sky-600/30'
                    : isLight
                    ? 'bg-white border-slate-200 hover:border-slate-300'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    cycle.outcome === 'Certified' || cycle.outcome === 'Maintained'
                      ? isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {cycle.outcome}
                  </span>
                  <span className={`text-xs font-mono font-bold ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}>
                    {cycle.score}%
                  </span>
                </div>

                <h4 className={`text-xs font-bold line-clamp-1 ${isLight ? 'text-slate-900' : 'text-white'}`} title={cycle.cycleName}>
                  {cycle.shortName}
                </h4>

                <div className={`text-[10.5px] mt-1 line-clamp-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  {cycle.keyFindingsSummary}
                </div>

                <div className={`mt-2.5 pt-2 border-t flex justify-between text-[10px] font-mono ${
                  isLight ? 'border-slate-200/80 text-slate-500' : 'border-slate-800 text-slate-400'
                }`}>
                  <span>{cycle.auditorBody.split(' ')[0]}</span>
                  <span>{cycle.minorNCs} Minor NCs • 0 Major</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Interactive "What-If" Sensitivity Simulator */}
      <div className={`p-4 sm:p-5 rounded-2xl border ${
        isLight ? 'bg-slate-50/90 border-slate-200' : 'bg-slate-900/80 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <Sliders className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-sky-400'}`} />
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-white'}`}>
              "What-If" Auditor Sensitivity Simulation Engine
            </h3>
          </div>
          <span className={`text-xs font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Simulate auditor rigor, sample size expansion, and CAPA resolution timing
          </span>
        </div>

        {/* Scenario Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
          {projection.whatIfScenarios.map(sc => {
            const isSelected = activeScenarioId === sc.id;

            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => {
                  setActiveScenarioId(sc.id);
                  if (sc.id === 'current_baseline') {
                    setEvidenceFreshnessDelta(0);
                  }
                }}
                className={`p-3 rounded-xl border text-left transition-all duration-200 hover:scale-[1.01] cursor-pointer ${
                  isSelected
                    ? isLight
                      ? 'bg-white border-sky-500 shadow-sm ring-1 ring-sky-500/30'
                      : 'bg-slate-800 border-sky-500 shadow-md ring-1 ring-sky-500/30'
                    : isLight
                    ? 'bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300'
                    : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    isSelected ? 'text-sky-500' : isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    {sc.id === 'current_baseline' ? 'Baseline' : 'Scenario'}
                  </span>
                  <span className={`text-xs font-mono font-bold ${
                    sc.likelihoodDelta > 0
                      ? 'text-emerald-500'
                      : sc.likelihoodDelta < 0
                      ? 'text-amber-500'
                      : isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}>
                    {sc.simulatedLikelihood}%
                    {sc.likelihoodDelta !== 0 && (
                      <span className="text-[10px] ml-1">
                        ({sc.likelihoodDelta > 0 ? `+${sc.likelihoodDelta}` : sc.likelihoodDelta}%)
                      </span>
                    )}
                  </span>
                </div>

                <h4 className={`text-xs font-bold mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {sc.label}
                </h4>
                <p className={`text-[10px] line-clamp-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {sc.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Real-time Slider: Evidence Freshness Sensitivity */}
        <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-950/80 border-slate-800'
        }`}>
          <div className="space-y-0.5 sm:max-w-md">
            <span className={`text-xs font-bold flex items-center space-x-1.5 ${isLight ? 'text-slate-800' : 'text-white'}`}>
              <span>Fine-Tune Evidence Freshness Parameter</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-400">
                {evidenceFreshnessDelta >= 0 ? `+${evidenceFreshnessDelta}%` : `${evidenceFreshnessDelta}%`}
              </span>
            </span>
            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Adjust simulated evidence collection rate to see how evidence age impacts auditor pass likelihood.
            </p>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-64">
            <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>-20%</span>
            <input
              type="range"
              min="-20"
              max="15"
              step="1"
              value={evidenceFreshnessDelta}
              onChange={e => {
                setEvidenceFreshnessDelta(Number(e.target.value));
                setActiveScenarioId('custom_slider');
              }}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>+15%</span>
          </div>
        </div>
      </div>

      {/* 5. Key Projection Drivers Breakdown */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <div className="flex items-center space-x-2">
            <Target className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-sky-400'}`} />
            <h3 className={`text-sm font-bold tracking-wide uppercase ${isLight ? 'text-slate-800' : 'text-white'}`}>
              Predictive Audit Drivers & Weight Contribution
            </h3>
          </div>
          <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Statistical weightings contributing to the recertification likelihood score
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {projection.drivers.map(driver => (
            <div
              key={driver.id}
              className={`p-3.5 rounded-xl border transition-all ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900/70 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {driver.name}
                </span>
                <span className={`text-xs font-mono font-bold ${
                  driver.score >= 90
                    ? isLight ? 'text-emerald-700' : 'text-emerald-400'
                    : driver.score >= 75
                    ? isLight ? 'text-sky-700' : 'text-sky-400'
                    : isLight ? 'text-amber-700' : 'text-amber-400'
                }`}>
                  {driver.score}%
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] mb-2 font-mono">
                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>
                  Weight: {Math.round(driver.weight * 100)}% • {driver.currentValueText}
                </span>
                <span className="font-semibold text-sky-400">
                  {driver.impactOnForecast}
                </span>
              </div>

              {/* Progress bar */}
              <div className={`w-full h-2 rounded-full overflow-hidden border ${
                isLight ? 'bg-slate-200 border-slate-300' : 'bg-slate-950 border-slate-800'
              }`}>
                <div
                  className={`h-full transition-all duration-300 ${
                    driver.score >= 90
                      ? 'bg-emerald-500'
                      : driver.score >= 75
                      ? 'bg-sky-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${driver.score}%` }}
                />
              </div>

              <p className={`text-[10.5px] mt-2 line-clamp-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {driver.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Critical Watchlist for Auditor Scrutiny */}
      <div className={`p-4 rounded-xl border transition-all duration-200 hover:scale-[1.01] ${
        isLight ? 'bg-amber-50/50 border-amber-200' : 'bg-amber-950/20 border-amber-800/40'
      }`}>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center space-x-2">
            <AlertTriangle className={`w-4 h-4 ${isLight ? 'text-amber-700' : 'text-amber-400'}`} />
            <h4 className={`text-xs font-bold uppercase tracking-wider ${
              isLight ? 'text-amber-900' : 'text-amber-300'
            }`}>
              Registrar Pre-Audit Watchlist (Areas of Heightened Scrutiny)
            </h4>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
            isLight ? 'bg-white text-amber-800 border-amber-300' : 'bg-slate-900 text-amber-300 border-amber-700/60'
          }`}>
            {projection.watchlist.length} Priority Items
          </span>
        </div>

        <div className="space-y-2">
          {projection.watchlist.map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                isLight ? 'bg-white border-amber-200/80' : 'bg-slate-900/90 border-slate-800'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className={`font-mono font-bold px-1.5 py-0.2 rounded text-[10px] ${
                    isLight ? 'bg-slate-100 text-slate-800' : 'bg-slate-800 text-sky-400'
                  }`}>
                    {item.controlOrClause}
                  </span>
                  <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {item.title}
                  </span>
                </div>
                <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  {item.recommendation}
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0 text-[10px] font-mono">
                <span className={`px-2 py-0.5 rounded ${
                  isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'
                }`}>
                  Owner: {item.responsibleRole}
                </span>
                <span className="text-amber-500 font-bold">
                  Est: {item.remediationTimeDays}d
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Action Footer & Deep Links */}
      <div className={`pt-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isLight ? 'border-slate-200' : 'border-slate-800'
      }`}>
        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={() => onNavigateModule?.('external_audit')}
            className={`transition flex items-center space-x-1 font-semibold ${
              isLight ? 'text-slate-700 hover:text-indigo-600' : 'text-slate-300 hover:text-sky-400'
            }`}
          >
            <span>External Audit Dossier</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          <span className="text-slate-600">•</span>

          <button
            onClick={() => onNavigateModule?.('internal_audit')}
            className={`transition flex items-center space-x-1 font-semibold ${
              isLight ? 'text-slate-700 hover:text-indigo-600' : 'text-slate-300 hover:text-sky-400'
            }`}
          >
            <span>Internal Audit Logs</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          <span className="text-slate-600">•</span>

          <button
            onClick={() => onNavigateModule?.('findings_capa')}
            className={`transition flex items-center space-x-1 font-semibold ${
              isLight ? 'text-slate-700 hover:text-indigo-600' : 'text-slate-300 hover:text-sky-400'
            }`}
          >
            <span>CAPA Resolution Tracker</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setActiveScenarioId('current_baseline');
              setEvidenceFreshnessDelta(0);
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isLight
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            Reset Simulator
          </button>

          <button
            onClick={() => onNavigateModule?.('readiness_cert')}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-semibold transition-all shadow-sm flex items-center space-x-1.5"
          >
            <span>Schedule Pre-Audit Dry Run</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 8. Methodology & Statistical Model Modal */}
      {showMethodologyModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 ${
            isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-200'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-800">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <h3 className="text-base font-bold text-white">
                  Compliance Projection Scoring & Mathematical Methodology
                </h3>
              </div>
              <button
                onClick={() => setShowMethodologyModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-300">
              <p>
                The <strong>Compliance Projection Engine</strong> utilizes a deterministic Bayesian likelihood model calibrated against accredited ISO certification requirements (ISO/IEC 17021-1 conformity assessment requirements).
              </p>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 font-mono text-[11px]">
                <strong className="text-sky-400 block font-bold">Predictive Model Weighting:</strong>
                <div>• Zero Open Major NCs & CAPA Velocity: <strong>25%</strong> (Blocking Criterion)</div>
                <div>• Annex A Controls Operational Effectiveness: <strong>25%</strong></div>
                <div>• Evidence Vault Freshness & Cryptographic Verification: <strong>22%</strong></div>
                <div>• Multi-Cycle Historical Audit Reliability: <strong>18%</strong></div>
                <div>• ISO Mandatory Clauses 4-10 Governance: <strong>10%</strong></div>
              </div>

              <p>
                <strong>Accredited Certification Rules:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li><strong>Major Non-Conformity:</strong> A total breakdown of a requirement or multiple minor findings. Immediately halts recertification recommendation until on-site verification.</li>
                <li><strong>Minor Non-Conformity:</strong> Does not block certification if approved Corrective Action Plan (CAPA) is submitted within 90 days.</li>
                <li><strong>Opportunities for Improvement (OFIs):</strong> Advisory recommendations with zero adverse impact on certification decision.</li>
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowMethodologyModal(false)}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
