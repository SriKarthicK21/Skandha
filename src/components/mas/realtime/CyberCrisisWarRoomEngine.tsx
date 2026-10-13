import React, { useState, useEffect } from 'react';
import {
  Flame,
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  Clock,
  Activity,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Server,
  Database,
  ArrowRight,
  ExternalLink,
  Lock,
  Send,
  Sparkles,
  Users2,
  FileCheck2,
  Scale
} from 'lucide-react';

export type DrillScenarioId = 'DUAL_DC_RANSOMWARE' | 'MEPS_PAYMENT_HIJACK' | 'SUPPLY_CHAIN_ZERO_DAY';

export interface FailoverStep {
  id: string;
  stepNumber: number;
  title: string;
  category: 'DNS_NETWORK' | 'DATABASE_DATA' | 'PAYMENT_CORE' | 'VALIDATION';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  durationSec: number;
  rpoImpactMinutes: number;
  description: string;
}

export const CyberCrisisWarRoomEngine: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<DrillScenarioId>('DUAL_DC_RANSOMWARE');
  const [drillActive, setDrillActive] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(1420); // 23 minutes 40 seconds into drill
  const [oneHourNotificationSecondsRemaining, setOneHourNotificationSecondsRemaining] = useState(2180); // 36m 20s left of 3600s
  const [activeCommanderRole, setActiveCommanderRole] = useState<'INCIDENT_COMMANDER' | 'HEAD_IT_RISK' | 'GENERAL_COUNSEL' | 'CHIEF_COMMS'>('INCIDENT_COMMANDER');
  
  // Ransomware Extortion Decision Tree State
  const [ransomNegotiationBlocked, setRansomNegotiationBlocked] = useState(true);
  const [immutableBackupVerified, setImmutableBackupVerified] = useState(true);

  // Failover Steps
  const [failoverSteps, setFailoverSteps] = useState<FailoverStep[]>([
    {
      id: 'FO-01',
      stepNumber: 1,
      title: 'Quarantine Primary Data Center (Changi DC Network Sever)',
      category: 'DNS_NETWORK',
      status: 'COMPLETED',
      durationSec: 120,
      rpoImpactMinutes: 0,
      description: 'Border Gateway Protocol (BGP) route withdrawal and firewall port isolation.'
    },
    {
      id: 'FO-02',
      stepNumber: 2,
      title: 'DNS Anycast Traffic Redirection to Secondary DC (Jurong West)',
      category: 'DNS_NETWORK',
      status: 'COMPLETED',
      durationSec: 180,
      rpoImpactMinutes: 0,
      description: 'Cloudflare / Route53 health checks failed; traffic rerouted to DR load balancers.'
    },
    {
      id: 'FO-03',
      stepNumber: 3,
      title: 'PostgreSQL Aurora Global Database Primary Promotion',
      category: 'DATABASE_DATA',
      status: 'COMPLETED',
      durationSec: 310,
      rpoImpactMinutes: 0.2, // 12 seconds replication lag
      description: 'Secondary cluster promoted to read-write master; transaction journals verified clean.'
    },
    {
      id: 'FO-04',
      stepNumber: 4,
      title: 'MEPS+ & FAST Payment Gateway Journal Reconciliation',
      category: 'PAYMENT_CORE',
      status: 'IN_PROGRESS',
      durationSec: 420,
      rpoImpactMinutes: 0.5,
      description: 'Reconciling pending interbank clearing messages with MAS payment gateway.'
    },
    {
      id: 'FO-05',
      stepNumber: 5,
      title: 'End-to-End Synthetic Transaction Verification & Sign-off',
      category: 'VALIDATION',
      status: 'PENDING',
      durationSec: 300,
      rpoImpactMinutes: 0,
      description: 'Automated Playwright smoke test suite validating customer retail & corporate flows.'
    }
  ]);

  // Timer loop when drill is active
  useEffect(() => {
    let interval: any;
    if (drillActive) {
      interval = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
        setOneHourNotificationSecondsRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [drillActive]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSimulateStepCompletion = (stepId: string) => {
    setFailoverSteps(prev =>
      prev.map(s => {
        if (s.id === stepId) {
          return { ...s, status: 'COMPLETED' };
        }
        return s;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-rose-500/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-400/30 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                MAS TRM §13 Cyber Crisis War Room
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                NOTICE 644 / 655 LIVE DRILL
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Cyber Incident Command Center & BCP/DR Simulator
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl mt-1 leading-relaxed">
              Real-time exercise console for Industry-Wide Exercises (IWE). Simulates catastrophic ransomware lockout,
              dual-site datacenter failover verification, statutory 1-hour MAS notification timer, and anti-extortion legal compliance.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Countdown to MAS 1-Hour Notification */}
            <div className="bg-slate-950/90 border border-rose-500/50 rounded-xl p-3 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Statutory 1-Hour MAS SLA
              </span>
              <div className="text-2xl font-bold font-mono text-rose-400 flex items-center justify-end gap-1.5">
                <Clock className="w-4 h-4 animate-spin" />
                <span>{formatTimer(oneHourNotificationSecondsRemaining)}</span>
              </div>
              <span className="text-[9.5px] text-slate-400 block mt-0.5">Mandatory Initial Notification</span>
            </div>

            <button
              type="button"
              onClick={() => setDrillActive(!drillActive)}
              className={`px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg transition-all ${
                drillActive
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
              }`}
            >
              {drillActive ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause Drill</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Resume Drill</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Commander Role Switcher */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80 overflow-x-auto pb-1">
          <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider mr-1">Commander Lens:</span>
          {(
            [
              { id: 'INCIDENT_COMMANDER', label: 'Incident Commander (CIO/CISO)' },
              { id: 'HEAD_IT_RISK', label: 'Head of IT Risk (2LoD)' },
              { id: 'GENERAL_COUNSEL', label: 'General Counsel (Legal/TSOFA)' },
              { id: 'CHIEF_COMMS', label: 'Chief Communications Officer' }
            ] as const
          ).map(role => (
            <button
              key={role.id}
              type="button"
              onClick={() => setActiveCommanderRole(role.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCommanderRole === role.id
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {role.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Extortion Decision Tree vs Dual-Site Failover Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Extortion & Ransomware Decision Matrix */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Extortion & Ransomware Legal Decision Matrix
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
              STRICTLY PROHIBITED
            </span>
          </div>

          {/* Statutory Legal Disclaimer Banner */}
          <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-4 text-xs text-rose-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-300">
              <AlertOctagon className="w-4 h-4 shrink-0 text-rose-400" />
              <span>Singapore Statutory Anti-Extortion Mandate</span>
            </div>
            <p className="leading-relaxed opacity-90">
              Under Singapore's <strong>Terrorism (Suppression of Financing) Act (TSOFA)</strong> and the{' '}
              <strong>Corruption, Drug Trafficking and Other Serious Crimes Act (CDSA)</strong>, payment of ransoms to cyber
              criminals or sanctioned entities carries direct criminal liability. Board policy and MAS TRM 13 mandate{' '}
              <strong>zero ransom payments</strong> with recovery executing strictly from air-gapped immutable backups.
            </p>
          </div>

          {/* Decision Tree Verification Steps */}
          <div className="space-y-3 pt-2">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white">1. Ransom Negotiation Demand Protocol</span>
                <p className="text-[11px] text-slate-400">Ransomware gang demand: 45 BTC (~S$ 4.8M) for decryption key</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                BLOCKED BY LEGAL
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white">2. Immutable Air-Gapped Backup Viability</span>
                <p className="text-[11px] text-slate-400">AWS S3 Object Lock (WORM) + Veeam Hardened Linux Repository</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>100% UNCOMPROMISED</span>
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white">3. Clean Metal Active Directory Rebuild</span>
                <p className="text-[11px] text-slate-400">Zero Trust Forest recovery from offline cryptographic seed</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                ACTIVE REBUILD
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: Dual-Site Failover Execution Tracker */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Dual-Site Failover Execution Tracker (Changi $\to$ Jurong)
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">RTO Elapsed:</span>
              <span className="font-mono font-bold text-emerald-400">{formatTimer(secondsElapsed)} / 4h Cap</span>
            </div>
          </div>

          {/* RTO / RPO Live Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Recovery Time Objective (RTO)</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold font-mono text-emerald-400">23m 40s</span>
                <span className="text-xs text-slate-400">vs &le; 4.0 hrs (Notice 644)</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1 mt-2">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: '9.8%' }} />
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Recovery Point Objective (RPO)</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold font-mono text-cyan-400">12 seconds</span>
                <span className="text-xs text-slate-400">vs &le; 15 mins</span>
              </div>
              <span className="text-[10px] text-emerald-400 block mt-1">Zero data loss on settlement transactions</span>
            </div>
          </div>

          {/* Failover Steps List */}
          <div className="space-y-2.5 pt-1">
            {failoverSteps.map(step => (
              <div
                key={step.id}
                className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-slate-500">#{step.stepNumber}</span>
                    <span className="text-xs font-bold text-white">{step.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{step.description}</p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                      step.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : step.status === 'IN_PROGRESS'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {step.status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3" />}
                    {step.status === 'IN_PROGRESS' && <Activity className="w-3 h-3 animate-spin" />}
                    <span>{step.status.replace(/_/g, ' ')}</span>
                  </span>

                  {step.status === 'IN_PROGRESS' && (
                    <button
                      type="button"
                      onClick={() => handleSimulateStepCompletion(step.id)}
                      className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold cursor-pointer"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
