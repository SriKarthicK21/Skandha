import React from 'react';
import {
  Users,
  Shield,
  Server,
  Database,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  ChevronRight,
  Mail,
  MapPin,
  Cpu
} from 'lucide-react';
import { DepartmentScopeProfile } from '../../types';

interface DepartmentCardProps {
  department: DepartmentScopeProfile;
  onToggleInScope: (id: string) => void;
  onConfigure: (dept: DepartmentScopeProfile) => void;
}

export const DepartmentCard: React.FC<DepartmentCardProps> = ({
  department,
  onToggleInScope,
  onConfigure
}) => {
  const isInScope = department.isInScope;

  // Category badge color helper
  const getCategoryBadgeClass = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'technology':
      case 'cloud':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/25';
      case 'security':
      case 'cybersecurity':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
      case 'operations':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25';
      case 'finance':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
      case 'human resources':
      case 'people':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/25';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const coreProcesses = department.coreProcesses || [];
  const criticalAssets = department.criticalAssetsAndSystems || [];
  const classifications = department.dataClassifications || ['Internal'];
  const annexCount = department.applicableAnnexAControls?.length || 0;

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden group ${
        isInScope
          ? 'bg-skanda-card border-skanda hover:border-skanda-hover hover:bg-skanda-elevated'
          : 'bg-skanda-secondary border-skanda opacity-75 hover:opacity-100 hover:border-slate-700'
      }`}
    >
      {/* Top Card Header */}
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <span
              className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border ${getCategoryBadgeClass(
                department.category
              )}`}
            >
              {department.category || 'General'}
            </span>
            <h3 className="text-[15px] font-semibold text-white tracking-tight truncate group-hover:text-sky-300 transition">
              {department.name}
            </h3>
          </div>

          {/* Scope Status Toggle / Badge */}
          <button
            type="button"
            onClick={() => onToggleInScope(department.id)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border flex items-center space-x-1.5 shrink-0 transition ${
              isInScope
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-300'
            }`}
            title={isInScope ? 'Click to mark department Excluded' : 'Click to mark department In-Scope'}
            aria-pressed={isInScope}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isInScope ? 'bg-emerald-400' : 'bg-slate-500'
              }`}
            />
            <span>{isInScope ? 'In-Scope' : 'Excluded'}</span>
          </button>
        </div>

        {/* Lead & Location Metadata */}
        <div className="space-y-1.5 text-[12px] text-slate-300">
          <div className="flex items-center space-x-2 text-slate-300">
            <Users className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="truncate font-medium text-slate-200">
              {department.leadOwner || 'Department Lead'}
            </span>
            {department.leadEmail && (
              <span className="text-slate-400 truncate text-[11px]">({department.leadEmail})</span>
            )}
          </div>

          <div className="flex items-center space-x-2 text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              {department.headcount || 25} personnel • {department.workLocations || 'London HQ & Remote'}
            </span>
          </div>
        </div>

        {/* Scope Boundary Description */}
        <p className="text-[12px] text-slate-300 line-clamp-2 leading-relaxed pt-1">
          {department.scopeBoundary ||
            'Governs technical and administrative controls adhering to ISMS policies.'}
        </p>

        {/* Core Processes Chips */}
        {coreProcesses.length > 0 && (
          <div className="space-y-1 pt-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block">
              Core In-Scope Processes
            </span>
            <div className="flex flex-wrap gap-1.5">
              {coreProcesses.slice(0, 3).map(proc => (
                <span
                  key={proc}
                  className="px-2 py-0.5 rounded-md bg-skanda-primary text-[11px] text-slate-300 border border-skanda"
                >
                  {proc}
                </span>
              ))}
              {coreProcesses.length > 3 && (
                <span className="px-1.5 py-0.5 rounded-md bg-skanda-primary text-[11px] text-slate-400 border border-skanda">
                  +{coreProcesses.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Systems & Data Classification */}
        <div className="pt-2 border-t border-skanda/80 grid grid-cols-2 gap-2 text-[12px]">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-slate-400 block">Assets / Systems</span>
            <div className="flex items-center space-x-1 text-slate-200">
              <Server className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="font-semibold">{criticalAssets.length} systems</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-medium text-slate-400 block">Annex A Controls</span>
            <div className="flex items-center space-x-1 text-emerald-400">
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span className="font-semibold">{annexCount} mapped</span>
            </div>
          </div>
        </div>

        {/* Data Classifications */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-400">Data:</span>
          {classifications.map(c => (
            <span
              key={c}
              className={`px-1.5 py-0.2 rounded text-[10px] font-medium border ${
                c.toLowerCase().includes('restricted') || c.toLowerCase().includes('confidential')
                  ? 'bg-rose-500/10 text-rose-300 border-rose-500/25'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-3.5 bg-skanda-primary/60 border-t border-skanda flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onToggleInScope(department.id)}
          className={`text-[12px] font-medium px-2.5 py-1 rounded-lg transition ${
            isInScope
              ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10'
              : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
          }`}
        >
          {isInScope ? 'Mark Excluded' : 'Include in Scope'}
        </button>

        <button
          type="button"
          onClick={() => onConfigure(department)}
          className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-sky-600/15 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 transition flex items-center space-x-1"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Configure Scope</span>
          <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </button>
      </div>
    </div>
  );
};
