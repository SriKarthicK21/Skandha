import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Printer,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ArrowUpRight,
  Target,
  Clock,
  User,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  FileText,
  Lightbulb,
  Award,
  TrendingUp,
  Info,
  Layers,
  Send,
  X
} from 'lucide-react';
import { DataCollectionRequired } from '../common/DataCollectionRequired';

export interface AIExecutiveBriefingData {
  executiveSummary: {
    overview: string;
    governancePosture: string;
    trajectoryAndVelocity: string;
    auditorVerdict: string;
  };
  keyRiskAreas: Array<{
    area: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    vulnerability: string;
    impactAnalysis: string;
    rootCause: string;
    mitigationRecommendation: string;
    affectedDomain: string;
  }>;
  strategicRecommendations: Array<{
    priority: 'P1' | 'P2' | 'P3';
    action: string;
    targetOwner: string;
    timeframe: string;
    expectedOutcome: string;
  }>;
  auditReadinessVerdict: {
    status: 'READY' | 'ON_TRACK' | 'ATTENTION_REQUIRED' | 'AT_RISK';
    headline: string;
    confidenceScore: number;
    summary: string;
  };
  modelUsed?: string;
  generatedAt?: string;
  isCached?: boolean;
}

interface AIExecutiveBriefingViewProps {
  data: AIExecutiveBriefingData | null;
  isLoading: boolean;
  error: string | null;
  onGenerate: (customFocus?: string) => void;
  tenantName?: string;
  readinessScore?: number;
  metrics?: {
    controlCompletionRate: number;
    evidenceReadinessRate: number;
    capaClosureRate: number;
    implementedControls: number;
    totalControls: number;
    verifiedEvidence: number;
    totalEvidence: number;
  };
}

