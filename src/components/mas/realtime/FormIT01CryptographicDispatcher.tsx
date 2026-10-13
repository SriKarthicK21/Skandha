import React, { useState, useEffect } from 'react';
import {
  Send,
  Lock,
  Clock,
  AlertOctagon,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Download,
  Copy,
  Check,
  FileText,
  Key,
  Flame,
  Radio,
  RefreshCw,
  Bell,
  Eye,
  Sliders,
  ExternalLink,
  MessageSquare,
  Sparkles
} from 'lucide-react';

export interface IncidentDispatchRecord {
  id: string;
  incidentRef: string;
  systemName: string;
  outageStartTime: string;
  discoveryTime: string;
  initialNotificationDeadline: string; // T+60 minutes
  timeRemainingSec: number;
  slaBreachRisk: 'CRITICAL_RISK' | 'MODERATE' | 'LOW' | 'DISPATCHED_ON_TIME';
  escalationTier: 'NORMAL' | 'TIER_1_CRO_ALERT' | 'TIER_2_GENERAL_COUNSEL' | 'DISPATCHED';
  pgpEncryptedPayloadSnippet: string;
  masReceiptDocketNumber?: string;
  masSubmissionTimestamp?: string;
  firstLineApprovedBy: string;
  secondLineApprovedBy: string;
  formStatus: 'DRAFT' | 'PENDING_2LOD_SIGN' | 'PGP_SEALED' | 'DISPATCHED_TO_MAS';
}

