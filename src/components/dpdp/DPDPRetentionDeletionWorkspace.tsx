// ============================================================================
// SKANDA ENTERPRISE GRC: RETENTION & DELETION WORKSPACE
// Path: src/components/dpdp/DPDPRetentionDeletionWorkspace.tsx
//
// Section 8(7) Retention Management & Deletion Engine:
// - Statutory Retention Schedules (PMLA, Income Tax, Contractual)
// - Legal Hold Lock (Strictly blocks automatic timer deletion)
// - Automated Deletion Execution with SHA-256 Proofs
// ============================================================================

import React, { useState } from 'react';
import {
  Lock,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Key,
  Database
} from 'lucide-react';
import { dpdpPrivacyEngineService } from '../../services/canonical/DpdpPrivacyEngineService';
import { DpdpRetentionRule, DpdpDeletionExecutionJob } from '../../types/dpdpPlatformTypes';

interface DPDPRetentionDeletionWorkspaceProps {
  tenantId: string;
}

export const DPDPRetentionDeletionWorkspace: React.FC<DPDPRetentionDeletionWorkspaceProps> = ({
  tenantId
}) => {
  const [rules] = useState<DpdpRetentionRule[]>(() =>
    dpdpPrivacyEngineService.getRetentionRules(tenantId)
  );
  const [jobs, setJobs] = useState<DpdpDeletionExecutionJob[]>(() =>
    dpdpPrivacyEngineService.getDeletionJobs(tenantId)
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const handleExecuteDeletion = (jobId: string) => {
    setActionError(null);
    const result = dpdpPrivacyEngineService.executeDeletionJob(tenantId, jobId);
    if (!result.success) {
      setActionError(result.error || 'Deletion execution blocked');
    } else {
      setJobs(dpdpPrivacyEngineService.getDeletionJobs(tenantId));
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Lock className="w-4 h-4 text-purple-600" />
            <span>Retention Management & Deletion Engine</span>
          </h2>
          <p className="text-[11px] text-slate-500">
            Section 8(7) purpose-complete data purging, statutory retention overrides, and legal hold preservation locks.
          </p>
        </div>
      </div>

      {actionError && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 rounded-xl flex items-center space-x-2 animate-in fade-in">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Rules & Deletion Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Retention Rules & Legal Holds */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Statutory Retention Schedules</h3>
          {rules.map(rule => (
            <div
              key={rule.id}
              className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{rule.name}</h4>
                  <div className="text-[11px] text-slate-500 mt-0.5">Trigger: {rule.triggerEvent}</div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono ${
                    rule.hasActiveLegalHold
                      ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center space-x-1'
                      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200'
                  }`}
                >
                  {rule.hasActiveLegalHold ? 'LEGAL HOLD ACTIVE' : 'STANDARD RETENTION'}
                </span>
              </div>

              {rule.legalHoldReference && (
                <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-[11px] text-purple-900 dark:text-purple-200">
                  <strong>Preservation Lock:</strong> {rule.legalHoldReference}
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold block uppercase">Retention Window</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{rule.retentionPeriodMonths} Months</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] font-bold block uppercase">Target Databases</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">{rule.targetSystems.join(', ')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Scheduled Deletion Jobs Queue */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Scheduled Deletion Jobs & Cryptographic Proofs</h3>
          {jobs.map(job => (
            <div
              key={job.id}
              className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{job.id}</span>
                  <div className="text-[11px] text-slate-500 mt-0.5">Method: {job.deletionMethod}</div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    job.status === 'EXECUTED_VERIFIED'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : job.status === 'BLOCKED_BY_LEGAL_HOLD'
                      ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                  }`}
                >
                  {job.status}
                </span>
              </div>

              {job.cryptographicDeletionProofSha256 && (
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[10px] font-mono space-y-1">
                  <span className="text-slate-400 font-bold uppercase block">Cryptographic Purge Certificate Hash:</span>
                  <span className="text-indigo-600 dark:text-indigo-400 break-all">{job.cryptographicDeletionProofSha256}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500">Purged: <strong>{job.recordsPurgedCount} Records</strong></span>
                {job.status !== 'EXECUTED_VERIFIED' && (
                  <button
                    onClick={() => handleExecuteDeletion(job.id)}
                    className="px-3 py-1 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded shadow-xs transition-colors flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Execute Purge</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
