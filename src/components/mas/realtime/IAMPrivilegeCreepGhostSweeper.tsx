import React, { useState, useEffect } from 'react';
import {
  Users,
  UserX,
  UserCheck,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Key,
  Lock,
  Unlock,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Flame,
  Check,
  Eye,
  FileCheck,
  Sparkles,
  ExternalLink,
  Sliders,
  Calendar,
  Layers
} from 'lucide-react';

export interface DormantAdminAccount {
  id: string;
  username: string;
  sourceSystem: 'CyberArk PAM' | 'Okta Enterprise' | 'Azure AD / Entra ID' | 'AWS IAM';
  roleTitle: string;
  lastActiveDate: string;
  daysInactive: number;
  standingPrivilegeLevel: 'GLOBAL_ADMIN' | 'DATABASE_ROOT' | 'DOMAIN_ADMIN' | 'CLOUD_INFRA_OWNER';
  mfaHardwareEnforced: boolean;
  status: 'DORMANT_FLAGGED' | 'REVOKED' | 'EXEMPT_APPROVED';
}

export interface JITEphemeralElevation {
  id: string;
  engineerName: string;
  targetResource: string;
  jiraTicketId: string;
  justification: string;
  requestedDurationHours: number;
  minutesRemaining: number;
  firstLineApprover: string;
  secondLineApprover: string;
  elevationStatus: 'ACTIVE_ELEVATED' | 'AUTO_REVOKED_EXPIRED' | 'PENDING_APPROVAL';
}

export interface BreakGlassCheckoutLog {
  id: string;
  safeName: string;
  credentialCheckedOut: string;
  checkedOutBy: string;
  timestamp: string;
  incidentReference: string;
  fourEyesValidator: string;
  postAccessReviewStatus: 'PENDING_REVIEW' | 'REVIEWED_AND_CERTIFIED' | 'INVESTIGATION_RAISED';
  cryptographicSignature: string;
}