export const FormIT01CryptographicDispatcher: React.FC = () => {
  const [records, setRecords] = useState<IncidentDispatchRecord[]>([
    {
      id: 'DISP-644-01',
      incidentRef: 'INC-2026-0928-001',
      systemName: 'FAST / PayNow Interbank Gateway (Primary Node)',
      outageStartTime: '2026-09-27 22:45:00 SGT',
      discoveryTime: '2026-09-27 22:48:15 SGT',
      initialNotificationDeadline: '2026-09-27 23:48:15 SGT (T+60m statutory)',
      timeRemainingSec: 1320, // 22 minutes remaining (at T-22m, CRO & GC Escalated!)
      slaBreachRisk: 'CRITICAL_RISK',
      escalationTier: 'TIER_2_GENERAL_COUNSEL',
      pgpEncryptedPayloadSnippet: '-----BEGIN PGP MESSAGE-----\nVersion: MAS-TRM-PGP-v4.1.2\nComment: Encrypted with MAS IT Supervision Public Key [0x7F82A41B]\n\nhQGMA42981FA71BCAQQAsV30pL92kmzP+j9x817f5L0kP6Ww/1A=\n=67AB\n-----END PGP MESSAGE-----',
      firstLineApprovedBy: 'Incident Commander (SecOps Lead)',
      secondLineApprovedBy: 'Pending CISO 2LoD Signature',
      formStatus: 'PENDING_2LOD_SIGN'
    },
    {
      id: 'DISP-644-02',
      incidentRef: 'INC-2026-0814-042',
      systemName: 'Core Banking Customer Portal (Retail DB Read Replica)',
      outageStartTime: '2026-08-14 14:10:00 SGT',
      discoveryTime: '2026-08-14 14:14:00 SGT',
      initialNotificationDeadline: '2026-08-14 15:14:00 SGT',
      timeRemainingSec: 0,
      slaBreachRisk: 'DISPATCHED_ON_TIME',
      escalationTier: 'DISPATCHED',
      pgpEncryptedPayloadSnippet: '-----BEGIN PGP MESSAGE-----\nVersion: MAS-TRM-PGP-v4.1.2\nEncrypted to MAS-ITS-SEC-KEYID-9941\n=8812\n-----END PGP MESSAGE-----',
      masReceiptDocketNumber: 'MAS-ITS-2026-0814-DOC-89412',
      masSubmissionTimestamp: '2026-08-14 14:38:12 SGT (Dispatched within 24m)',
      firstLineApprovedBy: 'Lead Cloud Infrastructure Architect',
      secondLineApprovedBy: 'Head of Technology Risk (CISO)',
      formStatus: 'DISPATCHED_TO_MAS'
    }
  ]);

  const [activeIncidentId, setActiveIncidentId] = useState<string>('DISP-644-01');
  const [isEncrypting, setIsEncrypting] = useState<boolean>(false);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [smsAlertSimulated, setSmsAlertSimulated] = useState<string | null>(null);

  const activeRecord = records.find(r => r.id === activeIncidentId) || records[0];

  // Countdown timer loop for active records
  useEffect(() => {
    const timer = setInterval(() => {
      setRecords(prev =>
        prev.map(r => {
          if (r.formStatus !== 'DISPATCHED_TO_MAS' && r.timeRemainingSec > 0) {
            const nextSec = r.timeRemainingSec - 1;
            const nextTier = nextSec < 1500 ? 'TIER_2_GENERAL_COUNSEL' : nextSec < 2400 ? 'TIER_1_CRO_ALERT' : 'NORMAL';
            return {
              ...r,
              timeRemainingSec: nextSec,
              escalationTier: nextTier,
              slaBreachRisk: nextSec < 900 ? 'CRITICAL_RISK' : 'MODERATE'
            };
          }
          return r;
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Co-sign and PGP encrypt Form IT-01
  const handleSealAndSign = () => {
    setIsEncrypting(true);
    setTimeout(() => {
      setRecords(prev =>
        prev.map(r => {
          if (r.id === activeIncidentId) {
            return {
              ...r,
              formStatus: 'PGP_SEALED',
              secondLineApprovedBy: 'Head of Technology Risk (CISO Co-Signed)'
            };
          }
          return r;
        })
      );
      setIsEncrypting(false);
    }, 800);
  };

  // Dispatch encrypted payload to MAS IT Supervision Secure Gateway
  const handleDispatchToMAS = () => {
    setIsDispatching(true);
    setTimeout(() => {
      const generatedDocket = `MAS-ITS-2026-${Math.floor(100000 + Math.random() * 900000)}-ACK`;
      const nowStr = `${new Date().toLocaleTimeString()} SGT (Within 1-Hour Statutory Cap)`;

      setRecords(prev =>
        prev.map(r => {
          if (r.id === activeIncidentId) {
            return {
              ...r,
              formStatus: 'DISPATCHED_TO_MAS',
              masReceiptDocketNumber: generatedDocket,
              masSubmissionTimestamp: nowStr,
              slaBreachRisk: 'DISPATCHED_ON_TIME',
              escalationTier: 'DISPATCHED'
            };
          }
          return r;
        })
      );
      setIsDispatching(false);
    }, 1200);
  };

  const handleTriggerSimulatedEscalation = (target: string) => {
    setSmsAlertSimulated(`Signal/SMS Priority Dispatch sent to ${target}: "CRITICAL MAS 1-HOUR NOTICE 644 DEADLINE AT T-22 MINS. Form IT-01 requires immediate CRO sign-off."`);
    setTimeout(() => setSmsAlertSimulated(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-rose-500/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-400/30 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-rose-400" />
                MAS Notice 644 §5 & Notice 655 §7 E-Filing Dispatcher
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                60-MIN STATUTORY DEADLINE WATCHDOG
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Form IT-01 Cryptographic E-Filing & Supervisory Docketing Engine
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl mt-1 leading-relaxed">
              Automated end-to-end incident notification pipeline for the MAS IT Supervision Department. Enforces PGP encryption with
              official regulatory public keys, real-time SLA countdown with CRO/General Counsel escalation triggers, and immutable receipt docketing.
            </p>
          </div>

          {/* Active 60-Minute Countdown Gauge */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-950/90 border border-rose-500/50 rounded-xl p-3.5 text-right shadow-lg">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Statutory 1-Hour Window Remaining
              </span>
              <div
                className={`text-2xl font-bold font-mono flex items-center justify-end gap-1.5 ${
                  activeRecord.formStatus === 'DISPATCHED_TO_MAS'
                    ? 'text-emerald-400'
                    : activeRecord.timeRemainingSec < 1500
                    ? 'text-rose-400 animate-pulse'
                    : 'text-amber-400'
                }`}
              >
                <Clock className="w-5 h-5" />
                <span>
                  {activeRecord.formStatus === 'DISPATCHED_TO_MAS'
                    ? 'DISPATCHED'
                    : formatTimer(activeRecord.timeRemainingSec)}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {activeRecord.formStatus === 'DISPATCHED_TO_MAS'
                  ? 'Official Receipt Docketed'
                  : 'Mandatory Initial Notification'}
              </span>
            </div>
          </div>
        </div>

        {/* Escalation Tier Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-xs">
          <div
            className={`p-3 rounded-xl border ${
              activeRecord.escalationTier === 'NORMAL'
                ? 'bg-slate-950/80 border-slate-700 text-slate-300'
                : 'bg-slate-950/40 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center justify-between font-bold text-[11px] mb-1">
              <span>Tier 0: Engineering Triage</span>
              <span className="font-mono">T+0 to T+35m</span>
            </div>
            <p className="text-[10px] text-slate-400">Incident Commander drafts Form IT-01 Template A</p>
          </div>

          <div
            className={`p-3 rounded-xl border ${
              activeRecord.escalationTier === 'TIER_1_CRO_ALERT'
                ? 'bg-amber-950/50 border-amber-500/50 text-amber-200'
                : 'bg-slate-950/40 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center justify-between font-bold text-[11px] mb-1">
              <span>Tier 1: CRO & CISO Auto-Page</span>
              <span className="font-mono">T-25m Warning</span>
            </div>
            <p className="text-[10px]">Automated Signal alert if pending 2LoD sign-off</p>
          </div>

          <div
            className={`p-3 rounded-xl border ${
              activeRecord.escalationTier === 'TIER_2_GENERAL_COUNSEL'
                ? 'bg-rose-950/60 border-rose-500/60 text-rose-200 animate-pulse'
                : activeRecord.escalationTier === 'DISPATCHED'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-950/40 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center justify-between font-bold text-[11px] mb-1">
              <span>Tier 2: General Counsel Hard Trigger</span>
              <span className="font-mono">{activeRecord.escalationTier === 'DISPATCHED' ? 'Resolved' : 'T-15m Breach Risk'}</span>
            </div>
            <p className="text-[10px]">Direct executive bypass to prevent Notice 644 non-compliance fine</p>
          </div>
        </div>
      </div>

      {/* Simulated Signal Alert Toast if fired */}
      {smsAlertSimulated && (
        <div className="p-4 rounded-xl bg-amber-950/80 border border-amber-500/60 text-amber-200 text-xs flex items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-400 animate-ping" />
            <span className="font-bold">{smsAlertSimulated}</span>
          </div>
          <button
            type="button"
            onClick={() => setSmsAlertSimulated(null)}
            className="text-amber-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Form IT-01 E-Filing Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Incident Selector & Status */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Regulatory Incidents
            </h3>

            <div className="space-y-2">
              {records.map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setActiveIncidentId(r.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    activeIncidentId === r.id
                      ? 'bg-rose-950/30 border-rose-500/50 shadow-md'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-bold text-rose-400">{r.incidentRef}</span>
                    <span
                      className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold ${
                        r.formStatus === 'DISPATCHED_TO_MAS'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {r.formStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{r.systemName}</h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
                    <span>Deadline:</span>
                    <span className="font-mono text-slate-300">{r.initialNotificationDeadline.substring(11, 23)}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Manual Escalation Dispatch Button */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-[11px] text-slate-400 font-semibold block">Test Emergency Escalation:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleTriggerSimulatedEscalation('Chief Risk Officer (CRO)')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold cursor-pointer"
                >
                  Page CRO
                </button>
                <button
                  type="button"
                  onClick={() => handleTriggerSimulatedEscalation('General Counsel')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold cursor-pointer"
                >
                  Page Counsel
                </button>
              </div>
            </div>
          </div>

          {/* Regulatory Receipt Docketing Card */}
          {activeRecord.masReceiptDocketNumber && (
            <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-4 shadow-lg space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>MAS Case Docket Receipt</span>
              </div>
              <div className="font-mono text-xs font-bold text-emerald-300 bg-slate-950 p-2.5 rounded-lg border border-emerald-500/30 break-all select-all">
                {activeRecord.masReceiptDocketNumber}
              </div>
              <p className="text-[11px] text-slate-300">
                Timestamp: <strong className="text-emerald-300 font-mono">{activeRecord.masSubmissionTimestamp}</strong>
              </p>
              <span className="text-[10px] text-slate-400 block pt-1 border-t border-emerald-500/20">
                Guarantees non-repudiation proof for subsequent Big 4 / MAS supervisory inspections.
              </span>
            </div>
          )}
        </div>

        {/* Middle & Right Col: Form IT-01 Document Viewer & PGP Cryptographic Seal */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-rose-400" />
                  <span>MAS Notice 644 Incident Notification Form IT-01 (Template A)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Official supervisory reporting format prescribed under Notice 644 Appendix 1
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-mono text-slate-400">Ref: {activeRecord.incidentRef}</span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">1. Disrupted Critical System</span>
                  <span className="font-semibold text-white mt-1 block">{activeRecord.systemName}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">2. Discovery Timestamp</span>
                  <span className="font-semibold text-white mt-1 block font-mono">{activeRecord.discoveryTime}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">3. Nature & Impact Assessment</span>
                <p className="text-slate-300 leading-relaxed text-[11.5px]">
                  Unscheduled disruption to primary transaction switch. Customer FAST/PayNow outbound transfers queueing with latency exceeding 45 seconds. Failover to Secondary Jurong Data Center initiated.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">1st Line Engineering Signer</span>
                  <span className="font-semibold text-emerald-400 mt-1 block">{activeRecord.firstLineApprovedBy}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">2nd Line CISO Approval</span>
                  <span
                    className={`font-semibold mt-1 block ${
                      activeRecord.secondLineApprovedBy.includes('Pending') ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
                    }`}
                  >
                    {activeRecord.secondLineApprovedBy}
                  </span>
                </div>
              </div>

              {/* PGP Encryption Envelope Preview */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-cyan-400" />
                    <span>MAS PGP 4096-bit Public Key Envelope Seal</span>
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400">KEYID: 0x7F82A41B</span>
                </div>
                <pre className="font-mono text-[10.5px] text-slate-400 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 overflow-x-auto">
                  {activeRecord.pgpEncryptedPayloadSnippet}
                </pre>
              </div>
            </div>

            {/* Workflow Action Bar */}
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                Status:{' '}
                <strong className="text-white font-mono">{activeRecord.formStatus.replace(/_/g, ' ')}</strong>
              </div>

              <div className="flex items-center gap-2">
                {activeRecord.formStatus === 'PENDING_2LOD_SIGN' && (
                  <button
                    type="button"
                    onClick={handleSealAndSign}
                    disabled={isEncrypting}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50 transition-all"
                  >
                    {isEncrypting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Encrypting with MAS Public Key...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>2LoD CISO Co-Sign & Seal PGP</span>
                      </>
                    )}
                  </button>
                )}

                {activeRecord.formStatus === 'PGP_SEALED' && (
                  <button
                    type="button"
                    onClick={handleDispatchToMAS}
                    disabled={isDispatching}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50 transition-all animate-pulse"
                  >
                    {isDispatching ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>E-Filing to MAS Secure Gateway...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Transmit Form IT-01 to MAS</span>
                      </>
                    )}
                  </button>
                )}

                {activeRecord.formStatus === 'DISPATCHED_TO_MAS' && (
                  <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Statutory 1h E-Filing Complete</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
