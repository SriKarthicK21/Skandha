// ============================================================================
// SKANDA ENTERPRISE GRC: CONSENT LIFECYCLE WORKSPACE
// Path: src/components/dpdp/DPDPConsentLifecycleWorkspace.tsx
//
// Programmatic Consent Lifecycle & Downstream Processing Restriction:
// - Track consent state (Given, Withdrawn, Expired, Restricted)
// - Cryptographic SHA-256 consent receipt artifacts
// - Interactive Consent Withdrawal simulator with downstream system restrictions
// ============================================================================

import React, { useState } from 'react';
import {
  FileCheck2,
  ShieldCheck,
  Ban,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Lock
} from 'lucide-react';
import { dpdpPrivacyEngineService } from '../../services/canonical/DpdpPrivacyEngineService';
import { DpdpConsentRecord } from '../../types/dpdpPlatformTypes';

interface DPDPConsentLifecycleWorkspaceProps {
  tenantId: string;
}

export const DPDPConsentLifecycleWorkspace: React.FC<DPDPConsentLifecycleWorkspaceProps> = ({
  tenantId
}) => {
  const [consents, setConsents] = useState<DpdpConsentRecord[]>(() =>
    dpdpPrivacyEngineService.getConsentRecords(tenantId)
  );
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [withdrawalReason, setWithdrawalReason] = useState('Data Principal requested complete opt-out via privacy settings.');

  const handleExecuteWithdrawal = (consentId: string) => {
    const result = dpdpPrivacyEngineService.recordConsentWithdrawal(
      tenantId,
      consentId,
      withdrawalReason
    );
    if (result.success) {
      setConsents(dpdpPrivacyEngineService.getConsentRecords(tenantId));
      setWithdrawingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
            <span>Consent Lifecycle & Programmatic Restriction Engine</span>
          </h2>
          <p className="text-[11px] text-slate-500">
            Section 6 consent state tracking with cryptographic receipts and automated downstream pipeline restriction cascades upon withdrawal.
          </p>
        </div>
      </div>

      {/* Consent Stream Cards */}
      <div className="space-y-3">
        {consents.map(c => (
          <div
            key={c.id}
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{c.id}</span>
                <span className="text-xs text-slate-500">Principal: <strong>{c.dataPrincipalEmailMasked}</strong></span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  Notice v{c.noticeVersion}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span
                  className={`px-2.5 py-1 rounded text-xs font-bold font-mono ${
                    c.consentState === 'GIVEN'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                  }`}
                >
                  {c.consentState}
                </span>

                {c.consentState === 'GIVEN' && (
                  <button
                    onClick={() => setWithdrawingId(c.id)}
                    className="px-2.5 py-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded border border-rose-200 dark:border-rose-800 transition-colors"
                  >
                    Simulate Withdrawal
                  </button>
                )}
              </div>
            </div>

            {/* Cryptographic Hash & Timeline */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Consent Artifact SHA-256 Proof:</span>
                <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 truncate max-w-sm">
                  {c.consentArtifactSha256}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Granted Date</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{new Date(c.grantedAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Channel</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{c.sourceChannel}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Downstream Status</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{c.downstreamRestrictionStatus}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Masked Origin IP</span>
                  <span className="font-mono text-slate-600 dark:text-slate-400">{c.ipAddressMasked}</span>
                </div>
              </div>
            </div>

            {/* Withdrawal Confirmation Dialog */}
            {withdrawingId === c.id && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-2 text-xs animate-in fade-in">
                <div className="font-bold text-rose-900 dark:text-rose-200 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Execute Downstream Processing Restriction Cascade</span>
                </div>
                <p className="text-[11px] text-rose-700 dark:text-rose-300 leading-snug">
                  Executing consent withdrawal will instantly notify all downstream processing queues (Analytics, Email Dispatcher, Marketing DB) to halt processing.
                </p>
                <input
                  type="text"
                  value={withdrawalReason}
                  onChange={e => setWithdrawalReason(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-700 text-slate-900 dark:text-white"
                />
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => setWithdrawingId(null)}
                    className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleExecuteWithdrawal(c.id)}
                    className="px-3 py-1 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded shadow-xs"
                  >
                    Confirm & Enforce Cascade
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
