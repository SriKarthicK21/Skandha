/**
 * SKANDA Enterprise Framework Factory — Applicability & Discovery Center
 * Path: src/components/framework-factory/ApplicabilityCenterView.tsx
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Building,
  Globe,
  Database,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Zap,
  Info,
  SlidersHorizontal,
  FileCheck,
  Check
} from 'lucide-react';
import {
  TenantProfileForApplicability,
  FrameworkApplicabilityResult,
  FrameworkBundle
} from '../../types/frameworkFactoryTypes';

interface ApplicabilityCenterViewProps {
  bundles: FrameworkBundle[];
  onEvaluateApplicability: (profile: TenantProfileForApplicability) => FrameworkApplicabilityResult[];
  onSelectFramework: (frameworkCode: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const ApplicabilityCenterView: React.FC<ApplicabilityCenterViewProps> = ({
  bundles,
  onEvaluateApplicability,
  onSelectFramework,
  onNavigateTab
}) => {
  const [profile, setProfile] = useState<TenantProfileForApplicability>({
    tenantId: 'tenant-enterprise-01',
    country: 'Singapore',
    jurisdictions: ['SINGAPORE', 'EU', 'US', 'INDIA'],
    industry: ['FINTECH', 'SAAS', 'BANKING'],
    businessModel: 'FINTECH_BANKING',
    companySize: 'ENTERPRISE',
    employeeCount: 350,
    dataTypesHandled: ['PERSONAL_DATA', 'FINANCIAL_RECORDS', 'PAYMENT_CARD_DATA', 'AI_TRAINING_CORPUS'],
    usesAI: true,
    aiSystemClassification: 'HIGH_RISK_EU_AI_ACT',
    usesCloud: true,
    cloudProviders: ['AWS', 'AZURE'],
    processesPayments: true,
    handlesHealthcare: false,
    hasBankingLicense: true,
    customerContractRequirements: ['SOC 2', 'ISO 27001', 'PCI DSS'],
    regulatoryLicenses: ['MAS Major Payment Institution']
  });

  const [results, setResults] = useState<FrameworkApplicabilityResult[]>(() => {
    return onEvaluateApplicability(profile);
  });

  const [hasEvaluated, setHasEvaluated] = useState(true);

  const handleRunEvaluation = () => {
    const res = onEvaluateApplicability(profile);
    setResults(res);
    setHasEvaluated(true);
  };

  const toggleDataType = (type: any) => {
    setProfile(prev => {
      const current = prev.dataTypesHandled || [];
      const updated = current.includes(type)
        ? current.filter(t => t !== type)
        : [...current, type];
      return { ...prev, dataTypesHandled: updated };
    });
  };

  const toggleJurisdiction = (jur: string) => {
    setProfile(prev => {
      const current = prev.jurisdictions || [];
      const updated = current.includes(jur)
        ? current.filter(j => j !== jur)
        : [...current, jur];
      return { ...prev, jurisdictions: updated };
    });
  };

  const applicableResults = results.filter(r => r.isApplicable);
  const criticalResults = applicableResults.filter(r => r.recommendedImplementationPriority === 'CRITICAL');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Dynamic Framework Applicability & Scope Discovery Engine
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Evaluate exact regulatory obligations, statutory mandates, and customer-driven certification requirements based on your organization profile.
          </p>
        </div>

        <button
          onClick={handleRunEvaluation}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
        >
          <Zap className="w-4 h-4 text-indigo-200" />
          Re-Calculate Applicability Portfolio
        </button>
      </div>

      {/* Main Grid: Interactive Profile Matrix on Left, Generated Portfolio on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Organization Profile Inputs */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
              Organizational Parameters
            </h3>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">Real-Time Scoring</span>
          </div>

          {/* Business Model & Sector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Business Model & Primary Archetype
            </label>
            <select
              value={profile.businessModel}
              onChange={e => setProfile({ ...profile, businessModel: e.target.value as any })}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="B2B_SAAS">B2B SaaS / Enterprise Cloud Platform</option>
              <option value="FINTECH_BANKING">FinTech, Payments & Digital Banking</option>
              <option value="HEALTHCARE_PROVIDER">HealthTech / Healthcare Provider</option>
              <option value="ECOMMERCE">E-Commerce & Digital Marketplace</option>
              <option value="AI_PRODUCT">AI Product & LLM Platform</option>
              <option value="CRITICAL_INFRASTRUCTURE">Critical Infrastructure Operator</option>
            </select>
          </div>

          {/* Operating Jurisdictions */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Operating Jurisdictions & Market Reach
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'SINGAPORE', label: 'Singapore (MAS)' },
                { id: 'EU', label: 'European Union (GDPR / DORA)' },
                { id: 'US', label: 'United States (SOC 2 / HIPAA)' },
                { id: 'INDIA', label: 'India (DPDP Act)' },
                { id: 'UK', label: 'United Kingdom (UK GDPR)' },
                { id: 'AUSTRALIA', label: 'Australia (APRA / CPS 234)' }
              ].map(j => {
                const isSelected = profile.jurisdictions?.includes(j.id);
                return (
                  <button
                    key={j.id}
                    type="button"
                    onClick={() => toggleJurisdiction(j.id)}
                    className={`p-2 rounded-xl text-[11px] font-semibold text-left border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span>{j.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Data Types Handled */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Data Classes Processed & Stored
            </label>
            <div className="space-y-1.5">
              {[
                { id: 'PERSONAL_DATA', label: 'Personal Data (PII / Data Principals)' },
                { id: 'FINANCIAL_RECORDS', label: 'Financial Records & Transaction Ledgers' },
                { id: 'PAYMENT_CARD_DATA', label: 'Cardholder Data (PAN / CVV)' },
                { id: 'PROTECTED_HEALTH_INFORMATION', label: 'Protected Health Info (ePHI)' },
                { id: 'AI_TRAINING_CORPUS', label: 'AI Model Training Datasets' }
              ].map(dt => {
                const isSelected = profile.dataTypesHandled?.includes(dt.id as any);
                return (
                  <button
                    key={dt.id}
                    type="button"
                    onClick={() => toggleDataType(dt.id)}
                    className={`w-full p-2.5 rounded-xl text-[11px] font-semibold text-left border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-50 dark:bg-cyan-950/70 border-cyan-500 text-cyan-800 dark:text-cyan-300'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span>{dt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Usage & Systems Classification */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Artificial Intelligence Governance Tier
            </label>
            <select
              value={profile.aiSystemClassification}
              onChange={e => setProfile({ ...profile, aiSystemClassification: e.target.value as any, usesAI: e.target.value !== 'NONE' })}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="HIGH_RISK_EU_AI_ACT">High-Risk AI System (EU AI Act Annex III)</option>
              <option value="GENERAL_PURPOSE_AI">General Purpose AI / Foundation Model (GPAI)</option>
              <option value="LOW_MINIMAL_RISK">Low / Minimal Risk AI Workflow</option>
              <option value="NONE">No AI Systems Used</option>
            </select>
          </div>
        </div>

        {/* Right Column: Generated Applicable Portfolio & Recommended Bundles */}
        <div className="lg:col-span-7 space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold uppercase">Applicable Frameworks</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{applicableResults.length}</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] text-rose-500 font-semibold uppercase">Statutory Critical</span>
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{criticalResults.length}</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] text-emerald-500 font-semibold uppercase">Synergy Savings</span>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">78.5%</div>
            </div>
          </div>

          {/* Applicable Frameworks List with "WHY THIS APPLIES" Rationale */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Applicable Regulatory & Standard Obligations ({applicableResults.length})
            </h3>

            <div className="space-y-3">
              {applicableResults.map(res => {
                const isCritical = res.recommendedImplementationPriority === 'CRITICAL';
                return (
                  <div
                    key={res.frameworkId}
                    className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-2 hover:border-indigo-500 transition-all shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded">
                          {res.frameworkCode}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {res.frameworkName}
                        </h4>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isCritical
                          ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300/40'
                          : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300'
                      }`}>
                        {res.recommendedImplementationPriority}
                      </span>
                    </div>

                    {/* Why this applies */}
                    <div className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 leading-relaxed">
                      <strong className="text-indigo-600 dark:text-indigo-400">Why This Framework Applies: </strong>
                      {res.applicabilityReason}
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                        Scoring Confidence: <strong>{res.confidenceScore}%</strong>
                      </span>

                      <button
                        onClick={() => onSelectFramework(res.frameworkCode)}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        Inspect Framework Controls <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommended Bundles */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Curated Framework Bundles (Pre-Configured Stacks)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {bundles.map(b => (
                <div key={b.bundleId} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 hover:border-indigo-400 transition-all shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
                      {b.category.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {b.synergyMultiplierPercent}% Synergy
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{b.bundleName}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{b.description}</p>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                    <span>{b.frameworkCodes.length} Frameworks</span>
                    <span>~{b.estimatedEffortMonths} Months Transition</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
