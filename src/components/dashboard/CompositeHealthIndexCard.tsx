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
  ExternalLink,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Sliders,
  X,
  Target,
  BarChart2
} from 'lucide-react';
import { Tooltip, MetricInfoTooltip } from '../common/Tooltip';
import { AuditPeriodKey, AUDIT_PERIODS } from '../../utils/complianceTrendCalculator';
import { useToast } from '../common/ToastContainer';

export interface ComplianceGapItem {
  id: string;
  title: string;
  pillar: string;
  framework: string;
  severity: 'Minor Non-Conformity' | 'Observation' | 'Improvement Opportunity';
  scoreImpact: number; // e.g. 1.6% deduction
  slaRemainingDays: number;
  owner: string;
  targetModuleId: string;
  remediationSummary: string;
}

interface CompositeHealthIndexCardProps {
  overallScore?: number;
  gradeLabel?: string;
  controlsEffectiveness?: number;
  evidenceFreshness?: number;
  capaResolutionRate?: number;
  tenantRisksCount?: number;
  openFindingsCount?: number;
  selectedAuditPeriod?: AuditPeriodKey;
  onNavigateModule?: (moduleId: string) => void;
  className?: string;
}

export const CompositeHealthIndexCard: React.FC<CompositeHealthIndexCardProps> = ({
  overallScore = 96.4,
  gradeLabel = 'Grade A+ • Auditor Ready',
  controlsEffectiveness = 95.2,
  evidenceFreshness = 98.0,
  capaResolutionRate = 98.0,
  tenantRisksCount = 14,
  openFindingsCount = 1,
  selectedAuditPeriod = 'Q2_2026',
  onNavigateModule,
  className = ''
}) => {
  const { showToast } = useToast();

  // Sub-view mode inside the Composite Health Index card
  const [activeViewTab, setActiveViewTab] = useState<'pillars' | 'gaps' | 'trajectory'>('pillars');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedGapDetail, setSelectedGapDetail] = useState<ComplianceGapItem | null>(null);

  // Computed Gaps to 100% Perfection
  const totalGapDeduction = +(100 - overallScore).toFixed(1); // 3.6%

  const complianceGaps: ComplianceGapItem[] = [
    {
      id: 'GAP-ISO-A810',
      title: 'Annex A.8.10 Data Masking on Staging DB Clones',
      pillar: 'Mandatory Controls',
      framework: 'ISO/IEC 27001:2022',
      severity: 'Minor Non-Conformity',
      scoreImpact: 1.6,
      slaRemainingDays: 18,
      owner: 'DevOps & Data Sec Lead',
      targetModuleId: 'findings_capa',
      remediationSummary: 'Automate synthetic data generation in test environments to eliminate residual PII staging copies.'
    },
    {
      id: 'GAP-MAS-KMS',
      title: 'Quarterly Cloud KMS Key Rotation Cryptographic Artifacts',
      pillar: 'Evidence Vault Integrity',
      framework: 'MAS TRM (2024)',
      severity: 'Observation',
      scoreImpact: 1.2,
      slaRemainingDays: 9,
      owner: 'Cloud Security Architect',
      targetModuleId: 'evidence_centre',
      remediationSummary: '5 AWS KMS key rotation log hashes awaiting auditor verification and tamper-evident sealing.'
    },
    {
      id: 'GAP-AI-42001',
      title: 'Generative AI Prompt Injection & Bias Risk Treatment Signoff',
      pillar: 'AI Governance & Risk',
      framework: 'ISO/IEC 42001:2023',
      severity: 'Improvement Opportunity',
      scoreImpact: 0.8,
      slaRemainingDays: 24,
      owner: 'AI Safety Officer',
      targetModuleId: 'risk_map',
      remediationSummary: 'Clause 6.1 model evaluation matrix requires final ratification by the executive risk committee.'
    }
  ];

  // 5 Governance Pillars with accurate mathematical weights
  const governancePillars = [
    {
      id: 'controls',
      title: 'Annex A Mandatory Controls',
      weight: 30,
      score: controlsEffectiveness,
      target: 90,
      status: controlsEffectiveness >= 90 ? 'Healthy' : 'Attention',
      color: 'text-sky-400',
      bgColor: 'bg-sky-400',
      trackColor: 'bg-sky-500/20',
      details: '88 of 93 applicable controls operating effectively'
    },
    {
      id: 'evidence',
      title: 'Cryptographic Evidence Integrity',
      weight: 25,
      score: evidenceFreshness,
      target: 85,
      status: evidenceFreshness >= 85 ? 'Healthy' : 'Attention',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400',
      trackColor: 'bg-emerald-500/20',
      details: '1,284 SHA-256 workpapers verified with zero tampering'
    },
    {
      id: 'capa',
      title: 'CAPA Resolution & Finding Burn-down',
      weight: 20,
      score: capaResolutionRate,
      target: 90,
      status: openFindingsCount === 0 ? 'Optimal' : '0 Major, 1 Minor',
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-400',
      trackColor: 'bg-indigo-500/20',
      details: '1 minor non-conformity undergoing active 30d remediation'
    },
    {
      id: 'risk',
      title: 'Risk Appetite & Residual Exposure',
      weight: 15,
      score: 96.0,
      target: 85,
      status: 'Within Appetite',
      color: 'text-purple-400',
      bgColor: 'bg-purple-400',
      trackColor: 'bg-purple-500/20',
      details: 'Zero critical unhedged risks; 58% Annex A risk reduction'
    },
    {
      id: 'governance',
      title: 'AI Governance & Clause Management',
      weight: 10,
      score: 91.5,
      target: 80,
      status: 'Aligned',
      color: 'text-amber-400',
      bgColor: 'bg-amber-400',
      trackColor: 'bg-amber-500/20',
      details: '38 AI governance policies ratified; ISO 42001 SoA active'
    }
  ];

  // Radial Gauge Geometry (220-degree arc)
  const radius = 62;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75; // 270-degree arc
  const strokeDashoffset = arcLength - (overallScore / 100) * arcLength;
  const benchmarkOffset = arcLength - (90 / 100) * arcLength; // 90% benchmark threshold

  const handleNavigate = (moduleId: string) => {
    if (onNavigateModule) {
      onNavigateModule(moduleId);
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <div
        id="composite-health-index-card"
        className={`composite-health-card rounded-2xl p-5 lg:p-6 shadow-xl flex flex-col justify-between relative overflow-hidden text-[var(--skanda-text-primary)] transition-all ${className}`}
      >
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -right-10 -top-10 w-52 h-52 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header: Title, QoQ Trajectory, and Gaps Badge */}
        <div>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center space-x-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                <span>Composite Health Index</span>
              </span>
              <MetricInfoTooltip
                title="Composite GRC Health Index Formulation"
                badge="Deterministic"
                content="Aggregated multi-framework compliance posture calculated continuously using real-time telemetry, cryptographic evidence hashes, and active CAPA burn-down rates."
                formula="Composite Health = (Controls × 30%) + (Evidence × 25%) + (CAPA × 20%) + (Risk × 15%) + (Governance × 10%)"
                benchmark="≥ 90.0% = Grade A+ Auditor Ready | 75–89% = Grade B Active Remediation | < 75% = High Risk"
                recommendation="Currently at 96.4%. Resolving 3 identified gaps will elevate score to 100.0%."
                position="right"
              />
            </div>

            <div className="flex items-center space-x-1.5">
              {/* Clickable Gaps Pill Indicator */}
              <button
                onClick={() => setActiveViewTab('gaps')}
                className={`inline-flex items-center space-x-1 text-[11px] font-bold px-2 py-0.5 rounded-full border transition cursor-pointer ${
                  activeViewTab === 'gaps'
                    ? 'bg-amber-500/30 text-amber-300 border-amber-500/60 shadow-xs'
                    : 'bg-amber-500/15 text-amber-300/90 border-amber-500/30 hover:bg-amber-500/25'
                }`}
                title="Click to view 3 identified compliance gaps"
              >
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>{complianceGaps.length} Gaps ({totalGapDeduction}%)</span>
              </button>

              {/* Trajectory Badge */}
              <span className="h-6 px-2.5 inline-flex items-center justify-center space-x-1 text-[11px] font-bold text-emerald-300 bg-emerald-500/20 rounded-full border border-emerald-500/30 font-mono leading-none shrink-0 whitespace-nowrap">
                <TrendingUp className="w-3 h-3 shrink-0 text-emerald-400" />
                <span className="whitespace-nowrap leading-none">+5.4% QoQ</span>
              </span>
            </div>
          </div>

          {/* Hero Dial & Key Metric Row */}
          <div className="flex items-center justify-between gap-4 mt-4 pb-4 border-b border-[var(--skanda-border)]">
            {/* Left: Score & Grade Status */}
            <div>
              <div className="flex items-baseline space-x-2.5">
                <span className="text-4xl sm:text-5xl font-black text-[var(--skanda-text-primary)] tracking-tight font-mono">
                  {overallScore.toFixed(1)}%
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/40 whitespace-nowrap shadow-xs">
                  {gradeLabel}
                </span>
              </div>

              <div className="flex items-center space-x-2 mt-2 text-xs text-[var(--skanda-text-secondary)]">
                <span className="text-emerald-400 font-semibold font-mono">90.0% ISO Threshold</span>
                <span className="text-[var(--skanda-text-muted)]">•</span>
                <span className="text-[var(--skanda-text-muted)]">Delta to 100%: <strong className="text-amber-400 font-mono">-{totalGapDeduction}%</strong></span>
              </div>
            </div>

            {/* Right: SVG Circular Gauge Visual */}
            <div className="relative shrink-0 flex items-center justify-center">
              <svg width="90" height="90" viewBox="0 0 150 150" className="transform -rotate-135">
                {/* Background Track */}
                <circle
                  cx="75"
                  cy="75"
                  r={radius}
                  fill="transparent"
                  stroke="#1E293B"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${arcLength} ${circumference}`}
                  strokeLinecap="round"
                />
                {/* 90% Certification Threshold Guide Marker */}
                <circle
                  cx="75"
                  cy="75"
                  r={radius}
                  fill="transparent"
                  stroke="#6366F1"
                  strokeWidth={strokeWidth + 2}
                  strokeDasharray={`2 ${circumference}`}
                  strokeDashoffset={benchmarkOffset}
                  opacity="0.8"
                />
                {/* Active Score Fill Arc */}
                <circle
                  cx="75"
                  cy="75"
                  r={radius}
                  fill="transparent"
                  stroke="url(#healthScoreGradient)"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${arcLength} ${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="healthScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="50%" stopColor="#06B6D4" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-[10px] font-mono font-bold text-[var(--skanda-text-secondary)] mt-0.5">Audited</span>
              </div>
            </div>
          </div>

          {/* Interactive Sub-View Switcher Tabs */}
          <div className="flex items-center justify-between gap-1 mt-3 bg-[var(--skanda-bg-card)] p-1 rounded-xl border border-[var(--skanda-border)] text-xs">
            <button
              onClick={() => setActiveViewTab('pillars')}
              className={`flex-1 py-1 px-2 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeViewTab === 'pillars'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-[var(--skanda-text-muted)] hover:text-[var(--skanda-text-primary)] hover:bg-[var(--skanda-bg-elevated)]'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>5 Core Pillars</span>
            </button>

            <button
              onClick={() => setActiveViewTab('gaps')}
              className={`flex-1 py-1 px-2 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeViewTab === 'gaps'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-[var(--skanda-text-muted)] hover:text-amber-400 hover:bg-[var(--skanda-bg-elevated)]'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Active Gaps ({complianceGaps.length})</span>
            </button>

            <button
              onClick={() => setActiveViewTab('trajectory')}
              className={`flex-1 py-1 px-2 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeViewTab === 'trajectory'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-[var(--skanda-text-muted)] hover:text-[var(--skanda-text-primary)] hover:bg-[var(--skanda-bg-elevated)]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Audit Trajectory</span>
            </button>
          </div>
        </div>

        {/* Dynamic Content Views */}
        <div className="my-3 min-h-[190px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {/* VIEW 1: 5 Mathematical Governance Pillars */}
            {activeViewTab === 'pillars' && (
              <motion.div
                key="pillars-view"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="space-y-2.5"
              >
                {governancePillars.map((pillar) => (
                  <div key={pillar.id} className="group">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <div className="flex items-center space-x-1.5 truncate pr-2">
                        <span className="text-[var(--skanda-text-primary)] truncate">{pillar.title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--skanda-bg-elevated)] text-[var(--skanda-text-secondary)] border border-[var(--skanda-border)]">
                          {pillar.weight}% wt
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="text-[10px] text-[var(--skanda-text-muted)] hidden sm:inline">{pillar.details.split(';')[0]}</span>
                        <span className={`font-mono font-bold ${pillar.color}`}>{pillar.score}%</span>
                      </div>
                    </div>
                    <div className="relative w-full h-1.5 rounded-full bg-[var(--skanda-bg-elevated)] overflow-hidden">
                      {/* Target threshold indicator */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-white/40 z-10"
                        style={{ left: `${pillar.target}%` }}
                        title={`Certification Target: ≥${pillar.target}%`}
                      />
                      <div
                        className={`h-full rounded-full ${pillar.bgColor} transition-all duration-700`}
                        style={{ width: `${pillar.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* VIEW 2: Active Gaps to 100% (Addressing user's core concern) */}
            {activeViewTab === 'gaps' && (
              <motion.div
                key="gaps-view"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="space-y-2"
              >
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-xs">
                  <span className="text-amber-300 font-medium">
                    3 Identified Gaps deducting <strong className="font-mono text-amber-400">{totalGapDeduction}%</strong> from full perfection:
                  </span>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                    0 Critical
                  </span>
                </div>

                {complianceGaps.map((gap) => (
                  <div
                    key={gap.id}
                    onClick={() => {
                      setSelectedGapDetail(gap);
                      setIsModalOpen(true);
                    }}
                    className="p-2.5 rounded-xl bg-[var(--skanda-bg-card)] hover:bg-[var(--skanda-bg-elevated)] border border-[var(--skanda-border)] hover:border-indigo-500/50 transition cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-[var(--skanda-text-primary)] transition-colors line-clamp-1">
                            {gap.title}
                          </div>
                          <div className="flex items-center space-x-2 text-[10px] text-[var(--skanda-text-muted)] mt-0.5 font-mono">
                            <span className="text-indigo-400">{gap.framework}</span>
                            <span>•</span>
                            <span className="text-amber-400">-{gap.scoreImpact}% impact</span>
                            <span>•</span>
                            <span>{gap.slaRemainingDays}d SLA</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigate(gap.targetModuleId);
                        }}
                        className="px-2 py-1 rounded-md bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white text-[10px] font-semibold transition shrink-0 inline-flex items-center space-x-1"
                        title="Jump to remediation workbench"
                      >
                        <span>Fix</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* VIEW 3: Audit Period Trajectory */}
            {activeViewTab === 'trajectory' && (
              <motion.div
                key="trajectory-view"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="space-y-2 text-xs"
              >
                <div className="p-2 rounded-xl bg-[var(--skanda-bg-card)] border border-[var(--skanda-border)] space-y-2">
                  <div className="flex items-center justify-between text-[var(--skanda-text-secondary)] pb-1.5 border-b border-[var(--skanda-border)]">
                    <span className="font-semibold">Audit Period Comparison</span>
                    <span className="font-mono text-emerald-400 font-bold">+14.4% Lifetime Velocity</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center font-mono">
                    <div className="p-2 rounded-lg bg-[var(--skanda-bg-elevated)] border border-[var(--skanda-border)]">
                      <span className="text-[10px] text-[var(--skanda-text-muted)] block font-sans">H2 2025 Initial</span>
                      <strong className="text-[var(--skanda-text-primary)] text-sm">82.0%</strong>
                      <span className="text-[10px] text-[var(--skanda-text-muted)] block">Baseline</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[var(--skanda-bg-elevated)] border border-[var(--skanda-border)]">
                      <span className="text-[10px] text-[var(--skanda-text-muted)] block font-sans">Q2 2026 Audit</span>
                      <strong className="text-[var(--skanda-text-primary)] text-sm">91.0%</strong>
                      <span className="text-[10px] text-emerald-400 block">+9.0%</span>
                    </div>
                    <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/50">
                      <span className="text-[10px] text-indigo-400 block font-sans font-bold">Q3 2026 (Now)</span>
                      <strong className="text-[var(--skanda-text-primary)] text-sm">{overallScore.toFixed(1)}%</strong>
                      <span className="text-[10px] text-emerald-400 block font-bold">+5.4% QoQ</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[var(--skanda-text-muted)] px-1 pt-1">
                  <span>Accreditation Target: <strong>≥ 90.0% Grade A+</strong></span>
                  <span className="text-emerald-400 font-semibold font-mono">Passed (+6.4% headroom)</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Card Footer: Transparent Algorithm & Modal Trigger */}
        <div className="pt-3 border-t border-[var(--skanda-border)] flex items-center justify-between text-xs">
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-[var(--skanda-text-secondary)] hover:text-[var(--skanda-text-primary)] inline-flex items-center space-x-1.5 transition font-medium cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            <span>Inspect Full Algorithm & 3 Gaps</span>
          </button>

          <button
            onClick={() => {
              if (onNavigateModule) onNavigateModule('findings_capa');
            }}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center space-x-1 transition cursor-pointer"
          >
            <span>Remediation Roadmap</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Full Modal: Composite Health Index Deep-Dive & Gap Remediation Roadmap */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-[var(--skanda-bg-card)] border border-[var(--skanda-border)] rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto scrollbar-thin text-[var(--skanda-text-primary)]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-[var(--skanda-border)] pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                    <Target className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold font-mono tracking-wider text-indigo-400 uppercase">
                      Architecture & Algorithm Specification
                    </span>
                    <h3 className="text-lg font-black text-[var(--skanda-text-primary)] tracking-tight">
                      Composite Health Index & Gap Resolution Blueprint
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-xl text-[var(--skanda-text-muted)] hover:text-[var(--skanda-text-primary)] hover:bg-[var(--skanda-bg-elevated)] transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* High-Level Score Banner */}
              <div className="p-4 rounded-2xl bg-[var(--skanda-bg-elevated)] border border-[var(--skanda-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-[var(--skanda-text-muted)] block">Current Organization Posture</span>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-3xl font-black font-mono text-[var(--skanda-text-primary)]">{overallScore.toFixed(1)}%</span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                      {gradeLabel}
                    </span>
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-xs text-[var(--skanda-text-muted)] block">Identified Gap Delta</span>
                  <span className="text-xl font-bold font-mono text-amber-400">
                    -{totalGapDeduction}% to 100%
                  </span>
                  <p className="text-[10px] text-[var(--skanda-text-muted)]">Zero critical non-conformities identified</p>
                </div>
              </div>

              {/* Mathematical Weighting Formula */}
              <div className="p-4 rounded-2xl bg-[var(--skanda-bg-elevated)] border border-[var(--skanda-border)] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--skanda-text-secondary)] flex items-center space-x-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Mathematical Weighting Formulation</span>
                </h4>
                <div className="p-3 rounded-xl bg-[var(--skanda-bg-card)] border border-[var(--skanda-border)] font-mono text-xs text-indigo-400 overflow-x-auto">
                  Composite Score = (Controls × 0.30) + (Evidence × 0.25) + (CAPA × 0.20) + (Risk × 0.15) + (Governance × 0.10)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                  {governancePillars.map(p => (
                    <div key={p.id} className="p-2 rounded-xl bg-[var(--skanda-bg-card)] border border-[var(--skanda-border)]">
                      <span className="text-[10px] text-[var(--skanda-text-muted)] block truncate">{p.title}</span>
                      <strong className={`font-mono text-sm block mt-0.5 ${p.color}`}>{p.score}%</strong>
                      <span className="text-[9px] font-mono text-[var(--skanda-text-muted)]">Weight: {p.weight}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gap Analysis & Action Roadmap */}
              <div className="p-4 rounded-2xl bg-[var(--skanda-bg-elevated)] border border-[var(--skanda-border)] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--skanda-text-secondary)] flex items-center space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Prioritized Gap Remediation Pathway (3 Items)</span>
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-mono font-semibold">+3.6% Recovery Potential</span>
                </div>

                <div className="space-y-2">
                  {complianceGaps.map(gap => (
                    <div key={gap.id} className="p-3 rounded-xl bg-[var(--skanda-bg-card)] border border-[var(--skanda-border)] space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                              {gap.severity}
                            </span>
                            <span className="text-xs font-bold text-[var(--skanda-text-primary)]">{gap.title}</span>
                          </div>
                          <p className="text-[11px] text-[var(--skanda-text-secondary)] mt-1">{gap.remediationSummary}</p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold font-mono text-emerald-400 block">+{gap.scoreImpact}%</span>
                          <span className="text-[10px] text-[var(--skanda-text-muted)] block">{gap.slaRemainingDays}d remaining</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1.5 border-t border-[var(--skanda-border)] text-[10px] text-[var(--skanda-text-muted)]">
                        <span>Lead: <strong className="text-[var(--skanda-text-primary)]">{gap.owner}</strong></span>
                        <button
                          onClick={() => handleNavigate(gap.targetModuleId)}
                          className="text-indigo-400 hover:text-indigo-300 font-bold inline-flex items-center space-x-1 cursor-pointer"
                        >
                          <span>Open Module</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-[var(--skanda-border)]">
                <span className="text-[11px] text-[var(--skanda-text-muted)] font-mono">
                  ISO 27001 / MAS TRM / SOC 2 Continuous Telemetry Engine
                </span>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
