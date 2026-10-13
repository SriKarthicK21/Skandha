import React, { useState, useMemo } from 'react';
import {
  Workflow,
  ShieldCheck,
  Lock,
  Terminal,
  AlertCircle,
  Copy,
  Check,
  Clock,
  UserCheck,
  FileCheck2,
  FileText,
  Search,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Layers,
  Database,
  ExternalLink
} from 'lucide-react';
import {
  FormalTuvSopStructure,
  SopProcessTrigger,
  SopNumberedExecutionStep,
  SopDualControlVerificationGate,
  SopOutputArtifact
} from '../../types';
import { formatTuvSopToMarkdown } from '../../services/iso27001Templates/sopTemplateEngine';

export interface TuvSopEngineViewProps {
  sop: FormalTuvSopStructure;
  companyName: string;
  cisoName?: string;
  cloudProvider?: string;
  theme?: 'light' | 'dark' | 'midnight' | string;
}

export const TuvSopEngineView: React.FC<TuvSopEngineViewProps> = ({
  sop,
  companyName,
  cisoName = 'Chief Information Security Officer',
  cloudProvider = 'AWS',
  theme = 'dark'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'triggers' | 'steps' | 'gates' | 'artifacts'>('all');
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);

  // Category badge color helper for triggers
  const getCategoryBadgeClass = (category: SopProcessTrigger['category']) => {
    switch (category) {
      case 'CRITICAL_INCIDENT':
      case 'AUTOMATED_ALERT':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'STATUTORY_NOTIFICATION':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'SERVICE_REQUEST':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'SCHEDULED_CADENCE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    }
  };

  // Filtered triggers
  const filteredTriggers = useMemo(() => {
    if (!sop.processTriggers) return [];
    if (!searchQuery.trim()) return sop.processTriggers;
    const q = searchQuery.toLowerCase();
    return sop.processTriggers.filter(
      t =>
        t.triggerId.toLowerCase().includes(q) ||
        t.triggerName.toLowerCase().includes(q) ||
        t.detectionSystem.toLowerCase().includes(q) ||
        t.initiatingRole.toLowerCase().includes(q) ||
        t.entryCondition.toLowerCase().includes(q)
    );
  }, [sop.processTriggers, searchQuery]);

  // Filtered steps
  const filteredSteps = useMemo(() => {
    if (!sop.numberedExecutionSteps) return [];
    if (!searchQuery.trim()) return sop.numberedExecutionSteps;
    const q = searchQuery.toLowerCase();
    return sop.numberedExecutionSteps.filter(
      s =>
        s.stepNumber.toLowerCase().includes(q) ||
        s.stepTitle.toLowerCase().includes(q) ||
        s.responsibleRole.toLowerCase().includes(q) ||
        s.phase.toLowerCase().includes(q) ||
        s.actionSummary.toLowerCase().includes(q) ||
        s.toolchainOrConsole.toLowerCase().includes(q)
    );
  }, [sop.numberedExecutionSteps, searchQuery]);

  // Filtered gates
  const filteredGates = useMemo(() => {
    if (!sop.dualControlVerificationGates) return [];
    if (!searchQuery.trim()) return sop.dualControlVerificationGates;
    const q = searchQuery.toLowerCase();
    return sop.dualControlVerificationGates.filter(
      g =>
        g.gateId.toLowerCase().includes(q) ||
        g.gateTitle.toLowerCase().includes(q) ||
        g.primaryVerifierRole.toLowerCase().includes(q) ||
        g.secondaryVerifierRole.toLowerCase().includes(q) ||
        g.enforcementMechanism.toLowerCase().includes(q) ||
        g.zeroBypassRule.toLowerCase().includes(q)
    );
  }, [sop.dualControlVerificationGates, searchQuery]);

  // Filtered artifacts
  const filteredArtifacts = useMemo(() => {
    if (!sop.outputArtifacts) return [];
    if (!searchQuery.trim()) return sop.outputArtifacts;
    const q = searchQuery.toLowerCase();
    return sop.outputArtifacts.filter(
      a =>
        a.artifactId.toLowerCase().includes(q) ||
        a.artifactTitle.toLowerCase().includes(q) ||
        a.canonicalFileNaming.toLowerCase().includes(q) ||
        a.custodianRole.toLowerCase().includes(q) ||
        a.storageTarget.toLowerCase().includes(q) ||
        a.auditorInspectionMethod.toLowerCase().includes(q)
    );
  }, [sop.outputArtifacts, searchQuery]);

  const handleCopyMarkdown = () => {
    const md = formatTuvSopToMarkdown(sop, companyName);
    navigator.clipboard.writeText(md);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2200);
  };

  return (
    <div className="space-y-6">
      {/* 1. TÜV ACCREDITATION & LEVEL 3 OPERATIONAL STANDARD BANNER */}
      <div
        className={`p-5 rounded-2xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm ${
          theme === 'light'
            ? 'bg-gradient-to-r from-amber-50/80 via-white to-amber-50/40 border-amber-200 text-slate-900'
            : 'bg-gradient-to-r from-[#171408] via-[#101426] to-[#0d1527] border-amber-500/30 text-slate-100'
        }`}
      >
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
              <Workflow className="w-4 h-4 text-amber-400" />
              <span>TÜV SÜD & ISO/IEC 27001:2022 Formal SOP Template Engine</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              Clause 8.1 Conforming
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
              Four-Eyes Enforced
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
              Level 3 Standard
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <span>{sop.sopCode}:</span>
              <span>{sop.sopTitle}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Authoritative operational runbook with pre-configured triggers, sequential CLI execution steps, mandatory cryptographic dual-control gates, and tamper-evident output artifacts for external lead auditor certification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-slate-400">
            <span className="flex items-center space-x-1">
              <strong className="text-slate-200">Standard:</strong>
              <span className="text-amber-400">{sop.tuvAuditStandard}</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <strong className="text-slate-200">Organization:</strong>
              <span className="text-indigo-300">{companyName}</span>
            </span>
          </div>
        </div>

        {/* Action Button: Copy Raw Markdown */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleCopyMarkdown}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center space-x-2 transition shadow-sm cursor-pointer"
          >
            {copiedMarkdown ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedMarkdown ? 'SOP Markdown Copied!' : 'Copy TÜV SOP Runbook'}</span>
          </button>
        </div>
      </div>

      {/* 2. SUMMARY METRICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setActiveFilter('triggers')}
          className={`p-3.5 rounded-xl border transition cursor-pointer ${
            activeFilter === 'triggers'
              ? 'bg-rose-950/40 border-rose-500/60 ring-1 ring-rose-500/30'
              : theme === 'light'
              ? 'bg-white border-slate-200 hover:bg-slate-50'
              : 'bg-[#0D1527] border-slate-800 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Pillar 1</span>
            <Clock className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-lg font-bold text-slate-100 font-mono">
            {sop.processTriggers?.length || 0}
          </div>
          <div className="text-xs text-rose-400 font-semibold">Process Triggers</div>
          <p className="text-[10px] text-slate-400 mt-1">Operational & SLA entry conditions</p>
        </div>

        <div
          onClick={() => setActiveFilter('steps')}
          className={`p-3.5 rounded-xl border transition cursor-pointer ${
            activeFilter === 'steps'
              ? 'bg-sky-950/40 border-sky-500/60 ring-1 ring-sky-500/30'
              : theme === 'light'
              ? 'bg-white border-slate-200 hover:bg-slate-50'
              : 'bg-[#0D1527] border-slate-800 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Pillar 2</span>
            <Terminal className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-lg font-bold text-slate-100 font-mono">
            {sop.numberedExecutionSteps?.length || 0}
          </div>
          <div className="text-xs text-sky-400 font-semibold">Execution Steps</div>
          <p className="text-[10px] text-slate-400 mt-1">Sequential CLI & runbook actions</p>
        </div>

        <div
          onClick={() => setActiveFilter('gates')}
          className={`p-3.5 rounded-xl border transition cursor-pointer ${
            activeFilter === 'gates'
              ? 'bg-amber-950/40 border-amber-500/60 ring-1 ring-amber-500/30'
              : theme === 'light'
              ? 'bg-white border-slate-200 hover:bg-slate-50'
              : 'bg-[#0D1527] border-slate-800 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Pillar 3</span>
            <Lock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-slate-100 font-mono">
            {sop.dualControlVerificationGates?.length || 0}
          </div>
          <div className="text-xs text-amber-400 font-semibold">Four-Eyes Gates</div>
          <p className="text-[10px] text-slate-400 mt-1">Zero self-approval verification</p>
        </div>

        <div
          onClick={() => setActiveFilter('artifacts')}
          className={`p-3.5 rounded-xl border transition cursor-pointer ${
            activeFilter === 'artifacts'
              ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/30'
              : theme === 'light'
              ? 'bg-white border-slate-200 hover:bg-slate-50'
              : 'bg-[#0D1527] border-slate-800 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Pillar 4</span>
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-slate-100 font-mono">
            {sop.outputArtifacts?.length || 0}
          </div>
          <div className="text-xs text-emerald-400 font-semibold">Output Artifacts</div>
          <p className="text-[10px] text-slate-400 mt-1">WORM immutable evidence records</p>
        </div>
      </div>

      {/* 3. FILTER BAR & SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'All 4 Pillars' },
            { id: 'triggers', label: `1. Triggers (${sop.processTriggers?.length || 0})` },
            { id: 'steps', label: `2. Steps (${sop.numberedExecutionSteps?.length || 0})` },
            { id: 'gates', label: `3. Gates (${sop.dualControlVerificationGates?.length || 0})` },
            { id: 'artifacts', label: `4. Artifacts (${sop.outputArtifacts?.length || 0})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-amber-600 text-white shadow-xs'
                  : theme === 'light'
                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search runbook, roles, commands..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-3 py-1.5 rounded-lg border text-xs ${
              theme === 'light'
                ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                : 'bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-500'
            }`}
          />
        </div>
      </div>

      {/* 4. PILLAR 1: PROCESS TRIGGERS MATRIX */}
      {(activeFilter === 'all' || activeFilter === 'triggers') && (
        <div
          className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0D1527] border-slate-800'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold flex items-center justify-center font-mono">
                1
              </span>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  Process Triggers Matrix (ISO/IEC 27001:2022 Clause 8.1)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Defines concrete operational thresholds, detection systems, and response SLAs that trigger procedure invocation.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {filteredTriggers.length} Triggers Configured
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3 w-28">Trigger ID</th>
                  <th className="p-3">Trigger Title & Category</th>
                  <th className="p-3">Detection System / Telemetry</th>
                  <th className="p-3">Initiating Role</th>
                  <th className="p-3 w-28 text-center">Response SLA</th>
                  <th className="p-3">Entry Condition & Escalation Rule</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans text-xs">
                {filteredTriggers.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition">
                    <td className="p-3 font-mono font-bold text-rose-400 align-top">
                      {t.triggerId}
                    </td>
                    <td className="p-3 align-top space-y-1">
                      <div className="font-semibold text-slate-200">{t.triggerName}</div>
                      <span
                        className={`inline-block text-[9px] px-2 py-0.2 rounded-full font-mono font-bold border ${getCategoryBadgeClass(
                          t.category
                        )}`}
                      >
                        {t.category}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-300 align-top">
                      {t.detectionSystem}
                    </td>
                    <td className="p-3 font-semibold text-slate-300 align-top">
                      {t.initiatingRole}
                    </td>
                    <td className="p-3 text-center align-top">
                      <span className="inline-block px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {t.slaToInitiate}
                      </span>
                    </td>
                    <td className="p-3 align-top space-y-1 text-slate-400 text-[11px] leading-relaxed">
                      <div>
                        <strong className="text-slate-300">Condition:</strong> {t.entryCondition}
                      </div>
                      {t.escalationIfMissed && (
                        <div className="text-rose-400/90 text-[10px]">
                          <strong>Escalation:</strong> {t.escalationIfMissed}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. PILLAR 2: NUMBERED EXECUTION STEPS RUNBOOK */}
      {(activeFilter === 'all' || activeFilter === 'steps') && (
        <div
          className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0D1527] border-slate-800'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold flex items-center justify-center font-mono">
                2
              </span>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">
                  Numbered Execution Steps Runbook (Procedural Sequence)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Sequential, step-by-step technical instructions, console commands, and rollback contingencies.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {filteredSteps.length} Steps in Runbook
            </span>
          </div>

          <div className="space-y-3">
            {filteredSteps.map((step, idx) => {
              const isExpanded = expandedStepId === step.stepNumber;
              return (
                <div
                  key={idx}
                  className={`rounded-xl border transition-all ${
                    isExpanded
                      ? 'border-sky-500/60 bg-slate-900/80 shadow-md'
                      : theme === 'light'
                      ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div
                    onClick={() => setExpandedStepId(isExpanded ? null : step.stepNumber)}
                    className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-sky-600/20 text-sky-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-sky-500/30">
                        {step.stepNumber}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] px-2 py-0.2 rounded font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                            Phase: {step.phase}
                          </span>
                          <span className="text-xs font-bold text-slate-200">
                            {step.stepTitle}
                          </span>
                          {step.dualControlGateId && (
                            <span className="text-[9px] px-2 py-0.2 rounded-full font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold flex items-center space-x-1">
                              <Lock className="w-2.5 h-2.5" />
                              <span>Gate {step.dualControlGateId}</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-1">
                          {step.actionSummary}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0 text-xs font-mono">
                      <span className="text-slate-400">
                        <strong className="text-slate-300">Role:</strong> {step.responsibleRole}
                      </span>
                      <span>•</span>
                      <span className="text-amber-400 font-semibold">{step.timeframeSla}</span>
                      <ChevronRight
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          isExpanded ? 'rotate-90 text-sky-400' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded Step Body with Instructions & CLI commands */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-800 space-y-3 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px]">
                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                            Toolchain & Management Console
                          </span>
                          <span className="font-mono text-indigo-300">{step.toolchainOrConsole}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                            Input Dependencies & Prerequisites
                          </span>
                          <span className="text-slate-300">{step.inputDependencies.join(', ')}</span>
                        </div>
                      </div>

                      {/* Detailed CLI Instructions */}
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5 flex items-center space-x-1.5">
                          <Terminal className="w-3.5 h-3.5 text-sky-400" />
                          <span>Detailed Execution Instructions & CLI Specifications</span>
                        </span>
                        <div className="p-3 rounded-lg bg-[#050811] border border-slate-800 font-mono text-[11px] text-emerald-300 space-y-1.5 leading-relaxed overflow-x-auto">
                          {step.detailedInstructions.map((instruction, instIdx) => (
                            <div key={instIdx} className="flex items-start space-x-2">
                              <span className="text-slate-500 select-none">
                                {instIdx + 1 < 10 ? `0${instIdx + 1}` : instIdx + 1}.
                              </span>
                              <span>{instruction}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Failure Contingency */}
                      {step.failureContingency && (
                        <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs flex items-start space-x-2">
                          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="font-bold">Contingency & Rollback Protocol:</strong>
                            <span className="ml-1 opacity-90">{step.failureContingency}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. PILLAR 3: DUAL-CONTROL (FOUR-EYES) VERIFICATION GATES */}
      {(activeFilter === 'all' || activeFilter === 'gates') && (
        <div
          className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0D1527] border-slate-800'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center font-mono">
                3
              </span>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Dual-Control (Four-Eyes) Verification Gates (Zero Self-Approval Mandate)
                </h4>
                <p className="text-[11px] text-slate-400">
                  TÜV accreditation checkpoint requiring verified independent review before critical state transitions.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              ZERO-BYPASS RULE ENFORCED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGates.map((gate, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-amber-500/30 bg-gradient-to-b from-[#161208] to-[#0d1527] space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      {gate.gateId}
                    </span>
                    <span className="text-xs font-bold text-slate-200">{gate.gateTitle}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Preceding: {gate.precedingStep}
                  </span>
                </div>

                {/* Primary vs Secondary Verifier Dual Roles */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 block mb-0.5">
                      Initiator / Primary Verifier
                    </span>
                    <span className="font-semibold text-slate-200">{gate.primaryVerifierRole}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-amber-800/40">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block mb-0.5">
                      Independent Secondary Verifier
                    </span>
                    <span className="font-semibold text-amber-300">{gate.secondaryVerifierRole}</span>
                  </div>
                </div>

                {/* Verification Criteria Checklist */}
                <div className="space-y-1.5 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Mandatory Dual-Signoff Checklist:
                  </span>
                  <div className="space-y-1 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    {gate.verificationCriteria.map((crit, cIdx) => (
                      <div key={cIdx} className="flex items-start space-x-2 text-[11px] text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{crit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enforcement Mechanism & Evidence Produced */}
                <div className="space-y-1 text-[11px] text-slate-400 pt-1">
                  <div>
                    <strong className="text-slate-300">Enforcement Mechanism:</strong>{' '}
                    {gate.enforcementMechanism}
                  </div>
                  <div>
                    <strong className="text-slate-300">Audit Evidence:</strong>{' '}
                    <span className="font-mono text-emerald-400">{gate.auditEvidenceProduced}</span>
                  </div>
                </div>

                {/* Zero Bypass Rule Callout */}
                <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-800/40 text-rose-300 text-[10px] flex items-center space-x-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>
                    <strong>Zero-Bypass Mandate:</strong> {gate.zeroBypassRule}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. PILLAR 4: EXPLICIT OUTPUT ARTIFACT DEFINITIONS & EVIDENCE STORAGE LEDGER */}
      {(activeFilter === 'all' || activeFilter === 'artifacts') && (
        <div
          className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0D1527] border-slate-800'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center font-mono">
                4
              </span>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Explicit Output Artifact Definitions & Evidence Storage Ledger
                </h4>
                <p className="text-[11px] text-slate-400">
                  Immutable evidentiary deliverables produced by this procedure, mapped to WORM compliance targets and ISO 19011:2018 §B.3 sampling.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {filteredArtifacts.length} Output Artifacts Defined
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3 w-28">Artifact ID</th>
                  <th className="p-3">Artifact Title & Canonical Naming Standard</th>
                  <th className="p-3">Custodian Role</th>
                  <th className="p-3">Storage Target & Retention SLA</th>
                  <th className="p-3">Cryptographic Seal</th>
                  <th className="p-3">Lead Auditor Verification Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans text-xs">
                {filteredArtifacts.map((art, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition">
                    <td className="p-3 font-mono font-bold text-emerald-400 align-top">
                      {art.artifactId}
                    </td>
                    <td className="p-3 align-top space-y-1">
                      <div className="font-semibold text-slate-200">{art.artifactTitle}</div>
                      <div className="font-mono text-[10px] text-indigo-300 bg-slate-950/60 p-1.5 rounded border border-slate-800 break-all">
                        {art.canonicalFileNaming}
                      </div>
                      <span className="text-[9px] font-mono text-slate-500">
                        Origin: {art.generatingStep}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-300 align-top">
                      {art.custodianRole}
                    </td>
                    <td className="p-3 align-top space-y-0.5">
                      <div className="font-mono text-[11px] text-slate-200">{art.storageTarget}</div>
                      <div className="font-mono text-[10px] text-emerald-400 font-semibold">
                        {art.retentionPeriodSla}
                      </div>
                    </td>
                    <td className="p-3 align-top">
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-900 p-1 rounded border border-slate-800 block">
                        {art.cryptographicIntegritySeal}
                      </span>
                    </td>
                    <td className="p-3 align-top text-slate-400 text-[11px] leading-relaxed">
                      {art.auditorInspectionMethod}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TuvSopEngineView;
