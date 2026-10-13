import React, { useState, useEffect } from 'react';
import {
  Compass,
  Building2,
  Server,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Save,
  CheckSquare,
  Globe,
  SlidersHorizontal,
  FileText,
  RotateCcw,
  Sparkles,
  Info,
  Layers,
  Lock,
  ExternalLink
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { MASRegulatoryProfile } from '../../types/masTrmFrameworkTypes';
import { evaluateMASApplicability, ApplicabilitySummary } from '../../services/masApplicabilityEngine';

interface Props {
  onApplicabilityConfirmed?: () => void;
  initialStep?: 1 | 2 | 3;
}

export const MASRegulatoryDiscoveryWizard: React.FC<Props> = ({ onApplicabilityConfirmed, initialStep = 1 }) => {
  const {
    currentTenant,
    masRegulatoryProfile,
    updateMASRegulatoryProfile,
    masApplicabilityRules,
    activeMASModuleIds,
    applicabilityRuleConfig
  } = useGRC();

  // Initial form state initialized from GRCContext regulatory profile
  const [profile, setProfile] = useState<MASRegulatoryProfile>(() => masRegulatoryProfile || {
    isSingaporeEntity: true,
    isMasRegulated: true,
    entityType: 'BANK_FULL_OR_QUALIFYING',
    licenceType: 'Full Banking Licence (Banking Act Cap. 19)',
    regulatedActivities: ['Banking Business', 'Payment Services', 'Custody Services'],
    financialServicesOffered: ['Retail & Commercial Deposits', 'Internet Banking', 'FAST Interbank Transfers', 'Card Issuance'],
    applicableRegimes: ['Banking Act', 'MAS Notice 644', 'MAS Notice 655', 'MAS Notice PSN05', 'MAS TRM Guidelines 2021'],
    businessModel: 'Banking',
    designatedCriticalSystemsCount: 5,
    criticalBusinessServices: ['Deposit & Lending Operations', 'Real-time Interbank Payments', 'Card Processing', 'Treasury & Liquidity'],
    cloudAdoptionModel: 'Commercial Cloud SG',
    cloudProviders: ['AWS Singapore (ap-southeast-1)', 'Google Cloud Singapore'],
    materialOutsourcers: ['Equinix Singapore DC', 'Wolters Kluwer OneSumX', 'Salesforce CRM SG', 'CyberArk Cloud PAM'],
    onlineFinancialServicesOffered: true,
    customerAuthenticationMethods: ['Hardware/Software Token MFA', 'FIDO2 Biometric Authentication', 'Transaction Signing for High-Risk Transfers'],
    applicabilityStatus: 'DISCOVERY_IN_PROGRESS'
  });

  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(initialStep);

  useEffect(() => {
    if (initialStep) {
      setActiveStep(initialStep);
    }
  }, [initialStep]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<ApplicabilitySummary>(() => evaluateMASApplicability(profile));
  const [customJustifications, setCustomJustifications] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState(false);

  const handleRunEvaluation = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      const res = evaluateMASApplicability(profile);
      setEvalResult(res);
      updateMASRegulatoryProfile(profile);
      setIsEvaluating(false);
      setActiveStep(2);
    }, 400);
  };

  const handleSaveAndConfirm = () => {
    const updated: MASRegulatoryProfile = {
      ...profile,
      applicabilityStatus: 'CONFIRMED',
      applicabilityApprovedBy: 'CISO / Head of Regulatory Risk',
      applicabilityApprovedDate: new Date().toISOString().slice(0, 10)
    };
    setProfile(updated);
    updateMASRegulatoryProfile(updated);
    if (updated.isMasRegulated && applicabilityRuleConfig?.activateFramework) {
      applicabilityRuleConfig.activateFramework();
    }
    setConfirmed(true);
    if (onApplicabilityConfirmed) {
      onApplicabilityConfirmed();
    }
  };

  return (
    <div id="mas-regulatory-discovery-wizard" className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                MAS Regulatory Discovery & Applicability Engine
              </span>
              <span className="text-xs text-slate-400">Section 1.0 & 2.0 Scope Determination</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Singapore Financial Institution Scoping & Obligations Profiler
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-3xl">
              Determine your institution's statutory boundaries, designated Critical Information Systems (CIS),
              and legally binding notices (Notice 644, Notice 655, PSN05) across all 15 TRM chapters.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveStep(1)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                activeStep === 1
                  ? 'bg-rose-600 text-white border-rose-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              1. Regulatory Profile
            </button>
            <button
              onClick={() => setActiveStep(2)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                activeStep === 2
                  ? 'bg-rose-600 text-white border-rose-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              2. Applicability Matrix ({evalResult.applicableCount} Active)
            </button>
            <button
              onClick={() => setActiveStep(3)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                activeStep === 3
                  ? 'bg-rose-600 text-white border-rose-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              3. Supervisory Confirmation
            </button>
          </div>
        </div>
      </div>

      {/* Step 1: Profile & Business Model */}
      {activeStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-rose-400" />
                Singapore Entity & Regulatory Status
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Operating Entity in Singapore?
                  </label>
                  <select
                    value={profile.isSingaporeEntity ? 'YES' : 'NO'}
                    onChange={e => setProfile(prev => ({ ...prev, isSingaporeEntity: e.target.value === 'YES' }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="YES">Yes - Incorporated or Branch in Singapore</option>
                    <option value="NO">No - Offshore Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Entity Category & MAS Licence
                  </label>
                  <select
                    value={profile.entityType}
                    onChange={e => setProfile(prev => ({ ...prev, entityType: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="BANK_FULL_OR_QUALIFYING">Full Bank / Qualifying Full Bank (QFB)</option>
                    <option value="MERCHANT_BANK">Merchant Bank</option>
                    <option value="FINANCE_COMPANY">Finance Company</option>
                    <option value="CAPITAL_MARKETS_SERVICES_LICENSEE">Capital Markets Services Licensee (CMSL)</option>
                    <option value="DIRECT_INSURER_LIFE_OR_GENERAL">Licensed Insurer (Life / General)</option>
                    <option value="MAJOR_PAYMENT_INSTITUTION">Major Payment Institution (MPI - PSN05)</option>
                    <option value="STANDARD_PAYMENT_INSTITUTION">Standard Payment Institution (SPI)</option>
                    <option value="FINTECH_SANDBOX_PARTICIPANT">FinTech Sandbox / Tech Provider</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Primary Business Model
                  </label>
                  <select
                    value={profile.businessModel}
                    onChange={e => setProfile(prev => ({ ...prev, businessModel: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="Banking">Commercial & Retail Banking</option>
                    <option value="Capital Markets">Capital Markets & Securities Trading</option>
                    <option value="Asset Management">Asset Management / Fund Management</option>
                    <option value="Payment Services">Payment Services & Remittance</option>
                    <option value="Insurance">Insurance & Reinsurance</option>
                    <option value="Digital Financial Services">Digital Financial Services / FinTech</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Designated Critical Systems (CIS) Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="25"
                    value={profile.designatedCriticalSystemsCount}
                    onChange={e => setProfile(prev => ({ ...prev, designatedCriticalSystemsCount: Number(e.target.value) || 0 }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Triggers mandatory MAS Notice 644 1-hour incident reporting obligations.
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-800">
                <h4 className="text-sm font-medium text-white mb-3">Cloud & Digital Architecture Attributes</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Cloud Adoption Model</label>
                    <select
                      value={profile.cloudAdoptionModel}
                      onChange={e => setProfile(prev => ({ ...prev, cloudAdoptionModel: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="Commercial Cloud SG">Commercial Cloud Singapore (AWS / GCP / Azure)</option>
                      <option value="Hybrid Multi-Cloud">Hybrid Multi-Cloud (Data Centre + Cloud)</option>
                      <option value="On-Premises Data Centre">On-Premises Private Data Centre Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Online Financial Services Offered?</label>
                    <select
                      value={profile.onlineFinancialServicesOffered ? 'YES' : 'NO'}
                      onChange={e => setProfile(prev => ({ ...prev, onlineFinancialServicesOffered: e.target.value === 'YES' }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="YES">Yes - Internet Banking / Mobile App / Public APIs</option>
                      <option value="NO">No - Purely Internal / Offline Processing</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleRunEvaluation}
                  className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-rose-600/20"
                >
                  {isEvaluating ? 'Evaluating MAS Rules...' : 'Execute Applicability Engine'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Engine Summary Card */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Applicability Trigger Preview
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Based on current parameters, the engine automatically checks supervisory thresholds and statutory binding notices.
              </p>

              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-1">
                    <span>Notice 644 (Critical Incidents)</span>
                    <span className="text-rose-400 font-bold">MANDATORY (1h SLA)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Active because {profile.designatedCriticalSystemsCount} Critical Information Systems are designated.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-1">
                    <span>Notice 655 (Cyber Hygiene)</span>
                    <span className="text-amber-400 font-bold">BINDING (6 Pillars)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Strict legal enforceability across segmentation, hardening, patching, PAM, MFA, and malware defense.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-1">
                    <span>Section 14.0 (Online Services)</span>
                    <span className="text-emerald-400 font-bold">ACTIVE</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Transaction signing and fraud heuristics required for customer-facing banking portal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Applicability Matrix */}
      {activeStep === 2 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
              <span className="text-xs text-slate-400">Total Evaluated Requirements</span>
              <div className="text-2xl font-bold text-white mt-1">{evalResult.totalEvaluated}</div>
            </div>
            <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-4 text-center">
              <span className="text-xs text-emerald-300">Directly Applicable</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{evalResult.applicableCount}</div>
            </div>
            <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-4 text-center">
              <span className="text-xs text-amber-300">Potentially Applicable</span>
              <div className="text-2xl font-bold text-amber-400 mt-1">{evalResult.potentiallyApplicableCount}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
              <span className="text-xs text-slate-400">Not Applicable (With Reason)</span>
              <div className="text-2xl font-bold text-slate-400 mt-1">{evalResult.notApplicableCount}</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">MAS TRM 2021 Statutory Requirements Evaluation</h3>
                <span className="text-xs text-slate-400">
                  Every requirement has an auditable justification. Non-applicable controls are preserved with explicit rationale.
                </span>
              </div>
              <button
                onClick={() => setActiveStep(3)}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                Proceed to Confirmation
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-800 max-h-[550px] overflow-y-auto">
              {evalResult.evaluations.map(req => (
                <div key={req.requirementId} className="p-4 hover:bg-slate-800/40 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-rose-300 border border-slate-700">
                        {req.requirementCode}
                      </span>
                      <h4 className="text-sm font-semibold text-white">{req.title}</h4>
                      <span className="text-xs text-slate-400">({req.domainName})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {req.applicability === 'Applicable' && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Applicable
                        </span>
                      )}
                      {req.applicability === 'Potentially Applicable' && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Review Required
                        </span>
                      )}
                      {req.applicability === 'Not Applicable' && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-700/50 text-slate-400 border border-slate-600/50">
                          Not Applicable
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mb-2">{req.rationale}</p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Info className="w-3 h-3 text-sky-400" />
                      Statutory Basis: <strong className="text-slate-300">{req.statutoryBasis}</strong>
                    </span>
                    {req.crossFrameworkIsoControl && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Layers className="w-3 h-3 text-indigo-400" />
                        Reuses ISO 27001: <strong className="text-slate-300">{req.crossFrameworkIsoControl}</strong>
                      </span>
                    )}
                    {req.mandatoryRuleTriggered && (
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-semibold">
                        {req.mandatoryRuleTriggered}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Supervisory Confirmation */}
      {activeStep === 3 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Confirm MAS Technology Risk Regulatory Scope Baseline
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              By confirming, this calibrated scope becomes the active regulatory baseline across Skanda's
              Risk Register, Critical Systems Ledger, and Multi-Framework Evidence Vault.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/60">
              <span className="text-xs font-medium text-slate-400 block mb-1">Entity Name & Licence</span>
              <strong className="text-sm text-white">{currentTenant?.name || 'Skanda Financial Services Ltd'}</strong>
              <div className="text-xs text-slate-400 mt-1">{profile.licenceType}</div>
            </div>

            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/60">
              <span className="text-xs font-medium text-slate-400 block mb-1">Active Statutory Regimes</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {profile.applicableRegimes.map(regime => (
                  <span key={regime} className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {regime}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Dynamic Applicability Rule Gating & Registered Router Modules */}
          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-rose-400" />
                MAS Applicability Rules & App Router Calibration
              </span>
              <span className="text-[11px] font-mono font-semibold text-emerald-400">
                {activeMASModuleIds.length} Modules Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {masApplicabilityRules.map(rule => {
                const isActive = rule.evaluator(profile);
                return (
                  <div
                    key={rule.id}
                    className={`p-2.5 rounded-lg border ${
                      isActive
                        ? 'bg-slate-900/80 border-emerald-500/30 text-slate-300'
                        : 'bg-slate-900/30 border-slate-800/80 text-slate-500 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-white text-[11px]">{rule.code}: {rule.name.split('(')[0]}</strong>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isActive ? 'ENABLED' : 'MUTED'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">
                      {isActive ? rule.rationaleIfActive : rule.rationaleIfInactive}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-800/30 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300">
              <strong className="text-white block mb-0.5">Continuous Evidence-Driven Compliance Active</strong>
              All {evalResult.applicableCount} active requirements are mapped to underlying assets, risks, controls,
              and evidence tasks. Status will update dynamically based on real audit artifacts.
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setActiveStep(2)}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            >
              Back to Requirements Review
            </button>

            <button
              onClick={handleSaveAndConfirm}
              className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <Save className="w-4 h-4" />
              {confirmed ? 'Baseline Scope Confirmed' : 'Lock MAS Regulatory Baseline'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
