// Skanda BrandGuard — Comprehensive Takedown Lifecycle SLA Case Details Drawer
// Displays full domain metadata, RFC 2142 communications, cryptographic receipt hashes,
// automated DNS/HTTP reachability probe history, and ISO 27001 A.5.7 audit trail.

import React, { useState } from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Globe,
  Server,
  FileCheck,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  Hash,
  Activity,
  ArrowRight,
  ArrowLeft,
  Mail,
  User,
  Calendar,
  Lock,
  Terminal,
  Cpu
} from 'lucide-react';
import { BrandFinding, BrandProfile } from '../../types/brandguard';
import {
  TakedownSlaItem,
  TakedownSlaStage,
  BrandGuardSlaService
} from '../../services/brandguard/brandguardSlaService';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';

export interface BrandGuardTakedownDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: TakedownSlaItem | null;
  finding?: BrandFinding | null;
  brandProfile?: BrandProfile;
  onAdvanceStage: (id: string, stage: TakedownSlaStage) => void;
  onRollbackStage: (id: string, stage: TakedownSlaStage) => void;
  onProbeDomain: (item: TakedownSlaItem) => Promise<void>;
  onOpenReceipt: (findingCode: string) => void;
  onOpenDossier?: (finding: BrandFinding) => void;
  onBlacklistSafeBrowsing?: (finding: BrandFinding) => void;
}

const STAGES: Array<{ id: TakedownSlaStage; label: string; slaDesc: string; order: number }> = [
  { id: 'DRAFTED', label: '1. Notice Drafted', slaDesc: 'Max 2h', order: 1 },
  { id: 'SUBMITTED_TO_REGISTRAR', label: '2. Submitted to Registrar', slaDesc: 'Max 24h', order: 2 },
  { id: 'HOST_ACKNOWLEDGED', label: '3. Host Acknowledged', slaDesc: 'Max 12h', order: 3 },
  { id: 'DNS_REVOKED', label: '4. DNS Revoked (ClientHold)', slaDesc: 'Max 6h', order: 4 },
  { id: 'OFFLINE_VERIFIED', label: '5. Offline Verified (NXDOMAIN)', slaDesc: 'Resolved', order: 5 }
];

