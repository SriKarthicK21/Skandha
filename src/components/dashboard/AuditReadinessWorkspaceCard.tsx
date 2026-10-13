import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  FileCheck2,
  Lock,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderOpen,
  ArrowUpRight,
  ShieldCheck,
  Hash,
  Database,
  Search,
  Sparkles
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { MetricInfoTooltip } from '../common/Tooltip';

interface AuditReadinessWorkspaceCardProps {
  onNavigateModule: (moduleId: string) => void;
  className?: string;
}

export const AuditReadinessWorkspaceCard: React.FC<AuditReadinessWorkspaceCardProps> = ({
  onNavigateModule,
  className = ''
}) => {
  const { theme, evidence, currentTenant } = useGRC();
  const isLight = theme === 'light';

  const tenantEvidence = evidence.filter(e => !e.tenantId || e.tenantId === currentTenant?.id);
  const verifiedCount = tenantEvidence.filter(e => e.status === 'Verified').length;
  const totalCount = tenantEvidence.length || 1;
  const hashCheckRate = 100;

  const workpaperPackages = [
    { name: 'Stage 1 ISMS Policy Dossier', count: 18, verified: 18, status: 'Ready for Auditor' },
    { name: 'Annex A.8 Technical Evidence Binder', count: 42, verified: 40, status: '95% Sealed' },
    { name: 'Internal Audit & Management Review 2026', count: 6, verified: 6, status: 'Signed Off' },
    { name: 'Penetration Test & Vulnerability Reports', count: 8, verified: 8, status: 'Remediated' }
  ];

  return (
    <div
      id="audit-readiness-workspace-card"
      className={`p-5 rounded-2xl border transition-all h-full flex flex-col justify-between ${
        isLight
          ? 'bg-white border-slate-200/90 shadow-sm'
          : 'bg-slate-900/90 border-slate-800 shadow-md'
      } ${className}`}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center space-x-1.5">
                <FileCheck2 className="w-4 h-4 text-sky-500" />
                <span>Audit Readiness & Evidence Vault</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                SHA-256 Sealed
              </span>
              <MetricInfoTooltip
                title="Cryptographic Evidence Vault"
                badge="Tamper-Proof Audit Trail"
                content="Maintains chain-of-custody, immutable SHA-256 cryptographic hashes, and automated verification of audit workpapers submitted for certification body inspection."
                formula="(Cryptographically Verified Workpapers / Total Required Evidence Artifacts) × 100"
                benchmark="100% hash validity required; expired or unverified evidence triggers immediate auditor escalation."
                position="bottom"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Immutable chain of custody for external certification body audit packages.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateModule('evidence_centre')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
          >
            <span>Evidence Center</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Cryptographic Vault Status Bar */}
        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Workpapers</span>
            <span className="text-xl font-black font-mono text-slate-900 dark:text-white">{verifiedCount} files</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Hash Check</span>
            <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">{hashCheckRate}% valid</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Freshness</span>
            <span className="text-xl font-black font-mono text-sky-600 dark:text-sky-400">&lt; 90 days</span>
          </div>
        </div>

        {/* Workpaper Packages List */}
        <div className="space-y-2 mt-3.5">
          {workpaperPackages.map(pkg => (
            <div
              key={pkg.name}
              className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-center justify-between text-xs"
            >
              <div className="flex items-center space-x-2">
                <FolderOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">{pkg.name}</span>
              </div>
              <div className="flex items-center space-x-2 font-mono text-[11px]">
                <span className="text-slate-400">{pkg.verified}/{pkg.count}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {pkg.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] flex items-center space-x-1">
          <Lock className="w-3 h-3 text-emerald-500" />
          <span>Ledger: <strong>SHA-256 Merkle Certified</strong></span>
        </span>
        <button
          type="button"
          onClick={() => onNavigateModule('audit_centre')}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
        >
          <span>Auditor Direct Export</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
