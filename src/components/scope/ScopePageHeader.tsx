import React from 'react';
import {
  ShieldCheck,
  FileCheck2,
  Edit3,
  Plus,
  Scale,
  ExternalLink,
  Lock,
  Building2,
  Globe,
  Hash
} from 'lucide-react';
import { TenantCompany } from '../../types';
import { organizationService } from '../../services/organizationService';

interface ScopePageHeaderProps {
  tenant: TenantCompany | null;
  onEditScope: () => void;
  onOpenDossier: () => void;
  onNavigateClause42: () => void;
  onAddDepartment: () => void;
  onOpenLeadAuditorScope?: () => void;
}

export const ScopePageHeader: React.FC<ScopePageHeaderProps> = ({
  tenant,
  onEditScope,
  onOpenDossier,
  onNavigateClause42,
  onAddDepartment,
  onOpenLeadAuditorScope
}) => {
  const isBaselineLocked = tenant?.soaBaselineLocked || false;
  const baselineHash = tenant?.soaBaselineHash || '8f7bc299e41b2e5a019d';
  const companyName = organizationService.getOrganizationName(tenant);
  const industry = tenant?.industryType || 'Enterprise Operations';
  const address = tenant?.registeredAddress
    ? `${tenant.registeredAddress.city}, ${tenant.registeredAddress.country}`
    : 'London, United Kingdom';

  return (
    <header className="relative p-6 rounded-2xl bg-skanda-secondary border border-skanda shadow-lg space-y-6">
      {/* Top Banner Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[12px] font-semibold uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/25">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ISO/IEC 27001:2022 Clause 4.3</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[12px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Scope Baseline Approved</span>
            </span>
            {isBaselineLocked && (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[12px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/25">
                <Lock className="w-3.5 h-3.5" />
                <span>Audited & Cryptographically Sealed</span>
              </span>
            )}
          </div>

          <h1 className="text-[26px] font-bold text-white tracking-tight leading-tight">
            Organization & ISMS Scope
          </h1>

          <p className="text-[14px] text-slate-300 max-w-3xl leading-relaxed">
            Determining the formal boundaries, applicability criteria, and organizational units included within the
            Information Security Management System in compliance with ISO 27001:2022 Clause 4.3 and statutory regulations.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
          <button
            onClick={onEditScope}
            className="px-3.5 py-2 rounded-xl text-[14px] font-medium bg-skanda-card hover:bg-skanda-elevated text-slate-200 hover:text-white border border-skanda hover:border-slate-600 transition flex items-center space-x-2"
            title="Edit the ISMS formal scope statement text"
          >
            <Edit3 className="w-4 h-4 text-sky-400" />
            <span>Edit Scope</span>
          </button>

          <button
            onClick={onNavigateClause42}
            className="px-3.5 py-2 rounded-xl text-[14px] font-medium bg-skanda-card hover:bg-skanda-elevated text-slate-200 hover:text-white border border-skanda hover:border-slate-600 transition flex items-center space-x-2"
            title="View Clause 4.2 Stakeholder Obligations Matrix"
          >
            <Scale className="w-4 h-4 text-indigo-400" />
            <span>Clause 4.2 Matrix</span>
          </button>

          <button
            onClick={onOpenDossier}
            className="px-3.5 py-2 rounded-xl text-[14px] font-medium bg-skanda-card hover:bg-skanda-elevated text-slate-200 hover:text-white border border-skanda hover:border-slate-600 transition flex items-center space-x-2"
            title="Export formal ISO 27001 departmental scope dossier"
          >
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
            <span>Scope Dossier</span>
          </button>

          {onOpenLeadAuditorScope && (
            <button
              onClick={onOpenLeadAuditorScope}
              className="px-3.5 py-2 rounded-xl text-[14px] font-medium bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-300 hover:text-white border border-indigo-700/80 transition flex items-center space-x-2 shadow-sm"
              title="View TÜV / BSI Lead Auditor Scope Document (PESTLE, Legal Obligations & Cloud Perimeters)"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Lead Auditor Scope</span>
            </button>
          )}

          <button
            onClick={onAddDepartment}
            className="px-4 py-2 rounded-xl text-[14px] font-semibold bg-sky-600 hover:bg-sky-500 text-white transition flex items-center space-x-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Department</span>
          </button>
        </div>
      </div>

      {/* Organization Metadata Bar */}
      <div className="pt-4 border-t border-[#1E293B] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-[12px]">
        <div className="flex items-center space-x-2.5 text-slate-300">
          <Building2 className="w-4 h-4 text-sky-400 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Entity</span>
            <span className="font-semibold text-white truncate max-w-[200px] block">{companyName}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 text-slate-300">
          <Globe className="w-4 h-4 text-sky-400 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Industry & Location</span>
            <span className="font-semibold text-white truncate max-w-[220px] block">{industry} • {address}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 text-slate-300">
          <Hash className="w-4 h-4 text-sky-400 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Baseline Integrity Hash</span>
            <span className="font-mono text-slate-200">{baselineHash.slice(0, 14)}...</span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Auditor Status</span>
            <span className="font-semibold text-emerald-300">Stage 1 External Ready</span>
          </div>
        </div>
      </div>
    </header>
  );
};
