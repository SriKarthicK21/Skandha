import React, { useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import {
  Building2,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Database,
  Lock,
  Users,
  Globe,
  ArrowRight,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  FileText
} from 'lucide-react';

export const CompanyComplianceProfileView: React.FC = () => {
  const { currentTenant, recalibrateComplianceProfile, setActiveModule } = useGRC();
  const profile = currentTenant?.companyComplianceProfile;
  const regProfile = currentTenant?.companyRegistrationProfile;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-sky-500/10 text-sky-400 border border-sky-500/30">
                Calibrated Profile
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400 font-medium">
                Stage 3 of 24 ISO Workflow
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Company Compliance & Risk Profile
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              Dynamically derived from your corporate legal identity, technology stack, data classifications, vendor ecosystem, and operational locations. Calibrates required ISO 27001 clauses and Annex A controls automatically.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={recalibrateComplianceProfile}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition-all shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Recalibrate Profile</span>
            </button>
            <button
              onClick={() => setActiveModule('implementation_plan')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow transition-all"
            >
              <span>View Implementation Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Narrative Banner */}
      {profile?.summaryExecutiveNarrative && (
        <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-white block mb-0.5">Executive Calibration Summary</strong>
            {profile.summaryExecutiveNarrative}
          </div>
        </div>
      )}

      {/* 4 Dimension Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Primary Industry & Size</span>
          <div className="text-sm font-bold text-white truncate">
            {profile?.industry || currentTenant?.industryType || 'Enterprise FinTech'}
          </div>
          <div className="text-xs text-slate-400">
            Headcount: <strong className="text-slate-200">{profile?.employeeCount || 85} personnel</strong>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Cloud Infrastructure</span>
          <div className="text-sm font-bold text-sky-400 truncate">
            {profile?.primaryCloud || 'AWS & Multi-Cloud'}
          </div>
          <div className="text-xs text-slate-400">
            Locations: <strong className="text-slate-200">{profile?.locationsCount || 1} Primary Site(s)</strong>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Data Sensitivity Profile</span>
          <div className="text-sm font-bold text-emerald-400 truncate">
            {profile?.handlesPersonalData ? 'Personal & Financial Data' : 'Standard Business Data'}
          </div>
          <div className="text-xs text-slate-400">
            PIMS Required: <strong className="text-slate-200">{profile?.privacyPimsRequired ? 'Yes (ISO 27701)' : 'Standard'}</strong>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Third-Party Complexity</span>
          <div className="text-sm font-bold text-amber-400 truncate">
            {profile?.usesThirdParties ? 'Multi-Vendor Ecosystem' : 'Internal Operations'}
          </div>
          <div className="text-xs text-slate-400">
            Supplier Security: <strong className="text-slate-200">{profile?.supplierSecurityRequired ? 'Mandatory (Cl. 8.1)' : 'Basic'}</strong>
          </div>
        </div>
      </div>

      {/* Calibrated Governance Areas Matrix */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">
            Triggered Governance Areas ({profile?.applicableImplementationAreas?.length || 0})
          </h2>
          <span className="text-xs text-slate-400">
            Auto-configured for {currentTenant?.name}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile?.applicableImplementationAreas?.map(area => (
            <div
              key={area.areaId}
              className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      {area.priority} Priority
                    </span>
                    <span className="text-[11px] text-slate-400">Trigger: {area.triggeredBy}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1.5">
                    {area.name}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {area.rationale}
              </p>

              {/* Mandatory Controls and Clauses */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-semibold text-slate-400">Mandatory Controls:</span>
                  {area.mandatoryAnnexAControls.map(c => (
                    <span key={c} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">
                      {c}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-semibold text-slate-400">Required Clauses:</span>
                  {area.mandatoryClauses.map(cl => (
                    <span key={cl} className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800/80 text-emerald-300 border border-slate-700">
                      {cl}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activated Workbenches Banner */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-400" />
          <span>Recommended Next Action Workbenches</span>
        </h3>
        <p className="text-xs text-slate-400">
          Based on this calibrated profile, the following compliance workbenches are prioritized for your team:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <button
            onClick={() => setActiveModule('statement_of_applicability')}
            className="p-3 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-750 text-left transition-all"
          >
            <div className="text-xs font-bold text-white">Statement of Applicability (SoA)</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Annex A Control Justifications</div>
          </button>

          <button
            onClick={() => setActiveModule('risk_assessment')}
            className="p-3 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-750 text-left transition-all"
          >
            <div className="text-xs font-bold text-white">Asset-Based Risk Assessment</div>
            <div className="text-[11px] text-slate-400 mt-0.5">ISO 27001 Clause 6.1.2</div>
          </button>

          <button
            onClick={() => setActiveModule('policies')}
            className="p-3 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-750 text-left transition-all"
          >
            <div className="text-xs font-bold text-white">Policy Generation Studio</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Auditor-Grade Policy Set</div>
          </button>

          <button
            onClick={() => setActiveModule('evidence_centre')}
            className="p-3 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-750 text-left transition-all"
          >
            <div className="text-xs font-bold text-white">Evidence Custody & Hash Vault</div>
            <div className="text-[11px] text-slate-400 mt-0.5">SHA-256 Verified Artifacts</div>
          </button>
        </div>
      </div>
    </div>
  );
};
