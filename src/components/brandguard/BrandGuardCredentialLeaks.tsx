// Skanda BrandGuard — Credential Spill & Brand Asset Leakage Monitoring
// Ingests stealer log dumps (RedLine, LummaC2) matching corporate email domains (@apexfintech.com)
// and detects public repository leaks (GitHub, GitLab) exposing brand secrets/API keys.
// Provides 1-click enterprise remediation (Okta session revocation, password reset, DMCA takedown).

import React, { useState } from 'react';
import {
  Key,
  Code,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Send,
  Eye,
  EyeOff,
  UserX,
  RefreshCw,
  Clock,
  Flame,
  Globe,
  GitBranch,
  ShieldCheck
} from 'lucide-react';
import { LeakedCredentialAlert, CodeRepoLeakAlert, BrandProfile } from '../../types/brandguard';
import { BrandGuardLeakageService } from '../../services/brandguard/brandguardLeakageService';
import { useGRC } from '../../context/GRCContext';

interface BrandGuardCredentialLeaksProps {
  onNotifyOktaRevocation?: (email: string) => void;
  brandProfile?: BrandProfile;
}

export const BrandGuardCredentialLeaks: React.FC<BrandGuardCredentialLeaksProps> = ({
  onNotifyOktaRevocation,
  brandProfile
}) => {
  const { theme, logAuditEvent } = useGRC();
  const [activeSubTab, setActiveSubTab] = useState<'CREDENTIALS' | 'CODE_LEAKS'>('CREDENTIALS');
  const [credentials, setCredentials] = useState<LeakedCredentialAlert[]>(() =>
    BrandGuardLeakageService.getLeakedCredentials()
  );
  const [codeLeaks, setCodeLeaks] = useState<CodeRepoLeakAlert[]>(() =>
    BrandGuardLeakageService.getCodeRepoLeaks()
  );
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [remediatingId, setRemediatingId] = useState<string | null>(null);

  const togglePasswordReveal = (id: string) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleRemediateCredential = async (cred: LeakedCredentialAlert) => {
    setRemediatingId(cred.id);
    try {
      const updated = BrandGuardLeakageService.enforceCredentialRemediation(
        cred.id,
        'PASSWORD_RESET_ENFORCED',
        'Automated Okta MFA session revocation and forced directory password expiration'
      );
      if (updated) {
        setCredentials(BrandGuardLeakageService.getLeakedCredentials());
        if (onNotifyOktaRevocation) onNotifyOktaRevocation(cred.email);
        logAuditEvent(
          'UPDATE',
          'BrandGuard Credential Spill Remediation',
          `Revoked active SSO sessions and enforced mandatory password reset for compromised identity: ${cred.email} (Source: ${cred.leakSource})`
        );
      }
    } finally {
      setRemediatingId(null);
    }
  };

  const handleRemediateCodeLeak = async (leak: CodeRepoLeakAlert) => {
    setRemediatingId(leak.id);
    try {
      const updated = BrandGuardLeakageService.dispatchRepoTakedown(leak.id);
      if (updated) {
        setCodeLeaks(BrandGuardLeakageService.getCodeRepoLeaks());
        logAuditEvent(
          'UPDATE',
          'BrandGuard Code Leak Remediation',
          `Dispatched secret revocation & automated DMCA repo takedown for ${leak.matchedSecretType} in ${leak.repoUrl}`
        );
      }
    } finally {
      setRemediatingId(null);
    }
  };

  const activeCreds = credentials.filter(c => c.remediationStatus === 'OPEN');
  const activeCode = codeLeaks.filter(c => c.status === 'ACTIVE_EXPOSED');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div
        className={`p-5 rounded-2xl border ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Key className="w-6 h-6 shrink-0" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold">Credential Spill & Brand Asset Leakage Monitoring</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {activeCreds.length + activeCode.length} Active Exposures
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                  ISO 27001 A.8.5 / SOC 2 CC6.1
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Surfaces infostealer malware logs (RedLine, LummaC2) compromising @apexfintech.com corporate identities and public code repository secret exposures.
              </p>
            </div>
          </div>

          {/* Sub-tab switcher */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setActiveSubTab('CREDENTIALS')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                activeSubTab === 'CREDENTIALS'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Infostealer Credentials ({credentials.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('CODE_LEAKS')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                activeSubTab === 'CODE_LEAKS'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Repository Leaks & Secrets ({codeLeaks.length})</span>
            </button>
          </div>
        </div>

        {/* Aggregate KPI Strip */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Compromised Corporate Accounts</span>
            <span className="text-base font-bold text-rose-400 mt-0.5 block">{activeCreds.length} Identities</span>
            <span className="text-[10px] text-slate-500">Exposed in stealer malware logs</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">C-Suite / Executive Exposure</span>
            <span className="text-base font-bold text-amber-400 mt-0.5 block">1 High Priority (CTO)</span>
            <span className="text-[10px] text-rose-400 font-semibold">Immediate action recommended</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Exposed Code Repository Secrets</span>
            <span className="text-base font-bold text-indigo-400 mt-0.5 block">{activeCode.length} Secrets</span>
            <span className="text-[10px] text-slate-400">AWS, Stripe, Gemini API keys</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Remediation Automation SLA</span>
            <span className="text-base font-bold text-emerald-400 mt-0.5 block">&lt; 15 Minutes</span>
            <span className="text-[10px] text-emerald-400">Direct Okta & GitHub integration</span>
          </div>
        </div>
      </div>

      {/* VIEW 1: Infostealer Credentials */}
      {activeSubTab === 'CREDENTIALS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
            <span>COMPROMISED CORPORATE CREDENTIAL LOGS</span>
            <span className="font-mono">{credentials.length} RECORD(S)</span>
          </div>

          <div className="divide-y divide-slate-800 rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden text-xs">
            {credentials.map(cred => {
              const isRemediated = cred.remediationStatus !== 'OPEN';
              const isRevealed = revealedPasswords[cred.id];

              return (
                <div key={cred.id} className="p-4 sm:p-5 hover:bg-slate-800/40 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2 min-w-0">
                      <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                        <span className="font-mono text-sm font-bold text-slate-100">
                          {cred.email}
                        </span>
                        {cred.compromisedEmployee && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {cred.compromisedEmployee.name} ({cred.compromisedEmployee.role})
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                          {cred.leakSource}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isRemediated
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {cred.remediationStatus.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {/* Password snippet */}
                      <div className="flex items-center space-x-3 text-[11px] flex-wrap gap-y-1">
                        <span className="text-slate-400">Compromised Password:</span>
                        <div className="flex items-center space-x-1.5 font-mono px-2 py-1 rounded bg-slate-950 border border-slate-800 text-rose-300">
                          <span>{isRevealed ? (cred.cleartextPasswordMasked || '••••••••••••') : '••••••••••••'}</span>
                          <button
                            onClick={() => togglePasswordReveal(cred.id)}
                            className="text-slate-500 hover:text-slate-300"
                            title={isRevealed ? 'Hide' : 'Reveal Preview'}
                          >
                            {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400">
                          Hash / Encoding: <code className="font-mono text-slate-300">{cred.passwordHashType || 'PLAIN'}</code>
                        </span>
                        {cred.stealerMalwareFamily && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span className="text-rose-400 font-semibold">Malware: {cred.stealerMalwareFamily}</span>
                          </>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center space-x-3 text-[11px] text-slate-500 flex-wrap gap-y-1">
                        <span>Exposed Assets: <strong className="text-slate-400">{cred.exposedDataTypes.join(', ')}</strong></span>
                        <span>•</span>
                        <span>Exposed: {new Date(cred.exposureDate).toLocaleString()}</span>
                        <span>•</span>
                        <span>Ingested: {new Date(cred.ingestedDate).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="shrink-0">
                      {isRemediated ? (
                        <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold text-xs">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Remediation Enforced</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRemediateCredential(cred)}
                          disabled={remediatingId === cred.id}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center space-x-1.5 shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>
                            {remediatingId === cred.id
                              ? 'Revoking in Okta...'
                              : 'Enforce Session Revocation & Password Reset'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: Public Code Repository Leaks */}
      {activeSubTab === 'CODE_LEAKS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
            <span>PUBLIC CODE REPOSITORY TOKEN & SECRET EXPOSURES</span>
            <span className="font-mono">{codeLeaks.length} REPO(S)</span>
          </div>

          <div className="divide-y divide-slate-800 rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden text-xs">
            {codeLeaks.map(leak => {
              const isRemediated = leak.status !== 'ACTIVE_EXPOSED';

              return (
                <div key={leak.id} className="p-4 sm:p-5 hover:bg-slate-800/40 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2 min-w-0">
                      <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                        <span className="font-mono text-sm font-bold text-indigo-300">
                          {leak.matchedSecretType}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                          {leak.repoPlatform}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            leak.severity === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {leak.severity}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isRemediated
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {leak.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-[11px] text-slate-400 flex-wrap">
                        <GitBranch className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="font-mono text-slate-300 truncate">{leak.repoUrl}</span>
                        <span className="text-slate-600">•</span>
                        <span className="font-mono text-indigo-400">{leak.filePath}</span>
                        <span className="text-slate-600">•</span>
                        <span className="font-mono text-slate-500">commit: {leak.commitHash}</span>
                      </div>

                      {/* Obfuscated secret */}
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-amber-300">
                        <code>{leak.secretMasked}</code>
                      </div>

                      <div className="text-[10px] text-slate-500">
                        Exposure Date: {new Date(leak.exposureDate).toLocaleString()} • Risk Score: {leak.riskScore}/100
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="shrink-0">
                      {isRemediated ? (
                        <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold text-xs">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Secret Revocation / Takedown Dispatched</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRemediateCodeLeak(leak)}
                          disabled={remediatingId === leak.id}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>
                            {remediatingId === leak.id
                              ? 'Dispatching Takedown...'
                              : 'Revoke Key & Dispatch DMCA Notice'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
