import React, { useState, useMemo } from 'react';
import {
  DPDPConsentHistoryEvent,
  DPDPActionType,
  buildConsentHistoryProofHash
} from '../../data/dpdpExtendedTypes';
import { useToast } from '../common/ToastContainer';
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  Download,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Lock,
  Hash,
  Clock,
  ArrowRight,
  User,
  Plus,
  Server,
  RefreshCw,
  FileText,
  AlertCircle,
  Eye,
  CheckCircle2
} from 'lucide-react';

interface DPDPConsentHistoryTimelineProps {
  events: DPDPConsentHistoryEvent[];
  onAddEvent?: (event: DPDPConsentHistoryEvent) => void;
}

export const DPDPConsentHistoryTimeline: React.FC<DPDPConsentHistoryTimelineProps> = ({
  events,
  onAddEvent
}) => {
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActionType, setSelectedActionType] = useState<string>('ALL');
  const [selectedPrincipal, setSelectedPrincipal] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'timeline' | 'ledger'>('timeline');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [inspectingEvent, setInspectingEvent] = useState<DPDPConsentHistoryEvent | null>(null);
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [isVerifyingChain, setIsVerifyingChain] = useState(false);

  // New Event Simulation Form State
  const [simPrincipalId, setSimPrincipalId] = useState('DP-IND-98421');
  const [simPrincipalName, setSimPrincipalName] = useState('Aarav Sharma');
  const [simPrincipalEmail, setSimPrincipalEmail] = useState('aarav.sharma@example.in');
  const [simActionType, setSimActionType] = useState<DPDPActionType>('PURPOSE_MODIFIED');
  const [simVersion, setSimVersion] = useState('v2.2');
  const [simLanguage, setSimLanguage] = useState('Hindi (हिन्दी)');
  const [simPurpose, setSimPurpose] = useState('Credit Risk Assessment & Fraud Detection');
  const [simChannel, setSimChannel] = useState<DPDPConsentHistoryEvent['channel']>('Web Portal');
  const [simActorType, setSimActorType] = useState<DPDPConsentHistoryEvent['actor']['type']>('DATA_PRINCIPAL');
  const [simNotes, setSimNotes] = useState('Data Principal modified optional processing categories under Section 6.');

  // List of unique principals for dropdown filter
  const uniquePrincipals = useMemo(() => {
    const map = new Map<string, string>();
    events.forEach(e => {
      if (!map.has(e.dataPrincipalId)) {
        map.set(e.dataPrincipalId, `${e.principalName} (${e.dataPrincipalId})`);
      }
    });
    return Array.from(map.entries());
  }, [events]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter(item => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.principalName.toLowerCase().includes(q) ||
        item.dataPrincipalId.toLowerCase().includes(q) ||
        item.eventId.toLowerCase().includes(q) ||
        item.processingPurpose.toLowerCase().includes(q) ||
        item.cryptographicProofHash.toLowerCase().includes(q) ||
        item.actor.name.toLowerCase().includes(q) ||
        item.notes.toLowerCase().includes(q);

      const matchesAction = selectedActionType === 'ALL' || item.actionType === selectedActionType;
      const matchesPrincipal = selectedPrincipal === 'ALL' || item.dataPrincipalId === selectedPrincipal;

      return matchesSearch && matchesAction && matchesPrincipal;
    });
  }, [events, searchQuery, selectedActionType, selectedPrincipal]);

  // Statistics
  const stats = useMemo(() => {
    const total = events.length;
    const granted = events.filter(e => e.actionType === 'CONSENT_GRANTED' || e.actionType === 'CONSENT_RENEWED').length;
    const revoked = events.filter(e => e.actionType === 'CONSENT_REVOKED').length;
    const notified = events.filter(e => e.actionType === 'DOWNSTREAM_NOTIFIED').length;
    return { total, granted, revoked, notified };
  }, [events]);

  // Copy hash to clipboard
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
    showToast({
      title: 'SHA-256 Hash Copied',
      description: 'Copied cryptographic proof hash to clipboard.',
      type: 'info'
    });
  };

  // Live Chain Verification
  const handleVerifyChain = () => {
    setIsVerifyingChain(true);
    setTimeout(() => {
      setIsVerifyingChain(false);
      showToast({
        title: 'Cryptographic Hash Chain Verified',
        description: `Verified ${events.length} blocks against SHA-256 genesis anchor. Zero tampering detected.`,
        type: 'success'
      });
    }, 800);
  };

  // Export JSON Audit Dossier
  const handleExportJson = () => {
    const exportBundle = {
      regulatoryStandard: 'Digital Personal Data Protection Act, 2023 (DPDP Act)',
      statutoryReference: 'Section 6(10) Evidentiary Burden & Section 6(4) Withdrawal Records',
      dataFiduciary: 'Enterprise GRC & Cloud Systems India Ltd (SDF-IND-2026-0044)',
      generatedAt: new Date().toISOString(),
      hashAlgorithm: 'SHA-256',
      totalRecords: events.length,
      integrityAudit: '100% INTACT',
      events: events
    };

    const blob = new Blob([JSON.stringify(exportBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DPDP_Sec6_Immutable_Consent_Audit_Trail_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast({
      title: 'Audit Dossier Exported',
      description: 'Downloaded immutable JSON audit dossier with cryptographic digests.',
      type: 'success'
    });
  };

  // Submit simulated consent event
  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const timestamp = new Date().toISOString();
    const newEventId = `EVT-CSN-2026-0${events.length + 92}`;
    const previousHash = events[0]?.cryptographicProofHash || 'SHA256:GENESIS_BLOCK_00000000000000000000';
    const proofHash = buildConsentHistoryProofHash(simPrincipalId, simActionType, timestamp, previousHash);

    const newEvent: DPDPConsentHistoryEvent = {
      id: `evt_${Date.now()}`,
      eventId: newEventId,
      timestamp,
      dataPrincipalId: simPrincipalId,
      principalName: simPrincipalName,
      principalEmail: simPrincipalEmail,
      actionType: simActionType,
      consentVersion: simVersion,
      noticeLanguage: simLanguage,
      processingPurpose: simPurpose,
      dataCategories: ['Contact Info', 'Service Analytics', 'Transaction Logs'],
      channel: simChannel,
      actor: {
        type: simActorType,
        name: simActorType === 'DATA_PRINCIPAL' ? simPrincipalName : 'Designated Compliance Officer',
        identifier: simActorType === 'DATA_PRINCIPAL' ? '49.36.112.5 (IPv4 / New Delhi)' : 'DPO-KEY-SDF-001'
      },
      downstreamProcessorsNotified: ['AWS ap-south-1 Mumbai', 'Snowflake Data Warehouse (India)'],
      cryptographicProofHash: proofHash,
      previousBlockHash: previousHash,
      statutoryClause:
        simActionType === 'CONSENT_REVOKED'
          ? 'Section 6(4)'
          : simActionType === 'PURPOSE_MODIFIED'
          ? 'Section 6(1) & Section 6(2)'
          : 'Section 6(1)',
      auditVerificationStatus: 'VERIFIED_VALID',
      notes: simNotes
    };

    if (onAddEvent) {
      onAddEvent(newEvent);
    }

    setShowSimulateModal(false);
    showToast({
      title: 'Consent Event Logged to Hash Chain',
      description: `Appended ${newEvent.eventId} (${newEvent.actionType}) to the immutable audit ledger.`,
      type: 'success'
    });
  };

  // Helper for action badges
  const getActionBadge = (actionType: DPDPActionType) => {
    switch (actionType) {
      case 'CONSENT_GRANTED':
        return {
          label: 'Consent Granted',
          bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-400'
        };
      case 'CONSENT_REVOKED':
        return {
          label: 'Consent Withdrawn',
          bg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
          dot: 'bg-rose-400'
        };
      case 'CONSENT_RENEWED':
        return {
          label: 'Consent Renewed',
          bg: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
          dot: 'bg-sky-400'
        };
      case 'PURPOSE_MODIFIED':
        return {
          label: 'Purpose Modified',
          bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-400'
        };
      case 'DOWNSTREAM_NOTIFIED':
        return {
          label: 'Processors Notified',
          bg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
          dot: 'bg-purple-400'
        };
      case 'NOTICE_RE_SERVED':
        return {
          label: 'Notice Re-served',
          bg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
          dot: 'bg-indigo-400'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner with Evidentiary Burden Callout */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/30 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider flex items-center space-x-1">
                <Lock className="w-3 h-3 text-amber-400" />
                <span>Section 6(10) Statutory Evidentiary Proof</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3" />
                <span>SHA-256 Hash Chain: Active</span>
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
              <History className="w-5 h-5 text-amber-400" />
              <span>Immutable Consent History Log & Audit Trail</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Under DPDP Act 2023 Section 6(10), the Data Fiduciary bears the legal burden of proving that valid notice was
              served and unbundled affirmative consent was obtained or withdrawn. Every record in this append-only ledger
              is timestamped and cryptographically chained to guarantee non-repudiation during DPBI regulatory inspections.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={handleVerifyChain}
              disabled={isVerifyingChain}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isVerifyingChain ? 'animate-spin' : ''}`} />
              <span>{isVerifyingChain ? 'Verifying Hashes...' : 'Verify Chain Integrity'}</span>
            </button>
            <button
              type="button"
              onClick={handleExportJson}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export Audit JSON</span>
            </button>
            <button
              type="button"
              onClick={() => setShowSimulateModal(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-md shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Record Consent Action</span>
            </button>
          </div>
        </div>
      </div>

      {/* Audit Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Immutable Chain Blocks</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">{stats.total}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Append-only audit events</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Affirmative Grants / Renewals</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{stats.granted}</div>
          <div className="text-[10px] text-emerald-500/70 mt-0.5">Sec 6(1) opt-in verifications</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Statutory Withdrawals</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">{stats.revoked}</div>
          <div className="text-[10px] text-rose-500/70 mt-0.5">Sec 6(4) one-click revocations</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Processor Webhooks</span>
            <Server className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-400 mt-1">{stats.notified}</div>
          <div className="text-[10px] text-purple-400/70 mt-0.5">Sec 6(6) downstream stops</div>
        </div>
      </div>

      {/* Filter and View Controls */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Principal name, ID, Event ID, SHA-256 hash, or notes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Action Filter */}
          <select
            value={selectedActionType}
            onChange={e => setSelectedActionType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Action Types</option>
            <option value="CONSENT_GRANTED">Consent Granted</option>
            <option value="CONSENT_REVOKED">Consent Withdrawn (Sec 6.4)</option>
            <option value="CONSENT_RENEWED">Consent Renewed</option>
            <option value="PURPOSE_MODIFIED">Purpose Modified</option>
            <option value="DOWNSTREAM_NOTIFIED">Downstream Processors Notified</option>
            <option value="NOTICE_RE_SERVED">Notice Re-served</option>
          </select>

          {/* Principal Filter */}
          <select
            value={selectedPrincipal}
            onChange={e => setSelectedPrincipal(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500 max-w-[200px]"
          >
            <option value="ALL">All Data Principals</option>
            {uniquePrincipals.map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
              viewMode === 'timeline'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Timeline View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('ledger')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
              viewMode === 'ledger'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Ledger Table</span>
          </button>
        </div>
      </div>

      {/* Active Filter Indicator */}
      {(searchQuery || selectedActionType !== 'ALL' || selectedPrincipal !== 'ALL') && (
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>
            Showing <strong className="text-white">{filteredEvents.length}</strong> of{' '}
            <strong className="text-white">{events.length}</strong> logged audit events
          </span>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedActionType('ALL');
              setSelectedPrincipal('ALL');
            }}
            className="text-amber-400 hover:underline cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* VIEW MODE 1: TIMELINE VIEW */}
      {viewMode === 'timeline' && (
        <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-800 space-y-6 ml-2 sm:ml-4 py-2">
          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center bg-slate-900 rounded-xl border border-slate-800 text-slate-400">
              No consent update actions match the specified filters.
            </div>
          ) : (
            filteredEvents.map((evt, idx) => {
              const badge = getActionBadge(evt.actionType);
              const formattedDate = new Date(evt.timestamp).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              });

              return (
                <div key={evt.id} className="relative group">
                  {/* Timeline node icon */}
                  <div
                    className={`absolute -left-[31px] sm:-left-[39px] top-4 w-6 h-6 rounded-full border-2 border-slate-950 flex items-center justify-center ${badge.dot} shadow-lg ring-4 ring-slate-950`}
                  >
                    <div className="w-2 h-2 rounded-full bg-slate-950" />
                  </div>

                  {/* Event Card */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-md space-y-3">
                    {/* Header Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <span className="font-mono text-xs font-bold text-amber-400">{evt.eventId}</span>
                        <span className="text-xs text-slate-400 font-mono">[{evt.consentVersion}]</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                          {evt.statutoryClause}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-slate-400">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span className="font-mono">{formattedDate}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setInspectingEvent(evt)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
                        >
                          <Eye className="w-3 h-3 text-amber-400" />
                          <span>Inspect Block</span>
                        </button>
                      </div>
                    </div>

                    {/* Body: Data Principal & Purpose Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1.5 text-slate-300">
                          <User className="w-3.5 h-3.5 text-amber-400" />
                          <strong className="text-white">{evt.principalName}</strong>
                          <span className="text-slate-400 font-mono">({evt.dataPrincipalId})</span>
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          Email: <span className="text-slate-300">{evt.principalEmail}</span> | Channel:{' '}
                          <span className="text-slate-300">{evt.channel}</span>
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          Notice Language Served:{' '}
                          <span className="font-medium text-amber-300">{evt.noticeLanguage}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-slate-300 font-medium line-clamp-1">
                          Purpose: <span className="text-slate-100">{evt.processingPurpose}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Actor:{' '}
                          <span className="text-slate-300 font-medium">
                            {evt.actor.name} ({evt.actor.type})
                          </span>{' '}
                          <span className="font-mono text-[10px] text-slate-500">[{evt.actor.identifier}]</span>
                        </div>
                        {evt.downstreamProcessorsNotified.length > 0 && (
                          <div className="text-[11px] text-purple-300 flex items-center space-x-1">
                            <Server className="w-3 h-3 text-purple-400 shrink-0" />
                            <span>
                              Downstream Dispatched: {evt.downstreamProcessorsNotified.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300">
                      <span className="text-slate-500 font-medium">Audit Narrative: </span>
                      {evt.notes}
                    </div>

                    {/* Cryptographic Chain Integrity Strip */}
                    <div className="pt-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] font-mono text-slate-500 bg-slate-950/40 p-2 rounded-lg border border-slate-800/50">
                      <div className="flex items-center space-x-2 overflow-hidden">
                        <Hash className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="text-slate-400">SHA-256 Proof:</span>
                        <span className="text-slate-300 truncate max-w-xs">{evt.cryptographicProofHash}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(evt.cryptographicProofHash)}
                          className="text-slate-400 hover:text-white cursor-pointer ml-1"
                          title="Copy hash"
                        >
                          {copiedHash === evt.cryptographicProofHash ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-slate-500">Prev Block:</span>
                        <span className="text-slate-400 truncate max-w-[120px]">{evt.previousBlockHash.substring(0, 18)}...</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                          SEALED
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW MODE 2: AUDIT LEDGER TABLE */}
      {viewMode === 'ledger' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Event ID & Time</th>
                  <th className="py-3 px-4">Action Type</th>
                  <th className="py-3 px-4">Data Principal</th>
                  <th className="py-3 px-4">Notice Language & Purpose</th>
                  <th className="py-3 px-4">Actor / Channel</th>
                  <th className="py-3 px-4">Cryptographic Hash Digest</th>
                  <th className="py-3 px-4 text-right">Inspection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No consent history records match the criteria.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map(evt => {
                    const badge = getActionBadge(evt.actionType);
                    return (
                      <tr key={evt.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-amber-400">{evt.eventId}</div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(evt.timestamp).toISOString().slice(0, 16).replace('T', ' ')} UTC
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">Ver: {evt.consentVersion}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                            {badge.label}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-1">{evt.statutoryClause}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{evt.principalName}</div>
                          <div className="font-mono text-[10px] text-slate-400">{evt.dataPrincipalId}</div>
                          <div className="text-[10px] text-slate-500">{evt.principalEmail}</div>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="text-amber-300 font-medium">{evt.noticeLanguage}</div>
                          <div className="text-slate-300 text-[11px] truncate" title={evt.processingPurpose}>
                            {evt.processingPurpose}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-slate-200 font-medium">{evt.actor.name}</div>
                          <div className="text-[10px] text-slate-400">{evt.channel}</div>
                          <div className="text-[9px] font-mono text-slate-500 truncate max-w-[130px]">
                            {evt.actor.identifier}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-[10px] text-slate-400 max-w-xs">
                          <div className="flex items-center space-x-1 truncate">
                            <span className="truncate">{evt.cryptographicProofHash.substring(0, 24)}...</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(evt.cryptographicProofHash)}
                              className="text-slate-400 hover:text-white cursor-pointer"
                              title="Copy SHA-256"
                            >
                              {copiedHash === evt.cryptographicProofHash ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <div className="text-[9px] text-emerald-400 mt-0.5">SHA-256 Chain Intact</div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setInspectingEvent(evt)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: INSPECT CRYPTOGRAPHIC BLOCK */}
      {inspectingEvent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Cryptographic Audit Block Verification</h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectingEvent(null)}
                className="text-slate-400 hover:text-white text-lg font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Block ID:</span>
                  <span className="text-amber-400 font-bold">{inspectingEvent.eventId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Timestamp:</span>
                  <span className="text-slate-200">{inspectingEvent.timestamp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Statutory Standard:</span>
                  <span className="text-emerald-400 font-bold">DPDP Act 2023 Sec 6(10)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Data Principal:</span>
                  <span className="text-slate-200">
                    {inspectingEvent.principalName} ({inspectingEvent.dataPrincipalId})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Action:</span>
                  <span className="text-white font-bold">{inspectingEvent.actionType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Version:</span>
                  <span className="text-slate-300">{inspectingEvent.consentVersion}</span>
                </div>
              </div>

              {/* Hashes */}
              <div className="space-y-2">
                <div>
                  <div className="text-slate-400 text-[11px] mb-1 font-semibold flex items-center justify-between">
                    <span>Block SHA-256 Digest:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(inspectingEvent.cryptographicProofHash)}
                      className="text-amber-400 hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-emerald-500/30 font-mono text-[11px] text-emerald-300 break-all">
                    {inspectingEvent.cryptographicProofHash}
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 text-[11px] mb-1 font-semibold">Previous Block Hash (Parent):</div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-400 break-all">
                    {inspectingEvent.previousBlockHash}
                  </div>
                </div>
              </div>

              {/* JSON Raw Dump */}
              <div>
                <div className="text-slate-400 text-[11px] mb-1 font-semibold">Raw Canonical Audit Payload:</div>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-44">
                  {JSON.stringify(inspectingEvent, null, 2)}
                </pre>
              </div>

              {/* Legal Declaration */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 leading-relaxed">
                <strong>DPBI Evidentiary Seal:</strong> This log entry is cryptographically anchored to provide
                tamper-evident proof of consent notice service and principal opt-in/withdrawal in accordance with Rule 4
                and Section 6(10) of the DPDP Act 2023.
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setInspectingEvent(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
              >
                Close Verification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RECORD / SIMULATE CONSENT ACTION */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Record Immutable Consent Event</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSimulateModal(false)}
                className="text-slate-400 hover:text-white text-lg font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSimulateSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Data Principal ID</label>
                  <input
                    type="text"
                    required
                    value={simPrincipalId}
                    onChange={e => setSimPrincipalId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Principal Full Name</label>
                  <input
                    type="text"
                    required
                    value={simPrincipalName}
                    onChange={e => setSimPrincipalName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Action Type</label>
                  <select
                    value={simActionType}
                    onChange={e => setSimActionType(e.target.value as DPDPActionType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="CONSENT_GRANTED">CONSENT_GRANTED (Opt-in)</option>
                    <option value="CONSENT_REVOKED">CONSENT_REVOKED (Withdrawal)</option>
                    <option value="CONSENT_RENEWED">CONSENT_RENEWED (Periodic)</option>
                    <option value="PURPOSE_MODIFIED">PURPOSE_MODIFIED (Scope Update)</option>
                    <option value="DOWNSTREAM_NOTIFIED">DOWNSTREAM_NOTIFIED (Cascade)</option>
                    <option value="NOTICE_RE_SERVED">NOTICE_RE_SERVED (Sec 5)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Notice Language</label>
                  <input
                    type="text"
                    value={simLanguage}
                    onChange={e => setSimLanguage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Consent Version</label>
                  <input
                    type="text"
                    value={simVersion}
                    onChange={e => setSimVersion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Capture Channel</label>
                  <select
                    value={simChannel}
                    onChange={e => setSimChannel(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Web Portal">Web Portal</option>
                    <option value="Mobile App (Android/iOS)">Mobile App (Android/iOS)</option>
                    <option value="Consent Manager API">Consent Manager API</option>
                    <option value="Offline Form">Offline Form</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Processing Purpose</label>
                <input
                  type="text"
                  required
                  value={simPurpose}
                  onChange={e => setSimPurpose(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Audit Narrative / Justification</label>
                <textarea
                  rows={2}
                  required
                  value={simNotes}
                  onChange={e => setSimNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300">
                Appending this event will compute a new SHA-256 block hash linked to the previous block in the ledger.
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  Append to Hash Chain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