export const IAMPrivilegeCreepGhostSweeper: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'DORMANT_SWEEPER' | 'JIT_ELEVATION' | 'BREAK_GLASS'>('DORMANT_SWEEPER');

  // 1. Dormant Privileged Accounts State
  const [dormantAccounts, setDormantAccounts] = useState<DormantAdminAccount[]>([
    {
      id: 'USR-ADM-092',
      username: 'svc-devops-changi-deploy@bank.sg',
      sourceSystem: 'AWS IAM',
      roleTitle: 'Cloud DevOps Administrator (All VPCs)',
      lastActiveDate: '2026-08-12 (46 days ago)',
      daysInactive: 46,
      standingPrivilegeLevel: 'CLOUD_INFRA_OWNER',
      mfaHardwareEnforced: true,
      status: 'DORMANT_FLAGGED'
    },
    {
      id: 'USR-ADM-088',
      username: 'tan.weiliang@bank.sg',
      sourceSystem: 'Azure AD / Entra ID',
      roleTitle: 'Exchange & Mail Security Admin',
      lastActiveDate: '2026-08-20 (38 days ago)',
      daysInactive: 38,
      standingPrivilegeLevel: 'GLOBAL_ADMIN',
      mfaHardwareEnforced: true,
      status: 'DORMANT_FLAGGED'
    },
    {
      id: 'USR-ADM-071',
      username: 'dba-contractor-oracle@bank.sg',
      sourceSystem: 'CyberArk PAM',
      roleTitle: 'Core Settlement DB SYSDBA',
      lastActiveDate: '2026-07-29 (60 days ago)',
      daysInactive: 60,
      standingPrivilegeLevel: 'DATABASE_ROOT',
      mfaHardwareEnforced: false,
      status: 'DORMANT_FLAGGED'
    }
  ]);

  // 2. JIT Ephemeral Elevation Sessions
  const [jitSessions, setJitSessions] = useState<JITEphemeralElevation[]>([
    {
      id: 'JIT-8821',
      engineerName: 'Marcus Goh (Core Payments Eng)',
      targetResource: 'MEPS+ Host Switch Node 01 (Production CLI)',
      jiraTicketId: 'SEC-2026-4412',
      justification: 'Emergency hotfix for SWIFT ISO 20022 clearing queue parsing fault',
      requestedDurationHours: 4,
      minutesRemaining: 142,
      firstLineApprover: 'Payment Infrastructure Lead',
      secondLineApprover: 'Head of Technology Risk (CISO)',
      elevationStatus: 'ACTIVE_ELEVATED'
    },
    {
      id: 'JIT-8819',
      engineerName: 'Kavitha R. (Cloud SRE)',
      targetResource: 'AWS Singapore VPC Border Firewall Router',
      jiraTicketId: 'SEC-2026-4390',
      justification: 'BGP failover route flap remediation',
      requestedDurationHours: 2,
      minutesRemaining: 0,
      firstLineApprover: 'SecOps Lead',
      secondLineApprover: 'Head of Technology Risk',
      elevationStatus: 'AUTO_REVOKED_EXPIRED'
    }
  ]);

  // 3. Break-Glass Safe Checkout Logs
  const [breakGlassLogs, setBreakGlassLogs] = useState<BreakGlassCheckoutLog[]>([
    {
      id: 'BG-SAFE-001',
      safeName: 'CyberArk Emergency Cyber Vault (Changi DC Air-gap)',
      credentialCheckedOut: 'root_super_admin_changi_hsm',
      checkedOutBy: 'Lim Siew Ling (CIO Incident Commander)',
      timestamp: '2026-09-27 22:50:12 SGT',
      incidentReference: 'INC-2026-0928-001 (FAST PayNow Outage)',
      fourEyesValidator: 'Chief Risk Officer (SMS Hardware Token OTP)',
      postAccessReviewStatus: 'PENDING_REVIEW',
      cryptographicSignature: 'ED25519-SIG:9a8f4c2e1189bc441029abff'
    },
    {
      id: 'BG-SAFE-002',
      safeName: 'Primary Core Banking Active Directory Break-Glass Safe',
      credentialCheckedOut: 'domain_recovery_krbtgt_seed',
      checkedOutBy: 'Marcus Goh (Principal Architect)',
      timestamp: '2026-08-14 14:15:00 SGT',
      incidentReference: 'INC-2026-0814-042',
      fourEyesValidator: 'Head of Technology Risk',
      postAccessReviewStatus: 'REVIEWED_AND_CERTIFIED',
      cryptographicSignature: 'ED25519-SIG:88bc412aef91209934bb0012'
    }
  ]);

  const [revokingId, setRevokingId] = useState<string | null>(null);

  // Timer loop for active JIT elevations
  useEffect(() => {
    const timer = setInterval(() => {
      setJitSessions(prev =>
        prev.map(s => {
          if (s.elevationStatus === 'ACTIVE_ELEVATED' && s.minutesRemaining > 0) {
            const nextMin = s.minutesRemaining - 1;
            return {
              ...s,
              minutesRemaining: nextMin,
              elevationStatus: nextMin === 0 ? 'AUTO_REVOKED_EXPIRED' : 'ACTIVE_ELEVATED'
            };
          }
          return s;
        })
      );
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const handleRevokeAccount = (id: string) => {
    setRevokingId(id);
    setTimeout(() => {
      setDormantAccounts(prev =>
        prev.map(acc => {
          if (acc.id === id) {
            return { ...acc, status: 'REVOKED' };
          }
          return acc;
        })
      );
      setRevokingId(null);
    }, 600);
  };

  const handleCertifyBreakGlass = (id: string) => {
    setBreakGlassLogs(prev =>
      prev.map(bg => {
        if (bg.id === id) {
          return { ...bg, postAccessReviewStatus: 'REVIEWED_AND_CERTIFIED' };
        }
        return bg;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center gap-1.5">
                <UserX className="w-3.5 h-3.5 text-purple-400" />
                MAS Notice 655 §4.3 Real-Time IAM Reconciler
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ZERO STANDING PRIVILEGES
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Privilege Creep & "Ghost Account" Sweeper
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl mt-1 leading-relaxed">
              Continuous detection and automated revocation of dormant administrative credentials (&gt;30 days inactive),
              ephemeral Just-In-Time (JIT) Four-Eyes elevation enforcement, and cryptographic break-glass safe auditing.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-950/80 border border-purple-500/30 rounded-xl p-3 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Dormant Accounts Flagged
              </span>
              <div className="text-2xl font-bold font-mono text-purple-300">
                {dormantAccounts.filter(a => a.status === 'DORMANT_FLAGGED').length}
                <span className="text-xs text-rose-400 font-sans ml-1">
                  ({dormantAccounts.filter(a => a.status === 'REVOKED').length} Revoked)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('DORMANT_SWEEPER')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'DORMANT_SWEEPER'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <UserX className="w-4 h-4 text-purple-300" />
            <span>1. 30-Day Dormant Account Sweeper</span>
            {dormantAccounts.filter(a => a.status === 'DORMANT_FLAGGED').length > 0 && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-rose-500/30 text-rose-200">
                {dormantAccounts.filter(a => a.status === 'DORMANT_FLAGGED').length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('JIT_ELEVATION')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'JIT_ELEVATION'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-4 h-4 text-purple-300" />
            <span>2. JIT Ephemeral Elevation Desk (Max 4h)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('BREAK_GLASS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'BREAK_GLASS'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Flame className="w-4 h-4 text-purple-300" />
            <span>3. Break-Glass Safe Immutable Auditor</span>
          </button>
        </div>
      </div>

      {/* TAB 1: DORMANT PRIVILEGE SWEEPER */}
      {activeTab === 'DORMANT_SWEEPER' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-purple-400" />
                  <span>Dormant Privileged Accounts Inactive &gt; 30 Days (CyberArk / Okta / Azure AD)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  MAS Notice 655 §4 mandates prompt de-provisioning of standing administrative credentials upon inactivity
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-800">
              {dormantAccounts.map(account => (
                <div key={account.id} className="p-5 hover:bg-slate-800/40 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="font-mono font-bold text-purple-400">{account.id}</span>
                        <span className="text-slate-500">•</span>
                        <span className="font-bold text-white">{account.username}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                          {account.sourceSystem}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                          {account.standingPrivilegeLevel.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300">
                        Assigned Role: <span className="text-slate-200 font-semibold">{account.roleTitle}</span>
                      </p>

                      <div className="flex items-center gap-3 text-xs text-slate-400 pt-0.5 flex-wrap">
                        <span>Last Active: <strong className="text-rose-400 font-mono">{account.lastActiveDate}</strong></span>
                        <span className="text-slate-600">•</span>
                        <span>FIDO2 Hardware MFA: {account.mfaHardwareEnforced ? '✅ Active' : '❌ Non-Compliant'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                          account.status === 'REVOKED'
                            ? 'bg-slate-800 text-slate-400 border-slate-700'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                        }`}
                      >
                        {account.status === 'REVOKED' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                        <span>{account.status.replace(/_/g, ' ')}</span>
                      </span>

                      {account.status === 'DORMANT_FLAGGED' && (
                        <button
                          type="button"
                          onClick={() => handleRevokeAccount(account.id)}
                          disabled={revokingId === account.id}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 cursor-pointer shadow-md transition-all disabled:opacity-50"
                        >
                          {revokingId === account.id ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>De-provisioning API...</span>
                            </>
                          ) : (
                            <>
                              <UserX className="w-3.5 h-3.5" />
                              <span>Auto-Revoke Access</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: JIT EPHEMERAL ELEVATION DESK */}
      {activeTab === 'JIT_ELEVATION' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Active Just-In-Time (JIT) Ephemeral Elevation Sessions
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                MAXIMUM 4-HOUR TIME-BOUND CAP
              </span>
            </div>

            <div className="space-y-3">
              {jitSessions.map(session => (
                <div
                  key={session.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-purple-400">{session.id}</span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs font-bold text-white">{session.engineerName}</span>
                      <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-slate-900 text-sky-300 border border-slate-700">
                        {session.jiraTicketId}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${
                          session.elevationStatus === 'ACTIVE_ELEVATED'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {session.elevationStatus === 'ACTIVE_ELEVATED' && <Clock className="w-3.5 h-3.5 animate-spin" />}
                        <span>{session.elevationStatus.replace(/_/g, ' ')}</span>
                      </span>

                      {session.elevationStatus === 'ACTIVE_ELEVATED' && (
                        <span className="font-mono text-xs font-bold text-purple-300 bg-purple-950/80 px-2.5 py-1 rounded-lg border border-purple-500/30">
                          {Math.floor(session.minutesRemaining / 60)}h {session.minutesRemaining % 60}m left
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300">
                    Target Resource: <strong className="text-white font-mono">{session.targetResource}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400 italic">
                    Reason: "{session.justification}"
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                    <span>1st Line Approver: <strong className="text-slate-300">{session.firstLineApprover}</strong></span>
                    <span>•</span>
                    <span>2nd Line CISO Approver: <strong className="text-emerald-400">{session.secondLineApprover}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BREAK-GLASS SAFE AUDITOR */}
      {activeTab === 'BREAK_GLASS' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Break-Glass Emergency Safe Immutable Ledger
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Mandatory 24h Post-Access Supervisory Review
              </span>
            </div>

            <div className="divide-y divide-slate-800">
              {breakGlassLogs.map(log => (
                <div key={log.id} className="py-4 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-rose-400">{log.id}</span>
                      <span className="text-xs font-bold text-white">{log.safeName}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{log.timestamp}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Credential Checked Out:</span>
                      <span className="font-mono text-rose-300 font-bold">{log.credentialCheckedOut}</span>
                      <span className="text-slate-400 text-[11px] block mt-0.5">By {log.checkedOutBy}</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Four-Eyes Co-Validator:</span>
                      <span className="text-slate-200 font-semibold">{log.fourEyesValidator}</span>
                      <span className="text-slate-500 text-[10px] font-mono block mt-0.5 truncate">{log.cryptographicSignature}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                          log.postAccessReviewStatus === 'REVIEWED_AND_CERTIFIED'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                        }`}
                      >
                        {log.postAccessReviewStatus.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">Linked: {log.incidentReference}</span>
                    </div>

                    {log.postAccessReviewStatus === 'PENDING_REVIEW' && (
                      <button
                        type="button"
                        onClick={() => handleCertifyBreakGlass(log.id)}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white cursor-pointer shadow-md"
                      >
                        Complete 24h Audit Certification
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
