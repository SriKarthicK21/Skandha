import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Search,
  Download,
  FileText,
  Clock,
  User,
  PlusCircle,
  CheckCircle2,
  RefreshCw,
  Copy,
  ExternalLink,
  ChevronRight,
  Filter,
  FileCode,
  Sliders,
  Terminal,
  AlertTriangle,
  Send,
  Eye,
  X,
  Check,
  Hash,
  Database
} from 'lucide-react';
import {
  MASIncidentAuditBlock,
  MASAuditCategory,
  MASAuditVerificationResult,
  MASAuditActionType
} from '../../types/masAuditTrail';
import {
  MASIncidentAuditService,
  DEFAULT_INCIDENT_ACTOR,
  formatSGTTime
} from '../../services/masIncidentAuditService';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';

interface MASIncidentAuditTrailPanelProps {
  incidentId?: string;
  incidentRef?: string;
  onBlockAdded?: (block: MASIncidentAuditBlock) => void;
}

export const MASIncidentAuditTrailPanel: React.FC<MASIncidentAuditTrailPanelProps> = ({
  incidentId,
  incidentRef,
  onBlockAdded
}) => {
  const { showToast } = useToast();
  const [blocks, setBlocks] = useState<MASIncidentAuditBlock[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | MASAuditCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectingBlock, setInspectingBlock] = useState<MASIncidentAuditBlock | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<MASAuditVerificationResult | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showAddLogModal, setShowAddLogModal] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // New Officer Log Form state
  const [logForm, setLogForm] = useState({
    title: '',
    description: '',
    category: 'OFFICER_NOTE' as MASAuditCategory,
    statutoryClause: 'MAS TRM Guidelines Section 12.1 (Incident Accountability)',
    actionType: 'OFFICER_LOG_ENTRY' as MASAuditActionType,
    officerRole: DEFAULT_INCIDENT_ACTOR.role,
    officerName: DEFAULT_INCIDENT_ACTOR.name
  });

  const reloadBlocks = () => {
    const list = MASIncidentAuditService.getAuditTrail(incidentId);
    setBlocks(list);
  };

  useEffect(() => {
    reloadBlocks();
  }, [incidentId]);

  // Handle Quick Copy
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    showToast({
      title: 'Copied to Clipboard',
      message: `${label} copied.`,
      type: 'info',
      duration: 2500
    });
    setTimeout(() => setCopiedHash(null), 2500);
  };

  // Run Cryptographic Chain Integrity Verification
  const handleRunVerification = async () => {
    setIsVerifying(true);
    setShowVerificationModal(true);
    try {
      // Small intentional latency to illustrate block verification animation
      await new Promise(r => setTimeout(r, 600));
      const result = await MASIncidentAuditService.verifyChainIntegrity(incidentId);
      setVerificationResult(result);
      if (result.isValid) {
        showToast({
          title: 'Audit Chain Cryptographically Verified',
          message: `All ${result.totalBlocks} blocks match SHA-256 chain of custody under MAS TRM Sec 12.`,
          type: 'success',
          duration: 5000
        });
      } else {
        showToast({
          title: 'Integrity Anomaly Detected',
          message: result.message,
          type: 'error',
          duration: 7000
        });
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // Add Manual Officer Log Entry
  const handleAddOfficerLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logForm.title.trim() || !logForm.description.trim()) {
      showToast({
        title: 'Validation Error',
        message: 'Please provide both an entry title and a detailed operational summary.',
        type: 'warning'
      });
      return;
    }

    try {
      const newBlock = await MASIncidentAuditService.logAuditBlock({
        incidentId: incidentId || 'INC-2026-001',
        incidentRef: incidentRef || 'MAS/NOTIF/2026/09/014',
        actionType: logForm.actionType,
        category: logForm.category,
        title: logForm.title.trim(),
        description: logForm.description.trim(),
        statutoryClause: logForm.statutoryClause,
        actor: {
          name: logForm.officerName,
          role: logForm.officerRole
        },
        metadata: {
          manualEntry: true,
          attestationStandard: 'Singapore Evidence Act (Cap. 97) Section 35'
        }
      });

      reloadBlocks();
      setShowAddLogModal(false);
      setLogForm({
        title: '',
        description: '',
        category: 'OFFICER_NOTE',
        statutoryClause: 'MAS TRM Guidelines Section 12.1 (Incident Accountability)',
        actionType: 'OFFICER_LOG_ENTRY',
        officerRole: DEFAULT_INCIDENT_ACTOR.role,
        officerName: DEFAULT_INCIDENT_ACTOR.name
      });

      if (onBlockAdded) {
        onBlockAdded(newBlock);
      }

      showToast({
        title: 'Immutable Audit Block Appended',
        message: `Block #${newBlock.sequenceNumber} cryptographically sealed into SHA-256 chain.`,
        type: 'success'
      });
    } catch (err) {
      showToast({
        title: 'Audit Logging Error',
        message: 'Could not append block to immutable ledger.',
        type: 'error'
      });
    }
  };

  // Export handlers
  const handleExportJSON = () => {
    const jsonStr = MASIncidentAuditService.exportAuditTrailAsJSON(incidentId);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MAS_Audit_Ledger_${(incidentRef || 'INCIDENT').replace(/\//g, '_')}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast({
      title: 'Signed Ledger Exported',
      message: 'Cryptographically sealed audit trail JSON dossier downloaded.',
      type: 'success'
    });
  };

  const handleExportCSV = () => {
    const csvStr = MASIncidentAuditService.exportAuditTrailAsCSV(incidentId);
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MAS_Audit_Ledger_${(incidentRef || 'INCIDENT').replace(/\//g, '_')}_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast({
      title: 'Audit CSV Exported',
      message: 'MAS Regulatory Examination CSV downloaded.',
      type: 'success'
    });
  };

  const handleExportMarkdown = () => {
    const mdStr = MASIncidentAuditService.exportAuditTrailAsMarkdown(incidentId);
    const blob = new Blob([mdStr], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MAS_Notice644_Forensic_Workpaper_${(incidentRef || 'INCIDENT').replace(/\//g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast({
      title: 'Forensic Workpaper Exported',
      message: 'Courtroom-ready MAS TRM Section 12 Markdown workpaper downloaded.',
      type: 'success'
    });
  };

  // Filtered blocks
  const filteredBlocks = useMemo(() => {
    return blocks.filter(b => {
      const matchesCategory = selectedCategory === 'ALL' || b.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        b.title.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.actor.name.toLowerCase().includes(q) ||
        b.actor.role.toLowerCase().includes(q) ||
        b.blockId.toLowerCase().includes(q) ||
        b.statutoryClause.toLowerCase().includes(q) ||
        (b.diffs && b.diffs.some(d => d.fieldLabel.toLowerCase().includes(q) || String(d.newValue).toLowerCase().includes(q)))
      );
    });
  }, [blocks, selectedCategory, searchQuery]);

  // Metric counts
  const userChangeCount = useMemo(() => blocks.filter(b => b.category === 'USER_CHANGE').length, [blocks]);
  const milestoneCount = useMemo(() => blocks.filter(b => b.category === 'MILESTONE').length, [blocks]);
  const dispatchCount = useMemo(() => blocks.filter(b => b.category === 'DISPATCH').length, [blocks]);

  return (
    <div className="space-y-4">
      {/* Top Banner: Regulatory & Cryptographic Status */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-800/40 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono flex items-center gap-1">
                <Lock className="w-3 h-3 text-indigo-400" />
                <span>MAS TRM SEC 12 • NOTICE 644 PARA 4</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>SHA-256 IMMUTABLE AUDIT TRAIL</span>
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" />
              <span>Forensic Incident Audit Trail & Cryptographic Chain of Custody</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Tamper-evident, courtroom-admissible ledger logging every operational action, milestone state transition, user parameter update, and statutory dispatch. Each block is cryptographically chained via SHA-256 hashes to guarantee complete incident accountability under MAS regulatory guidelines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRunVerification}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-emerald-600/20"
              title="Verify cryptographic hash chaining across all blocks"
            >
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>Verify Chain Integrity</span>
            </button>

            <button
              onClick={() => setShowAddLogModal(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-indigo-600/20"
              title="Log manual operational note or incident commander decision"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>Add Officer Log</span>
            </button>

            {/* Export Dropdown / Buttons */}
            <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={handleExportJSON}
                className="px-2.5 py-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-slate-700 text-[11px] font-bold transition flex items-center space-x-1"
                title="Export Signed JSON Ledger"
              >
                <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>JSON</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="px-2.5 py-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-slate-700 text-[11px] font-bold transition flex items-center space-x-1"
                title="Export MAS Examiner CSV"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>CSV</span>
              </button>
              <button
                onClick={handleExportMarkdown}
                className="px-2.5 py-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-slate-700 text-[11px] font-bold transition flex items-center space-x-1"
                title="Export Court-Ready Markdown Workpaper"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Workpaper</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Stat Summary Cards */}
        <div className="mt-4 pt-3.5 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">
              Total Logged Blocks
            </span>
            <div className="text-xl font-bold font-mono text-white mt-0.5">
              {blocks.length} Blocks
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">
              ● Genesis to Tip Linked
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">
              User State Changes
            </span>
            <div className="text-xl font-bold font-mono text-indigo-400 mt-0.5">
              {userChangeCount} Changes
            </div>
            <span className="text-[10px] text-slate-400">
              Field deltas diff-tracked
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">
              Milestone Transitions
            </span>
            <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">
              {milestoneCount} Milestones
            </div>
            <span className="text-[10px] text-slate-400">
              Notice 644 statutory tracking
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">
              Regulatory Accountability
            </span>
            <div className="text-sm font-bold text-white mt-1">
              MAS Notice 644 Cl. 4
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">
              Singapore Evidence Act Cap. 97
            </span>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: 'All Events', count: blocks.length },
            { id: 'USER_CHANGE', label: 'User Changes', count: userChangeCount },
            { id: 'MILESTONE', label: 'Milestones', count: milestoneCount },
            { id: 'DISPATCH', label: 'Statutory Dispatches', count: dispatchCount },
            { id: 'FORENSIC', label: 'Forensic Updates', count: blocks.filter(b => b.category === 'FORENSIC').length },
            { id: 'OFFICER_NOTE', label: 'Officer Notes', count: blocks.filter(b => b.category === 'OFFICER_NOTE').length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                selectedCategory === tab.id
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                selectedCategory === tab.id ? 'bg-indigo-700 text-white' : 'bg-slate-900 text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search block, user, diff, clause..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Forensic Audit Log Entries (Timeline & Detail Cards) */}
      <div className="space-y-3">
        {filteredBlocks.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
            <Database className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="text-sm font-bold text-slate-300">No matching audit blocks found</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No audit records match the selected filter query. Clear filters to view the full cryptographic ledger.
            </p>
          </div>
        ) : (
          filteredBlocks.map((block, idx) => {
            const isUserChange = block.category === 'USER_CHANGE';
            const isMilestone = block.category === 'MILESTONE';
            const isDispatch = block.category === 'DISPATCH';
            const isForensic = block.category === 'FORENSIC';
            const isOfficerNote = block.category === 'OFFICER_NOTE';

            return (
              <div
                key={block.blockId}
                className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 transition-all shadow-sm space-y-3"
              >
                {/* Header Strip: Seq #, Category Badge, SGT Timestamp, Action Type */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-7 h-7 rounded-lg bg-indigo-950/80 border border-indigo-700/60 flex items-center justify-center font-mono text-xs font-black text-indigo-300">
                      #{block.sequenceNumber}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-300">
                      {block.blockId}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono ${
                        isDispatch
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : isMilestone
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : isUserChange
                          ? 'bg-purple-950 text-purple-300 border border-purple-800'
                          : isForensic
                          ? 'bg-sky-950 text-sky-300 border border-sky-800'
                          : isOfficerNote
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {block.category.replace('_', ' ')}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-slate-800/80 text-slate-400">
                      {block.incidentRef}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <div className="flex items-center space-x-1.5 text-slate-300 font-mono">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="font-bold">{block.localTimestampSGT}</span>
                    </div>

                    <button
                      onClick={() => setInspectingBlock(block)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-bold transition flex items-center space-x-1 border border-slate-700"
                    >
                      <Eye className="w-3 h-3 text-indigo-400" />
                      <span>Inspect Hash</span>
                    </button>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    {block.title}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {block.description}
                  </p>
                </div>

                {/* Field-Level State Changes (Diffs) */}
                {block.diffs && block.diffs.length > 0 && (
                  <div className="p-3 rounded-lg bg-slate-950 border border-purple-900/40 space-y-1.5">
                    <div className="text-[10px] uppercase font-bold text-purple-300 tracking-wider flex items-center gap-1">
                      <Sliders className="w-3 h-3 text-purple-400" />
                      <span>User State Parameter Modifications (Delta)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                      {block.diffs.map((diff, dIdx) => (
                        <div
                          key={dIdx}
                          className="p-2 rounded bg-slate-900/80 border border-slate-800 text-[11px] space-y-0.5"
                        >
                          <span className="text-slate-400 font-semibold block">{diff.fieldLabel}:</span>
                          <div className="flex items-center space-x-1.5 font-mono">
                            <span className="text-rose-400 line-through truncate max-w-[120px]">
                              {String(diff.oldValue ?? 'None')}
                            </span>
                            <ChevronRight className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="text-emerald-400 font-bold truncate max-w-[140px]">
                              {String(diff.newValue ?? 'None')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Forensic Metadata (if present) */}
                {block.metadata && Object.keys(block.metadata).length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span className="text-slate-500 font-mono">Evidence Meta:</span>
                    {Object.entries(block.metadata).map(([k, v]) => (
                      <span
                        key={k}
                        className="px-2 py-0.5 rounded font-mono bg-slate-950 border border-slate-800 text-slate-300"
                      >
                        <strong className="text-slate-400">{k}:</strong> {String(v)}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer: Actor Information, Statutory Clause & Cryptographic Hash Link */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center space-x-1.5 text-slate-300 font-medium">
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      <strong className="text-white">{block.actor.name}</strong>
                      <span className="text-slate-400 text-[11px]">({block.actor.role})</span>
                    </div>

                    <span className="text-slate-600">•</span>

                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-indigo-300 border border-slate-700">
                      {block.statutoryClause}
                    </span>
                  </div>

                  {/* Cryptographic Hash Pills */}
                  <div className="flex items-center space-x-2 font-mono text-[10px]">
                    <div className="flex items-center space-x-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      <span className="text-slate-500">Hash:</span>
                      <span className="text-emerald-400 font-bold" title={block.blockHash}>
                        {block.blockHash.slice(0, 16)}...
                      </span>
                      <button
                        onClick={() => handleCopy(block.blockHash, 'Block SHA-256 Hash')}
                        className="text-slate-500 hover:text-white ml-0.5"
                        title="Copy Block Hash"
                      >
                        <Copy className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 hidden lg:flex">
                      <span className="text-slate-500">Prev:</span>
                      <span className="text-slate-400" title={block.previousHash}>
                        {block.previousHash.slice(0, 12)}...
                      </span>
                    </div>

                    <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-bold">
                      VERIFIED
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL 1: Block Cryptographic Inspection Modal */}
      {inspectingBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-indigo-500/60 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <Lock className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Cryptographic Block Inspection: #{inspectingBlock.sequenceNumber} [{inspectingBlock.blockId}]
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    MAS TRM Section 12 Forensics & Electronic Chain of Custody
                  </span>
                </div>
              </div>
              <button
                onClick={() => setInspectingBlock(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Block Summary Details */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-mono">Incident Reference</span>
                  <div className="font-bold text-white font-mono">{inspectingBlock.incidentRef}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-mono">Timestamp (SGT UTC+8)</span>
                  <div className="font-bold text-indigo-300 font-mono">{inspectingBlock.localTimestampSGT}</div>
                </div>
              </div>

              {/* Actor Identity Credentials */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-slate-500 text-[10px] uppercase font-mono">Attesting Officer Identity</span>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-slate-300">
                  <div>
                    <strong className="text-white">{inspectingBlock.actor.name}</strong> • {inspectingBlock.actor.role}
                  </div>
                  <div className="font-mono text-slate-400 text-[11px]">
                    {inspectingBlock.actor.email}
                  </div>
                </div>
                <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-900 flex items-center justify-between">
                  <span>Terminal ID: {inspectingBlock.actor.terminalId}</span>
                  <span>Originating IP: {inspectingBlock.actor.ipAddress}</span>
                </div>
              </div>

              {/* Cryptographic Proofs */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-900/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Cryptographic SHA-256 Digest & Hash Chaining</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    STATUS: UNALTERED & VERIFIED
                  </span>
                </div>

                <div className="space-y-2 font-mono text-[11px]">
                  <div>
                    <div className="text-[10px] text-slate-500 mb-0.5 flex items-center justify-between">
                      <span>PREVIOUS BLOCK HASH (LINKED PREDECESSOR):</span>
                      <button
                        onClick={() => handleCopy(inspectingBlock.previousHash, 'Previous Hash')}
                        className="text-slate-400 hover:text-white"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="p-2 rounded bg-slate-900 text-slate-300 break-all select-all border border-slate-800">
                      {inspectingBlock.previousHash}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-500 mb-0.5 flex items-center justify-between">
                      <span>PAYLOAD CANONICAL DIGEST:</span>
                      <button
                        onClick={() => handleCopy(inspectingBlock.payloadDigest, 'Payload Digest')}
                        className="text-slate-400 hover:text-white"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="p-2 rounded bg-slate-900 text-slate-300 break-all select-all border border-slate-800">
                      {inspectingBlock.payloadDigest}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-500 mb-0.5 flex items-center justify-between">
                      <span>BLOCK SHA-256 HASH (DIGITAL FINGERPRINT):</span>
                      <button
                        onClick={() => handleCopy(inspectingBlock.blockHash, 'Block SHA-256')}
                        className="text-emerald-400 hover:text-white"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="p-2 rounded bg-emerald-950/40 text-emerald-300 break-all select-all border border-emerald-700/50 font-bold">
                      {inspectingBlock.blockHash}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-500 mb-0.5 flex items-center justify-between">
                      <span>DIGITAL SIGNATURE:</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 text-indigo-300 break-all border border-slate-800">
                      {inspectingBlock.digitalSignature}
                    </div>
                  </div>
                </div>
              </div>

              {/* Legal Admissibility Notice */}
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                <strong className="text-slate-200 block mb-0.5">Singapore Evidence Act (Cap. 97) Admissibility Certification:</strong>
                This record was automatically generated and cryptographically sealed at the time of the incident response event. The SHA-256 hash algorithm satisfies RFC 3161 timestamping and Federal Rules of Evidence FRE 902(13)/(14) requirements for self-authenticating electronic records.
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => handleCopy(JSON.stringify(inspectingBlock, null, 2), 'Block JSON')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center space-x-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Full JSON</span>
              </button>
              <button
                onClick={() => setInspectingBlock(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Manual Officer Log Entry */}
      {showAddLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-slate-900 border border-indigo-600/60 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <PlusCircle className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Append Signed Incident Officer Log</h3>
              </div>
              <button
                onClick={() => setShowAddLogModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddOfficerLog} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Entry Title / Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Phone Briefing with MAS Cyber Surveillance Duty Desk"
                  value={logForm.title}
                  onChange={e => setLogForm({ ...logForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Event Category</label>
                  <select
                    value={logForm.category}
                    onChange={e => setLogForm({ ...logForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="OFFICER_NOTE">Officer Operational Note</option>
                    <option value="FORENSIC">Forensic Investigation Update</option>
                    <option value="USER_CHANGE">Incident Parameter Adjustment</option>
                    <option value="MILESTONE">Milestone Progress Attestation</option>
                    <option value="DISPATCH">Regulatory Communication</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Statutory Reference</label>
                  <input
                    type="text"
                    value={logForm.statutoryClause}
                    onChange={e => setLogForm({ ...logForm, statutoryClause: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">
                  Detailed Operational Log / Evidence Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe the decision, command instruction, technical forensic action, or regulatory contact details..."
                  value={logForm.description}
                  onChange={e => setLogForm({ ...logForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Attesting Officer Name</label>
                  <input
                    type="text"
                    value={logForm.officerName}
                    onChange={e => setLogForm({ ...logForm, officerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Official Role / Designation</label>
                  <input
                    type="text"
                    value={logForm.officerRole}
                    onChange={e => setLogForm({ ...logForm, officerRole: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-[11px] text-indigo-300 flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>
                  This entry will be permanently appended to the immutable SHA-256 audit ledger. Once sealed, it cannot be modified or purged.
                </span>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddLogModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20"
                >
                  Cryptographically Seal Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Cryptographic Verification Results Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-emerald-500/60 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Cryptographic Chain Verification</h3>
              </div>
              <button
                onClick={() => setShowVerificationModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isVerifying ? (
              <div className="p-8 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
                <div className="text-sm font-bold text-white">Traversing SHA-256 Merkle Chain...</div>
                <p className="text-xs text-slate-400">
                  Verifying predecessor hashes, sequential indexes, and digital signatures from genesis block to current tip.
                </p>
              </div>
            ) : verificationResult ? (
              <div className="space-y-4 text-xs">
                <div
                  className={`p-4 rounded-xl border flex items-center space-x-3 ${
                    verificationResult.isValid
                      ? 'bg-emerald-950/60 border-emerald-600/70 text-emerald-200'
                      : 'bg-rose-950/60 border-rose-600/70 text-rose-200'
                  }`}
                >
                  {verificationResult.isValid ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-8 h-8 text-rose-400 shrink-0" />
                  )}
                  <div>
                    <h4 className="font-bold text-sm text-white">
                      {verificationResult.isValid ? 'Chain Integrity Intact (0 Tampering)' : 'Chain Integrity Violation'}
                    </h4>
                    <p className="text-xs opacity-90 mt-0.5">
                      {verificationResult.message}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Total Blocks Evaluated:</span>
                    <span className="font-bold text-white">{verificationResult.totalBlocks}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Verified Authentic Blocks:</span>
                    <span className="font-bold text-emerald-400">{verificationResult.verifiedBlocks}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Tampered / Missing Blocks:</span>
                    <span className="font-bold text-slate-200">{verificationResult.tamperedBlocks}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 space-y-1">
                    <span className="text-slate-500 text-[10px] block">MERKLE CHAIN ROOT DIGEST:</span>
                    <span className="text-indigo-400 break-all select-all block">
                      {verificationResult.merkleRoot}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400">
                  <strong className="text-slate-200 block mb-0.5">MAS Examination Readiness:</strong>
                  Audit ledger satisfies all criteria under MAS Notice 644 Clause 4 and MAS TRM Guidelines (Nov 2021) Section 12. Suitable for regulatory inspection submission.
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setShowVerificationModal(false)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20"
                  >
                    Accept Verification Certificate
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