export const AIExecutiveBriefingView: React.FC<AIExecutiveBriefingViewProps> = ({
  data,
  isLoading,
  error,
  onGenerate,
  tenantName = 'Enterprise Tenant',
  readinessScore,
  metrics
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'ALL' | 'SUMMARY' | 'KEY_RISKS' | 'RECOMMENDATIONS'>('ALL');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL');
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [customPromptInput, setCustomPromptInput] = useState<string>('');
  const [expandedRiskIndex, setExpandedRiskIndex] = useState<number | null>(null);

  const handleCopy = () => {
    if (!data) return;
    const textToCopy = `=== SKANDA GRC AUTONOMOUS EXECUTIVE BRIEFING ===
Organization: ${tenantName}
Generated: ${data.generatedAt ? new Date(data.generatedAt).toLocaleString() : new Date().toLocaleString()}
Engine: ${data.modelUsed || 'Gemini 3.8 Flash'}
Audit Readiness Verdict: ${data.auditReadinessVerdict.headline} (${data.auditReadinessVerdict.confidenceScore}% Confidence)

--- EXECUTIVE SUMMARY ---
${data.executiveSummary.overview}

[Governance Posture]
${data.executiveSummary.governancePosture}

[Trajectory & Milestone Velocity]
${data.executiveSummary.trajectoryAndVelocity}

[Lead Auditor Verdict]
${data.executiveSummary.auditorVerdict}

--- KEY RISK AREAS (${data.keyRiskAreas.length}) ---
${data.keyRiskAreas.map((r, i) => `${i + 1}. [${r.severity}] ${r.area} (${r.affectedDomain})
   - Vulnerability: ${r.vulnerability}
   - Impact: ${r.impactAnalysis}
   - Root Cause: ${r.rootCause}
   - Recommended Mitigation: ${r.mitigationRecommendation}`).join('\n\n')}

--- STRATEGIC RECOMMENDATIONS ---
${data.strategicRecommendations.map(s => `[${s.priority}] ${s.action}
   Owner: ${s.targetOwner} | Horizon: ${s.timeframe}
   Outcome: ${s.expectedOutcome}`).join('\n\n')}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowCustomModal(false);
    onGenerate(customPromptInput.trim());
  };

  // Severity color mapping
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-950/80 text-rose-300 border-rose-800/80 ring-1 ring-rose-500/20';
      case 'HIGH':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/80 ring-1 ring-amber-500/20';
      case 'MEDIUM':
        return 'bg-sky-950/80 text-sky-300 border-sky-800/80 ring-1 ring-sky-500/20';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  // Verdict status badge
  const getVerdictStyles = (status: string) => {
    switch (status) {
      case 'READY':
        return {
          bg: 'bg-emerald-950/40 border-emerald-800/80',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-600/40',
          icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
          glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]'
        };
      case 'ON_TRACK':
        return {
          bg: 'bg-sky-950/40 border-sky-800/80',
          badge: 'bg-sky-500/20 text-sky-300 border-sky-600/40',
          icon: <Award className="w-5 h-5 text-sky-400" />,
          glow: 'shadow-[0_0_20px_rgba(14,165,233,0.15)]'
        };
      case 'ATTENTION_REQUIRED':
        return {
          bg: 'bg-amber-950/40 border-amber-800/80',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-600/40',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
          glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]'
        };
      default:
        return {
          bg: 'bg-rose-950/40 border-rose-800/80',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-600/40',
          icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
          glow: 'shadow-[0_0_20px_rgba(244,63,94,0.15)]'
        };
    }
  };

  const filteredRisks = data?.keyRiskAreas.filter(r => {
    if (selectedRiskFilter === 'ALL') return true;
    return r.severity === selectedRiskFilter;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Top Banner with Actions */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 relative overflow-hidden shadow-sm">
        <div className="absolute -right-8 -top-8 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-950 border border-indigo-700/60 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
                <span>Gemini 3.8 Flash Lead Auditor Engine</span>
              </span>
              {data?.isCached && (
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  Cached
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Executive Briefing & Key Risk Areas Analysis
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Synthesized by SKANDA Autonomous GRC Intelligence based on real-time controls completion ({metrics?.controlCompletionRate ?? 78}%), verified evidence ({metrics?.evidenceReadinessRate ?? 72}%), and active risk registers.
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setShowCustomModal(true)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              title="Tailor AI briefing focus"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tailor Focus</span>
            </button>

            <button
              onClick={handleCopy}
              disabled={!data}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              title="Copy formatted briefing to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              disabled={!data}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              title="Print Executive Briefing"
            >
              <Printer className="w-3.5 h-3.5 text-sky-400" />
              <span>Print</span>
            </button>

            <button
              onClick={() => onGenerate()}
              disabled={isLoading}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/20 border border-indigo-500/40 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Synthesizing...' : data ? 'Regenerate Analysis' : 'Generate Briefing'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error state if any */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 flex items-start space-x-3 text-xs text-rose-200">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold">Generation Notice</div>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-950 border border-indigo-800 text-indigo-400 animate-pulse">
            <Sparkles className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">Synthesizing Executive GRC Intelligence</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Gemini 3.8 Flash is analyzing 93 Annex A controls, telemetry logs, internal CAPA closure velocity, and the 45-day Stage 1 audit timeline...
            </p>
          </div>
          <div className="w-64 h-1.5 bg-slate-950 rounded-full mx-auto overflow-hidden border border-slate-800">
            <motion.div
              className="h-full bg-indigo-500 rounded-full"
              animate={{ x: [-200, 264] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            />
          </div>
        </div>
      )}

      {/* Empty State before first generation */}
      {!data && !isLoading && (
        <div className="p-8 sm:p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-950/80 border border-indigo-700/60 mx-auto flex items-center justify-center text-indigo-400 shadow-inner">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="text-base sm:text-lg font-bold text-white">
              Generate Formal C-Level Executive Briefing & Risk Assessment
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              SKANDA connects your live controls telemetry, evidence verification backlog, internal audit observations, and compliance roadmap into an authoritative auditor briefing report.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto text-[11px] text-slate-300">
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">✓ 93 Controls Telemetry</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">✓ Evidence Decay & Sampling</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">✓ Clause 9.3 Governance Review</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">✓ ISO 27001 & MAS TRM Alignment</span>
          </div>

          <button
            onClick={() => onGenerate()}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/25 border border-indigo-500/40 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Executive Briefing Now (Gemini 3.8 Flash)</span>
          </button>
        </div>
      )}

      {/* Populated Data Display */}
      {data && !isLoading && (
        <div className="space-y-6">
          {/* Verdict Banner */}
          {(() => {
            const verdictStyles = getVerdictStyles(data.auditReadinessVerdict.status);
            return (
              <div className={`p-6 rounded-2xl border ${verdictStyles.bg} ${verdictStyles.glow} transition`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                      {verdictStyles.icon}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${verdictStyles.badge}`}>
                          Verdict: {data.auditReadinessVerdict.status.replace('_', ' ')}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Auditor Confidence: <strong className="text-white">{data.auditReadinessVerdict.confidenceScore}%</strong>
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white tracking-tight">
                        {data.auditReadinessVerdict.headline}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                        {data.auditReadinessVerdict.summary}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-center shrink-0 min-w-[140px]">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Score</div>
                    {readinessScore !== undefined && readinessScore > 0 ? (
                      <>
                        <div className="text-3xl font-black text-white mt-0.5">{readinessScore}%</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Target: &ge; 85%</div>
                      </>
                    ) : (
                      <div className="mt-2 flex justify-center">
                        <DataCollectionRequired variant="badge" title="Data collection required" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Sub Navigation Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setActiveSubTab('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeSubTab === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Complete Briefing
              </button>
              <button
                onClick={() => setActiveSubTab('SUMMARY')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeSubTab === 'SUMMARY'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Executive Summary</span>
              </button>
              <button
                onClick={() => setActiveSubTab('KEY_RISKS')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeSubTab === 'KEY_RISKS'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Key Risk Areas ({data.keyRiskAreas.length})</span>
              </button>
              <button
                onClick={() => setActiveSubTab('RECOMMENDATIONS')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeSubTab === 'RECOMMENDATIONS'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>Strategic Roadmap ({data.strategicRecommendations.length})</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              Engine: <strong className="text-slate-300">{data.modelUsed || 'gemini-3.8-flash'}</strong>
            </div>
          </div>

          {/* SECTION 1: EXECUTIVE SUMMARY NARRATIVE */}
          {(activeSubTab === 'ALL' || activeSubTab === 'SUMMARY') && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Executive Summary & Compliance Posture
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">Clause 9.3 & Lead Auditor Evaluation</span>
              </div>

              {/* Four pillars of the executive summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Pillar 1: Overview */}
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2.5">
                  <div className="flex items-center space-x-2 text-sky-400">
                    <TrendingUp className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">Overall Posture & Readiness</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {data.executiveSummary.overview}
                  </p>
                </div>

                {/* Pillar 2: Governance Posture */}
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2.5">
                  <div className="flex items-center space-x-2 text-indigo-400">
                    <Layers className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">Governance, Policies & Baseline</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {data.executiveSummary.governancePosture}
                  </p>
                </div>

                {/* Pillar 3: Trajectory & Velocity */}
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2.5">
                  <div className="flex items-center space-x-2 text-amber-400">
                    <Clock className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">Milestone Velocity & Critical Path</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {data.executiveSummary.trajectoryAndVelocity}
                  </p>
                </div>

                {/* Pillar 4: Lead Auditor Verdict Statement */}
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2.5 border-l-4 border-l-emerald-500">
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <Award className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">Lead Certification Auditor Verdict</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {data.executiveSummary.auditorVerdict}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: KEY RISK AREAS */}
          {(activeSubTab === 'ALL' || activeSubTab === 'KEY_RISKS') && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Key Risk Areas & Vulnerability Telemetry
                  </h3>
                </div>

                {/* Severity Filter Pills */}
                <div className="flex items-center space-x-1.5 text-[11px]">
                  {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map(sev => (
                    <button
                      key={sev}
                      onClick={() => setSelectedRiskFilter(sev)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                        selectedRiskFilter === sev
                          ? 'bg-slate-700 text-white'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              {/* Risk Cards */}
              <div className="space-y-3.5">
                {filteredRisks.map((risk, idx) => {
                  const isExpanded = expandedRiskIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden hover:border-slate-700 transition"
                    >
                      <div
                        onClick={() => setExpandedRiskIndex(isExpanded ? null : idx)}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                      >
                        <div className="flex items-start space-x-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shrink-0 mt-0.5 ${getSeverityBadge(risk.severity)}`}>
                            {risk.severity}
                          </span>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-white hover:text-sky-400 transition">
                              {risk.area}
                            </h4>
                            <span className="text-[11px] text-slate-400 font-mono">
                              Domain: <strong className="text-slate-300">{risk.affectedDomain}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 shrink-0 self-end sm:self-center">
                          <span className="text-xs text-slate-400">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </span>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-5 pb-5 pt-2 border-t border-slate-900 space-y-3 text-xs"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                              <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                                  Operational Vulnerability Detected
                                </span>
                                <p className="text-slate-300 leading-relaxed">{risk.vulnerability}</p>
                              </div>

                              <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                                  Business & Regulatory Impact
                                </span>
                                <p className="text-slate-300 leading-relaxed">{risk.impactAnalysis}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  Identified Root Cause
                                </span>
                                <p className="text-slate-300 leading-relaxed">{risk.rootCause}</p>
                              </div>

                              <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-900/60 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                  Recommended Executive Mitigation
                                </span>
                                <p className="text-emerald-200 leading-relaxed">{risk.mitigationRecommendation}</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 3: STRATEGIC RECOMMENDATIONS MATRIX */}
          {(activeSubTab === 'ALL' || activeSubTab === 'RECOMMENDATIONS') && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Executive Strategic Action Matrix (Prioritized)
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">Immediate 30-45 Day Directives</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-2.5 px-3">Priority</th>
                      <th className="py-2.5 px-3">Directive Action Item</th>
                      <th className="py-2.5 px-3">Target Executive Owner</th>
                      <th className="py-2.5 px-3">Timeframe</th>
                      <th className="py-2.5 px-3">Expected Outcome</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {data.strategicRecommendations.map((rec, i) => (
                      <tr key={i} className="hover:bg-slate-950/50 transition">
                        <td className="py-3 px-3 shrink-0">
                          <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                            rec.priority === 'P1'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : rec.priority === 'P2'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                            {rec.priority}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-white max-w-sm">
                          {rec.action}
                        </td>
                        <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">
                          <div className="flex items-center space-x-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{rec.targetOwner}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-sky-300 font-mono text-[11px]">
                          {rec.timeframe}
                        </td>
                        <td className="py-3 px-3 text-slate-400 text-[11px] max-w-xs">
                          {rec.expectedOutcome}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Custom Guidance Modal */}
      <AnimatePresence>
        {showCustomModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">Tailor AI Executive Focus</h3>
                </div>
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-300">
                Provide specific guidance or questions for Gemini 3.8 Flash to emphasize in this executive briefing (e.g. &ldquo;Focus heavily on Board Risk Committee deliverables&rdquo;, &ldquo;Emphasize MAS TRM cyber hygiene controls&rdquo;, or &ldquo;Evaluate Annex A.8 technical evidence gaps&rdquo;).
              </p>

              <form onSubmit={handleCustomSubmit} className="space-y-4">
                <textarea
                  rows={4}
                  value={customPromptInput}
                  onChange={(e) => setCustomPromptInput(e.target.value)}
                  placeholder="e.g. Assess our readiness specifically against MAS TRM Guideline 10 & ISO 27001 Annex A.8 technological controls, highlighting unverified evidence risks for our upcoming Board meeting..."
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />

                <div className="flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomModal(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Run Tailored Analysis</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
