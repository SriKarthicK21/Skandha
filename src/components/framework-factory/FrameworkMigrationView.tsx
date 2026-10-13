/**
 * SKANDA Enterprise Framework Factory — Version Migration & "What Changed?" Engine
 * Path: src/components/framework-factory/FrameworkMigrationView.tsx
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  ArrowRight,
  Sparkles,
  PlusCircle,
  MinusCircle,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  Clock,
  Layers
} from 'lucide-react';
import { FrameworkMigrationPlan } from '../../types/frameworkFactoryTypes';

interface FrameworkMigrationViewProps {
  migrationPlans: FrameworkMigrationPlan[];
}

export const FrameworkMigrationView: React.FC<FrameworkMigrationViewProps> = ({
  migrationPlans
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    migrationPlans[0]?.migrationId || 'MIG-ISO-27001-2013-TO-2022'
  );

  const activePlan = migrationPlans.find(p => p.migrationId === selectedPlanId) || migrationPlans[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Framework Version Migration & &ldquo;What Changed?&rdquo; Engine
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Step-by-step delta analysis between standards revisions (ISO 27001:2013 → 2022, NIST CSF 1.1 → 2.0, PCI DSS 3.2.1 → 4.0.1).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Migration Path:</span>
          <select
            value={selectedPlanId}
            onChange={e => setSelectedPlanId(e.target.value)}
            className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
          >
            {migrationPlans.map(plan => (
              <option key={plan.migrationId} value={plan.migrationId}>
                {plan.sourceVersion} → {plan.targetVersion} ({plan.sourceFrameworkCode})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Migration Roadmap Top Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 rounded-2xl border border-emerald-500/30 p-6 text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            MIGRATION ROADMAP • {activePlan?.sourceVersion} TO {activePlan?.targetVersion}
          </span>
          <span className="text-xs font-semibold text-slate-300">
            Estimated Duration: ~{activePlan?.estimatedTransitionWeeks} Weeks
          </span>
        </div>

        <h3 className="text-2xl font-bold">{activePlan?.title}</h3>
        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          {activePlan?.description}
        </p>

        {/* Impact Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-white/10 p-3 rounded-xl border border-white/10">
            <span className="text-[10px] text-emerald-300 font-semibold uppercase">Net-New Controls</span>
            <div className="text-xl font-bold mt-0.5">+{activePlan?.addedRequirements.length}</div>
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-white/10">
            <span className="text-[10px] text-rose-300 font-semibold uppercase">Deprecated</span>
            <div className="text-xl font-bold mt-0.5">-{activePlan?.removedRequirements.length}</div>
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-white/10">
            <span className="text-[10px] text-amber-300 font-semibold uppercase">Modified / Restructured</span>
            <div className="text-xl font-bold mt-0.5">{activePlan?.modifiedRequirements.length}</div>
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-white/10">
            <span className="text-[10px] text-cyan-300 font-semibold uppercase">New Tech Controls</span>
            <div className="text-xl font-bold mt-0.5">{activePlan?.newControlsRequired.length}</div>
          </div>
        </div>
      </div>

      {/* Delta Matrix: Added, Removed, Modified */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Added Requirements */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Net-New Requirements ({activePlan?.addedRequirements.length})
            </h3>
          </div>

          <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
            {activePlan?.addedRequirements.map(req => (
              <div key={req.code} className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    {req.code}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                    NEW
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{req.title}</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">{req.notes}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Modified & Restructured Requirements */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Modified & Consolidated Requirements ({activePlan?.modifiedRequirements.length})
            </h3>
          </div>

          <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
            {activePlan?.modifiedRequirements.map(req => (
              <div key={req.code} className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400">
                    {req.code}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                    {req.structuralImpact} IMPACT
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{req.title}</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">{req.changeSummary}</p>
              </div>
            ))}

            {activePlan?.removedRequirements.map(req => (
              <div key={req.code} className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-rose-700 dark:text-rose-400">
                    {req.code}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-200/60 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200">
                    DEPRECATED / MERGED
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{req.title}</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">{req.rationale}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
