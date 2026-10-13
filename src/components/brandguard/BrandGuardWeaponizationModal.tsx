// Skanda BrandGuard — Weaponization & Threat Intelligence Modal
// Displays Domain Lifecycle Stage, Weaponization Transitions, Passive DNS History,
// ASN Reputation scorecards, and live State Machine controls.

import React, { useState } from 'react';
import {
  ShieldAlert,
  Server,
  Globe,
  Radio,
  Clock,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  X,
  Zap,
  Activity,
  Network
} from 'lucide-react';
import {
  BrandFinding,
  WeaponizationLifecycleRecord,
  WeaponizationStage,
  EnrichedDnsThreatIntel
} from '../../types/brandguard';
import { BrandGuardWeaponizationService } from '../../services/brandguard/brandguardWeaponizationService';
import { useGRC } from '../../context/GRCContext';

interface BrandGuardWeaponizationModalProps {
  finding: BrandFinding;
  isOpen: boolean;
  onClose: () => void;
  onUpdateFinding?: (updated: BrandFinding) => void;
}

const STAGES: Array<{ id: WeaponizationStage; label: string; number: number; desc: string }> = [
  { id: 'REGISTERED_PARKED', label: 'Registered / Parked', number: 1, desc: 'Dormant threat / parking page / dead NXDOMAIN' },
  { id: 'MX_SPF_CONFIGURED', label: 'MX/SPF Configured', number: 2, desc: 'Active email exchange / BEC hazard' },
  { id: 'LIVE_HTTP_HTTPS', label: 'A/AAAA + HTTPS Active', number: 3, desc: 'Live web host responding with active certificate' },
  { id: 'WEAPONIZED_CREDENTIAL_HARVEST', label: 'Weaponized Harvester', number: 4, desc: 'Active login inputs + cloned brand visuals' }
];

