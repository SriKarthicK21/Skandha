import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Flame,
  Target,
  Crosshair,
  Lock,
  Key,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronRight,
  FileCheck,
  Check,
  Send,
  Layers,
  Sparkles,
  ArrowRight,
  Activity
} from 'lucide-react';

export interface MitreTacticCoverage {
  tacticId: string;
  tacticName: string;
  masDomainRef: string;
  totalTechniques: number;
  testedTechniques: number;
  detectionCoveragePct: number;
  coverageStatus: 'ROBUST' | 'ADEQUATE' | 'GAP_IDENTIFIED';
  keyTechnique: string;
}

export interface RedTeamCapaFinding {
  id: string;
  title: string;
  scenarioName: string;
  cbestTiberRef: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  masDomainCode: string;
  masDomainName: string;
  findingSummary: string;
  rootCause: string;
  remediationPlan: string;
  targetCompletionDate: string;
  status: 'PENDING_1ST_LINE' | 'AWAITING_2ND_LINE' | 'AWAITING_3RD_LINE' | 'CLOSED_VERIFIED';
  firstLineSignoff?: { name: string; timestamp: string; hashSignature: string };
  secondLineSignoff?: { name: string; timestamp: string; hashSignature: string };
  thirdLineSignoff?: { name: string; timestamp: string; hashSignature: string };
}

