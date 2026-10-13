import React from 'react';
import { useGRC } from '../../context/GRCContext';
import {
  ShieldAlert,
  SlidersHorizontal,
  Compass,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  Layers,
  ArrowLeft
} from 'lucide-react';

interface Props {
  moduleId: string;
  onGoBack?: () => void;
}

export const MASModuleInapplicableView: React.FC<Props> = ({ moduleId, onGoBack }) => {
  const {
    masRegulatoryProfile,
    masApplicabilityRules,
    getMASApplicabilityRuleForModule,
    activeMASModuleIds,
    setActiveModule
  } = useGRC();

  const rule = getMASApplicabilityRuleForModule(moduleId);

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6 px-4">
      {/* Back button */}
      <button
        type="button"
        onClick={onGoBack || (() => setActiveModule('mas_compliance_flow'))}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to MAS Compliance Flow</span>
      </button>

      {/* Main Warning Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Scope Gated By Regulatory Profile
              </span>
              {rule && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {rule.code}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Module Inactive Under Current MAS Regulatory Scope
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              The requested module (<code className="px-1.5 py-0.5 rounded bg-slate-800 text-rose-300 font-mono text-xs">{moduleId}</code>) is currently marked <strong className="text-white font-semibold">Out of Scope</strong> based on your Singapore regulatory discovery evaluation.
            </p>
          </div>
        </div>

        {/* Rule Details */}
        {rule ? (
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs text-slate-400">Applicability Rule:</span>
                <h4 className="text-sm font-bold text-slate-100">{rule.name}</h4>
              </div>
              <div className="text-xs font-semibold px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 self-start sm:self-auto">
                Statutory Basis: {rule.statutoryBasis}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium block">Statutory Condition:</span>
                <p className="text-slate-300 leading-relaxed">{rule.description}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium block">Deactivation Rationale:</span>
                <p className="text-amber-300/90 leading-relaxed">{rule.rationaleIfInactive}</p>
              </div>
            </div>

            {/* Current Institution Profile Snapshot */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span>Institution Entity: <strong className="text-slate-200">{masRegulatoryProfile.entityType}</strong></span>
              <span>•</span>
              <span>Designated CIS: <strong className="text-slate-200">{masRegulatoryProfile.designatedCriticalSystemsCount || 0} systems</strong></span>
              <span>•</span>
              <span>Regulated in Singapore: <strong className="text-slate-200">{masRegulatoryProfile.isMasRegulated ? 'Yes' : 'No'}</strong></span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
            This module is conditioned on active MAS TRM regulatory registration in the GRC Profile.
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => setActiveModule('mas_discovery_scoping')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20 transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Calibrate in MAS Regulatory Discovery Wizard</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setActiveModule('mas_compliance_flow')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all"
          >
            <Building2 className="w-4 h-4" />
            <span>Open MAS Compliance Flow Hub</span>
          </button>
        </div>
      </div>

      {/* Overview of All Applicability Rules */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-rose-400" />
          Active Singapore Applicability Rules ({masApplicabilityRules.length})
        </h3>
        <p className="text-xs text-slate-400">
          Only modules activated by at least one rule are registered in the active routing table and sidebar navigation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {masApplicabilityRules.map(r => {
            const isActive = r.evaluator(masRegulatoryProfile);
            return (
              <div
                key={r.id}
                className={`p-3.5 rounded-xl border transition-all text-xs space-y-2 ${
                  isActive
                    ? 'bg-slate-850/80 border-emerald-500/30'
                    : 'bg-slate-950/40 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isActive ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <span className="font-semibold text-slate-200">{r.code}: {r.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 line-clamp-2">
                  {isActive ? r.rationaleIfActive : r.rationaleIfInactive}
                </div>

                <div className="pt-1 flex flex-wrap gap-1 text-[10px]">
                  {r.affectedModuleIds.map(m => {
                    const isModActive = activeMASModuleIds.includes(m);
                    return (
                      <span
                        key={m}
                        className={`px-1.5 py-0.5 rounded font-mono ${
                          isModActive
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {m}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
