import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertOctagon,
  Clock,
  ShieldCheck,
  Send,
  Lock,
  FileText,
  Key,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Download,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Bell,
  Eye,
  Sliders,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Building2,
  UserCheck,
  Radio,
  FileCheck,
  Search,
  Plus,
  CornerDownRight,
  Layers,
  ChevronRight,
  Terminal,
  FileCode
} from 'lucide-react';
import { PageContainer } from '../../layout/PageContainer';
import { useToast } from '../../common/ToastContainer';
import {
  MASComplianceWorkflowItem,
  FormIT01Payload,
  WatchdogEscalationTier,
  FormIT01WorkflowStatus,
  MASRegulatoryReceiptRecord,
  getInitialWorkflowIncidents,
  saveWorkflowIncidents,
  generatePgpEncryptedEnvelope,
  coSignFormIT01,
  dispatchFormIT01ToMAS,
  triggerWatchdogEscalationAlert,
  MAS_IT_SUPERVISION_PUBLIC_KEY
} from '../../../services/masComplianceWorkflowService';
import { formatSGTTime } from '../../../services/masIncidentAuditService';

type ActiveWorkflowTab = 'WATCHDOG_INCIDENTS' | 'FORM_IT01_DISPATCH' | 'RECEIPT_DOCKET_LEDGER' | 'STATUTORY_DIRECTIVE_MATRIX';

