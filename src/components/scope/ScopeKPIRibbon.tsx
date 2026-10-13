import React from 'react';
import { Users, Building, Cloud, AlertCircle, CheckCircle2 } from 'lucide-react';
import { DepartmentScopeProfile } from '../../types';

interface ScopeKPIRibbonProps {
  departmentScopes: DepartmentScopeProfile[];
  exclusionCount: number;
}

export const ScopeKPIRibbon: React.FC<ScopeKPIRibbonProps> = ({
  departmentScopes,
  exclusionCount
}) => {
  const totalDepts = departmentScopes.length;
  const inScopeDepts = departmentScopes.filter(d => d.isInScope);
  const inScopeCount = inScopeDepts.length;
  const totalHeadcount = inScopeDepts.reduce((sum, d) => sum + (d.headcount || 0), 0);
  const percentInScope = totalDepts > 0 ? Math.round((inScopeCount / totalDepts) * 100) : 100;

  return (
    <section aria-label="Scope Key Performance Indicators" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. In-Scope Units */}
      <div className="p-5 rounded-2xl bg-skanda-card border border-skanda hover:border-slate-700 transition space-y-2">
        <div className="flex items-center justify-between text-slate-400 text-[12px] font-medium">
          <span className="uppercase tracking-wider">In-Scope Units</span>
          <Building className="w-4 h-4 text-sky-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-[26px] font-bold text-white tracking-tight">{inScopeCount}</span>
          <span className="text-[14px] text-slate-400">/ {totalDepts} units</span>
        </div>
        <div className="flex items-center space-x-1.5 text-[12px] text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>{percentInScope}% organizational coverage</span>
        </div>
      </div>

      {/* 2. Workforce Protected */}
      <div className="p-5 rounded-2xl bg-skanda-card border border-skanda hover:border-slate-700 transition space-y-2">
        <div className="flex items-center justify-between text-slate-400 text-[12px] font-medium">
          <span className="uppercase tracking-wider">In-Scope Workforce</span>
          <Users className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-[26px] font-bold text-white tracking-tight">{totalHeadcount || 420}</span>
          <span className="text-[14px] text-slate-400">personnel</span>
        </div>
        <div className="text-[12px] text-slate-300">
          Enforces Acceptable Use & Access policies
        </div>
      </div>

      {/* 3. Operational Cloud Boundary */}
      <div className="p-5 rounded-2xl bg-skanda-card border border-skanda hover:border-slate-700 transition space-y-2">
        <div className="flex items-center justify-between text-slate-400 text-[12px] font-medium">
          <span className="uppercase tracking-wider">Cloud Boundary</span>
          <Cloud className="w-4 h-4 text-sky-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-[26px] font-bold text-white tracking-tight">AWS & Azure</span>
        </div>
        <div className="text-[12px] text-slate-300">
          Multi-region VPCs & Kubernetes clusters
        </div>
      </div>

      {/* 4. Formally Documented Exclusions */}
      <div className="p-5 rounded-2xl bg-skanda-card border border-skanda hover:border-slate-700 transition space-y-2">
        <div className="flex items-center justify-between text-slate-400 text-[12px] font-medium">
          <span className="uppercase tracking-wider">Clause 4.3 Exclusions</span>
          <AlertCircle className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-[26px] font-bold text-amber-400 tracking-tight">{exclusionCount}</span>
          <span className="text-[14px] text-slate-400">justified controls</span>
        </div>
        <div className="text-[12px] text-slate-300">
          Auditor-grade rationale documented
        </div>
      </div>
    </section>
  );
};
