import React, { useState } from 'react';
import { useGRC } from '../../context/GRCContext';
import {
  Sparkles,
  Server,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Sliders,
  Database,
  GitBranch,
  Laptop,
  Layers,
  ArrowRight,
  Info,
  Building2,
  Cpu,
  Lock,
  Tag,
  FileText,
  ArrowRightLeft
} from 'lucide-react';
import {
  DEFAULT_LIVE_VARIABLES,
  LiveMetadataVariables,
  injectContextualVariables,
  getShelfwareVsGroundedExamples
} from '../../services/isoPolicyGovernanceEngine';
import { PolicyContextualizer } from './PolicyContextualizer';

export const ContextualizedPolicyStudio: React.FC = () => {
  const { currentTenant, updateDocument } = useGRC();

  // Studio Mode: Contextual Mapping (Drag & Drop) vs Policy Contextualizer vs Shelfware Comparison
  const [studioMode, setStudioMode] = useState<'contextual_mapping' | 'contextualizer' | 'comparison'>('contextual_mapping');

  // Active form variables for the comparison lab
  const [liveVars, setLiveVars] = useState<LiveMetadataVariables>({
    ...DEFAULT_LIVE_VARIABLES,
    companyName: currentTenant?.name || DEFAULT_LIVE_VARIABLES.companyName
  });

  const [activeDomainIndex, setActiveDomainIndex] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  const comparisons = getShelfwareVsGroundedExamples();

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleApplyToAllTenantPolicies = () => {
    setIsApplying(true);
    setTimeout(() => {
      // Inject into any existing generated docs in the tenant
      if (currentTenant?.generatedDocs) {
        currentTenant.generatedDocs.forEach(doc => {
          const { contextualizedContent } = injectContextualVariables(doc.content, liveVars);
          updateDocument(doc.id, {
            content: contextualizedContent,
            lastModified: new Date().toISOString()
          });
        });
      }
      setIsApplying(false);
      setApplySuccess(true);
      setTimeout(() => setApplySuccess(false), 4000);
    }, 800);
  };

  return (
    <div className="space-y-5 text-slate-800">
      {/* Studio Navigation Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setStudioMode('contextual_mapping')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            studioMode === 'contextual_mapping'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Contextual Mapping (Drag & Drop Cloud Services)</span>
        </button>
        <button
          onClick={() => setStudioMode('contextualizer')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            studioMode === 'contextualizer'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Policy Document Contextualizer & SLA Matrix</span>
        </button>
        <button
          onClick={() => setStudioMode('comparison')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            studioMode === 'comparison'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Shelfware vs. Grounded Comparison Lab</span>
        </button>
      </div>

      {/* MODE 1: Contextual Mapping (Drag and drop infrastructure onto clauses) */}
      {studioMode === 'contextual_mapping' && (
        <PolicyContextualizer initialViewMode="contextual_mapping" />
      )}

      {/* MODE 2: Policy Contextualizer */}
      {studioMode === 'contextualizer' && (
        <PolicyContextualizer initialViewMode="resolved" />
      )}

      {/* MODE 3: Shelfware Comparison Lab */}
      {studioMode === 'comparison' && (
        <div className="space-y-5">
      {/* Overview & Problem Statement Card */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200">
                  Pillar 1: ISO 27001:2022 Anti-Shelfware Engine
                </span>
                <span className="text-xs text-slate-500">Live Dynamic Metadata Injection</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                Contextualized Policies & Real Infrastructure Grounding
              </h3>
            </div>
          </div>

          <button
            onClick={handleApplyToAllTenantPolicies}
            disabled={isApplying}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center space-x-2 shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isApplying ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Injecting Live Tech Stack...</span>
              </>
            ) : applySuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Live Variables Injected!</span>
              </>
            ) : (
              <>
                <Cpu className="w-3.5 h-3.5" />
                <span>Ground All Policies in Tech Stack</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
          <strong>The Problem:</strong> Generic policy templates copy ISO annexes verbatim without referencing real tech stacks. Auditors flag these as non-operationalized &ldquo;shelfware&rdquo;.
          <br />
          <strong>The Fix:</strong> Inject live cloud infrastructure, identity providers, cryptographic keys, and escalation SLAs directly into policy statements to eliminate obsolete placeholders.
        </p>
      </div>

      {/* Grid: Live Variable Configuration vs Side-by-Side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Dynamic Variable Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                <span>Live Metadata Variables</span>
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">11 Active Parameters</span>
            </div>

            <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 flex items-center space-x-1 mb-1">
                  <Building2 className="w-3 h-3 text-slate-500" />
                  <span>Company Entity Name</span>
                </label>
                <input
                  type="text"
                  value={liveVars.companyName}
                  onChange={e => setLiveVars({ ...liveVars, companyName: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 font-medium focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 mb-1 block">CISO Name & Title</label>
                  <input
                    type="text"
                    value={liveVars.cisoName}
                    onChange={e => setLiveVars({ ...liveVars, cisoName: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 font-medium focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 mb-1 block">DPO / Legal Officer</label>
                  <input
                    type="text"
                    value={liveVars.dpoName}
                    onChange={e => setLiveVars({ ...liveVars, dpoName: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 font-medium focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 flex items-center space-x-1 mb-1">
                  <Server className="w-3 h-3 text-sky-600" />
                  <span>Cloud Provider & Regions</span>
                </label>
                <input
                  type="text"
                  value={liveVars.cloudProvider}
                  onChange={e => setLiveVars({ ...liveVars, cloudProvider: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 font-medium focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 flex items-center space-x-1 mb-1">
                  <KeyRound className="w-3 h-3 text-amber-600" />
                  <span>Identity Provider (IdP) & MFA Standard</span>
                </label>
                <input
                  type="text"
                  value={liveVars.identityProvider}
                  onChange={e => setLiveVars({ ...liveVars, identityProvider: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 font-medium focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 flex items-center space-x-1 mb-1">
                  <Database className="w-3 h-3 text-emerald-600" />
                  <span>Production Database & Customer KMS Key ARN</span>
                </label>
                <input
                  type="text"
                  value={liveVars.kmsKeyArn}
                  onChange={e => setLiveVars({ ...liveVars, kmsKeyArn: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 font-mono text-[11px] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 flex items-center space-x-1 mb-1">
                  <GitBranch className="w-3 h-3 text-purple-600" />
                  <span>Source Control & Protected GitHub Org</span>
                </label>
                <input
                  type="text"
                  value={liveVars.scmProvider}
                  onChange={e => setLiveVars({ ...liveVars, scmProvider: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 font-medium focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 mb-1 block">P1 Incident SLA</label>
                  <input
                    type="text"
                    value={liveVars.escalationSlaP1}
                    onChange={e => setLiveVars({ ...liveVars, escalationSlaP1: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 font-medium focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 mb-1 block">Password Baseline</label>
                  <input
                    type="text"
                    value={liveVars.minPasswordLength}
                    onChange={e => setLiveVars({ ...liveVars, minPasswordLength: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 font-medium focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Side-by-Side "Shelfware vs Contextualized" Showcase (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Side-by-Side Transformation: Generic vs Grounded Policy
                </h4>
                <p className="text-[11px] text-slate-500">
                  Select a domain to inspect how policy language converts from un-auditable boilerplate into testable, infrastructure-specific clauses.
                </p>
              </div>
            </div>

            {/* Domain Selector Chips */}
            <div className="flex flex-wrap gap-1.5">
              {comparisons.map((c, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveDomainIndex(idx)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeDomainIndex === idx
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {c.domain}
                </button>
              ))}
            </div>

            {/* Side-by-Side Comparison Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {/* Left: The Generic Shelfware Boilerplate */}
              <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-rose-800 font-bold text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Generic &ldquo;Shelfware&rdquo; Boilerplate</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-200/80 text-rose-900 font-semibold">
                    Auditor Finding Risk
                  </span>
                </div>
                <p className="text-xs text-rose-950 font-sans leading-relaxed italic bg-white/70 p-2.5 rounded-lg border border-rose-100">
                  &ldquo;{comparisons[activeDomainIndex].shelfware}&rdquo;
                </p>
                <div className="text-[11px] text-rose-700 flex items-start space-x-1">
                  <Info className="w-3 h-3 shrink-0 mt-0.5" />
                  <span>
                    <strong>Failure Mode:</strong> ISO Stage 2 auditors fail this policy during testing because &ldquo;need-to-know&rdquo; and &ldquo;periodically&rdquo; are unverifiable without technical metrics.
                  </span>
                </div>
              </div>

              {/* Right: The Grounded, Contextualized Rule */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Grounded &amp; Testable Policy Clause</span>
                  </div>
                  <button
                    onClick={() => handleCopy(comparisons[activeDomainIndex].grounded, activeDomainIndex)}
                    className="p-1 rounded bg-white hover:bg-emerald-100 text-emerald-700 transition"
                    title="Copy Policy Statement"
                  >
                    {copiedIndex === activeDomainIndex ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-xs text-emerald-950 font-mono leading-relaxed bg-white/80 p-2.5 rounded-lg border border-emerald-200">
                  {comparisons[activeDomainIndex].grounded}
                </p>
                <div className="text-[11px] text-emerald-800 flex items-start space-x-1">
                  <ShieldCheck className="w-3 h-3 shrink-0 mt-0.5 text-emerald-600" />
                  <span>
                    <strong>Audit Verification:</strong> Directly verifiable via continuous CSPM probes and IdP API logs without subjective interpretation.
                  </span>
                </div>
              </div>
            </div>

            {/* Audit Readiness Note */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-slate-700">
                  ISO 27001:2022 Clause 5.2 mandates that information security policy must be &ldquo;appropriate to the purpose of the organization&rdquo;.
                </span>
              </div>
              <span className="text-[11px] text-indigo-700 font-bold shrink-0">100% Traceable</span>
            </div>
          </div>
        </div>
      </div>
        </div>
      )}
    </div>
  );
};
