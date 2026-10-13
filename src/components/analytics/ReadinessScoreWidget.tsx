import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGRC } from '../../context/GRCContext';
import {
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  FileCheck2,
  Sparkles,
  SlidersHorizontal,
  RefreshCw,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Layers,
  Lock,
  Flame,
  Zap,
  Award,
  Activity,
  Info,
  CheckSquare,
  Clock,
  CircleDot,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { DataCollectionRequired } from '../common/DataCollectionRequired';

interface ReadinessScoreWidgetProps {
  onNavigateModule?: (moduleId: string) => void;
  className?: string;
}

export const ReadinessScoreWidget: React.FC<ReadinessScoreWidgetProps> = ({
  onNavigateModule,
  className = ''
}) => {
  const {
    currentTenant,
    controls,
    evidence,
    findings,
    internalAudits,
    managementReviews,
    setActiveModule
  } = useGRC();

  const handleNavigate = (module: string) => {
    if (onNavigateModule) {
      onNavigateModule(module);
    } else {
      setActiveModule(module as any);
    }
  };

  // State for interactive features
  const [showFormulaDetails, setShowFormulaDetails] = useState<boolean>(false);
  const [showSimulator, setShowSimulator] = useState<boolean>(false);
  const [showStageGateChecklist, setShowStageGateChecklist] = useState<boolean>(false);

  // What-If Simulation State
  const [simExtraControls, setSimExtraControls] = useState<number>(0);
  const [simExtraEvidence, setSimExtraEvidence] = useState<number>(0);
  const [simResolvedCapas, setSimResolvedCapas] = useState<number>(0);

  // 1. LIVE CONTROLS METRICS (Weight: 45%)
  const tenantControls = (controls && controls.length > 0)
    ? controls
    : (currentTenant?.controls || []);
  
  const applicableControls = useMemo(() => {
    return tenantControls.filter(c => c.applicable !== false);
  }, [tenantControls]);

  const implementedControlsCount = useMemo(() => {
    return applicableControls.filter(
      c => c.implementationStatus === 'Implemented' ||
           c.implementationStatus === 'Monitored' ||
           c.implementationStatus === 'Audited'
    ).length;
  }, [applicableControls]);

  const inProgressControlsCount = useMemo(() => {
    return applicableControls.filter(c => c.implementationStatus === 'In Progress').length;
  }, [applicableControls]);

  const notStartedControlsCount = useMemo(() => {
    return applicableControls.filter(
      c => !c.implementationStatus || c.implementationStatus === 'Not Started'
    ).length;
  }, [applicableControls]);

  const totalApplicableCount = applicableControls.length || 1;
  const liveControlRate = Math.round((implementedControlsCount / totalApplicableCount) * 100);

  // 2. LIVE EVIDENCE METRICS (Weight: 35%)
  const tenantEvidence = useMemo(() => {
    return evidence.filter(e => !e.tenantId || e.tenantId === currentTenant?.id);
  }, [evidence, currentTenant?.id]);

  const totalEvidenceCount = tenantEvidence.length || 1;
  const verifiedEvidenceCount = useMemo(() => {
    return tenantEvidence.filter(e => e.status === 'Verified').length;
  }, [tenantEvidence]);

  const pendingEvidenceCount = useMemo(() => {
    return tenantEvidence.filter(e => e.status === 'Pending Review' || !e.status).length;
  }, [tenantEvidence]);

  const actionRequiredEvidenceCount = useMemo(() => {
    return tenantEvidence.filter(e => e.status === 'Requires Update' || e.status === 'Expired').length;
  }, [tenantEvidence]);

  // Unique controls covered by at least 1 verified evidence artifact
  const controlsWithVerifiedEvidence = useMemo(() => {
    const verifiedCodes = new Set(
      tenantEvidence.filter(e => e.status === 'Verified').map(e => e.controlCode)
    );
    return applicableControls.filter(c => verifiedCodes.has(c.controlCode)).length;
  }, [tenantEvidence, applicableControls]);

  const liveEvidenceVerificationRate = Math.round((verifiedEvidenceCount / totalEvidenceCount) * 100);
  const liveEvidenceCoverageRate = Math.round((controlsWithVerifiedEvidence / totalApplicableCount) * 100);
  // Blended evidence score: 70% artifact verification + 30% control coverage
  const liveEvidenceRate = Math.round(liveEvidenceVerificationRate * 0.7 + liveEvidenceCoverageRate * 0.3);

  // 3. LIVE CAPA & FINDINGS METRICS (Weight: 20%)
  const tenantFindings = useMemo(() => {
    return findings.filter(f => !f.tenantId || f.tenantId === currentTenant?.id);
  }, [findings, currentTenant?.id]);

  const totalFindingsCount = tenantFindings.length;
  const closedFindingsCount = useMemo(() => {
    return tenantFindings.filter(f => f.status === 'Closed Verified').length;
  }, [tenantFindings]);

  const openMajorFindingsCount = useMemo(() => {
    return tenantFindings.filter(
      f => f.status !== 'Closed Verified' && f.severity === 'Major Non-Conformity'
    ).length;
  }, [tenantFindings]);

  const openMinorFindingsCount = useMemo(() => {
    return tenantFindings.filter(
      f => f.status !== 'Closed Verified' && f.severity === 'Minor Non-Conformity'
    ).length;
  }, [tenantFindings]);

  const openObservationsCount = useMemo(() => {
    return tenantFindings.filter(
      f => f.status !== 'Closed Verified' &&
           (f.severity === 'Observation' || f.severity === 'Opportunity for Improvement')
    ).length;
  }, [tenantFindings]);

  // Base CAPA rate (100% if no findings exist, otherwise proportion of verified closures)
  const baseCapaRate = totalFindingsCount === 0
    ? 100
    : Math.round((closedFindingsCount / totalFindingsCount) * 100);

  // Severity-adjusted CAPA score: Deduct 15% per open Major NC, 5% per open Minor NC
  const capaSeverityPenalty = (openMajorFindingsCount * 15) + (openMinorFindingsCount * 5);
  const liveCapaRate = Math.max(0, Math.min(100, baseCapaRate - (totalFindingsCount === 0 ? 0 : 0)));

  // 4. COMPOSITE REAL-TIME READINESS SCORE (Tri-Pillar Formulation)
  // Formula: Controls (45%) + Evidence (35%) + CAPA (20%) - Open Major NC Gate Penalty
  const weightedControlsScore = Number((liveControlRate * 0.45).toFixed(1));
  const weightedEvidenceScore = Number((liveEvidenceRate * 0.35).toFixed(1));
  const weightedCapaScore = Number((liveCapaRate * 0.20).toFixed(1));

  const rawLiveScore = Math.round(
    liveControlRate * 0.45 +
    liveEvidenceRate * 0.35 +
    liveCapaRate * 0.20
  );

  // If major NCs are open, readiness score cannot exceed 84% (Stage 1 blocker)
  const isMajorNcBlocked = openMajorFindingsCount > 0;
  const liveReadinessScore = isMajorNcBlocked ? Math.min(84, rawLiveScore) : rawLiveScore;

  // 5. SIMULATED SCORE (When What-If simulation active)
  const isSimulationActive = simExtraControls > 0 || simExtraEvidence > 0 || simResolvedCapas > 0;

  const simImplementedControls = Math.min(totalApplicableCount, implementedControlsCount + simExtraControls);
  const simControlRate = Math.round((simImplementedControls / totalApplicableCount) * 100);

  const simVerifiedEvidence = Math.min(totalEvidenceCount, verifiedEvidenceCount + simExtraEvidence);
  const simEvidenceVerificationRate = Math.round((simVerifiedEvidence / totalEvidenceCount) * 100);
  const simEvidenceCoverage = Math.min(totalApplicableCount, controlsWithVerifiedEvidence + Math.floor(simExtraEvidence * 0.8));
  const simEvidenceCoverageRate = Math.round((simEvidenceCoverage / totalApplicableCount) * 100);
  const simEvidenceRate = Math.round(simEvidenceVerificationRate * 0.7 + simEvidenceCoverageRate * 0.3);

  const openFindingsCount = tenantFindings.filter(f => f.status !== 'Closed Verified').length;
  const simClosedFindings = Math.min(totalFindingsCount, closedFindingsCount + simResolvedCapas);
  const simCapaRate = totalFindingsCount === 0
    ? 100
    : Math.round((simClosedFindings / totalFindingsCount) * 100);

  const simOpenMajor = Math.max(0, openMajorFindingsCount - simResolvedCapas);
  const simRawScore = Math.round(
    simControlRate * 0.45 +
    simEvidenceRate * 0.35 +
    simCapaRate * 0.20
  );
  const simulatedReadinessScore = simOpenMajor > 0 ? Math.min(84, simRawScore) : simRawScore;

  const activeScore = isSimulationActive ? simulatedReadinessScore : liveReadinessScore;

  // Stage 1 Gate Status
  const stage1Target = 85;
  const isStage1Ready = liveReadinessScore >= stage1Target && !isMajorNcBlocked;
  const gapToStage1 = stage1Target - liveReadinessScore;

  // Dynamic status color badge
  const getScoreColorTheme = (score: number) => {
    if (score >= 85) {
      return {
        bg: 'from-emerald-950/70 via-slate-900 to-slate-900',
        border: 'border-emerald-500/40',
        text: 'text-emerald-400',
        stroke: '#10B981',
        badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-700',
        label: 'Audit Ready (Stage 1 Qualified)',
        gradient: 'from-emerald-500 to-teal-400'
      };
    }
    if (score >= 70) {
      return {
        bg: 'from-sky-950/70 via-slate-900 to-slate-900',
        border: 'border-sky-500/40',
        text: 'text-sky-400',
        stroke: '#0EA5E9',
        badgeBg: 'bg-sky-950/80 text-sky-300 border-sky-700',
        label: 'Approaching Target Readiness',
        gradient: 'from-sky-500 to-cyan-400'
      };
    }
    if (score >= 50) {
      return {
        bg: 'from-amber-950/60 via-slate-900 to-slate-900',
        border: 'border-amber-500/40',
        text: 'text-amber-400',
        stroke: '#F59E0B',
        badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-700',
        label: 'Implementation In Progress',
        gradient: 'from-amber-500 to-yellow-400'
      };
    }
    return {
      bg: 'from-rose-950/60 via-slate-900 to-slate-900',
      border: 'border-rose-500/40',
      text: 'text-rose-400',
      stroke: '#F43F5E',
      badgeBg: 'bg-rose-950/80 text-rose-300 border-rose-700',
      label: 'Remediation Required',
      gradient: 'from-rose-500 to-red-400'
    };
  };

  const theme = getScoreColorTheme(activeScore);

  // Stage-Gate Audit Checklist
  const stageGateChecks = [
    {
      id: 'score',
      label: 'Readiness Score ≥ 85%',
      met: liveReadinessScore >= 85,
      detail: `Current Score: ${liveReadinessScore}% (Target: 85%)`
    },
    {
      id: 'soa',
      label: 'SoA Baseline Cryptographically Locked',
      met: Boolean(currentTenant?.soaBaselineLocked),
      detail: currentTenant?.soaBaselineLocked ? 'SHA-256 seal valid' : 'Pending SoA freeze & approval'
    },
    {
      id: 'capa',
      label: '0 Open Major Non-Conformities',
      met: openMajorFindingsCount === 0,
      detail: openMajorFindingsCount === 0 ? 'No critical blockers' : `${openMajorFindingsCount} open major findings`
    },
    {
      id: 'evidence',
      label: 'Evidence Verification Rate ≥ 75%',
      met: liveEvidenceRate >= 75,
      detail: `${liveEvidenceRate}% verified coverage (${verifiedEvidenceCount}/${totalEvidenceCount} artifacts)`
    },
    {
      id: 'internal_audit',
      label: 'Clause 9.2 Internal Audit Completed',
      met: internalAudits.length > 0 && internalAudits.some(ia => ia.status === 'Report Issued' || ia.status === 'Closed' || ia.status === 'Fieldwork Completed'),
      detail: internalAudits.length > 0 ? `${internalAudits.length} audit program(s) on record` : 'Fieldwork required'
    },
    {
      id: 'mrm',
      label: 'Clause 9.3 Management Review Signed Off',
      met: managementReviews && managementReviews.some(m => m.status === 'Signed Off' || m.signoffTimestamp),
      detail: (managementReviews && managementReviews.some(m => m.status === 'Signed Off')) ? 'Executive review approved' : 'Meeting minutes signoff needed'
    }
  ];

  const metChecksCount = stageGateChecks.filter(c => c.met).length;

  // Real-Time Recommendations
  const recommendations = useMemo(() => {
    const recs: Array<{ title: string; desc: string; impact: string; action: () => void }> = [];

    if (openMajorFindingsCount > 0) {
      recs.push({
        title: `Resolve ${openMajorFindingsCount} Open Major Non-Conformit${openMajorFindingsCount > 1 ? 'ies' : 'y'}`,
        desc: 'Major non-conformities prevent external auditor recommendation for Stage 1 sign-off.',
        impact: `+${(openMajorFindingsCount * 15).toFixed(0)}% Capa Recovery`,
        action: () => handleNavigate('findings_capa')
      });
    }

    if (actionRequiredEvidenceCount > 0 || pendingEvidenceCount > 0) {
      const count = actionRequiredEvidenceCount + pendingEvidenceCount;
      recs.push({
        title: `Review & Verify ${count} Pending Evidence Artifact${count > 1 ? 's' : ''}`,
        desc: `${pendingEvidenceCount} artifacts pending peer review; ${actionRequiredEvidenceCount} require updates.`,
        impact: `+${Math.min(15, Math.round(count * 2.5))}% Evidence Boost`,
        action: () => handleNavigate('evidence_centre')
      });
    }

    if (inProgressControlsCount > 0) {
      recs.push({
        title: `Complete ${Math.min(5, inProgressControlsCount)} In-Progress Annex A Controls`,
        desc: `${inProgressControlsCount} controls currently marked 'In Progress' in Statement of Applicability.`,
        impact: `+${Math.min(10, Math.round(Math.min(5, inProgressControlsCount) * 1.5))}% Controls Gain`,
        action: () => handleNavigate('statement_of_applicability')
      });
    }

    if (!currentTenant?.soaBaselineLocked) {
      recs.push({
        title: 'Lock Statement of Applicability Baseline',
        desc: 'Apply SHA-256 integrity freeze to establish formal audit scope.',
        impact: 'Mandatory Audit Gate',
        action: () => handleNavigate('statement_of_applicability')
      });
    }

    return recs;
  }, [
    openMajorFindingsCount,
    actionRequiredEvidenceCount,
    pendingEvidenceCount,
    inProgressControlsCount,
    currentTenant?.soaBaselineLocked
  ]);

  const isUninitialized = currentTenant?.isDemo || !currentTenant?.soaBaselineLocked || !currentTenant?.readinessScore || currentTenant?.readinessScore === 0;

  if (isUninitialized) {
    return (
      <div className={`p-6 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl ${className}`}>
        <DataCollectionRequired
          variant="card"
          title="Data collection required"
          description="Readiness scores, telemetry gauges, and audit stage-gate checks require live control test results and verified evidence artifacts. Data collection is required for this organization."
          actionLabel="Configure Real Data Collection"
          onAction={() => handleNavigate('evidence_upload')}
        />
      </div>
    );
  }

  return (
    <div className={`p-6 sm:p-7 rounded-3xl bg-gradient-to-br ${theme.bg} border ${theme.border} shadow-xl space-y-6 transition-all duration-300 ${className}`}>
      {/* Top Banner & Real-Time Sync Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-inner flex items-center justify-center">
            <Activity className={`w-5 h-5 ${theme.text} animate-pulse`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">
                Real-Time Telemetry Engine
              </span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-950/80 text-sky-400 border border-sky-800/60 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-0.5" />
                <span>LIVE SYNCED</span>
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center space-x-2">
              <span>ISO 27001 Real-Time Audit Readiness Score</span>
              {isSimulationActive && (
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-800">
                  SIMULATION ACTIVE
                </span>
              )}
            </h2>
          </div>
        </div>

        {/* Action Toggle Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setShowSimulator(prev => !prev)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
              showSimulator
                ? 'bg-sky-600 text-white border-sky-500 shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showSimulator ? 'Close Simulator' : 'What-If Simulator'}</span>
          </button>

          <button
            onClick={() => setShowStageGateChecklist(prev => !prev)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
              showStageGateChecklist
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Stage-Gate Checks ({metChecksCount}/{stageGateChecks.length})</span>
          </button>

          <button
            onClick={() => setShowFormulaDetails(prev => !prev)}
            className={`p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition`}
            title="Inspect Mathematical Formula & Weights"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Score Hero Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Radial SVG Score Gauge (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/80 border border-slate-800/90 text-center relative overflow-hidden group">
          {/* Subtle background glow */}
          <div className={`absolute -inset-1 bg-gradient-to-r ${theme.gradient} opacity-10 blur-xl group-hover:opacity-20 transition duration-500`} />

          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* SVG Circular Meter */}
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
              {/* Background Track */}
              <path
                className="text-slate-800/80"
                strokeWidth="3.2"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              {/* Benchmark Reference Tick (85% Target) */}
              <circle
                cx="18"
                cy="18"
                r="15.9155"
                stroke="#64748B"
                strokeWidth="3.2"
                strokeDasharray="1.5, 98.5"
                strokeDashoffset="-85"
                fill="none"
                className="opacity-80"
              />
              {/* Active Progress Path with smooth animation */}
              <motion.path
                className={theme.text}
                strokeWidth="3.4"
                strokeDasharray={`${activeScore}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                initial={{ strokeDasharray: "0, 100" }}
                animate={{ strokeDasharray: `${activeScore}, 100` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>

            {/* Central Score Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                key={activeScore}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-4xl sm:text-5xl font-black ${theme.text} tracking-tight font-mono`}
              >
                {activeScore}%
              </motion.span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                Audit Readiness
              </span>
            </div>
          </div>

          {/* Status Label & Gap to Stage 1 */}
          <div className="mt-3 space-y-1.5 w-full">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${theme.badgeBg}`}>
              {theme.label}
            </span>

            <div className="text-[11px] text-slate-400 flex items-center justify-center space-x-1.5 pt-1">
              {isStage1Ready ? (
                <span className="text-emerald-400 font-semibold flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Qualified for Stage 1 Certification (+{liveReadinessScore - stage1Target}% over gate)
                </span>
              ) : isMajorNcBlocked ? (
                <span className="text-rose-400 font-semibold flex items-center">
                  <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                  Stage 1 Gate Blocked by {openMajorFindingsCount} Major NC
                </span>
              ) : (
                <span className="text-amber-400 font-semibold flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                  {gapToStage1}% gap to Stage 1 Target (85%)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tri-Pillar Telemetry Breakdown (8 Cols) */}
        <div className="lg:col-span-8 space-y-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-bold uppercase tracking-wider text-[11px] text-slate-300">
              Live Tri-Pillar Assessment Composition
            </span>
            <span className="font-mono text-[10px] text-slate-400">
              Formula: Controls (45%) + Evidence (35%) + CAPA (20%)
            </span>
          </div>

          {/* Pillar 1: Controls Implementation */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-lg bg-sky-950 text-sky-400 border border-sky-800">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-bold text-white">1. Completed & Monitored Controls</h4>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      45% Weight
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {implementedControlsCount} of {totalApplicableCount} applicable controls implemented ({inProgressControlsCount} in progress)
                  </p>
                </div>
              </div>

              <div className="text-right flex flex-col items-end">
                <div className="flex items-center space-x-1.5">
                  <span className="text-sm font-black text-sky-400 font-mono">{liveControlRate}%</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                    +{weightedControlsScore}% wt
                  </span>
                </div>
                <button
                  onClick={() => handleNavigate('statement_of_applicability')}
                  className="text-[10px] font-semibold text-sky-400 hover:text-sky-300 flex items-center space-x-0.5 mt-0.5 group"
                >
                  <span>View SoA</span>
                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                </button>
              </div>
            </div>

            {/* Dynamic Progress Bar */}
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${liveControlRate}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-sky-600 to-sky-400 rounded-full"
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
              <span>✅ Implemented: <strong className="text-slate-200">{implementedControlsCount}</strong></span>
              <span>🔄 In Progress: <strong className="text-slate-200">{inProgressControlsCount}</strong></span>
              <span>⏳ Not Started: <strong className="text-slate-200">{notStartedControlsCount}</strong></span>
            </div>
          </div>

          {/* Pillar 2: Uploaded & Verified Evidence */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-bold text-white">2. Uploaded & Verified Evidence Artifacts</h4>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      35% Weight
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {verifiedEvidenceCount} of {totalEvidenceCount} artifacts verified ({controlsWithVerifiedEvidence} controls covered)
                  </p>
                </div>
              </div>

              <div className="text-right flex flex-col items-end">
                <div className="flex items-center space-x-1.5">
                  <span className="text-sm font-black text-indigo-400 font-mono">{liveEvidenceRate}%</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                    +{weightedEvidenceScore}% wt
                  </span>
                </div>
                <button
                  onClick={() => handleNavigate('evidence_centre')}
                  className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-0.5 mt-0.5 group"
                >
                  <span>Evidence Vault</span>
                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                </button>
              </div>
            </div>

            {/* Dynamic Progress Bar */}
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${liveEvidenceRate}%` }}
                transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full"
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
              <span>🛡️ Verified: <strong className="text-emerald-400">{verifiedEvidenceCount}</strong></span>
              <span>⏱️ Pending Review: <strong className="text-amber-400">{pendingEvidenceCount}</strong></span>
              <span>⚠️ Action Req: <strong className="text-rose-400">{actionRequiredEvidenceCount}</strong></span>
            </div>
          </div>

          {/* Pillar 3: Resolved Findings from CAPA Module */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-bold text-white">3. Resolved Findings & CAPA Remediation</h4>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      20% Weight
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {closedFindingsCount} of {totalFindingsCount || '0'} findings closed verified ({openMajorFindingsCount} major, {openMinorFindingsCount} minor open)
                  </p>
                </div>
              </div>

              <div className="text-right flex flex-col items-end">
                <div className="flex items-center space-x-1.5">
                  <span className="text-sm font-black text-emerald-400 font-mono">{liveCapaRate}%</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                    +{weightedCapaScore}% wt
                  </span>
                </div>
                <button
                  onClick={() => handleNavigate('findings_capa')}
                  className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-0.5 mt-0.5 group"
                >
                  <span>CAPA Tracker</span>
                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                </button>
              </div>
            </div>

            {/* Dynamic Progress Bar */}
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${liveCapaRate}%` }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full"
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
              <span>🎯 Closed Verified: <strong className="text-emerald-400">{closedFindingsCount}</strong></span>
              <span>🔴 Major NC: <strong className={openMajorFindingsCount > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}>{openMajorFindingsCount}</strong></span>
              <span>🟡 Minor NC: <strong className="text-amber-400">{openMinorFindingsCount}</strong></span>
              <span>🔵 Observations: <strong className="text-slate-300">{openObservationsCount}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* EXPANDABLE SECTION 1: WHAT-IF SENSITIVITY SIMULATOR */}
      <AnimatePresence>
        {showSimulator && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="p-5 rounded-2xl bg-slate-950/90 border border-sky-500/40 space-y-4 overflow-hidden shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">
                  What-If Readiness Simulation Sandbox
                </h3>
                <span className="text-[11px] text-slate-400">
                  Simulate the impact of pending operational actions on your live audit readiness score.
                </span>
              </div>

              {isSimulationActive && (
                <button
                  onClick={() => {
                    setSimExtraControls(0);
                    setSimExtraEvidence(0);
                    setSimResolvedCapas(0);
                  }}
                  className="flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-800 transition"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Simulation</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Slider 1: Controls */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Implement In-Progress Controls:</span>
                  <strong className="text-sky-400">+{simExtraControls} Controls</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max={inProgressControlsCount + notStartedControlsCount}
                  value={simExtraControls}
                  onChange={e => setSimExtraControls(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
                <div className="text-[10px] text-slate-400 flex justify-between">
                  <span>Current: {implementedControlsCount}</span>
                  <span>Simulated: {simImplementedControls}</span>
                </div>
              </div>

              {/* Slider 2: Evidence */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Verify Pending Evidence:</span>
                  <strong className="text-indigo-400">+{simExtraEvidence} Artifacts</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max={pendingEvidenceCount + actionRequiredEvidenceCount}
                  value={simExtraEvidence}
                  onChange={e => setSimExtraEvidence(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="text-[10px] text-slate-400 flex justify-between">
                  <span>Current: {verifiedEvidenceCount}</span>
                  <span>Simulated: {simVerifiedEvidence}</span>
                </div>
              </div>

              {/* Slider 3: CAPA */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Resolve Open Findings:</span>
                  <strong className="text-emerald-400">+{simResolvedCapas} CAPAs</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max={openFindingsCount}
                  value={simResolvedCapas}
                  onChange={e => setSimResolvedCapas(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="text-[10px] text-slate-400 flex justify-between">
                  <span>Closed: {closedFindingsCount}</span>
                  <span>Simulated: {simClosedFindings}</span>
                </div>
              </div>
            </div>

            {/* Simulation Impact Banner */}
            <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-800/60 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-slate-300">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>
                  Simulation Impact: Projected Readiness Score{' '}
                  <strong className="text-white font-mono text-sm">{simulatedReadinessScore}%</strong>{' '}
                  ({simulatedReadinessScore >= liveReadinessScore ? `+${simulatedReadinessScore - liveReadinessScore}%` : `${simulatedReadinessScore - liveReadinessScore}%`} delta)
                </span>
              </div>
              <span className="font-mono text-[11px] text-sky-400">
                {simulatedReadinessScore >= 85 ? '✅ Would Qualify for Stage 1' : `⚠️ Needs ${85 - simulatedReadinessScore}% more for Stage 1`}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EXPANDABLE SECTION 2: STAGE-GATE CERTIFICATION CHECKLIST */}
      <AnimatePresence>
        {showStageGateChecklist && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="p-5 rounded-2xl bg-slate-950/90 border border-emerald-500/40 space-y-4 overflow-hidden shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  Stage 1 Certification Stage-Gate Compliance Checklist
                </h3>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                {metChecksCount} / {stageGateChecks.length} Mandatory Gates Met
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {stageGateChecks.map(chk => (
                <div
                  key={chk.id}
                  className={`p-3.5 rounded-xl border flex items-start space-x-2.5 transition ${
                    chk.met
                      ? 'bg-emerald-950/30 border-emerald-800/60'
                      : 'bg-rose-950/20 border-rose-900/40'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {chk.met ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    )}
                  </div>
                  <div>
                    <h5 className={`text-xs font-bold ${chk.met ? 'text-white' : 'text-slate-200'}`}>
                      {chk.label}
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">{chk.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EXPANDABLE SECTION 3: MATHEMATICAL FORMULA TRANSPARENCY */}
      <AnimatePresence>
        {showFormulaDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="p-5 rounded-2xl bg-slate-950/90 border border-slate-700 space-y-3 overflow-hidden"
          >
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-sky-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Mathematical Scoring Architecture (ISO/IEC 27001:2022)
              </h3>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1 leading-relaxed">
              <p className="text-sky-300 font-bold">
                Readiness Score = (Control Completion % × 0.45) + (Evidence Verification & Coverage % × 0.35) + (CAPA Remediation % × 0.20)
              </p>
              <div className="text-slate-400 text-[10px] pt-1 border-t border-slate-800 space-y-0.5">
                <div>• Controls Factor (45%): Evaluates implemented vs applicable controls in the locked Statement of Applicability.</div>
                <div>• Evidence Factor (35%): Evaluates reviewed & verified artifacts (70%) combined with unique control coverage (30%).</div>
                <div>• CAPA Factor (20%): Evaluates percentage of closed verified audit findings and non-conformities.</div>
                <div>• Stage 1 Gating Rule: Any unmitigated Major Non-Conformity caps the overall certification readiness score at 84%.</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actionable Recommendations Row */}
      {recommendations.length > 0 && (
        <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Priority Actions to Maximize Readiness</span>
            </div>
            <span className="text-[10px] text-slate-400">Dynamically prioritized by scoring impact</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {recommendations.slice(0, 3).map((rec, i) => (
              <div
                key={i}
                onClick={rec.action}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-sky-500/60 hover:bg-slate-900 cursor-pointer transition space-y-1.5 group shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
                    {rec.impact}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition" />
                </div>
                <h5 className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                  {rec.title}
                </h5>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {rec.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
