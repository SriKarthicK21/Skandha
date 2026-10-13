import React, { useState, useMemo, useEffect } from 'react';
import {
  DPDPUserConsentRecord,
  DPDPGrievanceRecord,
  INITIAL_DPDP_CONSENTS,
  INITIAL_DPDP_GRIEVANCES
} from '../../data/dpdpMasterData';
import {
  generateStandardConsentArtifact,
  DPDPStandardConsentArtifact,
  DPDPConsentHistoryEvent,
  INITIAL_CONSENT_HISTORY_EVENTS,
  buildConsentHistoryProofHash
} from '../../data/dpdpExtendedTypes';
import { DPDPConsentHistoryTimeline } from './DPDPConsentHistoryTimeline';
import { DPDPGrievanceSlaDashboard } from './DPDPGrievanceSlaDashboard';
import { useToast } from '../common/ToastContainer';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Search,
  Filter,
  Plus,
  Languages,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Download,
  Mail,
  User,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  FileText,
  History,
  Timer,
  Flame
} from 'lucide-react';

export const DPDPConsentGrievanceRegister: React.FC = () => {
  const { showToast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<'sla_dashboard' | 'consents' | 'grievances' | 'history'>('sla_dashboard');

  // Consents State
  const [consents, setConsents] = useState<DPDPUserConsentRecord[]>(INITIAL_DPDP_CONSENTS);
  const [consentSearch, setConsentSearch] = useState('');
  const [consentStatusFilter, setConsentStatusFilter] = useState<string>('All');
  const [showAddConsentModal, setShowAddConsentModal] = useState(false);

  // Immutable Consent History Log State
  const [consentHistory, setConsentHistory] = useState<DPDPConsentHistoryEvent[]>(INITIAL_CONSENT_HISTORY_EVENTS);

  // New Consent Form
  const [newPrincipalName, setNewPrincipalName] = useState('');
  const [newPrincipalEmail, setNewPrincipalEmail] = useState('');
  const [newPrincipalPhone, setNewPrincipalPhone] = useState('');
  const [newJurisdictionState, setNewJurisdictionState] = useState('Maharashtra');
  const [newNoticeLanguage, setNewNoticeLanguage] = useState('English');
  const [newProcessingPurpose, setNewProcessingPurpose] = useState('Core Service Account Management');
  const [newConsentChannel, setNewConsentChannel] = useState<DPDPUserConsentRecord['consentChannel']>('Mobile App (Android/iOS)');

  // Grievances State
  const [grievances, setGrievances] = useState<DPDPGrievanceRecord[]>(INITIAL_DPDP_GRIEVANCES);
  const [grievanceSearch, setGrievanceSearch] = useState('');
  const [grievanceStatusFilter, setGrievanceStatusFilter] = useState<string>('All');
  const [showAddGrievanceModal, setShowAddGrievanceModal] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState<DPDPGrievanceRecord | null>(null);
  const [selectedArtifact, setSelectedArtifact] = useState<DPDPStandardConsentArtifact | null>(null);

  // New Grievance Form
  const [newGrvPrincipalName, setNewGrvPrincipalName] = useState('');
  const [newGrvPrincipalEmail, setNewGrvPrincipalEmail] = useState('');
  const [newGrvCategory, setNewGrvCategory] = useState<DPDPGrievanceRecord['category']>('CONSENT_WITHDRAWAL_FAILURE');
  const [newGrvDescription, setNewGrvDescription] = useState('');
  const [newGrvOfficer, setNewGrvOfficer] = useState('Karthik Raman (Designated Grievance Redressal Officer)');

  // Resolution modal state
  const [resolutionText, setResolutionText] = useState('');

  // Indian Languages list (English + Eighth Schedule languages)
  const scheduledLanguages = [
    'English',
    'Hindi (हिन्दी)',
    'Bengali (বাংলা)',
    'Tamil (தமிழ்)',
    'Telugu (తెలుగు)',
    'Marathi (मराठी)',
    'Gujarati (ગુજરાતી)',
    'Kannada (ಕನ್ನಡ)',
    'Malayalam (മലയാളം)',
    'Punjabi (ਪੰਜਾਬੀ)',
    'Odia (ଓଡ଼ିଆ)',
    'Assamese (অসমীয়া)',
    'Urdu (اردو)'
  ];

  // Filtered Consents
  const filteredConsents = useMemo(() => {
    return consents.filter(c => {
      const matchSearch =
        c.principalName.toLowerCase().includes(consentSearch.toLowerCase()) ||
        c.dataPrincipalId.toLowerCase().includes(consentSearch.toLowerCase()) ||
        c.principalEmail.toLowerCase().includes(consentSearch.toLowerCase()) ||
        c.noticeLanguage.toLowerCase().includes(consentSearch.toLowerCase()) ||
        c.processingPurpose.toLowerCase().includes(consentSearch.toLowerCase());

      const matchStatus = consentStatusFilter === 'All' || c.status === consentStatusFilter;

      return matchSearch && matchStatus;
    });
  }, [consents, consentSearch, consentStatusFilter]);

  // Filtered Grievances
  const filteredGrievances = useMemo(() => {
    return grievances.filter(g => {
      const matchSearch =
        g.grievanceCode.toLowerCase().includes(grievanceSearch.toLowerCase()) ||
        g.principalName.toLowerCase().includes(grievanceSearch.toLowerCase()) ||
        g.principalEmail.toLowerCase().includes(grievanceSearch.toLowerCase()) ||
        g.description.toLowerCase().includes(grievanceSearch.toLowerCase());

      const matchStatus = grievanceStatusFilter === 'All' || g.status === grievanceStatusFilter;

      return matchSearch && matchStatus;
    });
  }, [grievances, grievanceSearch, grievanceStatusFilter]);

  // Calculate remaining SLA days and overdue status
  const getSlaRemainingDays = (deadlineIso: string) => {
    const diffMs = new Date(deadlineIso).getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Trigger One-Click Consent Revocation
  const handleRevokeConsent = (id: string) => {
    const target = consents.find(c => c.id === id);
    const nowIso = new Date().toISOString();

    setConsents(prev =>
      prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            status: 'REVOKED',
            revocationDate: nowIso,
            revocationReason: 'Data Principal triggered statutory one-click consent withdrawal.',
            downstreamProcessorsNotified: true
          };
        }
        return c;
      })
    );

    // Append to Immutable Consent History Log
    if (target) {
      const prevHash = consentHistory[0]?.cryptographicProofHash || 'SHA256:GENESIS_BLOCK_00000000000000000000';
      const revokeHash = buildConsentHistoryProofHash(target.dataPrincipalId, 'CONSENT_REVOKED', nowIso, prevHash);
      const notifyHash = buildConsentHistoryProofHash(target.dataPrincipalId, 'DOWNSTREAM_NOTIFIED', nowIso, revokeHash);

      const revokeEvt: DPDPConsentHistoryEvent = {
        id: `evt_${Date.now()}_rev`,
        eventId: `EVT-CSN-2026-0${consentHistory.length + 92}`,
        timestamp: nowIso,
        dataPrincipalId: target.dataPrincipalId,
        principalName: target.principalName,
        principalEmail: target.principalEmail,
        actionType: 'CONSENT_REVOKED',
        consentVersion: target.version,
        noticeLanguage: target.noticeLanguage,
        processingPurpose: target.processingPurpose,
        dataCategories: target.dataCategoriesCollected,
        channel: target.consentChannel,
        actor: {
          type: 'DATA_PRINCIPAL',
          name: target.principalName,
          identifier: 'Web/Mobile Client Attestation'
        },
        downstreamProcessorsNotified: ['AWS ap-south-1 Mumbai', 'Snowflake Data Warehouse (India)'],
        cryptographicProofHash: revokeHash,
        previousBlockHash: prevHash,
        statutoryClause: 'Section 6(4)',
        auditVerificationStatus: 'VERIFIED_VALID',
        notes: `Data Principal exercised statutory one-click withdrawal under Section 6(4). Processing halted immediately.`
      };

      const notifyEvt: DPDPConsentHistoryEvent = {
        id: `evt_${Date.now()}_notif`,
        eventId: `EVT-CSN-2026-0${consentHistory.length + 93}`,
        timestamp: new Date(Date.now() + 150).toISOString(),
        dataPrincipalId: target.dataPrincipalId,
        principalName: target.principalName,
        principalEmail: target.principalEmail,
        actionType: 'DOWNSTREAM_NOTIFIED',
        consentVersion: target.version,
        noticeLanguage: target.noticeLanguage,
        processingPurpose: target.processingPurpose,
        dataCategories: target.dataCategoriesCollected,
        channel: target.consentChannel,
        actor: {
          type: 'SYSTEM_AUTOMATION',
          name: 'Downstream Dispatcher Daemon',
          identifier: 'DAEMON-SRV-ASIA-01'
        },
        downstreamProcessorsNotified: ['AWS ap-south-1 Mumbai', 'Snowflake Data Warehouse (India)', 'Salesforce India'],
        cryptographicProofHash: notifyHash,
        previousBlockHash: revokeHash,
        statutoryClause: 'Section 6(6) & Section 8(1)',
        auditVerificationStatus: 'VERIFIED_VALID',
        notes: `Downstream processor stop instruction webhook dispatched under Section 6(6).`
      };

      setConsentHistory(prev => [notifyEvt, revokeEvt, ...prev]);
    }

    showToast({
      title: 'Consent Revoked & Logged to History',
      description: 'Revocation recorded in Immutable Consent History Log with cryptographic proof hash. Processors notified.',
      type: 'warning'
    });
  };

  // Add Consent Record
  const handleAddConsent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrincipalName || !newPrincipalEmail) return;

    const nowIso = new Date().toISOString();
    const newRecord: DPDPUserConsentRecord = {
      id: `dp_c_${Date.now()}`,
      dataPrincipalId: `DP-IND-${Math.floor(10000 + Math.random() * 90000)}`,
      principalName: newPrincipalName,
      principalEmail: newPrincipalEmail,
      principalPhone: newPrincipalPhone || '+91 98000 00000',
      jurisdictionState: newJurisdictionState,
      noticeLanguage: newNoticeLanguage,
      processingPurpose: newProcessingPurpose,
      dataCategoriesCollected: ['Full Name', 'Contact Info', 'Device Telemetry'],
      consentGivenDate: nowIso,
      consentChannel: newConsentChannel,
      status: 'ACTIVE',
      downstreamProcessorsNotified: true,
      version: 'v2.1'
    };

    setConsents([newRecord, ...consents]);

    // Append to Immutable Consent History Log
    const prevHash = consentHistory[0]?.cryptographicProofHash || 'SHA256:GENESIS_BLOCK_00000000000000000000';
    const grantHash = buildConsentHistoryProofHash(newRecord.dataPrincipalId, 'CONSENT_GRANTED', nowIso, prevHash);
    const grantEvt: DPDPConsentHistoryEvent = {
      id: `evt_${Date.now()}_grant`,
      eventId: `EVT-CSN-2026-0${consentHistory.length + 92}`,
      timestamp: nowIso,
      dataPrincipalId: newRecord.dataPrincipalId,
      principalName: newRecord.principalName,
      principalEmail: newRecord.principalEmail,
      actionType: 'CONSENT_GRANTED',
      consentVersion: newRecord.version,
      noticeLanguage: newRecord.noticeLanguage,
      processingPurpose: newRecord.processingPurpose,
      dataCategories: newRecord.dataCategoriesCollected,
      channel: newRecord.consentChannel,
      actor: {
        type: 'DATA_PRINCIPAL',
        name: newRecord.principalName,
        identifier: 'Web/Mobile Client Attestation'
      },
      downstreamProcessorsNotified: ['AWS ap-south-1 Mumbai', 'Snowflake Data Warehouse (India)'],
      cryptographicProofHash: grantHash,
      previousBlockHash: prevHash,
      statutoryClause: 'Section 6(1)',
      auditVerificationStatus: 'VERIFIED_VALID',
      notes: `Affirmative opt-in consent captured in ${newRecord.noticeLanguage} with unbundled purpose checkboxes.`
    };
    setConsentHistory(prev => [grantEvt, ...prev]);

    setShowAddConsentModal(false);
    setNewPrincipalName('');
    setNewPrincipalEmail('');
    setNewPrincipalPhone('');

    showToast({
      title: 'Consent Logged & Chained',
      description: `Logged active consent for ${newRecord.principalName} and anchored block into Immutable History Log.`,
      type: 'success'
    });
  };

  // Add Grievance Record
  const handleAddGrievance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGrvPrincipalName || !newGrvPrincipalEmail || !newGrvDescription) return;

    // Calculate deadline (7 days for children data, 30 days for general)
    const deadlineDays = newGrvCategory === 'CHILDREN_DATA_VIOLATION' ? 7 : 30;
    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + deadlineDays);

    const newGrievance: DPDPGrievanceRecord = {
      id: `grv_${Date.now()}`,
      grievanceCode: `GRV-2026-00${grievances.length + 1}`,
      dataPrincipalId: `DP-IND-${Math.floor(10000 + Math.random() * 90000)}`,
      principalName: newGrvPrincipalName,
      principalEmail: newGrvPrincipalEmail,
      category: newGrvCategory,
      description: newGrvDescription,
      loggedDate: new Date().toISOString(),
      statutoryDeadlineDate: deadlineDate.toISOString(),
      status: 'OPEN',
      assignedOfficer: newGrvOfficer,
      dpoEscalationRequired: newGrvCategory === 'CHILDREN_DATA_VIOLATION',
      appealNoticeGiven: true
    };

    setGrievances([newGrievance, ...grievances]);
    setShowAddGrievanceModal(false);
    setNewGrvPrincipalName('');
    setNewGrvPrincipalEmail('');
    setNewGrvDescription('');

    showToast({
      title: 'Grievance Ticket Registered',
      description: `Registered ticket ${newGrievance.grievanceCode} with ${deadlineDays}-day statutory SLA timer.`,
      type: 'info'
    });
  };

  // Update Grievance Status
  const handleUpdateGrievanceStatus = (id: string, status: DPDPGrievanceRecord['status']) => {
    setGrievances(prev =>
      prev.map(g => {
        if (g.id === id) {
          return {
            ...g,
            status,
            resolutionDate: status === 'CLOSED' ? new Date().toISOString() : g.resolutionDate,
            resolutionSummary: resolutionText || g.resolutionSummary
          };
        }
        return g;
      })
    );

    if (selectedGrievance?.id === id) {
      setSelectedGrievance(prev => (prev ? { ...prev, status } : null));
    }

    showToast({
      title: 'Grievance Status Updated',
      description: `Ticket status set to ${status}.`,
      type: 'success'
    });
  };

  // Export Grievance CSV
  const exportGrievancesCSV = () => {
    const headers = [
      'Grievance Code',
      'Data Principal ID',
      'Principal Name',
      'Principal Email',
      'Category',
      'Description',
      'Logged Date',
      'Statutory Deadline',
      'Status',
      'Assigned Officer',
      'Resolution Summary'
    ];

    const rows = grievances.map(g => [
      `"${g.grievanceCode}"`,
      `"${g.dataPrincipalId}"`,
      `"${g.principalName}"`,
      `"${g.principalEmail}"`,
      `"${g.category}"`,
      `"${g.description.replace(/"/g, '""')}"`,
      `"${g.loggedDate}"`,
      `"${g.statutoryDeadlineDate}"`,
      `"${g.status}"`,
      `"${g.assignedOfficer}"`,
      `"${(g.resolutionSummary || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DPDP_Grievance_Redressal_Register_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Sub-Nav Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-4">
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          {/* SUB-TAB: SLA DASHBOARD */}
          <button
            type="button"
            onClick={() => setActiveSubTab('sla_dashboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              activeSubTab === 'sla_dashboard'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Timer className="w-4 h-4" />
            <span>Grievance SLA Dashboard</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-950/80 text-rose-300 border border-rose-800/80 font-mono flex items-center gap-1">
              <Flame className="w-2.5 h-2.5 text-rose-400" />
              <span>Prioritized Queue</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('consents')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              activeSubTab === 'consents'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Languages className="w-4 h-4" />
            <span>Consent & Multilingual Tracker (Section 6)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-950/40 text-current font-mono">
              {consents.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('grievances')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              activeSubTab === 'grievances'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Grievance Redressal Queue & SLA Timers (Section 13)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-950/40 text-current font-mono">
              {grievances.filter(g => g.status !== 'CLOSED').length} Open
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              activeSubTab === 'history'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Immutable Consent History Log</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-950/40 text-current font-mono">
              {consentHistory.length}
            </span>
          </button>
        </div>

        {activeSubTab === 'consents' && (
          <button
            type="button"
            onClick={() => setShowAddConsentModal(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Consent Record</span>
          </button>
        )}

        {activeSubTab === 'grievances' && (
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={exportGrievancesCSV}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAddGrievanceModal(true)}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register Grievance Ticket</span>
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* SUB-TAB 0: HIGH-LEVEL GRIEVANCE SLA DASHBOARD            */}
      {/* ======================================================== */}
      {activeSubTab === 'sla_dashboard' && (
        <DPDPGrievanceSlaDashboard
          onNavigateToConsent={() => setActiveSubTab('consents')}
          onNavigateToGrievance={() => setActiveSubTab('grievances')}
        />
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 1: USER CONSENT & MULTILINGUAL TRACKER (SEC 6)   */}
      {/* ======================================================== */}
      {activeSubTab === 'consents' && (
        <div className="space-y-4">
          {/* Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] text-slate-400">Total Consent Records</div>
              <div className="text-2xl font-bold font-mono text-white mt-0.5">{consents.length}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] text-emerald-400">Active Consents</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">
                {consents.filter(c => c.status === 'ACTIVE').length}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] text-rose-400">Revoked / Withdrawn</div>
              <div className="text-2xl font-bold font-mono text-rose-400 mt-0.5">
                {consents.filter(c => c.status === 'REVOKED').length}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] text-sky-400">Languages Represented</div>
              <div className="text-2xl font-bold font-mono text-sky-400 mt-0.5">
                {new Set(consents.map(c => c.noticeLanguage)).size}
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by principal name, ID, email, or language..."
                value={consentSearch}
                onChange={e => setConsentSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <select
              value={consentStatusFilter}
              onChange={e => setConsentStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 w-full sm:w-auto"
            >
              <option value="All">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="REVOKED">Revoked / Withdrawn</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>

          {/* Consents Table */}
          <div className="bg-slate-900/90 rounded-xl border border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[11px] font-semibold">
                  <th className="p-3">Data Principal</th>
                  <th className="p-3">Notice Language (22 Sched.)</th>
                  <th className="p-3">Processing Purpose & Data</th>
                  <th className="p-3">Consent Channel</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Statutory Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredConsents.map(consent => {
                  const isActive = consent.status === 'ACTIVE';

                  return (
                    <tr key={consent.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-white">{consent.principalName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{consent.dataPrincipalId}</div>
                        <div className="text-[11px] text-slate-500">{consent.principalEmail}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/20 font-medium">
                          {consent.noticeLanguage}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">{consent.jurisdictionState}</div>
                      </td>
                      <td className="p-3 max-w-xs">
                        <div className="text-slate-200 font-medium">{consent.processingPurpose}</div>
                        <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                          {consent.dataCategoriesCollected.join(', ')}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-slate-300">{consent.consentChannel}</div>
                        {consent.consentManagerRef && (
                          <div className="text-[10px] text-amber-400 font-mono mt-0.5">
                            CMP: {consent.consentManagerRef}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {consent.status}
                        </span>
                        {consent.downstreamProcessorsNotified && (
                          <div className="text-[10px] text-emerald-400/80 flex items-center gap-1 mt-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Processors Synced</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const art = generateStandardConsentArtifact(
                              consent.dataPrincipalId,
                              consent.principalName,
                              consent.processingPurpose,
                              consent.dataCategoriesCollected
                            );
                            setSelectedArtifact(art);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1"
                          title="View MeitY Machine-Readable Consent Manager Artifact (Sec 6(7))"
                        >
                          <FileText className="w-3 h-3" />
                          <span>CM Artifact</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveSubTab('history')}
                          className="px-2.5 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1"
                          title="View in Immutable Consent History Log (Sec 6(10))"
                        >
                          <History className="w-3 h-3" />
                          <span>History Log</span>
                        </button>

                        {isActive ? (
                          <button
                            type="button"
                            onClick={() => handleRevokeConsent(consent.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Simulate 1-Click Withdrawal</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">Revocation Processed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 2: GRIEVANCE REDRESSAL QUEUE & SLA TIMERS        */}
      {/* ======================================================== */}
      {activeSubTab === 'grievances' && (
        <div className="space-y-4">
          {/* Statutory Rule Banner */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white">Section 13 Statutory Grievance Redressal Mandate: </strong>
                Data Fiduciaries must resolve Data Principal grievances within statutory periods (max 30 days, or expedited 7 days for children data issues). Unresolved grievances empower the citizen to directly escalate complaints to the <strong>Data Protection Board of India (DPBI)</strong>.
              </div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search grievances by code, citizen name, email, or category..."
                value={grievanceSearch}
                onChange={e => setGrievanceSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <select
              value={grievanceStatusFilter}
              onChange={e => setGrievanceStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 w-full sm:w-auto"
            >
              <option value="All">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="UNDER_INVESTIGATION">Under Investigation</option>
              <option value="ACTION_TAKEN">Action Taken</option>
              <option value="CLOSED">Closed</option>
              <option value="ESCALATED_TO_DPBI">Escalated to DPBI</option>
            </select>
          </div>

          {/* Grievances List */}
          <div className="space-y-3">
            {filteredGrievances.map(grievance => {
              const remainingDays = getSlaRemainingDays(grievance.statutoryDeadlineDate);
              const isUrgent = remainingDays <= 5 && grievance.status !== 'CLOSED';
              const isClosed = grievance.status === 'CLOSED';

              return (
                <div
                  key={grievance.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div className="px-2.5 py-1 rounded-md bg-slate-950 text-amber-400 font-mono text-xs font-bold border border-slate-800">
                        {grievance.grievanceCode}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 flex-wrap">
                          <h4 className="text-sm font-semibold text-white">{grievance.principalName}</h4>
                          <span className="text-xs text-slate-400 font-mono">({grievance.dataPrincipalId})</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            {grievance.category.replace(/_/g, ' ')}
                          </span>
                          {grievance.dpoEscalationRequired && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              DPO Alert Triggered
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 mt-1">{grievance.description}</p>
                      </div>
                    </div>

                    {/* SLA Timer Badge */}
                    <div className="flex items-center space-x-3 shrink-0 self-end md:self-center">
                      <div
                        className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center space-x-1.5 ${
                          isClosed
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : isUrgent
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse font-bold'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/30 font-semibold'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {isClosed
                            ? 'SLA Satisfied (Closed)'
                            : remainingDays > 0
                            ? `SLA: ${remainingDays} Days Remaining`
                            : 'SLA Overdue - DPBI Escalation Risk!'}
                        </span>
                      </div>

                      <select
                        value={grievance.status}
                        onChange={e =>
                          handleUpdateGrievanceStatus(grievance.id, e.target.value as DPDPGrievanceRecord['status'])
                        }
                        className="bg-slate-950 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="UNDER_INVESTIGATION">UNDER INVESTIGATION</option>
                        <option value="ACTION_TAKEN">ACTION TAKEN</option>
                        <option value="CLOSED">CLOSED</option>
                        <option value="ESCALATED_TO_DPBI">ESCALATED TO DPBI</option>
                      </select>
                    </div>
                  </div>

                  {/* Resolution Footnote */}
                  <div className="pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-2">
                    <div>
                      Assigned Officer: <span className="text-slate-200">{grievance.assignedOfficer}</span>
                    </div>
                    {grievance.resolutionSummary && (
                      <div className="text-slate-300">
                        Resolution: <span className="italic">{grievance.resolutionSummary}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 3: IMMUTABLE CONSENT HISTORY LOG (SECTION 6(10)) */}
      {/* ======================================================== */}
      {activeSubTab === 'history' && (
        <DPDPConsentHistoryTimeline
          events={consentHistory}
          onAddEvent={(newEvent) => setConsentHistory(prev => [newEvent, ...prev])}
        />
      )}

      {/* MODAL: LOG NEW CONSENT */}
      {showAddConsentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Log Statutory Consent Record</h3>
              <button
                type="button"
                onClick={() => setShowAddConsentModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddConsent} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Data Principal Name</label>
                <input
                  type="text"
                  required
                  value={newPrincipalName}
                  onChange={e => setNewPrincipalName(e.target.value)}
                  placeholder="e.g. Ramesh Kulkarni"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={newPrincipalEmail}
                    onChange={e => setNewPrincipalEmail(e.target.value)}
                    placeholder="ramesh@example.in"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Phone</label>
                  <input
                    type="text"
                    value={newPrincipalPhone}
                    onChange={e => setNewPrincipalPhone(e.target.value)}
                    placeholder="+91 98200 12345"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Notice Language (Schedule 8)</label>
                  <select
                    value={newNoticeLanguage}
                    onChange={e => setNewNoticeLanguage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  >
                    {scheduledLanguages.map(lang => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Jurisdiction / State</label>
                  <input
                    type="text"
                    value={newJurisdictionState}
                    onChange={e => setNewJurisdictionState(e.target.value)}
                    placeholder="e.g. Karnataka"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Specific Processing Purpose</label>
                <input
                  type="text"
                  required
                  value={newProcessingPurpose}
                  onChange={e => setNewProcessingPurpose(e.target.value)}
                  placeholder="e.g. UPI Onboarding & Fraud Prevention"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Consent Acquisition Channel</label>
                <select
                  value={newConsentChannel}
                  onChange={e => setNewConsentChannel(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value="Mobile App (Android/iOS)">Mobile App (Android/iOS)</option>
                  <option value="Web Portal">Web Portal</option>
                  <option value="Consent Manager API">Consent Manager API</option>
                  <option value="Offline Form">Offline Form</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddConsentModal(false)}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold"
                >
                  Log Active Consent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER GRIEVANCE */}
      {showAddGrievanceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Register Data Principal Grievance Ticket</h3>
              <button
                type="button"
                onClick={() => setShowAddGrievanceModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddGrievance} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Citizen / Principal Name</label>
                <input
                  type="text"
                  required
                  value={newGrvPrincipalName}
                  onChange={e => setNewGrvPrincipalName(e.target.value)}
                  placeholder="e.g. Sanya Mirza"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newGrvPrincipalEmail}
                  onChange={e => setNewGrvPrincipalEmail(e.target.value)}
                  placeholder="sanya@example.in"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Grievance Category</label>
                <select
                  value={newGrvCategory}
                  onChange={e => setNewGrvCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value="CONSENT_WITHDRAWAL_FAILURE">Consent Withdrawal Failure</option>
                  <option value="ERASURE_DELAY">Erasure / Retention Delay</option>
                  <option value="CHILDREN_DATA_VIOLATION">Children Data Violation (Expedited 7-Day SLA)</option>
                  <option value="ACCESS_REQUEST_INCOMPLETE">Access Request Incomplete</option>
                  <option value="THIRD_PARTY_SHARING">Unauthorized Third-Party Sharing</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description of Grievance</label>
                <textarea
                  rows={3}
                  required
                  value={newGrvDescription}
                  onChange={e => setNewGrvDescription(e.target.value)}
                  placeholder="Provide detailed specifics regarding the data principal's complaint..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Assigned Grievance Redressal Officer</label>
                <input
                  type="text"
                  value={newGrvOfficer}
                  onChange={e => setNewGrvOfficer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddGrievanceModal(false)}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Register Ticket & Start SLA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Consent Manager (CM) Machine-Readable Artifact Modal */}
      {selectedArtifact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Registered Consent Manager (CM) Artifact</h3>
                  <div className="text-[11px] text-slate-400">Section 6(7)–(9) DPDP Act 2023 • MeitY JSON-LD Schema v1.0</div>
                </div>
              </div>
              <button onClick={() => setSelectedArtifact(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 max-h-[50vh] overflow-y-auto space-y-2">
              <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold border-b border-slate-800 pb-1">
                <span>DIGITALLY SIGNED CONSENT ARTIFACT</span>
                <span>{selectedArtifact.consentId}</span>
              </div>
              <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(selectedArtifact, null, 2)}
              </pre>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 text-slate-300 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-400">
                This machine-readable artifact is generated in conformance with DPBI interoperability standards. It includes a SHA-256 cryptographic signature digest, pseudonymized token identifier, and standardized revocation callback webhook.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(selectedArtifact, null, 2));
                  showToast({
                    title: 'Copied Artifact JSON',
                    description: 'Consent Manager payload copied to clipboard.',
                    type: 'success'
                  });
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Copy JSON Payload
              </button>
              <button
                onClick={() => setSelectedArtifact(null)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
