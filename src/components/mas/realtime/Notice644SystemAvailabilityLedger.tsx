import React, { useState } from 'react';
import {
  Clock,
  AlertTriangle,
  ShieldAlert,
  Server,
  Activity,
  FileText,
  Copy,
  Check,
  Download,
  Flame,
  CheckCircle2,
  Calendar,
  Building2,
  PhoneCall,
  Send,
  Eye,
  ArrowRight,
  TrendingDown,
  Sparkles
} from 'lucide-react';

export interface CriticalSystemService {
  id: string;
  name: string;
  cisClassification: 'TIER_1_CRITICAL' | 'TIER_2_ESSENTIAL';
  description: string;
  uptimePctRolling12M: number;
  consumedDowntimeMinutes: number;
  maxAllowedDowntimeMinutes: number; // 240 mins (4 hours)
  activeStatus: 'HEALTHY' | 'DEGRADED' | 'OUTAGE';
  rtoMinutes: number; // Recovery Time Objective (≤ 4 hours)
  rpoMinutes: number; // Recovery Point Objective (≤ 15 mins)
  drSiteLocation: string;
  lastDrExerciseDate: string;
  incidentHistoryCount: number;
}

export interface IncidentNotificationDraft {
  templateType: 'TEMPLATE_A_1_HOUR' | 'TEMPLATE_B_14_DAYS';
  incidentRef: string;
  criticalSystemName: string;
  outageStartTime: string;
  discoveryTime: string;
  masNotificationDeadline: string;
  affectedServices: string;
  estimatedCustomerImpact: string;
  interimWorkaround: string;
  leadInvestigator: string;
  masEscalationDesk: string;
  rootCauseSummary?: string;
  preventativeCapa?: string;
}

