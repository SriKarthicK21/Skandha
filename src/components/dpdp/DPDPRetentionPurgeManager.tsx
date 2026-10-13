import React, { useState, useMemo } from 'react';
import {
  DPDPRetentionPolicy,
  DPDPMonitoredDataBatch,
  DPDPRecordOfDisposal,
  INITIAL_RETENTION_POLICIES,
  INITIAL_MONITORED_BATCHES,
  INITIAL_DISPOSAL_LOG,
  DPDPDisposalMethod,
  buildDisposalProofHash
} from '../../data/dpdpRetentionPurgeData';
import { useToast } from '../common/ToastContainer';
import {
  Trash2,
  Clock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  Search,
  Filter,
  Plus,
  Download,
  Calendar,
  Database,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  FileText,
  Building,
  Server,
  Hash,
  Sparkles,
  ExternalLink,
  Layers,
  ArrowRight,
  Flame,
  Check,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  Info
} from 'lucide-react';

export const DPDPRetentionPurgeManager: React.FC = () => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'MONITOR_QUEUE' | 'RETENTION_POLICIES' | 'RECORD_OF_DISPOSAL'>('MONITOR_QUEUE');

  // State
  const [policies, setPolicies] = useState<DPDPRetentionPolicy[]>(INITIAL_RETENTION_POLICIES);
  const [batches, setBatches] = useState<DPDPMonitoredDataBatch[]>(INITIAL_MONITORED_BATCHES);
  const [disposalLog, setDisposalLog] = useState<DPDPRecordOfDisposal[]>(INITIAL_DISPOSAL_LOG);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals
  const [isNewPolicyModalOpen, setIsNewPolicyModalOpen] = useState(false);
  const [purgeConfirmBatch, setPurgeConfirmBatch] = useState<DPDPMonitoredDataBatch | null>(null);
  const [activeCertificate, setActiveCertificate] = useState<DPDPRecordOfDisposal | null>(null);
  const [legalHoldModalBatch, setLegalHoldModalBatch] = useState<DPDPMonitoredDataBatch | null>(null);
  const [legalHoldInputReason, setLegalHoldInputReason] = useState('');

  // New Policy Form State
  const [newPolicyCategory, setNewPolicyCategory] = useState('');
  const [newPolicyClassification, setNewPolicyClassification] = useState<DPDPRetentionPolicy['classification']>('HIGH');
  const [newPolicyDept, setNewPolicyDept] = useState('Operations & Technology');
  const [newPolicyStatutoryBasis, setNewPolicyStatutoryBasis] = useState('Section 8(7) DPDP Act (Purpose Fulfillment)');
  const [newPolicyDurationValue, setNewPolicyDurationValue] = useState(180);
  const [newPolicyDurationDisplay, setNewPolicyDurationDisplay] = useState('180 Days');
  const [newPolicyTrigger, setNewPolicyTrigger] = useState<DPDPRetentionPolicy['triggerEvent']>('PURPOSE_ACCOMPLISHED');
  const [newPolicyDisposalMethod, setNewPolicyDisposalMethod] = useState<DPDPDisposalMethod>('NIST_800_88_CRYPTOGRAPHIC_SHRED');
  const [newPolicyStorage, setNewPolicyStorage] = useState('AWS S3 Encrypted Bucket (ap-south-1)');

  // Filtered Batches
  const filteredBatches = useMemo(() => {
    return batches.filter(b => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          b.datasetName.toLowerCase().includes(q) ||
          b.batchCode.toLowerCase().includes(q) ||
          b.dataCategory.toLowerCase().includes(q) ||
          b.storageSystem.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (statusFilter !== 'ALL' && b.expiryStatus !== statusFilter) return false;
      if (categoryFilter !== 'ALL' && b.dataCategory !== categoryFilter) return false;
      return true;
    });
  }, [batches, searchQuery, statusFilter, categoryFilter]);

  // Filtered Policies
  const filteredPolicies = useMemo(() => {
    return policies.filter(p => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          p.dataCategory.toLowerCase().includes(q) ||
          p.policyCode.toLowerCase().includes(q) ||
          p.applicableDepartment.toLowerCase().includes(q) ||
          p.statutoryBasis.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [policies, searchQuery]);

  // Filtered Disposal Log
  const filteredDisposalLog = useMemo(() => {
    return disposalLog.filter(d => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          d.certificateCode.toLowerCase().includes(q) ||
          d.batchCode.toLowerCase().includes(q) ||
          d.datasetName.toLowerCase().includes(q) ||
          d.dataCategory.toLowerCase().includes(q) ||
          d.authorizedByOfficer.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [disposalLog, searchQuery]);

  // Summary Metrics
  const expiredCount = batches.filter(b => b.expiryStatus === 'EXPIRED_FLAGGED').length;
  const expiringSoonCount = batches.filter(b => b.expiryStatus === 'EXPIRING_SOON').length;
  const legalHoldCount = batches.filter(b => b.expiryStatus === 'LEGAL_HOLD_FROZEN').length;
  const totalPurgedRecords = disposalLog.reduce((acc, curr) => acc + curr.volumeRecords, 0);

  // Categories list for dropdown
  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(policies.map(p => p.dataCategory)));
  }, [policies]);

  // Create Policy Handler
  const handleCreatePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPolicyCategory.trim()) return;

    const policyCode = `RET-POL-${String(policies.length + 1).padStart(2, '0')}`;
    const newPol: DPDPRetentionPolicy = {
      id: `pol_${Date.now()}`,
      policyCode,
      dataCategory: newPolicyCategory.trim(),
      classification: newPolicyClassification,
      applicableDepartment: newPolicyDept.trim(),
      statutoryBasis: newPolicyStatutoryBasis.trim(),
      retentionDurationDisplay: newPolicyDurationDisplay.trim(),
      durationValue: newPolicyDurationValue,
      triggerEvent: newPolicyTrigger,
      disposalMethod: newPolicyDisposalMethod,
      storageTarget: newPolicyStorage.trim(),
      legalHoldOverridePermitted: true,
      isActive: true,
      dpoApproved: true,
      dpoApproverName: 'Elena Rostova (Chief DPO)',
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    setPolicies([...policies, newPol]);
    setIsNewPolicyModalOpen(false);
    setNewPolicyCategory('');

    showToast({
      title: 'Retention Policy Enacted',
      description: `Policy ${policyCode} successfully added with statutory schedule.`,
      type: 'success'
    });
  };

  // Purge Execution Handler
  const handleExecutePurge = (batch: DPDPMonitoredDataBatch) => {
    if (batch.expiryStatus === 'LEGAL_HOLD_FROZEN') {
      showToast({
        title: 'Purge Blocked by Legal Hold',
        description: `Batch ${batch.batchCode} is frozen under statutory hold: ${batch.legalHoldReference}`,
        type: 'error'
      });
      return;
    }

    const certCode = `DISP-CERT-2026-${String(disposalLog.length + 1).padStart(3, '0')}`;
    const proofHash = buildDisposalProofHash(
      certCode,
      batch.batchCode,
      batch.dataCategory,
      batch.recordsCount,
      'Elena Rostova'
    );

    const newRecord: DPDPRecordOfDisposal = {
      id: `disp_${Date.now()}`,
      certificateCode: certCode,
      batchCode: batch.batchCode,
      datasetName: batch.datasetName,
      dataCategory: batch.dataCategory,
      volumeRecords: batch.recordsCount,
      dataSizePurged: batch.dataSizeEstimate,
      storageSystem: batch.storageSystem,
      disposalMethod: 'NIST_800_88_CRYPTOGRAPHIC_SHRED',
      executionTimestamp: `${new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC`,
      authorizedByOfficer: 'Elena Rostova',
      officerRole: 'Chief Data Protection Officer',
      verificationProofHash: proofHash,
      downstreamProcessorsNotified: true,
      statutoryClauseSatisfied: 'Section 8(7) DPDP Act Purpose Fulfillment & Downstream Erasure',
      auditNotes: `Automated cryptographic shred executed. Notification dispatches issued to: ${batch.processorsInvolved.join(', ')}.`
    };

    // Remove purged batch from active queue
    setBatches(batches.filter(b => b.id !== batch.id));
    // Add to Record of Disposal
    setDisposalLog([newRecord, ...disposalLog]);
    setPurgeConfirmBatch(null);

    showToast({
      title: 'Data Purge Executed & Logged',
      description: `Disposed ${batch.recordsCount.toLocaleString()} records from ${batch.storageSystem}. Certificate ${certCode} sealed.`,
      type: 'success'
    });

    // Automatically prompt viewing the generated certificate
    setActiveCertificate(newRecord);
  };

  // Batch Purge All Expired Data
  const handleBatchPurgeAllExpired = () => {
    const expiredToPurge = batches.filter(b => b.expiryStatus === 'EXPIRED_FLAGGED');
    if (expiredToPurge.length === 0) {
      showToast({
        title: 'No Expired Batches',
        description: 'All current datasets are within their valid retention schedules.',
        type: 'info'
      });
      return;
    }

    let recordsCount = 0;
    const newDisposals: DPDPRecordOfDisposal[] = [];

    expiredToPurge.forEach((batch, idx) => {
      recordsCount += batch.recordsCount;
      const certCode = `DISP-CERT-2026-${String(disposalLog.length + idx + 1).padStart(3, '0')}`;
      const proofHash = buildDisposalProofHash(
        certCode,
        batch.batchCode,
        batch.dataCategory,
        batch.recordsCount,
        'Elena Rostova'
      );

      newDisposals.push({
        id: `disp_${Date.now()}_${idx}`,
        certificateCode: certCode,
        batchCode: batch.batchCode,
        datasetName: batch.datasetName,
        dataCategory: batch.dataCategory,
        volumeRecords: batch.recordsCount,
        dataSizePurged: batch.dataSizeEstimate,
        storageSystem: batch.storageSystem,
        disposalMethod: 'NIST_800_88_CRYPTOGRAPHIC_SHRED',
        executionTimestamp: `${new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC`,
        authorizedByOfficer: 'Elena Rostova',
        officerRole: 'Chief Data Protection Officer',
        verificationProofHash: proofHash,
        downstreamProcessorsNotified: true,
        statutoryClauseSatisfied: 'Section 8(7) DPDP Act Purpose Fulfillment & Downstream Erasure',
        auditNotes: `Batch execution: cryptographic erasure completed across ${batch.storageSystem}.`
      });
    });

    setBatches(batches.filter(b => b.expiryStatus !== 'EXPIRED_FLAGGED'));
    setDisposalLog([...newDisposals, ...disposalLog]);

    showToast({
      title: 'Batch Disposal Complete',
      description: `Purged ${expiredToPurge.length} expired batches (${recordsCount.toLocaleString()} records). Certificates recorded.`,
      type: 'success'
    });
  };

  // Toggle Legal Hold on a batch
  const handleApplyLegalHold = (e: React.FormEvent) => {
    e.preventDefault();
    if (!legalHoldModalBatch || !legalHoldInputReason.trim()) return;

    setBatches(
      batches.map(b =>
        b.id === legalHoldModalBatch.id
          ? {
              ...b,
              expiryStatus: 'LEGAL_HOLD_FROZEN',
              legalHoldReference: `HOLD-STAT-${Date.now().toString().slice(-4)}`,
              legalHoldReason: legalHoldInputReason.trim()
            }
          : b
      )
    );

    showToast({
      title: 'Legal Hold Imposed',
      description: `Batch ${legalHoldModalBatch.batchCode} frozen from automated purge.`,
      type: 'warning'
    });

    setLegalHoldModalBatch(null);
    setLegalHoldInputReason('');
  };

  // Release Legal Hold
  const handleReleaseLegalHold = (batchId: string) => {
    setBatches(
      batches.map(b => {
        if (b.id === batchId) {
          const isExpired = b.daysRemaining <= 0;
          return {
            ...b,
            expiryStatus: isExpired ? 'EXPIRED_FLAGGED' : 'ACTIVE_RETAINED',
            legalHoldReference: undefined,
            legalHoldReason: undefined
          };
        }
        return b;
      })
    );

    showToast({
      title: 'Legal Hold Released',
      description: 'Retention evaluation restored to active schedule.',
      type: 'info'
    });
  };

  // Export Record of Disposal
  const handleExportRecordOfDisposal = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(disposalLog, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `DPDP_Record_Of_Disposal_Log_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast({
      title: 'Record of Disposal Exported',
      description: `Exported ${disposalLog.length} certificates of destruction for regulatory audit.`,
      type: 'success'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Executive Module Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5" />
                <span>Section 8(7) Retention & Purpose Fulfillment</span>
              </span>
              <span className="text-xs text-slate-400">Automated Expiry Monitor & Statutory Destruction Register</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                NIST SP 800-88 Compliant
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Data Retention & Purge Policy Manager</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Define statutory retention schedules across personal data categories, automatically flag expired datasets for deletion, execute cryptographically verified sanitization, and maintain an immutable Record of Disposal for Data Protection Board of India (DPBI) audits.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {expiredCount > 0 && (
              <button
                type="button"
                onClick={handleBatchPurgeAllExpired}
                className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-rose-600/30 transition-all cursor-pointer animate-pulse"
              >
                <Flame className="w-4 h-4" />
                <span>Purge All Expired ({expiredCount} Batches)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsNewPolicyModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Define Retention Schedule</span>
            </button>

            <button
              type="button"
              onClick={handleExportRecordOfDisposal}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Export Disposal Log</span>
            </button>
          </div>
        </div>

        {/* Executive Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Retention Policies</div>
            <div className="text-xl font-bold font-mono text-white mt-0.5 flex items-baseline gap-1.5">
              <span>{policies.length} Policies</span>
            </div>
            <div className="text-[10px] text-amber-400 font-semibold mt-0.5">100% DPO Approved</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Monitored Batches</div>
            <div className="text-xl font-bold font-mono text-indigo-300 mt-0.5 flex items-baseline gap-1.5">
              <span>{batches.length} Batches</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">3.7 TB in scope</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Flagged for Purge</div>
            <div className={`text-xl font-bold font-mono mt-0.5 flex items-baseline gap-1.5 ${
              expiredCount > 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              <span>{expiredCount} Expired</span>
            </div>
            <div className="text-[10px] text-rose-300/80 font-semibold mt-0.5">
              {expiredCount > 0 ? 'Action Required' : 'All Cleared'}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Legal Hold Overrides</div>
            <div className="text-xl font-bold font-mono text-purple-400 mt-0.5 flex items-baseline gap-1.5">
              <span>{legalHoldCount} Frozen</span>
            </div>
            <div className="text-[10px] text-purple-300/80 font-semibold mt-0.5">PMLA / ED Statutory</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Certified Disposals</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5 flex items-baseline gap-1.5">
              <span>{disposalLog.length} Purges</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">{totalPurgedRecords.toLocaleString()} records</div>
          </div>
        </div>

        {/* Tab & Navigation Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-800/60">
          <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('MONITOR_QUEUE')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'MONITOR_QUEUE'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>1. Automated Expiry & Purge Queue</span>
              {expiredCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-rose-600 text-white font-bold">
                  {expiredCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('RETENTION_POLICIES')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'RETENTION_POLICIES'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>2. Retention Schedules ({policies.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('RECORD_OF_DISPOSAL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'RECORD_OF_DISPOSAL'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>3. Record of Disposal Log ({disposalLog.length})</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search batch, category, system..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {activeTab === 'MONITOR_QUEUE' && (
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-2.5 py-1.5 text-xs focus:border-amber-500"
              >
                <option value="ALL">All Expiry Statuses</option>
                <option value="EXPIRED_FLAGGED">🔴 Flagged for Purge (Expired)</option>
                <option value="EXPIRING_SOON">🟡 Expiring Soon (&lt;14 Days)</option>
                <option value="ACTIVE_RETAINED">🟢 Active Retained</option>
                <option value="LEGAL_HOLD_FROZEN">🟣 Legal Hold Frozen</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* TAB 1: AUTOMATED EXPIRY & PURGE QUEUE */}
      {activeTab === 'MONITOR_QUEUE' && (
        <div className="space-y-4">
          {/* Expiry Alert Banner */}
          {expiredCount > 0 && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-200 shadow-lg">
              <div className="flex items-start sm:items-center space-x-2.5">
                <Flame className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <strong className="font-bold text-white">Section 8(7) Statutory Purge Notice:</strong>{' '}
                  {expiredCount} personal data batch{expiredCount > 1 ? 'es have' : ' has'} exceeded statutory purpose fulfillment schedules and must be sanitized immediately to avoid DPBI non-compliance penalties.
                </div>
              </div>
              <button
                type="button"
                onClick={handleBatchPurgeAllExpired}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shrink-0 flex items-center space-x-1 cursor-pointer shadow-md"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Execute Batch Purge</span>
              </button>
            </div>
          )}

          {/* Batches Table Grid */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Monitored Personal Data Lifecycle Queue</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Data batches dynamically evaluated against enacted retention policies. Expired data is automatically quarantined and flagged for destruction.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {filteredBatches.length} active batches in queue
              </span>
            </div>

            <div className="space-y-3">
              {filteredBatches.map(batch => {
                const isExpired = batch.expiryStatus === 'EXPIRED_FLAGGED';
                const isExpiringSoon = batch.expiryStatus === 'EXPIRING_SOON';
                const isLegalHold = batch.expiryStatus === 'LEGAL_HOLD_FROZEN';

                let cardBorder = 'border-slate-800 hover:border-slate-700 bg-slate-950/60';
                let statusBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

                if (isExpired) {
                  cardBorder = 'border-rose-600/70 bg-rose-950/10 shadow-lg shadow-rose-900/10';
                  statusBadge = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
                } else if (isExpiringSoon) {
                  cardBorder = 'border-amber-500/70 bg-amber-950/10';
                  statusBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                } else if (isLegalHold) {
                  cardBorder = 'border-purple-600/70 bg-purple-950/10';
                  statusBadge = 'bg-purple-500/20 text-purple-300 border-purple-500/30';
                }

                return (
                  <div
                    key={batch.id}
                    className={`p-5 rounded-2xl border transition-all space-y-3 ${cardBorder}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center space-x-2.5">
                        <div className={`p-2 rounded-xl border ${
                          isExpired
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                            : isLegalHold
                            ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                            : isExpiringSoon
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {isLegalHold ? (
                            <Lock className="w-4 h-4" />
                          ) : isExpired ? (
                            <Trash2 className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-bold text-amber-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                              {batch.batchCode}
                            </span>
                            <h4 className="text-sm font-bold text-white">{batch.datasetName}</h4>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {batch.dataCategory} • {batch.recordsCount.toLocaleString()} Records ({batch.dataSizeEstimate})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${statusBadge}`}>
                          {isExpired ? (
                            <AlertTriangle className="w-3 h-3" />
                          ) : isLegalHold ? (
                            <Lock className="w-3 h-3" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                          <span>{batch.expiryStatus.replace(/_/g, ' ')}</span>
                        </span>
                      </div>
                    </div>

                    {/* Timeline & Metadata Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-slate-400 text-[11px] block">Storage System:</span>
                        <span className="text-slate-200 font-mono font-medium truncate block" title={batch.storageSystem}>
                          {batch.storageSystem}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-slate-400 text-[11px] block">Ingestion & Trigger:</span>
                        <span className="text-slate-200 font-medium">
                          {batch.ingestionDate} → {batch.triggerEventDate}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-slate-400 text-[11px] block">Scheduled Expiry:</span>
                        <span className={`font-medium font-mono ${isExpired ? 'text-rose-400 font-bold' : 'text-slate-200'}`}>
                          {batch.scheduledExpiryDate}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-slate-400 text-[11px] block">Lifecycle Countdown:</span>
                        {isLegalHold ? (
                          <span className="text-purple-300 font-bold flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>Purge Suspended</span>
                          </span>
                        ) : isExpired ? (
                          <span className="text-rose-400 font-bold">
                            Expired by {Math.abs(batch.daysRemaining)} Days
                          </span>
                        ) : (
                          <span className={isExpiringSoon ? 'text-amber-400 font-bold' : 'text-emerald-400 font-medium'}>
                            {batch.daysRemaining} Days Remaining
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Legal Hold Notice if Active */}
                    {isLegalHold && (
                      <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/80 text-xs text-purple-200 flex items-start space-x-2">
                        <Lock className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-purple-300">Statutory Legal Hold ({batch.legalHoldReference}):</strong>{' '}
                          {batch.legalHoldReason}
                        </div>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
                      <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
                        <span>Processors in Scope:</span>
                        <span className="text-slate-300 font-medium">{batch.processorsInvolved.join(', ')}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isLegalHold ? (
                          <button
                            type="button"
                            onClick={() => handleReleaseLegalHold(batch.id)}
                            className="px-3 py-1.5 rounded-xl bg-purple-900/50 hover:bg-purple-800/70 border border-purple-700 text-purple-200 text-xs font-bold flex items-center space-x-1 cursor-pointer"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                            <span>Release Legal Hold</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setLegalHoldModalBatch(batch);
                              setLegalHoldInputReason('');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                          >
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Place Legal Hold</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setPurgeConfirmBatch(batch)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-md transition-all ${
                            isExpired
                              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{isExpired ? 'Execute Secure Purge' : 'Immediate Shred'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RETENTION SCHEDULES & POLICIES */}
      {activeTab === 'RETENTION_POLICIES' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Statutory Data Retention Schedule Register</span>
              </h3>
              <p className="text-xs text-slate-400">
                Retention limits enacted per personal data category, harmonizing DPDP Act Section 8(7), PMLA 2002, Income Tax Act, and sectoral guidelines.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsNewPolicyModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shrink-0 cursor-pointer shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Retention Policy</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPolicies.map(pol => (
              <div
                key={pol.id}
                className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3.5"
              >
                <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {pol.policyCode}
                      </span>
                      <h4 className="text-sm font-bold text-white">{pol.dataCategory}</h4>
                    </div>
                    <span className="text-xs text-slate-400 mt-1 block">{pol.applicableDepartment}</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    pol.classification === 'CRITICAL_SENSITIVE'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : pol.classification === 'HIGH'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {pol.classification.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 text-[11px] block">Retention Limit:</span>
                    <span className="font-bold text-amber-400">{pol.retentionDurationDisplay}</span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-slate-400 text-[11px] block">Trigger Event:</span>
                    <span className="font-mono text-slate-200 font-semibold">{pol.triggerEvent.replace(/_/g, ' ')}</span>
                  </div>

                  <div className="col-span-2 space-y-0.5">
                    <span className="text-slate-400 text-[11px] block">Statutory Basis & Legal Authority:</span>
                    <span className="text-slate-300">{pol.statutoryBasis}</span>
                  </div>

                  <div className="col-span-2 space-y-0.5">
                    <span className="text-slate-400 text-[11px] block">Sanitization Standard:</span>
                    <span className="font-mono text-indigo-300 font-semibold">{pol.disposalMethod.replace(/_/g, ' ')}</span>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 truncate max-w-[200px]" title={pol.storageTarget}>
                    {pol.storageTarget}
                  </span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>DPO Attested</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: IMMUTABLE RECORD OF DISPOSAL LOG */}
      {activeTab === 'RECORD_OF_DISPOSAL' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-amber-400" />
                <span>Statutory Record of Disposal & Destruction Certificates</span>
              </h3>
              <p className="text-xs text-slate-400">
                Non-repudiation audit trail satisfying DPDP Section 8(7) purpose fulfillment and DPBI evidentiary scrutiny.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportRecordOfDisposal}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center space-x-1.5 shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export Audit Register (JSON)</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3 pr-4">Certificate ID</th>
                  <th className="pb-3 pr-4">Batch / Dataset Name</th>
                  <th className="pb-3 pr-4">Data Category</th>
                  <th className="pb-3 pr-4">Volume Purged</th>
                  <th className="pb-3 pr-4">Disposal Standard</th>
                  <th className="pb-3 pr-4">Execution Timestamp</th>
                  <th className="pb-3 pr-4">Authorized By</th>
                  <th className="pb-3 text-right">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredDisposalLog.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 pr-4">
                      <span className="font-mono font-bold text-amber-400">{log.certificateCode}</span>
                    </td>

                    <td className="py-3 pr-4">
                      <div className="font-bold text-white">{log.datasetName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{log.batchCode} • {log.storageSystem}</div>
                    </td>

                    <td className="py-3 pr-4 text-slate-300">
                      {log.dataCategory}
                    </td>

                    <td className="py-3 pr-4 font-mono font-bold text-emerald-400">
                      {log.volumeRecords.toLocaleString()} rec. ({log.dataSizePurged})
                    </td>

                    <td className="py-3 pr-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 border border-slate-800 text-indigo-300">
                        {log.disposalMethod.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3 pr-4 text-slate-300 font-mono">
                      {log.executionTimestamp}
                    </td>

                    <td className="py-3 pr-4">
                      <div className="text-white font-medium">{log.authorizedByOfficer}</div>
                      <div className="text-[10px] text-slate-400">{log.officerRole}</div>
                    </td>

                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setActiveCertificate(log)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold cursor-pointer border border-amber-500/30 flex items-center gap-1 inline-flex"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View Proof</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: PURGE CONFIRMATION DIALOG */}
      {purgeConfirmBatch && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-800/80 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3 text-rose-400 border-b border-slate-800 pb-3">
              <div className="p-2 rounded-2xl bg-rose-500/20 border border-rose-500/30">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Execute Statutory Data Purge</h3>
                <p className="text-xs text-slate-400">Irreversible sanitization under NIST SP 800-88 standards.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Batch Code:</span>
                <span className="font-mono font-bold text-white">{purgeConfirmBatch.batchCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Dataset Name:</span>
                <span className="font-bold text-white">{purgeConfirmBatch.datasetName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Data Category:</span>
                <span className="text-slate-300">{purgeConfirmBatch.dataCategory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Storage Target:</span>
                <span className="font-mono text-slate-300">{purgeConfirmBatch.storageSystem}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Volume to be Shredded:</span>
                <span className="font-mono font-bold text-rose-400">
                  {purgeConfirmBatch.recordsCount.toLocaleString()} records ({purgeConfirmBatch.dataSizeEstimate})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Downstream Processors Notified:</span>
                <span className="text-emerald-400 font-semibold">{purgeConfirmBatch.processorsInvolved.join(', ')}</span>
              </div>
            </div>

            <p className="text-xs text-rose-300/90 leading-relaxed">
              This action will destroy KMS encryption keys, execute multi-pass zeroization on cloud target storage, trigger downstream erasure cascades, and seal a non-repudiation Record of Disposal.
            </p>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setPurgeConfirmBatch(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleExecutePurge(purgeConfirmBatch)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-rose-600/30"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirm & Shred Dataset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: OFFICIAL CERTIFICATE OF DESTRUCTION (RECORD OF DISPOSAL) */}
      {activeCertificate && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl my-8 relative">
            <button
              type="button"
              onClick={() => setActiveCertificate(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white text-base"
            >
              ✕
            </button>

            {/* Official Certificate Header */}
            <div className="text-center space-y-1 border-b border-slate-800 pb-4">
              <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-2">
                <FileCheck2 className="w-8 h-8" />
              </div>
              <div className="text-xs uppercase font-bold tracking-widest text-amber-400">
                Republic of India • DPDP Act 2023 Compliance
              </div>
              <h3 className="text-lg font-black text-white">Statutory Certificate of Data Destruction</h3>
              <p className="text-xs text-slate-400 font-mono">
                Certificate Ref: {activeCertificate.certificateCode}
              </p>
            </div>

            {/* Certificate Body */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Dataset Name:</span>
                <span className="font-bold text-white">{activeCertificate.datasetName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Batch Code:</span>
                <span className="font-mono text-slate-200">{activeCertificate.batchCode}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Personal Data Category:</span>
                <span className="text-slate-200">{activeCertificate.dataCategory}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Disposed Record Volume:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {activeCertificate.volumeRecords.toLocaleString()} Records ({activeCertificate.dataSizePurged})
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Target Storage Infrastructure:</span>
                <span className="font-mono text-slate-300">{activeCertificate.storageSystem}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Sanitization Standard:</span>
                <span className="font-mono text-indigo-300 font-bold">
                  {activeCertificate.disposalMethod.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Execution Timestamp:</span>
                <span className="font-mono text-slate-300">{activeCertificate.executionTimestamp}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Statutory Clause Satisfied:</span>
                <span className="text-amber-300 font-medium">{activeCertificate.statutoryClauseSatisfied}</span>
              </div>
              <div className="space-y-1 pt-1">
                <span className="text-slate-400 block font-medium">Non-Repudiation Audit Seal (SHA-256):</span>
                <span className="font-mono text-[10px] text-slate-300 bg-slate-900 p-2 rounded-lg block break-all border border-slate-800">
                  {activeCertificate.verificationProofHash}
                </span>
              </div>
            </div>

            {/* Officer Attestation */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-800/60 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Authorizing Officer:</span>
                <span className="font-bold text-white">{activeCertificate.authorizedByOfficer}</span>
                <span className="text-[10px] text-slate-400 block">{activeCertificate.officerRole}</span>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Legally Certified</span>
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveCertificate(null)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: APPLY STATUTORY LEGAL HOLD */}
      {legalHoldModalBatch && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-800/80 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3 text-purple-400 border-b border-slate-800 pb-3">
              <div className="p-2 rounded-2xl bg-purple-500/20 border border-purple-500/30">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Apply Statutory Legal Hold</h3>
                <p className="text-xs text-slate-400">Suspend automated purge for pending judicial or regulatory inquiries.</p>
              </div>
            </div>

            <form onSubmit={handleApplyLegalHold} className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold mb-1">Target Batch:</span>
                <span className="text-white font-mono font-bold bg-slate-950 p-2 rounded-lg block border border-slate-800">
                  {legalHoldModalBatch.batchCode} - {legalHoldModalBatch.datasetName}
                </span>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Legal Justification / Statutory Notice Ref:
                </label>
                <textarea
                  rows={3}
                  required
                  value={legalHoldInputReason}
                  onChange={e => setLegalHoldInputReason(e.target.value)}
                  placeholder="e.g. Formal Section 12 PMLA inquiry received from Enforcement Directorate or ongoing judicial proceeding..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setLegalHoldModalBatch(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center space-x-1"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Enforce Legal Hold</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DEFINE NEW RETENTION POLICY */}
      {isNewPolicyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Define Statutory Retention Schedule</h3>
                  <p className="text-xs text-slate-400">Configure data category retention limits and trigger conditions.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewPolicyModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePolicy} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Data Category Name:</label>
                  <input
                    type="text"
                    required
                    value={newPolicyCategory}
                    onChange={e => setNewPolicyCategory(e.target.value)}
                    placeholder="e.g. Employee Health & Wellness Check Records"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Sensitivity Tier:</label>
                  <select
                    value={newPolicyClassification}
                    onChange={e => setNewPolicyClassification(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white"
                  >
                    <option value="CRITICAL_SENSITIVE">🚨 Critical Sensitive</option>
                    <option value="HIGH">⚠️ High Sensitivity</option>
                    <option value="MEDIUM">📊 Medium</option>
                    <option value="STANDARD">📄 Standard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Department Responsible:</label>
                  <input
                    type="text"
                    value={newPolicyDept}
                    onChange={e => setNewPolicyDept(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Retention Duration:</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      min={1}
                      value={newPolicyDurationValue}
                      onChange={e => {
                        const val = parseInt(e.target.value) || 0;
                        setNewPolicyDurationValue(val);
                        setNewPolicyDurationDisplay(`${val} Days`);
                      }}
                      className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white font-mono"
                    />
                    <input
                      type="text"
                      value={newPolicyDurationDisplay}
                      onChange={e => setNewPolicyDurationDisplay(e.target.value)}
                      placeholder="e.g. 180 Days"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Countdown Trigger Event:</label>
                  <select
                    value={newPolicyTrigger}
                    onChange={e => setNewPolicyTrigger(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white"
                  >
                    <option value="PURPOSE_ACCOMPLISHED">Purpose Accomplished (Sec 8(7))</option>
                    <option value="CONSENT_REVOCATION">Consent Revocation (Sec 6(4))</option>
                    <option value="ACCOUNT_CLOSURE">Account Closure / Termination</option>
                    <option value="LAST_TRANSACTION">Last Transaction Date</option>
                    <option value="ACADEMIC_YEAR_END">Academic Year End</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Disposal & Sanitization Standard:</label>
                  <select
                    value={newPolicyDisposalMethod}
                    onChange={e => setNewPolicyDisposalMethod(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white"
                  >
                    <option value="NIST_800_88_CRYPTOGRAPHIC_SHRED">NIST SP 800-88 Cryptographic Shred</option>
                    <option value="KMS_KEY_DESTRUCTION">KMS Customer-Managed Key Destruction</option>
                    <option value="NIST_800_88_PURGE_OVERWRITE">NIST SP 800-88 Multi-Pass Overwrite</option>
                    <option value="VECTOR_DB_TOMBSTONE_COMPACT">Vector DB Tombstone & Physical Compaction</option>
                    <option value="IRREVERSIBLE_K_ANONYMIZATION">Irreversible K-Anonymization</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Statutory Legal Basis & Mandatory Acts:</label>
                <input
                  type="text"
                  value={newPolicyStatutoryBasis}
                  onChange={e => setNewPolicyStatutoryBasis(e.target.value)}
                  placeholder="e.g. Section 8(7) DPDP Act + Section 12 PMLA 2002"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Storage Infrastructure Target:</label>
                <input
                  type="text"
                  value={newPolicyStorage}
                  onChange={e => setNewPolicyStorage(e.target.value)}
                  placeholder="e.g. AWS S3 Glacier Vault (ap-south-1)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewPolicyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Enact Retention Schedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