export const MASComplianceWorkflowModule: React.FC = () => {
  const { showToast } = useToast();

  const [incidents, setIncidents] = useState<MASComplianceWorkflowItem[]>(() => getInitialWorkflowIncidents());
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(incidents[0]?.id || 'MAS-WF-2026-001');
  const [activeTab, setActiveTab] = useState<ActiveWorkflowTab>('WATCHDOG_INCIDENTS');

  // Interactive Form State (for editing / reviewing Form IT-01)
  const activeIncident = useMemo(() => {
    return incidents.find(i => i.id === selectedIncidentId) || incidents[0];
  }, [incidents, selectedIncidentId]);

  const [formState, setFormState] = useState<FormIT01Payload>(activeIncident.formPayload);
  const [isSealing, setIsSealing] = useState<boolean>(false);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [copiedDocket, setCopiedDocket] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedReceiptForModal, setSelectedReceiptForModal] = useState<MASRegulatoryReceiptRecord | null>(null);

  // Sync formState when selected incident changes
  useEffect(() => {
    if (activeIncident) {
      setFormState(activeIncident.formPayload);
    }
  }, [activeIncident?.id]);

  // Live 1-second countdown timer for all active in-flight incidents
  useEffect(() => {
    const timer = setInterval(() => {
      setIncidents(prev => {
        let changed = false;
        const updated = prev.map(item => {
          if (item.status !== 'DISPATCHED_TO_MAS' && item.status !== 'CLOSED_VERIFIED' && item.timeRemainingSec > 0) {
            changed = true;
            const nextSec = item.timeRemainingSec - 1;
            let nextTier: WatchdogEscalationTier = item.watchdogTier;

            // Multi-tier SLA Watchdog thresholds
            if (nextSec <= 0) {
              nextTier = 'STATUTORY_BREACH_OVERDUE';
            } else if (nextSec <= 900) {
              // <= 15m remaining: Tier 2 General Counsel Hard Alert
              nextTier = 'TIER_2_GENERAL_COUNSEL';
            } else if (nextSec <= 2100) {
              // <= 35m remaining: Tier 1 CRO Alert
              nextTier = 'TIER_1_CRO_ALERT';
            }

            return {
              ...item,
              timeRemainingSec: nextSec,
              watchdogTier: nextTier
            };
          }
          return item;
        });

        if (changed) {
          saveWorkflowIncidents(updated);
          return updated;
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Co-Sign Form IT-01 under Four-Eyes Principle
  const handleCoSign = async () => {
    setIsSealing(true);
    try {
      const updatedList = await coSignFormIT01(activeIncident.id);
      setIncidents(updatedList);
      showToast({
        title: 'Four-Eyes Authorization Sealed',
        message: 'Second-line CISO approval cryptographically logged. Payload ready for PGP encryption.',
        type: 'success'
      });
    } catch (e: any) {
      showToast({ title: 'Signing Failed', message: e?.message || 'Error co-signing form', type: 'error' });
    } finally {
      setIsSealing(false);
    }
  };

  // PGP Encryption & Statutory Dispatch
  const handlePgpEncryptAndDispatch = async () => {
    setIsDispatching(true);
    try {
      const { pgpEnvelopeAscii, canonicalSha256 } = await generatePgpEncryptedEnvelope(formState);
      const { updatedItems, receipt } = await dispatchFormIT01ToMAS(activeIncident.id, pgpEnvelopeAscii, canonicalSha256);
      setIncidents(updatedItems);
      setSelectedReceiptForModal(receipt);
      showToast({
        title: 'Form IT-01 Dispatched & Docket Locked',
        message: `MAS Docket Number: ${receipt.masDocketNumber}. Dispatched within statutory 60m window.`,
        type: 'success'
      });
    } catch (e: any) {
      showToast({ title: 'Dispatch Failed', message: e?.message || 'Network error during statutory dispatch', type: 'error' });
    } finally {
      setIsDispatching(false);
    }
  };

  // Manual Watchdog Alert Trigger (Simulation)
  const handleTriggerEscalation = async (tier: WatchdogEscalationTier) => {
    try {
      const updated = await triggerWatchdogEscalationAlert(activeIncident.id, tier);
      setIncidents(updated);
      showToast({
        title: `${tier === 'TIER_2_GENERAL_COUNSEL' ? 'General Counsel & Board' : 'CRO'} Escalation Dispatched`,
        message: 'Emergency notification successfully sent via priority gateway with delivery receipt.',
        type: 'info'
      });
    } catch (e: any) {
      showToast({ title: 'Escalation Failed', message: e?.message, type: 'error' });
    }
  };

  const handleCopyText = (text: string, type: 'key' | 'docket') => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedDocket(true);
      setTimeout(() => setCopiedDocket(false), 2000);
    }
    showToast({ title: 'Copied to Clipboard', message: 'Cryptographic data copied.', type: 'info' });
  };

  // Filtered incidents
  const filteredIncidents = incidents.filter(i => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      i.incidentRef.toLowerCase().includes(q) ||
      i.systemName.toLowerCase().includes(q) ||
      i.disruptionType.toLowerCase().includes(q)
    );
  });

  return (
    <PageContainer id="mas-compliance-workflow-module">
      <div className="space-y-6">
        {/* 1. TOP HEADER & STATUTORY COMMAND STRIP */}
        <div className="bg-white border border-[#CBD5E1] rounded-xl p-5 shadow-xs transition-all">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                  MAS TRM Statutory Workflow
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#DC2626]" />
                  60-Minute Hard Statutory Mandate
                </span>
                <span className="text-xs text-[#475569] font-medium hidden sm:inline">
                  • Notice 644 §5 (Banking Act) & Notice 655 §7 (Payment Services Act)
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2.5">
                <AlertOctagon className="w-6 h-6 text-[#DC2626] shrink-0" />
                MAS Compliance Workflow & Statutory Incident E-Filing Desk
              </h1>

              <p className="text-xs sm:text-sm text-[#475569] max-w-4xl leading-relaxed">
                Centralized statutory incident command combining the <strong>60-Minute Hard SLA Escalation Watchdog</strong>, 
                official <strong>Form IT-01 Cryptographic E-Filing Pipeline (PGP Key 0x7F82A41B)</strong>, and the 
                <strong> MAS Regulatory Receipt & Non-Repudiation Docket Ledger</strong> for Technology Risk Officers.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('FORM_IT01_DISPATCH')}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#0F2747] hover:bg-[#173A63] text-white shadow-xs transition flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Prepare Form IT-01</span>
              </button>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-[#E2E8F0]">
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3">
              <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider block">
                Active In-Flight Timers
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl font-bold font-mono text-[#DC2626]">
                  {incidents.filter(i => i.status !== 'DISPATCHED_TO_MAS').length} Active
                </span>
                <span className="text-[10px] text-[#D97706] font-semibold">(T-22m Critical)</span>
              </div>
            </div>

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3">
              <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider block">
                Watchdog SLA Status
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl font-bold font-mono text-[#059669]">Tier 2 Active</span>
                <span className="text-[10px] text-[#475569]">(CRO & GC Notified)</span>
              </div>
            </div>

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3">
              <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider block">
                E-Filed Form IT-01 Dispatches
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl font-bold font-mono text-[#0F172A]">
                  {incidents.filter(i => i.status === 'DISPATCHED_TO_MAS').length} Locked
                </span>
                <span className="text-[10px] text-[#059669] font-semibold">100% On-Time</span>
              </div>
            </div>

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3">
              <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider block">
                Non-Repudiation Verified
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl font-bold font-mono text-[#2563EB]">100%</span>
                <span className="text-[10px] text-[#059669] font-semibold">(SHA-256 Valid)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. UNIFIED WORKFLOW NAVIGATION TABS */}
        <div className="bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0] flex items-center justify-between gap-1 overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max">
            <button
              type="button"
              onClick={() => setActiveTab('WATCHDOG_INCIDENTS')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'WATCHDOG_INCIDENTS'
                  ? 'bg-white text-[#0F172A] border border-[#CBD5E1] shadow-xs font-bold'
                  : 'text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-[#DC2626]" />
              <span>1. 60-Minute SLA Watchdog & Incident Roster</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                T-22m
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('FORM_IT01_DISPATCH')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'FORM_IT01_DISPATCH'
                  ? 'bg-white text-[#0F172A] border border-[#CBD5E1] shadow-xs font-bold'
                  : 'text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              <Send className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>2. Form IT-01 Cryptographic E-Filing Dispatcher</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('RECEIPT_DOCKET_LEDGER')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'RECEIPT_DOCKET_LEDGER'
                  ? 'bg-white text-[#0F172A] border border-[#CBD5E1] shadow-xs font-bold'
                  : 'text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5 text-[#059669]" />
              <span>3. MAS Regulatory Receipt & Non-Repudiation Ledger</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('STATUTORY_DIRECTIVE_MATRIX')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'STATUTORY_DIRECTIVE_MATRIX'
                  ? 'bg-white text-[#0F172A] border border-[#CBD5E1] shadow-xs font-bold'
                  : 'text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#475569]" />
              <span>4. Notice 644/655 Statutory Governance Matrix</span>
            </button>
          </div>
        </div>

        {/* 3. TAB 1: 60-MINUTE HARD SLA ESCALATION WATCHDOG */}
        {activeTab === 'WATCHDOG_INCIDENTS' && (
          <div className="space-y-6">
            {/* Active Incident Countdown Banner */}
            <div className="bg-white border-2 border-[#FECACA] rounded-xl p-6 shadow-xs relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] flex items-center gap-1.5 animate-pulse">
                      <Flame className="w-3.5 h-3.5 text-[#DC2626]" />
                      STATUTORY COUNTDOWN ACTIVE
                    </span>
                    <span className="text-xs font-mono font-semibold text-[#475569]">
                      Ref: {activeIncident.incidentRef}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
                    {activeIncident.systemName}
                  </h2>

                  <p className="text-xs sm:text-sm text-[#475569] max-w-3xl">
                    Discovered at <strong>{formatSGTTime(activeIncident.discoveryTime)}</strong>. Under MAS Notice 644 §5 & Notice 655 §7, 
                    the initial incident report (Form IT-01) must be formally transmitted to the MAS IT Supervision Department 
                    no later than <strong>{formatSGTTime(activeIncident.statutoryDeadlineT60)}</strong>.
                  </p>
                </div>

                {/* Clock Gauge Display */}
                <div className="flex items-center gap-4 bg-[#F8FAFC] border border-[#CBD5E1] p-4 rounded-xl shrink-0">
                  <div className="text-center">
                    <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                      Time to Statutory Cutoff
                    </div>
                    <div className={`text-4xl font-extrabold font-mono tracking-tight ${
                      activeIncident.timeRemainingSec < 900 ? 'text-[#DC2626] animate-pulse' : 'text-[#D97706]'
                    }`}>
                      {formatTimer(activeIncident.timeRemainingSec)}
                    </div>
                    <div className="text-[10px] text-[#DC2626] font-semibold mt-1">
                      {activeIncident.watchdogTier === 'TIER_2_GENERAL_COUNSEL' 
                        ? 'TIER 2 ESCALATION ACTIVE' 
                        : 'TIER 1 CRO ALERT ACTIVE'}
                    </div>
                  </div>

                  <div className="border-l border-[#CBD5E1] pl-4 space-y-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('FORM_IT01_DISPATCH')}
                      className="w-full px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0F2747] hover:bg-[#173A63] text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Open Form IT-01</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCoSign}
                      disabled={isSealing || activeIncident.status !== 'PENDING_2LOD_SIGN'}
                      className="w-full px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-[#F8FAFC] text-[#0F172A] border border-[#CBD5E1] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#059669]" />
                      <span>{isSealing ? 'Sealing...' : 'Co-Sign as 2LoD CISO'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress Bar of the 60 minutes */}
              <div className="mt-6 pt-4 border-t border-[#E2E8F0]">
                <div className="flex items-center justify-between text-[11px] font-medium text-[#475569] mb-1.5">
                  <span>Discovery: T+00m</span>
                  <span className="text-[#D97706] font-bold">T-35m: CRO Alert Threshold</span>
                  <span className="text-[#DC2626] font-bold">T-25m: General Counsel Escalation</span>
                  <span className="font-bold text-[#0F172A]">T+60m: Hard Statutory Deadline</span>
                </div>
                <div className="w-full h-2.5 bg-[#E2E8F0] rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-gradient-to-r from-[#D97706] to-[#DC2626] transition-all duration-1000"
                    style={{ width: `${Math.min(100, Math.max(5, ((3600 - activeIncident.timeRemainingSec) / 3600) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Two-Column Watchdog Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Incident Roster Table (Left 1 col) */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                    <span>Statutory Incident Register</span>
                  </h3>
                  <span className="text-xs text-[#64748B] font-mono">{filteredIncidents.length} Records</span>
                </div>

                <div className="space-y-2">
                  {filteredIncidents.map(inc => {
                    const isSelected = inc.id === selectedIncidentId;
                    return (
                      <div
                        key={inc.id}
                        onClick={() => setSelectedIncidentId(inc.id)}
                        className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                          isSelected
                            ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]'
                            : 'bg-white hover:bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-bold">{inc.incidentRef}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            inc.status === 'DISPATCHED_TO_MAS'
                              ? 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'
                              : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
                          }`}>
                            {inc.status === 'DISPATCHED_TO_MAS' ? 'Dispatched' : 'Active T-22m'}
                          </span>
                        </div>
                        <div className="font-semibold truncate text-[#0F172A]">{inc.systemName}</div>
                        <div className="text-[10px] text-[#64748B] mt-1 flex items-center justify-between">
                          <span>Sev: {inc.severity}</span>
                          <span className="font-mono">
                            {inc.status === 'DISPATCHED_TO_MAS' ? 'Locked' : formatTimer(inc.timeRemainingSec)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Escalation Telemetry & Automated Alerts Dispatch (Right 2 cols) */}
              <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
                      <Radio className="w-4 h-4 text-[#2563EB]" />
                      <span>60-Minute Hard SLA Escalation Watchdog Feed</span>
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      Automated multi-channel broadcast engine for high-risk statutory countdowns
                    </p>
                  </div>

                  {/* Manual Alert Trigger Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTriggerEscalation('TIER_1_CRO_ALERT')}
                      className="px-2.5 py-1 rounded text-xs font-semibold bg-[#FFFBEB] hover:bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] transition cursor-pointer"
                      title="Simulate SMS Alert to Chief Risk Officer"
                    >
                      Ping CRO (SMS)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTriggerEscalation('TIER_2_GENERAL_COUNSEL')}
                      className="px-2.5 py-1 rounded text-xs font-semibold bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] transition cursor-pointer"
                      title="Simulate Emergency Webhook Alert to General Counsel & Executive Committee"
                    >
                      Alert GC (Webhook)
                    </button>
                  </div>
                </div>

                {/* Escalation Events Stream */}
                <div className="space-y-2.5">
                  {activeIncident.escalationHistory.map((evt, idx) => (
                    <div
                      key={evt.id}
                      className="p-3.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`mt-0.5 p-1 rounded ${
                          evt.tier === 'TIER_2_GENERAL_COUNSEL'
                            ? 'bg-[#FEF2F2] text-[#DC2626]'
                            : evt.tier === 'DISPATCHED_COMPLIANT'
                            ? 'bg-[#ECFDF5] text-[#059669]'
                            : 'bg-[#FFFBEB] text-[#D97706]'
                        }`}>
                          <Bell className="w-3.5 h-3.5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#0F172A]">{evt.recipientRole} ({evt.recipientName})</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white border border-[#CBD5E1] text-[#475569]">
                              {evt.channel}
                            </span>
                          </div>
                          <p className="text-[#475569]">{evt.messageBody}</p>
                          <div className="text-[10px] text-[#64748B]">
                            Broadcasted: {formatSGTTime(evt.timestamp)}
                            {evt.acknowledgedAt && (
                              <span className="ml-2 text-[#059669] font-medium">
                                • Acknowledged at {formatSGTTime(evt.acknowledgedAt)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] shrink-0">
                        {evt.deliveryStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. TAB 2: FORM IT-01 CRYPTOGRAPHIC E-FILING DISPATCHER */}
        {activeTab === 'FORM_IT01_DISPATCH' && (
          <div className="space-y-6">
            {/* Form IT-01 Header Information */}
            <div className="bg-white border border-[#CBD5E1] rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                      Notice 644/655 Template A
                    </span>
                    <span className="font-mono text-xs text-[#475569]">Ref: {formState.incidentRef}</span>
                  </div>
                  <h2 className="text-lg font-bold text-[#0F172A]">
                    Form IT-01: Incident Notification to MAS IT Supervision Department
                  </h2>
                  <p className="text-xs text-[#475569]">
                    Statutory initial notification form encrypted with MAS IT Supervision Public Key (0x7F82A41B).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCoSign}
                    disabled={isSealing || activeIncident.status !== 'PENDING_2LOD_SIGN'}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-[#F8FAFC] text-[#0F172A] border border-[#CBD5E1] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-[#059669]" />
                    <span>{activeIncident.status === 'PENDING_2LOD_SIGN' ? 'Co-Sign Form IT-01 (Four-Eyes)' : 'Co-Signed'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePgpEncryptAndDispatch}
                    disabled={isDispatching || activeIncident.status === 'DISPATCHED_TO_MAS'}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-[#0F2747] hover:bg-[#173A63] text-white flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isDispatching ? 'Encrypting & Dispatching...' : activeIncident.status === 'DISPATCHED_TO_MAS' ? 'Dispatched to MAS' : 'PGP Seal & Dispatch to MAS'}</span>
                  </button>
                </div>
              </div>

              {/* Form IT-01 Structured Data Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {/* Section A */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#0F172A]">Financial Institution Name</label>
                  <input
                    type="text"
                    value={formState.fiName}
                    onChange={e => setFormState({ ...formState, fiName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#0F172A]">MAS Institution Code</label>
                  <input
                    type="text"
                    value={formState.masFiCode}
                    onChange={e => setFormState({ ...formState, masFiCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A] font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#0F172A]">Critical System Affected</label>
                  <input
                    type="text"
                    value={formState.criticalSystemName}
                    onChange={e => setFormState({ ...formState, criticalSystemName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A]"
                  />
                </div>

                {/* Section B */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#0F172A]">Disruption Start Time (SGT)</label>
                  <input
                    type="text"
                    value={formState.disruptionStartTime}
                    onChange={e => setFormState({ ...formState, disruptionStartTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A] font-mono text-[11px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#0F172A]">Discovery Timestamp (SGT)</label>
                  <input
                    type="text"
                    value={formState.discoveryTime}
                    onChange={e => setFormState({ ...formState, discoveryTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A] font-mono text-[11px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#0F172A]">Statutory Cutoff (T+60m)</label>
                  <input
                    type="text"
                    readOnly
                    value={formState.statutoryDeadlineT60}
                    className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-[#F1F5F9] text-[#DC2626] font-mono font-bold text-[11px]"
                  />
                </div>

                {/* Impact */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#0F172A]">Estimated Affected Accounts</label>
                  <input
                    type="number"
                    value={formState.estimatedAffectedAccounts}
                    onChange={e => setFormState({ ...formState, estimatedAffectedAccounts: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A] font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#0F172A]">Financial Impact (SGD)</label>
                  <input
                    type="number"
                    value={formState.financialImpactSgd}
                    onChange={e => setFormState({ ...formState, financialImpactSgd: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A] font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#0F172A]">Interbank Spillover Risk</label>
                  <select
                    value={formState.interbankSpilloverRisk}
                    onChange={e => setFormState({ ...formState, interbankSpilloverRisk: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A]"
                  >
                    <option value="NONE">None (Strictly Internal)</option>
                    <option value="ISOLATED">Isolated (Queue Buildup Only)</option>
                    <option value="HIGH_SYSTEMIC">High Systemic Spillover (MEPS+ Affected)</option>
                  </select>
                </div>
              </div>

              {/* Technical Description & Containment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#0F172A]">Initial Technical Observation & Root Cause</label>
                  <textarea
                    rows={3}
                    value={formState.initialTechnicalObservation}
                    onChange={e => setFormState({ ...formState, initialTechnicalObservation: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#0F172A]">Immediate Containment Taken</label>
                  <textarea
                    rows={3}
                    value={formState.immediateContainmentTaken}
                    onChange={e => setFormState({ ...formState, immediateContainmentTaken: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A]"
                  />
                </div>
              </div>

              {/* Four-Eyes Sign-Off Details */}
              <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#059669]" />
                  <div>
                    <div className="font-bold text-[#0F172A]">First-Line Incident Commander Sign-Off:</div>
                    <div className="text-[#475569]">{formState.firstLineApprovedBy}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${formState.secondLineApprovalTimestamp ? 'bg-[#059669]' : 'bg-[#D97706] animate-pulse'}`} />
                  <div>
                    <div className="font-bold text-[#0F172A]">Second-Line CISO / Risk Officer Co-Signature:</div>
                    <div className="text-[#475569]">{formState.secondLineApprovedBy}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* PGP Envelope Inspection & Encryption Console */}
            <div className="bg-white border border-[#CBD5E1] rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#2563EB]" />
                  <span>PGP / S/MIME Encryption Envelope Preview (MAS Key 0x7F82A41B)</span>
                </h3>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyText(MAS_IT_SUPERVISION_PUBLIC_KEY, 'key')}
                    className="px-2.5 py-1 rounded text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] border border-[#CBD5E1] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey ? 'Copied' : 'Copy Public Key'}</span>
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#0F172A] text-slate-200 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-48 border border-slate-700">
                <pre>{activeIncident.pgpEncryptedPayloadAscii || `-----BEGIN PGP MESSAGE-----
Version: MAS-TRM-PGP-v4.1.2 (Sub-Division: Financial Services Technology)
Comment: Ready to seal and dispatch Form IT-01 for ${formState.incidentRef}
Recipient-KeyID: 0x7F82A41B
[Click "PGP Seal & Dispatch to MAS" above to encrypt with SHA-256 integrity seal]
-----END PGP MESSAGE-----`}</pre>
              </div>
            </div>
          </div>
        )}

        {/* 5. TAB 3: MAS REGULATORY RECEIPT LOGGER & NON-REPUDIATION DOCKET */}
        {activeTab === 'RECEIPT_DOCKET_LEDGER' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#CBD5E1] rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-[#059669]" />
                    <span>MAS Regulatory Receipt & Non-Repudiation Docket Ledger</span>
                  </h2>
                  <p className="text-xs text-[#475569]">
                    Cryptographic ledger recording official MAS Reference Docket Numbers to guarantee non-repudiation during statutory audits.
                  </p>
                </div>
              </div>

              {/* Docket Ledger Table */}
              <div className="overflow-x-auto border border-[#E2E8F0] rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                      <th className="p-3 font-semibold text-[#475569]">MAS Docket Reference</th>
                      <th className="p-3 font-semibold text-[#475569]">Incident Ref</th>
                      <th className="p-3 font-semibold text-[#475569]">Dispatch Latency</th>
                      <th className="p-3 font-semibold text-[#475569]">SHA-256 Digest</th>
                      <th className="p-3 font-semibold text-[#475569]">Supervision Seal</th>
                      <th className="p-3 font-semibold text-[#475569]">7-Day Detailed Deadline</th>
                      <th className="p-3 font-semibold text-[#475569] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] bg-white">
                    {incidents.filter(i => i.receiptDocket).map(inc => {
                      const rec = inc.receiptDocket!;
                      return (
                        <tr key={rec.id} className="hover:bg-[#F8FAFC] transition">
                          <td className="p-3 font-mono font-bold text-[#1D4ED8]">
                            {rec.masDocketNumber}
                          </td>
                          <td className="p-3 font-semibold text-[#0F172A]">{rec.incidentRef}</td>
                          <td className="p-3 font-mono text-[#059669]">
                            {Math.floor(rec.transmissionLatencySec / 60)}m {rec.transmissionLatencySec % 60}s (Met SLA)
                          </td>
                          <td className="p-3 font-mono text-[#64748B] text-[11px] truncate max-w-[140px]" title={rec.sha256FormHash}>
                            {rec.sha256FormHash.slice(0, 16)}...
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                              {rec.masSupervisionDigitalSeal.slice(0, 18)}...
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[#475569]">
                            {formatSGTTime(rec.sevenDayDetailedReportDeadline)}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedReceiptForModal(rec)}
                              className="px-2.5 py-1 rounded text-xs font-semibold bg-white hover:bg-[#F8FAFC] text-[#0F172A] border border-[#CBD5E1] cursor-pointer"
                            >
                              View Certificate
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 6. TAB 4: STATUTORY GOVERNANCE MATRIX (NOTICE 644/655) */}
        {activeTab === 'STATUTORY_DIRECTIVE_MATRIX' && (
          <div className="bg-white border border-[#CBD5E1] rounded-xl p-5 shadow-xs space-y-4">
            <div>
              <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#2563EB]" />
                <span>Notice 644 & Notice 655 Statutory Enforceability Matrix</span>
              </h2>
              <p className="text-xs text-[#475569]">
                Full mapping of legally binding directives under Section 58 of the Banking Act and Section 85 of the Payment Services Act.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0F172A]">Pillar 1: 1-Hour Incident Notice</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#FEF2F2] text-[#DC2626]">Notice 644 §5</span>
                </div>
                <p className="text-[#475569]">
                  Mandatory notification within 1 hour upon discovery of critical system outage or security breach.
                </p>
                <div className="text-[11px] font-semibold text-[#059669]">Status: Automated Watchdog Active</div>
              </div>

              <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0F172A]">Pillar 2: 7-Day Root Cause Report</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#EFF6FF] text-[#1D4ED8]">Notice 644 §5.3</span>
                </div>
                <p className="text-[#475569]">
                  Comprehensive written investigation report with root cause analysis and CAPA roadmap submitted within 7 calendar days.
                </p>
                <div className="text-[11px] font-semibold text-[#2563EB]">Status: Template Auto-Generated</div>
              </div>

              <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0F172A]">Pillar 3: Max 4h Annual Outage</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#FEF2F2] text-[#DC2626]">Notice 655 §6</span>
                </div>
                <p className="text-[#475569]">
                  Maximum unscheduled downtime of Critical Information Systems cannot exceed 4 hours in rolling 12 months.
                </p>
                <div className="text-[11px] font-semibold text-[#059669]">Status: CIS Ledger Synced</div>
              </div>
            </div>
          </div>
        )}

        {/* 7. MODAL: NON-REPUDIATION REGULATORY RECEIPT CERTIFICATE */}
        {selectedReceiptForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white border border-[#CBD5E1] rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-5 text-xs text-[#0F172A]">
              <div className="flex items-start justify-between pb-3 border-b border-[#E2E8F0]">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                    SUPERVISORY DOCKET VERIFIED
                  </span>
                  <h3 className="text-base font-bold text-[#0F172A] mt-1">
                    Certificate of Non-Repudiation (MAS Notice 644/655)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReceiptForModal(null)}
                  className="p-1 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="bg-[#F8FAFC] p-4 rounded-lg border border-[#E2E8F0] space-y-2.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Official Docket Number:</span>
                  <span className="font-bold text-[#1D4ED8]">{selectedReceiptForModal.masDocketNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Incident Reference:</span>
                  <span className="font-bold">{selectedReceiptForModal.incidentRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Submission Timestamp:</span>
                  <span>{formatSGTTime(selectedReceiptForModal.submissionTimestamp)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">SLA Latency from Discovery:</span>
                  <span className="text-[#059669] font-bold">
                    {Math.floor(selectedReceiptForModal.transmissionLatencySec / 60)} minutes {selectedReceiptForModal.transmissionLatencySec % 60} seconds
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Form IT-01 SHA-256 Digest:</span>
                  <span className="text-[10px] truncate max-w-[260px]">{selectedReceiptForModal.sha256FormHash}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">PGP Envelope SHA-256:</span>
                  <span className="text-[10px] truncate max-w-[260px]">{selectedReceiptForModal.sha256PgpEnvelopeHash}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Supervisory Digital Seal:</span>
                  <span className="text-[#059669] font-bold">{selectedReceiptForModal.masSupervisionDigitalSeal}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => handleCopyText(selectedReceiptForModal.masDocketNumber, 'docket')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-[#F8FAFC] text-[#0F172A] border border-[#CBD5E1] cursor-pointer flex items-center gap-1.5"
                >
                  {copiedDocket ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Docket</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedReceiptForModal(null)}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#0F2747] hover:bg-[#173A63] text-white cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