export const Notice644SystemAvailabilityLedger: React.FC = () => {
  const [criticalSystems, setCriticalSystems] = useState<CriticalSystemService[]>([
    {
      id: 'CIS-01',
      name: 'Core Banking Ledger & Transaction Switch (MEPS+)',
      cisClassification: 'TIER_1_CRITICAL',
      description: 'Primary customer deposits, interbank settlement, and FAST clearing system.',
      uptimePctRolling12M: 99.992,
      consumedDowntimeMinutes: 38,
      maxAllowedDowntimeMinutes: 240,
      activeStatus: 'HEALTHY',
      rtoMinutes: 120, // 2 hours
      rpoMinutes: 5,   // 5 minutes
      drSiteLocation: 'Equinix SG3 (Changi South)',
      lastDrExerciseDate: '2026-06-15 (Passed)',
      incidentHistoryCount: 1
    },
    {
      id: 'CIS-02',
      name: 'Retail Internet & Mobile Banking Gateway',
      cisClassification: 'TIER_1_CRITICAL',
      description: 'Public-facing authenticated portal for 1.4M active retail bank accounts.',
      uptimePctRolling12M: 99.985,
      consumedDowntimeMinutes: 72,
      maxAllowedDowntimeMinutes: 240,
      activeStatus: 'HEALTHY',
      rtoMinutes: 180,
      rpoMinutes: 10,
      drSiteLocation: 'Telstra Data Center SG1',
      lastDrExerciseDate: '2026-05-20 (Passed)',
      incidentHistoryCount: 2
    },
    {
      id: 'CIS-03',
      name: 'Real-Time PayNow Instant Clearing Gateway',
      cisClassification: 'TIER_1_CRITICAL',
      description: 'Peer-to-peer and corporate national proxy payment engine.',
      uptimePctRolling12M: 99.998,
      consumedDowntimeMinutes: 12,
      maxAllowedDowntimeMinutes: 240,
      activeStatus: 'HEALTHY',
      rtoMinutes: 60,
      rpoMinutes: 0,
      drSiteLocation: 'AWS Singapore Multi-AZ (ap-southeast-1)',
      lastDrExerciseDate: '2026-07-02 (Passed)',
      incidentHistoryCount: 0
    },
    {
      id: 'CIS-04',
      name: 'Institutional FX Trading & Treasury Settlement Engine',
      cisClassification: 'TIER_2_ESSENTIAL',
      description: 'Capital markets foreign exchange and liquidity management node.',
      uptimePctRolling12M: 99.970,
      consumedDowntimeMinutes: 114,
      maxAllowedDowntimeMinutes: 240,
      activeStatus: 'HEALTHY',
      rtoMinutes: 240,
      rpoMinutes: 15,
      drSiteLocation: 'Racks Central SG1',
      lastDrExerciseDate: '2026-04-10 (Passed)',
      incidentHistoryCount: 2
    }
  ]);

  const [selectedSystem, setSelectedSystem] = useState<CriticalSystemService>(criticalSystems[0]);
  const [activeTemplate, setActiveTemplate] = useState<'TEMPLATE_A' | 'TEMPLATE_B'>('TEMPLATE_A');
  const [copiedDraft, setCopiedDraft] = useState<boolean>(false);
  const [isSimulatingOutage, setIsSimulatingOutage] = useState<boolean>(false);

  // Downtime Budget calculations across the selected system
  const remainingMinutes = selectedSystem.maxAllowedDowntimeMinutes - selectedSystem.consumedDowntimeMinutes;
  const budgetConsumedPct = Math.round((selectedSystem.consumedDowntimeMinutes / selectedSystem.maxAllowedDowntimeMinutes) * 100);
  const isBudgetCritical = remainingMinutes < 60;

  // Simulate an unscheduled 18-minute outage
  const handleSimulateOutage = () => {
    setIsSimulatingOutage(true);
    setTimeout(() => {
      setCriticalSystems((prev) =>
        prev.map((sys) =>
          sys.id === selectedSystem.id
            ? {
                ...sys,
                consumedDowntimeMinutes: sys.consumedDowntimeMinutes + 18,
                activeStatus: 'DEGRADED',
                incidentHistoryCount: sys.incidentHistoryCount + 1
              }
            : sys
        )
      );

      setSelectedSystem((prev) => ({
        ...prev,
        consumedDowntimeMinutes: prev.consumedDowntimeMinutes + 18,
        activeStatus: 'DEGRADED',
        incidentHistoryCount: prev.incidentHistoryCount + 1
      }));

      setIsSimulatingOutage(false);
    }, 600);
  };

  const handleRecoverOutage = () => {
    setCriticalSystems((prev) =>
      prev.map((sys) =>
        sys.id === selectedSystem.id ? { ...sys, activeStatus: 'HEALTHY' } : sys
      )
    );
    setSelectedSystem((prev) => ({ ...prev, activeStatus: 'HEALTHY' }));
  };

  // Pre-compiled MAS Notice 644 Regulatory Notice Drafts
  const generateTemplateA = (): string => {
    return `================================================================================
MAS NOTICE 644: STATUTORY 1-HOUR INITIAL INCIDENT NOTIFICATION
[CONFIDENTIAL - FOR SUPERVISORY SUBMISSION TO MONETARY AUTHORITY OF SINGAPORE]
================================================================================
Date of Report       : ${new Date().toISOString()}
Supervisory Target   : Technology Risk Supervision Division, MAS (techrisk@mas.gov.sg)
Reporting Entity     : Global Financial Services Singapore Pte Ltd (MAS License #CMS-10024)
Incident Reference   : MAS-NOT644-${new Date().getFullYear()}-${selectedSystem.id}

1. CRITICAL SYSTEM IDENTIFICATION
- Designated CIS Name: ${selectedSystem.name}
- Supervisory Tier   : ${selectedSystem.cisClassification}
- Primary Site       : Singapore Production Hub
- DR Site Recovery   : ${selectedSystem.drSiteLocation}

2. OUTAGE TELEMETRY & DOWNTIME CONSUMPTION
- Incident Inception : Today, 09:14 SGT
- Discovery Time     : Today, 09:16 SGT (Alerted by Synthetic Telemetry)
- 1-Hour MAS Deadline: Today, 10:16 SGT [ON TIME - STATUTORY REQUIREMENT MET]
- Duration Consumed  : ${selectedSystem.consumedDowntimeMinutes} Minutes / 240 Max Allowed (Rolling 12M)
- Remaining Budget   : ${remainingMinutes} Minutes remaining

3. INITIAL IMPACT & FINANCIAL SERVICES EFFECT
- Public Availability: Degraded routing on interbank settlement queues.
- Secondary Failover : Automated load diversion to secondary standby node initiated.
- Customer Impact    : Transactions queued for asynchronous clearing. No loss of ledger state.

4. EMERGENCY ACTIONS & ESCALATION CONTACTS
- Lead Incident Commander: Head of Infrastructure Engineering (+65 6812 0001)
- 2nd Line Risk Officer  : Head of Technology Risk & Compliance (+65 6812 0002)
- Next Supervisory Update: Formal 24-hour situation report will follow.
================================================================================`;
  };

  const generateTemplateB = (): string => {
    return `================================================================================
MAS NOTICE 644: STATUTORY 14-DAY ROOT-CAUSE INVESTIGATION REPORT
[CONFIDENTIAL - FORMAL POST-MORTEM DOSSIER TO MONETARY AUTHORITY OF SINGAPORE]
================================================================================
Date of Report       : ${new Date().toISOString()}
Supervisory Target   : Executive Director, Technology Risk Supervision, MAS
Reporting Entity     : Global Financial Services Singapore Pte Ltd
Incident Reference   : MAS-NOT644-${new Date().getFullYear()}-${selectedSystem.id}

1. EXECUTIVE SUMMARY & POST-INCIDENT CHRONOLOGY
On ${selectedSystem.lastDrExerciseDate.split(' ')[0]}, ${selectedSystem.name} experienced an unscheduled availability degradation resulting in ${selectedSystem.consumedDowntimeMinutes} minutes downtime. The total downtime consumed for this Critical System across the rolling 12-month period stands at ${selectedSystem.consumedDowntimeMinutes} minutes, remaining within the statutory 240-minute limit under Notice 644 §4.

2. ROOT CAUSE ANALYSIS (RCA)
- Direct Cause       : Edge gateway BGP route flap coupled with deadlock in TLS session cache.
- Root Vulnerability : Timeout parameters between API gateway and primary HSM signing cluster.
- Recovery Mechanism : High-Availability failover to secondary hot standby completed in 14 minutes.

3. PREVENTATIVE & CORRECTIVE ACTION PLAN (CAPA)
- CAPA-01: Re-engineered API gateway routing timeouts with exponential backoff [COMPLETED].
- CAPA-02: Validated dual-site active-active database synchronisation [VERIFIED BY AUDIT].
- CAPA-03: Board Risk Committee briefing conducted on ${new Date().toLocaleDateString('en-GB')}.

4. AUDIT & BOARD SIGN-OFF
- Chief Information Officer (1st Line): Verified & Closed
- Chief Risk Officer (2nd Line)       : Concurred & Attested
- Internal Audit Director (3rd Line)  : Signed for Board Record
================================================================================`;
  };

  const handleCopyDraft = () => {
    const text = activeTemplate === 'TEMPLATE_A' ? generateTemplateA() : generateTemplateB();
    navigator.clipboard.writeText(text);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-rose-500/40 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                MAS NOTICE 644 STATUTORY DOWNTIME BUDGET
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Max 4 Hours / 12-Month Rolling Period
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400">
                1-Hour Mandatory Regulatory Notification
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Notice 644 Critical Systems Availability & Downtime Ledger</span>
            </h3>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Monitors unscheduled outages across all designated Critical Information Systems (CIS). Enforces the statutory 240-minute rolling budget limit and provides one-click generation of the formal 1-hour initial MAS notification and 14-day root-cause report.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {selectedSystem.activeStatus === 'HEALTHY' ? (
              <button
                type="button"
                onClick={handleSimulateOutage}
                disabled={isSimulatingOutage}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white flex items-center gap-2 shadow-lg shadow-rose-950/50 transition-all cursor-pointer disabled:opacity-50"
              >
                <Flame className={`w-4 h-4 ${isSimulatingOutage ? 'animate-spin' : 'text-amber-200'}`} />
                <span>Simulate Unscheduled Outage (+18m)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRecoverOutage}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>Restore Critical System to Healthy</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Critical System Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {criticalSystems.map((sys) => {
          const isSelected = sys.id === selectedSystem.id;
          const isWarning = sys.consumedDowntimeMinutes > 120;
          return (
            <div
              key={sys.id}
              onClick={() => setSelectedSystem(sys)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-slate-900 border-rose-500 ring-1 ring-rose-500/50 shadow-lg'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">
                  {sys.id}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[9.5px] font-bold ${
                    sys.activeStatus === 'HEALTHY'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-pulse'
                  }`}
                >
                  {sys.activeStatus}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white line-clamp-1">{sys.name}</h4>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{sys.description}</p>

              {/* Mini Downtime Gauge */}
              <div className="pt-3 border-t border-slate-800/80 mt-3 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Consumed:</span>
                  <span className={`font-mono font-bold ${isWarning ? 'text-rose-400' : 'text-slate-200'}`}>
                    {sys.consumedDowntimeMinutes} / 240 mins
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      sys.consumedDowntimeMinutes > 180
                        ? 'bg-rose-500'
                        : sys.consumedDowntimeMinutes > 90
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${(sys.consumedDowntimeMinutes / sys.maxAllowedDowntimeMinutes) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected System: 240-Minute Burn-Rate & Telemetry Center */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                {selectedSystem.id}
              </span>
              <h4 className="text-base font-bold text-white">{selectedSystem.name}</h4>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Statutory 4-Hour Budget Compliance &bull; Primary Production Node &bull; DR Node: {selectedSystem.drSiteLocation}
            </p>
          </div>
          <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-slate-800 text-sky-300 border border-slate-700">
            Rolling 12M Availability: {selectedSystem.uptimePctRolling12M}%
          </span>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Remaining Downtime Budget
            </span>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold font-mono ${
                isBudgetCritical ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
              }`}>
                {remainingMinutes}
              </span>
              <span className="text-xs text-slate-400">minutes left</span>
            </div>
            <span className="text-[10.5px] text-slate-400 block">
              Budget Consumed: {budgetConsumedPct}% ({selectedSystem.consumedDowntimeMinutes} of 240m)
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
              Recovery Time Objective (RTO)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-amber-300">
                ≤ {selectedSystem.rtoMinutes}
              </span>
              <span className="text-xs text-slate-400">minutes</span>
            </div>
            <span className="text-[10.5px] text-slate-400 block">
              MAS Limit: ≤ 240 mins (Notice 644 §5)
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-cyan-400 block tracking-wider">
              Recovery Point Objective (RPO)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-cyan-300">
                ≤ {selectedSystem.rpoMinutes}
              </span>
              <span className="text-xs text-slate-400">minutes data loss</span>
            </div>
            <span className="text-[10.5px] text-slate-400 block">
              Synchronous active-active replication
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
              Annual DR Exercise Status
            </span>
            <div className="flex items-center gap-1.5 pt-1">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-bold text-white">Full Failover Passed</span>
            </div>
            <span className="text-[10.5px] text-slate-400 block">
              Last Test: {selectedSystem.lastDrExerciseDate}
            </span>
          </div>
        </div>

        {/* 240-Minute Visual Burn-Rate Progress Bar */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-rose-400" />
              <span>Notice 644 Rolling 12-Month Downtime Consumption Meter</span>
            </span>
            <span className="font-mono text-slate-400">
              {selectedSystem.consumedDowntimeMinutes} / 240 Minutes ({budgetConsumedPct}% Consumed)
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden flex">
            <div
              className={`h-full transition-all ${
                budgetConsumedPct > 75 ? 'bg-rose-500' : budgetConsumedPct > 40 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${budgetConsumedPct}%` }}
              title={`Consumed: ${selectedSystem.consumedDowntimeMinutes} minutes`}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>0 min (Zero Outage)</span>
            <span>60 min (1 hr)</span>
            <span>120 min (2 hr)</span>
            <span>180 min (3 hr)</span>
            <span className="text-rose-400 font-bold">240 min (MAS Notice 644 Statutory Cap)</span>
          </div>
        </div>
      </div>

      {/* Automated MAS Notice 644 Incident Notification Drafter */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Automated MAS Notice 644 Regulatory Notification Drafter</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Instantly compiles statutory supervisory documentation for transmission to the MAS Technology Risk Supervision Division.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 shadow-inner">
              <button
                type="button"
                onClick={() => setActiveTemplate('TEMPLATE_A')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTemplate === 'TEMPLATE_A'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Template A (1-Hour Alert)
              </button>
              <button
                type="button"
                onClick={() => setActiveTemplate('TEMPLATE_B')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTemplate === 'TEMPLATE_B'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Template B (14-Day RCA)
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopyDraft}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copiedDraft ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedDraft ? 'Copied to Clipboard' : 'Copy Notice'}</span>
            </button>
          </div>
        </div>

        {/* Text Area Draft */}
        <div className="bg-slate-950/90 rounded-xl border border-slate-800 p-4 font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre leading-relaxed max-h-96">
          {activeTemplate === 'TEMPLATE_A' ? generateTemplateA() : generateTemplateB()}
        </div>
      </div>
    </div>
  );
};