export const BrandGuardWeaponizationModal: React.FC<BrandGuardWeaponizationModalProps> = ({
  finding,
  isOpen,
  onClose,
  onUpdateFinding
}) => {
  const { theme, logAuditEvent } = useGRC();
  const [activeTab, setActiveTab] = useState<'STATE_MACHINE' | 'ASN_REPUTATION' | 'PASSIVE_DNS'>('STATE_MACHINE');
  
  const [weaponization, setWeaponization] = useState<WeaponizationLifecycleRecord>(() =>
    BrandGuardWeaponizationService.computeWeaponizationLifecycle(finding)
  );

  const [dnsIntel] = useState<EnrichedDnsThreatIntel>(() =>
    finding.dnsThreatIntel ||
    BrandGuardWeaponizationService.enrichDnsThreatIntel(
      finding.targetDomain,
      finding.domainIntel.asn,
      finding.domainIntel.asnOrg
    )
  );

  if (!isOpen) return null;

  const handlePromoteStage = (targetStage: WeaponizationStage) => {
    const updatedRecord = BrandGuardWeaponizationService.triggerWeaponizationTransition(
      finding,
      targetStage,
      `Analyst escalated weaponization state to ${targetStage} following continuous surveillance.`
    );
    setWeaponization(updatedRecord);
    
    if (onUpdateFinding) {
      onUpdateFinding({
        ...finding,
        weaponization: updatedRecord
      });
    }

    logAuditEvent(
      'UPDATE',
      'Weaponization State Machine',
      `Shifted domain ${finding.targetDomain} lifecycle state to ${targetStage}. Score: ${updatedRecord.weaponizationScore}`
    );
  };

  const getStageIndex = (stage: WeaponizationStage) => STAGES.findIndex(s => s.id === stage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className={`rounded-2xl border w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden ${
          theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
          theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
        }`}>
          <div className="flex items-center space-x-3.5 min-w-0">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Activity className="w-6 h-6 shrink-0" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                  WEAPONIZATION SCORE: {weaponization.weaponizationScore}/100
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  weaponization.escalationPriority === 'P1_CRITICAL_IMMOBILIZE'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {weaponization.escalationPriority.replace(/_/g, ' ')}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold mt-1 truncate">
                Lifecycle & Threat Intelligence Cross-Correlation: <span className="text-indigo-400 font-mono">{finding.targetDomain}</span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={`flex border-b px-5 text-xs font-semibold space-x-2 ${
          theme === 'light' ? 'bg-slate-100/60 border-slate-200' : 'bg-slate-950/40 border-slate-800'
        }`}>
          {[
            { id: 'STATE_MACHINE', label: 'Weaponization State Machine', icon: Activity },
            { id: 'ASN_REPUTATION', label: 'ASN & Hosting Reputation Scorecard', icon: Server },
            { id: 'PASSIVE_DNS', label: 'Passive DNS & Feeds Cross-Correlation', icon: Network }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 border-b-2 transition-colors flex items-center space-x-1.5 ${
                  active
                    ? 'border-indigo-500 text-indigo-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeTab === 'STATE_MACHINE' && (
            <div className="space-y-6">
              {/* 4-Stage Stepper */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Infrastructure Weaponization Lifecycle Progression
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {STAGES.map((s, idx) => {
                    const isCurrent = weaponization.currentStage === s.id;
                    const isPassed = getStageIndex(weaponization.currentStage) > idx;

                    return (
                      <div
                        key={s.id}
                        className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                          isCurrent
                            ? 'border-rose-500/80 bg-rose-950/20 text-white'
                            : isPassed
                            ? 'border-amber-500/40 bg-amber-950/10 text-slate-300'
                            : 'border-slate-800 bg-slate-900/40 text-slate-500 opacity-60'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold">Stage {s.number}</span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/30 text-rose-300">
                                ACTIVE
                              </span>
                            )}
                            {isPassed && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          </div>
                          <span className="text-xs font-bold block mt-1.5">{s.label}</span>
                          <p className="text-[10px] text-slate-400 mt-1 leading-snug">{s.desc}</p>
                        </div>

                        {!isCurrent && (
                          <button
                            onClick={() => handlePromoteStage(s.id)}
                            className="mt-3 w-full py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 font-semibold"
                          >
                            Set Stage {s.number}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Transition Audit History */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Weaponization State Transition Event Log
                </h4>
                <div className="space-y-2">
                  {weaponization.stateMachineHistory.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 text-xs flex items-start justify-between space-x-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-amber-400">{ev.fromStage}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                          <span className="font-mono font-bold text-rose-400">{ev.toStage}</span>
                          {ev.alertEscalated && (
                            <span className="px-2 py-0.2 rounded text-[10px] bg-rose-500/20 text-rose-300 font-bold">
                              ALERT ESCALATED
                            </span>
                          )}
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">{ev.triggerDescription}</p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">
                        {new Date(ev.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ASN_REPUTATION' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Autonomous System Number (ASN) & Hosting Provider Threat Index
                  </h4>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold border text-[11px] ${
                    dnsIntel.asnScorecard.isBulletproofSuspect
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {dnsIntel.asnScorecard.reputationCategory.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[11px]">ASN & Organization:</span>
                    <span className="text-slate-200 font-bold block mt-0.5">
                      {dnsIntel.asnScorecard.asn} — {dnsIntel.asnScorecard.asnOrg}
                    </span>
                    <span className="text-[10px] text-slate-500">{dnsIntel.asnScorecard.asnCountry}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[11px]">Hosting Abuse Responsiveness:</span>
                    <span className="text-amber-400 font-bold text-base block mt-0.5">
                      {dnsIntel.asnScorecard.hostingAbuseResponsivenessScore}/100
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Avg Takedown MTTR: ~{dnsIntel.asnScorecard.averageTakedownTurnaroundHours}h
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[11px]">Threat Index Score:</span>
                    <span className="text-rose-400 font-bold text-base block mt-0.5">
                      {dnsIntel.asnScorecard.threatIndex}/100
                    </span>
                    <span className="text-[10px] text-slate-400">Bulletproof Network Host</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
                  <span>Designated Abuse Contact: <span className="font-mono text-indigo-300">{dnsIntel.asnScorecard.abuseContactEmail}</span></span>
                  <span>Subnet Prefix: <span className="font-mono text-slate-300">{dnsIntel.asnScorecard.networkPrefix}</span></span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'PASSIVE_DNS' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Passive DNS (pDNS) Resolution History
                </h4>
                <table className="w-full text-left">
                  <thead className="text-slate-500 border-b border-slate-800">
                    <tr>
                      <th className="pb-2">Type</th>
                      <th className="pb-2">Resolved Value</th>
                      <th className="pb-2">TTL</th>
                      <th className="pb-2">First Seen</th>
                      <th className="pb-2 text-right">Last Seen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {dnsIntel.passiveDnsHistory.map((rec, i) => (
                      <tr key={i}>
                        <td className="py-2 text-indigo-400 font-bold">{rec.recordType}</td>
                        <td className="py-2 text-slate-200">{rec.value}</td>
                        <td className="py-2 text-slate-500">{rec.ttl}s</td>
                        <td className="py-2 text-slate-400">{new Date(rec.firstSeen).toLocaleDateString()}</td>
                        <td className="py-2 text-slate-400 text-right">{new Date(rec.lastSeen).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Threat Feed Cross-Correlations */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Threat Feed Correlation Matched Sources
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {dnsIntel.threatFeedMatches.map((feed, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between"
                    >
                      <span className="font-bold text-slate-300">{feed.source.replace(/_/g, ' ')}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        feed.listed
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {feed.listed ? `LISTED (${feed.confidence}%)` : 'CLEAN'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