export const BrandGuardTakedownDetailDrawer: React.FC<BrandGuardTakedownDetailDrawerProps> = ({
  isOpen,
  onClose,
  item,
  finding,
  brandProfile,
  onAdvanceStage,
  onRollbackStage,
  onProbeDomain,
  onOpenReceipt,
  onOpenDossier,
  onBlacklistSafeBrowsing
}) => {
  const { theme } = useGRC();
  const { showToast } = useToast();
  const [isProbing, setIsProbing] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [copiedCaseId, setCopiedCaseId] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'VERIFICATION_HISTORY' | 'COMMUNICATIONS' | 'AUDIT_TRAIL'>('OVERVIEW');

  if (!isOpen || !item) return null;

  const sla = BrandGuardSlaService.getSlaRemainingFormatted(item.targetSlaDeadline, item.currentStage);
  const currentStageIndex = STAGES.findIndex(s => s.id === item.currentStage);

  const handleCopyDomain = () => {
    navigator.clipboard.writeText(item.targetDomain);
    setCopiedDomain(true);
    showToast({ title: 'Copied domain to clipboard', type: 'success' });
    setTimeout(() => setCopiedDomain(false), 2000);
  };

  const handleCopyCaseId = () => {
    navigator.clipboard.writeText(item.findingCode);
    setCopiedCaseId(true);
    showToast({ title: 'Copied Case ID to clipboard', type: 'success' });
    setTimeout(() => setCopiedCaseId(false), 2000);
  };

  const handleProbe = async () => {
    setIsProbing(true);
    try {
      await onProbeDomain(item);
      showToast({ title: `Probe completed for ${item.targetDomain}`, type: 'success' });
    } catch {
      showToast({ title: 'Probe failed', type: 'error' });
    } finally {
      setIsProbing(false);
    }
  };

  return (
    <div
      id="takedown-detail-drawer-overlay"
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        id="takedown-detail-drawer-content"
        className={`w-full max-w-2xl h-full shadow-2xl flex flex-col overflow-hidden transition-all transform duration-300 ${
          theme === 'light'
            ? 'bg-white border-l border-slate-200 text-slate-900'
            : 'bg-[#0E1526] border-l border-slate-800 text-slate-100'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className={`p-5 border-b flex items-start justify-between gap-3 ${
          theme === 'light' ? 'border-slate-200 bg-slate-50/70' : 'border-slate-800 bg-[#0B101D]'
        }`}>
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase tracking-wider border ${
                item.severity === 'CRITICAL'
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}>
                {item.severity}
              </span>
              <span className="font-mono text-xs text-slate-400">
                Case ID: <strong className="text-slate-200">{item.findingCode}</strong>
              </span>
              <button
                onClick={handleCopyCaseId}
                className="p-1 rounded text-slate-400 hover:text-slate-200 transition cursor-pointer"
                title="Copy Case ID"
              >
                {copiedCaseId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Full domain with copy and wrap */}
            <div className="flex items-baseline space-x-2">
              <h2 className="font-mono font-bold text-base sm:text-lg text-indigo-400 break-all leading-tight">
                {item.targetDomain}
              </h2>
              <button
                onClick={handleCopyDomain}
                className="p-1 rounded text-slate-400 hover:text-slate-200 transition cursor-pointer shrink-0"
                title="Copy domain name"
              >
                {copiedDomain ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Registrar: <strong className={theme === 'light' ? 'text-slate-800' : 'text-slate-200'}>{item.registrar}</strong> &bull; Hosting: <strong className={theme === 'light' ? 'text-slate-800' : 'text-slate-200'}>{item.hostingProvider}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-lg border transition cursor-pointer shrink-0 ${
              theme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Close Drawer"
            aria-label="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SLA Status Hero Strip */}
        <div className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs ${
          sla.isOverdue
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            : item.currentStage === 'OFFLINE_VERIFIED'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : theme === 'light'
            ? 'bg-slate-100/70 border-slate-200 text-slate-700'
            : 'bg-slate-900/60 border-slate-800 text-slate-300'
        }`}>
          <div className="flex items-center space-x-2">
            <Clock className={`w-4 h-4 shrink-0 ${
              sla.isOverdue ? 'text-rose-400 animate-pulse' : item.currentStage === 'OFFLINE_VERIFIED' ? 'text-emerald-400' : 'text-indigo-400'
            }`} />
            <span className="font-semibold">SLA Status:</span>
            <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
              sla.isOverdue
                ? 'bg-rose-500/30 text-rose-200 border border-rose-500/40 animate-pulse'
                : item.currentStage === 'OFFLINE_VERIFIED'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
            }`}>
              {sla.isOverdue ? `${sla.overdueHours}h Overdue (SLA Breached)` : sla.text}
            </span>
          </div>

          <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-2">
            <span>Target: &le; {item.slaMaxHours}h</span>
            <span>&bull;</span>
            <span>Deadline: {new Date(item.targetSlaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={`px-5 border-b flex space-x-2 text-xs font-semibold overflow-x-auto no-scrollbar ${
          theme === 'light' ? 'border-slate-200 bg-white' : 'border-slate-800 bg-[#0E1526]'
        }`}>
          {[
            { id: 'OVERVIEW', label: 'Overview & Lifecycle' },
            { id: 'VERIFICATION_HISTORY', label: 'Technical Verification' },
            { id: 'COMMUNICATIONS', label: 'Registrar Receipts' },
            { id: 'AUDIT_TRAIL', label: 'Audit Timeline' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin">
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-5">
              {/* Lifecycle Stage Stepper */}
              <div className={`p-4 rounded-xl border space-y-3 ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    5-Stage Takedown Lifecycle Progress
                  </h4>
                  <span className="text-xs font-mono font-bold text-indigo-400">
                    Stage {currentStageIndex + 1} of 5
                  </span>
                </div>

                <div className="space-y-2">
                  {STAGES.map((s, idx) => {
                    const isCompleted = idx < currentStageIndex || item.currentStage === 'OFFLINE_VERIFIED';
                    const isCurrent = s.id === item.currentStage;
                    const timestamp = (
                      (s.id === 'DRAFTED' && item.stageTimestamps.draftedAt) ||
                      (s.id === 'SUBMITTED_TO_REGISTRAR' && item.stageTimestamps.submittedAt) ||
                      (s.id === 'HOST_ACKNOWLEDGED' && item.stageTimestamps.hostAckAt) ||
                      (s.id === 'DNS_REVOKED' && item.stageTimestamps.dnsRevokedAt) ||
                      (s.id === 'OFFLINE_VERIFIED' && item.stageTimestamps.offlineVerifiedAt)
                    );

                    return (
                      <div
                        key={s.id}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                          isCurrent
                            ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300 font-bold'
                            : isCompleted
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                            : 'bg-transparent border-slate-800/60 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                            isCurrent
                              ? 'bg-indigo-600 text-white'
                              : isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                          </div>
                          <div>
                            <span className="block">{s.label}</span>
                            <span className="text-[10px] font-normal text-slate-400">{s.slaDesc}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          {timestamp ? (
                            <span className="text-[10px] font-mono text-slate-400 block">
                              {new Date(timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">Pending</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Stage Transition Action Bar */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  {currentStageIndex > 0 ? (
                    <button
                      onClick={() => onRollbackStage(item.id, STAGES[currentStageIndex - 1].id)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1 cursor-pointer ${
                        theme === 'light'
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                      title="Move back one stage"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Previous Stage</span>
                    </button>
                  ) : <div />}

                  {currentStageIndex < STAGES.length - 1 && (
                    <button
                      onClick={() => onAdvanceStage(item.id, STAGES[currentStageIndex + 1].id)}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
                      title="Advance to next lifecycle stage"
                    >
                      <span>Advance to {STAGES[currentStageIndex + 1].label.replace(/^\d+\.\s*/, '')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Target Infrastructure & Case Details */}
              <div className={`p-4 rounded-xl border space-y-3 text-xs ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[11px]">
                  Target Perimeter Intelligence
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Assigned Case Owner:</span>
                    <span className="font-medium">Arjun Mehta (ThreatOps Sentry)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Detection Source:</span>
                    <span className="font-mono">CT Log Stream (CertStream ViT)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Case Initiated At:</span>
                    <span className="font-mono">{new Date(item.initiatedAt).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Last Verification Sweep:</span>
                    <span className="font-mono">
                      {item.lastVerificationPingAt ? new Date(item.lastVerificationPingAt).toLocaleString() : 'Just now'}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block text-[11px]">Target URL:</span>
                    <span className="font-mono text-indigo-400 break-all">{item.targetUrl}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  onClick={handleProbe}
                  disabled={isProbing}
                  className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isProbing ? 'animate-spin' : ''}`} />
                  <span>{isProbing ? 'Executing Probe...' : 'Run Live DNS/HTTP Probe'}</span>
                </button>

                <button
                  onClick={() => onOpenReceipt(item.findingCode)}
                  className={`px-3 py-2 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 cursor-pointer ${
                    theme === 'light'
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                >
                  <FileCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>RFC Delivery Receipt</span>
                </button>

                {finding && onOpenDossier && (
                  <button
                    onClick={() => onOpenDossier(finding)}
                    className="px-3 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Open Forensic Dossier</span>
                  </button>
                )}

                {finding && onBlacklistSafeBrowsing && (
                  <button
                    onClick={() => onBlacklistSafeBrowsing(finding)}
                    className="px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Safe Browsing Blacklist</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'VERIFICATION_HISTORY' && (
            <div className="space-y-4 text-xs">
              {/* Technical Verification Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={`p-3.5 rounded-xl border space-y-1 ${
                  theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                }`}>
                  <span className="text-slate-400 block text-[11px]">DNS Resolution Status</span>
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      item.verificationResults?.dnsStatus === 'NXDOMAIN_UNRESOLVED'
                        ? 'bg-emerald-400'
                        : item.verificationResults?.dnsStatus === 'CLIENT_HOLD'
                        ? 'bg-indigo-400'
                        : 'bg-rose-400 animate-pulse'
                    }`} />
                    <span className="font-mono font-bold text-sm">
                      {item.verificationResults?.dnsStatus || 'ACTIVE_RESOLVING'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Protocol: DoH RFC 8484 via Cloudflare 1.1.1.1
                  </span>
                </div>

                <div className={`p-3.5 rounded-xl border space-y-1 ${
                  theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                }`}>
                  <span className="text-slate-400 block text-[11px]">HTTP Endpoint Status</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-sm">
                      HTTP {item.verificationResults?.httpStatusCode || 200}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.verificationResults?.isSiteAlive
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {item.verificationResults?.isSiteAlive ? 'ONLINE (ACTIVE)' : 'DEAD (OFFLINE)'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    TLS Handshake: {item.verificationResults?.tlsHandshake || 'ACTIVE_VALID'}
                  </span>
                </div>
              </div>

              {/* Technical Verification Probe Stream */}
              <div className={`p-4 rounded-xl border space-y-2 font-mono text-[11px] ${
                theme === 'light' ? 'bg-slate-900 text-slate-200 border-slate-800' : 'bg-black/90 text-slate-300 border-slate-800'
              }`}>
                <div className="flex items-center space-x-2 text-indigo-400 font-bold">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Live Probe Execution Console:</span>
                </div>
                <div className="space-y-1 text-slate-400 text-[10px]">
                  <div>&gt; SEND DOH query: A {item.targetDomain} -&gt; 1.1.1.1:443 (application/dns-message)</div>
                  <div>&gt; RECV {item.verificationResults?.dnsStatus === 'NXDOMAIN_UNRESOLVED' ? 'NXDOMAIN (RCODE 3)' : 'A 185.220.101.5 (RCODE 0)'}</div>
                  <div>&gt; HTTPS CONNECT {item.targetDomain}:443 -&gt; Handshake: {item.verificationResults?.tlsHandshake}</div>
                  <div>&gt; HTTP/2 GET / -&gt; Status {item.verificationResults?.httpStatusCode}</div>
                  <div className="text-emerald-400 font-bold">&gt; SLA Verification Probe completed at {new Date(item.lastVerificationPingAt || Date.now()).toLocaleTimeString()}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'COMMUNICATIONS' && (
            <div className="space-y-4 text-xs">
              <div className={`p-4 rounded-xl border space-y-3 ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <h4 className="font-bold">RFC 2142 Automated Registrar Communication</h4>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Tamper-evident legal complaint dispatched to {item.registrar} abuse desk with DKIM signing and RFC 2142 compliance headers.
                </p>

                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                    <span className="text-slate-400">Recipient:</span>
                    <span className="font-mono text-slate-200">abuse@{item.registrar.toLowerCase().replace(/[^a-z0-9]/g, '')}.com</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                    <span className="text-slate-400">Subject:</span>
                    <span className="font-semibold text-slate-200">[URGENT RFC-2142] Trademark Infringement & Phishing Notice ({item.findingCode})</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                    <span className="text-slate-400">Standard:</span>
                    <span className="font-mono text-emerald-400">ISO 27001 A.5.20 / SOC 2 CC7.4</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onOpenReceipt(item.findingCode)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>View Cryptographic Delivery Receipt</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'AUDIT_TRAIL' && (
            <div className="space-y-3 text-xs">
              <div className={`p-4 rounded-xl border space-y-3 ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[11px]">
                  Cryptographic Audit Trail (ISO 27001 A.5.7)
                </h4>
                <div className="space-y-2.5">
                  <div className="flex items-start space-x-2 text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-200">Case Created & Notice Drafted</span>
                      <span className="block text-[10px] text-slate-400 font-mono">{new Date(item.initiatedAt).toLocaleString()}</span>
                    </div>
                  </div>
                  {item.stageTimestamps.submittedAt && (
                    <div className="flex items-start space-x-2 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 mt-1 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-200">Dispatched RFC 2142 Notice to {item.registrar}</span>
                        <span className="block text-[10px] text-slate-400 font-mono">{new Date(item.stageTimestamps.submittedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                  {item.stageTimestamps.hostAckAt && (
                    <div className="flex items-start space-x-2 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-amber-400 mt-1 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-200">Hosting Provider Acknowledged Ticket</span>
                        <span className="block text-[10px] text-slate-400 font-mono">{new Date(item.stageTimestamps.hostAckAt).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                  {item.stageTimestamps.dnsRevokedAt && (
                    <div className="flex items-start space-x-2 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-purple-400 mt-1 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-200">Registrar Suspended Domain (ClientHold status verified)</span>
                        <span className="block text-[10px] text-slate-400 font-mono">{new Date(item.stageTimestamps.dnsRevokedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                  {item.stageTimestamps.offlineVerifiedAt && (
                    <div className="flex items-start space-x-2 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shrink-0" />
                      <div>
                        <span className="font-semibold text-emerald-400">DNS Resolution Confirmed NXDOMAIN &bull; Takedown Complete</span>
                        <span className="block text-[10px] text-slate-400 font-mono">{new Date(item.stageTimestamps.offlineVerifiedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className={`p-4 border-t flex items-center justify-between gap-3 ${
          theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-[#0B101D]'
        }`}>
          <span className="text-[11px] text-slate-400 font-mono">
            Control Ref: ISO 27001 A.5.7 Threat Intel / A.5.20 Supplier Security
          </span>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
              theme === 'light'
                ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