export const ThreatInformedDefenseCAPADesk: React.FC = () => {
  // MITRE ATT&CK Mapping
  const [mitreTactics] = useState<MitreTacticCoverage[]>([
    {
      tacticId: 'TA0001',
      tacticName: 'Initial Access',
      masDomainRef: 'Domain 09 (Network Security) & Domain 10 (IAM)',
      totalTechniques: 9,
      testedTechniques: 9,
      detectionCoveragePct: 100,
      coverageStatus: 'ROBUST',
      keyTechnique: 'T1190 - Exploit Public-Facing App'
    },
    {
      tacticId: 'TA0006',
      tacticName: 'Credential Access',
      masDomainRef: 'Domain 10 (Access Control - Notice 655 §4)',
      totalTechniques: 15,
      testedTechniques: 14,
      detectionCoveragePct: 93,
      coverageStatus: 'ROBUST',
      keyTechnique: 'T1558 - Steal Kerberos Tickets'
    },
    {
      tacticId: 'TA0008',
      tacticName: 'Lateral Movement',
      masDomainRef: 'Domain 09 (Micro-segmentation & Zero Trust)',
      totalTechniques: 9,
      testedTechniques: 7,
      detectionCoveragePct: 78,
      coverageStatus: 'ADEQUATE',
      keyTechnique: 'T1021 - Remote Services (SSH/RDP)'
    },
    {
      tacticId: 'TA0010',
      tacticName: 'Exfiltration',
      masDomainRef: 'Domain 11 (Cryptography & Data Protection)',
      totalTechniques: 9,
      testedTechniques: 6,
      detectionCoveragePct: 67,
      coverageStatus: 'GAP_IDENTIFIED',
      keyTechnique: 'T1048 - Exfiltration Over Alternative Protocol'
    },
    {
      tacticId: 'TA0040',
      tacticName: 'Impact / Denial of Service',
      masDomainRef: 'Domain 12 (Cyber Incident Mgmt - Notice 644)',
      totalTechniques: 13,
      testedTechniques: 12,
      detectionCoveragePct: 92,
      coverageStatus: 'ROBUST',
      keyTechnique: 'T1498 - Network Denial of Service'
    }
  ]);

  // Red Team Findings & CAPA Desk
  const [findings, setFindings] = useState<RedTeamCapaFinding[]>([
    {
      id: 'CAPA-2026-01',
      title: 'Active Directory Kerberoasting Privilege Escalation Vector',
      scenarioName: 'Scenario 3: Compromised Remote Vendor Workstation',
      cbestTiberRef: 'TIBER-SG-2026-RT-01',
      severity: 'CRITICAL',
      masDomainCode: 'MAS-AM',
      masDomainName: 'Domain 10: Access Control & IAM',
      findingSummary: 'Adversary leveraged legacy SPN accounts without AES encryption to crack service account hashes and impersonate domain admin.',
      rootCause: 'Legacy service accounts configured with weak RC4 kerberos encryption keys.',
      remediationPlan: 'Migrated all service accounts to Group Managed Service Accounts (gMSA) with mandatory AES-256 Kerberos encryption.',
      targetCompletionDate: '2026-09-30',
      status: 'AWAITING_2ND_LINE',
      firstLineSignoff: {
        name: 'Lead Identity Engineer (1st Line)',
        timestamp: '2026-09-22 14:10 SGT',
        hashSignature: 'SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'
      }
    },
    {
      id: 'CAPA-2026-02',
      title: 'Sub-Domain DNS Takeover Vulnerability on Decommissioned Microservice',
      scenarioName: 'Scenario 1: External Perimeter Infiltration',
      cbestTiberRef: 'TIBER-SG-2026-RT-02',
      severity: 'HIGH',
      masDomainCode: 'MAS-NW',
      masDomainName: 'Domain 09: Network Security',
      findingSummary: 'Dangling CNAME record pointing to an unclaimed cloud storage container allowed adversary to host rogue login page.',
      rootCause: 'Lack of automated DNS garbage collection in CI/CD cloud teardown pipeline.',
      remediationPlan: 'Implemented Route53 automated terraform lifecycle hooks that purge CNAME records immediately on bucket destruction.',
      targetCompletionDate: '2026-10-15',
      status: 'CLOSED_VERIFIED',
      firstLineSignoff: {
        name: 'Cloud Platform Architect (1st Line)',
        timestamp: '2026-09-18 10:00 SGT',
        hashSignature: 'SHA256:4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a'
      },
      secondLineSignoff: {
        name: 'Head of Technology Risk (2nd Line)',
        timestamp: '2026-09-19 16:30 SGT',
        hashSignature: 'SHA256:ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d'
      },
      thirdLineSignoff: {
        name: 'Director of Internal Audit (3rd Line)',
        timestamp: '2026-09-20 11:15 SGT',
        hashSignature: 'SHA256:8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4'
      }
    }
  ]);

  const [selectedFinding, setSelectedFinding] = useState<RedTeamCapaFinding>(findings[0]);
  const [signingSuccess, setSigningSuccess] = useState<boolean>(false);

  // Sign off workflow simulation for 2nd or 3rd Line
  const handleExecuteSignoff = (role: '2ND_LINE' | '3RD_LINE') => {
    setSigningSuccess(true);
    setTimeout(() => {
      setFindings((prev) =>
        prev.map((f) => {
          if (f.id !== selectedFinding.id) return f;
          if (role === '2ND_LINE') {
            return {
              ...f,
              status: 'AWAITING_3RD_LINE',
              secondLineSignoff: {
                name: 'Head of Technology Risk Officer (2nd Line)',
                timestamp: `Today at ${new Date().toLocaleTimeString('en-GB')}`,
                hashSignature: `SHA256:${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`
              }
            };
          } else {
            return {
              ...f,
              status: 'CLOSED_VERIFIED',
              thirdLineSignoff: {
                name: 'Lead Supervisory Auditor (3rd Line)',
                timestamp: `Today at ${new Date().toLocaleTimeString('en-GB')}`,
                hashSignature: `SHA256:${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`
              }
            };
          }
        })
      );

      setSelectedFinding((prev) => {
        if (role === '2ND_LINE') {
          return {
            ...prev,
            status: 'AWAITING_3RD_LINE',
            secondLineSignoff: {
              name: 'Head of Technology Risk Officer (2nd Line)',
              timestamp: `Today at ${new Date().toLocaleTimeString('en-GB')}`,
              hashSignature: `SHA256:${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`
            }
          };
        } else {
          return {
            ...prev,
            status: 'CLOSED_VERIFIED',
            thirdLineSignoff: {
              name: 'Lead Supervisory Auditor (3rd Line)',
              timestamp: `Today at ${new Date().toLocaleTimeString('en-GB')}`,
              hashSignature: `SHA256:${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`
            }
          };
        }
      });

      setSigningSuccess(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/40 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                <Target className="w-3.5 h-3.5 text-purple-400" />
                MAS TRM §12 &amp; TIBER-SG / CBEST FRAMEWORK
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                MITRE ATT&CK Matrix Mapped
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400">
                3-Lines of Defence (3LoD) Cryptographic CAPA
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Threat-Informed Defense &amp; Red Team Remediation Desk</span>
            </h3>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Maps MAS TRM technical controls against real-world adversary tactics from the MITRE ATT&amp;CK framework. Tracks intelligence-led penetration testing (TIBER-SG) findings with cryptographic multi-tier sign-offs from System Owners (1st Line), Tech Risk (2nd Line), and Internal Audit (3rd Line).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-500/40">
              Coverage: 86.4% MITRE Tested
            </span>
          </div>
        </div>
      </div>

      {/* MITRE ATT&CK Matrix Coverage Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-purple-400" />
              <span>MITRE ATT&amp;CK Adversary Tactics vs. MAS TRM Control Coverage</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Empirical validation of detection rules and technical controls across the cyber attack lifecycle.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">5 Enterprise Tactics Mapped</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {mitreTactics.map((tactic) => (
            <div
              key={tactic.tacticId}
              className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2 relative"
            >
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-mono text-purple-300 font-bold">{tactic.tacticId}</span>
                <span className={`px-1.5 py-0.2 rounded font-bold ${
                  tactic.coverageStatus === 'ROBUST'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : tactic.coverageStatus === 'ADEQUATE'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {tactic.detectionCoveragePct}%
                </span>
              </div>

              <div>
                <h5 className="text-xs font-bold text-white">{tactic.tacticName}</h5>
                <span className="text-[10px] text-slate-400 block mt-0.5">{tactic.masDomainRef}</span>
              </div>

              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    tactic.coverageStatus === 'ROBUST' ? 'bg-emerald-500' : tactic.coverageStatus === 'ADEQUATE' ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${tactic.detectionCoveragePct}%` }}
                />
              </div>

              <div className="text-[9.5px] text-slate-500 pt-1 border-t border-slate-800/80 truncate">
                Key: {tactic.keyTechnique}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Red Team CAPA Tickets & 3LoD Sign-Off Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: CAPA Findings List */}
        <div className="space-y-3 lg:col-span-2">
          {findings.map((f) => {
            const isSelected = f.id === selectedFinding.id;
            return (
              <div
                key={f.id}
                onClick={() => setSelectedFinding(f)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-purple-500 ring-1 ring-purple-500/50 shadow-lg'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-purple-300 border border-slate-700">
                        {f.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        f.severity === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {f.severity}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {f.cbestTiberRef}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white pt-1">{f.title}</h4>
                    <p className="text-xs text-slate-300 line-clamp-2">{f.findingSummary}</p>
                  </div>

                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase shrink-0 ${
                    f.status === 'CLOSED_VERIFIED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : f.status === 'AWAITING_3RD_LINE'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {f.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Sign-off progress indicators */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 mt-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-slate-300 text-[11px]">1st Line (Engineered)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {f.secondLineSignoff ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                    <span className="text-slate-300 text-[11px]">2nd Line (Risk Attested)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {f.thirdLineSignoff ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    )}
                    <span className="text-slate-300 text-[11px]">3rd Line (Audit Sealed)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Finding Cryptographic 3LoD Sign-Off Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <span className="text-xs font-mono font-bold text-purple-400 block uppercase tracking-wider">
              CAPA Detail &bull; {selectedFinding.id}
            </span>
            <h4 className="text-sm font-bold text-white mt-1">{selectedFinding.title}</h4>
            <span className="text-xs text-slate-400 font-mono mt-0.5 block">{selectedFinding.masDomainName}</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Remediation Action Executed:</span>
              <p className="text-slate-200 leading-relaxed text-[11px]">{selectedFinding.remediationPlan}</p>
            </div>

            {/* 3LoD Signatures Ledger */}
            <div className="space-y-2">
              <span className="text-[10.5px] uppercase font-bold text-slate-400 block tracking-wider">
                Cryptographic 3LoD Sign-Offs
              </span>

              {/* 1st Line */}
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px]">1st Line: {selectedFinding.firstLineSignoff?.name}</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                </div>
                <div className="text-[9.5px] font-mono text-cyan-300 truncate">
                  {selectedFinding.firstLineSignoff?.hashSignature}
                </div>
              </div>

              {/* 2nd Line */}
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px]">
                    2nd Line: {selectedFinding.secondLineSignoff?.name || 'Pending Sign-Off'}
                  </span>
                  {selectedFinding.secondLineSignoff ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Clock className="w-3 h-3 text-amber-400" />
                  )}
                </div>
                {selectedFinding.secondLineSignoff && (
                  <div className="text-[9.5px] font-mono text-cyan-300 truncate">
                    {selectedFinding.secondLineSignoff.hashSignature}
                  </div>
                )}
              </div>

              {/* 3rd Line */}
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px]">
                    3rd Line: {selectedFinding.thirdLineSignoff?.name || 'Pending Audit Verification'}
                  </span>
                  {selectedFinding.thirdLineSignoff ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Clock className="w-3 h-3 text-slate-500" />
                  )}
                </div>
                {selectedFinding.thirdLineSignoff && (
                  <div className="text-[9.5px] font-mono text-cyan-300 truncate">
                    {selectedFinding.thirdLineSignoff.hashSignature}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons based on status */}
            {selectedFinding.status === 'AWAITING_2ND_LINE' && (
              <button
                type="button"
                onClick={() => handleExecuteSignoff('2ND_LINE')}
                disabled={signingSuccess}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Key className="w-4 h-4 text-purple-200" />
                <span>Execute 2nd Line (Tech Risk) Sign-Off</span>
              </button>
            )}

            {selectedFinding.status === 'AWAITING_3RD_LINE' && (
              <button
                type="button"
                onClick={() => handleExecuteSignoff('3RD_LINE')}
                disabled={signingSuccess}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>Execute 3rd Line (Internal Audit) Final Closure</span>
              </button>
            )}

            {selectedFinding.status === 'CLOSED_VERIFIED' && (
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center text-xs text-emerald-300 font-semibold">
                &check; Fully Attested Across All 3 Lines of Defence (Closed)
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
